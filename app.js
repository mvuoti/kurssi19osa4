// application api

const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const mongoose = require('mongoose')

const config = require('./utils/config')
const middleware = require('./utils/middleware')
const logging = require('./utils/logging')

// connection must be initiated before
// defining schemas and models. maybe
// should be done as a require dependency?
mongoose.connect(config.MONGO_URL, config.MONGO_OPTIONS)
  .then(() => logging.info('Yhteys kantaan auki.'))
  .catch((error) => logging.error('Kanta ei aukea: ', error.message))

const blogsController = require('./controllers/blogs_controller')
const usersController = require('./controllers/users_controller')
const loginController = require('./controllers/login_controller')

const app = express()
app.use(cors())
app.use(middleware.dumpRequest)
app.use(bodyParser.json())
app.use('/api/blogs', blogsController)
app.use('/api/users', usersController)
app.use('/api/login', loginController)
app.use(middleware.unknownEndpoint)
app.use(middleware.handleError)

module.exports = app
