const mongoose = require('mongoose');

const msgSchema = new mongoose.Schema({
  from: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  to: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false }, // Make 'to' optional for public messages
  content: String, // For text content
  videoData: { type: Buffer }, // For binary video data, consider if you need a separate handling or type indication
  timeStamp: { type: Date, default: Date.now },
  username:String,
  type: { type: String, enum: ['public', 'private'], required: true }, // New field to differentiate message type,

});

module.exports = mongoose.model('Msg', msgSchema);
