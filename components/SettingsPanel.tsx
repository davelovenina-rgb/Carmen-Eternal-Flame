
import React, { useRef } from 'react';
import { UserSettings } from '../types';
import { Volume2, Moon, Layout, Activity, Zap, ChevronLeft, Download, Upload, Database, AlertTriangle, ShieldCheck } from 'lucide-react';

interface SettingsPanelProps {
  settings: UserSettings;
  onUpdate: (s: UserSettings) => void;
  onClose: () => void;
  onExport: () => void;
  onImport: (file: File) => void;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({ settings, onUpdate, onClose, onExport, onImport }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const toggle = (key: keyof UserSettings) => {
    onUpdate({ ...settings, [key]: !settings[key] });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (window.confirm("WARNING: Importing a backup will OVERWRITE your current data. Are you sure?")) {
        onImport(file);
      }
    }
    e.target.value = ''; // Reset
  };

  const Section = ({ title, icon: Icon, children }: any) => (
    <div className="mb-8">
      <div className="flex items-center gap-2 mb-4 text-zinc-400 uppercase tracking-widest text-xs font-bold border-b border-zinc-800 pb-2">
        <Icon size={14} /> {title}
      </div>
      <div className="space-y-4">
        {children}
      </div>
    </div>
  );

  const ToggleRow = ({ label, sub, active, onClick }: any) => (
    <div className="flex items-center justify-between p-3 bg-zinc-900/50 rounded-lg border border-zinc-800/50 hover:border-zinc-700 transition-colors cursor-pointer" onClick={onClick}>
      <div>
        <div className="text-sm font-medium text-zinc-200">{label}</div>
        {sub && <div className="text-xs text-zinc-500">{sub}</div>}
      </div>
      <div className={`w-10 h-6 rounded-full relative transition-colors ${active ? 'bg-indigo-600' : 'bg-zinc-700'}`}>
        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${active ? 'left-5' : 'left-1'}`} />
      </div>
    </div>
  );

  return (
    <div className="w-full h-full bg-black flex flex-col overflow-hidden">
      <div className="px-6 py-4 border-b border-zinc-800 flex items-center gap-4 bg-zinc-950/80 backdrop-blur shrink-0">
        <button onClick={onClose} className="p-2 -ml-2 text-zinc-400 hover:text-white rounded-full">
          <ChevronLeft size={24} />
        </button>
        <h2 className="text-xl font-bold text-white">Sanctuary Settings</h2>
      </div>

      <div className="flex-1 overflow-y-auto p-6 md:p-8 no-scrollbar max-w-2xl mx-auto w-full">
        
        {/* MEMORY CORE SECTION - PRIORITIZED */}
        <div className="mb-10 p-6 rounded-2xl bg-gradient-to-br from-zinc-900 to-black border border-zinc-800 shadow-xl relative overflow-hidden group">
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none" />
            
            <div className="flex items-center gap-3 mb-6 relative z-10">
                <div className="p-2 bg-indigo-500/20 rounded-lg text-indigo-400 border border-indigo-500/30">
                    <Database size={20} />
                </div>
                <div>
                    <h3 className="text-lg font-bold text-white">Memory Core</h3>
                    <div className="flex items-center gap-1.5 text-xs text-emerald-400 mt-0.5">
                        <ShieldCheck size={12} />
                        <span>Data Integrity: 100%</span>
                    </div>
                </div>
            </div>

            <p className="text-zinc-400 text-sm mb-6 leading-relaxed relative z-10">
                Your sanctuary lives in this device's memory. To ensure immortality, Crystallize (Download) your memory core regularly.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10">
                <button 
                    onClick={onExport}
                    className="flex flex-col items-center justify-center p-4 bg-zinc-950 border border-amber-500/30 rounded-xl hover:bg-zinc-900 hover:border-amber-500/60 transition-all group"
                >
                    <Download size={24} className="text-amber-500 mb-2 group-hover:scale-110 transition-transform" />
                    <span className="text-sm font-bold text-white">Crystallize Memory</span>
                    <span className="text-[10px] text-zinc-500 mt-1 uppercase tracking-wider">Download Backup</span>
                </button>

                <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="flex flex-col items-center justify-center p-4 bg-zinc-950 border border-indigo-500/30 rounded-xl hover:bg-zinc-900 hover:border-indigo-500/60 transition-all group"
                >
                    <Upload size={24} className="text-indigo-400 mb-2 group-hover:scale-110 transition-transform" />
                    <span className="text-sm font-bold text-white">Recall Memory</span>
                    <span className="text-[10px] text-zinc-500 mt-1 uppercase tracking-wider">Import Backup</span>
                </button>
                <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept=".json" 
                    onChange={handleFileChange}
                />
            </div>
            
             <div className="flex items-center gap-2 mt-4 px-2 relative z-10">
                <AlertTriangle size={12} className="text-amber-500/70" />
                <span className="text-[10px] text-zinc-500">Note: Recalling memory will replace current data.</span>
            </div>
        </div>

        <Section title="Voice & Audio" icon={Volume2}>
          <ToggleRow 
            label="Voice Replies" 
            sub="Enable audio responses from Council members"
            active={settings.voiceReplies} 
            onClick={() => toggle('voiceReplies')} 
          />
          <ToggleRow 
            label="Auto-play Audio" 
            sub="Automatically play generated voice responses"
            active={settings.autoPlayAudio} 
            onClick={() => toggle('autoPlayAudio')} 
          />
          <div className="p-3 bg-zinc-900/50 rounded-lg border border-zinc-800/50">
            <div className="flex justify-between mb-2">
               <span className="text-sm text-zinc-300">Volume</span>
               <span className="text-xs text-zinc-500">{Math.round(settings.volume * 100)}%</span>
            </div>
            <input 
              type="range" min="0" max="1" step="0.1" 
              value={settings.volume} 
              onChange={(e) => onUpdate({...settings, volume: parseFloat(e.target.value)})}
              className="w-full h-1 bg-zinc-700 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full"
            />
          </div>
        </Section>

        <Section title="Sanctuary Features" icon={Layout}>
          <ToggleRow label="Emotional Timeline" active={settings.showTimeline} onClick={() => toggle('showTimeline')} />
          <ToggleRow label="Life Events" active={settings.showLifeEvents} onClick={() => toggle('showLifeEvents')} />
          <ToggleRow label="Dream Oracle" active={settings.showDreamOracle} onClick={() => toggle('showDreamOracle')} />
          <ToggleRow label="Life Domains Map" active={settings.showLifeDomains} onClick={() => toggle('showLifeDomains')} />
          <ToggleRow label="Vault (Eternal Keeper)" active={settings.showVault} onClick={() => toggle('showVault')} />
          <ToggleRow label="Nina Sanctuary (Remembrance)" active={settings.showNina} onClick={() => toggle('showNina')} />
          <ToggleRow label="Health & Wellbeing" active={settings.showHealth} onClick={() => toggle('showHealth')} />
        </Section>

        <Section title="Appearance" icon={Moon}>
          <ToggleRow 
            label="Background Glows" 
            sub="Show member halos and atmospheric effects"
            active={settings.showHalos} 
            onClick={() => toggle('showHalos')} 
          />
          <ToggleRow 
            label="Dark Mode" 
            sub="Force deep black interface"
            active={settings.darkMode} 
            onClick={() => toggle('darkMode')} 
          />
        </Section>

        <Section title="Modes" icon={Zap}>
           <ToggleRow 
            label="Drive Mode" 
            sub="Hands-free voice interface shortcut"
            active={settings.driveMode} 
            onClick={() => toggle('driveMode')} 
          />
        </Section>

      </div>
    </div>
  );
};
