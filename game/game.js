
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
  if (gameIsOn) setTimeout(animate, 100)
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

// Will be called by the clock after 13 munutes.
function gameTimeout() {
  gameOver('Your time is over.')
  playAlarm()
}

window.gameOver = function(message) {
  gameIsOn = false
  notify(message)
  $$('article p').map(piece => {
    piece.style.transition = (1+rnd())+'s'
    piece.style.transform = `translate(${rnd(.4)-.2}em,${rnd(.4)-.2}em) rotate(${rnd(.4)-.2}turn)`
  })
}

function addGold(coins=0) {
  gold += coins
  $('gold').innerHTML = `<b>🪙</b> ${gold} coins`
}

function getNeighbors(x, y) {
  return {
    N: (placedPieces[y-1]||[])[x],
    S: (placedPieces[y+1]||[])[x],
    E: (placedPieces[y]||[])[x+1],
    W: (placedPieces[y]||[])[x-1]
  }
}

/**
 * Can the player place the piece in this (x,y) table title?
 */
let canPieceFitError = ''
function canPieceFit(piece, x, y) {
  canPieceFitError = ''
  if (typeof(x)==='undefined' || typeof(y)==='undefined') return false
  if ((placedPieces[y]||[])[x]) return false
  const neighbors = getNeighbors(x, y)

  canPieceFitError = 'Piece side must be flat to fit the puzle border.'
  if (x === 0 && piece.W !== '-') return false
  if (x === puzzleWidth-1 && piece.E !== '-') return false
  if (y === 0 && piece.N !== '-') return false
  if (y === puzzleHeight-1 && piece.S !== '-') return false

  canPieceFitError = 'A flat side must not be faced inside the puzzle.'
  if (x > 0 && piece.W === '-') return false
  if (x < puzzleWidth-1 && piece.E === '-') return false
  if (y > 0 && piece.N === '-') return false
  if (y < puzzleHeight-1 && piece.S === '-') return false

  canPieceFitError = 'This piece can NOT be connected here.'
  if (!canPlugThatTwoPieces(piece, 'S', neighbors.S, 'N')) return false
  if (!canPlugThatTwoPieces(piece, 'N', neighbors.N, 'S')) return false
  if (!canPlugThatTwoPieces(piece, 'E', neighbors.E, 'W')) return false
  if (!canPlugThatTwoPieces(piece, 'W', neighbors.W, 'E')) return false

  const terrains = [piece, ...trueishValues(neighbors)].map(p => p.terrain)
  if (terrains.includes(BUILDING) && terrains.includes(CAVERN)) {
    canPieceFitError = 'You can NOT connect a building to a cavern.'
    return false
  }

  canPieceFitError = ''
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
