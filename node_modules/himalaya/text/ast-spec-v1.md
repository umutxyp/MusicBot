# Himalaya AST Specification - Version 1

This document describes the abstract syntax tree output of Himalaya's parsing.

## Node

```ts
interface Node {
  type: string;
}
```

All nodes are `Node` objects. These object all have a property called `type` indicating the kind of node.

```ts
enum Type {
  "element" | "comment" | "text"
}
```

Nodes can be of `type`:

- `element`, which are tags such as `<body>`, `<div>`, `<style>`

- `comment`, which are `<!-- {...} -->` sections

- `text`, which are text contents

## Element Node

```ts
interface Element extends Node {
  type: "element";
  tagName: string;
  children: [ Node ];
  attributes: [ Attribute ];
}
```

### Attributes

```ts
interface Attribute {
  key: string;
  value: string?;
}
```

A standalone attribute name such as `disabled` has its value set to `null`.

## Comment Node

```ts
interface Comment extends Node {
  type: "comment";
  content: string;
}
```

A `<!-- comment -->` node.

## Text Node

```ts
interface Text extends Node {
  type: "text";
  content: string;
}
```

A `text` node.

## Positions
The parser can be configured to emit line, column, and index numbers for nodes.
The `includePositions: true` parse option adds the `position` field:

```ts
interface Position {
  index: number;
  line: number;
  column: number;
}

interface Node {
  type: string;
  position: {
    start: Position;
    end: Position;
  }
}
```
