// import { Mongoose } from 'mongoose';

const mongoose = require('mongoose');
const config = require('./config').config;


function Init() {
    return new Promise((resolve, reject) => {
        mongoose.connect(config.mongoUrl);
        let db = mongoose.connection;
        db.on('error', reject);
        db.once('open', function() {
            resolve()
        });
    });
}


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

exports.Message = Message;
exports.User = User;
exports.Init = Init;