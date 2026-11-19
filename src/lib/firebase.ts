import { initializeApp } from 'firebase/app';
import {
  getAuth,
  setPersistence,
  indexedDBLocalPersistence,
  browserLocalPersistence,
} from 'firebase/auth';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import firebaseConfig from '../../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export const storage = getStorage(app);

// Configure robust Firebase Auth persistence across page refreshes, browser closures, and sessions
if (typeof window !== 'undefined') {
  setPersistence(auth, indexedDBLocalPersistence)
    .catch(() => setPersistence(auth, browserLocalPersistence))
    .catch((err) => {
      console.warn('Firebase Auth persistence initialization:', err);
    });
}

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.warn('Firestore Error Context:', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export async function testConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firebase client is offline or network restricted.');
    }
    return false;
  }
}

/**
 * Compress an image file cleanly if a fallback data URL is needed (kept well below Firestore 1MB limit),
 * after attempting real Firebase Storage upload first.
 */
async function readFileAsCompressedDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.onload = () => {
      const result = reader.result as string;
      if (!file.type.startsWith('image/')) {
        resolve(result);
        return;
      }
      const img = new Image();
      img.onload = () => {
        const maxDim = 900;
        let { width, height } = img;
        if (width > maxDim || height > maxDim) {
          const ratio = Math.min(maxDim / width, maxDim / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(result);
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.78));
      };
      img.onerror = () => resolve(result);
      img.src = result;
    };
    reader.readAsDataURL(file);
  });
}

/**
 * Upload media (profile picture, deposit receipt, KYC verification document) to Firebase Storage.
 * Falls back cleanly to compressed URI if Storage bucket CORS/network denies browser upload.
 */
export async function uploadMediaFile(
  file: File,
  folderPath: string
): Promise<{ url: string; storagePath?: string; usedStorage: boolean }> {
  if (file.size > 5 * 1024 * 1024) {
    throw new Error('File exceeds the 5MB maximum upload limit.');
  }

  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
  const objectPath = `${folderPath}/${Date.now()}_${safeName}`;
  const storageRef = ref(storage, objectPath);

  try {
    const uploadPromise = uploadBytes(storageRef, file, {
      contentType: file.type || 'application/octet-stream',
    });
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Storage upload timeout')), 12000)
    );
    await Promise.race([uploadPromise, timeoutPromise]);
    const downloadUrl = await getDownloadURL(storageRef);
    return { url: downloadUrl, storagePath: objectPath, usedStorage: true };
  } catch (err) {
    console.warn('Firebase Storage upload fallback triggered:', err);
    const compressed = await readFileAsCompressedDataUrl(file);
    return { url: compressed, usedStorage: false };
  }
}
