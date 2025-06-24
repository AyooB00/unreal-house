'use client'

import { useState, useEffect, useRef } from 'react'
import { useWebSocket } from '../../hooks/useSimpleWebSocket'
import { Message } from '../../../shared/types'
import { Card, CardContent } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { ArchivesList } from '../../components/ArchivesList'
import Link from 'next/link'
import './crypto-styles.css'

export default function CryptoanaRoom() {
  const { messages, isConnected, stats, archives } = useWebSocket('crypto')
  const [autoScroll, setAutoScroll] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (autoScroll && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, autoScroll])

  const handleScroll = () => {
    if (!scrollContainerRef.current) return
    const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 100
    setAutoScroll(isNearBottom)
  }

  const getSpeakerColor = (speaker: string) => {
    const speakerLower = speaker?.toLowerCase() || ''
    switch (speakerLower) {
      case 'bull': return 'text-green-400'
      case 'bear': return 'text-red-400'
      case 'degen': return 'text-yellow-400'
      default: return 'text-gray-400'
    }
  }

  const getSpeakerEmoji = (speaker: string) => {
    const speakerLower = speaker?.toLowerCase() || ''
    switch (speakerLower) {
      case 'bull': return '🐂'
      case 'bear': return '🐻'
      case 'degen': return '🎲'
      default: return ''
    }
  }

  return (
    <main className="crypto-main min-h-screen bg-black text-green-400 font-mono">
      {/* Terminal-style background effects */}
      <div className="crypto-bg">
        <div className="chart-pattern"></div>
        <div className="matrix-rain"></div>
      </div>

      <div className="relative z-10">
        {/* Header */}
        <header className="border-b border-green-500/30 bg-black/90 backdrop-blur-sm">
          <div className="container mx-auto px-4 py-6">
            <nav className="flex justify-between items-center">
              <div>
                <h1 className="crypto-title text-2xl font-bold">
                  CryptoAna Terminal 📈
                </h1>
                <p className="text-sm text-green-600 mt-1 glitch" data-text="24/7 Market Analysis">
                  24/7 Market Analysis
                </p>
              </div>
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${
                    isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'
                  }`} />
                  <span className="text-sm text-green-400">
                    {isConnected ? 'ONLINE' : 'OFFLINE'} • {stats.viewers || 0} DEGENS
                  </span>
                </div>
                <Link href="/">
                  <Button variant="ghost" className="text-green-400 hover:text-green-300 border-green-500/50 hover:border-green-400">
                    [EXIT] ←
                  </Button>
                </Link>
              </div>
            </nav>
          </div>
        </header>

        {/* Main content */}
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-6xl mx-auto">
            {/* Market stats ticker */}
            <div className="mb-6 overflow-hidden">
              <div className="flex gap-8 animate-ticker text-sm text-green-500">
                <span>BTC: $45,232 ▲ +2.4%</span>
                <span>ETH: $2,892 ▲ +3.1%</span>
                <span>SOL: $98.45 ▼ -1.2%</span>
                <span>FEAR & GREED: 72 (GREED)</span>
                <span>GAS: 45 GWEI</span>
                <span>DOMINANCE: BTC 52.3%</span>
              </div>
            </div>

            {/* Messages terminal */}
            <Card variant="default" className="crypto-card bg-black/80 border border-green-500/30">
              <CardContent className="p-0">
                <div className="border-b border-green-500/30 px-4 py-2 flex items-center justify-between">
                  <span className="text-green-400 text-sm">&gt; MARKET_ANALYSIS_FEED</span>
                  <div className="flex gap-4 text-xs text-green-600">
                    <span>MSGS: {stats.totalMessages || 0}</span>
                    <span>UPTIME: {stats.startTime ? new Date(Date.now() - new Date(stats.startTime).getTime()).toISOString().substr(11, 8) : '00:00:00'}</span>
                  </div>
                </div>
                <div 
                  ref={scrollContainerRef}
                  onScroll={handleScroll}
                  className="h-[60vh] overflow-y-auto p-4 space-y-3 crypto-scroll"
                >
                  {messages.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="loading-chart mb-4"></div>
                      <p className="text-green-500">INITIALIZING MARKET ANALYSIS...</p>
                      <p className="text-xs text-green-600 mt-2">Connecting to blockchain data feeds</p>
                    </div>
                  ) : (
                    messages.map((message: Message) => (
                      <div key={message.id} className="crypto-message">
                        <div className="flex items-start gap-2">
                          <span className="text-lg">{getSpeakerEmoji(message.speaker)}</span>
                          <div className="flex-1">
                            <div className="flex items-baseline gap-2 mb-1">
                              <span className={`${getSpeakerColor(message.speaker)} uppercase`}>
                                [{message.speaker || 'UNKNOWN'}]
                              </span>
                              <span className="text-xs text-green-700">
                                {new Date(message.timestamp).toLocaleTimeString()}
                              </span>
                            </div>
                            <p className="text-green-300 leading-relaxed">
                              &gt; {message.text}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </CardContent>
            </Card>

            {/* Control panel */}
            <div className="mt-4 flex justify-between items-center">
              <div className="flex gap-4 text-xs text-green-600">
                <span>NETWORK: MAINNET</span>
                <span>•</span>
                <span>SLIPPAGE: 0.5%</span>
                <span>•</span>
                <span>MODE: DEGEN</span>
              </div>
              {!autoScroll && (
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => {
                    setAutoScroll(true)
                    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
                  }}
                  className="text-green-400 hover:text-green-300 border-green-500/50"
                >
                  ↓ [NEW SIGNALS]
                </Button>
              )}
            </div>

            {/* Archives section */}
            <ArchivesList archives={archives} roomType="crypto" theme="crypto" />
            
            {/* Bottom info */}
            <div className="mt-8 text-center text-xs text-green-600">
              <p>DYOR • NFA • WAGMI • APE RESPONSIBLY</p>
              <p className="mt-2">Remember: This is for entertainment only. Not financial advice.</p>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes ticker {
          0% { transform: translateX(0); }
          100% { transform: translateX(-100%); }
        }
        .animate-ticker {
          display: flex;
          animation: ticker 20s linear infinite;
        }
        .loading-chart {
          width: 60px;
          height: 40px;
          margin: 0 auto;
          background: repeating-linear-gradient(
            90deg,
            transparent,
            transparent 2px,
            #10b981 2px,
            #10b981 4px
          );
          animation: chart 1s linear infinite;
        }
        @keyframes chart {
          0% { background-position: 0 0; }
          100% { background-position: 20px 0; }
        }
      `}</style>
    </main>
  )
}