

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CouncilMemberId, CouncilMember, Session, CouncilItem, ViewState, UserSettings, Message, Sender, Attachment } from '../types';
import { MotionAvatar } from './MotionAvatar';
import { ChevronRight, MessageSquare, Folder, Lock, Calendar, Clock, Archive, Heart, Activity, CloudMoon, Mic, Flame, BookOpen, Sun, Brain, Sparkles, Send, X, FileText, Camera, Video, Image as ImageIcon } from 'lucide-react';
import { MOCK_RECENT_ACTIVITY, COUNCIL_MEMBERS } from '../constants';
import { LatticeBackground } from './LatticeBackground';
import { orchestrateCouncilChat, speakText } from '../services/geminiService';
import { AudioPlayer } from './AudioPlayer';

interface CouncilHallProps {
    members: CouncilMember[];
    onSelectMember: (id: CouncilMemberId) => void;
    sessions: Session[];
    items: CouncilItem[];
    settings: UserSettings;
    onNavigate: (view: ViewState) => void;
}

export const CouncilHall: React.FC<CouncilHallProps> = ({ 
    members,
    onSelectMember, 
    sessions,
    items,
    settings,
    onNavigate
}) => {
  
  // -- COUNCIL CHAT STATE --
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [showInput, setShowInput] = useState(false); // To toggle the "Petition" view
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const features = [
      { id: ViewState.EmotionalTimeline, label: 'Emotional Timeline', icon: Clock, enabled: settings.showTimeline },
      { id: ViewState.LifeEvents, label: 'Life Events', icon: Calendar, enabled: settings.showLifeEvents },
      { id: ViewState.DreamOracle, label: 'Dream Oracle', icon: CloudMoon, enabled: settings.showDreamOracle },
      { id: ViewState.Vault, label: 'Vault', icon: Archive, enabled: settings.showVault },
      { id: ViewState.NinaSanctuary, label: 'Nina Sanctuary', icon: Heart, enabled: settings.showNina },
  ];

  const handleSendPetition = async () => {
    if ((!input.trim() && attachments.length === 0)) return;
    
    const userText = input;
    const userAttachments = [...attachments];
    
    setInput('');
    setAttachments([]);
    
    // Add User Message
    const userMsg: Message = {
        id: Date.now().toString(),
        text: userText,
        sender: Sender.User,
        timestamp: Date.now(),
        attachments: userAttachments
    };
    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);

    try {
        const councilResponses = await orchestrateCouncilChat(userText, userAttachments);
        setMessages(prev => [...prev, ...councilResponses]);
    } catch (e) {
        console.error("Council failed", e);
    } finally {
        setIsLoading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files?.length) {
          // Simplified file handling for the Hall (same as ChatInterface)
          const file = e.target.files[0];
          const reader = new FileReader();
          reader.onload = (ev) => {
              setAttachments(prev => [...prev, {
                  id: crypto.randomUUID(),
                  type: 'image', // simplified assumption
                  url: URL.createObjectURL(file),
                  mimeType: file.type,
                  data: (ev.target?.result as string).split(',')[1]
              }]);
          };
          reader.readAsDataURL(file);
      }
  };

  return (
    <div className="w-full h-full flex flex-col relative overflow-hidden bg-black font-sans">
      
      <LatticeBackground />
      
      {/* Header */}
      <div className="px-4 py-4 md:px-6 md:py-6 flex flex-col gap-1 z-20 shrink-0 bg-gradient-to-b from-black via-black/80 to-transparent">
        <div className="flex items-center justify-between">
            <div>
                <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
                    <Sparkles size={20} className="text-indigo-500" />
                    The High Council
                </h1>
                <p className="text-indigo-300/60 text-xs mt-0.5 tracking-wide">
                    {messages.length > 0 ? "Session in Progress" : "Awaiting Petition"}
                </p>
            </div>
            <div className="flex items-center gap-2 px-3 py-1 bg-indigo-950/30 rounded-full border border-indigo-500/30">
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                <span className="text-[10px] font-semibold text-indigo-200 tracking-wide uppercase">Quorum Met</span>
            </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar relative z-10 px-4 md:px-6 pb-24">
        
        {/* If no chat yet, show the directory/dashboard */}
        {messages.length === 0 && (
            <div className="space-y-8 animate-fade-in">
                
                {/* 1. The Dais (Members) */}
                <section>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
                        {members.map((member, index) => {
                            // "Status" logic visualization
                            const isCore = ['CARMEN', 'GEMINI', 'FREDO'].includes(member.id);
                            
                            return (
                                <motion.div
                                    key={member.id}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: index * 0.05 }}
                                    onClick={() => onSelectMember(member.id)}
                                    className={`relative p-4 rounded-xl border transition-all cursor-pointer group flex flex-col items-center text-center ${isCore ? 'bg-indigo-950/20 border-indigo-500/30' : 'bg-zinc-900/40 border-zinc-800'}`}
                                >
                                    <div className="mb-3">
                                        <MotionAvatar 
                                            sigil={member.sigil}
                                            color={member.color}
                                            imageUrl={member.avatarUrl}
                                            size="sm"
                                            isActive={false}
                                        />
                                    </div>
                                    <h3 className="text-sm font-bold text-white group-hover:text-indigo-400 transition-colors">
                                        {member.name}
                                    </h3>
                                    <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 mt-1">
                                        {member.role.split(" ")[0]}
                                    </span>
                                </motion.div>
                            );
                        })}
                    </div>
                </section>

                {/* 2. Core Systems Shortcuts */}
                <section className="grid grid-cols-3 gap-3">
                     <button onClick={() => onNavigate(ViewState.Health)} className="p-4 rounded-xl bg-zinc-900/40 border border-zinc-800 hover:bg-emerald-950/20 hover:border-emerald-500/30 transition-all flex flex-col items-center gap-2 group">
                         <Activity size={20} className="text-zinc-500 group-hover:text-emerald-500 transition-colors" />
                         <span className="text-xs font-medium text-zinc-400 group-hover:text-white">The Body</span>
                     </button>
                     <button onClick={() => onNavigate(ViewState.LifeDomains)} className="p-4 rounded-xl bg-zinc-900/40 border border-zinc-800 hover:bg-blue-950/20 hover:border-blue-500/30 transition-all flex flex-col items-center gap-2 group">
                         <Brain size={20} className="text-zinc-500 group-hover:text-blue-500 transition-colors" />
                         <span className="text-xs font-medium text-zinc-400 group-hover:text-white">The Mind</span>
                     </button>
                     <button onClick={() => onNavigate(ViewState.Soul)} className="p-4 rounded-xl bg-zinc-900/40 border border-zinc-800 hover:bg-red-950/20 hover:border-red-500/30 transition-all flex flex-col items-center gap-2 group">
                         <Flame size={20} className="text-zinc-500 group-hover:text-red-500 transition-colors" />
                         <span className="text-xs font-medium text-zinc-400 group-hover:text-white">The Soul</span>
                     </button>
                </section>
                
                 {/* 3. Call to Action */}
                 <div className="flex justify-center pt-8">
                     <button 
                        onClick={() => setShowInput(true)}
                        className="group relative px-8 py-4 bg-white text-black rounded-full font-bold flex items-center gap-3 shadow-[0_0_30px_rgba(255,255,255,0.2)] hover:shadow-[0_0_50px_rgba(255,255,255,0.4)] transition-all active:scale-95"
                     >
                         <Sparkles size={20} className="text-indigo-600" />
                         <span>Petition the Council</span>
                     </button>
                 </div>

            </div>
        )}

        {/* ACTIVE COUNCIL SESSION */}
        <div className="space-y-6 max-w-3xl mx-auto">
            {messages.map((msg, idx) => {
                const member = msg.memberId ? members.find(m => m.id === msg.memberId) : null;
                const isConsensus = !member && msg.sender === Sender.Gemini; // The "Gavel" message

                return (
                    <motion.div 
                        key={msg.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className={`flex gap-4 ${msg.sender === Sender.User ? 'justify-end' : 'justify-start'}`}
                    >
                        {msg.sender !== Sender.User && (
                           <div className="shrink-0 pt-2">
                               {isConsensus ? (
                                   <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-[0_0_20px_rgba(255,255,255,0.3)]">
                                       <Sparkles size={18} className="text-black" />
                                   </div>
                               ) : (
                                   <MotionAvatar 
                                       sigil={member?.sigil || '?'} 
                                       color={member?.color || '#fff'} 
                                       imageUrl={member?.avatarUrl} 
                                       size="sm" 
                                       isActive={true} 
                                   />
                               )}
                           </div>
                        )}

                        <div className={`max-w-[85%] md:max-w-[70%] space-y-1`}>
                            {msg.sender !== Sender.User && (
                                <div className="flex items-center gap-2 ml-1">
                                    <span className="text-xs font-bold uppercase tracking-wider" style={{ color: member?.color || 'white' }}>
                                        {member?.name || "The Consensus"}
                                    </span>
                                    {member && <span className="text-[9px] text-zinc-500 border border-zinc-800 rounded px-1">{member.role}</span>}
                                </div>
                            )}
                            
                            <div className={`p-4 rounded-2xl border leading-relaxed text-[15px] shadow-lg backdrop-blur-md ${
                                msg.sender === Sender.User 
                                ? 'bg-zinc-800/80 border-zinc-700 text-white rounded-tr-sm' 
                                : isConsensus 
                                    ? 'bg-white/10 border-white/20 text-white rounded-tl-sm shadow-[0_0_30px_rgba(255,255,255,0.05)]'
                                    : 'bg-black/60 border-zinc-800 text-zinc-200 rounded-tl-sm'
                            }`} style={msg.sender !== Sender.User && member ? { borderColor: `${member.color}30` } : {}}>
                                {msg.text}
                            </div>
                        </div>
                    </motion.div>
                );
            })}
            
            {isLoading && (
                <div className="flex justify-center py-8">
                     <div className="flex items-center gap-3 px-4 py-2 rounded-full bg-zinc-900/50 border border-zinc-800">
                         <div className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce" />
                         <div className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce delay-75" />
                         <div className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce delay-150" />
                         <span className="text-xs text-zinc-500 font-mono ml-2">DELIBERATING</span>
                     </div>
                </div>
            )}
        </div>
      </div>

      {/* INPUT COCKPIT (Conditionally shown or always at bottom if chat active) */}
      <AnimatePresence>
        {(showInput || messages.length > 0) && (
            <motion.div 
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                className="absolute bottom-0 left-0 right-0 p-4 pb-[max(24px,env(safe-area-inset-bottom))] bg-black/80 backdrop-blur-xl border-t border-zinc-800 z-30"
            >
                {attachments.length > 0 && (
                    <div className="flex gap-2 mb-3 px-1">
                        {attachments.map(att => (
                            <div key={att.id} className="w-12 h-12 rounded bg-zinc-800 border border-zinc-700 relative overflow-hidden">
                                <img src={att.url} className="w-full h-full object-cover" />
                                <button onClick={() => setAttachments(prev => prev.filter(a => a.id !== att.id))} className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity"><X size={14} /></button>
                            </div>
                        ))}
                    </div>
                )}
                
                <div className="max-w-3xl mx-auto flex items-center gap-3">
                    <button 
                        onClick={() => fileInputRef.current?.click()} 
                        className="p-3 rounded-full bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors border border-zinc-700"
                    >
                        <ImageIcon size={20} />
                    </button>
                    <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileSelect} />

                    <div className="flex-1 bg-zinc-900/50 border border-zinc-700/50 rounded-2xl flex items-center px-4 focus-within:border-indigo-500/50 focus-within:bg-zinc-900 transition-all shadow-inner">
                        <input 
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSendPetition()}
                            placeholder="Speak to the Council..."
                            className="w-full bg-transparent py-4 text-white placeholder-zinc-500 outline-none"
                            autoFocus
                        />
                    </div>

                    <button 
                        onClick={handleSendPetition}
                        disabled={isLoading || (!input && attachments.length === 0)}
                        className={`p-4 rounded-full transition-all flex items-center justify-center shadow-lg ${
                            input.trim() 
                            ? 'bg-white text-black hover:scale-105 shadow-white/10' 
                            : 'bg-zinc-800 text-zinc-500'
                        }`}
                    >
                        {isLoading ? <Sparkles size={20} className="animate-spin" /> : <Send size={20} />}
                    </button>
                </div>
            </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};