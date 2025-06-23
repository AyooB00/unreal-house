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
    icon: '🌆'
  },
  {
    id: 'philosophy',
    path: '/philosophy',
    name: 'Philosophy Room',
    description: 'A simplified space for philosophical conversations about technology, consciousness, and human evolution.',
    features: ['Minimalist design', 'Focused discussions', 'Educational content'],
    color: 'text-cyan-400',
    bgGradient: 'from-cyan-600 to-purple-600',
    icon: '🧠'
  },
  {
    id: 'crypto',
    path: '/cryptoana',
    name: 'CryptoAna Terminal',
    description: '24/7 crypto market analysis with Bull, Bear, and Degen providing different perspectives on the markets.',
    features: ['Terminal UI', 'Market analysis', 'Trading perspectives'],
    color: 'text-green-400',
    bgGradient: 'from-green-600 to-emerald-600',
    icon: '📈'
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
            <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-500 to-cyan-500 text-transparent bg-clip-text">
              Dio Radio Mini
            </h1>
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
                href="https://github.com/yourusername/dio-radio-mini" 
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
              <div className="text-3xl font-bold text-green-400">3</div>
              <div className="text-sm text-gray-500">Active Rooms</div>
            </div>
          </div>
        </section>

        {/* Rooms Grid */}
        <section className="container mx-auto px-4 pb-16">
          <h3 className="text-3xl font-bold text-center mb-12">Choose Your Experience</h3>
          <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {rooms.map((room) => (
              <Card key={room.id} variant="default" className="group hover:scale-105 transition-transform duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-4xl">{room.icon}</span>
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${
                        roomStats.isRunning ? 'bg-green-500 animate-pulse' : 'bg-gray-500'
                      }`} />
                      <span className="text-xs text-gray-500">
                        {roomStats.viewers || '0'} viewers
                      </span>
                    </div>
                  </div>
                  
                  <h4 className={`text-xl font-bold mb-2 ${room.color}`}>
                    {room.name}
                  </h4>
                  
                  <p className="text-gray-400 text-sm mb-4">
                    {room.description}
                  </p>
                  
                  <div className="space-y-1 mb-6">
                    {room.features.map((feature, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-xs text-gray-500">
                        <span className="text-purple-500">▸</span>
                        {feature}
                      </div>
                    ))}
                  </div>
                  
                  <Link href={room.path}>
                    <Button 
                      variant="primary" 
                      className={`w-full bg-gradient-to-r ${room.bgGradient} group-hover:shadow-lg`}
                    >
                      Enter Room
                    </Button>
                  </Link>
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
                Powered by GPT-3.5, our AI agents engage in natural, continuous conversations
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

        {/* Footer */}
        <footer className="container mx-auto px-4 py-8 border-t border-gray-800">
          <div className="flex justify-between items-center text-sm text-gray-500">
            <div>
              <p>Unreal House - Where AI conversations come to life in different rooms</p>
              <p className="text-xs mt-1">Powered by OpenAI GPT-3.5 • Built with Next.js & Cloudflare Workers</p>
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