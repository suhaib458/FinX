import { db } from "./firebase";
import { collection, doc, setDoc, query, getDocs, orderBy, where, deleteDoc } from "firebase/firestore";
import { FinanceService } from "../services/FinanceService";
import { getCareerProfile } from "./career";
import { getInterviewHistory } from "./interview";
import { getOwnerProjects, getOwnerRequests, getInvestorRequests } from "./projects";

export type ReportType = "daily" | "weekly" | "monthly" | "custom";

export interface AnalyticsReport {
  id: string;
  uid: string;
  reportType: ReportType;
  dateRange: { start: string; end: string };
  summary: string;
  insights: { title: string; desc: string; type: "positive" | "warning" | "neutral" }[];
  metrics: { [key: string]: number | string };
  createdAt: string;
}

export const AnalyticsService = {
  async getReports(uid: string): Promise<AnalyticsReport[]> {
    try {
      const q = query(
        collection(db, "users", uid, "analyticsReports"),
        orderBy("createdAt", "desc")
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as AnalyticsReport));
    } catch (error) {
      console.warn("Failed to fetch reports:", error);
      return [];
    }
  },

  async deleteReport(uid: string, reportId: string): Promise<void> {
    try {
      const docRef = doc(db, "users", uid, "analyticsReports", reportId);
      await deleteDoc(docRef);
    } catch (error) {
      console.error("Failed to delete report:", error);
      throw error;
    }
  },

  async generateReport(uid: string, userRole: string | null, type: ReportType): Promise<AnalyticsReport> {
    let summary = "";
    let insights: AnalyticsReport["insights"] = [];
    let metrics: any = {};

    try {
      if (userRole === "job_seeker" || userRole === "student") {
        const careerProfile = await getCareerProfile(uid);
        const interviews = await getInterviewHistory(uid);
        
        let completeness = 0;
        if (careerProfile) {
           completeness += 20;
           if (careerProfile.skills && careerProfile.skills.length > 0) completeness += 20;
           if (careerProfile.university) completeness += 20;
           if (careerProfile.linkedinUrl) completeness += 20;
           if (careerProfile.careerFields && careerProfile.careerFields.length > 0) completeness += 20;
        }

        const qSaved = query(collection(db, "savedItems"), where("uid", "==", uid), where("itemType", "==", "job"));
        const savedSnap = await getDocs(qSaved);
        const savedCount = savedSnap.empty ? 0 : savedSnap.docs.length;

        summary = `You have completed ${completeness}% of your career profile and conducted ${interviews.length} practice interviews.`;
        
        insights.push({ title: "Profile completeness", desc: `You reached ${completeness}% completion. ${completeness < 100 ? 'Add more details to stand out.' : 'Great job!'}`, type: completeness > 80 ? "positive" : "warning" });
        insights.push({ title: "Jobs Saved", desc: `You kept an eye on ${savedCount} jobs.`, type: savedCount > 0 ? "positive" : "neutral" });
        insights.push({ title: "Interviews", desc: `Practiced ${interviews.length} times.`, type: interviews.length > 0 ? "positive" : "neutral" });

        metrics = { applications: 0, profileViews: savedCount * 2, matchRate: `${Math.round(completeness * 0.8)}%` };
      } else if (userRole === "founder") {
        const myProjects = await getOwnerProjects(uid);
        const myRequests = await getOwnerRequests(uid);

        const totalProjects = myProjects.length;
        const totalRequests = myRequests.length;
        const totalFundingNeeded = myProjects.reduce((acc, p) => acc + (Number(p.fundingNeeded) || 0), 0);
        const totalMoneyReceived = myProjects.reduce((acc, p) => acc + (Number(p.moneyReceived) || 0), 0);
        
        const fundingProgress = totalFundingNeeded > 0 ? Math.round((totalMoneyReceived / totalFundingNeeded) * 100) : 0;

        summary = `You are managing ${totalProjects} active projects with ${totalRequests} investment requests received. Funding goal is at ${fundingProgress}%.`;
        insights = [
          { title: "Funding", desc: `You have secured ${fundingProgress}% of your funding goals.`, type: fundingProgress > 50 ? "positive" : "neutral" },
          { title: "Investor Interest", desc: `You received ${totalRequests} inquiries from investors.`, type: totalRequests > 0 ? "positive" : "neutral" }
        ];
        metrics = { investorViews: totalRequests * 5, fundingSecured: `$${totalMoneyReceived.toLocaleString()}`, messages: totalRequests };

      } else if (userRole === "investor") {
        const outRequests = await getInvestorRequests(uid);
        
        const qSaved = query(collection(db, "savedItems"), where("uid", "==", uid), where("itemType", "==", "project"));
        const savedSnap = await getDocs(qSaved);
        const savedCount = savedSnap.empty ? 0 : savedSnap.docs.length;

        summary = `You have saved ${savedCount} projects and sent ${outRequests.length} investment requests.`;
        insights = [
          { title: "New Opportunities", desc: `You are tracking ${savedCount} startups.`, type: savedCount > 0 ? "positive" : "neutral" },
          { title: "Pending Reviews", desc: `You sent ${outRequests.length} requests awaiting response.`, type: outRequests.length > 0 ? "warning" : "positive" }
        ];
        metrics = { projectsSaved: savedCount, messagesSent: outRequests.length, newMatches: savedCount + outRequests.length };

      } else {
        // Finance Focus
        const finProfile = await FinanceService.getFinancialProfile(uid);
        
        const monthlyIncome = finProfile?.monthlyIncome || 0;
        let totalExpenses = finProfile?.monthlyExpenses || 0;

        const score = finProfile?.healthScore || 0;
        const savingsRate = monthlyIncome > 0 ? Math.round(((monthlyIncome - totalExpenses) / monthlyIncome) * 100) : 0;

        summary = `Your financial health score is ${score}. You saved ${savingsRate}% of your income.`;
        insights = [
          { title: "Savings Rate", desc: `You are saving ${savingsRate}%.`, type: savingsRate > 20 ? "positive" : "warning" },
          { title: "Health Score", desc: `Your score is ${score}/100.`, type: score > 70 ? "positive" : "neutral" },
          { title: "Expenses", desc: `Monthly expenses total $${totalExpenses.toLocaleString()}.`, type: "neutral" }
        ];
        metrics = { savingsRate: `${savingsRate}%`, expenses: `$${totalExpenses.toLocaleString()}`, healthScore: score };
      }
    } catch(err) {
      console.warn("Analytics error", err);
      // Fallbacks...
      summary = "Activity data not fully available. Keep using FinX to generate more insights.";
      insights = [{ title: "Need more data", desc: "Interact with the app to build trends.", type: "neutral" }];
      metrics = {};
    }

    const reportId = `rep_${Date.now()}`;
    const report: AnalyticsReport = {
      id: reportId,
      uid,
      reportType: type,
      dateRange: { start: new Date().toISOString(), end: new Date().toISOString() },
      summary,
      insights,
      metrics,
      createdAt: new Date().toISOString()
    };

    try {
      const docRef = doc(db, "users", uid, "analyticsReports", reportId);
      await setDoc(docRef, report);
    } catch (e) {
      console.warn("Could not save report to Firestore", e);
    }

    return report;
  }
};
