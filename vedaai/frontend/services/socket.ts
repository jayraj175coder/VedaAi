import { io, Socket } from 'socket.io-client'
import Cookies from 'js-cookie'

let socket: Socket | null = null

export const getSocket = (): Socket => {
  if (!socket) {
    const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000'
    socket = io(SOCKET_URL, {
      auth: { token: Cookies.get('auth_token') },
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
      transports: ['websocket', 'polling'],
    })

    socket.on('connect', () => {
      console.log('Socket connected:', socket?.id)
    })

    socket.on('disconnect', () => {
      console.log('Socket disconnected')
    })

    socket.on('connect_error', (err) => {
      console.warn('Socket connection error:', err.message)
    })
  }
  return socket
}

export const joinUserRoom = (userId: string) => {
  const s = getSocket()
  s.emit('join:user', userId)
}

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect()
    socket = null
  }
}
