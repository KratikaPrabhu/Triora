import type { VitalsReading, GSRConnectionStatus } from '../../types/gsr';

export type LiveGSRCallback = (reading: VitalsReading) => void;
export type LiveStatusCallback = (status: GSRConnectionStatus) => void;

/**
 * LiveGSRService connects to the backend WebSocket or HTTP stream to receive
 * real-time readings from hardware electrodes (ESP32 GSR, Pulse Sensor).
 */
export class LiveGSRService {
  private ws: WebSocket | null = null;
  private sessionId: string = '';
  private readingListeners: Set<LiveGSRCallback> = new Set();
  private statusListeners: Set<LiveStatusCallback> = new Set();
  private connectionStatus: GSRConnectionStatus = 'disconnected';
  private reconnectTimeout: ReturnType<typeof setTimeout> | null = null;
  private isIntendedActive: boolean = false;

  constructor(sessionId: string = '') {
    this.sessionId = sessionId;
  }

  public setSessionId(sessionId: string): void {
    this.sessionId = sessionId;
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type: 'SET_SESSION_ID', sessionId }));
    }
  }

  public subscribeReadings(callback: LiveGSRCallback): () => void {
    this.readingListeners.add(callback);
    return () => this.readingListeners.delete(callback);
  }

  public subscribeStatus(callback: LiveStatusCallback): () => void {
    this.statusListeners.add(callback);
    callback(this.connectionStatus);
    return () => this.statusListeners.delete(callback);
  }

  public start(): void {
    this.isIntendedActive = true;
    this.connect();
  }

  public stop(): void {
    this.isIntendedActive = false;
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
    if (this.ws) {
      try {
        this.ws.close();
      } catch (e) {
        // ignore
      }
      this.ws = null;
    }
    this.setStatus('disconnected');
  }

  public getStatus(): GSRConnectionStatus {
    return this.connectionStatus;
  }

  private setStatus(status: GSRConnectionStatus): void {
    this.connectionStatus = status;
    this.statusListeners.forEach((listener) => {
      try {
        listener(status);
      } catch (err) {
        console.error('Error in status listener:', err);
      }
    });
  }

  private connect(): void {
    if (!this.isIntendedActive) return;

    this.setStatus('connecting');

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.hostname;
    const wsUrl = `${protocol}//${host}:5000/api/ws/gsr?sessionId=${encodeURIComponent(this.sessionId)}`;

    try {
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        this.setStatus('connected');
        if (this.ws && this.sessionId) {
          this.ws.send(JSON.stringify({ type: 'SUBSCRIBE_GSR', sessionId: this.sessionId }));
        }
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'VITALS_DATA' || data.type === 'GSR_DATA') {
            const conductance = data.conductance ?? (typeof data.value === 'number' ? +(data.value / 200).toFixed(1) : 5.2);
            const resistance = data.resistance ?? Math.round(1000 / (conductance || 1));
            const heartRate = data.heartRate ?? 72;
            const hrv = data.hrv ?? 48;

            const reading: VitalsReading = {
              timestamp: data.timestamp || Date.now(),
              sessionElapsedSeconds: typeof data.sessionElapsedSeconds === 'number' ? data.sessionElapsedSeconds : 0,
              sessionId: data.sessionId || this.sessionId,
              conductance,
              resistance,
              heartRate,
              hrv,
              value: data.value ?? Math.round(conductance * 200),
            };

            this.readingListeners.forEach((listener) => {
              try {
                listener(reading);
              } catch (err) {
                console.error('Error in LiveGSR reading listener:', err);
              }
            });
          }
        } catch (err) {
          console.error('Failed to parse incoming live GSR WebSocket message:', err);
        }
      };

      this.ws.onerror = (error) => {
        console.warn('Live GSR WebSocket connection error:', error);
        this.setStatus('error');
      };

      this.ws.onclose = () => {
        if (this.isIntendedActive) {
          this.setStatus('disconnected');
          this.reconnectTimeout = setTimeout(() => {
            if (this.isIntendedActive) {
              this.connect();
            }
          }, 5000);
        } else {
          this.setStatus('disconnected');
        }
      };
    } catch (err) {
      console.warn('Could not establish Live GSR WebSocket:', err);
      this.setStatus('error');
    }
  }
}
