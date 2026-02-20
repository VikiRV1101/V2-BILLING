const DB_NAME = 'bakeryPOSDB';
const DB_VERSION = 2;

let db;

function initDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onerror = (event) => {
            console.error('Database error:', event.target.error);
            reject('Database failure');
        };

        request.onsuccess = (event) => {
            db = event.target.result;
            console.log('Database opened successfully');
            resolve(db);
        };

        request.onupgradeneeded = (event) => {
            const db = event.target.result;

            // Users: for login and staff management
            if (!db.objectStoreNames.contains('users')) {
                const userStore = db.createObjectStore('users', { keyPath: 'id', autoIncrement: true });
                userStore.createIndex('username', 'username', { unique: true });
                userStore.createIndex('role', 'role', { unique: false });
            }

            // Products
            if (!db.objectStoreNames.contains('products')) {
                const productStore = db.createObjectStore('products', { keyPath: 'id', autoIncrement: true });
                productStore.createIndex('category', 'category', { unique: false });
                productStore.createIndex('name', 'name', { unique: false });
            }

            // Categories
            if (!db.objectStoreNames.contains('categories')) {
                db.createObjectStore('categories', { keyPath: 'id', autoIncrement: true });
            }

            // Invoices (Sales)
            if (!db.objectStoreNames.contains('invoices')) {
                const invoiceStore = db.createObjectStore('invoices', { keyPath: 'id', autoIncrement: true });
                invoiceStore.createIndex('invoiceNumber', 'invoiceNumber', { unique: true });
                invoiceStore.createIndex('date', 'date', { unique: false });
            }

            // Orders (Customer Orders/Pending)
            if (!db.objectStoreNames.contains('orders')) {
                const orderStore = db.createObjectStore('orders', { keyPath: 'id', autoIncrement: true });
                orderStore.createIndex('status', 'status', { unique: false });
                orderStore.createIndex('deliveryDate', 'deliveryDate', { unique: false });
            }

            // Attendance
            if (!db.objectStoreNames.contains('attendance')) {
                const attendanceStore = db.createObjectStore('attendance', { keyPath: 'id', autoIncrement: true });
                attendanceStore.createIndex('userId', 'userId', { unique: false });
                attendanceStore.createIndex('date', 'date', { unique: false });
            }

            // Advances (Staff)
            if (!db.objectStoreNames.contains('staff_advances')) {
                const advanceStore = db.createObjectStore('staff_advances', { keyPath: 'id', autoIncrement: true });
                advanceStore.createIndex('staffId', 'staffId', { unique: false });
                advanceStore.createIndex('date', 'date', { unique: false });
            }

            // Expenses
            if (!db.objectStoreNames.contains('expenses')) {
                const expenseStore = db.createObjectStore('expenses', { keyPath: 'id', autoIncrement: true });
                expenseStore.createIndex('date', 'date', { unique: false });
            }

            // Settings
            if (!db.objectStoreNames.contains('settings')) {
                db.createObjectStore('settings', { keyPath: 'key' });
            }
        };
    });
}

// Generic CRUD operations
async function addItem(storeName, item) {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([storeName], 'readwrite');
        const store = transaction.objectStore(storeName);
        const request = store.add(item);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

async function updateItem(storeName, item) {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([storeName], 'readwrite');
        const store = transaction.objectStore(storeName);
        const request = store.put(item);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

async function deleteItem(storeName, id) {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([storeName], 'readwrite');
        const store = transaction.objectStore(storeName);
        const request = store.delete(id);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

async function getAllItems(storeName) {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([storeName], 'readonly');
        const store = transaction.objectStore(storeName);
        const request = store.getAll();
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

async function getItem(storeName, id) {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([storeName], 'readonly');
        const store = transaction.objectStore(storeName);
        const request = store.get(id);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

async function getItemByIndex(storeName, indexName, value) {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([storeName], 'readonly');
        const store = transaction.objectStore(storeName);
        const index = store.index(indexName);
        const request = index.get(value);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

async function getAllItemsByIndex(storeName, indexName, value) {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([storeName], 'readonly');
        const store = transaction.objectStore(storeName);
        const index = store.index(indexName);
        const request = index.getAll(value);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

async function checkAndSeedCategories() {
    console.log('Checking for default categories...');
    const defaults = ['Sweet', 'Karam'];
    const existing = await getAllItems('categories');
    const existingNames = existing.map(c => c.name);

    for (const name of defaults) {
        if (!existingNames.includes(name)) {
            console.log(`Seeding category: ${name}`);
            await addItem('categories', { name: name, description: 'Default Category' });
        }
    }
}
