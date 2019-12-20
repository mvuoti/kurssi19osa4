const express = require('express')

const Blog = require('../models/blog')

const app = express()

app.post('/reset', async (req, res, next) => {
  try {
    console.log('RESET')
    await Blog.deleteMany({})
    return res.status(204).end()
  } catch (err) {
    return next(err)
  }
})

module.exports = app
