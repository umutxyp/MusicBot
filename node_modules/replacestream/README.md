# replacestream

A node.js through stream that does basic streaming text search and replace and
is chunk boundary friendly.

[![build status](https://secure.travis-ci.org/eugeneware/replacestream.png)](http://travis-ci.org/eugeneware/replacestream)

## Installation

Install via npm:

``` shell
$ npm install replacestream
```

## Examples

### Search and replace over a test file

Say we want to do a search and replace over the following file:

```
// happybirthday.txt
Happy birthday to you!
Happy birthday to you!
Happy birthday to dear Liza!
Happy birthday to you!
```

``` js
var replaceStream = require('replacestream')
  , fs = require('fs')
  , path = require('path');

// Replace all the instances of 'birthday' with 'earthday'
fs.createReadStream(path.join(__dirname, 'happybirthday.txt'))
  .pipe(replaceStream('birthday', 'earthday'))
  .pipe(process.stdout);
```

Running this will print out:

```
$ node simple.js
Happy earthday to you!
Happy earthday to you!
Happy earthday to dear Liza!
Happy earthday to you!
```

You can also limit the number of replaces to first ```n```:

``` js
// Replace the first 2 of the instances of 'birthday' with 'earthday'
fs.createReadStream(path.join(__dirname, 'happybirthday.txt'))
  .pipe(replaceStream('birthday', 'earthday', { limit: 2 } ))
  .pipe(process.stdout);
```

Which would output:

```
$ node simple.js
Happy earthday to you!
Happy earthday to you!
Happy birthday to dear Liza!
Happy birthday to you!
```

### Web server search and replace over a test file

Here's the same example, but kicked off from a HTTP server:

``` js
// server.js
var http = require('http')
  , fs = require('fs')
  , path = require('path')
  , replaceStream = require('replacestream');

var app = function (req, res) {
  if (req.url.match(/^\/happybirthday\.txt$/)) {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    fs.createReadStream(path.join(__dirname, 'happybirthday.txt'))
      .pipe(replaceStream('birthday', 'earthday'))
      .pipe(res);
  } else {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('File not found');
  }
};
var server = http.createServer(app).listen(3000);
```

When you request the file:
```
$ curl -i "http://localhost:3000/happybirthday.txt"
HTTP/1.1 200 OK
Content-Type: text/plain
Date: Mon, 08 Jul 2013 06:45:21 GMT
Connection: keep-alive
Transfer-Encoding: chunked

Happy earthday to you!
Happy earthday to you!
Happy earthday to dear Liza!
Happy earthday to you!
```

NB: If your readable Stream that you're piping through the `replacestream` is
paused, then you may have to call the `.resume()` method on it.

### Changing the encoding

You can also change the text encoding of the search and replace by setting an
encoding property on the options object:

``` js
// Replace the first 2 of the instances of 'birthday' with 'earthday'
fs.createReadStream(path.join(__dirname, 'happybirthday.txt'))
  .pipe(replaceStream('birthday', 'earthday', { limit: 2, encoding: 'ascii' } ))
  .pipe(process.stdout);
```

By default the encoding will be set to 'utf8'.
