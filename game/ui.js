// Define grass texture to woods pieces:
const grass = []
for (let x=2; x<100; x+=4) for (let y=2; y<100; y+=4)  {
  grass.push(`radial-gradient(at ${x+rnd(3)}% ${y+rnd(3)}%, #060, #673, transparent ${rnd(4)}%)`)
}
mkEl('style', {
  parent: document.head,
  text: `p.woods{background-image:${grass.join(',\n')}}`
})

const avaliableBox = $('#avaliable')
const tableEl = $('article')
const puzzleLayerEl = $('article > div')
const walkersLayerEl = $('article > ul')
const boidTarget = placeEntity('x', 2, 2)
boidTarget.onupdate()

function onWinResize() {
  tableEl.classList.remove('hide')
  const tableW = tableEl.clientWidth
  const tableH = tableEl.clientHeight
  const layerW = puzzleLayerEl.clientWidth
  const layerH = puzzleLayerEl.clientHeight
  const em = layerW / 13
  const marginX = max(.2*em, (tableW - layerW) / 2)
  const marginY = max(.2*em, (tableH - layerH) / 2)
  puzzleLayerEl.style.left = marginX
  puzzleLayerEl.style.top = marginY
  walkersLayerEl.style.left = marginX
  walkersLayerEl.style.top = marginY
}
window.addEventListener('resize', onWinResize)
window.addEventListener('load', onWinResize)

function replaceAvaliable(piece, x, y) {
  if (gold < 5) {
    return alert('You have not enought gold.')
  }
  if (confirm(
    'Repace '+piece.terrain+' piece ['+x+','+y+'] for 10 gold coins.'
  )) {
    addGold(-5)
    piece.remove()
    configPieceOption(mkRndPiece(), x, y)
  }
}

window.addEventListener('mouseup', endDragAvaliablePiece)
window.addEventListener('mousemove', dragAvaliablePiece)

let dragingPiece = null
function initDragAvaliablePiece(ev) {
  dragingPiece = this
  log('Init drag piece', dragingPiece.className, dragingPiece.N)
  dragingPiece.style.transition = 'transform .6s'
  dragingPiece.classList.add('dragging')
  dragingPiece.drag(ev.pageX, ev.pageY)
}

function endDragAvaliablePiece(ev) {
  if (!dragingPiece) return 0
  log('End drag piece', dragingPiece.className)
  if (canPieceFit(dragingPiece, ...lastTablePos)) {
    log(`Placing ${dragingPiece.className} at ${lastTablePos}`)
    configPieceOption(mkRndPiece(), dragingPiece.x, dragingPiece.y)
    dragingPiece.removeEventListener('mousedown', initDragAvaliablePiece)
    dragingPiece.placePiece(...lastTablePos)
  } else {
    dragingPiece.drag()
    dragingPiece.style.transition = '.6s'
  }
  dragingPiece.classList.remove('dragging')
  dragingPiece = null
  lastTablePos = []
}

function dragAvaliablePiece(ev) {
  if (!dragingPiece) return 0
  //log('Draging piece', ~~(ev.pageX/50)*50, ~~(ev.pageY/50)*50)
  dragingPiece.drag(ev.pageX, ev.pageY)
}

let overPlace = [0, 0]
let lastTablePos = []
function mouseoverTableTile(x, y) {
  if (dragingPiece) {
    lastTablePos = [x, y]
    mapSpaces[y][x].className = canPieceFit(dragingPiece, x, y) ? 'valid' : 'invalid'
  } else {
    mapSpaces[y][x].className = ''
  }
  overPlace = [x, y]
}

function mouseoutTableTile(x, y) {
  overPlace = [0, 0]
}

$$('act button').map(btn =>
  btn.onclick = ()=> {
    $$('act button').map(b => b.className='')
    btn.className = 'active'
    act = btn.innerText
  }
)
$('act button:nth-child(2)').click()
