
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

const vecTo = (p1, p2)=> ({
  x: p2.x - p1.x,
  y: p2.y - p1.y
})

const vecSize = (vec)=> Math.sqrt(vec.x**2 + vec.y**2)

const vecOne = (vec, multplier=1)=> {
  const d = vecSize(vec)
  return {
    x: multplier * vec.x/d,
    y: multplier * vec.y/d
  }
}

let hadAHitThisTurn = false
const animate = ()=> {
  if (gameIsOn) setTimeout(animate, 100)
  debugStats.begin() // DEBUG

  for (let el,i=0; el=mapEntities[i]; i++) {
    let vec2Target = vecTo(el, boidTarget)
    let velocity2Target = vecOne(vec2Target, .1)
    if (vecSize(vec2Target) > 2) {
      el.v.x += velocity2Target.x
      el.v.y += velocity2Target.y
    } else {
      el.v.x += velocity2Target.x/5
      el.v.y += velocity2Target.y/5
    }
    el.v.x += rnd(.1)-.05
    el.v.y += rnd(.1)-.05
    let vel = vecSize(el.v)
    if (vel > .2) el.v = vecOne(el.v, .2)
    testColision(el)
  }
  for (let el,i=0; el=mapEntities[i]; i++) {
    testColisionWall(el)
    if (el.life > 0) {
      el.x += el.v.x
      el.y += el.v.y
      el.onupdate()
    }
  }
  if (hadAHitThisTurn) playTone(600, 0, 1, .5, 200)
  hadAHitThisTurn = false
  //queueMicrotask(()=>log('=====================================================')) // DEBUG
  debugStats.end() // DEBUG
}

const testColision = (el1)=> {
  for (let el2,i=0; el2=mapEntities[i]; i++) if (el1 !== el2) {
    let vec = vecTo(el1, el2)
    let dist = vecSize(vec)
    let minDist = el1.r + el2.r
    if (areEnemies(el1, el2)) {
      if (dist < minDist) {
        //log(el1.id,'hit',el2.id)
        hitEntity(el2)
      }
    } else { // Friends
      if (dist < minDist*1.5) {
        vec = vecOne(vec, .05)
        el1.v.x -= vec.x
        el1.v.y -= vec.y
      }
    }
    if (dist < minDist) {
      vec = vecOne(vec, .1)
      el1.v.x = -vec.x
      el1.v.y = -vec.y
    }
  }
}

const testColisionWall = (el)=> {
  for (let wall,i=0; wall=mapWalls[i]; i++) {
    let vec = vecTo(el, wall)
    let dist = vecSize(vec)
    let minDist = el.r + wall.r
    if (dist < minDist*1.4) {
      vec = vecOne(vec, .1)
      let dx = abs(el.x - wall.x)
      let dy = abs(el.y - wall.y)
      if (dx > dy && dx < minDist) el.v.x = -vec.x
      if (dy > dx && dy < minDist) el.v.y = -vec.y
    }
  }
}

const areEnemies = (el1, el2)=> {
  const els = [el1.tagName, el2.tagName].sort().join('')
  return els === 'EU' || els === 'EM'
}

const hitEntity = (el)=> {
  hadAHitThisTurn = true
  el.life--
  el.className = el.className.replace(
    /life./,
    `life${(el.life <= 0) ? 0 : ~~(el.life*5/el.lifeOrig)+1}`
  )
  //log(el.id,'lost',el.className, el.x.toFixed(2), el.y.toFixed(2), el.parentNode)
  if (el.life <= 0) {
    //queueMicrotask(()=> log('DEAD:', el.id, el.x.toFixed(2), el.y.toFixed(2))) // DEBUG
    queueMicrotask(()=> mapEntities = mapEntities.filter(el2 => el2 !== el))
    setTimeout(()=> el.parentNode && el.remove(), 40_000)
    if (el.tagName === 'E') addGold(el.lifeOrig, true)
  }
}

// Will be called by the clock after 13 munutes.
function gameTimeout() {
  gameOver('Your time is over.')
  playAlarm()
}

function gameOver(message) {
  gameIsOn = false
  notify(message)
  mapEntities.map(el => {
    el.style.transition = (1+rnd())+'s'
    el.style.transform = `translate(${rnd(4)-2}em,${rnd(4)-2}em)`
  })
  $$('article p').map(piece => {
    piece.style.transition = (1+rnd())+'s'
    piece.style.transform = `translate(${rnd(.4)-.2}em,${rnd(.4)-.2}em) rotate(${rnd(.4)-.2}turn)`
  })
}
window.gameOver = gameOver //DEBUG

// Let the player to sheet
window.addGold = function addGold(coins=0, playSound) {
  if (playSound) for (let i=0; i<6; i++) {
    playTone(2000, .5 + i/20, .6, .5)
    playTone(8000, .5 + i/20, .1, .5)
  }
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

  const neighborTerrains = trueishValues(neighbors).map(p => p.terrain)
  if (
    (piece.terrain === BUILDING && neighborTerrains.includes(CAVERN)) ||
    (piece.terrain === CAVERN && neighborTerrains.includes(BUILDING))
  ) {
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
