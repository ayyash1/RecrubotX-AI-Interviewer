import React from 'react';
import {
    LayoutDashboard,
    Video,
    BookOpen,
    User,
    Bell,
    Search,
    ChevronRight,
    Play,
    Clock,
    BarChart,
    CheckCircle
} from 'lucide-react';

const CandidateDashboard = ({ candidateName, onStartInterview }) => {
    return (
        <div className="flex min-h-screen bg-slate-50 text-slate-900 font-sans">

            {/* SIDEBAR */}
            <aside className="w-72 bg-white border-r border-slate-200 fixed h-full z-10 hidden md:flex flex-col">
                <div className="p-8 pb-4">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">
                            R
                        </div>
                        <h1 className="text-xl font-bold tracking-tight text-slate-900">RecruBotX</h1>
                    </div>

                    <nav className="space-y-1">
                        <NavItem icon={LayoutDashboard} label="Dashboard" active />
                        <NavItem icon={Video} label="Interviews" badge="1" />
                        <NavItem icon={BookOpen} label="Practice" />
                        <NavItem icon={BarChart} label="Analytics" />
                    </nav>
                </div>

                <div className="mt-auto p-8 pt-0">
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                        <h4 className="font-semibold text-sm mb-1">Upload Resume</h4>
                        <p className="text-xs text-slate-500 mb-3">AI will personalize questions.</p>
                        <button className="text-xs font-medium text-indigo-600 hover:text-indigo-700">Upload PDF &rarr;</button>
                    </div>
                    <div className="mt-6 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold">
                            {candidateName ? candidateName.charAt(0) : 'A'}
                        </div>
                        <div>
                            <p className="text-sm font-medium text-slate-900">{candidateName}</p>
                            <p className="text-xs text-slate-500">Candidate</p>
                        </div>
                    </div>
                </div>
            </aside>

            {/* MAIN CONTENT */}
            <main className="flex-1 md:ml-72">

                {/* TOP BAR */}
                <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-20 px-8 flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-slate-700">Overview</h2>

                    <div className="flex items-center gap-6">
                        <div className="relative hidden sm:block">
                            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                            <input
                                className="pl-9 pr-4 py-2 bg-slate-100 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 w-64 transition-all"
                                placeholder="Search interviews, skills..."
                            />
                        </div>
                        <button className="relative text-slate-500 hover:text-slate-700 transition-colors">
                            <Bell className="w-5 h-5" />
                            <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                        </button>
                    </div>
                </header>

                <div className="p-8 max-w-6xl mx-auto space-y-8 animate-fade-in">

                    {/* WELCOME SECTION */}
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-bold text-slate-900 mb-2">Welcome back, {candidateName}</h1>
                            <p className="text-slate-500">You have an upcoming interview scheduled for today.</p>
                        </div>
                        <button
                            onClick={onStartInterview}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-medium shadow-lg shadow-indigo-600/20 flex items-center gap-2 transition-all hover:scale-105 active:scale-95"
                        >
                            <Play className="w-4 h-4 fill-current" />
                            Start Interview
                        </button>
                    </div>

                    {/* STAT CARDS */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <StatCard
                            title="Upcoming Interview"
                            value="Python Developer"
                            subtext="Starts in 10 mins"
                            icon={Clock}
                            color="text-indigo-600"
                            bgColor="bg-indigo-50"
                        />
                        <StatCard
                            title="AI Readiness Score"
                            value="85%"
                            subtext="Top 10% of candidates"
                            icon={BarChart}
                            color="text-emerald-600"
                            bgColor="bg-emerald-50"
                        />
                        <StatCard
                            title="Practice Sessions"
                            value="4 Completed"
                            subtext="Last session: Yesterday"
                            icon={CheckCircle}
                            color="text-blue-600"
                            bgColor="bg-blue-50"
                        />
                    </div>

                    {/* RECENT ACTIVITY / PREPARATION */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                        {/* Left Column (Activity) */}
                        <div className="lg:col-span-2 space-y-6">
                            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="font-bold text-lg text-slate-800">Recommended Preparation</h3>
                                    <button className="text-sm text-indigo-600 font-medium hover:text-indigo-700">View All</button>
                                </div>

                                <div className="space-y-4">
                                    <PrepItem
                                        title="Behavioral Questions"
                                        desc="Practice STAR method responses"
                                        progress={80}
                                    />
                                    <PrepItem
                                        title="System Design Basics"
                                        desc="Review scalability concepts"
                                        progress={45}
                                    />
                                    <PrepItem
                                        title="Company Research"
                                        desc="RecruBotX mission and values"
                                        progress={100}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Right Column (Tips) */}
                        <div className="bg-gradient-to-br from-indigo-900 to-slate-900 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500 rounded-full blur-3xl opacity-20 -mr-10 -mt-10"></div>

                            <h3 className="font-bold text-lg mb-4 relative z-10">Pro Tip</h3>
                            <p className="text-indigo-100 mb-6 relative z-10 leading-relaxed">
                                "Speak clearly and structure your answers. Our AI interviewer looks for confidence and concise explanations."
                            </p>
                            <button className="w-full bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/10 text-white py-2 rounded-lg text-sm font-medium transition-colors relative z-10">
                                Read Interview Guide
                            </button>
                        </div>

                    </div>

                </div>
            </main>
        </div>
    );
};

// Sub-components
const NavItem = ({ icon: Icon, label, active, badge }) => (
    <button className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${active ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}>
        <div className="flex items-center gap-3">
            <Icon className={`w-5 h-5 ${active ? 'text-indigo-600' : 'text-slate-400'}`} />
            <span>{label}</span>
        </div>
        {badge && (
            <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{badge}</span>
        )}
    </button>
);

const StatCard = ({ title, value, subtext, icon: Icon, color, bgColor }) => (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow group">
        <div className="flex justify-between items-start mb-4">
            <div className={`w-10 h-10 rounded-xl ${bgColor} ${color} flex items-center justify-center`}>
                <Icon className="w-5 h-5" />
            </div>
            <span className="text-slate-300 group-hover:text-indigo-400 transition-colors">
                <ChevronRight className="w-5 h-5" />
            </span>
        </div>
        <h3 className="text-slate-500 text-sm font-medium mb-1">{title}</h3>
        <p className="text-2xl font-bold text-slate-900 mb-1">{value}</p>
        <p className="text-xs text-slate-400">{subtext}</p>
    </div>
);

const PrepItem = ({ title, desc, progress }) => (
    <div className="flex items-center gap-4 p-3 hover:bg-slate-50 rounded-xl transition-colors cursor-pointer border border-transparent hover:border-slate-100">
        <div className="w-10 h-10 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-sm">
            {progress === 100 ? <CheckCircle className="w-5 h-5" /> : `${progress}%`}
        </div>
        <div className="flex-1">
            <h4 className="text-sm font-semibold text-slate-900">{title}</h4>
            <p className="text-xs text-slate-500">{desc}</p>
        </div>
        <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${progress}%` }}></div>
        </div>
    </div>
);

export default CandidateDashboard;
