import React, { useState, useEffect } from "react";
import { useNavigate, NavLink } from "react-router-dom";
import { motion } from "framer-motion";
import {
    ShieldCheck, LayoutDashboard, Activity, Users, Briefcase, LogOut,
    Search, User, Clock, BarChart3, ChevronRight, DollarSign, Cpu, Trash2, AlertTriangle
} from "lucide-react";
import API_BASE_URL from "./apiConfig";

const SidebarLink = ({ to, icon: Icon, label }) => (
    <NavLink to={to}
        className={({ isActive }) => `font-medium px-4 py-2.5 rounded-xl transition-all flex items-center gap-2.5 text-sm ${isActive ? "bg-[#0a2a5e]/10 text-[#0a2a5e]" : "text-gray-600 hover:bg-[#0a2a5e]/5 hover:text-[#0a2a5e]"}`}>
        <Icon className="w-[18px] h-[18px]" />{label}
    </NavLink>
);

const ACTION_COLOR = (t) => ({
    user_login: "#22c55e", user_register: "#3b82f6", cv_upload: "#f59e0b",
    cv_screen: "#ec4899", resume_analyze: "#8b5cf6",
}[t] || "#6b7280");

const ACTION_LABEL = (t) => ({
    user_login: "Login", user_register: "Register", cv_upload: "CV Upload",
    cv_screen: "Screening", resume_analyze: "Analysis",
}[t] || t);

/**
 * Reusable Monitoring page for Candidates or Recruiters.
 * `endpoint` = "candidates" | "recruiters"
 * `title` = display name
 */
const SuperuserUsers = ({ endpoint = "candidates", title = "Candidates", roleLabel = "candidate" }) => {
    const navigate = useNavigate();
    const token = localStorage.getItem("superuserToken");
    const [users, setUsers] = useState([]);
    const [filtered, setFiltered] = useState([]);
    const [search, setSearch] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [selected, setSelected] = useState(null);
    const [userLogs, setUserLogs] = useState([]);
    const [loadingLogs, setLoadingLogs] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        if (!token) return;
        setIsLoading(true);
        setSelected(null);
        setUserLogs([]);
        (async () => {
            try {
                const res = await window.fetch(`${API_BASE_URL}/superuser/${endpoint}`, { headers: { Authorization: `Bearer ${token}` } });
                if (res.ok) { const d = await res.json(); setUsers(d.users || []); setFiltered(d.users || []); }
            } catch { }
            setIsLoading(false);
        })();
    }, [token, endpoint]);

    useEffect(() => {
        if (!search.trim()) { setFiltered(users); return; }
        const q = search.toLowerCase();
        setFiltered(users.filter(u => u.email?.toLowerCase().includes(q) || `${u.firstName} ${u.lastName}`.toLowerCase().includes(q)));
    }, [search, users]);

    const fetchUserActivity = async (userId) => {
        setLoadingLogs(true);
        try {
            const res = await window.fetch(`${API_BASE_URL}/superuser/users/${userId}/activity?limit=100`, { headers: { Authorization: `Bearer ${token}` } });
            if (res.ok) { const d = await res.json(); setUserLogs(d.logs || []); }
        } catch { }
        setLoadingLogs(false);
    };

    const handleSelect = (u) => { setSelected(u); fetchUserActivity(u.id); };

    const handleDelete = async (u) => {
        setIsDeleting(true);
        try {
            const res = await window.fetch(`${API_BASE_URL}/superuser/${endpoint}/${u.id}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) {
                setUsers(prev => prev.filter(x => x.id !== u.id));
                setFiltered(prev => prev.filter(x => x.id !== u.id));
                if (selected?.id === u.id) { setSelected(null); setUserLogs([]); }
            }
        } catch { }
        setIsDeleting(false);
        setDeleteTarget(null);
    };

    const handleLogout = () => { localStorage.removeItem("superuserToken"); localStorage.removeItem("superuserUser"); navigate("/superuser/signin"); };

    const costBadgeColor = (cost) => cost > 0.01 ? "#b45309" : cost > 0.001 ? "#2563eb" : "#6b7280";

    return (
        <div className="h-screen w-screen flex bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden fixed inset-0">
            <aside className="w-72 h-screen bg-white shadow-xl flex flex-col p-6 border-r border-gray-200 flex-shrink-0">
                <div className="mb-8 text-center"><h1 className="text-3xl font-bold text-[#0a2a5e]">RecruBotX</h1>
                    <span className="inline-flex items-center gap-1.5 mt-2 text-xs font-medium text-[#0a2a5e]/70 bg-[#0a2a5e]/5 px-3 py-1 rounded-full"><ShieldCheck className="w-3.5 h-3.5" /> Admin Panel</span>
                </div>
                <nav className="flex flex-col space-y-1">
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

            <main className="flex-1 h-screen flex overflow-hidden p-6">
                {/* User List */}
                <div className={`flex flex-col overflow-hidden transition-all duration-300 ${selected ? "w-1/2 mr-4" : "w-full"}`}>
                    <div className="flex items-center justify-between mb-4 flex-shrink-0">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
                            <p className="text-gray-500 text-sm mt-1">{users.length} {title.toLowerCase()} — sorted by API cost (highest first)</p>
                        </div>
                    </div>

                    <div className="relative mb-3 flex-shrink-0">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input value={search} onChange={(e) => setSearch(e.target.value)}
                            placeholder={`Search ${title.toLowerCase()}…`}
                            className="w-full rounded-xl pl-10 pr-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 bg-white border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#0a2a5e]/20 shadow-sm" />
                    </div>

                    {/* Header hint */}
                    <div className="flex items-center gap-2 px-4 py-1.5 mb-2 flex-shrink-0">
                        <DollarSign className="w-3.5 h-3.5 text-gray-400" />
                        <span className="text-[11px] text-gray-400">Cost ↓ · Click a user to see full activity history</span>
                    </div>

                    <div className="flex-1 overflow-y-auto space-y-2 pr-1">
                        {isLoading ? (
                            <div className="flex items-center justify-center h-32"><div className="w-6 h-6 border-2 border-[#0a2a5e] border-t-transparent rounded-full animate-spin" /></div>
                        ) : filtered.length === 0 ? (
                            <div className="text-center text-gray-400 py-12"><Users className="w-10 h-10 mx-auto mb-2 opacity-30" /><p className="text-sm">No {title.toLowerCase()} found</p></div>
                        ) : filtered.map((u, i) => (
                            <motion.div key={u.id}
                                initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.015 }}
                                onClick={() => handleSelect(u)}
                                className={`flex items-center gap-3 p-3.5 rounded-xl bg-white border shadow-sm cursor-pointer transition-all ${selected?.id === u.id ? "ring-2 ring-[#0a2a5e]/30 border-[#0a2a5e]/20" : "border-gray-100 hover:shadow-md"}`}>
                                {/* Rank badge */}
                                <span className="text-xs font-bold text-gray-300 w-5 text-center flex-shrink-0">{i + 1}</span>
                                <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold text-white"
                                    style={{ background: roleLabel === "candidate" ? "#0a2a5e" : "#143d7a" }}>
                                    {u.firstName?.charAt(0)}{u.lastName?.charAt(0)}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-gray-900 text-sm font-semibold truncate">{u.firstName} {u.lastName}</p>
                                    <p className="text-gray-400 text-xs truncate">{u.email}</p>
                                </div>
                                <div className="text-right flex-shrink-0 space-y-1">
                                    <div className="flex items-center gap-1 justify-end">
                                        <DollarSign className="w-3 h-3" style={{ color: costBadgeColor(u.totalCostUsd) }} />
                                        <span className="text-xs font-bold" style={{ color: costBadgeColor(u.totalCostUsd) }}>
                                            ${(u.totalCostUsd || 0).toFixed(5)}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-1 justify-end text-gray-400">
                                        <BarChart3 className="w-3 h-3" />
                                        <span className="text-[10px]">{u.activityCount} actions</span>
                                    </div>
                                    {u.totalTokens > 0 && (
                                        <div className="flex items-center gap-1 justify-end text-gray-400">
                                            <Cpu className="w-3 h-3" />
                                            <span className="text-[10px]">{u.totalTokens.toLocaleString()} tokens</span>
                                        </div>
                                    )}
                                </div>
                                <ChevronRight className="w-4 h-4 text-gray-300 flex-shrink-0" />
                                {/* Delete button — stops propagation so it doesn't open activity panel */}
                                <button
                                    onClick={(e) => { e.stopPropagation(); setDeleteTarget(u); }}
                                    className="flex-shrink-0 p-1.5 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 transition-all"
                                    title={`Delete ${roleLabel}`}>
                                    <Trash2 className="w-3.5 h-3.5" />
                                </button>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* Activity Detail Panel */}
                {selected && (
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                        className="w-1/2 bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col overflow-hidden">
                        <div className="p-5 border-b border-gray-100 flex-shrink-0">
                            <div className="flex items-center gap-3">
                                <div className="w-14 h-14 rounded-xl flex items-center justify-center text-lg font-bold text-white flex-shrink-0"
                                    style={{ background: "linear-gradient(135deg, #0a2a5e, #143d7a)" }}>
                                    {selected.firstName?.charAt(0)}{selected.lastName?.charAt(0)}
                                </div>
                                <div className="min-w-0">
                                    <h3 className="text-lg font-bold text-gray-900 truncate">{selected.firstName} {selected.lastName}</h3>
                                    <p className="text-sm text-gray-500 truncate">{selected.email}</p>
                                    <div className="flex items-center gap-3 mt-1 flex-wrap">
                                        <span className="text-xs text-gray-400 capitalize flex items-center gap-1"><User className="w-3 h-3" />{selected.role}</span>
                                        <span className="text-xs text-gray-400 flex items-center gap-1"><Clock className="w-3 h-3" />Joined {selected.createdAt ? new Date(selected.createdAt).toLocaleDateString() : "—"}</span>
                                    </div>
                                </div>
                                <button onClick={() => { setSelected(null); setUserLogs([]); }} className="ml-auto text-gray-400 hover:text-gray-600 text-xl leading-none p-1 flex-shrink-0">✕</button>
                            </div>

                            {/* Stats row */}
                            <div className="grid grid-cols-4 gap-2 mt-4">
                                <div className="bg-[#0a2a5e]/5 rounded-lg p-2.5 text-center">
                                    <p className="text-lg font-bold text-[#0a2a5e]">{selected.activityCount}</p>
                                    <p className="text-[10px] text-gray-400">Actions</p>
                                </div>
                                <div className="bg-amber-50 rounded-lg p-2.5 text-center">
                                    <p className="text-sm font-bold text-amber-700">${(selected.totalCostUsd || 0).toFixed(5)}</p>
                                    <p className="text-[10px] text-gray-400">API Cost</p>
                                </div>
                                <div className="bg-blue-50 rounded-lg p-2.5 text-center">
                                    <p className="text-sm font-bold text-blue-700">{(selected.totalTokens || 0).toLocaleString()}</p>
                                    <p className="text-[10px] text-gray-400">Tokens</p>
                                </div>
                                <div className={`rounded-lg p-2.5 text-center ${selected.isActive ? "bg-green-50" : "bg-red-50"}`}>
                                    <p className={`text-sm font-bold ${selected.isActive ? "text-green-600" : "text-red-600"}`}>{selected.isActive ? "Active" : "Inactive"}</p>
                                    <p className="text-[10px] text-gray-400">Status</p>
                                </div>
                            </div>
                        </div>

                        {/* Full Activity History */}
                        <div className="flex-1 overflow-y-auto p-4">
                            <div className="flex items-center gap-2 mb-3">
                                <Activity className="w-4 h-4 text-gray-400" />
                                <h4 className="text-sm font-semibold text-gray-600">Full Activity History</h4>
                                <span className="ml-auto text-xs text-gray-400">{userLogs.length} events</span>
                            </div>
                            {loadingLogs ? (
                                <div className="flex items-center justify-center py-10"><div className="w-5 h-5 border-2 border-[#0a2a5e] border-t-transparent rounded-full animate-spin" /></div>
                            ) : userLogs.length === 0 ? (
                                <p className="text-sm text-gray-400 text-center py-10">No activity recorded for this user</p>
                            ) : (
                                <div className="space-y-1.5">
                                    {userLogs.map((log, i) => (
                                        <div key={log._id || i} className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                                            <div className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0" style={{ background: ACTION_COLOR(log.action_type) }} />
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <span className="text-xs font-medium px-2 py-0.5 rounded-full"
                                                        style={{ background: `${ACTION_COLOR(log.action_type)}12`, color: ACTION_COLOR(log.action_type) }}>
                                                        {ACTION_LABEL(log.action_type)}
                                                    </span>
                                                    <span className="text-xs text-gray-400">{new Date(log.timestamp).toLocaleString()}</span>
                                                </div>
                                                {log.action_detail && Object.keys(log.action_detail).length > 0 && (
                                                    <p className="text-[10px] text-gray-400 mt-0.5 truncate">{JSON.stringify(log.action_detail)}</p>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </main>

            {/* Delete Confirmation Modal */}
            {deleteTarget && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                        className="bg-white rounded-2xl shadow-2xl border border-gray-100 w-full max-w-sm mx-4 p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-11 h-11 rounded-xl bg-red-50 flex items-center justify-center flex-shrink-0">
                                <AlertTriangle className="w-6 h-6 text-red-500" />
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900">Delete {roleLabel === "candidate" ? "Candidate" : "Recruiter"}?</h3>
                                <p className="text-xs text-gray-500">This action cannot be undone.</p>
                            </div>
                        </div>
                        <p className="text-sm text-gray-600 mb-5">
                            You are about to permanently delete <strong>{deleteTarget.firstName} {deleteTarget.lastName}</strong>{" "}
                            ({deleteTarget.email}).
                            {roleLabel === "recruiter" && " All their job postings will also be removed."}
                        </p>
                        <div className="flex gap-3">
                            <button onClick={() => setDeleteTarget(null)}
                                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 transition-colors">
                                Cancel
                            </button>
                            <button onClick={() => handleDelete(deleteTarget)} disabled={isDeleting}
                                className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-semibold transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                                {isDeleting
                                    ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    : <><Trash2 className="w-4 h-4" /> Delete Permanently</>}
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
};

export default SuperuserUsers;
