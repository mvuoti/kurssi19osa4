const Blog = require('../models/blog')
const User = require('../models/user')

const blogEntriesForTesting = require('./blog_entries_for_testing')


const initializeBlogCollection = async (loggedInSession) => {
  await Blog.deleteMany({})
  const userDoc = await User.findById(loggedInSession.id)
  const insertResult = await Blog.insertMany(
    blogEntriesForTesting.map(
      o => new Blog({ ...o, user: userDoc.id })
  ))
  const blogIds = insertResult.map(b => b.id)
  userDoc.blogs = blogIds
  await userDoc.save()
}

module.exports = {
  initializeBlogCollection,
  blogEntriesForTesting
}
