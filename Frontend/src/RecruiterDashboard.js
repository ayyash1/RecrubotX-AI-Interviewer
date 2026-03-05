import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate, NavLink } from "react-router-dom";
import {
  Users,
  Briefcase,
  Video,
  PlusCircle,
  FileText,
  LayoutDashboard,
  Settings,
  LogOut,
  Trash2,
  Search,
  Compass
} from "lucide-react";
import API_BASE_URL from "./apiConfig";
import RecruiterSidebar from "./components/RecruiterSidebar";
import TourOverlay from "./components/TourOverlay";
import TourRecommendation from "./components/TourRecommendation";

const RECRUITER_TOUR_KEY = "recruiter_tour_done";

const recruiterTourSteps = [
  {
    target: "[data-tour='r-dashboard']",
    title: "Dashboard",
    description: "Your command center. Track active jobs, candidate pipelines, and screening metrics at a glance.",
  },
  {
    target: "[data-tour='r-job-posting']",
    title: "Job Posting",
    description: "Create and publish new positions with custom requirements, questions, and deadlines.",
  },
  {
    target: "[data-tour='r-cv-review']",
    title: "Resume Analyzer",
    description: "Upload CVs and let AI rank, score, and filter candidates — so you focus on the best.",
  },
  {
    target: "[data-tour='r-settings']",
    title: "Settings",
    description: "Update your company profile, branding, and account preferences.",
  },
  {
    target: "[data-tour='r-stat-active-jobs']",
    title: "Active Jobs",
    description: "The total number of live job postings currently accepting candidates.",
  },
  {
    target: "[data-tour='r-stat-candidates']",
    title: "Total Candidates",
    description: "The cumulative count of CVs submitted across all your active job postings.",
  },
  {
    target: "[data-tour='r-stat-interviews']",
    title: "AI Interviews",
    description: "Jobs that have received at least one CV — ready for AI-powered interview sessions.",
  },
  {
    target: "[data-tour='r-stat-cvs']",
    title: "CVs Screened",
    description: "CVs processed for postings currently in 'Screening' status — your shortlisting pipeline.",
  },
  {
    target: "[data-tour='r-recent-jobs']",
    title: "Recent Job Postings",
    description: "Your 6 most recent job ads. View interview reports or delete posts you no longer need.",
  },
  {
    target: "[data-tour='r-tour-btn']",
    title: "You're all set!",
    description: "Tap this button anytime to replay the tour and explore RecruBotX features again.",
  },
];

const RecruiterDashboard = () => {
  const navigate = useNavigate();
  const [recruiterData, setRecruiterData] = useState(null);
  const [jobPostings, setJobPostings] = useState([]);
  const [dashboardStats, setDashboardStats] = useState({
    activeJobs: 0,
    totalCandidates: 0,
    aiInterviews: 0,
    cvsScreened: 0
  });
  const [showTour, setShowTour] = useState(false);
  const [showTourRecommendation, setShowTourRecommendation] = useState(false);

  // Show tour recommendation if tour not completed
  useEffect(() => {
    if (!localStorage.getItem(RECRUITER_TOUR_KEY)) {
      setShowTourRecommendation(true);
    }
  }, []);

  // Listen for tour event dispatched by the sidebar
  useEffect(() => {
    const handleStartTour = () => {
      setShowTour(true);
      setShowTourRecommendation(false); // Dismiss recommendation when tour starts
    };
    window.addEventListener("rbx:start-tour", handleStartTour);
    return () => window.removeEventListener("rbx:start-tour", handleStartTour);
  }, []);

  const handleTourFinish = () => {
    localStorage.setItem(RECRUITER_TOUR_KEY, "1");
    setShowTour(false);
    setShowTourRecommendation(false);
  };

  const handleDismissRecommendation = () => {
    setShowTourRecommendation(false);
  };

  useEffect(() => {
    const storedUser = localStorage.getItem("recruiterUser");
    if (storedUser) {
      const user = JSON.parse(storedUser);
      setRecruiterData(user);
      fetchJobPostings(user.id);
    } else {
      navigate("/recruiter/signin");
    }
  }, [navigate]);

  const fetchJobPostings = async (recruiterId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/jobs/recruiter/${recruiterId}`);
      if (!response.ok) throw new Error("Failed to fetch job postings");
      const data = await response.json();

      // Sort by creation date (most recent first) and get top 6
      const sortedJobs = data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setJobPostings(sortedJobs.slice(0, 6));

      // Update stats - now using cvFilesCount from backend (Reference Pattern)
      setDashboardStats({
        activeJobs: data.length,
        totalCandidates: data.reduce((sum, job) => sum + (job.cvFilesCount || 0), 0),
        aiInterviews: data.filter(job => (job.cvFilesCount || 0) > 0).length,
        cvsScreened: data
          .filter(job => job.status === "Screening")
          .reduce((sum, job) => sum + (job.cvFilesCount || 0), 0)
      });
    } catch (error) {
      console.error("Error fetching job postings:", error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("recruiterUser");
    navigate("/recruiter/signin");
  };

  const handleDeleteJob = async (jobId) => {
    if (window.confirm("Are you sure you want to delete this job posting? This action cannot be undone.")) {
      try {
        const response = await fetch(`${API_BASE_URL}/jobs/${jobId}`, {
          method: 'DELETE',
        });
        const data = await response.json();

        if (data.success) {
          // Refresh job postings and stats
          fetchJobPostings(recruiterData.id);
        } else {
          alert("Failed to delete job posting: " + (data.message || "Unknown error"));
        }
      } catch (error) {
        console.error("Error deleting job posting:", error);
        alert("An error occurred while deleting the job posting.");
      }
    }
  };

  if (!recruiterData) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0a2a5e] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen flex bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden fixed inset-0">
      {showTourRecommendation && (
        <TourRecommendation
          targetSelector="[data-tour='r-tour-btn']"
          onDismiss={handleDismissRecommendation}
        />
      )}
      {showTour && <TourOverlay steps={recruiterTourSteps} onFinish={handleTourFinish} />}
      {/* Sidebar */}
      <RecruiterSidebar />

      {/* Main Content */}
      <main className="flex-1 h-screen flex flex-col overflow-hidden py-8 px-8">
        {/* Welcome Banner with User Profile */}
        <motion.div
          data-tour="r-welcome-banner"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-[#0a2a5e] to-[#0d3b82] rounded-2xl p-6 mb-6 text-white shadow-lg flex-shrink-0"
        >
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Welcome back, {recruiterData.firstName}!</h2>
              <p className="text-blue-100 mt-1">Manage your hiring pipeline and find the best talent efficiently.</p>
            </div>
            <button
              data-tour="r-tour-btn"
              onClick={() => window.dispatchEvent(new CustomEvent("rbx:start-tour"))}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-white text-xs font-medium"
            >
              <Compass className="w-3.5 h-3.5" />
              Take a Tour
            </button>
          </div>
        </motion.div>

        {/* Stats Cards - Fixed */}
        <div className="grid grid-cols-4 gap-6 mb-6 flex-shrink-0">
          <motion.div
            data-tour="r-stat-active-jobs"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[#0a2a5e]/60 text-sm font-medium">Active Jobs</p>
                <h3 className="text-3xl font-bold text-[#0a2a5e] mt-2">{dashboardStats.activeJobs}</h3>
              </div>
              <div className="w-14 h-14 bg-[#0a2a5e]/10 rounded-xl flex items-center justify-center">
                <Briefcase className="w-7 h-7 text-[#0a2a5e]" />
              </div>
            </div>
          </motion.div>

          <motion.div
            data-tour="r-stat-candidates"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[#0a2a5e]/60 text-sm font-medium">Total Candidates</p>
                <h3 className="text-3xl font-bold text-[#0a2a5e] mt-2">{dashboardStats.totalCandidates}</h3>
              </div>
              <div className="w-14 h-14 bg-[#0a2a5e]/10 rounded-xl flex items-center justify-center">
                <Users className="w-7 h-7 text-[#0a2a5e]" />
              </div>
            </div>
          </motion.div>

          <motion.div
            data-tour="r-stat-interviews"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[#0a2a5e]/60 text-sm font-medium">AI Interviews</p>
                <h3 className="text-3xl font-bold text-[#0a2a5e] mt-2">{dashboardStats.aiInterviews}</h3>
              </div>
              <div className="w-14 h-14 bg-[#0a2a5e]/10 rounded-xl flex items-center justify-center">
                <Video className="w-7 h-7 text-[#0a2a5e]" />
              </div>
            </div>
          </motion.div>

          <motion.div
            data-tour="r-stat-cvs"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[#0a2a5e]/60 text-sm font-medium">CVs Screened</p>
                <h3 className="text-3xl font-bold text-[#0a2a5e] mt-2">{dashboardStats.cvsScreened}</h3>
              </div>
              <div className="w-14 h-14 bg-[#0a2a5e]/10 rounded-xl flex items-center justify-center">
                <FileText className="w-7 h-7 text-[#0a2a5e]" />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Recent Job Postings - Fixed height container with scrollable content */}
        <div data-tour="r-recent-jobs" className="bg-white rounded-2xl shadow-lg flex-1 flex flex-col overflow-hidden">
          <div className="flex items-center justify-between gap-2 p-6 pb-4 flex-shrink-0 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <Briefcase className="w-6 h-6 text-[#0a2a5e]" />
              <h3 className="text-xl font-bold text-gray-800">Recent Job Postings</h3>
            </div>
            <NavLink to="/recruiter/all-jobs" className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 flex items-center gap-2 shadow-sm whitespace-nowrap">
              <Briefcase className="w-4 h-4" /> View All Jobs
            </NavLink>
          </div>

          {jobPostings.length === 0 ? (
            <div className="flex-1 flex items-center justify-center text-gray-500 p-6">
              <div className="text-center">
                <Briefcase className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p className="text-lg font-medium">No job postings yet</p>
                <p className="text-sm mt-2">Create your first job posting to get started!</p>
                <button
                  onClick={() => navigate('/recruiter/job-posting')}
                  className="mt-4 px-6 py-3 bg-[#0a2a5e] text-white rounded-xl hover:bg-[#061a3d] transition-all"
                >
                  Create Job Posting
                </button>
              </div>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {jobPostings.map((job, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="border border-gray-200 rounded-xl p-5 hover:shadow-md hover:border-[#0a2a5e]/30 transition-all"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <h4 className="font-bold text-gray-800 text-lg mb-1">
                          {job.interviewField}
                        </h4>
                        <p className="text-sm text-gray-500">
                          {job.positionLevel} • {job.cvFilesCount || 0} Candidates
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-100">
                      <span className="text-xs text-gray-400 flex-1">
                        {new Date(job.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </span>
                      <div className="flex gap-2">
                        <button
                          onClick={() => navigate(`/recruiter/reports/${job.id || job._id}`)}
                          className="text-[#0a2a5e] hover:bg-[#0a2a5e]/5 px-3 py-1.5 rounded-lg text-sm font-semibold transition-all border border-[#0a2a5e]/20"
                        >
                          View
                        </button>
                        <button
                          onClick={() => handleDeleteJob(job.id || job._id)}
                          className="text-red-600 hover:bg-red-50 p-2 rounded-lg transition-all border border-red-100"
                          title="Delete Job Posting"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

    </div>
  );
};

export default RecruiterDashboard;
