'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.splitHead = splitHead;
exports.unquote = unquote;
exports.format = format;
exports.formatAttributes = formatAttributes;
function splitHead(str, sep) {
  var idx = str.indexOf(sep);
  if (idx === -1) return [str];
  return [str.slice(0, idx), str.slice(idx + sep.length)];
}

function unquote(str) {
  var car = str.charAt(0);
  var end = str.length - 1;
  var isQuoteStart = car === '"' || car === "'";
  if (isQuoteStart && car === str.charAt(end)) {
    return str.slice(1, end);
  }
  return str;
}

function format(nodes, options) {
  return nodes.map(function (node) {
    var type = node.type;
    var outputNode = type === 'element' ? {
      type: type,
      tagName: node.tagName.toLowerCase(),
      attributes: formatAttributes(node.attributes),
      children: format(node.children, options)
    } : { type: type, content: node.content };
    if (options.includePositions) {
      outputNode.position = node.position;
    }
    return outputNode;
  });
}

function formatAttributes(attributes) {
  return attributes.map(function (attribute) {
    var parts = splitHead(attribute.trim(), '=');
    var key = parts[0];
    var value = typeof parts[1] === 'string' ? unquote(parts[1]) : null;
    return { key: key, value: value };
  });
}
//# sourceMappingURL=format.js.map
