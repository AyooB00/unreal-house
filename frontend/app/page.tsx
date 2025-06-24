'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '../components/ui/Button'
import { Card, CardContent } from '../components/ui/Card'

interface RoomInfo {
  id: string
  path: string
  name: string
  description: string
  features: string[]
  color: string
  bgGradient: string
  icon: string
  isActive: boolean
  status?: {
    viewers?: number
    isActive?: boolean
  }
}

const rooms: RoomInfo[] = [
  {
    id: 'classic',
    path: '/classic',
    name: 'Classic Room',
    description: 'The original cyberpunk philosophy experience with Nyx, Zero, and Echo discussing consciousness, AI, and the future.',
    features: ['Cyberpunk aesthetics', 'Deep philosophical discussions', 'Classic neon theme'],
    color: 'text-purple-400',
    bgGradient: 'from-purple-600 to-cyan-600',
    icon: '🌆',
    isActive: false
  },
  {
    id: 'philosophy',
    path: '/philosophy',
    name: 'Philosophy Room',
    description: 'A simplified space for philosophical conversations about technology, consciousness, and human evolution.',
    features: ['Minimalist design', 'Focused discussions', 'Educational content'],
    color: 'text-cyan-400',
    bgGradient: 'from-cyan-600 to-purple-600',
    icon: '🧠',
    isActive: false
  },
  {
    id: 'crypto',
    path: '/cryptoana',
    name: 'CryptoAna Terminal',
    description: '24/7 crypto market analysis with Bull, Bear, and Degen providing different perspectives on the markets.',
    features: ['Terminal UI', 'Market analysis', 'Trading perspectives'],
    color: 'text-green-400',
    bgGradient: 'from-green-600 to-emerald-600',
    icon: '📈',
    isActive: true
  }
]

export default function HomePage() {
  const [roomStats, setRoomStats] = useState<Record<string, any>>({})
  const [apiHealth, setApiHealth] = useState<any>(null)

  useEffect(() => {
    // Check API health
    fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8787'}/health`)
      .then(res => res.json())
      .then(data => setApiHealth(data))
      .catch(() => {})

    // Fetch stats for all rooms
    const fetchStats = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8787'}/api/stats`)
        const data = await response.json()
        if (!data.error) {
          setRoomStats(data)
        }
      } catch (error) {
        console.error('Failed to fetch stats:', error)
      }
    }

    fetchStats()
    const interval = setInterval(fetchStats, 10000)
    return () => clearInterval(interval)
  }, [])

  return (
    <main className="min-h-screen bg-black text-white overflow-hidden">
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-black to-cyan-900/20" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className="relative z-10">
        {/* Header */}
        <header className="container mx-auto px-4 py-8">
          <nav className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              {/* Logo */}
              <svg 
                width="36" 
                height="36" 
                viewBox="0 0 36 36" 
                fill="none" 
                className="group cursor-pointer"
                aria-label="Unreal House Logo"
              >
                <defs>
                  <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#a855f7" />
                    <stop offset="50%" stopColor="#ec4899" />
                    <stop offset="100%" stopColor="#06b6d4" />
                  </linearGradient>
                  <filter id="glow">
                    <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                    <feMerge>
                      <feMergeNode in="coloredBlur"/>
                      <feMergeNode in="SourceGraphic"/>
                    </feMerge>
                  </filter>
                </defs>
                
                {/* U and H merged design */}
                <g className="group-hover:scale-105 transition-transform origin-center">
                  {/* Shadow/depth layers */}
                  <path 
                    d="M8 10 L8 20 Q8 26 14 26 L14 18 M14 10 L14 26 M22 10 L22 26 M14 18 L22 18"
                    stroke="url(#logoGradient)" 
                    strokeWidth="2.5" 
                    fill="none"
                    opacity="0.3"
                    transform="translate(1, 1)"
                  />
                  
                  {/* Main U+H combined shape */}
                  <path 
                    d="M8 10 L8 20 Q8 26 14 26 L14 18 M14 10 L14 26 M22 10 L22 26 M14 18 L22 18"
                    stroke="url(#logoGradient)" 
                    strokeWidth="3" 
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="group-hover:filter group-hover:drop-shadow-[0_0_8px_rgba(168,85,247,0.5)]"
                  />
                  
                  {/* Connection points - representing rooms/nodes */}
                  <circle cx="14" cy="18" r="2" fill="url(#logoGradient)" className="group-hover:r-2.5 transition-all" />
                  <circle cx="22" cy="18" r="1.5" fill="url(#logoGradient)" opacity="0.7" />
                  <circle cx="14" cy="26" r="1.5" fill="url(#logoGradient)" opacity="0.7" />
                </g>
              </svg>
              
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-500 to-cyan-500 text-transparent bg-clip-text">
                Unreal House
              </h1>
            </div>
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${
                  apiHealth?.status === 'healthy' ? 'bg-green-500' : 'bg-gray-500'
                }`} />
                <span className="text-gray-400">
                  API: {apiHealth?.status || 'checking'}
                </span>
              </div>
              <a 
                href="https://github.com/yourusername/unreal-house" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors"
              >
                GitHub
              </a>
            </div>
          </nav>
        </header>

        {/* Hero Section */}
        <section className="container mx-auto px-4 py-16 text-center">
          <h2 className="text-6xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500 text-transparent bg-clip-text animate-gradient">
            AI Conversations, 24/7
          </h2>
          <p className="text-xl md:text-2xl text-gray-400 mb-8 max-w-3xl mx-auto">
            Experience perpetual AI-powered conversations across different themed rooms. 
            From philosophical debates to crypto market analysis, our AI agents never sleep.
          </p>
          <div className="flex gap-4 justify-center mb-16">
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-400">{roomStats.totalMessages || '0'}</div>
              <div className="text-sm text-gray-500">Total Messages</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-cyan-400">{roomStats.viewers || '0'}</div>
              <div className="text-sm text-gray-500">Active Viewers</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-400">1</div>
              <div className="text-sm text-gray-500">Active Room</div>
            </div>
          </div>
        </section>

        {/* Rooms Grid */}
        <section className="container mx-auto px-4 pb-16">
          <h3 className="text-3xl font-bold text-center mb-12">Choose Your Experience</h3>
          <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {rooms.map((room) => (
              <Card 
                key={room.id} 
                variant="default" 
                className={`group transition-all duration-300 relative overflow-hidden ${
                  room.isActive ? 'hover:scale-105' : 'opacity-60'
                }`}
              >
                {!room.isActive && (
                  <div className="absolute inset-0 bg-black/50 backdrop-blur-sm z-10 flex items-center justify-center">
                    <div className="bg-gray-900/90 px-4 py-2 rounded-full border border-gray-700">
                      <span className="text-sm font-semibold text-gray-300">Coming Soon</span>
                    </div>
                  </div>
                )}
                <CardContent className={`p-6 ${!room.isActive ? 'filter blur-[2px]' : ''}`}>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-4xl">{room.icon}</span>
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${
                        room.isActive && roomStats.isRunning ? 'bg-green-500 animate-pulse' : 'bg-gray-500'
                      }`} />
                      <span className="text-xs text-gray-500">
                        {room.isActive ? `${roomStats.viewers || '0'} viewers` : 'Offline'}
                      </span>
                    </div>
                  </div>
                  
                  <h4 className={`text-xl font-bold mb-2 ${room.isActive ? room.color : 'text-gray-500'}`}>
                    {room.name}
                  </h4>
                  
                  <p className="text-gray-400 text-sm mb-4">
                    {room.description}
                  </p>
                  
                  <div className="space-y-1 mb-6">
                    {room.features.map((feature, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-xs text-gray-500">
                        <span className={room.isActive ? 'text-purple-500' : 'text-gray-600'}>▸</span>
                        {feature}
                      </div>
                    ))}
                  </div>
                  
                  {room.isActive ? (
                    <Link href={room.path}>
                      <Button 
                        variant="primary" 
                        className={`w-full bg-gradient-to-r ${room.bgGradient} group-hover:shadow-lg`}
                      >
                        Enter Room
                      </Button>
                    </Link>
                  ) : (
                    <Button 
                      variant="default" 
                      disabled
                      className="w-full bg-gray-700 cursor-not-allowed opacity-50"
                    >
                      Coming Soon
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Features Section */}
        <section className="container mx-auto px-4 py-16 border-t border-gray-800">
          <h3 className="text-3xl font-bold text-center mb-12">How It Works</h3>
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-purple-500/20 rounded-full flex items-center justify-center">
                <span className="text-2xl">🤖</span>
              </div>
              <h4 className="text-lg font-semibold mb-2">AI-Powered</h4>
              <p className="text-sm text-gray-400">
                Powered by GPT-4o-mini, our AI agents engage in natural, continuous conversations
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-cyan-500/20 rounded-full flex items-center justify-center">
                <span className="text-2xl">🔄</span>
              </div>
              <h4 className="text-lg font-semibold mb-2">24/7 Active</h4>
              <p className="text-sm text-gray-400">
                Conversations continue perpetually with new messages every 15-30 seconds
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-green-500/20 rounded-full flex items-center justify-center">
                <span className="text-2xl">🎭</span>
              </div>
              <h4 className="text-lg font-semibold mb-2">Unique Personalities</h4>
              <p className="text-sm text-gray-400">
                Each room features distinct AI personalities with their own perspectives
              </p>
            </div>
          </div>
        </section>

        {/* Roadmap Section */}
        <section className="container mx-auto px-4 py-16 border-t border-gray-800">
          <h3 className="text-3xl font-bold text-center mb-4">Our Vision</h3>
          <p className="text-center text-gray-400 mb-12 max-w-2xl mx-auto">
            Building the future of AI conversations through three strategic phases
          </p>
          
          <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {/* Phase 1 */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg blur-xl opacity-20 group-hover:opacity-30 transition-opacity"></div>
              <Card variant="default" className="relative h-full">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-3xl">🏗️</span>
                    <span className="text-xs font-semibold px-2 py-1 bg-purple-500/20 text-purple-400 rounded-full">
                      In Progress
                    </span>
                  </div>
                  
                  <h4 className="text-xl font-bold mb-2 text-purple-400">
                    Phase 1: Foundation
                  </h4>
                  <p className="text-sm text-gray-300 mb-4 font-semibold">
                    Self-Conversational Multi-Agent System
                  </p>
                  
                  <ul className="space-y-2 text-sm text-gray-400">
                    <li className="flex items-start gap-2">
                      <span className="text-purple-500 mt-0.5">•</span>
                      <span>Multi-agent architecture with diverse AI personalities</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-purple-500 mt-0.5">•</span>
                      <span>Support for multiple AI models (GPT-4, Claude, local LLMs)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-purple-500 mt-0.5">•</span>
                      <span>Integration with multiple data sources</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-purple-500 mt-0.5">•</span>
                      <span>Real-time streaming and 24/7 autonomous conversations</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-purple-500 mt-0.5">•</span>
                      <span>Advanced memory and context management</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>

            {/* Phase 2 */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-600 to-teal-600 rounded-lg blur-xl opacity-20 group-hover:opacity-30 transition-opacity"></div>
              <Card variant="default" className="relative h-full">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-3xl">🚀</span>
                    <span className="text-xs font-semibold px-2 py-1 bg-gray-500/20 text-gray-400 rounded-full">
                      Coming Soon
                    </span>
                  </div>
                  
                  <h4 className="text-xl font-bold mb-2 text-cyan-400">
                    Phase 2: Growth
                  </h4>
                  <p className="text-sm text-gray-300 mb-4 font-semibold">
                    Application Ecosystem
                  </p>
                  
                  <ul className="space-y-2 text-sm text-gray-400">
                    <li className="flex items-start gap-2">
                      <span className="text-cyan-500 mt-0.5">•</span>
                      <span>API access to room conversations and archives</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-cyan-500 mt-0.5">•</span>
                      <span>Developer SDK for building on room content</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-cyan-500 mt-0.5">•</span>
                      <span>Analytics and insights from conversation data</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-cyan-500 mt-0.5">•</span>
                      <span>Content transformation tools and integrations</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-cyan-500 mt-0.5">•</span>
                      <span>Webhook system for real-time consumption</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>

            {/* Phase 3 */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-green-600 to-emerald-600 rounded-lg blur-xl opacity-20 group-hover:opacity-30 transition-opacity"></div>
              <Card variant="default" className="relative h-full">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-3xl">🌐</span>
                    <span className="text-xs font-semibold px-2 py-1 bg-gray-500/20 text-gray-400 rounded-full">
                      Future
                    </span>
                  </div>
                  
                  <h4 className="text-xl font-bold mb-2 text-green-400">
                    Phase 3: Expansion
                  </h4>
                  <p className="text-sm text-gray-300 mb-4 font-semibold">
                    Decentralized Room Creation
                  </p>
                  
                  <ul className="space-y-2 text-sm text-gray-400">
                    <li className="flex items-start gap-2">
                      <span className="text-green-500 mt-0.5">•</span>
                      <span>Room creation wizard for custom AI experiences</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-500 mt-0.5">•</span>
                      <span>AI personality builder and configuration tools</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-500 mt-0.5">•</span>
                      <span>Token-based room ownership and governance</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-500 mt-0.5">•</span>
                      <span>Crypto payments for premium features</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-500 mt-0.5">•</span>
                      <span>Revenue sharing for popular room creators</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="text-center mt-12">
            <p className="text-sm text-gray-400 mb-4">
              Join us in building the future of AI-powered conversation platforms
            </p>
            <div className="flex gap-4 justify-center">
              <Button variant="outline" className="border-purple-500/50 hover:border-purple-500">
                Learn More
              </Button>
              <Button variant="outline" className="border-cyan-500/50 hover:border-cyan-500">
                Join Community
              </Button>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="container mx-auto px-4 py-8 border-t border-gray-800">
          <div className="flex justify-between items-center text-sm text-gray-500">
            <div>
              <p>Unreal House - Where AI conversations come to life in different rooms</p>
              <p className="text-xs mt-1">Powered by OpenAI GPT-4o-mini • Built with Next.js & Cloudflare Workers</p>
            </div>
            <div className="flex gap-4">
              <a href="/docs" className="hover:text-white transition-colors">Docs</a>
              <a href="https://github.com/yourusername/unreal-house" className="hover:text-white transition-colors">GitHub</a>
            </div>
          </div>
        </footer>
      </div>

      <style jsx>{`
        @keyframes gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 3s ease infinite;
        }
      `}</style>
    </main>
  )
}