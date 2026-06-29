import { FamilyMember } from '../components/FamilySystem/types';
import { FamilyCard } from '../components/FamilySystem/FamilyContext';

const defaultMembers: FamilyMember[] = [
  { id: "parent_1", name: "محمد", role: "parent", allowance: 0, spentThisWeek: 0, weeklyLimit: 0, isCardFrozen: false, score: 0 },
  { id: "child_1", name: "أحمد", role: "child", allowance: 25.0, spentThisWeek: 15.0, weeklyLimit: 40.0, isCardFrozen: false, score: 120 },
  { id: "child_2", name: "سارة", role: "child", allowance: 10.0, spentThisWeek: 2.0, weeklyLimit: 20.0, isCardFrozen: false, score: 350 }
];

const defaultRequests = [
  { id: '1', childName: 'أحمد', amount: 15.00, reason: 'شراء لعبة جديدة', status: 'pending', date: 'منذ ساعتين' },
  { id: '2', childName: 'سارة', amount: 5.00, reason: 'قرطاسية للمدرسة', status: 'pending', date: 'منذ 5 ساعات' },
];

const defaultCards: FamilyCard[] = [
  { id: 1, type: 'Visa', last4: '4242', exp: '12/26', isPrimary: true }
];

export class FamilyRepository {
  static getMembers(): FamilyMember[] {
    const saved = localStorage.getItem('finx_family_members');
    return saved ? JSON.parse(saved) : defaultMembers;
  }

  static saveMembers(members: FamilyMember[]): void {
    localStorage.setItem('finx_family_members', JSON.stringify(members));
  }

  static getRequests(): any[] {
    const saved = localStorage.getItem('finx_family_requests');
    return saved ? JSON.parse(saved) : defaultRequests;
  }

  static saveRequests(requests: any[]): void {
    localStorage.setItem('finx_family_requests', JSON.stringify(requests));
  }

  static getCards(): FamilyCard[] {
    const saved = localStorage.getItem('finx_family_cards');
    return saved ? JSON.parse(saved) : defaultCards;
  }

  static saveCards(cards: FamilyCard[]): void {
    localStorage.setItem('finx_family_cards', JSON.stringify(cards));
  }

  static getWalletBalance(): number {
    const saved = localStorage.getItem('finx_family_wallet');
    return saved !== null ? parseFloat(saved) : 350.00;
  }

  static saveWalletBalance(balance: number): void {
    localStorage.setItem('finx_family_wallet', balance.toString());
  }
}
