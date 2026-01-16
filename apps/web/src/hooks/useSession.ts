import { useState, useEffect, useRef, useCallback } from 'react';
import { useSessionStore } from '../store/useSessionStore';

export interface Message {
    id: string;
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp: number;
}

export const useSession = (sessionId: string | null) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [isConnected, setIsConnected] = useState(false);
    const [authStatus, setAuthStatus] = useState<'pending' | 'authenticated' | 'failed'>('pending');
    const wsRef = useRef<WebSocket | null>(null);
    const { activeSession } = useSessionStore();

    // Connect to WebSocket
    useEffect(() => {
        if (!sessionId) return;

        // In a real implementation, we would get the port from config
        const wsUrl = `ws://localhost:3000/session/${sessionId}`;
        const ws = new WebSocket(wsUrl);
        wsRef.current = ws;

        ws.onopen = async () => {
            setIsConnected(true);
            setAuthStatus('pending');

            // Phase 7: Authenticate immediately
            // We assume window.api.auth.getToken() exists or similar
            // For now, we'll verify the connection flow visually
            try {
                // Mock auth for now until Auth service is fully wired in Frontend
                // const token = await window.api.auth.getToken();
                // ws.send(JSON.stringify({ type: 'auth', token }));
                setAuthStatus('authenticated');
            } catch (err) {
                console.error('Auth failed', err);
                setAuthStatus('failed');
            }
        };

        ws.onclose = () => {
            setIsConnected(false);
            setAuthStatus('pending');
        };

        ws.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);

                if (data.type === 'message') {
                    setMessages(prev => [...prev, data.payload]);
                }

                // Handle other events like 'token', 'thought', etc.
            } catch (err) {
                console.error('Failed to parse WS message', err);
            }
        };

        return () => {
            ws.close();
        };
    }, [sessionId]);

    const sendMessage = useCallback((content: string) => {
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
            const msg = {
                type: 'user_input',
                payload: { content }
            };
            wsRef.current.send(JSON.stringify(msg));

            // Optimistically add user message
            setMessages(prev => [...prev, {
                id: Date.now().toString(),
                role: 'user',
                content,
                timestamp: Date.now()
            }]);
        }
    }, [wsRef]);

    return {
        messages,
        isConnected,
        authStatus,
        sendMessage
    };
};
