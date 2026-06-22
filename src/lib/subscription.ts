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

export async function upgradePlanDemo(uid: string, plan: SubscriptionPlan) {
  // Demo function to simulate upgrading plan over UI
  const docRef = doc(db, "users", uid);
  await setDoc(docRef, { subscription: { plan, status: "active", currentPeriodEnd: Date.now() + 30 * 24 * 60 * 60 * 1000 } }, { merge: true });
}
