import { FinanceRepository } from '../repositories/FinanceRepository';
import type { FinancialAnalysis } from '../types';

export class FinanceService {
  static async getFinancialProfile(uid: string): Promise<FinancialAnalysis | null> {
    try {
      const docSnap = await FinanceRepository.getFinancialProfile(uid);
      if (docSnap.exists()) {
        const data = docSnap.data();
        return (data.financialProfile as FinancialAnalysis) || null;
      }
      return null;
    } catch (error) {
      console.error("Error getting financial profile:", error);
      return null;
    }
  }

  static async saveFinancialProfile(uid: string, analysis: FinancialAnalysis): Promise<boolean> {
    try {
      await FinanceRepository.saveFinancialProfile(uid, analysis);
      return true;
    } catch (error) {
      console.error("Error saving financial profile:", error);
      return false;
    }
  }
}
