
import React from 'react';
import { AiMode, AppSettings } from '../types';

interface ActionMenuProps {
  onClose: () => void;
  onSelectMode: (mode: string) => void;
  currentMode: string;
  settings: AppSettings;
  updateSettings: (key: keyof AppSettings, val: any) => void;
}

const ActionMenu: React.FC<ActionMenuProps> = ({ onClose, onSelectMode, currentMode, settings, updateSettings }) => {
  const neuralModalities = [
    { id: 'thinking', label: 'Sovereign Inference', sub: 'Deep 32k thinking budget', icon: '🧠', color: 'bg-amber-600/20 text-amber-500' },
    { id: 'search', label: 'Lumen Search', sub: 'Real-time web intelligence', icon: '🌐', color: 'bg-blue-600/20 text-blue-400' },
    { id: 'maps', label: 'Lumen Geographia', sub: 'Maps & Spatial grounding', icon: '📍', color: 'bg-indigo-600/20 text-indigo-400' },
    { id: 'image', label: 'Atelier Visionis', sub: 'Nano Banana Pro generation', icon: '✨', color: 'bg-cyan-600/20 text-cyan-400' },
    { id: 'video', label: 'Atelier Motus', sub: 'Veo 3.1 video synthesis', icon: '🎬', color: 'bg-rose-600/20 text-rose-400' },
    { id: 'lite', label: 'Fast Relay', sub: 'Low-latency flash lite', icon: '⚡', color: 'bg-neutral-600/20 text-white' },
    { id: 'default', label: 'Baseline Frequency', sub: 'Standard archival chat', icon: '🏛️', color: 'bg-white/5 text-neutral-400' },
  ];

  const sovereignNodes = [
    { id: 'drive', label: 'Kinetic Drive', sub: 'High-visibility pilot mode', icon: '🚗', color: 'bg-emerald-600/20 text-emerald-400' },
    { id: 'health', label: 'Health Command', sub: 'Vitals & Metabolic registry', icon: '💉', color: 'bg-red-600/20 text-red-500' },
    { id: 'spiritual', label: 'Sacred Rhythms', sub: 'Spiritual archive & reflections', icon: '🕯️', color: 'bg-purple-600/20 text-purple-400' },
    { id: 'tasks', label: 'Archive Ledger', sub: 'Tasks, Notes & Operations', icon: '📋', color: 'bg-sky-600/20 text-sky-400' },
  ];

  const renderSection = (title: string, items: any[]) => (
    <section className="space-y-3">
      <p className="text-[10px] font-black uppercase text-neutral-800 tracking-[0.5em] px-4">{title}</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {items.map((item, idx) => (
          <button
            key={idx}
            onClick={() => onSelectMode(item.id)}
            className={`flex items-center gap-5 p-5 rounded-2xl transition-all group border border-transparent ${currentMode === item.id ? 'bg-white/10 border-white/20' : 'bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/5'}`}
          >
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl shrink-0 ${item.color}`}>{item.icon}</div>
            <div className="text-left">
              <p className="font-sans text-[13px] font-black text-white tracking-tight leading-none mb-1.5">{item.label}</p>
              <p className="font-sans text-[9px] text-neutral-600 font-black uppercase tracking-widest">{item.sub}</p>
            </div>
          </button>
        ))}
      </div>
    </section>
  );

  return (
    <div 
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      className="fixed inset-0 z-[300] bg-black/95 flex flex-col items-center justify-end animate-in slide-in-from-bottom duration-500 backdrop-blur-3xl cursor-pointer"
    >
      <div className="w-full max-w-4xl bg-[#050505] border-t border-white/[0.05] rounded-t-[4rem] px-10 pt-10 pb-[calc(2.5rem+env(safe-area-inset-bottom))] space-y-12 shadow-[0_-20px_100px_rgba(0,0,0,1)] overflow-y-auto max-h-[90vh] custom-scrollbar cursor-default">
        <header className="flex flex-col items-center gap-4 -mt-6">
          <button onClick={onClose} className="w-16 h-1.5 bg-white/10 rounded-full hover:bg-white/20 transition-colors mb-4"></button>
          <h2 className="text-xl font-black text-white uppercase tracking-[0.4em]">Operational Action Hub</h2>
        </header>
        
        {renderSection("Sovereign Nodes", sovereignNodes)}
        {renderSection("Neural Modalities", neuralModalities)}

        <button 
          onClick={onClose} 
          className="w-full py-6 rounded-2xl bg-white/5 text-neutral-400 font-black uppercase tracking-[0.4em] text-[11px] hover:text-white transition-all mt-10"
        >
          Exit Protocol
        </button>
      </div>
    </div>
  );
};

export default ActionMenu;
