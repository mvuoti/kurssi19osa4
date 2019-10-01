// application api

// dependencies
const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const mongoose = require('mongoose')

// local modules
const config = require('./utils/config')
const middleware = require('./utils/middleware')
const logging = require('./utils/logging')

// connection must be initiated before
// defining schemas and models
mongoose.connect(config.MONGO_URL, config.MONGO_OPTIONS)
  .then(() => logging.info('Yhteys kantaan auki.'))
  .catch((error) => logging.error('Kanta ei aukea: ', error.message))

// controllers
const blogsController = require('./controllers/blogs_controller')

// express application setup
const app = express()
app.use(cors())
app.use(middleware.dumpRequest)
app.use(bodyParser.json())
app.use('/api/blogs', blogsController)
app.use(middleware.unknownEndpoint)
app.use(middleware.handleError)

module.exports = app
