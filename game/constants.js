const BUILDING = 'building'
const WOODS = 'woods'
const CAVERN = 'cavern'
const {floor, ceil, max} = Math
const rnd = (mult=1)=> Math.random()*mult
const arrRnd = (arr)=> arr[floor(rnd(arr.length))]
const $ = (sel)=> document.querySelector(sel)
const $$ = (sel)=> [...document.querySelectorAll(sel)]
const body = document.body
const log = console.log // DEBUG

const trueishValues = (obj)=> Object.values(obj).filter(val => val)

let gold = 0
let act = 'defensive'
const tableTop = $('article div')

const MAPS = {
  N: [
    [
      '#####',
      '   # ',
      ' # # ',
      ' # # ',
      '   # '
    ], [
      '#####',
      ' #   ',
      ' ### ',
      '   # ',
      '   # '
    ], [
      '#####',
      '#####',
      '   ##',
      '## ##',
      '## ##'
    ], [
      '#####',
      '#   #',
      '    #',
      '#   #',
      '## ##'
    ], [
      '#####',
      '#   #',
      '#   #',
      '#   #',
      '## ##'
    ]
  ],
  S: [
    [
      '   # ',
      ' # # ',
      ' # # ',
      '   # ',
      '#####'
    ], [
      '   # ',
      '   # ',
      ' ### ',
      ' #   ',
      '#####'
    ], [
      '## ##',
      '## ##',
      '   ##',
      '#####',
      '#####'
    ], [
      '## ##',
      '## ##',
      '    #',
      '##  #',
      '#####'
    ]
  ],
  W: [
    [
      '#  ##',
      '#  # ',
      '#  # ',
      '#  # ',
      '#  ##'
    ], [
      '#    ',
      '#####',
      '#    ',
      '#  ##',
      '#  ##'
    ], [
      '#  ##',
      '# ## ',
      '# #  ',
      '# ## ',
      '#  ##'
    ]
  ],
  E: [
    [
      '    #',
      '#####',
      '    #',
      '    #',
      '    #'
    ], [
      '    #',
      '  ###',
      ' ## #',
      '##  #',
      '    #'
    ], [
      '    #',
      '### #',
      '    #',
      '#####',
      '    #'
    ]
  ],
  in: [
    [
      '## ##',
      '#   #',
      '     ',
      '#   #',
      '## ##'
    ], [
      '#####',
      '#   #',
      '     ',
      '#   #',
      '#####'
    ], [
      '## ##',
      '#   #',
      '#   #',
      '#   #',
      '## ##'
    ], [
      '## ##',
      '#   #',
      '    #',
      '#   #',
      '## ##'
    ], [
      '## ##',
      '#  ##',
      '   ##',
      '#  ##',
      '## ##'
    ], [
      '     ',
      '  #  ',
      ' ### ',
      '  #  ',
      '     '
    ], [
      '     ',
      ' # # ',
      '     ',
      ' # # ',
      '     '
    ], [
      '   # ',
      '   # ',
      '   # ',
      '   # ',
      '   # '
    ], [
      ' # # ',
      ' # # ',
      ' # # ',
      ' # # ',
      ' # # '
    ], [
      ' # # ',
      '   # ',
      ' # # ',
      '   # ',
      ' # # '
    ], [
      '   ##',
      ' #  #',
      ' #  #',
      ' #  #',
      '   ##'
    ], [
      '   # ',
      '  ## ',
      '  #  ',
      '  ## ',
      '   # '
    ], [
      '   # ',
      ' ### ',
      ' ##  ',
      ' ### ',
      '   # '
    ], [
      '   # ',
      ' # # ',
      ' # # ',
      ' ### ',
      '   # '
    ], [
      '   # ',
      ' ### ',
      ' # # ',
      ' # # ',
      '   # '
    ], [
      '     ',
      '     ',
      '     ',
      '     ',
      '     '
    ]
  ]
}
