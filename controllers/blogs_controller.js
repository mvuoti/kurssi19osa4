const express = require('express')
const Blog = require('../models/blog')
const User = require('../models/user') // dev setup

const app = express()

app.get('/', async (request, response, next) => {
  try {
    const blogs = await Blog.find({}).populate('user')
    return response.status(200).json(blogs.map(b => b.toJSON()))
  } catch (error) {
    return next(error)
  }
})

app.get('/:id', async (request, response, next) => {
  try {
    const id = request.params.id
    const blog = await Blog.findById(id).populate('user')
    return response.status(200).json(blog)
  } catch (error) {
    return next(error)
  }
})

app.post('/', async (request, response, next) => {
  try {
    const token = request.token
    if (!token) {
      const message = 'Authentication required'
      return response.status(401).json({ message })
    }
    const user = await User.findById(token.id)
    if (!user) {
      throw Error('Unknown user id in authorization token!!!')
    }    
    const blogData = request.body
    const blog = new Blog({ ...blogData, user: token.id })
    await blog.save()
    user.blogs.push(blog._id)
    await user.save()
    return response.status(200).json(blog.toJSON())
  } catch (error) {
    return next(error)
  }
})

app.delete('/:id', async (request, response, next) => {
  try {
    const token = request.token
    if (!token) {
      const message = 'Authentication required'
      return response.status(401).json({ message })
    }
    const id = request.params.id
    const blog = await Blog.findById(id)
    if (blog.user.toString() !== token.id) {
      const message = 'DELETE allowed only for creator'
      return response.status(401).json({ message })
    }
    await Blog.findByIdAndDelete(id)
    return response.status(204).end()
  } catch (error) {
    next(error)
  }
})

app.put('/:id', async (request, response, next) => {
  try {
    const id = request.params.id
    const values = request.body
    const updatedDoc = await Blog.findByIdAndUpdate(id, values, { new: true })
    return response.status(200).json(updatedDoc.toJSON())
  } catch (error) {
    return next(error)
  }
})

module.exports = app
