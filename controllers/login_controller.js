const express = require('express')
const bcrypt = require('bcrypt')
const jsonwebtoken = require('jsonwebtoken')

const User = require('../models/user')
const { AUTHENTICATION_TOKEN_SECRET } = require('../utils/config')

const app = express()

const AUTHENTICATION_ERROR_MSG = 'Bad username or password'

app.post('/', async (req, res, next) => {
  const { username, password } = req.body
  if (!username || !password) {
    const message = 'Username or password missing'
    return res.status(400).send({ message })
  }
  const userDoc = await User.findOne({ username: username })
  const userExists = !!userDoc
  const loginIsGood =
    userExists && bcrypt.compareSync(password, userDoc.passwordHash)
  if (loginIsGood) {
    const tokenContent = {
      username: userDoc.username,
      id: userDoc.id
    }
    const token = jsonwebtoken.sign(
      tokenContent,
      AUTHENTICATION_TOKEN_SECRET
    )
    const responseBody = {
      username: userDoc.username,
      name: userDoc.name,
      id: userDoc._id,
      token
    }
    return res.status(200).send(responseBody)
  } else {
    return res.status(401).send({
      message: AUTHENTICATION_ERROR_MSG
    })
  }
})

module.exports = app
