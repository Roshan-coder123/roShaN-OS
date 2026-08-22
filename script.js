let username = "Innovator";

function showScreen(id) {
  document.querySelectorAll(".screen").forEach(s => s.classList.remove("active"));
  document.getElementById(id).classList.add("active");
}
function goToLogin() {
  showScreen("login-screen");
}

window.addEventListener("DOMContentLoaded", () => {
  showScreen("boot-screen");

  const bootTimer = setTimeout(goToLogin, 4700);

  const skipBoot = () => {
    clearTimeout(bootTimer);
    goToLogin();
    document.removeEventListener("keydown", skipBoot);
    document.getElementById("boot-screen").removeEventListener("click", skipBoot);
  };
  document.addEventListener("keydown", skipBoot);
  document.getElementById("boot-screen").addEventListener("click", skipBoot);
  document.getElementById("login-btn").addEventListener("click", loginUser);
  document.getElementById("username-input").addEventListener("keydown", e => {
    if (e.key === "Enter") loginUser();
  });

  startClock();
});

function loginUser() {
  const input = document.getElementById("username-input");
  const val = input.value.trim();
  if (val.length > 0) username = val;

  document.getElementById("welcome-name").textContent = username;
  document.getElementById("user-display").textContent = username;

  showScreen("desktop");
  document.getElementById("welcome-popup").style.display = "block";
}

function startClock() {
  updateClock();
  setInterval(updateClock, 1000 * 30);
}
function updateClock() {
  const now = new Date();
  let h = now.getHours();
  const m = now.getMinutes().toString().padStart(2, "0");
  const ampm = h >= 12 ? "PM" : "AM";
  h = h % 12 || 12;
  document.getElementById("clock").textContent = `${h}:${m} ${ampm}`;
}

function openApp(name) {
  const win = document.getElementById("win-" + name);
  if (!win) return;
  win.classList.add("active");

  const openCount = document.querySelectorAll(".window.active").length;
  win.style.top = (70 + openCount * 20) + "px";
  win.style.left = (60 + openCount * 20) + "px";

  if (name === "ttt" && !window._tttInit) initTTT();
  if (name === "calc") document.getElementById("calc-display").value = calcExpr;
}

function setupWindowDragging() {
  const desktop = document.getElementById("desktop");
  document.querySelectorAll(".window").forEach(win => {
    const header = win.querySelector(".window-header");
    if (!header) return;
    header.addEventListener("pointerdown", event => {
      if (event.target.closest("button")) return;

    const desktopRect = desktop.getBoundingClientRect();
      const windowRect = win.getBoundingClientRect();
  const offsetX = event.clientX - windowRect.left;
     const offsetY = event.clientY - windowRect.top;   const maxX = Math.max(0, desktopRect.width - windowRect.width);
    const maxY = Math.max(0, desktopRect.height - windowRect.height - 45);

      win.style.zIndex = String(++window._topWindowIndex);
      header.setPointerCapture(event.pointerId);
    header.classList.add("dragging");

      const moveWindow = moveEvent => {
        const left = Math.min(maxX, Math.max(0, moveEvent.clientX - desktopRect.left - offsetX));
       const top = Math.min(maxY, Math.max(0, moveEvent.clientY - desktopRect.top - offsetY));
        win.style.left = left + "px";
        win.style.top = top + "px";
      };

      const stopDragging = () => {
    header.releasePointerCapture(event.pointerId);
     header.classList.remove("dragging");
        header.removeEventListener("pointermove", moveWindow);
     header.removeEventListener("pointerup", stopDragging);
      header.removeEventListener("pointercancel", stopDragging);
      };

      header.addEventListener("pointermove", moveWindow);
      header.addEventListener("pointerup", stopDragging);
      header.addEventListener("pointercancel", stopDragging);
    });
  });
}

window._topWindowIndex = 100;
document.addEventListener("DOMContentLoaded", setupWindowDragging);

function closeApp(name) {
  const win = document.getElementById("win-" + name);
  if (win) win.classList.remove("active");
}

function minimizeApp(name) {
  closeApp(name);
}

let playing = false;
document.addEventListener("DOMContentLoaded", () => {
  const playBtn = document.getElementById("play-btn");
  const viz = document.querySelector(".visualizer");
  if (playBtn) {
    playBtn.addEventListener("click", () => {
      playing = !playing;
      playBtn.textContent = playing ? "⏸" : "▶";
      viz.classList.toggle("paused", !playing);
    });
    viz.classList.add("paused");
  }

  const musicSelect = document.getElementById("music-select");
  const musicAudio = document.getElementById("music-audio");
  if (musicSelect && musicAudio) {
    musicSelect.addEventListener("change", () => {
      musicAudio.pause();
  musicAudio.src = musicSelect.value;
      musicAudio.load();
    });
  }
});

let snakeCtx, snakeInterval;
let snake, snakeDir, food, snakeScore;
const GRID = 15;

function startSnake() {
  const canvas = document.getElementById("snake-canvas");
  snakeCtx = canvas.getContext("2d");

  snake = [{ x: 6, y: 6 }, { x: 5, y: 6 }, { x: 4, y: 6 }];
  snakeDir = { x: 1, y: 0 };
  snakeScore = 0;
  document.getElementById("snake-score").textContent = snakeScore;
  placeFood();

  if (snakeInterval) clearInterval(snakeInterval);
  snakeInterval = setInterval(snakeTick, 130);
}

function placeFood() {
  food = {
    x: Math.floor(Math.random() * 20),
    y: Math.floor(Math.random() * 20)
  };
  const onSnake = snake.some(s => s.x === food.x && s.y === food.y);
  if (onSnake) placeFood();
}

function snakeTick() {
  const head = { x: snake[0].x + snakeDir.x, y: snake[0].y + snakeDir.y };

  const hitWall = head.x < 0 || head.x >= 20 || head.y < 0 || head.y >= 20;
  const hitSelf = snake.some(s => s.x === head.x && s.y === head.y);
  if (hitWall || hitSelf) {
    clearInterval(snakeInterval);
    snakeCtx.fillStyle = "#f0f";
    snakeCtx.font = "16px monospace";
    snakeCtx.fillText("game over", 90, 150);
    return;
  }

  snake.unshift(head);

  if (head.x === food.x && head.y === food.y) {
    snakeScore++;
    document.getElementById("snake-score").textContent = snakeScore;
    placeFood();
  } else {
    snake.pop();
  }

  drawSnake();
}

function drawSnake() {
  snakeCtx.fillStyle = "#000";
  snakeCtx.fillRect(0, 0, 300, 300);

  snakeCtx.fillStyle = "#f0f";
  snakeCtx.fillRect(food.x * GRID, food.y * GRID, GRID - 1, GRID - 1);

  snake.forEach((s, i) => {
    snakeCtx.fillStyle = i === 0 ? "#0ff" : "#0af";
    snakeCtx.fillRect(s.x * GRID, s.y * GRID, GRID - 1, GRID - 1);
  });
}

document.addEventListener("keydown", e => {
  if (!snakeDir) return;
  if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) {
    e.preventDefault();
  }
  if (e.key === "ArrowUp" && snakeDir.y !== 1) snakeDir = { x: 0, y: -1 };
  if (e.key === "ArrowDown" && snakeDir.y !== -1) snakeDir = { x: 0, y: 1 };
  if (e.key === "ArrowLeft" && snakeDir.x !== 1) snakeDir = { x: -1, y: 0 };
  if (e.key === "ArrowRight" && snakeDir.x !== -1) snakeDir = { x: 1, y: 0 };
});

let tttBoard = Array(9).fill("");
let tttTurn = "X";
window._tttInit = false;

function initTTT() {
  window._tttInit = true;
  const boardEl = document.getElementById("ttt-board");
  boardEl.innerHTML = "";
  for (let i = 0; i < 9; i++) {
    const cell = document.createElement("div");
    cell.className = "ttt-cell";
    cell.dataset.index = i;
    cell.addEventListener("click", () => tttClick(i));
    boardEl.appendChild(cell);
  }
}

function tttClick(i) {
  if (tttBoard[i] !== "" || tttTurn !== "X") return;
  tttBoard[i] = "X";
  renderTTT();

  const winner = checkTTTWinner();
  if (winner) return endTTT(winner);
  if (!tttBoard.includes("")) return endTTT("draw");

  tttTurn = "O";
  document.getElementById("ttt-status").textContent = "computer thinking...";
  setTimeout(computerMove, 400);
}

function computerMove() {
  const empty = tttBoard.map((v, i) => v === "" ? i : null).filter(v => v !== null);
  if (empty.length === 0) return;
  const pick = empty[Math.floor(Math.random() * empty.length)];
  tttBoard[pick] = "O";
  renderTTT();

  const winner = checkTTTWinner();
  if (winner) return endTTT(winner);
  if (!tttBoard.includes("")) return endTTT("draw");

  tttTurn = "X";
  document.getElementById("ttt-status").textContent = "your turn (X)";
}

function renderTTT() {
  document.querySelectorAll(".ttt-cell").forEach((cell, i) => {
    cell.textContent = tttBoard[i];
  });
}

function checkTTTWinner() {
  const lines = [
    [0,1,2],[3,4,5],[6,7,8],
    [0,3,6],[1,4,7],[2,5,8],
    [0,4,8],[2,4,6]
  ];
  for (const [a,b,c] of lines) {
    if (tttBoard[a] && tttBoard[a] === tttBoard[b] && tttBoard[a] === tttBoard[c]) {
      return tttBoard[a];
    }
  }
  return null;
}

function endTTT(result) {
  const status = document.getElementById("ttt-status");
  if (result === "draw") status.textContent = "it's a draw";
  else status.textContent = result === "X" ? "you win! 🎉" : "computer wins";
  tttTurn = null;
}

function resetTTT() {
  tttBoard = Array(9).fill("");
  tttTurn = "X";
  document.getElementById("ttt-status").textContent = "your turn (X)";
  renderTTT();
}

let calcExpr = "";

function calcPress(val) {
  calcExpr += val;
  document.getElementById("calc-display").value = calcExpr;
}

function calcBack() {
  calcExpr = calcExpr.slice(0, -1);
  document.getElementById("calc-display").value = calcExpr;
}

function calcClear() {
  calcExpr = "";
  document.getElementById("calc-display").value = "";
}

function calcEqual() {
  try {
    if (!/^[0-9+\-*/.\s]+$/.test(calcExpr)) throw new Error("bad input");
    const result = Function('"use strict"; return (' + calcExpr + ')')();
    calcExpr = String(result);
    document.getElementById("calc-display").value = calcExpr;
  } catch (err) {
    document.getElementById("calc-display").value = "error";
    calcExpr = "";
  }
}

window.addEventListener("DOMContentLoaded", () => {
  const saved = localStorage.getItem("roshanos-notes");
  if (saved) document.getElementById("notes-area").value = saved;
});

function saveNotes() {
  const text = document.getElementById("notes-area").value;
  localStorage.setItem("roshanos-notes", text);
  const status = document.getElementById("notes-status");
  status.textContent = "saved ✓";
  setTimeout(() => status.textContent = "", 1500);
}

function setWallpaper(type) {
  const desktop = document.getElementById("desktop");
  desktop.classList.remove("wallpaper-grid", "wallpaper-stars", "wallpaper-circuit");
  if (type !== "default") desktop.classList.add("wallpaper-" + type);
}

function setAccent(color) {
  document.querySelectorAll(".os-title, #clock").forEach(el => {
    el.style.color = color;
    el.style.textShadow = `0 0 10px ${color}`;
  });
  document.querySelectorAll(".window").forEach(el => {
    el.style.borderColor = color;
    el.style.boxShadow = `0 0 25px ${color}`;
  });
  document.querySelectorAll(".window-header").forEach(el => {
    el.style.borderBottomColor = color;
  });
}
if (false) {
let username = "Innovator";

function showScreen(id) {
  document.querySelectorAll(".screen").forEach(s => s.classList.remove("active"));
  document.getElementById(id).classList.add("active");
}

function goToLogin() {
  showScreen("login-screen");
}

window.addEventListener("DOMContentLoaded", () => {
  showScreen("boot-screen");

  const bootTimer = setTimeout(goToLogin, 4700);

  function skipBoot() {
    clearTimeout(bootTimer);
    goToLogin();
    document.removeEventListener("keydown", skipBoot);
    document.getElementById("boot-screen").removeEventListener("click", skipBoot);
  }
  document.addEventListener("keydown", skipBoot);
  document.getElementById("boot-screen").addEventListener("click", skipBoot);

  document.getElementById("login-btn").addEventListener("click", loginUser);
  document.getElementById("username-input").addEventListener("keydown", function (e) {
    if (e.key === "Enter") loginUser();
  });

  startClock();
});

function loginUser() {
  const input = document.getElementById("username-input");
  const val = input.value.trim();
  if (val.length > 0) username = val;

  document.getElementById("welcome-name").textContent = username;
  document.getElementById("user-display").textContent = username;

  showScreen("desktop");
  document.getElementById("welcome-popup").style.display = "block";
}

function startClock() {
  updateClock();
  setInterval(updateClock, 30000);
}

function updateClock() {
  const now = new Date();
  let h = now.getHours();
  const m = now.getMinutes().toString().padStart(2, "0");
  const ampm = h >= 12 ? "PM" : "AM";
  h = h % 12 || 12;
  document.getElementById("clock").textContent = h + ":" + m + " " + ampm;
}

function openApp(name) {
  const win = document.getElementById("win-" + name);
  if (!win) return;
  win.classList.add("active");

  const openCount = document.querySelectorAll(".window.active").length;
  win.style.top = 70 + openCount * 20 + "px";
  win.style.left = 60 + openCount * 20 + "px";

  if (name === "ttt" && !window._tttInit) initTTT();
  if (name === "calc") document.getElementById("calc-display").value = calcExpr;
}

function closeApp(name) {
  const win = document.getElementById("win-" + name);
  if (win) win.classList.remove("active");
}

function minimizeApp(name) {
  const win = document.getElementById("win-" + name);
  if (win) win.classList.remove("active");
}

let playing = false;

document.addEventListener("DOMContentLoaded", () => {
  const playBtn = document.getElementById("play-btn");
  const viz = document.querySelector(".visualizer");
  if (playBtn) {
    playBtn.addEventListener("click", () => {
      playing = !playing;
      playBtn.textContent = playing ? "⏸" : "▶";
      viz.classList.toggle("paused", !playing);
    });
    viz.classList.add("paused");
  }
});

document.addEventListener("DOMContentLoaded", () => {
  const musicSelect = document.getElementById("music-select");
  const musicAudio = document.getElementById("music-audio");
  if (!musicSelect || !musicAudio) return;

  musicSelect.addEventListener("change", () => {
    musicAudio.pause();
    musicAudio.src = musicSelect.value;
    musicAudio.load();
  });
});

let snakeCtx, snakeInterval;
let snake, snakeDir, food, snakeScore;
const GRID = 15;

function startSnake() {
  const canvas = document.getElementById("snake-canvas");
  snakeCtx = canvas.getContext("2d");

  snake = [{ x: 6, y: 6 }, { x: 5, y: 6 }, { x: 4, y: 6 }];
  snakeDir = { x: 1, y: 0 };
  snakeScore = 0;
  document.getElementById("snake-score").textContent = snakeScore;
  placeFood();

  if (snakeInterval) clearInterval(snakeInterval);
  snakeInterval = setInterval(snakeTick, 130);
}

function placeFood() {
  food = {
    x: Math.floor(Math.random() * 20),
    y: Math.floor(Math.random() * 20),
  };

  const onSnake = snake.some(s => s.x === food.x && s.y === food.y);
  if (onSnake) placeFood();
}

function snakeTick() {
  const head = { x: snake[0].x + snakeDir.x, y: snake[0].y + snakeDir.y };

  const hitWall = head.x < 0 || head.x >= 20 || head.y < 0 || head.y >= 20;
  const hitSelf = snake.some(s => s.x === head.x && s.y === head.y);
  if (hitWall || hitSelf) {
    clearInterval(snakeInterval);
    snakeCtx.fillStyle = "#f0f";
    snakeCtx.font = "16px monospace";
    snakeCtx.fillText("game over", 90, 150);
    return;
  }

  snake.unshift(head);

  if (head.x === food.x && head.y === food.y) {
    snakeScore++;
    document.getElementById("snake-score").textContent = snakeScore;
    placeFood();
  } else {
    snake.pop();
  }

  drawSnake();
}

function drawSnake() {
  snakeCtx.fillStyle = "#000";
  snakeCtx.fillRect(0, 0, 300, 300);

  snakeCtx.fillStyle = "#f0f";
  snakeCtx.fillRect(food.x * GRID, food.y * GRID, GRID - 1, GRID - 1);

  snake.forEach((s, i) => {
    snakeCtx.fillStyle = i === 0 ? "#0ff" : "#0af";
    snakeCtx.fillRect(s.x * GRID, s.y * GRID, GRID - 1, GRID - 1);
  });
}

document.addEventListener("keydown", e => {
  if (!snakeDir) return;

  if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) {
    e.preventDefault(); 
  }
  if (e.key === "ArrowUp" && snakeDir.y !== 1) snakeDir = { x: 0, y: -1 };
  if (e.key === "ArrowDown" && snakeDir.y !== -1) snakeDir = { x: 0, y: 1 };
  if (e.key === "ArrowLeft" && snakeDir.x !== 1) snakeDir = { x: -1, y: 0 };
  if (e.key === "ArrowRight" && snakeDir.x !== -1) snakeDir = { x: 1, y: 0 };
});

let tttBoard = Array(9).fill("");
let tttTurn = "X";
window._tttInit = false;

function initTTT() {
  window._tttInit = true;
  const boardEl = document.getElementById("ttt-board");
  boardEl.innerHTML = "";
  for (let i = 0; i < 9; i++) {
    const cell = document.createElement("div");
    cell.className = "ttt-cell";
    cell.dataset.index = i;
    cell.addEventListener("click", () => tttClick(i));
    boardEl.appendChild(cell);
  }
}

function tttClick(i) {
  if (tttBoard[i] !== "" || tttTurn !== "X") return;
  tttBoard[i] = "X";
  renderTTT();

  const winner = checkTTTWinner();
  if (winner) return endTTT(winner);
  if (!tttBoard.includes("")) return endTTT("draw");

  tttTurn = "O";
  document.getElementById("ttt-status").textContent = "computer thinking...";
  setTimeout(computerMove, 400); 
}

function computerMove() {
  const empty = tttBoard.map((v, i) => (v === "" ? i : null)).filter(v => v !== null);
  if (empty.length === 0) return;
  const pick = empty[Math.floor(Math.random() * empty.length)];
  tttBoard[pick] = "O";
  renderTTT();

  const winner = checkTTTWinner();
  if (winner) return endTTT(winner);
  if (!tttBoard.includes("")) return endTTT("draw");

  tttTurn = "X";
  document.getElementById("ttt-status").textContent = "your turn (X)";
}

function renderTTT() {
  document.querySelectorAll(".ttt-cell").forEach((cell, i) => {
    cell.textContent = tttBoard[i];
  });
}

function checkTTTWinner() {
  const lines = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    [0, 4, 8], [2, 4, 6],
  ];
  for (const [a, b, c] of lines) {
    if (tttBoard[a] && tttBoard[a] === tttBoard[b] && tttBoard[a] === tttBoard[c]) {
      return tttBoard[a];
    }
  }
  return null;
}

function endTTT(result) {
  const status = document.getElementById("ttt-status");
  if (result === "draw") status.textContent = "it's a draw";
  else status.textContent = result === "X" ? "you win! 🎉" : "computer wins";
  tttTurn = null; 
}

function resetTTT() {
  tttBoard = Array(9).fill("");
  tttTurn = "X";
  document.getElementById("ttt-status").textContent = "your turn (X)";
  renderTTT();
}

let calcExpr = "";

function calcPress(val) {
  calcExpr += val;
  document.getElementById("calc-display").value = calcExpr;
}

function calcBack() {
  calcExpr = calcExpr.slice(0, -1);
  document.getElementById("calc-display").value = calcExpr;
}

function calcClear() {
  calcExpr = "";
  document.getElementById("calc-display").value = "";
}

function calcEqual() {
  try {
    if (!/^[0-9+\-*/.\s]+$/.test(calcExpr)) throw new Error("bad input");
    const result = Function('"use strict"; return (' + calcExpr + ")")();
    calcExpr = String(result);
    document.getElementById("calc-display").value = calcExpr;
  } catch (err) {
    document.getElementById("calc-display").value = "error";
    calcExpr = "";
  }
}


window.addEventListener("DOMContentLoaded", () => {
  const saved = localStorage.getItem("roshanos-notes");
  if (saved) document.getElementById("notes-area").value = saved;
});

function saveNotes() {
  const text = document.getElementById("notes-area").value;
  localStorage.setItem("roshanos-notes", text);
  const status = document.getElementById("notes-status");
  status.textContent = "saved ✓";
  setTimeout(() => (status.textContent = ""), 1500);
}


function setWallpaper(type) {
  const desktop = document.getElementById("desktop");
  desktop.classList.remove("wallpaper-grid", "wallpaper-stars", "wallpaper-circuit");
  if (type !== "default") desktop.classList.add("wallpaper-" + type);
}

function setAccent(color) {
  document.querySelectorAll(".os-title, #clock").forEach(el => {
    el.style.color = color;
    el.style.textShadow = "0 0 10px " + color;
  });
  document.querySelectorAll(".window").forEach(el => {
    el.style.borderColor = color;
    el.style.boxShadow = "0 0 25px " + color;
  });
  document.querySelectorAll(".window-header").forEach(el => {
    el.style.borderBottomColor = color;
  });
}
}
