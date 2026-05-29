import React, { useEffect, useRef, useState } from 'react';
import { Volume2, VolumeX } from 'lucide-react';

const SONG_TITLE = 'Calm Down';

export default function MusicPlayer({ playing }: { playing: boolean }) {
  const audioRef              = useRef<HTMLAudioElement>(null);
  const [muted, setMuted]     = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    a.volume = 0.45;
    a.loop   = true;
  }, []);

  useEffect(() => {
    const a = audioRef.current;
    if (!a || !playing) return;
    a.play().catch(() => {});
    setTimeout(() => setVisible(true), 400);
  }, [playing]);

  const toggleMute = () => {
    const a = audioRef.current;
    if (!a) return;
    a.muted = !muted;
    setMuted(m => !m);
  };

  if (!playing) return <audio ref={audioRef} src="/music/calm-down.mp3" preload="auto" />;

  return (
    <>
      <audio ref={audioRef} src="/music/calm-down.mp3" preload="auto" />
      <div
        className="fixed right-6 z-50 pointer-events-auto flex flex-col items-center gap-0"
        style={{
          bottom: 96,
          opacity:    visible ? 1 : 0,
          transform:  visible ? 'translateY(0)' : 'translateY(12px)',
          transition: 'opacity 0.6s ease, transform 0.6s ease',
        }}
      >
        <div
          className="flex flex-col items-center rounded-2xl border border-white/10 shadow-2xl overflow-hidden"
          style={{ background: 'rgba(4,12,30,0.88)', backdropFilter: 'blur(18px)', width: 40 }}
        >
          {/* Mini equaliser bars */}
          <div className="flex items-end justify-center gap-0.5 pt-3 pb-2" style={{ height: 32 }}>
            {[0.5, 0.9, 0.6, 1.0, 0.7].map((h, i) => (
              <div
                key={i}
                className="rounded-full"
                style={{
                  width: 3,
                  height: muted ? 4 : `${h * 14 + 4}px`,
                  background: muted ? 'rgba(255,255,255,0.15)' : '#C97850',
                  animation: muted ? 'none' : `eqBar ${0.5 + i * 0.12}s ease-in-out infinite alternate`,
                  transition: 'height 0.3s ease',
                }}
              />
            ))}
          </div>

          {/* Divider */}
          <div className="w-full h-px bg-white/8" />

          {/* Song title — rotated vertically */}
          <div className="py-4 flex items-center justify-center" style={{ height: 90 }}>
            <span
              className="text-[9px] font-bold uppercase tracking-[0.22em] select-none"
              style={{
                writingMode: 'vertical-rl',
                transform: 'rotate(180deg)',
                color: muted ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.65)',
                transition: 'color 0.3s ease',
                letterSpacing: '0.18em',
              }}
            >
              {SONG_TITLE}
            </span>
          </div>

          {/* Divider */}
          <div className="w-full h-px bg-white/8" />

          {/* Mute button */}
          <button
            onClick={toggleMute}
            title={muted ? 'Unmute music' : 'Mute music'}
            className="w-full flex items-center justify-center py-3 transition-all duration-200 hover:bg-white/8 active:scale-90"
          >
            {muted
              ? <VolumeX className="w-4 h-4 text-white/30" />
              : <Volume2 className="w-4 h-4" style={{ color: '#C97850' }} />
            }
          </button>
        </div>
      </div>

      <style>{`
        @keyframes eqBar {
          from { transform: scaleY(0.4); }
          to   { transform: scaleY(1.0); }
        }
      `}</style>
    </>
  );
}
