const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');

const userSchema = new mongoose.Schema({
  username: String,
  password: String,
  name: String,
  NITC: Boolean,
  College: String,
  contactNumber: String,
  sahitiID: { type: Number, unique: true, required: true },
  registered: { type: Number, default: 0 },  
});

userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model('User', userSchema);
