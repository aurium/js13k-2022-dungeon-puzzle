// Define grass texture to woods pieces:
const grass = []
for (let x=2; x<100; x+=4) for (let y=2; y<100; y+=4)  {
  grass.push(`radial-gradient(at ${x+rnd(3)}% ${y+rnd(3)}%, #060, #673, transparent ${rnd(4)}%)`)
}
mkEl('style', {
  parent: document.head,
  text: `p.woods{background-image:${grass.join(',\n')}}`
})

const boidTarget = placeEntity('x', 1.5, 1.5)
boidTarget.style.transition = ''
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
  puzzleLayerEl.style.left = marginX + 'px'
  puzzleLayerEl.style.top = marginY + 'px'
  walkersLayerEl.style.left = marginX + 'px'
  walkersLayerEl.style.top = marginY + 'px'
}
window.addEventListener('resize', onWinResize)
window.addEventListener('load', onWinResize)

function replaceAvaliable(piece, x, y) {
  if (gold < 5) {
    return notify('You have not enought gold.')
  }
  notify('Repace '+piece.terrain+' piece for 5 gold coins.')
  addGold(-5)
  piece.remove()
  piece.btReplace.remove()
  configPieceOption(mkRndPiece(), x, y)
}

window.addEventListener('mouseup', endDragAvaliablePiece)
window.addEventListener('mousemove', dragAvaliablePiece)

let dragingPiece = null
function initDragAvaliablePiece(ev) {
  dragingPiece = this
  log('Init drag piece', dragingPiece.className, dragingPiece.N)
  dragingPiece.style.transition = 'transform .6s'
  dragingPiece.classList.add('dragging')
  body.classList.add('dragging')
  dragingPiece.drag(ev.pageX, ev.pageY)
}

function endDragAvaliablePiece(ev) {
  if (!dragingPiece) return 0
  log('End drag piece', dragingPiece.className)
  if (gameIsOn && canPieceFit(dragingPiece, ...overPlace)) {
    log(`Placing ${dragingPiece.className} at ${overPlace}`)
    const {x, y} = dragingPiece
    dragingPiece.btReplace.remove()
    setTimeout(()=> configPieceOption(mkRndPiece(), x, y), 500)
    dragingPiece.removeEventListener('mousedown', initDragAvaliablePiece)
    dragingPiece.placePiece(...overPlace)
  } else {
    if (canPieceFitError) notify(canPieceFitError)
    dragingPiece.drag()
    dragingPiece.style.transition = '.6s'
  }
  dragingPiece.classList.remove('dragging')
  body.classList.remove('dragging')
  dragingPiece = null
  overPlace = []
}

function dragAvaliablePiece(ev) {
  if (!dragingPiece) return 0
  dragingPiece.drag(ev.pageX, ev.pageY)
}

let overPlace = []
function mouseoverTableTile(ev, x, y) {
  ev.stopPropagation()
  if (dragingPiece) {
    overPlace = [x, y]
    mapSpaces[y][x].className = canPieceFit(dragingPiece, x, y) ? 'valid' : 'invalid'
  } else {
    mapSpaces[y][x].className = ''
  }
}

window.addEventListener('mouseover', (ev)=> {
  overPlace = []
})

$$('act button').map(btn =>
  btn.onclick = ()=> {
    $$('act button').map(b => b.className='')
    btn.className = 'active'
    act = btn.innerText
  }
)
$('act button:nth-child(2)').click()

let notifyY = 45 // Vary the notification position to prevent overlap.
// step-by-step put the notifyY back to the original position while not used:
setInterval(()=> notifyY = Math.min(notifyY+1, 45), 1500)
// Show some notification to the user.
const notify = (text, opts={})=> {
  const notification = mkEl('news', { text, parent: body })
  notification.style.top = (opts.iniTop||0)+'vh'
  log('Notification:', text)
  notifyY -= 5
  if (notifyY < 25) notifyY = 50
  setTimeout(()=> {
    notification.classList.add(opts.class)
    notification.setStyle({ opacity: 1, top: (opts.top||notifyY)+'vh' })
  }, 100)
  if (!opts.noRemove) {
    setTimeout(()=> notification.style.opacity = 0, (opts.dur||4)*1000)
    setTimeout(()=> notification.remove(), (opts.dur||4)*1000+2000)
  }
  return notification
}

const delayedNotify = (sec, text, opts)=> setTimeout(()=> notify(text, opts), sec*1000)

/* * * Clock * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

const clockPointer = mkEl('cp', { parent: $('clock') })
const clockPointerShadow = mkEl('cp', { parent: $('clock'), class: 'shadow' })
const turnsCounter = mkEl('b', { parent: $('clock') })

const startClock = ()=> {
  realStartTime = startTime = Date.now()
  updateClock()
  setTimeout(goldInterval, 30_000)
  playTicTac()
}

const updateClock = ()=> {
  const elapsedTime = Date.now() - startTime
  let clockTurn = elapsedTime / 60_000
  if (clockTurn < 13) {
    if (gameIsOn) setTimeout(updateClock, 500)
  } else {
    clockTurn = 13
    turnsCounter.innerText = 'Timeout'
    gameTimeout()
  }
  if (~~clockTurn === 12) turnsCounter.style.color = '#A55'
  turnsCounter.innerText = 'Turn ' + ~~(clockTurn+1)
  clockPointer.style.transform =
  clockPointerShadow.style.transform =
  `rotate(${clockTurn}turn)`
  if (elapsedTime < 60_000) btBuyTime.setAttribute('disabled', true)
  else btBuyTime.removeAttribute('disabled')
}

const goldInterval = ()=> {
  if (gameIsOn) setTimeout(goldInterval, 10_000)
  addGold(1)
}

window.buyTime = ()=> {
  notify('Rollback one clock turn for 10 gold coins.')
  startTime += 60_000
  addGold(-10)
}
