import { useState, useRef, useCallback, useEffect } from 'react';

export function useCardReveal(
  isEmergencyLocked: boolean,
  riskScore: number,
  setRiskScore: (score: number) => void,
  addEvent: (type: string, status: "success" | "blocked" | "warning", method?: string) => void
) {
  const [isRevealed, setIsRevealed] = useState(false);
  const [revealTimeLeft, setRevealTimeLeft] = useState(30);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [showConfirmReveal, setShowConfirmReveal] = useState(false);
  const [revealAttempts, setRevealAttempts] = useState(0);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const handleHide = useCallback(() => {
    setIsRevealed(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
  }, []);

  const handleRevealConfirm = async () => {
    setIsAuthenticating(true);
    await new Promise(r => setTimeout(r, 1000));
    
    const newAttempts = revealAttempts + 1;
    setRevealAttempts(newAttempts);
    
    let currentRisk = riskScore;
    if (newAttempts > 3) currentRisk += 30;
    setRiskScore(Math.min(currentRisk, 100));
    
    if (currentRisk > 70 || isEmergencyLocked) {
      addEvent("Card Reveal Blocked", "blocked", "Passkey");
      setIsAuthenticating(false);
      setShowConfirmReveal(false);
      return; 
    }

    addEvent("Card Revealed", "success", "Passkey");
    setIsAuthenticating(false);
    setShowConfirmReveal(false);
    setIsRevealed(true);
    setRevealTimeLeft(30);
    
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setRevealTimeLeft(prev => {
        if (prev <= 1) {
          handleHide();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  return {
    isRevealed,
    revealTimeLeft,
    isAuthenticating,
    showConfirmReveal,
    setShowConfirmReveal,
    handleRevealConfirm,
    handleHide
  };
}
