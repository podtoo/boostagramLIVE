import { initializeApp } from "firebase/app";
import {
  doc,
  updateDoc,
  getFirestore,
  collection,
  query,
  where,
  getDocs,
  addDoc,
} from "firebase/firestore";
import Database from "../db";

class Firebase extends Database {
  constructor(config) {
    super();
    if (!Firebase.app) {
      // Initialize Firebase app if it hasn't been initialized
      Firebase.app = initializeApp(config);
    }
    this.db = getFirestore(Firebase.app);
  }

  async connect() {
    // No explicit connection is required for Firebase SDK
    console.log("Connected to Firebase Firestore.");
  }

  async get(collectionName, queryConditions = [], fields = []) {
    const colRef = collection(this.db, collectionName);
    let q = colRef;
  
    // Apply query conditions if provided
    if (queryConditions.length > 0) {
      q = query(
        colRef,
        ...queryConditions.map((condition) => where(...condition))
      );
    }
  
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map((doc) => {
      const data = doc.data();
      if (fields.length > 0) {
        // Return only the specified fields
        const filteredData = {};
        for (const field of fields) {
          if (data.hasOwnProperty(field)) {
            filteredData[field] = data[field];
          }
        }
        return { id: doc.id, ...filteredData };
      } else {
        // Return all fields if none specified
        return { id: doc.id, ...data };
      }
    });
  }

  async insert(collectionName, data) {
    const colRef = collection(this.db, collectionName);
    const docRef = await addDoc(colRef, data);
    return { id: docRef.id, ...data };
  }

  async update(collectionName, id, data) {
    try {
      const docRef = doc(this.db, collectionName, id);
      await updateDoc(docRef, data);
      console.log(`Updated document with ID "${id}" in collection "${collectionName}".`);
      return { id, ...data };
    } catch (error) {
      console.error(`Error updating document with ID "${id}" in collection "${collectionName}":`, error);
      throw new Error("Failed to update document.");
    }
  }

  async close() {
    // Firebase doesn't require an explicit close method
    console.log("Firebase connection doesn't require explicit closing.");
  }
}

export default Firebase;
