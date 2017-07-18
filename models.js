var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var userSchema = new Schema({
  slackID: String,
  refresh_token: String,
  access_token: String,
  auth_id: String,
  token_type: String,
  expiry_date: Number
})


var reminderSchema = new Schema({
  userID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
  },
  subject: String,
  channelID: String,
  date: Number
})

var User = mongoose.model('User', userSchema);
var Reminder = mongoose.model('Reminder', reminderSchema);

module.exports = {
  User: User,
  Reminder: Reminder
 };
