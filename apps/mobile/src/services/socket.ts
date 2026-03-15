import { io, Socket } from 'socket.io-client';
import { env } from '../config/env';
import { secureStorage } from './secureStorage';
import { useAuthStore } from '../stores/authStore';
import { resetRoot } from './navigationRef';

let socket: Socket | null = null;

export function getSocket(): Socket | null {
  return socket;
}

export async function connectSocket(): Promise<Socket> {
  if (socket?.connected) {
    return socket;
  }

  const { accessToken } = await secureStorage.getTokens();

  socket = io(env.wsBaseUrl, {
    auth: { token: accessToken },
    transports: ['websocket'],
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 10000,
  });

  socket.on('connect', () => {
    socket?.emit('user:online');
  });

  // Single-device enforcement: server kicks old session on new login
  socket.on('session:revoked', ({ reason }: { reason: string }) => {
    console.warn('[Socket] Session revoked:', reason);
    disconnectSocket();
    useAuthStore.getState().logout();
    resetRoot({ index: 0, routes: [{ name: 'Auth' }] });
  });

  socket.on('disconnect', (reason) => {
    if (reason === 'io server disconnect') {
      // Server forced disconnect — do not auto-reconnect
      return;
    }
    // Otherwise socket.io will auto-reconnect
  });

  return socket;
}

export function disconnectSocket(): void {
  if (socket) {
    socket.emit('user:offline');
    socket.removeAllListeners();
    socket.disconnect();
    socket = null;
  }
}

// Typed event subscription with automatic cleanup
export function onSocketEvent<T = unknown>(
  event: string,
  handler: (data: T) => void,
): () => void {
  socket?.on(event, handler);
  return () => {
    socket?.off(event, handler);
  };
}
