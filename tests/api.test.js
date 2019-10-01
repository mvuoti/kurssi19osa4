// dependencies
const supertest = require('supertest')
const mongoose = require('mongoose')

// local modules
const app = require('../app.js')
const apiTestHelper = require('./api_test_helper')

// wrap application in supertest
const api = supertest(app)

// initialize database to known state
// before each test. operation is asynchronic
beforeEach((done) => {
  return apiTestHelper.initializeDatabase().then(() => done())
})

// database connection must be explicitly closed after tests
afterAll(() => {
  mongoose.connection.close()
})

// tests

test('GET /api/blogs palauttaa kaikki kirjaukset, vastauksen tyyppi JSON', async (done) => {
  const result = await api.get('/api/blogs')
  expect(result.status).toBe(200)
  expect(result.header['content-type']).toMatch(/application\/json/)
  expect(result.body.length).toBe(apiTestHelper.blogEntriesForTesting.length)
  done()
})

test('GET /api/blogs kaikilla blogikirjauksilla kenttä id (ei _id)', async (done) => {
  const result = await api.get('/api/blogs')
  const blogs = result.body
  const firstBlog = blogs[0]
  expect(firstBlog.id).toBeDefined()
  done()
})

// end of tests
