const User = require('../models/user')

// initial data
const { usersInDbPriorTests } = require('./users_for_testing')

// setting up tests, finalizing test set
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
