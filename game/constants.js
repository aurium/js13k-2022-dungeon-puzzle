const BUILDING = 'building'
const WOODS = 'woods'
const CAVERN = 'cavern'
const {floor, ceil, max, abs} = Math
const rnd = (mult=1)=> Math.random()*mult
const arrRnd = (arr)=> arr[floor(rnd(arr.length))]
const $ = (sel)=> document.querySelector(sel)
const $$ = (sel)=> [...document.querySelectorAll(sel)]

const mapSpaces = []
const placeholders = []
let mapWalls = []
let mapEntities = []
const docRoot = $(':root')
let bossPiece = null
let bossEl = null
let bossKilled = false
let puzzleWidth, puzzleHeight
let rndEnemyChance, bigEnemyProp = .2
let placedPieces

let gameIsOn = false
let startTime

const body = document.body
const avaliableBox = $('#avaliable')
const tableEl = $('article')
const puzzleLayerEl = $('article > div')
const walkersLayerEl = $('article > ul')

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
