import { useEffect } from 'react';
import { useSocket } from '../context/SocketContext';

/**
 * Subscribe to socket events and refresh data automatically.
 * @param {string[]} events - Socket event names to listen to
 * @param {Function} onUpdate - Callback when any event fires
 */
export const useSocketEvents = (events, onUpdate) => {
  const { socket } = useSocket();

  useEffect(() => {
    if (!socket) return;
    events.forEach((event) => socket.on(event, onUpdate));
    return () => {
      events.forEach((event) => socket.off(event, onUpdate));
    };
  }, [socket, events, onUpdate]);
};
