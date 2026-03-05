import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
    ArrowLeft,
    Briefcase,
    MapPin,
    Calendar,
    Users,
    Eye,
    Clock,
    AlertTriangle,
    XCircle
} from "lucide-react";
import API_BASE_URL from "./apiConfig";
import RecruiterSidebar from "./components/RecruiterSidebar";

const RecruiterAllJobs = () => {
    const navigate = useNavigate();
    const [recruiterData, setRecruiterData] = useState(null);
    const [jobPostings, setJobPostings] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

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
        setIsLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/jobs/recruiter/${recruiterId}`);
            if (!response.ok) throw new Error("Failed to fetch job postings");
            const data = await response.json();
            const realJobs = data.filter(job => job.status !== "Screening");
            const sorted = realJobs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            setJobPostings(sorted);
        } catch (error) {
            console.error("Error fetching jobs:", error);
        } finally {
            setIsLoading(false);
        }
    };

    if (!recruiterData) {
        return (
            <div className="h-screen flex items-center justify-center bg-gray-100">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0a2a5e] mx-auto"></div>
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
                            onClick={() => navigate("/recruiter/job-posting")}
                            className="p-2 hover:bg-gray-200 rounded-full transition-colors"
                        >
                            <ArrowLeft className="w-6 h-6 text-gray-600" />
                        </button>
                        <div>
                            <h2 className="text-3xl font-bold text-[#0a2a5e]">All Job Postings</h2>
                            <p className="text-gray-500 mt-1">
                                {jobPostings.length} job{jobPostings.length !== 1 ? "s" : ""} posted
                            </p>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-hidden flex flex-col">
                    {isLoading ? (
                        <div className="flex-1 flex items-center justify-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0a2a5e]"></div>
                        </div>
                    ) : jobPostings.length === 0 ? (
                        <div className="flex-1 flex flex-col items-center justify-center text-gray-500">
                            <Briefcase className="w-16 h-16 mb-4 text-gray-300" />
                            <p className="text-lg font-medium">No job postings yet</p>
                            <p className="text-sm mt-2">Create your first job posting to get started!</p>
                            <button
                                onClick={() => navigate("/recruiter/job-posting")}
                                className="mt-4 px-6 py-3 bg-[#0a2a5e] text-white rounded-xl hover:bg-[#061a3d] transition-all"
                            >
                                Create Job Posting
                            </button>
                        </div>
                    ) : (
                        <div className="flex-1 overflow-y-auto pr-1">
                            <div className="space-y-4">
                                {jobPostings.map((job) => (
                                    <div
                                        key={job.id}
                                        className="bg-white rounded-2xl shadow-md border border-gray-100 hover:shadow-lg hover:border-[#0a2a5e]/30 transition-all"
                                    >
                                        <div className="p-6">
                                            <div className="flex items-center justify-between">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-3 mb-2">
                                                        <h3 className="text-xl font-bold text-gray-800">{job.interviewField}</h3>
                                                        <span className="px-3 py-1 bg-[#0a2a5e]/10 text-[#0a2a5e] text-xs font-semibold rounded-full">{job.positionLevel}</span>
                                                        <span className={`px-3 py-1 text-xs font-semibold rounded-full ${job.status === "Full-time" ? "bg-green-50 text-green-700" : job.status === "Part-time" ? "bg-yellow-50 text-yellow-700" : "bg-blue-50 text-blue-700"}`}>{job.status}</span>
                                                    </div>
                                                    <div className="flex items-center gap-6 text-sm text-gray-500">
                                                        <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {job.location}</span>
                                                        <span className="flex items-center gap-1"><Briefcase className="w-4 h-4" /> {job.workModel}</span>
                                                        <span className="flex items-center gap-1"><Users className="w-4 h-4" /> {job.cvFilesCount || 0} Candidate{(job.cvFilesCount || 0) !== 1 ? "s" : ""}</span>
                                                        <span className="flex items-center gap-1">
                                                            <Calendar className="w-4 h-4" />
                                                            {new Date(job.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                                                        </span>
                                                    </div>
                                                </div>
                                                {/* View Button */}
                                                <button
                                                    onClick={() => navigate(`/recruiter/reports/${job.id}`)}
                                                    className="flex items-center gap-2 px-5 py-2.5 bg-[#0a2a5e] text-white text-sm font-semibold rounded-xl hover:bg-[#061a3d] transition-all shadow-sm ml-4 flex-shrink-0"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                    View
                                                </button>
                                            </div>
                                        </div>

                                        {/* Deadline & Status Badges */}
                                        <div className="flex items-center gap-3 mt-3 pt-3 px-6 pb-4 border-t border-gray-100">
                                            {job.isActive ? (
                                                <span className="px-3 py-1 bg-green-50 text-green-700 text-xs font-bold rounded-full">Active</span>
                                            ) : (
                                                <span className="px-3 py-1 bg-red-50 text-red-700 text-xs font-bold rounded-full flex items-center gap-1">
                                                    <XCircle className="w-3.5 h-3.5" /> Closed
                                                </span>
                                            )}
                                            {job.deadline ? (() => {
                                                const dl = new Date(job.deadline);
                                                const now = new Date();
                                                const diff = dl - now;
                                                const daysLeft = Math.ceil(diff / (1000 * 60 * 60 * 24));
                                                const expired = daysLeft < 0;
                                                const urgent = daysLeft >= 0 && daysLeft <= 3;
                                                return (
                                                    <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${expired ? 'bg-red-100 text-red-700' : urgent ? 'bg-orange-100 text-orange-700 animate-pulse' : 'bg-blue-50 text-blue-700'}`}>
                                                        {expired ? <XCircle className="w-3.5 h-3.5" /> : urgent ? <AlertTriangle className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
                                                        {expired ? 'Deadline Passed' : daysLeft === 0 ? 'Closes Today!' : daysLeft <= 7 ? `${daysLeft} day${daysLeft > 1 ? 's' : ''} left` : `Deadline: ${dl.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`}
                                                    </div>
                                                );
                                            })() : (
                                                <span className="text-xs text-gray-400">No deadline</span>
                                            )}
                                        </div>
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

export default RecruiterAllJobs;
