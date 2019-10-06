const User = require('../models/user')

const { usersInDbPriorTests } = require('./users_for_testing')

const initializeUserCollection = async () => {
  try {
    await User.deleteMany({})
    await User.insertMany(usersInDbPriorTests)
  } catch (e) {
    console.error(e)
    throw e
  }
}

module.exports = {
  initializeUserCollection
}
