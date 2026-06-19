import { db } from './firebase';
import { doc, getDoc, setDoc, updateDoc, collection, addDoc, getDocs, query, orderBy, Timestamp, onSnapshot } from 'firebase/firestore';

export interface RewardProfile {
  points: number;
  lifetimePoints: number;
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: string; // YYYY-MM-DD
  achievements: string[];
}

export interface RewardActivity {
  id: string;
  type: 'earn' | 'redeem' | 'achievement' | 'streak';
  title: string;
  pointsAmount: number;
  date: Date;
  metadata?: any;
}

export interface RewardsCatalogItem {
  id: string;
  titleEn: string;
  titleAr: string;
  cost: number;
  iconType: string;
}

const REWARDS_CATALOG: RewardsCatalogItem[] = [
  { id: 'careem_10', titleAr: 'قسيمة خصم 10% من كريم', titleEn: '10% Careem Discount', cost: 100, iconType: 'gift' },
  { id: 'starbucks_coffee', titleAr: 'قهوة مجانية من ستاربكس', titleEn: 'Free Starbucks Coffee', cost: 300, iconType: 'coffee' },
  { id: 'netflix_1m', titleAr: 'اشتراك Netflix شهري', titleEn: '1 Month Netflix', cost: 1500, iconType: 'lock' },
];

export const RewardsService = {
  getRewardsCatalog() {
    return REWARDS_CATALOG;
  },

  async initializeProfile(uid: string): Promise<RewardProfile> {
    const profileRef = doc(db, `users/${uid}/rewardProfile/main`);
    const docSnap = await getDoc(profileRef);
    
    if (docSnap.exists()) {
      return docSnap.data() as RewardProfile;
    }

    const newProfile: RewardProfile = {
      points: 0,
      lifetimePoints: 0,
      currentStreak: 0,
      longestStreak: 0,
      lastActiveDate: '',
      achievements: []
    };

    await setDoc(profileRef, newProfile);
    return newProfile;
  },

  async recordActivity(uid: string, uidParams: Omit<RewardActivity, 'id' | 'date'>) {
    const activityRef = collection(db, `users/${uid}/rewardsActivity`);
    await addDoc(activityRef, {
      ...uidParams,
      date: Timestamp.now()
    });
  },

  async processDailyStreak(uid: string, profile: RewardProfile) {
    const today = new Date().toISOString().split('T')[0];
    
    if (profile.lastActiveDate === today) {
      // Already processed today
      return { streakUpdated: false, newStreak: profile.currentStreak };
    }

    let newCurrentStreak = profile.currentStreak;
    let newLongestStreak = profile.longestStreak;

    if (!profile.lastActiveDate) {
      // First day
      newCurrentStreak = 1;
    } else {
      const lastDate = new Date(profile.lastActiveDate);
      const currentDate = new Date(today);
      const diffTime = Math.abs(currentDate.getTime() - lastDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        newCurrentStreak += 1;
      } else {
        newCurrentStreak = 1;
      }
    }

    if (newCurrentStreak > newLongestStreak) {
      newLongestStreak = newCurrentStreak;
    }

    const updates: Partial<RewardProfile> = {
      currentStreak: newCurrentStreak,
      longestStreak: newLongestStreak,
      lastActiveDate: today
    };

    const profileRef = doc(db, `users/${uid}/rewardProfile/main`);
    await updateDoc(profileRef, updates);

    if (newCurrentStreak !== profile.currentStreak) {
      await this.recordActivity(uid, {
        type: 'streak',
        title: `Achieved ${newCurrentStreak} Day Streak`,
        pointsAmount: 0 // No immediate points for streak just logging
      });
    }

    return { streakUpdated: true, newStreak: newCurrentStreak };
  },

  async awardPoints(uid: string, amount: number, isPro: boolean, reason: string) {
    const multiplier = isPro ? 2 : 1;
    const finalAmount = amount * multiplier;
    
    const profileRef = doc(db, `users/${uid}/rewardProfile/main`);
    const docSnap = await getDoc(profileRef);
    if (!docSnap.exists()) return null;

    const profile = docSnap.data() as RewardProfile;
    const newPoints = profile.points + finalAmount;
    const newLifetime = profile.lifetimePoints + finalAmount;

    await updateDoc(profileRef, {
      points: newPoints,
      lifetimePoints: newLifetime
    });

    await this.recordActivity(uid, {
      type: 'earn',
      title: reason,
      pointsAmount: finalAmount,
      metadata: { baseAmount: amount, multiplier }
    });

    return { newPoints, earned: finalAmount };
  },

  async redeemReward(uid: string, rewardId: string): Promise<{ success: boolean; error?: string }> {
    const item = REWARDS_CATALOG.find(i => i.id === rewardId);
    if (!item) return { success: false, error: 'Reward not found' };

    const profileRef = doc(db, `users/${uid}/rewardProfile/main`);
    const docSnap = await getDoc(profileRef);
    if (!docSnap.exists()) return { success: false, error: 'Profile not found' };

    const profile = docSnap.data() as RewardProfile;
    if (profile.points < item.cost) {
      return { success: false, error: 'Insufficient points' };
    }

    const newPoints = profile.points - item.cost;
    
    // Attempt deduction 
    await updateDoc(profileRef, {
      points: newPoints
    });

    await this.recordActivity(uid, {
      type: 'redeem',
      title: `Redeemed ${item.titleEn}`,
      pointsAmount: -item.cost,
      metadata: { rewardId }
    });

    return { success: true };
  },

  async unlockAchievement(uid: string, achievementId: string, title: string, pointsAward: number, isPro: boolean) {
    const profileRef = doc(db, `users/${uid}/rewardProfile/main`);
    const docSnap = await getDoc(profileRef);
    if (!docSnap.exists()) return false;

    const profile = docSnap.data() as RewardProfile;
    if (profile.achievements.includes(achievementId)) {
      return false; // already unlocked
    }

    const updatedAchievements = [...profile.achievements, achievementId];
    
    await updateDoc(profileRef, {
      achievements: updatedAchievements
    });

    await this.recordActivity(uid, {
      type: 'achievement',
      title: `Achievement Unlocked: ${title}`,
      pointsAmount: 0 // Log achievement independently
    });

    if (pointsAward > 0) {
      await this.awardPoints(uid, pointsAward, isPro, `Achievement Reward: ${title}`);
    }

    return true;
  },

  subscribeToProfile(uid: string, callback: (profile: RewardProfile) => void) {
    const profileRef = doc(db, `users/${uid}/rewardProfile/main`);
    return onSnapshot(profileRef, (doc) => {
      if (doc.exists()) {
        callback(doc.data() as RewardProfile);
      }
    });
  },

  async getHistory(uid: string): Promise<RewardActivity[]> {
    const ref = collection(db, `users/${uid}/rewardsActivity`);
    const q = query(ref, orderBy('date', 'desc'));
    const snap = await getDocs(q);
    return snap.docs.map(d => {
      const data = d.data();
      return {
        id: d.id,
        ...data,
        date: data.date.toDate()
      } as RewardActivity;
    });
  }
};
