const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const restartBtn = document.getElementById('restartBtn');
const pauseBtn = document.getElementById('pauseBtn');
pauseBtn.addEventListener('click', () => {
  if (gameOver) return;
  isPaused = !isPaused;
  if (!isPaused) animate();
  pauseBtn.textContent = isPaused ? '▶️ Resume' : '⏸ Pause';
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    if (gameOver) return;
    isPaused = !isPaused;
    if (!isPaused) animate();
    pauseBtn.textContent = isPaused ? '▶️ Resume' : '⏸ Pause';
  }
});

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

let balloons = [];
let level = 1;
let score = 0;
let targetScore = 50;
let gameOver = false;
let gameWon = false;
let isPaused = false;


class Balloon {
  constructor() {
    this.reset();
  }

  reset() {
    this.x = Math.random() * canvas.width;
    this.y = canvas.height + Math.random() * 200;
    this.radius = 20 + Math.random() * 20;
    this.color = `hsl(${Math.random() * 360}, 70%, 60%)`;
    this.speed = 1 + Math.random() * 2; 

    this.popped = false;
    this.popTime = 0;
  }

  update() {
    if (gameOver || gameWon) return;

    if (!this.popped) {
      this.y -= this.speed;
      if (this.y + this.radius < 0) {
        gameOver = true;
        showRestartButton();
      }
    } else {
      const now = Date.now();
      if (now - this.popTime > 400) {
        this.reset();
      }
    }
  }

  draw() {
    if (!this.popped) {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fillStyle = this.color;
      ctx.fill();
    }
  }

  pop() {
    this.popped = true;
    this.popTime = Date.now();
  }

  isVisibleAndFullyInView() {
    return (
      !this.popped &&
      this.y - this.radius > 0 &&
      this.y + this.radius < canvas.height
    );
  }
}

function createBalloons(count) {
  balloons = [];
  for (let i = 0; i < count; i++) {
    balloons.push(new Balloon());
  }
}

// Start level
function startLevel() {
  score = 0;
  gameOver = false;
  gameWon = false;
  restartBtn.style.display = 'none';
  targetScore = level * 50;
  const balloonCount = 20 + level * 10;
  createBalloons(balloonCount);
  animate();
  pauseBtn.style.display = 'block'; // 👈 show pause button again
  pauseBtn.textContent = '⏸ Pause'; // reset text
  isPaused = false; // reset paused state

}

// Restart button
function showRestartButton() {
  restartBtn.style.display = 'block';
  pauseBtn.style.display = 'none'; // 👈 hide pause button
}

restartBtn.addEventListener('click', () => {
  if (gameOver) {
    level = 1;
  } else if (gameWon) {
    level++;
  }
  startLevel();
});

canvas.addEventListener('mousedown', (event) => {
  if (gameOver || isPaused) return;

  // Left click (0) or Right click (2)
  if (event.button === 0 || event.button === 2) {
    const visibleBalloons = balloons
      .filter(b => b.isVisibleAndFullyInView())
      .sort((a, b) => a.y - b.y); // prioritize top-most

    const target = visibleBalloons[0];
    if (target) {
      target.pop();
      score++;

      if (score >= targetScore) {
        level++;
        score = 0;
        targetScore = level * 50;
        const newCount = 20 + level * 10;
        createBalloons(newCount);
        showLevelMood(level);
      }
    }
  }
});

canvas.addEventListener('contextmenu', (e) => e.preventDefault());

function drawHUD() {
  ctx.fillStyle = '#000';
  ctx.font = '20px Arial';
  ctx.textAlign = 'left';
  ctx.fillText(`Score: ${score} / ${targetScore}`, 20, 30);
  ctx.fillText(`Level: ${level} ${getLevelEmoji(level)}`, 20, 60);

}

function drawOverlay(text) {
  ctx.fillStyle = 'rgba(0,0,0,0.6)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 50px Arial';
  ctx.textAlign = 'center';
  ctx.fillText(text, canvas.width / 2, canvas.height / 2);
}

function getLevelEmoji(level) {
  const emojis = ['😄', '🤪', '😤', '😠', '😎', '😰', '🤯', '🥵', '😵‍💫'];
  return level <= emojis.length ? emojis[level - 1] : '💀';
}

function getLevelMood(level) {
  const moods = [
    { emoji: '😄', name: 'Happy' },
    { emoji: '🤪', name: 'Wacky' },
    { emoji: '😤', name: 'Determined' },
    { emoji: '😠', name: 'Angry' },
    { emoji: '😎', name: 'Cool' },
    { emoji: '😰', name: 'Nervous' },
    { emoji: '🤯', name: 'Mind-blown' },
    { emoji: '🥵', name: 'Overheated' },
    { emoji: '😵‍💫', name: 'Dizzy' },
  ];
  return level <= moods.length ? moods[level - 1] : { emoji: '💀', name: 'Insane' };
}

function showLevelMood(level) {
  const mood = getLevelMood(level);
  const moodEl = document.getElementById('levelMood');
  moodEl.textContent = `${mood.emoji} ${mood.name}!`;

  // Trigger animation
  moodEl.style.transform = 'translate(-50%, -50%) scale(1)';
  moodEl.style.opacity = '1';

  setTimeout(() => {
    moodEl.style.transform = 'translate(-50%, -50%) scale(0)';
    moodEl.style.opacity = '0';
  }, 1000); // 0.3 seconds
}

function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  balloons.forEach(b => {
    b.update();
    b.draw();
  });

  drawHUD();

  if (gameOver) {
    drawOverlay('💥 Game Over 💥');
    return;
  }

  if (gameWon) {
    drawOverlay(`🎉 Level ${level} Complete!`);
    return;
  }

  if (isPaused) {
  drawOverlay('⏸ Paused');
  return;
}

  requestAnimationFrame(animate);
}

// Start the game
startLevel();
