const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/chat');


const Message = mongoose.model('Message', { 
    text: String, 
    author_name: String, 
    author_id: String, 
    date: Date,
    color: String
});

const User = mongoose.model('User', { 
    username: String,
    usercolor: String
});

exports.Message = Message
exports.User = User