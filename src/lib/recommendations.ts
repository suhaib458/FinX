import { db } from "./firebase";
import { collection, doc, setDoc, query, getDocs, orderBy, writeBatch, where } from "firebase/firestore";
import { getFinancialProfile } from "./finance";
import { getCareerProfile } from "./career";
import { getInterviewHistory } from "./interview";
import { getOwnerProjects, getOwnerRequests, getInvestorRequests } from "./projects";

export interface Recommendation {
  id: string;
  uid: string;
  type: "career" | "finance" | "project" | "productivity";
  title: string;
  reason: string;
  priority: "high" | "medium" | "low";
  confidence: number;
  actionTarget: string; // "profile", "simulator", "projects", "upload"
  createdAt: string;
  dismissed: boolean;
  pinned: boolean;
}

export const RecommendationsService = {
  async getRecommendations(uid: string): Promise<Recommendation[]> {
    try {
      const q = query(
        collection(db, "users", uid, "recommendations"),
        orderBy("createdAt", "desc")
      );
      const snapshot = await getDocs(q);
      const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Recommendation));
      
      return items.filter(i => !i.dismissed);
    } catch (error) {
      console.warn("Failed to fetch recommendations:", error);
      return [];
    }
  },

  async togglePin(uid: string, recommendationId: string, pinned: boolean) {
    try {
      const docRef = doc(db, "users", uid, "recommendations", recommendationId);
      await setDoc(docRef, { pinned: !pinned }, { merge: true });
    } catch (e) {
      console.warn("Failed to pin recommendation", e);
    }
  },

  async dismiss(uid: string, recommendationId: string) {
    try {
      const docRef = doc(db, "users", uid, "recommendations", recommendationId);
      await setDoc(docRef, { dismissed: true }, { merge: true });
    } catch (e) {
      console.warn("Failed to dismiss recommendation", e);
    }
  },

  async generateSmartRecommendations(uid: string, userRole: string | null): Promise<Recommendation[]> {
    const recommendations: Recommendation[] = [];

    const addRec = (rec: Omit<Recommendation, "id" | "uid" | "createdAt" | "dismissed" | "pinned">) => {
      recommendations.push({
        id: `rec_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        uid,
        createdAt: new Date().toISOString(),
        dismissed: false,
        pinned: false,
        ...rec
      });
    };

    try {
      if (userRole === "job_seeker" || userRole === "student" || !userRole) {
        const careerProfile = await getCareerProfile(uid);
        let completeness = 0;
        if (careerProfile) {
           completeness += 20;
           if (careerProfile.skills && careerProfile.skills.length > 0) completeness += 20;
           if (careerProfile.university) completeness += 20;
           if (careerProfile.linkedinUrl) completeness += 20;
           if (careerProfile.careerFields && careerProfile.careerFields.length > 0) completeness += 20;
        }

        if (completeness < 80) {
          addRec({
            type: "career",
            title: "Update your CV with recent details",
            reason: `Your profile completeness is low (${Math.max(completeness, 10)}%). Adding more details will improve job match precision.`,
            priority: "high",
            confidence: 0.92,
            actionTarget: "profile"
          });
        }

        const interviews = await getInterviewHistory(uid);
        if (interviews.length === 0) {
          addRec({
            type: "productivity",
            title: "Practice your first AI Interview",
            reason: "You haven't practiced interviewing yet. The simulator can help you build confidence before real interviews.",
            priority: "medium",
            confidence: 0.85,
            actionTarget: "coach"
          });
        }
        
        // Add a general fallback if they are entirely new
        if (completeness === 0 && interviews.length === 0) {
          addRec({
             type: "career",
             title: "Explore Job Opportunities",
             reason: "Browse the latest job openings matched to your field of interest.",
             priority: "medium",
             confidence: 0.8,
             actionTarget: "jobs"
          });
        }
      } 
      
      if (userRole === "founder" || !userRole) {
        const projects = await getOwnerProjects(uid);
        if (projects.length === 0) {
          addRec({
            type: "project",
            title: "Create your first project",
            reason: "Start by defining your project to attract potential investors.",
            priority: "high",
            confidence: 0.95,
            actionTarget: "projects"
          });
        } else {
          for (const proj of projects) {
            if (!proj.timeline || !proj.marketSize) {
              addRec({
                type: "project",
                title: `Complete details for ${proj.name}`,
                reason: "Investors heavily weigh market size and timeline when evaluating projects.",
                priority: "high",
                confidence: 0.88,
                actionTarget: "projects"
              });
              break;
            }
          }
        }
      } 
      
      if (userRole === "investor" || !userRole) {
        const outRequests = await getInvestorRequests(uid);
        if (outRequests.length === 0) {
          addRec({
            type: "project",
            title: "Explore new startups",
            reason: "You haven't sent any investment requests. Start exploring active projects on the platform.",
            priority: "medium",
            confidence: 0.89,
            actionTarget: "projects"
          });
        }
      }

      // Always check finance
      const finProfile = await getFinancialProfile(uid);
      if (!finProfile) {
        addRec({
          type: "finance",
          title: "Upload your first bank statement",
          reason: "Unlock deep financial insights and health scores by securely uploading a statement.",
          priority: "high",
          confidence: 0.95,
          actionTarget: "finance"
        });
      } else if (finProfile.healthScore && finProfile.healthScore < 50) {
        addRec({
          type: "finance",
          title: "Review your recent spending patterns",
          reason: "Your financial health score is decreasing. Consider reviewing expenses.",
          priority: "high",
          confidence: 0.88,
          actionTarget: "finance"
        });
      }
      
      // Ultimate fallback if absolutely nothing triggered
      if (recommendations.length === 0) {
        addRec({
          type: "productivity",
          title: "Discover platform features",
          reason: "Explore FinX's AI capabilities, from CV analysis to statement parsing.",
          priority: "low",
          confidence: 0.7,
          actionTarget: "services"
        });
      }

    } catch (err) {
      console.warn("Failed generating real recommendations, falling back", err);
      // Create at least one fallback so it's not blank
      if (recommendations.length === 0) {
        addRec({
          type: "productivity",
          title: "Welcome to FinX",
          reason: "Explore your dashboard to see what's new and update your profile.",
          priority: "medium",
          confidence: 0.9,
          actionTarget: "profile"
        });
      }
    }

    try {
      const batch = writeBatch(db);
      recommendations.forEach(rec => {
        const docRef = doc(db, "users", uid, "recommendations", rec.id);
        batch.set(docRef, rec);
      });
      await batch.commit();
    } catch (e) {
      console.warn("Could not save generated recommendations", e);
    }

    return recommendations;
  }
};
