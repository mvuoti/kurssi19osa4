const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const supertest = require('supertest')

const app = require('../app')
const User = require('../models/user')

const api = supertest(app)

const { MONGO_URL, MONGO_OPTIONS } = require('../utils/config')
const { PASSWORD_BCRYPT_ROUNDS } = require('../utils/config')

// data for testing
const testUser = {
  username: 'testuser',
  name: 'Test User',
  password: 'TEST_USER_PASSWORD'
}
const testLoginRequests = {
  nonexistent: {
    username: 'nonexistent user',
    password: 'anystring'
  },
  wrongPassword: {
    username: testUser.username,
    password: testUser.password + 'SOME_EXTRA_CHARS'
  },
  good: {
    username: testUser.username,
    password: testUser.password
  }
}

// setup database for tests
const setupUserCollection = async () => {
  await User.deleteMany({})
  const testUserDoc = new User({
    username: testUser.username,
    name: testUser.name,
    passwordHash: bcrypt.hashSync(
      testUser.password,
      PASSWORD_BCRYPT_ROUNDS
    )
  })
  return testUserDoc.save()
}

beforeAll(() => {
  mongoose.connect(MONGO_URL, MONGO_OPTIONS)
})

afterAll(() => {
  mongoose.connection.close()
})

describe('POST /api/login', () => {
  beforeEach(async (done) => {
    await setupUserCollection()
    done()
  })

  test('unknown user -> status 401', async (done) => {
    const loginRequestBody = testLoginRequests.nonexistent
    const result = await api.post('/api/login')
      .set('Content-type', 'application/json')
      .send(loginRequestBody)
    expect(result.status).toEqual(401)
    done()
  })

  test('bad password -> status 401', async (done) => {
    const loginRequestBody = testLoginRequests.wrongPassword
    const result = await api.post('/api/login')
      .set('Content-type', 'application/json')
      .send(loginRequestBody)
    expect(result.status).toEqual(401)
    done()
  })

  test('good login -> status 200; response contains account details and token',
    async (done) => {
      const loginRequestBody = testLoginRequests.good
      const result = await api.post('/api/login')
        .set('Content-type', 'application/json')
        .send(loginRequestBody)
      expect(result.status).toEqual(200)
      expect(result.body.username).toEqual(loginRequestBody.username)
      expect(result.body.token).toBeDefined()
      done()
    })
})
