import { useState, useEffect } from 'react';
import { startRegistration, startAuthentication } from '@simplewebauthn/browser';
import { auth } from '../lib/firebase';
import { signInWithCustomToken } from 'firebase/auth';

export interface WebAuthnResult {
  success: boolean;
  message?: string;
  code?: string;
  errorDetail?: any;
}

export const isRunningInIframe = (): boolean => {
  try {
    return window.self !== window.top;
  } catch (e) {
    return true; // Access denied usually implies it is in a cross-origin iframe
  }
};

/**
 * Custom hook to safely generate and authenticate a simple passkey using WebAuthn.
 * This uses a secure server-backed flow.
 */
export function useWebAuthn() {
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    if (window.PublicKeyCredential) {
      PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable()
        .then((available) => {
          setIsSupported(available);
        })
        .catch(() => setIsSupported(false));
    }
  }, []);

  const parseAuthError = (err: any): WebAuthnResult => {
    console.error("Biometric Auth Error:", err);
    if (!err) return { success: false, message: 'Unknown error occurred', code: 'UNKNOWN' };
    
    if (err.name === 'NotAllowedError' || (err.message && err.message.includes('publickey-credentials-'))) {
      if (err.message && err.message.includes('publickey-credentials-')) {
         return { success: false, message: 'Biometric login requires the app to be opened in a new tab (not inside the preview iframe).', code: 'IFRAME_RESTRICTED', errorDetail: err };
      }
      
      try {
        if (window.self !== window.top) {
           return { success: false, message: 'Biometric login requires the app to be opened in a new tab (not inside the preview iframe).', code: 'IFRAME_RESTRICTED', errorDetail: err };
        }
      } catch (e) {
         return { success: false, message: 'Biometric login requires the app to be opened in a new tab (not inside the preview iframe).', code: 'IFRAME_RESTRICTED', errorDetail: err };
      }
      
      return { success: false, message: 'Operation cancelled or permission denied.', code: 'USER_CANCELLED', errorDetail: err };
    }
    
    if (err.name === 'InvalidStateError') {
      return { success: false, message: 'A passkey is already registered for this device.', code: 'ALREADY_REGISTERED', errorDetail: err };
    }

    if (err.name === 'NotSupportedError') {
      return { success: false, message: 'Your device does not support biometric authentication or no fingerprints/faces are enrolled.', code: 'NOT_SUPPORTED', errorDetail: err };
    }
    
    if (err.name === 'SecurityError') {
      return { success: false, message: 'Biometric authentication requires a secure connection (HTTPS).', code: 'INSECURE_CONTEXT', errorDetail: err };
    }

    return { success: false, message: err.message || 'Authentication failed due to device or hardware issues.', code: 'HARDWARE_ERROR', errorDetail: err };
  };

  const registerPasskey = async (userId: string, email: string): Promise<WebAuthnResult> => {
    if (!isSupported) {
      return { success: false, message: 'Biometric hardware unavailable or not supported on this device.', code: 'NOT_SUPPORTED' };
    }
    
    try {
      if (!auth.currentUser) throw new Error("Must be logged in to register passkey");
      const token = await auth.currentUser.getIdToken();
      
      // 1. Get options from server
      const resp = await fetch("/api/webauthn/generate-registration-options", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (!resp.ok) throw new Error("Failed to get registration options");
      const options = await resp.json();

      // 2. Pass to authenticator
      const attResp = await startRegistration(options);

      // 3. Send response back to server
      const verificationResp = await fetch("/api/webauthn/verify-registration", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(attResp),
      });

      const verificationJSON = await verificationResp.json();

      if (verificationJSON && verificationJSON.success) {
         return { success: true, message: 'Biometric authentication successfully activated.' };
      }
      
      return { success: false, message: 'Activation failed on server verification.', code: 'CREATION_FAILED' };
    } catch (err: any) {
      return parseAuthError(err);
    }
  };

  const loginWithPasskey = async (): Promise<WebAuthnResult> => {
    if (!isSupported) {
      return { success: false, message: 'Biometric hardware unavailable or not supported on this device.', code: 'NOT_SUPPORTED' };
    }

    try {
      // 1. Get options from server
      const resp = await fetch("/api/webauthn/generate-authentication-options");
      if (!resp.ok) throw new Error("Failed to get authentication options");
      const options = await resp.json();

      // 2. Pass to authenticator
      const asseResp = await startAuthentication(options);

      // 3. Send response back to server
      const verificationResp = await fetch("/api/webauthn/verify-authentication", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(asseResp),
      });

      const verificationJSON = await verificationResp.json();

      if (verificationJSON && verificationJSON.success && verificationJSON.customToken) {
        // 4. Log in to Firebase Auth
        await signInWithCustomToken(auth, verificationJSON.customToken);
        return { success: true };
      }
      return { success: false, message: 'Authentication failed on server verification.', code: 'AUTH_FAILED' };
    } catch (err: any) {
      return parseAuthError(err);
    }
  };

  return { isSupported, registerPasskey, loginWithPasskey };
}
