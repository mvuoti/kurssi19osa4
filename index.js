const http = require('http')
const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const cors = require('cors')
const mongoose = require('mongoose')

const config = require('./utils/config')

mongoose.connect(config.MONGO_URL, config.MONGO_OPTIONS)

const blogsController = require('./controllers/blogs_controller')

app.use(cors())
app.use(bodyParser.json())
app.use('/api/blogs', blogsController)

const server = http.createServer(app)
server.listen(config.PORT, () => {
  console.log(`Server running on port ${config.PORT}`)
})
