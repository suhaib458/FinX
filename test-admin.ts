import * as admin from 'firebase-admin';
import { getFirestore } from 'firebase-admin/firestore';
import fs from 'fs';

const config = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf8'));

const app = admin.initializeApp({
  projectId: config.projectId
});
try {
  const db = getFirestore(app, config.firestoreDatabaseId || "ai-studio-902ce2b4-017e-462e-80cf-8eb047a66a1d");
  console.log("DB initialized successfully");
} catch(e) {
  console.error(e);
}
