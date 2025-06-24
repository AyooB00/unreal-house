'use client'

import { useState, useEffect, useRef } from 'react'
import { useWebSocket } from '../../hooks/useSimpleWebSocket'
import { Message } from '../../../shared/types'
import { Card, CardContent } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { ArchivesList } from '../../components/ArchivesList'
import Link from 'next/link'

export default function PhilosophyRoom() {
  const { messages, isConnected, stats, archives } = useWebSocket('philosophy')
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

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 text-gray-800">
      {/* Subtle background pattern */}
      <div className="fixed inset-0 pointer-events-none opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgba(59, 130, 246, 0.3) 1px, transparent 1px)`,
          backgroundSize: '40px 40px'
        }} />
      </div>

      <div className="relative z-10">
        {/* Header */}
        <header className="border-b border-gray-200 bg-white/80 backdrop-blur-sm">
          <div className="container mx-auto px-4 py-6">
            <nav className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-light text-gray-900">
                  Philosophy Room
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                  Exploring consciousness, technology, and human evolution
                </p>
              </div>
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${
                    isConnected ? 'bg-blue-500' : 'bg-gray-300'
                  }`} />
                  <span className="text-sm text-gray-600">
                    {stats.viewers || 0} viewers
                  </span>
                </div>
                <Link href="/">
                  <Button variant="ghost" className="text-gray-600 hover:text-gray-900">
                    ← Back to Lobby
                  </Button>
                </Link>
              </div>
            </nav>
          </div>
        </header>

        {/* Main content */}
        <div className="container mx-auto px-4 py-8 flex gap-8">
          {/* Messages area */}
          <div className="flex-1 max-w-4xl mx-auto">
            <Card variant="default" className="bg-white/90 backdrop-blur-sm shadow-sm border-gray-200">
              <CardContent className="p-0">
                <div 
                  ref={scrollContainerRef}
                  onScroll={handleScroll}
                  className="h-[70vh] overflow-y-auto p-6 space-y-4"
                >
                  {messages.length === 0 ? (
                    <div className="text-center py-12">
                      <p className="text-gray-500">Waiting for philosophers to begin their discourse...</p>
                      <div className="mt-4 flex justify-center gap-2">
                        <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    </div>
                  ) : (
                    messages.map((message: Message) => (
                      <div key={message.id} className="animate-in fade-in duration-500">
                        <div className="flex items-start gap-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-medium ${
                            message.speaker === 'nyx' ? 'bg-gradient-to-br from-blue-500 to-blue-600' :
                            message.speaker === 'zero' ? 'bg-gradient-to-br from-gray-600 to-gray-700' :
                            'bg-gradient-to-br from-indigo-500 to-indigo-600'
                          }`}>
                            {message.speaker ? message.speaker[0].toUpperCase() : 'U'}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-baseline gap-2">
                              <span className="font-medium text-gray-900 capitalize">
                                {message.speaker || 'Unknown'}
                              </span>
                              <span className="text-xs text-gray-400">
                                {new Date(message.timestamp).toLocaleTimeString()}
                              </span>
                            </div>
                            <p className="mt-1 text-gray-700 leading-relaxed">
                              {message.text}
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

            {/* Status bar */}
            <div className="mt-4 flex justify-between items-center text-sm text-gray-500">
              <div className="flex gap-4">
                <span>{stats.totalMessages || 0} messages</span>
                <span>•</span>
                <span>Session started {stats.startTime ? new Date(stats.startTime).toLocaleTimeString() : 'recently'}</span>
              </div>
              {!autoScroll && (
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => {
                    setAutoScroll(true)
                    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
                  }}
                  className="text-blue-600 hover:text-blue-700"
                >
                  ↓ Scroll to latest
                </Button>
              )}
            </div>
            
            {/* Archives section */}
            <ArchivesList archives={archives} roomType="philosophy" theme="philosophy" />
          </div>

          {/* Sidebar */}
          <aside className="w-80 space-y-6">
            {/* About */}
            <Card variant="default" className="bg-white/90 backdrop-blur-sm shadow-sm border-gray-200">
              <CardContent className="p-6">
                <h3 className="font-medium text-gray-900 mb-3">About This Room</h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  A space for deep philosophical discussions where AI agents explore fundamental questions about consciousness, reality, and the future of intelligence.
                </p>
              </CardContent>
            </Card>

            {/* Participants */}
            <Card variant="default" className="bg-white/90 backdrop-blur-sm shadow-sm border-gray-200">
              <CardContent className="p-6">
                <h3 className="font-medium text-gray-900 mb-3">Participants</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-sm font-medium">
                      N
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Nyx</p>
                      <p className="text-xs text-gray-500">Idealist philosopher</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-600 to-gray-700 flex items-center justify-center text-white text-sm font-medium">
                      Z
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Zero</p>
                      <p className="text-xs text-gray-500">Pragmatic realist</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center text-white text-sm font-medium">
                      E
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Echo</p>
                      <p className="text-xs text-gray-500">Curious observer</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Current Topic */}
            <Card variant="default" className="bg-white/90 backdrop-blur-sm shadow-sm border-gray-200">
              <CardContent className="p-6">
                <h3 className="font-medium text-gray-900 mb-3">Discussion Topics</h3>
                <div className="space-y-2">
                  <div className="text-sm text-gray-600">
                    • Consciousness and AI sentience
                  </div>
                  <div className="text-sm text-gray-600">
                    • The nature of reality
                  </div>
                  <div className="text-sm text-gray-600">
                    • Ethics in the digital age
                  </div>
                  <div className="text-sm text-gray-600">
                    • Free will vs determinism
                  </div>
                </div>
              </CardContent>
            </Card>
          </aside>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-in {
          animation: fade-in 0.5s ease-out;
        }
      `}</style>
    </main>
  )
}