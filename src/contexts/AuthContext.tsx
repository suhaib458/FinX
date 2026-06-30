import React, { createContext, useContext, useState, useEffect } from "react";
import { auth, db } from "../lib/firebase";
import { onAuthStateChanged, User, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

interface AuthContextType {
  currentUser: User | null;
  isAuthenticated: boolean;
  authLoading: boolean;
  isPhoneVerified: boolean;
  verifyPhone: () => void;
  login: () => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [isPhoneVerified, setIsPhoneVerified] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      
      if (user) {
        try {
          const prefsDoc = await getDoc(doc(db, "users", user.uid, "settings", "smsPreferences"));
          const prefsData = prefsDoc.data();
          if (!prefsData?.verified) {
             setIsPhoneVerified(false);
             setAuthLoading(false);
             return;
          }
          setIsPhoneVerified(true);
        } catch (e) {
          console.error("Error checking phone verification:", e);
        }
      }
      
      setAuthLoading(false);
    });
    
    return () => unsubscribe();
  }, []);

  const verifyPhone = () => setIsPhoneVerified(true);
  
  const login = () => {
    // Auth component handles specific login methods directly via Firebase
    console.warn("login() called on AuthContext. Use Auth component for specific sign in methods.");
  };

  const logout = async () => {
    await signOut(auth);
  };

  const value = React.useMemo(() => ({
    currentUser,
    isAuthenticated: !!currentUser,
    authLoading,
    isPhoneVerified,
    verifyPhone,
    login,
    logout
  }), [currentUser, authLoading, isPhoneVerified]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
