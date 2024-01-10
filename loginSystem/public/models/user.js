const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, unique: true, required: true },
  password: String,
  name: String,
  NITC: Boolean,
  College: String,
  contactNumber: String,
  sahitiID: { type: Number, unique: true, required: true }, 
});

alumniSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model('User', userSchema);
