import React, { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
    LayoutDashboard,
    PlusCircle,
    Search,
    Settings,
    LogOut,
} from "lucide-react";

const TOUR_KEY = "recruiter_tour_done";

const RecruiterSidebar = () => {
    const navigate = useNavigate();
    const [recruiterData, setRecruiterData] = useState(null);

    useEffect(() => {
        const storedUser = localStorage.getItem("recruiterUser");
        if (storedUser) setRecruiterData(JSON.parse(storedUser));

        // Fire first-login tour
        if (!localStorage.getItem(TOUR_KEY)) {
            const t = setTimeout(() => {
                window.dispatchEvent(new CustomEvent("rbx:start-tour"));
            }, 400);
            return () => clearTimeout(t);
        }
    }, []);

    useEffect(() => {
        const handleStorageChange = () => {
            const storedUser = localStorage.getItem("recruiterUser");
            if (storedUser) setRecruiterData(JSON.parse(storedUser));
        };
        window.addEventListener("storage", handleStorageChange);
        return () => window.removeEventListener("storage", handleStorageChange);
    }, []);

    const handleLogout = () => {
        localStorage.removeItem("recruiterUser");
        navigate("/recruiter/signin");
    };

    const navItemClass = ({ isActive }) =>
        `font-medium px-4 py-3 rounded-xl transition-all flex items-center gap-2 ${
            isActive
                ? "bg-[#0a2a5e]/10 text-[#0a2a5e]"
                : "text-gray-700 hover:bg-[#0a2a5e]/5 hover:text-[#0a2a5e]"
        }`;

    return (
        <aside className="w-72 h-screen bg-white shadow-xl flex flex-col p-6 border-r border-gray-200 flex-shrink-0 z-20">
            <div className="mb-8 text-center flex-shrink-0">
                <h1 className="text-3xl font-bold text-[#0a2a5e]">RecruBotX</h1>
            </div>

            <nav className="flex flex-col space-y-4 text-gray-700 flex-shrink-0">
                <NavLink data-tour="r-dashboard" to="/recruiter/dashboard" className={navItemClass}>
                    <LayoutDashboard className="w-5 h-5" /> Dashboard
                </NavLink>

                <NavLink data-tour="r-job-posting" to="/recruiter/job-posting" className={navItemClass}>
                    <PlusCircle className="w-5 h-5" /> Job Posting
                </NavLink>

                <NavLink data-tour="r-cv-review" to="/recruiter/cv-screening" className={navItemClass}>
                    <Search className="w-5 h-5" /> Resume Analyzer
                </NavLink>

                <NavLink data-tour="r-settings" to="/recruiter/settings" className={navItemClass}>
                    <Settings className="w-5 h-5" /> Settings
                </NavLink>
            </nav>

            <div className="mt-auto flex-shrink-0 space-y-2">
                {recruiterData && (
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
                )}

                <button
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-red-500 to-red-600 px-4 py-3 rounded-xl text-white hover:from-red-600 hover:to-red-700 transition-all shadow-md"
                >
                    <LogOut className="w-5 h-5" /> Logout
                </button>
            </div>
        </aside>
    );
};

export default RecruiterSidebar;
