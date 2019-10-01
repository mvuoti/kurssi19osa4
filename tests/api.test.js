// dependencies
const supertest = require('supertest')
const mongoose = require('mongoose')

// local modules
const app = require('../app.js')
const apiTestHelper = require('./api_test_helper')
const Blog = require('../models/blog')

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

test(
  'POST /api/blogs tallennus onnistuu, blogien määrä += 1, lisätty löytyy kannasta',
  async (done) => {
    const blogToPost = {
      author: 'Test Author', title: 'Test Blog Entry', url: 'http://www.yle.fi', likes: 13
    }
    const postResponse = await api.post('/api/blogs')
      .set('Content-type', 'application/json; charset=utf-8')
      .send(blogToPost)
    expect(postResponse.status).toEqual(201)
    const getResponse = await api.get('/api/blogs')
    const blogsAfterPost = getResponse.body
    expect(blogsAfterPost.length).toEqual(apiTestHelper.blogEntriesForTesting.length + 1)
    expect(blogsAfterPost.map(b => b.author)).toContain(blogToPost.author)
    done()
  })

test('new blog entry gets likes set to 0 by default if not given', () => {
  const newBlog = new Blog({ author: 'any', title: 'any', url: 'http://any.any' })
  expect(newBlog.likes).toEqual(0)
})

test('POST /api/blogs missing title or url cause status code 400', async (done) => {
  const urllessBlog = new Blog({ author: 'any', title: 'any', likes: 13 })
  const titlelessBlog = new Blog({ author: 'any', url: 'http://any.any', likes: 13 })

  const urllessResponse = await api.post('/api/blogs')
    .set('Content-type', 'application/json; charset=utf-8')
    .send(urllessBlog)
  expect(urllessResponse.status).toEqual(400)
  
  const titlelessResponse = await api.post('/api/blogs')
    .set('Content-type', 'application/json; charset=utf-8')
    .send(titlelessBlog)
  expect(titlelessResponse.status).toEqual(400)

  done()
})

// end of tests
