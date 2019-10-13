const supertest = require('supertest')
const mongoose = require('mongoose')
const _ = require('lodash')

const config = require('../utils/config')
const app = require('../app.js')


mongoose
  .connect(config.MONGO_URL, config.MONGO_OPTIONS)
  .catch(e => {
    console.error(e.name)
    process.exit(1)
  })

const apiBlogsTesthelper = require('./api_blogs_testhelper')
const apiUsersTesthelper = require('./api_users_testhelper')

const { createLoggedInSession } = require('./api_session_helper')
let loggedInSessionAuthor; // to be set in beforeAll()
let loggedInSessionNonAuthor; // -- "" --

const api = supertest(app)

// setup test entries for various test scenarios
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

afterAll(() => {
  mongoose.connection.close()
})

// schema-enforced default for likes
describe('Blog (model)', () => {
  test('POST: jos likes puuttuu, asetetaan oletusarvoksi 0', () => {
    const Blog = require('../models/blog')
    const newBlog = new Blog(testEntryUndefLikes)
    expect(newBlog.likes).toEqual(0)
  })
})

describe('/api/blogs', () => {
  beforeEach(async (done) => {
    // order matters -- blog creation needs a user to work
    await apiUsersTesthelper.initializeUserCollection()
    loggedInSessionAuthor = await createLoggedInSession(api, {
      username: 'authoruser',
      name: 'Author User',
      password: 'authoruserpassword'
    })
    loggedInSessionNonAuthor = await createLoggedInSession(api, {
      username: 'nonauthoruser',
      name: 'NonAuthor User',
      password: 'nonauthoruserpassword'
    })
    await apiBlogsTesthelper.initializeBlogCollection(loggedInSessionAuthor)
    done()
  })

  test('null test', () => { expect(true).toBeTruthy() })

  test('GET: palauttaa kaikki kirjaukset, vastauksen tyyppi JSON', async (done) => {
    const result = await api.get('/api/blogs')
    expect(result.status).toBe(200)
    expect(result.header['content-type']).toMatch(/application\/json/)
    expect(result.body.length).toBe(apiBlogsTesthelper.blogEntriesForTesting.length)
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
    'POST: status 200, palauttaa blogin id:llä, blogien määrä += 1, lisätty löytyy kannasta',
    async (done) => {
      const postResponse = await api.post('/api/blogs')
        .set('Content-type', 'application/json; charset=utf-8')
        .set('Authorization', loggedInSessionAuthor.authorizationHeader)
        .send(testEntryFull)
      expect(postResponse.status).toEqual(200)

      const blogReturnedFromPost = postResponse.body
      expect(!!blogReturnedFromPost.id).toBeTruthy()

      const getResponse = await api.get('/api/blogs')
      const blogsAfterPost = getResponse.body
      expect(blogsAfterPost.length).toEqual(apiBlogsTesthelper.blogEntriesForTesting.length + 1)
      expect(blogsAfterPost.map(b => b.author)).toContain(testEntryFull.author)
      done()
    })

  test('POST: puuttuva title tai url johtaa virheeseen 400', async (done) => {
    const urllessResponse = await api.post('/api/blogs')
      .set('Content-type', 'application/json; charset=utf-8')
      .set('Authorization', loggedInSessionAuthor.authorizationHeader)
      .send(testEntryUndefUrl)
    expect(urllessResponse.status).toEqual(400)

    const titlelessResponse = await api.post('/api/blogs')
      .set('Content-type', 'application/json; charset=utf-8')
      .set('Authorization', loggedInSessionAuthor.authorizationHeader)
      .send(testEntryUndefTitle)
    expect(titlelessResponse.status).toEqual(400)
    done()
  })

  test('POST: lisättyyn blogiin on liitetty kirjaajan', async (done) => {
    const postResponse = await api.post('/api/blogs')
      .set('Content-type', 'application/json; charset=utf-8')
      .set('Authorization', loggedInSessionAuthor.authorizationHeader)
      .send(testEntryFull)
    expect(postResponse.status).toEqual(200)

    const blogId = postResponse.body.id
    const getResponse = await api.get(`/api/blogs/${blogId}`)
    expect(getResponse.status).toEqual(200)

    const savedBlog = getResponse.body
    expect(savedBlog.user.username)
      .toEqual(loggedInSessionAuthor.username)
    done()
  })

  test('DELETE: ei onnistu, status 401, kun on kirjauksen tekjä', async (done) => {
    const getBeforeResponse = await api.get('/api/blogs')
    const blogsBefore = getBeforeResponse.body
    const countBefore = blogsBefore.length
    const idToDelete = blogsBefore[0].id
    const deleteResponse =
      await api.delete(`/api/blogs/${idToDelete}`)
        .set('Authorization', loggedInSessionNonAuthor.authorizationHeader)
    expect(deleteResponse.status).toEqual(401)
    done()
  })

  test('DELETE: http-status 204; kirjaus kadonnut kannasta', async (done) => {
    const getBeforeResponse = await api.get('/api/blogs')
    const blogsBefore = getBeforeResponse.body
    const countBefore = blogsBefore.length
    const idToDelete = blogsBefore[0].id

    const deleteResponse =
      await api.delete(`/api/blogs/${idToDelete}`)
        .set('Authorization', loggedInSessionAuthor.authorizationHeader)
    expect(deleteResponse.status).toEqual(204)

    const getAfterResponse =
      await api.get('/api/blogs')
        .set('Authorization', loggedInSessionAuthor.authorizationHeader)
    const blogsAfter = getAfterResponse.body
    const countAfter = blogsAfter.length
    expect(countAfter).toEqual(countBefore - 1)

    expect(_.some(blogsAfter, b => b.id === idToDelete)).toBeFalsy()
    done()
  })

  test('PUT: http-status 200, dokumentin kentät ovat päivittyneet kannassa', async (done) => {
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
    done()
  })
})
