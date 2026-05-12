/**
 * IndexedDB wrapper — lightweight key-value store using IndexedDB.
 * Self-developed TypeScript implementation.
 */

const DATABASE_NAME = "d2";
const STORE_NAME = "s";

let db: IDBDatabase | undefined;

function openDatabase(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (db) {
      resolve();
      return;
    }

    if (!globalThis.indexedDB) {
      reject("IndexedDB is not supported");
      return;
    }

    const request = globalThis.indexedDB.open(DATABASE_NAME);

    request.onsuccess = (event) => {
      db = (event.target as IDBOpenDBRequest).result;
      resolve();
    };

    request.onerror = () => {
      console.error("IndexedDB request error");
      reject();
    };

    request.onupgradeneeded = (event) => {
      db = (event.target as IDBOpenDBRequest).result;
      const objectStore = db.createObjectStore(STORE_NAME, { keyPath: "key" });
      objectStore.transaction.oncomplete = () => {
        db = (event.target as IDBOpenDBRequest).result;
      };
    };
  });
}

export const ldb = {
  get: (key: string): Promise<unknown> => {
    return new Promise((resolve, reject) => {
      openDatabase().then(() => {
        if (!db) return reject("No database");
        const hasStore = Array.from(db.objectStoreNames).includes(STORE_NAME);
        if (!hasStore) return reject("IndexedDB: no store found");

        const transaction = db.transaction(STORE_NAME, "readonly");
        const objectStore = transaction.objectStore(STORE_NAME);
        const getRequest = objectStore.get(key);

        getRequest.onsuccess = (event) => {
          const result = (event.target as IDBRequest).result?.value || null;
          resolve(result);
        };
      });
    });
  },

  set: (keyName: string, value: unknown): Promise<void> => {
    return new Promise((resolve) => {
      openDatabase().then(() => {
        if (!db) return;
        const transaction = db.transaction(STORE_NAME, "readwrite");
        const objectStore = transaction.objectStore(STORE_NAME);
        const putRequest = objectStore.put({ key: keyName, value });

        putRequest.onsuccess = () => {
          resolve();
        };
      });
    });
  },
};

// Register as global for backward compatibility with engine-startup-service and project summary
if (typeof globalThis !== "undefined") {
  (globalThis as Record<string, unknown>).ldb = ldb;
}
