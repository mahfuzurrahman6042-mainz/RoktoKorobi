// Keep patient/request health details out of India and Pakistan push payloads.
// The request ID is only a pointer to a country-protected page.
function notificationPayload(requestId, country, bloodType) {
  const newCountry = country === 'IN' || country === 'PK';
  const countryName = country === 'IN' ? 'India' : 'Pakistan';
  return {
    notification: {
      title: 'Blood Request Alert',
      body: newCountry
        ? `New blood request on RoktoKorobi ${countryName}. Sign in to view.`
        : `A ${bloodType} blood request needs a response. Open the app for details.`,
      icon: '/icon-192x192.png',
      click_action: 'https://www.roktokorobi.org/request',
      badge: '/icon-192x192.png'
    },
    data: {
      requestId: String(requestId),
      ...(newCountry ? {} : { bloodType: String(bloodType || '') }),
      country,
      url: '/request'
    }
  };
}

// Enrollment approval alone must never activate blood-request broadcasts.
// New-country alerts also need their own reviewed switch and a publishable request.
function canSendCountryAlert(country, request, enrollmentEnabled, alertsEnabled) {
  if (country === 'BD') return true;
  return (country === 'IN' || country === 'PK')
    && enrollmentEnabled === true
    && alertsEnabled === true
    && request?.fulfilled !== true
    && (request?.status === 'open' || request?.status === 'approved');
}

// A pending request must be reviewed before its first alert. Later edits and
// retries must not create another send attempt for the same request.
function becamePublishableCountryRequest(country, before, after) {
  return (country === 'IN' || country === 'PK')
    && after != null
    && after.fulfilled !== true
    && (after.status === 'open' || after.status === 'approved')
    && (before == null || (before.status !== 'open' && before.status !== 'approved'));
}

module.exports = { notificationPayload, canSendCountryAlert, becamePublishableCountryRequest };
