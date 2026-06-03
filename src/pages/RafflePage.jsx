import { useState, useEffect, useRef, useCallback } from 'react';
import { Footer, GlobalStyles, Navbar } from '../components/Layout';
import { C } from '../data/config';
import SEOHead from '../components/SEOHead';

// ── PHYSICS CONSTANTS ──
const FRICTION = 0.994;
const FRICTION_SLOW = 0.988;
const FRICTION_CRAWL = 0.982;
const MIN_VELOCITY = 0.0006;
const FLAPPER_BOUNCE = 0.0015;
const MIN_RELEASE_SPEED = 0.05;
const MAX_RELEASE_SPEED = 1.4;

// ── RAFFLE BASKET DATA ──
const BASKET_DATA = [
  {
    label: 'Print Shop',
    fullName: 'The Lakes Print Shop',
    value: '$100',
    color: '#3a7bd5',
    image: '/images/ladies-club/Festival-raffle/The Lakes Print Shop.jpg',
    items: ['Devils Lake & Round Lake hats', 'Americans T-shirts', 'Devils Lake & Round Lake glass mugs', 'Koozies'],
  },
  {
    label: 'Lake Toys',
    fullName: 'Lake Toys and Big Joys',
    value: '$75',
    color: '#e07b2a',
    image: '/images/ladies-club/Festival-raffle/Lake Toys Big Joys.jpg',
    items: ['Versatile tote loaded with toys for all ages', 'Beach towel', 'Sunscreen', 'Table cover'],
  },
  {
    label: 'MGM Books',
    fullName: 'Michael Glen Monroe',
    value: '$100',
    color: '#8e44ad',
    image: '/images/ladies-club/Festival-raffle/Michael Glen Monroe.jpg',
    items: ['Children\'s Author and Award-Winning Artist', '2 hardcover books', '3 original paintings'],
  },
  {
    label: 'Stars & Stripes',
    fullName: 'Stars, Stripes and Lake Nights',
    value: '$125',
    color: '#c0392b',
    image: '/images/ladies-club/Festival-raffle/Stars and Stripes and Late nights.jpg',
    items: ['Red, white and blue themed drink bucket', 'Party supplies'],
  },
  {
    label: 'Lakeside Escape',
    fullName: 'Lakeside Escape',
    value: '$200',
    color: '#219a52',
    image: '/images/ladies-club/Festival-raffle/Lakeside escapes.jpg',
    items: ['Cooler/Tote', 'Sun Hat', 'Beach Blanket', "S'mores", 'Mug', 'Drink Mix', 'Wipes', 'Pickleball Set and more'],
  },
  {
    label: 'Hooked on Fun',
    fullName: 'Hooked on Fun',
    value: '$200-$250',
    color: '#2472a4',
    image: '/images/ladies-club/Festival-raffle/Hooked on Fun.jpg',
    items: ['$50 Gift Certificate to Manitou Beach Marina', '2 fishing poles', 'Yeti', 'Waist/Backpack Carry All and more'],
  },
  {
    label: 'Long Drives',
    fullName: 'Lake Life and Long Drives',
    value: '$250-$300',
    color: '#15816d',
    image: '/images/ladies-club/Festival-raffle/Lake Life and Long Drives.jpg',
    items: ['4 rounds 18-hole golf + cart at Devil\'s Lake Golf Course', 'Beverage Cooler', 'Hat', 'Balls and more'],
  },
  {
    label: 'Summer Fun',
    fullName: 'Summer Fun Explosion',
    value: '$75',
    color: '#d4845a',
    image: '/images/ladies-club/Festival-raffle/Summer Fun Explosion.jpg',
    items: ['Versatile tote loaded with toys for all ages', 'Beach towel', 'Sunscreen', 'Table cover'],
  },
  {
    label: "Party 4th",
    fullName: "Party Like It's the 4th",
    value: '$125',
    color: '#a93226',
    image: '/images/ladies-club/Festival-raffle/Party Like its the 4th.jpg',
    items: ['Beautiful collection of red, white and blue supplies', 'Celebrate 250 Years of America'],
  },
  {
    label: 'View Living',
    fullName: "Devil's Lake View Living",
    value: '$200',
    color: '#5b7e95',
    image: '/images/ladies-club/Festival-raffle/Devils Lake View living.jpg',
    items: ['Devils Lake Tote', 'Inis skincare collection', '$100 Gift Certificate'],
  },
  {
    label: 'Pontoon Party',
    fullName: 'Pontoon Party Pack',
    value: '$250-$300',
    color: '#1c4f6e',
    image: '/images/ladies-club/Festival-raffle/Pontoon Party Pack.jpg',
    items: ['Premium tote', '2 high-end beach towels', 'Bluetooth Speaker', 'Sunscreen', '$200 Chauffeured Evening Cruise'],
  },
  {
    label: 'Try Again!',
    fullName: null,
    value: null,
    color: '#5d6d7e',
    type: 'try-again',
    items: [],
  },
];

function buildSegments(data) {
  const sweep = (Math.PI * 2) / data.length;
  return data.map((d, i) => ({ ...d, startAngle: i * sweep, endAngle: (i + 1) * sweep, sweep }));
}

const BUILT_SEGMENTS = buildSegments(BASKET_DATA);

export default function RafflePage({ embed = false }) {
  const [hint, setHint] = useState('Grab the wheel and give it a flick!');
  const [hintVisible, setHintVisible] = useState(true);
  const [phase, setPhase] = useState('idle'); // idle | spinning | landed | try-again
  const [winSeg, setWinSeg] = useState(null);
  const [whlSize, setWhlSize] = useState(() =>
    Math.min(420, typeof window !== 'undefined' ? window.innerWidth - 40 : 380)
  );
  const [copied, setCopied] = useState(false);

  const canvasRef = useRef(null);
  const confettiRef = useRef(null);
  const rafRef = useRef(null);
  const audioCtxRef = useRef(null);
  const segmentsRef = useRef(BUILT_SEGMENTS);
  const resultPanelRef = useRef(null);
  const wheelRef = useRef(null);
  const confettiStateRef = useRef([]);
  const phaseRef = useRef('idle');
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
  });

  useEffect(() => { phaseRef.current = phase; }, [phase]);

  // ── AUDIO ──
  const initAudio = useCallback(() => {
    if (!audioCtxRef.current) {
      try { audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)(); } catch {}
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

  const playTryAgain = useCallback(() => {
    const ctx = audioCtxRef.current;
    if (!ctx) return;
    try {
      [660, 880].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain); gain.connect(ctx.destination);
        osc.frequency.value = freq; osc.type = 'square';
        const t = ctx.currentTime + i * 0.08;
        gain.gain.setValueAtTime(0.06, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);
        osc.start(t); osc.stop(t + 0.18);
      });
    } catch {}
  }, []);

  // ── CONFETTI ──
  const launchConfetti = useCallback(() => {
    const colors = ['#ff6b35', '#e74c3c', '#f39c12', '#2ecc71', '#3498db', '#9b59b6', '#fff'];
    confettiStateRef.current = Array.from({ length: 100 }, () => ({
      x: (typeof window !== 'undefined' ? window.innerWidth : 400) / 2 + (Math.random() - 0.5) * 200,
      y: (typeof window !== 'undefined' ? window.innerHeight : 400) / 2,
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

  // ── DRAWING ──
  const drawWheel = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const segs = segmentsRef.current;
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
      g.addColorStop(0, 'rgba(255,255,255,0.08)');
      g.addColorStop(1, 'rgba(0,0,0,0.18)');
      ctx.fillStyle = g; ctx.fill();

      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, RADIUS, seg.startAngle, seg.endAngle);
      ctx.closePath();
      ctx.strokeStyle = 'rgba(255,255,255,0.2)';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      const pegX = Math.cos(seg.startAngle) * (RADIUS - 8);
      const pegY = Math.sin(seg.startAngle) * (RADIUS - 8);
      ctx.beginPath();
      ctx.arc(pegX, pegY, 4, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255,255,255,0.6)';
      ctx.fill();

      ctx.save();
      const mid = seg.startAngle + seg.sweep / 2;
      ctx.rotate(mid + Math.PI / 2);
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.shadowColor = 'rgba(0,0,0,0.55)';
      ctx.shadowBlur = 4;

      const isTry = seg.type === 'try-again';
      const textRadial = -(RADIUS * 0.72);
      const maxW = 2 * Math.abs(textRadial) * Math.sin(seg.sweep / 2) * 0.82;
      let fs = 15;
      const setF = (s) => { ctx.font = `bold ${s}px 'Libre Franklin', system-ui, sans-serif`; };
      setF(fs);
      while (ctx.measureText(seg.label).width > maxW && fs > 7) { fs--; setF(fs); }
      ctx.fillStyle = isTry ? 'rgba(255,255,255,0.5)' : '#fff';
      ctx.fillText(seg.label, 0, textRadial);
      ctx.shadowBlur = 0;

      if (seg.value) {
        let vf = Math.max(7, fs - 3);
        ctx.font = `${vf}px 'Libre Franklin', system-ui, sans-serif`;
        ctx.fillStyle = 'rgba(255,255,255,0.6)';
        if (ctx.measureText(seg.value).width <= maxW) {
          ctx.fillText(seg.value, 0, textRadial + fs + 3);
        }
      }
      ctx.restore();
    }

    // Hub
    ctx.beginPath(); ctx.arc(0, 0, 28, 0, Math.PI * 2);
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
      if (p.life <= 0 || p.y > canvas.height + 20) { confettiStateRef.current.splice(i, 1); continue; }
      ctx.save();
      ctx.translate(p.x, p.y); ctx.rotate(p.rotation);
      ctx.globalAlpha = p.life; ctx.fillStyle = p.color;
      ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      ctx.restore();
    }
  }, []);

  const getSegAtPointer = useCallback(() => {
    const segs = segmentsRef.current;
    let a = (-Math.PI / 2 - phys.current.rotation) % (Math.PI * 2);
    if (a < 0) a += Math.PI * 2;
    let best = 0, bestDist = Infinity;
    for (let i = 0; i < segs.length; i++) {
      const mid = segs[i].startAngle + segs[i].sweep / 2;
      let d = Math.abs(a - mid);
      if (d > Math.PI) d = Math.PI * 2 - d;
      if (d < bestDist) { bestDist = d; best = i; }
    }
    return best;
  }, []);

  const handleResult = useCallback((idx) => {
    const seg = segmentsRef.current[idx];
    if (!seg) return;
    if (seg.type === 'try-again') {
      playTryAgain();
      setWinSeg(null);
      setPhase('try-again');
      return;
    }
    setWinSeg(seg);
    playWin();
    launchConfetti();
    setPhase('landed');
  }, [playWin, playTryAgain, launchConfetti]);

  const handleShare = useCallback(async (seg) => {
    const url = `${window.location.origin}/raffle`;
    const text = `I just predicted I'm winning the "${seg.fullName}" (${seg.value}) at the LLLC Summerfest raffle! Spin the wheel and make YOUR prediction...`;
    if (navigator.share) {
      try { await navigator.share({ title: 'Summerfest Raffle Wheel', text, url }); } catch {}
      return;
    }
    try {
      await navigator.clipboard.writeText(`${text} ${url}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch {}
  }, []);

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
    setHintVisible(true);
    setHint('Spin again - see what else you could win!');
    setTimeout(() => {
      if (wheelRef.current) wheelRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
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

        // Only tick + apply flapper bounce when wheel has meaningful speed.
        // At near-zero speed on a boundary, the bounce would kick velocity back
        // above MIN_VELOCITY creating an infinite beep loop.
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

  // ── CANVAS RESIZE ──
  useEffect(() => {
    const resize = () => {
      const canvas = canvasRef.current;
      const confCanvas = confettiRef.current;
      if (!canvas) return;
      const size = Math.min(420, window.innerWidth - 40);
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

  useEffect(() => {
    if (phase === 'landed' && resultPanelRef.current) {
      setTimeout(() => {
        resultPanelRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }, 350);
    }
  }, [phase]);

  const isIdle = phase === 'idle';
  const isSpinning = phase === 'spinning';
  const isLanded = phase === 'landed';
  const isTryAgain = phase === 'try-again';
  const isEmbed = embed || new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '').get('embed') === 'true';

  // Marquee light dots around the wheel
  const BULB_COUNT = 22;
  const bulbRadius = whlSize / 2 + 24;
  const bulbs = Array.from({ length: BULB_COUNT }, (_, i) => {
    const angle = (i / BULB_COUNT) * Math.PI * 2 - Math.PI / 2;
    return {
      x: bulbRadius + bulbRadius * Math.cos(angle),
      y: bulbRadius + bulbRadius * Math.sin(angle),
      gold: i % 2 === 0,
      delay: `${(i * 0.09).toFixed(2)}s`,
    };
  });
  const ringSize = whlSize + 48;

  return (
    <>
      <GlobalStyles />
      <SEOHead
        title="Summerfest Raffle Wheel"
        description="Step right up! Spin the wheel and predict which prize basket you'll win at the Land & Lake Ladies Club Summerfest 2026 - June 20 at Manitou Beach!"
        path="/raffle"
      />
      {!isEmbed && <Navbar />}

      <canvas ref={confettiRef} style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 99 }} />

      <style>{`
        @keyframes detailPop {
          from { opacity: 0; transform: translateY(20px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes bulbTwinkle {
          0%, 100% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
          50% { opacity: 0.25; transform: translate(-50%, -50%) scale(0.65); }
        }
        @keyframes tentStripe {
          from { background-position: 0 0; }
          to   { background-position: 60px 0; }
        }
        @keyframes starFloat {
          0%, 100% { transform: translateY(0) rotate(0deg); opacity: 0.6; }
          50% { transform: translateY(-8px) rotate(12deg); opacity: 1; }
        }
        .raffle-action-btn {
          width: 100%; padding: 13px 0; border-radius: 8px;
          border: 2px solid #F5C42C; background: transparent;
          color: #F5C42C; font-size: 0.95rem; font-weight: 700;
          cursor: pointer; transition: background 0.18s, color 0.18s;
          font-family: "'Libre Franklin', system-ui, sans-serif";
          letter-spacing: 0.04em; text-transform: uppercase;
        }
        .raffle-action-btn:hover { background: #F5C42C; color: #1a0510; }
        .raffle-share-btn {
          width: 100%; padding: 11px 0; border-radius: 8px;
          border: 1px solid rgba(245,196,44,0.35); background: rgba(245,196,44,0.08);
          color: rgba(245,196,44,0.8); font-size: 0.9rem; font-weight: 600;
          cursor: pointer; transition: all 0.18s;
          font-family: "'Libre Franklin', system-ui, sans-serif";
        }
        .raffle-share-btn:hover { background: rgba(245,196,44,0.15); border-color: rgba(245,196,44,0.6); }
        .raffle-share-btn.copied { background: rgba(91,201,138,0.15); border-color: rgba(91,201,138,0.4); color: #5bc98a; }
        .raffle-cta-btn {
          padding: 14px 32px; border-radius: 8px; text-decoration: none;
          font-size: 1rem; font-weight: 700; display: inline-block;
          transition: opacity 0.18s; text-transform: uppercase; letter-spacing: 0.05em;
        }
        .raffle-cta-btn:hover { opacity: 0.88; }
        .ticket-perf {
          background-image: radial-gradient(circle, rgba(196,30,58,0.25) 3px, transparent 3px);
          background-size: 16px 16px; background-position: 8px center;
          height: 20px; margin: 0 -1px;
        }
      `}</style>

      <main style={{
        minHeight: '100vh',
        background: `
          radial-gradient(ellipse 80% 50% at 50% 0%, rgba(180,20,40,0.55) 0%, transparent 60%),
          radial-gradient(ellipse 60% 40% at 20% 100%, rgba(26,20,80,0.4) 0%, transparent 60%),
          radial-gradient(ellipse 60% 40% at 80% 100%, rgba(80,20,26,0.3) 0%, transparent 60%),
          #120008
        `,
        paddingTop: isEmbed ? 0 : 80,
        color: '#fff',
        fontFamily: "'Libre Franklin', system-ui, sans-serif",
        overflowX: 'hidden',
      }}>

        {/* Pennant bunting */}
        <div style={{ display: 'flex', justifyContent: 'center', padding: '20px 0 0', gap: 1, flexWrap: 'nowrap', overflow: 'hidden' }}>
          {['#C41E3A','#F5C42C','#1a4f9e','#C41E3A','#F5C42C','#1a4f9e','#C41E3A','#F5C42C','#1a4f9e','#C41E3A','#F5C42C','#1a4f9e','#C41E3A','#F5C42C','#1a4f9e','#C41E3A','#F5C42C','#1a4f9e','#C41E3A','#F5C42C'].map((c, i) => (
            <div key={i} style={{ width: 0, height: 0, borderLeft: '20px solid transparent', borderRight: '20px solid transparent', borderTop: `34px solid ${c}`, flexShrink: 0, filter: 'drop-shadow(0 2px 3px rgba(0,0,0,0.5))' }} />
          ))}
        </div>

        {/* Page header */}
        <div style={{ textAlign: 'center', padding: '32px 24px 28px' }}>
          <div style={{
            fontFamily: "'Caveat', cursive", fontSize: 'clamp(28px, 5vw, 44px)',
            color: '#F5C42C', marginBottom: 8, letterSpacing: '0.02em',
            textShadow: '0 0 30px rgba(245,196,44,0.5), 0 2px 4px rgba(0,0,0,0.8)',
          }}>
            Step Right Up!
          </div>
          <h1 style={{
            fontFamily: "'Libre Baskerville', serif",
            fontSize: 'clamp(24px, 4.5vw, 48px)',
            fontWeight: 700, color: '#FFF8E7', lineHeight: 1.1, margin: '0 0 16px',
            textTransform: 'uppercase', letterSpacing: '0.04em',
            textShadow: '0 2px 20px rgba(0,0,0,0.6)',
          }}>
            Which Basket Will You Win?
          </h1>
          <p style={{ fontSize: 'clamp(13px, 1.4vw, 16px)', color: 'rgba(255,248,231,0.6)', maxWidth: 500, margin: '0 auto', lineHeight: 1.7 }}>
            Spin the wheel to make your prediction, then come to Summerfest on June 20 and see if you called it!
          </p>
        </div>

        {/* Two-column section */}
        <div style={{
          maxWidth: 980, margin: '0 auto', padding: '16px 24px 60px',
          display: 'flex', gap: 48, alignItems: 'flex-start',
          flexWrap: 'wrap', justifyContent: 'center',
        }}>

          {/* Left: wheel + marquee lights */}
          <div ref={wheelRef} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
            {/* Lights ring wrapper */}
            <div style={{ position: 'relative', width: ringSize, height: ringSize, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {/* Marquee bulbs */}
              {bulbs.map((b, i) => (
                <div key={i} style={{
                  position: 'absolute', left: b.x, top: b.y,
                  width: 10, height: 10, borderRadius: '50%',
                  background: b.gold ? '#F5C42C' : '#ff6b35',
                  boxShadow: `0 0 8px 3px ${b.gold ? 'rgba(245,196,44,0.7)' : 'rgba(255,107,53,0.7)'}`,
                  animation: `bulbTwinkle ${0.7 + (i % 5) * 0.18}s ease-in-out infinite`,
                  animationDelay: b.delay,
                  transform: 'translate(-50%, -50%)',
                }} />
              ))}
              {/* Wheel + pointer */}
              <div style={{ position: 'relative', width: whlSize, height: whlSize }}>
                <div style={{
                  position: 'absolute', top: -22, left: '50%', transform: 'translateX(-50%)',
                  width: 0, height: 0,
                  borderLeft: '20px solid transparent', borderRight: '20px solid transparent',
                  borderTop: '40px solid #F5C42C',
                  filter: 'drop-shadow(0 3px 8px rgba(0,0,0,0.6))', zIndex: 10,
                }} />
                <canvas
                  ref={canvasRef}
                  style={{
                    display: 'block',
                    cursor: isIdle ? 'grab' : 'default',
                    touchAction: 'none',
                    borderRadius: '50%',
                    boxShadow: isLanded
                      ? '0 0 40px rgba(245,196,44,0.5), 0 0 80px rgba(196,30,58,0.3)'
                      : '0 0 20px rgba(0,0,0,0.6)',
                  }}
                />
              </div>
            </div>
            {hintVisible && isIdle && (
              <p style={{ marginTop: 4, fontSize: '0.85rem', color: 'rgba(245,196,44,0.5)', textAlign: 'center', fontStyle: 'italic' }}>
                {hint}
              </p>
            )}
            {isSpinning && (
              <p style={{ marginTop: 4, fontSize: '0.85rem', color: 'rgba(245,196,44,0.6)', textAlign: 'center', fontStyle: 'italic' }}>
                Round and round she goes...
              </p>
            )}
          </div>

          {/* Right: details panel */}
          <div ref={resultPanelRef} style={{ flex: 1, minWidth: 260, maxWidth: 420 }}>

            {/* Idle */}
            {isIdle && (
              <div style={{
                padding: '44px 28px', textAlign: 'center', borderRadius: 16,
                background: 'rgba(196,30,58,0.08)',
                border: '2px solid rgba(245,196,44,0.2)',
                boxShadow: 'inset 0 0 40px rgba(196,30,58,0.08)',
              }}>
                <div style={{ fontSize: 48, marginBottom: 16, display: 'inline-block', animation: 'starFloat 3s ease-in-out infinite' }}>⭐</div>
                <div style={{ fontFamily: "'Caveat', cursive", fontSize: 22, color: '#F5C42C', marginBottom: 10 }}>
                  Try your luck!
                </div>
                <p style={{ fontSize: '1rem', color: 'rgba(255,248,231,0.55)', lineHeight: 1.7, margin: 0 }}>
                  Grab the wheel and give it a spin - see which basket destiny has in store for you...
                </p>
              </div>
            )}

            {/* Spinning placeholder */}
            {isSpinning && (
              <div style={{
                padding: '44px 28px', textAlign: 'center', borderRadius: 16,
                background: 'rgba(196,30,58,0.08)', border: '2px solid rgba(245,196,44,0.2)',
              }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>🎡</div>
                <div style={{ fontFamily: "'Caveat', cursive", fontSize: 22, color: '#F5C42C', marginBottom: 10 }}>
                  The wheel decides...
                </div>
                <p style={{ fontSize: '1rem', color: 'rgba(255,248,231,0.55)', lineHeight: 1.7, margin: 0 }}>
                  Where will it land?
                </p>
              </div>
            )}

            {/* Try again */}
            {isTryAgain && (
              <div style={{
                borderRadius: 16, overflow: 'hidden',
                animation: 'detailPop 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
                border: '2px solid rgba(196,30,58,0.5)',
              }}>
                <div style={{ background: '#C41E3A', padding: '20px 28px 18px', textAlign: 'center' }}>
                  <div style={{ fontSize: 36, marginBottom: 8 }}>🎰</div>
                  <div style={{ fontFamily: "'Caveat', cursive", fontSize: 26, color: '#FFF8E7' }}>
                    Ooh, so close!
                  </div>
                </div>
                <div style={{ background: '#1a0510', padding: '20px 28px 28px', textAlign: 'center' }}>
                  <p style={{ fontSize: '0.95rem', color: 'rgba(255,248,231,0.7)', lineHeight: 1.6, margin: '0 0 20px' }}>
                    One of those baskets has your name on it. Give it another spin and claim your destiny!
                  </p>
                  <button onClick={resetSpin} className="raffle-action-btn">
                    Spin Again
                  </button>
                </div>
              </div>
            )}

            {/* Basket landed - ticket style */}
            {isLanded && winSeg && (
              <div style={{
                borderRadius: 16, overflow: 'hidden',
                animation: 'detailPop 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
                boxShadow: '0 8px 40px rgba(0,0,0,0.5), 0 0 0 2px rgba(245,196,44,0.3)',
              }}>
                {/* Ticket header - carnival red */}
                <div style={{ background: '#C41E3A', padding: '18px 24px 16px', position: 'relative' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontFamily: "'Caveat', cursive", fontSize: 14, color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                      Your Prediction
                    </div>
                    <div style={{ fontSize: 20 }}>⭐</div>
                  </div>
                </div>
                {/* Perforation */}
                <div className="ticket-perf" style={{ background: '#FFF8E7' }} />
                {/* Ticket body - warm cream */}
                <div style={{ background: '#FFF8E7', color: '#1a0510' }}>
                  {winSeg.image && (
                    <img
                      src={winSeg.image}
                      alt={winSeg.fullName}
                      style={{ width: '100%', height: 160, objectFit: 'contain', display: 'block', background: '#ffffff' }}
                    />
                  )}
                <div style={{ padding: '20px 24px 24px' }}>
                  <h2 style={{
                    fontFamily: "'Libre Baskerville', serif",
                    fontSize: 'clamp(1.1rem, 3vw, 1.45rem)',
                    color: '#1a0510', margin: '0 0 8px', lineHeight: 1.2, fontWeight: 700,
                  }}>
                    {winSeg.fullName}
                  </h2>
                  <div style={{
                    display: 'inline-block', background: '#C41E3A', borderRadius: 4,
                    padding: '3px 12px', fontSize: '0.85rem', color: '#fff', fontWeight: 700,
                    marginBottom: 16, letterSpacing: '0.04em',
                  }}>
                    VALUE: {winSeg.value}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: '#8a6a5a', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 10 }}>
                    What's in the basket
                  </div>
                  <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 20px' }}>
                    {winSeg.items.map((item, i) => (
                      <li key={i} style={{
                        display: 'flex', alignItems: 'flex-start', gap: 10,
                        padding: '4px 0', fontSize: '0.92rem', color: '#2d1a10', lineHeight: 1.5,
                        borderBottom: i < winSeg.items.length - 1 ? '1px solid rgba(180,100,80,0.15)' : 'none',
                      }}>
                        <span style={{ color: '#C41E3A', flexShrink: 0, fontSize: '0.75rem', marginTop: 4 }}>★</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                  <button onClick={resetSpin} className="raffle-action-btn" style={{ marginBottom: 10, background: 'transparent', color: '#C41E3A', borderColor: '#C41E3A' }}>
                    Spin Again
                  </button>
                  <button
                    onClick={() => handleShare(winSeg)}
                    className={`raffle-share-btn${copied ? ' copied' : ''}`}
                    style={{ border: '1px solid rgba(196,30,58,0.3)', background: 'rgba(196,30,58,0.06)', color: copied ? '#5bc98a' : '#C41E3A' }}
                  >
                    {copied ? 'Link copied!' : '↗ Share your prediction'}
                  </button>
                </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* CTA footer - carnival poster style */}
        <div style={{
          background: `repeating-linear-gradient(90deg, #C41E3A 0px, #C41E3A 30px, #8B0000 30px, #8B0000 60px)`,
          borderTop: '4px solid #F5C42C', borderBottom: '4px solid #F5C42C',
          padding: '52px 24px 60px', textAlign: 'center',
          position: 'relative', overflow: 'hidden',
        }}>
          {/* Overlay to tone down stripes */}
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 0 }} />
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ fontFamily: "'Caveat', cursive", fontSize: 'clamp(22px, 4vw, 36px)', color: '#F5C42C', marginBottom: 8, textShadow: '0 2px 8px rgba(0,0,0,0.6)' }}>
              Come and find out if you called it!
            </div>
            <h2 style={{
              fontFamily: "'Libre Baskerville', serif",
              fontSize: 'clamp(28px, 5vw, 52px)', color: '#FFF8E7', fontWeight: 700,
              margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: '0.06em',
              textShadow: '0 2px 12px rgba(0,0,0,0.7)',
            }}>
              Summerfest 2026
            </h2>
            <div style={{ fontFamily: "'Caveat', cursive", fontSize: 20, color: 'rgba(255,248,231,0.75)', marginBottom: 20 }}>
              Saturday June 20 - Manitou Beach
            </div>
            <p style={{ fontSize: 15, color: 'rgba(255,248,231,0.65)', maxWidth: 460, margin: '0 auto 32px', lineHeight: 1.7 }}>
              Raffle tickets, carnival games, live entertainment, food, local vendors, and the whole community - all in one place.
            </p>
            <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
              <a href="/ladies-club" className="raffle-cta-btn" style={{ background: '#F5C42C', color: '#1a0510' }}>
                Full Event Details
              </a>
              <a href="/ladies-club/vendor" className="raffle-cta-btn" style={{ border: '2px solid #F5C42C', color: '#F5C42C', background: 'transparent' }}>
                Become a Vendor
              </a>
            </div>
          </div>
        </div>

      </main>
      {!isEmbed && <Footer />}
    </>
  );
}
