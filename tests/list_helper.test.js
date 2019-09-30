// unit tests of list_helper.js


// functions to be tested
const {
  dummy,
  totalLikes,
  favoriteBlog,
  mostBlogs,
  mostLikes
} = require('../utils/list_helper')

// content for testing
const emptyList = []
const blogEntriesForTesting = require('./blog_entries_for_testing')

// start of tests

describe('dummy: returns 1 for any list', () => {
  test('test list of blog entries gives 1', () => {
    expect(dummy(blogEntriesForTesting)).toBe(1)
  })
  test('empty list gives 1', () => {
    expect(dummy(emptyList)).toBe(1)
  })
})

describe('totalLikes: returns sum of likes in blogs in list', () => {
  test('test list of blog entries gives the correct sum of likes', () => {
    expect(totalLikes(blogEntriesForTesting)).toBe(7 + 5 + 12 + 10 + 0 + 2)
  })
  test('empty list gives 1', () => {
    expect(totalLikes(emptyList)).toBe(0)
  })
})

describe('favoriteBlog: returns the blog with most likes', () => {
  const blogWithMostLikes = {
    title: 'Canonical string reduction',
    author: 'Edsger W. Dijkstra',
    url: 'http://www.cs.utexas.edu/~EWD/transcriptions/EWD08xx/EWD808.html',
    likes: 12
  }
  test('test list of blog entries gives the right blog', () => {
    expect(favoriteBlog(blogEntriesForTesting)).toEqual(blogWithMostLikes)
  })
  test('empty list gives null', () => {
    expect(favoriteBlog(emptyList)).toBe(null)
  })
})

describe('mostBlogs: returns an object with the author with most blog entries and the count', () => {
  const expectedResult = {
    author: 'Robert C. Martin',
    blogs: 3
  }
  test('test list of blog entries gives Robert C. Martin with count 3', () => {
    expect(mostBlogs(blogEntriesForTesting)).toEqual(expectedResult)
  })
  test('empty list gives null', () => {
    expect(mostBlogs([])).toBe(null)
  })
})

describe('mostLikes: returns the blogger with most likes, and the likes total', () => {
  const expectedResult = {
    author: 'Edsger W. Dijkstra',
    likes: 17
  }
  test('test list gives Edsger W.Dijkstra, 17 likes' , () => {
    expect(mostLikes(blogEntriesForTesting)).toEqual(expectedResult)
  })
  test('empty list gives null', () => {
    expect(mostLikes([])).toBe(null)
  })
})
