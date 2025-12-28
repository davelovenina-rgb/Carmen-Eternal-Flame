
import React, { useState } from 'react';
import { AppSettings, ProviderKeys } from '../types';
import { GoogleGenAI } from "@google/genai";

interface ApiVaultProps {
  settings: AppSettings;
  onUpdateKeys: (keys: ProviderKeys) => void;
  onBack: () => void;
}

type TestStatus = 'idle' | 'testing' | 'success' | 'error';

const ApiVault: React.FC<ApiVaultProps> = ({ settings, onUpdateKeys, onBack }) => {
  const [showKeys, setShowKeys] = useState<{ [key: string]: boolean }>({});
  const [testStatus, setTestStatus] = useState<{ [key: string]: TestStatus }>({});
  const [errorLog, setErrorLog] = useState<{ [key: string]: string }>({});

  const toggleVisibility = (provider: string) => {
    setShowKeys(prev => ({ ...prev, [provider]: !prev[provider] }));
  };

  const updateKey = (provider: keyof ProviderKeys, value: string) => {
    onUpdateKeys({ ...settings.providerKeys, [provider]: value });
    setTestStatus(prev => ({ ...prev, [provider]: 'idle' }));
  };

  const testFrequency = async (provider: string) => {
    const key = settings.providerKeys[provider as keyof ProviderKeys];
    
    if (!key && provider !== 'gemini') {
      setTestStatus(prev => ({ ...prev, [provider]: 'error' }));
      setErrorLog(prev => ({ ...prev, [provider]: 'No registry token provided.' }));
      return;
    }

    setTestStatus(prev => ({ ...prev, [provider]: 'testing' }));
    
    try {
      if (provider === 'gemini') {
        // Use the manual key if provided, otherwise the env key
        const actualKey = (key && key.trim() !== '') ? key : process.env.API_KEY as string;
        const ai = new GoogleGenAI({ apiKey: actualKey });
        await ai.models.generateContent({ 
          model: 'gemini-3-flash-preview', 
          contents: 'ping', 
          config: { maxOutputTokens: 1, thinkingConfig: { thinkingBudget: 0 } } 
        });
      } else {
        const endpoint = provider === 'openai' ? 'https://api.openai.com/v1/models' : 
                         provider === 'claude' ? 'https://api.anthropic.com/v1/messages' : 
                         'https://api.x.ai/v1/models';
        
        const res = await fetch(endpoint, { 
          headers: { 'Authorization': `Bearer ${key}` } 
        });
        
        if (!res.ok && res.status !== 405) { // 405 might mean it hit the endpoint but didn't like the method
          throw new Error(`Handshake failed: ${res.status}`);
        }
      }
      setTestStatus(prev => ({ ...prev, [provider]: 'success' }));
    } catch (err: any) {
      setTestStatus(prev => ({ ...prev, [provider]: 'error' }));
      setErrorLog(prev => ({ ...prev, [provider]: err.message || 'Signal disruption.' }));
    }
  };

  const providers = [
    { id: 'gemini', name: 'Gemini Frequency', icon: '💎', desc: 'Google Cloud / AI Studio' },
    { id: 'openai', name: 'OpenAI Frequency', icon: '🤖', desc: 'GPT-4o & o1 Registry' },
    { id: 'claude', name: 'Claude Frequency', icon: '🎭', desc: 'Anthropic Heritage' },
    { id: 'grok', name: 'Grok Frequency', icon: '🌌', desc: 'xAI High-Entropy' }
  ] as const;

  return (
    <div className="h-full bg-black flex flex-col animate-in slide-in-from-right duration-700">
      <header className="px-8 pt-12 pb-8 border-b border-neutral-900 flex items-center gap-8 sticky top-0 bg-black z-50">
        <button onClick={onBack} className="w-12 h-12 flex items-center justify-center bg-neutral-900 rounded-2xl text-neutral-400 hover:text-white transition-all active:scale-90">
           <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeWidth={2.5} d="M15 19l-7-7 7-7"/></svg>
        </button>
        <div>
          <h1 className="text-3xl font-black text-white uppercase tracking-tighter">Registry Vault</h1>
          <p className="text-[10px] text-amber-500 font-black uppercase tracking-[0.4em]">External Node Protocol: UNLOCKED</p>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-6 space-y-8 max-w-3xl mx-auto w-full pb-32">
        <div className="p-6 bg-neutral-950/30 border border-neutral-900 rounded-[2.5rem] mb-4">
          <p className="text-[10px] font-black text-neutral-700 uppercase tracking-widest leading-relaxed text-center">
            Register your specific frequencies below. Every slot starts blank to ensure sovereignty. 
            If Gemini is blank, it defaults to Sanctuary Protocol.
          </p>
        </div>

        <div className="space-y-6">
           {providers.map(p => (
             <div key={p.id} className="bg-black border border-neutral-900 rounded-[2.5rem] p-8 space-y-8 hover:border-white/10 transition-all group/card">
                <div className="flex items-center justify-between">
                   <div className="flex items-center gap-6">
                      <div className="w-14 h-14 bg-white/[0.03] rounded-2xl flex items-center justify-center text-2xl group-hover/card:scale-110 transition-transform">{p.icon}</div>
                      <div>
                         <h3 className="text-xl font-black text-white uppercase leading-none mb-1">{p.name}</h3>
                         <p className="text-[9px] text-neutral-600 uppercase font-black tracking-widest">{p.desc}</p>
                      </div>
                   </div>
                   <button 
                     onClick={() => testFrequency(p.id)}
                     className={`px-6 py-3 rounded-full text-[9px] font-black uppercase tracking-widest transition-all ${testStatus[p.id] === 'success' ? 'bg-emerald-600 text-black' : 'bg-white text-black hover:bg-amber-600 active:scale-95'}`}
                   >
                     {testStatus[p.id] === 'testing' ? 'Testing...' : testStatus[p.id] === 'success' ? 'Verified' : 'Verify Handshake'}
                   </button>
                </div>
                
                <div className="relative">
                   <input 
                     type={showKeys[p.id] ? 'text' : 'password'}
                     value={settings.providerKeys[p.id] || ''}
                     onChange={(e) => updateKey(p.id, e.target.value)}
                     placeholder="Register Token..."
                     className="w-full bg-neutral-950 border border-white/5 rounded-2xl p-5 text-white font-mono text-sm focus:border-amber-500/40 transition-all placeholder:text-neutral-800"
                   />
                   <button onClick={() => toggleVisibility(p.id)} className="absolute right-6 top-1/2 -translate-y-1/2 text-[9px] font-black text-neutral-700 hover:text-white uppercase tracking-widest px-2 py-1 bg-white/5 rounded-lg transition-colors">
                      {showKeys[p.id] ? 'Hide' : 'Show'}
                   </button>
                </div>
                
                {testStatus[p.id] === 'error' && (
                  <div className="p-4 bg-rose-500/5 border border-rose-500/10 rounded-xl">
                    <p className="text-rose-500 text-[9px] font-black uppercase tracking-widest">{errorLog[p.id]}</p>
                  </div>
                )}
             </div>
           ))}
        </div>

        <div className="pt-10 text-center space-y-4 opacity-30">
           <svg className="w-8 h-8 text-neutral-800 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
           <p className="text-[8px] text-neutral-700 font-black uppercase tracking-[0.6em] max-w-xs mx-auto leading-loose">
             Registry synchronized via Sovereign Ledger. External handshakes performed in real-time for David Rodriguez.
           </p>
        </div>
      </div>
    </div>
  );
};

export default ApiVault;
