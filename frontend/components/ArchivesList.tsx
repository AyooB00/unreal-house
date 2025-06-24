'use client'

import { useState } from 'react'
import { MessageArchive } from '../../shared/types'
import { Button } from './ui/Button'
import { Card, CardContent } from './ui/Card'

interface ArchivesListProps {
  archives: MessageArchive[]
  roomType: string
  theme?: 'crypto' | 'philosophy' | 'classic'
}

interface SearchResult {
  id: string
  archived_at: string
  message_count: number
  total_tokens: number
  summary: string
  similarity: number
}

export function ArchivesList({ archives, roomType, theme = 'crypto' }: ArchivesListProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  
  const handleSearch = async () => {
    if (!searchQuery.trim()) return
    
    setIsSearching(true)
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8787'
      const response = await fetch(`${apiUrl}/api/${roomType}/search?q=${encodeURIComponent(searchQuery)}`)
      if (response.ok) {
        const data = await response.json()
        setSearchResults(data.results || [])
      }
    } catch (error) {
      console.error('Search failed:', error)
    } finally {
      setIsSearching(false)
    }
  }
  
  const downloadArchive = (archive: MessageArchive, index: number) => {
    // Format messages as text
    const header = `UNREAL HOUSE - ${roomType.toUpperCase()} ROOM ARCHIVE #${index + 1}
Date: ${new Date(archive.archivedAt).toLocaleString()}
Messages: ${archive.totalMessages}
Tokens Used: ${archive.totalTokens}
=====================================

`
    
    const messages = archive.messages.map(msg => 
      `[${new Date(msg.timestamp).toLocaleTimeString()}] ${msg.speaker.toUpperCase()}: "${msg.text}"`
    ).join('\n\n')
    
    const content = header + messages
    
    // Create blob and open in new tab
    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    
    // Open in new tab instead of downloading
    const newWindow = window.open(url, '_blank')
    
    // Clean up the URL after a short delay
    setTimeout(() => {
      URL.revokeObjectURL(url)
    }, 1000)
  }
  
  if (archives.length === 0) return null
  
  const getThemeClasses = () => {
    switch (theme) {
      case 'crypto':
        return {
          container: 'border-green-500/30 bg-black/50',
          header: 'text-green-400',
          button: 'text-green-400 hover:text-green-300 border-green-500/50',
          card: 'bg-black/80 border-green-500/20',
          text: 'text-green-300',
          meta: 'text-green-600'
        }
      case 'philosophy':
        return {
          container: 'border-gray-200 bg-white/50',
          header: 'text-gray-900',
          button: 'text-blue-600 hover:text-blue-700 border-gray-300',
          card: 'bg-white/90 border-gray-200',
          text: 'text-gray-700',
          meta: 'text-gray-500'
        }
      default:
        return {
          container: 'border-purple-500/30 bg-black/50',
          header: 'text-purple-400',
          button: 'text-purple-400 hover:text-purple-300 border-purple-500/50',
          card: 'bg-black/80 border-purple-500/20',
          text: 'text-purple-300',
          meta: 'text-purple-600'
        }
    }
  }
  
  const styles = getThemeClasses()
  
  return (
    <div className={`mt-6 border rounded-lg p-4 ${styles.container}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className={`text-sm font-bold ${styles.header} ${theme === 'crypto' ? 'font-mono' : ''}`}>
          {theme === 'crypto' ? '> ARCHIVED_SESSIONS' : 'Archived Sessions'} ({archives.length})
        </h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          className={styles.button}
        >
          {isExpanded ? (theme === 'crypto' ? '[-]' : '▼') : (theme === 'crypto' ? '[+]' : '▶')}
        </Button>
      </div>
      
      {isExpanded && (
        <div className="space-y-4">
          {/* Search Section */}
          <div className="flex gap-2">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder={theme === 'crypto' ? 'SEARCH_ARCHIVES...' : 'Search archives...'}
              className={`flex-1 px-3 py-2 text-sm rounded-md border ${
                theme === 'crypto' 
                  ? 'bg-black/50 border-green-500/30 text-green-400 placeholder-green-600 font-mono' 
                  : theme === 'philosophy'
                  ? 'bg-white/50 border-gray-300 text-gray-700 placeholder-gray-400'
                  : 'bg-black/50 border-purple-500/30 text-purple-400 placeholder-purple-600'
              }`}
            />
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSearch}
              disabled={isSearching || !searchQuery.trim()}
              className={`${styles.button} ${theme === 'crypto' ? 'font-mono' : ''}`}
            >
              {isSearching ? '...' : theme === 'crypto' ? '[SEARCH]' : 'Search'}
            </Button>
          </div>
          
          {/* Search Results */}
          {searchResults.length > 0 && (
            <div className="space-y-2">
              <p className={`text-xs ${styles.meta} ${theme === 'crypto' ? 'font-mono' : ''}`}>
                {theme === 'crypto' ? `> RESULTS: ${searchResults.length}` : `Found ${searchResults.length} results`}
              </p>
              {searchResults.map((result, index) => (
                <Card key={result.id} variant="default" className={`${styles.card} border-2`}>
                  <CardContent className="p-3">
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <p className={`text-sm font-medium ${styles.text} ${theme === 'crypto' ? 'font-mono' : ''}`}>
                          {theme === 'crypto' ? `MATCH_${String(index + 1).padStart(2, '0')}` : `Match #${index + 1}`}
                        </p>
                        <span className={`text-xs ${styles.meta}`}>
                          {Math.round(result.similarity * 100)}% match
                        </span>
                      </div>
                      <p className={`text-xs ${styles.meta} line-clamp-2`}>
                        {result.summary}
                      </p>
                      <p className={`text-xs ${styles.meta}`}>
                        {new Date(result.archived_at).toLocaleString()} • {result.message_count} messages
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
              <button
                onClick={() => setSearchResults([])}
                className={`text-xs ${styles.button} hover:underline ${theme === 'crypto' ? 'font-mono' : ''}`}
              >
                {theme === 'crypto' ? '[CLEAR]' : 'Clear results'}
              </button>
            </div>
          )}
          
          {/* Archives List */}
          <div className="space-y-3">
            <p className={`text-xs ${styles.meta} ${theme === 'crypto' ? 'font-mono' : ''}`}>
              {theme === 'crypto' ? '> ALL_ARCHIVES' : 'All Archives'}
            </p>
            {archives.map((archive, index) => (
            <Card key={index} variant="default" className={styles.card}>
              <CardContent className="p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm font-medium ${styles.text} ${theme === 'crypto' ? 'font-mono' : ''}`}>
                      {theme === 'crypto' ? `ARCHIVE_${String(index + 1).padStart(3, '0')}` : `Archive #${index + 1}`}
                    </p>
                    <p className={`text-xs ${styles.meta} ${theme === 'crypto' ? 'font-mono' : ''}`}>
                      {new Date(archive.archivedAt).toLocaleString()} • {archive.totalMessages} messages
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => downloadArchive(archive, index)}
                    className={`${styles.button} ${theme === 'crypto' ? 'font-mono' : ''}`}
                  >
                    {theme === 'crypto' ? '[DOWNLOAD]' : 'Download'}
                  </Button>
                </div>
              </CardContent>
            </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}