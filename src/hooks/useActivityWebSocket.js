
import { useEffect, useRef, useState, useCallback } from 'react';
import { toast } from 'sonner';

export const useActivityWebSocket = (onActivityUpdate) => {
  const ws = useRef(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionAttempts, setConnectionAttempts] = useState(0);
  const reconnectTimeout = useRef(null);

  const connect = useCallback(() => {
    try {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const host = window.location.host;
      const wsUrl = `${protocol}//${host}/ws/activities`;
      
      ws.current = new WebSocket(wsUrl);

      ws.current.onopen = () => {
        console.log('Connected to activity WebSocket');
        setIsConnected(true);
        setConnectionAttempts(0);
        
        // Subscribe to activity updates
        ws.current.send(JSON.stringify({ type: 'SUBSCRIBE_ACTIVITIES' }));
      };

      ws.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          switch (data.type) {
            case 'NEW_ACTIVITY':
              onActivityUpdate?.(data.data, 'new');
              toast.info('New activity logged', {
                description: data.data.description,
                duration: 3000
              });
              break;
              
            case 'ACTIVITY_UPDATED':
              onActivityUpdate?.(data.data, 'updated');
              break;
              
            case 'INITIAL_ACTIVITIES':
              onActivityUpdate?.(data.data, 'initial');
              break;
              
            case 'ACTIVITY_STATS':
              onActivityUpdate?.(data.data, 'stats');
              break;
              
            default:
              console.log('Unknown WebSocket message:', data);
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      ws.current.onclose = (event) => {
        console.log('Activity WebSocket disconnected:', event.code, event.reason);
        setIsConnected(false);
        
        // Attempt to reconnect with exponential backoff
        if (connectionAttempts < 5) {
          const delay = Math.pow(2, connectionAttempts) * 1000; // 1s, 2s, 4s, 8s, 16s
          
          reconnectTimeout.current = setTimeout(() => {
            setConnectionAttempts(prev => prev + 1);
            connect();
          }, delay);
        } else {
          toast.error('Lost connection to activity updates', {
            description: 'Please refresh the page to reconnect'
          });
        }
      };

      ws.current.onerror = (error) => {
        console.error('Activity WebSocket error:', error);
        setIsConnected(false);
      };

    } catch (error) {
      console.error('Failed to connect to activity WebSocket:', error);
      setIsConnected(false);
    }
  }, [onActivityUpdate, connectionAttempts]);

  const disconnect = useCallback(() => {
    if (reconnectTimeout.current) {
      clearTimeout(reconnectTimeout.current);
      reconnectTimeout.current = null;
    }
    
    if (ws.current) {
      ws.current.send(JSON.stringify({ type: 'UNSUBSCRIBE_ACTIVITIES' }));
      ws.current.close();
      ws.current = null;
    }
    
    setIsConnected(false);
    setConnectionAttempts(0);
  }, []);

  const sendMessage = useCallback((message) => {
    if (ws.current && isConnected) {
      ws.current.send(JSON.stringify(message));
    }
  }, [isConnected]);

  const requestRefresh = useCallback(() => {
    sendMessage({ type: 'REQUEST_REFRESH' });
  }, [sendMessage]);

  useEffect(() => {
    connect();
    
    return () => {
      disconnect();
    };
  }, []);

  return {
    isConnected,
    connectionAttempts,
    sendMessage,
    requestRefresh,
    reconnect: connect,
    disconnect
  };
};

export default useActivityWebSocket;
