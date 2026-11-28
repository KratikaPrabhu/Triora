/**
 * Triora IndexedDB Offline Caching Service
 * Persists live session state, partial transcripts, and physiological vitals
 * so that unexpected network drops or accidental tab closures do not result in lost data.
 */

const DB_NAME = 'triora_offline_cache';
const DB_VERSION = 1;
const STORE_NAME = 'active_sessions';

export interface CachedSessionData {
  sessionId: string;
  language: string;
  timerSeconds: number;
  lastUpdated: number;
  currentQuestion?: string;
  transcriptMessages: Array<{
    id: string;
    role: 'user' | 'assistant' | 'system';
    text: string;
    timestamp: string;
  }>;
  vitalsReadings?: Array<{
    timestamp: number;
    conductance: number;
    resistance: number;
    heartRate: number;
    hrv: number;
  }>;
}

class SessionCacheService {
  private dbPromise: Promise<IDBDatabase> | null = null;

  private getDB(): Promise<IDBDatabase> {
    if (this.dbPromise) return this.dbPromise;

    this.dbPromise = new Promise((resolve, reject) => {
      if (typeof window === 'undefined' || !window.indexedDB) {
        return reject(new Error('IndexedDB is not supported in this environment'));
      }

      const request = window.indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: 'sessionId' });
        }
      };

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onerror = () => {
        reject(request.error);
      };
    });

    return this.dbPromise;
  }

  /**
   * Save or update session progress in local IndexedDB storage
   */
  async saveSession(data: CachedSessionData): Promise<void> {
    try {
      const db = await this.getDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        const request = store.put({ ...data, lastUpdated: Date.now() });

        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    } catch (err) {
      console.warn('[Cache] Could not save session to IndexedDB:', err);
    }
  }

  /**
   * Retrieve cached session by sessionId
   */
  async getSession(sessionId: string): Promise<CachedSessionData | null> {
    try {
      const db = await this.getDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readonly');
        const store = tx.objectStore(STORE_NAME);
        const request = store.get(sessionId);

        request.onsuccess = () => {
          resolve(request.result || null);
        };
        request.onerror = () => reject(request.error);
      });
    } catch (err) {
      console.warn('[Cache] Could not retrieve session from IndexedDB:', err);
      return null;
    }
  }

  /**
   * Remove cached session upon successful completion or discard
   */
  async clearSession(sessionId: string): Promise<void> {
    try {
      const db = await this.getDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        const request = store.delete(sessionId);

        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    } catch (err) {
      console.warn('[Cache] Could not clear session from IndexedDB:', err);
    }
  }
}

export const sessionCacheService = new SessionCacheService();
export default sessionCacheService;
