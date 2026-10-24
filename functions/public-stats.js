function belongsToCountry(value, country) {
  if (!value || typeof value !== 'object') return false;
  const recorded = value.country == null || value.country === '' ? 'BD' : value.country;
  return recorded === country;
}

function countUsers(data, country = 'BD') {
  const users = Object.values(data || {}).filter(value => belongsToCountry(value, country));
  return { users: users.length, donors: users.filter(user => user.isDonor === true && user.availability !== false).length };
}

function countRequests(data, country = 'BD') {
  return Object.values(data || {}).filter(value => belongsToCountry(value, country) &&
    (value.fulfilled === true || value.status === 'fulfilled' || value.status === 'completed')).length;
}

function countPartners(data, country = 'BD') {
  return Object.values(data || {}).filter(value => belongsToCountry(value, country) && value.status === 'approved').length;
}

module.exports = { belongsToCountry, countUsers, countRequests, countPartners };
