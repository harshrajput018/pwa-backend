const mongoose = require('mongoose')

const friendSchema = new mongoose.Schema ({

    user1: {type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true},
    user2: {type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true},
    areFriends : {type: Boolean, default: false},
    request : {type: Boolean, default: false}
    
    
    });
    module.exports = mongoose.model('Friend',friendSchema);