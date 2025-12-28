
import React, { useState } from 'react';
import { SpiritualEntry } from '../types';

interface SpiritualViewProps {
  archive: SpiritualEntry[];
  onAddEntry: (entry: Omit<SpiritualEntry, 'id'>) => void;
  onBack: () => void;
  onConsultFredo: () => void;
}

const SpiritualView: React.FC<SpiritualViewProps> = ({ archive, onAddEntry, onBack, onConsultFredo }) => {
  const [activeTab, setActiveTab] = useState<'reflection' | 'prayer' | 'gratitude'>('reflection');
  const [input, setInput] = useState('');
  const [ref, setRef] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    onAddEntry({
      type: activeTab,
      content: input,
      timestamp: Date.now(),
      scriptureReference: ref || undefined
    });
    setInput('');
    setRef('');
  };

  const filteredArchive = archive.filter(a => a.type === activeTab);

  return (
    <div className="h-full bg-black flex flex-col animate-in fade-in duration-700">
      <header className="px-10 py-10 border-b border-white/5 flex justify-between items-center bg-black">
        <div className="flex items-center gap-8">
           <button onClick={onBack} className="p-2 text-neutral-800 hover:text-white transition-all">
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeWidth={2.5} d="M15 19l-7-7 7-7"/></svg>
           </button>
           <div className="space-y-1">
             <h2 className="font-serif italic text-3xl text-white tracking-tighter">Sacred Rhythms</h2>
             <p className="font-mono text-[9px] uppercase tracking-[0.5em] text-amber-500 font-black">Spiritual Archive Node</p>
           </div>
        </div>
        <button 
          onClick={onConsultFredo}
          className="px-8 py-3 bg-amber-600 text-black font-black uppercase text-[10px] tracking-widest rounded-full hover:bg-amber-500 transition-all"
        >
          Consult Fredo
        </button>
      </header>

      <div className="flex border-b border-white/5">
        {(['reflection', 'prayer', 'gratitude'] as const).map(tab => (
          <button 
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-6 font-black uppercase text-[10px] tracking-[0.4em] transition-all border-b-2 ${activeTab === tab ? 'border-amber-500 text-white bg-amber-500/5' : 'border-transparent text-neutral-700 hover:text-white'}`}
          >
            {tab}s
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-10 space-y-12 custom-scrollbar pb-32 max-w-4xl mx-auto w-full">
        <form onSubmit={handleSubmit} className="p-10 bg-[#050505] border border-white/5 rounded-[3rem] space-y-8 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-600/5 blur-[60px] rounded-full"></div>
          <p className="text-[10px] font-black uppercase tracking-[0.5em] text-neutral-800 px-4">New {activeTab} protocol</p>
          <textarea 
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder={`Manifest your ${activeTab} here...`}
            className="w-full h-40 bg-black/40 border border-white/5 rounded-3xl p-8 text-white font-serif italic text-xl focus:border-amber-500/30 transition-all resize-none placeholder:text-neutral-900"
          />
          {activeTab === 'reflection' && (
            <input 
              type="text" 
              value={ref}
              onChange={e => setRef(e.target.value)}
              placeholder="Scripture Reference (Optional)"
              className="w-full bg-black/40 border border-white/5 rounded-full px-8 py-4 text-sm font-bold text-amber-500 focus:border-amber-500/30"
            />
          )}
          <button 
            type="submit" 
            disabled={!input.trim()}
            className="w-full py-6 bg-white text-black font-black uppercase tracking-[0.4em] text-[10px] rounded-2xl hover:bg-neutral-200 transition-all disabled:opacity-5"
          >
            Seal to Archive
          </button>
        </form>

        <div className="space-y-6">
          <p className="text-[10px] font-black uppercase tracking-[0.5em] text-neutral-800 px-4">Historical Records</p>
          {filteredArchive.map(entry => (
            <div key={entry.id} className="p-10 bg-white/[0.02] border border-white/5 rounded-[2.5rem] space-y-4 hover:border-amber-500/20 transition-all group">
               <div className="flex justify-between items-start">
                  <span className="text-[9px] font-black uppercase tracking-widest text-neutral-700">{new Date(entry.timestamp).toLocaleDateString()}</span>
                  {entry.scriptureReference && <span className="text-[10px] font-black italic text-amber-500 opacity-60 group-hover:opacity-100">{entry.scriptureReference}</span>}
               </div>
               <p className="font-serif italic text-xl text-neutral-300 leading-relaxed whitespace-pre-wrap">{entry.content}</p>
            </div>
          ))}
          {filteredArchive.length === 0 && (
            <div className="py-20 text-center space-y-4 opacity-20">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeWidth={1} d="M12 21l-8.228-9.274a5.25 5.25 0 010-7.452 5.25 5.25 0 017.452 0L12 5.048l.776-.774a5.25 5.25 0 017.452 0 5.25 5.25 0 010 7.452L12 21z"/></svg>
              <p className="font-serif italic text-2xl tracking-tighter">No sacred history recorded.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SpiritualView;
