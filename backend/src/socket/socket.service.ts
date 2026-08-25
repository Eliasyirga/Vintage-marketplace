import { Server as HttpServer } from 'http'
import { Server as SocketIOServer, Socket } from 'socket.io'
import jwt from 'jsonwebtoken'
import { env } from '../config/env'
import type { JwtPayload } from '../types/auth.types'

let io: SocketIOServer | null = null

// In-memory presence map: userId -> Set of socket IDs (multi-tab support)
const userSocketsMap = new Map<string, Set<string>>()

export interface AuthenticatedSocket extends Socket {
  data: {
    user: JwtPayload & { id: string }
  }
}

/**
 * Initialize Socket.IO with HTTP Server & JWT Authentication
 */
export function initSocketServer(server: HttpServer): SocketIOServer {
  io = new SocketIOServer(server, {
    cors: {
      origin: env.CLIENT_URL,
      credentials: true,
      methods: ['GET', 'POST'],
    },
    pingTimeout: 20000,
    pingInterval: 10000,
  })

  // ── Authentication Middleware ─────────────────────────────────────────────
  io.use((socket, next) => {
    try {
      const token =
        socket.handshake.auth?.token ||
        (socket.handshake.headers?.authorization?.startsWith('Bearer ')
          ? socket.handshake.headers.authorization.slice(7)
          : null)

      if (!token) {
        return next(new Error('Authentication error: Token required'))
      }

      const decoded = jwt.verify(token, env.JWT_SECRET) as JwtPayload
      if (!decoded || !decoded.sub) {
        return next(new Error('Authentication error: Invalid token payload'))
      }

      socket.data.user = { ...decoded, id: decoded.sub }
      next()
    } catch (err: any) {
      next(new Error(`Authentication error: ${err.message || 'Unauthorized'}`))
    }
  })

  // ── Connection Handler ───────────────────────────────────────────────────
  io.on('connection', (socket: AuthenticatedSocket) => {
    const user = socket.data.user
    const userId = user.id ?? user.sub

    // Register presence
    if (!userSocketsMap.has(userId)) {
      userSocketsMap.set(userId, new Set())
    }
    userSocketsMap.get(userId)!.add(socket.id)

    // Join personal user room for direct messaging & notifications
    socket.join(`user:${userId}`)

    // Broadcast online presence if this was their first socket
    if (userSocketsMap.get(userId)!.size === 1) {
      io?.emit('presence:online', { userId })
    }

    // ── Join / Leave Conversation Rooms ────────────────────────────────────
    socket.on('join:conversation', (conversationId: string) => {
      if (conversationId && typeof conversationId === 'string') {
        socket.join(`conversation:${conversationId}`)
      }
    })

    socket.on('leave:conversation', (conversationId: string) => {
      if (conversationId && typeof conversationId === 'string') {
        socket.leave(`conversation:${conversationId}`)
      }
    })

    // ── Ephemeral Typing Indicators ────────────────────────────────────────
    socket.on('typing:start', (data: { conversationId: string }) => {
      if (data?.conversationId) {
        socket.to(`conversation:${data.conversationId}`).emit('typing:start', {
          conversationId: data.conversationId,
          userId,
        })
      }
    })

    socket.on('typing:stop', (data: { conversationId: string }) => {
      if (data?.conversationId) {
        socket.to(`conversation:${data.conversationId}`).emit('typing:stop', {
          conversationId: data.conversationId,
          userId,
        })
      }
    })

    // ── Presence Inquiry ───────────────────────────────────────────────────
    socket.on('presence:check', (targetUserId: string, callback?: (online: boolean) => void) => {
      const isOnline = isUserOnline(targetUserId)
      if (typeof callback === 'function') {
        callback(isOnline)
      } else {
        socket.emit('presence:status', { userId: targetUserId, isOnline })
      }
    })

    // ── Disconnect ─────────────────────────────────────────────────────────
    socket.on('disconnect', () => {
      const userSockets = userSocketsMap.get(userId)
      if (userSockets) {
        userSockets.delete(socket.id)
        if (userSockets.size === 0) {
          userSocketsMap.delete(userId)
          io?.emit('presence:offline', { userId, lastSeenAt: new Date().toISOString() })
        }
      }
    })
  })

  return io
}

/**
 * Get Socket.IO instance
 */
export function getIO(): SocketIOServer | null {
  return io
}

/**
 * Check if a user currently has at least one active socket connection
 */
export function isUserOnline(userId: string): boolean {
  return userSocketsMap.has(userId) && (userSocketsMap.get(userId)?.size ?? 0) > 0
}

/**
 * Emit an event to all connected sockets belonging to a specific user
 */
export function emitToUser(userId: string, event: string, data: any): void {
  if (io) {
    io.to(`user:${userId}`).emit(event, data)
  }
}

/**
 * Emit an event to all participants inside a conversation room
 */
export function emitToConversation(conversationId: string, event: string, data: any): void {
  if (io) {
    io.to(`conversation:${conversationId}`).emit(event, data)
  }
}
