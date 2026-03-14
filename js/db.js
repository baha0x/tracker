const DB_NAME = 'MasturbationTrackerDB';
const DB_VERSION = 3;
const STORE_NAME = 'entries';

function initDB() {
    return new Promise((resolve, reject) => {
        const req = indexedDB.open(DB_NAME, DB_VERSION);
        req.onerror = () => reject(req.error);
        req.onsuccess = () => resolve(req.result);
        req.onupgradeneeded = (e) => {
            const db = e.target.result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                const os = db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
                os.createIndex('date', 'date', { unique: false });
            }
        };
    });
}

function dbAdd(entry) {
    return initDB().then(db => new Promise((res, rej) => {
        const tx = db.transaction([STORE_NAME], 'readwrite');
        const req = tx.objectStore(STORE_NAME).add(entry);
        req.onsuccess = () => res(req.result);
        req.onerror = () => rej(req.error);
    }));
}

function dbUpdate(entry) {
    return initDB().then(db => new Promise((res, rej) => {
        const tx = db.transaction([STORE_NAME], 'readwrite');
        const req = tx.objectStore(STORE_NAME).put(entry);
        req.onsuccess = () => res();
        req.onerror = () => rej(req.error);
    }));
}

function dbGetAll() {
    return initDB().then(db => new Promise((res, rej) => {
        const tx = db.transaction([STORE_NAME], 'readonly');
        const req = tx.objectStore(STORE_NAME).getAll();
        req.onsuccess = () => res(req.result);
        req.onerror = () => rej(req.error);
    }));
}

function dbDelete(id) {
    return initDB().then(db => new Promise((res, rej) => {
        const tx = db.transaction([STORE_NAME], 'readwrite');
        const req = tx.objectStore(STORE_NAME).delete(id);
        req.onsuccess = () => res();
        req.onerror = () => rej(req.error);
    }));
}
