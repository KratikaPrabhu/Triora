# Triora Backend API Documentation

The **Triora Backend API** is built with Node.js, Express, TypeScript, MongoDB, WebSockets, Google OAuth, Azure Speech Services, and Google Gemini API.

All standard API endpoints are prefixed with `/api`. Protected routes require a valid JSON Web Token (JWT) supplied in the HTTP `Authorization` header as `Bearer <token>`.

---

## Response Format

All API responses follow a unified JSON envelope format.

### Success Response Envelope:
```json
{
  "success": true,
  "data": { ... }
}
```

### Error Response Envelope:
```json
{
  "success": false,
  "error": {
    "message": "Human readable error message.",
    "statusCode": 400
  }
}
```

---

## 1. System & Health

### `GET /api/health`
Returns system status, uptime, node environment, and current timestamp.

- **Auth**: None
- **Response `200 OK`**:
```json
{
  "status": "UP",
  "service": "triora-backend",
  "timestamp": "2026-09-12T21:20:00.000Z",
  "uptime": 120.45
}
```

---

## 2. Authentication Module (`/api/auth`)

### `POST /api/auth/signup`
Registers a new local patient account.

- **Auth**: None
- **Request Body**:
```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "password": "Password123!"
}
```
- **Response `201 Created`**:
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "6aa57491a23a44607493b9ef",
      "name": "Jane Doe",
      "email": "jane@example.com",
      "authProvider": "local",
      "profile": { ... }
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6..."
  }
}
```

### `POST /api/auth/login`
Authenticates existing local user credentials.

- **Auth**: None
- **Request Body**:
```json
{
  "email": "jane@example.com",
  "password": "Password123!"
}
```
- **Response `200 OK`**: Same envelope format as signup.

### `POST /api/auth/google`
Authenticates or registers a user via server-side verified Google ID token.

- **Auth**: None
- **Request Body**:
```json
{
  "credential": "eyJhbGciOiJSUzI1NiIs..."
}
```
- **Response `200 OK`**: Returns Triora user profile & Triora JWT.

### `GET /api/auth/me`
Retrieves the profile of the currently authenticated user.

- **Auth**: JWT Required
- **Response `200 OK`**: Returns authenticated user document (without passwordHash).

### `PATCH /api/auth/profile`
Updates profile information for the authenticated user.

- **Auth**: JWT Required
- **Request Body**: Partial update object (name, phone, preferredLanguage, preferredName, etc.)

---

## 3. Patient Onboarding (`/api/onboarding`)

### `GET /api/onboarding`
Retrieves 3-step progressive onboarding state and calculated completion status.

- **Auth**: JWT Required
- **Response `200 OK`**:
```json
{
  "success": true,
  "data": {
    "currentStep": 1,
    "isOnboardingComplete": false,
    "profile": { ... }
  }
}
```

### `PATCH /api/onboarding`
Updates intake onboarding step information (Step 1, Step 2, or Step 3).

- **Auth**: JWT Required
- **Request Body**:
```json
{
  "step": 1,
  "preferredName": "Jane",
  "dateOfBirth": "1995-04-12",
  "preferredLanguage": "English"
}
```

---

## 4. Patient Session Management (`/api/sessions`)

### `POST /api/sessions`
Creates a new intake conversation session.

- **Auth**: JWT Required
- **Request Body**: `{"language": "English"}` (optional, defaults to English)
- **Response `201 Created`**:
```json
{
  "success": true,
  "data": {
    "id": "6aa57491a23a44607493ba13",
    "userId": "6aa57491a23a44607493b9ef",
    "status": "created",
    "language": "English",
    "transcript": [],
    "createdAt": "2026-09-12T21:20:00.000Z"
  }
}
```

### `GET /api/sessions`
Lists all intake sessions belonging to the authenticated user.

- **Auth**: JWT Required
- **Response `200 OK`**: Array of user session documents.

### `GET /api/sessions/:id`
Retrieves a specific session by ID (strictly user-scoped).

- **Auth**: JWT Required

### `PATCH /api/sessions/:id`
Updates session status (`created` -> `active` -> `completed` or `failed`).

- **Auth**: JWT Required

### `GET /api/sessions/:id/heatmap`
Fetches simulated emotional intensity heat map timeline analysis for a session.

- **Auth**: JWT Required
- **Response `200 OK`**:
```json
{
  "success": true,
  "data": {
    "sessionId": "6aa57491a23a44607493ba13",
    "userId": "6aa57491a23a44607493b9ef",
    "totalPoints": 5,
    "averageIntensity": 0.48,
    "peakIntensityTimestamp": "2026-09-12T21:20:00.000Z",
    "timeline": [
      {
        "timestamp": "2026-09-12T21:20:00.000Z",
        "intensity": 0.65,
        "emotion": "anxious",
        "topic": "work_stress"
      }
    ]
  }
}
```

---

## 5. Speech Services (`/api/speech`)

### `GET /api/speech/token`
Generates a short-lived authorization token for Azure Speech Services frontend SDK initialization.

- **Auth**: JWT Required
- **Response `200 OK`**:
```json
{
  "success": true,
  "data": {
    "token": "mock-azure-speech-token-1773523200000",
    "region": "eastus",
    "voice": "en-US-AvaNeural",
    "expiresAt": "2026-09-12T21:30:00.000Z"
  }
}
```

---

## 6. AI Intake Session Reports (`/api/report`)

### `POST /api/report/generate/:sessionId`
Generates a non-diagnostic pre-therapy intake summary for a **completed** session.

- **Auth**: JWT Required
- **Response `200 OK`**:
```json
{
  "success": true,
  "data": {
    "id": "6aa57491a23a44607493ba1c",
    "sessionId": "6aa57491a23a44607493ba15",
    "userId": "6aa57491a23a44607493b9ef",
    "summary": "Patient described feeling overwhelmed by daily work pressure...",
    "keyThemes": ["Work stress", "Sleep disruption"],
    "concerns": ["Evening anxiety"],
    "emotionalContext": "Patient expressed a desire to set better boundaries.",
    "importantStatements": ["I struggle to disconnect after 7 PM."],
    "conversationOverview": "Pre-therapy intake conversation covering work burnout.",
    "generatedAt": "2026-09-12T21:20:00.000Z",
    "modelName": "gemini-3.6-flash",
    "version": "1.0"
  }
}
```

### `GET /api/report/:id`
Retrieves an existing report by Report ID or Session ID.

- **Auth**: JWT Required

---

## 7. Real-Time Conversation WebSocket Protocol

- **Endpoint**: `ws://localhost:5000/ws/conversation?token=<JWT>`

### Client -> Server Protocol:
```json
// 1. Start Session
{ "type": "start_session", "sessionId": "6aa57491a23a44607493ba13" }

// 2. User Speech Transcript
{ "type": "user_message", "sessionId": "6aa57491a23a44607493ba13", "text": "I feel anxious." }

// 3. End Session
{ "type": "end_session", "sessionId": "6aa57491a23a44607493ba13" }
```

### Server -> Client Protocol:
```json
// Session Started
{ "type": "session_started", "sessionId": "...", "status": "active" }

// AI Assistant Response
{
  "type": "assistant_message",
  "sessionId": "...",
  "text": "Thank you for sharing that. Could you tell me more about what triggers this feeling?",
  "metadata": { "intent": "intake_inquiry", "topic": "general_wellbeing", "shouldContinue": true },
  "timestamp": "2026-09-12T21:20:00.000Z"
}

// Session Completed
{ "type": "session_completed", "sessionId": "...", "status": "completed" }
```
