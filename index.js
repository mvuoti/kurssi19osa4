// dependencies
const http = require('http')
const mongoose = require('mongoose')

// app modules
const config = require('./utils/config')
const logging = require('./utils/logging')
const app = require('./app')

// create and start the server
const server = http.createServer(app)
server.listen(config.PORT, () => {
  logging.info(`Server running on port ${config.PORT}`)
})
