// App.js
import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";

// Global Components
import Navbar from "./components/Navbar";
import Contact from "./components/Contact";
import Footer from "./components/Footer";
import PricingPage from "./components/PricingPage";
import HowItWorksPage from "./components/HowItWorksPage";
import AboutPage from "./components/AboutPage";
import FAQPage from "./components/FAQPage";
import PrivacyPolicyPage from "./components/PrivacyPolicyPage";
import TermsOfServicePage from "./components/TermsOfServicePage";
import ScrollToTop from "./components/ScrollToTop";

// Home
import Hero from "./components/home/Hero";
import WorkingProcess from "./components/home/WorkingProcess";
import About from "./components/home/About";
import Security from "./components/home/Security";
import Stats from "./components/home/Stats";
import FAQ from "./components/home/FAQ";
import Signup from "./components/home/Signup";
import Reviews from "./components/home/Reviews";

// Candidate
import CandidatePage from "./CandidatePage";
import CandidateSignupPage from "./CandidateSignupPage";
import CandidateDashboard from "./CandidateDashboard";
import CandidateSettings from "./CandidateSettings";
import AnalyzeResume from "./analyze_resume";
import LiveInterviewRoute from "./pages/interview/LiveInterviewRoute";
import InterviewPage from "./InterviewPage";
import CandidateJobs from "./CandidateJobs";
import InterviewComplete from "./InterviewComplete";

// Recruiter (HR)
import RecruiterSignupPage from "./RecruiterSignupPage";
import RecruiterSigninPage from "./RecruiterSigninPage";
import RecruiterDashboard from "./RecruiterDashboard";
import JobPosting from "./JobPosting";
import RecruiterCVScreening from "./RecruiterCVScreening";
import CandidateReport from "./CandidateReport";
import RecruiterInterviewReports from "./RecruiterInterviewReports";
import InterviewReportDetail from "./InterviewReportDetail";
import RecruiterSettings from "./RecruiterSettings";
import RecruiterAllJobs from "./RecruiterAllJobs";
import RecruiterAllScreenings from "./RecruiterAllScreenings";

// Resume Builder Pages
import TemplateSelect from "./pages/TemplateSelect";
import ResumeBuilder from "./pages/ResumeBuilder";

// Superuser
import SuperuserLoginPage from "./SuperuserLoginPage";
import SuperuserDashboard from "./SuperuserDashboard";
import SuperuserActivityLogs from "./SuperuserActivityLogs";
import SuperuserUsers from "./SuperuserUsers";
import SuperuserAdmins from "./SuperuserAdmins";
import SuperuserProtectedRoute from "./components/SuperuserProtectedRoute";

// Initialize user database
import { initializeDummyUsers } from "./utils/userDatabase";

// Initialize dummy users on app load
initializeDummyUsers();

// Helper component to conditionally render Navbar
const ConditionalNavbar = () => {
  const location = useLocation();
  // Hide Navbar on specific pages where full-screen dashboard is used
  const hiddenPaths = [
    "/recruiter/dashboard",
    "/recruiter/job-posting",
    "/recruiter/cv-screening",
    "/recruiter/settings",
    "/recruiter/report",
    "/recruiter/all-jobs",
    "/recruiter/all-screenings",
    "/candidate/dashboard",
    "/candidate/jobs",
    "/candidate/apply",
    "/candidate/interview",
    "/candidate/analyze-resume",
    "/candidate/settings",
    "/superuser"
  ];

  const shouldHide = hiddenPaths.some(path => location.pathname.startsWith(path));

  if (shouldHide) return null;
  return <Navbar />;
};

function App() {
  return (
    <Router>
      <ScrollToTop />
      <ConditionalNavbar />

      <Routes>
        {/* ===== HOME ===== */}
        <Route
          path="/"
          element={
            <>
              <Hero />
              <WorkingProcess />
              <About />
              <Security />
              <Stats />
              <Reviews />
              <FAQ />
              <Footer />
            </>
          }
        />

        <Route path="/contact" element={<><Contact /><Footer /></>} />
        <Route path="/how-it-works" element={<><HowItWorksPage /><Footer /></>} />
        <Route path="/pricing" element={<><PricingPage /><Footer /></>} />
        <Route path="/about" element={<><AboutPage /><Footer /></>} />
        <Route path="/faq" element={<><FAQPage /><Footer /></>} />
        <Route path="/privacy" element={<><PrivacyPolicyPage /><Footer /></>} />
        <Route path="/terms" element={<><TermsOfServicePage /><Footer /></>} />
        <Route path="/signup" element={<Signup />} />

        {/* ===== CANDIDATE ===== */}
        <Route path="/candidate/signin" element={<><CandidatePage /><Footer /></>} />
        <Route path="/candidate/signup" element={<><CandidateSignupPage /><Footer /></>} />
        <Route path="/candidate/dashboard" element={<CandidateDashboard />} />
        <Route path="/candidate/settings" element={<CandidateSettings />} />
        <Route path="/candidate/jobs" element={<CandidateJobs />} />
        <Route path="/candidate/apply/:jobId" element={<InterviewPage />} />
        <Route path="/candidate/interview-room" element={<LiveInterviewRoute />} />
        <Route path="/candidate/analyze-resume" element={<AnalyzeResume />} />
        <Route path="/candidate/interview-complete" element={<InterviewComplete />} />

        {/* ===== RESUME BUILDER FLOW ===== */}
        <Route
          path="/candidate/resume/choose-template"
          element={<TemplateSelect />}
        />
        <Route
          path="/candidate/resume/builder"
          element={<ResumeBuilder />}
        />

        {/* ===== RECRUITER (HR) ===== */}
        <Route path="/recruiter/signin" element={<><RecruiterSigninPage /><Footer /></>} />
        <Route path="/recruiter/signup" element={<><RecruiterSignupPage /><Footer /></>} />
        <Route path="/recruiter/dashboard" element={<RecruiterDashboard />} />
        <Route path="/recruiter/job-posting" element={<JobPosting />} />
        <Route path="/recruiter/cv-screening" element={<RecruiterCVScreening />} />
        <Route path="/recruiter/reports/:jobId" element={<RecruiterInterviewReports />} />
        <Route path="/recruiter/interview-report/:reportId" element={<InterviewReportDetail />} />
        <Route path="/recruiter/report/:rankingId" element={<CandidateReport />} />
        <Route path="/recruiter/all-jobs" element={<RecruiterAllJobs />} />
        <Route path="/recruiter/all-screenings" element={<RecruiterAllScreenings />} />
        <Route path="/recruiter/settings" element={<RecruiterSettings />} />
        <Route path="/recruiter/ranking" element={<Navigate to="/recruiter/dashboard" replace />} />
        <Route path="/recruiter/evaluation" element={<Navigate to="/recruiter/dashboard" replace />} />

        {/* ===== SUPERUSER ===== */}
        <Route path="/superuser/signin" element={<SuperuserLoginPage />} />
        <Route path="/superuser/dashboard" element={<SuperuserProtectedRoute><SuperuserDashboard /></SuperuserProtectedRoute>} />
        <Route path="/superuser/activity-logs" element={<SuperuserProtectedRoute><SuperuserActivityLogs /></SuperuserProtectedRoute>} />
        <Route path="/superuser/candidates" element={<SuperuserProtectedRoute><SuperuserUsers endpoint="candidates" title="Candidates" roleLabel="candidate" /></SuperuserProtectedRoute>} />
        <Route path="/superuser/recruiters" element={<SuperuserProtectedRoute><SuperuserUsers endpoint="recruiters" title="Recruiters" roleLabel="recruiter" /></SuperuserProtectedRoute>} />
        <Route path="/superuser/admins" element={<SuperuserProtectedRoute><SuperuserAdmins /></SuperuserProtectedRoute>} />
        <Route path="/superuser/users" element={<Navigate to="/superuser/candidates" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
