import { useState, useEffect } from 'react';

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

  const registerPasskey = async (userId: string, email: string): Promise<boolean> => {
    if (!isSupported) return false;
    
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

      // If we get here, Passkey was successfully generated and stored on the device.
      // E.g., TouchID was actively successful!
      return !!credential;
    } catch (err: any) {
      console.warn("Passkey registration failed or was cancelled:", err.message || err);
      if (err.name === 'NotAllowedError' || (err.message && err.message.includes('publickey-credentials-create'))) {
          alert("Biometric login cannot be set up within this preview. Please open the app in a new tab to enable Passkeys.");
      }
      return false;
    }
  };

  const loginWithPasskey = async (): Promise<boolean> => {
    if (!isSupported) return false;

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

      // Biometric authenticated successfully!
      return !!assertion;
    } catch (err: any) {
      console.warn("Passkey login failed or was cancelled:", err.message || err);
      if (err.name === 'NotAllowedError' || (err.message && err.message.includes('publickey-credentials-get'))) {
          alert("Biometric login cannot be used within this preview. Please open the app in a new tab to use Passkeys.");
      }
      return false;
    }
  };

  return { isSupported, registerPasskey, loginWithPasskey };
}
