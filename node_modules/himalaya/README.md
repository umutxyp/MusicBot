# Himalaya

> Parse HTML into JSON

[![npm](https://img.shields.io/npm/v/himalaya.svg)](https://www.npmjs.com/package/himalaya)
[![Build Status](https://travis-ci.org/andrejewski/himalaya.svg?branch=master)](https://travis-ci.org/andrejewski/himalaya)
[![Coverage Status](https://coveralls.io/repos/github/andrejewski/himalaya/badge.svg?branch=master)](https://coveralls.io/github/andrejewski/himalaya?branch=master)
[![Greenkeeper badge](https://badges.greenkeeper.io/andrejewski/himalaya.svg)](https://greenkeeper.io/)

[Try online 🚀](http://andrejewski.github.io/himalaya)
|
[Read the specification 📖](https://github.com/andrejewski/himalaya/blob/master/text/ast-spec-v1.md)

## Usage

### Node
```bash
npm install himalaya
```

```js
import fs from 'fs'
import {parse} from 'himalaya'
const html = fs.readFileSync('/webpage.html', {encoding: 'utf8'})
const json = parse(html)
console.log('👉', json)
```

### Browser
Download [himalaya.js](https://github.com/andrejewski/himalaya/blob/master/docs/dist/himalaya.js) and put it in a `<script>` tag. Himalaya will be accessible from `window.himalaya`.

```js
const html = '<div>Hello world</div>'
const json = window.himalaya.parse(html)
console.log('👉', json)
```

Himalaya bundles well with Browersify and Webpack.

## Example Input/Output

```html
<div class='post post-featured'>
  <p>Himalaya parsed me...</p>
  <!-- ...and I liked it. -->
</div>
```

```js
[{
  type: 'element',
  tagName: 'div',
  attributes: [{
    key: 'class',
    value: 'post post-featured'
  }],
  children: [{
    type: 'element',
    tagName: 'p',
    attributes: [],
    children: [{
      type: 'text',
      content: 'Himalaya parsed me...'
    }]
  }, {
    type: 'comment',
    content: ' ...and I liked it. '
  }]
}]
```

*Note:* In this example, text nodes consisting of whitespace are not shown for readability.

## Features

### Synchronous
Himalaya transforms HTML into JSON, that's it. Himalaya is synchronous and does not require any complicated callbacks.

### Handles Weirdness
Himalaya handles a lot of HTML's fringe cases, like:
- Closes unclosed tags `<p><b>...</p>`
- Ignores extra closing tags `<span>...</b></span>`
- Properly handles void tags like `<meta>` and `<img>`
- Properly handles self-closing tags like `<input/>`
- Handles `<!doctype>` and `<-- comments -->`
- Does not parse the contents of `<script>`, `<style>`, and HTML5 `<template>` tags

### Preserves Whitespace
Himalaya does not cut corners and returns an accurate representation of the HTML supplied. To remove whitespace, post-process the JSON; check out [an example script](https://gist.github.com/andrejewski/773487d4f4a46b16865405d7b74eabf9).

### Line, column, and index positions
Himalaya can include the start and end positions of nodes in the parse output.
To enable this, you can pass `parse` the `parseDefaults` extended with `includePositions: true`:

```js
import { parse, parseDefaults } from 'himalaya'
parse('<img>', { ...parseDefaults, includePositions: true })
/* =>
[
  {
    "type": "element",
    "tagName": "img",
    "attributes": [],
    "children": [],
    "position": {
      "start": {
        "index": 0,
        "line": 0,
        "column": 0
      },
      "end": {
        "index": 5,
        "line": 0,
        "column": 5
      }
    }
  }
]
*/
```

## Going back to HTML
Himalaya provides a `stringify` method. The following example parses the HTML to JSON then parses the JSON back into HTML.

```js
import fs from 'fs'
import {parse, stringify} from 'himalaya'

const html = fs.readFileSync('/webpage.html', {encoding: 'utf8'})
const json = parse(html)
fs.writeFileSync('/webpage.html', stringify(json))
```

## Why "Himalaya"?

[First, my friends weren't helpful.](https://twitter.com/compooter/status/597908517132042240) Except Josh, Josh had my back.

While I was testing the parser, I threw a download of my Twitter homepage in and got a giant JSON blob out. My code editor Sublime Text has a mini-map and looking at it sideways the data looked like a never-ending mountain range. Also, "himalaya" has H, M, L in it.
