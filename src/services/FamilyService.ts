import { FamilyRepository } from '../repositories/FamilyRepository';
import { FamilyMember } from '../components/FamilySystem/types';
import { FamilyCard } from '../components/FamilySystem/FamilyContext';

export class FamilyService {
  static getMembers(): FamilyMember[] {
    return FamilyRepository.getMembers();
  }

  static saveMembers(members: FamilyMember[]): void {
    FamilyRepository.saveMembers(members);
  }

  static getRequests(): any[] {
    return FamilyRepository.getRequests();
  }

  static saveRequests(requests: any[]): void {
    FamilyRepository.saveRequests(requests);
  }

  static getCards(): FamilyCard[] {
    return FamilyRepository.getCards();
  }

  static saveCards(cards: FamilyCard[]): void {
    FamilyRepository.saveCards(cards);
  }

  static getWalletBalance(): number {
    return FamilyRepository.getWalletBalance();
  }

  static saveWalletBalance(balance: number): void {
    FamilyRepository.saveWalletBalance(balance);
  }
}
