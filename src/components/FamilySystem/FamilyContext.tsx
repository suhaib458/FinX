import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import type { FamilyProfile, FamilyMember } from './types';
import { FamilyService } from '../../services/FamilyService';

export interface FamilyCard {
  id: number;
  type: string;
  last4: string;
  exp: string;
  isPrimary: boolean;
}

interface FamilyContextType {
  familyProfile: FamilyProfile;
  members: FamilyMember[];
  setMembers: React.Dispatch<React.SetStateAction<FamilyMember[]>>;
  updateMember: (id: string, updates: Partial<FamilyMember>) => void;
  
  requests: any[];
  setRequests: React.Dispatch<React.SetStateAction<any[]>>;
  addRequest: (request: any) => void;
  removeRequest: (id: string) => void;
  
  cards: FamilyCard[];
  setCards: React.Dispatch<React.SetStateAction<FamilyCard[]>>;
  addCard: (card: FamilyCard) => void;
  
  walletBalance: number;
  setWalletBalance: React.Dispatch<React.SetStateAction<number>>;
}

const FamilyContext = createContext<FamilyContextType | undefined>(undefined);

export function useFamilyContext() {
  const context = useContext(FamilyContext);
  if (!context) {
    throw new Error('useFamilyContext must be used within a FamilyProvider');
  }
  return context;
}

export function FamilyProvider({ children }: { children: React.ReactNode }) {
  // --- Members State ---
  const [members, setMembers] = useState<FamilyMember[]>(() => {
    return FamilyService.getMembers();
  });

  useEffect(() => {
    FamilyService.saveMembers(members);
  }, [members]);

  const updateMember = useCallback((id: string, updates: Partial<FamilyMember>) => {
    setMembers(prev => prev.map(m => m.id === id ? { ...m, ...updates } : m));
  }, []);

  // --- Requests State ---
  const [requests, setRequests] = useState<any[]>(() => {
    return FamilyService.getRequests();
  });

  useEffect(() => {
    FamilyService.saveRequests(requests);
  }, [requests]);

  const addRequest = useCallback((request: any) => {
    setRequests(prev => [...prev, request]);
  }, []);

  const removeRequest = useCallback((id: string) => {
    setRequests(prev => prev.filter(req => req.id !== id));
  }, []);

  // --- Cards State ---
  const [cards, setCards] = useState<FamilyCard[]>(() => {
    return FamilyService.getCards();
  });

  useEffect(() => {
    FamilyService.saveCards(cards);
  }, [cards]);

  const addCard = useCallback((card: FamilyCard) => {
    setCards(prev => [...prev, card]);
  }, []);

  // --- Wallet State ---
  const [walletBalance, setWalletBalance] = useState<number>(() => {
    return FamilyService.getWalletBalance();
  });

  useEffect(() => {
    FamilyService.saveWalletBalance(walletBalance);
  }, [walletBalance]);

  // --- Derived Family Profile ---
  const familyProfile: FamilyProfile = useMemo(() => ({
    id: "fam_123",
    ownerId: "parent_1",
    walletBalance,
    spendingRules: { allowGaming: false, allowOnlinePurchases: true, maxTransactionAmount: 50 },
    members
  }), [members, walletBalance]);

  const value = useMemo(() => ({
    familyProfile,
    members,
    setMembers,
    updateMember,
    requests,
    setRequests,
    addRequest,
    removeRequest,
    cards,
    setCards,
    addCard,
    walletBalance,
    setWalletBalance
  }), [familyProfile, members, requests, cards, updateMember, addRequest, removeRequest, addCard, walletBalance, setWalletBalance]);

  return <FamilyContext.Provider value={value}>{children}</FamilyContext.Provider>;
}
