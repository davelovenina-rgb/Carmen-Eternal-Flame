
import React, { useState, useRef } from 'react';
import { CouncilMember, Message, Session, CouncilItem, CouncilMemberId } from '../types';
import { ChatInterface } from './ChatInterface';
import { MotionAvatar } from './MotionAvatar';
import { ArrowLeft, Upload, Menu, Plus, MessageSquare, StickyNote, X, ChevronRight, Camera, Link } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface CouncilMemberPageProps {
  member: CouncilMember;
  members: CouncilMember[];
  onUpdateMember: (updates: Partial<CouncilMember>) => void;
  onBack: () => void;
  onMenuClick: () => void;
  sessions: Session[];
  items: CouncilItem[];
  onOpenSession: (sessionId: string) => void;
  onCreateSession: () => void;
  onCreateItem: (title: string, content: string) => void;
  activeSession: Session | null;
  onMessagesChange: (messages: Message[]) => void;
  autoPlayAudio?: boolean;
}

export const CouncilMemberPage: React.FC<CouncilMemberPageProps> = ({ 
  member, 
  members,
  onUpdateMember,
  onBack, 
  onMenuClick,
  sessions,
  items,
  onOpenSession,
  onCreateSession,
  onCreateItem,
  activeSession,
  onMessagesChange,
  autoPlayAudio
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showItemModal, setShowItemModal] = useState(false);
  const [newItemTitle, setNewItemTitle] = useState('');
  const [newItemContent, setNewItemContent] = useState('');

  // Avatar URL Edit State
  const [showAvatarUrlModal, setShowAvatarUrlModal] = useState(false);
  const [avatarUrlInput, setAvatarUrlInput] = useState('');

  const isChatActive = !!activeSession;

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      try {
          const resizedImage = await resizeImage(file, 400); 
          onUpdateMember({ avatarUrl: resizedImage });
      } catch (err) {
          console.error("Failed to process image", err);
      }
      
      // Reset input to allow selecting same file again if needed
      e.target.value = '';
  };

  const handleSaveAvatarUrl = () => {
      if (avatarUrlInput.trim()) {
          onUpdateMember({ avatarUrl: avatarUrlInput.trim() });
          setShowAvatarUrlModal(false);
          setAvatarUrlInput('');
      }
  };

  const resizeImage = (file: File, maxSize: number): Promise<string> => {
      return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (e) => {
              const img = new Image();
              img.onload = () => {
                  const canvas = document.createElement('canvas');
                  let width = img.width;
                  let height = img.height;

                  if (width > height) {
                      if (width > maxSize) {
                          height *= maxSize / width;
                          width = maxSize;
                      }
                  } else {
                      if (height > maxSize) {
                          width *= maxSize / height;
                          height = maxSize;
                      }
                  }
                  canvas.width = width;
                  canvas.height = height;
                  const ctx = canvas.getContext('2d');
                  ctx?.drawImage(img, 0, 0, width, height);
                  resolve(canvas.toDataURL(file.type));
              };
              img.onerror = reject;
              img.src = e.target?.result as string;
          };
          reader.onerror = reject;
          reader.readAsDataURL(file);
      });
  };

  const submitNewItem = () => {
      if (!newItemTitle.trim()) return;
      onCreateItem(newItemTitle, newItemContent);
      setShowItemModal(false);
      setNewItemTitle('');
      setNewItemContent('');
  };

  return (
    <div className="w-full h-full flex flex-col bg-black relative overflow-hidden">
        
        <div className="flex items-center justify-between px-4 py-3 bg-zinc-950/90 backdrop-blur border-b border-zinc-900 z-50 shrink-0">
            <div className="flex items-center gap-3">
                <button onClick={isChatActive ? () => onOpenSession('') : onBack} className="p-2 -ml-2 text-zinc-400 hover:text-white rounded-full hover:bg-zinc-900 transition-colors">
                    <ArrowLeft size={20} />
                </button>
                
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full overflow-hidden relative cursor-pointer group" onClick={() => fileInputRef.current?.click()}>
                        {member.avatarUrl ? (
                            <img src={member.avatarUrl} className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full bg-zinc-900 flex items-center justify-center text-xs border border-zinc-800" style={{ color: member.color }}>{member.sigil}</div>
                        )}
                         <div className="absolute inset-0 bg-black/40 hidden group-hover:flex items-center justify-center">
                            <Camera size={12} className="text-white" />
                        </div>
                    </div>
                    {/* Hidden File Input */}
                    <input ref={fileInputRef} type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />

                    <div>
                        <div className="text-sm font-bold text-white flex items-center gap-2">
                             {member.name}
                        </div>
                        <div className="flex items-center gap-1.5">
                             <div className="w-1 h-1 rounded-full bg-emerald-500 shadow-[0_0_5px_rgba(16,185,129,0.8)]" />
                             <span className="text-[9px] text-zinc-400 uppercase tracking-widest font-medium">Sanctuary Active</span>
                        </div>
                    </div>
                </div>
            </div>

            <button onClick={onMenuClick} className="p-2 -mr-2 text-zinc-400 hover:text-white">
                <Menu size={20} />
            </button>
        </div>

        <div className="flex-1 overflow-hidden relative flex flex-col">
            
            {isChatActive ? (
                <ChatInterface 
                    initialMessages={activeSession.messages}
                    onMessagesChange={onMessagesChange}
                    onMenuClick={onMenuClick}
                    embeddedMode={true}
                    customSystemInstruction={member.systemPrompt}
                    voiceName={member.voiceName}
                    members={members}
                    autoPlayAudio={autoPlayAudio}
                />
            ) : (
                <div className="flex-1 overflow-y-auto p-4 md:p-8 no-scrollbar">
                    <div className="max-w-4xl mx-auto">
                        <div className="mb-10 flex flex-col md:flex-row gap-6 items-center md:items-start p-6 rounded-3xl bg-zinc-900/40 border border-zinc-800/50 relative">
                             <div 
                                className="w-24 h-24 shrink-0 relative group cursor-pointer"
                                onClick={() => fileInputRef.current?.click()}
                                title="Click to upload image"
                             >
                                 <MotionAvatar sigil={member.sigil} color={member.color} imageUrl={member.avatarUrl} size="md" />
                                 <div className="absolute inset-0 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity z-20 border-2 border-dashed border-white/30">
                                    <div className="flex flex-col items-center gap-1">
                                        <Camera size={20} className="text-white" />
                                        <span className="text-[8px] uppercase tracking-widest font-bold text-white">Upload</span>
                                    </div>
                                 </div>
                                 
                                 <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setAvatarUrlInput(member.avatarUrl || '');
                                        setShowAvatarUrlModal(true);
                                    }}
                                    className="absolute -bottom-2 -right-2 p-1.5 bg-zinc-900 rounded-full border border-zinc-700 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors z-30 shadow-xl flex items-center justify-center"
                                    title="Edit URL directly"
                                >
                                    <Link size={12} />
                                </button>
                             </div>
                             <div className="text-center md:text-left">
                                 <h2 className="text-2xl font-bold text-white mb-2">Workspace: {member.name}</h2>
                                 <p className="text-zinc-400 text-sm leading-relaxed max-w-lg">
                                     {member.description}
                                 </p>
                             </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-4">
                                <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
                                    <h3 className="text-sm font-semibold text-zinc-300 uppercase tracking-wider flex items-center gap-2">
                                        <MessageSquare size={16} /> Recent Chats
                                    </h3>
                                    <button onClick={onCreateSession} className="p-1.5 bg-zinc-800 rounded-full hover:bg-white hover:text-black transition-colors">
                                        <Plus size={16} />
                                    </button>
                                </div>

                                <div className="space-y-2">
                                    {sessions.length === 0 && <p className="text-zinc-600 text-sm italic py-2">No active conversations.</p>}
                                    {sessions.map(session => (
                                        <div 
                                            key={session.id} 
                                            onClick={() => onOpenSession(session.id)}
                                            className="p-3 rounded-xl bg-zinc-900/50 border border-zinc-800 hover:border-zinc-600 cursor-pointer group transition-all"
                                        >
                                            <div className="flex justify-between items-start mb-1">
                                                <span className="font-medium text-zinc-200 text-sm line-clamp-1 group-hover:text-white">{session.title}</span>
                                                <span className="text-[10px] text-zinc-600 shrink-0">{new Date(session.lastModified).toLocaleDateString()}</span>
                                            </div>
                                            <p className="text-xs text-zinc-500 line-clamp-1">
                                                {session.messages[session.messages.length - 1]?.text || "Empty..."}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
                                    <h3 className="text-sm font-semibold text-zinc-300 uppercase tracking-wider flex items-center gap-2">
                                        <StickyNote size={16} /> Items & Projects
                                    </h3>
                                    <button onClick={() => setShowItemModal(true)} className="p-1.5 bg-zinc-800 rounded-full hover:bg-white hover:text-black transition-colors">
                                        <Plus size={16} />
                                    </button>
                                </div>

                                <div className="space-y-2">
                                    {items.length === 0 && <p className="text-zinc-600 text-sm italic py-2">No items recorded.</p>}
                                    {items.map(item => (
                                        <div key={item.id} className="p-3 rounded-xl bg-zinc-900/50 border border-zinc-800 hover:bg-zinc-900 transition-all">
                                            <div className="font-medium text-zinc-200 text-sm mb-1">{item.title}</div>
                                            {item.content && <p className="text-xs text-zinc-500 line-clamp-2">{item.content}</p>}
                                        </div>
                                    ))}
                                </div>
                            </div>

                        </div>

                    </div>
                </div>
            )}

            <AnimatePresence>
                {/* New Item Modal */}
                {showItemModal && (
                    <div className="absolute inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                        <motion.div 
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="w-full max-w-md bg-zinc-900 rounded-2xl border border-zinc-800 p-6 shadow-2xl"
                        >
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-lg font-bold text-white">Add New Item</h3>
                                <button onClick={() => setShowItemModal(false)} className="text-zinc-500 hover:text-white"><X size={20} /></button>
                            </div>
                            
                            <input 
                                className="w-full bg-black border border-zinc-800 rounded-lg p-3 text-white mb-4 focus:border-white transition-colors outline-none"
                                placeholder="Item Title (e.g., Health Plan)"
                                value={newItemTitle}
                                onChange={(e) => setNewItemTitle(e.target.value)}
                                autoFocus
                            />
                            
                            <textarea 
                                className="w-full bg-black border border-zinc-800 rounded-lg p-3 text-white mb-6 focus:border-white transition-colors outline-none h-32 resize-none"
                                placeholder="Description or notes..."
                                value={newItemContent}
                                onChange={(e) => setNewItemContent(e.target.value)}
                            />

                            <button 
                                onClick={submitNewItem}
                                className="w-full py-3 bg-white text-black font-semibold rounded-lg hover:bg-zinc-200 transition-colors"
                            >
                                Create Item
                            </button>
                        </motion.div>
                    </div>
                )}

                {/* Avatar URL Modal */}
                {showAvatarUrlModal && (
                    <div className="absolute inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                        <motion.div 
                             initial={{ scale: 0.95, opacity: 0 }}
                             animate={{ scale: 1, opacity: 1 }}
                             exit={{ scale: 0.95, opacity: 0 }}
                             className="w-full max-w-sm bg-zinc-900 rounded-2xl border border-zinc-800 p-6 shadow-2xl"
                        >
                             <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-bold text-white">Edit Avatar URL</h3>
                                <button onClick={() => setShowAvatarUrlModal(false)} className="text-zinc-500 hover:text-white"><X size={20} /></button>
                            </div>
                            
                            <div className="flex justify-center mb-6">
                                <div className="w-24 h-24 rounded-full overflow-hidden bg-black border border-zinc-800 relative shadow-inner">
                                     {avatarUrlInput ? (
                                         <img 
                                            src={avatarUrlInput} 
                                            className="w-full h-full object-cover" 
                                            onError={(e) => {
                                                e.currentTarget.style.display = 'none';
                                                e.currentTarget.parentElement?.classList.add('flex', 'items-center', 'justify-center');
                                                e.currentTarget.parentElement!.innerHTML = '<span class="text-xs text-red-500">Invalid URL</span>';
                                            }}
                                         />
                                     ) : (
                                         <div className="w-full h-full flex items-center justify-center text-zinc-600 text-xs">No Image</div>
                                     )}
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="text-xs text-zinc-500 font-medium ml-1 mb-1 block">Image URL</label>
                                    <input 
                                        className="w-full bg-black border border-zinc-800 rounded-lg p-3 text-white focus:border-white transition-colors outline-none text-sm font-mono"
                                        placeholder="https://example.com/image.png"
                                        value={avatarUrlInput}
                                        onChange={(e) => setAvatarUrlInput(e.target.value)}
                                        autoFocus
                                    />
                                </div>

                                <div className="flex gap-3">
                                    <button 
                                        onClick={() => setShowAvatarUrlModal(false)}
                                        className="flex-1 py-2.5 bg-zinc-800 text-white font-medium rounded-lg hover:bg-zinc-700 transition-colors text-sm"
                                    >
                                        Cancel
                                    </button>
                                    <button 
                                        onClick={handleSaveAvatarUrl}
                                        className="flex-1 py-2.5 bg-white text-black font-bold rounded-lg hover:bg-zinc-200 transition-colors text-sm"
                                    >
                                        Save Changes
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

        </div>
    </div>
  );
};
