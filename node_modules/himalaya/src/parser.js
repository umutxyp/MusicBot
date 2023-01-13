import {arrayIncludes} from './compat'

export default function parser (tokens, options) {
  const root = {tagName: null, children: []}
  const state = {tokens, options, cursor: 0, stack: [root]}
  parse(state)
  return root.children
}

export function hasTerminalParent (tagName, stack, terminals) {
  const tagParents = terminals[tagName]
  if (tagParents) {
    let currentIndex = stack.length - 1
    while (currentIndex >= 0) {
      const parentTagName = stack[currentIndex].tagName
      if (parentTagName === tagName) {
        break
      }
      if (arrayIncludes(tagParents, parentTagName)) {
        return true
      }
      currentIndex--
    }
  }
  return false
}

export function rewindStack (stack, newLength, childrenEndPosition, endPosition) {
  stack[newLength].position.end = endPosition
  for (let i = newLength + 1, len = stack.length; i < len; i++) {
    stack[i].position.end = childrenEndPosition
  }
  stack.splice(newLength)
}

export function parse (state) {
  const {tokens, options} = state
  let {stack} = state
  let nodes = stack[stack.length - 1].children
  const len = tokens.length
  let {cursor} = state
  while (cursor < len) {
    const token = tokens[cursor]
    if (token.type !== 'tag-start') {
      nodes.push(token)
      cursor++
      continue
    }

    const tagToken = tokens[++cursor]
    cursor++
    const tagName = tagToken.content.toLowerCase()
    if (token.close) {
      let index = stack.length
      let shouldRewind = false
      while (--index > -1) {
        if (stack[index].tagName === tagName) {
          shouldRewind = true
          break
        }
      }
      while (cursor < len) {
        const endToken = tokens[cursor]
        if (endToken.type !== 'tag-end') break
        cursor++
      }
      if (shouldRewind) {
        rewindStack(stack, index, token.position.start, tokens[cursor - 1].position.end)
        break
      } else {
        continue
      }
    }

    const isClosingTag = arrayIncludes(options.closingTags, tagName)
    let shouldRewindToAutoClose = isClosingTag
    if (shouldRewindToAutoClose) {
      const { closingTagAncestorBreakers: terminals } = options
      shouldRewindToAutoClose = !hasTerminalParent(tagName, stack, terminals)
    }

    if (shouldRewindToAutoClose) {
      // rewind the stack to just above the previous
      // closing tag of the same name
      let currentIndex = stack.length - 1
      while (currentIndex > 0) {
        if (tagName === stack[currentIndex].tagName) {
          rewindStack(stack, currentIndex, token.position.start, token.position.start)
          const previousIndex = currentIndex - 1
          nodes = stack[previousIndex].children
          break
        }
        currentIndex = currentIndex - 1
      }
    }

    let attributes = []
    let attrToken
    while (cursor < len) {
      attrToken = tokens[cursor]
      if (attrToken.type === 'tag-end') break
      attributes.push(attrToken.content)
      cursor++
    }

    cursor++
    const children = []
    const position = {
      start: token.position.start,
      end: attrToken.position.end
    }
    const elementNode = {
      type: 'element',
      tagName: tagToken.content,
      attributes,
      children,
      position
    }
    nodes.push(elementNode)

    const hasChildren = !(attrToken.close || arrayIncludes(options.voidTags, tagName))
    if (hasChildren) {
      const size = stack.push({tagName, children, position})
      const innerState = {tokens, options, cursor, stack}
      parse(innerState)
      cursor = innerState.cursor
      const rewoundInElement = stack.length === size
      if (rewoundInElement) {
        elementNode.position.end = tokens[cursor - 1].position.end
      }
    }
  }
  state.cursor = cursor
}
