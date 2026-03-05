import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
    User,
    Mail,
    Lock,
    Eye,
    EyeOff,
    ArrowRight,
    CheckCircle,
    Play,
    Users,
    ShieldCheck,
    X,
    Check,
    Loader2
} from "lucide-react";
import image1 from "./assets/images/general/image1.jpg";
import { registerUser, sendOtp, verifyOtp, validatePasswordComplexity } from "./utils/userDatabase";

const CandidateSignupPage = () => {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        confirmPassword: "",
        agreeToTerms: false,
    });

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    // OTP state
    const [otpSent, setOtpSent] = useState(false);
    const [otpVerified, setOtpVerified] = useState(false);
    const [otpCode, setOtpCode] = useState("");
    const [otpLoading, setOtpLoading] = useState(false);
    const [otpError, setOtpError] = useState("");
    const [otpSuccess, setOtpSuccess] = useState("");

    const fadeInUp = {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.6 },
    };

    const handleInputChange = (e) => {
        const { name, type, checked, value } = e.target;
        setFormData({
            ...formData,
            [name]: type === "checkbox" ? checked : value,
        });
        setError("");
        // Reset OTP if email changes
        if (name === "email") {
            setOtpSent(false);
            setOtpVerified(false);
            setOtpCode("");
            setOtpError("");
            setOtpSuccess("");
        }
    };

    const passwordChecks = validatePasswordComplexity(formData.password);
    const allPasswordChecksPassed = passwordChecks.every(c => c.test);

    const handleSendOtp = async () => {
        if (!formData.email) { setOtpError("Please enter your email first"); return; }
        setOtpLoading(true);
        setOtpError("");
        setOtpSuccess("");
        const result = await sendOtp(formData.email);
        setOtpLoading(false);
        if (result.success) {
            setOtpSent(true);
            setOtpSuccess("Verification code sent! Check your email.");
        } else {
            setOtpError(result.message);
        }
    };

    const handleVerifyOtp = async () => {
        if (!otpCode || otpCode.length < 6) { setOtpError("Please enter the 6-digit code"); return; }
        setOtpLoading(true);
        setOtpError("");
        const result = await verifyOtp(formData.email, otpCode);
        setOtpLoading(false);
        if (result.success) {
            setOtpVerified(true);
            setOtpSuccess("Email verified successfully!");
        } else {
            setOtpError(result.message);
        }
    };

    const [showSuccessModal, setShowSuccessModal] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (!otpVerified) {
            setError("Please verify your email address first");
            return;
        }
        if (formData.password !== formData.confirmPassword) {
            setError("Passwords don't match");
            return;
        }
        if (!allPasswordChecksPassed) {
            setError("Password does not meet complexity requirements");
            return;
        }
        if (!formData.agreeToTerms) {
            setError("Please agree to the terms and conditions.");
            return;
        }

        setIsLoading(true);
        const result = await registerUser({
            firstName: formData.firstName,
            lastName: formData.lastName,
            email: formData.email,
            password: formData.password,
            otpCode: otpCode,
        });

        setIsLoading(false);
        if (result.success) {
            setShowSuccessModal(true);
            // Automatic navigation after 4 seconds
            setTimeout(() => {
                navigate("/candidate/signin");
            }, 4000);
        } else {
            setError(result.message);
        }
    };

    const benefits = [
        "Unlimited AI interview practice sessions",
        "24/7 availability - practice anytime",
        "Instant feedback and performance analytics",
        "Industry-specific interview questions",
        "No time limits or scheduling conflicts",
        "Build confidence before real interviews",
    ];

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="grid grid-cols-1 lg:grid-cols-2 min-h-screen">

                {/* Left Side - Signup Form */}
                <div className="flex items-center justify-center p-6 lg:p-12">
                    <motion.div
                        className="w-full max-w-md bg-white shadow-lg rounded-2xl p-8"
                        {...fadeInUp}
                    >
                        <div className="text-center mb-6">
                            <div className="w-16 h-16 bg-gradient-to-r from-[#0a2a5e] to-[#1a4a8e] rounded-full flex items-center justify-center mx-auto mb-4">
                                <Users className="w-8 h-8 text-white" />
                            </div>
                            <h1 className="text-2xl font-bold text-gray-800 mb-1">
                                Join as Candidate
                            </h1>
                            <p className="text-gray-500 text-sm">
                                Start practicing interviews with AI
                            </p>
                        </div>

                        {error && (
                            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* Name Fields */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                        name="firstName"
                                        value={formData.firstName}
                                        onChange={handleInputChange}
                                        placeholder="First Name"
                                        className="w-full border rounded-lg px-10 py-2 focus:ring focus:ring-[#0a2a5e]/20 focus:border-[#0a2a5e]"
                                        required
                                    />
                                </div>
                                <input
                                    name="lastName"
                                    value={formData.lastName}
                                    onChange={handleInputChange}
                                    placeholder="Last Name"
                                    className="w-full border rounded-lg px-4 py-2 focus:ring focus:ring-[#0a2a5e]/20 focus:border-[#0a2a5e]"
                                    required
                                />
                            </div>

                            {/* Email + OTP Verification */}
                            <div>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        placeholder="Email Address"
                                        className={`w-full border rounded-lg px-10 py-2 pr-24 focus:ring focus:ring-[#0a2a5e]/20 focus:border-[#0a2a5e] ${otpVerified ? 'border-green-400 bg-green-50/50' : ''}`}
                                        required
                                        disabled={otpVerified}
                                    />
                                    {otpVerified ? (
                                        <span className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 text-green-600 text-xs font-medium">
                                            <CheckCircle className="w-4 h-4" /> Verified
                                        </span>
                                    ) : (
                                        <button type="button" onClick={handleSendOtp} disabled={otpLoading || !formData.email}
                                            className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-medium px-3 py-1 rounded-md bg-[#0a2a5e] text-white hover:bg-[#0a1f44] disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors">
                                            {otpLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : otpSent ? "Resend" : "Send Code"}
                                        </button>
                                    )}
                                </div>

                                {/* OTP Input */}
                                {otpSent && !otpVerified && (
                                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                                        className="mt-2">
                                        <div className="flex gap-2">
                                            <div className="relative flex-1">
                                                <ShieldCheck className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                                <input
                                                    type="text"
                                                    maxLength={6}
                                                    value={otpCode}
                                                    onChange={(e) => { setOtpCode(e.target.value.replace(/\D/g, '')); setOtpError(""); }}
                                                    placeholder="Enter 6-digit code"
                                                    className="w-full border rounded-lg px-10 py-2 text-center tracking-[6px] font-mono focus:ring focus:ring-[#0a2a5e]/20 focus:border-[#0a2a5e]"
                                                />
                                            </div>
                                            <button type="button" onClick={handleVerifyOtp} disabled={otpLoading || otpCode.length < 6}
                                                className="px-4 py-2 rounded-lg bg-green-600 text-white text-sm font-medium hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors">
                                                {otpLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Verify"}
                                            </button>
                                        </div>
                                    </motion.div>
                                )}

                                {otpError && <p className="text-red-500 text-xs mt-1">{otpError}</p>}
                                {otpSuccess && <p className="text-green-600 text-xs mt-1">{otpSuccess}</p>}
                            </div>

                            {/* Password */}
                            <div>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        name="password"
                                        value={formData.password}
                                        onChange={handleInputChange}
                                        placeholder="Password"
                                        className="w-full border rounded-lg px-10 py-2 pr-10 focus:ring focus:ring-[#0a2a5e]/20 focus:border-[#0a2a5e]"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                    >
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>

                                {/* Password Strength Indicator */}
                                {formData.password && (
                                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                        className="mt-2 p-2 bg-gray-50 rounded-lg border border-gray-100">
                                        <div className="grid grid-cols-2 gap-1">
                                            {passwordChecks.map((check, i) => (
                                                <div key={i} className={`flex items-center gap-1.5 text-[11px] ${check.test ? 'text-green-600' : 'text-gray-400'}`}>
                                                    {check.test ? <Check className="w-3 h-3 flex-shrink-0" /> : <X className="w-3 h-3 flex-shrink-0" />}
                                                    {check.label}
                                                </div>
                                            ))}
                                        </div>
                                    </motion.div>
                                )}
                            </div>

                            {/* Confirm Password */}
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type={showConfirmPassword ? "text" : "password"}
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleInputChange}
                                    placeholder="Confirm Password"
                                    className={`w-full border rounded-lg px-10 py-2 pr-10 focus:ring focus:ring-[#0a2a5e]/20 focus:border-[#0a2a5e] ${formData.confirmPassword && formData.password !== formData.confirmPassword ? 'border-red-300' : ''}`}
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>

                            {/* Terms */}
                            <div className="flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    name="agreeToTerms"
                                    checked={formData.agreeToTerms}
                                    onChange={handleInputChange}
                                    className="h-4 w-4 accent-[#0a2a5e]"
                                />
                                <label className="text-sm text-gray-600">
                                    I agree to the{" "}
                                    <Link to="/terms" className="text-[#0a2a5e] hover:underline">
                                        Terms of Service
                                    </Link>{" "}
                                    and{" "}
                                    <Link to="/privacy" className="text-[#0a2a5e] hover:underline">
                                        Privacy Policy
                                    </Link>
                                </label>
                            </div>

                            {/* Submit */}
                            <button
                                type="submit"
                                disabled={isLoading || !otpVerified || !allPasswordChecksPassed}
                                className="w-full bg-[#0a2a5e] text-white py-2.5 rounded-lg font-medium hover:bg-[#0a1f44] flex items-center justify-center disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                            >
                                {isLoading ? "Creating Account..." : "Create Secure Account"}
                                {!isLoading && <ArrowRight className="ml-2 w-4 h-4" />}
                            </button>
                        </form>

                        <p className="text-center text-sm text-gray-500 mt-5">
                            Already have an account?{" "}
                            <Link to="/candidate/signin" className="text-[#0a2a5e] hover:underline font-medium">
                                Sign in here
                            </Link>
                        </p>
                    </motion.div>
                </div>

                {/* Right Side - Benefits */}
                <div className="hidden lg:flex bg-gradient-to-br from-[#0a2a5e]/5 to-[#0a2a5e]/15 items-center justify-center p-6 lg:p-12">
                    <motion.div
                        className="w-full max-w-lg text-center"
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <div className="mb-6 rounded-2xl shadow-md w-full h-64 overflow-hidden">
                            <img
                                src={image1}
                                alt="Interview Practice"
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-800 mb-4">
                            Why Choose RecruBotX?
                        </h2>
                        <p className="text-gray-600 mb-6">
                            Join thousands of candidates who have improved their interview skills
                        </p>

                        <div className="space-y-3 mb-8">
                            {benefits.map((benefit, index) => (
                                <motion.div
                                    key={index}
                                    className="flex items-start space-x-3 text-left"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.5, delay: index * 0.1 }}
                                >
                                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                                    <span className="text-gray-600">{benefit}</span>
                                </motion.div>
                            ))}
                        </div>

                        <Link
                            to="/demo"
                            className="inline-flex items-center px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100"
                        >
                            <Play className="mr-2 w-4 h-4" />
                            Watch Demo
                        </Link>
                    </motion.div>
                </div>
            </div>
            {/* Success Modal */}
            {showSuccessModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white rounded-2xl p-8 max-w-sm w-full shadow-2xl text-center"
                    >
                        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <CheckCircle className="w-12 h-12 text-green-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">Account Created!</h2>
                        <p className="text-gray-600 mb-8">
                            Your candidate account has been successfully registered. You are being redirected to sign in.
                        </p>
                        <button
                            onClick={() => navigate("/candidate/signin")}
                            className="w-full bg-[#0a2a5e] text-white py-3 rounded-xl font-semibold hover:bg-[#0a1f44] transition-colors shadow-lg shadow-[#0a2a5e]/20"
                        >
                            OK, Let's Go
                        </button>
                    </motion.div>
                </div>
            )}
        </div>
    );
};

export default CandidateSignupPage;
