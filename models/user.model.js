const mongoose = require('mongoose')
let UserSchema = new mongoose.Schema({
  first_name: { type: String, required: true },
  phone_number: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  profileImage: {type: String, required: true, unique: true},
  password: { type: String, required: true },
  isAdmin: { type: Boolean, default: false },
  date_created: { type: String, default: Date.now() }
})
let UserModel = mongoose.model('userDetails', UserSchema)

module.exports = UserModel