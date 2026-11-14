import { db } from './db';
import type { SyncQueueItem } from './schemas';

export interface SyncStatus {
  isOnline: boolean;
  isSyncing: boolean;
  pendingCount: number;
  lastSyncedAt: string | null;
}

type SyncListener = (status: SyncStatus) => void;

class SyncManager {
  private isSyncing = false;
  private listeners: Set<SyncListener> = new Set();
  private lastSyncedAt: string | null = null;
  private syncTimer: any = null;

  constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => this.handleOnline());
      window.addEventListener('offline', () => this.notifyListeners());
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible' && navigator.onLine) {
          this.flush();
        }
      });

      // Periodic check every 30 seconds
      this.syncTimer = setInterval(() => {
        if (navigator.onLine) {
          this.flush();
        }
      }, 30000);
    }
  }

  subscribe(listener: SyncListener): () => void {
    this.listeners.add(listener);
    this.notifyListeners();
    return () => {
      this.listeners.delete(listener);
    };
  }

  private async notifyListeners() {
    const pendingCount = await db.syncQueue
      .where('status')
      .anyOf(['PENDING', 'RETRYING'])
      .count();

    const status: SyncStatus = {
      isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
      isSyncing: this.isSyncing,
      pendingCount,
      lastSyncedAt: this.lastSyncedAt,
    };

    this.listeners.forEach((l) => l(status));
  }

  private handleOnline() {
    this.notifyListeners();
    this.flush();
  }

  async enqueue(
    type: SyncQueueItem['type'],
    payload: any,
    client_uuid: string = crypto.randomUUID()
  ): Promise<SyncQueueItem> {
    const item: SyncQueueItem = {
      client_uuid,
      type,
      payload,
      createdAt: new Date().toISOString(),
      attempts: 0,
      status: 'PENDING',
    };

    await db.syncQueue.add(item);
    this.notifyListeners();

    // Trigger immediate flush if online
    if (typeof navigator !== 'undefined' && navigator.onLine) {
      setTimeout(() => this.flush(), 100);
    }

    return item;
  }

  async flush(): Promise<boolean> {
    if (this.isSyncing) return false;
    if (typeof navigator !== 'undefined' && !navigator.onLine) return false;

    // Get current token
    const token = localStorage.getItem('token');
    if (!token) return false;

    const pending = await db.syncQueue
      .where('status')
      .anyOf(['PENDING', 'RETRYING'])
      .toArray();

    if (pending.length === 0) {
      this.notifyListeners();
      return true;
    }

    this.isSyncing = true;
    this.notifyListeners();

    try {
      const response = await fetch('/api/sync/push', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          mutations: pending.map((item) => ({
            client_uuid: item.client_uuid,
            type: item.type,
            payload: item.payload,
            created_at: item.createdAt,
          })),
        }),
      });

      if (!response.ok) {
        throw new Error(`Sync push HTTP ${response.status}`);
      }

      const data = await response.json();
      const results: Array<{ client_uuid: string; status: string }> = data.results || [];

      for (const res of results) {
        if (res.status === 'APPLIED' || res.status === 'ALREADY_APPLIED') {
          // Remove from queue
          await db.syncQueue.where('client_uuid').equals(res.client_uuid).delete();
        } else {
          // Increment attempts or mark failed
          const queueItem = pending.find((p) => p.client_uuid === res.client_uuid);
          if (queueItem) {
            const nextAttempts = (queueItem.attempts || 0) + 1;
            const newStatus = nextAttempts >= 5 ? 'FAILED' : 'RETRYING';
            await db.syncQueue.update(queueItem.id!, {
              attempts: nextAttempts,
              status: newStatus,
              lastError: 'Server rejected mutation',
            });
          }
        }
      }

      this.lastSyncedAt = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      return true;
    } catch (err: any) {
      console.warn('Sync flush failed:', err);
      // Increment attempt count on all tried items with exponential backoff
      for (const item of pending) {
        const nextAttempts = (item.attempts || 0) + 1;
        await db.syncQueue.update(item.id!, {
          attempts: nextAttempts,
          status: nextAttempts >= 5 ? 'FAILED' : 'RETRYING',
          lastError: err?.message || 'Network error',
        });
      }
      return false;
    } finally {
      this.isSyncing = false;
      this.notifyListeners();
    }
  }

  async getPendingCount(): Promise<number> {
    return await db.syncQueue
      .where('status')
      .anyOf(['PENDING', 'RETRYING'])
      .count();
  }

  async clearPendingQueue(): Promise<void> {
    await db.syncQueue.clear();
    this.notifyListeners();
  }
}

export const syncManager = new SyncManager();
