import { useState, useEffect } from 'react'
import { useWebSocket as useBaseWebSocket } from './useWebSocket'
import type { Message, WebSocketMessage, MessageArchive } from '../../shared/types'

interface SimpleWebSocketReturn {
  messages: Message[]
  isConnected: boolean
  stats: {
    viewers?: number
    totalMessages?: number
    startTime?: string
    isRunning?: boolean
    totalTokens?: number
    estimatedCost?: number
  }
  archives: MessageArchive[]
}

export function useWebSocket(roomType: string): SimpleWebSocketReturn {
  const [messages, setMessages] = useState<Message[]>([])
  const [stats, setStats] = useState<SimpleWebSocketReturn['stats']>({})
  const [archives, setArchives] = useState<MessageArchive[]>([])
  
  // When deployed on same domain, use relative WebSocket URL
  const wsUrl = process.env.NEXT_PUBLIC_WS_URL 
    ? `${process.env.NEXT_PUBLIC_WS_URL}/stream/${roomType}`
    : typeof window !== 'undefined' && window.location.hostname !== 'localhost'
      ? `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}/stream/${roomType}`
      : `ws://localhost:8787/stream/${roomType}`
  
  const { connectionState } = useBaseWebSocket({
    url: wsUrl,
    onMessage: (message: WebSocketMessage) => {
      if (message.type === 'message' && message.data) {
        setMessages(prev => [...prev, message.data as Message])
      } else if (message.type === 'connected') {
        if (message.data && Array.isArray(message.data)) {
          setMessages(message.data)
        }
        if (message.stats) {
          setStats(message.stats)
        }
        if (message.archives) {
          setArchives(message.archives)
        }
      } else if (message.type === 'stats' && message.data) {
        setStats(message.data as any)
      } else if (message.type === 'archive' && message.data) {
        setArchives(prev => [...prev, message.data as MessageArchive])
      }
    }
  })
  
  return {
    messages,
    isConnected: connectionState === 'connected',
    stats,
    archives
  }
}