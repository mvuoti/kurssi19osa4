module.exports = {
  usersInDbPriorTests: [
    { username: 'usera', name: 'User A', passwordHash: '-some hash-' },
    { username: 'userb', name: 'User B', passwordHash: '-some hash-' }
  ],
  userToCreate: {
    username: 'userc', name: 'User C', password: 'longEnoughPassword'
  },
  userToCreateShortPassword: {
    username: 'userd', name: 'User D', password: 'ab'
  },
  userToCreateShortUsername: {
    username: 'xy', name: 'User D', password: 'longEnoughPassword'
  },
  userToCreateDuplicateUsername: {
    username: 'usera', name: 'User E', password: 'longEnoughPassword'
  }
}
