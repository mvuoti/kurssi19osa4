const {
  dummy,
  totalLikes,
  favoriteBlog,
  mostBlogs,
  mostLikes
} = require('../utils/list_helper')

const emptyList = []
const testList = require('./test_blog_entries')

describe('dummy', () => {
  test('Tyhjä lista', () => {
    expect(dummy(emptyList)).toBe(1)
  })
  test('Blogeja sisältävä lista', () => {
    expect(dummy(testList)).toBe(1)
  })
})

describe('totalLikes', () => {
  test('Tyhjä lista', () => {
    expect(totalLikes(emptyList)).toBe(0)
  })
  test('Kaikki testiblogit', () => {
    expect(totalLikes(testList)).toBe(7 + 5 + 12 + 10 + 0 + 2)
  })
})

describe('favoriteBlog', () => {
  const blogWithMostLikes = {
    title: 'Canonical string reduction',
    author: 'Edsger W. Dijkstra',
    url: 'http://www.cs.utexas.edu/~EWD/transcriptions/EWD08xx/EWD808.html',
    likes: 12
  }
  test('Testilistasta löytyy 3. postaus (suosituin)', () => {
    expect(favoriteBlog(testList)).toEqual(blogWithMostLikes)
  })
  test('Tyhjä lista tuottaa undefined', () => {
    expect(favoriteBlog(emptyList)).toBe(undefined)
  })
})

describe('mostBlogs', () => {
  const expectedResult = {
    author: 'Robert C. Martin',
    blogs: 3
  }
  test('Testilistan ahkerin: Martin, postauksia 3', () => {
    expect(mostBlogs(testList)).toEqual(expectedResult)
  })
  test('Tyhjä lista -> null', () => {
    expect(mostBlogs([])).toBe(null)
  })
})

describe('mostLikes', () => {
  const expectedResult = {
    author: 'Edsger W. Dijkstra',
    likes: 17
  }
  test('Eniten tykkäyksiä: Dijkstra, 17', () => {
    expect(mostLikes(testList)).toEqual(expectedResult)
  })
  test('Tyhjä lista -> null', () => {
    expect(mostLikes([])).toBe(null)
  })
})
