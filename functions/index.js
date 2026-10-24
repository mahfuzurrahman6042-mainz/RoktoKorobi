const functions = require('firebase-functions');
const admin = require('firebase-admin');
const { belongsToCountry, countUsers, countRequests, countPartners } = require('./public-stats');
const { notificationPayload, canSendCountryAlert, becamePublishableCountryRequest } = require('./notification-payload');

admin.initializeApp();

// Recount instead of incrementing, so retries cannot inflate public totals.
async function refreshAllPublicStats() {
  const db = admin.database();
  const [users, partners, bdRequests, inRequests, pkRequests] = await Promise.all([
    db.ref('users').once('value'),
    db.ref('partnerInstitutes').once('value'),
    db.ref('bloodRequests').once('value'),
    db.ref('countryData/IN/bloodRequests').once('value'),
    db.ref('countryData/PK/bloodRequests').once('value'),
  ]);
  const requests = { BD: bdRequests.val(), IN: inRequests.val(), PK: pkRequests.val() };
  const updates = {};
  for (const country of ['BD', 'IN', 'PK']) {
    const path = country === 'BD' ? 'publicStats' : `countryData/${country}/publicStats`;
    updates[path] = {
      ...countUsers(users.val(), country),
      requestsFulfilled: countRequests(requests[country], country),
      partners: countPartners(partners.val(), country),
      updatedAt: Date.now(),
    };
  }
  await db.ref().update(updates);
}

exports.refreshPublicUserStats = functions.database.ref('/users/{uid}').onWrite(refreshAllPublicStats);
exports.refreshPublicRequestStats = functions.database.ref('/bloodRequests/{requestId}').onWrite(refreshAllPublicStats);
exports.refreshCountryPublicRequestStats = functions.database.ref('/countryData/{country}/bloodRequests/{requestId}').onWrite(async (_change, context) => {
  if (context.params.country !== 'IN' && context.params.country !== 'PK') return null;
  return refreshAllPublicStats();
});
exports.refreshPublicPartnerStats = functions.database.ref('/partnerInstitutes/{instituteId}').onWrite(refreshAllPublicStats);

// Only notify donors in the same country as a newly created request.
async function notifyDonorsForRequest(snapshot, context, country) {
    const bloodRequest = snapshot.val();
    const requestId = context.params.requestId;
    if (!belongsToCountry(bloodRequest, country)) return null;
    if (country !== 'BD') {
      const [launch, alerts] = await Promise.all([
        admin.database().ref(`settings/countryLaunch/${country}`).once('value'),
        admin.database().ref(`settings/countryNotifications/${country}`).once('value'),
      ]);
      if (!canSendCountryAlert(country, bloodRequest, launch.val(), alerts.val())) return null;
    }

    // Claim once before calling FCM. A retry or a later request edit must not
    // broadcast the same alert again. Failed/partial attempts need manual review.
    const dispatchRef = country === 'BD' ? null : admin.database().ref(`countryData/${country}/alertDispatches/${requestId}`);
    if (dispatchRef) {
      const claim = await dispatchRef.transaction(current => current == null
        ? { status: 'attempted', attemptedAt: Date.now() }
        : undefined);
      if (!claim.committed) return null;
    }

    console.log('Publishable blood request:', requestId, country);

    try {
      // Get all users
      const usersSnapshot = await admin.database().ref('users').once('value');
      const users = usersSnapshot.val();

      if (!users) {
        console.log('No users found');
        if (dispatchRef) await dispatchRef.update({ status: 'completed', recipientCount: 0, successCount: 0, failureCount: 0, finishedAt: Date.now() });
        return null;
      }

      const notifications = [];
      const threeMonthsAgo = new Date();
      threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

      // Find eligible donors with matching blood group
      for (const userId of Object.keys(users)) {
        const user = users[userId];

        // Check if user is a donor with matching blood group
        if (belongsToCountry(user, country) && user.isDonor === true && user.bloodGroup === bloodRequest.bloodType) {
          // Check if user has notification preferences enabled
          if (user.notificationPreferences?.enabled === false) {
            console.log(`User ${userId} has notifications disabled`);
            continue;
          }

          // Check 3-month cooldown
          if (user.lastDonationDate) {
            const lastDonation = new Date(user.lastDonationDate);
            if (lastDonation > threeMonthsAgo) {
              console.log(`User ${userId} donated within last 3 months`);
              continue;
            }
          }

          // Check if user has FCM token
          if (user.fcmToken) {
            const notification = { ...notificationPayload(requestId, country, bloodRequest.bloodType), token: user.fcmToken };

            notifications.push(notification);
            console.log(`Adding notification for user ${userId}`);
          } else {
            console.log(`User ${userId} has no FCM token`);
          }
        }
      }

      // Send notifications in batches (max 500 per batch)
      const batchSize = 500;
      let successCount = 0;
      let failureCount = 0;
      for (let i = 0; i < notifications.length; i += batchSize) {
        const batch = notifications.slice(i, i + batchSize);
        try {
          const response = await admin.messaging().sendAll(batch);
          successCount += response.successCount;
          failureCount += response.failureCount;
          console.log(`Batch ${i / batchSize + 1}: ${response.successCount} successful, ${response.failureCount} failed`);
          
          // Log any failures
          if (response.failureCount > 0) {
            response.responses.forEach((resp, idx) => {
              if (!resp.success) {
                console.error(`Failed to send notification:`, resp.error);
              }
            });
          }
        } catch (error) {
          console.error('Error sending notification batch:', error);
          failureCount += batch.length;
        }
      }

      if (dispatchRef) await dispatchRef.update({
        status: failureCount > 0 ? 'partial-or-failed' : 'completed',
        recipientCount: notifications.length, successCount, failureCount, finishedAt: Date.now(),
      });
      console.log(`Notification attempt for ${requestId}: ${successCount} sent, ${failureCount} failed`);
      return null;

    } catch (error) {
      console.error('Error processing blood request notification:', error);
      if (dispatchRef) await dispatchRef.update({ status: 'failed', finishedAt: Date.now() });
      return null;
    }
}

exports.sendBloodRequestNotification = functions.database.ref('/bloodRequests/{requestId}')
  .onCreate((snapshot, context) => notifyDonorsForRequest(snapshot, context, 'BD'));

exports.sendCountryBloodRequestNotification = functions.database.ref('/countryData/{country}/bloodRequests/{requestId}')
  .onWrite((change, context) => {
    const country = context.params.country;
    const before = change.before.exists() ? change.before.val() : null;
    const after = change.after.exists() ? change.after.val() : null;
    if (!becamePublishableCountryRequest(country, before, after)) return null;
    return notifyDonorsForRequest(change.after, context, country);
  });

// Clean up old notifications (older than 30 days)
exports.cleanupOldNotifications = functions.pubsub.schedule('0 0 * * *')
  .timeZone('Asia/Dhaka')
  .onRun(async (context) => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    try {
      // Get all users
      const usersSnapshot = await admin.database().ref('users').once('value');
      const users = usersSnapshot.val();

      if (!users) {
        console.log('No users found');
        return null;
      }

      let totalDeleted = 0;

      // Clean up notifications for each user
      for (const userId of Object.keys(users)) {
        const notificationsSnapshot = await admin.database().ref(`notifications/${userId}`).once('value');
        const notifications = notificationsSnapshot.val();

        if (notifications) {
          const updates = {};
          for (const notificationId of Object.keys(notifications)) {
            const notification = notifications[notificationId];
            const notificationDate = new Date(notification.createdAt);
            
            if (notificationDate < thirtyDaysAgo) {
              updates[notificationId] = null;
              totalDeleted++;
            }
          }

          if (Object.keys(updates).length > 0) {
            await admin.database().ref(`notifications/${userId}`).update(updates);
          }
        }
      }

      console.log(`Cleaned up ${totalDeleted} old notifications`);
      return null;

    } catch (error) {
      console.error('Error cleaning up old notifications:', error);
      return null;
    }
  });
