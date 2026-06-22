import { useState, useEffect } from 'react';

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
 * This directly utilizes Native OS capabilities (TouchID, FaceID, Windows Hello).
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

  const generateRandomBuffer = () => {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return array;
  };

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
         // Accessing window.top can throw in cross-origin iframes
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
      const challenge = generateRandomBuffer();
      const userIdBuffer = new TextEncoder().encode(userId);

      const createOptions: PublicKeyCredentialCreationOptions = {
        challenge,
        rp: {
          name: "FinX",
          id: window.location.hostname
        },
        user: {
          id: userIdBuffer,
          name: email,
          displayName: email.split('@')[0]
        },
        pubKeyCredParams: [
          { alg: -7, type: "public-key" }, // ES256
          { alg: -257, type: "public-key" } // RS256
        ],
        authenticatorSelection: {
          authenticatorAttachment: "platform", // Directs to device biometrics
          userVerification: "required",
          residentKey: "required"
        },
        timeout: 60000,
        attestation: "none"
      };

      const credential = await navigator.credentials.create({
        publicKey: createOptions
      });

      if (credential) {
         return { success: true, message: 'Biometric authentication successfully activated.' };
      }
      
      return { success: false, message: 'Activation failed. Credential not generated.', code: 'CREATION_FAILED' };
    } catch (err: any) {
      return parseAuthError(err);
    }
  };

  const loginWithPasskey = async (): Promise<WebAuthnResult> => {
    if (!isSupported) {
      return { success: false, message: 'Biometric hardware unavailable or not supported on this device.', code: 'NOT_SUPPORTED' };
    }

    try {
      const challenge = generateRandomBuffer();

      const getOptions: PublicKeyCredentialRequestOptions = {
        challenge,
        rpId: window.location.hostname,
        userVerification: "required",
        timeout: 60000
      };

      const assertion = await navigator.credentials.get({
        publicKey: getOptions
      });

      if (assertion) {
        return { success: true };
      }
      return { success: false, message: 'Authentication failed. No credential returned.', code: 'AUTH_FAILED' };
    } catch (err: any) {
      return parseAuthError(err);
    }
  };

  return { isSupported, registerPasskey, loginWithPasskey };
}
