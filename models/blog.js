// dependencies
const mongoose = require('mongoose')

const ObjectId = mongoose.Schema.Types.ObjectId

const User = require('./user')

// schema definition for a blog entry
const blogSchema = mongoose.Schema({
  title: { type: String, required: true },
  author: String,
  url: { type: String, required: true },
  likes: { type: Number, default: 0 },
  user: { type: ObjectId, ref: User }
})

// sanitization of blog entry objects
// prior to passing to client
blogSchema.set('toJSON', {
  transform: (doc, obj) => {
    obj.id = doc._id.toString()
    delete obj._id
    delete obj.__v
  }
})

// create the model for blog entry
const Blog = mongoose.model('Blog', blogSchema)

module.exports = Blog
