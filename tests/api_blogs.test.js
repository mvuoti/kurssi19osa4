// dependencies
const supertest = require('supertest')
const mongoose = require('mongoose')
const _ = require('lodash')

// local modules
const config = require('../utils/config')
const app = require('../app.js')
const Blog = require('../models/blog')

// helpers for testing
const apiBlogsTesthelper = require('./api_blogs_testhelper')
const apiUsersTesthelper = require('./api_users_testhelper')

// wrap application in supertest
const api = supertest(app)

// connect or die
mongoose
  .connect(config.MONGO_URL, config.MONGO_OPTIONS)
  .catch(e => {
    console.error(e.name)
    process.exit(1)
  })

// test entries for various test scenarios
const testAuthor = 'Dummy Author'
const testTitle = 'Dummy Title'
const testUrl = 'http://www.yle.fi'
const testLikes = 13

const testEntryFull = { author: testAuthor, title: testTitle, url: testUrl, likes: testLikes }
const testEntryUndefLikes = { author: testAuthor, title: testTitle, url: testUrl }
const testEntryUndefTitle = { author: testAuthor, url: testUrl, likes: testLikes }
const testEntryUndefUrl = { author: testAuthor, title: testTitle, likes: testLikes }
const testEntryUpdates = {
  author: 'New Author',
  title: 'New Title',
  url: 'http://www.mtv.fi',
  likes: testLikes + 1
}

// initialize database to known state
// before each test. operation is asynchronic.
// user collection must be initialized first,
// in order to have a valid user id available
// when populating blog collection.
beforeEach(async () => {
  await apiUsersTesthelper.initializeUserCollection()
  await apiBlogsTesthelper.initializeBlogCollection()
})

// database connection must be explicitly closed after tests
afterAll(() => {
  mongoose.connection.close()
})

// tests

describe('Blog (model)', () => {
  test('POST: jos likes puuttuu, asetetaan oletusarvoksi 0', () => {
    const newBlog = new Blog(testEntryUndefLikes)
    expect(newBlog.likes).toEqual(0)
  })
})

describe('/api/blogs', () => {
  test('null test', () => { expect(true).toBeTruthy() })

  test('GET: palauttaa kaikki kirjaukset, vastauksen tyyppi JSON', async () => {
    const result = await api.get('/api/blogs')
    expect(result.status).toBe(200)
    expect(result.header['content-type']).toMatch(/application\/json/)
    expect(result.body.length).toBe(apiBlogsTesthelper.blogEntriesForTesting.length)
  })

  test('GET: kaikilla blogikirjauksilla kenttä id (ei _id)', async () => {
    const result = await api.get('/api/blogs')
    const blogs = result.body
    const firstBlog = blogs[0]
    expect(firstBlog.id).toBeDefined()
  })

  test(
    'POST: status 200, palauttaa blogin id:llä, blogien määrä += 1, lisätty löytyy kannasta',
    async () => {
      const postResponse = await api.post('/api/blogs')
        .set('Content-type', 'application/json; charset=utf-8')
        .send(testEntryFull)
      expect(postResponse.status).toEqual(200)

      const blogReturnedFromPost = postResponse.body
      expect(!!blogReturnedFromPost.id).toBeTruthy()

      const getResponse = await api.get('/api/blogs')
      const blogsAfterPost = getResponse.body
      expect(blogsAfterPost.length).toEqual(apiBlogsTesthelper.blogEntriesForTesting.length + 1)
      expect(blogsAfterPost.map(b => b.author)).toContain(testEntryFull.author)

    })

  test('POST: puuttuva title tai url johtaa virheeseen 400', async () => {
    const urllessResponse = await api.post('/api/blogs')
      .set('Content-type', 'application/json; charset=utf-8')
      .send(testEntryUndefUrl)
    expect(urllessResponse.status).toEqual(400)

    const titlelessResponse = await api.post('/api/blogs')
      .set('Content-type', 'application/json; charset=utf-8')
      .send(testEntryUndefTitle)
    expect(titlelessResponse.status).toEqual(400)

  })

  test('POST: lisättyyn blogiin on liitetty *jonkun* käyttäjän tiedot', async () => {
    const postResponse = await api.post('/api/blogs').send(testEntryFull)
    expect(postResponse.status).toEqual(200)

    const blogId = postResponse.body.id
    const getResponse = await api.get(`/api/blogs/${blogId}`)
    expect(getResponse.status).toEqual(200)

    const savedBlog = getResponse.body
    expect(!!savedBlog.user && !!savedBlog.user.username).toBeTruthy()

  })

  test('DELETE: http-status 204; kirjaus kadonnut kannasta', async () => {
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

  })

  test('PUT: http-status 200, dokumentin kentät ovat päivittyneet kannassa', async () => {
    const getBeforeResponse = await api.get('/api/blogs')
    const blogsBefore = getBeforeResponse.body
    const blogToUpdate = blogsBefore[0]

    const putResponse = await api.put(`/api/blogs/${blogToUpdate.id}`).send(testEntryUpdates)
    expect(putResponse.status).toEqual(200)

    const getAfterResponse = await api.get(`/api/blogs/${blogToUpdate.id}`)
    expect(getAfterResponse.status).toEqual(200)
    const blogAfter = getAfterResponse.body
    expect(_.every(
      testEntryUpdates,
      (valBefore, key) => blogAfter[key] === valBefore
    )).toBeTruthy()

  })
})
