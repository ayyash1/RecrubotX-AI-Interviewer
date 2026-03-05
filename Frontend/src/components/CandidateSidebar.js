import React, { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
    LayoutDashboard,
    Briefcase,
    FileText,
    Search,
    Cog,
    LogOut,
} from "lucide-react";
import { logoutUser, getCurrentUser } from "../utils/userDatabase";

const TOUR_KEY = "candidate_tour_done";

const CandidateSidebar = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);

    useEffect(() => {
        setUser(getCurrentUser());
        const syncUser = () => setUser(getCurrentUser());
        window.addEventListener("storage", syncUser);
        return () => window.removeEventListener("storage", syncUser);
    }, []);

    // Fire first-login tour once
    useEffect(() => {
        if (!localStorage.getItem(TOUR_KEY)) {
            // Small delay so the dashboard has time to mount
            const t = setTimeout(() => {
                window.dispatchEvent(new CustomEvent("rbx:start-tour"));
            }, 400);
            return () => clearTimeout(t);
        }
    }, []);

    const handleLogout = () => {
        logoutUser();
        navigate("/candidate/signin");
    };

    const navItemClass = ({ isActive }) =>
        `font-medium px-4 py-3 rounded-xl transition-all flex items-center gap-2 ${isActive
            ? "bg-[#0a2a5e]/10 text-[#0a2a5e]"
            : "text-gray-700 hover:bg-gray-100 hover:text-[#0a2a5e]"
        }`;

    return (
        <aside className="w-72 h-screen bg-white shadow-xl flex flex-col p-6 border-r border-gray-200 flex-shrink-0 z-20">
            {/* Logo */}
            <div className="mb-8 text-center flex-shrink-0">
                <h1 className="text-3xl font-bold text-[#0a2a5e]">RecruBotX</h1>
            </div>

            <nav className="flex flex-col space-y-4 text-gray-700 flex-shrink-0">
                <NavLink data-tour="c-dashboard" to="/candidate/dashboard" className={navItemClass}>
                    <LayoutDashboard className="w-5 h-5" /> Dashboard
                </NavLink>

                <NavLink data-tour="c-jobs" to="/candidate/jobs" className={navItemClass}>
                    <Briefcase className="w-5 h-5" /> Job Vacancies
                </NavLink>

                <NavLink data-tour="c-resume" to="/candidate/resume/choose-template" className={navItemClass}>
                    <FileText className="w-5 h-5" /> Create Resume
                </NavLink>

                <NavLink data-tour="c-cv-review" to="/candidate/analyze-resume" className={navItemClass}>
                    <Search className="w-5 h-5" /> Resume Analyzer
                </NavLink>

                <NavLink data-tour="c-settings" to="/candidate/settings" className={navItemClass}>
                    <Cog className="w-5 h-5" /> Settings
                </NavLink>
            </nav>

            {/* Bottom Section */}
            <div className="mt-auto flex-shrink-0 space-y-2">
                {user && (
                    <div className="flex items-center gap-3 bg-gray-100 rounded-xl px-3 py-2.5">
                        <div className="w-10 h-10 bg-[#0a2a5e] rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0 overflow-hidden">
                            {user.profileImage ? (
                                <img src={user.profileImage} alt="Profile" className="w-full h-full object-cover" />
                            ) : (
                                <>{user.firstName?.charAt(0)}{user.lastName?.charAt(0)}</>
                            )}
                        </div>
                        <div className="min-w-0">
                            <p className="font-bold text-[#0a2a5e] text-sm truncate">{user.firstName} {user.lastName}</p>
                            <p className="text-xs text-gray-500 truncate">{user.email}</p>
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

export default CandidateSidebar;
