const rndPlug = ()=> rnd() < .5 ? 'm' : 'f'

function mkRndPiece(border = -1, conns, terrain) {
  let [N, E, S, W] = (conns||'').split('')

  // If no flat border was defined,
  // give it a good chance to make a border piece,
  // but only if there is a missed border:
  if (border === -1 && rnd()<.666) {
    const borderNeeded = []
    if (placedPieces[0].filter(p => !p).length)
        borderNeeded.push(0) // N
    if (placedPieces.map(l=>l[puzzleWidth-1]).filter(p => !p).length)
        borderNeeded.push(1) // E
    if (placedPieces[puzzleHeight-1].filter(p => !p).length)
        borderNeeded.push(2) // S
    if (placedPieces.map(l=>l[0]).filter(p => !p).length)
        borderNeeded.push(3) // W
    border = arrRnd(borderNeeded)
  }

  if (!conns) {
    const conn = (pos)=> border==pos ? '-' : rndPlug()
    N = conn(0)
    E = conn(1)
    S = conn(2)
    W = conn(3)
  }

  if (!terrain) terrain = [BUILDING, WOODS, WOODS, CAVERN][floor(rnd(4))]
  const map = mkRndMap(N,E,S,W, terrain==WOODS ? .8 : terrain==CAVERN ? .9 : 1 )
  return mkPiece(N+E+S+W, terrain, map)
}

// function mkNewRndMap(N,E,S,W) {
//   const map = ['','','','','']
//   for (let x=0; x<5; x++) for (let y=0; y<5; y++) {
//     map[y] += rnd()<.25 ? '#' : ' '
//   }
//   if (N=='-') map[0] = '#####'
//   if (S=='-') map[4] = '#####'
//   if (W=='-') for (let y=0; y<5; y++) map[y] = '#' + map[y].substring(1)
//   if (E=='-') for (let y=0; y<5; y++) map[y] = map[y].substring(0,4) + '#'
//   return map
// }

function mkRndMap(N,E,S,W, presetProb) {
  let map
  // if (rnd() < presetProb) {
    let key = 'in'
    if (N=='-') key = 'N'
    if (S=='-') key = 'S'
    if (W=='-') key = 'W'
    if (E=='-') key = 'E'
    map = arrRnd(MAPS[key]).map(line => ''+line)
  // }
  // else map = mkNewRndMap(N,E,S,W)
  for (let x=0; x<5; x++) for (let y=0; y<5; y++) {
    let line = map[y].split('')
    if (
      !(x==2 && y==0) &&
      !(x==2 && y==4) &&
      !(x==0 && y==2) &&
      !(x==4 && y==2) &&
      line[x] == ' '  &&
      rnd() < rndEnemyChance
    ) {
      line[x] = rnd() < bigEnemyProp ? 1+ceil(rnd(5)) : 1
      map[y] = line.join('')
    }
  }
  return map.join('')
}

function mkPiece(conn, terrain, map) {
  const parsedMap = [ [], [], [], [], [] ]
  map = [
    '       ',
    ...map.replace(/(.{5})/g, '$1!')
          .split('!').slice(0,5)
          .map(line => ' '+line+' '),
    '       '
  ].map(line => line.split(''))
  const p = mkEl('p', {
    class: `N${conn[0]} E${conn[1]} S${conn[2]} W${conn[3]} ${terrain}`,
    child: [
      'f', '',
      'map', {
        child: map.flatMap((line, y)=>
          line.flatMap((char, x)=> {
            if (x==0 && y==3 && line[1] == '#' ) char = '#'
            if (x==6 && y==3 && line[5] == '#' ) char = '#'
            if (x==3 && y==0 && map[1][3]=='#' ) char = '#'
            if (x==3 && y==6 && map[5][3]=='#' ) char = '#'
            const enemy = char.match(/[1-9]/) && parseInt(char)
            if (x>0 && x<6 && y>0 && y<6) {
              parsedMap[y-1][x-1] = enemy>0 ? enemy : char
            }
            return [
              enemy > 0 ? 'e' :
              char=='#' ? 'w' :
              char==' ' ? 'b' :
              char,
              {
                class: (enemy>0 && 'e'+enemy),
                child: ['i', '']
              }
            ]
          })
        )
      }
    ]
  })
  p.N = conn[0]
  p.E = conn[1]
  p.S = conn[2]
  p.W = conn[3]
  p.terrain = terrain
  p.map = parsedMap
  p.placePiece = placePiece
  p.enablePiece = enablePiece
  p.addEventListener('click', clickOnPlacedPiece)
  return p
}

/**
 * Capture piece click to define a target to hero boids to follow.
 */
function clickOnPlacedPiece(ev) {
  boidTarget.x = ev.target.parentNode.x*5 + ev.layerX/20 -.5
  boidTarget.y = ev.target.parentNode.y*5 + ev.layerY/20 -.5
  log('Update target:', boidTarget.x, boidTarget.y)
  boidTarget.onupdate()
  boidTarget.className = 'show'
  setTimeout(()=> boidTarget.className = '', 100)
}

/**
 * Add place to the table.
 * Some initial pieces can be setted as disabled. They will look blurry.
 */
function placePiece(px, py, enabled=true) {
  this.style.left = (px*100)+'px'
  this.style.top = (py*100)+'px'
  tableTop.appendChild(this)
  this.x = px
  this.y = py
  placedPieces[py][px] = this
  if (enabled) {
    addGold(1)
    this.classList.add('disabled')
    this.enablePiece()
    const neighbors = getNeighbors(px, py)
    // Enable its disabled neighbors:
    trueishValues(neighbors).map(p => p.enablePiece())
    // Add warriors based on equal terrain neighbors:
    const equalTerrains = trueishValues(neighbors)
          .filter(p => p.terrain === this.terrain)
    const count = equalTerrains.length
    if (count) notify(count===1 ? `You get a new warrior.` : `You get ${count} new warriors.`)
    equalTerrains.map(p => {
      let x, y
      while((p.map[y]||[])[x] !==  ' ') {
        x = ~~rnd(5)
        y = ~~rnd(5)
      }
      setTimeout(()=> {
        log('Adding warrior at', p.x*5+x, p.y*5+y)
        placeWarrior(p.x*5+x, p.y*5+y).style.filter = 'brightness(99) blur(.5em) opacity(0)'
      }, 1000)
    })
    for (let i=4; i<12; i++) playTone(i*10, 0, 1, .3)
  } else { // this pece Disabled.
    this.classList.add('disabled')
  }
  return this
}

function enablePiece() {
  if (!this.classList.contains('disabled')) return;
  this.classList.remove('disabled')
  this.map.map((line, y)=>
    line.map((char, x)=> {
      const elX = this.x*5 + x
      const elY = this.y*5 + y
      let el = null
      if (char == '#') mapWalls.push(placeWall(elX, elY))
      if (char == 'u') el = placeWarrior(elX, elY)
      if (char == 'm') el = placeWizard(elX, elY)
      if (char  >  0 ) el = placeEnemy(elX, elY, char)
      if (el && el.onupdate) el.onupdate()
      if (el) el.id = char+'-'+rnd().toString(36).substr(2,3) // DEBUG
    })
  )
  this.querySelectorAll('u,m,e').forEach(el =>
    el.replaceWith(mkEl('b'))
  )
}

function placeWall(x, y) {
  return {
    x: x+.5,
    y: y+.5,
    r: .5
  }
}

const walkerConf = {
  child: ['i', ''],
  parent: walkersLayerEl,
  onupdate() {
    this.style.left = (this.x*20) + 'px'
    this.style.top  = (this.y*20) + 'px'
  }
}

const placeEntity = (tag, x, y, conf=walkerConf, size=2)=> {
  const el = mkEl(tag, conf)
  el.setStyle({
    filter: 'blur(.1em) grayscale(.9)',
    transition: '2s filter linear'
    //transition: '.15s linear, 2s filter linear'
  })
  setTimeout(()=> el.style.filter = 'none', 100)
  el.v = { x:0, y:0 }
  el.x = x + .5
  el.y = y + .5
  el.r = ((5+size)/14)/2
  el.lifeOrig = el.life = tag==='u'
                        ? 9
                        : tag==='m'
                        ? 3
                        : size
  el.classList.add('life6')
  el.onupdate()
  tag !== 'x' && mapEntities.push(el)
  return el
}

function placeWarrior(x, y) {
  return placeEntity('u', x, y)
}

function placeWizard(x, y) {
  return placeEntity('m', x, y)
}

function placeEnemy(x, y, size) {
  return placeEntity('e', x, y, { class: 'e'+size, ...walkerConf }, size)
}
