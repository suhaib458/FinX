import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import type { FamilyProfile, FamilyMember } from './types';
import { FamilyService } from '../../services/FamilyService';
import { useAuth } from '../../contexts/AuthContext';

export interface FamilyCard {
  id: number;
  type: string;
  last4: string;
  exp: string;
  isPrimary: boolean;
}

// --- Family Auth Context ---
interface FamilyAuthContextType {
  activeRole: 'parent' | 'child' | null;
  activeChildId: string | null;
  loginAsParent: () => void;
  loginAsChild: (childId: string) => void;
  logoutFamily: () => void;
  isParentAuth: boolean;
  isChildAuth: boolean;
}
const FamilyAuthContext = createContext<FamilyAuthContextType | undefined>(undefined);
export function useFamilyAuth() {
  const context = useContext(FamilyAuthContext);
  if (!context) throw new Error('useFamilyAuth must be used within a FamilyProvider');
  return context;
}

// --- Members Context ---
interface MembersContextType {
  members: FamilyMember[];
  setMembers: React.Dispatch<React.SetStateAction<FamilyMember[]>>;
  updateMember: (id: string, updates: Partial<FamilyMember>) => void;
}
const MembersContext = createContext<MembersContextType | undefined>(undefined);
export function useFamilyMembers() {
  const context = useContext(MembersContext);
  if (!context) throw new Error('useFamilyMembers must be used within a FamilyProvider');
  return context;
}

// --- Requests Context ---
interface RequestsContextType {
  requests: any[];
  setRequests: React.Dispatch<React.SetStateAction<any[]>>;
  addRequest: (request: any) => void;
  removeRequest: (id: string) => void;
}
const RequestsContext = createContext<RequestsContextType | undefined>(undefined);
export function useFamilyRequests() {
  const context = useContext(RequestsContext);
  if (!context) throw new Error('useFamilyRequests must be used within a FamilyProvider');
  return context;
}

// --- Cards Context ---
interface CardsContextType {
  cards: FamilyCard[];
  setCards: React.Dispatch<React.SetStateAction<FamilyCard[]>>;
  addCard: (card: FamilyCard) => void;
}
const CardsContext = createContext<CardsContextType | undefined>(undefined);
export function useFamilyCards() {
  const context = useContext(CardsContext);
  if (!context) throw new Error('useFamilyCards must be used within a FamilyProvider');
  return context;
}

// --- Wallet Context ---
interface WalletContextType {
  walletBalance: number;
  setWalletBalance: React.Dispatch<React.SetStateAction<number>>;
}
const WalletContext = createContext<WalletContextType | undefined>(undefined);
export function useFamilyWallet() {
  const context = useContext(WalletContext);
  if (!context) throw new Error('useFamilyWallet must be used within a FamilyProvider');
  return context;
}

// --- Profile Context ---
interface ProfileContextType {
  familyProfile: FamilyProfile;
}
const ProfileContext = createContext<ProfileContextType | undefined>(undefined);
export function useFamilyProfile() {
  const context = useContext(ProfileContext);
  if (!context) throw new Error('useFamilyProfile must be used within a FamilyProvider');
  return context;
}

export function FamilyProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  
  // --- Family Auth State ---
  const [activeRole, setActiveRole] = useState<'parent' | 'child' | null>(() => {
    return (sessionStorage.getItem('family_active_role') as 'parent' | 'child' | null) || null;
  });
  const [activeChildId, setActiveChildId] = useState<string | null>(() => {
    return sessionStorage.getItem('family_active_child_id');
  });

  useEffect(() => {
    if (activeRole) {
      sessionStorage.setItem('family_active_role', activeRole);
    } else {
      sessionStorage.removeItem('family_active_role');
    }
    
    if (activeChildId) {
      sessionStorage.setItem('family_active_child_id', activeChildId);
    } else {
      sessionStorage.removeItem('family_active_child_id');
    }
  }, [activeRole, activeChildId]);

  // Clean up legacy auth keys
  useEffect(() => {
    sessionStorage.removeItem('parent_auth');
    sessionStorage.removeItem('child_auth');
  }, []);

  const loginAsParent = useCallback(() => {
    setActiveRole('parent');
    setActiveChildId(null);
  }, []);

  const loginAsChild = useCallback((childId: string) => {
    setActiveRole('child');
    setActiveChildId(childId);
  }, []);

  const logoutFamily = useCallback(() => {
    setActiveRole(null);
    setActiveChildId(null);
  }, []);

  // Strict Firebase Auth enforcement for Parent!
  const isParentAuth = activeRole === 'parent' && isAuthenticated;
  const isChildAuth = activeRole === 'child' && activeChildId !== null;

  const authValue = useMemo(() => ({
    activeRole,
    activeChildId,
    loginAsParent,
    loginAsChild,
    logoutFamily,
    isParentAuth,
    isChildAuth
  }), [activeRole, activeChildId, loginAsParent, loginAsChild, logoutFamily, isParentAuth, isChildAuth]);

  // --- Members State ---
  const [members, setMembers] = useState<FamilyMember[]>(() => {
    return FamilyService.getMembers();
  });

  useEffect(() => {
    FamilyService.saveMembers(members);
  }, [members]);

  // --- Secure Authorization Enforcers ---
  const requireParent = useCallback((actionName: string) => {
    if (!isParentAuth) {
      console.error(`Unauthorized Action: Only parents can execute ${actionName}`);
      throw new Error(`Unauthorized Action: Only parents can execute ${actionName}`);
    }
  }, [isParentAuth]);

  const requireChildSelfOrParent = useCallback((childId: string, actionName: string) => {
    if (isParentAuth) return;
    if (isChildAuth && activeChildId === childId) return;
    console.error(`Unauthorized Action: Cannot execute ${actionName}`);
    throw new Error(`Unauthorized Action: Cannot execute ${actionName}`);
  }, [isParentAuth, isChildAuth, activeChildId]);

  const secureSetMembers: React.Dispatch<React.SetStateAction<FamilyMember[]>> = useCallback((val) => {
    requireParent('setMembers');
    setMembers(val);
  }, [requireParent]);

  const secureUpdateMember = useCallback((id: string, updates: Partial<FamilyMember>) => {
    if (!isParentAuth) {
      requireChildSelfOrParent(id, 'updateMember');
      // Children can only update specific fields
      const allowedChildUpdates = ['avatar', 'name', 'savingsGoal'];
      const keys = Object.keys(updates);
      const isAllowed = keys.every(key => allowedChildUpdates.includes(key));
      if (!isAllowed) {
        console.error(`Unauthorized Action: Child attempted to update restricted fields: ${keys.filter(k => !allowedChildUpdates.includes(k)).join(', ')}`);
        throw new Error("Unauthorized Action: Children can only update their avatar, name, or savingsGoal.");
      }
    }
    setMembers(prev => prev.map(m => m.id === id ? { ...m, ...updates } : m));
  }, [isParentAuth, requireChildSelfOrParent]);

  // --- Requests State ---
  const [requests, setRequests] = useState<any[]>(() => {
    return FamilyService.getRequests();
  });

  useEffect(() => {
    FamilyService.saveRequests(requests);
  }, [requests]);

  const secureSetRequests: React.Dispatch<React.SetStateAction<any[]>> = useCallback((val) => {
    requireParent('setRequests');
    setRequests(val);
  }, [requireParent]);

  const secureAddRequest = useCallback((request: any) => {
    if (!isParentAuth && !isChildAuth) {
      throw new Error("Unauthorized Action: Must be authenticated to add request.");
    }
    setRequests(prev => [...prev, request]);
  }, [isParentAuth, isChildAuth]);

  const secureRemoveRequest = useCallback((id: string) => {
    requireParent('removeRequest');
    setRequests(prev => prev.filter(req => req.id !== id));
  }, [requireParent]);

  // --- Cards State ---
  const [cards, setCards] = useState<FamilyCard[]>(() => {
    return FamilyService.getCards();
  });

  useEffect(() => {
    FamilyService.saveCards(cards);
  }, [cards]);

  const secureSetCards: React.Dispatch<React.SetStateAction<FamilyCard[]>> = useCallback((val) => {
    requireParent('setCards');
    setCards(val);
  }, [requireParent]);

  const secureAddCard = useCallback((card: FamilyCard) => {
    requireParent('addCard');
    setCards(prev => [...prev, card]);
  }, [requireParent]);

  // --- Wallet State ---
  const [walletBalance, setWalletBalance] = useState<number>(() => {
    return FamilyService.getWalletBalance();
  });

  useEffect(() => {
    FamilyService.saveWalletBalance(walletBalance);
  }, [walletBalance]);

  const secureSetWalletBalance: React.Dispatch<React.SetStateAction<number>> = useCallback((val) => {
    requireParent('setWalletBalance');
    setWalletBalance(val);
  }, [requireParent]);

  // --- Derived Family Profile ---
  const familyProfile: FamilyProfile = useMemo(() => ({
    id: "fam_123",
    ownerId: "parent_1",
    walletBalance,
    spendingRules: { allowGaming: false, allowOnlinePurchases: true, maxTransactionAmount: 50 },
    members
  }), [members, walletBalance]);

  const membersValue = useMemo(() => ({ members, setMembers: secureSetMembers, updateMember: secureUpdateMember }), [members, secureSetMembers, secureUpdateMember]);
  const requestsValue = useMemo(() => ({ requests, setRequests: secureSetRequests, addRequest: secureAddRequest, removeRequest: secureRemoveRequest }), [requests, secureSetRequests, secureAddRequest, secureRemoveRequest]);
  const cardsValue = useMemo(() => ({ cards, setCards: secureSetCards, addCard: secureAddCard }), [cards, secureSetCards, secureAddCard]);
  const walletValue = useMemo(() => ({ walletBalance, setWalletBalance: secureSetWalletBalance }), [walletBalance, secureSetWalletBalance]);
  const profileValue = useMemo(() => ({ familyProfile }), [familyProfile]);

  return (
    <FamilyAuthContext.Provider value={authValue}>
      <ProfileContext.Provider value={profileValue}>
        <WalletContext.Provider value={walletValue}>
          <CardsContext.Provider value={cardsValue}>
            <RequestsContext.Provider value={requestsValue}>
              <MembersContext.Provider value={membersValue}>
                {children}
              </MembersContext.Provider>
            </RequestsContext.Provider>
          </CardsContext.Provider>
        </WalletContext.Provider>
      </ProfileContext.Provider>
    </FamilyAuthContext.Provider>
  );
}
