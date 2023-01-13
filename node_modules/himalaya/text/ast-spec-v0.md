# Himalaya AST Specification - Version 0

This document describes the abstract syntax tree output of Himalaya's parsing. This specification aims to provide context as to what may be expected as valid output from Himalaya.

## Node

```js
interface Node {
	type: string;
}
```

All nodes are represented as `Node` objects. These object all have a property called `type` that designate what type of node it is.

```js
enum Type {
	"Element" | "Comment" | "Text"
}
```

Nodes can be of `type`:

- `Element`, which are tags such as `<body>`, `<div>`, `<style>`

- `Comment`, which are `<!-- {...} -->` sections

- `Text`, which are text contents

## Element Node

```js
interface Element <: Node {
	type: "Element";
	tagName: string;
	attributes: Attributes;
}
```

All element nodes have a `tagName` and `attributes` property. These nodes also have some optional properties:

- `children: [ Node ];` Element nodes can have child nodes of any type.

- `content: string;` Elements that do not have their contents parsed (i.e. `script` and `style` tags) will have their content placed in this property.

### Attributes

```js
interface Attributes <: Object {}
```

Attributes is a dictionary of keys and their values. All keys are strings and values can be strings, numbers, or objects. When they are objects, they must be one of the parsed sub-properties:

- `dataset: object;` If the element has any `data-*` attributes, they will be placed in this property.

- `style: object;` If the element has any `style` value declarations, they will be placed in this property.

Note: the attribute `class` is changed to `className`.

## Comment Node

```js
interface Comment <: Node {
	type: "Comment";
	content: string;
}
```

A `<!-- comment -->` node.

## Text Node

```js
interface Text <: Node {
	type: "Text";
	content: string;
}
```

A `text` node.
