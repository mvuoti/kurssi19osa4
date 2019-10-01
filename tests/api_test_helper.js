// local modules
const Blog = require('../models/blog')

// set of blog entries used in tests
const blogEntriesForTesting = require('./blog_entries_for_testing')

// utility function to populate the database with
// pre-defined set of blog entries for testing
const initializeDatabase = async () => {
  await Blog.deleteMany({})
  const promise = await Blog.insertMany(blogEntriesForTesting.map(o => new Blog(o)))
  return promise
}

module.exports = {
  initializeDatabase,
  blogEntriesForTesting
}
