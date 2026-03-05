import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Upload, User, Mail, Phone, Linkedin, ArrowRight, CheckCircle, AlertCircle, ArrowLeft, XCircle, Clock } from "lucide-react";
import CandidateSidebar from "./components/CandidateSidebar";
import API_BASE_URL from "./apiConfig";
import { getCurrentUser } from "./utils/userDatabase";

const InterviewPage = () => {
    const { jobId } = useParams();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [jobDetails, setJobDetails] = useState(null);
    const [user, setUser] = useState(null);
    const [hasApplied, setHasApplied] = useState(false);
    const [jobClosed, setJobClosed] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        candidateName: "",
        emailAddress: "",
        phoneNumber: "",
        linkedinProfile: "",
        cvFile: null
    });

    // Fetch Job Details and User on Mount
    useEffect(() => {
        const currentUser = getCurrentUser();
        if (currentUser) {
            setUser(currentUser);
            // Auto-fill form if user exists
            setFormData(prev => ({
                ...prev,
                candidateName: `${currentUser.firstName} ${currentUser.lastName}`.trim(),
                emailAddress: currentUser.email,
            }));
        }

        const fetchJobDetails = async () => {
            if (!jobId) return;
            try {
                const response = await fetch(`${API_BASE_URL}/jobs/${jobId}`);
                if (response.ok) {
                    const data = await response.json();
                    setJobDetails(data);

                    // Check if job is closed (deadline passed or inactive)
                    if (!data.isActive) {
                        setJobClosed(true);
                    } else if (data.deadline) {
                        const deadline = new Date(data.deadline);
                        if (new Date() > deadline) {
                            setJobClosed(true);
                        }
                    }

                    // Check if candidate already applied
                    if (currentUser) {
                        try {
                            const appRes = await fetch(`${API_BASE_URL}/jobs/${jobId}/has-applied/${currentUser.id}`);
                            if (appRes.ok) {
                                const appData = await appRes.json();
                                if (appData.hasApplied) {
                                    setHasApplied(true);
                                }
                            }
                        } catch (e) {
                            console.error("Failed to check application status", e);
                        }
                    }
                }
            } catch (err) {
                console.error("Failed to fetch job details", err);
            }
        };
        fetchJobDetails();
    }, [jobId]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e) => {
        if (e.target.files[0]) {
            setFormData(prev => ({ ...prev, cvFile: e.target.files[0] }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        try {
            const submitData = new FormData();
            submitData.append("job_id", jobId);
            submitData.append("candidate_name", formData.candidateName);
            submitData.append("email_address", formData.emailAddress);
            submitData.append("phone_number", formData.phoneNumber);
            if (formData.linkedinProfile) {
                submitData.append("linkedin_profile", formData.linkedinProfile);
            }
            submitData.append("cv_file", formData.cvFile);

            const response = await fetch(`${API_BASE_URL}/interview/start-interview/${jobId}`, {
                method: "POST",
                body: submitData
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.detail || "Failed to start interview");
            }

            // Record the application so candidate cannot apply again
            try {
                await fetch(`${API_BASE_URL}/jobs/${jobId}/apply`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        candidateId: user?.id || "",
                        candidateEmail: formData.emailAddress
                    })
                });
            } catch (appErr) {
                console.error("Failed to record application", appErr);
            }

            // Navigate to Voice Interview with Session ID
            navigate("/candidate/interview-room", {
                replace: true,
                state: {
                    sessionId: data.session_id,
                    candidateName: formData.candidateName,
                    jobTitle: jobDetails?.interviewField || "Interview Position"
                }
            });

        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    if (!jobId) {
        return <div className="p-8 text-center text-red-500">Invalid Job Link</div>;
    }

    return (
        <div className="h-screen w-screen flex bg-gray-50 overflow-hidden fixed inset-0">
            {/* Reused Sidebar */}
            <CandidateSidebar />

            {/* Main Content */}
            <main className="flex-1 h-screen flex flex-col overflow-hidden relative">

                {/* Header Area */}
                <div className="bg-white shadow-sm p-6 flex justify-between items-center z-10 flex-shrink-0">
                    <div className="flex items-center gap-4">
                        <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-full text-gray-500 transition-colors">
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                        <div>
                            <h2 className="text-2xl font-bold text-gray-800">Job Vacancy</h2>
                            <p className="text-gray-500 text-sm">Fill in your details to start the interview process</p>
                        </div>
                    </div>
                </div>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto p-8">
                    <div className="max-w-3xl mx-auto w-full bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
                        {/* Card Header */}
                        <div className="bg-gradient-to-r from-[#0a2a5e] to-[#0d3b82] px-8 py-10 text-white text-center">
                            <h1 className="text-3xl font-bold mb-2">Ready to Apply?</h1>
                            <p className="text-blue-100 text-lg">
                                {jobDetails ? `Position: ${jobDetails.interviewField} (${jobDetails.positionLevel})` : "Loading details..."}
                            </p>
                            {jobDetails?.deadline && (
                                <div className="mt-3 inline-flex items-center gap-2 px-4 py-2 bg-white/10 rounded-xl text-sm font-medium">
                                    <Clock className="w-4 h-4" />
                                    Deadline: {new Date(jobDetails.deadline).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                                </div>
                            )}
                        </div>

                        {/* Already Applied Message */}
                        {hasApplied ? (
                            <div className="p-12 text-center">
                                <CheckCircle className="mx-auto h-16 w-16 text-green-500 mb-4" />
                                <h2 className="text-2xl font-bold text-gray-800 mb-2">Already Applied</h2>
                                <p className="text-gray-500 mb-6">You have already submitted your application for this position.</p>
                                <button onClick={() => navigate("/candidate/jobs")} className="px-6 py-3 bg-[#0a2a5e] text-white rounded-xl font-semibold hover:bg-[#0d3b82] transition-colors">
                                    Browse Other Jobs
                                </button>
                            </div>
                        ) : jobClosed ? (
                            <div className="p-12 text-center">
                                <XCircle className="mx-auto h-16 w-16 text-red-500 mb-4" />
                                <h2 className="text-2xl font-bold text-gray-800 mb-2">Job Closed</h2>
                                <p className="text-gray-500 mb-6">The deadline for this position has passed and it is no longer accepting applications.</p>
                                <button onClick={() => navigate("/candidate/jobs")} className="px-6 py-3 bg-[#0a2a5e] text-white rounded-xl font-semibold hover:bg-[#0d3b82] transition-colors">
                                    Browse Other Jobs
                                </button>
                            </div>
                        ) : (

                            <div className="p-8 md:p-12">
                                {error && (
                                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-red-700">
                                        <AlertCircle className="w-5 h-5 flex-shrink-0" />
                                        <p>{error}</p>
                                    </div>
                                )}

                                <form onSubmit={handleSubmit} className="space-y-6">
                                    {/* Name */}
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <User className="h-5 w-5 text-gray-400" />
                                            </div>
                                            <input
                                                type="text"
                                                name="candidateName"
                                                required
                                                value={formData.candidateName}
                                                onChange={handleInputChange}
                                                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:ring-[#0a2a5e] focus:border-[#0a2a5e] transition-shadow shadow-sm"
                                                placeholder="John Doe"
                                            />
                                        </div>
                                    </div>

                                    {/* Email & Phone */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                    <Mail className="h-5 w-5 text-gray-400" />
                                                </div>
                                                <input
                                                    type="email"
                                                    name="emailAddress"
                                                    required
                                                    value={formData.emailAddress}
                                                    onChange={handleInputChange}
                                                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:ring-[#0a2a5e] focus:border-[#0a2a5e] transition-shadow shadow-sm"
                                                    placeholder="john@example.com"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">Phone Number</label>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                    <Phone className="h-5 w-5 text-gray-400" />
                                                </div>
                                                <input
                                                    type="tel"
                                                    name="phoneNumber"
                                                    required
                                                    value={formData.phoneNumber}
                                                    onChange={handleInputChange}
                                                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:ring-[#0a2a5e] focus:border-[#0a2a5e] transition-shadow shadow-sm"
                                                    placeholder="+1 (555) 000-0000"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* LinkedIn */}
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">LinkedIn Profile (Optional)</label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <Linkedin className="h-5 w-5 text-gray-400" />
                                            </div>
                                            <input
                                                type="url"
                                                name="linkedinProfile"
                                                value={formData.linkedinProfile}
                                                onChange={handleInputChange}
                                                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:ring-[#0a2a5e] focus:border-[#0a2a5e] transition-shadow shadow-sm"
                                                placeholder="https://linkedin.com/in/johndoe"
                                            />
                                        </div>
                                    </div>

                                    {/* CV Upload */}
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Upload CV (PDF only)</label>
                                        <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-xl hover:border-[#0a2a5e] transition-colors group cursor-pointer relative bg-gray-50 hover:bg-white">
                                            <input
                                                type="file"
                                                name="cvFile"
                                                id="cvFile"
                                                accept=".pdf"
                                                required
                                                onChange={handleFileChange}
                                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                            />
                                            <div className="space-y-1 text-center">
                                                {formData.cvFile ? (
                                                    <div className="flex flex-col items-center">
                                                        <CheckCircle className="mx-auto h-12 w-12 text-green-500 mb-2" />
                                                        <p className="text-sm text-green-600 font-medium">{formData.cvFile.name}</p>
                                                        <p className="text-xs text-gray-500">Click to change file</p>
                                                    </div>
                                                ) : (
                                                    <>
                                                        <Upload className="mx-auto h-12 w-12 text-gray-400 group-hover:text-[#0a2a5e] transition-colors" />
                                                        <div className="flex text-sm text-gray-600 justify-center">
                                                            <span className="relative cursor-pointer rounded-md font-medium text-[#0a2a5e] hover:text-[#0d3b82] transition-colors">
                                                                Upload a file
                                                            </span>
                                                            <p className="pl-1">or drag and drop</p>
                                                        </div>
                                                        <p className="text-xs text-gray-500">PDF up to 10MB</p>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Submit Button */}
                                    <button
                                        type="submit"
                                        disabled={isLoading}
                                        className={`w-full flex items-center justify-center gap-2 py-4 px-4 border border-transparent rounded-xl shadow-lg text-lg font-bold text-white bg-gradient-to-r from-[#0a2a5e] to-[#0d3b82] hover:from-[#061a3d] hover:to-[#0a2a5e] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0a2a5e] transition-all transform hover:-translate-y-0.5 active:translate-y-0 ${isLoading ? "opacity-75 cursor-not-allowed" : ""}`}
                                    >
                                        {isLoading ? (
                                            <>
                                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                                Processing Application...
                                            </>
                                        ) : (
                                            <>
                                                Start Interview
                                                <ArrowRight className="h-5 w-5" />
                                            </>
                                        )}
                                    </button>
                                </form>
                            </div>
                        )}
                    </div>
                </div>
            </main >
        </div >
    );
};

export default InterviewPage;
