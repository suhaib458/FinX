export interface FamilyProfile {
  id: string;
  ownerId: string;
  walletBalance: number;
  members: FamilyMember[];
  spendingRules: SpendingRules;
}

export interface FamilyMember {
  id: string;
  name: string;
  role: 'parent' | 'child';
  avatar?: string;
  allowance: number;
  spentThisWeek: number;
  weeklyLimit: number;
  isCardFrozen: boolean;
  score: number;
}

export interface FamilyRequest {
  id: string;
  childId: string;
  childName: string;
  amount: number;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

export interface FamilyTransaction {
  id: string;
  memberId: string;
  amount: number;
  type: 'deposit' | 'withdrawal' | 'transfer' | 'purchase';
  description: string;
  date: string;
}

export interface EducationalChallenge {
  id: string;
  childId: string;
  title: string;
  rewardAmount: number;
  isCompleted: boolean;
}

export interface SpendingRules {
  allowGaming: boolean;
  allowOnlinePurchases: boolean;
  maxTransactionAmount: number;
}
