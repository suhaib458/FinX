import { collection, doc, getDocs, addDoc, updateDoc, deleteDoc, query, where, orderBy, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';

export interface Project {
  id?: string;
  name: string;
  founderId: string;
  founderName: string;
  category: string;
  stage: string;
  fundingNeeded: number;
  moneyReceived: number;
  expectedReturn: string;
  problem: string;
  solution: string;
  audience: string;
  marketSize: string;
  riskLevel: string;
  timeline: string;
  location: string;
  summary: string;
  status: 'active' | 'archived' | 'funded';
  createdAt?: any;
}

export interface InvestmentRequest {
  id?: string;
  projectId: string;
  projectName: string;
  investorId: string;
  investorName: string;
  founderId: string;
  message: string;
  amount?: number;
  status: 'pending' | 'accepted' | 'declined';
  createdAt?: any;
}

// Collections
const PROJECTS_COLLECTION = 'finx_projects';
const REQUESTS_COLLECTION = 'finx_investment_requests';

// Get all public projects (for investors)
export const getProjects = async (): Promise<Project[]> => {
  try {
    const q = query(
      collection(db, PROJECTS_COLLECTION),
      where('status', '==', 'active')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Project));
  } catch (err) {
    console.error("Error fetching projects:", err);
    return [];
  }
};

// Get projects for a specific owner
export const getOwnerProjects = async (founderId: string): Promise<Project[]> => {
  try {
    const q = query(
      collection(db, PROJECTS_COLLECTION),
      where('founderId', '==', founderId)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Project));
  } catch (err) {
    console.error("Error fetching owner projects:", err);
    return [];
  }
};

// Create a new project
export const createProject = async (projectData: Omit<Project, 'id' | 'createdAt'>): Promise<string | null> => {
  try {
    const docRef = await addDoc(collection(db, PROJECTS_COLLECTION), {
      ...projectData,
      createdAt: serverTimestamp()
    });
    return docRef.id;
  } catch (err) {
    console.error("Error creating project:", err);
    return null;
  }
};

// Update a project
export const updateProject = async (projectId: string, updates: Partial<Project>): Promise<boolean> => {
  try {
    const docRef = doc(db, PROJECTS_COLLECTION, projectId);
    await updateDoc(docRef, updates);
    return true;
  } catch (err) {
    console.error("Error updating project:", err);
    return false;
  }
};

// Send an investment request
export const createInvestmentRequest = async (requestData: Omit<InvestmentRequest, 'id' | 'createdAt'>): Promise<boolean> => {
  try {
    await addDoc(collection(db, REQUESTS_COLLECTION), {
      ...requestData,
      createdAt: serverTimestamp()
    });
    return true;
  } catch (err) {
    console.error("Error creating investment request:", err);
    return false;
  }
};

// Get investment requests for a project owner
export const getOwnerRequests = async (founderId: string): Promise<InvestmentRequest[]> => {
  try {
    const q = query(
      collection(db, REQUESTS_COLLECTION),
      where('founderId', '==', founderId)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as InvestmentRequest));
  } catch (err) {
    console.error("Error fetching owner requests:", err);
    return [];
  }
};

// Get investment requests sent by an investor
export const getInvestorRequests = async (investorId: string): Promise<InvestmentRequest[]> => {
  try {
    const q = query(
      collection(db, REQUESTS_COLLECTION),
      where('investorId', '==', investorId)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as InvestmentRequest));
  } catch (err) {
    console.error("Error fetching investor requests:", err);
    return [];
  }
};
