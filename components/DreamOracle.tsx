

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CloudMoon, PenTool, Sparkles, ArrowLeft, Menu, Star, Eye } from 'lucide-react';
import { Dream } from '../types';
import { analyzeDream } from '../services/geminiService';

interface DreamOracleProps {
  dreams: Dream[];
  onAddDream: (dream: Dream) => void;
  onBack: () => void;
  onMenuClick: () => void;
}

export const DreamOracle: React.FC<DreamOracleProps> = ({ dreams, onAddDream, onBack, onMenuClick }) => {
  const [isLogging, setIsLogging] = useState(false);
  const [newDreamText, setNewDreamText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedDream, setSelectedDream] = useState<Dream | null>(null);

  const handleAnalyze = async () => {
    if (!newDreamText.trim()) return;
    
    setIsAnalyzing(true);
    try {
        const result = await analyzeDream(newDreamText);
        
        const dream: Dream = {
            id: Date.now().toString(),
            date: Date.now(),
            title: newDreamText.split(' ').slice(0, 5).join(' ') + '...',
            content: newDreamText,
            interpretation: result.interpretation,
            themes: result.themes,
            lucidity: 1 // Default
        };
        
        onAddDream(dream);
        setNewDreamText('');
        setIsLogging(false);
        setSelectedDream(dream); // Show result
    } catch (e) {
        console.error("Dream Analysis Failed", e);
    } finally {
        setIsAnalyzing(false);
    }
  };

  return (
    <div className="w-full h-full bg-black flex flex-col relative overflow-hidden font-serif">
      
      {/* Mystical Background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,#312e81,transparent_70%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 mix-blend-overlay pointer-events-none" />

      {/* Header */}
      <div className="px-4 py-3 border-b border-indigo-900/30 flex items-center justify-between bg-black/50 backdrop-blur shrink-0 z-20">
        <div className="flex items-center gap-3">
            <button onClick={onBack} className="p-2 -ml-2 text-indigo-300 hover:text-white rounded-full">
                <ArrowLeft size={20} />
            </button>
            <h2 className="text-lg font-bold text-indigo-100 flex items-center gap-2">
                <CloudMoon size={18} className="text-indigo-400" />
                Dream Oracle
            </h2>
        </div>
        <button onClick={onMenuClick} className="p-2 -mr-2 text-indigo-300 hover:text-white rounded-full">
            <Menu size={20} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 md:p-8 no-scrollbar z-10">
          
          {/* Hero / Input */}
          {!isLogging && (
              <div className="mb-8 text-center">
                   <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setIsLogging(true)}
                      className="group relative w-20 h-20 rounded-full bg-indigo-950/50 border border-indigo-500/50 flex items-center justify-center mx-auto mb-4 shadow-[0_0_30px_rgba(79,70,229,0.2)] hover:shadow-[0_0_50px_rgba(79,70,229,0.4)] transition-all"
                   >
                       <PenTool size={32} className="text-indigo-300 group-hover:text-white" />
                       <div className="absolute inset-0 rounded-full border border-indigo-400 opacity-20 animate-ping" />
                   </motion.button>
                   <h3 className="text-indigo-200 text-lg italic">"The veil is thin. Record your vision."</h3>
              </div>
          )}

          {/* Dream List */}
          <div className="space-y-4 max-w-2xl mx-auto">
              {dreams.map(dream => (
                  <motion.div 
                    key={dream.id}
                    layoutId={dream.id}
                    onClick={() => setSelectedDream(dream)}
                    className="p-5 rounded-2xl bg-indigo-950/20 border border-indigo-500/20 hover:bg-indigo-900/30 cursor-pointer group transition-all"
                  >
                      <div className="flex justify-between items-start mb-2">
                          <h4 className="font-bold text-indigo-100 line-clamp-1">{dream.title}</h4>
                          <span className="text-xs text-indigo-400 font-sans">{new Date(dream.date).toLocaleDateString()}</span>
                      </div>
                      <p className="text-sm text-indigo-200/60 line-clamp-2 mb-3 font-sans leading-relaxed">{dream.content}</p>
                      <div className="flex gap-2">
                          {dream.themes.map(t => (
                              <span key={t} className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 uppercase tracking-wider">
                                  {t}
                              </span>
                          ))}
                      </div>
                  </motion.div>
              ))}
          </div>

      </div>

      {/* Logging Modal */}
      <AnimatePresence>
          {isLogging && (
              <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xl flex items-center justify-center p-4">
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="w-full max-w-lg bg-indigo-950/30 border border-indigo-500/30 rounded-3xl p-6 shadow-2xl relative overflow-hidden"
                  >
                      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-indigo-500 to-transparent" />
                      
                      <h3 className="text-xl font-bold text-indigo-100 mb-4 flex items-center gap-2">
                          <Star size={20} className="text-indigo-400 fill-indigo-400" /> New Entry
                      </h3>
                      
                      <textarea 
                        value={newDreamText}
                        onChange={(e) => setNewDreamText(e.target.value)}
                        placeholder="I was floating above a neon city..."
                        className="w-full h-48 bg-black/50 border border-indigo-500/30 rounded-xl p-4 text-indigo-100 placeholder-indigo-500/50 focus:border-indigo-400 focus:outline-none resize-none font-sans text-base leading-relaxed"
                        autoFocus
                      />

                      <div className="flex gap-3 mt-6">
                          <button 
                             onClick={() => setIsLogging(false)}
                             className="flex-1 py-3 text-indigo-400 hover:text-white transition-colors font-sans text-sm"
                          >
                              Discard
                          </button>
                          <button 
                             onClick={handleAnalyze}
                             disabled={isAnalyzing || !newDreamText}
                             className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition-all shadow-[0_0_20px_rgba(79,70,229,0.3)] flex items-center justify-center gap-2"
                          >
                              {isAnalyzing ? <Sparkles size={18} className="animate-spin" /> : <Eye size={18} />}
                              {isAnalyzing ? "Eve is Seeing..." : "Interpret"}
                          </button>
                      </div>
                  </motion.div>
              </div>
          )}
      </AnimatePresence>

      {/* Detail Modal */}
      <AnimatePresence>
          {selectedDream && (
              <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl overflow-y-auto" onClick={() => setSelectedDream(null)}>
                  <div className="min-h-full flex items-center justify-center p-4">
                    <motion.div 
                        layoutId={selectedDream.id}
                        className="w-full max-w-2xl bg-zinc-900 border border-indigo-500/30 rounded-3xl overflow-hidden shadow-2xl relative"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button onClick={() => setSelectedDream(null)} className="absolute top-4 right-4 p-2 bg-black/50 rounded-full text-indigo-300 hover:text-white">
                            <ArrowLeft size={20} />
                        </button>

                        <div className="p-8 md:p-12">
                            <div className="flex gap-2 mb-6 flex-wrap">
                                {selectedDream.themes.map(t => (
                                    <span key={t} className="text-xs px-3 py-1 bg-indigo-500/20 text-indigo-200 border border-indigo-500/40 rounded-full uppercase tracking-widest font-bold shadow-[0_0_10px_rgba(99,102,241,0.2)]">
                                        {t}
                                    </span>
                                ))}
                            </div>

                            <h2 className="text-2xl md:text-3xl font-bold text-white mb-6 font-serif italic">"{selectedDream.title}"</h2>
                            
                            <div className="prose prose-invert prose-indigo max-w-none mb-8">
                                <p className="text-lg text-indigo-100/80 leading-relaxed font-light">{selectedDream.content}</p>
                            </div>

                            <div className="p-6 bg-indigo-950/30 border border-indigo-500/20 rounded-2xl relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500" />
                                <h3 className="text-sm font-bold text-indigo-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                                    <Sparkles size={14} /> Eve's Interpretation
                                </h3>
                                <p className="text-indigo-200 italic leading-relaxed">
                                    {selectedDream.interpretation || "The symbols are cloudy..."}
                                </p>
                            </div>
                            
                            <div className="mt-8 text-xs text-indigo-500/50 text-center font-sans">
                                Recorded on {new Date(selectedDream.date).toLocaleString()}
                            </div>
                        </div>
                    </motion.div>
                  </div>
              </div>
          )}
      </AnimatePresence>
    </div>
  );
};