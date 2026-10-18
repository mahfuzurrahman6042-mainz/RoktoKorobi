function countUsers(data) {
  const users = Object.values(data || {}).filter(value => value && typeof value === 'object');
  return { users: users.length, donors: users.filter(user => user.isDonor === true).length };
}

function countRequests(data) {
  return Object.values(data || {}).filter(value => value && typeof value === 'object' &&
    (value.fulfilled === true || value.status === 'fulfilled' || value.status === 'completed')).length;
}

function countPartners(data) {
  return Object.values(data || {}).filter(value => value && typeof value === 'object' && value.status === 'approved').length;
}

module.exports = { countUsers, countRequests, countPartners };
