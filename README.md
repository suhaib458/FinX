# FinX - AI Financial Advisor

FinX is an advanced AI-powered financial advisor and career matchmaking engine. It provides deep financial insights, parses bank statements using Gemini Multimodal capabilities, tracks daily streaks and achievements, and offers secure authentication via Firebase and WebAuthn passkeys.

## Features
- **Smart AI Coach:** Uses Google Gemini to analyze financial statements and provide personalized career/financial advice.
- **Biometric Passkey Authentication:** Fully secure, server-authoritative WebAuthn login.
- **Statement Parsing:** Intelligent OCR and classification of financial documents.
- **Subscription Entitlements:** Server-enforced tier limits (Free, Premium, Elite).
- **Gamification:** Rewards, streaks, and achievements engine.
- **Dual Language Support:** Full support for Arabic (RTL) and English (LTR).

## Development
```bash
npm install
npm run dev
```

## Security
- Firestore rules restrict access to user data.
- Subscriptions are server-authoritative.
- Rate limiting and AI quota checks are enforced by the server backend.
