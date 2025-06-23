import { useEffect, useRef, useState, useCallback } from 'react'
import type { WebSocketMessage } from '../../shared/types'
import { TIMING } from '../../shared/constants'

export interface UseWebSocketOptions {
  url: string
  onMessage?: (message: WebSocketMessage) => void
  onError?: (error: Event) => void
  onOpen?: () => void
  onClose?: () => void
  reconnect?: boolean
  reconnectDelay?: number
  maxReconnectAttempts?: number
}

export interface UseWebSocketReturn {
  sendMessage: (message: WebSocketMessage) => void
  connectionState: 'connecting' | 'connected' | 'disconnected' | 'error'
  lastError: Error | null
  reconnect: () => void
  reconnectAttempt: number
  isReconnecting: boolean
}

export function useWebSocket({
  url,
  onMessage,
  onError,
  onOpen,
  onClose,
  reconnect = true,
  reconnectDelay = TIMING.RECONNECT_DELAY,
  maxReconnectAttempts = 5
}: UseWebSocketOptions): UseWebSocketReturn {
  const ws = useRef<WebSocket | null>(null)
  const reconnectCount = useRef(0)
  const reconnectTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)
  const isReconnecting = useRef(false)
  const initialConnectionDelay = useRef<ReturnType<typeof setTimeout> | null>(null)
  const isMounted = useRef(true)
  const [connectionState, setConnectionState] = useState<UseWebSocketReturn['connectionState']>('connecting')
  const [lastError, setLastError] = useState<Error | null>(null)

  const connect = useCallback(() => {
    if (isReconnecting.current || (ws.current && ws.current.readyState === WebSocket.CONNECTING)) {
      // Connection already in progress, skipping
      return
    }
    
    if (ws.current && (ws.current.readyState === WebSocket.OPEN || ws.current.readyState === WebSocket.CONNECTING)) {
      // Closing existing connection before creating new one
      ws.current.close()
      ws.current = null
    }
    
    if (reconnectCount.current >= maxReconnectAttempts) {
      // Max reconnection attempts reached
      setConnectionState('error')
      setLastError(new Error('Max reconnection attempts reached'))
      return
    }
    
    try {
      isReconnecting.current = true
      setConnectionState('connecting')
      setLastError(null)
      
      // Connecting to WebSocket
      ws.current = new WebSocket(url)
      
      ws.current.onopen = () => {
        if (!isMounted.current) return
        // WebSocket opened successfully
        setConnectionState('connected')
        reconnectCount.current = 0
        isReconnecting.current = false
        onOpen?.()
      }
      
      ws.current.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data)
          onMessage?.(message)
        } catch (error) {
          // Failed to parse WebSocket message
          setLastError(new Error('Invalid message format'))
        }
      }
      
      ws.current.onerror = (event) => {
        // WebSocket error
        setConnectionState('error')
        setLastError(new Error('WebSocket connection error'))
        onError?.(event)
      }
      
      ws.current.onclose = () => {
        if (!isMounted.current) return
        // WebSocket closed
        setConnectionState('disconnected')
        isReconnecting.current = false
        onClose?.()
        
        if (reconnectTimeout.current) {
          clearTimeout(reconnectTimeout.current)
          reconnectTimeout.current = null
        }
        
        if (reconnect && reconnectCount.current < maxReconnectAttempts && isMounted.current) {
          reconnectCount.current++
          // Scheduling reconnection with exponential backoff
          const backoffDelay = Math.min(reconnectDelay * Math.pow(2, reconnectCount.current - 1), 30000)
          
          reconnectTimeout.current = setTimeout(() => {
            if (isMounted.current) {
              // Attempting reconnection...
              connect()
            }
          }, backoffDelay)
        } else if (reconnectCount.current >= maxReconnectAttempts) {
          // Max reconnection attempts reached, giving up
          setLastError(new Error('Max reconnection attempts reached'))
          setConnectionState('error')
        }
      }
    } catch (error) {
      console.error('Failed to create WebSocket:', error)
      setConnectionState('error')
      setLastError(error as Error)
      isReconnecting.current = false
    }
  }, [url, onMessage, onError, onOpen, onClose, reconnect, reconnectDelay, maxReconnectAttempts])

  const sendMessage = useCallback((message: WebSocketMessage) => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      try {
        ws.current.send(JSON.stringify(message))
      } catch (error) {
        console.error('Failed to send message:', error)
        setLastError(new Error('Failed to send message'))
      }
    } else {
      console.warn('WebSocket is not connected')
      setLastError(new Error('WebSocket is not connected'))
    }
  }, [])

  const reconnectManually = useCallback(() => {
    if (reconnectTimeout.current) {
      clearTimeout(reconnectTimeout.current)
    }
    
    if (ws.current) {
      ws.current.close()
    }
    
    reconnectCount.current = 0
    connect()
  }, [connect])

  useEffect(() => {
    isMounted.current = true
    
    initialConnectionDelay.current = setTimeout(() => {
      if (isMounted.current) {
        connect()
      }
    }, 1000)
    
    return () => {
      // Cleaning up WebSocket connection
      isMounted.current = false
      isReconnecting.current = false
      reconnectCount.current = 0
      
      if (initialConnectionDelay.current) {
        clearTimeout(initialConnectionDelay.current)
        initialConnectionDelay.current = null
      }
      
      if (reconnectTimeout.current) {
        clearTimeout(reconnectTimeout.current)
        reconnectTimeout.current = null
      }
      
      if (ws.current) {
        ws.current.onopen = null
        ws.current.onmessage = null
        ws.current.onerror = null
        ws.current.onclose = null
        
        if (ws.current.readyState === WebSocket.OPEN || ws.current.readyState === WebSocket.CONNECTING) {
          ws.current.close()
        }
        ws.current = null
      }
    }
  }, [connect])

  return {
    sendMessage,
    connectionState,
    lastError,
    reconnect: reconnectManually,
    reconnectAttempt: reconnectCount.current,
    isReconnecting: isReconnecting.current
  }
}