import { doc, getDoc, setDoc, collection, serverTimestamp, getDocs, query, orderBy, addDoc } from "firebase/firestore";
import { db } from "./firebase";

export interface InterviewSession {
  id?: string;
  userId: string;
  jobRole: string;
  careerField: string;
  difficulty: string;
  language: string;
  questions: { question: string; answer?: string; feedback?: string }[];
  overallScore?: number;
  communicationScore?: number;
  technicalScore?: number;
  confidenceScore?: number;
  strengths?: string[];
  weaknesses?: string[];
  improvements?: string[];
  createdAt?: any;
}

export const saveInterviewSession = async (userId: string, session: Omit<InterviewSession, "userId" | "createdAt" | "id">) => {
  try {
    const colRef = collection(db, "users", userId, "interviews");
    await addDoc(colRef, { ...session, userId, createdAt: serverTimestamp() });
    return true;
  } catch (error) {
    console.error("Error saving interview session:", error);
    return false;
  }
};

export const getInterviewHistory = async (userId: string): Promise<InterviewSession[]> => {
  try {
    const colRef = collection(db, "users", userId, "interviews");
    const q = query(colRef, orderBy("createdAt", "desc"));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as InterviewSession));
  } catch (error) {
    console.error("Error fetching interviews:", error);
    return [];
  }
};
