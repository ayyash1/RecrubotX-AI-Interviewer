import React from 'react';
import {
    ArrowLeft,
    Download,
    Share2,
    CheckCircle,
    AlertCircle,
    TrendingUp,
    Award,
    Cpu
} from 'lucide-react';

const InterviewReport = ({ reportData, onRestart }) => {
    // Mock data if none provided (for safety)
    const data = reportData || {
        score: 78,
        summary: "Ayyash demonstrated solid product sense and communication skills. However, his technical depth regarding API design was slightly lacking. He showed great confidence and culture fit.",
        skills: [
            { name: "Technical Knowledge", score: 72, icon: Cpu },
            { name: "Communication", score: 88, icon: MessageCircle },
            { name: "Problem Solving", score: 75, icon: TrendingUp },
            { name: "Culture Fit", score: 90, icon: Award },
        ],
        strengths: [
            "Clear articulation of user problems",
            "Strong understanding of agile methodologies",
            "Friendly and professional demeanor"
        ],
        weaknesses: [
            "Lack of specific examples in technical answers",
            "Could improve on structural clarity when explaining complex topics"
        ],
        verdict: "Strong Hire" // Strong Hire, Hire, Needs Improvement, Not Ready
    };

    const getVerdictColor = (verdict) => {
        if (verdict === "Strong Hire") return "text-emerald-600 bg-emerald-50 border-emerald-200";
        if (verdict === "Hire") return "text-blue-600 bg-blue-50 border-blue-200";
        if (verdict === "Needs Improvement") return "text-amber-600 bg-amber-50 border-amber-200";
        return "text-red-600 bg-red-50 border-red-200";
    };

    const getScoreColor = (score) => {
        if (score >= 80) return "text-emerald-600";
        if (score >= 60) return "text-blue-600";
        return "text-amber-600";
    };

    return (
        <div className="min-h-screen bg-slate-50 font-sans p-8">
            <div className="max-w-5xl mx-auto space-y-8">

                {/* HEADER ACTION BAR */}
                <div className="flex justify-between items-center animate-fade-in">
                    <button
                        onClick={onRestart}
                        className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors font-medium"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        Back to Dashboard
                    </button>
                    <div className="flex gap-3">
                        <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 shadow-sm font-medium transition-all">
                            <Share2 className="w-4 h-4" />
                            Share
                        </button>
                        <button className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 shadow-lg shadow-slate-900/10 font-medium transition-all">
                            <Download className="w-4 h-4" />
                            Export PDF
                        </button>
                    </div>
                </div>

                {/* MAIN REPORT CARD */}
                <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-200 overflow-hidden animate-slide-up">

                    {/* REPORT HEADER */}
                    <div className="p-8 border-b border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <h1 className="text-3xl font-bold text-slate-900">Evaluation Report</h1>
                                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border ${getVerdictColor(data.verdict)}`}>
                                    {data.verdict}
                                </span>
                            </div>
                            <p className="text-slate-500">Interview Session • {new Date().toLocaleDateString()}</p>
                        </div>

                        <div className="flex items-center gap-6">
                            <div className="text-right">
                                <p className="text-sm font-medium text-slate-500 uppercase tracking-widest">Global Score</p>
                                <p className={`text-5xl font-bold ${getScoreColor(data.score)}`}>{data.score}/100</p>
                            </div>
                            <div className="w-20 h-20">
                                <svg className="transform -rotate-90 w-full h-full">
                                    <circle cx="40" cy="40" r="36" stroke="#f1f5f9" strokeWidth="8" fill="transparent" />
                                    <circle
                                        cx="40" cy="40" r="36"
                                        stroke={data.score >= 80 ? "#10b981" : "#3b82f6"}
                                        strokeWidth="8"
                                        fill="transparent"
                                        strokeDasharray={`${(data.score / 100) * 226} 226`}
                                        className="transition-all duration-1000 ease-out"
                                    />
                                </svg>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-100">

                        {/* LEFT COLUMN: SUMMARY & STRENGTHS */}
                        <div className="col-span-2 p-8 space-y-8">
                            <section>
                                <h3 className="text-lg font-bold text-slate-900 mb-3 flex items-center gap-2">
                                    <Cpu className="w-5 h-5 text-indigo-600" />
                                    AI Executive Summary
                                </h3>
                                <div className="bg-slate-50 p-6 rounded-xl border border-slate-100 text-slate-600 leading-relaxed text-lg">
                                    "{data.summary}"
                                </div>
                            </section>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <section>
                                    <h3 className="text-sm font-bold text-emerald-600 uppercase tracking-wide mb-4 flex items-center gap-2">
                                        <CheckCircle className="w-4 h-4" /> Key Strengths
                                    </h3>
                                    <ul className="space-y-3">
                                        {data.strengths.map((str, idx) => (
                                            <li key={idx} className="flex items-start gap-3 bg-white p-3 rounded-lg border border-slate-100 shadow-sm">
                                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2"></div>
                                                <span className="text-slate-700">{str}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </section>

                                <section>
                                    <h3 className="text-sm font-bold text-amber-600 uppercase tracking-wide mb-4 flex items-center gap-2">
                                        <AlertCircle className="w-4 h-4" /> Areas for Growth
                                    </h3>
                                    <ul className="space-y-3">
                                        {data.weaknesses.map((weak, idx) => (
                                            <li key={idx} className="flex items-start gap-3 bg-white p-3 rounded-lg border border-slate-100 shadow-sm">
                                                <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-2"></div>
                                                <span className="text-slate-700">{weak}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </section>
                            </div>
                        </div>

                        {/* RIGHT COLUMN: SKILL METRICS */}
                        <div className="p-8 bg-slate-50/50">
                            <h3 className="text-lg font-bold text-slate-900 mb-6">Competency Breakdown</h3>
                            <div className="space-y-6">
                                {data.skills.map((skill, index) => (
                                    <div key={index}>
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-sm font-medium text-slate-700">{skill.name}</span>
                                            <span className="text-sm font-bold text-slate-900">{skill.score}%</span>
                                        </div>
                                        <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full rounded-full ${index % 2 === 0 ? 'bg-indigo-500' : 'bg-blue-500'}`}
                                                style={{ width: `${skill.score}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-10 p-6 bg-indigo-900 rounded-xl text-white relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500 rounded-full blur-3xl opacity-20 -mr-10 -mt-10"></div>
                                <h4 className="font-bold mb-2 relative z-10">Upskill Recommendation</h4>
                                <p className="text-indigo-200 text-sm mb-4 relative z-10">
                                    Based on your results, we recommend focusing on system design patterns to improve your technical depth.
                                </p>
                                <button className="text-xs font-bold uppercase tracking-wider text-white border border-white/20 px-4 py-2 rounded-lg hover:bg-white/10 transition-colors relative z-10">
                                    View Resources
                                </button>
                            </div>
                        </div>

                    </div>

                </div>
            </div>
        </div>
    );
};

// Icon placeholder for MessageCircle if not imported from lucide-react (it was missing in import)
const MessageCircle = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m3 21 1.9-5.7a8.5 8.5 0 1 1 3.8 3.8z" /></svg>
);

export default InterviewReport;
