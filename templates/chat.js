$(function () {
    "use strict";
    // for better performance - to avoid searching in DOM
    var content = $('#content');
    var input = $('#input');
    var status = $('#status');
    let username = false;
    let usercolor = false;
    // if user is running mozilla then use it's built-in WebSocket
    window.WebSocket = window.WebSocket || window.MozWebSocket;
    // if browser doesn't support WebSocket, just show
    // some notification and exit
    if (!window.WebSocket) {
      content.html($('<p>',
        { text:'Sorry, but your browser doesn\'t support WebSocket.'}
      ));
      input.hide();
      $('span').hide();
      return;
    }
    // open connection
    var connection = new WebSocket('ws://127.0.0.1:1338');
    connection.onopen = function () {
        console.log('OPEN');
      // first we want users to enter their names
      input.removeAttr('disabled');
      console.log(localStorage['token']);
      if (localStorage['token']) {
        console.log(localStorage['token']);
        console.log(JSON.stringify({token:localStorage['token']}));
        connection.send(JSON.stringify({token:localStorage['token']}));
      } else {
        status.text('Choose name:');
        input.val('');
      }       
    };
    connection.onerror = function (error) {
      // just in there were some problems with connection...
      content.html($('<p>', {
        text: 'Sorry, but there\'s some problem with your '
           + 'connection or the server is down.'
      }));
    };
    // most important part - incoming messages
    connection.onmessage = function (message) {
      // try to parse JSON message. Because we know that the server
      // always returns JSON this should work without any problem but
      // we should make sure that the massage is not chunked or
      // otherwise damaged.
      try {
        var json = JSON.parse(message.data);
        console.log(json);
      } catch (e) {
        console.log('Invalid JSON: ', message.data);
        return;
      }
      // NOTE: if you're not sure about the JSON structure
      // check the server source code above
      // first response from the server with user's color
      if (json.type === 'token') { 
        localStorage['token'] = json.token;
        status.text(json.username + ': ').css('color', json.usercolor);
        input.removeAttr('disabled').focus();
        input.val('');
        // from now user can start sending messages
      } else if (json.type === 'history') { // entire message history
        // insert every single message to the chat window
        for (var i=0; i < json.data.length; i++) {
        console.log(json.data);
        addMessage(json.data[i].author_name, json.data[i].text,
            json.data[i].color, new Date(json.data[i].date));
        }
      } else if (json.type === 'message') { // it's a single message
        // let the user write another message
        input.removeAttr('disabled'); 
        console.log(json.data);
        addMessage(json.data.author_name, json.data.text,
                   json.data.color, new Date(json.data.date));        
      } else {
        console.log('Hmm..., I\'ve never seen JSON like this:', json);
      }
    };
    /**
     * Send message when user presses Enter key
     */
    input.keydown(function(e) {
      if (e.keyCode === 13) {
        var msg = $(this).val();
        if (!msg) {
          return;
        }
        if (!localStorage['token']) {
            connection.send(JSON.stringify({username:msg}));
        } else {
            // send the message as an ordinary text
            connection.send(JSON.stringify({
                token:localStorage['token'], 
                message:msg
            }));
        }        
        $(this).val('');
        // disable the input field to make the user wait until server
        // sends back response
        input.attr('disabled', 'disabled');
      }
    });
    /**
     * This method is optional. If the server wasn't able to
     * respond to the in 3 seconds then show some error message 
     * to notify the user that something is wrong.
     */
    setInterval(function() {
      if (connection.readyState !== 1) {
        console.log('Unable to communicate with the WebSocket server');
        status.text('Error');
        input.attr('disabled', 'disabled').val(
            'Unable to communicate with the WebSocket server.');
      }
    }, 3000);
    /**
     * Add message to the chat window
     */
    function addMessage(author, message, color, dt) {
      content.prepend('<p><span style="color:' + color + '">'
          + author + '</span> @ ' + (dt.getHours() < 10 ? '0'
          + dt.getHours() : dt.getHours()) + ':'
          + (dt.getMinutes() < 10
            ? '0' + dt.getMinutes() : dt.getMinutes())
          + ': ' + message + '</p>');
    }
  });