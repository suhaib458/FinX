import { auth, db } from "./firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";

export type SubscriptionPlan = "free" | "premium" | "elite";

export interface UserSubscription {
  plan: SubscriptionPlan;
  status?: "active" | "canceled" | "past_due" | "unpaid";
  currentPeriodEnd?: number;
}

export const PLAN_LIMITS = {
  free: {
    statementsPerMonth: 2,
    aiCoachMessages: 10,
    hasProAdvisor: false,
    hasJobMatching: false,
    hasCVSmartAnalysis: false,
  },
  premium: {
    statementsPerMonth: 10,
    aiCoachMessages: 100,
    hasProAdvisor: true,
    hasJobMatching: false,
    hasCVSmartAnalysis: true,
  },
  elite: {
    statementsPerMonth: -1, // unlimited
    aiCoachMessages: -1, // unlimited
    hasProAdvisor: true,
    hasJobMatching: true,
    hasCVSmartAnalysis: true,
  }
};

export async function getUserSubscription(uid: string): Promise<UserSubscription> {
  try {
    const docRef = doc(db, "users", uid);
    const snap = await getDoc(docRef);
    if (snap.exists() && snap.data().subscription) {
      return snap.data().subscription as UserSubscription;
    }
  } catch(e) {
    console.error("Error getting user sub:", e);
  }
  return { plan: "free" };
}

export async function upgradePlan(uid: string, plan: SubscriptionPlan) {
  if (!auth.currentUser) throw new Error("Must be logged in to upgrade");
  const token = await auth.currentUser.getIdToken();
  const res = await fetch("/api/upgrade", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify({ plan })
  });
  if (!res.ok) {
    throw new Error("Failed to upgrade plan");
  }
}
