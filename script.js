const canvas = document.getElementById("game-canvas");
const ctx = canvas.getContext("2d");

const speedValue = document.getElementById("speed-value");
const scoreValue = document.getElementById("score-value");
const restartButton = document.getElementById("restart-button");

const road = {
  left: 180,
  right: canvas.width - 180,
  top: 0,
  bottom: canvas.height,
  laneCount: 3,
};

const player = {
  width: 50,
  height: 90,
  x: canvas.width / 2,
  y: canvas.height - 130,
  speedX: 0,
  maxSpeedX: 6,
};

let traffic = [];
let keys = {};
let score = 0;
let isGameOver = false;
let lastSpawn = 0;
let gameSpeed = 4;
let targetSpeed = 4;

function resetGame() {
  traffic = [];
  score = 0;
  isGameOver = false;
  gameSpeed = 4;
  targetSpeed = 4;
  player.x = canvas.width / 2;
  player.speedX = 0;
  lastSpawn = 0;
}

function laneWidth() {
  return (road.right - road.left) / road.laneCount;
}

function spawnCar() {
  const lane = Math.floor(Math.random() * road.laneCount);
  const width = 50;
  const height = 90;
  const x = road.left + laneWidth() * lane + laneWidth() / 2 - width / 2;
  traffic.push({
    x,
    y: -height,
    width,
    height,
    speed: 2 + Math.random() * 2,
    color: `hsl(${Math.random() * 360}, 75%, 55%)`,
  });
}

function update(delta) {
  if (isGameOver) {
    return;
  }

  if (keys.ArrowLeft) {
    player.speedX = Math.max(player.speedX - 0.4, -player.maxSpeedX);
  } else if (keys.ArrowRight) {
    player.speedX = Math.min(player.speedX + 0.4, player.maxSpeedX);
  } else {
    player.speedX *= 0.9;
  }

  if (keys.ArrowUp) {
    targetSpeed = Math.min(targetSpeed + 0.03, 10);
  } else if (keys.ArrowDown) {
    targetSpeed = Math.max(targetSpeed - 0.05, 2);
  }

  gameSpeed += (targetSpeed - gameSpeed) * 0.05;

  player.x += player.speedX;
  player.x = Math.max(road.left + 10, Math.min(player.x, road.right - player.width - 10));

  if (performance.now() - lastSpawn > 900 - gameSpeed * 40) {
    spawnCar();
    lastSpawn = performance.now();
  }

  traffic.forEach((car) => {
    car.y += (gameSpeed + car.speed) * delta;
  });

  traffic = traffic.filter((car) => car.y < canvas.height + 120);

  score += gameSpeed * delta * 10;

  traffic.forEach((car) => {
    if (
      player.x < car.x + car.width &&
      player.x + player.width > car.x &&
      player.y < car.y + car.height &&
      player.y + player.height > car.y
    ) {
      isGameOver = true;
    }
  });
}

function drawRoad() {
  ctx.fillStyle = "#1b2033";
  ctx.fillRect(road.left, road.top, road.right - road.left, road.bottom);

  ctx.strokeStyle = "#f7f7f7";
  ctx.lineWidth = 6;
  ctx.setLineDash([25, 20]);
  for (let i = 1; i < road.laneCount; i += 1) {
    const x = road.left + laneWidth() * i;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, canvas.height);
    ctx.stroke();
  }
  ctx.setLineDash([]);

  ctx.strokeStyle = "#ffdb5c";
  ctx.lineWidth = 10;
  ctx.strokeRect(road.left, 0, road.right - road.left, canvas.height);
}

function drawCar(car, highlight = false) {
  ctx.fillStyle = highlight ? "#3b5cff" : car.color;
  ctx.fillRect(car.x, car.y, car.width, car.height);
  ctx.fillStyle = "rgba(255,255,255,0.5)";
  ctx.fillRect(car.x + 8, car.y + 10, car.width - 16, 12);
  ctx.fillRect(car.x + 8, car.y + 40, car.width - 16, 12);
}

function drawHud() {
  speedValue.textContent = Math.round(gameSpeed * 25);
  scoreValue.textContent = Math.floor(score);

  if (isGameOver) {
    ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 46px 'Segoe UI', sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("Crash!", canvas.width / 2, canvas.height / 2 - 20);
    ctx.font = "20px 'Segoe UI', sans-serif";
    ctx.fillText("Press Restart to try again", canvas.width / 2, canvas.height / 2 + 20);
  }
}

let lastFrame = performance.now();
function gameLoop(now) {
  const delta = Math.min((now - lastFrame) / 16.67, 2);
  lastFrame = now;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawRoad();
  update(delta);

  traffic.forEach((car) => drawCar(car));
  drawCar({
    x: player.x,
    y: player.y,
    width: player.width,
    height: player.height,
    color: "#3b5cff",
  }, true);

  drawHud();

  requestAnimationFrame(gameLoop);
}

window.addEventListener("keydown", (event) => {
  keys[event.key] = true;
});

window.addEventListener("keyup", (event) => {
  keys[event.key] = false;
});

restartButton.addEventListener("click", () => {
  resetGame();
});

resetGame();
requestAnimationFrame(gameLoop);
