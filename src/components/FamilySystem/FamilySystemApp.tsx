import React from 'react';
import { Routes, Route } from 'react-router-dom';
import RoleSelection from './screens/RoleSelection';
import ParentAuth from './screens/ParentAuth';
import ChildAuth from './screens/ChildAuth';
import ParentDashboard from './components/ParentDashboard';
import ChildDashboard from './components/ChildDashboard';
import ChildDetails from './screens/ChildDetails';
import WalletDetails from './screens/WalletDetails';
import TopUpFlow from './screens/TopUpFlow';
import Requests from './screens/Requests';
import FamilySettings from './screens/FamilySettings';
import ManageMembers from './screens/ManageMembers';
import LinkedCards from './screens/LinkedCards';
import SpendingLimits from './screens/SpendingLimits';
import RequestMoney from './screens/RequestMoney';
import RewardsTasks from './screens/RewardsTasks';
import SavingsChallenge from './screens/SavingsChallenge';
import type { FamilyProfile } from './types';
import DeviceShell from '../DeviceShell';

export default function FamilySystemApp() {
  // Mock Data
  const mockFamily: FamilyProfile = {
    id: "fam_123",
    ownerId: "parent_1",
    walletBalance: 350.00,
    spendingRules: { allowGaming: false, allowOnlinePurchases: true, maxTransactionAmount: 50 },
    members: [
      { id: "parent_1", name: "محمد", role: "parent", allowance: 0, spentThisWeek: 0, weeklyLimit: 0, isCardFrozen: false, score: 0 },
      { id: "child_1", name: "أحمد", role: "child", allowance: 25.0, spentThisWeek: 15.0, weeklyLimit: 40.0, isCardFrozen: false, score: 120 },
      { id: "child_2", name: "سارة", role: "child", allowance: 10.0, spentThisWeek: 2.0, weeklyLimit: 20.0, isCardFrozen: false, score: 350 }
    ]
  };

  return (
    <DeviceShell lang="ar">
      <div className="flex-1 overflow-hidden flex flex-col relative bg-bg-primary w-full">
        <Routes>
          <Route path="/" element={<RoleSelection />} />
          <Route path="/auth/parent" element={<ParentAuth />} />
          <Route path="/auth/child" element={<ChildAuth />} />
          <Route path="/parent" element={<ParentDashboard family={mockFamily} />} />
          <Route path="/child" element={<ChildDashboard profile={mockFamily.members[1]} />} />
          
          <Route path="/child/:id" element={<ChildDetails family={mockFamily} />} />
          <Route path="/wallet" element={<WalletDetails family={mockFamily} />} />
          <Route path="/wallet/transactions" element={<WalletDetails family={mockFamily} />} />
          <Route path="/topup" element={<TopUpFlow />} />
          <Route path="/requests" element={<Requests />} />
          <Route path="/settings" element={<FamilySettings />} />
          <Route path="/settings/members" element={<ManageMembers family={mockFamily} />} />
          <Route path="/settings/cards" element={<LinkedCards />} />
          <Route path="/settings/limits" element={<SpendingLimits family={mockFamily} />} />
          
          <Route path="/child/request" element={<RequestMoney />} />
          <Route path="/child/rewards" element={<RewardsTasks />} />
          <Route path="/child/challenge" element={<SavingsChallenge />} />
        </Routes>
      </div>
    </DeviceShell>
  );
}
