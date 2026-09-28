import { useState, useEffect, useRef, useCallback } from 'react';
import { getStoredToken } from '../services/api';
import { sessionService } from '../services/sessionService';
import { ttsService } from '../services/ttsService';

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  text: string;
  timestamp: string;
}

export type ConversationState =
  | 'IDLE'
  | 'STARTING'
  | 'AI_SPEAKING'
  | 'WAITING_FOR_USER'
  | 'LISTENING'
  | 'TRANSCRIBING'
  | 'PROCESSING'
  | 'PAUSED'
  | 'ERROR'
  | 'completed';

const WS_BASE_URL =
  import.meta.env.VITE_WS_URL ||
  'ws://localhost:5000/ws/conversation';

export function useConversation(
  sessionId: string | null,
  languageCode = 'en'
) {
  const [status, setStatus] =
    useState<ConversationState>('IDLE');

  const [messages, setMessages] =
    useState<Message[]>([]);

  const [currentQuestion, setCurrentQuestion] =
    useState<string>(
      'Take your time. What made you consider speaking with a therapist now?'
    );

  const [errorMessage, setErrorMessage] =
    useState<string | null>(null);

  const [isWebSocketActive, setIsWebSocketActive] =
    useState(false);

  const [lastUserUtterance, setLastUserUtterance] =
    useState<string | null>(null);

  const wsRef = useRef<WebSocket | null>(null);

  const reconnectTimerRef =
    useRef<ReturnType<typeof setTimeout> | null>(null);

  const reconnectCountRef =
    useRef(0);

  const isRequestInFlightRef =
    useRef(false);

  const lastSpokenQuestionRef =
    useRef('');

  const mountedRef =
    useRef(true);

  // --------------------------------------------------
  // TTS
  // --------------------------------------------------

  const speakCurrentQuestion = useCallback(
    (questionText: string) => {
      if (!questionText?.trim()) return;

      const trimmedText = questionText.trim();

      if (
        trimmedText === lastSpokenQuestionRef.current &&
        ttsService.isSpeaking()
      ) {
        return;
      }

      lastSpokenQuestionRef.current = trimmedText;

      console.log(
        '[TRIORA TTS] Speaking:',
        trimmedText
      );

      setStatus('AI_SPEAKING');

      ttsService.speak(
        trimmedText,
        languageCode,
        () => {
          console.log('[TRIORA TTS] Started');
          setStatus('AI_SPEAKING');
        },
        () => {
          console.log('[TRIORA TTS] Finished');

          if (mountedRef.current) {
            setStatus('WAITING_FOR_USER');
          }
        }
      );
    },
    [languageCode]
  );

  // --------------------------------------------------
  // Incoming WebSocket messages
  // --------------------------------------------------

  const handleIncomingMessage = useCallback(
    (data: any) => {
      console.log(
        '[WS] Received:',
        data
      );

      switch (data.type) {

        // --------------------------------------------
        // Session started
        // --------------------------------------------

        case 'session_started':

          console.log(
            '[WS] Session started:',
            data.sessionId
          );

          setErrorMessage(null);
          setStatus('WAITING_FOR_USER');

          break;

        // --------------------------------------------
        // Backend is processing user response
        // --------------------------------------------

        case 'processing':

          console.log(
            '[WS] AI processing...'
          );

          // IMPORTANT:
          // DO NOT set isRequestInFlightRef = false here.

          setStatus('PROCESSING');

          break;

        // --------------------------------------------
        // Gemini response
        // --------------------------------------------

        case 'assistant_message':

          console.log(
            '[WS] AI response:',
            data.text
          );

          // NOW the request is actually finished.
          isRequestInFlightRef.current = false;

          setCurrentQuestion(data.text);

          setMessages(prev => [
            ...prev,
            {
              id: `${Date.now()}-${Math.random()}`,
              role: 'assistant',
              text: data.text,
              timestamp:
                data.timestamp ||
                new Date().toISOString()
            }
          ]);

          speakCurrentQuestion(data.text);

          break;

        // --------------------------------------------
        // Session completed
        // --------------------------------------------

        case 'session_completed':

          console.log(
            '[WS] Session completed'
          );

          isRequestInFlightRef.current = false;

          setStatus('completed');

          break;

        // --------------------------------------------
        // AI error
        // --------------------------------------------

        case 'conversation_error':
        case 'error':

          console.error(
            '[WS] Conversation error:',
            data
          );

          isRequestInFlightRef.current = false;

          setErrorMessage(
            "We couldn't process your response right now. Please try again in a moment."
          );

          setStatus('ERROR');

          break;

        default:

          console.log(
            '[WS] Unknown message:',
            data
          );

          break;
      }
    },
    [speakCurrentQuestion]
  );

  // --------------------------------------------------
  // WebSocket connection
  // --------------------------------------------------

  const connectWebSocket = useCallback(() => {

    if (!sessionId) {
      return;
    }

    const token = getStoredToken();

    if (!token) {
      setErrorMessage(
        'Authentication token missing.'
      );

      setStatus('ERROR');

      return;
    }

    // --------------------------------------------
    // Prevent duplicate WebSockets
    // --------------------------------------------

    const existingSocket = wsRef.current;

    if (
      existingSocket &&
      (
        existingSocket.readyState ===
          WebSocket.OPEN ||
        existingSocket.readyState ===
          WebSocket.CONNECTING
      )
    ) {
      console.log(
        '[WS] Already connected/connecting. Skipping.'
      );

      return;
    }

    console.log(
      '[WS] Creating ONE connection for session:',
      sessionId
    );

    setStatus('STARTING');

    const wsUrl =
      `${WS_BASE_URL}?token=${encodeURIComponent(token)}`;

    const ws = new WebSocket(wsUrl);

    wsRef.current = ws;

    ws.onopen = () => {

      console.log(
        '[WS] CONNECTED'
      );

      reconnectCountRef.current = 0;

      setIsWebSocketActive(true);

      ws.send(
        JSON.stringify({
          type: 'start_session',
          sessionId
        })
      );

      console.log(
        '[WS] start_session SENT'
      );
    };

    ws.onmessage = event => {

      try {

        const data =
          JSON.parse(event.data);

        handleIncomingMessage(data);

      } catch (error) {

        console.error(
          '[WS] Invalid message:',
          error
        );

      }
    };

    ws.onerror = error => {

      console.error(
        '[WS] Error:',
        error
      );

      setIsWebSocketActive(false);
    };

    ws.onclose = event => {

      console.log(
        '[WS] CLOSED:',
        {
          code: event.code,
          reason: event.reason,
          clean: event.wasClean
        }
      );

      setIsWebSocketActive(false);

      // Only clear our reference if this
      // is still the active socket.
      if (wsRef.current === ws) {
        wsRef.current = null;
      }

      // Do not reconnect completed sessions.
      if (
        !mountedRef.current ||
        status === 'completed'
      ) {
        return;
      }

      // Controlled reconnect.
      if (
        reconnectCountRef.current < 2
      ) {

        reconnectCountRef.current++;

        console.log(
          `[WS] Reconnecting (${reconnectCountRef.current}/2)...`
        );

        reconnectTimerRef.current =
          setTimeout(() => {

            if (mountedRef.current) {
              connectWebSocket();
            }

          }, 2000);
      }
    };

  }, [
    sessionId,
    handleIncomingMessage
    // IMPORTANT:
    // status is NOT here
  ]);

  // --------------------------------------------------
  // Connect ONCE when session changes
  // --------------------------------------------------

  useEffect(() => {

    mountedRef.current = true;

    if (sessionId) {
      connectWebSocket();
    }

    return () => {

      mountedRef.current = false;

      console.log(
        '[WS] Cleaning up session'
      );

      if (reconnectTimerRef.current) {
        clearTimeout(
          reconnectTimerRef.current
        );

        reconnectTimerRef.current = null;
      }

      const ws = wsRef.current;

      if (ws) {

        wsRef.current = null;

        if (
          ws.readyState ===
            WebSocket.OPEN ||
          ws.readyState ===
            WebSocket.CONNECTING
        ) {
          ws.close(
            1000,
            'Session component unmounted'
          );
        }
      }

      ttsService.stop();

    };

  }, [sessionId, connectWebSocket]);

  // --------------------------------------------------
  // Send FINAL user utterance
  // --------------------------------------------------

  const sendMessage = useCallback(
    async (
      text: string,
      voiceMetrics?: any
    ) => {

      if (
        !sessionId ||
        !text?.trim()
      ) {
        return;
      }

      // ------------------------------------------
      // Prevent duplicate Gemini requests
      // ------------------------------------------

      if (
        isRequestInFlightRef.current
      ) {

        console.warn(
          '[WS] Request already in flight. Ignoring duplicate.'
        );

        return;
      }

      const trimmedText =
        text.trim();

      console.log(
        '[TRIORA] FINAL USER UTTERANCE:',
        trimmedText
      );

      isRequestInFlightRef.current =
        true;

      setLastUserUtterance(
        trimmedText
      );

      setErrorMessage(null);

      ttsService.stop();

      setMessages(prev => [
        ...prev,
        {
          id: `${Date.now()}-${Math.random()}`,
          role: 'user',
          text: trimmedText,
          timestamp:
            new Date().toISOString()
        }
      ]);

      setStatus('PROCESSING');

      // ------------------------------------------
      // WebSocket ONLY
      // ------------------------------------------

      const ws = wsRef.current;

      if (
        ws &&
        ws.readyState === WebSocket.OPEN
      ) {

        console.log(
          '[WS] Sending ONE user_message'
        );

        ws.send(
          JSON.stringify({
            type: 'user_message',
            sessionId,
            text: trimmedText,
            status: 'answered',
            voiceMetrics
          })
        );

        return;
      }

      // ------------------------------------------
      // REST fallback
      // ------------------------------------------

      console.warn(
        '[WS] WebSocket unavailable. Using REST fallback.'
      );

      try {

        const res =
          await sessionService.respondToSession(
            sessionId,
            {
              text: trimmedText,
              status: 'answered',
              voiceMetrics
            }
          );

        isRequestInFlightRef.current =
          false;

        const data = res.data;

        if (
          res.success &&
          data
        ) {

          if (
            data.action === 'complete'
          ) {

            setStatus('completed');

          } else {

            setCurrentQuestion(
              data.question
            );

            setMessages(prev => [
              ...prev,
              {
                id: `${Date.now()}-${Math.random()}`,
                role: 'assistant',
                text: data.question,
                timestamp:
                  new Date().toISOString()
              }
            ]);

            speakCurrentQuestion(
              data.question
            );
          }

        } else {

          setErrorMessage(
            "We couldn't process your response right now. Please try again in a moment."
          );

          setStatus('ERROR');
        }

      } catch (error) {

        console.error(
          '[REST] Response failed:',
          error
        );

        isRequestInFlightRef.current =
          false;

        setErrorMessage(
          "We couldn't process your response right now. Please try again in a moment."
        );

        setStatus('ERROR');
      }

    },
    [
      sessionId,
      speakCurrentQuestion
    ]
  );

  // --------------------------------------------------
  // Retry
  // --------------------------------------------------

  const retryLastUtterance =
    useCallback(async () => {

      if (!lastUserUtterance) {
        return;
      }

      await sendMessage(
        lastUserUtterance
      );

    }, [
      lastUserUtterance,
      sendMessage
    ]);

  // --------------------------------------------------
  // Finish session
  // --------------------------------------------------

  const finishSession =
    useCallback(async () => {

      if (!sessionId) {
        return;
      }

      setStatus('PROCESSING');

      ttsService.stop();

      const ws =
        wsRef.current;

      if (
        ws &&
        ws.readyState === WebSocket.OPEN
      ) {

        ws.send(
          JSON.stringify({
            type: 'end_session',
            sessionId
          })
        );

      } else {

        try {

          await sessionService.updateSession(
            sessionId,
            {
              status: 'completed'
            }
          );

          setStatus('completed');

        } catch (error) {

          console.error(
            '[Session] Finish failed:',
            error
          );

          setErrorMessage(
            "We couldn't save your session. Please try again."
          );

          setStatus('ERROR');
        }
      }

    }, [
      sessionId
    ]);

  return {
    status,
    setStatus,
    messages,
    currentQuestion,
    errorMessage,
    isWebSocketActive,
    lastUserUtterance,
    sendMessage,
    retryLastUtterance,
    finishSession,
    speakCurrentQuestion
  };
}