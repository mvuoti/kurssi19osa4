// running mode
const NODE_ENV = process.env.NODE_ENV

// port to listen to
const PORT = 3003

// database name, username, password; connection options
const MONGO_DATABASE = process.env.NODE_ENV !== 'test' ? 'blogapp' : 'blogappTest'
const MONGO_USER = 'user'
const MONGO_PASSWORD = process.env.MONGO_PASSWORD
if (!MONGO_PASSWORD) {
  console.error('MONGO_PASSWORD?')
  process.exit(1)
}
const MONGO_URL = `mongodb+srv://${MONGO_USER}:${MONGO_PASSWORD}@cluster0-vsvmn.mongodb.net/${MONGO_DATABASE}?retryWrites=true&w=majority`
const MONGO_OPTIONS = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false
}

const PASSWORD_BCRYPT_ROUNDS = 10
const AUTHENTICATION_TOKEN_SECRET = 'k33kwoefis09fsj'

module.exports = {
  NODE_ENV,
  PORT,
  MONGO_URL,
  MONGO_OPTIONS, 
  PASSWORD_BCRYPT_ROUNDS,
  AUTHENTICATION_TOKEN_SECRET
}
