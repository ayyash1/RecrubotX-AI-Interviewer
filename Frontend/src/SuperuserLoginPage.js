import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Mail, Lock, Eye, EyeOff, ArrowRight, ShieldCheck } from "lucide-react";
import API_BASE_URL from "./apiConfig";

const SuperuserLoginPage = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ email: "", password: "" });
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError("");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setIsLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/superuser/auth/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });
            const data = await response.json();
            if (!response.ok) {
                setError(data.detail || "Login failed");
                setIsLoading(false);
                return;
            }
            localStorage.setItem("superuserToken", data.token);
            localStorage.setItem("superuserUser", JSON.stringify(data.user));
            navigate("/superuser/dashboard");
        } catch (err) {
            setError("Network error. Please check if the backend server is running.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
            {/* Subtle background decoration */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full opacity-[0.04]"
                    style={{ background: "#0a2a5e" }} />
                <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] rounded-full opacity-[0.03]"
                    style={{ background: "#0a2a5e" }} />
            </div>

            <motion.div
                className="relative w-full max-w-md mx-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                    {/* Header band */}
                    <div className="py-8 px-8 text-center" style={{ background: "linear-gradient(135deg, #0a2a5e 0%, #143d7a 100%)" }}>
                        <div className="w-16 h-16 mx-auto mb-4 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/20">
                            <ShieldCheck className="w-8 h-8 text-white" />
                        </div>
                        <h1 className="text-2xl font-bold text-white">Admin Portal</h1>
                        <p className="text-blue-200 text-sm mt-1">RecruBotX System Administration</p>
                    </div>

                    <div className="p-8">
                        {error && (
                            <div className="mb-5 p-3 rounded-xl text-sm bg-red-50 border border-red-200 text-red-600 flex items-start gap-2">
                                <span className="block w-1.5 h-1.5 rounded-full bg-red-500 mt-1.5 flex-shrink-0" />
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Email Address</label>
                                <div className="relative">
                                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                        type="email" name="email" value={formData.email}
                                        onChange={handleInputChange} placeholder="admin@recrubotx.com"
                                        required id="superuser-email"
                                        className="w-full rounded-xl pl-11 pr-4 py-3 text-gray-900 placeholder-gray-400 bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:border-transparent transition-all"
                                        style={{ focusRingColor: "#0a2a5e" }}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
                                <div className="relative">
                                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                        type={showPassword ? "text" : "password"} name="password"
                                        value={formData.password} onChange={handleInputChange}
                                        placeholder="Enter your password" required id="superuser-password"
                                        className="w-full rounded-xl pl-11 pr-11 py-3 text-gray-900 placeholder-gray-400 bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:border-transparent transition-all"
                                    />
                                    <button type="button" onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>

                            <button type="submit" disabled={isLoading} id="superuser-login-btn"
                                className="w-full py-3.5 rounded-xl font-semibold text-white flex items-center justify-center gap-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg"
                                style={{ background: "linear-gradient(135deg, #0a2a5e 0%, #143d7a 100%)" }}>
                                {isLoading ? (
                                    <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />Authenticating...</>
                                ) : (
                                    <>Access Dashboard <ArrowRight className="w-4 h-4" /></>
                                )}
                            </button>
                        </form>

                        <p className="text-center text-xs text-gray-400 mt-6">
                            Restricted access. Authorized administrators only.
                        </p>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default SuperuserLoginPage;
