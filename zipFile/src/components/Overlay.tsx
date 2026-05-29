import React from 'react';
import { X, ExternalLink, Award, User, BookOpen, Compass, Cpu } from 'lucide-react';

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

interface OverlayProps {
  island: IslandData | null;
  onClose: () => void;
}

export default function Overlay({ island, onClose }: OverlayProps) {
  if (!island) return null;

  const getIcon = (id: string) => {
    switch (id) {
      case 'archives': return <BookOpen className="w-6 h-6" />;
      case 'spotlight': return <Award className="w-6 h-6" />;
      case 'story': return <User className="w-6 h-6" />;
      case 'horizon': return <Compass className="w-6 h-6" />;
      case 'ai-logic': return <Cpu className="w-6 h-6" />;
      default: return <BookOpen className="w-6 h-6" />;
    }
  };

  return (
    <div className="overlay-container pointer-events-none">
      <div className="overlay-content animate-in fade-in zoom-in duration-300 pointer-events-auto shadow-[0_20px_50px_rgba(201,120,80,0.3)]">
        <div className="flex justify-between items-start mb-6 border-b border-terracotta/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-terracotta/10 rounded-lg text-terracotta">
              {getIcon(island.id)}
            </div>
            <div>
              <h2 className="text-3xl m-0 text-terracotta">{island.name}</h2>
              <p className="text-terracotta/60 text-sm font-sans italic">{island.description}</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-terracotta/5 rounded-full transition-colors duration-200 text-terracotta"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="font-sans">
          {island.id === 'archives' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {island.projects?.map((p, i) => (
                <a 
                  key={i} 
                  href={p.url} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="group p-4 bg-soft-orange/30 rounded-xl hover:bg-soft-orange/60 transition-all duration-300 border border-transparent hover:border-terracotta/20 no-underline text-inherit"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="text-[10px] uppercase tracking-widest font-bold opacity-40 group-hover:opacity-60">{p.year}</span>
                      <h4 className="m-0 text-terracotta text-lg">{p.name}</h4>
                    </div>
                    <ExternalLink className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </a>
              ))}
            </div>
          )}

          {island.id === 'spotlight' && (
            <div className="flex flex-col gap-8">
              {island.featured?.map((f, i) => (
                <div key={i} className="flex flex-col md:flex-row gap-6 p-6 bg-soft-orange/30 rounded-2xl border border-terracotta/5">
                  <div className="w-full md:w-1/2 aspect-video overflow-hidden rounded-xl shadow-md">
                    <img 
                      src={f.image} 
                      alt={f.title} 
                      className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700" 
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div className="w-full md:w-1/2">
                    <span className="text-[10px] uppercase tracking-widest font-bold opacity-60">{f.year} Spotlight</span>
                    <h3 className="text-2xl mt-1 mb-2">{f.title}</h3>
                    <div className="mb-4">
                      <span className="text-xs font-bold text-terracotta/70 bg-white/50 px-2 py-1 rounded">Skills: {f.skills}</span>
                    </div>
                    <p className="text-sm opacity-80 leading-relaxed italic">"{f.reflection}"</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {island.id === 'story' && (
            <div className="prose prose-terracotta max-w-none">
              <p className="text-lg leading-relaxed text-terracotta/80 first-letter:text-5xl first-letter:font-serif first-letter:mr-3 first-letter:float-left">
                {island.content}
              </p>
            </div>
          )}

          {island.id === 'horizon' && (
            <div className="prose prose-terracotta max-w-none">
              <p className="text-lg leading-relaxed text-terracotta/80 text-center italic">
                "{island.content}"
              </p>
            </div>
          )}

          {island.id === 'ai-logic' && (
            <div className="space-y-6">
              {island.prompts?.map((item, i) => (
                <div key={i} className="p-6 bg-soft-orange/30 rounded-2xl border-l-4 border-terracotta">
                  <div className="mb-4">
                    <span className="text-[10px] uppercase font-bold opacity-40">User Prompt</span>
                    <p className="text-sm font-bold m-0 mt-1 italic">"{item.prompt}"</p>
                  </div>
                  <div className="mb-4 pl-4 border-l border-terracotta/10">
                    <span className="text-[10px] uppercase font-bold opacity-40">Output</span>
                    <p className="text-sm m-0 mt-1">{item.output}</p>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold opacity-40">Reflection</span>
                    <p className="text-sm m-0 mt-1 opacity-70 leading-relaxed">{item.reflection}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div className="mt-8 flex justify-center">
          <button onClick={onClose} className="btn-primary">
            Return to Exploration
          </button>
        </div>
      </div>
    </div>
  );
}
