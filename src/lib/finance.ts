import { FinanceService } from "../services/FinanceService";
import type { FinancialAnalysis } from "../types";

export const saveFinancialProfile = async (uid: string, analysis: FinancialAnalysis): Promise<boolean> => {
  return FinanceService.saveFinancialProfile(uid, analysis);
};

export const getFinancialProfile = async (uid: string): Promise<FinancialAnalysis | null> => {
  return FinanceService.getFinancialProfile(uid);
};
