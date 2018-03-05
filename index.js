"use strict";
process.title = 'node-chat';
const webSocketsServerPort = 1338;
const WebSocketServer = require('ws').Server;
const	wss = new WebSocketServer({port: webSocketsServerPort});
console.log((new Date()) + " Server is listening on port "
       + webSocketsServerPort);

const history = require('./history');
const users = require('./users');


async function addUser(username, connection) {  
  const token = await users.addUser(username);      
  connection.send(JSON.stringify({
          type: 'token',
          token: token,
          username: username
  }));
  console.log((new Date()) + ' User is known as: ' + username);
}

async function getUserInfo(token, connection) {
  const user = await users.getUser(token);
  connection.send(JSON.stringify({
      type: 'token',
      token: token,
      color: user.usercolor,
      username: user.username 
  }));
}

async function receiveUserMessage(token, message) {
  const user = await users.getUser(token);
  console.log((new Date()) + ' Received Message from '
              + user.username + ': ' + message);
  
  const obj = {
    text: htmlEntities(message),
    author_name: user.username,
    author_id: token,
    color: user.usercolor,
    date: new Date()
  };
  history.addToHistory(obj);
  
  const json = JSON.stringify({ type:'message', data: obj });
  wss.broadcast(json);
}





 // Broadcast to all.
wss.broadcast = function broadcast(data) {
  wss.clients.forEach(function each(client) {
    if (client._socket.writable) {
      client.send(data);
    }
  });
};




wss.on('connection', async function(connection) {
  console.log((new Date()) + ' Connection accepted.');  
  // send back chat history
  const messageHistory = await history.getHistory();
  if (messageHistory.length > 0) {    
    connection.send(JSON.stringify({ 
      type: 'history', 
      data: messageHistory
    }));
  }
    
  // user sent some message
  connection.on('message', async function(message) {
     const data = JSON.parse(message);     
     if (data.username) {
        addUser(data.username, connection);
      } else if (data.token && !(data.message)) {        
        getUserInfo(data.token, connection)
      } else if (data.token && data.message) {
        receiveUserMessage(data.token, data.message);
      }
  });
  

  
  connection.on('close', function(connection) {
      console.log((new Date()) + " Peer " + connection.remoteAddress + " disconnected.");
  });

  connection.on('error', ({error}) => {
    // Ignore network errors like `ECONNRESET`, `EPIPE`, etc.
    if (!error || error.errno) return;
    throw error;
  });
});


/**
 * Helper function for escaping input strings
 */
function htmlEntities(str) {
  return String(str)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
