# Triora Backend

Production-ready backend for **Triora**, a voice-first pre-therapy intake web application.

Patients participate in an open-ended spoken intake conversation prior to their first therapy session. The backend manages authentication, patient profiles, progressive 3-step onboarding, conversation session state, short-lived speech token generation, real-time WebSocket communication, AI intake processing via Google Gemini, pre-therapy report compilation, and simulated emotional intensity heat-map timeline data.

---

## Technical Stack

- **Runtime**: Node.js (v18+)
- **Language**: TypeScript
- **Framework**: Express.js
- **Database**: MongoDB & Mongoose ODM
- **Authentication**: JWT & Google OAuth 2.0 (`google-auth-library`)
- **Real-Time Communication**: WebSockets (`ws`)
- **Speech Services**: Azure Speech Services API
- **AI Intelligence**: Google Gemini API (`gemini-2.5-flash`)
- **Security & Validation**: Helmet, CORS, Express Rate Limit, Zod
- **Logging**: Winston structured logger

---

## Architecture Overview

```
backend/
├── src/
│   ├── config/          # DB, env validation, Winston logger
│   ├── controllers/     # REST request handlers
│   ├── middleware/      # Auth, Zod validation, Error & 404 handlers
│   ├── models/          # Mongoose schemas (User, Session, Report)
│   ├── routes/          # Express route definitions (/api/*)
│   ├── services/        # Business logic & AI/Speech integrations
│   │   └── gemini/      # Gemini Client, Conversation Engine, Report Generator
│   ├── types/           # TypeScript interfaces & types
│   ├── utils/           # Async wrapper, JWT utils
│   ├── validators/      # Zod request validation schemas
│   ├── websocket/       # Real-time WebSocket server (/ws/conversation)
│   ├── app.ts           # Express application configuration
│   └── server.ts        # Server entry point
├── docs/
│   ├── API.md           # Full API & WebSocket specification
│   └── ARCHITECTURE.md  # Architectural design & security boundaries
└── tests/              # Automated test suite (10 module runners)
```

---

## Installation & Setup

### Prerequisites
- Node.js (v18 or higher)
- MongoDB running locally (`mongodb://127.0.0.1:27017`) or a remote MongoDB Atlas URI

### 1. Clone & Install Dependencies
```bash
cd backend
npm install
```

### 2. Environment Configuration
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

Configure `.env` with appropriate values:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://127.0.0.1:27017/triora_db
JWT_SECRET=your_super_secret_jwt_key
GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
AZURE_SPEECH_KEY=your_azure_speech_key
AZURE_SPEECH_REGION=eastus
AZURE_SPEECH_VOICE=en-US-AvaNeural
GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=gemini-2.5-flash
MOCK_MODE=true
CLIENT_URL=http://localhost:3000
```

---

## MOCK_MODE

When `MOCK_MODE=true` (default in local development):
- Azure Speech token generation returns a mock short-lived authorization token without calling Azure APIs.
- Gemini Conversation Engine returns structured pre-therapy intake responses in the selected language without incurring API quota.
- Session report generation compiles mock intake summaries.

Set `MOCK_MODE=false` in production with valid `GEMINI_API_KEY` and `AZURE_SPEECH_KEY`.

---

## Running the Application

### Development Mode (with hot reloading):
```bash
npm run dev
```

### Production Build & Execution:
```bash
npm run build
npm start
```

---

## Running Tests

Run the complete 10-module test suite:
```bash
npm test
```

### Automated Test Coverage:
1. Health Check (`GET /api/health`)
2. Local Authentication (`signup`, `login`, `me`, `profile`)
3. Google OAuth (`POST /api/auth/google`)
4. Patient Onboarding (`GET /api/onboarding`, `PATCH /api/onboarding`)
5. Patient Session Management (`POST`, `GET`, `PATCH /api/sessions`)
6. Azure Speech Token Generation (`GET /api/speech/token`)
7. Gemini Conversation Engine (Multilingual, prompts, boundary guardrails)
8. Real-Time WebSocket Server (`ws://localhost:5000/ws/conversation`)
9. AI-Generated Session Reports (`POST /api/report/generate/:sessionId`, `GET /api/report/:id`)
10. Failures, Edge Cases & Heat-Map timeline analysis (`GET /api/sessions/:id/heatmap`)

---

## Key API Endpoints & WebSocket Protocol

Detailed endpoint specs can be found in [`docs/API.md`](file:///c:/Users/prabh/Downloads/Triora/backend/docs/API.md).

| Method | Endpoint | Description | Auth |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/health` | Health & system status | None |
| `POST` | `/api/auth/signup` | Patient registration | None |
| `POST` | `/api/auth/login` | Patient login | None |
| `POST` | `/api/auth/google` | Google OAuth authentication | None |
| `GET` | `/api/auth/me` | Fetch authenticated profile | JWT |
| `PATCH` | `/api/auth/profile` | Update profile information | JWT |
| `GET` | `/api/onboarding` | Fetch 3-step onboarding status | JWT |
| `PATCH` | `/api/onboarding` | Update onboarding step data | JWT |
| `POST` | `/api/sessions` | Create new intake session | JWT |
| `GET` | `/api/sessions` | List patient's sessions | JWT |
| `GET` | `/api/sessions/:id` | Fetch session by ID | JWT |
| `PATCH` | `/api/sessions/:id` | Update session status | JWT |
| `GET` | `/api/sessions/:id/heatmap` | Simulated heat-map timeline data | JWT |
| `GET` | `/api/speech/token` | Fetch Azure Speech token | JWT |
| `POST` | `/api/report/generate/:id`| Generate AI intake summary report | JWT |
| `GET` | `/api/report/:id` | Fetch intake summary report | JWT |
| `WS` | `/ws/conversation?token=<JWT>` | Real-time intake conversation socket | Query JWT |

---

## Production Deployment Notes

1. Set `NODE_ENV=production`.
2. Configure `CLIENT_URL` to restrict CORS to trusted client domains.
3. Ensure secret environment variables (`JWT_SECRET`, `GEMINI_API_KEY`, `AZURE_SPEECH_KEY`) are managed via secure secrets manager.
4. Set `MOCK_MODE=false`.
5. Run behind a reverse proxy (e.g. Nginx or Cloudfare) with TLS/SSL termination.
