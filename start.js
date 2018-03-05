"use strict";
process.title = 'node-chat';

require('./db').Init().then(
    require('./main')
).catch(err => {
  console.log(err);
  process.exit();
});

