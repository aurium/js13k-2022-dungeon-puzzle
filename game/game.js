
/* INI DEBUG */
let debugStats = { begin(){}, end(){} }
const scriptEl = document.createElement('script')
scriptEl.onload = ()=> {
  debugStats = Stats ? new Stats() : {
    dom: document.createElement('button'),
    begin() { },
    end() { },
  }
  document.body.appendChild(debugStats.dom)
}
scriptEl.src = 'https://cdn.jsdelivr.net/gh/mrdoob/stats.js@master/build/stats.js'
document.body.appendChild(scriptEl)
/* END DEBUG */

let inc = .1
function animate() {
  //window.requestAnimationFrame(animate)
  setTimeout(animate, 100)
  debugStats.begin() // DEBUG
  inc *= -1

  const warriors = $$(':not(.disabled)>map u')
  const wizards  = $$(':not(.disabled)>map m')
  const enemies  = $$(':not(.disabled)>map e')
  const all = [ ...warriors, ...wizards, ...enemies ]
  for (let i=0,el; el=all[i]; i++) {
    //el.style.left = (parseFloat(el.style.left||'0') + inc) + 'px'
  }

  debugStats.end() // DEBUG
}

log('Game ON!')
animate()

window.gameOver = function() {
  $$('article p').map(piece => {
    piece.style.transition = (1+rnd())+'s'
    piece.style.transform = `translate(${rnd(.4)-.2}em,${rnd(.4)-.2}em) rotate(${rnd(.4)-.2}turn)`
  })
}

function addGold(coins=0) {
  gold += coins
  $('gold').innerHTML = `<b>🪙</b> ${gold} coins`
}

/**
 * Can the player place the piece in this (x,y) table title?
 */
function canPiceFit(piece, x, y) {
  if (placedPieces[y][x]) return false
  const pieceN = (placedPieces[y-1]||[])[x]
  const pieceS = (placedPieces[y+1]||[])[x]
  const pieceE = placedPieces[y][x+1]
  const pieceW = placedPieces[y][x-1]

  // Piece side must be flat to fit the puzle border
  if (x === 0 && piece.W !== '-') return false
  if (x === puzzleWidth-1 && piece.E !== '-') return false
  if (y === 0 && piece.N !== '-') return false
  if (y === puzzleHeight-1 && piece.S !== '-') return false

  // A flat side must not be faced inside the puzzle
  if (x > 0 && piece.W === '-') return false
  if (x < puzzleWidth-1 && piece.E === '-') return false
  if (y > 0 && piece.N === '-') return false
  if (y < puzzleHeight-1 && piece.S === '-') return false

  if (!canPlugThatTwoPieces(piece, 'S', pieceS, 'N')) return false
  if (!canPlugThatTwoPieces(piece, 'N', pieceN, 'S')) return false
  if (!canPlugThatTwoPieces(piece, 'E', pieceE, 'W')) return false
  if (!canPlugThatTwoPieces(piece, 'W', pieceW, 'E')) return false

  return true
}

/**
 * Piece 1's plug can plug on piece 2's plug?
 * If there is no piece 2, it can freely plug.
 */
function canPlugThatTwoPieces(p1, plug1, p2, plug2) {
  if (p1 && !p2) return true
  return [ p1[plug1], p2[plug2] ].sort().join('') === 'fm'
}
