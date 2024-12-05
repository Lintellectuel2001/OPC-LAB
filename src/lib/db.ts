import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc, query, orderBy } from 'firebase/firestore';
import { db, auth } from './firebase';

const SAMPLES_COLLECTION = 'samples';

interface Sample {
  sampleNumber: string;
  fabricationDate: string;
  day7Date: string;
  day14Date: string;
  day28Date: string;
  client: string;
  site: string;
  concreteType: string;
  elementCoule: string;
  day7Result: number | null;
  day14Result: null;
  day28Result: null;
}

export async function addSample(sample: Sample) {
  if (!auth.currentUser) {
    throw new Error('Authentication required');
  }

  return addDoc(collection(db, SAMPLES_COLLECTION), {
    ...sample,
    createdAt: new Date().toISOString(),
    userId: auth.currentUser.uid
  });
}

export async function updateSample(id: string, data: Partial<Sample>) {
  if (!auth.currentUser) {
    throw new Error('Authentication required');
  }

  return updateDoc(doc(db, SAMPLES_COLLECTION, id), {
    ...data,
    updatedAt: new Date().toISOString()
  });
}

export async function deleteSample(id: string) {
  if (!auth.currentUser) {
    throw new Error('Authentication required');
  }

  return deleteDoc(doc(db, SAMPLES_COLLECTION, id));
}

export async function getAllSamples() {
  if (!auth.currentUser) {
    throw new Error('Authentication required');
  }

  const q = query(
    collection(db, SAMPLES_COLLECTION),
    orderBy('fabricationDate', 'desc')
  );
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
}