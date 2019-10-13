const supertest = require('supertest')
const mongoose = require('mongoose')
const bcrypt = require('bcrypt')

const { PASSWORD_BCRYPT_ROUNDS } = require('../utils/config')
const { MONGO_URL, MONGO_OPTIONS } = require('../utils/config')
mongoose.connect(MONGO_URL, MONGO_OPTIONS)

const User = require('../models/user')

const app = require('../app')
const api = supertest(app)


// authentication headers for testin different scenarios
let goodAuthHeaderValue = undefined // set in beforeAll()
const badTokenAuthHeaderValue = 'Bearer thisWillNeverWork'
const unsupportedAuthHeaderValue = 'OtherScheme tokenForTheUnsupportedScheme'

// variable for test users id
let testUserId = undefined // set in beforeAll()

// data for testing
const testCredentials = {
    good: {
        username: 'testuser',
        password: 'goodpassword'
    },
    bad: {
        username: 'testuser',
        password: 'goodpasswordNOT'
    }
}
const testUserToCreate = {
    username: 'testuser',
    name: 'Test User',
    password: 'goodpassword'
}
const testBlogEntry = {
    title: 'test blog',
    author: 'some author',
    url: 'http://www.ibm.com',
    likes: 1313,
    user: undefined // set from token by api
}

// create and login user to test against
beforeAll(async (done) => {
    // create user
    const passwordHash = bcrypt.hashSync(
        testUserToCreate.password,
        PASSWORD_BCRYPT_ROUNDS
    )
    const testUserDoc = new User({
        username: testUserToCreate.username,
        name: testUserToCreate.name,
        passwordHash: passwordHash
    })
    await User.deleteMany({})
    await testUserDoc.save()
    testUserId = testUserDoc.id

    // login, extract token
    const loginRequestBody = {
        username: testUserToCreate.username,
        name: testUserToCreate.name,
        password: testUserToCreate.password
    }
    const loginResponse = await api.post('/api/login')
        .set('Content-type', 'application/json')
        .send(loginRequestBody)
    if (loginResponse.status != 200) {
        console.log(loginResponse.body)
        throw Error("kirjautuminen epäonnistui")
    }
    goodAuthHeaderValue = `Bearer ${loginResponse.body.token}`
    return done()
})

afterAll(() => { 
    mongoose.connection.close()
})

describe('authorization', () => {

    test('creating a blog using a valid token succeeds, user from token',
        async () => {
            const blogPostResponse = await api.post('/api/blogs')
                .set('Content-type', 'application/json')
                .set('Authorization', goodAuthHeaderValue)
                .send(testBlogEntry)
            expect(blogPostResponse.status).toEqual(200)
            const savedBlogEntry = blogPostResponse.body
            expect(savedBlogEntry.user).toEqual(testUserId)
        })

    test('creating a blog with a bad token fails with 401',
        async () => {
            const blogPostResponse = await api.post('/api/blogs')
                .set('Content-type', 'application/json')
                .set('Authorization', badTokenAuthHeaderValue)
                .send(testBlogEntry)
            expect(blogPostResponse.status).toEqual(401)
    })
   
    test('creating a blog without any token fails with 401',
        async () => {
            const blogPostResponse = await api.post('/api/blogs')
                .set('Content-type', 'application/json')
                .send(testBlogEntry)
            expect(blogPostResponse.status).toEqual(401)
    })

    test('creating a blog using unsupported scheme fails with 400',
        async () => {
            const blogPostResponse = await api.post('/api/blogs')
                .set('Content-type', 'application/json')
                .set('Authorization', unsupportedAuthHeaderValue)
                .send(testBlogEntry)
            expect(blogPostResponse.status).toEqual(400)
    })

 })