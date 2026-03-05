# RecruBotX Frontend - Interactive AI Recruitment Platform

## 🚀 Overview
RecruBotX is a cutting-edge AI recruitment platform built with React. It provides an intuitive interface for both candidates and recruiters to manage the hiring process through AI-powered voice interviews, CV screening, and ranking.

---

## 🛠️ Getting Started

### 1. Installation
```bash
cd Frontend
npm install
```

### 2. Environment Configuration
Create a `.env` file in the `Frontend` directory:
```env
REACT_APP_API_URL=http://localhost:8000
```

### 3. Available Scripts
- `npm start`: Runs the app in development mode at [http://localhost:3000](http://localhost:3000)
- `npm run build`: Builds the production bundle
- `npm test`: Launches the test runner

---

## 👥 Candidate Features

### 1. AI Voice Interview
- Interactive AI-driven interviews with real-time speech-to-text and text-to-speech.
- PDF CV upload integrated directly into the interview start flow.
- AI-powered information extraction from uploaded CVs.

### 2. Resume Builder & Management
- Multiple templates to choose from.
- PDF generation and download of created resumes.
- "Analyze Resume" feature to screen CVs against job descriptions.

### 3. Candidate Dashboard
- View all active job vacancies.
- Track interview status and dates.
- Interactive job details modal with background blur.
- Quick navigation to CV screening and resume builder.

---

## 👔 Recruiter Features

### 1. Job Posting & Management
- Create job postings with rich text descriptions.
- Advanced formatting tools (bold, italic, bullets).
- Upload multiple candidate CVs for batch processing.

### 2. Candidate Ranking
- AI-powered scoring based on CV match, interview performance, and technical skills.
- Sorting and filtering candidates by score and status.
- Detailed candidate reports with strengths and weaknesses analysis.

### 3. Evaluation Dashboard
- Visual progress bars for skill assessment.
- High/Medium/Low score filtering.
- Bulk download of evaluation reports in JSON format.

---

## 🗄️ Authentication & Data
- **Candidate Auth**: Managed via API at `POST /api/auth/register` and `POST /api/auth/login`.
- **Recruiter Auth**: Managed via API at `POST /api/auth/login`.
- **User Session**: Handled through `src/utils/userDatabase.js`. Current user session is stored in browser `localStorage`.
- **Database Architecture**: Uses MongoDB. Collections include `candidate_users`, `recruiter_users`, `job_postings`, etc.

---

## 📁 Project Structure
- `src/components/`: Reusable UI components.
- `src/pages/`: Main application pages.
- `src/utils/`: Utility functions for API and state management.
- `src/icons/`: SVG and Lucide-react icons.

---

## 🔐 Security & Best Practices
- **Input Validation**: Enforced on all forms and file uploads.
- **Protected Routes**: Dashboard and settings require authentication.
- **Rich Text Control**: Managed through contentEditable with controlled resets.

---

**Version:** 1.0.0  
**Framework:** React 18+  
**Styling:** Tailwind CSS  
