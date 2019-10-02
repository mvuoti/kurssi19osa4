// dependencies
const supertest = require('supertest')
const mongoose = require('mongoose')
const _ = require('lodash')

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

describe('Blog (model)', () => {
  test('POST: jos likes puuttuu, asetetaan oletusarvona 0', () => {
    const newBlog = new Blog({ author: 'any', title: 'any', url: 'http://any.any' })
    expect(newBlog.likes).toEqual(0)
  })
})

describe('/api/blogs', () => {
  test('GET: palauttaa kaikki kirjaukset, vastauksen tyyppi JSON', async (done) => {
    const result = await api.get('/api/blogs')
    expect(result.status).toBe(200)
    expect(result.header['content-type']).toMatch(/application\/json/)
    expect(result.body.length).toBe(apiTestHelper.blogEntriesForTesting.length)
    done()
  })

  test('GET: kaikilla blogikirjauksilla kenttä id (ei _id)', async (done) => {
    const result = await api.get('/api/blogs')
    const blogs = result.body
    const firstBlog = blogs[0]
    expect(firstBlog.id).toBeDefined()
    done()
  })

  test(
    'POST: tallennus onnistuu, blogien määrä += 1, lisätty löytyy kannasta',
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

  test('POST: puuttuva title tai url johtaa virheeseen 400', async (done) => {
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

  test('DELETE: http-status 204; kirjaus kadonnut kannasta', async (done) => {
    const getBeforeResponse = await api.get('/api/blogs')
    const blogsBefore = getBeforeResponse.body
    const countBefore = blogsBefore.length
    const idToDelete = blogsBefore[0].id

    const deleteResponse = await api.delete(`/api/blogs/${idToDelete}`)
    expect(deleteResponse.status).toEqual(204)

    const getAfterResponse = await api.get('/api/blogs')
    const blogsAfter = getAfterResponse.body
    const countAfter = blogsAfter.length
    expect(countAfter).toEqual(countBefore - 1)

    expect(_.some(blogsAfter, b => b.id === idToDelete)).toBeFalsy()

    done()
  })
})
