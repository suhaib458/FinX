export type AppLanguage = "ar" | "en";

export interface Transaction {
  date: string;
  desc: string;
  amount: number; // positive for income, negative for expense
  type: "income" | "expense";
  category: string;
}

export interface FinancialInsight {
  type: "warning" | "success" | "neutral";
  title: string;
  desc: string;
}

export interface SpendingCategory {
  name: string;
  value: number;
  color: string;
}

export interface FinancialAnalysis {
  monthlyIncome: number;
  monthlyExpenses: number;
  savingsRate: number; // e.g. 32.5
  healthScore: number; // 0 to 100
  scoreExplanation: string;
  insights: FinancialInsight[];
  categories: SpendingCategory[];
  transactions: Transaction[];
}

export interface SimulationScenario {
  id: string;
  type: "car" | "business" | "marriage" | "investment" | "loan";
  titleAr: string;
  titleEn: string;
  iconName: string;
  defaultValue: number;
  min: number;
  max: number;
  step: number;
  unitAr: string;
  unitEn: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}
