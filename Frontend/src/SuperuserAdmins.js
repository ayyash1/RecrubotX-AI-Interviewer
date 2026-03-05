import React, { useState, useEffect } from "react";
import { useNavigate, NavLink } from "react-router-dom";
import { motion } from "framer-motion";
import {
    ShieldCheck, LayoutDashboard, Activity, Users, Briefcase,
    LogOut, UserPlus, Clock, Mail, X, Trash2, AlertTriangle
} from "lucide-react";
import API_BASE_URL from "./apiConfig";

const SidebarLink = ({ to, icon: Icon, label }) => (
    <NavLink to={to}
        className={({ isActive }) => `font-medium px-4 py-2.5 rounded-xl transition-all flex items-center gap-2.5 text-sm ${isActive ? "bg-[#0a2a5e]/10 text-[#0a2a5e]" : "text-gray-600 hover:bg-[#0a2a5e]/5 hover:text-[#0a2a5e]"}`}>
        <Icon className="w-[18px] h-[18px]" />{label}
    </NavLink>
);

const SuperuserAdmins = () => {
    const navigate = useNavigate();
    const token = localStorage.getItem("superuserToken");
    // isRoot: only root superuser (no created_by) can create admins
    const currentUser = JSON.parse(localStorage.getItem("superuserUser") || "{}");
    const isRoot = currentUser?.isRoot === true;
    const [admins, setAdmins] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({ email: "", password: "", firstName: "", lastName: "" });
    const [formError, setFormError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [successMsg, setSuccessMsg] = useState("");
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const fetchAdmins = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/superuser/admins`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) { const d = await res.json(); setAdmins(d.admins || []); }
        } catch (err) { console.error(err); }
        setIsLoading(false);
    };

    useEffect(() => { if (token) fetchAdmins(); }, [token]);

    const handleAddSuperuser = async (e) => {
        e.preventDefault();
        setFormError(""); setIsSubmitting(true);
        try {
            const res = await fetch(`${API_BASE_URL}/superuser/admins/add`, {
                method: "POST",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                body: JSON.stringify(formData),
            });
            const data = await res.json();
            if (!res.ok) { setFormError(data.detail || "Failed to create admin"); setIsSubmitting(false); return; }
            setSuccessMsg(`Admin ${formData.email} created successfully`);
            setFormData({ email: "", password: "", firstName: "", lastName: "" });
            setShowModal(false);
            fetchAdmins();
            setTimeout(() => setSuccessMsg(""), 4000);
        } catch (err) { setFormError("Network error"); }
        setIsSubmitting(false);
    };

    const handleDeleteSuperuser = async (adminId) => {
        setIsDeleting(true);
        try {
            const res = await fetch(`${API_BASE_URL}/superuser/admins/${adminId}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) {
                setSuccessMsg("Admin account deleted successfully");
                fetchAdmins();
                setDeleteTarget(null);
                setTimeout(() => setSuccessMsg(""), 4000);
            } else {
                const data = await res.json();
                alert(data.detail || "Failed to delete admin");
            }
        } catch (err) { alert("Network error"); }
        setIsDeleting(false);
    };

    const handleLogout = () => {
        localStorage.removeItem("superuserToken"); localStorage.removeItem("superuserUser");
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
                <div className="flex items-center justify-between mb-6 flex-shrink-0">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">Admin Accounts</h2>
                        <p className="text-gray-500 text-sm mt-1">{admins.length} administrators</p>
                    </div>
                    {isRoot ? (
                        <button onClick={() => setShowModal(true)}
                            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:shadow-lg"
                            style={{ background: "linear-gradient(135deg, #0a2a5e 0%, #143d7a 100%)" }}>
                            <UserPlus className="w-4 h-4" /> Add Admin
                        </button>
                    ) : (
                        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-100 text-gray-400 text-xs">
                            <ShieldCheck className="w-4 h-4" />
                            Only root admin can add accounts
                        </div>
                    )}
                </div>

                {successMsg && (
                    <div className="mb-4 p-3 rounded-xl bg-green-50 border border-green-200 text-green-700 text-sm flex items-center gap-2 flex-shrink-0">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 flex-shrink-0" /> {successMsg}
                    </div>
                )}

                {/* Admin Cards */}
                <div className="flex-1 overflow-y-auto">
                    {isLoading ? (
                        <div className="flex items-center justify-center h-32">
                            <div className="w-6 h-6 border-2 border-[#0a2a5e] border-t-transparent rounded-full animate-spin" />
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {admins.map((admin, i) => (
                                <motion.div key={admin.id}
                                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                                    className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition-shadow">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-12 h-12 rounded-xl flex items-center justify-center text-sm font-bold text-white"
                                            style={{ background: "linear-gradient(135deg, #0a2a5e, #143d7a)" }}>
                                            {admin.firstName?.charAt(0)}{admin.lastName?.charAt(0)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-gray-900 font-semibold truncate">{admin.firstName} {admin.lastName}</p>
                                            <p className="text-gray-500 text-xs truncate flex items-center gap-1"><Mail className="w-3 h-3" />{admin.email}</p>
                                        </div>
                                        <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                                            <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${admin.isActive ? "bg-green-50 text-green-600 border border-green-200" : "bg-red-50 text-red-600 border border-red-200"}`}>
                                                {admin.isActive ? "Active" : "Inactive"}
                                            </span>
                                            {isRoot && !admin.isRoot && (
                                                <button onClick={() => setDeleteTarget(admin)}
                                                    className="p-1.5 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 transition-all"
                                                    title="Delete Admin">
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4 text-xs text-gray-400 border-t border-gray-50 pt-3 flex-wrap">
                                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" />Added {new Date(admin.createdAt).toLocaleDateString()}</span>
                                        {admin.isRoot ? (
                                            <span className="text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full font-semibold">Root Admin</span>
                                        ) : (
                                            <span className="text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">Sub-Admin</span>
                                        )}
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>
            </main>

            {/* Add Admin Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                        className="bg-white rounded-2xl shadow-2xl border border-gray-100 w-full max-w-md mx-4 overflow-hidden">
                        <div className="flex items-center justify-between p-5 border-b border-gray-100">
                            <div>
                                <h3 className="text-lg font-bold text-gray-900">Add New Admin</h3>
                                <p className="text-xs text-gray-500 mt-0.5">This admin will be created under your account</p>
                            </div>
                            <button onClick={() => { setShowModal(false); setFormError(""); }}
                                className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleAddSuperuser} className="p-5 space-y-4">
                            {formError && (
                                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">
                                    {formError}
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-medium text-gray-600 mb-1">First Name</label>
                                    <input value={formData.firstName} onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                        required placeholder="First name"
                                        className="w-full rounded-xl px-3 py-2.5 text-sm text-gray-900 bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#0a2a5e]/30" />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-600 mb-1">Last Name</label>
                                    <input value={formData.lastName} onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                        required placeholder="Last name"
                                        className="w-full rounded-xl px-3 py-2.5 text-sm text-gray-900 bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#0a2a5e]/30" />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">Email</label>
                                <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    required placeholder="admin@recrubotx.com"
                                    className="w-full rounded-xl px-3 py-2.5 text-sm text-gray-900 bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#0a2a5e]/30" />
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">Password</label>
                                <input type="password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    required placeholder="Strong password" minLength={8}
                                    className="w-full rounded-xl px-3 py-2.5 text-sm text-gray-900 bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#0a2a5e]/30" />
                                <p className="text-[10px] text-gray-400 mt-1">Minimum 8 characters. Password is encrypted with bcrypt.</p>
                            </div>

                            <button type="submit" disabled={isSubmitting}
                                className="w-full py-3 rounded-xl font-semibold text-white flex items-center justify-center gap-2 transition-all disabled:opacity-50 hover:shadow-lg"
                                style={{ background: "linear-gradient(135deg, #0a2a5e 0%, #143d7a 100%)" }}>
                                {isSubmitting ? (
                                    <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Creating...</>
                                ) : (
                                    <><UserPlus className="w-4 h-4" />Create Admin Account</>
                                )}
                            </button>
                        </form>
                    </motion.div>
                </div>
            )}

            {/* Delete Admin Modal */}
            {deleteTarget && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                        className="bg-white rounded-2xl shadow-2xl border border-gray-100 w-full max-w-sm mx-4 p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-11 h-11 rounded-xl bg-red-50 flex items-center justify-center flex-shrink-0">
                                <AlertTriangle className="w-6 h-6 text-red-500" />
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900">Delete Admin Account?</h3>
                                <p className="text-xs text-gray-500">This action cannot be undone.</p>
                            </div>
                        </div>
                        <p className="text-sm text-gray-600 mb-5">
                            You are about to permanently delete the admin account for <strong>{deleteTarget.firstName} {deleteTarget.lastName}</strong> ({deleteTarget.email}).
                        </p>
                        <div className="flex gap-3">
                            <button onClick={() => setDeleteTarget(null)}
                                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 transition-colors">
                                Cancel
                            </button>
                            <button onClick={() => handleDeleteSuperuser(deleteTarget.id)} disabled={isDeleting}
                                className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-semibold transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                                {isDeleting ? (
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                ) : (
                                    <Trash2 className="w-4 h-4" />
                                )}
                                Delete Permanent
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
};

export default SuperuserAdmins;
