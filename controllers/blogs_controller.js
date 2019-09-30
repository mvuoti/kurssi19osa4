// router for blog entry handling
//

const express = require('express')
const Blog = require('../models/blog')
const app = express()

// get all blogs in database
app.get('/', (request, response, next) => {
  Blog
    .find({})
    .then(blogs => {
      response.json(blogs)
    })
    .catch(error => next(error)) 
})

// post a new blog
app.post('/', (request, response, next) => {
  const blog = new Blog(request.body)

  blog
    .save()
    .then(result => {
      response.status(201).json(result)
    })
    .catch(error => next(error)) 
})

module.exports = app
