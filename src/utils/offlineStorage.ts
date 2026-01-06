/**
 * Offline Storage Utility using IndexedDB
 * Handles buffering of sales and updates when network is offline
 */

const DB_NAME = 'DeepaOfflineDB';
const STORE_NAME = 'pending_sales';
const DB_VERSION = 1;

interface OfflineSale {
  id: string;
  type: 'sale' | 'room_update';
  data: any;
  timestamp: number;
}

// Open Database
function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };

    request.onsuccess = (event) => {
      resolve((event.target as IDBOpenDBRequest).result);
    };

    request.onerror = (event) => {
      reject((event.target as IDBOpenDBRequest).error);
    };
  });
}

// Save item to offline storage
export async function saveOfflineItem(item: OfflineSale): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.put(item);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

// Get all offline items
export async function getOfflineItems(): Promise<OfflineSale[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.getAll();

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Get offline items in chunks (Pagination)
 * Optimized for 8GB RAM to prevent browser memory spikes.
 */
export async function getOfflineItemsChunked(offset: number = 0, limit: number = 50): Promise<OfflineSale[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const results: OfflineSale[] = [];
    let skipped = 0;
    let count = 0;

    const cursorRequest = store.openCursor(null, 'prev'); // Most recent first

    cursorRequest.onsuccess = (event) => {
      const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result;
      if (cursor && count < limit) {
        if (skipped < offset) {
          skipped++;
          cursor.continue();
        } else {
          results.push(cursor.value);
          count++;
          cursor.continue();
        }
      } else {
        resolve(results);
      }
    };

    cursorRequest.onerror = (event) => {
      reject((event.target as IDBRequest).error);
    };
  });
}

// Clear offline items
export async function clearOfflineItems(): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.clear();

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

// Check if there are pending items
export async function hasPendingItems(): Promise<boolean> {
  const items = await getOfflineItems();
  return items.length > 0;
}
