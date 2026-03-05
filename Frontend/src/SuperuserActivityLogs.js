import React, { useState, useEffect } from "react";
import { useNavigate, NavLink } from "react-router-dom";
import { motion } from "framer-motion";
import {
    ShieldCheck, LayoutDashboard, Activity, Users, Briefcase,
    LogOut, Search, Download, ChevronLeft, ChevronRight, Calendar
} from "lucide-react";
import API_BASE_URL from "./apiConfig";

const ACTION_TYPES = [
    "user_login", "user_register", "superuser_login", "superuser_create",
    "cv_upload", "cv_screen", "cv_screen_batch", "jd_upload", "resume_analyze", "profile_edit",
];

const getActionColor = (type) => ({
    user_login: "#22c55e", user_register: "#3b82f6", superuser_login: "#0a2a5e",
    superuser_create: "#7c3aed", cv_upload: "#f59e0b", cv_screen: "#ec4899",
    cv_screen_batch: "#ec4899", jd_upload: "#06b6d4", resume_analyze: "#8b5cf6", profile_edit: "#14b8a6",
}[type] || "#6b7280");

const getActionLabel = (type) => ({
    user_login: "User Login", user_register: "Registration", superuser_login: "Admin Login",
    superuser_create: "Admin Created", cv_upload: "CV Upload", cv_screen: "CV Screening",
    cv_screen_batch: "Batch Screening", jd_upload: "JD Upload", resume_analyze: "Resume Analysis", profile_edit: "Profile Edit",
}[type] || type);

const SidebarLink = ({ to, icon: Icon, label }) => (
    <NavLink to={to}
        className={({ isActive }) => `font-medium px-4 py-2.5 rounded-xl transition-all flex items-center gap-2.5 text-sm ${isActive ? "bg-[#0a2a5e]/10 text-[#0a2a5e]" : "text-gray-600 hover:bg-[#0a2a5e]/5 hover:text-[#0a2a5e]"}`}>
        <Icon className="w-[18px] h-[18px]" />{label}
    </NavLink>
);

const SuperuserActivityLogs = () => {
    const navigate = useNavigate();
    const token = localStorage.getItem("superuserToken");
    const user = JSON.parse(localStorage.getItem("superuserUser") || "null");
    const [logs, setLogs] = useState([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [actionFilter, setActionFilter] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const limit = 30;

    const fetchLogs = async () => {
        if (!token) return;
        setIsLoading(true);
        try {
            const params = new URLSearchParams({ page: String(page), limit: String(limit) });
            if (searchQuery) params.append("search", searchQuery);
            if (actionFilter) params.append("action_type", actionFilter);
            if (startDate) params.append("start_date", new Date(startDate).toISOString());
            if (endDate) params.append("end_date", new Date(endDate).toISOString());
            const res = await fetch(`${API_BASE_URL}/superuser/activity-logs?${params}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) {
                const d = await res.json();
                setLogs(d.logs || []); setTotal(d.total || 0); setTotalPages(d.total_pages || 1);
            }
        } catch (err) { console.error(err); }
        setIsLoading(false);
    };

    useEffect(() => { fetchLogs(); }, [page, actionFilter, startDate, endDate]);

    const handleSearch = (e) => { e.preventDefault(); setPage(1); fetchLogs(); };

    const handleExport = async (format) => {
        const params = new URLSearchParams({ format });
        if (searchQuery) params.append("search", searchQuery);
        if (actionFilter) params.append("action_type", actionFilter);
        if (startDate) params.append("start_date", new Date(startDate).toISOString());
        if (endDate) params.append("end_date", new Date(endDate).toISOString());
        try {
            const res = await fetch(`${API_BASE_URL}/superuser/activity-logs/export?${params}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) {
                const blob = await res.blob();
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a"); a.href = url; a.download = `activity_logs.${format}`; a.click();
                URL.revokeObjectURL(url);
            }
        } catch (err) { console.error(err); }
    };

    const handleLogout = () => {
        localStorage.removeItem("superuserToken");
        localStorage.removeItem("superuserUser");
        navigate("/superuser/signin");
    };

    return (
        <div className="h-screen w-screen flex bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden fixed inset-0">
            {/* Sidebar */}
            <aside className="w-72 h-screen bg-white shadow-xl flex flex-col p-6 border-r border-gray-200 flex-shrink-0">
                <div className="mb-8 text-center flex-shrink-0">
                    <h1 className="text-3xl font-bold text-[#0a2a5e]">RecruBotX</h1>
                    <span className="inline-flex items-center gap-1.5 mt-2 text-xs font-medium text-[#0a2a5e]/70 bg-[#0a2a5e]/5 px-3 py-1 rounded-full">
                        <ShieldCheck className="w-3.5 h-3.5" /> Admin Panel
                    </span>
                </div>
                <nav className="flex flex-col space-y-1 text-gray-700 flex-shrink-0">
                    <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider px-4 mb-1">Overview</p>
                    <SidebarLink to="/superuser/dashboard" icon={LayoutDashboard} label="Dashboard" />
                    <SidebarLink to="/superuser/activity-logs" icon={Activity} label="Activity Logs" />
                    <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider px-4 mt-5 mb-1">Monitoring</p>
                    <SidebarLink to="/superuser/candidates" icon={Users} label="Candidates" />
                    <SidebarLink to="/superuser/recruiters" icon={Briefcase} label="Recruiters" />
                    <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider px-4 mt-5 mb-1">Administration</p>
                    <SidebarLink to="/superuser/admins" icon={ShieldCheck} label="Admin Accounts" />
                </nav>
                <button onClick={handleLogout}
                    className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-red-500 to-red-600 px-4 py-3 rounded-xl text-white hover:from-red-600 hover:to-red-700 transition-all shadow-md text-sm font-medium mt-auto">
                    <LogOut className="w-4 h-4" /> Logout
                </button>
            </aside>

            {/* Main Content */}
            <main className="flex-1 h-screen flex flex-col overflow-hidden p-6">
                <div className="flex items-center justify-between mb-5 flex-shrink-0">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">Activity Logs</h2>
                        <p className="text-gray-500 text-sm mt-1">{total} total logs • Page {page} of {totalPages}</p>
                    </div>
                    <div className="flex gap-2">
                        <button onClick={() => handleExport("csv")}
                            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium text-green-700 bg-green-50 border border-green-200 hover:bg-green-100 transition-all">
                            <Download className="w-4 h-4" /> CSV
                        </button>
                        <button onClick={() => handleExport("json")}
                            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium text-blue-700 bg-blue-50 border border-blue-200 hover:bg-blue-100 transition-all">
                            <Download className="w-4 h-4" /> JSON
                        </button>
                    </div>
                </div>

                {/* Filters */}
                <div className="flex items-center gap-3 mb-4 flex-shrink-0 flex-wrap">
                    <form onSubmit={handleSearch} className="relative flex-1 min-w-[200px] max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search by email or action..."
                            className="w-full rounded-xl pl-10 pr-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 bg-white border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#0a2a5e]/30 focus:border-[#0a2a5e]/30" />
                    </form>
                    <select value={actionFilter} onChange={(e) => { setActionFilter(e.target.value); setPage(1); }}
                        className="rounded-xl px-3 py-2.5 text-sm text-gray-700 bg-white border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#0a2a5e]/30 cursor-pointer">
                        <option value="">All Actions</option>
                        {ACTION_TYPES.map((t) => <option key={t} value={t}>{getActionLabel(t)}</option>)}
                    </select>
                    <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <input type="date" value={startDate} onChange={(e) => { setStartDate(e.target.value); setPage(1); }}
                            className="rounded-xl px-3 py-2 text-sm text-gray-700 bg-white border border-gray-200 focus:outline-none" />
                        <span className="text-gray-400 text-xs">to</span>
                        <input type="date" value={endDate} onChange={(e) => { setEndDate(e.target.value); setPage(1); }}
                            className="rounded-xl px-3 py-2 text-sm text-gray-700 bg-white border border-gray-200 focus:outline-none" />
                    </div>
                </div>

                {/* Table */}
                <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
                    <div className="flex-1 overflow-y-auto">
                        <table className="w-full text-sm">
                            <thead className="sticky top-0 bg-gray-50 z-10">
                                <tr className="text-left text-xs text-gray-500 border-b border-gray-100">
                                    <th className="py-3 px-4 font-medium">Timestamp</th>
                                    <th className="py-3 px-4 font-medium">User Email</th>
                                    <th className="py-3 px-4 font-medium">Role</th>
                                    <th className="py-3 px-4 font-medium">Action</th>
                                    <th className="py-3 px-4 font-medium">Details</th>
                                    <th className="py-3 px-4 font-medium">IP</th>
                                </tr>
                            </thead>
                            <tbody>
                                {isLoading ? (
                                    <tr><td colSpan="6" className="py-12 text-center text-gray-400">
                                        <div className="w-6 h-6 border-2 border-[#0a2a5e] border-t-transparent rounded-full animate-spin mx-auto mb-2" />Loading...
                                    </td></tr>
                                ) : logs.length === 0 ? (
                                    <tr><td colSpan="6" className="py-12 text-center text-gray-400">No logs found</td></tr>
                                ) : (
                                    logs.map((log, i) => (
                                        <motion.tr key={log._id || i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.015 }}
                                            className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                                            <td className="py-2.5 px-4 text-xs text-gray-500 whitespace-nowrap">{new Date(log.timestamp).toLocaleString()}</td>
                                            <td className="py-2.5 px-4 text-gray-700 truncate max-w-[180px] text-xs">{log.user_email}</td>
                                            <td className="py-2.5 px-4 text-xs text-gray-400 capitalize">{log.user_role}</td>
                                            <td className="py-2.5 px-4">
                                                <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                                                    style={{ background: `${getActionColor(log.action_type)}12`, color: getActionColor(log.action_type) }}>
                                                    {getActionLabel(log.action_type)}
                                                </span>
                                            </td>
                                            <td className="py-2.5 px-4 text-xs text-gray-400 truncate max-w-[200px]">{JSON.stringify(log.action_detail || {})}</td>
                                            <td className="py-2.5 px-4 text-xs text-gray-400">{log.ip_address || "—"}</td>
                                        </motion.tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 flex-shrink-0 bg-gray-50">
                        <p className="text-xs text-gray-500">Showing {Math.min((page - 1) * limit + 1, total)}–{Math.min(page * limit, total)} of {total}</p>
                        <div className="flex items-center gap-2">
                            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1}
                                className="p-2 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100 disabled:opacity-30 transition-colors">
                                <ChevronLeft className="w-4 h-4" />
                            </button>
                            <span className="text-xs text-gray-500 px-3">Page {page}</span>
                            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page >= totalPages}
                                className="p-2 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100 disabled:opacity-30 transition-colors">
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default SuperuserActivityLogs;
