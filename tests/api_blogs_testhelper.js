// local modules
const Blog = require('../models/blog')
const User = require('../models/user')

// set of blog entries used in tests
const blogEntriesForTesting = require('./blog_entries_for_testing')

// a valid user id to use as the creator of blogs
const getAnyUser = async () => {
  const anyUser = await User.findOne({})
  if (!anyUser) {
    throw new Error('Kannassa pitää olla käyttäjiä ennen testiblogien luontia')
  }
  return anyUser
}

// utility function to populate the database with
// pre-defined set of blog entries for testing.
// cross-refs between users and blogs need
// to be set up.
const initializeBlogCollection = async () => {
  await Blog.deleteMany({})

  // take any user to be the creator of all blogs
  const userDoc = await getAnyUser()

  // save test blogs setting user field
  const insertResult = await Blog.insertMany(
    blogEntriesForTesting.map(
      o => new Blog({ ...o, user: userDoc.id })
    ))

  // update user's blogs field with ids of
  // blogs created above
  const blogIds = insertResult.map(b => b.id)
  userDoc.blogs = blogIds
  await userDoc.save()
}

module.exports = {
  initializeBlogCollection,
  blogEntriesForTesting
}
