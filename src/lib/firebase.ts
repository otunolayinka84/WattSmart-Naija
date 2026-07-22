import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, getDocs, deleteDoc, doc, query, where } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// Configuration details from user's custom project
const firebaseConfig = {
  apiKey: "AIzaSyBjBzn-yz84j1UqARCbw5979bT8zb-Hmw4",
  authDomain: "energy-efficiency-advisor.firebaseapp.com",
  projectId: "energy-efficiency-advisor",
  storageBucket: "energy-efficiency-advisor.firebasestorage.app",
  messagingSenderId: "941028164441",
  appId: "1:941028164441:web:bfe2bc651fc22e2f978248"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);

export interface SavedScenario {
  id?: string;
  userId: string;
  name: string;
  createdAt: string;
  params: any; // InputParams
  result: any;  // CalculationResult
  reportText: string | null;
}

const COLLECTION_NAME = 'scenarios';

// Save a scenario to Firestore (associated with a specific user)
export async function saveScenarioToDb(userId: string, name: string, params: any, result: any, reportText: string | null): Promise<string> {
  try {
    const scenarioData: Omit<SavedScenario, 'id'> = {
      userId,
      name,
      createdAt: new Date().toISOString(),
      params,
      result,
      reportText,
    };
    
    const docRef = await addDoc(collection(db, COLLECTION_NAME), scenarioData);
    return docRef.id;
  } catch (error) {
    console.error("Error saving scenario to Firestore:", error);
    throw error;
  }
}

// Get all saved scenarios for a specific user from Firestore
export async function getScenariosFromDb(userId: string): Promise<SavedScenario[]> {
  try {
    const q = query(collection(db, COLLECTION_NAME), where("userId", "==", userId));
    const querySnapshot = await getDocs(q);
    const scenarios: SavedScenario[] = [];
    querySnapshot.forEach((docSnap) => {
      scenarios.push({
        id: docSnap.id,
        ...docSnap.data()
      } as SavedScenario);
    });
    // Sort by newest first
    return scenarios.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch (error) {
    console.error("Error fetching scenarios from Firestore:", error);
    throw error;
  }
}

// Delete a scenario from Firestore
export async function deleteScenarioFromDb(id: string): Promise<void> {
  try {
    await deleteDoc(doc(db, COLLECTION_NAME, id));
  } catch (error) {
    console.error("Error deleting scenario from Firestore:", error);
    throw error;
  }
}
