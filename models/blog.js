// dependencies
const mongoose = require('mongoose')

// schema definition for a blog entry
const blogSchema = mongoose.Schema({
  title: String,
  author: String,
  url: String,
  likes: Number
})

// sanitization of blog entry objects
// prior to passing to client
blogSchema.set('toJson', {
  transform: (doc, obj) => {
    obj.id = doc._id.toString()
    delete obj._id
    delete obj.__v
  }
})

// create the model for blog entry
const Blog = mongoose.model('Blog', blogSchema)

module.exports = Blog
