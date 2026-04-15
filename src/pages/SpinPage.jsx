import { useState, useEffect, useRef, useCallback } from 'react';

// ============================================================
// PHYSICS CONSTANTS - match the prototype feel
// ============================================================
const FRICTION = 0.994;
const FRICTION_SLOW = 0.988;
const FRICTION_CRAWL = 0.982;
const MIN_VELOCITY = 0.0006;
const FLAPPER_BOUNCE = 0.0015;
const MIN_RELEASE_SPEED = 0.18;
const MAX_RELEASE_SPEED = 0.7;

const SPIN_COLORS = ['#4ecdc4', '#f39c12', '#2ecc71'];

// Build equal-size segment angles from a flat list
function buildSegments(prizes) {
  const count = prizes.length;
  const sweep = (Math.PI * 2) / count;
  return prizes.map((p, i) => ({ ...p, startAngle: i * sweep, endAngle: (i + 1) * sweep, sweep }));
}

// Check daily gate
function hasSpunTodayCheck() {
  try {
    const last = localStorage.getItem('mb_spin_date');
    if (!last) return false;
    const lastMidnight = new Date(last);
    lastMidnight.setHours(0, 0, 0, 0);
    const todayMidnight = new Date();
    todayMidnight.setHours(0, 0, 0, 0);
    return lastMidnight.getTime() >= todayMidnight.getTime();
  } catch { return false; }
}

function markSpunToday() {
  try { localStorage.setItem('mb_spin_date', new Date().toISOString()); } catch {}
}

export default function SpinPage() {
  const [segments, setSegments] = useState([]);
  const [loadError, setLoadError] = useState('');
  const [hint, setHint] = useState('Grab the wheel and flick it - you control the spin');
  const [hintVisible, setHintVisible] = useState(true);
  const [phase, setPhase] = useState('idle'); // idle | spinning | won | spin-again | tomorrow | claimed | done
  const [winSeg, setWinSeg] = useState(null);
  const [email, setEmail] = useState('');
  const [claiming, setClaiming] = useState(false);
  const [claimError, setClaimError] = useState('');
  const [claimCode, setClaimCode] = useState('');
  const [blockedToday, setBlockedToday] = useState(false);
  const [confettiPieces, setConfettiPieces] = useState([]);

  const canvasRef = useRef(null);
  const confettiRef = useRef(null);
  const rafRef = useRef(null);
  const audioCtxRef = useRef(null);
  const segmentsRef = useRef([]);
  const phys = useRef({
    rotation: 0,
    angularVelocity: 0,
    isDragging: false,
    lastAngle: 0,
    lastTime: 0,
    dragVelocities: [],
    isSpinning: false,
    lastTickSegment: -1,
    hasSpun: false,
    spinDone: false,
  });
  const confettiStateRef = useRef([]);
  const phaseRef = useRef('idle');

  // Keep phaseRef in sync
  useEffect(() => { phaseRef.current = phase; }, [phase]);

  // Load segments from API
  useEffect(() => {
    fetch('/api/prize-wheel/sponsors')
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data) && data.length) {
          const built = buildSegments(data);
          segmentsRef.current = built;
          setSegments(built);
        } else {
          setLoadError('Wheel is warming up - check back in a minute.');
        }
      })
      .catch(() => setLoadError('Couldn\'t load the wheel right now. Refresh and try again.'));

    setBlockedToday(hasSpunTodayCheck());
  }, []);

  // ── AUDIO ──
  const initAudio = useCallback(() => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
  }, []);

  const playTick = useCallback((loud) => {
    const ctx = audioCtxRef.current;
    if (!ctx) return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain); gain.connect(ctx.destination);
      osc.frequency.value = loud ? 800 : 1200;
      osc.type = 'triangle';
      gain.gain.setValueAtTime(loud ? 0.12 : 0.06, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + (loud ? 0.12 : 0.06));
      osc.start(); osc.stop(ctx.currentTime + 0.15);
    } catch {}
  }, []);

  const playWin = useCallback(() => {
    const ctx = audioCtxRef.current;
    if (!ctx) return;
    try {
      [523, 659, 784, 1047].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain); gain.connect(ctx.destination);
        osc.frequency.value = freq; osc.type = 'sine';
        const t = ctx.currentTime + i * 0.12;
        gain.gain.setValueAtTime(0, t);
        gain.gain.linearRampToValueAtTime(0.15, t + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.4);
        osc.start(t); osc.stop(t + 0.5);
      });
    } catch {}
  }, []);

  const playSpinAgain = useCallback(() => {
    const ctx = audioCtxRef.current;
    if (!ctx) return;
    try {
      [660, 880, 1100].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain); gain.connect(ctx.destination);
        osc.frequency.value = freq; osc.type = 'square';
        const t = ctx.currentTime + i * 0.08;
        gain.gain.setValueAtTime(0.08, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
        osc.start(t); osc.stop(t + 0.2);
      });
    } catch {}
  }, []);

  // ── CONFETTI ──
  const launchConfetti = useCallback(() => {
    const colors = ['#ff6b35', '#e74c3c', '#f39c12', '#2ecc71', '#3498db', '#9b59b6', '#fff'];
    confettiStateRef.current = Array.from({ length: 120 }, () => ({
      x: window.innerWidth / 2 + (Math.random() - 0.5) * 200,
      y: window.innerHeight / 2,
      vx: (Math.random() - 0.5) * 16,
      vy: -Math.random() * 18 - 4,
      w: Math.random() * 10 + 4,
      h: Math.random() * 6 + 3,
      color: colors[Math.floor(Math.random() * colors.length)],
      rotation: Math.random() * Math.PI * 2,
      rotSpeed: (Math.random() - 0.5) * 0.3,
      life: 1,
    }));
  }, []);

  // ── DRAWING ──
  const drawWheel = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const segs = segmentsRef.current;
    if (!segs.length) return;

    const W = canvas.width, H = canvas.height;
    const CX = W / 2, CY = H / 2;
    const RADIUS = Math.min(W, H) / 2 - 12;
    const rot = phys.current.rotation;

    ctx.clearRect(0, 0, W, H);
    ctx.save();
    ctx.translate(CX, CY);
    ctx.rotate(rot);

    for (const seg of segs) {
      // Segment fill
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, RADIUS, seg.startAngle, seg.endAngle);
      ctx.closePath();
      ctx.fillStyle = seg.color;
      ctx.fill();

      // Overlay gradient
      if (seg.type === 'tomorrow') {
        const g = ctx.createRadialGradient(0, 0, RADIUS * 0.2, 0, 0, RADIUS);
        g.addColorStop(0, 'rgba(0,0,0,0.15)');
        g.addColorStop(1, 'rgba(0,0,0,0.35)');
        ctx.fillStyle = g; ctx.fill();
      } else if (seg.type === 'spin-again') {
        const g = ctx.createRadialGradient(0, 0, RADIUS * 0.3, 0, 0, RADIUS);
        g.addColorStop(0, 'rgba(255,255,255,0.15)');
        g.addColorStop(1, 'rgba(255,255,255,0.02)');
        ctx.fillStyle = g; ctx.fill();
      } else {
        const g = ctx.createRadialGradient(0, 0, RADIUS * 0.3, 0, 0, RADIUS);
        g.addColorStop(0, 'rgba(255,255,255,0.08)');
        g.addColorStop(1, 'rgba(0,0,0,0.15)');
        ctx.fillStyle = g; ctx.fill();
      }

      // Border
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, RADIUS, seg.startAngle, seg.endAngle);
      ctx.closePath();
      ctx.strokeStyle = seg.type === 'tomorrow' ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.2)';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Peg dot
      const pegX = Math.cos(seg.startAngle) * (RADIUS - 8);
      const pegY = Math.sin(seg.startAngle) * (RADIUS - 8);
      ctx.beginPath();
      ctx.arc(pegX, pegY, 4, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255,255,255,0.6)';
      ctx.fill();

      // Label text - single line along the radial axis, auto-scaled to fit
      ctx.save();
      const mid = seg.startAngle + seg.sweep / 2;
      ctx.rotate(mid);
      ctx.textAlign = 'right';
      ctx.shadowColor = 'rgba(0,0,0,0.55)';
      ctx.shadowBlur = 4;

      // Available radial length for text (from hub edge outward)
      const textEnd = RADIUS - 20;
      const textStart = RADIUS * 0.3; // don't crowd the hub
      const maxTextWidth = textEnd - textStart;

      // Determine style
      const isSpin = seg.type === 'spin-again';
      const isTmr = seg.type === 'tomorrow';

      // Scale font down until the label fits in one line
      let fs = 15;
      const weight = isSpin ? 'bold' : isTmr ? '400' : 'bold';
      const setFont = (size) => {
        ctx.font = `${weight} ${size}px 'Segoe UI', system-ui, sans-serif`;
      };
      setFont(fs);
      while (ctx.measureText(seg.label).width > maxTextWidth && fs > 8) {
        fs--;
        setFont(fs);
      }

      if (isSpin) {
        ctx.fillStyle = '#1a1a2e';
        ctx.shadowColor = 'rgba(255,255,255,0.3)';
      } else if (isTmr) {
        ctx.fillStyle = 'rgba(255,255,255,0.4)';
      } else {
        ctx.fillStyle = '#fff';
      }

      // Draw label centered vertically on the wedge midline
      ctx.fillText(seg.label, textEnd, fs * 0.35);
      ctx.shadowBlur = 0;

      // Sponsor name - smaller, slightly below, only on prize segments
      if (seg.sponsor && !isSpin && !isTmr) {
        let sf = Math.max(8, fs - 4);
        ctx.font = `${sf}px 'Segoe UI', system-ui, sans-serif`;
        ctx.fillStyle = 'rgba(255,255,255,0.5)';
        // Only show if it fits without crowding
        if (ctx.measureText(seg.sponsor).width <= maxTextWidth) {
          ctx.fillText(seg.sponsor, textEnd, fs * 0.35 + sf + 2);
        }
      }
      ctx.restore();
    }

    // Hub
    ctx.beginPath();
    ctx.arc(0, 0, 28, 0, Math.PI * 2);
    const hub = ctx.createRadialGradient(0, 0, 5, 0, 0, 28);
    hub.addColorStop(0, '#fff'); hub.addColorStop(1, '#ccc');
    ctx.fillStyle = hub; ctx.fill();
    ctx.strokeStyle = 'rgba(0,0,0,0.2)'; ctx.lineWidth = 2; ctx.stroke();

    ctx.beginPath(); ctx.arc(0, 0, 6, 0, Math.PI * 2);
    ctx.fillStyle = '#ff6b35'; ctx.fill();

    ctx.beginPath(); ctx.arc(0, 0, RADIUS, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(255,255,255,0.3)'; ctx.lineWidth = 3; ctx.stroke();

    ctx.restore();
  }, []);

  const drawConfetti = useCallback(() => {
    const canvas = confettiRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let i = confettiStateRef.current.length - 1; i >= 0; i--) {
      const p = confettiStateRef.current[i];
      p.x += p.vx; p.vy += 0.3; p.y += p.vy;
      p.rotation += p.rotSpeed; p.life -= 0.005; p.vx *= 0.99;
      if (p.life <= 0 || p.y > canvas.height + 20) {
        confettiStateRef.current.splice(i, 1); continue;
      }
      ctx.save();
      ctx.translate(p.x, p.y); ctx.rotate(p.rotation);
      ctx.globalAlpha = p.life; ctx.fillStyle = p.color;
      ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      ctx.restore();
    }
  }, []);

  // ── POINTER SEGMENT ──
  const getSegAtPointer = useCallback(() => {
    const segs = segmentsRef.current;
    if (!segs.length) return 0;
    let a = (-Math.PI / 2 - phys.current.rotation) % (Math.PI * 2);
    if (a < 0) a += Math.PI * 2;
    for (let i = 0; i < segs.length; i++) {
      if (a >= segs[i].startAngle && a < segs[i].endAngle) return i;
    }
    return 0;
  }, []);

  // ── FORCE FIELD (nudge away from tomorrow) ──
  const applyForceField = useCallback(() => {
    const p = phys.current;
    const speed = Math.abs(p.angularVelocity);
    if (speed > 0.008 || speed < MIN_VELOCITY) return;
    const segs = segmentsRef.current;
    const idx = getSegAtPointer();
    if (!segs[idx] || segs[idx].type !== 'tomorrow') return;
    let a = (-Math.PI / 2 - p.rotation) % (Math.PI * 2);
    if (a < 0) a += Math.PI * 2;
    const seg = segs[idx];
    const progress = (a - seg.startAngle) / seg.sweep;
    if (progress < 0.85) {
      const sign = p.angularVelocity >= 0 ? 1 : -1;
      p.angularVelocity += sign * 0.002;
    }
  }, [getSegAtPointer]);

  // ── HANDLE RESULT ──
  const handleResult = useCallback((idx) => {
    const segs = segmentsRef.current;
    const seg = segs[idx];
    if (!seg) return;

    if (seg.type === 'spin-again') {
      phys.current.isSpinning = false;
      phys.current.hasSpun = false;
      phys.current.angularVelocity = 0;
      phys.current.dragVelocities = [];
      phys.current.lastTickSegment = -1;
      playSpinAgain();
      setHint('Bonus spin! Give it another flick');
      setHintVisible(true);
      setPhase('idle');
      return;
    }

    if (seg.type === 'tomorrow') {
      markSpunToday();
      setBlockedToday(true);
      setTimeout(() => setPhase('tomorrow'), 800);
      return;
    }

    // Prize win
    markSpunToday();
    setBlockedToday(true);
    setWinSeg(seg);
    playWin();
    launchConfetti();
    setTimeout(() => setPhase('won'), 800);
  }, [playWin, playSpinAgain, launchConfetti]);

  // ── ANIMATION LOOP ──
  useEffect(() => {
    let running = true;

    const loop = () => {
      if (!running) return;
      rafRef.current = requestAnimationFrame(loop);

      const p = phys.current;
      if (p.isSpinning && !p.isDragging) {
        p.rotation += p.angularVelocity;

        const speed = Math.abs(p.angularVelocity);
        p.angularVelocity *= speed > 0.06 ? FRICTION : speed > 0.02 ? FRICTION_SLOW : FRICTION_CRAWL;

        // Flapper tick
        const cur = getSegAtPointer();
        if (cur !== p.lastTickSegment) {
          p.lastTickSegment = cur;
          playTick(speed > 0.1);
          if (p.angularVelocity > 0) p.angularVelocity -= FLAPPER_BOUNCE;
          else if (p.angularVelocity < 0) p.angularVelocity += FLAPPER_BOUNCE;
        }

        applyForceField();

        if (Math.abs(p.angularVelocity) < MIN_VELOCITY && !p.spinDone) {
          p.angularVelocity = 0;
          p.isSpinning = false;
          p.spinDone = true;
          handleResult(getSegAtPointer());
        }
      }

      drawWheel();
      drawConfetti();
    };

    rafRef.current = requestAnimationFrame(loop);
    return () => {
      running = false;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [drawWheel, drawConfetti, getSegAtPointer, applyForceField, handleResult, playTick]);

  // ── CANVAS RESIZE ──
  useEffect(() => {
    const resize = () => {
      const canvas = canvasRef.current;
      const confCanvas = confettiRef.current;
      if (!canvas) return;
      const size = Math.min(420, window.innerWidth - 40);
      canvas.width = size; canvas.height = size;
      canvas.style.width = size + 'px'; canvas.style.height = size + 'px';
      if (confCanvas) {
        confCanvas.width = window.innerWidth;
        confCanvas.height = window.innerHeight;
      }
    };
    resize();
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, []);

  // ── POINTER EVENTS (direct on canvas for passive: false support) ──
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const getAngle = (x, y) => {
      const rect = canvas.getBoundingClientRect();
      const dx = x - (rect.left + rect.width / 2);
      const dy = y - (rect.top + rect.height / 2);
      return Math.atan2(dy, dx);
    };

    const onDown = (e) => {
      const p = phys.current;
      if (p.hasSpun || p.isSpinning || blockedToday) return;
      e.preventDefault();
      initAudio();
      p.isDragging = true;
      p.spinDone = false;
      const { clientX, clientY } = e.touches ? e.touches[0] : e;
      p.lastAngle = getAngle(clientX, clientY);
      p.lastTime = performance.now();
      p.dragVelocities = [];
      p.angularVelocity = 0;
      setHintVisible(false);
    };

    const onMove = (e) => {
      const p = phys.current;
      if (!p.isDragging) return;
      e.preventDefault();
      const { clientX, clientY } = e.touches ? e.touches[0] : e;
      const curAngle = getAngle(clientX, clientY);
      const now = performance.now();
      let delta = curAngle - p.lastAngle;
      if (delta > Math.PI) delta -= Math.PI * 2;
      if (delta < -Math.PI) delta += Math.PI * 2;
      p.rotation += delta;
      const dt = now - p.lastTime;
      if (dt > 0) {
        p.dragVelocities.push({ vel: delta / dt, time: now });
        p.dragVelocities = p.dragVelocities.filter(v => now - v.time < 80);
      }
      p.lastAngle = curAngle;
      p.lastTime = now;
    };

    const onUp = () => {
      const p = phys.current;
      if (!p.isDragging) return;
      p.isDragging = false;
      if (!p.dragVelocities.length) { setHintVisible(true); return; }

      const avgVel = p.dragVelocities.reduce((s, v) => s + v.vel, 0) / p.dragVelocities.length;
      p.angularVelocity = avgVel * 22;

      if (Math.abs(p.angularVelocity) < 0.03) {
        p.angularVelocity = 0;
        setHintVisible(true);
        return;
      }

      const sign = p.angularVelocity > 0 ? 1 : -1;
      if (Math.abs(p.angularVelocity) < MIN_RELEASE_SPEED) p.angularVelocity = MIN_RELEASE_SPEED * sign;
      if (p.angularVelocity > MAX_RELEASE_SPEED) p.angularVelocity = MAX_RELEASE_SPEED;
      if (p.angularVelocity < -MAX_RELEASE_SPEED) p.angularVelocity = -MAX_RELEASE_SPEED;

      p.isSpinning = true;
      p.hasSpun = true;
      setPhase('spinning');
    };

    canvas.addEventListener('mousedown', onDown);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    canvas.addEventListener('touchstart', onDown, { passive: false });
    window.addEventListener('touchmove', onMove, { passive: false });
    window.addEventListener('touchend', onUp);

    return () => {
      canvas.removeEventListener('mousedown', onDown);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
      canvas.removeEventListener('touchstart', onDown);
      window.removeEventListener('touchmove', onMove);
      window.removeEventListener('touchend', onUp);
    };
  }, [blockedToday, initAudio]);

  // ── CLAIM HANDLER ──
  const handleClaim = async () => {
    if (!email.trim() || !email.includes('@')) {
      setClaimError('Need a valid email to send your QR code.');
      return;
    }
    if (!winSeg) return;
    setClaiming(true);
    setClaimError('');
    try {
      const res = await fetch('/api/prize-wheel/claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          prizeLabel: winSeg.label,
          sponsorName: winSeg.sponsor,
          sponsorId: winSeg.sponsorId,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Claim failed');
      setClaimCode(data.claimCode);
      setPhase('claimed');
    } catch (err) {
      setClaimError(err.message || 'Something went wrong. Try again.');
      setClaiming(false);
    }
  };

  // ── STYLES ──
  const S = {
    page: {
      minHeight: '100vh',
      background: `
        radial-gradient(1200px 600px at 20% 10%, rgba(78,205,196,0.35), transparent 60%),
        radial-gradient(900px 500px at 85% 80%, rgba(255,107,53,0.28), transparent 60%),
        linear-gradient(160deg, #0b3b5c 0%, #114a6e 40%, #1a6b8a 100%)
      `,
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'center',
      padding: '40px 20px 60px',
      overflowX: 'hidden',
      userSelect: 'none',
      WebkitUserSelect: 'none',
      color: '#fff',
      fontFamily: "'Segoe UI', system-ui, -apple-system, sans-serif",
    },
    frame: {
      position: 'relative',
      width: '100%',
      maxWidth: 520,
      padding: '20px 20px 24px',
      borderRadius: 28,
      background: 'linear-gradient(145deg, rgba(255,255,255,0.12), rgba(255,255,255,0.04))',
      backdropFilter: 'blur(26px) saturate(160%)',
      WebkitBackdropFilter: 'blur(26px) saturate(160%)',
      border: '1px solid rgba(255,255,255,0.22)',
      boxShadow: '0 30px 80px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.25)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
    },
    pointer: {
      position: 'absolute',
      top: -18,
      left: '50%',
      transform: 'translateX(-50%)',
      width: 0,
      height: 0,
      borderLeft: '18px solid transparent',
      borderRight: '18px solid transparent',
      borderTop: '36px solid #ff6b35',
      filter: 'drop-shadow(0 3px 6px rgba(0,0,0,0.4))',
      zIndex: 10,
    },
    winPanel: (show) => ({
      width: '100%',
      maxWidth: 440,
      marginTop: 12,
      background: 'linear-gradient(145deg, #1e3a5f, #16213e)',
      border: '1px solid rgba(255,255,255,0.12)',
      borderRadius: 20,
      padding: '18px 28px 22px',
      textAlign: 'center',
      boxShadow: '0 12px 40px rgba(0,0,0,0.4)',
      display: show ? 'block' : 'none',
      animation: show ? 'winPop 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)' : undefined,
    }),
  };

  if (loadError) {
    return (
      <div style={S.page}>
        <div style={S.frame}>
          <h1 style={{ fontSize: '1.4rem', marginBottom: 8 }}>Manitou Beach Daily Spin</h1>
          <p style={{ opacity: 0.7, textAlign: 'center', lineHeight: 1.6 }}>{loadError}</p>
        </div>
      </div>
    );
  }

  const canSpin = segments.length > 0 && !blockedToday && phase === 'idle';
  const won = phase === 'won';
  const tomorrow = phase === 'tomorrow';
  const claimed = phase === 'claimed';

  return (
    <div style={S.page}>
      <style>{`
        @keyframes winPop {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .prize-email-input {
          width: 100%; padding: 12px 16px; border-radius: 10px;
          border: 1px solid rgba(255,255,255,0.2); background: rgba(255,255,255,0.08);
          color: #fff; font-size: 1rem; outline: none; margin-bottom: 12px;
          box-sizing: border-box; font-family: inherit;
        }
        .prize-email-input::placeholder { color: rgba(255,255,255,0.35); }
        .prize-email-input:focus { border-color: #ff6b35; }
        .prize-claim-btn {
          width: 100%; padding: 14px; border-radius: 10px; border: none;
          background: #ff6b35; color: #fff; font-size: 1rem; font-weight: 600;
          cursor: pointer; transition: background 0.2s; font-family: inherit;
        }
        .prize-claim-btn:hover { background: #e85d2c; }
        .prize-claim-btn:disabled { opacity: 0.65; cursor: wait; }
      `}</style>

      {/* Confetti layer - fixed, behind everything */}
      <canvas
        ref={confettiRef}
        style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 99 }}
      />

      <div style={S.frame}>
        <h1 style={{ fontSize: '1.4rem', marginBottom: 2, letterSpacing: 0.5, textShadow: '0 2px 10px rgba(0,0,0,0.4)' }}>
          Manitou Beach Daily Spin
        </h1>
        <p style={{ fontSize: '0.85rem', opacity: 0.7, marginBottom: 10 }}>
          Deals from your favorite local spots
        </p>

        {/* Wheel */}
        <div style={{ position: 'relative', width: 380, height: 380, margin: '0 auto' }}>
          <div style={S.pointer} />
          <canvas
            ref={canvasRef}
            style={{
              display: 'block',
              cursor: canSpin ? 'grab' : 'default',
              touchAction: 'none',
              filter: won ? 'drop-shadow(0 0 20px rgba(255,107,53,0.4))' : undefined,
            }}
          />
        </div>

        {/* Hint */}
        {hintVisible && !blockedToday && phase === 'idle' && segments.length > 0 && (
          <p style={{ marginTop: 8, fontSize: '0.9rem', opacity: 0.5, textAlign: 'center' }}>
            {hint}
          </p>
        )}

        {blockedToday && phase === 'idle' && (
          <p style={{ marginTop: 12, fontSize: '0.9rem', opacity: 0.6, textAlign: 'center' }}>
            You already spun today - come back tomorrow for another shot!
          </p>
        )}

        {/* Spin Again message */}
        {phase === 'idle' && hint.startsWith('Bonus') && (
          <p style={{ marginTop: 8, fontSize: '0.9rem', opacity: 0.7, textAlign: 'center', color: '#4ecdc4' }}>
            {hint}
          </p>
        )}

        {/* Tomorrow panel */}
        <div style={S.winPanel(tomorrow)}>
          <h2 style={{ fontSize: '1.4rem', color: '#aaa', marginBottom: 6 }}>So Close!</h2>
          <p style={{ fontSize: '0.95rem', opacity: 0.7, marginBottom: 0, lineHeight: 1.6 }}>
            Come back tomorrow - new deals drop every day.
          </p>
        </div>

        {/* Win panel - email capture */}
        <div style={S.winPanel(won && !claimed)}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: 6, color: '#ff6b35' }}>You Won!</h2>
          <p style={{ fontSize: '1.15rem', marginBottom: 4, lineHeight: 1.4 }}>{winSeg?.label}</p>
          <p style={{ fontSize: '0.85rem', opacity: 0.6, marginBottom: 20 }}>
            Sponsored by {winSeg?.sponsor}
          </p>
          <input
            type="email"
            className="prize-email-input"
            placeholder="Enter your email to claim"
            value={email}
            onChange={e => { setEmail(e.target.value); setClaimError(''); }}
            onKeyDown={e => e.key === 'Enter' && handleClaim()}
          />
          {claimError && (
            <p style={{ color: '#ff6b35', fontSize: '0.85rem', marginBottom: 8, marginTop: -4 }}>
              {claimError}
            </p>
          )}
          <button
            className="prize-claim-btn"
            onClick={handleClaim}
            disabled={claiming}
          >
            {claiming ? 'Sending...' : 'Send My QR Code'}
          </button>
          <p style={{ fontSize: '0.8rem', opacity: 0.45, marginTop: 14, lineHeight: 1.4 }}>
            Valid for 7 days. One use only. Show QR code to staff when you visit.
          </p>
        </div>

        {/* Claimed success */}
        <div style={S.winPanel(claimed)}>
          <div style={{ fontSize: 40, marginBottom: 8 }}>🎉</div>
          <h2 style={{ fontSize: '1.4rem', color: '#2ecc71', marginBottom: 6 }}>Check your inbox!</h2>
          <p style={{ fontSize: '0.95rem', opacity: 0.8, marginBottom: 8, lineHeight: 1.6 }}>
            Your QR code is on its way. Show it to the staff at <strong>{winSeg?.sponsor}</strong> within 7 days.
          </p>
          {claimCode && (
            <p style={{ fontFamily: 'monospace', fontSize: '1.2rem', letterSpacing: 3, color: '#fff', opacity: 0.85 }}>
              {claimCode}
            </p>
          )}
          <p style={{ fontSize: '0.8rem', opacity: 0.4, marginTop: 10, lineHeight: 1.4 }}>
            Backup code above in case the email takes a minute. Come back tomorrow for another spin!
          </p>
        </div>
      </div>
    </div>
  );
}
