const startButton = document.getElementById("start-button");
const gameScene = document.getElementById("game-scene");
const dropArea = document.getElementById("drop");
const weights = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
const colors = [
  "red",
  "blue",
  "green",
  "olive",
  "orange",
  "purple",
  "brown",
  "pink",
  "cyan",
  "black",
];
const sizes = [18, 22, 26, 30, 34, 38, 42, 46, 50, 55];

startButton.addEventListener("click", () => {
  if (!gameStarted) {
    console.log("game started");
    gameScene.style.display = "block";
    gameScene.style.pointerEvents = "auto";
    startButton.textContent = "Reset";
    gameStarted = true;
  } else {
    resetGame();
  }
});

let gameStarted = false;

const leftWeightSpan = document.getElementById("left-weight");
const rightWeightSpan = document.getElementById("right-weight");

let leftWeight = 0;
let rightWeight = 0;
dropArea.addEventListener("click", (event) => {
  const x = event.offsetX;
  const y = event.offsetY;
  const index = Math.floor(Math.random() * weights.length);

  const weight = weights[index];
  const color = colors[index];
  const size = sizes[index];

  const obj = document.createElement("div");
  obj.classList.add("weight-object");

  obj.style.width = `${size}px`;
  obj.style.height = `${size}px`;
  obj.style.backgroundColor = color;
  obj.dataset.weight = weight;
  obj.textContent = weight;

  obj.style.left = `${x}px`;
  obj.style.top = `${y}px`;

  dropArea.appendChild(obj);
  animateFall(obj, y, size);

  const pivotX = dropArea.clientWidth / 2;
  if (x < pivotX) {
    leftWeight += weight;
    leftWeightSpan.textContent = leftWeight;
  } else {
    rightWeight += weight;
    rightWeightSpan.textContent = rightWeight;
  }
});

function animateFall(element, startY, size) {
  const maxY = dropArea.clientHeight - size / 2;
  let currentY = Math.min(startY, maxY);

  const speed = 12;

  function fall() {
    currentY += speed;

    if (currentY >= maxY) {
      currentY = maxY;
      element.style.top = `${currentY}px`;
      return;
    }

    element.style.top = `${currentY}px`;
    requestAnimationFrame(fall);
  }

  requestAnimationFrame(fall);
}

function resetGame() {
  console.log("game reset");
  const objects = dropArea.querySelectorAll(".weight-object");
  objects.forEach((el) => el.remove());
  leftWeight = 0;
  leftWeightSpan.textContent = "0";
  rightWeight = 0;
  rightWeightSpan.textContent = "0";
  gameScene.style.display = "none";
  gameScene.style.pointerEvents = "none";

  startButton.textContent = "Start";
  gameStarted = false;
}
