// local modules
const Blog = require('../models/blog')
const User = require('../models/user')

// set of blog entries used in tests
const blogEntriesForTesting = require('./blog_entries_for_testing')

// a valid user id to use as the creator of blogs
const getAnyUserId = async () => {
  const anyUser = await User.findOne({})
  if (!anyUser) {
    throw new Error('Kannassa pitää olla käyttäjiä ennen testiblogien luontia')
  }
  return anyUser.id
}

// utility function to populate the database with
// pre-defined set of blog entries for testing
const initializeBlogCollection = async () => {
  const user = await getAnyUserId()
  await Blog.deleteMany({})
  await Blog.insertMany(
    blogEntriesForTesting.map(
      o => new Blog({ ...o, user })
    ))
}

module.exports = {
  initializeBlogCollection,
  blogEntriesForTesting
}
