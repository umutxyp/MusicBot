var replaceStream = require('replacestream')
  , fs = require('fs')
  , path = require('path');

// Replace all the instances of 'birthday' with 'earthday'
fs.createReadStream(path.join(__dirname, 'happybirthday.txt'))
  .pipe(replaceStream('birthday', 'earthday'))
  .pipe(process.stdout);

/* Prints to the console
Happy earthday to you!
Happy earthday to you!
Happy earthday to dear Liza!
Happy earthday to you!
*/

// Replace the first 2 of the instances of 'birthday' with 'earthday'
fs.createReadStream(path.join(__dirname, 'happybirthday.txt'))
  .pipe(replaceStream('birthday', 'earthday', { limit: 2 } ))
  .pipe(process.stdout);

/*
Happy earthday to you!
Happy earthday to you!
Happy birthday to dear Liza!
Happy birthday to you!
*/
