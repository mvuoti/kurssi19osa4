// dependencies
const _ = require('lodash')

// returns 1 for any input
const dummy = (blogs) => {
  return 1
}

// returns sum of all likes in list of blog entries.
// returns 0 for an empty list
const totalLikes = (blogs) => {
  const reducer = (totalLikes, blogEntry) => {
    return totalLikes + blogEntry.likes
  }
  return blogs.reduce(reducer, 0)
}

// returns the blog entry with biggest like count.
// returns null for an empty list.
const favoriteBlog = (blogs) => {
  const reducer = (mostLikedSoFar, blogEntry) => {
    if (mostLikedSoFar === null) {
      return blogEntry
    } else if (blogEntry.likes > mostLikedSoFar.likes) {
      return blogEntry
    } else {
      return mostLikedSoFar
    }
  }
  const favouriteBlogRecord = blogs.reduce(reducer, null)
  let result
  if (favouriteBlogRecord) {
    const { title, author, url, likes } = favouriteBlogRecord
    result = { title, author, url, likes }
  } else {
    result = null
  }
  return result
}

// returns the author with most blog entries, with the count,
// in an object.
// returns null for empty list.
const mostBlogs = (blogs) => {
  if (blogs.length === 0) {
    return null
  }
  const authors = _.uniq(_.map(blogs, (b) => b.author))
  const blogCountsByAuthor = _.map(authors, (a) => {
    return {
      author: a,
      blogs: _.sumBy(blogs, (b) => b.author === a)
    }
  })
  const reducer = (winningObject, candidateObject) =>
    (winningObject !== null && winningObject.blogs > candidateObject.blogs)
      ? winningObject
      : candidateObject
  return blogCountsByAuthor.reduce(reducer, null)
}

// returns the author with the biggest like total,
// with the total, in an object.
// returns null for an empty list.
const mostLikes = (blogs) => {
  if (blogs.length === 0) {
    return null
  }
  const authors = _.uniq(_.map(blogs, (b) => b.author))
  const totalLikesByAuthor =
        _.map(authors, (a) => {
          return {
            author: a,
            likes: _.sumBy(blogs, (b) =>
              (b.author === a ? b.likes : 0)
            )
          }
        })
  const reducer = (winningObject, candidateObject) =>
    (winningObject !== null && winningObject.likes > candidateObject.likes)
      ? winningObject
      : candidateObject
  return totalLikesByAuthor.reduce(reducer, null)
}

module.exports = {
  dummy,
  totalLikes,
  favoriteBlog,
  mostBlogs,
  mostLikes
}
