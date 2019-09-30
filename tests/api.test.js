// dependencies
const supertest = require('supertest')
const mongoose = require('mongoose')

// local modules
const app = require('../app.js')
const apiTestHelper = require('./api_test_helper')

// wrap application in supertest
const api = supertest(app)

// initialize database to known state
// before each test
beforeEach(() => {
  apiTestHelper.clearDatabase()
  apiTestHelper.populateDatabase()
})

// database connection must be explicitly closed after tests
afterAll(() => {
  mongoose.connection.close()
})

// tests

test('GET /api/blogs palauttaa kaikki kirjaukset, vastauksen tyyppi JSON', async () => {
  const result = await api.get('/api/blogs')
    .expect(200)
    .expect('Content-type', /application\/json/)
  expect(result.body.length).toBe(apiTestHelper.blogEntriesForTesting.length)
})

// end of tests

