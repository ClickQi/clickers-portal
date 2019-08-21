const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  idPeopleTeamwork: {
    type: Number,
    required: false
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  idAccessLevel: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AccessLevel'
  },
  date: {
    type: Date,
    default: Date.now
  }
});

module.exports = User = mongoose.model('user', UserSchema);
