const rndPlug = ()=> rnd() < .5 ? 'm' : 'f'

function mkRndPiece(border = -1, conns, terrain) {
  if (border == -1) border = floor(rnd(10)) // 0-3 border piece, 4-... inner piece
  let [N, E, S, W] = (conns||'').split('')
  if (!conns) {
    const conn = (pos)=> border==pos ? '-' : rndPlug()
    N = conn(0)
    E = conn(1)
    S = conn(2)
    W = conn(3)
  }
  if (!terrain) terrain = [BUILDING, WOODS, CAVERN][floor(rnd(3))]
  const map = mkRndMap(N,E,S,W, terrain==WOODS ? .8 : terrain==CAVERN ? .9 : 1 )
  return mkPiece(N+E+S+W, terrain, map)
}

function mkNewRndMap(N,E,S,W) {
  const map = ['','','','','']
  for (let x=0; x<5; x++) for (let y=0; y<5; y++) {
    map[y] += rnd()<.25 ? '#' : ' '
  }
  if (N=='-') map[0] = '#####'
  if (S=='-') map[4] = '#####'
  if (W=='-') for (let y=0; y<5; y++) map[y] = '#' + map[y].substring(1)
  if (E=='-') for (let y=0; y<5; y++) map[y] = map[y].substring(0,4) + '#'
  return map
}

function mkRndMap(N,E,S,W, presetProb) {
  let map
  if (rnd() < presetProb) {
    let key = 'in'
    if (N=='-') key = 'N'
    if (S=='-') key = 'S'
    if (W=='-') key = 'W'
    if (E=='-') key = 'E'
    map = arrRnd(MAPS[key]).map(line => ''+line)
  }
  else map = mkNewRndMap(N,E,S,W)
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
  return p
}

function placePiece(px, py) {
  this.style.left = (px*100)+'px'
  this.style.top = (py*100)+'px'
  tableTop.appendChild(this)
  placedPieces[py][px] = this
  this.map.map((line, y)=>
    line.map((char, x)=> {
      const elX = px*5 + x
      const elY = py*5 + y
      let el = null
      if (char == '#') mapElements.push(el = placeWall(elX, elY))
      if (char == 'u') mapElements.push(el = placeWarrior(elX, elY))
      if (char == 'm') mapElements.push(el = placeWizard(elX, elY))
      if (char  >  0 ) mapElements.push(el = placeEnemy(elX, elY, char))
      if (el && el.onupdate) el.onupdate()
    })
  )
  this.querySelectorAll('u,m,e').forEach(el =>
    el.replaceWith(mkEl('b'))
  )
  return this
}

function placeWall(x, y) {
  return { x, y, x2:x+.2, y2:y+.2 }
}

const walkerConf = {
  child: ['i', ''],
  onupdate() {
    this.style.left = (this.x*20) + 'px'
    this.style.top  = (this.y*20) + 'px'
    $('article ul').appendChild(this)
  }
}

function placeWarrior(x, y) {
  const el = mkEl('u', walkerConf)
  el.x = x + .5
  el.y = y + .5
  return el
}

function placeWizard(x, y) {
  const el = mkEl('m', walkerConf)
  el.x = x + .5
  el.y = y + .5
  return el
}

function placeEnemy(x, y, size) {
  const el = mkEl('e', { class: 'e'+size, ...walkerConf })
  el.x = x + .5
  el.y = y + .5
  return el
}
