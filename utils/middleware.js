const logging = require('../utils/logging')

const jsonwebtoken = require('jsonwebtoken')
const { AUTHENTICATION_TOKEN_SECRET } = require('../utils/config')

// middleware to handle a request with no matching route
const unknownEndpoint = (req, res) => {
  return res.status(404).send({
    message: 'Unknown endpoint ' + req.path
  })
}

// middleware to log all requests
const dumpRequest = (req, res, next) => {
  logging.info(req.method, ' ', req.path)
  return next()
}

// middleware to decrypt authentication
// token from request, if exists
const extractToken = (req, res, next) => {
  const authorizationHeader = req.header('Authorization')
  if (!authorizationHeader) {
    return next()
  }
  const [scheme, encryptedToken] =
    authorizationHeader.split(' ');
  if (scheme.toLowerCase() !== 'bearer') {
    return res.status(400).json({
      message: 'Unsupported authentication scheme: ${scheme}'
    })
  }
  try {
    req.token = jsonwebtoken.verify(
      encryptedToken, AUTHENTICATION_TOKEN_SECRET
    )
    return next()
  } catch (e) {
    return res.status(401).json({
      message: 'Invalid/expired authentication token'
    })
  }
}

// middleware to log all uncaught errors
const handleError = (error, req, res, next) => {
  if (res.headersSent) {
    console.error(`HEADERS SENT ${req.method} ${req.path}`)
    logging.error(`${error.message} -- ${req.path}`)
    return next()
  }
  if (error.name === 'ValidationError') {
    return res.status(400).send({ message: error.name })
  } else {
    if (!error.name) {
      logging.error('error.name = ', error.name)
    }
    return next(error)
  }
}

module.exports = {
  unknownEndpoint,
  dumpRequest,
  extractToken,
  handleError
}
