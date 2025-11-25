
import { ProjectData, ProjectHistoryItem } from "../types";

const DB_NAME = 'AI_Architect_DB';
const STORE_NAME = 'projects';
const DB_VERSION = 1;

// Helper to open DB
const openDB = (): Promise<IDBDatabase> => {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onerror = () => reject("Error opening database");
        
        request.onsuccess = () => resolve(request.result);

        request.onupgradeneeded = (event: any) => {
            const db = event.target.result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME, { keyPath: 'id' });
            }
        };
    });
};

// Async Save
export const saveProject = async (project: ProjectData): Promise<ProjectData> => {
    const projectId = project.id || Date.now().toString();
    const projectWithId = { ...project, id: projectId, timestamp: Date.now() };

    const db = await openDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_NAME], 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.put(projectWithId);

        request.onsuccess = () => resolve(projectWithId);
        request.onerror = () => reject("Error saving project");
    });
};

// Async Load All (History)
export const loadProjectsHistory = async (): Promise<ProjectHistoryItem[]> => {
    // 1. Check if we need to migrate from LocalStorage (One time)
    await migrateFromLocalStorage();

    const db = await openDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_NAME], 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.getAll();

        request.onsuccess = () => {
            const projects: ProjectData[] = request.result || [];
            // Map to lightweight history items
            const history = projects.map(p => ({
                id: p.id!,
                title: p.analysis?.title || 'Новый проект',
                timestamp: p.timestamp || Date.now(),
                idea: p.originalIdea,
                themeColor: p.analysis?.palette?.primary || '#6366f1'
            })).sort((a, b) => b.timestamp - a.timestamp);
            resolve(history);
        };
        request.onerror = () => reject("Error loading history");
    });
};

// Async Load One
export const loadProjectById = async (id: string): Promise<ProjectData | null> => {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_NAME], 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.get(id);

        request.onsuccess = () => resolve(request.result || null);
        request.onerror = () => reject("Error loading project");
    });
};

// Async Delete
export const deleteProject = async (id: string): Promise<void> => {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_NAME], 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.delete(id);
        
        request.onsuccess = () => resolve();
        request.onerror = () => reject("Error deleting project");
    });
};

// Migration Utility
const migrateFromLocalStorage = async () => {
    const STORAGE_KEY = 'ai_pm_projects';
    const rawData = localStorage.getItem(STORAGE_KEY);
    
    if (rawData) {
        console.log("Migrating data from LocalStorage to IndexedDB...");
        try {
            const projects: ProjectData[] = JSON.parse(rawData);
            const db = await openDB();
            
            const transaction = db.transaction([STORE_NAME], 'readwrite');
            const store = transaction.objectStore(STORE_NAME);
            
            for (const p of projects) {
                // Ensure ID exists
                if (!p.id) p.id = Date.now().toString() + Math.random();
                store.put(p);
            }
            
            // Clear LocalStorage after successful migration start
            localStorage.removeItem(STORAGE_KEY);
            console.log("Migration complete.");
        } catch (e) {
            console.error("Migration failed", e);
        }
    }
};
