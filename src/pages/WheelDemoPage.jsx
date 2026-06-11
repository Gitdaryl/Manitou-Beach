import { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import SEOHead from '../components/SEOHead';

// ── PHYSICS (matching RafflePage feel) ──
const FRICTION = 0.994;
const FRICTION_SLOW = 0.988;
const FRICTION_CRAWL = 0.982;
const MIN_VELOCITY = 0.0006;
const FLAPPER_BOUNCE = 0.0015;
const MIN_RELEASE_SPEED = 0.05;
const MAX_RELEASE_SPEED = 1.4;

// MB events palette
const NAVY = '#1B3A5C';
const ORANGE = '#E0703A';
const CREAM = '#FBF2DF';
const GOLD = '#F4B62A';

const DEMO_WEDGES = [
  { label: 'Free Tasting',    sub: 'irish hills winery',    offer: 'Free tasting flight',          color: '#8C2553' },
  { label: '10% Off Rental',  sub: 'lake marina',           offer: '10% off pontoon rental',       color: '#1A6B7A' },
  { label: 'Free Appetizer',  sub: 'lakeside restaurant',   offer: 'Free appetizer with entree',   color: '#2E7D52' },
  { label: 'BOGO Cone',       sub: 'sweets shop',           offer: 'BOGO ice cream cone',          color: '#C94E60' },
  { label: '$25 Off Service', sub: 'home services',         offer: '$25 off your first service call', color: '#B86C22' },
  { label: 'Free Dessert',    sub: 'local dining',          offer: 'Free dessert with dinner',     color: '#4848AA' },
];

function buildSegments(wedges) {
  const sweep = (Math.PI * 2) / wedges.length;
  return wedges.map((w, i) => ({ ...w, startAngle: i * sweep, endAngle: (i + 1) * sweep, sweep }));
}

const SEGMENTS = buildSegments(DEMO_WEDGES);

function genCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  return 'MB-' + Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

export default function WheelDemoPage() {
  const [searchParams] = useSearchParams();
  const isDemo = searchParams.get('demo') === 'true';

  const [phase, setPhase] = useState('idle'); // idle | spinning | won
  const [winSeg, setWinSeg] = useState(null);
  const [claimCode, setClaimCode] = useState('');
  const [hintVisible, setHintVisible] = useState(true);
  const [whlSize, setWhlSize] = useState(() =>
    Math.min(380, typeof window !== 'undefined' ? window.innerWidth - 40 : 340)
  );

  const canvasRef = useRef(null);
  const confettiRef = useRef(null);
  const rafRef = useRef(null);
  const audioCtxRef = useRef(null);
  const confettiStateRef = useRef([]);
  const phaseRef = useRef('idle');
  const wheelRef = useRef(null);
  const couponRef = useRef(null);
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
    stableSegment: -1,
    stableCount: 0,
    zeroVelCount: 0,
  });

  useEffect(() => { phaseRef.current = phase; }, [phase]);

  // Scroll to coupon on win, back to wheel on spin again
  useEffect(() => {
    if (phase === 'won') {
      const t = setTimeout(() => {
        couponRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 380);
      return () => clearTimeout(t);
    }
  }, [phase]);

  // ── AUDIO ──
  const initAudio = useCallback(() => {
    if (!audioCtxRef.current) {
      try { audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)(); } catch {}
    }
    if (audioCtxRef.current?.state === 'suspended') {
      audioCtxRef.current.resume().catch(() => {});
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

  // ── CONFETTI ──
  const launchConfetti = useCallback(() => {
    const colors = [ORANGE, GOLD, '#2ecc71', '#3498db', NAVY, '#fff'];
    confettiStateRef.current = Array.from({ length: 90 }, () => ({
      x: (typeof window !== 'undefined' ? window.innerWidth : 400) / 2 + (Math.random() - 0.5) * 200,
      y: (typeof window !== 'undefined' ? window.innerHeight : 400) * 0.4,
      vx: (Math.random() - 0.5) * 14,
      vy: -Math.random() * 16 - 4,
      w: Math.random() * 10 + 4,
      h: Math.random() * 6 + 3,
      color: colors[Math.floor(Math.random() * colors.length)],
      rotation: Math.random() * Math.PI * 2,
      rotSpeed: (Math.random() - 0.5) * 0.3,
      life: 1,
    }));
  }, []);

  // ── DRAW WHEEL ──
  const drawWheel = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const segs = SEGMENTS;
    const W = canvas.width, H = canvas.height;
    const CX = W / 2, CY = H / 2;
    const RADIUS = Math.min(W, H) / 2 - 12;

    ctx.clearRect(0, 0, W, H);
    ctx.save();
    ctx.translate(CX, CY);
    ctx.rotate(phys.current.rotation);

    for (const seg of segs) {
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, RADIUS, seg.startAngle, seg.endAngle);
      ctx.closePath();
      ctx.fillStyle = seg.color;
      ctx.fill();

      const g = ctx.createRadialGradient(0, 0, RADIUS * 0.3, 0, 0, RADIUS);
      g.addColorStop(0, 'rgba(255,255,255,0.1)');
      g.addColorStop(1, 'rgba(0,0,0,0.2)');
      ctx.fillStyle = g; ctx.fill();

      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, RADIUS, seg.startAngle, seg.endAngle);
      ctx.closePath();
      ctx.strokeStyle = 'rgba(255,255,255,0.25)';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Peg
      const pegX = Math.cos(seg.startAngle) * (RADIUS - 8);
      const pegY = Math.sin(seg.startAngle) * (RADIUS - 8);
      ctx.beginPath();
      ctx.arc(pegX, pegY, 4, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255,255,255,0.65)';
      ctx.fill();

      // Labels
      ctx.save();
      const mid = seg.startAngle + seg.sweep / 2;
      ctx.rotate(mid + Math.PI / 2);
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.shadowColor = 'rgba(0,0,0,0.6)';
      ctx.shadowBlur = 4;

      const textR = -(RADIUS * 0.68);
      const maxW = 2 * Math.abs(textR) * Math.sin(seg.sweep / 2) * 0.8;

      let fs = 14;
      const setF = (s) => { ctx.font = `bold ${s}px 'Libre Franklin', system-ui, sans-serif`; };
      setF(fs);
      while (ctx.measureText(seg.label).width > maxW && fs > 7) { fs--; setF(fs); }
      ctx.fillStyle = '#fff';
      ctx.fillText(seg.label, 0, textR);

      ctx.shadowBlur = 0;
      let sf = Math.max(7, fs - 2);
      ctx.font = `italic ${sf}px 'Libre Franklin', system-ui, sans-serif`;
      ctx.fillStyle = 'rgba(255,255,255,0.6)';
      if (ctx.measureText(seg.sub).width <= maxW) {
        ctx.fillText(seg.sub, 0, textR + fs + 3);
      }
      ctx.restore();
    }

    // Hub
    ctx.beginPath(); ctx.arc(0, 0, 26, 0, Math.PI * 2);
    const hub = ctx.createRadialGradient(0, 0, 5, 0, 0, 26);
    hub.addColorStop(0, '#fff'); hub.addColorStop(1, '#ddd');
    ctx.fillStyle = hub; ctx.fill();
    ctx.strokeStyle = 'rgba(0,0,0,0.2)'; ctx.lineWidth = 2; ctx.stroke();
    ctx.beginPath(); ctx.arc(0, 0, 6, 0, Math.PI * 2);
    ctx.fillStyle = ORANGE; ctx.fill();
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
      p.rotation += p.rotSpeed; p.life -= 0.006; p.vx *= 0.99;
      if (p.life <= 0 || p.y > canvas.height + 20) { confettiStateRef.current.splice(i, 1); continue; }
      ctx.save();
      ctx.translate(p.x, p.y); ctx.rotate(p.rotation);
      ctx.globalAlpha = p.life; ctx.fillStyle = p.color;
      ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      ctx.restore();
    }
  }, []);

  const getSegAtPointer = useCallback(() => {
    let a = (-Math.PI / 2 - phys.current.rotation) % (Math.PI * 2);
    if (a < 0) a += Math.PI * 2;
    let best = 0, bestDist = Infinity;
    for (let i = 0; i < SEGMENTS.length; i++) {
      const mid = SEGMENTS[i].startAngle + SEGMENTS[i].sweep / 2;
      let d = Math.abs(a - mid);
      if (d > Math.PI) d = Math.PI * 2 - d;
      if (d < bestDist) { bestDist = d; best = i; }
    }
    return best;
  }, []);

  const handleResult = useCallback((idx) => {
    const seg = SEGMENTS[idx];
    if (!seg) return;
    const code = genCode();
    setClaimCode(code);
    setWinSeg(seg);
    playWin();
    launchConfetti();
    try { window.navigator.vibrate?.([40, 60, 120, 60, 280]); } catch {}
    setPhase('won');
    // Fire tracking (fire-and-forget)
    fetch('/api/wheel-demo/spin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ wedge: seg.label }),
    }).catch(() => {});
  }, [playWin, launchConfetti]);

  const resetSpin = useCallback(() => {
    const p = phys.current;
    p.angularVelocity = 0;
    p.isDragging = false;
    p.hasSpun = false;
    p.spinDone = false;
    p.isSpinning = false;
    p.dragVelocities = [];
    p.lastTickSegment = -1;
    p.stableSegment = -1;
    p.stableCount = 0;
    p.zeroVelCount = 0;
    setPhase('idle');
    setWinSeg(null);
    setClaimCode('');
    setHintVisible(true);
    setTimeout(() => {
      wheelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 50);
  }, []);

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

        const cur = getSegAtPointer();
        if (cur !== p.lastTickSegment && speed > MIN_VELOCITY * 4) {
          p.lastTickSegment = cur;
          playTick(speed > 0.1);
          if (p.angularVelocity > 0) p.angularVelocity -= FLAPPER_BOUNCE;
          else if (p.angularVelocity < 0) p.angularVelocity += FLAPPER_BOUNCE;
        }

        if (Math.abs(p.angularVelocity) < MIN_VELOCITY && !p.spinDone) {
          p.angularVelocity = 0;
          p.zeroVelCount = (p.zeroVelCount || 0) + 1;
          const seg = getSegAtPointer();
          if (seg === p.stableSegment) { p.stableCount++; }
          else { p.stableSegment = seg; p.stableCount = 1; }
          if (p.stableCount >= 3 || p.zeroVelCount > 20) {
            p.isSpinning = false; p.spinDone = true;
            p.stableCount = 0; p.stableSegment = -1; p.zeroVelCount = 0;
            handleResult(seg);
          }
        } else {
          p.stableSegment = -1; p.stableCount = 0; p.zeroVelCount = 0;
        }
      }
      drawWheel();
      drawConfetti();
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => { running = false; if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [drawWheel, drawConfetti, getSegAtPointer, handleResult, playTick]);

  // ── RESIZE ──
  useEffect(() => {
    const resize = () => {
      const canvas = canvasRef.current;
      const confCanvas = confettiRef.current;
      if (!canvas) return;
      const size = Math.min(380, window.innerWidth - 40);
      canvas.width = size; canvas.height = size;
      canvas.style.width = size + 'px'; canvas.style.height = size + 'px';
      setWhlSize(size);
      if (confCanvas) { confCanvas.width = window.innerWidth; confCanvas.height = window.innerHeight; }
    };
    resize();
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, []);

  // ── POINTER EVENTS ──
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const getAngle = (x, y) => {
      const rect = canvas.getBoundingClientRect();
      return Math.atan2(y - (rect.top + rect.height / 2), x - (rect.left + rect.width / 2));
    };

    const onDown = (e) => {
      const p = phys.current;
      if (p.hasSpun || p.isSpinning || phaseRef.current !== 'idle') return;
      e.preventDefault();
      initAudio();
      p.isDragging = true; p.spinDone = false;
      const { clientX, clientY } = e.touches ? e.touches[0] : e;
      p.lastAngle = getAngle(clientX, clientY);
      p.lastTime = performance.now();
      p.dragVelocities = []; p.angularVelocity = 0;
      setHintVisible(false);
    };

    const onMove = (e) => {
      const p = phys.current;
      if (!p.isDragging) return;
      e.preventDefault();
      const { clientX, clientY } = e.touches ? e.touches[0] : e;
      const cur = getAngle(clientX, clientY);
      const now = performance.now();
      let delta = cur - p.lastAngle;
      if (delta > Math.PI) delta -= Math.PI * 2;
      if (delta < -Math.PI) delta += Math.PI * 2;
      p.rotation += delta;
      const dt = now - p.lastTime;
      if (dt > 0) {
        p.dragVelocities.push({ vel: delta / dt, time: now });
        p.dragVelocities = p.dragVelocities.filter(v => now - v.time < 80);
      }
      p.lastAngle = cur; p.lastTime = now;
    };

    const onUp = () => {
      const p = phys.current;
      if (!p.isDragging) return;
      p.isDragging = false;
      if (!p.dragVelocities.length) { setHintVisible(true); return; }
      const avgVel = p.dragVelocities.reduce((s, v) => s + v.vel, 0) / p.dragVelocities.length;
      p.angularVelocity = avgVel * 22;
      if (Math.abs(p.angularVelocity) < 0.03) { p.angularVelocity = 0; setHintVisible(true); return; }
      const sign = p.angularVelocity > 0 ? 1 : -1;
      if (Math.abs(p.angularVelocity) < MIN_RELEASE_SPEED) p.angularVelocity = MIN_RELEASE_SPEED * sign;
      if (p.angularVelocity > MAX_RELEASE_SPEED) p.angularVelocity = MAX_RELEASE_SPEED;
      if (p.angularVelocity < -MAX_RELEASE_SPEED) p.angularVelocity = -MAX_RELEASE_SPEED;
      p.isSpinning = true; p.hasSpun = true;
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
  }, [initAudio]);

  // ── MARQUEE BULBS ──
  const BULB_COUNT = 20;
  const bulbR = whlSize / 2 + 22;
  const bulbs = Array.from({ length: BULB_COUNT }, (_, i) => {
    const angle = (i / BULB_COUNT) * Math.PI * 2 - Math.PI / 2;
    return {
      x: bulbR + bulbR * Math.cos(angle),
      y: bulbR + bulbR * Math.sin(angle),
      gold: i % 2 === 0,
      delay: `${(i * 0.1).toFixed(2)}s`,
    };
  });
  const ringSize = whlSize + 44;

  // ── COMING SOON STATE ──
  if (!isDemo) {
    return (
      <div style={{ background: NAVY, minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 24px', textAlign: 'center' }}>
        <SEOHead title="Spin to Win - Manitou Beach" description="Offers from your lake neighbors. Scan, spin, save." path="/wheel" />
        <div style={{ fontSize: 56, marginBottom: 20 }}>🎡</div>
        <h1 style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 'clamp(24px, 6vw, 40px)', color: CREAM, margin: '0 0 16px', lineHeight: 1.2 }}>
          Spin to Win
        </h1>
        <p style={{ fontSize: 'clamp(15px, 2vw, 18px)', color: GOLD, fontWeight: 600, margin: '0 0 12px', fontFamily: "'Libre Franklin', sans-serif" }}>
          Manitou Beach
        </p>
        <p style={{ fontSize: 16, color: 'rgba(251,242,223,0.65)', maxWidth: 360, lineHeight: 1.7, margin: '0 0 32px', fontFamily: "'Libre Franklin', sans-serif" }}>
          The wheel goes live when the founding six are locked in.
        </p>
        <Link
          to="/events"
          style={{
            display: 'inline-block', padding: '14px 32px', borderRadius: 8,
            background: ORANGE, color: '#fff',
            fontFamily: "'Libre Franklin', sans-serif", fontWeight: 700,
            fontSize: 15, textDecoration: 'none', letterSpacing: '0.04em',
          }}
        >
          See What's Happening
        </Link>
      </div>
    );
  }

  const isIdle = phase === 'idle';
  const isSpinning = phase === 'spinning';
  const isWon = phase === 'won';

  return (
    <>
      <SEOHead
        title="Spin to Win - Manitou Beach"
        description="Offers from your lake neighbors. Scan, spin, save."
        path="/wheel"
      />

      <style>{`
        @keyframes bulbTwinkle {
          0%, 100% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
          50% { opacity: 0.2; transform: translate(-50%, -50%) scale(0.6); }
        }
        @keyframes couponPop {
          from { opacity: 0; transform: translateY(24px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes wheelFloat {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }
        .wheel-spin-btn {
          width: 100%; padding: 14px 0; border-radius: 8px;
          background: ${ORANGE}; color: #fff; border: none;
          font-family: "'Libre Franklin', system-ui, sans-serif";
          font-size: 1rem; font-weight: 700; cursor: pointer;
          letter-spacing: 0.05em; text-transform: uppercase;
          transition: opacity 0.18s;
        }
        .wheel-spin-btn:hover { opacity: 0.88; }
        .perf-line {
          background-image: radial-gradient(circle, rgba(27,58,92,0.3) 3px, transparent 3px);
          background-size: 16px 16px; background-position: 8px center;
          height: 18px; margin: 0 -1px;
        }
      `}</style>

      <canvas ref={confettiRef} style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 99 }} />

      <main style={{
        minHeight: '100vh',
        background: `
          radial-gradient(ellipse 80% 50% at 50% 0%, rgba(224,112,58,0.25) 0%, transparent 55%),
          radial-gradient(ellipse 60% 40% at 10% 100%, rgba(27,58,92,0.8) 0%, transparent 60%),
          ${NAVY}
        `,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '32px 20px 60px',
        color: '#fff',
        fontFamily: "'Libre Franklin', system-ui, sans-serif",
        overflowX: 'hidden',
        userSelect: 'none',
        WebkitUserSelect: 'none',
      }}>

        {/* Demo badge */}
        <div style={{
          position: 'absolute', top: 14, right: 14,
          background: 'rgba(244,182,42,0.15)', border: `1px solid ${GOLD}`,
          borderRadius: 20, padding: '4px 12px',
          fontSize: 11, fontWeight: 600, color: GOLD, letterSpacing: '0.08em',
        }}>
          Demo - your offer could be here.
        </div>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 28, paddingTop: 16, maxWidth: 480 }}>
          <h1 style={{
            fontFamily: "'Libre Baskerville', serif",
            fontSize: 'clamp(26px, 7vw, 42px)',
            color: CREAM, margin: '0 0 10px', lineHeight: 1.1, fontWeight: 700,
          }}>
            Spin to Win
          </h1>
          <div style={{ fontSize: 15, color: GOLD, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 8 }}>
            Manitou Beach
          </div>
          <p style={{ fontSize: 14, color: 'rgba(251,242,223,0.65)', margin: 0, lineHeight: 1.6 }}>
            Offers from your lake neighbors. Scan, spin, save.
          </p>
        </div>

        {/* Wheel with marquee ring */}
        <div ref={wheelRef} style={{ position: 'relative', width: ringSize, height: ringSize, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12, flexShrink: 0 }}>
          {bulbs.map((b, i) => (
            <div key={i} style={{
              position: 'absolute', left: b.x, top: b.y,
              width: 9, height: 9, borderRadius: '50%',
              background: b.gold ? GOLD : ORANGE,
              boxShadow: `0 0 7px 3px ${b.gold ? 'rgba(244,182,42,0.65)' : 'rgba(224,112,58,0.65)'}`,
              animation: `bulbTwinkle ${0.65 + (i % 5) * 0.15}s ease-in-out infinite`,
              animationDelay: b.delay,
              transform: 'translate(-50%, -50%)',
            }} />
          ))}

          <div style={{ position: 'relative', width: whlSize, height: whlSize, animation: isIdle ? 'wheelFloat 4s ease-in-out infinite' : undefined }}>
            {/* Pointer */}
            <div style={{
              position: 'absolute', top: -20, left: '50%', transform: 'translateX(-50%)',
              width: 0, height: 0,
              borderLeft: '18px solid transparent', borderRight: '18px solid transparent',
              borderTop: `36px solid ${GOLD}`,
              filter: 'drop-shadow(0 3px 8px rgba(0,0,0,0.5))', zIndex: 10,
            }} />
            <canvas
              ref={canvasRef}
              style={{
                display: 'block',
                cursor: isIdle ? 'grab' : 'default',
                touchAction: 'none',
                borderRadius: '50%',
                boxShadow: isWon
                  ? `0 0 40px rgba(244,182,42,0.45), 0 0 80px rgba(224,112,58,0.25)`
                  : '0 0 20px rgba(0,0,0,0.5)',
              }}
            />
          </div>
        </div>

        {/* Hint line */}
        {hintVisible && isIdle && (
          <p style={{ margin: '0 0 20px', fontSize: 13, color: `${GOLD}99`, fontStyle: 'italic', textAlign: 'center' }}>
            Grab the wheel and give it a flick!
          </p>
        )}
        {isSpinning && (
          <p style={{ margin: '0 0 20px', fontSize: 13, color: `${GOLD}80`, fontStyle: 'italic', textAlign: 'center' }}>
            Round and round she goes...
          </p>
        )}
        {isIdle && !hintVisible && <div style={{ height: 32 }} />}

        {/* Win coupon */}
        {isWon && winSeg && (
          <div ref={couponRef} style={{
            width: '100%', maxWidth: 400,
            borderRadius: 16, overflow: 'hidden',
            animation: 'couponPop 0.45s cubic-bezier(0.34, 1.56, 0.64, 1)',
            boxShadow: '0 12px 40px rgba(0,0,0,0.45), 0 0 0 2px rgba(244,182,42,0.3)',
          }}>
            {/* Coupon header */}
            <div style={{ background: winSeg.color, padding: '18px 24px 16px', position: 'relative' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', marginBottom: 4 }}>
                    You won
                  </div>
                  <div style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 'clamp(18px, 5vw, 24px)', color: '#fff', fontWeight: 700, lineHeight: 1.2 }}>
                    {winSeg.offer}
                  </div>
                  <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.65)', fontStyle: 'italic', marginTop: 4 }}>
                    {winSeg.sub}
                  </div>
                </div>
                <div style={{ fontSize: 32, flexShrink: 0, marginLeft: 12 }}>🎉</div>
              </div>
            </div>

            {/* Perforation */}
            <div className="perf-line" style={{ background: CREAM }} />

            {/* Coupon body */}
            <div style={{ background: CREAM, color: NAVY, padding: '20px 24px 24px' }}>
              <div style={{ textAlign: 'center', marginBottom: 20 }}>
                <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', color: '#8a7a5a', textTransform: 'uppercase', marginBottom: 8 }}>
                  Your code
                </div>
                <div style={{
                  fontFamily: 'monospace', fontSize: 'clamp(22px, 6vw, 30px)',
                  fontWeight: 700, letterSpacing: 6, color: NAVY,
                  background: 'rgba(27,58,92,0.07)', borderRadius: 8,
                  padding: '10px 20px', display: 'inline-block',
                  border: `2px dashed rgba(27,58,92,0.2)`,
                }}>
                  {claimCode}
                </div>
                <div style={{ fontSize: 13, color: '#6a5a3a', marginTop: 10, lineHeight: 1.5 }}>
                  Show this screen at checkout.
                </div>
              </div>

              <div style={{
                fontSize: 12, color: '#8a7a5a', lineHeight: 1.6,
                borderTop: '1px solid rgba(27,58,92,0.1)', paddingTop: 14, marginBottom: 16,
                textAlign: 'center',
              }}>
                Every spin and redemption is tracked for our sponsors.
              </div>

              <button onClick={resetSpin} className="wheel-spin-btn">
                Spin Again
              </button>
            </div>
          </div>
        )}

        {/* Idle CTA hint */}
        {isIdle && phase === 'idle' && (
          <div style={{ marginTop: 16, textAlign: 'center' }}>
            <p style={{ fontSize: 12, color: 'rgba(251,242,223,0.35)', margin: 0 }}>
              All spins win in demo mode
            </p>
          </div>
        )}
      </main>
    </>
  );
}
