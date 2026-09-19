import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

// One shared socket connection per authenticated session, re-created if the
// token changes. Components join/leave project rooms as needed.
export function useSocket() {
  const socketRef = useRef(null);

  useEffect(() => {
    const token = localStorage.getItem('devcollab_token');
    if (!token) return undefined;

    const socket = io(SOCKET_URL, { auth: { token }, transports: ['websocket', 'polling'] });
    socketRef.current = socket;

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, []);

  return socketRef;
}
