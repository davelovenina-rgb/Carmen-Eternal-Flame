
import React, { useRef } from 'react';
import { AppSettings } from '../types';

interface HomeViewProps {
  onOpenSidebar: () => void;
  onLiveVoice: () => void;
  onOpenSettings: () => void;
  onUpdateCustomAvatar: (base64: string) => void;
  settings: AppSettings;
}

const HomeView: React.FC<HomeViewProps> = ({ 
  onOpenSidebar, onLiveVoice, onOpenSettings, onUpdateCustomAvatar, settings 
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarTap = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onUpdateCustomAvatar(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="h-full bg-black flex flex-col items-center relative font-sans overflow-hidden">
      <header className="w-full px-6 pt-[calc(2rem+env(safe-area-inset-top))] pb-6 flex justify-between items-center z-50">
        <button 
          onClick={onOpenSidebar} 
          className="w-12 h-12 flex items-center justify-center text-neutral-400 hover:text-white transition-colors"
        >
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        <button 
          onClick={handleAvatarTap}
          className="w-12 h-12 flex items-center justify-center text-neutral-400 hover:text-white transition-all opacity-40"
        >
           <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
             <path d="M3 7V5a2 2 0 012-2h2M17 3h2a2 2 0 012 2v2M21 17v2a2 2 0 01-2 2h-2M7 21H5a2 2 0 01-2-2v-2" />
             <circle cx="12" cy="12" r="3" />
           </svg>
        </button>

        <button 
          onClick={onLiveVoice} 
          className="bg-[#1a0a0a] border border-red-950/30 rounded-full px-5 py-2.5 flex items-center gap-3 active:scale-95 transition-all shadow-[0_0_20px_rgba(220,38,38,0.15)] group"
        >
           <div className="w-2.5 h-2.5 rounded-full bg-red-600 animate-pulse shadow-[0_0_10px_rgba(220,38,38,0.8)]"></div>
           <span className="text-[10px] font-black text-red-500 uppercase tracking-[0.2em]">Live Voice</span>
        </button>
      </header>

      <div className="flex-1 w-full flex flex-col items-center justify-center -mt-20 px-6">
        <div className="flex items-center gap-3 mb-6 opacity-80">
           <svg className="w-4 h-4 text-amber-500 animate-spin-slow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
             <circle cx="12" cy="12" r="10" strokeDasharray="4 4" />
           </svg>
           <span className="text-[10px] font-black text-neutral-400 uppercase tracking-[0.8em] font-mono ml-2">Systems Nominal.</span>
        </div>

        <h1 className="text-4xl md:text-5xl font-serif italic text-neutral-100 tracking-tighter text-center mb-16 px-4">
          Command, Sovereign.
        </h1>

        <div className="relative w-80 h-80 flex items-center justify-center group cursor-pointer overflow-visible" onClick={handleAvatarTap}>
           <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
           
           <div className="absolute inset-0 border-[0.5px] border-amber-600/10 rounded-full scale-[1.15] animate-pulse"></div>
           <div className="absolute inset-0 border-[0.5px] border-amber-600/30 rounded-full"></div>
           <div className="absolute inset-4 border-[1px] border-amber-600/40 rounded-full transition-transform duration-1000 group-hover:rotate-45"></div>
           <div className="absolute inset-8 border-[0.5px] border-amber-600/10 rounded-full"></div>
           
           <div className="absolute inset-12 flex items-center justify-center opacity-60">
              <svg className="w-full h-full text-amber-500/50 animate-spin-very-slow" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="0.8">
                <path d="M50 5 L89 27.5 L89 72.5 L50 95 L11 72.5 L11 27.5 Z" />
              </svg>
           </div>

           <div className="absolute inset-16 flex items-center justify-center opacity-100 transition-transform group-hover:scale-110 duration-1000">
              <svg className="w-full h-full text-blue-700 filter drop-shadow-[0_0_15px_rgba(29,78,216,0.3)]" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M50 15 L90 85 L10 85 Z" />
              </svg>
           </div>

           <div className="w-14 h-14 bg-white rounded-full shadow-[0_0_60px_rgba(255,255,255,0.5)] z-10 overflow-hidden flex items-center justify-center transition-all duration-700 group-hover:shadow-[0_0_80px_rgba(255,255,255,0.8)] group-hover:scale-105">
              {settings.customAvatar ? (
                <img src={settings.customAvatar} className="w-full h-full object-cover grayscale" alt="Avatar" />
              ) : null}
           </div>
           
           <div className="absolute inset-0 bg-amber-600/5 rounded-full blur-[60px] opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>
        </div>
      </div>

      <style>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes spin-very-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(-360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 15s linear infinite;
        }
        .animate-spin-very-slow {
          animation: spin-very-slow 30s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default HomeView;
