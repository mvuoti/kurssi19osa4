
// port to listen to
const PORT = 3003

// database name, username, and password
const MONGO_DATABASE = 'blogapp'
const MONGO_USER = 'user'
const MONGO_PASSWORD = process.env.MONGO_PASSWORD
if (!MONGO_PASSWORD) {
	console.log('MONGO_PASSWORD?')
	process.exit(1)
}
const MONGO_URL = `mongodb+srv://${MONGO_USER}:${MONGO_PASSWORD}@cluster0-vsvmn.mongodb.net/${MONGO_DATABASE}?retryWrites=true&w=majority`
const MONGO_OPTIONS = {
    useNewUrlParser: true,
    useUnifiedTopology: true
}


module.exports = {
    PORT,
    MONGO_URL,
    MONGO_OPTIONS
}