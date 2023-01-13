var through = require('through');

module.exports = ReplaceStream;
function ReplaceStream(search, replace, options) {
  var tail = '';
  var totalMatches = 0;
  options = options || {};
  options.limit = options.limit || Infinity;
  options.encoding = options.encoding || 'utf8';
  options.regExpOptions = options.regExpOptions || 'gim';

  var match = permuteMatch(search, options);

  function write(buf) {
    var matches;
    var lastPos = 0;
    var matchCount = 0;
    var rewritten = '';
    var remaining = buf;
    var haystack = tail + buf.toString(options.encoding);
    tail = '';

    while (totalMatches < options.limit &&
          (matches = match.exec(haystack)) !== null) {

      matchCount++;
      var before = haystack.slice(lastPos, matches.index);
      var regexMatch = matches[0];
      lastPos = matches.index + regexMatch.length;

      var dataToAppend = getDataToAppend(before,regexMatch);
      rewritten += dataToAppend;
    }

    if (matchCount)
      remaining = haystack.slice(lastPos, haystack.length);
    else if (tail)
      remaining = haystack;

    var dataToQueue = getDataToQueue(matchCount,remaining,rewritten);
    this.queue(dataToQueue);
  }

  function getDataToAppend(before, match) {
    var dataToAppend = before;

    if (tail)
      dataToAppend = tail + dataToAppend;

    if (match.length < search.length) {
      tail = match;
      return dataToAppend;
    }

    tail = '';
    totalMatches++;
    dataToAppend += replace;

    return dataToAppend;
  }

  function getDataToQueue(matchCount, remaining, rewritten) {
    var dataToQueue = remaining;

    if (matchCount) {

      if ((tail.length + remaining.length) < search.length) {
        tail += remaining;
        return rewritten;
      } 

      dataToQueue = rewritten +tail + remaining;
    } 

    tail = '';
    return dataToQueue;
  }

  function end() {
    if (tail) this.queue(tail);
    this.queue(null);
  }

  var t = through(write, end);
  return t;
}

function escapeRegExp(s) {
    return s.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
}

function permute(s) {
  var ret = [];
  var acc = '';
  for (var i = 0, len = s.length; i < len; i++) {
    acc += s[i];
    ret.push(acc);
  }
  return ret;
}

function permuteMatch(s, options) {
  var match =
    permute(s)
      .map(function (permute, i, arr) {
        return '(' + escapeRegExp(permute) +
          ((i < arr.length - 1) ? '$' : '') + ')';
      })
      .join('|');
  return new RegExp(match, options.regExpOptions);
}
