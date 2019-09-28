const _ = require('lodash')

const dummy = (blogs) => {
  return 1
}

const totalLikes = (blogs) => {
  const reducer = (totalLikes, blogEntry) => {
    return totalLikes + blogEntry.likes
  }
  return blogs.reduce(reducer, 0)
}

const favoriteBlog = (blogs) => {
  const reducer = (mostLikedSoFar, blogEntry) => {
    if (mostLikedSoFar === undefined) {
      return blogEntry
    } else if (blogEntry.likes > mostLikedSoFar.likes) {
      return blogEntry
    } else {
      return mostLikedSoFar
    }
  }
  const favouriteBlogRecord = blogs.reduce(reducer, undefined)
  let result
  if (favouriteBlogRecord) {
    const { title, author, url, likes } = favouriteBlogRecord
    result = { title, author, url, likes }
  } else {
    result = undefined
  }
  return result
}

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
  console.log(totalLikesByAuthor)
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
