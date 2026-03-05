import React, { useState, useEffect } from "react";
import { Briefcase, MapPin, Clock, Send, ArrowRight, ChevronRight, Zap, DollarSign, Home, X, AlertTriangle, XCircle, Users, Compass } from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import { getCurrentUser, logoutUser } from "./utils/userDatabase";
import API_BASE_URL from "./apiConfig";
import CandidateSidebar from "./components/CandidateSidebar";
import TourOverlay from "./components/TourOverlay";
import TourRecommendation from "./components/TourRecommendation";

const CANDIDATE_TOUR_KEY = "candidate_tour_done";

const candidateTourSteps = [
  {
    target: "[data-tour='c-dashboard']",
    title: "Dashboard",
    description: "Your home base. See available jobs and track recent activity at a glance.",
  },
  {
    target: "[data-tour='c-jobs']",
    title: "Job Vacancies",
    description: "Browse every role you've applied for and keep tabs on your application status.",
  },
  {
    target: "[data-tour='c-resume']",
    title: "Create Resume",
    description: "Pick a template and build a tailored resume — AI-assisted from start to finish.",
  },
  {
    target: "[data-tour='c-cv-review']",
    title: "Resume Analyzer",
    description: "Get instant AI feedback on your resume's strengths and gaps before you apply.",
  },
  {
    target: "[data-tour='c-settings']",
    title: "Settings",
    description: "Update your profile, password, and personal preferences anytime.",
  },
  {
    target: "[data-tour='c-job-apps-panel']",
    title: "Job Vacancies Panel",
    description: "All open positions available to you live here. Browse and find your next opportunity.",
  },
  {
    target: "[data-tour='c-cv-rec']",
    title: "Get CV Recommendations",
    description: "Run your resume through AI analysis against a job description and get actionable suggestions to boost your chances.",
  },
  {
    target: "[data-tour='c-recent-activity']",
    title: "Recent Job Activity",
    description: "A live feed of every job you've applied to — with timestamps so you always know where you stand.",
  },
  {
    target: "[data-tour='c-tour-btn']",
    title: "You're all set!",
    description: "Use this button anytime to replay the tour and rediscover what RecruBotX can do for you.",
  },
];

// Renders job description: HTML-aware (new rich-text editor) with plain-text fallback
const formatJobDescription = (text) => {
  if (!text || !text.trim()) {
    return '<p class="text-gray-400 italic">No description provided.</p>';
  }
  // If content is already HTML (from rich-text editor), render it directly
  if (/<[a-z][\s\S]*>/i.test(text)) {
    return text;
  }
  // Fallback: parse plain-text format for older descriptions
  const lines = text.split('\n');
  let html = ''; let inList = false;
  for (const raw of lines) {
    const line = raw.trim();
    if (!line) { if (inList) { html += '</ul>'; inList = false; } continue; }
    const isHeader = /^.{2,80}:$/.test(line) && !/^[-*\u2022\u25cf\u25aa\d]/.test(line);
    const isBullet = /^[-*\u2022\u25cf\u25aa]\s+.+/.test(line) || /^\d+[.)]\s+.+/.test(line);
    if (isHeader) {
      if (inList) { html += '</ul>'; inList = false; }
      html += `<p class="font-bold underline underline-offset-2 text-gray-800 mt-4 mb-1.5 text-sm">${line.replace(/:$/, '')}</p>`;
    } else if (isBullet) {
      if (!inList) { html += '<ul class="pl-4 mb-2 mt-1" style="list-style-type:disc">'; inList = true; }
      const content = line.replace(/^[-*\u2022\u25cf\u25aa]\s+/, '').replace(/^\d+[.)]\s+/, '');
      html += `<li class="text-gray-600 text-sm mb-1">${content}</li>`;
    } else {
      if (inList) { html += '</ul>'; inList = false; }
      html += `<p class="text-gray-600 text-sm leading-relaxed mb-1.5">${line}</p>`;
    }
  }
  if (inList) html += '</ul>';
  return html || '<p class="text-gray-400 italic">No description provided.</p>';
};

const CandidateDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [showTour, setShowTour] = useState(false);
  const [showTourRecommendation, setShowTourRecommendation] = useState(false);

  // Show tour recommendation if tour not completed
  useEffect(() => {
    if (!localStorage.getItem(CANDIDATE_TOUR_KEY)) {
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
    localStorage.setItem(CANDIDATE_TOUR_KEY, "1");
    setShowTour(false);
    setShowTourRecommendation(false);
  };

  const handleDismissRecommendation = () => {
    setShowTourRecommendation(false);
  };

  // Filter states
  const [interviewField, setInterviewField] = useState("all");
  const [position, setPosition] = useState("all");
  const [sortBy, setSortBy] = useState("date-desc");

  // Job postings from database
  const [jobPostings, setJobPostings] = useState([]);
  const [isLoadingJobs, setIsLoadingJobs] = useState(true);
  const [selectedJob, setSelectedJob] = useState(null);
  const [showJobModal, setShowJobModal] = useState(false);

  // Dynamic recent job activity
  const [recentJobActivity, setRecentJobActivity] = useState([]);
  const [isLoadingActivity, setIsLoadingActivity] = useState(true);

  // Fetch job postings from database
  useEffect(() => {
    const fetchJobPostings = async () => {
      try {
        setIsLoadingJobs(true);
        // Fetch all job postings from all recruiters
        const response = await fetch(`${API_BASE_URL}/jobs/all`);
        if (!response.ok) {
          throw new Error('Failed to fetch jobs');
        }
        const data = await response.json();

        // Transform data to match our format
        const transformedJobs = data.map(job => ({
          id: job._id || job.id,
          title: job.interviewField,
          company: job.companyName || "",
          position: job.positionLevel,
          interviewField: job.interviewField,
          workModel: job.workModel,
          status: job.status,
          location: job.location,
          salaryRange: job.salaryRange,
          numberOfVacancies: job.numberOfVacancies || 1,
          appliedDate: new Date(job.createdAt),
          isActive: job.isActive,
          jobDescription: job.jobDescription,
          experienceRange: job.experienceRange,
          industryDomain: job.industryDomain,
          questions: job.questions,
          deadline: job.deadline ? new Date(job.deadline) : null
        }));

        setJobPostings(transformedJobs);
      } catch (error) {
        console.error('Error fetching job postings:', error);
        // Keep empty array on error
        setJobPostings([]);
      } finally {
        setIsLoadingJobs(false);
      }
    };

    fetchJobPostings();
  }, []); // Fetch on mount

  // Get current user on component mount + fetch activity
  useEffect(() => {
    const currentUser = getCurrentUser();
    if (!currentUser) {
      navigate("/candidate/signin");
    } else {
      setUser(currentUser);
      // Fetch recent job activity for this candidate
      const fetchActivity = async () => {
        try {
          setIsLoadingActivity(true);
          const res = await fetch(`${API_BASE_URL}/jobs/candidate/${currentUser.id}/applied-jobs-activity`);
          if (res.ok) {
            const data = await res.json();
            setRecentJobActivity(data.applications || []);
          }
        } catch (err) {
          console.error("Error fetching job activity:", err);
        } finally {
          setIsLoadingActivity(false);
        }
      };
      fetchActivity();
    }
  }, [navigate]);


  // ✅ Logout Handler
  const handleLogout = () => {
    logoutUser();
    navigate("/candidate/signin");
  };

  // ✅ Start Interview Handler
  const handleStartInterview = () => {
    navigate("/candidate/interview");
  };

  // ✅ CV Screening Handler
  const handleCVScreening = () => {
    navigate("/candidate/analyze-resume");
  };

  // ✅ Create Resume Handler
  const handleCreateResume = () => {
    navigate("/candidate/resume/choose-template");
  };

  // Filter and sort job postings
  const getFilteredAndSortedJobs = () => {
    let filtered = [...jobPostings];

    // Apply interview field filter
    if (interviewField !== "all") {
      filtered = filtered.filter(job => {
        const jobFieldSlug = job.interviewField?.toLowerCase().replace(/\s+/g, '-');
        return jobFieldSlug === interviewField;
      });
    }

    // Apply position filter
    if (position !== "all") {
      filtered = filtered.filter(job => {
        const jobPosSlug = job.position?.toLowerCase().replace(/\s+/g, '-');
        return jobPosSlug === position;
      });
    }

    // Apply sorting
    filtered.sort((a, b) => {
      if (sortBy === "name") {
        return a.company.localeCompare(b.company);
      } else if (sortBy === "date-asc") {
        return a.appliedDate - b.appliedDate;
      } else { // date-desc
        return b.appliedDate - a.appliedDate;
      }
    });

    return filtered;
  };

  // Get status badge color
  const getStatusColor = (status) => {
    switch (status) {
      case "Full-time": return "bg-[#0a2a5e]/10 text-[#0a2a5e]";
      case "Part-time": return "bg-green-100 text-green-700";
      case "Contract": return "bg-yellow-100 text-yellow-700";
      case "Active": return "bg-green-100 text-green-700";
      case "Closed": return "bg-gray-100 text-gray-700";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  const isJobExpired = (job) => {
    if (!job.deadline) return false;
    return new Date() > job.deadline;
  };

  const getDeadlineInfo = (job) => {
    if (!job.deadline) return { text: "No deadline", color: "text-gray-400", urgent: false };
    const now = new Date();
    const diff = job.deadline - now;
    const daysLeft = Math.ceil(diff / (1000 * 60 * 60 * 24));

    if (daysLeft < 0) return { text: "Deadline passed", color: "text-red-600", urgent: true };
    if (daysLeft === 0) return { text: "Closes today!", color: "text-red-600", urgent: true };
    if (daysLeft <= 3) return { text: `${daysLeft} day${daysLeft > 1 ? 's' : ''} left`, color: "text-orange-600", urgent: true };
    if (daysLeft <= 7) return { text: `${daysLeft} days left`, color: "text-yellow-600", urgent: false };
    return { text: job.deadline.toLocaleDateString("en-US", { month: "short", day: "numeric" }), color: "text-gray-600", urgent: false };
  };

  // Format relative time
  const getRelativeTime = (date) => {
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins} min${diffMins !== 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
    return date.toLocaleDateString();
  };

  // Show loading state while checking authentication
  if (!user) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen flex bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden fixed inset-0">
      {showTourRecommendation && (
        <TourRecommendation
          targetSelector="[data-tour='c-tour-btn']"
          onDismiss={handleDismissRecommendation}
        />
      )}
      {showTour && <TourOverlay steps={candidateTourSteps} onFinish={handleTourFinish} />}
      {/* Sidebar - Always Visible, No Scroll */}
      <CandidateSidebar />

      {/* Main Content - Non-scrollable */}
      <main className="flex-1 h-screen flex flex-col overflow-hidden py-8 px-8">
        {/* Welcome Banner with User Profile */}
        <div data-tour="c-welcome-banner" className="bg-gradient-to-r from-[#0a2a5e] to-[#0d3b82] text-white rounded-2xl p-6 shadow-lg mb-6 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">

              <div>
                <h3 className="text-2xl font-bold">
                  Welcome back, {user.firstName}!
                </h3>
                <p className="mt-1 text-blue-100">Ready to ace your next interview? Let's get started.</p>

              </div>
            </div>

            {/* Tour Button */}
            <button
              data-tour="c-tour-btn"
              onClick={() => window.dispatchEvent(new CustomEvent("rbx:start-tour"))}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-white text-xs font-medium"
            >
              <Compass className="w-3.5 h-3.5" />
              Take a Tour
            </button>
          </div>
        </div>

        {/* 2-Column Grid Layout */}
        <div className="flex-1 grid grid-cols-5 gap-6 overflow-hidden">
          {/* LEFT SECTION - Job Vacancies (60% - 3 columns) */}
          <div className="col-span-3 flex flex-col overflow-hidden">
            <div data-tour="c-job-apps-panel" className="bg-white rounded-2xl shadow-lg p-6 h-full flex flex-col overflow-hidden">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Job Vacancies</h3>

              {/* Filters Section */}
              <div data-tour="c-job-filters" className="mb-4 grid grid-cols-3 gap-4">
                {/* Interview Field Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Interview Field
                  </label>
                  <select
                    value={interviewField}
                    onChange={(e) => setInterviewField(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0a2a5e] focus:border-[#0a2a5e] bg-white text-gray-700"
                  >
                    <option value="all">All Fields</option>
                    <option value="software-engineering">Software Engineering</option>
                    <option value="data-science">Data Science</option>
                    <option value="product-management">Product Management</option>
                    <option value="ui-ux-design">UI/UX Design</option>
                    <option value="marketing">Marketing</option>
                    <option value="sales">Sales</option>
                    <option value="finance">Finance</option>
                    <option value="human-resources">Human Resources</option>
                  </select>
                </div>

                {/* Position Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Position Level
                  </label>
                  <select
                    value={position}
                    onChange={(e) => setPosition(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-700"
                  >
                    <option value="all">All Levels</option>
                    <option value="intern">Intern</option>
                    <option value="junior">Junior</option>
                    <option value="mid-level">Mid-level</option>
                    <option value="senior">Senior</option>
                    <option value="lead">Lead</option>
                    <option value="manager">Manager</option>
                    <option value="director">Director</option>
                  </select>
                </div>

                {/* Sort By Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sort By
                  </label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-700"
                  >
                    <option value="name">Name (A-Z)</option>
                    <option value="date-asc">Date (Oldest First)</option>
                    <option value="date-desc">Date (Newest First)</option>
                  </select>
                </div>
              </div>

              {/* Job Postings List */}
              <div data-tour="c-job-list" className="flex-1 overflow-y-auto space-y-3">
                {isLoadingJobs ? (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0a2a5e] mx-auto mb-4"></div>
                    <p className="text-gray-500">Loading your applications...</p>
                  </div>
                ) : getFilteredAndSortedJobs().length === 0 ? (
                  <div className="text-center py-12">
                    <Briefcase className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 text-lg font-medium">No job vacancies found</p>
                    <p className="text-gray-400 text-sm mt-2">Try adjusting your filters</p>
                  </div>
                ) : (
                  getFilteredAndSortedJobs().map((job) => (
                    <div
                      key={job.id}
                      className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors border border-gray-200"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <h4 className="font-bold text-gray-800 text-lg">{job.title}</h4>
                          <p className="text-[#0a2a5e] font-medium">{job.position}</p>
                          {job.company && (
                            <p className="text-gray-500 text-sm font-semibold mt-0.5">{job.company}</p>
                          )}
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(job.status)}`}>
                          {job.status}
                        </span>
                      </div>

                      <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-100">
                        <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm text-gray-600 flex-1">
                          <div className="flex items-center gap-1">
                            <MapPin className="w-4 h-4 text-[#0a2a5e]" />
                            <span>{job.location}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Home className="w-4 h-4 text-[#0a2a5e]" />
                            <span>{job.workModel}</span>
                          </div>
                          <div className="flex items-center gap-1 text-green-600 font-medium">
                            <DollarSign className="w-4 h-4" />
                            <span>{job.salaryRange}</span>
                          </div>
                          <div className="flex items-center gap-1 text-indigo-600 font-semibold">
                            <Users className="w-4 h-4" />
                            <span>{job.numberOfVacancies} {job.numberOfVacancies === 1 ? 'Vacancy' : 'Vacancies'}</span>
                          </div>
                        </div>

                        {job.deadline && (
                          <div className={`flex items-center justify-between mt-3 text-xs font-semibold ${isJobExpired(job) ? 'text-red-600' :
                              getDeadlineInfo(job).urgent ? 'text-orange-600' :
                                'text-gray-500'
                            }`}>
                            <div className="flex items-center gap-1">
                              {isJobExpired(job) ? <XCircle className="w-3.5 h-3.5" /> : getDeadlineInfo(job).urgent ? <AlertTriangle className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
                              <span>
                                {isJobExpired(job) ? "Closed" : `Deadline: ${getDeadlineInfo(job).text}`}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="mt-3 flex justify-end items-center">
                        <button
                          onClick={() => {
                            setSelectedJob(job);
                            setShowJobModal(true);
                          }}
                          className="flex items-center gap-0.5 text-[#0a2a5e] hover:text-[#0a2a5e] transition-all group whitespace-nowrap text-[13px] font-semibold"
                        >
                          More
                          <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.4 transition-transform translate-y-[2px]" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* RIGHT SECTION (40% - 2 columns) */}
          <div className="col-span-2 flex flex-col gap-6 overflow-hidden">
            {/* CV Screening Info Card */}
            <div data-tour="c-cv-rec" className="bg-gradient-to-br from-[#0a2a5e]/5 to-[#0d3b82]/5 rounded-2xl shadow-lg p-6 flex-shrink-0 border border-[#0a2a5e]/10">
              <div className="flex items-start gap-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-[#0a2a5e] to-[#2b4c8c] rounded-xl flex items-center justify-center flex-shrink-0">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-800 mb-1">Get CV Recommendations</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    Analyze your resume against job descriptions and get AI-powered recommendations to improve your chances.
                  </p>
                </div>
              </div>

              <button
                onClick={handleCVScreening}
                className="w-full bg-gradient-to-r from-[#0a2a5e] to-[#0d3b82] text-white px-6 py-3 rounded-xl font-semibold hover:from-[#061a3d] hover:to-[#0a2a5e] transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 group"
              >
                <span>Go to Resume Analyzer</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

            {/* Recent Job Activity Card */}
            <div data-tour="c-recent-activity" className="bg-white rounded-2xl shadow-lg p-6 flex-1 overflow-hidden flex flex-col">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Recent Job Activity</h3>
              <div className="flex-1 overflow-y-auto theme-scrollbar space-y-3">
                {isLoadingActivity ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0a2a5e]"></div>
                  </div>
                ) : recentJobActivity.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                      <Briefcase className="w-6 h-6 text-gray-400" />
                    </div>
                    <p className="text-gray-500 text-sm font-medium">No applications yet</p>
                    <p className="text-gray-400 text-xs mt-1">Jobs you apply to will appear here</p>
                  </div>
                ) : (
                  recentJobActivity.map((app, idx) => {
                    // Cross-reference with loaded job postings to get details
                    const job = jobPostings.find(j => j.id === app.jobId);
                    const appliedAt = new Date(app.appliedAt);
                    return (
                      <div
                        key={app.jobId + idx}
                        className="flex gap-3 pb-3 border-b border-gray-100 last:border-0"
                      >
                        <div className="w-9 h-9 rounded-full bg-[#0a2a5e]/10 flex items-center justify-center flex-shrink-0">
                          <Send className="w-4 h-4 text-[#0a2a5e]" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-gray-800 text-sm truncate">
                            {job ? job.company : "Company"}
                          </h4>
                          {job && (
                            <p className="text-gray-500 text-xs font-medium truncate">
                              {job.title} • {job.position}
                            </p>
                          )}
                          <div className="flex items-center gap-1 mt-1 text-xs text-gray-400">
                            <Clock className="w-3 h-3" />
                            <span>{getRelativeTime(appliedAt)}</span>
                          </div>
                        </div>
                        <span className="flex-shrink-0 text-xs font-semibold px-2 py-0.5 rounded-full bg-green-100 text-green-700 self-start mt-0.5">
                          Applied
                        </span>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Job Details Modal */}
      {showJobModal && selectedJob && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-md"
            onClick={() => setShowJobModal(false)}
          ></div>

          <div className="relative bg-white w-full max-w-2xl max-h-[92vh] rounded-3xl overflow-hidden shadow-2xl flex flex-col" style={{animation: 'modalPop 0.25s cubic-bezier(0.34,1.56,0.64,1)'}}>
            {/* ── Header ── */}
            <div className="bg-gradient-to-br from-[#0a2a5e] to-[#0d3b82] px-8 pt-8 pb-7 text-white relative">
              <button
                onClick={() => setShowJobModal(false)}
                className="absolute top-5 right-5 w-9 h-9 flex items-center justify-center rounded-full bg-white/15 hover:bg-white/25 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              <h2 className="text-3xl font-bold leading-tight">{selectedJob.title}</h2>
              <p className="text-blue-200 text-base mt-1">{selectedJob.position} • {selectedJob.location}</p>
              {selectedJob.company && (
                <p className="text-blue-100 text-sm mt-0.5 font-semibold">{selectedJob.company}</p>
              )}
              {selectedJob.deadline && (
                <div className={`mt-4 inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-semibold ${
                  isJobExpired(selectedJob) ? 'bg-red-500/25 text-red-200' :
                  getDeadlineInfo(selectedJob).urgent ? 'bg-orange-500/25 text-orange-200' :
                  'bg-white/15 text-blue-100'
                }`}>
                  <Clock className="w-4 h-4" />
                  {isJobExpired(selectedJob) ? "Deadline Passed" :
                    `Deadline: ${selectedJob.deadline.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}`}
                </div>
              )}
            </div>

            {/* ── Scrollable Body ── */}
            <div className="flex-1 overflow-y-auto theme-scrollbar p-7 space-y-5">
              {/* Info Cards */}
              <div className="grid grid-cols-4 gap-3">
                <div className="bg-gray-50 rounded-2xl px-4 py-3 border border-gray-100">
                  <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold mb-1">Salary</p>
                  <p className="font-semibold text-gray-800 text-sm leading-snug">{selectedJob.salaryRange || "—"}</p>
                </div>
                <div className="bg-gray-50 rounded-2xl px-4 py-3 border border-gray-100">
                  <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold mb-1">Experience</p>
                  <p className="font-semibold text-gray-800 text-sm leading-snug">{selectedJob.experienceRange || "—"}</p>
                </div>
                <div className="bg-gray-50 rounded-2xl px-4 py-3 border border-gray-100">
                  <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold mb-1">Domain</p>
                  <p className="font-semibold text-gray-800 text-sm leading-snug">{selectedJob.industryDomain || "General"}</p>
                </div>
                <div className="bg-[#0a2a5e]/5 rounded-2xl px-4 py-3 border border-[#0a2a5e]/15">
                  <p className="text-[10px] text-[#0a2a5e] uppercase tracking-widest font-bold mb-1">Vacancies</p>
                  <p className="font-bold text-[#0a2a5e] text-xl leading-snug">{selectedJob.numberOfVacancies || 1}</p>
                </div>
              </div>

              {/* Deadline Section */}
              {selectedJob.deadline && (
                <div className={`flex items-center gap-4 px-6 py-5 rounded-2xl border-2 ${
                  isJobExpired(selectedJob) ? 'bg-red-50 border-red-300' :
                  getDeadlineInfo(selectedJob).urgent ? 'bg-orange-50 border-orange-300' :
                  'bg-[#0a2a5e]/5 border-[#0a2a5e]/20'
                } shadow-sm`}>
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
                    isJobExpired(selectedJob) ? 'bg-red-200' :
                    getDeadlineInfo(selectedJob).urgent ? 'bg-orange-200' :
                    'bg-[#0a2a5e]/15'
                  }`}>
                    <Clock className={`w-6 h-6 ${
                      isJobExpired(selectedJob) ? 'text-red-700' :
                      getDeadlineInfo(selectedJob).urgent ? 'text-orange-700' :
                      'text-[#0a2a5e]'
                    }`} />
                  </div>
                  <div className="flex-1">
                    <p className={`font-bold text-lg ${
                      isJobExpired(selectedJob) ? 'text-red-800' :
                      getDeadlineInfo(selectedJob).urgent ? 'text-orange-800' :
                      'text-[#0a2a5e]'
                    }`}>
                      {isJobExpired(selectedJob) ? "Applications Closed" :
                        `Apply before ${selectedJob.deadline.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}`}
                    </p>
                    <p className={`text-sm mt-1 ${
                      isJobExpired(selectedJob) ? 'text-red-600' :
                      getDeadlineInfo(selectedJob).urgent ? 'text-orange-600' :
                      'text-[#0a2a5e]/60'
                    }`}>
                      {selectedJob.deadline.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </p>
                  </div>
                </div>
              )}

              {/* Job Description */}
              <div>
                <h3 className="text-base font-bold text-gray-800 mb-3">Job Description</h3>
                <style dangerouslySetInnerHTML={{__html: `
                    .jd-preview ul { list-style-type: disc !important; padding-left: 1.4rem !important; margin: 0.4rem 0 !important; }
                    .jd-preview li { margin-bottom: 0.25rem !important; }
                    .jd-preview b, .jd-preview strong { font-weight: 700 !important; }
                    .jd-preview u { text-decoration: underline !important; }
                `}} />
                <div
                  className="jd-preview text-gray-600 leading-relaxed text-sm"
                  dangerouslySetInnerHTML={{ __html: formatJobDescription(selectedJob.jobDescription) }}
                />
              </div>
            </div>

            {/* ── Footer ── */}
            <div className="px-7 py-5 bg-white border-t border-gray-100 flex justify-end">
              <button
                disabled={isJobExpired(selectedJob)}
                onClick={() => {
                  setShowJobModal(false);
                  navigate(`/candidate/apply/${selectedJob.id}`);
                }}
                className={`flex items-center gap-2 px-8 py-3 rounded-2xl font-bold transition-all ${
                  isJobExpired(selectedJob)
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-[#0a2a5e] hover:bg-[#0d3b82] text-white shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0'
                }`}
              >
                {isJobExpired(selectedJob) ? 'Job Closed' : <><span>Apply Now</span><Send className="w-4 h-4" /></>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CandidateDashboard;
