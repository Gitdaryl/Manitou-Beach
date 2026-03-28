// celebrate.js — shared celebration effects (confetti, haptic, etc.)

const CONFETTI_COLORS = [
  '#C44D3F', '#E07060', '#D4845A', '#C4A035', '#7A8E72',
  '#4A7FB5', '#7B5EA7', '#E84393', '#00B894', '#FDCB6E',
  '#6C5CE7', '#00CEC9',
];

export function launchConfetti(count = 80) {
  const canvas = document.createElement('canvas');
  canvas.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:99999';
  document.body.appendChild(canvas);
  const ctx = canvas.getContext('2d');
  canvas.width = window.innerWidth * 2;
  canvas.height = window.innerHeight * 2;
  ctx.scale(2, 2);
  const W = window.innerWidth, H = window.innerHeight;
  const particles = Array.from({ length: count }, () => ({
    x: W / 2 + (Math.random() - 0.5) * 60,
    y: H * 0.35,
    vx: (Math.random() - 0.5) * 14,
    vy: -Math.random() * 16 - 4,
    r: Math.random() * 6 + 3,
    color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
    rot: Math.random() * 360,
    rv: (Math.random() - 0.5) * 12,
    shape: Math.random() > 0.5 ? 'circle' : 'rect',
  }));
  let frame = 0;
  const draw = () => {
    ctx.clearRect(0, 0, W, H);
    let alive = false;
    particles.forEach(p => {
      p.x += p.vx;
      p.vy += 0.35;
      p.y += p.vy;
      p.vx *= 0.98;
      p.rot += p.rv;
      if (p.y < H + 40) alive = true;
      const alpha = Math.max(0, 1 - frame / 90);
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate((p.rot * Math.PI) / 180);
      ctx.globalAlpha = alpha;
      ctx.fillStyle = p.color;
      if (p.shape === 'circle') {
        ctx.beginPath(); ctx.arc(0, 0, p.r, 0, Math.PI * 2); ctx.fill();
      } else {
        ctx.fillRect(-p.r, -p.r * 0.5, p.r * 2, p.r);
      }
      ctx.restore();
    });
    frame++;
    if (alive && frame < 100) requestAnimationFrame(draw);
    else canvas.remove();
  };
  requestAnimationFrame(draw);
}

export function hapticBuzz(pattern = [80, 40, 120]) {
  if (navigator.vibrate) navigator.vibrate(pattern);
}

export function celebrate(confettiCount = 80) {
  hapticBuzz();
  launchConfetti(confettiCount);
}
