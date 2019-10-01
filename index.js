// dependencies
const http = require('http')
const mongoose = require('mongoose')

// local modules
const config = require('./utils/config')
const logging = require('./utils/logging')
const app = require('./app')

// create and start the server serving the api
const server = http.createServer(app)
server.listen(config.PORT, () => {
  logging.info(`Server running on port ${config.PORT}`)
})
