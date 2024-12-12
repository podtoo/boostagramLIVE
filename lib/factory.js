import MongoDB from "./adapters/mongodb";
import Firebase from "./adapters/firebase";

export function createDatabase() {
  const dbType = process.env.DB_TYPE;

  if (typeof window !== "undefined") {
    throw new Error("Database connections are only allowed on the server.");
  }

  switch (dbType) {
    case "mongodb":
      return new MongoDB(process.env.MONGODB_URI);
    case "firebase":
      const firebaseConfig = {
        apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
        authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
        messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
        appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
      };
      return new Firebase(firebaseConfig);
    default:
      throw new Error(`Unsupported database type: ${dbType}`);
  }
}
