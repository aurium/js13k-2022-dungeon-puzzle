const mapSpaces = []
const mapElements = []
const docRoot = $(':root')
let bossPiece = null
let puzzleWidth, puzzleHeight, rndEnemyChance, bigEnemyProp = .2
let placedPieces

function initMap(level) {

  $('bg').style.display = 'none'

  if (level == 'easy') {
    puzzleWidth = 5
    puzzleHeight = 5
    rndEnemyChance = .1
  } else if (level == 'medium') {
    puzzleWidth = 9
    puzzleHeight = 6
    rndEnemyChance = .15
  } else if (level == 'hard') {
    puzzleWidth = 13
    puzzleHeight = 7
    rndEnemyChance = .2
  } else {
    puzzleWidth = max(5, parseInt($('#conf-width').value) || 13)
    puzzleHeight = max(5, parseInt($('#conf-height').value) || 7)
    rndEnemyChance = parseInt($('#conf-enemy-chance').value)/100 || .1
  }

  addGold(~~(200 * rndEnemyChance))
  placedPieces = Array(puzzleHeight).fill(0).map(y => Array(puzzleWidth).fill(0))

  docRoot.style.setProperty('--pW', puzzleWidth)
  docRoot.style.setProperty('--pH', puzzleHeight)
  onWinResize()

  mkPiece('-mf-', 'building',
    '#####'+
    '#mu #'+
    '#uu  '+
    '#   #'+
    '## ##'
  ).placePiece(0, 0)

  // kidnapped wizards
  mkPiece('ff--', 'cavern disabled',
    '#####'+
    '#####'+
    '#    '+
    '#m ##'+
    '#####'
  ).placePiece(0, puzzleHeight-1)
  mkPiece('--ff', 'cavern disabled',
    '#####'+
    '## m#'+
    '    #'+
    '#####'+
    '#####'
  ).placePiece(puzzleWidth-1, 0)

  // Boss land
  mkPiece('mmmm', 'cavern disabled',
    '## ##'+
    '##3# '+
    ' 3811'+
    '##111'+
    '# 111'
  ).placePiece(puzzleWidth-3, puzzleHeight-3)

  mkPiece('m-mm', 'cavern disabled',
    '#222#'+
    '##7 #'+
    '1## #'+
    '11###'+
    '111##'
  ).placePiece(puzzleWidth-1, puzzleHeight-3)

  mkPiece('mm-m', 'cavern disabled',
    '##111'+
    '2##11'+
    '27##1'+
    '2  ##'+
    '#####'
  ).placePiece(puzzleWidth-3, puzzleHeight-1)

  bossPiece = mkPiece('m--m', 'cavern disabled',
    '    #'+
    ' 9#1#'+
    ' ##1#'+
    ' 111#'+
    '#####'
  ).placePiece(puzzleWidth-1, puzzleHeight-1)
  bossPiece.mkChild('grid')

  for (let x=0; x<puzzleWidth; x++) for (let y=0; y<puzzleHeight; y++) {
    if (!placedPieces[y][x]) {
      if (!mapSpaces[y]) mapSpaces[y] = []
      mapSpaces[y][x] = mkEl('space', {
        parent: tableTop,
        onmouseover() { mouseover(x, y) },
        onmouseout() { mouseout(x, y) },
        css: {
          left: (x*100+5)+'px',
          top:  (y*100+5)+'px'
        }
      })
    }
  }

  initPieceOptions()

  // setTimeout(()=> {
  //   for (let x=0; x<puzzleWidth; x++) for (let y=0; y<puzzleHeight; y++) {
  //     if (!placedPieces[y][x]) {
  //       if (x==0) mkRndPiece(3).placePiece(x, y)
  //       else if (y==0) mkRndPiece(0).placePiece(x, y)
  //       else if (x==12) mkRndPiece(1).placePiece(x, y)
  //       else if (y==6) mkRndPiece(2).placePiece(x, y)
  //       else mkRndPiece(9).placePiece(x, y)
  //     }
  //   }
  // }, 5e3)

}

function initPieceOptions() {
  for (let x=0; x<2; x++) for (let y=0; y<5; y++) {
    let terrain = (y<2) ? BUILDING
                : (x<1) ? WOODS : CAVERN
    let p = mkRndPiece(
      -1,
      (  y==0 )
      ? `-${rndPlug()}${rndPlug()}f`
      : ( y==1 )
      ? `m${rndPlug()}${rndPlug()}-`
      : '',
      terrain
    )
    p.x = x
    p.y = y
    p.drag = (mouseX=0, mouseY=0)=> {
      const srcBox = avaliableBox.getBoundingClientRect()
      p.style.left = (mouseX ? mouseX-50-srcBox.x : 100*p.x) + 'px'
      p.style.top  = (mouseY ? mouseY-50-srcBox.y : 90*p.y) + 'px'
    }
    p.drag()
    p.addEventListener('mousedown', initDragAvaliablePiece)
    avaliableBox.appendChild(p)
    let btReplace = mkEl('button', {
      text: '⭯',
      parent: avaliableBox,
      onclick() { replaceAvaliable(p, x, y) },
      css: {
        position: 'absolute',
        left: (70 + 100*x) + 'px',
        top:  (75 + 90*y) + 'px'
      }
    })
  }
}