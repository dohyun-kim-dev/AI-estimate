declare let app: any;
declare const auth: import("@firebase/auth").Auth;
declare const db: import("@firebase/firestore").Firestore | null;
declare const storage: import("@firebase/storage").FirebaseStorage | null;
declare const ai: import("@firebase/ai").AI | null;
export { app, auth, db, storage, ai };
