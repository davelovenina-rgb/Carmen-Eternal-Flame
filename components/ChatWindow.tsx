
import React, { useState, useRef, useEffect } from 'react';
import { Conversation, Role, AppSettings, Agent, Message } from '../types';
import { generateFredoResponse } from '../services/geminiService';

interface ChatWindowProps {
  conversation: Conversation;
  agent: Agent;
  onSendMessage: (text: string, response: any) => void;
  onMessageAction: (id: string, action: 'copy' | 'delete' | 'edit', newContent?: string) => void;
  onThreadAction: (action: 'clear' | 'copy_all' | 'delete_thread') => void;
  settings: AppSettings;
  onOpenSidebar: () => void;
  onOpenActionMenu: () => void;
  onToggleLiveVoice: () => void;
  onOpenReminder: () => void;
  onOpenAgentSettings: () => void;
  onBack: () => void;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ 
  conversation, agent, onSendMessage, onMessageAction, onThreadAction, settings, onOpenSidebar, onOpenActionMenu, onToggleLiveVoice, onOpenReminder, onOpenAgentSettings, onBack 
}) => {
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [mediaFile, setMediaFile] = useState<{ data: string; mimeType: string } | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editBuffer, setEditBuffer] = useState('');
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [input]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [conversation.messages, isTyping]);

  const handleSubmit = async () => {
    if ((!input.trim() && !mediaFile) || isTyping) return;
    const userMsg = input;
    const currentMedia = mediaFile;
    
    setInput('');
    setMediaFile(null);
    setIsTyping(true);
    
    const history = conversation.messages.map(m => ({ 
      role: m.role, 
      parts: [{ text: m.content }] 
    }));

    const result = await generateFredoResponse(userMsg, history, conversation.mode, agent, settings, currentMedia || undefined);
    
    onSendMessage(userMsg, result);
    setIsTyping(false);
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setToast("Protocol Fragment Copied");
    setTimeout(() => setToast(null), 2000);
  };

  return (
    <div className="flex flex-col h-full bg-black relative w-full overflow-hidden ultra-transition">
      {toast && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[100] bg-amber-600 text-black px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-[0.4em] shadow-2xl animate-in fade-in slide-in-from-top-4 duration-500">
          {toast}
        </div>
      )}

      {/* HEADER WITH S25 ULTRA SAFE AREA */}
      <header className="px-8 pt-[calc(1.5rem+env(safe-area-inset-top))] pb-8 flex justify-between items-center bg-black/90 backdrop-blur-3xl border-b border-white/[0.05] z-50">
        <div className="flex items-center gap-6">
           <button onClick={onBack} className="p-2 text-neutral-600 hover:text-white transition-all active:scale-90">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeWidth={2.5} d="M15 19l-7-7 7-7"/></svg>
           </button>
           <div className="flex flex-col">
              <span className="text-[14px] font-black uppercase tracking-[0.4em] text-white leading-none">{agent.name}</span>
              <span className="text-[9px] text-amber-500 font-black uppercase mt-2 flex items-center gap-2 tracking-[0.3em]">
                <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse"></span>
                {conversation.mode.toUpperCase()} CHANNEL
              </span>
           </div>
        </div>
        <div className="flex items-center gap-2">
           <button onClick={onOpenSidebar} className="p-3 text-neutral-800 hover:text-white transition-all"><svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeWidth={2} d="M4 6h16M4 12h16M4 18h16"/></svg></button>
        </div>
      </header>

      {/* MESSAGE ARCHIVE */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-6 py-10 space-y-12 custom-scrollbar pb-[calc(12rem+env(safe-area-inset-bottom))]">
        {conversation.messages.map((msg) => (
          <div key={msg.id} className={`flex flex-col group ${msg.role === Role.USER ? 'items-end' : 'items-start'}`}>
            <div 
              className={`relative max-w-[88%] px-6 py-5 rounded-[2.2rem] leading-relaxed transition-all text-base ${msg.role === Role.USER ? 'bg-[#111111] text-white rounded-tr-none border border-white/10' : 'bg-[#050505] text-neutral-200 rounded-tl-none border border-white/[0.05]'}`}
            >
              {msg.mediaUrl && (
                <div className="mb-4 overflow-hidden rounded-2xl border border-white/5">
                  {msg.mediaType === 'image' ? <img src={msg.mediaUrl} className="w-full h-auto max-h-[500px] object-contain" /> : <video src={msg.mediaUrl} controls className="w-full h-auto" />}
                </div>
              )}
              
              <div className="whitespace-pre-wrap">{msg.content}</div>
              
              {msg.groundingLinks && (
                <div className="mt-6 pt-4 border-t border-white/5 flex flex-wrap gap-2">
                   {msg.groundingLinks.map((link, idx) => (
                     <a key={idx} href={link.web?.uri || link.maps?.uri} target="_blank" className="px-3 py-1.5 bg-white/[0.03] border border-white/5 rounded-full text-[9px] font-black text-amber-500 uppercase tracking-widest hover:bg-amber-500 hover:text-black transition-all">
                       {link.web?.title || "Loci Ref"}
                     </a>
                   ))}
                </div>
              )}

              <div className={`absolute -bottom-10 flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-all duration-300 ${msg.role === Role.USER ? 'right-2' : 'left-2'}`}>
                <button onClick={() => handleCopy(msg.content)} className="p-2 text-neutral-700 hover:text-white"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2" /></svg></button>
                <button onClick={() => onMessageAction(msg.id, 'delete')} className="p-2 text-neutral-700 hover:text-rose-500"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7" /></svg></button>
              </div>
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex gap-2 items-center px-6 opacity-30">
            <div className="w-2 h-2 bg-amber-500 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-amber-500 rounded-full animate-bounce delay-100"></div>
            <div className="w-2 h-2 bg-amber-500 rounded-full animate-bounce delay-200"></div>
          </div>
        )}
      </div>

      {/* INPUT AREA WITH S25 ULTRA SAFE AREA */}
      <div className="absolute bottom-0 left-0 right-0 p-6 pt-4 pb-[calc(1.5rem+env(safe-area-inset-bottom))] bg-gradient-to-t from-black via-black/95 to-transparent z-[60]">
        <div className="max-w-4xl mx-auto flex items-end gap-3 bg-[#0a0a0c] border border-white/10 p-3 rounded-[2.5rem] shadow-[0_30px_90px_rgba(0,0,0,1)] focus-within:border-amber-500/40 transition-all">
          <button onClick={onOpenActionMenu} className="w-14 h-14 flex items-center justify-center text-neutral-700 hover:text-white transition-all shrink-0"><svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6"/></svg></button>
          <textarea
            ref={textareaRef}
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if(e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit(); } }}
            placeholder="Relay frequency..."
            className="flex-1 bg-transparent border-none focus:ring-0 text-white placeholder:text-neutral-900 py-4 max-h-48 resize-none font-bold text-base tracking-tight custom-scrollbar"
          />
          <div className="flex items-center mb-1 shrink-0">
            <button onClick={onToggleLiveVoice} className="w-12 h-12 flex items-center justify-center text-neutral-800 hover:text-rose-500 transition-all"><svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeWidth={2.5} d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3zM19 10v2a7 7 0 01-14 0v-2" /></svg></button>
            <button onClick={handleSubmit} disabled={(!input.trim() && !mediaFile) || isTyping} className="w-12 h-12 bg-white text-black rounded-full flex items-center justify-center disabled:opacity-5 active:scale-95 transition-all shadow-xl"><svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24"><path d="M13 10V3L4 14h7v7l9-11h-7z"/></svg></button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatWindow;
