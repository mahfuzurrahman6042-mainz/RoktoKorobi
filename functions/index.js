const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();

// Send push notification to eligible donors when a new blood request is created
exports.sendBloodRequestNotification = functions.database.ref('/bloodRequests/{requestId}')
  .onCreate(async (snapshot, context) => {
    const bloodRequest = snapshot.val();
    const requestId = context.params.requestId;

    console.log('New blood request created:', bloodRequest);

    try {
      // Get all users
      const usersSnapshot = await admin.database().ref('users').once('value');
      const users = usersSnapshot.val();

      if (!users) {
        console.log('No users found');
        return null;
      }

      const notifications = [];
      const threeMonthsAgo = new Date();
      threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

      // Find eligible donors with matching blood group
      for (const userId of Object.keys(users)) {
        const user = users[userId];

        // Check if user is a donor with matching blood group
        if (user.isDonor === true && user.bloodGroup === bloodRequest.bloodType) {
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
            const notification = {
              notification: {
                title: '🩸 Blood Request Alert',
                body: `${bloodRequest.patientName} needs ${bloodRequest.bloodType} blood at ${bloodRequest.hospital}`,
                icon: '/icon-192x192.png',
                click_action: `https://roktokorobi.com/request`,
                badge: '/icon-192x192.png'
              },
              data: {
                requestId: requestId,
                bloodType: bloodRequest.bloodType,
                patientName: bloodRequest.patientName,
                hospital: bloodRequest.hospital,
                location: bloodRequest.location,
                urgency: bloodRequest.urgency,
                url: '/request'
              },
              token: user.fcmToken
            };

            notifications.push(notification);
            console.log(`Adding notification for user ${userId}`);
          } else {
            console.log(`User ${userId} has no FCM token`);
          }
        }
      }

      // Send notifications in batches (max 500 per batch)
      const batchSize = 500;
      for (let i = 0; i < notifications.length; i += batchSize) {
        const batch = notifications.slice(i, i + batchSize);
        try {
          const response = await admin.messaging().sendAll(batch);
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
        }
      }

      console.log(`Sent ${notifications.length} notifications for blood request ${requestId}`);
      return null;

    } catch (error) {
      console.error('Error processing blood request notification:', error);
      return null;
    }
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
