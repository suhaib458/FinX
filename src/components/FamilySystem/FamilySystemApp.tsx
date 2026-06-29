import React from 'react';
import { Routes, Route } from 'react-router-dom';
import RoleSelection from './screens/RoleSelection';
import ParentAuth from './screens/ParentAuth';
import ChildAuth from './screens/ChildAuth';
import ParentDashboard from './components/ParentDashboard';
import ChildDashboard from './components/ChildDashboard';
import ChildDetails from './screens/ChildDetails';
import ChildProfile from './screens/ChildProfile';
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
import DeviceShell from '../DeviceShell';
import { FamilyProvider, useFamilyContext } from './FamilyContext';

function FamilyRoutes() {
  const { familyProfile } = useFamilyContext();

  return (
    <DeviceShell lang="ar">
      <div className="flex-1 overflow-hidden flex flex-col relative bg-bg-primary w-full">
        <Routes>
          <Route path="/" element={<RoleSelection />} />
          <Route path="/auth/parent" element={<ParentAuth />} />
          <Route path="/auth/child" element={<ChildAuth />} />
          <Route path="/parent" element={<ParentDashboard family={familyProfile} />} />
          <Route path="/child" element={<ChildDashboard profile={familyProfile.members[1]} />} />
          
          <Route path="/child/profile" element={<ChildProfile />} />
          <Route path="/child/:id" element={<ChildDetails />} />
          <Route path="/wallet" element={<WalletDetails />} />
          <Route path="/wallet/transactions" element={<WalletDetails />} />
          <Route path="/topup" element={<TopUpFlow />} />
          <Route path="/requests" element={<Requests />} />
          <Route path="/settings" element={<FamilySettings />} />
          <Route path="/settings/members" element={<ManageMembers family={familyProfile} />} />
          <Route path="/settings/cards" element={<LinkedCards />} />
          <Route path="/settings/limits" element={<SpendingLimits family={familyProfile} />} />
          
          <Route path="/child/request" element={<RequestMoney />} />
          <Route path="/child/rewards" element={<RewardsTasks />} />
          <Route path="/child/challenge" element={<SavingsChallenge />} />
        </Routes>
      </div>
    </DeviceShell>
  );
}

export default function FamilySystemApp() {
  return (
    <FamilyProvider>
      <FamilyRoutes />
    </FamilyProvider>
  );
}
