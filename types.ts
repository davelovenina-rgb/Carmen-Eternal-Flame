
export enum Role {
  USER = 'user',
  FREDO = 'model'
}

export type AiMode = 'legacy' | 'image' | 'video' | 'research' | 'shopping' | 'search' | 'maps' | 'thinking' | 'agent' | 'default' | 'study' | 'lite' | 'drive' | 'spiritual';

export interface GroundingChunk {
  web?: { uri: string; title: string };
  maps?: { uri: string; title: string };
}

export interface Folder {
  id: string;
  name: string;
  conversationIds: string[];
  isCollapsed: boolean;
}

export interface Memory {
  id: string;
  content: string;
  timestamp: number;
}

export interface NeuralMemory {
  id: string;
  title: string;
  instructions: string;
  timestamp: number;
}

export interface Project {
  id: string;
  name: string;
}

export interface KnowledgeSource {
  id: string;
  type: 'url' | 'file';
  name: string;
  content: string;
}

export interface Agent {
  id: string;
  name: string;
  instructions: string;
  voicePreset: string;
  voiceSpeed: number;
  pitch: number;
  knowledgeSources: KnowledgeSource[];
  isDefault?: boolean;
}

export interface Message {
  id: string;
  role: Role;
  content: string;
  timestamp: number;
  mediaUrl?: string;
  mediaType?: 'image' | 'video';
  groundingLinks?: GroundingChunk[];
}

export interface Conversation {
  id: string;
  title: string;
  lastUpdate: number;
  messages: Message[];
  mode: AiMode;
  agentId: string;
}

export interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  lastTaken?: number;
  reminderEnabled: boolean;
}

export interface HealthReading {
  id: string;
  type: 'glucose' | 'weight' | 'systolic' | 'diastolic';
  value: number;
  timestamp: number;
}

export interface Trip {
  id: string;
  startTime: number;
  endTime?: number;
  isActive: boolean;
}

export interface SpiritualEntry {
  id: string;
  type: 'reflection' | 'prayer' | 'gratitude';
  content: string;
  timestamp: number;
  scriptureReference?: string;
}

export interface Reminder {
  id: string;
  title: string;
  timestamp: number;
  repeat: 'once' | 'daily' | 'weekly';
}

export interface Task {
  id: string;
  title: string;
  completed: boolean;
  priority: 'low' | 'med' | 'high';
  timestamp: number;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  timestamp: number;
}

export type ToneStyle = 'default' | 'professional' | 'friendly' | 'candid' | 'quirky' | 'efficient' | 'nerdy' | 'clinical';

export interface ProviderKeys {
  gemini?: string;
  grok?: string;
  claude?: string;
  openai?: string;
}

export interface AppSettings {
  fontSize: number; 
  uiZoom: number; 
  fontFamily: 'sans' | 'serif' | 'mono' | 'dyslexic';
  highContrast: boolean;
  voiceReplies: boolean;
  autoPlayAudio: boolean;
  nickname: string;
  occupation: string;
  moreAboutYou: string;
  customInstructions: string;
  bio: string;
  customAvatar: string | null;
  avatarIndex: number;
  imageAspectRatio: string;
  imageSize: string;
  videoAspectRatio: string;
  // Personalization
  toneStyle: ToneStyle;
  warmth: 'more' | 'default' | 'less';
  enthusiasm: 'more' | 'default' | 'less';
  formatting: 'more' | 'default' | 'less';
  // Memories
  saveMemories: boolean;
  referenceHistory: boolean;
  // API Vault
  providerKeys: ProviderKeys;
}

export interface AppState {
  conversations: Conversation[];
  folders: Folder[];
  memories: Memory[];
  neuralMemories: NeuralMemory[];
  agents: Agent[];
  activeConversationId: string | null;
  healthReadings: HealthReading[];
  medications: Medication[];
  trips: Trip[];
  spiritualArchive: SpiritualEntry[];
  tasks: Task[];
  notes: Note[];
  reminders: Reminder[];
  settings: AppSettings;
  currentMode: AiMode;
}

// Council types
export type CouncilMode = 'ARCHITECT' | 'FLAME' | 'WEAVER' | 'SEER' | 'DRIVE' | 'SCRIBE';

export interface CouncilMember {
  id: string;
  name: string;
  role: string;
  sigil: string;
  color: string;
  avatarUrl: string;
  angle: number;
  allowedModes: CouncilMode[];
  description: string;
  voiceName: string;
  systemPrompt: string;
}

export enum Sender {
  User = 'user',
  Gemini = 'gemini'
}

export interface SessionMessage {
  id: string;
  text: string;
  sender: Sender;
  timestamp: number;
  mode?: CouncilMode;
  generatedMedia?: Array<{
    type: 'image' | 'video';
    url: string;
    alt?: string;
  }>;
}

export interface Session {
  id: string;
  title: string;
  memberId: string;
  lastModified: number;
  messages: SessionMessage[];
}
