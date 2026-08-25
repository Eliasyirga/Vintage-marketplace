import { io, Socket } from 'socket.io-client'
import type {
  ConversationMessage,
  TypingEvent,
  ReadEvent,
  MessageDeletedEvent,
  PresenceEvent,
} from '../types/conversation'

const SOCKET_URL = import.meta.env.VITE_API_URL?.replace('/api', '') ?? 'http://localhost:5000'

let socket: Socket | null = null

function getToken(): string | null {
  return localStorage.getItem('accessToken')
}

/**
 * Create or return the existing socket connection.
 * Should be called after successful authentication.
 */
export function connectSocket(): Socket {
  if (socket && socket.connected) return socket

  socket = io(SOCKET_URL, {
    auth: { token: getToken() },
    withCredentials: true,
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
  })

  socket.on('connect', () => {
    console.debug('[Socket] Connected:', socket?.id)
  })

  socket.on('connect_error', (err) => {
    console.warn('[Socket] Connection error:', err.message)
  })

  socket.on('disconnect', (reason) => {
    console.debug('[Socket] Disconnected:', reason)
  })

  return socket
}

/**
 * Get the current socket instance without creating a new connection.
 */
export function getSocket(): Socket | null {
  return socket
}

/**
 * Disconnect and clean up the socket.
 * Should be called on logout.
 */
export function disconnectSocket(): void {
  if (socket) {
    socket.disconnect()
    socket = null
  }
}

/**
 * Update the auth token (e.g. after a token refresh) and reconnect.
 */
export function updateSocketToken(): void {
  if (socket) {
    disconnectSocket()
    connectSocket()
  }
}

// ── Room Management ───────────────────────────────────────────────────────────

export function joinConversation(conversationId: string): void {
  socket?.emit('join:conversation', conversationId)
}

export function leaveConversation(conversationId: string): void {
  socket?.emit('leave:conversation', conversationId)
}

// ── Typing ────────────────────────────────────────────────────────────────────

export function emitTypingStart(conversationId: string): void {
  socket?.emit('typing:start', { conversationId })
}

export function emitTypingStop(conversationId: string): void {
  socket?.emit('typing:stop', { conversationId })
}

// ── Event Listeners ───────────────────────────────────────────────────────────

export function onNewMessage(handler: (msg: ConversationMessage) => void): () => void {
  socket?.on('message:new', handler)
  return () => socket?.off('message:new', handler)
}

export function onMessageRead(handler: (event: ReadEvent) => void): () => void {
  socket?.on('message:read', handler)
  return () => socket?.off('message:read', handler)
}

export function onMessageDeleted(handler: (event: MessageDeletedEvent) => void): () => void {
  socket?.on('message:deleted', handler)
  return () => socket?.off('message:deleted', handler)
}

export function onTypingStart(handler: (event: TypingEvent) => void): () => void {
  socket?.on('typing:start', handler)
  return () => socket?.off('typing:start', handler)
}

export function onTypingStop(handler: (event: TypingEvent) => void): () => void {
  socket?.on('typing:stop', handler)
  return () => socket?.off('typing:stop', handler)
}

export function onPresenceOnline(handler: (event: PresenceEvent) => void): () => void {
  socket?.on('presence:online', handler)
  return () => socket?.off('presence:online', handler)
}

export function onPresenceOffline(handler: (event: PresenceEvent) => void): () => void {
  socket?.on('presence:offline', handler)
  return () => socket?.off('presence:offline', handler)
}
