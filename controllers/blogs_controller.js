// router for blog entry handling
//

const express = require('express')
const Blog = require('../models/blog')
const app = express()

// get all blogs in database
// async/await implementation
app.get('/', async (request, response, next) => {
  try {
    const blogs = await Blog.find({})
    response.json(blogs.map(b => b.toJSON()))
  } catch (error) {
    next(error)
  }
})

// post a new blog
app.post('/', async (request, response, next) => {
  try {
    const blog = new Blog(request.body)
    const result = await blog.save()
    response.status(201).json(result)
  } catch (error) {
    next(error)
  }
})

// delete a blog
app.delete('/:id', async (request, response, next) => {
  try {
    await Blog.deleteOne({ _id: request.params.id })
    response.status(204).end()
  } catch (error) {
    next(error)
  }
})

module.exports = app
