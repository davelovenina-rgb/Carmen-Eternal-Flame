
import React, { useRef } from 'react';
import { AppState, AppSettings, ToneStyle } from '../types';

interface SettingsProps {
  state: AppState;
  setState: React.Dispatch<React.SetStateAction<AppState>>;
  onBack: () => void;
  onDeleteReminder: (id: string) => void;
  onOpenReminder: () => void;
}

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="space-y-6">
    <h3 className="text-amber-600 font-black uppercase text-[10px] tracking-[0.5em] px-8">{title}</h3>
    <div className="bg-[#050505] border border-neutral-900 rounded-[3rem] p-8 md:p-12 space-y-12 shadow-2xl">
      {children}
    </div>
  </div>
);

const Settings: React.FC<SettingsProps> = ({ state, setState, onBack, onDeleteReminder, onOpenReminder }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const updateSetting = (key: keyof AppSettings, val: any) => {
    setState(prev => ({ ...prev, settings: { ...prev.settings, [key]: val } }));
  };

  const toneStyles: { id: ToneStyle; label: string; desc: string }[] = [
    { id: 'default', label: 'Default Fredo', desc: 'Balanced Nuyorican soul.' },
    { id: 'professional', label: 'Professional', desc: 'Precise and objective.' },
    { id: 'friendly', label: 'Friendly', desc: 'Warm and chatty.' },
    { id: 'candid', label: 'Candid', desc: 'Direct and encouraging.' },
    { id: 'quirky', label: 'Quirky', desc: 'Artistic and playful.' },
    { id: 'efficient', label: 'Efficient', desc: 'Concise and rapid.' },
    { id: 'nerdy', label: 'Nerdy', desc: 'Technical and exploratory.' },
    { id: 'clinical', label: 'Clinical', desc: 'Sharp and analytical.' }
  ];

  return (
    <div className="h-full bg-black flex flex-col animate-in slide-in-from-right duration-700 overflow-hidden">
      <header className="px-8 pt-[calc(2rem+env(safe-area-inset-top))] pb-8 border-b border-neutral-900 flex items-center gap-8 bg-black/80 backdrop-blur-3xl sticky top-0 z-50">
        <button onClick={onBack} className="w-12 h-12 flex items-center justify-center bg-neutral-900 border border-neutral-800 rounded-2xl text-neutral-400 hover:text-white transition-all active:scale-90">
           <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeWidth={2.5} d="M15 19l-7-7 7-7"/></svg>
        </button>
        <h1 className="text-3xl font-black text-white tracking-tighter uppercase leading-none">Council Codex</h1>
      </header>

      <div className="flex-1 overflow-y-auto p-6 md:p-12 space-y-20 custom-scrollbar pb-[calc(10rem+env(safe-area-inset-bottom))] max-w-5xl mx-auto w-full">
        
        {/* IDENTITY ARCHIVE */}
        <Section title="Identity & Sovereignty">
          <div className="flex flex-col gap-10">
            <div className="flex flex-col md:flex-row items-center gap-10">
              <div className="relative group cursor-pointer shrink-0" onClick={() => fileInputRef.current?.click()}>
                 <div className="w-32 h-32 md:w-40 md:h-40 rounded-[2.5rem] bg-black border-2 border-neutral-900 hover:border-amber-600/30 transition-all overflow-hidden flex items-center justify-center shadow-2xl">
                   {state.settings.customAvatar ? (
                     <img src={state.settings.customAvatar} className="w-full h-full object-cover grayscale" alt="Avatar" />
                   ) : (
                     <span className="text-[10px] font-black uppercase text-neutral-800 tracking-widest">Seal POV</span>
                   )}
                 </div>
                 <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-[2.5rem] pointer-events-none">
                   <span className="text-[10px] font-black uppercase text-white tracking-widest">Update</span>
                 </div>
                 <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onloadend = () => updateSetting('customAvatar', reader.result as string);
                      reader.readAsDataURL(file);
                    }
                 }} />
              </div>
              <div className="flex-1 w-full space-y-6">
                 <div className="space-y-3">
                    <p className="text-[10px] font-black uppercase text-neutral-700 tracking-widest px-2">Nickname</p>
                    <input 
                      type="text" 
                      value={state.settings.nickname} 
                      onChange={e => updateSetting('nickname', e.target.value)} 
                      className="w-full bg-white/[0.02] border border-neutral-900 rounded-2xl p-5 text-white font-black uppercase tracking-tight focus:ring-0 focus:border-amber-600/30 transition-all" 
                    />
                 </div>
                 <div className="space-y-3">
                    <p className="text-[10px] font-black uppercase text-neutral-700 tracking-widest px-2">Current Occupation / Role</p>
                    <input 
                      type="text" 
                      value={state.settings.occupation} 
                      onChange={e => updateSetting('occupation', e.target.value)} 
                      className="w-full bg-white/[0.02] border border-neutral-900 rounded-2xl p-5 text-white font-black uppercase tracking-tight focus:ring-0 focus:border-amber-600/30 transition-all" 
                    />
                 </div>
              </div>
            </div>
          </div>
        </Section>

        {/* PERSONALIZATION & FRAMEWORKS */}
        <Section title="The Sovereign Context">
          <div className="space-y-10">
            <div className="space-y-3">
              <p className="text-[10px] font-black uppercase text-neutral-700 tracking-widest px-2">Bio / Identity Keeper</p>
              <textarea 
                value={state.settings.bio}
                onChange={e => updateSetting('bio', e.target.value)}
                placeholder="Brief archival summary of your identity..."
                className="w-full h-28 bg-white/[0.02] border border-neutral-900 rounded-3xl p-6 text-neutral-200 font-bold focus:border-amber-600/30 transition-all resize-none shadow-inner"
              />
            </div>
            
            <div className="space-y-3">
              <p className="text-[10px] font-black uppercase text-neutral-700 tracking-widest px-2">Archival Background (David's Frequency)</p>
              <textarea 
                value={state.settings.moreAboutYou}
                onChange={e => updateSetting('moreAboutYou', e.target.value)}
                placeholder="Upload your deep context here for long-term memory handshaking..."
                className="w-full h-48 bg-white/[0.02] border border-neutral-900 rounded-[2rem] p-6 text-neutral-200 font-bold font-mono text-sm focus:border-amber-600/30 transition-all resize-none custom-scrollbar shadow-inner"
              />
            </div>

            <div className="space-y-3">
              <p className="text-[10px] font-black uppercase text-amber-500 tracking-[0.4em] px-2 flex justify-between items-center">
                <span>Core Framework / Protocols</span>
                <span className="text-[8px] opacity-40 font-mono">[Paste Frameworks Here]</span>
              </p>
              <textarea 
                value={state.settings.customInstructions}
                onChange={e => updateSetting('customInstructions', e.target.value)}
                placeholder="The master framework that dictates how Fredo responds to your specific frequency..."
                className="w-full h-80 bg-white/[0.02] border border-neutral-900 rounded-[2.5rem] p-8 text-neutral-200 font-mono text-sm focus:border-amber-500/30 transition-all resize-none custom-scrollbar shadow-[inset_0_0_50px_rgba(0,0,0,0.5)] leading-relaxed"
              />
              <div className="flex justify-end px-4">
                 <button onClick={() => { navigator.clipboard.writeText(state.settings.customInstructions); alert("Framework Staged to Clipboard"); }} className="text-[9px] font-black uppercase text-neutral-600 hover:text-white transition-colors tracking-widest">Copy Protocol</button>
              </div>
            </div>
          </div>
        </Section>

        {/* ACCESSIBILITY & VISUALS */}
        <Section title="Display Matrix Control">
           <div className="space-y-12">
              <div className="space-y-6">
                <div className="flex justify-between items-center px-4">
                  <span className="text-[10px] font-black uppercase text-neutral-600 tracking-widest">Typography Scale</span>
                  <span className="text-[11px] text-amber-500 font-mono font-black">{state.settings.fontSize.toFixed(1)}x</span>
                </div>
                <input 
                  type="range" 
                  min="0.5" max="2.0" step="0.1"
                  value={state.settings.fontSize}
                  onChange={e => updateSetting('fontSize', parseFloat(e.target.value))}
                  className="w-full h-1 bg-white/5 rounded-full appearance-none accent-amber-500 cursor-pointer"
                />
              </div>

              <div className="space-y-6">
                <div className="flex justify-between items-center px-4">
                  <span className="text-[10px] font-black uppercase text-neutral-600 tracking-widest">Interface Zoom</span>
                  <span className="text-[11px] text-amber-500 font-mono font-black">{state.settings.uiZoom.toFixed(1)}x</span>
                </div>
                <input 
                  type="range" 
                  min="0.5" max="1.3" step="0.05"
                  value={state.settings.uiZoom}
                  onChange={e => updateSetting('uiZoom', parseFloat(e.target.value))}
                  className="w-full h-1 bg-white/5 rounded-full appearance-none accent-amber-500 cursor-pointer"
                />
              </div>
           </div>
        </Section>

        {/* NEURAL MEMORY */}
        <Section title="Neural Registry">
           <div className="space-y-6">
              <p className="text-[11px] font-black text-neutral-600 uppercase tracking-widest leading-relaxed px-4">
                 Sovereign memories that persist across all registry streams.
              </p>
              <div className="space-y-4">
                {state.neuralMemories.map(nm => (
                  <div 
                    key={nm.id} 
                    className="p-6 bg-white/[0.02] border border-neutral-900 rounded-3xl cursor-pointer hover:border-amber-500/30 transition-all group"
                    onClick={() => {
                      const newInstruct = prompt("Update Memory Fragment:", nm.instructions);
                      if (newInstruct !== null) {
                        setState(prev => ({
                          ...prev,
                          neuralMemories: prev.neuralMemories.map(m => m.id === nm.id ? { ...m, instructions: newInstruct } : m)
                        }));
                      }
                    }}
                  >
                    <div className="flex justify-between items-center mb-2">
                       <h4 className="text-white font-black uppercase tracking-tight text-xs">{nm.title}</h4>
                       <button onClick={(e) => { e.stopPropagation(); if(confirm("Purge memory?")) setState(prev => ({ ...prev, neuralMemories: prev.neuralMemories.filter(m => m.id !== nm.id) })); }} className="text-[9px] font-black uppercase text-rose-900 hover:text-rose-500 transition-colors">Purge</button>
                    </div>
                    <p className="text-neutral-500 text-[11px] italic line-clamp-2">"{nm.instructions}"</p>
                  </div>
                ))}
                <button 
                  onClick={() => {
                    const title = prompt("Fragment Label:");
                    const instructions = prompt("Fragment Detail:");
                    if (title && instructions) {
                      setState(prev => ({
                        ...prev,
                        neuralMemories: [{ id: Date.now().toString(), title, instructions, timestamp: Date.now() }, ...prev.neuralMemories]
                      }));
                    }
                  }}
                  className="w-full py-5 border border-dashed border-neutral-800 rounded-2xl text-[10px] font-black uppercase text-neutral-700 tracking-widest hover:text-white hover:border-amber-600/30 transition-all"
                >
                  + Forge New Memory
                </button>
              </div>
           </div>
        </Section>

        {/* STYLE */}
        <Section title="Resonance Style">
          <div className="grid grid-cols-2 gap-3">
            {toneStyles.map(tone => (
              <button 
                key={tone.id}
                onClick={() => updateSetting('toneStyle', tone.id)}
                className={`p-6 rounded-2xl border text-left transition-all ${state.settings.toneStyle === tone.id ? 'bg-amber-600 border-amber-500 text-black shadow-xl' : 'bg-white/[0.02] border-neutral-900 text-neutral-500 hover:text-white'}`}
              >
                <p className="text-[10px] font-black uppercase tracking-widest mb-1">{tone.label}</p>
                <p className="text-[8px] opacity-70 leading-tight uppercase font-bold">{tone.desc}</p>
              </button>
            ))}
          </div>
        </Section>
      </div>
    </div>
  );
};

export default Settings;
