# Triora Backend Architecture Documentation

## Overview

**Triora** is a voice-first pre-therapy intake application that allows patients to engage in an open-ended pre-therapy conversation. The backend manages patient profiles, onboarding, conversation sessions, real-time WebSocket communication, speech token generation, AI intake intelligence, non-diagnostic report compilation, and emotional intensity heat-map analysis.

---

## Technical Stack & Layers

- **Runtime**: Node.js (v18+)
- **Language**: TypeScript (ES2022Target, Strict Null Checks)
- **Framework**: Express.js
- **Database**: MongoDB via Mongoose ODM
- **Real-Time Communication**: `ws` WebSocket library
- **AI Intelligence**: `@google/genai` (Gemini API with `gemini-2.5-flash`)
- **Speech Services**: Azure Speech Services API
- **Authentication**: JWT (`jsonwebtoken`) & Google OAuth (`google-auth-library`)
- **Password Hashing**: `bcryptjs`
- **Validation**: `zod`
- **Logging**: `winston`

---

## Key Architectural Systems

```
                              ┌─────────────────────────┐
                              │     Client Application  │
                              └────────────┬────────────┘
                                           │
                    ┌──────────────────────┴──────────────────────┐
                    │                                             │
             HTTP REST API (/api/*)                       WebSocket Server (/ws/*)
                    │                                             │
      ┌─────────────▼─────────────┐                 ┌─────────────▼─────────────┐
      │ Helmet / CORS / RateLimit │                 │ JWT Handshake & Query Auth│
      └─────────────┬─────────────┘                 └─────────────┬─────────────┘
                    │                                             │
      ┌─────────────▼─────────────┐                 ┌─────────────▼─────────────┐
      │   Express Controllers     │                 │   Conversation WebSocket  │
      └─────────────┬─────────────┘                 └─────────────┬─────────────┘
                    │                                             │
      ┌─────────────▼─────────────────────────────────────────────▼─────────────┐
      │                            Service Layer                                │
      │  Auth, Onboarding, Session, Speech, Conversation Engine, Report, Heatmap │
      └─────────────┬─────────────────────────────────────────────┬─────────────┘
                    │                                             │
      ┌─────────────▼─────────────┐                 ┌─────────────▼─────────────┐
      │      MongoDB / Mongoose   │                 │   Gemini / Azure Speech   │
      └───────────────────────────┘                 └───────────────────────────┘
```

---

## Security Boundaries & Controls

1. **Zero Secret Exposure**:
   - `AZURE_SPEECH_KEY`, `GEMINI_API_KEY`, and `JWT_SECRET` reside strictly server-side.
   - `/api/speech/token` generates short-lived authorization tokens (10-minute expiry) for client SDK speech-to-text initialization.
2. **User Data Isolation & IDOR Protection**:
   - All session, report, onboarding, and heat-map queries filter by `userId: req.user.id`.
   - Cross-user session/report access returns `404 Not Found`.
3. **Non-Diagnostic AI Persona Guardrails**:
   - Prompts strictly mandate a supportive intake interviewer role.
   - Forbids medical diagnoses, clinical assessments, treatment prescriptions, or crisis counseling.
4. **WebSocket Connection Defense**:
   - Connection handshake requires `?token=<JWT>`.
   - Enforces a 10KB message payload limit and 30 messages/minute rate limit per connection.
5. **NoSQL Injection & Input Sanitization**:
   - Zod schemas validate and parse request bodies before reaching controller logic.
   - Mongoose strictly casts ObjectIDs to prevent query operator injection.

---

## Session Lifecycle State Machine

```
   [CREATED]  ──────►  [ACTIVE]  ──────►  [COMPLETED]
       │                   │
       └───────────────────┴───────────►  [FAILED]
```

- **CREATED**: Session initialized by patient.
- **ACTIVE**: Real-time conversation commenced over WebSocket.
- **COMPLETED**: Patient completes intake conversation. Eligible for AI Report generation.
- **FAILED**: Timeout or client error.

---

## Production Deployment Notes

1. Set `NODE_ENV=production` in environment.
2. Provide valid MongoDB connection string (`MONGODB_URI`).
3. Configure `CLIENT_URL` to restrict CORS origins to trusted frontend domains.
4. Ensure `GEMINI_API_KEY` and `AZURE_SPEECH_KEY` are populated (set `MOCK_MODE=false`).
5. Execute `npm run build` followed by `npm start`.
