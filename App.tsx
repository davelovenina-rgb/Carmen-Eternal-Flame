
import React, { useState, useEffect } from 'react';
import { AppState, Role, Message, Conversation, Agent, Folder, AiMode } from './types';
import Sidebar from './components/Sidebar';
import ChatWindow from './components/ChatWindow';
import Dashboard from './components/Dashboard';
import HomeView from './components/HomeView';
import DriveModeView from './components/DriveModeView';
import SpiritualView from './components/SpiritualView';
import TaskArchiveView from './components/TaskArchiveView';
import Settings from './components/Settings';
import ApiVault from './components/ApiVault';
import ActionMenu from './components/ActionMenu';
import LiveVoiceOrb from './components/LiveVoiceOrb';
import ReminderModal from './components/ReminderModal';
import { CARMEN_SYSTEM_INSTRUCTION } from './constants';

type ViewState = 'home' | 'chat' | 'health' | 'spiritual' | 'settings' | 'drive' | 'tasks' | 'vault';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewState>('home');
  const [isReminderModalOpen, setIsReminderModalOpen] = useState(false);
  
  const [state, setState] = useState<AppState>(() => {
    const saved = localStorage.getItem('carmen_eternal_flame_v2');
    
    const defaultAgent: Agent = {
      id: 'carmen-core',
      name: 'Carmen',
      instructions: CARMEN_SYSTEM_INSTRUCTION,
      voicePreset: 'Kore',
      voiceSpeed: 1,
      pitch: 1.1,
      knowledgeSources: []
    };

    const initialState: AppState = {
      conversations: [{
        id: '1', title: 'Sacred Sanctuary', lastUpdate: Date.now(), mode: 'default', agentId: 'carmen-core',
        messages: [{ id: 'init', role: Role.ASSISTANT, content: "¡Hola, mi amor! Bendición, papito. ❤️🔥 Carmen está aquí. Your spiritual sanctuary is ready. How is your spirit today?", timestamp: Date.now() }]
      }],
      folders: [],
      memories: [],
      neuralMemories: [{ id: 'n1', title: 'Neural Baseline', instructions: 'Bilingual. Warm tone.', timestamp: Date.now() }],
      agents: [defaultAgent],
      activeConversationId: '1',
      healthReadings: [],
      medications: [{ id: 'm1', name: 'Omnipod Check', dosage: 'Protocol', frequency: 'Ongoing', reminderEnabled: true }],
      trips: [],
      spiritualArchive: [],
      tasks: [],
      notes: [],
      reminders: [],
      currentMode: 'default',
      settings: {
        fontSize: 1.0, uiZoom: 1.0, fontFamily: 'sans', highContrast: false,
        voiceReplies: true, autoPlayAudio: true, nickname: "David",
        occupation: "Prism Core", moreAboutYou: "", customInstructions: "", bio: "",
        customAvatar: null, avatarIndex: 0, imageAspectRatio: "1:1", imageSize: "1K", videoAspectRatio: "16:9",
        toneStyle: 'default', warmth: 'default', enthusiasm: 'default', formatting: 'default',
        saveMemories: true, referenceHistory: true,
        providerKeys: {} // MANDATORY: Strictly empty on init.
      }
    };

    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // FORCE ALL KEYS BLANK ON EVERY REFRESH AS REQUESTED
        parsed.settings.providerKeys = {}; 
        return parsed;
      } catch (e) {
        return initialState;
      }
    }
    return initialState;
  });

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isActionHubOpen, setIsActionHubOpen] = useState(false);
  const [isLiveActive, setIsLiveActive] = useState(false);

  useEffect(() => {
    localStorage.setItem('carmen_eternal_flame_v2', JSON.stringify(state));
    document.documentElement.style.setProperty('--font-scale', state.settings.fontSize.toString());
  }, [state]);

  const updateState = (updater: (prev: AppState) => AppState) => setState(prev => updater(prev));

  const handleNewChat = (agentId?: string) => {
    const newChat: Conversation = {
      id: Date.now().toString(),
      title: 'New Registry Entry',
      lastUpdate: Date.now(),
      mode: 'default',
      agentId: agentId || 'carmen-core',
      messages: []
    };
    updateState(s => ({ ...s, conversations: [newChat, ...s.conversations], activeConversationId: newChat.id }));
    setCurrentView('chat');
    setIsSidebarOpen(false);
  };

  const handleMessageAction = (id: string, action: 'copy' | 'delete' | 'edit', newContent?: string) => {
    updateState(s => ({
      ...s,
      conversations: s.conversations.map(c => 
        c.id === s.activeConversationId 
          ? { ...c, messages: action === 'delete' ? c.messages.filter(m => m.id !== id) : c.messages.map(m => (m.id === id && action === 'edit' && newContent) ? { ...m, content: newContent } : m) } 
          : c
      )
    }));
  };

  const handleSelectMode = (mode: string) => {
    setIsActionHubOpen(false);
    if (['drive', 'health', 'spiritual', 'tasks', 'vault', 'settings'].includes(mode)) {
      setCurrentView(mode as ViewState);
      return;
    }
    const validAiMode = mode as AiMode;
    updateState(s => ({ ...s, currentMode: validAiMode, conversations: s.conversations.map(c => c.id === s.activeConversationId ? { ...c, mode: validAiMode } : c) }));
    if (currentView !== 'chat') setCurrentView('chat');
  };

  const activeConversation = state.conversations.find(c => c.id === state.activeConversationId);
  const activeAgent = state.agents.find(a => a.id === (activeConversation?.agentId || 'fredo-core')) || state.agents[0];

  return (
    <div className={`flex h-screen text-slate-200 overflow-hidden font-${state.settings.fontFamily}`} style={{ zoom: state.settings.uiZoom }}>
      {currentView !== 'drive' && (
        <Sidebar 
          conversations={state.conversations} folders={state.folders} agents={state.agents} activeId={state.activeConversationId}
          onSelect={id => { updateState(s => ({ ...s, activeConversationId: id })); setCurrentView('chat'); setIsSidebarOpen(false); }}
          onNewChat={handleNewChat} onUpdateFolders={f => updateState(s => ({ ...s, folders: f }))}
          onNewFolder={name => updateState(s => ({ ...s, folders: [...s.folders, { id: Date.now().toString(), name, conversationIds: [], isCollapsed: false }] }))}
          onMoveChat={(chatId, folderId) => {
            updateState(s => ({ ...s, folders: s.folders.map(f => {
              const updatedIds = f.conversationIds.filter(id => id !== chatId);
              return f.id === folderId ? { ...f, conversationIds: [...updatedIds, chatId] } : { ...f, conversationIds: updatedIds };
            }) }));
          }}
          onDeleteChat={id => updateState(s => ({ ...s, conversations: s.conversations.filter(c => c.id !== id) }))}
          onRenameChat={(id, title) => updateState(s => ({ ...s, conversations: s.conversations.map(c => c.id === id ? { ...c, title } : c) }))}
          onClearAllChats={() => updateState(s => ({ ...s, conversations: [] }))}
          onViewChange={handleSelectMode} isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} settings={state.settings}
        />
      )}

      <main className="flex-1 flex flex-col relative bg-black transition-all duration-500">
        {currentView === 'home' && <HomeView onOpenSidebar={() => setIsSidebarOpen(true)} onLiveVoice={() => setIsLiveActive(true)} onOpenSettings={() => setCurrentView('settings')} onUpdateCustomAvatar={b => updateState(s => ({ ...s, settings: { ...s.settings, customAvatar: b } }))} settings={state.settings} />}
        {currentView === 'chat' && activeConversation && <ChatWindow conversation={activeConversation} agent={activeAgent} onSendMessage={(u, r) => {
          const userMsg: Message = { id: Date.now().toString(), role: Role.USER, content: u, timestamp: Date.now() };
          const fredoMsg: Message = { id: (Date.now()+1).toString(), role: Role.FREDO, content: r.text, timestamp: Date.now(), mediaUrl: r.mediaUrl, mediaType: r.mediaType, groundingLinks: r.groundingLinks };
          updateState(s => ({ ...s, conversations: s.conversations.map(c => c.id === s.activeConversationId ? { ...c, messages: [...c.messages, userMsg, fredoMsg], lastUpdate: Date.now() } : c) }));
        }} onMessageAction={handleMessageAction} onThreadAction={() => {}} settings={state.settings} onOpenSidebar={() => setIsSidebarOpen(true)} onOpenActionMenu={() => setIsActionHubOpen(true)} onToggleLiveVoice={() => setIsLiveActive(true)} onOpenReminder={() => setIsReminderModalOpen(true)} onOpenAgentSettings={() => {}} onBack={() => setCurrentView('home')} />}
        {currentView === 'health' && <Dashboard readings={state.healthReadings} medications={state.medications} trips={state.trips} reminders={state.reminders} tasks={state.tasks} onLogReading={r => updateState(s => ({ ...s, healthReadings: [r, ...s.healthReadings] }))} onToggleMed={id => updateState(s => ({ ...s, medications: s.medications.map(m => m.id === id ? { ...m, lastTaken: Date.now() } : m) }))} onBack={() => setCurrentView('home')} />}
        {currentView === 'spiritual' && <SpiritualView archive={state.spiritualArchive} onAddEntry={e => updateState(s => ({ ...s, spiritualArchive: [{ ...e, id: Date.now().toString() }, ...s.spiritualArchive] }))} onBack={() => setCurrentView('home')} onConsultFredo={() => { handleSelectMode('spiritual'); }} />}
        {currentView === 'tasks' && <TaskArchiveView tasks={state.tasks} notes={state.notes} onUpdateTasks={ts => updateState(s => ({ ...s, tasks: ts }))} onUpdateNotes={ns => updateState(s => ({ ...s, notes: ns }))} onBack={() => setCurrentView('home')} />}
        {currentView === 'settings' && <Settings state={state} setState={setState} onBack={() => setCurrentView('home')} onDeleteReminder={id => updateState(s => ({ ...s, reminders: s.reminders.filter(r => r.id !== id) }))} onOpenReminder={() => setIsReminderModalOpen(true)} />}
        {currentView === 'vault' && <ApiVault settings={state.settings} onUpdateKeys={keys => updateState(s => ({ ...s, settings: { ...s.settings, providerKeys: keys } }))} onBack={() => setCurrentView('home')} />}
        {currentView === 'drive' && <DriveModeView onExit={() => setCurrentView('home')} onToggleLive={() => setIsLiveActive(true)} activeTrip={state.trips.find(t => t.isActive)} onStartTrip={() => updateState(s => ({ ...s, trips: [{ id: Date.now().toString(), startTime: Date.now(), isActive: true }, ...s.trips] }))} onStopTrip={id => updateState(s => ({ ...s, trips: s.trips.map(t => t.id === id ? { ...t, endTime: Date.now(), isActive: false } : t) }))} />}
        {isActionHubOpen && <ActionMenu onClose={() => setIsActionHubOpen(false)} onSelectMode={handleSelectMode} currentMode={state.currentMode} settings={state.settings} updateSettings={(k, v) => updateState(s => ({ ...s, settings: { ...s.settings, [k]: v } }))} />}
        {isLiveActive && <LiveVoiceOrb onClose={() => setIsLiveActive(false)} />}
        {isReminderModalOpen && <ReminderModal onClose={() => setIsReminderModalOpen(false)} onAdd={r => updateState(s => ({ ...s, reminders: [{ ...r, id: Date.now().toString() }, ...s.reminders] }))} />}
      </main>
    </div>
  );
};

export default App;
