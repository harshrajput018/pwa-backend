const mongoose = require('mongoose')

const msgSchema = new mongoose.Schema({
    from: {type:mongoose.Schema.Types.ObjectId, ref: 'User', required: true},
    to: {type:mongoose.Schema.Types.ObjectId, ref: 'User', required: true},
    content: String,
    timeStamp:{ type : Date, default: Date.now }
  });

module.exports = mongoose.model('Msg',msgSchema);  