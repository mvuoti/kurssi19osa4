const User = require('../models/user')

const createUser = async (api, userData) => {
    const postUserResponse = await api.post('/api/users')
        .set('Content-type', 'application/json')
        .send(userData)
    if (postUserResponse.status !== 200) {
        throw Exception('Test user creation failed')
    }
    return postUserResponse.body;
}

const createLoggedInSession = async (api, userData) => {
    await createUser(api, userData)
    const loginResponse = await api.post('/api/login')
        .set('Content-type', 'application/json')
        .send({
            username: userData.username,
            password: userData.password
        })
    const loginResult = loginResponse.body
    const token = loginResult.token
    const authorizationHeader = `Bearer ${token}`
    const result = {
        username: loginResult.username,
        name: loginResult.name,
        id: loginResult.id,
        authorizationHeader: authorizationHeader
    }
    return result
}

module.exports = {
    createLoggedInSession
}