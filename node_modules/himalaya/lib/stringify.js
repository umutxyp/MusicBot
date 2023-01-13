'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.formatAttributes = formatAttributes;
exports.toHTML = toHTML;

var _compat = require('./compat');

function formatAttributes(attributes) {
  return attributes.reduce(function (attrs, attribute) {
    var key = attribute.key,
        value = attribute.value;

    if (value === null) {
      return attrs + ' ' + key;
    }
    var quoteEscape = value.indexOf('\'') !== -1;
    var quote = quoteEscape ? '"' : '\'';
    return attrs + ' ' + key + '=' + quote + value + quote;
  }, '');
}

function toHTML(tree, options) {
  return tree.map(function (node) {
    if (node.type === 'text') {
      return node.content;
    }
    if (node.type === 'comment') {
      return '<!--' + node.content + '-->';
    }
    var tagName = node.tagName,
        attributes = node.attributes,
        children = node.children;

    var isSelfClosing = (0, _compat.arrayIncludes)(options.voidTags, tagName.toLowerCase());
    return isSelfClosing ? '<' + tagName + formatAttributes(attributes) + '>' : '<' + tagName + formatAttributes(attributes) + '>' + toHTML(children, options) + '</' + tagName + '>';
  }).join('');
}

exports.default = { toHTML: toHTML };
//# sourceMappingURL=stringify.js.map
