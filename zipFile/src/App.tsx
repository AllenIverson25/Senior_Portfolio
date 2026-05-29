/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, Suspense } from 'react';
import Experience from './components/Experience';
import Overlay from './components/Overlay';
import { Ship, Loader2, Anchor } from 'lucide-react';

export default function App() {
  const [data, setData] = useState<any>(null);
  const [activeIsland, setActiveIsland] = useState<any>(null);
  const [started, setStarted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000); // 8s timeout

      try {
        console.log('Voyage initiation: Fetching data.json...');
        const response = await fetch('/data.json', { signal: controller.signal });
        clearTimeout(timeoutId);
        if (!response.ok) {
          throw new Error(`Failed to load data. Count your blessings and check the console. Status: ${response.status}`);
        }
        const json = await response.json();
        console.log('Data secured:', json);
        
        // Basic validation
        if (!json.islands || !Array.isArray(json.islands)) {
          throw new Error('Data format invalid: islands array missing.');
        }
        
        setData(json);
      } catch (err) {
        console.error('CRITICAL VOYAGE ERROR:', err);
        setError(err instanceof Error ? err.message : 'Unknown seafaring error');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="fixed inset-0 bg-[#FBF7F3] flex flex-col items-center justify-center gap-4 z-[9999]">
        <Ship className="w-12 h-12 text-[#C97850] animate-bounce" />
        <p className="font-serif text-[#C97850] uppercase tracking-[0.2em] text-xs font-bold">Anchors Aweigh...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="fixed inset-0 bg-[#FFF5ED] flex flex-col items-center justify-center p-8 text-center">
        <div className="p-6 bg-white rounded-3xl shadow-2xl border border-red-100 max-w-md">
          <h2 className="text-[#C97850] font-serif mb-4 text-3xl">Stormy Seas</h2>
          <p className="text-gray-600 mb-6 font-sans">The maps (data.json) couldn't be loaded. The current coordinates are lost.</p>
          <code className="block p-3 bg-red-50 text-red-600 text-xs rounded mb-6 text-left overflow-auto max-h-32">
            {error || 'Data missing'}
          </code>
          <button 
            onClick={() => window.location.reload()}
            className="px-8 py-3 bg-[#C97850] text-white rounded-full font-bold hover:bg-[#A56241] transition-colors"
          >
            Retry Voyage
          </button>
        </div>
      </div>
    );
  }

  if (!started) {
    return (
      <div className="fixed inset-0 bg-cream flex flex-col items-center justify-center p-8 text-center">
        <div className="absolute inset-0 opacity-10 pointer-events-none overflow-hidden flex items-center justify-center">
          <Ship size={800} strokeWidth={0.2} className="text-terracotta" />
        </div>
        
        <div className="relative z-10 max-w-xl mx-auto flex flex-col items-center">
          <div className="mb-6 p-4 rounded-full bg-terracotta/5 text-terracotta">
            <Anchor size={48} />
          </div>
          
          <span className="mb-2 text-xs uppercase tracking-[0.4em] font-bold text-terracotta/40">Marlboro HS Web Design Capstone</span>
          <h1 className="text-6xl md:text-8xl text-terracotta mb-6 leading-tight">Ocean Exploration</h1>
          
          <div className="w-24 h-px bg-terracotta/30 mb-8" />
          
          <p className="font-sans text-lg text-terracotta/70 mb-12 leading-relaxed max-w-md">
            Welcome, I'm Joseph Friedman. Embark on a 3D voyage through my creative work from sophomore to senior year. 
          </p>
          
          <button 
            onClick={() => setStarted(true)}
            className="group relative px-12 py-4 bg-terracotta text-cream rounded-full text-xl font-serif overflow-hidden transition-all duration-500 shadow-2xl hover:bg-soft-orange hover:text-terracotta flex items-center gap-3 active:scale-95"
          >
            <span className="relative z-10">Set Sail</span>
            <Ship className="w-6 h-6 transition-transform duration-500 group-hover:translate-x-2 group-hover:-translate-y-1" />
            <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>
          
          <p className="mt-12 text-[10px] uppercase tracking-widest text-terracotta/40 font-bold font-sans">
            Use WASD or Arrows to Navigate the Boat
          </p>
        </div>
      </div>
    );
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

      {/* Floating HUD */}
      {!activeIsland && (
        <div className="fixed top-8 left-1/2 -translate-x-1/2 px-8 py-3 bg-white/80 backdrop-blur-md rounded-full shadow-lg border border-terracotta/10 flex items-center gap-4 z-40 animate-in slide-in-from-top duration-700">
           <div className="flex items-center gap-2">
             <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
             <span className="text-xs font-bold uppercase tracking-widest text-terracotta/60">Live Exploration</span>
           </div>
           <div className="w-px h-4 bg-terracotta/10" />
           <p className="text-sm font-serif m-0 italic font-bold">Joseph Friedman Portfolio</p>
        </div>
      )}
    </div>
  );
}

