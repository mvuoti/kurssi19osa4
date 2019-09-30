// local modules
const Blog = require('../models/blog')

// set of blog entries used in tests
const blogEntriesForTesting = require('./blog_entries_for_testing')

// utility function to clear up database
const clearDatabase = () => {
  (async () => {
    try {
      await Blog.deleteMany({})
    } catch (error) {
      console.error(error)
      throw error
    }
  })()
}

// utility function to initialize database with
// testing set of blog entries
const populateDatabase = () => {
  (async () => {
    clearDatabase()
    try {
        await Blog.insertMany(blogEntriesForTesting.map((obj) => new Blog(obj)))
    } catch (error) {
        console.error(error)
	throw error
    }
  })()
}

module.exports = {
  clearDatabase,
  populateDatabase,
  blogEntriesForTesting
}
