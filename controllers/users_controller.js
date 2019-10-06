const express = require('express')
const bcrypt = require('bcrypt')

const app = express()

const User = require('../models/user')

const BCRYPT_ROUNDS = 10

app.post('/', async (req, res, next) => {
  const username = req.body.username
  const name = req.body.name
  const password = req.body.password

  if (password.length < 3) {
    const message = 'Password minimum length is 3'
    res.status(400).json({message})
    return
  }

  const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS)

  try {
    const newUser = new User({ username, name, passwordHash })
    await newUser.save()
    res.status(200).json(newUser)
  } catch (e) {
    if (e.name === 'ValidationError') {
      let message
      if (!!e.errors.username) {
        message = e.errors.username.message
      } else {
        message = e.name
      }
      res.status(400).json({ message })
    } else {
      next(e)
    }
  }
})

app.get('/', async (req, res) => {
  const users = await User.find({}).populate('blogs')
  res.status(200).json(users)
})

module.exports = app
