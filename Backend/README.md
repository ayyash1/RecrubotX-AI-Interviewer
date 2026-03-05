# RecruBotX Backend - AI Recruitment Engine

## 🚀 Overview
The RecruBotX Backend is a FastAPI-powered service that handles the heavy lifting of the recruitment process. It integrates Google Gemini AI for CV screening, voice interview management, and candidate ranking, all backed by a persistent MongoDB database.

---

## 🛠️ System Requirements
- Python 3.9+
- MongoDB 6.0+ (Local or Atlas)
- Google Gemini API Key

---

## 🔧 Installation & Setup

1. **Setup Virtual Environment**
   ```bash
   cd Backend
   python -m venv .venv
   source .venv/bin/activate  # Or .venv\Scripts\activate on Windows
   ```

2. **Install Dependencies**
   ```bash
   pip install -r requirements.txt
   ```

3. **Environment Configuration**
   Create a `.env` file in the `Backend` directory:
   ```env
   GEMINI_API_KEY=your_key
   MONGODB_URL=mongodb://localhost:27017
   MONGODB_DB_NAME=recrubotx
   HOST=0.0.0.0
   PORT=8000
   ```

4. **Initialize Database**
   ```bash
   python -m database.init_dummy_users
   python -m database.init_interview_cvs_collection
   ```

5. **Start Server**
   ```bash
   python -m uvicorn main:app --reload
   ```

---

## 🗄️ Database Architecture (MongoDB)

### Key Collections
- **candidate_users**: Stores candidate profiles and auth info.
- **recruiter_users**: Stores recruiter profiles and auth info.
- **job_postings**: Stores job details, requirements, and uploaded CV arrays.
- **candidate_rankings**: Stores AI-calculated scores and interview statuses.
- **evaluation_reports**: Detailed candidate analysis reports.
- **interview_cvs**: Stores extracted information from CVs uploaded for voice interviews.

---

## 📡 Core API Endpoints

### 1. Authentication
- `POST /api/auth/register`: Register new candidate.
- `POST /api/auth/login`: Login for candidates and recruiters.

### 2. Job & Recruitment
- `POST /api/jobs/create`: Create job + Process CVs + Rank Candidates.
- `GET /api/jobs/all`: List all available jobs.
- `GET /api/jobs/recruiter/{id}`: List jobs by recruiter.
- `DELETE /api/jobs/{id}`: Cascading deletion of job and associated rankings/reports.

### 3. Ranking & Evaluation
- `GET /api/rankings/job/{id}`: Get ranked candidates for a job.
- `GET /api/rankings/{id}/report`: Detailed candidate analysis report.
- `GET /api/rankings/evaluations/recruiter/{id}`: List all evaluations for a recruiter.

### 4. Voice Interview
- `POST /api/voice-interview/start-session-with-cv`: Starts interview session with PDF CV parsing.

---

## 🧠 AI Features (Google Gemini)
- **CV Screener**: Automatically extracts name, phone, email, and skills from PDFs.
- **Scoring Engine**: Multi-score ranking (CV Match, Technical, Communication).
- **Voice Agent**: Dynamic interview questioning based on job description and candidate background.

---

## 📁 Storage Structure
- `/uploads/cvs/`: CVs uploaded by recruiters for ranking.
- `/uploads/interview_cvs/`: CVs uploaded by candidates for voice interviews.
- `/static/resumes/`: Generated PDF resumes.

---

## 📝 Maintenance & Troubleshooting

### MongoDB Connection Issues (DNS Fix)
If you encounter `The resolution lifetime expired` or DNS errors with MongoDB Atlas:
1. **Google DNS (Recommended)**: Set your system DNS to `8.8.8.8` and `8.8.4.4`.
2. **Standard String**: Use the "Standard Connection String" (starts with `mongodb://`) from Atlas instead of the SRV string.
3. **Local Dev**: Use `MONGODB_URL=mongodb://localhost:27017` for local development.

### Initialization & Data
- **Clear Data**: Use `DELETE /api/clear-all` to reset for testing.
- **Dummy Data**: Run `python -m database.init_dummy_users` to populate the DB for testing.
- **Health Check**: `GET /health` returns system and DB status.

---

**Version:** 2.2.0  
**Last Updated:** February 2026  
**Developer:** Team RecruBotX  
