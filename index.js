const http = require('http')
const mongoose = require('mongoose')

const config = require('./utils/config')
const logging = require('./utils/logging')
const app = require('./app')

const server = http.createServer(app)
server.listen(config.PORT, () => {
  logging.info(`Server running on port ${config.PORT}`)
})
