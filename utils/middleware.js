// local modules
const logging = require('../utils/logging')

// middleware to handle a request with no matching route
const unknownEndpoint = (req, res) => {
  res.status(404).send({ message: 'Unknown endpoint ' + req.path })
}

// middleware to log all requests
const dumpRequest = (req, res, next) => {
  logging.info(req.method, ' ', req.path)
  next()
}

// middleware to log all uncaught errors
const handleError = (error, req, res, next) => {
  if (res.headersSent) {
    console.error(`HEADERS SENT ${req.method} ${req.path}`)
    logging.error(`${error.message} -- ${req.path}`)
    next()
  }

  if (error.name === 'ValidationError') {
    res.status(400).send({ message: error.name })
  } else {
    !!error.name && logging.error('error.name = ', error.name)
    logging.error(error.message)
    next(error)
  }
}

module.exports = {
  unknownEndpoint,
  dumpRequest,
  handleError
}
