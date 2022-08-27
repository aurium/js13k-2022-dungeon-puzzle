
/* INI DEBUG */
const debugStats = Stats ? new Stats() : {
  dom: document.createElement('button'),
  begin() { },
  end() { },
}
document.body.appendChild(debugStats.dom)
/* END DEBUG */

let gold = 0
let act = 'defensive'
const tableTop = $('article div')

let inc = .1
function animate() {
  window.requestAnimationFrame(animate)
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

console.log('Game ON!')
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
