import {
  startsWith,
  endsWith,
  stringIncludes,
  arrayIncludes
} from './compat'

export function feedPosition (position, str, len) {
  const start = position.index
  const end = position.index = start + len
  for (let i = start; i < end; i++) {
    const char = str.charAt(i)
    if (char === '\n') {
      position.line++
      position.column = 0
    } else {
      position.column++
    }
  }
}

export function jumpPosition (position, str, end) {
  const len = end - position.index
  return feedPosition(position, str, len)
}

export function makeInitialPosition () {
  return {
    index: 0,
    column: 0,
    line: 0
  }
}

export function copyPosition (position) {
  return {
    index: position.index,
    line: position.line,
    column: position.column
  }
}

export default function lexer (str, options) {
  const state = {
    str,
    options,
    position: makeInitialPosition(),
    tokens: []
  }
  lex(state)
  return state.tokens
}

export function lex (state) {
  const {str, options: {childlessTags}} = state
  const len = str.length
  while (state.position.index < len) {
    const start = state.position.index
    lexText(state)
    if (state.position.index === start) {
      const isComment = startsWith(str, '!--', start + 1)
      if (isComment) {
        lexComment(state)
      } else {
        const tagName = lexTag(state)
        const safeTag = tagName.toLowerCase()
        if (arrayIncludes(childlessTags, safeTag)) {
          lexSkipTag(tagName, state)
        }
      }
    }
  }
}

const alphanumeric = /[A-Za-z0-9]/
export function findTextEnd (str, index) {
  while (true) {
    const textEnd = str.indexOf('<', index)
    if (textEnd === -1) {
      return textEnd
    }
    const char = str.charAt(textEnd + 1)
    if (char === '/' || char === '!' || alphanumeric.test(char)) {
      return textEnd
    }
    index = textEnd + 1
  }
}

export function lexText (state) {
  const type = 'text'
  const {str, position} = state
  let textEnd = findTextEnd(str, position.index)
  if (textEnd === position.index) return
  if (textEnd === -1) {
    textEnd = str.length
  }

  const start = copyPosition(position)
  const content = str.slice(position.index, textEnd)
  jumpPosition(position, str, textEnd)
  const end = copyPosition(position)
  state.tokens.push({type, content, position: {start, end}})
}

export function lexComment (state) {
  const {str, position} = state
  const start = copyPosition(position)
  feedPosition(position, str, 4) // "<!--".length
  let contentEnd = str.indexOf('-->', position.index)
  let commentEnd = contentEnd + 3 // "-->".length
  if (contentEnd === -1) {
    contentEnd = commentEnd = str.length
  }

  const content = str.slice(position.index, contentEnd)
  jumpPosition(position, str, commentEnd)
  state.tokens.push({
    type: 'comment',
    content,
    position: {
      start,
      end: copyPosition(position)
    }
  })
}

export function lexTag (state) {
  const {str, position} = state
  {
    const secondChar = str.charAt(position.index + 1)
    const close = secondChar === '/'
    const start = copyPosition(position)
    feedPosition(position, str, close ? 2 : 1)
    state.tokens.push({type: 'tag-start', close, position: {start}})
  }
  const tagName = lexTagName(state)
  lexTagAttributes(state)
  {
    const firstChar = str.charAt(position.index)
    const close = firstChar === '/'
    feedPosition(position, str, close ? 2 : 1)
    const end = copyPosition(position)
    state.tokens.push({type: 'tag-end', close, position: {end}})
  }
  return tagName
}

// See https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions#special-white-space
const whitespace = /\s/
export function isWhitespaceChar (char) {
  return whitespace.test(char)
}

export function lexTagName (state) {
  const {str, position} = state
  const len = str.length
  let start = position.index
  while (start < len) {
    const char = str.charAt(start)
    const isTagChar = !(isWhitespaceChar(char) || char === '/' || char === '>')
    if (isTagChar) break
    start++
  }

  let end = start + 1
  while (end < len) {
    const char = str.charAt(end)
    const isTagChar = !(isWhitespaceChar(char) || char === '/' || char === '>')
    if (!isTagChar) break
    end++
  }

  jumpPosition(position, str, end)
  const tagName = str.slice(start, end)
  state.tokens.push({
    type: 'tag',
    content: tagName
  })
  return tagName
}

export function lexTagAttributes (state) {
  const {str, position, tokens} = state
  let cursor = position.index
  let quote = null // null, single-, or double-quote
  let wordBegin = cursor // index of word start
  const words = [] // "key", "key=value", "key='value'", etc
  const len = str.length
  while (cursor < len) {
    const char = str.charAt(cursor)
    if (quote) {
      const isQuoteEnd = char === quote
      if (isQuoteEnd) {
        quote = null
      }
      cursor++
      continue
    }

    const isTagEnd = char === '/' || char === '>'
    if (isTagEnd) {
      if (cursor !== wordBegin) {
        words.push(str.slice(wordBegin, cursor))
      }
      break
    }

    const isWordEnd = isWhitespaceChar(char)
    if (isWordEnd) {
      if (cursor !== wordBegin) {
        words.push(str.slice(wordBegin, cursor))
      }
      wordBegin = cursor + 1
      cursor++
      continue
    }

    const isQuoteStart = char === '\'' || char === '"'
    if (isQuoteStart) {
      quote = char
      cursor++
      continue
    }

    cursor++
  }
  jumpPosition(position, str, cursor)

  const wLen = words.length
  const type = 'attribute'
  for (let i = 0; i < wLen; i++) {
    const word = words[i]
    const isNotPair = word.indexOf('=') === -1
    if (isNotPair) {
      const secondWord = words[i + 1]
      if (secondWord && startsWith(secondWord, '=')) {
        if (secondWord.length > 1) {
          const newWord = word + secondWord
          tokens.push({type, content: newWord})
          i += 1
          continue
        }
        const thirdWord = words[i + 2]
        i += 1
        if (thirdWord) {
          const newWord = word + '=' + thirdWord
          tokens.push({type, content: newWord})
          i += 1
          continue
        }
      }
    }
    if (endsWith(word, '=')) {
      const secondWord = words[i + 1]
      if (secondWord && !stringIncludes(secondWord, '=')) {
        const newWord = word + secondWord
        tokens.push({type, content: newWord})
        i += 1
        continue
      }

      const newWord = word.slice(0, -1)
      tokens.push({type, content: newWord})
      continue
    }

    tokens.push({type, content: word})
  }
}

const push = [].push

export function lexSkipTag (tagName, state) {
  const {str, position, tokens} = state
  const safeTagName = tagName.toLowerCase()
  const len = str.length
  let index = position.index
  while (index < len) {
    const nextTag = str.indexOf('</', index)
    if (nextTag === -1) {
      lexText(state)
      break
    }

    const tagStartPosition = copyPosition(position)
    jumpPosition(tagStartPosition, str, nextTag)
    const tagState = {str, position: tagStartPosition, tokens: []}
    const name = lexTag(tagState)
    if (safeTagName !== name.toLowerCase()) {
      index = tagState.position.index
      continue
    }

    if (nextTag !== position.index) {
      const textStart = copyPosition(position)
      jumpPosition(position, str, nextTag)
      tokens.push({
        type: 'text',
        content: str.slice(textStart.index, nextTag),
        position: {
          start: textStart,
          end: copyPosition(position)
        }
      })
    }

    push.apply(tokens, tagState.tokens)
    jumpPosition(position, str, tagState.position.index)
    break
  }
}
