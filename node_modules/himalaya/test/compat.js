import test from 'ava'
import {
  startsWith,
  endsWith,
  stringIncludes,
  arrayIncludes
} from '../lib/compat'

test('startsWith() should pass simple cases', t => {
  const str = 'To be, or not to be, that is the question.'
  t.is(startsWith(str, 'To be'), true)
  t.is(startsWith(str, 'not to be'), false)
  t.is(startsWith(str, 'not to be', 10), true)
})

test('endsWith() should pass simple cases', t => {
  const str = 'To be, or not to be, that is the question.'
  t.is(endsWith(str, 'question.'), true)
  t.is(endsWith(str, 'to be'), false)
  t.is(endsWith(str, 'to be', 19), true)
})

test('stringIncludes() should pass simple cases', t => {
  const str = 'To be, or not to be, that is the question.'
  t.is(stringIncludes(str, 'To be'), true)
  t.is(stringIncludes(str, 'question'), true)
  t.is(stringIncludes(str, 'nonexistent'), false)
  t.is(stringIncludes(str, 'To be', 1), false)
  t.is(stringIncludes(str, 'TO BE'), false)
})

test('arrayIncludes() should pass simple cases', t => {
  t.is(arrayIncludes([1, 2, 3], 2), true)
  t.is(arrayIncludes([1, 2, 3], 4), false)
  t.is(arrayIncludes([1, 2, 3], 3, 3), false)
  t.is(arrayIncludes([1, 2, 3], 3, -1), true)
  t.is(arrayIncludes([1, 2, NaN], NaN), true)

  t.is(arrayIncludes(['tag', 'name', 'test'], 'test'), true)
  t.is(arrayIncludes(['tag', 'name', 'test'], 'name'), true)
  t.is(arrayIncludes(['tag', 'name', 'test'], 'none'), false)
})
