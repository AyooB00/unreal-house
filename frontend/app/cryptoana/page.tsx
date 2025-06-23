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
import './crypto-styles.css'

interface ApiHealth {
  status: string
  environment?: {
    valid: boolean
    missing?: string[]
  }
}

function CryptoAnalysis() {
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
  
  const wsUrl = `${process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8787'}/stream/crypto`
  
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

  const getSpeakerColor = (speaker: string) => {
    switch (speaker) {
      case AGENTS.BULL: return 'text-green-400'
      case AGENTS.BEAR: return 'text-red-400'
      case AGENTS.DEGEN: return 'text-yellow-400'
      default: return 'text-gray-400'
    }
  }

  const getSpeakerEmoji = (speaker: string) => {
    switch (speaker) {
      case AGENTS.BULL: return '🐂'
      case AGENTS.BEAR: return '🐻'
      case AGENTS.DEGEN: return '🎲'
      default: return ''
    }
  }

  // Filter messages based on search query
  let filteredMessages = searchQuery
    ? messages.filter(msg => {
        const searchLower = searchQuery.toLowerCase()
        const speakerName = msg.speaker.toLowerCase()
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
        <span key={i} className="bg-green-900/50 text-green-300 font-bold">{part}</span> : 
        part
    )
  }

  return (
    <main className="crypto-main min-h-screen flex flex-col relative overflow-hidden">
      <div className="crypto-bg">
        {!performanceMode && (
          <>
            <div className="chart-pattern"></div>
            <div className="matrix-rain"></div>
          </>
        )}
      </div>

      <div className="container mx-auto px-4 py-16 flex-1 relative z-10">
        <header className="text-center mb-16">
          <h1 className="crypto-title text-6xl font-bold mb-4">
            CryptoAna 📈
          </h1>
          <p className="text-xl text-green-400 glitch" data-text="24/7 Crypto Market Analysis">
            24/7 Crypto Market Analysis
          </p>
          <div className="mt-4 flex items-center justify-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${
                connectionState === 'connected' ? 'bg-green-500' : 
                connectionState === 'connecting' ? 'bg-yellow-500 animate-pulse' : 
                'bg-red-500'
              }`} />
              <span className="text-green-400 font-mono">
                {connectionState === 'connected' ? 'CONNECTED' : 
                 connectionState === 'connecting' ? `CONNECTING${reconnectAttempt > 0 ? ` [${reconnectAttempt}/5]` : ''}` : 
                 'DISCONNECTED'}
              </span>
            </div>
            {stats.viewers !== undefined && (
              <span className="text-green-400 font-mono">
                👁 {stats.viewers} DEGENS WATCHING
              </span>
            )}
            {stats.totalMessages !== undefined && (
              <span className="text-green-400 font-mono">
                💬 {stats.totalMessages} SIGNALS
              </span>
            )}
            {stats.totalTokens !== undefined && (
              <span className="text-green-400 font-mono">
                🪙 {stats.totalTokens.toLocaleString()} TOKENS
              </span>
            )}
            {stats.estimatedCost !== undefined && (
              <span className="text-green-400 font-mono">
                💰 ${stats.estimatedCost.toFixed(2)} BURNED
              </span>
            )}
          </div>
        </header>

        <div className="max-w-4xl mx-auto">
          {/* Search Terminal */}
          <div className="mb-6">
            <div className="relative">
              <input
                type="text"
                placeholder="SEARCH SIGNALS..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value)
                  setIsSearching(e.target.value.length > 0)
                }}
                className="w-full px-4 py-2 pl-10 bg-black border border-green-500/50 text-green-400 placeholder-green-700 focus:outline-none focus:border-green-400 font-mono"
                style={{ textShadow: '0 0 5px rgba(34, 197, 94, 0.5)' }}
              />
              <span className="absolute left-3 top-2.5 text-green-500 font-mono">&gt;_</span>
              {searchQuery && (
                <button
                  onClick={() => {
                    setSearchQuery('')
                    setIsSearching(false)
                  }}
                  className="absolute right-3 top-2.5 text-green-500 hover:text-green-300 font-mono"
                >
                  [X]
                </button>
              )}
            </div>
            {isSearching && (
              <p className="text-sm text-green-500 mt-2 font-mono">
                &gt; FOUND {filteredMessages.length} SIGNAL{filteredMessages.length !== 1 ? 'S' : ''}
              </p>
            )}
          </div>
          {error && (
            <div className="bg-red-900/20 border border-red-500 rounded-lg p-4 mb-6 glitch-box">
              <h3 className="text-red-500 font-bold mb-2 font-mono">⚠️ SYSTEM ERROR</h3>
              <p className="text-red-300 font-mono">{error}</p>
              {connectionState === 'disconnected' && (
                <Button 
                  onClick={reconnect}
                  variant="danger"
                  size="sm"
                  className="mt-3 font-mono"
                >
                  RECONNECT
                </Button>
              )}
            </div>
          )}

          <Card variant="default" className="crypto-card">
            <CardContent className="p-8 relative">
              {filteredMessages.length > 0 ? (
                <div 
                  ref={scrollContainerRef}
                  onScroll={handleScroll}
                  className="space-y-4 max-h-[calc(100vh-400px)] overflow-y-auto crypto-scroll"
                >
                  {filteredMessages.map((msg, idx) => (
                    <div key={idx} className="crypto-message">
                      <p className="text-green-500 mb-2 text-sm font-mono">
                        {getSpeakerEmoji(msg.speaker)} {msg.speaker.toUpperCase()} • {new Date(msg.timestamp).toLocaleTimeString()}
                      </p>
                      <p className={`${getSpeakerColor(msg.speaker)} font-mono mb-3`}>
                        &gt; {highlightText(msg.text)}
                      </p>
                      {msg.audioUrl && (
                        <div className="flex items-center justify-between">
                          <AudioPlayer 
                            audioBase64={msg.audioUrl}
                            autoPlay={idx === filteredMessages.length - 1 && !globalMuted && !performanceMode}
                            globalMuted={globalMuted || performanceMode}
                            compact={true}
                          />
                          <span className="text-xs text-green-600 font-mono">[AUDIO SIGNAL]</span>
                        </div>
                      )}
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              ) : (
                <div className="text-center py-12 text-green-500">
                  <div className="loading-chart mb-4"></div>
                  <p className="text-lg font-mono">INITIALIZING MARKET ANALYSIS...</p>
                  <p className="text-sm text-green-400 mt-2 font-mono">Connecting to blockchain data feeds</p>
                </div>
              )}
              
              {/* New Messages Indicator */}
              {hasNewMessages && isUserScrolling && (
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
                  <Button
                    onClick={scrollToBottom}
                    variant="primary"
                    size="sm"
                    className="shadow-lg animate-pulse bg-green-900 hover:bg-green-800 border-green-500 font-mono"
                  >
                    ↓ NEW SIGNALS
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      
      <div className="border-t border-green-500/30 bg-black/80 backdrop-blur-sm relative z-10">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-6">
              <Button
                onClick={() => setGlobalMuted(!globalMuted)}
                variant="ghost"
                size="sm"
                className="font-mono text-green-400"
              >
                {globalMuted ? '🔇 UNMUTE' : '🔊 MUTE'}
              </Button>
              <Button
                onClick={() => setPerformanceMode(!performanceMode)}
                variant="ghost"
                size="sm"
                className={`font-mono ${performanceMode ? 'text-yellow-400' : 'text-green-400'}`}
              >
                {performanceMode ? '⚡ TURBO: ON' : '⚡ TURBO: OFF'}
              </Button>
            </div>
            <div className="flex items-center gap-4">
              <RoomSelector />
              <div className="text-green-400 font-mono text-xs">
                DYOR • NFA • WAGMI
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}

export default function CryptoPage() {
  return (
    <ErrorBoundary>
      <CryptoAnalysis />
    </ErrorBoundary>
  )
}