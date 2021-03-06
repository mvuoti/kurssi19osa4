const mongoose = require('mongoose')
const supertest = require('supertest')

const app = require('../app')
const config = require('../utils/config')
const User = require('../models/user')

const { initializeUserCollection } = require('./api_users_testhelper')
const { initializeBlogCollection } = require('./api_blogs_testhelper')

const { createLoggedInSession } = require('./api_session_helper')
let loggedInSession; // to be set in beforeAll()

const api = supertest(app)

mongoose
  .connect(config.MONGO_URL, config.MONGO_OPTIONS)
  .catch(e => {
    console.error(e.name)
    process.exit(1)
  })

const {
  usersInDbPriorTests,
  userToCreate,
  userToCreateShortPassword,
  userToCreateShortUsername,
  userToCreateDuplicateUsername
} = require('./users_for_testing')

afterAll(() => {
  mongoose.connection.close()
})

describe('/api/users', () => {
  beforeEach(async (done) => {
    await initializeUserCollection()
    const userToCreate = {
      username: 'userfortesting',
      password: 'anyoldpassword',
      name: 'User for Testing'
    }
    loggedInSession = await createLoggedInSession(api, userToCreate)
    await initializeBlogCollection(loggedInSession)
    done()
  })

  test('GET: status 200, kaikki käyttäjät palautetaan', async (done) => {
    const result = await api.get('/api/users')
    expect(result.status).toEqual(200)
    const usersInResult = result.body
    expect(usersInDbPriorTests.every(
      uDb => usersInResult.some(uRes => uRes.username === uDb.username)
    )).toBeTruthy()
    done()
  })

  test('GET: sanitointi; _id pois, kenttä id tilalle', async (done) => {
    const result = await api.get('/api/users')
    const usersInResult = result.body
    expect(usersInResult.every(
      u => !u._id && !!u.id
    )).toBeTruthy()
    done()
  })

  test('GET: sanitointi; __v pois', async (done) => {
    const result = await api.get('/api/users')
    const usersInResult = result.body
    expect(usersInResult.every(u => !u.__v)).toBeTruthy()
    done()
  })

  test('GET: sanitointi; passwordHash pois', async (done) => {
    const result = await api.get('/api/users')
    const usersInResult = result.body
    expect(usersInResult.every(u => !u.passwordHash)).toBeTruthy()
    done()
  })

  test('GET: kaikilla käyttäjillä lista blogeista', async (done) => {
    const usersResult = await api.get('/api/users')
    const blogsResult = await api.get('/api/blogs')
    const usersInDb = usersResult.body
    const blogsInDb = blogsResult.body
    let i
    for (i in usersInDb) {
      const username = usersInDb[i].username
      const blogsInUserDoc = usersInDb[i].blogs
      const blogsOfUserInDb = blogsInDb.filter(bd => bd.user.username === username)
      expect(blogsOfUserInDb.every(
        bDb => blogsInUserDoc.some(bU => bU.id === bDb.id)
      )).toBeTruthy()
    }
    done()
  })

  test('POST: uusi käyttäjä -> status 200, löytyy kannasta', async (done) => {
    const usersBefore = await User.find({})
    const result = await api.post('/api/users').send(userToCreate)
    expect(result.status).toEqual(200)
    const usersAfter = await User.find({})
    expect(usersAfter.length).toEqual(usersBefore.length + 1)
    expect(usersAfter.some(u => u.username === userToCreate.username)).toBeTruthy()
    done()
  })

  test('POST: liian lyhyt käyttäjätunnus -> status 400 ja virheilmoitus', async (done) => {
    const result = await api.post('/api/users').send(userToCreateShortUsername)
    expect(result.status).toEqual(400)
    expect(!!result.body.message && result.body.message).toMatch(/user ?name/i)
    done()
  })

  test('POST: liian lyhyt salasana -> status 400 ja virheilmoitus', async (done) => {
    const result = await api.post('/api/users').send(userToCreateShortPassword)
    expect(result.status).toEqual(400)
    expect(!!result.body.message && result.body.message).toMatch(/password/i)
    done()
  })

  test('POST: varattu käyttäjätunnus - status 400 ja virheilmoitus', async (done) => {
    const result = await api.post('/api/users').send(userToCreateDuplicateUsername)
    expect(result.status).toEqual(400)
    expect(!!result.body && result.body.message).toMatch(/unique/i)
    done()
  })
})
