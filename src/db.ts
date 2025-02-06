// src/db.ts
import { openDB } from 'idb';

const dbPromise = openDB('offline-data', 1, {
  upgrade(db) {
    if (!db.objectStoreNames.contains('progress')) {
      db.createObjectStore('progress', { keyPath: 'id', autoIncrement: true });
    }
    if (!db.objectStoreNames.contains('quizResults')) {
      db.createObjectStore('quizResults', { keyPath: 'id', autoIncrement: true });
    }
  },
});

export const saveProgressOffline = async (progressData: any) => {
  const db = await dbPromise;
  return db.add('progress', progressData);
};

export const getOfflineProgress = async () => {
  const db = await dbPromise;
  return db.getAll('progress');
};

export const clearOfflineProgress = async () => {
  const db = await dbPromise;
  return db.clear('progress');
};

export const saveQuizResultOffline = async (resultData: any) => {
  const db = await dbPromise;
  return db.add('quizResults', resultData);
};

export const getOfflineQuizResults = async () => {
  const db = await dbPromise;
  return db.getAll('quizResults');
};

export const clearOfflineQuizResults = async () => {
  const db = await dbPromise;
  return db.clear('quizResults');
};
