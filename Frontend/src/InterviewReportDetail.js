import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    ArrowLeft,
    FileText,
    CheckCircle,
    XCircle,
    Download,
    Clock,
    User,
    Briefcase,
    Award
} from "lucide-react";
import API_BASE_URL from "./apiConfig";

const InterviewReportDetail = () => {
    const { reportId } = useParams();
    const navigate = useNavigate();
    const [report, setReport] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchReport = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/voice-interview/report/${reportId}`);
                if (response.ok) {
                    const data = await response.json();
                    setReport(data);
                }
            } catch (error) {
                console.error("Error fetching report:", error);
            } finally {
                setIsLoading(false);
            }
        };

        if (reportId) {
            fetchReport();
        }
    }, [reportId]);

    if (isLoading) {
        return (
            <div className="h-screen w-screen flex items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0a2a5e]"></div>
            </div>
        );
    }

    if (!report) {
        return (
            <div className="h-screen w-screen flex flex-col items-center justify-center bg-gray-50 text-gray-500">
                <FileText className="w-16 h-16 mb-4 text-gray-300" />
                <p className="text-lg">Report not found</p>
                <button onClick={() => navigate(-1)} className="mt-4 text-[#0a2a5e] hover:underline">
                    Go Back
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-5xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate(-1)}
                            className="p-2 hover:bg-white rounded-full transition-all shadow-sm bg-white"
                        >
                            <ArrowLeft className="w-6 h-6 text-gray-600" />
                        </button>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-800">Interview Report</h1>
                            <p className="text-gray-500">
                                Session ID: {report.session_id}
                            </p>
                        </div>
                    </div>
                    <button className="flex items-center gap-2 bg-[#0a2a5e] text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-[#061a3d] transition-all shadow-lg">
                        <Download className="w-5 h-5" /> Download PDF
                    </button>
                </div>

                {/* Content Grid */}
                <div className="grid grid-cols-3 gap-6">
                    {/* Main Column */}
                    <div className="col-span-2 space-y-6">

                        {/* Candidate Card */}
                        <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 text-2xl font-bold">
                                    {report.candidate_name?.charAt(0) || "C"}
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-gray-800">{report.candidate_name}</h2>
                                    <div className="flex items-center gap-2 text-gray-500 text-sm mt-1">
                                        <User className="w-4 h-4" /> {report.email_address}
                                    </div>
                                    <div className="flex items-center gap-2 text-gray-500 text-sm mt-1">
                                        <Briefcase className="w-4 h-4" /> {report.interview_field} ({report.position_level})
                                    </div>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-sm text-gray-500 mb-1">Overall Score</div>
                                <div className={`text-4xl font-bold ${report.avg_score >= 80 ? 'text-green-600' :
                                        report.avg_score >= 60 ? 'text-yellow-600' : 'text-red-600'
                                    }`}>
                                    {report.avg_score}%
                                </div>
                                <div className={`text-sm font-semibold mt-1 inline-block px-3 py-1 rounded-full ${report.avg_score >= 80 ? 'bg-green-100 text-green-700' :
                                        report.avg_score >= 60 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
                                    }`}>
                                    {report.performance_level}
                                </div>
                            </div>
                        </div>

                        {/* Questions & Answers */}
                        <div className="bg-white rounded-2xl shadow-sm p-8 border border-gray-100">
                            <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                                <FileText className="w-5 h-5 text-[#0a2a5e]" /> Interview Transcript & Analysis
                            </h3>

                            <div className="space-y-8">
                                {report.questions?.map((question, index) => (
                                    <div key={index} className="border-b border-gray-100 last:border-0 pb-8 last:pb-0">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-sm font-bold text-gray-400">Question {index + 1}</span>
                                            <span className={`px-2 py-1 rounded text-xs font-bold ${report.scores[index] >= 8 ? 'bg-green-100 text-green-700' :
                                                    report.scores[index] >= 5 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
                                                }`}>
                                                Score: {report.scores[index]}/10
                                            </span>
                                        </div>
                                        <p className="text-lg font-semibold text-gray-800 mb-3">{question}</p>

                                        <div className="bg-gray-50 rounded-lg p-4 mb-3 border-l-4 border-gray-300">
                                            <p className="text-gray-600 italic">"{report.answers?.[index]}"</p>
                                        </div>

                                        <div className="bg-blue-50 rounded-lg p-4 text-sm text-blue-800">
                                            <strong className="block mb-1">AI Feedback:</strong>
                                            {report.feedback?.[index]}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                    </div>

                    {/* Sidebar Column */}
                    <div className="space-y-6">

                        {/* Strengths */}
                        <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
                            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                                <CheckCircle className="w-5 h-5 text-green-600" /> Key Strengths
                            </h3>
                            <ul className="space-y-3">
                                {report.strengths?.map((strength, i) => (
                                    <li key={i} className="flex gap-2 text-sm text-gray-700">
                                        <div className="min-w-[4px] h-4 bg-green-500 rounded-full mt-1"></div>
                                        {strength}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Improvements */}
                        <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
                            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                                <XCircle className="w-5 h-5 text-red-500" /> Areas for Improvement
                            </h3>
                            <ul className="space-y-3">
                                {report.improvements?.map((improvement, i) => (
                                    <li key={i} className="flex gap-2 text-sm text-gray-700">
                                        <div className="min-w-[4px] h-4 bg-red-500 rounded-full mt-1"></div>
                                        {improvement}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Metadata */}
                        <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
                            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                                <Award className="w-5 h-5 text-purple-600" /> Session Info
                            </h3>
                            <div className="space-y-3 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Date</span>
                                    <span className="font-medium text-gray-800">
                                        {new Date(report.completed_at).toLocaleDateString()}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Duration</span>
                                    <span className="font-medium text-gray-800">~15 mins</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">CV File</span>
                                    <a href="#" className="font-medium text-blue-600 hover:underline truncate max-w-[150px]">
                                        {report.cv_file_name || "View PDF"}
                                    </a>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
};

export default InterviewReportDetail;
