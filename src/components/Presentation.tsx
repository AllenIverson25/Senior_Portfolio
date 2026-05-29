import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Anchor, ChevronLeft, ChevronRight, ArrowLeft, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

const ACCENT = '#C97850';
const NAVY   = '#08182E';
const WARM   = '#FBF7F3';
const MID    = '#1A3A54';
const TOTAL  = 9;
// Maps array-position → the section tag number shown at the top of each slide
// (intro slide has no tag so we use '—')
const SLIDE_NUMS = ['—', '01', '02', '03', '04', '05', '06', '07', '08'];

const tx = {
  enter: (d: number) => ({ x: d > 0 ? '100%' : '-100%', opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit:  (d: number) => ({ x: d > 0 ? '-60%' : '60%', opacity: 0, scale: 0.97 }),
};

const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.1 } } };
const up = {
  hidden: { opacity: 0, y: 32 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22,1,0.36,1] } },
};
const fade = {
  hidden: { opacity: 0 },
  show:   { opacity: 1, transition: { duration: 0.55 } },
};

function SectionTag({ n, label }: { n: string; label: string }) {
  return (
    <div className="flex items-center gap-3 mb-6">
      <span style={{ color: ACCENT, fontFamily: 'DM Sans, sans-serif', fontSize: '0.7vw', fontWeight: 700, letterSpacing: '0.25em', textTransform: 'uppercase' }}>
        {n}
      </span>
      <div style={{ width: '3vw', height: 1, background: ACCENT, opacity: 0.5 }} />
      <span style={{ color: 'rgba(251,247,243,0.4)', fontFamily: 'DM Sans, sans-serif', fontSize: '0.7vw', fontWeight: 600, letterSpacing: '0.2em', textTransform: 'uppercase' }}>
        {label}
      </span>
    </div>
  );
}

function SlideBase({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{
      position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
      justifyContent: 'center', padding: '4vh 6vw',
      background: `radial-gradient(ellipse at 80% 20%, rgba(201,120,80,0.07) 0%, transparent 60%), radial-gradient(ellipse at 10% 90%, rgba(26,90,134,0.12) 0%, transparent 60%), linear-gradient(160deg, ${NAVY} 0%, #0B1F2E 100%)`,
      ...style,
    }}>
      {children}
    </div>
  );
}

// ─── SLIDE 1: INTRO ───────────────────────────────────────────────────────────
function Slide1() {
  const [count, setCount] = useState({ y: 0, p: 0, i: 0 });
  useEffect(() => {
    const targets = { y: 3, p: 20, i: 5 };
    const steps = 40;
    let step = 0;
    const id = setInterval(() => {
      step++;
      const t = step / steps;
      setCount({ y: Math.round(t * targets.y), p: Math.round(t * targets.p), i: Math.round(t * targets.i) });
      if (step >= steps) clearInterval(id);
    }, 30);
    return () => clearInterval(id);
  }, []);
  return (
    <SlideBase>
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
        {[...Array(4)].map((_, i) => (
          <div key={i} style={{
            position: 'absolute', borderRadius: '50%', border: `1px solid rgba(201,120,80,${0.06 - i*0.01})`,
            width: `${30 + i*18}vw`, height: `${30 + i*18}vw`,
            right: `${-8 - i*5}vw`, top: `${-8 - i*5}vw`,
            animation: `slowSpin ${28 + i*6}s linear infinite`,
          }} />
        ))}
      </div>
      <motion.div variants={stagger} initial="hidden" animate="show" style={{ maxWidth: '70vw' }}>
        <motion.div variants={up} style={{ marginBottom: '2vh', display: 'flex', alignItems: 'center', gap: '1vw' }}>
          <div style={{ padding: '0.8vw', borderRadius: '50%', border: `1px solid rgba(201,120,80,0.35)`, background: 'rgba(201,120,80,0.1)', display: 'inline-flex' }}>
            <Anchor size={28} color={ACCENT} />
          </div>
          <span style={{ color: 'rgba(251,247,243,0.35)', fontFamily: 'DM Sans', fontSize: '0.75vw', fontWeight: 700, letterSpacing: '0.35em', textTransform: 'uppercase' }}>
            Marlboro HS · Web Design Capstone · 2026
          </span>
        </motion.div>

        <motion.h1 variants={up} style={{
          fontFamily: 'Libre Baskerville, serif', fontSize: '7.5vw', lineHeight: 1.05,
          fontWeight: 700, marginBottom: '2.5vh', letterSpacing: '-0.02em',
          background: `linear-gradient(135deg, ${WARM} 30%, ${ACCENT} 100%)`,
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
        }}>
          Ocean<br />Exploration
        </motion.h1>

        <motion.div variants={up} style={{ width: '6vw', height: '3px', background: `linear-gradient(to right, ${ACCENT}, transparent)`, marginBottom: '2.5vh', borderRadius: '2px' }} />

        <motion.p variants={up} style={{ fontFamily: 'DM Sans', fontSize: '1.6vw', color: 'rgba(251,247,243,0.7)', marginBottom: '4vh', lineHeight: 1.5 }}>
          A Senior Portfolio by <strong style={{ color: WARM }}>Joseph Friedman</strong>
        </motion.p>

        <motion.div variants={stagger} style={{ display: 'flex', gap: '4vw' }}>
          {[
            { val: count.y, label: 'Years in Program' },
            { val: `${count.p}+`, label: 'Projects Built' },
            { val: count.i, label: 'Portfolio Islands' },
          ].map(({ val, label }) => (
            <motion.div key={label} variants={up} style={{ display: 'flex', flexDirection: 'column', gap: '0.4vh' }}>
              <span style={{ fontFamily: 'Libre Baskerville, serif', fontSize: '3.5vw', fontWeight: 700, color: ACCENT }}>{val}</span>
              <span style={{ fontFamily: 'DM Sans', fontSize: '0.85vw', color: 'rgba(251,247,243,0.4)', fontWeight: 600, letterSpacing: '0.15em', textTransform: 'uppercase' }}>{label}</span>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>

      <div style={{ position: 'absolute', right: '6vw', bottom: '8vh', textAlign: 'right' }}>
        <p style={{ fontFamily: 'DM Sans', fontSize: '0.7vw', color: 'rgba(251,247,243,0.2)', letterSpacing: '0.2em', textTransform: 'uppercase' }}>Web Design Pathway Program</p>
        <p style={{ fontFamily: 'Libre Baskerville, serif', fontSize: '1vw', color: 'rgba(201,120,80,0.6)', fontStyle: 'italic' }}>Final Presentation · June 2026</p>
      </div>
    </SlideBase>
  );
}

// ─── SLIDE 2: RESEARCH ────────────────────────────────────────────────────────
function Slide2() {
  const portfolios = [
    {
      name: 'Bruno Simon',
      url: 'brunosimon.io',
      desc: 'Award-winning 3D portfolio built entirely in Three.js. Users drive a toy car around a 3D room to explore projects.',
      takeaway: '3D interaction creates emotional impact that flat portfolios can\'t match — users remember the experience.',
      color: '#1A4A6E',
    },
    {
      name: 'Brittany Chiang',
      url: 'brittanychiang.com',
      desc: 'Minimal dark developer portfolio with clean typography, a sticky sidebar nav, and featured project cards.',
      takeaway: 'A clear visual hierarchy lets the work speak for itself — restraint is a design choice, not a limitation.',
      color: '#1A3A50',
    },
    {
      name: 'Lynn Fisher',
      url: 'lynnandtonic.com',
      desc: 'Creative designer with a unique redesign every year. Each version is a completely different aesthetic experience.',
      takeaway: 'Personal visual identity is what separates memorable portfolios. Your site should feel uniquely you.',
      color: '#2A2A4A',
    },
  ];
  return (
    <SlideBase>
      <motion.div variants={stagger} initial="hidden" animate="show">
        <motion.div variants={up}><SectionTag n="01" label="Research" /></motion.div>
        <motion.h2 variants={up} style={{ fontFamily: 'Libre Baskerville, serif', fontSize: '3.8vw', color: WARM, marginBottom: '3vh', fontWeight: 700, letterSpacing: '-0.02em' }}>
          What I Studied
        </motion.h2>

        <motion.div variants={stagger} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.5vw', marginBottom: '3vh' }}>
          {portfolios.map((p) => (
            <motion.div key={p.name} variants={up} style={{
              background: `linear-gradient(135deg, ${p.color}, rgba(26,26,46,0.9))`,
              borderRadius: '1vw', padding: '2.5vh 1.8vw', border: '1px solid rgba(255,255,255,0.07)',
            }}>
              <p style={{ fontFamily: 'DM Sans', fontSize: '0.7vw', color: ACCENT, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '0.8vh' }}>Portfolio Studied</p>
              <h3 style={{ fontFamily: 'Libre Baskerville, serif', fontSize: '1.6vw', color: WARM, marginBottom: '0.4vh', fontWeight: 700 }}>{p.name}</h3>
              <p style={{ fontFamily: 'DM Sans', fontSize: '0.8vw', color: 'rgba(201,120,80,0.7)', marginBottom: '1.5vh', fontStyle: 'italic' }}>{p.url}</p>
              <p style={{ fontFamily: 'DM Sans', fontSize: '0.9vw', color: 'rgba(251,247,243,0.6)', lineHeight: 1.6, marginBottom: '1.5vh' }}>{p.desc}</p>
              <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '1.2vh' }}>
                <p style={{ fontFamily: 'DM Sans', fontSize: '0.85vw', color: WARM, lineHeight: 1.6, fontStyle: 'italic' }}>"{p.takeaway}"</p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        <motion.div variants={up} style={{
          background: 'rgba(201,120,80,0.1)', border: '1px solid rgba(201,120,80,0.25)',
          borderRadius: '0.8vw', padding: '1.5vh 2vw', display: 'flex', alignItems: 'center', gap: '1.5vw',
        }}>
          <Anchor size={20} color={ACCENT} />
          <p style={{ fontFamily: 'DM Sans', fontSize: '1vw', color: WARM, fontWeight: 500 }}>
            <strong style={{ color: ACCENT }}>Key Insight:</strong> The best portfolios have a strong visual identity, are easy to navigate, and let the work lead. This directly shaped my decision to use an ocean metaphor with 3D island navigation.
          </p>
        </motion.div>
      </motion.div>
    </SlideBase>
  );
}

// ─── SLIDE 3: DESIGN PROCESS ──────────────────────────────────────────────────
function Slide3() {
  return (
    <SlideBase>
      <motion.div variants={stagger} initial="hidden" animate="show">
        <motion.div variants={up}><SectionTag n="02" label="Design Process" /></motion.div>
        <motion.h2 variants={up} style={{ fontFamily: 'Libre Baskerville, serif', fontSize: '3.8vw', color: WARM, marginBottom: '3vh', fontWeight: 700, letterSpacing: '-0.02em' }}>
          From Sketch to 3D World
        </motion.h2>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: '2vw', alignItems: 'center' }}>
          <motion.div variants={up} style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '1vw', padding: '2vh 1.5vw', border: '1px solid rgba(255,255,255,0.08)' }}>
            <p style={{ fontFamily: 'DM Sans', fontSize: '0.7vw', color: ACCENT, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '1.5vh' }}>Lo-Fi Wireframe</p>
            <svg viewBox="0 0 320 200" style={{ width: '100%', height: 'auto' }}>
              <rect x="0" y="0" width="320" height="200" fill="rgba(8,24,46,0.8)" rx="4" />
              <rect x="10" y="10" width="300" height="25" fill="none" stroke="rgba(201,120,80,0.5)" strokeWidth="1" strokeDasharray="4,2" rx="2" />
              <text x="155" y="27" textAnchor="middle" fill="rgba(251,247,243,0.4)" fontSize="9" fontFamily="DM Sans">NAVIGATION BAR</text>
              <rect x="10" y="45" width="300" height="75" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="1" strokeDasharray="4,2" rx="2" />
              <text x="155" y="87" textAnchor="middle" fill="rgba(251,247,243,0.3)" fontSize="9" fontFamily="DM Sans">HERO — TITLE + DESCRIPTION</text>
              <text x="155" y="100" textAnchor="middle" fill="rgba(251,247,243,0.2)" fontSize="7" fontFamily="DM Sans">[button] Enter Portfolio</text>
              <rect x="10" y="130" width="90" height="60" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="1" strokeDasharray="4,2" rx="2" />
              <text x="55" y="163" textAnchor="middle" fill="rgba(251,247,243,0.3)" fontSize="7" fontFamily="DM Sans">Section 1</text>
              <rect x="115" y="130" width="90" height="60" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="1" strokeDasharray="4,2" rx="2" />
              <text x="160" y="163" textAnchor="middle" fill="rgba(251,247,243,0.3)" fontSize="7" fontFamily="DM Sans">Section 2</text>
              <rect x="220" y="130" width="90" height="60" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="1" strokeDasharray="4,2" rx="2" />
              <text x="265" y="163" textAnchor="middle" fill="rgba(251,247,243,0.3)" fontSize="7" fontFamily="DM Sans">Section 3</text>
            </svg>
            <div style={{ marginTop: '1.5vh' }}>
              <p style={{ fontFamily: 'DM Sans', fontSize: '0.8vw', color: 'rgba(251,247,243,0.5)', lineHeight: 1.6 }}>Rough layout sketch — standard top nav, hero section, card grid below. Simple and safe.</p>
            </div>
          </motion.div>

          <motion.div variants={fade} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5vh' }}>
            <ChevronRight size={28} color={ACCENT} />
            <p style={{ fontFamily: 'DM Sans', fontSize: '0.7vw', color: 'rgba(201,120,80,0.6)', letterSpacing: '0.1em', writingMode: 'vertical-rl', textTransform: 'uppercase', fontWeight: 700 }}>evolved into</p>
          </motion.div>

          <motion.div variants={up} style={{ background: `linear-gradient(135deg, ${MID}, rgba(8,24,46,0.9))`, borderRadius: '1vw', padding: '2vh 1.5vw', border: `1px solid rgba(201,120,80,0.2)` }}>
            <p style={{ fontFamily: 'DM Sans', fontSize: '0.7vw', color: ACCENT, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '1.5vh' }}>Hi-Fi Wireframe → Final</p>
            <svg viewBox="0 0 320 200" style={{ width: '100%', height: 'auto' }}>
              <defs>
                <radialGradient id="oceanGrad" cx="50%" cy="50%">
                  <stop offset="0%" stopColor="#1A5276" />
                  <stop offset="100%" stopColor="#08182E" />
                </radialGradient>
              </defs>
              <rect x="0" y="0" width="320" height="200" fill="url(#oceanGrad)" rx="4" />
              <circle cx="160" cy="100" r="85" fill="none" stroke="rgba(201,120,80,0.15)" strokeWidth="1" />
              <circle cx="160" cy="100" r="55" fill="none" stroke="rgba(201,120,80,0.1)" strokeWidth="1" />
              <ellipse cx="160" cy="105" rx="22" ry="14" fill="rgba(201,120,80,0.25)" stroke="rgba(201,120,80,0.6)" strokeWidth="1" />
              <text x="160" y="109" textAnchor="middle" fill={ACCENT} fontSize="8" fontFamily="DM Sans" fontWeight="bold">BOAT</text>
              <ellipse cx="110" cy="60" rx="18" ry="11" fill="rgba(46,100,60,0.4)" stroke="rgba(80,160,80,0.5)" strokeWidth="1" />
              <text x="110" y="64" textAnchor="middle" fill="rgba(251,247,243,0.7)" fontSize="7" fontFamily="DM Sans">About</text>
              <ellipse cx="220" cy="65" rx="16" ry="10" fill="rgba(40,80,140,0.4)" stroke="rgba(80,140,200,0.5)" strokeWidth="1" />
              <text x="220" y="69" textAnchor="middle" fill="rgba(251,247,243,0.7)" fontSize="7" fontFamily="DM Sans">Work</text>
              <ellipse cx="240" cy="140" rx="17" ry="10" fill="rgba(120,60,40,0.4)" stroke="rgba(201,120,80,0.5)" strokeWidth="1" />
              <text x="240" y="144" textAnchor="middle" fill="rgba(251,247,243,0.7)" fontSize="7" fontFamily="DM Sans">Skills</text>
              <ellipse cx="80" cy="145" rx="16" ry="10" fill="rgba(80,40,120,0.4)" stroke="rgba(140,80,200,0.5)" strokeWidth="1" />
              <text x="80" y="149" textAnchor="middle" fill="rgba(251,247,243,0.7)" fontSize="7" fontFamily="DM Sans">Contact</text>
              <text x="160" y="18" textAnchor="middle" fill="rgba(251,247,243,0.3)" fontSize="7" fontFamily="DM Sans">Ocean Exploration — Joseph Friedman</text>
            </svg>
            <div style={{ marginTop: '1.5vh' }}>
              <p style={{ fontFamily: 'DM Sans', fontSize: '0.8vw', color: 'rgba(251,247,243,0.5)', lineHeight: 1.6 }}>Replaced linear navigation with a 3D ocean world. Sections became islands the user physically sails to.</p>
            </div>
          </motion.div>
        </div>

        <motion.div variants={up} style={{ marginTop: '2vh', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1vw' }}>
          {['Replaced static nav with 3D ocean navigation', 'Added boat you actually control with WASD', 'Each project section became its own island to discover'].map((change, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.8vw', padding: '1.2vh 1.2vw', background: 'rgba(201,120,80,0.07)', borderRadius: '0.6vw', border: '1px solid rgba(201,120,80,0.12)' }}>
              <span style={{ color: ACCENT, fontWeight: 700, fontSize: '0.9vw', minWidth: 16 }}>{i + 1}.</span>
              <p style={{ fontFamily: 'DM Sans', fontSize: '0.85vw', color: 'rgba(251,247,243,0.7)', lineHeight: 1.5 }}>{change}</p>
            </div>
          ))}
        </motion.div>
      </motion.div>
    </SlideBase>
  );
}

// ─── SLIDE 4: DEVELOPMENT ─────────────────────────────────────────────────────
function Slide4() {
  const tech = [
    { name: 'HTML5 / CSS3', tag: 'Foundation', col: '#8B3A1A' },
    { name: 'JavaScript', tag: 'Logic', col: '#7A6A1A' },
    { name: 'JSON', tag: 'Data Layer', col: '#1A6A4A' },
    { name: 'Vue.js / jQuery', tag: 'Dynamic Content', col: '#1A4A7A' },
    { name: 'React + Vite', tag: 'Component System', col: '#3A1A6A' },
    { name: 'Three.js / R3F', tag: '3D Rendering', col: '#1A5A5A' },
    { name: 'GLSL Shaders', tag: 'Water FX', col: '#5A2A1A' },
    { name: 'Tailwind CSS', tag: 'Styling', col: '#1A3A6A' },
  ];
  return (
    <SlideBase>
      <motion.div variants={stagger} initial="hidden" animate="show" style={{ display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: '4vw', alignItems: 'center' }}>
        <div>
          <motion.div variants={up}><SectionTag n="03" label="Development" /></motion.div>
          <motion.h2 variants={up} style={{ fontFamily: 'Libre Baskerville, serif', fontSize: '3.8vw', color: WARM, marginBottom: '2.5vh', fontWeight: 700, letterSpacing: '-0.02em' }}>
            How It Was Built
          </motion.h2>

          <motion.div variants={stagger} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8vw', marginBottom: '2.5vh' }}>
            {tech.map((t) => (
              <motion.div key={t.name} variants={up} style={{
                background: `${t.col}22`, border: `1px solid ${t.col}55`,
                borderRadius: '0.5vw', padding: '0.8vh 1vw', display: 'flex', flexDirection: 'column', gap: '0.2vh',
              }}>
                <span style={{ fontFamily: 'DM Sans', fontSize: '0.9vw', color: WARM, fontWeight: 700 }}>{t.name}</span>
                <span style={{ fontFamily: 'DM Sans', fontSize: '0.65vw', color: 'rgba(251,247,243,0.4)', letterSpacing: '0.15em', textTransform: 'uppercase' }}>{t.tag}</span>
              </motion.div>
            ))}
          </motion.div>

          <motion.div variants={up}>
            <a href="https://official-sit-ezipzipzip--robertj50505.replit.app" target="_blank" rel="noopener noreferrer" style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.6vw',
              padding: '0.8vh 1.5vw', background: `rgba(201,120,80,0.15)`,
              border: `1px solid rgba(201,120,80,0.4)`, borderRadius: '2vw',
              fontFamily: 'DM Sans', fontSize: '0.9vw', color: ACCENT, fontWeight: 700,
              textDecoration: 'none', letterSpacing: '0.05em',
            }}>
              <ExternalLink size={14} />
              View Live Portfolio
            </a>
          </motion.div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5vh' }}>
          <motion.div variants={up} style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '1vw', padding: '2vh 1.8vw', border: '1px solid rgba(255,80,80,0.2)' }}>
            <p style={{ fontFamily: 'DM Sans', fontSize: '0.7vw', color: '#FF6B6B', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '0.8vh' }}>Technical Challenge</p>
            <p style={{ fontFamily: 'DM Sans', fontSize: '0.95vw', color: 'rgba(251,247,243,0.75)', lineHeight: 1.6, marginBottom: '1.2vh' }}>
              The ocean water rendered with an orange-red lava appearance instead of ocean blue — the fog color and wake effect were both wrong colors.
            </p>
            <div style={{ background: 'rgba(0,0,0,0.3)', borderRadius: '0.5vw', padding: '1vh 1.2vw', fontFamily: 'monospace', fontSize: '0.75vw', color: '#FF8A8A', lineHeight: 1.8 }}>
              <span style={{ color: 'rgba(255,255,255,0.3)' }}>// Before — wrong fog</span><br />
              <span style={{ color: '#FF8A8A' }}>fogColor: </span><span style={{ color: '#FF6060' }}>'#7A3820'</span>
            </div>
          </motion.div>

          <motion.div variants={up} style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '1vw', padding: '2vh 1.8vw', border: `1px solid rgba(80,200,180,0.2)` }}>
            <p style={{ fontFamily: 'DM Sans', fontSize: '0.7vw', color: '#50C8B4', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '0.8vh' }}>How I Solved It</p>
            <p style={{ fontFamily: 'DM Sans', fontSize: '0.95vw', color: 'rgba(251,247,243,0.75)', lineHeight: 1.6, marginBottom: '1.2vh' }}>
              Rewrote the GLSL fragment shader from scratch using Fresnel reflection math, proper ocean color vectors, and animated wave UV displacement.
            </p>
            <div style={{ background: 'rgba(0,0,0,0.3)', borderRadius: '0.5vw', padding: '1vh 1.2vw', fontFamily: 'monospace', fontSize: '0.75vw', color: '#50C8B4', lineHeight: 1.8 }}>
              <span style={{ color: 'rgba(255,255,255,0.3)' }}>// After — real ocean shader</span><br />
              <span style={{ color: '#88DDFF' }}>vec3 </span><span style={{ color: '#50C8B4' }}>oceanDeep</span> = <span style={{ color: '#88BBFF' }}>vec3(0.01, 0.07, 0.18)</span>;<br />
              <span style={{ color: '#88DDFF' }}>float </span><span style={{ color: '#50C8B4' }}>fresnel</span> = <span style={{ color: '#FFAA55' }}>pow(</span>1.0 - dot(vNormal, eye), 2.8<span style={{ color: '#FFAA55' }}>)</span>;
            </div>
          </motion.div>
        </div>
      </motion.div>
    </SlideBase>
  );
}

// ─── SLIDE 5: PORTFOLIO HIGHLIGHTS ────────────────────────────────────────────
function Slide5() {
  const base = import.meta.env.BASE_URL;
  const projects = [
    {
      year: 'Sophomore', badge: '#8B3A1A',
      name: 'Aruba',
      type: 'HTML · CSS',
      img: `${base}aruba.png`,
      url: 'https://7cdd20f1-1fce-4fbb-8e78-bd96efff519a-00-1qwayp5fnecvj.kirk.replit.dev/index.html',
      desc: 'A vibrant, island-inspired site built entirely in HTML and CSS. My first real attempt at translating a visual idea into a working webpage.',
      skills: ['HTML5', 'CSS3', 'Layout', 'Color Theory'],
      highlight: 'My first dive into web layout and design — inspired by the island\'s beauty.',
    },
    {
      year: 'Junior', badge: '#1A4A7A',
      name: 'Sea Bright',
      type: 'JavaScript · DOM',
      img: `${base}seabright.png`,
      url: 'https://alleniverson25.github.io/Summer-tainment-Site/',
      desc: 'An interactive summer guide for Sea Bright, NJ using vanilla JavaScript for DOM manipulation, dynamic rendering, and user-driven content.',
      skills: ['JavaScript', 'DOM API', 'Responsive', 'CSS Grid'],
      highlight: 'Interactivity became the focus — the site reacted to the user for the first time.',
    },
    {
      year: 'Senior', badge: '#1A5A3A',
      name: 'Symphony & Harmony',
      type: 'React · Transitions',
      img: `${base}symphony.png`,
      url: 'https://alleniverson25.github.io/Symphony-and-Harmony/',
      desc: 'A polished React application for wellness specialists with smooth page transitions, component-driven architecture, and a clean professional UI.',
      skills: ['React', 'CSS Transitions', 'Component Design', 'UX'],
      highlight: 'Applying advanced principles to create fluid applications for real clients.',
    },
  ];
  return (
    <SlideBase>
      <motion.div variants={stagger} initial="hidden" animate="show">
        <motion.div variants={up}><SectionTag n="05" label="Portfolio Highlights" /></motion.div>
        <motion.h2 variants={up} style={{ fontFamily: 'Libre Baskerville, serif', fontSize: '3.5vw', color: WARM, marginBottom: '2.5vh', fontWeight: 700, letterSpacing: '-0.02em' }}>
          Three Years of Work
        </motion.h2>

        <motion.div variants={stagger} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.5vw' }}>
          <motion.div variants={up} style={{ background: `linear-gradient(160deg, rgba(139,58,26,0.18), rgba(8,24,46,0.9))`, borderRadius: '1vw', overflow: 'hidden', border: '1px solid rgba(139,58,26,0.3)', display: 'flex', flexDirection: 'column' }}>
            <div style={{ height: '17vh', overflow: 'hidden', position: 'relative' }}>
              <img src={projects[0].img} alt="Aruba" crossOrigin="anonymous" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top' }} />
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 50%, rgba(8,24,46,0.9))' }} />
              <span style={{ position: 'absolute', top: '1vh', left: '1vw', padding: '0.3vh 0.8vw', background: 'rgba(139,58,26,0.8)', borderRadius: '2vw', fontFamily: 'DM Sans', fontSize: '0.65vw', color: WARM, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Sophomore</span>
            </div>
            <div style={{ padding: '1.5vh 1.5vw', display: 'flex', flexDirection: 'column', gap: '0.8vh', flex: 1 }}>
              <div>
                <h3 style={{ fontFamily: 'Libre Baskerville, serif', fontSize: '1.5vw', color: WARM, fontWeight: 700, marginBottom: '0.2vh' }}>Aruba</h3>
                <p style={{ fontFamily: 'DM Sans', fontSize: '0.7vw', color: ACCENT, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase' }}>HTML · CSS</p>
              </div>
              <p style={{ fontFamily: 'DM Sans', fontSize: '0.82vw', color: 'rgba(251,247,243,0.6)', lineHeight: 1.55 }}>{projects[0].desc}</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4vw' }}>
                {projects[0].skills.map(s => <span key={s} style={{ padding: '0.2vh 0.6vw', background: 'rgba(201,120,80,0.1)', border: '1px solid rgba(201,120,80,0.2)', borderRadius: '0.4vw', fontFamily: 'DM Sans', fontSize: '0.6vw', color: 'rgba(201,120,80,0.8)' }}>{s}</span>)}
              </div>
              <div style={{ borderTop: '1px solid rgba(255,255,255,0.07)', paddingTop: '0.8vh', marginTop: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <p style={{ fontFamily: 'DM Sans', fontSize: '0.78vw', color: 'rgba(251,247,243,0.45)', fontStyle: 'italic' }}>"{projects[0].highlight}"</p>
                <a href={projects[0].url} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '0.3vw', color: ACCENT, fontFamily: 'DM Sans', fontSize: '0.7vw', fontWeight: 700, textDecoration: 'none', whiteSpace: 'nowrap', marginLeft: '0.5vw' }}><ExternalLink size={11} /> View</a>
              </div>
            </div>
          </motion.div>

          <motion.div variants={up} style={{ background: `linear-gradient(160deg, rgba(26,74,122,0.18), rgba(8,24,46,0.9))`, borderRadius: '1vw', overflow: 'hidden', border: '1px solid rgba(26,74,122,0.3)', display: 'flex', flexDirection: 'column' }}>
            <div style={{ height: '17vh', overflow: 'hidden', position: 'relative' }}>
              <img src={projects[1].img} alt="Sea Bright" crossOrigin="anonymous" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top' }} />
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 50%, rgba(8,24,46,0.9))' }} />
              <span style={{ position: 'absolute', top: '1vh', left: '1vw', padding: '0.3vh 0.8vw', background: 'rgba(26,74,122,0.8)', borderRadius: '2vw', fontFamily: 'DM Sans', fontSize: '0.65vw', color: WARM, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Junior</span>
            </div>
            <div style={{ padding: '1.5vh 1.5vw', display: 'flex', flexDirection: 'column', gap: '0.8vh', flex: 1 }}>
              <div>
                <h3 style={{ fontFamily: 'Libre Baskerville, serif', fontSize: '1.5vw', color: WARM, fontWeight: 700, marginBottom: '0.2vh' }}>Sea Bright</h3>
                <p style={{ fontFamily: 'DM Sans', fontSize: '0.7vw', color: ACCENT, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase' }}>JavaScript · DOM</p>
              </div>
              <p style={{ fontFamily: 'DM Sans', fontSize: '0.82vw', color: 'rgba(251,247,243,0.6)', lineHeight: 1.55 }}>{projects[1].desc}</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4vw' }}>
                {projects[1].skills.map(s => <span key={s} style={{ padding: '0.2vh 0.6vw', background: 'rgba(201,120,80,0.1)', border: '1px solid rgba(201,120,80,0.2)', borderRadius: '0.4vw', fontFamily: 'DM Sans', fontSize: '0.6vw', color: 'rgba(201,120,80,0.8)' }}>{s}</span>)}
              </div>
              <div style={{ borderTop: '1px solid rgba(255,255,255,0.07)', paddingTop: '0.8vh', marginTop: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <p style={{ fontFamily: 'DM Sans', fontSize: '0.78vw', color: 'rgba(251,247,243,0.45)', fontStyle: 'italic' }}>"{projects[1].highlight}"</p>
                <a href={projects[1].url} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '0.3vw', color: ACCENT, fontFamily: 'DM Sans', fontSize: '0.7vw', fontWeight: 700, textDecoration: 'none', whiteSpace: 'nowrap', marginLeft: '0.5vw' }}><ExternalLink size={11} /> View</a>
              </div>
            </div>
          </motion.div>

          <motion.div variants={up} style={{ background: `linear-gradient(160deg, rgba(26,90,58,0.18), rgba(8,24,46,0.9))`, borderRadius: '1vw', overflow: 'hidden', border: `1px solid rgba(201,120,80,0.3)`, display: 'flex', flexDirection: 'column' }}>
            <div style={{ height: '17vh', overflow: 'hidden', position: 'relative' }}>
              <img src={projects[2].img} alt="Symphony & Harmony" crossOrigin="anonymous" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top' }} />
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 50%, rgba(8,24,46,0.9))' }} />
              <span style={{ position: 'absolute', top: '1vh', left: '1vw', padding: '0.3vh 0.8vw', background: `rgba(201,120,80,0.8)`, borderRadius: '2vw', fontFamily: 'DM Sans', fontSize: '0.65vw', color: WARM, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Senior</span>
            </div>
            <div style={{ padding: '1.5vh 1.5vw', display: 'flex', flexDirection: 'column', gap: '0.8vh', flex: 1 }}>
              <div>
                <h3 style={{ fontFamily: 'Libre Baskerville, serif', fontSize: '1.5vw', color: WARM, fontWeight: 700, marginBottom: '0.2vh' }}>Symphony & Harmony</h3>
                <p style={{ fontFamily: 'DM Sans', fontSize: '0.7vw', color: ACCENT, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase' }}>React · Transitions</p>
              </div>
              <p style={{ fontFamily: 'DM Sans', fontSize: '0.82vw', color: 'rgba(251,247,243,0.6)', lineHeight: 1.55 }}>{projects[2].desc}</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4vw' }}>
                {projects[2].skills.map(s => <span key={s} style={{ padding: '0.2vh 0.6vw', background: 'rgba(201,120,80,0.1)', border: '1px solid rgba(201,120,80,0.2)', borderRadius: '0.4vw', fontFamily: 'DM Sans', fontSize: '0.6vw', color: 'rgba(201,120,80,0.8)' }}>{s}</span>)}
              </div>
              <div style={{ borderTop: '1px solid rgba(255,255,255,0.07)', paddingTop: '0.8vh', marginTop: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <p style={{ fontFamily: 'DM Sans', fontSize: '0.78vw', color: 'rgba(251,247,243,0.45)', fontStyle: 'italic' }}>"{projects[2].highlight}"</p>
                <a href={projects[2].url} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '0.3vw', color: ACCENT, fontFamily: 'DM Sans', fontSize: '0.7vw', fontWeight: 700, textDecoration: 'none', whiteSpace: 'nowrap', marginLeft: '0.5vw' }}><ExternalLink size={11} /> View</a>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </motion.div>
    </SlideBase>
  );
}

// ─── SLIDE 6: AI USAGE ────────────────────────────────────────────────────────
function Slide6() {
  const examples = [
    {
      num: '01',
      title: 'Water Shader Generation',
      prompt: '"Write a GLSL fragment shader for a realistic ocean water surface with Fresnel reflection and animated wave UV distortion."',
      what: 'Claude generated a working GLSL shader with proper color mixing and normal-based Fresnel calculation.',
      modified: 'Changed the color palette from a generic teal to deep navy (#010E18 → #0D3558), tuned wave amplitudes by hand, and fixed UV tiling to match the mesh scale.',
      limit: 'The AI couldn\'t predict how it would look until rendered — I had to iterate visually.',
    },
    {
      num: '02',
      title: 'JSON Data Structure',
      prompt: '"Create a JSON structure for a portfolio website with 5 island sections, each containing project data with name, description, skills, and year."',
      what: 'Got a well-organized JSON schema with nested project arrays and metadata fields.',
      modified: 'Added custom fields like skinUnlock for boat cosmetics, island position coordinates for 3D placement, and a reflection field not in the original output.',
      limit: 'All content was placeholder — I had to write every actual project description and reflection myself.',
    },
    {
      num: '03',
      title: 'Three.js Animation Pattern',
      prompt: '"How do I use React Three Fiber\'s useFrame hook to animate a 3D object smoothly based on user keyboard input?"',
      what: 'Explained the useFrame pattern with delta-time physics, velocity interpolation with THREE.MathUtils.lerp, and ref-based state to avoid re-renders.',
      modified: 'Applied the pattern to build the full boat controller with boost mechanic, tilt physics, and boundary clamping — none of which were in the AI response.',
      limit: 'The AI gave a simple single-axis example; I had to extend it to handle 6DOF boat physics myself.',
    },
  ];
  return (
    <SlideBase>
      <motion.div variants={stagger} initial="hidden" animate="show">
        <motion.div variants={up}><SectionTag n="06" label="AI Usage" /></motion.div>
        <motion.h2 variants={up} style={{ fontFamily: 'Libre Baskerville, serif', fontSize: '3.5vw', color: WARM, marginBottom: '2.5vh', fontWeight: 700, letterSpacing: '-0.02em' }}>
          Working With AI
        </motion.h2>

        <motion.div variants={stagger} style={{ display: 'flex', flexDirection: 'column', gap: '1.2vh' }}>
          {examples.map((ex) => (
            <motion.div key={ex.num} variants={up} style={{
              display: 'grid', gridTemplateColumns: '3.5vw 1fr 1fr 1fr', gap: '1.5vw', alignItems: 'start',
              background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: '0.8vw', padding: '1.5vh 1.5vw',
            }}>
              <div style={{ fontFamily: 'Libre Baskerville, serif', fontSize: '2vw', color: `rgba(201,120,80,0.25)`, fontWeight: 700, lineHeight: 1 }}>{ex.num}</div>
              <div>
                <p style={{ fontFamily: 'DM Sans', fontSize: '0.7vw', color: ACCENT, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '0.5vh' }}>Prompt</p>
                <p style={{ fontFamily: 'DM Sans', fontSize: '0.82vw', color: WARM, fontWeight: 600, marginBottom: '0.5vh' }}>{ex.title}</p>
                <p style={{ fontFamily: 'DM Sans', fontSize: '0.78vw', color: 'rgba(251,247,243,0.5)', lineHeight: 1.55, fontStyle: 'italic' }}>{ex.prompt}</p>
              </div>
              <div>
                <p style={{ fontFamily: 'DM Sans', fontSize: '0.7vw', color: '#50C8B4', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '0.5vh' }}>What It Gave Me</p>
                <p style={{ fontFamily: 'DM Sans', fontSize: '0.82vw', color: 'rgba(251,247,243,0.65)', lineHeight: 1.55 }}>{ex.what}</p>
              </div>
              <div>
                <p style={{ fontFamily: 'DM Sans', fontSize: '0.7vw', color: '#FFAA55', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '0.5vh' }}>What I Changed + Its Limits</p>
                <p style={{ fontFamily: 'DM Sans', fontSize: '0.78vw', color: 'rgba(251,247,243,0.6)', lineHeight: 1.55 }}>{ex.modified}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        <motion.div variants={up} style={{ marginTop: '1.5vh', padding: '1.2vh 1.8vw', background: 'rgba(201,120,80,0.08)', borderRadius: '0.6vw', border: '1px solid rgba(201,120,80,0.15)' }}>
          <p style={{ fontFamily: 'DM Sans', fontSize: '0.9vw', color: 'rgba(251,247,243,0.6)', fontStyle: 'italic' }}>
            <strong style={{ color: WARM }}>My understanding:</strong> AI accelerated the technical parts I hadn't seen before, but every creative and visual decision — the ocean theme, island metaphors, boat physics feel, color palette — was entirely my own design work.
          </p>
        </motion.div>
      </motion.div>
    </SlideBase>
  );
}

// ─── SLIDE 7: REFLECTION ──────────────────────────────────────────────────────
function Slide7() {
  return (
    <SlideBase>
      <motion.div variants={stagger} initial="hidden" animate="show" style={{ display: 'grid', gridTemplateColumns: '0.85fr 1.15fr', gap: '5vw', alignItems: 'center' }}>
        <div>
          <motion.div variants={up}><SectionTag n="07" label="Reflection" /></motion.div>
          <motion.h2 variants={up} style={{ fontFamily: 'Libre Baskerville, serif', fontSize: '3.8vw', color: WARM, marginBottom: '3vh', fontWeight: 700, letterSpacing: '-0.02em' }}>
            What I<br />Learned
          </motion.h2>
          <motion.div variants={up} style={{ borderLeft: `3px solid ${ACCENT}`, paddingLeft: '1.5vw', marginBottom: '3vh' }}>
            <p style={{ fontFamily: 'Libre Baskerville, serif', fontSize: '1.4vw', color: WARM, lineHeight: 1.65, fontStyle: 'italic' }}>
              "I went from manually centering a div to building a 3D interactive world that runs in a browser. That gap is what three years of this program looks like."
            </p>
          </motion.div>
          <motion.div variants={up} style={{ display: 'flex', flexDirection: 'column', gap: '0.6vh' }}>
            <p style={{ fontFamily: 'DM Sans', fontSize: '0.75vw', color: ACCENT, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase' }}>Key Growth Moments</p>
            {['First time a fetch() call returned real data from JSON', 'Debugging a GLSL shader with no error messages — only pixels', 'Seeing non-technical people actually enjoy navigating the site'].map((m, i) => (
              <div key={i} style={{ display: 'flex', gap: '0.8vw', alignItems: 'flex-start' }}>
                <span style={{ color: ACCENT, fontWeight: 700, fontSize: '0.9vw', marginTop: '0.1vh' }}>→</span>
                <p style={{ fontFamily: 'DM Sans', fontSize: '0.88vw', color: 'rgba(251,247,243,0.6)', lineHeight: 1.5 }}>{m}</p>
              </div>
            ))}
          </motion.div>
        </div>

        <motion.div variants={stagger} style={{ display: 'flex', flexDirection: 'column', gap: '1.2vh' }}>
          {[
            { label: 'What was easy', icon: '✓', color: '#50C8B4', text: 'CSS animations and layout thinking came naturally. Breaking a design into components felt intuitive after Year 2.' },
            { label: 'What was hard', icon: '!', color: '#FF8A8A', text: 'GLSL shaders and 3D math — there is no "Inspect Element" for a fragment shader. Pure trial and error for days.' },
            { label: 'What I would change', icon: '↺', color: '#FFAA55', text: 'Start with a design system and responsive breakpoints from day one. I rebuilt the mobile layout three times.' },
            { label: 'Most proud of', icon: '★', color: ACCENT, text: 'The ocean water shader. It took two full days to look right, and when it finally did, it felt like the entire project came alive.' },
          ].map((item) => (
            <motion.div key={item.label} variants={up} style={{
              display: 'grid', gridTemplateColumns: '2.5vw 1fr', gap: '1vw', alignItems: 'start',
              padding: '1.5vh 1.5vw', background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.06)', borderRadius: '0.7vw',
            }}>
              <div style={{ width: '2vw', height: '2vw', borderRadius: '50%', background: `${item.color}20`, border: `1px solid ${item.color}55`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'DM Sans', fontSize: '0.85vw', color: item.color, fontWeight: 700 }}>
                {item.icon}
              </div>
              <div>
                <p style={{ fontFamily: 'DM Sans', fontSize: '0.7vw', color: item.color, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '0.3vh' }}>{item.label}</p>
                <p style={{ fontFamily: 'DM Sans', fontSize: '0.85vw', color: 'rgba(251,247,243,0.65)', lineHeight: 1.55 }}>{item.text}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </SlideBase>
  );
}

// ─── SLIDE 8: FUTURE ──────────────────────────────────────────────────────────
function Slide8() {
  return (
    <SlideBase>
      <motion.div variants={stagger} initial="hidden" animate="show">
        <motion.div variants={up}><SectionTag n="08" label="Future Plans" /></motion.div>
        <motion.h2 variants={up} style={{ fontFamily: 'Libre Baskerville, serif', fontSize: '4vw', color: WARM, marginBottom: '3vh', fontWeight: 700, letterSpacing: '-0.02em' }}>
          What Comes Next
        </motion.h2>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2.5vw' }}>
          <motion.div variants={stagger} style={{ display: 'flex', flexDirection: 'column', gap: '1.2vh' }}>
            <motion.div variants={up} style={{ padding: '2.5vh 2vw', background: `linear-gradient(135deg, ${MID}, rgba(8,24,46,0.8))`, borderRadius: '1vw', border: `1px solid rgba(201,120,80,0.2)` }}>
              <p style={{ fontFamily: 'DM Sans', fontSize: '0.7vw', color: ACCENT, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '1vh' }}>After High School</p>
              <p style={{ fontFamily: 'DM Sans', fontSize: '0.95vw', color: 'rgba(251,247,243,0.75)', lineHeight: 1.7 }}>
                Majoring in <strong style={{ color: WARM }}>Financial Mathematics</strong> — pursuing the intersection of quantitative analysis, applied math, and technology. Web Design Pathway gave me the technical foundation to build the tools that back-office finance runs on.
              </p>
            </motion.div>
            <motion.div variants={up} style={{ padding: '2.5vh 2vw', background: 'rgba(255,255,255,0.03)', borderRadius: '1vw', border: '1px solid rgba(255,255,255,0.07)' }}>
              <p style={{ fontFamily: 'DM Sans', fontSize: '0.7vw', color: '#88CCEE', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '1vh' }}>Career Goals</p>
              <p style={{ fontFamily: 'DM Sans', fontSize: '0.95vw', color: 'rgba(251,247,243,0.7)', lineHeight: 1.7 }}>
                Quantitative analyst, fintech engineer, or data visualization developer — combining mathematical modeling with the web-building skills from this program to make complex financial data readable and interactive.
              </p>
            </motion.div>
          </motion.div>

          <motion.div variants={stagger} style={{ display: 'flex', flexDirection: 'column', gap: '1.2vh' }}>
            <motion.div variants={up} style={{ padding: '2.5vh 2vw', background: 'rgba(255,255,255,0.03)', borderRadius: '1vw', border: '1px solid rgba(255,255,255,0.07)' }}>
              <p style={{ fontFamily: 'DM Sans', fontSize: '0.7vw', color: '#50C8B4', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '1vh' }}>How This Program Prepared Me</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.7vh' }}>
                {['Built a foundation in HTML/CSS I still use every single day', 'Learned how data and UI connect through JSON + fetch()', 'Gained confidence shipping real work that real people interact with', 'Learned that design and engineering are the same craft approached differently'].map((item, i) => (
                  <div key={i} style={{ display: 'flex', gap: '0.8vw', alignItems: 'flex-start' }}>
                    <span style={{ color: '#50C8B4', fontWeight: 700, fontSize: '0.9vw' }}>→</span>
                    <p style={{ fontFamily: 'DM Sans', fontSize: '0.85vw', color: 'rgba(251,247,243,0.6)', lineHeight: 1.5 }}>{item}</p>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div variants={up} style={{ padding: '2vh 2vw', background: `rgba(201,120,80,0.1)`, border: `1px solid rgba(201,120,80,0.25)`, borderRadius: '1vw' }}>
              <p style={{ fontFamily: 'Libre Baskerville, serif', fontSize: '1.2vw', color: WARM, lineHeight: 1.65, fontStyle: 'italic', marginBottom: '1vh' }}>
                "The ocean exploration metaphor wasn't just a design choice — it's how I actually think about learning. You sail toward something unknown, land on it, and it changes you."
              </p>
              <p style={{ fontFamily: 'DM Sans', fontSize: '0.75vw', color: ACCENT, fontWeight: 600 }}>— Joseph Friedman</p>
            </motion.div>
          </motion.div>
        </div>

        <motion.div variants={up} style={{ marginTop: '2.5vh', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '2vw' }}>
          <div style={{ height: '1px', flex: 1, background: 'linear-gradient(to right, transparent, rgba(201,120,80,0.3))' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.8vw' }}>
            <Anchor size={18} color={ACCENT} />
            <p style={{ fontFamily: 'DM Sans', fontSize: '0.8vw', color: 'rgba(251,247,243,0.35)', letterSpacing: '0.2em', textTransform: 'uppercase' }}>Joseph Friedman · Web Design Pathway Program · Class of 2026</p>
          </div>
          <div style={{ height: '1px', flex: 1, background: 'linear-gradient(to left, transparent, rgba(201,120,80,0.3))' }} />
        </motion.div>
      </motion.div>
    </SlideBase>
  );
}

// ─── SLIDE 9: RESPONSIVE SHOWCASE ─────────────────────────────────────────────
function Slide9() {
  const base       = import.meta.env.BASE_URL;
  const imgDesktop = `${base}portfolio-desktop.png`;
  const imgMobile  = `${base}portfolio-mobile.png`;
  const liveUrl    = 'https://official-sit-ezipzipzip--robertj50505.replit.app';

  const Screen = ({
    radius = '0.6vw',
    aspectRatio = '16 / 9',
    src = imgDesktop,
    fit = 'contain',
  }: { radius?: string; aspectRatio?: string; src?: string; fit?: string }) => (
    <div style={{
      width: '100%',
      aspectRatio,
      background: NAVY,
      borderRadius: radius,
      overflow: 'hidden',
      flexShrink: 0,
    }}>
      <img
        src={src}
        alt="Ocean Exploration portfolio"
        style={{ width: '100%', height: '100%', objectFit: fit as React.CSSProperties['objectFit'], objectPosition: 'center', display: 'block' }}
      />
    </div>
  );

  return (
    <SlideBase>
      <motion.div variants={stagger} initial="hidden" animate="show" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <motion.div variants={up}><SectionTag n="04" label="Live Portfolio" /></motion.div>
        <motion.h2 variants={up} style={{ fontFamily: 'Libre Baskerville, serif', fontSize: '3.2vw', color: WARM, marginBottom: '1.5vh', fontWeight: 700, letterSpacing: '-0.02em' }}>
          Built Responsive. Works Everywhere.
        </motion.h2>

        <motion.div variants={stagger} style={{ display: 'grid', gridTemplateColumns: '1fr 2.2fr 1.5fr', gap: '2vw', alignItems: 'end', flex: 1, minHeight: 0 }}>

          {/* ── Mobile ── */}
          <motion.div variants={up} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.8vh' }}>
            <p style={{ fontFamily: 'DM Sans', fontSize: '0.7vw', color: 'rgba(251,247,243,0.35)', letterSpacing: '0.2em', textTransform: 'uppercase', fontWeight: 700 }}>Mobile</p>
            <div style={{
              width: '100%', maxWidth: '12vw',
              background: '#0D1117', borderRadius: '2.5vw',
              border: '2px solid rgba(255,255,255,0.12)',
              padding: '1.8vh 0.8vw 1.2vh',
              boxShadow: '0 8px 40px rgba(0,0,0,0.6)',
              overflow: 'hidden',
            }}>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.8vh' }}>
                <div style={{ width: '2.5vw', height: '0.45vh', background: 'rgba(255,255,255,0.15)', borderRadius: '1vw' }} />
              </div>
              <Screen radius="1vw" src={imgMobile} aspectRatio="9 / 16" fit="cover" />
              <div style={{ display: 'flex', justifyContent: 'center', marginTop: '0.8vh' }}>
                <div style={{ width: '1.4vw', height: '1.4vw', borderRadius: '50%', border: '1.5px solid rgba(255,255,255,0.15)' }} />
              </div>
            </div>
            <p style={{ fontFamily: 'DM Sans', fontSize: '0.7vw', color: 'rgba(251,247,243,0.25)' }}>375px</p>
          </motion.div>

          {/* ── Desktop ── */}
          <motion.div variants={up} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.8vh' }}>
            <p style={{ fontFamily: 'DM Sans', fontSize: '0.7vw', color: ACCENT, letterSpacing: '0.2em', textTransform: 'uppercase', fontWeight: 700 }}>Desktop</p>
            <div style={{
              width: '100%',
              background: '#0D1117', borderRadius: '1vw',
              border: `2px solid rgba(201,120,80,0.4)`,
              overflow: 'hidden',
              boxShadow: `0 0 40px rgba(201,120,80,0.15), 0 12px 60px rgba(0,0,0,0.7)`,
            }}>
              {/* browser chrome */}
              <div style={{ background: '#1A1A2E', padding: '0.7vh 1vw', display: 'flex', alignItems: 'center', gap: '0.4vw', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ width: '0.65vw', height: '0.65vw', borderRadius: '50%', background: '#FF5F57' }} />
                <div style={{ width: '0.65vw', height: '0.65vw', borderRadius: '50%', background: '#FEBC2E' }} />
                <div style={{ width: '0.65vw', height: '0.65vw', borderRadius: '50%', background: '#28C840' }} />
                <div style={{ flex: 1, marginLeft: '0.5vw', background: 'rgba(255,255,255,0.06)', borderRadius: '0.4vw', padding: '0.25vh 0.8vw' }}>
                  <p style={{ fontFamily: 'DM Sans', fontSize: '0.55vw', color: 'rgba(255,255,255,0.3)', margin: 0 }}>official-sit-ezipzipzip--robertj50505.replit.app</p>
                </div>
              </div>
              <Screen radius="0" />
            </div>
            <p style={{ fontFamily: 'DM Sans', fontSize: '0.7vw', color: 'rgba(251,247,243,0.25)' }}>1440px</p>
          </motion.div>

          {/* ── Tablet + CTA ── */}
          <motion.div variants={up} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.8vh' }}>
            <p style={{ fontFamily: 'DM Sans', fontSize: '0.7vw', color: 'rgba(251,247,243,0.35)', letterSpacing: '0.2em', textTransform: 'uppercase', fontWeight: 700 }}>Tablet</p>
            <div style={{
              width: '100%',
              background: '#0D1117', borderRadius: '1.5vw',
              border: '2px solid rgba(255,255,255,0.1)',
              padding: '0.8vh 0.6vw 1vh',
              boxShadow: '0 8px 40px rgba(0,0,0,0.6)',
              overflow: 'hidden',
            }}>
              <Screen radius="0.8vw" />
              <div style={{ display: 'flex', justifyContent: 'center', marginTop: '0.6vh' }}>
                <div style={{ width: '2vw', height: '0.35vh', background: 'rgba(255,255,255,0.15)', borderRadius: '1vw' }} />
              </div>
            </div>
            <p style={{ fontFamily: 'DM Sans', fontSize: '0.7vw', color: 'rgba(251,247,243,0.25)' }}>768px</p>

            <a
              href={liveUrl} target="_blank" rel="noopener noreferrer"
              style={{
                marginTop: '0.8vh', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5vw',
                padding: '1.1vh 1.4vw', width: '100%',
                background: `linear-gradient(135deg, ${ACCENT}, #A56241)`,
                borderRadius: '1vw', fontFamily: 'Libre Baskerville, serif', fontSize: '0.95vw',
                color: WARM, fontWeight: 700, textDecoration: 'none',
                boxShadow: `0 4px 24px rgba(201,120,80,0.4)`,
              }}
            >
              <ExternalLink size={14} /> View Live
            </a>
          </motion.div>
        </motion.div>

        <motion.div variants={up} style={{ marginTop: '1.5vh', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '2vw' }}>
          <div style={{ height: '1px', flex: 1, background: 'linear-gradient(to right, transparent, rgba(201,120,80,0.3))' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.8vw' }}>
            <Anchor size={14} color={ACCENT} />
            <p style={{ fontFamily: 'DM Sans', fontSize: '0.7vw', color: 'rgba(251,247,243,0.35)', letterSpacing: '0.2em', textTransform: 'uppercase' }}>Joseph Friedman · Web Design Pathway Program · Class of 2026</p>
          </div>
          <div style={{ height: '1px', flex: 1, background: 'linear-gradient(to left, transparent, rgba(201,120,80,0.3))' }} />
        </motion.div>
      </motion.div>
    </SlideBase>
  );
}

const SLIDE_COMPONENTS = [Slide1, Slide2, Slide3, Slide4, Slide9, Slide5, Slide6, Slide7, Slide8];
const SLIDE_TITLES = ['Introduction', 'Research', 'Design Process', 'Development', 'Live Portfolio', 'Portfolio Highlights', 'AI Usage', 'Reflection', 'Future Plans'];

// ─── MAIN PRESENTATION ────────────────────────────────────────────────────────
export default function Presentation() {
  const [current, setCurrent] = useState(0);
  const [dir, setDir] = useState(1);
  const [showHint, setShowHint] = useState(true);
  const touchX = useRef<number | null>(null);

  const go = useCallback((delta: number) => {
    setCurrent(c => {
      const next = Math.max(0, Math.min(TOTAL - 1, c + delta));
      if (next !== c) setDir(delta);
      return next;
    });
    setShowHint(false);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setShowHint(false), 3500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ') go(1);
      if (e.key === 'ArrowLeft') go(-1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [go]);

  const onTouchStart = (e: React.TouchEvent) => { touchX.current = e.touches[0].clientX; };
  const onTouchEnd   = (e: React.TouchEvent) => {
    if (touchX.current === null) return;
    const dx = touchX.current - e.changedTouches[0].clientX;
    if (Math.abs(dx) > 50) go(dx > 0 ? 1 : -1);
    touchX.current = null;
  };

  const SlideComponent = SLIDE_COMPONENTS[current];

  return (
    <div
      style={{ position: 'fixed', inset: 0, background: NAVY, overflow: 'hidden', userSelect: 'none' }}
      onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}
    >
      <style>{`
        @keyframes slowSpin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes floatUp  { 0%,100% { transform: translateY(0); opacity:0.4; } 50% { transform: translateY(-10px); opacity:0.8; } }
      `}</style>

      {/* Background particles */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
        {[...Array(18)].map((_, i) => (
          <div key={i} style={{
            position: 'absolute', borderRadius: '50%',
            width: `${3 + (i % 4)}px`, height: `${3 + (i % 4)}px`,
            background: `rgba(201,120,80,${0.06 + (i % 3) * 0.04})`,
            left: `${(i * 17 + 5) % 100}%`, top: `${(i * 23 + 10) % 100}%`,
            animation: `floatUp ${5 + (i % 4)}s ${(i * 0.7) % 3}s ease-in-out infinite`,
          }} />
        ))}
      </div>

      {/* Top bar */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '6vh', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 2.5vw', zIndex: 50, borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.6vw', color: 'rgba(251,247,243,0.4)', textDecoration: 'none', fontFamily: 'DM Sans', fontSize: '0.75vw', fontWeight: 600, letterSpacing: '0.05em', transition: 'color 0.2s' }} onMouseEnter={e => (e.currentTarget.style.color = ACCENT)} onMouseLeave={e => (e.currentTarget.style.color = 'rgba(251,247,243,0.4)')}>
          <ArrowLeft size={14} /> Back to Portfolio
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5vw' }}>
          <span style={{ fontFamily: 'DM Sans', fontSize: '0.7vw', color: ACCENT, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase' }}>{SLIDE_TITLES[current]}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8vw' }}>
          <Anchor size={12} color={`rgba(201,120,80,0.5)`} />
          <span style={{ fontFamily: 'DM Sans', fontSize: '0.7vw', color: 'rgba(251,247,243,0.25)', fontWeight: 600, letterSpacing: '0.1em' }}>Joseph Friedman · Senior Capstone</span>
        </div>
      </div>

      {/* Slide area */}
      <div style={{ position: 'absolute', top: '6vh', bottom: '8vh', left: 0, right: 0, overflow: 'hidden' }}>
        <AnimatePresence custom={dir} mode="wait">
          <motion.div
            key={current}
            custom={dir}
            variants={tx}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            style={{ position: 'absolute', inset: 0 }}
          >
            <SlideComponent />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom nav bar */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '8vh', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 2.5vw', zIndex: 50, borderTop: '1px solid rgba(255,255,255,0.04)' }}>
        {/* Prev */}
        <button
          onClick={() => go(-1)}
          disabled={current === 0}
          style={{ display: 'flex', alignItems: 'center', gap: '0.5vw', background: 'none', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '2vw', padding: '0.6vh 1.2vw', cursor: current === 0 ? 'not-allowed' : 'pointer', opacity: current === 0 ? 0.3 : 1, color: 'rgba(251,247,243,0.6)', fontFamily: 'DM Sans', fontSize: '0.75vw', fontWeight: 600, transition: 'all 0.2s' }}
          onMouseEnter={e => { if (current > 0) { (e.currentTarget as HTMLButtonElement).style.borderColor = ACCENT; (e.currentTarget as HTMLButtonElement).style.color = ACCENT; } }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,255,255,0.08)'; (e.currentTarget as HTMLButtonElement).style.color = 'rgba(251,247,243,0.6)'; }}
        >
          <ChevronLeft size={14} /> Previous
        </button>

        {/* Progress dots */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5vh' }}>
          <div style={{ display: 'flex', gap: '0.5vw', alignItems: 'center' }}>
            {SLIDE_COMPONENTS.map((_, i) => (
              <button
                key={i}
                onClick={() => { setDir(i > current ? 1 : -1); setCurrent(i); setShowHint(false); }}
                style={{
                  width: i === current ? '2.2vw' : '0.55vw', height: '0.55vh',
                  borderRadius: '1vw', border: 'none', cursor: 'pointer',
                  background: i === current ? ACCENT : 'rgba(255,255,255,0.15)',
                  transition: 'all 0.3s ease',
                }}
              />
            ))}
          </div>
          <span style={{ fontFamily: 'DM Sans', fontSize: '0.65vw', color: 'rgba(251,247,243,0.2)', letterSpacing: '0.2em' }}>
            {SLIDE_NUMS[current]} / 08
          </span>
        </div>

        {/* Next */}
        <button
          onClick={() => go(1)}
          disabled={current === TOTAL - 1}
          style={{ display: 'flex', alignItems: 'center', gap: '0.5vw', background: current === TOTAL - 1 ? 'none' : `rgba(201,120,80,0.15)`, border: `1px solid ${current === TOTAL - 1 ? 'rgba(255,255,255,0.08)' : 'rgba(201,120,80,0.4)'}`, borderRadius: '2vw', padding: '0.6vh 1.2vw', cursor: current === TOTAL - 1 ? 'not-allowed' : 'pointer', opacity: current === TOTAL - 1 ? 0.3 : 1, color: current === TOTAL - 1 ? 'rgba(251,247,243,0.6)' : ACCENT, fontFamily: 'DM Sans', fontSize: '0.75vw', fontWeight: 700, transition: 'all 0.2s' }}
        >
          Next <ChevronRight size={14} />
        </button>
      </div>

      {/* Hint overlay */}
      <AnimatePresence>
        {showHint && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }} transition={{ duration: 0.4 }}
            style={{ position: 'absolute', bottom: '10vh', left: '50%', transform: 'translateX(-50%)', padding: '0.7vh 1.5vw', background: 'rgba(8,24,46,0.9)', border: '1px solid rgba(201,120,80,0.2)', borderRadius: '2vw', zIndex: 60 }}>
            <p style={{ fontFamily: 'DM Sans', fontSize: '0.7vw', color: 'rgba(251,247,243,0.4)', letterSpacing: '0.2em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
              Use  →  Arrow Keys  ·  Click  ·  Swipe  to navigate
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
