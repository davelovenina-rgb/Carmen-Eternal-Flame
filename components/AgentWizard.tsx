
import React, { useState } from 'react';
import { Agent } from '../types';
import { GoogleGenAI } from "@google/genai";

interface AgentWizardProps {
  onSave: (agent: Agent) => void;
  onBack: () => void;
}

const AgentWizard: React.FC<AgentWizardProps> = ({ onSave, onBack }) => {
  const [step, setStep] = useState(1);
  const [description, setDescription] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [draftAgent, setDraftAgent] = useState<Partial<Agent>>({
    id: Date.now().toString(),
    voicePreset: 'Kore',
    voiceSpeed: 1,
    pitch: 1,
    knowledgeSources: []
  });

  const handleGenerateInstructions = async () => {
    setIsGenerating(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
      const prompt = `You are the Council Architect. Create a sacred AI persona "Frequency" for David Rodriguez based on this intent: "${description}". 
      Return the output as plain text formatted as a system instruction. 
      Focus on their specific role in the Council (e.g. Health, Heritage, Art), their unique tone, and how they interact with David.`;
      
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: [{ role: 'user', parts: [{ text: prompt }] }]
      });

      setDraftAgent(prev => ({ ...prev, instructions: response.text }));
      setStep(3);
    } catch (error) {
      console.error(error);
      alert("Frequency disruption. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const finalize = () => {
    if (draftAgent.name && draftAgent.instructions) {
      onSave(draftAgent as Agent);
      onBack();
    }
  };

  return (
    <div className="h-full bg-black flex flex-col p-10 animate-in fade-in duration-500 overflow-y-auto">
      <header className="flex items-center gap-10 mb-12 shrink-0">
        <button onClick={onBack} className="p-2 text-neutral-800 hover:text-white transition-all active:scale-90">
          <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeWidth={2.5} d="M15 19l-7-7 7-7"/></svg>
        </button>
        <h1 className="text-4xl font-black text-white tracking-tighter uppercase">Council Summoning</h1>
      </header>

      <div className="flex-1 max-w-2xl mx-auto w-full space-y-12">
        {step === 1 && (
          <div className="space-y-8 animate-in slide-in-from-bottom duration-500">
            <div className="text-center space-y-4">
              <p className="text-amber-500 font-black uppercase text-[10px] tracking-[0.5em]">The Intent</p>
              <h2 className="text-2xl font-bold text-neutral-300">What facet of the Prism shall this agent hold?</h2>
              <p className="text-neutral-600 text-xs font-bold uppercase tracking-widest leading-relaxed">Describe the specialized purpose (e.g., "A silent researcher for Nuyorican poetry" or "A strict metabolic coach").</p>
            </div>
            <textarea 
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Manifest the intent here..."
              className="w-full h-48 bg-[#050505] border border-white/5 rounded-3xl p-8 text-white font-bold placeholder:text-neutral-900 focus:border-amber-500/30 transition-all resize-none shadow-inner"
            />
            <button 
              onClick={() => setStep(2)}
              disabled={!description}
              className="w-full py-8 bg-white text-black font-black uppercase tracking-[0.3em] rounded-2xl hover:bg-neutral-200 disabled:opacity-5 transition-all shadow-xl"
            >
              Set Identity Label
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-8 animate-in slide-in-from-right duration-500">
             <div className="text-center space-y-4">
              <p className="text-amber-500 font-black uppercase text-[10px] tracking-[0.5em]">Identity Labeling</p>
              <h2 className="text-2xl font-bold">Assign Council Name</h2>
            </div>
            <input 
              type="text" 
              value={draftAgent.name || ''}
              onChange={e => setDraftAgent(prev => ({ ...prev, name: e.target.value }))}
              placeholder="e.g. Master Seneca, The Curator..."
              className="w-full bg-[#050505] border border-white/5 rounded-3xl p-8 text-white font-black text-2xl placeholder:text-neutral-900 focus:border-amber-500/30 transition-all"
            />
            <button 
              onClick={handleGenerateInstructions}
              disabled={!draftAgent.name || isGenerating}
              className="w-full py-8 bg-amber-600 text-black font-black uppercase tracking-[0.3em] rounded-2xl hover:bg-amber-500 disabled:opacity-10 transition-all"
            >
              {isGenerating ? "Synthesizing Frequency Logic..." : "Forge Protocol"}
            </button>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-12 pb-32 animate-in slide-in-from-right duration-500">
             <div className="text-center space-y-4">
              <p className="text-amber-500 font-black uppercase text-[10px] tracking-[0.5em]">Tonal Resonance</p>
              <h2 className="text-2xl font-bold">Calibrate Vocal Signature</h2>
            </div>
            
            <div className="space-y-6">
              <label className="text-[10px] font-black uppercase tracking-[0.4em] text-neutral-700 px-4">Tonal Template</label>
              <div className="grid grid-cols-3 gap-3">
                {['Kore', 'Puck', 'Charon', 'Fenrir', 'Zephyr'].map(v => (
                  <button 
                    key={v}
                    onClick={() => setDraftAgent(prev => ({ ...prev, voicePreset: v }))}
                    className={`py-6 rounded-2xl border transition-all font-black uppercase text-[10px] tracking-widest ${draftAgent.voicePreset === v ? 'bg-amber-600 border-amber-500 text-black shadow-[0_0_20px_rgba(217,119,6,0.2)]' : 'bg-transparent border-white/5 text-neutral-600 hover:text-white'}`}
                  >
                    {v}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-[#050505] p-10 rounded-[2.5rem] border border-white/5 space-y-10">
               <div className="space-y-4">
                  <div className="flex justify-between font-black uppercase text-[9px] tracking-[0.3em] text-neutral-600">
                    <span>Rate of Transmission</span>
                    <span className="text-amber-500">{draftAgent.voiceSpeed?.toFixed(1)}x</span>
                  </div>
                  <input type="range" min="0.5" max="2.0" step="0.1" value={draftAgent.voiceSpeed} onChange={e => setDraftAgent(prev => ({ ...prev, voiceSpeed: parseFloat(e.target.value) }))} className="w-full h-1 bg-white/5 rounded-full appearance-none accent-amber-500" />
               </div>
            </div>

            <div className="space-y-4">
              <label className="text-[10px] font-black uppercase tracking-[0.4em] text-neutral-700 px-4">Core Protocol Logic</label>
              <textarea 
                value={draftAgent.instructions || ''}
                onChange={e => setDraftAgent(prev => ({ ...prev, instructions: e.target.value }))}
                className="w-full h-64 bg-[#050505] border border-white/5 rounded-3xl p-8 text-white font-bold focus:border-amber-500/30 transition-all resize-none text-sm leading-relaxed"
              />
            </div>

            <button 
              onClick={finalize}
              className="w-full py-8 bg-white text-black font-black uppercase tracking-[0.3em] rounded-2xl hover:bg-neutral-200 transition-all shadow-[0_15px_40px_rgba(255,255,255,0.1)]"
            >
              Seal Council Entry
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AgentWizard;
