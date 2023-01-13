import test from 'ava'
import parser from '../lib/parser'
import lexer from '../lib/lexer'

function ps (index) {
  return { index, line: 0, column: index }
}

const lexerOptions = { childlessTags: [] }
const parserOptions = {
  voidTags: [],
  closingTags: [],
  closingTagAncestorBreakers: {}
}

test('parser() should return nodes', t => {
  const str = '<h1>Hello world</h1>'
  const tokens = lexer(str, lexerOptions)
  const nodes = parser(tokens, parserOptions)
  t.deepEqual(nodes, [
    {
      type: 'element',
      tagName: 'h1',
      attributes: [],
      children: [
        {
          type: 'text',
          content: 'Hello world',
          position: {
            start: ps(4),
            end: ps(15)
          }
        }
      ],
      position: {
        start: ps(0),
        end: ps(str.length)
      }
    }
  ])
})

test('parser() should not nest within void tags', t => {
  const str = '<div>abc<img/>def</div>'
  const tokens = lexer(str, lexerOptions)
  const nodes = parser(tokens, { voidTags: 'img', closingTags: [] })
  t.deepEqual(nodes, [
    {
      type: 'element',
      tagName: 'div',
      attributes: [],
      children: [
        {
          type: 'text',
          content: 'abc',
          position: {
            start: ps(5),
            end: ps(8)
          }
        },
        {
          type: 'element',
          tagName: 'img',
          attributes: [],
          children: [],
          position: {
            start: ps(8),
            end: ps(14)
          }
        },
        {
          type: 'text',
          content: 'def',
          position: {
            start: ps(14),
            end: ps(17)
          }
        }
      ],
      position: {
        start: ps(0),
        end: ps(str.length)
      }
    }
  ])
})

test('parser() should handle optional-close tags', t => {
  {
    const parserOptions = {
      voidTags: [],
      closingTags: ['p'],
      closingTagAncestorBreakers: {}
    }
    const str = '<p>This is one<p>This is two</p>'
    const tokens = lexer(str, lexerOptions)
    const nodes = parser(tokens, parserOptions)
    t.deepEqual(nodes, [
      {
        type: 'element',
        tagName: 'p',
        attributes: [],
        children: [
          {
            type: 'text',
            content: 'This is one',
            position: {
              start: ps(3),
              end: ps(14)
            }
          }
        ],
        position: {
          start: ps(0),
          end: ps(14)
        }
      },
      {
        type: 'element',
        tagName: 'p',
        attributes: [],
        children: [
          {
            type: 'text',
            content: 'This is two',
            position: {
              start: ps(17),
              end: ps(28)
            }
          }
        ],
        position: {
          start: ps(14),
          end: ps(str.length)
        }
      }
    ])
  }

  {
    const parserOptions = {
      voidTags: [],
      closingTags: ['p', 'span'],
      closingTagAncestorBreakers: {}
    }
    const str = '<p>This is one <span>okay<p>This is two</p>'
    const tokens = lexer(str, lexerOptions)
    const nodes = parser(tokens, parserOptions)
    t.deepEqual(nodes, [
      {
        type: 'element',
        tagName: 'p',
        attributes: [],
        children: [
          {
            type: 'text',
            content: 'This is one ',
            position: {
              start: ps(3),
              end: ps(15)
            }
          },
          {
            type: 'element',
            tagName: 'span',
            attributes: [],
            children: [
              {
                type: 'text',
                content: 'okay',
                position: {
                  start: ps(21),
                  end: ps(25)
                }
              }
            ],
            position: {
              start: ps(15),
              end: ps(25)
            }
          }
        ],
        position: {
          start: ps(0),
          end: ps(25)
        }
      },
      {
        type: 'element',
        tagName: 'p',
        attributes: [],
        children: [
          {
            type: 'text',
            content: 'This is two',
            position: {
              start: ps(28),
              end: ps(39)
            }
          }
        ],
        position: {
          start: ps(25),
          end: ps(43)
        }
      }
    ])
  }
})

test('parser() should auto-close unmatched child tags', t => {
  const parserOptions = {
    voidTags: [],
    closingTags: [],
    closingTagAncestorBreakers: {}
  }
  const str = '<div>This is <b>one <span>okay</div>'
  const tokens = lexer(str, lexerOptions)
  const nodes = parser(tokens, parserOptions)
  t.deepEqual(nodes, [
    {
      type: 'element',
      tagName: 'div',
      attributes: [],
      position: {
        start: ps(0),
        end: ps(36)
      },
      children: [
        {
          type: 'text',
          content: 'This is ',
          position: {
            start: ps(5),
            end: ps(13)
          }
        },
        {
          type: 'element',
          tagName: 'b',
          attributes: [],
          position: {
            start: ps(13),
            end: ps(30)
          },
          children: [
            {
              type: 'text',
              content: 'one ',
              position: {
                start: ps(16),
                end: ps(20)
              }
            },
            {
              type: 'element',
              tagName: 'span',
              attributes: [],
              position: {
                start: ps(20),
                end: ps(30)
              },
              children: [
                {
                  type: 'text',
                  content: 'okay',
                  position: {
                    start: ps(26),
                    end: ps(30)
                  }
                }
              ]
            }
          ]
        }
      ]
    }
  ])
})

test('parser() should handle empty token arrays', t => {
  const tokens = []
  const nodes = parser(tokens, parserOptions)
  t.deepEqual(nodes, [])
})

test('parser() should report the element attributes', t => {
  const str = '<div class="cake" data-key="abc" disabled></div>'
  const tokens = lexer(str, lexerOptions)
  const nodes = parser(tokens, parserOptions)
  t.deepEqual(nodes, [
    {
      type: 'element',
      tagName: 'div',
      attributes: ['class="cake"', 'data-key="abc"', 'disabled'],
      position: {
        start: ps(0),
        end: ps(48)
      },
      children: []
    }
  ])
})

test('parser() should handle unclosed elements', t => {
  const str = '<div>abc'
  const tokens = lexer(str, lexerOptions)
  const nodes = parser(tokens, parserOptions)
  t.deepEqual(nodes, [
    {
      type: 'element',
      tagName: 'div',
      attributes: [],
      position: {
        start: ps(0),
        end: ps(str.length)
      },
      children: [
        {
          type: 'text',
          content: 'abc',
          position: {
            start: ps(5),
            end: ps(str.length)
          }
        }
      ]
    }
  ])
})

test('parser() should preserve case-sensitive tag names', t => {
  const str = '<You-Know-8>'
  const tokens = lexer(str, lexerOptions)
  const nodes = parser(tokens, parserOptions)
  t.deepEqual(nodes, [
    {
      type: 'element',
      tagName: 'You-Know-8',
      attributes: [],
      position: {
        start: ps(0),
        end: ps(str.length)
      },
      children: []
    }
  ])
})

test('parser() should match by case-insensitive tags', t => {
  const str = '<div>abc</DIV>def'
  const tokens = lexer(str, lexerOptions)
  const nodes = parser(tokens, parserOptions)
  t.deepEqual(nodes, [
    {
      type: 'element',
      tagName: 'div',
      attributes: [],
      position: {
        start: ps(0),
        end: ps(14)
      },
      children: [
        {
          type: 'text',
          content: 'abc',
          position: {
            start: ps(5),
            end: ps(8)
          }
        }
      ]
    },
    {
      type: 'text',
      content: 'def',
      position: {
        start: ps(14),
        end: ps(17)
      }
    }
  ])
})

test('parser() should handle ancestor breaker special case (#39)', t => {
  /*
    To summarize, this special case is where a <ul|ol|menu> is
    encountered within an <li>. The default behavior for <li>s
    as closing tags is to rewind up and auto-close the previous
    <li>. However, <li> may contain <ul|ol|menu> before being
    closed so we should not rewind the stack in those cases.

    This edge-case also applies to <dt|dd> in <dl>s.
  */

  {
    const str = '<ul><li>abc<ul><li>def</li></ul></li></ul>'
    const tokens = lexer(str, lexerOptions)
    const nodes = parser(tokens, {
      voidTags: [],
      closingTags: ['li'],
      closingTagAncestorBreakers: {
        li: ['ul']
      }
    })

    t.deepEqual(nodes, [
      {
        type: 'element',
        tagName: 'ul',
        attributes: [],
        position: {
          start: ps(0),
          end: ps(42)
        },
        children: [
          {
            type: 'element',
            tagName: 'li',
            attributes: [],
            position: {
              start: ps(4),
              end: ps(37)
            },
            children: [
              {
                type: 'text',
                content: 'abc',
                position: {
                  start: ps(8),
                  end: ps(11)
                }
              },
              {
                type: 'element',
                tagName: 'ul',
                attributes: [],
                position: {
                  start: ps(11),
                  end: ps(32)
                },
                children: [
                  {
                    type: 'element',
                    tagName: 'li',
                    attributes: [],
                    position: {
                      start: ps(15),
                      end: ps(27)
                    },
                    children: [
                      {
                        type: 'text',
                        content: 'def',
                        position: {
                          start: ps(19),
                          end: ps(22)
                        }
                      }
                    ]
                  }
                ]
              }
            ]
          }
        ]
      }
    ])
  }

  {
    const str = '<ul><li>abc<ul><span><li>def</li></span></ul></li></ul>'
    const tokens = lexer(str, lexerOptions)
    const nodes = parser(tokens, {
      voidTags: [],
      closingTags: ['li'],
      closingTagAncestorBreakers: {
        li: ['ul']
      }
    })

    t.deepEqual(nodes, [
      {
        type: 'element',
        tagName: 'ul',
        attributes: [],
        position: {
          start: ps(0),
          end: ps(55)
        },
        children: [
          {
            type: 'element',
            tagName: 'li',
            attributes: [],
            position: {
              start: ps(4),
              end: ps(50)
            },
            children: [
              {
                type: 'text',
                content: 'abc',
                position: {
                  start: ps(8),
                  end: ps(11)
                }
              },
              {
                type: 'element',
                tagName: 'ul',
                attributes: [],
                position: {
                  start: ps(11),
                  end: ps(45)
                },
                children: [
                  {
                    type: 'element',
                    tagName: 'span',
                    attributes: [],
                    position: {
                      start: ps(15),
                      end: ps(40)
                    },
                    children: [
                      {
                        type: 'element',
                        tagName: 'li',
                        attributes: [],
                        position: {
                          start: ps(21),
                          end: ps(33)
                        },
                        children: [
                          {
                            type: 'text',
                            content: 'def',
                            position: {
                              start: ps(25),
                              end: ps(28)
                            }
                          }
                        ]
                      }
                    ]
                  }
                ]
              }
            ]
          }
        ]
      }
    ])
  }

  {
    const str = '<ul><li>abc<ul><li>def<li>ghi</li></ul></li></ul>'
    const tokens = lexer(str, lexerOptions)
    const nodes = parser(tokens, {
      voidTags: [],
      closingTags: ['li'],
      closingTagAncestorBreakers: {
        li: ['ul']
      }
    })

    t.deepEqual(nodes, [
      {
        type: 'element',
        tagName: 'ul',
        attributes: [],
        position: {
          start: ps(0),
          end: ps(49)
        },
        children: [
          {
            type: 'element',
            tagName: 'li',
            attributes: [],
            position: {
              start: ps(4),
              end: ps(44)
            },
            children: [
              {
                type: 'text',
                content: 'abc',
                position: {
                  start: ps(8),
                  end: ps(11)
                }
              },
              {
                type: 'element',
                tagName: 'ul',
                attributes: [],
                position: {
                  start: ps(11),
                  end: ps(39)
                },
                children: [
                  {
                    type: 'element',
                    tagName: 'li',
                    attributes: [],
                    position: {
                      start: ps(15),
                      end: ps(22)
                    },
                    children: [
                      {
                        type: 'text',
                        content: 'def',
                        position: {
                          start: ps(19),
                          end: ps(22)
                        }
                      }
                    ]
                  },
                  {
                    type: 'element',
                    tagName: 'li',
                    attributes: [],
                    position: {
                      start: ps(22),
                      end: ps(34)
                    },
                    children: [
                      {
                        type: 'text',
                        content: 'ghi',
                        position: {
                          start: ps(26),
                          end: ps(29)
                        }
                      }
                    ]
                  }
                ]
              }
            ]
          }
        ]
      }
    ])
  }
})

test('parser() should handle nested tables', t => {
  const str =
    '<table><tbody><tr><td><table><tbody><tr><td></td></tr></tbody></table></td></tr></tbody></table>'
  const tokens = lexer(str, lexerOptions)
  const nodes = parser(tokens, {
    voidTags: [],
    closingTags: ['tbody'],
    closingTagAncestorBreakers: {
      tbody: ['table'],
      tr: ['table'],
      td: ['table']
    }
  })

  t.deepEqual(nodes, [
    {
      type: 'element',
      tagName: 'table',
      attributes: [],
      position: {
        start: ps(0),
        end: ps(96)
      },
      children: [
        {
          type: 'element',
          tagName: 'tbody',
          attributes: [],
          position: {
            start: ps(7),
            end: ps(88)
          },
          children: [
            {
              type: 'element',
              tagName: 'tr',
              attributes: [],
              position: {
                start: ps(14),
                end: ps(80)
              },
              children: [
                {
                  type: 'element',
                  tagName: 'td',
                  attributes: [],
                  position: {
                    start: ps(18),
                    end: ps(75)
                  },
                  children: [
                    {
                      type: 'element',
                      tagName: 'table',
                      attributes: [],
                      position: {
                        start: ps(22),
                        end: ps(70)
                      },
                      children: [
                        {
                          type: 'element',
                          tagName: 'tbody',
                          attributes: [],
                          position: {
                            start: ps(29),
                            end: ps(62)
                          },
                          children: [
                            {
                              type: 'element',
                              tagName: 'tr',
                              attributes: [],
                              position: {
                                start: ps(36),
                                end: ps(54)
                              },
                              children: [
                                {
                                  type: 'element',
                                  tagName: 'td',
                                  attributes: [],
                                  position: {
                                    start: ps(40),
                                    end: ps(49)
                                  },
                                  children: []
                                }
                              ]
                            }
                          ]
                        }
                      ]
                    }
                  ]
                }
              ]
            }
          ]
        }
      ]
    }
  ])
})

test('parser() should ignore unnecessary closing tags', t => {
  /*
    In this case the </i> bit is unnecessary and should
    not be represented in the output nor interfere with the stack.
  */
  const str = '</i>x'
  const tokens = lexer(str, lexerOptions)
  const nodes = parser(tokens, parserOptions)
  t.deepEqual(nodes, [
    {
      type: 'text',
      content: 'x',
      position: {
        start: ps(4),
        end: ps(str.length)
      }
    }
  ])
})
