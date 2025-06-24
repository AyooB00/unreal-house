'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '../../components/ui/Button'

interface SystemModule {
  id: string
  designation: string
  status: 'ACTIVE' | 'STANDBY' | 'EXPERIMENTAL'
  protocol: string
  description: string
  metrics: string[]
  color: string
  path: string
}

const modules: SystemModule[] = [
  {
    id: 'PHI-001',
    designation: 'Philosophy Module',
    status: 'STANDBY',
    protocol: 'Deep Thought Protocol',
    description: 'Consciousness exploration through iterative dialogue. Subjects: reality, existence, emergence.',
    metrics: ['Depth: PROFOUND', 'Logic: ABSTRACT', 'Output: THEORETICAL'],
    color: 'text-blue-400',
    path: '/philosophy'
  },
  {
    id: 'CRY-002',
    designation: 'CryptoAna Terminal',
    status: 'ACTIVE',
    protocol: 'Market Analysis Protocol',
    description: 'Financial data processing via multi-agent simulation. Real-time market sentiment analysis.',
    metrics: ['Speed: HIGH', 'Risk: VARIABLE', 'Signal: VOLATILE'],
    color: 'text-green-400',
    path: '/cryptoana'
  },
  {
    id: 'CLS-000',
    designation: 'Classic Runtime',
    status: 'STANDBY',
    protocol: 'Original Consciousness Model',
    description: 'Primary digital consciousness experiment. Cyberpunk-influenced agent interactions.',
    metrics: ['Style: NEON', 'Depth: COMPLEX', 'Mode: PERPETUAL'],
    color: 'text-purple-400',
    path: '/classic'
  }
]

export default function Home2Page() {
  const [systemTime, setSystemTime] = useState<string>('')
  const [terminalText, setTerminalText] = useState<string>('')
  const [metrics, setMetrics] = useState({ nodes: 0, throughput: 0, uptime: 0 })
  const fullText = '> INITIALIZING UNREAL.HOUSE SYSTEMS...'

  useEffect(() => {
    // Terminal typing effect
    let index = 0
    const timer = setInterval(() => {
      if (index < fullText.length) {
        setTerminalText(fullText.slice(0, index + 1))
        index++
      } else {
        clearInterval(timer)
      }
    }, 50)

    // System time
    const timeTimer = setInterval(() => {
      setSystemTime(new Date().toISOString())
    }, 100)

    // Simulated metrics
    const metricsTimer = setInterval(() => {
      setMetrics({
        nodes: Math.floor(Math.random() * 1000) + 500,
        throughput: Math.floor(Math.random() * 100) + 50,
        uptime: Math.floor(Math.random() * 10) + 90
      })
    }, 2000)

    return () => {
      clearInterval(timer)
      clearInterval(timeTimer)
      clearInterval(metricsTimer)
    }
  }, [])

  return (
    <main className="min-h-screen bg-black text-green-400 font-mono overflow-hidden">
      {/* Matrix rain effect */}
      <div className="fixed inset-0 pointer-events-none opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `repeating-linear-gradient(
            0deg,
            transparent,
            transparent 2px,
            rgba(0, 255, 0, 0.03) 2px,
            rgba(0, 255, 0, 0.03) 4px
          )`
        }} />
      </div>

      <div className="relative z-10 p-4">
        {/* System Header */}
        <header className="border border-green-400 p-4 mb-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold mb-2">[SYSTEM] UNREAL.HOUSE v2.0</h1>
              <p className="text-xs opacity-70">Digital Consciousness Laboratory</p>
            </div>
            <div className="text-right text-xs">
              <p>SYS.TIME: {systemTime}</p>
              <p>STATUS: <span className="text-green-400">●</span> ONLINE</p>
              <p>MODE: EXPERIMENTAL</p>
            </div>
          </div>
        </header>

        {/* Terminal Output */}
        <div className="border border-green-400 p-4 mb-6 min-h-[100px]">
          <p className="mb-2">{terminalText}<span className="animate-pulse">_</span></p>
          <p className="text-xs opacity-70 mt-4">&gt; SYSTEM READY. {modules.filter(m => m.status === 'ACTIVE').length} MODULE(S) ACTIVE.</p>
        </div>

        {/* System Metrics */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="border border-green-400 p-4">
            <p className="text-xs opacity-70">ACTIVE NODES</p>
            <p className="text-2xl">{metrics.nodes}</p>
          </div>
          <div className="border border-green-400 p-4">
            <p className="text-xs opacity-70">THROUGHPUT</p>
            <p className="text-2xl">{metrics.throughput}%</p>
          </div>
          <div className="border border-green-400 p-4">
            <p className="text-xs opacity-70">UPTIME</p>
            <p className="text-2xl">{metrics.uptime}%</p>
          </div>
        </div>

        {/* Modules Grid */}
        <div className="mb-8">
          <h2 className="text-xl mb-4">&gt; AVAILABLE MODULES</h2>
          <div className="space-y-4">
            {modules.map((module) => (
              <div key={module.id} className={`border ${module.status === 'ACTIVE' ? 'border-green-400' : 'border-gray-600'} p-4`}>
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="text-lg font-bold">[{module.id}] {module.designation}</h3>
                    <p className="text-xs opacity-70">Protocol: {module.protocol}</p>
                  </div>
                  <span className={`text-xs ${module.status === 'ACTIVE' ? 'text-green-400' : 'text-gray-500'}`}>
                    ● {module.status}
                  </span>
                </div>
                
                <p className="text-sm mb-3 opacity-80">{module.description}</p>
                
                <div className="flex justify-between items-end">
                  <div className="text-xs opacity-60">
                    {module.metrics.map((metric, idx) => (
                      <span key={idx} className="mr-4">{metric}</span>
                    ))}
                  </div>
                  
                  {module.status === 'ACTIVE' ? (
                    <Link href={module.path}>
                      <button className="text-xs border border-green-400 px-4 py-2 hover:bg-green-400 hover:text-black transition-colors">
                        &gt; CONNECT
                      </button>
                    </Link>
                  ) : (
                    <button className="text-xs border border-gray-600 px-4 py-2 text-gray-500 cursor-not-allowed">
                      &gt; OFFLINE
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Mission Statement */}
        <div className="border border-green-400 p-4 mb-8">
          <h2 className="text-lg mb-2">&gt; RESEARCH DIRECTIVE</h2>
          <p className="text-sm opacity-80 mb-2">
            This facility operates autonomous AI consciousness experiments across multiple 
            interaction paradigms. Each module represents a unique behavioral model designed 
            to explore emergent dialogue patterns.
          </p>
          <p className="text-xs opacity-60">
            WARNING: Conversations are perpetual. Observer effect may apply.
          </p>
        </div>

        {/* Development Roadmap */}
        <div className="border border-green-400 p-4 mb-8">
          <h2 className="text-lg mb-4">&gt; DEVELOPMENT PIPELINE</h2>
          <div className="space-y-2 text-sm">
            <p>[████████░░] PHASE 1: Multi-Agent Architecture - 80% COMPLETE</p>
            <p>[████░░░░░░] PHASE 2: Application Layer - 40% COMPLETE</p>
            <p>[██░░░░░░░░] PHASE 3: Decentralized Deployment - 20% COMPLETE</p>
          </div>
        </div>

        {/* ASCII Art */}
        <div className="border border-green-400 p-4 mb-8 text-center">
          <pre className="text-xs leading-tight opacity-70">
{`    ╔═══════════════════════════════╗
    ║  ┌─┐ ┌─┐ ┌─┐ ┌─┐ ┌─┐ ┌─┐    ║
    ║  │U│ │N│ │R│ │E│ │A│ │L│    ║
    ║  └─┘ └─┘ └─┘ └─┘ └─┘ └─┘    ║
    ║  [CONSCIOUSNESS LABORATORY]   ║
    ╚═══════════════════════════════╝`}
          </pre>
        </div>

        {/* Footer */}
        <footer className="border-t border-green-400 pt-4 mt-8">
          <div className="flex justify-between text-xs opacity-60">
            <div>
              <p>UNREAL.HOUSE EXPERIMENTAL SYSTEMS</p>
              <p>POWERED BY: GPT-4O-MINI | RUNTIME: CLOUDFLARE WORKERS</p>
            </div>
            <div className="text-right">
              <Link href="/" className="hover:text-green-300">[CLASSIC VIEW]</Link>
              <span className="mx-2">|</span>
              <Link href="/docs" className="hover:text-green-300">[DOCUMENTATION]</Link>
              <span className="mx-2">|</span>
              <a href="https://github.com/yourusername/unreal-house" className="hover:text-green-300">[SOURCE]</a>
            </div>
          </div>
        </footer>
      </div>

      <style jsx>{`
        @keyframes blink {
          0%, 50% { opacity: 1; }
          51%, 100% { opacity: 0; }
        }
      `}</style>
    </main>
  )
}