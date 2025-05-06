const canvas=document.querySelector('#game');
const game=canvas.getContext('2d');
const btnUp=document.querySelector('#up');
const btnLeft=document.querySelector('#left');
const btnRight=document.querySelector('#right');
const btnDown=document.querySelector('#down');
const spanLives=document.querySelector('#lives');
const spanTime=document.querySelector('#time');
const spanRecord=document.querySelector('#record');
const pResult=document.querySelector('#result');
const startButton = document.querySelector('.start_button');

const playerPosition={x:undefined,y:undefined,};
const giftPosition={x:undefined,y:undefined,};

let canvasSize;let elementsSize;
let level=0;let lives=3;
let timeStart;
let timePlayer;
let timeInterval;
let gameStarted = false;

let enemyPositions=[];window.addEventListener('load',setCanvasSize);
window.addEventListener('resize',setCanvasSize);

function fixNumber(n){
  return Number(n.toFixed(2));
}
function setCanvasSize(){
  if(window.innerHeight>window.innerWidth){
    canvasSize=window.innerWidth*0.7;
  }
else{
  canvasSize=window.innerHeight*0.7;
}
canvasSize=Number(canvasSize.toFixed(0));
canvas.setAttribute('width',canvasSize);
canvas.setAttribute('height',canvasSize);
elementsSize=canvasSize/10;playerPosition.x=undefined;playerPosition.y=undefined;startGame();
}
function startGame(){
  if (!gameStarted) {
    return;
  }
  console.log({canvasSize, elementsSize});
  game.font = elementsSize + 'px Verdana';
  game.textAlign = 'end';

  const map = maps[level];
  if(!map) {
    gameWin();
    return;
  }

  if(!timeStart) {
    timeStart = Date.now();
    timeInterval = setInterval(showTime, 100);
    showRecord();
  }

  const mapRows = map.trim().split('\n');
  const mapRowCols = mapRows.map(row => row.trim().split(''));
  console.log('Current level:', level);
  console.log('Map layout:', mapRowCols);

  showLives();
  enemyPositions = [];

  game.clearRect(0, 0, canvasSize, canvasSize);
  mapRowCols.forEach((row, rowI) => {
    row.forEach((col, colI) => {
      const emoji = emojis[col];
      const posX = elementsSize * (colI + 1);
      const posY = elementsSize * (rowI + 1);
      
      if(col == 'O' && !playerPosition.x && !playerPosition.y) {
        playerPosition.x = posX;
        playerPosition.y = posY;
        console.log('Player starting position:', playerPosition);
      }
      else if(col == 'I') {
        giftPosition.x = posX;
        giftPosition.y = posY;
        console.log('Gift position set:', giftPosition);
      }
      else if(col == 'X') {
        enemyPositions.push({x: posX, y: posY});
        console.log('Enemy added at:', {x: posX, y: posY});
      }
      game.fillText(emoji, posX, posY);
    });
  });
  movePlayer();
}
function movePlayer(){
  // Debug information
  console.log('Player position:', playerPosition);
  console.log('Gift position:', giftPosition);
  
  // Calculate distance between player and gift
  const distanceX = Math.abs(playerPosition.x - giftPosition.x);
  const distanceY = Math.abs(playerPosition.y - giftPosition.y);
  console.log('Distance to gift:', { distanceX, distanceY, elementsSize });
  
  // Check if player is close enough to the gift
  const giftCollision = distanceX < elementsSize && distanceY < elementsSize;
  
  if(giftCollision){
    console.log('Gift collision detected!');
    levelWin();
  }
  
  // Check enemy collisions with more precise detection
  const enemyCollision = enemyPositions.find(enemy => {
    const enemyDistanceX = Math.abs(enemy.x - playerPosition.x);
    const enemyDistanceY = Math.abs(enemy.y - playerPosition.y);
    
    // Debug enemy collision
    console.log('Enemy position:', enemy);
    console.log('Distance to enemy:', { enemyDistanceX, enemyDistanceY });
    
    // Only detect collision if player is very close to enemy
    return enemyDistanceX < elementsSize * 0.8 && enemyDistanceY < elementsSize * 0.8;
  });
  
  if(enemyCollision){
    console.log('Enemy collision detected!');
    levelFail();
  }

  // Draw player
  game.fillText(emojis['PLAYER'], playerPosition.x, playerPosition.y);
}
function levelWin(){
  console.log('Subiste de nivel');
  level++;
  playerPosition.x = undefined;
  playerPosition.y = undefined;
  startGame();
}
function levelFail(){
  console.log('Chocaste contra un enemigo :(');
  lives--;
  
  if(lives <= 0){
    clearInterval(timeInterval);
    alert('¡Juego terminado! Has perdido todas tus vidas.');
    level = 0;
    lives = 3;
    timeStart = undefined;
    gameStarted = false;
    startButton.style.display = 'block';
    pResult.innerHTML = '¡Juego terminado! Presiona Iniciar para jugar de nuevo.';
  }
  
  playerPosition.x = undefined;
  playerPosition.y = undefined;
  startGame();
}
function gameWin(){
  console.log('¡Terminaste el juego!');
  clearInterval(timeInterval);
  const recordTime = localStorage.getItem('record_time');
  const playerTime = Date.now() - timeStart;
  
  if(recordTime){
    if(recordTime >= playerTime){
      localStorage.setItem('record_time', playerTime);
      pResult.innerHTML = '¡SUPERASTE EL RECORD! 🎉';
    } else {
      pResult.innerHTML = 'Lo siento, no superaste el record 😢';
    }
  } else {
    localStorage.setItem('record_time', playerTime);
    pResult.innerHTML = '¡Primera vez! Muy bien, pero ahora trata de superar tu tiempo 😊';
  }
  
  gameStarted = false;
  startButton.style.display = 'block';
  console.log({recordTime, playerTime});
}
function showLives(){
  const heartsArray=Array(lives).fill(emojis['HEART']);spanLives.innerHTML="";
  heartsArray.forEach(heart=>spanLives.append(heart));
}
function showTime(){
  spanTime.innerHTML=Date.now()-timeStart;
}
function showRecord(){
  spanRecord.innerHTML=localStorage.getItem('record_time');
}
window.addEventListener('keydown',moveByKeys);
btnUp.addEventListener('click',moveUp);
btnLeft.addEventListener('click',moveLeft);
btnRight.addEventListener('click',moveRight);
btnDown.addEventListener('click',moveDown);

function moveByKeys(event){
  if(event.key=='ArrowUp')moveUp();
  else if(event.key=='ArrowLeft')moveLeft();
  else if(event.key=='ArrowRight')moveRight();
  else if(event.key=='ArrowDown')moveDown();
}
function moveUp(){
  console.log('Me quiero mover hacia arriba');
  console.log('Current Y position:', playerPosition.y);
  console.log('Elements size:', elementsSize);
  
  // Allow movement to the top edge
  if((playerPosition.y - elementsSize) <= 0){
    console.log('OUT - Top boundary');
  } else {
    playerPosition.y -= elementsSize;
    startGame();
  }
}
function moveLeft(){
  console.log('Me quiero mover hacia izquierda');
  console.log('Current X position:', playerPosition.x);
  console.log('Elements size:', elementsSize);
  
  if((playerPosition.x - elementsSize) <= 0){
    console.log('OUT - Left boundary');
  } else {
    playerPosition.x -= elementsSize;
    startGame();
  }
}
function moveRight(){
  console.log('Me quiero mover hacia derecha');
  console.log('Current X position:', playerPosition.x);
  console.log('Canvas size:', canvasSize);
  console.log('Elements size:', elementsSize);
  
  if((playerPosition.x + elementsSize) >= canvasSize){
    console.log('OUT - Right boundary');
  } else {
    playerPosition.x += elementsSize;
    startGame();
  }
}
function moveDown(){
  console.log('Me quiero mover hacia abajo');
  console.log('Current Y position:', playerPosition.y);
  console.log('Canvas size:', canvasSize);
  console.log('Elements size:', elementsSize);
  
  if((playerPosition.y + elementsSize) >= canvasSize){
    console.log('OUT - Bottom boundary');
  } else {
    playerPosition.y += elementsSize;
    startGame();
  }
}

const resetButton = document.querySelector('button.reset_bottom');
resetButton.addEventListener('click', resetGame);

startButton.addEventListener('click', () => {
  gameStarted = true;
  startButton.style.display = 'none';
  startGame();
});

function resetGame() {
  level = 0;
  lives = 3;
  timeStart = undefined;
  gameStarted = false;
  startButton.style.display = 'block';
  pResult.innerHTML = '';
  clearInterval(timeInterval);
  startGame();
}