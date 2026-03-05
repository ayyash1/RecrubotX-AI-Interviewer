import React, { useState, useEffect, useRef } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
    LayoutDashboard,
    LogOut,
    PlusCircle,
    Search,
    Cog,
    ChevronRight,
    ChevronLeft,
    Save,
    Trash2,
    Eye,
    CheckCircle,
    X,
    FileText,
    HelpCircle,
    Briefcase,
    Clock
} from "lucide-react";
import API_BASE_URL from "./apiConfig";

const JobPosting = () => {
    const navigate = useNavigate();
    const [recruiterData, setRecruiterData] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [currentStep, setCurrentStep] = useState(1);
    const [isPreviewMode, setIsPreviewMode] = useState(false);

    // Initial Form State
    const initialFormState = {
        interviewField: "",
        positionLevel: "",
        workModel: "",
        status: "", // Employment Status
        location: "",
        salaryRange: "",
        experienceRange: "",
        industryDomain: "",
        numberOfVacancies: 1,
        jobDescription: "",
        questions: [], // Array of { text, type, difficulty }
        specificInstruction: "",
        deadline: "" // YYYY-MM-DD string
    };

    const [formData, setFormData] = useState(initialFormState);
    const [jobPostings, setJobPostings] = useState([]);
    const [selectedJobId, setSelectedJobId] = useState("");

    // Question State
    const [newQuestion, setNewQuestion] = useState({
        text: "",
        type: "Behavioral",
        difficulty: "Medium"
    });

    // Rich-text editor ref for the job description contentEditable
    const editorRef = useRef(null);

    // Sync editor DOM when loading an existing job or resetting, or when navigating to step 2
    useEffect(() => {
        if (currentStep === 2 && editorRef.current) {
            const desired = formData.jobDescription || "";
            if (editorRef.current.innerHTML !== desired) {
                editorRef.current.innerHTML = desired;
            }
        }
    }, [currentStep, selectedJobId]); // eslint-disable-line

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
            if (response.ok) {
                const data = await response.json();
                setJobPostings(data);
            }
        } catch (error) {
            console.error("Error fetching jobs:", error);
        }
    };

    const handleJobSelect = (e) => {
        const jobId = e.target.value;
        setSelectedJobId(jobId);

        if (jobId) {
            const selectedJob = jobPostings.find(job => job.id === jobId);
            if (selectedJob) {
                setFormData({
                    interviewField: selectedJob.interviewField || "",
                    positionLevel: selectedJob.positionLevel || "",
                    workModel: selectedJob.workModel || "",
                    status: selectedJob.status || "",
                    location: selectedJob.location || "",
                    salaryRange: selectedJob.salaryRange || "",
                    experienceRange: selectedJob.experienceRange || "",
                    industryDomain: selectedJob.industryDomain || "",
                    numberOfVacancies: selectedJob.numberOfVacancies || 1,
                    jobDescription: selectedJob.jobDescription || "",
                    questions: selectedJob.questions || [],
                    specificInstruction: selectedJob.specificInstruction || "",
                    deadline: selectedJob.deadline ? selectedJob.deadline.slice(0, 10) : ""
                });
            }
        } else {
            setFormData(initialFormState);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("recruiterUser");
        navigate("/recruiter/signin");
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
        setErrorMessage("");
        setSuccessMessage("");
    };

    const handleQuestionChange = (e) => {
        const { name, value } = e.target;
        setNewQuestion({
            ...newQuestion,
            [name]: value
        });
    };

    const addQuestion = () => {
        if (!newQuestion.text.trim()) {
            setErrorMessage("Question text cannot be empty.");
            return;
        }
        setFormData({
            ...formData,
            questions: [...formData.questions, newQuestion]
        });
        setNewQuestion({ text: "", type: "Behavioral", difficulty: "Medium" });
        setErrorMessage("");
    };

    const removeQuestion = (index) => {
        const updatedQuestions = formData.questions.filter((_, i) => i !== index);
        setFormData({
            ...formData,
            questions: updatedQuestions
        });
    };

    const validateStep = (step) => {
        if (step === 1) {
            if (!formData.interviewField || !formData.positionLevel || !formData.workModel || !formData.status || !formData.location || !formData.salaryRange || !formData.experienceRange || !formData.industryDomain || !formData.deadline) {
                setErrorMessage("Please fill in all required fields in Job Details (including Deadline).");
                return false;
            }
            // Validate deadline is in the future
            const deadlineDate = new Date(formData.deadline);
            if (deadlineDate <= new Date()) {
                setErrorMessage("Deadline must be a future date.");
                return false;
            }
        } else if (step === 2) {
            const plainText = (formData.jobDescription || "").replace(/<[^>]*>/g, "").trim();
            if (!plainText) {
                setErrorMessage("Job Description is required.");
                return false;
            }
        }
        setErrorMessage("");
        return true;
    };

    const nextStep = () => {
        if (validateStep(currentStep)) {
            setCurrentStep(currentStep + 1);
        }
    };

    const prevStep = () => {
        setCurrentStep(currentStep - 1);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMessage("");
        setSuccessMessage("");
        setIsLoading(true);

        try {
            const url = selectedJobId
                ? `${API_BASE_URL}/jobs/${selectedJobId}`
                : `${API_BASE_URL}/jobs/create`;

            const method = selectedJobId ? "PUT" : "POST";

            const payload = {
                recruiterId: recruiterData.id,
                ...formData
            };

            const response = await fetch(url, {
                method: method,
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.detail || "Failed to save job posting");
            }

            setSuccessMessage(selectedJobId ? "Job posting updated successfully!" : "Job posting created successfully!");

            if (!selectedJobId) {
                setFormData(initialFormState);
                setCurrentStep(1);
                setIsPreviewMode(false);
            }

            // Refresh job list if needed
            fetchJobPostings(recruiterData.id);

            setTimeout(() => {
                navigate("/recruiter/dashboard");
            }, 2000);
        } catch (error) {
            console.error("Error:", error);
            setErrorMessage(error.message || "Failed to save job posting");
        } finally {
            setIsLoading(false);
        }
    };

    const StepIndicator = ({ step, title, active }) => (
        <div className={`flex items-center gap-2 ${active ? "text-[#0a2a5e] font-bold" : "text-gray-400"}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${active ? "bg-[#0a2a5e] text-white" : "bg-gray-200 text-gray-500"}`}>
                {step}
            </div>
            <span className="hidden md:block">{title}</span>
        </div>
    );

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
            <aside className="w-72 h-screen bg-white shadow-xl flex flex-col p-6 border-r border-gray-200 flex-shrink-0">
                <div className="mb-8 text-center flex-shrink-0">
                    <h1 className="text-3xl font-bold text-[#0a2a5e]">RecruBotX</h1>
                </div>

                <nav className="flex flex-col space-y-4 text-gray-700 flex-shrink-0">
                    <NavLink to="/recruiter/dashboard" className={({ isActive }) => `font-medium px-4 py-3 rounded-xl transition-all flex items-center gap-2 ${isActive ? "bg-[#0a2a5e]/10 text-[#0a2a5e]" : "text-gray-700 hover:bg-[#0a2a5e]/5 hover:text-[#0a2a5e]"}`}><LayoutDashboard className="w-5 h-5" /> Dashboard</NavLink>
                    <NavLink to="/recruiter/job-posting" className={({ isActive }) => `font-medium px-4 py-3 rounded-xl transition-all flex items-center gap-2 ${isActive ? "bg-[#0a2a5e]/10 text-[#0a2a5e]" : "text-gray-700 hover:bg-[#0a2a5e]/5 hover:text-[#0a2a5e]"}`}><PlusCircle className="w-5 h-5" /> Job Posting</NavLink>
                    <NavLink to="/recruiter/cv-screening" className={({ isActive }) => `font-medium px-4 py-3 rounded-xl transition-all flex items-center gap-2 ${isActive ? "bg-[#0a2a5e]/10 text-[#0a2a5e]" : "text-gray-700 hover:bg-[#0a2a5e]/5 hover:text-[#0a2a5e]"}`}><Search className="w-5 h-5" /> Resume Analyzer</NavLink>
                    <NavLink to="/recruiter/settings" className={({ isActive }) => `font-medium px-4 py-3 rounded-xl transition-all flex items-center gap-2 ${isActive ? "bg-[#0a2a5e]/10 text-[#0a2a5e]" : "text-gray-700 hover:bg-[#0a2a5e]/5 hover:text-[#0a2a5e]"}`}><Cog className="w-5 h-5" /> Settings</NavLink>
                </nav>

                <div className="mt-auto flex-shrink-0 space-y-3">
                    <div className="flex items-center gap-3 bg-gray-100 rounded-xl px-3 py-2.5">
                        <div className="w-10 h-10 bg-[#0a2a5e] rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0 overflow-hidden">
                            {recruiterData.profileImage ? (
                                <img src={recruiterData.profileImage} alt="Profile" className="w-full h-full object-cover" />
                            ) : (
                                <>{recruiterData.firstName?.charAt(0)}{recruiterData.lastName?.charAt(0)}</>
                            )}
                        </div>
                        <div className="min-w-0">
                            <p className="font-bold text-[#0a2a5e] text-sm truncate">{recruiterData.firstName} {recruiterData.lastName}</p>
                            <p className="text-xs text-gray-500 truncate">{recruiterData.email}</p>
                        </div>
                    </div>                    
                    <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-red-500 to-red-600 px-4 py-3 rounded-xl text-white hover:from-red-600 hover:to-red-700 transition-all shadow-md"><LogOut className="w-5 h-5" /> Logout</button>
                </div>
            </aside>


            {/* Main Content */}
            <main className="flex-1 h-screen flex flex-col overflow-hidden py-6 px-10">
                {/* Header */}
                <div className="mb-4 flex-shrink-0 flex justify-between items-center">
                    <div>
                        <h2 className="text-3xl font-bold text-[#0a2a5e]">{selectedJobId ? "Edit Job" : "Create a Job"}</h2>
                        <p className="text-gray-500 text-md mt-1 py-4">Define requirement, questions, and details for your new position.</p>
                    </div>
                    <div className="flex items-center gap-4">
                        {/* View All Jobs Button */}
                        <NavLink to="/recruiter/all-jobs" className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 flex items-center gap-2 shadow-sm">
                            <Briefcase className="w-4 h-4" /> View All Jobs
                        </NavLink>
                    </div>
                </div>

                {/* Progress Indicators */}
                <div className="flex justify-between items-center mb-6 px-12">
                    <StepIndicator step={1} title="Job Details" active={currentStep >= 1} />
                    <div className={`h-1 flex-1 mx-4 ${currentStep >= 2 ? "bg-[#0a2a5e]" : "bg-gray-200"}`}></div>
                    <StepIndicator step={2} title="Job Description" active={currentStep >= 2} />
                    <div className={`h-1 flex-1 mx-4 ${currentStep >= 3 ? "bg-[#0a2a5e]" : "bg-gray-200"}`}></div>
                    <StepIndicator step={3} title="Interview Questions" active={currentStep >= 3} />
                    <div className={`h-1 flex-1 mx-4 ${currentStep >= 4 ? "bg-[#0a2a5e]" : "bg-gray-200"}`}></div>
                    <StepIndicator step={4} title="Review" active={currentStep >= 4} />
                </div>

                {/* Messages */}
                {successMessage && <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4 flex-shrink-0 flex items-center gap-2"><CheckCircle className="w-5 h-5" /> {successMessage}</div>}
                {errorMessage && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 flex-shrink-0 flex items-center gap-2"><X className="w-5 h-5" /> {errorMessage}</div>}



                {/* Main Form Area - Scrollable */}
                <div className="flex-1 overflow-hidden bg-white rounded-2xl shadow-lg border border-gray-100 flex flex-col">
                    <div className="flex-1 overflow-y-auto p-8">

                        {/* STEP 1: JOB DETAILS */}
                        {currentStep === 1 && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-right duration-300">
                                <h3 className="text-xl font-bold text-gray-800 border-b pb-2 mb-4">Basic Information</h3>

                                {/* Load Existing Job (Optional) */}
                                <div className="mb-6">
                                    <label className="block font-medium text-gray-700 mb-2">
                                        Load Existing Job (Optional)
                                    </label>
                                    <select
                                        value={selectedJobId}
                                        onChange={handleJobSelect}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0a2a5e] focus:border-transparent outline-none transition-all bg-gray-50"
                                    >
                                        <option value="">-- Create New Job --</option>
                                        {jobPostings.map((job) => (
                                            <option key={job.id} value={job.id}>
                                                {job.interviewField} ({job.positionLevel}) - {job.location}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div>
                                        <label className="block font-medium text-gray-700 mb-2">Interview Field <span className="text-red-500">*</span></label>
                                        <input type="text" name="interviewField" value={formData.interviewField} onChange={handleInputChange} placeholder="e.g. Software Engineering" className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#0a2a5e] outline-none" required />
                                    </div>
                                    <div>
                                        <label className="block font-medium text-gray-700 mb-2">Position Level <span className="text-red-500">*</span></label>
                                        <select name="positionLevel" value={formData.positionLevel} onChange={handleInputChange} className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#0a2a5e] outline-none" required>
                                            <option value="">Select a level...</option>
                                            <option value="Intern">Intern</option>
                                            <option value="Junior">Junior</option>
                                            <option value="Mid-level">Mid-level</option>
                                            <option value="Senior">Senior</option>
                                            <option value="Lead">Lead</option>
                                            <option value="Manager">Manager</option>
                                            <option value="Director">Director</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block font-medium text-gray-700 mb-2">Industry / Domain <span className="text-red-500">*</span></label>
                                        <input type="text" name="industryDomain" value={formData.industryDomain} onChange={handleInputChange} placeholder="e.g. Fintech, E-commerce, Healthcare" className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#0a2a5e] outline-none" required />
                                    </div>
                                    <div>
                                        <label className="block font-medium text-gray-700 mb-2">Employment Status <span className="text-red-500">*</span></label>
                                        <select name="status" value={formData.status} onChange={handleInputChange} className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#0a2a5e] outline-none" required>
                                            <option value="">Select status...</option>
                                            <option value="Full-time">Full-time</option>
                                            <option value="Part-time">Part-time</option>
                                            <option value="Contract">Contract</option>
                                            <option value="Internship">Internship</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block font-medium text-gray-700 mb-2">Work Mode <span className="text-red-500">*</span></label>
                                        <select name="workModel" value={formData.workModel} onChange={handleInputChange} className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#0a2a5e] outline-none" required>
                                            <option value="">Select work model...</option>
                                            <option value="Remote">Remote</option>
                                            <option value="Onsite">Onsite</option>
                                            <option value="Hybrid">Hybrid</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block font-medium text-gray-700 mb-2">Location <span className="text-red-500">*</span></label>
                                        <input type="text" name="location" value={formData.location} onChange={handleInputChange} placeholder="e.g. New York, NY" className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#0a2a5e] outline-none" required />
                                    </div>
                                    <div>
                                        <label className="block font-medium text-gray-700 mb-2">Salary Range <span className="text-red-500">*</span></label>
                                        <input type="text" name="salaryRange" value={formData.salaryRange} onChange={handleInputChange} placeholder="e.g. $80,000 - $120,000" className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#0a2a5e] outline-none" required />
                                    </div>
                                    <div>
                                        <label className="block font-medium text-gray-700 mb-2">Experience Range <span className="text-red-500">*</span></label>
                                        <input type="text" name="experienceRange" value={formData.experienceRange} onChange={handleInputChange} placeholder="e.g. 3-5 Years" className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#0a2a5e] outline-none" required />
                                    </div>
                                    <div>
                                        <label className="block font-medium text-gray-700 mb-2">Number of Vacancies <span className="text-red-500">*</span></label>
                                        <input type="number" name="numberOfVacancies" value={formData.numberOfVacancies} onChange={handleInputChange} min="1" placeholder="e.g. 2" className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#0a2a5e] outline-none" required />
                                    </div>
                                </div>

                                {/* Deadline Field - Prominent */}
                                <div className="mt-6 p-5 bg-[#0a2a5e]/5 border-2 border-[#0a2a5e]/30 rounded-2xl">
                                    <label className="block font-bold text-[#0a2a5e] mb-2 flex items-center gap-2">
                                        <Clock className="w-5 h-5" /> Application Deadline <span className="text-red-500">*</span>
                                    </label>
                                    <p className="text-sm text-[#0a2a5e]/70 mb-3">After this date, the job will automatically close and candidates cannot apply.</p>
                                    <input
                                        type="date"
                                        name="deadline"
                                        value={formData.deadline}
                                        onChange={handleInputChange}
                                        min={new Date().toISOString().split('T')[0]}
                                        className="w-full px-4 py-3 border-2 border-[#0a2a5e]/30 rounded-xl focus:ring-2 focus:ring-[#0a2a5e] focus:border-[#0a2a5e] outline-none bg-white text-lg font-semibold text-[#0a2a5e]"
                                        required
                                    />
                                </div>
                            </div>
                        )}

                        {/* STEP 2: JOB DESCRIPTION */}
                        {currentStep === 2 && (
                            <div className="animate-in fade-in slide-in-from-right duration-300 h-full flex flex-col gap-3">
                                <div className="flex items-center justify-between flex-shrink-0">
                                    <h3 className="text-xl font-bold text-gray-800 border-b pb-2 flex-grow">Job Description</h3>                                    
                                </div>

                                {/* Inject scoped styles for editor + preview */}
                                <style dangerouslySetInnerHTML={{__html: `
                                    .jd-editor ul, .jd-preview ul { list-style-type: disc !important; padding-left: 1.4rem !important; margin: 0.4rem 0 !important; }
                                    .jd-editor ol, .jd-preview ol { list-style-type: decimal !important; padding-left: 1.4rem !important; margin: 0.4rem 0 !important; }
                                    .jd-editor li, .jd-preview li { margin-bottom: 0.25rem !important; }
                                    .jd-editor b, .jd-editor strong, .jd-preview b, .jd-preview strong { font-weight: 700 !important; }
                                    .jd-editor u, .jd-preview u { text-decoration: underline !important; }
                                    .jd-editor p, .jd-preview p { margin-bottom: 0.4rem; }
                                    .jd-editor:empty:before { content: attr(data-placeholder); color: #9ca3af; pointer-events: none; }
                                `}} />

                                {/* Editor Container */}
                                <div className="flex-1 flex flex-col border border-gray-300 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-[#0a2a5e] focus-within:border-[#0a2a5e]">

                                    {/* ── Toolbar ── */}
                                    <div className="flex items-center gap-1 bg-gray-50 border-b border-gray-200 px-3 py-2 flex-shrink-0 flex-wrap">
                                        <span className="text-[11px] text-gray-400 font-semibold uppercase tracking-wider mr-1">Format</span>

                                        {/* Bold */}
                                        <button type="button"
                                            title="Bold (Ctrl+B)"
                                            onMouseDown={(e) => {
                                                e.preventDefault();
                                                editorRef.current.focus();
                                                document.execCommand('bold');
                                                setFormData(prev => ({...prev, jobDescription: editorRef.current.innerHTML}));
                                            }}
                                            className="w-8 h-8 rounded font-bold text-gray-700 hover:bg-[#0a2a5e] hover:text-white transition-colors text-sm"
                                        >B</button>

                                        {/* Underline */}
                                        <button type="button"
                                            title="Underline (Ctrl+U)"
                                            onMouseDown={(e) => {
                                                e.preventDefault();
                                                editorRef.current.focus();
                                                document.execCommand('underline');
                                                setFormData(prev => ({...prev, jobDescription: editorRef.current.innerHTML}));
                                            }}
                                            className="w-8 h-8 rounded underline text-gray-700 hover:bg-[#0a2a5e] hover:text-white transition-colors text-sm"
                                        >U</button>

                                        <div className="w-px h-5 bg-gray-300 mx-1" />

                                        {/* Bullet List */}
                                        <button type="button"
                                            title="Bullet List"
                                            onMouseDown={(e) => {
                                                e.preventDefault();
                                                editorRef.current.focus();
                                                document.execCommand('insertUnorderedList');
                                                setFormData(prev => ({...prev, jobDescription: editorRef.current.innerHTML}));
                                            }}
                                            className="flex items-center gap-1 px-2.5 h-8 rounded text-gray-700 hover:bg-[#0a2a5e] hover:text-white transition-colors text-sm font-medium"
                                        >• Bullet</button>

                                        <div className="w-px h-5 bg-gray-300 mx-1" />

                                        {/* Clear Formatting */}
                                        <button type="button"
                                            title="Remove all formatting from selection"
                                            onMouseDown={(e) => {
                                                e.preventDefault();
                                                editorRef.current.focus();
                                                document.execCommand('removeFormat');
                                                setFormData(prev => ({...prev, jobDescription: editorRef.current.innerHTML}));
                                            }}
                                            className="flex items-center gap-1 px-2.5 h-8 rounded text-gray-500 hover:bg-red-50 hover:text-red-600 transition-colors text-xs"
                                        >✕ Clear format</button>
                                    </div>

                                    {/* ── Content Editable Area ── */}
                                    <div
                                        ref={editorRef}
                                        contentEditable
                                        suppressContentEditableWarning
                                        data-placeholder="Start typing your job description...&#10;&#10;Select text then click B to bold, U to underline, or use • Bullet to add a bullet list."
                                        className="jd-editor flex-1 p-4 outline-none text-sm text-gray-700 leading-relaxed overflow-y-auto"
                                        style={{ minHeight: '180px' }}
                                        onInput={() => {
                                            if (editorRef.current) {
                                                setFormData(prev => ({...prev, jobDescription: editorRef.current.innerHTML}));
                                            }
                                        }}
                                    />
                                </div>
                            </div>
                        )}

                        {/* STEP 3: INTERVIEW QUESTIONS */}
                        {currentStep === 3 && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-right duration-300">
                                <h3 className="text-xl font-bold text-gray-800 border-b pb-2 mb-4">Interview Configuration</h3>

                                {/* Specific Instructions */}
                                <div className="mb-6">
                                    <label className="block font-medium text-gray-700 mb-2">Specific Instructions for Interviewer (AI)</label>
                                    <textarea
                                        name="specificInstruction"
                                        value={formData.specificInstruction}
                                        onChange={handleInputChange}
                                        placeholder="e.g. Focus on system design capabilities, ask about conflict resolution..."
                                        className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#0a2a5e] outline-none h-24 resize-none"
                                    ></textarea>
                                </div>

                                {/* Questions List */}
                                <div>
                                    <div className="flex justify-between items-center mb-4">
                                        <h4 className="font-bold text-gray-700">Questions List ({formData.questions.length})</h4>
                                    </div>

                                    {/* Add New Question Form */}
                                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 mb-6">
                                        <div className="grid grid-cols-12 gap-4 mb-3">
                                            <div className="col-span-8">
                                                <input
                                                    type="text"
                                                    name="text"
                                                    value={newQuestion.text}
                                                    onChange={handleQuestionChange}
                                                    placeholder="Type a question here..."
                                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0a2a5e] outline-none"
                                                />
                                            </div>
                                            <div className="col-span-2">
                                                <select
                                                    name="type"
                                                    value={newQuestion.type}
                                                    onChange={handleQuestionChange}
                                                    className="w-full px-2 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0a2a5e] outline-none text-sm"
                                                >
                                                    <option value="Behavioral">Behavioral</option>
                                                    <option value="Technical">Technical</option>
                                                    <option value="Situational">Situational</option>
                                                </select>
                                            </div>
                                            <div className="col-span-2">
                                                <select
                                                    name="difficulty"
                                                    value={newQuestion.difficulty}
                                                    onChange={handleQuestionChange}
                                                    className="w-full px-2 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0a2a5e] outline-none text-sm"
                                                >
                                                    <option value="Easy">Easy</option>
                                                    <option value="Medium">Medium</option>
                                                    <option value="Hard">Hard</option>
                                                </select>
                                            </div>
                                        </div>
                                        <button onClick={addQuestion} type="button" className="w-full py-2 bg-white border border-[#0a2a5e] text-[#0a2a5e] rounded-lg font-medium hover:bg-[#0a2a5e] hover:text-white transition-all flex justify-center items-center gap-2">
                                            <PlusCircle className="w-4 h-4" /> Add Question
                                        </button>
                                    </div>

                                    {/* List of Added Questions */}
                                    <div className="space-y-3">
                                        {formData.questions.length === 0 ? (
                                            <p className="text-gray-400 text-center italic py-4">No questions added yet. Add some questions to guide the interview.</p>
                                        ) : (
                                            formData.questions.map((q, idx) => (
                                                <div key={idx} className="flex justify-between items-start bg-white p-4 rounded-xl border border-gray-100 shadow-sm group hover:shadow-md transition-all">
                                                    <div>
                                                        <p className="font-medium text-gray-800">{q.text}</p>
                                                        <div className="flex gap-2 mt-2">
                                                            <span className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-md">{q.type}</span>
                                                            <span className={`px-2 py-1 text-xs rounded-md ${q.difficulty === 'Hard' ? 'bg-red-50 text-red-700' : q.difficulty === 'Medium' ? 'bg-yellow-50 text-yellow-700' : 'bg-green-50 text-green-700'}`}>{q.difficulty}</span>
                                                        </div>
                                                    </div>
                                                    <button onClick={() => removeQuestion(idx)} className="text-red-400 hover:text-red-600 p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <Trash2 className="w-5 h-5" />
                                                    </button>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* STEP 4: REVIEW */}
                        {currentStep === 4 && (
                            <div className="space-y-8 animate-in fade-in slide-in-from-right duration-300">
                                <h3 className="text-xl font-bold text-gray-800 border-b pb-2 mb-4">Review Job Posting</h3>

                                {/* Review Details */}
                                <div className="grid grid-cols-2 gap-8 text-sm">
                                    <div>
                                        <h4 className="font-semibold text-gray-500 mb-2 uppercase tracking-wide">Job Details</h4>
                                        <div className="space-y-2">
                                            <p><span className="font-medium text-gray-900">Role:</span> {formData.interviewField}</p>
                                            <p><span className="font-medium text-gray-900">Level:</span> {formData.positionLevel}</p>
                                            <p><span className="font-medium text-gray-900">Industry:</span> {formData.industryDomain}</p>
                                            <p><span className="font-medium text-gray-900">Location:</span> {formData.location} ({formData.workModel})</p>
                                            <p><span className="font-medium text-gray-900">Salary:</span> {formData.salaryRange}</p>
                                            <p><span className="font-medium text-gray-900">Experience:</span> {formData.experienceRange}</p>
                                            <p><span className="font-medium text-gray-900">Status:</span> {formData.status}</p>
                                            <p><span className="font-medium text-gray-900">Vacancies:</span> {formData.numberOfVacancies}</p>
                                        </div>
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-gray-500 mb-2 uppercase tracking-wide">Deadline & Interview</h4>
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2 p-3 bg-[#0a2a5e]/5 border border-[#0a2a5e]/20 rounded-xl">
                                                <Clock className="w-5 h-5 text-[#0a2a5e]" />
                                                <span className="font-bold text-[#0a2a5e]">
                                                    {formData.deadline ? new Date(formData.deadline).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) : "Not set"}
                                                </span>
                                            </div>
                                            <p><span className="font-medium text-gray-900">Total Questions:</span> {formData.questions.length}</p>
                                            <p><span className="font-medium text-gray-900">Specific Instruction:</span> {formData.specificInstruction || "None"}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Review Description */}
                                <div>
                                    <h4 className="font-semibold text-gray-500 mb-2 uppercase tracking-wide">Description Preview</h4>
                                    <style dangerouslySetInnerHTML={{__html: `
                                        .jd-preview ul { list-style-type: disc !important; padding-left: 1.4rem !important; margin: 0.4rem 0 !important; }
                                        .jd-preview li { margin-bottom: 0.25rem !important; }
                                        .jd-preview b, .jd-preview strong { font-weight: 700 !important; }
                                        .jd-preview u { text-decoration: underline !important; }
                                    `}} />
                                    <div
                                        className="jd-preview bg-gray-50 p-4 rounded-xl text-sm text-gray-700 max-h-48 overflow-y-auto leading-relaxed"
                                        dangerouslySetInnerHTML={{ __html: formData.jobDescription || '<p class="text-gray-400 italic">No description entered yet.</p>' }}
                                    />
                                </div>
                            </div>
                        )}

                    </div>

                    {/* Footer Actions */}
                    <div className="p-6 border-t border-gray-200 bg-gray-50 flex justify-between items-center flex-shrink-0">
                        <button
                            onClick={prevStep}
                            disabled={currentStep === 1}
                            className={`px-6 py-2 rounded-xl font-medium flex items-center gap-2 transition-all ${currentStep === 1 ? "text-gray-300 cursor-not-allowed" : "text-gray-600 hover:bg-gray-200"}`}
                        >
                            <ChevronLeft className="w-5 h-5" /> Back
                        </button>

                        {currentStep < 4 ? (
                            <button
                                onClick={nextStep}
                                className="px-8 py-3 bg-[#0a2a5e] hover:bg-[#061a3d] text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
                            >
                                Next <ChevronRight className="w-5 h-5" />
                            </button>
                        ) : (
                            <button
                                onClick={handleSubmit}
                                disabled={isLoading}
                                className="px-8 py-3 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
                            >
                                {isLoading ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div> : <Save className="w-5 h-5" />}
                                {selectedJobId ? "Update Job" : "Publish Job"}
                            </button>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default JobPosting;
