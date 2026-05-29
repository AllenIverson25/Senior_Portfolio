import React from 'react';
import { X, ExternalLink, Award, User, BookOpen, Compass, Cpu, ArrowUpRight } from 'lucide-react';

const TITLE_TO_SLUG: Record<string, string> = {
  'Aruba':                    'aruba',
  'My Favorite Album Covers': 'album-covers',
  'Sea Bright':               'sea-bright',
  'Virtual Art Gallery':      'virtual-art-gallery',
  'Symphony & Harmony':       'symphony',
  'Top 8 Movies':             'top-8-movies',
};

interface IslandData {
  id: string;
  name: string;
  description: string;
  position: [number, number, number];
  projects?: any[];
  featured?: any[];
  content?: string;
  prompts?: any[];
}

const ISLAND_META: Record<string, { color: string; light: string; icon: React.ReactNode }> = {
  archives:   { color: '#9B7B55', light: '#F5ECD7', icon: <BookOpen className="w-5 h-5" /> },
  spotlight:  { color: '#A08020', light: '#FFF8DC', icon: <Award className="w-5 h-5" /> },
  story:      { color: '#8C3E2E', light: '#FDECEA', icon: <User className="w-5 h-5" /> },
  horizon:    { color: '#2E6E88', light: '#E8F4F8', icon: <Compass className="w-5 h-5" /> },
  'ai-logic': { color: '#5850A0', light: '#F0EEFF', icon: <Cpu className="w-5 h-5" /> },
};

const YEAR_COLORS: Record<string, { bg: string; text: string }> = {
  Sophomore: { bg: '#EBF5FB', text: '#2E86C1' },
  Junior:    { bg: '#E9F7EF', text: '#1E8449' },
  Senior:    { bg: '#FEF9E7', text: '#A04000' },
};

export default function Overlay({ island, onClose }: { island: IslandData | null; onClose: () => void }) {
  if (!island) return null;

  const meta = ISLAND_META[island.id] || { color: '#C97850', light: '#FFF5ED', icon: <BookOpen className="w-5 h-5" /> };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 pointer-events-none"
      style={{ background: 'rgba(10,25,40,0.6)', backdropFilter: 'blur(8px)' }}>

      <div
        className="pointer-events-auto w-full max-w-2xl max-h-[88vh] flex flex-col rounded-2xl overflow-hidden shadow-[0_32px_80px_rgba(0,0,0,0.6)]"
        style={{
          background: 'rgba(15,30,45,0.95)',
          border: `1px solid ${meta.color}44`,
          animation: 'overlayIn 0.35s cubic-bezier(0.34,1.56,0.64,1) both',
        }}
      >
        {/* Header */}
        <div className="relative flex-shrink-0 px-7 py-5 flex items-center justify-between"
          style={{ background: `linear-gradient(135deg, ${meta.color}cc, ${meta.color}66)`, borderBottom: `1px solid ${meta.color}44` }}>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-white/15 text-white">
              {meta.icon}
            </div>
            <div>
              <h2 className="text-xl font-serif text-white m-0 leading-tight">{island.name}</h2>
              <p className="text-white/65 text-xs font-sans italic mt-0.5">{island.description}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full flex items-center justify-center bg-white/10 hover:bg-white/25 transition-colors text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 px-7 py-6 font-sans" style={{ scrollbarWidth: 'thin', scrollbarColor: `${meta.color}44 transparent` }}>

          {island.id === 'archives' && (
            <div>
              {(['Sophomore','Junior','Senior'] as const).map(year => {
                const items = island.projects?.filter(p => p.year === year) || [];
                if (!items.length) return null;
                const yc = YEAR_COLORS[year];
                return (
                  <div key={year} className="mb-6">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full"
                        style={{ background: yc.bg, color: yc.text }}>
                        {year}
                      </span>
                      <div className="flex-1 h-px" style={{ background: `${meta.color}30` }} />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {items.map((p: any, i: number) => (
                        <a key={i} href={p.url} target="_blank" rel="noopener noreferrer"
                          className="group flex items-center justify-between p-3 rounded-xl no-underline transition-all duration-200"
                          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}
                          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = `${meta.color}22`; (e.currentTarget as HTMLElement).style.borderColor = `${meta.color}55`; }}
                          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.04)'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.06)'; }}
                        >
                          <span className="text-sm text-white/80 group-hover:text-white transition-colors font-medium">{p.name}</span>
                          <ExternalLink className="w-3.5 h-3.5 opacity-0 group-hover:opacity-80 transition-opacity" style={{ color: meta.color }} />
                        </a>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {island.id === 'spotlight' && (
            <div className="space-y-5">
              {island.featured?.map((f: any, i: number) => {
                const yc   = YEAR_COLORS[f.year as keyof typeof YEAR_COLORS] || YEAR_COLORS.Senior;
                const slug = TITLE_TO_SLUG[f.title];
                return (
                  <div key={i} className="rounded-2xl overflow-hidden flex flex-col md:flex-row gap-0"
                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
                    {/* Screenshot thumbnail */}
                    <div className="w-full md:w-2/5 aspect-video md:aspect-auto overflow-hidden flex-shrink-0 relative group/img" style={{ minHeight: 130 }}>
                      <img src={f.image} alt={f.title}
                        className="w-full h-full object-cover transition-all duration-700 group-hover/img:scale-105"
                        style={{ filter: 'grayscale(40%)' }}
                        onMouseEnter={e => (e.currentTarget.style.filter = 'grayscale(0%)')}
                        onMouseLeave={e => (e.currentTarget.style.filter = 'grayscale(40%)')}
                        referrerPolicy="no-referrer" />
                    </div>

                    {/* Content */}
                    <div className="p-5 flex flex-col justify-between flex-1">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full"
                            style={{ background: yc.bg, color: yc.text }}>{f.year}</span>
                          <span className="text-[9px] font-bold uppercase tracking-widest text-white/30">Spotlight</span>
                        </div>
                        <h3 className="text-lg text-white font-serif m-0 mb-2">{f.title}</h3>
                        <div className="mb-3">
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md"
                            style={{ background: `${meta.color}22`, color: meta.color }}>
                            {f.skills}
                          </span>
                        </div>
                        <p className="text-sm text-white/60 leading-relaxed italic m-0">"{f.reflection}"</p>
                      </div>

                      {/* View Full Page button */}
                      {slug && (
                        <div className="mt-4 pt-3" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                          <button
                            onClick={() => window.open(`/project/${slug}`, '_blank')}
                            className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-full transition-all duration-200 hover:scale-105 active:scale-95"
                            style={{
                              background: `linear-gradient(135deg, ${meta.color}cc, ${meta.color}88)`,
                              color: 'white',
                              boxShadow: `0 4px 16px ${meta.color}40`,
                            }}
                          >
                            <ArrowUpRight className="w-3.5 h-3.5" />
                            View Full Page
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {island.id === 'story' && (
            <div>
              <p className="text-base leading-relaxed text-white/75 first-letter:text-5xl first-letter:font-serif first-letter:float-left first-letter:mr-3 first-letter:leading-none"
                style={{ firstLetterColor: meta.color } as any}>
                {island.content}
              </p>
              <div className="mt-6 grid grid-cols-3 gap-3 text-center">
                {[['Web Design', 'Pathway'], ['Marlboro', 'High School'], ['Class of', '2026']].map(([top, bot], i) => (
                  <div key={i} className="rounded-xl p-3" style={{ background: `${meta.color}18`, border: `1px solid ${meta.color}30` }}>
                    <div className="text-sm font-bold text-white/80">{top}</div>
                    <div className="text-xs text-white/50">{bot}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {island.id === 'horizon' && (
            <div className="flex flex-col items-center gap-6">
              <div className="relative p-8 rounded-2xl text-center" style={{ background: `${meta.color}18`, border: `1px solid ${meta.color}30` }}>
                <div className="absolute top-4 left-5 text-5xl font-serif opacity-30" style={{ color: meta.color }}>"</div>
                <p className="text-base leading-relaxed text-white/80 italic relative z-10 px-4">{island.content}</p>
                <div className="absolute bottom-4 right-5 text-5xl font-serif opacity-30 rotate-180" style={{ color: meta.color }}>"</div>
              </div>
              <div className="flex items-center gap-3 text-sm text-white/40">
                <div className="flex-1 h-px bg-white/10" />
                <span className="uppercase tracking-widest text-[10px]">Joseph Friedman · Class of 2026</span>
                <div className="flex-1 h-px bg-white/10" />
              </div>
            </div>
          )}

          {island.id === 'ai-logic' && (
            <div className="space-y-4">
              {island.prompts?.map((item: any, i: number) => (
                <div key={i} className="rounded-xl overflow-hidden" style={{ border: `1px solid ${meta.color}30`, background: 'rgba(255,255,255,0.03)' }}>
                  <div className="px-5 py-3" style={{ background: `${meta.color}22`, borderBottom: `1px solid ${meta.color}20` }}>
                    <span className="text-[9px] font-bold uppercase tracking-widest" style={{ color: meta.color }}>Prompt</span>
                    <p className="text-sm font-semibold text-white/85 m-0 mt-1 italic">"{item.prompt}"</p>
                  </div>
                  <div className="px-5 py-3 border-b border-white/5">
                    <span className="text-[9px] font-bold uppercase tracking-widest text-white/30">AI Output</span>
                    <p className="text-sm text-white/65 m-0 mt-1">{item.output}</p>
                  </div>
                  <div className="px-5 py-3">
                    <span className="text-[9px] font-bold uppercase tracking-widest text-white/30">Reflection</span>
                    <p className="text-sm text-white/55 m-0 mt-1 leading-relaxed">{item.reflection}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 px-7 py-4 flex justify-between items-center"
          style={{ background: 'rgba(0,0,0,0.3)', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <span className="text-[10px] text-white/30 uppercase tracking-widest">{island.id.toUpperCase()} · ISLAND LOG</span>
          <button onClick={onClose}
            className="px-6 py-2 rounded-full text-sm font-semibold transition-all duration-200 hover:brightness-110 active:scale-95"
            style={{ background: meta.color, color: 'white', boxShadow: `0 4px 16px ${meta.color}55` }}>
            Return to Voyage
          </button>
        </div>
      </div>
    </div>
  );
}
