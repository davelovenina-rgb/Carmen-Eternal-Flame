
import React, { useState } from 'react';
import { Conversation, Folder, AppSettings, Agent } from '../types';

interface SidebarProps {
  conversations: Conversation[];
  folders: Folder[];
  agents: Agent[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onNewChat: (agentId?: string) => void;
  onUpdateFolders: (folders: Folder[]) => void;
  onNewFolder: (name: string) => void;
  onMoveChat: (chatId: string, folderId: string | null) => void;
  onDeleteChat: (id: string) => void;
  onRenameChat: (id: string, title: string) => void;
  onClearAllChats: () => void;
  onViewChange: (v: string) => void;
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  conversations, folders, activeId, onSelect, onNewChat, onUpdateFolders, onNewFolder, onMoveChat, onDeleteChat, onRenameChat, onViewChange, isOpen, settings, onClose 
}) => {
  const [search, setSearch] = useState('');
  const [editingFolderId, setEditingFolderId] = useState<string | null>(null);
  const [editingChatId, setEditingChatId] = useState<string | null>(null);
  const [tempName, setTempName] = useState('');

  const filteredConversations = conversations.filter(c => 
    c.title.toLowerCase().includes(search.toLowerCase())
  );

  const unassignedThreads = filteredConversations.filter(c => 
    !folders.some(f => f.conversationIds.includes(c.id))
  );

  const startRenameFolder = (folder: Folder) => {
    setEditingFolderId(folder.id);
    setTempName(folder.name);
  };

  const saveRenameFolder = () => {
    if (editingFolderId) {
      onUpdateFolders(folders.map(f => f.id === editingFolderId ? { ...f, name: tempName } : f));
      setEditingFolderId(null);
    }
  };

  const startRenameChat = (chat: Conversation) => {
    setEditingChatId(chat.id);
    setTempName(chat.title);
  };

  const saveRenameChat = () => {
    if (editingChatId) {
      onRenameChat(editingChatId, tempName);
      setEditingChatId(null);
    }
  };

  return (
    <div 
      className={`fixed inset-y-0 left-0 z-[200] w-[320px] bg-black border-r border-white/10 flex flex-col h-full transition-transform duration-500 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
    >
      <header className="p-8 space-y-6 border-b border-white/5">
        <div className="flex justify-between items-center mb-2 px-1">
          <h2 className="text-[10px] font-black text-amber-500 uppercase tracking-[0.5em]">The Council Registry</h2>
          <button onClick={onClose} className="text-neutral-600 hover:text-white">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex-1 bg-white/[0.03] border border-white/5 rounded-2xl px-5 py-3 flex items-center gap-3 focus-within:border-white/20 transition-all">
            <input 
              type="text" 
              placeholder="Search Archives..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="bg-transparent border-none focus:ring-0 text-[11px] font-bold text-white w-full p-0 placeholder:text-neutral-800"
            />
          </div>
          <button onClick={() => onNewChat()} className="p-3 bg-white/[0.03] border border-white/5 rounded-2xl text-neutral-600 hover:text-white transition-all">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeWidth={2.5} d="M12 4v16m8-8H4"/></svg>
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-6 space-y-10 custom-scrollbar pb-32">
        {/* PROJECTS SECTION */}
        <section className="space-y-4 px-2">
          <header className="flex justify-between items-center px-4">
            <p className="text-[9px] font-black text-neutral-700 uppercase tracking-widest">Project Folders</p>
            <button onClick={() => onNewFolder('New Objective')} className="text-neutral-700 hover:text-white">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeWidth={2.5} d="M12 4v16m8-8H4"/></svg>
            </button>
          </header>
          <div className="space-y-2">
            {folders.map(folder => (
              <div key={folder.id} className="space-y-1">
                <div className="flex items-center justify-between group px-4 py-2.5 rounded-xl hover:bg-white/[0.02] cursor-pointer">
                  <div className="flex-1 flex items-center gap-3 overflow-hidden" onClick={() => onUpdateFolders(folders.map(f => f.id === folder.id ? { ...f, isCollapsed: !f.isCollapsed } : f))}>
                    <svg className={`w-3 h-3 text-blue-500 transition-transform ${folder.isCollapsed ? '-rotate-90' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeWidth={3} d="M19 9l-7 7-7-7"/></svg>
                    {editingFolderId === folder.id ? (
                      <input 
                        autoFocus
                        value={tempName}
                        onChange={e => setTempName(e.target.value)}
                        onBlur={saveRenameFolder}
                        onKeyDown={e => e.key === 'Enter' && saveRenameFolder()}
                        className="bg-transparent border-none p-0 text-[10px] font-black uppercase text-white outline-none w-full"
                      />
                    ) : (
                      <span className="text-[10px] font-black uppercase text-neutral-400 tracking-tight truncate">{folder.name}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={(e) => { e.stopPropagation(); startRenameFolder(folder); }} className="text-neutral-700 hover:text-white">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); onUpdateFolders(folders.filter(f => f.id !== folder.id)); }} className="text-rose-900 hover:text-rose-500">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7"/></svg>
                    </button>
                  </div>
                </div>
                {!folder.isCollapsed && (
                  <div className="pl-6 space-y-1 ml-4 border-l border-white/5">
                    {folder.conversationIds.map(cid => {
                      const chat = conversations.find(c => c.id === cid);
                      if (!chat) return null;
                      return (
                        <button key={chat.id} onClick={() => onSelect(chat.id)} className={`w-full text-left py-2 px-4 rounded-lg text-[9px] font-black uppercase tracking-tight transition-all truncate ${activeId === chat.id ? 'bg-amber-600/10 text-amber-500' : 'text-neutral-600 hover:text-white'}`}>
                          {chat.title}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* THREADS LIST */}
        <section className="space-y-4 px-2">
          <p className="text-[9px] font-black text-neutral-700 uppercase tracking-widest px-4">Registry Streams</p>
          <div className="space-y-1">
            {unassignedThreads.map(chat => (
              <div key={chat.id} className="relative group">
                <div 
                  onClick={() => onSelect(chat.id)}
                  className={`w-full text-left px-5 py-4 rounded-2xl transition-all border border-transparent flex flex-col gap-1 cursor-pointer ${activeId === chat.id ? 'bg-amber-600/5 border-amber-500/10' : 'hover:bg-white/[0.02]'}`}
                >
                  <div className="flex justify-between items-center mb-1">
                    {editingChatId === chat.id ? (
                      <input 
                        autoFocus
                        value={tempName}
                        onChange={e => setTempName(e.target.value)}
                        onBlur={saveRenameChat}
                        onKeyDown={e => e.key === 'Enter' && saveRenameChat()}
                        className="bg-transparent border-none p-0 text-[10px] font-black uppercase text-white outline-none w-full"
                      />
                    ) : (
                      <span className={`text-[10px] font-black uppercase tracking-tight truncate ${activeId === chat.id ? 'text-amber-500' : 'text-neutral-400'}`}>{chat.title}</span>
                    )}
                  </div>
                  <p className="text-[9px] text-neutral-700 truncate font-medium">{chat.messages[chat.messages.length - 1]?.content || 'Signal Empty'}</p>
                </div>
                <div className="absolute right-4 top-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                   <button onClick={(e) => { e.stopPropagation(); startRenameChat(chat); }} className="p-1 text-neutral-700 hover:text-white">
                     <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                   </button>
                   <button onClick={(e) => { e.stopPropagation(); onDeleteChat(chat.id); }} className="p-1 text-rose-900 hover:text-rose-500">
                     <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7"/></svg>
                   </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      <footer className="p-8 border-t border-white/5 bg-[#050505] space-y-3">
        <button onClick={() => onViewChange('vault')} className="w-full flex items-center gap-5 py-3 px-5 rounded-2xl hover:bg-amber-600/10 border border-transparent hover:border-amber-600/20 transition-all group">
          <svg className="w-6 h-6 text-neutral-600 group-hover:text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
          <span className="text-[10px] font-black uppercase tracking-widest text-neutral-600 group-hover:text-amber-500">Platform Vault</span>
        </button>

        <button onClick={() => onViewChange('settings')} className="w-full flex items-center gap-5 py-3 px-5 rounded-2xl hover:bg-white/[0.05] transition-all group">
          <svg className="w-6 h-6 text-neutral-600 group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/></svg>
          <span className="text-[10px] font-black uppercase tracking-widest text-neutral-600 group-hover:text-white">Neural Settings</span>
        </button>

        <div className="flex items-center gap-5 px-3 pt-3 border-t border-white/5">
          <div className="w-12 h-12 rounded-full border border-white/10 overflow-hidden shrink-0 bg-neutral-900 flex items-center justify-center">
            {settings.customAvatar ? (
               <img src={settings.customAvatar} className="w-full h-full object-cover grayscale" alt="Sovereign" />
            ) : (
               <div className="w-full h-full bg-neutral-800 flex items-center justify-center text-[10px] font-black uppercase text-neutral-600">POV</div>
            )}
          </div>
          <div className="overflow-hidden">
            <p className="text-[12px] font-black uppercase tracking-tight text-white truncate">{settings.nickname || "Sovereign"}</p>
            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-neutral-600 truncate">{settings.occupation || "Archival Node"}</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Sidebar;
