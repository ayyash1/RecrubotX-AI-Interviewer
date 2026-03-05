import React, { useState, useEffect, useRef } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
    LayoutDashboard,
    LogOut,
    PlusCircle,
    Upload,
    FileText,
    Settings,
    Search,
    CheckCircle,
    XCircle,
    Loader2,
    Users,
    Trash2,
    Eye
} from "lucide-react";
import API_BASE_URL from "./apiConfig";
import RecruiterSidebar from "./components/RecruiterSidebar";

const CRITERIA = [
    { key: "professional_experience", label: "Professional Experience" },
    { key: "projects_achievements", label: "Projects & Achievements" },
    { key: "educational_qualifications", label: "Educational Qualifications" },
    { key: "certifications_licenses", label: "Certifications & Licenses" },
    { key: "publications", label: "Publications" },
    { key: "technical_skills", label: "Technical Skills" },
    { key: "other_details", label: "Other Details" },
];

const DEFAULT_WEIGHTAGES = () => {
    const base = Math.floor(100 / CRITERIA.length);
    const remainder = 100 - base * CRITERIA.length;
    const w = {};
    CRITERIA.forEach((c, i) => {
        w[c.key] = i === 0 ? base + remainder : base;
    });
    return w;
};

const RecruiterCVScreening = () => {
    const navigate = useNavigate();
    const fileInputRef = useRef(null);
    const [recruiterData, setRecruiterData] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isScreening, setIsScreening] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");
    const [errorMessage, setErrorMessage] = useState("");

    // Form state
    const [cvFiles, setCvFiles] = useState([]);
    const [cvFileNames, setCvFileNames] = useState([]);
    const [jobDescription, setJobDescription] = useState("");
    const [weightages, setWeightages] = useState(DEFAULT_WEIGHTAGES());

    // Results state
    const [rankingResults, setRankingResults] = useState([]);
    const [showRankingTable, setShowRankingTable] = useState(false);

    useEffect(() => {
        const storedUser = localStorage.getItem("recruiterUser");
        if (storedUser) {
            setRecruiterData(JSON.parse(storedUser));
        } else {
            navigate("/recruiter/signin");
        }
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem("recruiterUser");
        navigate("/recruiter/signin");
    };

    const handleFileUpload = (e) => {
        const files = Array.from(e.target.files);
        if (files.length > 0) {
            const filePromises = files.map(file => {
                return new Promise((resolve) => {
                    const reader = new FileReader();
                    reader.onloadend = () => {
                        resolve({
                            name: file.name,
                            base64: reader.result
                        });
                    };
                    reader.readAsDataURL(file);
                });
            });

            Promise.all(filePromises).then(fileData => {
                setCvFiles(prev => [...prev, ...fileData.map(f => f.base64)]);
                setCvFileNames(prev => [...prev, ...fileData.map(f => f.name)]);
            });
        }
    };

    const removeFile = (index) => {
        setCvFiles(prev => prev.filter((_, i) => i !== index));
        setCvFileNames(prev => prev.filter((_, i) => i !== index));
    };

    // Weightage handling
    const weightageTotal = Object.values(weightages).reduce((sum, v) => sum + (parseFloat(v) || 0), 0);

    const handleWeightageChange = (key, value) => {
        const numVal = value === "" ? 0 : Math.max(0, Math.min(100, parseInt(value) || 0));
        setWeightages(prev => ({ ...prev, [key]: numVal }));
    };

    const handleScreenCVs = async () => {
        if (cvFiles.length === 0) {
            setErrorMessage("Please upload at least one CV to screen.");
            return;
        }
        if (!jobDescription.trim()) {
            setErrorMessage("Please provide a job description.");
            return;
        }
        if (Math.abs(weightageTotal - 100) > 1) {
            setErrorMessage(`Weightages must total 100%. Current total: ${weightageTotal}%`);
            return;
        }

        setIsScreening(true);
        setErrorMessage("");
        setSuccessMessage("");
        setShowRankingTable(false);
        setRankingResults([]);

        // 5-minute timeout for screening multiple CVs
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5 * 60 * 1000);

        try {
            const response = await fetch(`${API_BASE_URL}/screen-cvs-batch`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                signal: controller.signal,
                body: JSON.stringify({
                    recruiterId: recruiterData.id,
                    cvFiles: cvFiles,
                    jobDescription: jobDescription,
                    weightages: weightages,
                }),
            });

            clearTimeout(timeoutId);

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.detail || "Failed to screen CVs");
            }

            // Show inline ranking table
            const results = data.results || [];
            setRankingResults(results);
            setShowRankingTable(true);
            if (results.length > 0) {
                setSuccessMessage(`Successfully screened ${data.total_screened} CV(s). Results are shown below.`);
            } else {
                setErrorMessage("Screening completed but no results were returned. Please try again.");
            }

        } catch (error) {
            clearTimeout(timeoutId);
            console.error("Error screening CVs:", error);
            if (error.name === 'AbortError') {
                setErrorMessage("Screening timed out. Try uploading fewer CVs at a time.");
            } else {
                setErrorMessage(error.message || "Failed to screen CVs. Please try again.");
            }
        } finally {
            setIsScreening(false);
        }
    };

    const resetForm = () => {
        setCvFiles([]);
        setCvFileNames([]);
        setJobDescription("");
        setWeightages(DEFAULT_WEIGHTAGES());
        setRankingResults([]);
        setShowRankingTable(false);
        setSuccessMessage("");
        setErrorMessage("");
    };

    if (!recruiterData) {
        return (
            <div className="h-screen flex items-center justify-center bg-gray-100">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
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
            <main className="flex-1 h-screen overflow-y-auto py-6 px-10">

                {/* Header */}
                <div className="mb-4 flex-shrink-0 flex justify-between items-center">
                    <div>
                        <h2 className="text-3xl font-bold text-gray-800">Resume Analyzer</h2>
                        <p className="text-gray-500 text-md mt-1 py-4">AI-powered resume analysis and candidate shortlisting.</p>
                    </div>
                    {/* All Resume Analyses + User Profile - Top Right */}
                    <div className="flex items-center gap-4">
                        <NavLink to="/recruiter/all-screenings" className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 flex items-center gap-2 shadow-sm">
                            <Eye className="w-4 h-4" /> All Resume Analyses
                        </NavLink>
                    </div>
                </div>

                {/* Messages */}
                {successMessage && (
                    <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4 flex-shrink-0 flex items-center gap-2">
                        <CheckCircle className="w-5 h-5" />
                        {successMessage}
                    </div>
                )}

                {errorMessage && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 flex-shrink-0 flex items-center gap-2">
                        <XCircle className="w-5 h-5" />
                        {errorMessage}
                    </div>
                )}

                {/* Content */}
                <div className="flex-1">
                    <div className="bg-white rounded-2xl shadow-lg p-6 w-full">
                        <div className="space-y-6">

                            {/* Scoring Weightage Section */}
                            <div>
                                <div className="flex items-center justify-between mb-3">
                                    <label className="block font-semibold text-gray-700 text-lg">
                                        Scoring Weightage <span className="text-red-500">*</span>
                                    </label>
                                    <span className={`text-sm font-bold px-3 py-1 rounded-full ${Math.abs(weightageTotal - 100) <= 1
                                        ? "bg-green-100 text-green-700"
                                        : "bg-red-100 text-red-700"
                                        }`}>
                                        Total: {weightageTotal}%
                                    </span>
                                </div>
                                <p className="text-sm text-gray-500 mb-3">Assign percentage weights to each evaluation criterion. Total must equal 100%.</p>
                                <div className="grid grid-cols-4 gap-3">
                                    {CRITERIA.map((criterion) => (
                                        <div key={criterion.key} className="bg-gray-50 rounded-xl p-3 border border-gray-200 hover:border-[#0a2a5e]/30 transition-all">
                                            <label className="block text-sm font-medium text-gray-700 mb-2 truncate" title={criterion.label}>
                                                {criterion.label}
                                            </label>
                                            <div className="flex items-center gap-1">
                                                <input
                                                    type="number"
                                                    min="0"
                                                    max="100"
                                                    value={weightages[criterion.key]}
                                                    onChange={(e) => handleWeightageChange(criterion.key, e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0a2a5e] focus:border-transparent outline-none transition-all text-center font-semibold text-lg"
                                                />
                                                <span className="text-gray-500 font-medium text-sm">%</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Row: JD (Left) and Upload (Right) Side by Side */}
                            <div className="grid grid-cols-2 gap-6 min-h-[300px]">
                                {/* Left Col: Job Description */}
                                <div className="flex flex-col h-full">
                                    <label className="block font-medium text-gray-700 mb-2">
                                        <FileText className="w-4 h-4 inline mr-2" />
                                        Job Description <span className="text-red-500">*</span>
                                    </label>
                                    <textarea
                                        value={jobDescription}
                                        onChange={(e) => setJobDescription(e.target.value)}
                                        placeholder="Enter the job description, requirements, and qualifications..."
                                        className="w-full flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-none"
                                    />
                                </div>

                                {/* Right Col: Upload */}
                                <div className="flex flex-col h-full">
                                    <label className="block font-medium text-gray-700 mb-2">
                                        <Upload className="w-4 h-4 inline mr-2" />
                                        Upload CVs <span className="text-red-500">*</span>
                                    </label>
                                    <div className="flex-1 border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-[#0a2a5e] transition-all cursor-pointer bg-gray-50 flex flex-col items-center justify-center">
                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            accept=".pdf,.doc,.docx"
                                            onChange={handleFileUpload}
                                            multiple
                                            className="hidden"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => fileInputRef.current?.click()}
                                            className="text-[#0a2a5e] hover:text-[#061a3d] w-full"
                                        >
                                            <Upload className="w-12 h-12 mx-auto mb-3 text-[#0a2a5e]" />
                                            <p className="text-lg font-medium">Click to upload CVs</p>
                                            <p className="text-sm text-gray-500 mt-1">PDF, DOC, DOCX</p>
                                        </button>
                                    </div>

                                    {/* Uploaded Files List */}
                                    {cvFileNames.length > 0 && (
                                        <div className="mt-4 h-32 overflow-y-auto space-y-2 border border-gray-200 rounded-xl p-2 bg-gray-50">
                                            {cvFileNames.map((name, index) => (
                                                <div key={index} className="flex items-center justify-between bg-white px-3 py-2 rounded-lg border border-gray-100 shadow-sm">
                                                    <div className="flex items-center gap-2 overflow-hidden">
                                                        <FileText className="w-4 h-4 text-blue-600 flex-shrink-0" />
                                                        <span className="text-sm text-gray-700 truncate">{name}</span>
                                                    </div>
                                                    <button
                                                        onClick={() => removeFile(index)}
                                                        className="text-red-500 hover:text-red-700 p-1 flex-shrink-0"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Screen Button */}
                            <div className="flex justify-center gap-4 pt-2 pb-2">
                                <button
                                    onClick={handleScreenCVs}
                                    disabled={isScreening || cvFiles.length === 0 || Math.abs(weightageTotal - 100) > 1}
                                    className={`px-12 py-3 rounded-xl font-semibold text-white transition-all shadow-lg flex items-center gap-3 text-lg ${isScreening || cvFiles.length === 0 || Math.abs(weightageTotal - 100) > 1
                                        ? "bg-gray-400 cursor-not-allowed"
                                        : "bg-gradient-to-r from-[#0a2a5e] to-[#0d3b82] hover:from-[#061a3d] hover:to-[#0a2a5e]"
                                        }`}
                                >
                                    {isScreening ? (
                                        <>
                                            <Loader2 className="w-6 h-6 animate-spin" />
                                            Screening CVs...
                                        </>
                                    ) : (
                                        <>
                                            <Search className="w-6 h-6" />
                                            Screen {cvFiles.length} CV{cvFiles.length !== 1 ? 's' : ''}
                                        </>
                                    )}
                                </button>
                                {showRankingTable && (
                                    <button
                                        onClick={resetForm}
                                        className="px-8 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all font-medium text-lg"
                                    >
                                        Screen More CVs
                                    </button>
                                )}
                            </div>

                            {/* Ranking Results Table */}
                            {showRankingTable && rankingResults.length > 0 && (
                                <div className="border border-gray-200 rounded-xl overflow-hidden">
                                    <div className="bg-gradient-to-r from-[#0a2a5e] to-[#0d3b82] px-6 py-4">
                                        <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                            <Users className="w-5 h-5" />
                                            Candidate Rankings
                                        </h3>
                                        <p className="text-blue-200 text-sm mt-1">
                                            {rankingResults.length} candidate{rankingResults.length !== 1 ? 's' : ''} ranked by weighted score
                                        </p>
                                    </div>
                                    <div className="overflow-x-auto">
                                        <table className="w-full">
                                            <thead>
                                                <tr className="bg-gray-50 border-b border-gray-200">
                                                    <th className="text-left py-3 px-5 font-semibold text-gray-600 text-sm uppercase tracking-wider">Rank</th>
                                                    <th className="text-left py-3 px-5 font-semibold text-gray-600 text-sm uppercase tracking-wider">Candidate ID</th>
                                                    <th className="text-left py-3 px-5 font-semibold text-gray-600 text-sm uppercase tracking-wider">Name</th>
                                                    <th className="text-left py-3 px-5 font-semibold text-gray-600 text-sm uppercase tracking-wider">Email</th>
                                                    <th className="text-left py-3 px-5 font-semibold text-gray-600 text-sm uppercase tracking-wider">Score</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {rankingResults.map((result, index) => (
                                                    <tr key={index} className="border-b border-gray-100 hover:bg-blue-50/40 transition-all">
                                                        <td className="py-3 px-5">
                                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${index === 0 ? "bg-yellow-500" : index === 1 ? "bg-gray-400" : index === 2 ? "bg-amber-600" : "bg-[#0a2a5e]"
                                                                }`}>
                                                                {result.rank}
                                                            </div>
                                                        </td>
                                                        <td className="py-3 px-5">
                                                            <span className="text-sm font-mono text-gray-600 bg-gray-100 px-2 py-1 rounded">
                                                                {result.candidate_id}
                                                            </span>
                                                        </td>
                                                        <td className="py-3 px-5">
                                                            <span className="font-medium text-gray-800">{result.candidate_name}</span>
                                                        </td>
                                                        <td className="py-3 px-5">
                                                            <span className="text-sm text-gray-600">{result.email || "N/A"}</span>
                                                        </td>
                                                        <td className="py-3 px-5">
                                                            <div className="flex items-center gap-2">
                                                                <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                                                                    <div
                                                                        className={`h-full rounded-full ${result.score >= 80 ? "bg-green-500" : result.score >= 60 ? "bg-yellow-500" : "bg-red-500"
                                                                            }`}
                                                                        style={{ width: `${Math.min(result.score, 100)}%` }}
                                                                    />
                                                                </div>
                                                                <span className="font-bold text-gray-700 text-sm">{result.score}%</span>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}

                            {showRankingTable && rankingResults.length === 0 && (
                                <div className="text-center py-12 text-gray-500">
                                    <FileText className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                                    <p className="text-lg">No screening results available</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default RecruiterCVScreening;
