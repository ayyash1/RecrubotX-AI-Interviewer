import React, { useState, useEffect } from "react";
import { useNavigate, NavLink } from "react-router-dom";
import {
    LayoutDashboard,
    LogOut,
    PlusCircle,
    Search,
    Cog,
    ArrowLeft,
    FileText,
    Calendar,
    Users,
    Download,
    ChevronRight,
    Loader2,
    Award,
    Eye,
    Briefcase
} from "lucide-react";
import API_BASE_URL from "./apiConfig";
import RecruiterSidebar from "./components/RecruiterSidebar";

const RecruiterAllScreenings = () => {
    const navigate = useNavigate();
    const [recruiterData, setRecruiterData] = useState(null);
    const [screenings, setScreenings] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedScreening, setSelectedScreening] = useState(null);
    const [applicants, setApplicants] = useState([]);
    const [applicantsLoading, setApplicantsLoading] = useState(false);
    const [downloadingId, setDownloadingId] = useState(null);

    useEffect(() => {
        const storedUser = localStorage.getItem("recruiterUser");
        if (storedUser) {
            const user = JSON.parse(storedUser);
            setRecruiterData(user);
            fetchScreenings(user.id);
        } else {
            navigate("/recruiter/signin");
        }
    }, [navigate]);

    const fetchScreenings = async (recruiterId) => {
        setIsLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/jobs/recruiter/${recruiterId}`);
            if (!response.ok) throw new Error("Failed to fetch screenings");
            const data = await response.json();
            // Only show screening batches (status === "Screening")
            const screeningJobs = data.filter(job => job.status === "Screening");
            // Sort by creation date (most recent first)
            const sorted = screeningJobs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            setScreenings(sorted);
        } catch (error) {
            console.error("Error fetching screenings:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleScreeningClick = async (screening) => {
        if (selectedScreening?.id === screening.id) {
            setSelectedScreening(null);
            setApplicants([]);
            return;
        }
        setSelectedScreening(screening);
        setApplicantsLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/rankings/job/${screening.id}`);
            if (response.ok) {
                const data = await response.json();
                setApplicants(data);
            } else {
                setApplicants([]);
            }
        } catch (error) {
            console.error("Error fetching applicants:", error);
            setApplicants([]);
        } finally {
            setApplicantsLoading(false);
        }
    };

    const handleDownloadReport = async (applicant) => {
        if (!applicant.evaluationDetails && !applicant.id) return;

        setDownloadingId(applicant.id);
        try {
            const reportRes = await fetch(`${API_BASE_URL}/rankings/${applicant.id}/report`);
            if (!reportRes.ok) throw new Error("Report not found");
            const reportData = await reportRes.json();

            if (reportData.evaluationId) {
                const pdfRes = await fetch(`${API_BASE_URL}/rankings/evaluations/${reportData.evaluationId}/download`);
                if (!pdfRes.ok) throw new Error("PDF not available");
                const blob = await pdfRes.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = `${applicant.candidateName || "Candidate"}_Report.pdf`;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                a.remove();
            } else {
                alert("Evaluation report not yet available for this candidate.");
            }
        } catch (error) {
            console.error("Error downloading report:", error);
            alert("Could not download report. The evaluation may not be available yet.");
        } finally {
            setDownloadingId(null);
        }
    };

    const handleViewReport = (applicant) => {
        navigate(`/recruiter/report/${applicant.id}`);
    };

    const handleLogout = () => {
        localStorage.removeItem("recruiterUser");
        navigate("/recruiter/signin");
    };

    const getScoreColor = (scoreStr) => {
        const num = parseInt(scoreStr);
        if (num >= 80) return "text-green-600 bg-green-50 border-green-200";
        if (num >= 60) return "text-yellow-600 bg-yellow-50 border-yellow-200";
        return "text-red-600 bg-red-50 border-red-200";
    };

    const getStatusBadge = (status) => {
        const map = {
            "Pending": "bg-gray-100 text-gray-600",
            "Shortlisted": "bg-green-100 text-green-700",
            "Selected": "bg-green-100 text-green-700",
            "Rejected": "bg-red-100 text-red-700",
            "Interview Scheduled": "bg-blue-100 text-blue-700",
        };
        return map[status] || "bg-gray-100 text-gray-600";
    };

    // Truncate job description for card preview
    const truncateText = (text, maxLen = 120) => {
        if (!text) return "No description available";
        return text.length > maxLen ? text.substring(0, maxLen) + "..." : text;
    };

    if (!recruiterData) {
        return (
            <div className="h-screen flex items-center justify-center bg-gray-100">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0a2a5e] mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="h-screen w-screen flex bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden fixed inset-0">
            {/* Sidebar */}
            <RecruiterSidebar />

            {/* Main Content */}
            <main className="flex-1 h-screen flex flex-col overflow-hidden py-8 px-8">
                {/* Header */}
                <div className="mb-6 flex items-center justify-between flex-shrink-0">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate("/recruiter/cv-screening")}
                            className="p-2 hover:bg-gray-200 rounded-full transition-colors"
                        >
                            <ArrowLeft className="w-6 h-6 text-gray-600" />
                        </button>
                        <div>
                            <h2 className="text-3xl font-bold text-[#0a2a5e]">All Resume Analyzers</h2>
                            <p className="text-gray-500 mt-1">
                                {screenings.length} screening batch{screenings.length !== 1 ? "es" : ""}
                                {selectedScreening && ` • Viewing candidates`}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-hidden flex flex-col">
                    {isLoading ? (
                        <div className="flex-1 flex items-center justify-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0a2a5e]"></div>
                        </div>
                    ) : screenings.length === 0 ? (
                        <div className="flex-1 flex flex-col items-center justify-center text-gray-500">
                            <FileText className="w-16 h-16 mb-4 text-gray-300" />
                            <p className="text-lg font-medium">No screening batches yet</p>
                            <p className="text-sm mt-2">Screen some CVs to see your results here!</p>
                            <button
                                onClick={() => navigate("/recruiter/cv-screening")}
                                className="mt-4 px-6 py-3 bg-[#0a2a5e] text-white rounded-xl hover:bg-[#061a3d] transition-all"
                            >
                                Go to Resume Analyzer
                            </button>
                        </div>
                    ) : (
                        <div className="flex-1 overflow-y-auto pr-1">
                            <div className="space-y-4">
                                {screenings.map((screening) => (
                                    <div key={screening.id}>
                                        {/* Screening Batch Card */}
                                        <div
                                            onClick={() => handleScreeningClick(screening)}
                                            className={`bg-white rounded-2xl shadow-md border transition-all cursor-pointer hover:shadow-lg ${selectedScreening?.id === screening.id
                                                ? "border-[#0a2a5e] ring-2 ring-[#0a2a5e]/20"
                                                : "border-gray-100 hover:border-[#0a2a5e]/30"
                                                }`}
                                        >
                                            <div className="p-6">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-3 mb-2">
                                                            <h3 className="text-xl font-bold text-gray-800">Resume Analyzer Batch</h3>
                                                            <span className="px-3 py-1 bg-purple-50 text-purple-700 text-xs font-semibold rounded-full">Screening</span>
                                                        </div>
                                                        <p className="text-sm text-gray-600 mb-2">
                                                            {truncateText(screening.jobDescription)}
                                                        </p>
                                                        <div className="flex items-center gap-6 text-sm text-gray-500">
                                                            <span className="flex items-center gap-1"><Users className="w-4 h-4" /> {screening.cvFilesCount || 0} Candidate{(screening.cvFilesCount || 0) !== 1 ? "s" : ""}</span>
                                                            <span className="flex items-center gap-1">
                                                                <Calendar className="w-4 h-4" />
                                                                {new Date(screening.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <ChevronRight className={`w-6 h-6 text-gray-400 transition-transform duration-200 ${selectedScreening?.id === screening.id ? "rotate-90" : ""}`} />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Candidates Panel */}
                                        {selectedScreening?.id === screening.id && (
                                            <div className="bg-white rounded-2xl shadow-inner border border-gray-100 mt-2 overflow-hidden">
                                                <div className="bg-gradient-to-r from-[#0a2a5e] to-[#0d3b82] px-6 py-4">
                                                    <h4 className="text-white font-bold text-lg flex items-center gap-2">
                                                        <Users className="w-5 h-5" />
                                                        Screened Candidates
                                                    </h4>
                                                </div>

                                                {applicantsLoading ? (
                                                    <div className="flex items-center justify-center py-12">
                                                        <Loader2 className="w-8 h-8 text-[#0a2a5e] animate-spin" />
                                                    </div>
                                                ) : applicants.length === 0 ? (
                                                    <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                                                        <Users className="w-12 h-12 mb-3 text-gray-300" />
                                                        <p className="font-medium">No candidates found</p>
                                                        <p className="text-sm mt-1">Screening results may still be processing.</p>
                                                    </div>
                                                ) : (
                                                    <div className="divide-y divide-gray-100">
                                                        {/* Table Header */}
                                                        <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-gray-50 text-xs font-bold text-gray-500 uppercase tracking-wider">
                                                            <div className="col-span-1">Rank</div>
                                                            <div className="col-span-3">Candidate</div>
                                                            <div className="col-span-2">Score</div>
                                                            <div className="col-span-2">Status</div>
                                                            <div className="col-span-1">Date</div>
                                                            <div className="col-span-3 text-right">Actions</div>
                                                        </div>

                                                        {/* Table Rows */}
                                                        {applicants.map((applicant) => (
                                                            <div key={applicant.id} className="grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-gray-50/50 transition-colors">
                                                                {/* Rank */}
                                                                <div className="col-span-1">
                                                                    <div className="w-10 h-10 bg-gradient-to-br from-[#0a2a5e] to-[#2b4c8c] rounded-full flex items-center justify-center text-white font-bold text-sm shadow-md">
                                                                        #{applicant.rank}
                                                                    </div>
                                                                </div>

                                                                {/* Candidate Name */}
                                                                <div className="col-span-3">
                                                                    <p className="font-semibold text-gray-800">{applicant.candidateName}</p>
                                                                </div>

                                                                {/* Score */}
                                                                <div className="col-span-2">
                                                                    <span className={`inline-block px-3 py-1 rounded-lg text-sm font-bold border ${getScoreColor(applicant.score)}`}>
                                                                        <Award className="w-3.5 h-3.5 inline mr-1" />
                                                                        {applicant.score}
                                                                    </span>
                                                                </div>

                                                                {/* Status */}
                                                                <div className="col-span-2">
                                                                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadge(applicant.interviewStatus)}`}>
                                                                        {applicant.interviewStatus}
                                                                    </span>
                                                                </div>

                                                                {/* Date */}
                                                                <div className="col-span-1 text-sm text-gray-500">
                                                                    {applicant.date}
                                                                </div>

                                                                {/* Actions */}
                                                                <div className="col-span-3 flex justify-end gap-2">
                                                                    <button
                                                                        onClick={(e) => { e.stopPropagation(); handleViewReport(applicant); }}
                                                                        className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-[#0a2a5e] bg-[#0a2a5e]/5 hover:bg-[#0a2a5e]/10 rounded-lg transition-all border border-[#0a2a5e]/20"
                                                                    >
                                                                        <Eye className="w-4 h-4" />
                                                                        View
                                                                    </button>
                                                                    <button
                                                                        onClick={(e) => { e.stopPropagation(); handleDownloadReport(applicant); }}
                                                                        disabled={downloadingId === applicant.id}
                                                                        className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-white bg-gradient-to-r from-[#0a2a5e] to-[#0d3b82] hover:from-[#061a3d] hover:to-[#0a2a5e] rounded-lg transition-all shadow-sm disabled:opacity-50"
                                                                    >
                                                                        {downloadingId === applicant.id ? (
                                                                            <Loader2 className="w-4 h-4 animate-spin" />
                                                                        ) : (
                                                                            <Download className="w-4 h-4" />
                                                                        )}
                                                                        PDF
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default RecruiterAllScreenings;
