'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useWebSocket } from '../../hooks/useWebSocket'
import { ErrorBoundary } from '../../components/ErrorBoundary'
import { AudioPlayer } from '../../components/AudioPlayer'
import { Button } from '../../components/ui/Button'
import { Card, CardContent } from '../../components/ui/Card'
import { PreviousChats } from '../../components/PreviousChats'
import { RoomSelector } from '../../components/RoomSelector'
import type { Message } from '../../../shared/types'
import { AGENTS } from '../../../shared/types'
import Link from 'next/link'

interface ApiHealth {
  status: string
  environment?: {
    valid: boolean
    missing?: string[]
  }
}

function RadioInterface() {
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
  
  const wsUrl = `${process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8787'}/stream/philosophy`
  
  const { connectionState, lastError, reconnect, reconnectAttempt } = useWebSocket({
    url: wsUrl,
    onMessage: (message) => {
      // Received message
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
      // WebSocket connected successfully
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
    
    const fetchStats = () => {
      fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8787'}/api/stats`)
        .then(res => res.json())
        .then(data => {
          if (!data.error) {
            setStats(data)
          }
        })
        .catch(() => {
          // Silently fail for stats
        })
    }
    
    checkHealth()
    fetchStats()
    
    // Fetch stats every 10 seconds
    const interval = setInterval(fetchStats, 10000)
    
    return () => clearInterval(interval)
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
        <span key={i} className="bg-yellow-500/30 text-yellow-300">{part}</span> : 
        part
    )
  }

  return (
    <main className="min-h-screen flex flex-col relative overflow-hidden">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-black to-cyan-900/20" />
        {!performanceMode && (
          <>
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
          </>
        )}
      </div>

      <div className="container mx-auto px-4 py-16 flex-1 relative z-10">
        <header className="text-center mb-16">
          <h1 className="text-6xl font-bold mb-4 bg-gradient-to-r from-purple-500 to-cyan-500 text-transparent bg-clip-text animate-fadeIn">
            Philosophy Room
          </h1>
          <p className="text-xl text-gray-400 animate-fadeIn" style={{ animationDelay: '0.2s' }}>
            Deep Thoughts on Technology & Consciousness
          </p>
          <div className="mt-4 flex items-center justify-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${
                connectionState === 'connected' ? 'bg-green-500' : 
                connectionState === 'connecting' ? 'bg-yellow-500 animate-pulse' : 
                'bg-red-500'
              }`} />
              <span className="text-gray-400">
                {connectionState === 'connected' ? 'Connected' : 
                 connectionState === 'connecting' ? `Connecting${reconnectAttempt > 0 ? ` (${reconnectAttempt}/5)` : ''}` : 
                 'Disconnected'}
              </span>
            </div>
            {stats.viewers !== undefined && (
              <span className="text-gray-400">
                👁 {stats.viewers} {stats.viewers === 1 ? 'viewer' : 'viewers'}
              </span>
            )}
            {stats.totalMessages !== undefined && (
              <span className="text-gray-400">
                💬 {stats.totalMessages} messages
              </span>
            )}
            {stats.totalTokens !== undefined && (
              <span className="text-gray-400">
                🪙 {stats.totalTokens.toLocaleString()} tokens
              </span>
            )}
            {stats.estimatedCost !== undefined && (
              <span className="text-gray-400">
                💰 ${stats.estimatedCost.toFixed(2)}
              </span>
            )}
          </div>
        </header>

        <div className="max-w-4xl mx-auto">
          {/* Search Bar */}
          <div className="mb-6">
            <div className="relative">
              <input
                type="text"
                placeholder="Search messages or speakers..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value)
                  setIsSearching(e.target.value.length > 0)
                }}
                className="w-full px-4 py-2 pl-10 bg-black/50 border border-purple-500/30 rounded-lg text-gray-300 placeholder-gray-500 focus:outline-none focus:border-purple-500/60 backdrop-blur-sm"
              />
              <svg className="absolute left-3 top-2.5 w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              {searchQuery && (
                <button
                  onClick={() => {
                    setSearchQuery('')
                    setIsSearching(false)
                  }}
                  className="absolute right-3 top-2.5 text-gray-500 hover:text-gray-300"
                >
                  ✕
                </button>
              )}
            </div>
            {isSearching && (
              <p className="text-sm text-gray-500 mt-2">
                Found {filteredMessages.length} {filteredMessages.length === 1 ? 'message' : 'messages'}
              </p>
            )}
          </div>
          {error && (
            <div className="bg-red-900/20 border border-red-500 rounded-lg p-4 mb-6">
              <h3 className="text-red-500 font-bold mb-2">⚠️ Error</h3>
              <p className="text-red-300">{error}</p>
              {lastError && (
                <details className="mt-2">
                  <summary className="cursor-pointer text-sm text-red-400">Technical details</summary>
                  <pre className="text-xs mt-2 text-red-300">
                    {lastError.message}
                  </pre>
                </details>
              )}
              {connectionState === 'disconnected' && (
                <Button 
                  onClick={reconnect}
                  variant="danger"
                  size="sm"
                  className="mt-3"
                >
                  Try Reconnect
                </Button>
              )}
            </div>
          )}

          <Card variant="default">
            <CardContent className="p-8 relative">
              {filteredMessages.length > 0 ? (
                <div 
                  ref={scrollContainerRef}
                  onScroll={handleScroll}
                  className="space-y-4 max-h-[calc(100vh-400px)] overflow-y-auto scrollbar-thin scrollbar-thumb-purple-500/50"
                >
                  {filteredMessages.map((msg, idx) => (
                    <div key={idx} className={`bg-black/50 rounded-lg p-4 border border-white/5 ${performanceMode ? '' : 'animate-fadeIn'}`}>
                      <p className="text-gray-500 mb-2 text-sm">
                        {msg.speaker === AGENTS.NYX ? 'Nyx' : msg.speaker === AGENTS.ZERO ? 'Zero' : 'Echo'} • {new Date(msg.timestamp).toLocaleTimeString()}
                      </p>
                      <p className={`${msg.speaker === AGENTS.NYX ? 'text-cyan-400' : msg.speaker === AGENTS.ZERO ? 'text-purple-400' : 'text-emerald-400'} italic mb-3`}>
                        &ldquo;{highlightText(msg.text)}&rdquo;
                      </p>
                      {msg.audioUrl && (
                        <div className="flex items-center justify-between">
                          <AudioPlayer 
                            audioBase64={msg.audioUrl}
                            autoPlay={idx === filteredMessages.length - 1 && !globalMuted && !performanceMode}
                            globalMuted={globalMuted || performanceMode}
                            compact={true}
                          />
                          <span className="text-xs text-gray-600">🎵 Audio available</span>
                        </div>
                      )}
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  <p className="text-lg">
                    {connectionState === 'connected' ? 
                      'Waiting for conversation to start...' : 
                      'Connect to start receiving messages'}
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
                    className="shadow-lg animate-bounce"
                  >
                    ↓ New messages
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
          
          <PreviousChats />
        </div>
      </div>
      
      <div className="border-t border-white/10 bg-black/80 backdrop-blur-sm relative z-10">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${
                  connectionState === 'connected' ? 'bg-green-500' : 
                  connectionState === 'connecting' ? 'bg-yellow-500 animate-pulse' : 
                  'bg-red-500'
                }`} />
                <span className="text-gray-400">
                  WebSocket: <span className="text-gray-300">{connectionState}</span>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${
                  apiHealth?.status === 'healthy' ? 'bg-green-500' : 'bg-gray-500'
                }`} />
                <span className="text-gray-400">
                  API: <span className="text-gray-300">{apiHealth?.status || 'checking'}</span>
                </span>
              </div>
              <Button
                onClick={() => setGlobalMuted(!globalMuted)}
                variant="ghost"
                size="sm"
                leftIcon={
                  globalMuted ? (
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM12.293 7.293a1 1 0 011.414 0L15 8.586l1.293-1.293a1 1 0 111.414 1.414L16.414 10l1.293 1.293a1 1 0 01-1.414 1.414L15 11.414l-1.293 1.293a1 1 0 01-1.414-1.414L13.586 10l-1.293-1.293a1 1 0 010-1.414z" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.415z" />
                    </svg>
                  )
                }
              >
                {globalMuted ? 'Unmute' : 'Mute'}
              </Button>
              <Button
                onClick={() => setPerformanceMode(!performanceMode)}
                variant="ghost"
                size="sm"
                className={performanceMode ? 'text-yellow-400' : ''}
                leftIcon={
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" />
                  </svg>
                }
              >
                {performanceMode ? 'Performance: ON' : 'Performance: OFF'}
              </Button>
            </div>
            <div className="flex items-center gap-4">
              <RoomSelector />
              <div className="text-gray-500">
                {apiHealth?.environment && !apiHealth.environment.valid ? (
                  <span className="text-red-400">Missing: {apiHealth.environment.missing?.join(', ')}</span>
                ) : (
                  <span className="flex items-center gap-1">
                    <span className="animate-pulse">🎵</span>
                    <span>v1.0</span>
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}

export default function HomePage() {
  return (
    <ErrorBoundary>
      <RadioInterface />
    </ErrorBoundary>
  )
}