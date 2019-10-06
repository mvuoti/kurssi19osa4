const Blog = require('../models/blog')
const User = require('../models/user')

const blogEntriesForTesting = require('./blog_entries_for_testing')

const getAnyUser = async () => {
  const anyUser = await User.findOne({})
  if (!anyUser) {
    throw new Error('Kannassa pitää olla käyttäjiä ennen testiblogien luontia')
  }
  return anyUser
}

const initializeBlogCollection = async () => {
  await Blog.deleteMany({})

  // take any user to be the creator of all blogs
  const userDoc = await getAnyUser()

  // save test blogs setting user field
  const insertResult = await Blog.insertMany(
    blogEntriesForTesting.map(
      o => new Blog({ ...o, user: userDoc.id })
    ))

  // update the reference from user to blogs
  const blogIds = insertResult.map(b => b.id)
  userDoc.blogs = blogIds
  await userDoc.save()
}

module.exports = {
  initializeBlogCollection,
  blogEntriesForTesting
}
