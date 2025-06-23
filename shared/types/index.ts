export interface Message {
  id: string;
  timestamp: string;
  speaker: 'nyx' | 'zero' | 'echo' | 'bull' | 'bear' | 'degen';
  text: string;
  audioUrl?: string;
  tokenCount?: number;
}

export interface StatsData {
  viewers: number;
  totalMessages: number;
  isRunning: boolean;
  totalTokens?: number;
  lastActivity?: string;
  averageLatency?: number;
  messageRate?: number;
}

export interface WebSocketMessage {
  type: 'message' | 'error' | 'connected' | 'stats';
  data?: Message | Message[] | StatsData;
  error?: string;
  stats?: StatsData;
}

export interface ConversationState {
  messages: Message[];
  connections: Set<WebSocket>;
  lastActivity: number;
}

export interface MessageArchive {
  roomId: string;
  archivedAt: string;
  messages: Message[];
  totalMessages: number;
  totalTokens: number;
}

export const AGENTS = {
  NYX: 'nyx',
  ZERO: 'zero',
  ECHO: 'echo',
  BULL: 'bull',
  BEAR: 'bear',
  DEGEN: 'degen'
} as const;

export type Agent = typeof AGENTS[keyof typeof AGENTS];

export type RoomType = 'philosophy' | 'crypto' | 'classic';

export interface RoomConfig {
  id: string;
  type: RoomType;
  name: string;
  agents: Agent[];
  topics: string[];
}