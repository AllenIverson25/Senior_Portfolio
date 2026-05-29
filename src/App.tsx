import React, { useState, useEffect, useRef } from 'react';
import { Routes, Route } from 'react-router-dom';
import Experience from './components/Experience';
import Overlay from './components/Overlay';
import ProjectPage from './components/ProjectPage';
import MusicPlayer from './components/MusicPlayer';
import Presentation from './components/Presentation';
import { Ship, Anchor } from 'lucide-react';

/* ── deterministic pseudo-random (no re-render jitter) ── */
function seededRand(seed: number) {
  const x = Math.sin(seed + 1) * 10000;
  return x - Math.floor(x);
}

const STARS = Array.from({ length: 80 }, (_, i) => ({
  id: i,
  left:     seededRand(i * 3)     * 100,
  top:      seededRand(i * 3 + 1) * 75,
  size:     1 + seededRand(i * 3 + 2) * 2.2,
  duration: 2 + seededRand(i * 5) * 4,
  delay:    seededRand(i * 7) * 5,
}));

const BUBBLES = Array.from({ length: 28 }, (_, i) => ({
  id: i,
  left:     seededRand(i * 11)     * 100,
  delay:    seededRand(i * 13)     * 7,
  duration: 5 + seededRand(i * 17) * 6,
  size:     1.5 + seededRand(i * 19) * 3,
}));

function LandingScreen({ onStart }: { onStart: () => void }) {
  const [phase, setPhase]           = useState(0);
  const [scanActive, setScanActive] = useState(false);

  useEffect(() => {
    const timers = [
      setTimeout(() => setScanActive(true),  80),
      setTimeout(() => setPhase(1),          250),
      setTimeout(() => setPhase(2),          550),
      setTimeout(() => setPhase(3),          850),
      setTimeout(() => setPhase(4),          1100),
      setTimeout(() => setPhase(5),          1350),
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <div className="fixed inset-0 overflow-hidden"
      style={{ background: 'radial-gradient(ellipse at 50% 60%, #0D2645 0%, #060F20 55%, #020810 100%)' }}>

      {/* ── Nautical grid ── */}
      <div className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)
          `,
          backgroundSize: '80px 80px',
          maskImage: 'radial-gradient(ellipse at center, black 30%, transparent 75%)',
        }} />

      {/* ── Twinkling stars ── */}
      {STARS.map(s => (
        <div key={s.id} className="absolute rounded-full bg-white pointer-events-none"
          style={{
            left: `${s.left}%`,
            top:  `${s.top}%`,
            width:  s.size,
            height: s.size,
            animation: `twinkle ${s.duration}s ${s.delay}s ease-in-out infinite`,
          }} />
      ))}

      {/* Sonar rings are rendered inside the anchor orb — removed from here */}

      {/* ── Deep radial glow ── */}
      <div className="absolute pointer-events-none"
        style={{
          left: '50%', top: '48%',
          width: 600, height: 600,
          transform: 'translate(-50%,-50%)',
          background: 'radial-gradient(ellipse, rgba(201,120,80,0.08) 0%, transparent 65%)',
        }} />

      {/* ── Scan line ── */}
      {scanActive && (
        <div className="absolute top-0 bottom-0 w-[2px] pointer-events-none"
          style={{
            background: 'linear-gradient(to bottom, transparent, rgba(201,120,80,0.6) 40%, rgba(201,120,80,0.9) 50%, rgba(201,120,80,0.6) 60%, transparent)',
            animation: 'scan-line 2.2s ease-in-out forwards',
          }} />
      )}

      {/* ── Floating bubbles ── */}
      {BUBBLES.map(b => (
        <div key={b.id} className="absolute rounded-full bg-white pointer-events-none"
          style={{
            left: `${b.left}%`,
            bottom: '-10px',
            width: b.size,
            height: b.size,
            opacity: 0,
            animation: `float-up ${b.duration}s ${b.delay}s ease-in infinite`,
          }} />
      ))}

      {/* ── Bottom wave layers ── */}
      <div className="absolute bottom-0 left-0 right-0 h-48 overflow-hidden pointer-events-none">
        <div className="wave-bg wave-slow" style={{ opacity: 0.06 }} />
        <div className="wave-bg wave-fast" style={{ opacity: 0.04 }} />
        <div className="absolute inset-0"
          style={{ background: 'linear-gradient(to top, rgba(12,30,55,0.7) 0%, transparent 100%)' }} />
      </div>

      {/* ── Horizon glow ── */}
      <div className="absolute bottom-0 left-0 right-0 h-1 pointer-events-none"
        style={{ background: 'linear-gradient(to right, transparent, rgba(201,120,80,0.4) 30%, rgba(201,120,80,0.7) 50%, rgba(201,120,80,0.4) 70%, transparent)' }} />

      {/* ── Main content ── */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}>

        {/* Anchor orb */}
        <div style={{
          opacity: phase >= 1 ? 1 : 0,
          transform: phase >= 1 ? 'scale(1) translateY(0)' : 'scale(0.6) translateY(20px)',
          transition: 'opacity 0.6s ease, transform 0.6s cubic-bezier(0.34,1.56,0.64,1)',
          position: 'relative',
          marginBottom: '1.5rem',
        }}>
          {/* Sonar rings — anchored to the orb */}
          {phase >= 1 && [0, 1, 2].map(i => (
            <div key={i} style={{
              position: 'absolute',
              left: '50%', top: '50%',
              width: 80, height: 80,
              borderRadius: '50%',
              border: '1px solid rgba(201,120,80,0.35)',
              animation: `sonar-ping 3.5s ${i * 1.15}s ease-out infinite`,
              animationFillMode: 'backwards',
              pointerEvents: 'none',
            }} />
          ))}
          {/* Inner orb */}
          <div style={{
            width: 80, height: 80, borderRadius: '50%',
            background: 'radial-gradient(circle at 35% 35%, rgba(201,120,80,0.3), rgba(201,120,80,0.05))',
            border: '1px solid rgba(201,120,80,0.45)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            animation: 'anchor-glow 3s ease-in-out infinite',
            position: 'relative', zIndex: 1,
          }}>
            <Anchor size={34} color="#C97850" strokeWidth={1.5} />
          </div>
        </div>

        {/* Eyebrow label */}
        <div style={{
          opacity: phase >= 2 ? 1 : 0,
          transform: phase >= 2 ? 'translateY(0)' : 'translateY(12px)',
          transition: 'opacity 0.5s ease 0.05s, transform 0.5s ease 0.05s',
          marginBottom: '0.75rem',
          display: 'flex', alignItems: 'center', gap: '0.75rem',
        }}>
          <div style={{ width: 32, height: 1, background: 'rgba(201,120,80,0.5)' }} />
          <span style={{ fontSize: 10, letterSpacing: '0.4em', fontWeight: 700, color: 'rgba(201,120,80,0.7)', textTransform: 'uppercase', fontFamily: 'var(--font-sans)' }}>
            Marlboro HS &nbsp;·&nbsp; Web Design Capstone &nbsp;·&nbsp; 2026
          </span>
          <div style={{ width: 32, height: 1, background: 'rgba(201,120,80,0.5)' }} />
        </div>

        {/* Name */}
        <div style={{
          opacity: phase >= 2 ? 1 : 0,
          transform: phase >= 2 ? 'translateY(0)' : 'translateY(16px)',
          transition: 'opacity 0.5s ease 0.1s, transform 0.5s ease 0.1s',
          marginBottom: '0.4rem',
          fontSize: 15,
          letterSpacing: '0.32em',
          fontWeight: 700,
          color: 'rgba(255,255,255,0.35)',
          textTransform: 'uppercase',
          fontFamily: 'var(--font-sans)',
        }}>
          Joseph Friedman
        </div>

        {/* Main title */}
        <h1 style={{
          margin: '0 0 1.25rem 0',
          lineHeight: 1.0,
          fontFamily: 'var(--font-serif)',
          fontSize: 'clamp(52px, 9vw, 108px)',
          fontWeight: 700,
          letterSpacing: '-0.02em',
          color: 'transparent',
          backgroundImage: 'linear-gradient(135deg, #FBF7F3 20%, #E8C5A0 55%, #C97850 90%)',
          backgroundClip: 'text',
          WebkitBackgroundClip: 'text',
          opacity: phase >= 3 ? 1 : 0,
          animation: phase >= 3 ? 'title-reveal 0.9s cubic-bezier(0.16,1,0.3,1) forwards' : 'none',
        }}>
          Ocean Exploration
        </h1>

        {/* Divider */}
        <div style={{
          width: phase >= 3 ? 200 : 0,
          height: 1,
          background: 'linear-gradient(to right, transparent, rgba(201,120,80,0.8), transparent)',
          transition: 'width 0.8s cubic-bezier(0.16,1,0.3,1) 0.15s',
          marginBottom: '1.5rem',
        }} />

        {/* Description */}
        <p style={{
          fontFamily: 'var(--font-sans)',
          fontSize: 15,
          color: 'rgba(255,255,255,0.5)',
          lineHeight: 1.7,
          maxWidth: 420,
          textAlign: 'center',
          margin: '0 0 2.25rem 0',
          opacity: phase >= 4 ? 1 : 0,
          transform: phase >= 4 ? 'translateY(0)' : 'translateY(14px)',
          transition: 'opacity 0.5s ease, transform 0.5s ease',
        }}>
          Sail through a 3D world and discover creative work built across
          {' '}<span style={{ color: '#C97850', fontWeight: 600 }}>three years</span>{' '}
          at Marlboro High School.
        </p>

        {/* Stats */}
        <div style={{
          display: 'flex',
          gap: '2rem',
          marginBottom: '2.75rem',
          opacity: phase >= 4 ? 1 : 0,
          transform: phase >= 4 ? 'translateY(0)' : 'translateY(14px)',
          transition: 'opacity 0.5s ease 0.1s, transform 0.5s ease 0.1s',
        }}>
          {([
            { value: '3',   label: 'Years' },
            { value: '20+', label: 'Projects' },
            { value: '5',   label: 'Islands' },
            { value: '6',   label: 'Treasures' },
          ] as { value: string; label: string }[]).map(({ value, label }) => (
            <div key={label} style={{ textAlign: 'center' }}>
              <div style={{
                fontFamily: 'var(--font-serif)',
                fontSize: 28,
                fontWeight: 700,
                color: '#C97850',
                lineHeight: 1,
                marginBottom: 4,
              }}>{value}</div>
              <div style={{
                fontFamily: 'var(--font-sans)',
                fontSize: 9,
                fontWeight: 700,
                letterSpacing: '0.3em',
                textTransform: 'uppercase',
                color: 'rgba(255,255,255,0.3)',
              }}>{label}</div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <button
          onClick={onStart}
          style={{
            opacity: phase >= 5 ? 1 : 0,
            transform: phase >= 5 ? 'scale(1) translateY(0)' : 'scale(0.85) translateY(10px)',
            transition: 'opacity 0.5s ease, transform 0.5s cubic-bezier(0.34,1.56,0.64,1)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            padding: '1rem 3rem',
            borderRadius: 100,
            border: 'none',
            cursor: 'pointer',
            fontFamily: 'var(--font-serif)',
            fontSize: 18,
            fontWeight: 700,
            color: '#FBF7F3',
            letterSpacing: '0.04em',
            background: 'linear-gradient(135deg, #D4895E 0%, #C97850 50%, #A56241 100%)',
            animation: phase >= 5 ? 'cta-breathe 2.5s ease-in-out infinite' : 'none',
            position: 'relative',
            overflow: 'hidden',
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'scale(1.06)'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'scale(1)'; }}
        >
          <span>Set Sail</span>
          <Ship size={20} style={{ transition: 'transform 0.3s ease' }}
            onMouseEnter={e => { (e.currentTarget as unknown as HTMLElement).style.transform = 'translate(4px,-3px)'; }}
            onMouseLeave={e => { (e.currentTarget as unknown as HTMLElement).style.transform = 'translate(0,0)'; }}
          />
        </button>

        {/* Controls hint */}
        <div style={{
          marginTop: '2rem',
          opacity: phase >= 5 ? 0.4 : 0,
          transition: 'opacity 0.5s ease 0.2s',
          fontFamily: 'var(--font-sans)',
          fontSize: 9,
          letterSpacing: '0.3em',
          textTransform: 'uppercase',
          color: 'rgba(255,255,255,0.5)',
          fontWeight: 700,
        }}>
          WASD · Arrow Keys &nbsp;|&nbsp; Shift to Boost &nbsp;|&nbsp; E to Explore
        </div>

      </div>
    </div>
  );
}

function OceanApp() {
  const [data, setData]               = useState<any>(null);
  const [activeIsland, setActiveIsland] = useState<any>(null);
  const [started, setStarted]         = useState(false);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const controller = new AbortController();
      const timeoutId  = setTimeout(() => controller.abort(), 8000);
      try {
        const response = await fetch('/data.json', { signal: controller.signal });
        clearTimeout(timeoutId);
        if (!response.ok) throw new Error(`Status: ${response.status}`);
        const json = await response.json();
        if (!json.islands || !Array.isArray(json.islands)) throw new Error('islands array missing');
        setData(json);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center gap-5"
        style={{ background: 'radial-gradient(ellipse at 50% 60%, #0D2645, #060F20)' }}>
        <div className="relative">
          <div className="absolute inset-0 rounded-full bg-[#C97850]/20 animate-ping" />
          <div className="relative w-16 h-16 rounded-full bg-[#C97850]/10 border border-[#C97850]/40 flex items-center justify-center">
            <Ship className="w-8 h-8 text-[#C97850] animate-bounce" />
          </div>
        </div>
        <div className="flex flex-col items-center gap-1">
          <p className="font-serif text-white/80 text-sm tracking-widest uppercase">Charting the Course...</p>
          <div className="flex gap-1 mt-2">
            {[0,1,2].map(i => (
              <div key={i} className="w-1.5 h-1.5 rounded-full bg-[#C97850]/60 animate-bounce"
                style={{ animationDelay: `${i * 0.15}s` }} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center p-8 text-center"
        style={{ background: 'radial-gradient(ellipse at 50% 60%, #0D2645, #060F20)' }}>
        <div className="p-8 bg-white/10 backdrop-blur-md rounded-3xl shadow-2xl border border-white/10 max-w-md">
          <h2 className="text-white font-serif mb-4 text-3xl">Stormy Seas</h2>
          <p className="text-white/70 mb-6 font-sans">The maps couldn't be loaded.</p>
          <code className="block p-3 bg-black/30 text-red-300 text-xs rounded mb-6 text-left overflow-auto max-h-32">
            {error || 'Data missing'}
          </code>
          <button onClick={() => window.location.reload()}
            className="px-8 py-3 bg-[#C97850] text-white rounded-full font-bold hover:bg-[#A56241] transition-colors">
            Retry Voyage
          </button>
        </div>
      </div>
    );
  }

  if (!started) {
    return <LandingScreen onStart={() => setStarted(true)} />;
  }

  return (
    <div className="w-full h-full">
      <Experience
        data={data}
        onIslandActive={(island) => setActiveIsland(island)}
      />
      <Overlay
        island={activeIsland}
        onClose={() => setActiveIsland(null)}
      />
      <MusicPlayer playing={started} />
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/presentation" element={<Presentation />} />
      <Route path="/project/:slug" element={<ProjectPage />} />
      <Route path="*" element={<OceanApp />} />
    </Routes>
  );
}
