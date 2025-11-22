const startButton = document.getElementById("start-button");
const gameScene = document.getElementById("game-scene");
const stand = document.getElementById("stand");
const angleSpan = document.getElementById("angle");
const nextWeightSpan = document.getElementById("next-weight-value");
const pauseButton = document.getElementById("pause-button");
const pauseText = document.getElementById("pause-text");
const infoPanel = document.getElementById("info-panel");
const muteButton = document.getElementById("mute-button");

const noteSteps = {
  left: 0,
  right: 0,
}; //to keep track of the notes that have been played
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
const STATE_KEY = "seesawState";
let currentAngle = 0;
let angleAnimationId = null;
let gameStarted = false;
let nextWeightValue = null;
let isPaused = false;
let logs = [];
let placedWeights = [];
let audioCtx = null;
let muted = false;

const SEMITONE = Math.pow(2, 1 / 12); //to go up each semitone, multiplying by this value
const SCALE_STEPS = [0, 2, 4, 5, 7, 9, 11, 12]; // do–re–mi–fa–sol–la–si–do
let lastSide = null;
function getAudioCtx() {
  if (!audioCtx) {
    const AC = window.AudioContext;
    audioCtx = new AC();
  }
  return audioCtx;
}
function playSfx(file) {
  if (muted) return;
  const audio = new Audio(file);
  audio.volume = 0.5;
  audio.play().catch(() => {});
}

muteButton.addEventListener("click", () => {
  muted = !muted;
  muteButton.textContent = muted ? "🔇" : "🔈";
});
function playHit(side) {
  if (lastSide !== side) {
    lastSide = side;
    noteSteps[side] = 0;
  } else {
    noteSteps[side] = (noteSteps[side] + 1) % SCALE_STEPS.length;
  }
  if (muted) return;

  const stepIndex = noteSteps[side];
  const semitones = SCALE_STEPS[stepIndex];

  const ctx = getAudioCtx();
  const tone = ctx.createOscillator();
  const fadeOut = ctx.createGain(); //for fade out effect
  const baseFrequency = 261.63; // this is the base frequency for "do"
  const frequency = baseFrequency * Math.pow(SEMITONE, semitones);
  tone.type = "sine";
  tone.frequency.value = frequency;
  const now = ctx.currentTime;
  fadeOut.gain.setValueAtTime(0.3, now);
  fadeOut.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
  tone.connect(fadeOut);
  fadeOut.connect(ctx.destination);
  tone.start(now);
  tone.stop(now + 0.25);
}
function load() {
  const raw = localStorage.getItem("seesawLogs");
  if (!raw) return;
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      logs = parsed;
      getLogs();
    }
  } catch {
    logs = [];
    getLogs();
  }
}
function save() {
  localStorage.setItem("seesawLogs", JSON.stringify(logs));
}
function getLogs() {
  if (!infoPanel) return;
  infoPanel.innerHTML = "";

  if (logs.length === 0) {
    infoPanel.textContent = "No drops recorded yet.";
    return;
  }
  logs.forEach((log) => {
    const row = document.createElement("div");
    row.className = "log-row";
    const side = document.createElement("span");
    side.className = "log-side";
    side.textContent = log.side;
    const dist = document.createElement("span");
    dist.className = "log-distance";
    dist.textContent = `${log.distance}px from center`;
    const weight = document.createElement("span");
    weight.className = "log-weight";
    weight.textContent = `${log.weight} kg`;
    row.appendChild(side);
    row.appendChild(dist);
    row.appendChild(weight);
    infoPanel.appendChild(row);
  });
}

function addLog(weight, signedDist) {
  const side = signedDist < 0 ? "Left" : signedDist > 0 ? "Right" : "Center";

  const entry = {
    side,
    distance: Math.abs(Math.round(signedDist)),
    weight,
  };
  logs.push(entry);
  if (logs.length > 50) {
    logs.shift();
  }
  save();
  getLogs();
}

function clearLogs() {
  logs = [];
  localStorage.removeItem("seesawLogs");
  getLogs();
}
function saveState() {
  const payload = {
    gameStarted,
    leftWeight,
    rightWeight,
    leftTorque,
    rightTorque,
    nextWeightValue,
    isPaused,
    placedWeights,
  };
  try {
    localStorage.setItem(STATE_KEY, JSON.stringify(payload));
  } catch {}
}

function recreateWeights() {
  stand.querySelectorAll(".weight-object").forEach((el) => el.remove());

  const standWidth = stand.clientWidth;
  const standHeight = stand.clientHeight;

  placedWeights.forEach((item) => {
    const w = item.weight;
    const signedDist = item.signedDist;
    const sizeIndex = Math.max(0, Math.min(weights.length - 1, w - 1));
    const sz = sizes[sizeIndex];
    const col = colors[sizeIndex];

    const element = document.createElement("div");
    element.classList.add("weight-object");
    element.style.width = `${sz}px`;
    element.style.height = `${sz}px`;
    element.style.backgroundColor = col;
    element.dataset.weight = w;
    element.textContent = w;

    const xForCss = standWidth / 2 + signedDist;
    element.style.left = `${xForCss - sz / 2}px`;
    const endY = (standHeight - sz) / 2;
    element.style.top = `${endY}px`;

    stand.appendChild(element);
  });
}

const leftWeightSpan = document.getElementById("left-weight");
const rightWeightSpan = document.getElementById("right-weight");
const leftTorqueSpan = document.getElementById("left-torque");
const rightTorqueSpan = document.getElementById("right-torque");

let leftWeight = 0;
let rightWeight = 0;
let leftTorque = 0;
let rightTorque = 0;

function loadState() {
  const raw = localStorage.getItem(STATE_KEY);
  if (!raw) return;

  try {
    const state = JSON.parse(raw);
    if (!state || typeof state !== "object") return;

    gameStarted = !!state.gameStarted;
    leftWeight = state.leftWeight || 0;
    rightWeight = state.rightWeight || 0;
    leftTorque = state.leftTorque || 0;
    rightTorque = state.rightTorque || 0;
    nextWeightValue = state.nextWeightValue ?? null;
    isPaused = !!state.isPaused;
    placedWeights = Array.isArray(state.placedWeights)
      ? state.placedWeights
      : [];

    const diff = rightTorque - leftTorque;
    currentAngle = Math.max(-30, Math.min(30, diff / 10));

    leftWeightSpan.textContent = leftWeight;
    rightWeightSpan.textContent = rightWeight;
    leftTorqueSpan.textContent = Math.round(leftTorque);
    rightTorqueSpan.textContent = Math.round(rightTorque);
    angleSpan.textContent = currentAngle.toFixed(2);

    if (nextWeightValue != null) {
      nextWeightSpan.textContent = nextWeightValue;
    }

    if (gameStarted) {
      gameScene.style.display = "block";
      gameScene.style.pointerEvents = "auto";
      startButton.textContent = "Reset";
      stand.style.transform = `translateX(-50%) rotate(${currentAngle}deg)`;
      recreateWeights();
    }

    if (isPaused) {
      pauseButton.textContent = "▶️";
      pauseText.style.display = "flex";
    } else {
      pauseButton.textContent = "⏸️";
      pauseText.style.display = "none";
    }
  } catch {}
}
load();
loadState();

pauseButton.addEventListener("click", pause);
startButton.addEventListener("click", () => {
  if (!gameStarted) {
    playSfx("sfx/start.mp3");
    gameScene.style.display = "block";
    gameScene.style.pointerEvents = "auto";
    startButton.textContent = "Reset";
    gameStarted = true;
    nextWeight();
    saveState();
  } else {
    playSfx("sfx/reset.mp3");
    resetGame();
  }
});

function pause() {
  isPaused = !isPaused;
  playSfx("sfx/pause.mp3");
  if (isPaused) {
    pauseButton.textContent = "▶️";
    pauseText.style.display = "flex";
  } else {
    pauseButton.textContent = "⏸️";
    pauseText.style.display = "none";
  }
  saveState();
}

function nextWeight() {
  const idx = Math.floor(Math.random() * weights.length);
  nextWeightValue = weights[idx];
  nextWeightSpan.textContent = nextWeightValue ?? "-";
}
stand.addEventListener("click", (event) => {
  if (!gameStarted || isPaused) return;

  const rect = stand.getBoundingClientRect();
  const standWidth = stand.clientWidth;
  const cx = rect.left + rect.width / 2;
  const cy = rect.top + rect.height / 2;
  const dx = event.clientX - cx;
  const dy = event.clientY - cy;
  const angleRad = (currentAngle * Math.PI) / 180;
  const localX = dx * Math.cos(angleRad) + dy * Math.sin(angleRad);
  const xForCss = standWidth / 2 + localX;
  const w = nextWeightValue;
  const sizeIndex = Math.max(0, Math.min(weights.length - 1, w - 1));
  const col = colors[sizeIndex];
  const sz = sizes[sizeIndex];

  const item = document.createElement("div");
  item.classList.add("weight-object");
  item.style.width = `${sz}px`;
  item.style.height = `${sz}px`;
  item.style.backgroundColor = col;
  item.dataset.weight = w;
  item.textContent = w;
  item.style.left = `${xForCss - sz / 2}px`;

  stand.appendChild(item);

  const signedDist = localX;
  const torqueValue = w * Math.abs(signedDist);
  const sideName = signedDist < 0 ? "left" : "right";
  playHit(sideName);
  if (signedDist < 0) {
    leftWeight += w;
    leftWeightSpan.textContent = leftWeight;

    leftTorque += torqueValue;
    leftTorqueSpan.textContent = Math.round(leftTorque);
  } else if (signedDist > 0) {
    rightWeight += w;
    rightWeightSpan.textContent = rightWeight;

    rightTorque += torqueValue;
    rightTorqueSpan.textContent = Math.round(rightTorque);
  }

  placedWeights.push({ weight: w, signedDist });
  addLog(w, signedDist);
  saveState();

  animateFall(item, sz, () => {
    updateAngle();
    nextWeight();
    saveState();
  });
});

function animateFall(element, size, onLanding) {
  const standHeight = stand.clientHeight;
  const endY = (standHeight - size) / 2;
  let currentY = endY - 180;
  const speed = 12;

  function fall() {
    if (isPaused) {
      requestAnimationFrame(fall);
      return;
    }
    currentY += speed;
    if (currentY >= endY) {
      currentY = endY;
      element.style.top = `${currentY}px`;
      if (typeof onLanding === "function") onLanding();
      return;
    }
    element.style.top = `${currentY}px`;
    requestAnimationFrame(fall);
  }
  requestAnimationFrame(fall);
}

function updateAngle() {
  const calcAngle = Math.max(
    -30,
    Math.min(30, (rightTorque - leftTorque) / 10)
  );

  const startAngle = currentAngle;
  const duration = 500;
  const startTime = performance.now();

  if (angleAnimationId) cancelAnimationFrame(angleAnimationId);

  function animate(now) {
    if (isPaused) {
      angleAnimationId = requestAnimationFrame(animate);
      return;
    }
    const t = Math.min(1, (now - startTime) / duration);
    const eased = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;

    currentAngle = startAngle + (calcAngle - startAngle) * eased;

    stand.style.transform = `translateX(-50%) rotate(${currentAngle}deg)`;
    angleSpan.textContent = currentAngle.toFixed(2);

    if (t < 1) {
      angleAnimationId = requestAnimationFrame(animate);
    }
  }

  angleAnimationId = requestAnimationFrame(animate);
}
function resetGame() {
  stand.querySelectorAll(".weight-object").forEach((el) => el.remove());

  leftWeight = rightWeight = 0;
  leftTorque = rightTorque = 0;
  placedWeights = [];

  leftWeightSpan.textContent = "0";
  rightWeightSpan.textContent = "0";
  leftTorqueSpan.textContent = "0";
  rightTorqueSpan.textContent = "0";
  angleSpan.textContent = "0";

  if (angleAnimationId) cancelAnimationFrame(angleAnimationId);
  currentAngle = 0;

  stand.style.transform = `translateX(-50%) rotate(0deg)`;

  gameScene.style.display = "none";
  gameScene.style.pointerEvents = "none";

  startButton.textContent = "Start";
  isPaused = false;
  pauseButton.textContent = "⏸️";
  pauseText.style.display = "none";
  gameStarted = false;

  clearLogs();
  localStorage.removeItem(STATE_KEY);
}
