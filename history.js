const db = require('./db');


function getHistory() {
    return new Promise((resolve, reject) => {
        db.Message.
        find().
        sort('-date').
        limit(100).
        sort('date').
        exec(function (err, messages) {
            if (err) {
                reject(err);
            } else {
                resolve(messages);
            }            
        })
    })
}


function addToHistory(message) {
    return new Promise((resolve, reject) => {
        console.log('addToHistory');
        const dbMessage = db.Message(
            {
                text: message.text,
                author_name: message.author_name,
                author_id: message.author_id,
                color: message.color,
                date: new Date()
            }
        );
        console.log(dbMessage);
        dbMessage.save((err) => {
            if (err) {
                console.log(err);
                reject(err);
            } else {
                console.log('ok');
                resolve()
            }
        });    
    });
}

exports.getHistory = getHistory;
exports.addToHistory = addToHistory;