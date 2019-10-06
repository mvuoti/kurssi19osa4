const mongoose = require('mongoose')
const mongooseUniqueValidator = require('mongoose-unique-validator')

const userSchema = mongoose.Schema({
  username: {
    type: String,
    minlength: 3,
    unique: true
  },
  name: String,
  passwordHash: String
})
userSchema.set('toJSON', {
  transform: (doc, obj) => {
    obj.id = obj._id.toString()
    delete obj._id
    delete obj.__v
    delete obj.passwordHash
  }
})
userSchema.plugin(mongooseUniqueValidator)

const User = mongoose.model('User', userSchema)

module.exports = User
