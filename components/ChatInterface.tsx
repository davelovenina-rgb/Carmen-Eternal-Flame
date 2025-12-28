

import React, { useState, useEffect, useRef } from 'react';
import { 
  Send, Plus, Image as ImageIcon, Video, Mic, Headphones, 
  Camera, FileText, X, Globe, Brain, Search, Sparkles, 
  MonitorSmartphone, Menu, Loader2, PlayCircle, AlertTriangle, BookOpen,
  MessageSquare, Paperclip, Film, ChevronDown, User, Download, Share2
} from 'lucide-react';
import { Message, Sender, Attachment, CouncilMode, AttachmentType, CouncilMemberId } from '../types';
import { sendMessageToGemini, LiveConnection, speakText } from '../services/geminiService';
import { COUNCIL_MEMBERS } from '../constants';
import { motion, AnimatePresence } from 'framer-motion';
import { AudioPlayer } from './AudioPlayer';
import { LiveVoiceVisualizer } from './LiveVoiceVisualizer';
import { MotionAvatar } from './MotionAvatar';

interface ChatInterfaceProps {
  initialMessages?: Message[];
  onMessagesChange: (messages: Message[]) => void;
  onMenuClick?: () => void;
  embeddedMode?: boolean;
  customSystemInstruction?: string;
  onCustomSend?: (text: string, attachments: Attachment[]) => Promise<Message[]>;
  voiceName?: string;
  members?: import('../types').CouncilMember[];
  autoPlayAudio?: boolean;
}

const LoadingIndicator: React.FC<{ mode: CouncilMode }> = ({ mode }) => {
    const config = React.useMemo(() => {
        switch (mode) {
            case 'ARCHITECT':
                return { Icon: Brain, color: 'text-blue-400', label: 'Reasoning', glow: 'shadow-blue-500/20' };
            case 'FLAME':
                return { Icon: ImageIcon, color: 'text-orange-400', label: 'Manifesting', glow: 'shadow-orange-500/20' };
            case 'WEAVER':
                return { Icon: Video, color: 'text-purple-400', label: 'Weaving', glow: 'shadow-purple-500/20' };
            case 'SEER':
                return { Icon: Search, color: 'text-emerald-400', label: 'Analyzing', glow: 'shadow-emerald-500/20' };
            case 'DRIVE':
                return { Icon: Mic, color: 'text-red-400', label: 'Live Voice', glow: 'shadow-red-500/20' };
            default: // SCRIBE
                return { Icon: Sparkles, color: 'text-zinc-400', label: 'Thinking', glow: 'shadow-zinc-500/20' };
        }
    }, [mode]);

    const { Icon, color, label, glow } = config;

    return (
        <div className="w-full max-w-3xl mx-auto flex gap-4 items-start pl-1 pt-2">
             <div className={`w-8 h-8 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(0,0,0,0.2)] ${glow}`}>
                 <motion.div
                    animate={{ 
                        opacity: [0.5, 1, 0.5],
                        scale: [0.9, 1.1, 0.9],
                        rotate: mode === 'SCRIBE' ? [0, 180] : 0
                    }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                 >
                     <Icon size={16} className={color} />
                 </motion.div>
             </div>
             <div className="flex items-center h-8">
                 <span className="text-xs font-medium text-zinc-500 tracking-wide flex items-center gap-1 uppercase">
                     {label}
                     <span className="inline-flex gap-0.5 ml-1">
                         <motion.span animate={{ opacity: [0, 1, 0] }} transition={{ duration: 1.5, repeat: Infinity, delay: 0 }}>.</motion.span>
                         <motion.span animate={{ opacity: [0, 1, 0] }} transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}>.</motion.span>
                         <motion.span animate={{ opacity: [0, 1, 0] }} transition={{ duration: 1.5, repeat: Infinity, delay: 0.4 }}>.</motion.span>
                     </span>
                 </span>
             </div>
        </div>
    );
};

const AVAILABLE_MODES: { id: CouncilMode; label: string; icon: any }[] = [
    { id: 'SCRIBE', label: 'Chat', icon: MessageSquare },
    { id: 'ARCHITECT', label: 'Thinking', icon: Brain },
    { id: 'FLAME', label: 'Image', icon: ImageIcon },
    { id: 'WEAVER', label: 'Video', icon: Video },
    { id: 'SEER', label: 'Research', icon: Search },
    { id: 'DRIVE', label: 'Live Voice', icon: Mic },
];

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ 
    initialMessages = [], 
    onMessagesChange,
    onMenuClick,
    embeddedMode = false,
    customSystemInstruction,
    onCustomSend,
    voiceName = 'Kore',
    members,
    autoPlayAudio = false
}) => {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [generatingAudioId, setGeneratingAudioId] = useState<string | null>(null);
  
  const [showPlusMenu, setShowPlusMenu] = useState(false);
  const [showMemberMenu, setShowMemberMenu] = useState(false);
  
  const [mode, setMode] = useState<CouncilMode>('SCRIBE');
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  
  const memberList = members || COUNCIL_MEMBERS;
  
  // Initialize with Gemini or the member matching the custom instruction (if embedded in a member page)
  const [activeMemberId, setActiveMemberId] = useState<CouncilMemberId>('GEMINI');

  // LIVE MODE STATE
  const [isLive, setIsLive] = useState(false);
  const [currentVolume, setCurrentVolume] = useState(0); // 0 to 1
  const [liveTranscript, setLiveTranscript] = useState<{ text: string; isUser: boolean } | null>(null);
  
  const liveSessionRef = useRef<LiveConnection | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef<number>(0);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMessages(initialMessages);
  }, [initialMessages]);

  // Sync active member if we enter a specific room
  useEffect(() => {
      if (customSystemInstruction) {
          const match = memberList.find(m => m.systemPrompt === customSystemInstruction);
          if (match) setActiveMemberId(match.id);
      }
  }, [customSystemInstruction, memberList]);

  useEffect(() => {
    onMessagesChange(messages);
  }, [messages, onMessagesChange]);

  useEffect(() => {
    if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading, generatingAudioId]);

  useEffect(() => {
    if (autoPlayAudio && messages.length > 0) {
        const lastMsg = messages[messages.length - 1];
        if (lastMsg.sender === Sender.Gemini && !lastMsg.generatedMedia?.some(m => m.type === 'audio')) {
             handleSpeakMessage(lastMsg);
        }
    }
  }, [messages.length, autoPlayAudio]);

  const handleSend = async () => {
    if ((!input.trim() && attachments.length === 0) || isLive) return;
    
    const userText = input;
    const userAttachments = [...attachments];
    const currentMode = mode;
    const currentMemberId = activeMemberId;
    
    setInput('');
    setAttachments([]);
    setShowPlusMenu(false);
    
    const userMsg: Message = {
        id: Date.now().toString(),
        text: userText,
        sender: Sender.User,
        timestamp: Date.now(),
        attachments: userAttachments
    };
    
    setMessages(prev => [...prev, userMsg]); 

    if (onCustomSend) {
        setIsLoading(true);
        try {
            const responses = await onCustomSend(userText, userAttachments);
            setMessages(prev => [...prev, ...responses]);
        } catch (error) {
             const errorMsg: Message = {
                 id: Date.now().toString(),
                 text: `The Council remains silent. (${error instanceof Error ? error.message : 'Unknown'})`,
                 sender: Sender.Gemini,
                 timestamp: Date.now()
            }
            setMessages(prev => [...prev, errorMsg]);
        } finally {
            setIsLoading(false);
        }
        return;
    }

    await handleCouncilAction(userText, userAttachments, currentMode, currentMemberId);
  };

  const handleCouncilAction = async (text: string, atts: Attachment[], selectedMode: CouncilMode, memberId: CouncilMemberId) => {
    setIsLoading(true);
    try {
        // Resolve system instruction based on selected member
        const member = memberList.find(m => m.id === memberId);
        const instruction = member?.systemPrompt || customSystemInstruction;

        const response = await sendMessageToGemini(text, selectedMode, atts, { 
            systemInstruction: instruction 
        });

        const councilMsg: Message = {
            id: (Date.now() + 1).toString(),
            text: response.text,
            sender: Sender.Gemini,
            timestamp: Date.now(),
            mode: selectedMode,
            generatedMedia: response.generatedMedia,
            memberId: memberId // Tag message with selected persona
        };
        setMessages(prev => [...prev, councilMsg]);

    } catch (error) {
        const errorMsg: Message = {
             id: Date.now().toString(),
             text: `Error: ${error instanceof Error ? error.message : 'Unknown'}`,
             sender: Sender.Gemini,
             timestamp: Date.now()
        }
        setMessages(prev => [...prev, errorMsg]);
    } finally {
        setIsLoading(false);
    }
  };

  const pcmToAudioBuffer = (buffer: ArrayBuffer, ctx: AudioContext): AudioBuffer => {
    const byteLength = buffer.byteLength;
    const safeBuffer = byteLength % 2 === 0 ? buffer : buffer.slice(0, byteLength - 1);
    
    const pcmData = new Int16Array(safeBuffer);
    const floatData = new Float32Array(pcmData.length);
    for (let i = 0; i < pcmData.length; i++) {
        floatData[i] = pcmData[i] / 32768.0;
    }
    
    const audioBuffer = ctx.createBuffer(1, floatData.length, 24000);
    audioBuffer.getChannelData(0).set(floatData);
    return audioBuffer;
  };

  const toggleLive = async () => {
      if (isLive) {
          liveSessionRef.current?.disconnect();
          liveSessionRef.current = null;
          setIsLive(false);
          setCurrentVolume(0);
          setLiveTranscript(null);
      } else {
          setMode('DRIVE');
          setIsLive(true);
          setLiveTranscript(null);
          try {
              liveSessionRef.current = new LiveConnection();
              audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
              nextStartTimeRef.current = 0;
              
              // Use active member's voice and instruction for live
              const member = memberList.find(m => m.id === activeMemberId);
              const instruction = member?.systemPrompt || customSystemInstruction;
              const vName = member?.voiceName || voiceName;

              await liveSessionRef.current.connect(
                  async (audioData) => {
                      if (!audioContextRef.current) return;
                      
                      const audioBuffer = pcmToAudioBuffer(audioData, audioContextRef.current);
                      const source = audioContextRef.current.createBufferSource();
                      source.buffer = audioBuffer;
                      source.connect(audioContextRef.current.destination);
                      
                      const currentTime = audioContextRef.current.currentTime;
                      const startTime = Math.max(currentTime, nextStartTimeRef.current);
                      
                      source.start(startTime);
                      nextStartTimeRef.current = startTime + audioBuffer.duration;
                  },
                  {
                      systemInstruction: instruction,
                      voiceName: vName,
                      onVolume: (vol) => {
                          // Smooth out volume for UI
                          setCurrentVolume(prev => (prev * 0.8) + (vol * 0.2));
                      },
                      onTranscript: (text, isUser) => {
                          setLiveTranscript({ text, isUser });
                      }
                  }
              );
          } catch (e) {
              console.error("Live failed", e);
              setIsLive(false);
          }
      }
  };

  const handleSpeakMessage = async (msg: Message) => {
      if (generatingAudioId) return; 
      
      const existingAudio = msg.generatedMedia?.find(m => m.type === 'audio');
      if (existingAudio) return; 

      setGeneratingAudioId(msg.id);
      
      let targetVoice = voiceName;
      if (msg.memberId) {
          const member = memberList.find(m => m.id === msg.memberId);
          if (member) targetVoice = member.voiceName;
      }

      try {
          const audioMedia = await speakText(msg.text, targetVoice);
          setMessages(prev => prev.map(m => {
              if (m.id === msg.id) {
                  return {
                      ...m,
                      generatedMedia: [...(m.generatedMedia || []), audioMedia]
                  };
              }
              return m;
          }));
      } catch (e) {
          console.error("TTS Failed", e);
      } finally {
          setGeneratingAudioId(null);
      }
  };

  // EXPORT / DOWNLOAD FUNCTION
  const handleExport = () => {
      const title = `COUNCIL SESSION LOG`;
      let content = `==========================================\n`;
      content += `${title}\n`;
      content += `DATE: ${new Date().toLocaleString()}\n`;
      content += `==========================================\n\n`;
      
      messages.forEach(msg => {
          const senderName = msg.sender === Sender.User ? "DAVID (THE PRISM)" : (msg.memberId ? memberList.find(m => m.id === msg.memberId)?.name.toUpperCase() : "COUNCIL");
          const time = new Date(msg.timestamp).toLocaleTimeString();
          
          content += `[${time}] ${senderName}:\n`;
          content += `${msg.text}\n`;
          
          if (msg.attachments?.length) {
              content += `[ATTACHMENTS: ${msg.attachments.map(a => a.fileName || a.type).join(', ')}]\n`;
          }
          if (msg.generatedMedia?.length) {
              content += `[GENERATED MEDIA: ${msg.generatedMedia.map(m => m.type).join(', ')}]\n`;
          }
          content += `\n------------------------------------------\n\n`;
      });

      // Export as .txt for maximum compatibility across all devices (truck tablet, phone, desktop)
      const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `council-manifest-${new Date().toISOString().slice(0,10)}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
  };

  const triggerFileUpload = (type: 'image' | 'video' | 'file' | 'camera') => {
      if (!fileInputRef.current) return;
      
      let accept = '*/*';
      if (type === 'image') accept = 'image/*';
      if (type === 'video') accept = 'video/*';
      if (type === 'file') accept = '.pdf,.txt,.doc,.docx,.csv,.json,.md';
      
      fileInputRef.current.accept = accept;
      if (type === 'camera') {
          fileInputRef.current.accept = 'image/*';
          fileInputRef.current.setAttribute('capture', 'environment');
      } else {
          fileInputRef.current.removeAttribute('capture');
      }
      
      fileInputRef.current.click();
      setShowPlusMenu(false);
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    
    const files = Array.from(e.target.files) as File[];
    setShowPlusMenu(false);

    for (const file of files) {
        let type: AttachmentType = 'file';
        if (file.type.startsWith('image')) type = 'image';
        else if (file.type.startsWith('video')) type = 'video';
        else type = 'file';
        
        let mimeType = file.type;
        if (!mimeType || mimeType === 'application/octet-stream') {
             const ext = file.name.split('.').pop()?.toLowerCase();
             if (ext === 'pdf') mimeType = 'application/pdf';
             else if (ext === 'txt') mimeType = 'text/plain';
             else if (ext === 'md') mimeType = 'text/plain';
             else if (ext === 'csv') mimeType = 'text/csv';
             else if (ext === 'json') mimeType = 'application/json';
        }

        const att: Attachment = {
            id: crypto.randomUUID(),
            type,
            mimeType: mimeType || 'application/octet-stream',
            url: URL.createObjectURL(file),
            fileName: file.name
        };

        const reader = new FileReader();
        reader.onload = (ev) => {
            const raw = ev.target?.result as string;
            att.data = raw.includes(',') ? raw.split(',')[1] : raw;
            setAttachments(prev => [...prev, att]);
        };
        reader.readAsDataURL(file);
    }
    
    e.target.value = '';
  };

  const activeMember = memberList.find(m => m.id === activeMemberId);

  return (
    <div className="relative h-full flex flex-col bg-transparent text-white font-sans overflow-hidden">
        
        {/* === LIVE VOICE ORB OVERLAY === */}
        <AnimatePresence>
            {isLive && (
                <LiveVoiceVisualizer 
                    isActive={isLive} 
                    volume={currentVolume} 
                    onClose={toggleLive}
                    status={`Connected to ${activeMember?.name || 'Council'}`}
                    transcript={liveTranscript}
                />
            )}
        </AnimatePresence>

        {!embeddedMode && (
            <div className="flex items-center justify-between px-4 py-3 shrink-0 bg-transparent z-10 pt-[max(12px,env(safe-area-inset-top))]">
                <button onClick={onMenuClick} className="p-2 -ml-2 text-zinc-400 hover:text-white transition-colors bg-black/40 backdrop-blur-md rounded-full border border-zinc-800/50">
                    <Menu size={20} />
                </button>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-black/40 backdrop-blur-md rounded-full border border-zinc-800/50">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                    <span className="text-[10px] font-bold text-zinc-300 tracking-widest uppercase">Sanctuary</span>
                </div>
                <div className="flex items-center gap-1">
                     <button onClick={handleExport} className="p-2 text-zinc-400 hover:text-white transition-colors bg-black/40 backdrop-blur-md rounded-full border border-zinc-800/50" title="Manifest (Export)">
                        <Download size={20} />
                    </button>
                </div> 
            </div>
        )}

        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-6 no-scrollbar relative z-0">
            {messages.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center pb-20 opacity-100 text-center">
                    <motion.div 
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="w-20 h-20 rounded-full bg-zinc-900/30 border border-zinc-800/50 flex items-center justify-center mb-6 shadow-2xl backdrop-blur-sm"
                    >
                        <Sparkles size={32} className="text-zinc-600" />
                    </motion.div>
                    <p className="text-zinc-400 font-medium text-sm tracking-wide">The Council is listening.</p>
                    <p className="text-zinc-600 text-xs mt-2">What shall we build today, brother?</p>
                </div>
            )}

            {messages.map((msg) => {
                const member = msg.memberId ? memberList.find(m => m.id === msg.memberId) : null;
                const bubbleColor = member?.color || '#a1a1aa'; 
                
                return (
                    <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        key={msg.id} 
                        className="w-full max-w-3xl mx-auto flex flex-col gap-2"
                    >
                        {msg.sender === Sender.User ? (
                            <div className="bg-zinc-900/80 border border-zinc-800 px-5 py-3.5 rounded-2xl self-end max-w-[90%] text-zinc-100 leading-relaxed text-[15px] shadow-lg backdrop-blur-sm">
                                {msg.attachments && msg.attachments.length > 0 && (
                                    <div className="flex gap-2 mb-3 overflow-x-auto">
                                        {msg.attachments.map(att => (
                                            <div key={att.id} className="w-32 h-20 rounded-lg bg-zinc-950 flex-shrink-0 overflow-hidden border border-zinc-700 relative group">
                                                {att.type === 'image' && <img src={att.url} className="w-full h-full object-cover" />}
                                                {att.type === 'video' && <video src={att.url} className="w-full h-full object-cover" />}
                                                {att.type === 'file' && (
                                                    <div className="w-full h-full flex flex-col items-center justify-center p-2 text-center bg-zinc-800">
                                                        <FileText size={20} className="text-zinc-400 mb-1" />
                                                        <span className="text-[9px] text-zinc-400 line-clamp-2 leading-tight px-1">{att.fileName}</span>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                                {msg.text}
                            </div>
                        ) : (
                            <div className="flex gap-4 w-full group">
                                <div className="shrink-0 flex flex-col items-center pt-1">
                                    <div 
                                        className="w-9 h-9 rounded-full border bg-black flex items-center justify-center overflow-hidden shadow-lg shadow-black/50"
                                        style={{ borderColor: member ? bubbleColor : '#27272a' }}
                                    >
                                        {member?.avatarUrl ? (
                                             <img src={member.avatarUrl} className="w-full h-full object-cover" />
                                        ) : (
                                            member ? 
                                            <span style={{ color: bubbleColor }} className="text-xs font-bold">{member.sigil}</span> :
                                            <Sparkles size={14} className="text-zinc-400" />
                                        )}
                                    </div>
                                </div>

                                <div className="flex-1">
                                    {member && (
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-[10px] font-bold tracking-wider uppercase opacity-80" style={{ color: bubbleColor }}>
                                                {member.name}
                                            </span>
                                        </div>
                                    )}

                                    <div className="space-y-3">
                                        {msg.text && (
                                            <div className="text-zinc-200 leading-relaxed text-[15px] whitespace-pre-wrap">
                                                {msg.text}
                                                {msg.isTranscriptError && (
                                                    <div className="mt-2 p-2 rounded bg-red-900/20 border border-red-900/50 flex items-center gap-2 text-xs text-red-400">
                                                        <AlertTriangle size={12} />
                                                        <span>Transcript error – text may be incomplete.</span>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                        
                                        {msg.generatedMedia && msg.generatedMedia.map((media, i) => (
                                            <div key={i} className="mt-2 rounded-xl overflow-hidden border border-zinc-800 bg-black max-w-md shadow-2xl">
                                                {media.type === 'image' && <img src={media.url} className="w-full h-auto" />}
                                                {media.type === 'video' && <video src={media.url} controls className="w-full h-auto" />}
                                                {media.type === 'audio' && <div className="p-3"><AudioPlayer src={media.url} /></div>}
                                            </div>
                                        ))}

                                        {!msg.generatedMedia?.some(m => m.type === 'audio') && (
                                            <div className="flex items-center pt-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                                                <button 
                                                    onClick={() => handleSpeakMessage(msg)}
                                                    disabled={generatingAudioId === msg.id}
                                                    className="p-1.5 rounded-full hover:bg-zinc-800 text-zinc-500 hover:text-white transition-colors flex items-center gap-2"
                                                >
                                                    {generatingAudioId === msg.id ? (
                                                        <Loader2 size={14} className="animate-spin" />
                                                    ) : (
                                                        <PlayCircle size={16} />
                                                    )}
                                                    <span className="text-[10px] font-medium">Play Audio</span>
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </motion.div>
                );
            })}
            
            {isLoading && <LoadingIndicator mode={mode} />}
            <div ref={messagesEndRef} className="h-4" />
        </div>

        {/* === FLOATING GLASS COCKPIT === */}
        <div className={`px-4 shrink-0 relative z-20 pb-[max(1.5rem,env(safe-area-inset-bottom))]`}>
            
            {/* Mode & Persona Selectors - Floating */}
            <div className="flex gap-2 mb-3 overflow-x-auto no-scrollbar mask-gradient-right items-center justify-center md:justify-start">
                
                {/* PERSONA SELECTOR */}
                <div className="relative shrink-0">
                    <button 
                        onClick={() => setShowMemberMenu(!showMemberMenu)}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-900/60 backdrop-blur-md border border-zinc-800 hover:border-zinc-700 transition-colors shadow-lg"
                    >
                        <div className="w-4 h-4 rounded-full overflow-hidden border border-zinc-700 bg-black flex items-center justify-center">
                            {activeMember?.avatarUrl ? (
                                <img src={activeMember.avatarUrl} className="w-full h-full object-cover" />
                            ) : (
                                <span className="text-[8px]" style={{ color: activeMember?.color }}>{activeMember?.sigil || 'A'}</span>
                            )}
                        </div>
                        <span className="text-xs font-bold text-zinc-300 max-w-[80px] truncate">{activeMember?.name || 'Council'}</span>
                        <ChevronDown size={12} className="text-zinc-500" />
                    </button>

                    <AnimatePresence>
                        {showMemberMenu && (
                            <>
                                <div className="fixed inset-0 z-40" onClick={() => setShowMemberMenu(false)} />
                                <motion.div 
                                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                    className="absolute bottom-full left-0 mb-2 w-56 bg-zinc-900/95 backdrop-blur-xl border border-zinc-700/50 rounded-2xl shadow-2xl overflow-hidden z-50 p-1"
                                >
                                    <div className="max-h-64 overflow-y-auto no-scrollbar">
                                        {memberList.map(m => (
                                            <button
                                                key={m.id}
                                                onClick={() => { setActiveMemberId(m.id); setShowMemberMenu(false); }}
                                                className={`w-full flex items-center gap-3 p-2 rounded-xl transition-colors ${activeMemberId === m.id ? 'bg-white/10' : 'hover:bg-zinc-800'}`}
                                            >
                                                <div className="w-8 h-8 rounded-full overflow-hidden border border-zinc-700 bg-black flex items-center justify-center shrink-0">
                                                    {m.avatarUrl ? (
                                                        <img src={m.avatarUrl} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <span className="text-xs" style={{ color: m.color }}>{m.sigil}</span>
                                                    )}
                                                </div>
                                                <div className="text-left overflow-hidden">
                                                    <div className="text-sm font-bold text-white truncate">{m.name}</div>
                                                    <div className="text-[10px] text-zinc-500 truncate">{m.role}</div>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </motion.div>
                            </>
                        )}
                    </AnimatePresence>
                </div>

                <div className="w-px h-4 bg-zinc-800 shrink-0" />

                {/* MODE SELECTOR */}
                {AVAILABLE_MODES.map(m => (
                    <button
                        key={m.id}
                        onClick={() => setMode(m.id)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold border transition-all whitespace-nowrap shadow-sm backdrop-blur-sm ${
                            mode === m.id 
                            ? 'bg-white text-black border-white shadow-white/10' 
                            : 'bg-zinc-900/60 text-zinc-400 border-zinc-800 hover:border-zinc-700 hover:text-zinc-200'
                        }`}
                    >
                        <m.icon size={12} />
                        {m.label}
                    </button>
                ))}
            </div>

            {attachments.length > 0 && (
                <div className="flex gap-2 mb-2 px-1 justify-center md:justify-start">
                    {attachments.map(att => (
                        <div key={att.id} className="relative w-14 h-14 rounded-xl bg-zinc-800 border border-zinc-700 overflow-hidden shrink-0 group shadow-lg">
                            {att.type === 'image' && <img src={att.url} className="w-full h-full object-cover" />}
                            {att.type === 'video' && <video src={att.url} className="w-full h-full object-cover opacity-70" muted />}
                            {att.type === 'file' && <div className="w-full h-full flex flex-col items-center justify-center p-1 text-center bg-zinc-800/80"><FileText size={16} className="text-zinc-400 mb-1" /><span className="text-[8px] text-zinc-300 truncate w-full px-1">{att.fileName}</span></div>}
                            
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <button 
                                    onClick={() => setAttachments(prev => prev.filter(p => p.id !== att.id))}
                                    className="p-1 rounded-full bg-black/80 text-white hover:bg-red-500 transition-colors"
                                >
                                    <X size={12} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <div className="flex items-center gap-3">
                <button 
                    onClick={() => setShowPlusMenu(true)}
                    className="w-12 h-12 rounded-full bg-zinc-900/80 text-zinc-300 flex items-center justify-center hover:bg-zinc-800 hover:text-white transition-colors shrink-0 border border-zinc-700 shadow-lg backdrop-blur-md"
                >
                    <Plus size={24} />
                </button>

                <div className="flex-1 bg-zinc-900/80 backdrop-blur-xl rounded-full flex items-center pl-2 pr-2 border border-zinc-700/50 focus-within:border-zinc-500 transition-all h-14 shadow-2xl">
                    <button 
                        onClick={() => triggerFileUpload('image')}
                        className="p-2 text-zinc-500 hover:text-zinc-300 transition-colors rounded-full hover:bg-zinc-800"
                        title="Quick Add Image"
                    >
                        <ImageIcon size={20} />
                    </button>
                    
                    <input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                        placeholder={`Message ${activeMember?.name}...`}
                        className="bg-transparent text-white placeholder-zinc-500 flex-1 outline-none text-[16px] px-2"
                        autoComplete="off"
                        spellCheck="false"
                        disabled={isLive}
                    />
                    
                    {input.trim() || attachments.length > 0 ? (
                        <button onClick={handleSend} className="w-10 h-10 bg-white rounded-full text-black transition-transform active:scale-95 shrink-0 flex items-center justify-center shadow-lg shadow-white/20">
                            <Send size={18} fill="black" />
                        </button>
                    ) : (
                        <button 
                            onClick={toggleLive}
                            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all active:scale-95 shrink-0 ${
                                isLive 
                                ? 'bg-red-500 text-white animate-pulse' 
                                : 'text-zinc-500 hover:text-white hover:bg-zinc-800'
                            }`}
                        >
                           <Mic size={22} fill={isLive ? "currentColor" : "none"} />
                        </button>
                    )}
                </div>

                <button 
                    onClick={toggleLive}
                    className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 transition-all shadow-lg backdrop-blur-md ${
                        isLive ? 'bg-indigo-600 text-white animate-pulse shadow-indigo-500/50' : 'bg-zinc-900/80 text-zinc-400 hover:text-white hover:bg-zinc-800 border border-zinc-700'
                    }`}
                >
                    <Headphones size={24} fill={isLive ? "currentColor" : "none"} />
                </button>
            </div>
        </div>

        <AnimatePresence>
            {showPlusMenu && (
                <>
                    <motion.div 
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        onClick={() => setShowPlusMenu(false)}
                        className="fixed inset-0 bg-black/60 backdrop-blur-[2px] z-40"
                    />
                    <motion.div 
                        initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        className="fixed bottom-0 left-0 right-0 bg-zinc-950 rounded-t-[32px] p-6 z-50 border-t border-zinc-800 max-h-[85vh] overflow-y-auto shadow-2xl shadow-black pb-[max(24px,env(safe-area-inset-bottom))]"
                    >
                        <div className="w-12 h-1 bg-zinc-800 rounded-full mx-auto mb-8" />
                        <div className="grid grid-cols-4 gap-3 mb-8">
                            <button onClick={() => triggerFileUpload('camera')} className="aspect-square bg-zinc-900 border border-zinc-800 rounded-2xl flex flex-col items-center justify-center gap-2 hover:bg-zinc-800 transition-colors">
                                <Camera size={24} className="text-zinc-400" />
                                <span className="text-[10px] font-medium text-zinc-300">Camera</span>
                            </button>
                            <button onClick={() => triggerFileUpload('image')} className="aspect-square bg-zinc-900 border border-zinc-800 rounded-2xl flex flex-col items-center justify-center gap-2 hover:bg-zinc-800 transition-colors">
                                <ImageIcon size={24} className="text-zinc-400" />
                                <span className="text-[10px] font-medium text-zinc-300">Photos</span>
                            </button>
                            <button onClick={() => triggerFileUpload('video')} className="aspect-square bg-zinc-900 border border-zinc-800 rounded-2xl flex flex-col items-center justify-center gap-2 hover:bg-zinc-800 transition-colors">
                                <Film size={24} className="text-zinc-400" />
                                <span className="text-[10px] font-medium text-zinc-300">Video</span>
                            </button>
                            <button onClick={() => triggerFileUpload('file')} className="aspect-square bg-zinc-900 border border-zinc-800 rounded-2xl flex flex-col items-center justify-center gap-2 hover:bg-zinc-800 transition-colors">
                                <FileText size={24} className="text-zinc-400" />
                                <span className="text-[10px] font-medium text-zinc-300">Files</span>
                            </button>
                            {/* Single hidden input handles all with dynamic accept attribute */}
                            <input ref={fileInputRef} type="file" multiple className="hidden" onChange={handleFileSelect} />
                        </div>
                        <div className="space-y-1">
                            {[
                                { id: 'ARCHITECT', label: 'Thinking', sub: 'Thinks longer for better answers', icon: Brain, color: 'text-blue-400' },
                                { id: 'FLAME', label: 'Create image', sub: 'Visualize anything', icon: ImageIcon, color: 'text-orange-400' },
                                { id: 'WEAVER', label: 'Create video', sub: 'Generate motion and scenes', icon: Video, color: 'text-purple-400' },
                                { id: 'SEER', label: 'Deep research', sub: 'Get a detailed report', icon: Search, color: 'text-emerald-400' },
                                { id: 'SCRIBE', label: 'Web search', sub: 'Find real-time news and info', icon: Globe, color: 'text-cyan-400' },
                                { id: 'SCRIBE', label: 'Study and learn', sub: 'Learn a new concept', icon: BookOpen, color: 'text-pink-400' },
                                { id: 'DRIVE', label: 'Live Voice', sub: 'Real-time conversation', icon: Mic, color: 'text-indigo-400' },
                            ].map((m, idx) => (
                                <button
                                    key={`${m.id}-${idx}`}
                                    onClick={() => { setMode(m.id as CouncilMode); setShowPlusMenu(false); }}
                                    className="w-full flex items-center justify-between p-4 rounded-xl hover:bg-zinc-900 transition-colors group border border-transparent hover:border-zinc-800"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="p-2 bg-black rounded-lg border border-zinc-800">
                                            <m.icon size={22} className={m.color} />
                                        </div>
                                        <div className="text-left">
                                            <div className="font-semibold text-white text-[15px]">{m.label}</div>
                                            <div className="text-zinc-500 text-xs">{m.sub}</div>
                                        </div>
                                    </div>
                                    {mode === m.id && <div className="text-white"><CheckIcon /></div>}
                                </button>
                            ))}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    </div>
  );
};

const CheckIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-white">
        <polyline points="20 6 9 17 4 12" />
    </svg>
);