// router for blog entry handling
//

const express = require('express')
const Blog = require('../models/blog')
const app = express()

// get all blogs in database
// async/await implementation
app.get('/', async (request, response, next) => {
  try {
    const blogs = await Blog.find({}).populate('user')
    response.status(200).json(blogs.map(b => b.toJSON()))
  } catch (error) {
    next(error)
  }
})

// fetch a single blog by id
app.get('/:id', async (request, response, next) => {
  try {
    const id = request.params.id
    const blog = await Blog.findById(id).populate('user')
    response.status(200).json(blog)
  } catch (error) {
    next(error)
  }
})

// post a new blog
app.post('/', async (request, response, next) => {
  try {
    const blogData = request.body
    const User = require('../models/user') // dev setup
    const anyUser = await User.findOne({ username: 'usera' })
    if (!anyUser) { throw new Error('kannassa oltava käyttäjiä') }

    const blog = new Blog({ ...blogData, user: anyUser.id })
    const blogSaveResult = await blog.save()

    anyUser.blogs.push(blog.id)
    const userSaveResult = await anyUser.save()

    response.status(200).json(blogSaveResult)
  } catch (error) {
    next(error)
  }
})

// delete a blog
app.delete('/:id', async (request, response, next) => {
  try {
    const id = request.params.id
    await Blog.findByIdAndDelete(id)
    response.status(204).end()
  } catch (error) {
    next(error)
  }
})

// update a blog
app.put('/:id', async (request, response, next) => {
  try {
    const id = request.params.id
    const values = request.body
    const updatedDoc = await Blog.findByIdAndUpdate(id, values, { new: true })
    response.status(200).json(updatedDoc.toJSON())
  } catch (error) {
    next(error)
  }
})

module.exports = app
