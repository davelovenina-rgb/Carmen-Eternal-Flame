
import React, { useState, useMemo } from 'react';
import { Agent, Conversation, KnowledgeSource } from '../types';

interface AgentSettingsViewProps {
  agent: Agent;
  conversations: Conversation[];
  onUpdateAgent: (agent: Agent) => void;
  onBack: () => void;
}

const AgentSettingsView: React.FC<AgentSettingsViewProps> = ({ agent, conversations, onUpdateAgent, onBack }) => {
  const [activeTab, setActiveTab] = useState<'core' | 'knowledge' | 'history'>('core');
  const [urlInput, setUrlInput] = useState('');
  const [historySearch, setHistorySearch] = useState('');
  const [showSaved, setShowSaved] = useState(false);

  const updateField = (key: keyof Agent, val: any) => {
    onUpdateAgent({ ...agent, [key]: val });
    setShowSaved(true);
    setTimeout(() => setShowSaved(false), 2000);
  };

  const filteredHistory = useMemo(() => {
    return conversations.filter(c => 
      c.title.toLowerCase().includes(historySearch.toLowerCase()) ||
      c.messages.some(m => m.content.toLowerCase().includes(historySearch.toLowerCase()))
    );
  }, [conversations, historySearch]);

  const addKnowledgeUrl = () => {
    if (!urlInput) return;
    const newSource: KnowledgeSource = {
      id: Date.now().toString(),
      type: 'url',
      name: urlInput,
      content: urlInput
    };
    updateField('knowledgeSources', [...agent.knowledgeSources, newSource]);
    setUrlInput('');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const newSource: KnowledgeSource = {
          id: Date.now().toString(),
          type: 'file',
          name: file.name,
          content: reader.result as string
        };
        updateField('knowledgeSources', [...agent.knowledgeSources, newSource]);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="h-full bg-black flex flex-col animate-in slide-in-from-right duration-500 overflow-hidden">
      <header className="px-10 py-12 border-b border-white/5 flex items-center justify-between bg-black">
        <div className="flex items-center gap-10 flex-1">
          <button onClick={onBack} className="p-2 text-neutral-800 hover:text-white transition-all active:scale-90">
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeWidth={2.5} d="M15 19l-7-7 7-7"/></svg>
          </button>
          <div className="space-y-1 flex-1">
            <p className="text-amber-500 font-black uppercase text-[10px] tracking-[0.4em] flex items-center gap-4">
              Agent Control Node
              {showSaved && <span className="text-emerald-500 animate-pulse lowercase tracking-normal font-mono opacity-60">synced...</span>}
            </p>
            <input 
              type="text"
              value={agent.name}
              onChange={e => updateField('name', e.target.value)}
              className="bg-transparent border-none focus:ring-0 p-0 text-4xl font-black text-white tracking-tighter uppercase w-full outline-none"
              placeholder="Identity Label"
            />
          </div>
        </div>
      </header>

      <div className="flex border-b border-white/5">
        {(['core', 'knowledge', 'history'] as const).map(tab => (
          <button 
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-6 font-black uppercase text-[11px] tracking-[0.3em] transition-all border-b-2 ${activeTab === tab ? 'border-amber-500 text-white bg-white/[0.02]' : 'border-transparent text-neutral-700 hover:text-white'}`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-10 space-y-20 custom-scrollbar pb-32 max-w-4xl mx-auto w-full">
        {activeTab === 'core' && (
          <div className="space-y-12 animate-in fade-in duration-500">
            <div className="space-y-6">
              <label className="text-[10px] font-black uppercase tracking-[0.4em] text-neutral-700 px-4">Core Persona Instructions</label>
              <textarea 
                value={agent.instructions}
                onChange={e => updateField('instructions', e.target.value)}
                className="w-full h-[25rem] bg-[#050505] border border-white/5 rounded-[2.5rem] p-10 text-white font-bold focus:border-amber-500/30 transition-all resize-none leading-relaxed text-base shadow-inner custom-scrollbar"
                placeholder="Describe behavioral logic and knowledge focus..."
              />
            </div>

            <div className="space-y-8">
              <label className="text-[10px] font-black uppercase tracking-[0.4em] text-neutral-700 px-4">Vocal Calibration</label>
              <div className="bg-[#050505] p-10 rounded-[2.5rem] border border-white/5 space-y-12">
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  {['Kore', 'Puck', 'Charon', 'Fenrir', 'Zephyr'].map(v => (
                    <button 
                      key={v}
                      onClick={() => updateField('voicePreset', v)}
                      className={`py-6 rounded-2xl border transition-all font-black uppercase text-[10px] tracking-widest flex flex-col items-center gap-3 ${agent.voicePreset === v ? 'bg-amber-600 border-amber-500 text-black' : 'bg-transparent border-white/5 text-neutral-700 hover:text-white'}`}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
                      {v}
                    </button>
                  ))}
                </div>

                <div className="space-y-8 pt-6 border-t border-white/5">
                   <div className="space-y-4">
                      <div className="flex justify-between font-black uppercase text-[9px] tracking-[0.3em] text-neutral-600">
                        <span>Frequency Speed</span>
                        <span className="text-amber-500">{agent.voiceSpeed.toFixed(1)}x</span>
                      </div>
                      <input 
                        type="range" min="0.5" max="2.0" step="0.1"
                        value={agent.voiceSpeed}
                        onChange={e => updateField('voiceSpeed', parseFloat(e.target.value))}
                        className="w-full h-1 bg-white/5 rounded-full appearance-none accent-amber-500 cursor-pointer"
                      />
                   </div>
                   <div className="space-y-4">
                      <div className="flex justify-between font-black uppercase text-[9px] tracking-[0.3em] text-neutral-600">
                        <span>Tonal Pitch</span>
                        <span className="text-amber-500">{agent.pitch.toFixed(1)}x</span>
                      </div>
                      <input 
                        type="range" min="0.5" max="1.5" step="0.1"
                        value={agent.pitch}
                        onChange={e => updateField('pitch', parseFloat(e.target.value))}
                        className="w-full h-1 bg-white/5 rounded-full appearance-none accent-amber-500 cursor-pointer"
                      />
                   </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'knowledge' && (
          <div className="space-y-12 animate-in fade-in duration-500">
            <div className="bg-[#050505] border border-white/5 rounded-[3.5rem] p-12 space-y-12 shadow-2xl">
              <div className="space-y-6">
                <p className="text-[10px] font-black uppercase text-amber-500 tracking-widest px-4">Knowledge Node (URL)</p>
                <div className="flex gap-4">
                  <input 
                    type="text" 
                    value={urlInput}
                    onChange={e => setUrlInput(e.target.value)}
                    placeholder="https://..."
                    className="flex-1 bg-black border border-white/5 rounded-3xl p-6 text-white font-bold"
                  />
                  <button onClick={addKnowledgeUrl} className="px-10 bg-white text-black font-black uppercase text-[10px] tracking-widest rounded-3xl">Index</button>
                </div>
              </div>

              <div className="w-full h-px bg-white/5"></div>

              <div className="space-y-6">
                <p className="text-[10px] font-black uppercase text-amber-500 tracking-widest px-4">Ingest Documents</p>
                <label className="w-full h-48 border border-dashed border-white/10 rounded-[3rem] flex flex-col items-center justify-center gap-6 cursor-pointer hover:bg-white/[0.03] transition-all">
                  <svg className="w-10 h-10 text-neutral-800" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
                  <span className="text-[10px] font-black uppercase tracking-widest text-neutral-700">Upload Data Source</span>
                  <input type="file" className="hidden" onChange={handleFileUpload} />
                </label>
              </div>
            </div>

            <div className="space-y-4">
              {agent.knowledgeSources.map(source => (
                <div key={source.id} className="p-6 bg-[#050505] border border-white/5 rounded-3xl flex items-center justify-between group">
                  <div className="flex items-center gap-6">
                     <span className="w-12 h-12 rounded-xl bg-white/[0.03] flex items-center justify-center">{source.type === 'file' ? '📄' : '🌐'}</span>
                     <p className="text-white font-bold text-sm truncate max-w-sm uppercase">{source.name}</p>
                  </div>
                  <button onClick={() => updateField('knowledgeSources', agent.knowledgeSources.filter(s => s.id !== source.id))} className="text-rose-600 opacity-0 group-hover:opacity-100 p-4 transition-all"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeWidth={3} d="M6 18L18 6M6 6l12 12"/></svg></button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="space-y-12 animate-in fade-in duration-500">
            <div className="flex items-center gap-4 bg-[#050505] border border-white/5 rounded-3xl p-4">
              <svg className="w-6 h-6 text-neutral-800 ml-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
              <input 
                type="text" 
                placeholder="Search history and message archives..." 
                value={historySearch}
                onChange={e => setHistorySearch(e.target.value)}
                className="bg-transparent border-none focus:ring-0 text-white font-bold w-full p-2"
              />
            </div>
            
            <div className="space-y-4">
              {filteredHistory.map(conv => (
                <div key={conv.id} className="p-8 bg-white/[0.02] border border-white/5 rounded-3xl flex items-center justify-between group hover:border-amber-500/20 transition-all">
                  <div className="space-y-2">
                    <p className="text-white font-black uppercase text-sm">{conv.title}</p>
                    <p className="text-[9px] text-neutral-700 font-black uppercase tracking-widest">{conv.messages.length} Messages • {new Date(conv.lastUpdate).toLocaleDateString()}</p>
                  </div>
                  <div className="flex gap-4 opacity-0 group-hover:opacity-100 transition-all">
                    <button className="p-3 text-neutral-700 hover:text-white"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeWidth={2} d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z"/></svg></button>
                  </div>
                </div>
              ))}
              {filteredHistory.length === 0 && <p className="text-center py-20 text-neutral-800 italic">No archive results found.</p>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AgentSettingsView;
