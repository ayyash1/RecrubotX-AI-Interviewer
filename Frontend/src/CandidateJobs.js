import React, { useState, useEffect } from "react";
import { Search, Briefcase, MapPin, DollarSign, Calendar, ChevronRight, Send, Filter, X, Clock, CheckCircle2, XCircle, AlertTriangle, Users } from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import { getCurrentUser, logoutUser } from "./utils/userDatabase";
import API_BASE_URL from "./apiConfig";
import CandidateSidebar from "./components/CandidateSidebar";

// Converts plain-text job descriptions into structured HTML with section headers and bullet points
const formatJobDescription = (text) => {
    if (!text || !text.trim()) {
        return '<p class="text-gray-400 italic">No description provided.</p>';
    }
    const lines = text.split('\n');
    let html = '';
    let inList = false;
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) {
            if (inList) { html += '</ul>'; inList = false; }
            continue;
        }
        // Section header: line ending with colon, not starting with a bullet
        const isHeader = /^.{2,80}:$/.test(line) && !/^[-*•●▪\d]/.test(line);
        // Bullet: starts with -, *, •, ●, ▪ or a number followed by . or )
        const isBullet = /^[-*•●▪]\s+.+/.test(line) || /^\d+[.)]\s+.+/.test(line);
        if (isHeader) {
            if (inList) { html += '</ul>'; inList = false; }
            html += `<p class="font-bold text-gray-800 mt-4 mb-1.5 text-sm border-b border-gray-200 pb-1">${line.replace(/:$/, '')}</p>`;
        } else if (isBullet) {
            if (!inList) { html += '<ul class="space-y-1.5 pl-0 mb-2 mt-1">'; inList = true; }
            const content = line.replace(/^[-*•●▪]\s+/, '').replace(/^\d+[.)]\s+/, '');
            html += `<li class="flex items-start gap-2 text-gray-600 text-sm"><span class="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#0a2a5e] flex-shrink-0"></span><span>${content}</span></li>`;
        } else {
            if (inList) { html += '</ul>'; inList = false; }
            html += `<p class="text-gray-600 text-sm leading-relaxed mb-1.5">${line}</p>`;
        }
    }
    if (inList) html += '</ul>';
    return html || '<p class="text-gray-400 italic">No description provided.</p>';
};

const CandidateJobs = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);

    // Filter states
    const [interviewField, setInterviewField] = useState("all");
    const [position, setPosition] = useState("all");
    const [sortBy, setSortBy] = useState("date-desc");
    const [searchTerm, setSearchTerm] = useState("");

    // Job postings
    const [jobPostings, setJobPostings] = useState([]);
    const [isLoadingJobs, setIsLoadingJobs] = useState(true);
    const [selectedJob, setSelectedJob] = useState(null);
    const [showJobModal, setShowJobModal] = useState(false);
    const [appliedJobIds, setAppliedJobIds] = useState([]);

    useEffect(() => {
        const currentUser = getCurrentUser();
        if (!currentUser) {
            navigate("/candidate/signin");
        } else {
            setUser(currentUser);
            fetchJobPostings();
            fetchAppliedJobs(currentUser.id);
        }
    }, [navigate]);

    const fetchJobPostings = async () => {
        try {
            setIsLoadingJobs(true);
            const response = await fetch(`${API_BASE_URL}/jobs/all`);
            if (response.ok) {
                const data = await response.json();
                // Filter out CV Screening postings — only show real job postings
                const jobsOnly = data.filter(job => job.status !== "Screening");
                const transformed = jobsOnly.map(job => ({
                    id: job._id || job.id,
                    company: job.companyName || job.interviewField + " Company",
                    title: job.interviewField,
                    position: job.positionLevel,
                    interviewField: job.interviewField,
                    workModel: job.workModel,
                    status: job.status,
                    location: job.location,
                    salaryRange: job.salaryRange,
                    experienceRange: job.experienceRange,
                    industryDomain: job.industryDomain,
                    jobDescription: job.jobDescription,
                    numberOfVacancies: job.numberOfVacancies || 1,
                    deadline: job.deadline ? new Date(job.deadline) : null,
                    appliedDate: new Date(job.createdAt),
                    isActive: job.isActive
                }));
                setJobPostings(transformed);
            }
        } catch (error) {
            console.error("Error fetching jobs:", error);
        } finally {
            setIsLoadingJobs(false);
        }
    };

    const fetchAppliedJobs = async (candidateId) => {
        try {
            const response = await fetch(`${API_BASE_URL}/jobs/candidate/${candidateId}/applied-jobs`);
            if (response.ok) {
                const data = await response.json();
                setAppliedJobIds(data.appliedJobIds || []);
            }
        } catch (error) {
            console.error("Error fetching applied jobs:", error);
        }
    };

    const getFilteredJobs = () => {
        let filtered = [...jobPostings];

        // Remove closed/expired jobs unless the candidate has already applied
        filtered = filtered.filter(job => {
            const expired = isJobExpired(job) || !job.isActive;
            return !expired || isApplied(job.id);
        });

        // Text Search
        if (searchTerm) {
            const lowerTerm = searchTerm.toLowerCase();
            filtered = filtered.filter(job =>
                job.title.toLowerCase().includes(lowerTerm) ||
                job.location.toLowerCase().includes(lowerTerm) ||
                job.company.toLowerCase().includes(lowerTerm)
            );
        }

        // Field Filter
        if (interviewField !== "all") {
            filtered = filtered.filter(job => {
                const slug = job.interviewField?.toLowerCase().replace(/\s+/g, '-');
                return slug === interviewField;
            });
        }

        // Position Filter
        if (position !== "all") {
            filtered = filtered.filter(job => {
                const slug = job.position?.toLowerCase().replace(/\s+/g, '-');
                return slug === position;
            });
        }

        // Sort
        filtered.sort((a, b) => {
            if (sortBy === "name") return a.title.localeCompare(b.title);
            if (sortBy === "date-asc") return a.appliedDate - b.appliedDate;
            if (sortBy === "deadline") {
                if (!a.deadline) return 1;
                if (!b.deadline) return -1;
                return a.deadline - b.deadline;
            }
            return b.appliedDate - a.appliedDate;
        });

        return filtered;
    };

    const getStatusColor = (status) => {
        switch (status) {
            case "Full-time": return "bg-blue-100 text-blue-700";
            case "Part-time": return "bg-green-100 text-green-700";
            case "Contract": return "bg-yellow-100 text-yellow-700";
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
        return { text: job.deadline.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }), color: "text-gray-600", urgent: false };
    };

    const isApplied = (jobId) => appliedJobIds.includes(jobId);

    if (!user) return null;

    return (
        <div className="h-screen w-screen flex bg-gray-50 overflow-hidden fixed inset-0">
            {/* Sidebar */}
            <CandidateSidebar />

            {/* Main Content */}
            <main className="flex-1 h-screen flex flex-col overflow-hidden py-8 px-8">
                {/* Header */}
                <div className="mb-6 flex-shrink-0 flex justify-between items-center">
                    <div>
                        <h2 className="text-3xl font-bold text-[#0a2a5e]">Job Vacancies</h2>
                        <p className="text-gray-500 text-md mt-1 py-2">Explore and apply to open positions</p>
                    </div>
                </div>

                {/* Filters & Content */}
                <div className="flex-1 overflow-hidden p-8 flex flex-col gap-6">

                    {/* Filter Bar */}
                    <div className="flex flex-wrap gap-4 items-center">
                        <div className="flex-1 min-w-[250px] relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Search jobs..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-800 rounded-xl focus:ring-2 focus:ring-[#0a2a5e] focus:border-transparent outline-none"
                            />
                        </div>

                        <div className="flex gap-4">
                            <select
                                value={interviewField}
                                onChange={(e) => setInterviewField(e.target.value)}
                                className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-gray-700 focus:ring-2 focus:ring-[#0a2a5e] outline-none cursor-pointer"
                            >
                                <option value="all">All Fields</option>
                                <option value="software-engineering">Software Engineering</option>
                                <option value="data-science">Data Science</option>
                                <option value="product-management">Product Management</option>
                            </select>

                            <select
                                value={position}
                                onChange={(e) => setPosition(e.target.value)}
                                className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-gray-700 focus:ring-2 focus:ring-[#0a2a5e] outline-none cursor-pointer"
                            >
                                <option value="all">All Levels</option>
                                <option value="intern">Intern</option>
                                <option value="junior">Junior</option>
                                <option value="mid-level">Mid-level</option>
                                <option value="senior">Senior</option>
                            </select>

                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-gray-700 focus:ring-2 focus:ring-[#0a2a5e] outline-none cursor-pointer"
                            >
                                <option value="date-desc">Newest First</option>
                                <option value="date-asc">Oldest First</option>
                                <option value="deadline">Deadline (Soonest)</option>
                                <option value="name">Name (A-Z)</option>
                            </select>
                        </div>
                    </div>

                    {/* Job Grid */}
                    <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                        {isLoadingJobs ? (
                            <div className="flex items-center justify-center h-64">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0a2a5e]"></div>
                            </div>
                        ) : getFilteredJobs().length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                                <Briefcase className="w-16 h-16 mb-4 opacity-20" />
                                <p>No jobs found matching your criteria</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                {getFilteredJobs().map(job => {
                                    const expired = isJobExpired(job) || !job.isActive;
                                    const applied = isApplied(job.id);
                                    const deadlineInfo = getDeadlineInfo(job);

                                    return (
                                        <div key={job.id} className={`bg-white rounded-2xl shadow-sm border p-6 transition-shadow group flex flex-col relative ${expired ? 'border-gray-200 opacity-75' : 'border-gray-100 hover:shadow-md'}`}>
                                            {/* Applied Badge */}
                                            {applied && (
                                                <div className="absolute top-4 right-4 flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold">
                                                    <CheckCircle2 className="w-3.5 h-3.5" /> Applied
                                                </div>
                                            )}

                                            {/* Closed Badge */}
                                            {expired && !applied && (
                                                <div className="absolute top-4 right-4 flex items-center gap-1 px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-bold">
                                                    <XCircle className="w-3.5 h-3.5" /> Closed
                                                </div>
                                            )}

                                            <div className="flex justify-between items-start mb-3">
                                                <div className="flex-1">
                                                    <h3 className="font-bold text-xl text-gray-800 group-hover:text-[#0a2a5e] transition-colors">{job.title}</h3>
                                                    <p className="text-gray-500 font-medium">{job.position}</p>
                                                    {job.company && (
                                                        <p className="text-[#0a2a5e] text-sm font-semibold mt-0.5">{job.company}</p>
                                                    )}
                                                </div>
                                                {!applied && !expired && (
                                                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(job.status)}`}>
                                                        {job.status}
                                                    </span>
                                                )}
                                            </div>

                                            <div className="space-y-2 mb-4 flex-1">
                                                <div className="flex items-center gap-2 text-gray-500 text-sm">
                                                    <MapPin className="w-4 h-4" /> {job.location}
                                                </div>
                                                <div className="flex items-center gap-2 text-gray-500 text-sm">
                                                    <Briefcase className="w-4 h-4" /> {job.workModel}
                                                </div>
                                                <div className="flex items-center gap-2 text-green-600 font-medium text-sm">
                                                    <DollarSign className="w-4 h-4" /> {job.salaryRange}
                                                </div>
                                                <div className="flex items-center gap-2 text-calendar-500 text-sm">
                                                    <Calendar className="w-4 h-4" /> Posted {job.appliedDate.toLocaleDateString()}
                                                </div>
                                                <div className="flex items-center gap-2 text-indigo-600 text-sm font-semibold">
                                                    <Users className="w-4 h-4" /> {job.numberOfVacancies} {job.numberOfVacancies === 1 ? 'Vacancy' : 'Vacancies'}
                                                </div>
                                            </div>

                                            {/* Deadline Banner */}
                                            <div className={`flex items-center gap-2 px-3 py-2 rounded-xl mb-4 text-sm font-semibold ${expired ? 'bg-red-50 text-red-600' :
                                                deadlineInfo.urgent ? 'bg-orange-50 text-orange-700 animate-pulse' :
                                                    'bg-gray-50 text-gray-600'
                                                }`}>
                                                {expired ? <XCircle className="w-4 h-4" /> : deadlineInfo.urgent ? <AlertTriangle className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                                                <span>{expired ? "Deadline passed" : `Deadline: ${deadlineInfo.text}`}</span>
                                            </div>

                                            <button
                                                onClick={() => {
                                                    setSelectedJob(job);
                                                    setShowJobModal(true);
                                                }}
                                                className={`w-full py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 ${expired ? 'bg-gray-100 text-gray-400 cursor-not-allowed' :
                                                    applied ? 'bg-green-50 text-green-700 cursor-default' :
                                                        'bg-gray-50 text-[#0a2a5e] hover:bg-[#0a2a5e] hover:text-white'
                                                    }`}
                                                disabled={expired}
                                            >
                                                {applied ? <><CheckCircle2 className="w-4 h-4" /> Already Applied</> :
                                                    expired ? <><XCircle className="w-4 h-4" /> Closed</> :
                                                        <>View Details <ChevronRight className="w-4 h-4" /></>}
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </main>

            {/* Job Info Modal */}
            {showJobModal && selectedJob && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={() => setShowJobModal(false)}></div>
                    <div className="relative bg-white w-full max-w-2xl max-h-[92vh] rounded-3xl overflow-hidden shadow-2xl flex flex-col" style={{ animation: 'modalPop 0.25s cubic-bezier(0.34,1.56,0.64,1)' }}>
                        {/* ── Header ── */}
                        <div className="bg-gradient-to-br from-[#0a2a5e] to-[#0d3b82] px-8 pt-8 pb-7 text-white relative">
                            <button onClick={() => setShowJobModal(false)} className="absolute top-5 right-5 w-9 h-9 flex items-center justify-center rounded-full bg-white/15 hover:bg-white/25 transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                            <h2 className="text-3xl font-bold leading-tight">{selectedJob.title}</h2>
                            <p className="text-blue-200 text-base mt-1">{selectedJob.position} • {selectedJob.location}</p>
                            {selectedJob.company && (
                                <p className="text-blue-100 text-sm mt-0.5 font-semibold">{selectedJob.company}</p>
                            )}
                            {selectedJob.deadline && (
                                <div className={`mt-4 inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-semibold ${isJobExpired(selectedJob) ? 'bg-red-500/25 text-red-200' :
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
                            {isApplied(selectedJob.id) ? (
                                <div className="flex items-center gap-2 px-6 py-3 bg-green-100 text-green-700 rounded-2xl font-bold text-sm">
                                    <CheckCircle2 className="w-4 h-4" /> Already Applied
                                </div>
                            ) : isJobExpired(selectedJob) || !selectedJob.isActive ? (
                                <div className="flex items-center gap-2 px-6 py-3 bg-red-100 text-red-700 rounded-2xl font-bold text-sm">
                                    <XCircle className="w-4 h-4" /> Job Closed
                                </div>
                            ) : (
                                <button
                                    onClick={() => { setShowJobModal(false); navigate(`/candidate/apply/${selectedJob.id}`); }}
                                    className="flex items-center gap-2 bg-[#0a2a5e] hover:bg-[#0d3b82] text-white px-8 py-3 rounded-2xl font-bold transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0"
                                >
                                    Apply Now <Send className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CandidateJobs;
