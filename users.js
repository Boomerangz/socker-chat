const db = require('./db');


const colors = [ 'red', 'green', 'blue', 'magenta', 'purple', 'plum', 'orange' ];

function randomColor() {
    return colors[Math.floor(Math.random()*colors.length)];    
}


function addUser(username) {
    return new Promise((resolve, reject) => {
        db.User.create({
            username: username,
            usercolor: randomColor()
        }, (err, user) => {
            if (err) {
                reject(err);
            } else {
                resolve(user._id);
            }
        });
    });
}


function getUser(token) {
    return new Promise((resolve, reject) => {
        db.User.findOne({_id:token}).exec((err, user) => {
            if (err || !user) {
                reject(err);
            } else {
                resolve(user);
            }
        })
    });
}


exports.addUser = addUser;
exports.getUser = getUser;