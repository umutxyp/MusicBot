/*
  We don't want to include babel-polyfill in our project.
    - Library authors should be using babel-runtime for non-global polyfilling
    - Adding babel-polyfill/-runtime increases bundle size significantly

  We will include our polyfill instance methods as regular functions.
*/

export function startsWith (str, searchString, position) {
  return str.substr(position || 0, searchString.length) === searchString
}

export function endsWith (str, searchString, position) {
  const index = (position || str.length) - searchString.length
  const lastIndex = str.lastIndexOf(searchString, index)
  return lastIndex !== -1 && lastIndex === index
}

export function stringIncludes (str, searchString, position) {
  return str.indexOf(searchString, position || 0) !== -1
}

export function isRealNaN (x) {
  return typeof x === 'number' && isNaN(x)
}

export function arrayIncludes (array, searchElement, position) {
  const len = array.length
  if (len === 0) return false

  const lookupIndex = position | 0
  const isNaNElement = isRealNaN(searchElement)
  let searchIndex = lookupIndex >= 0 ? lookupIndex : len + lookupIndex
  while (searchIndex < len) {
    const element = array[searchIndex++]
    if (element === searchElement) return true
    if (isNaNElement && isRealNaN(element)) return true
  }

  return false
}
