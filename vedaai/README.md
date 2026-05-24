# VedaAI — AI Teacher's Toolkit

A full-stack application for teachers to create AI-powered question papers and assignments.

---

## Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | Next.js 14, TypeScript, Tailwind CSS, Zustand, Framer Motion |
| Backend | Node.js, Express.js, TypeScript, MongoDB, Socket.io |
| Auth | JWT (Bearer tokens) |
| AI | OpenAI GPT-4o-mini (falls back to demo data without API key) |

---

## Quick Start

### Prerequisites
- Node.js 18+
- MongoDB running locally (`mongod`) OR MongoDB Atlas URI
- (Optional) Redis for job queue

### 1. Backend

```bash
cd backend
npm install
# Edit .env — add your MONGODB_URI and OPENAI_API_KEY
npm run dev          # starts on http://localhost:5000
```

Seed test users + sample data:
```bash
npm run seed
```

### 2. Frontend

```bash
cd frontend
npm install
npm run dev          # starts on http://localhost:3000
```

---

## Environment Variables

### backend/.env
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/vedaai
JWT_SECRET=your_secret_key_here
JWT_EXPIRES_IN=7d
OPENAI_API_KEY=sk-...          # Add your real key for AI generation
FRONTEND_URL=http://localhost:3000
```

### frontend/.env.local
```
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_SOCKET_URL=http://localhost:5000
```

---

## Test Credentials (after seeding)

| Role | Email | Password |
|------|-------|----------|
| Teacher | teacher@vedaai.com | Teacher@123456 |
| Admin | admin@vedaai.com | Admin@123456 |

---

## Ports

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000/api
- **Health check**: http://localhost:5000/health

---

## Features

- ✅ JWT Authentication (login, register, logout)
- ✅ Protected routes with role-based access
- ✅ Create assignments with file upload (PDF/image)
- ✅ AI question paper generation (OpenAI or demo fallback)
- ✅ Real-time progress via Socket.io
- ✅ View / download generated papers
- ✅ Responsive design (mobile + desktop)
- ✅ MongoDB with Mongoose models

---

## API Endpoints

### Auth
| Method | Path | Description |
|--------|------|-------------|
| POST | /api/auth/register | Register |
| POST | /api/auth/login | Login |
| GET | /api/auth/profile | Get profile (auth) |
| PUT | /api/auth/profile | Update profile (auth) |
| PUT | /api/auth/change-password | Change password (auth) |

### Assignments
| Method | Path | Description |
|--------|------|-------------|
| GET | /api/assignments | List all |
| GET | /api/assignments/:id | Get one |
| POST | /api/assignments | Create (multipart) |
| PUT | /api/assignments/:id | Update |
| DELETE | /api/assignments/:id | Delete |
| POST | /api/assignments/:id/generate | Start AI generation |
| GET | /api/assignments/:id/pdf | Download HTML paper |

---

## Adding OpenAI Key

Edit `backend/.env`:
```
OPENAI_API_KEY=sk-your_real_key_here
```

Without it, the app uses built-in demo question generation and still works fully.

---

## Deployment

### Backend (Railway / Render)
1. Set all env vars in the platform dashboard
2. Build: `npm run build`
3. Start: `npm start`

### Frontend (Vercel)
1. Set `NEXT_PUBLIC_API_URL` to your backend URL
2. Deploy with `vercel --prod`
