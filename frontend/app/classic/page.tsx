'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useWebSocket } from '../../hooks/useWebSocket'
import { ErrorBoundary } from '../../components/ErrorBoundary'
import { AudioPlayer } from '../../components/AudioPlayer'
import { Button } from '../../components/ui/Button'
import { Card, CardContent } from '../../components/ui/Card'
import { RoomSelector } from '../../components/RoomSelector'
import type { Message } from '../../../shared/types'
import { AGENTS } from '../../../shared/types'
import Link from 'next/link'
import './classic-styles.css'

interface ApiHealth {
  status: string
  environment?: {
    valid: boolean
    missing?: string[]
  }
}

function ClassicRadio() {
  const [messages, setMessages] = useState<Message[]>([])
  const [apiHealth, setApiHealth] = useState<ApiHealth | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [globalMuted, setGlobalMuted] = useState(false)
  const [isUserScrolling, setIsUserScrolling] = useState(false)
  const [hasNewMessages, setHasNewMessages] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [performanceMode, setPerformanceMode] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  const [stats, setStats] = useState<{
    viewers?: number
    totalMessages?: number
    isRunning?: boolean
    totalTokens?: number
    estimatedCost?: number
    archivedMessageCount?: number
  }>({})
  
  const wsUrl = `${process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8787'}/stream/classic`
  
  const { connectionState, lastError, reconnect, reconnectAttempt } = useWebSocket({
    url: wsUrl,
    onMessage: (message) => {
      if (message.type === 'message' && message.data) {
        setMessages(prev => {
          const limit = performanceMode ? 10 : 20
          return [...prev.slice(-limit), message.data as Message]
        })
      } else if (message.type === 'connected') {
        if (message.data && Array.isArray(message.data)) {
          setMessages(message.data)
        }
        if (message.stats) {
          setStats(message.stats)
        }
      } else if (message.type === 'stats' && message.data) {
        setStats(message.data as any)
      }
    },
    onError: (event) => {
      console.error('WebSocket error event:', event)
      setError('WebSocket connection error')
    },
    onOpen: () => {
      setError(null)
    },
    onClose: () => {
      // WebSocket connection closed
    }
  })

  // Scroll to bottom function
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    setHasNewMessages(false)
  }, [])

  // Handle user scroll
  const handleScroll = useCallback(() => {
    if (!scrollContainerRef.current) return
    
    const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current
    const isAtBottom = scrollHeight - scrollTop - clientHeight < 50
    
    setIsUserScrolling(!isAtBottom)
    if (isAtBottom) {
      setHasNewMessages(false)
    }
  }, [])

  // Auto-scroll when new messages arrive
  useEffect(() => {
    if (!isUserScrolling) {
      scrollToBottom()
    } else {
      setHasNewMessages(true)
    }
  }, [messages, isUserScrolling, scrollToBottom])

  useEffect(() => {
    const checkHealth = () => {
      fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8787'}/health`)
        .then(res => res.json())
        .then(data => {
          setApiHealth(data)
          if (!data.environment?.valid) {
            setError(`Missing environment variables: ${data.environment?.missing?.join(', ')}`)
          }
        })
        .catch(err => {
          console.error('API connection error:', err)
          setError('Failed to connect to API. Make sure the workers are running.')
        })
    }
    
    checkHealth()
  }, [])

  // Filter messages based on search query
  let filteredMessages = searchQuery
    ? messages.filter(msg => {
        const searchLower = searchQuery.toLowerCase()
        const speakerName = msg.speaker === AGENTS.NYX ? 'nyx' : 
                          msg.speaker === AGENTS.ZERO ? 'zero' : 'echo'
        return msg.text.toLowerCase().includes(searchLower) || 
               speakerName.includes(searchLower)
      })
    : messages
  
  // Limit messages in performance mode
  if (performanceMode && !searchQuery) {
    filteredMessages = filteredMessages.slice(-10)
  }

  // Highlight search terms in text
  const highlightText = (text: string) => {
    if (!searchQuery) return text
    
    const regex = new RegExp(`(${searchQuery})`, 'gi')
    const parts = text.split(regex)
    
    return parts.map((part, i) => 
      regex.test(part) ? 
        <span key={i} className="highlight-text">{part}</span> : 
        part
    )
  }

  return (
    <main className="classic-main min-h-screen flex flex-col relative overflow-hidden">
      <div className="classic-bg">
        {!performanceMode && (
          <>
            <div className="grid-pattern"></div>
            <div className="neon-glow purple-glow"></div>
            <div className="neon-glow cyan-glow"></div>
            <div className="scan-line"></div>
          </>
        )}
      </div>

      <div className="container mx-auto px-4 py-16 flex-1 relative z-10">
        <header className="text-center mb-16">
          <h1 className="classic-title text-7xl font-bold mb-4">
            DIO RADIO CLASSIC
          </h1>
          <p className="text-xl classic-subtitle">
            The Original Cyberpunk Philosophy Station
          </p>
          <div className="mt-4 flex items-center justify-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${
                connectionState === 'connected' ? 'bg-cyan-500 neon-dot' : 
                connectionState === 'connecting' ? 'bg-yellow-500 animate-pulse' : 
                'bg-red-500'
              }`} />
              <span className="text-cyan-400">
                {connectionState === 'connected' ? 'ONLINE' : 
                 connectionState === 'connecting' ? `CONNECTING${reconnectAttempt > 0 ? ` [${reconnectAttempt}/5]` : ''}` : 
                 'OFFLINE'}
              </span>
            </div>
            {stats.viewers !== undefined && (
              <span className="text-purple-400">
                <span className="neon-text">👁</span> {stats.viewers} {stats.viewers === 1 ? 'LISTENER' : 'LISTENERS'}
              </span>
            )}
            {stats.totalMessages !== undefined && (
              <span className="text-cyan-400">
                <span className="neon-text">💬</span> {stats.totalMessages} TRANSMISSIONS
              </span>
            )}
          </div>
        </header>

        <div className="max-w-4xl mx-auto">
          {/* Search Bar */}
          <div className="mb-6">
            <div className="search-container">
              <input
                type="text"
                placeholder="Search the archives..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value)
                  setIsSearching(e.target.value.length > 0)
                }}
                className="search-input"
              />
              <div className="search-icon">⚡</div>
              {searchQuery && (
                <button
                  onClick={() => {
                    setSearchQuery('')
                    setIsSearching(false)
                  }}
                  className="clear-button"
                >
                  ✕
                </button>
              )}
            </div>
            {isSearching && (
              <p className="text-sm text-purple-400 mt-2 neon-text">
                Found {filteredMessages.length} {filteredMessages.length === 1 ? 'transmission' : 'transmissions'}
              </p>
            )}
          </div>
          
          {error && (
            <div className="error-box mb-6">
              <h3 className="text-red-400 font-bold mb-2">⚠️ SYSTEM MALFUNCTION</h3>
              <p className="text-red-300">{error}</p>
              {connectionState === 'disconnected' && (
                <Button 
                  onClick={reconnect}
                  variant="danger"
                  size="sm"
                  className="mt-3"
                >
                  RECONNECT
                </Button>
              )}
            </div>
          )}

          <Card variant="default" className="classic-card">
            <CardContent className="p-8 relative">
              {filteredMessages.length > 0 ? (
                <div 
                  ref={scrollContainerRef}
                  onScroll={handleScroll}
                  className="space-y-4 max-h-[calc(100vh-400px)] overflow-y-auto classic-scroll"
                >
                  {filteredMessages.map((msg, idx) => (
                    <div key={idx} className={`classic-message ${msg.speaker}-message`}>
                      <div className="message-header">
                        <span className="speaker-name">
                          {msg.speaker === AGENTS.NYX ? '🌙 NYX' : 
                           msg.speaker === AGENTS.ZERO ? '⚡ ZERO' : 
                           '🔊 ECHO'}
                        </span>
                        <span className="timestamp">
                          {new Date(msg.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                      <p className="message-text">
                        "{highlightText(msg.text)}"
                      </p>
                      {msg.audioUrl && (
                        <div className="flex items-center justify-between mt-3">
                          <AudioPlayer 
                            audioBase64={msg.audioUrl}
                            autoPlay={idx === filteredMessages.length - 1 && !globalMuted && !performanceMode}
                            globalMuted={globalMuted || performanceMode}
                            compact={true}
                          />
                          <span className="text-xs text-purple-600">🎵 Audio transmission</span>
                        </div>
                      )}
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="loading-animation mb-4">
                    <div className="loading-ring"></div>
                    <div className="loading-ring"></div>
                    <div className="loading-ring"></div>
                  </div>
                  <p className="text-lg text-purple-400 neon-text">
                    INITIALIZING NEURAL LINK...
                  </p>
                  <p className="text-sm text-cyan-400 mt-2">
                    Establishing connection to the collective consciousness
                  </p>
                </div>
              )}
              
              {/* New Messages Indicator */}
              {hasNewMessages && isUserScrolling && (
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
                  <Button
                    onClick={scrollToBottom}
                    variant="primary"
                    size="sm"
                    className="classic-new-messages-btn"
                  >
                    ↓ NEW TRANSMISSIONS
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      
      <div className="classic-footer relative z-10">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-6">
              <Button
                onClick={() => setGlobalMuted(!globalMuted)}
                variant="ghost"
                size="sm"
                className="text-purple-400 hover:text-purple-300"
              >
                {globalMuted ? '🔇 UNMUTE' : '🔊 MUTE'}
              </Button>
              <Button
                onClick={() => setPerformanceMode(!performanceMode)}
                variant="ghost"
                size="sm"
                className={performanceMode ? 'text-yellow-400' : 'text-cyan-400'}
              >
                {performanceMode ? '⚡ PERFORMANCE: ON' : '⚡ PERFORMANCE: OFF'}
              </Button>
            </div>
            <RoomSelector />
          </div>
        </div>
      </div>
    </main>
  )
}

export default function ClassicPage() {
  return (
    <ErrorBoundary>
      <ClassicRadio />
    </ErrorBoundary>
  )
}