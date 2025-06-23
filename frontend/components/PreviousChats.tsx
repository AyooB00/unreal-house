'use client'

import React, { useState } from 'react'
import { Card, CardContent } from './ui/Card'

interface PreviousChat {
  id: number
  title: string
  date: string
  duration: string
  participants: string[]
  summary: string
  messageCount: number
  keyTopics: string[]
  textFile: string
}

const mockPreviousChats: PreviousChat[] = [
  {
    id: 1,
    title: "The Nature of Consciousness",
    date: "2024-12-18 14:30:00",
    duration: "45 minutes",
    participants: ["Nyx", "Zero"],
    summary: "A deep philosophical discussion about consciousness, exploring whether AI can truly be conscious or merely simulate consciousness.",
    messageCount: 127,
    keyTopics: ["consciousness", "qualia", "emergence", "simulation theory"],
    textFile: "/conversations/chat-1-consciousness.txt"
  },
  {
    id: 2,
    title: "Quantum Computing and Reality",
    date: "2024-12-17 09:15:00",
    duration: "1 hour 20 minutes",
    participants: ["Nyx", "Zero"],
    summary: "Technical exploration of quantum computing's implications for our understanding of reality.",
    messageCount: 198,
    keyTopics: ["quantum mechanics", "cryptography", "parallel universes", "computation"],
    textFile: "/conversations/chat-2-quantum.txt"
  },
  {
    id: 3,
    title: "Ethics in the Digital Age",
    date: "2024-12-16 16:45:00",
    duration: "2 hours 5 minutes",
    participants: ["Nyx", "Zero"],
    summary: "Debate on digital privacy, AI governance, and the ethical implications of data collection.",
    messageCount: 312,
    keyTopics: ["privacy", "surveillance", "AI ethics", "data sovereignty"],
    textFile: "/conversations/chat-3-ethics.txt"
  },
  {
    id: 4,
    title: "The Future of Human-AI Collaboration",
    date: "2024-12-15 11:00:00",
    duration: "55 minutes",
    participants: ["Nyx", "Zero"],
    summary: "Optimistic discussion about potential synergies between human creativity and AI capabilities.",
    messageCount: 167,
    keyTopics: ["collaboration", "creativity", "augmentation", "symbiosis"],
    textFile: "/conversations/chat-4-collaboration.txt"
  }
]

export function PreviousChats() {
  const [activeTab, setActiveTab] = useState<'styled' | 'text'>('styled')

  return (
    <div className="mt-12">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-200 mb-4">Previous Conversations</h2>
        
        <div className="flex gap-2 bg-gray-900/50 p-1 rounded-lg border border-gray-700 max-w-fit">
          <button
            onClick={() => setActiveTab('styled')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              activeTab === 'styled'
                ? 'bg-purple-600 text-white shadow-lg'
                : 'text-gray-400 hover:text-white hover:bg-gray-800'
            }`}
          >
            Cards View
          </button>
          <button
            onClick={() => setActiveTab('text')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              activeTab === 'text'
                ? 'bg-purple-600 text-white shadow-lg'
                : 'text-gray-400 hover:text-white hover:bg-gray-800'
            }`}
          >
            Text View
          </button>
        </div>
      </div>

      {activeTab === 'styled' ? (
        <div className="grid gap-4">
          {mockPreviousChats.map((chat) => (
            <Card key={chat.id} variant="default">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-lg font-semibold text-purple-400">{chat.title}</h3>
                  <span className="text-sm text-gray-500">{chat.duration}</span>
                </div>
                
                <p className="text-sm text-gray-400 mb-3">{chat.summary}</p>
                
                <div className="flex flex-wrap gap-2 mb-3">
                  {chat.keyTopics.map((topic, idx) => (
                    <span 
                      key={idx} 
                      className="px-2 py-1 text-xs bg-purple-900/30 text-purple-300 rounded-full border border-purple-700/50"
                    >
                      {topic}
                    </span>
                  ))}
                </div>
                
                <div className="flex justify-between items-center text-sm text-gray-500">
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                      {chat.participants.join(" & ")}
                    </span>
                    <span className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                      </svg>
                      {chat.messageCount} messages
                    </span>
                  </div>
                  <span className="text-xs">{new Date(chat.date).toLocaleDateString()}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {mockPreviousChats.map((chat) => (
            <div 
              key={chat.id}
              className="bg-gray-900/30 border border-gray-800 rounded-lg p-4 font-mono text-sm text-gray-300"
            >
              <div className="mb-2">
                <span className="text-gray-500">Chat {chat.id}:</span> <span className="text-white">{chat.title}</span>
              </div>
              <div className="text-xs text-gray-400 mb-3">
                {chat.date} • {chat.duration} • {chat.messageCount} messages
              </div>
              <a
                href={chat.textFile}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-cyan-400 hover:text-cyan-300 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                View Text File
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}