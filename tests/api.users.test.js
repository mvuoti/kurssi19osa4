const mongoose = require('mongoose')
const supertest = require('supertest')

const app = require('../app')
const config = require('../utils/config')
const User = require('../models/user')

const api = supertest(app)

// connect or die
mongoose
    .connect(config.MONGO_URL, config.MONGO_OPTIONS)
    .catch(e => {
        console.error(e.name)
        process.exit(1)
    })

// data for tests
const usersInDbPriorTests = [
    { username: 'usera', name: 'User A', passwordHash: '-some hash-'},
    { username: 'userb', name: 'User B', passwordHash: '-some hash-'}
]
const userToCreate = {
    username: 'userc', name: 'User C', password: 'longEnoughPassword'
}
const userToCreateShortPassword = {
    username: 'userd', name: 'User D', password: 'ab'
}
const userToCreateShortUsername = {
    username: 'xy', name: 'User D', password: 'longEnoughPassword'
}
const userToCreateDuplicateUsername = {
    username: 'usera', name: 'User E', password: 'longEnoughPassword'
}

// setting up tests, finalizing test set
beforeEach(async (done) => {
        const deleteResult = await User.deleteMany({})
        const insertResult = await User.insertMany(usersInDbPriorTests)
        done()
})
afterAll(() => {
    mongoose.connection.close()
})

// tests to do
describe('/api/users', () => {

    test('GET / : status 200, kaikki käyttäjät palautetaan', async (done) => {
        const result = await api.get('/api/users')
        expect(result.status).toEqual(200)
        const usersInResult = result.body
        expect(usersInDbPriorTests.every(
            uDb => usersInResult.some(uRes => uRes.username === uDb.username)
        )).toBeTruthy()
        done()
    })
    
    test('GET / : sanitointi; _id pois, kenttä id tilalle', async (done) => {
        const result = await api.get('/api/users')
        const usersInResult = result.body
        expect(usersInResult.every(
            u => !u.hasOwnProperty('_id') && u.hasOwnProperty('id')
        )).toBeTruthy()
        done()
    })

    test('GET /: sanitointi; __v pois', async (done) => {
        const result = await api.get('/api/users')
        const usersInResult = result.body
        expect(usersInResult.every(u => !u.hasOwnProperty('__v'))).toBeTruthy()
        done()
    })

    test('GET /: sanitointi; passwordHash pois', async (done) => {
        const result = await api.get('/api/users')
        const usersInResult = result.body
        expect(usersInResult.every(
            u => !u.hasOwnProperty('passwordHash')
        )).toBeTruthy()
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
        expect(!!result.body.message && result.body.message).toMatch(/unique/i)
        done()
    })

})