import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  CheckCircle,
  Users
} from "lucide-react";
import { loginUser } from "./utils/userDatabase";
import image1 from "./assets/images/general/image1.jpg";

const CandidatePage = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

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
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    const result = await loginUser(formData.email, formData.password);

    setIsLoading(false);

    if (result.success) {
      localStorage.setItem("candidateUser", JSON.stringify(result.user));
      alert(`Welcome back, ${result.user.firstName}!`);
      navigate("/candidate/dashboard");
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

        {/* Left Side - Login Form */}
        <div className="flex items-center justify-center p-6 lg:p-12 h-full">
          <motion.div
            className="w-full max-w-md bg-white shadow-lg rounded-2xl p-8"
            {...fadeInUp}
          >
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-r from-[#0a2a5e] to-[#1a4a8e] rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-gray-800 mb-2">
                Candidate Portal
              </h1>
              <p className="text-gray-500">
                Sign in to continue your interview practice journey
              </p>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email */}
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Email Address"
                  className="w-full border rounded-lg px-10 py-2 focus:ring focus:ring-[#0a2a5e]/20 focus:border-[#0a2a5e]"
                  required
                />
              </div>

              {/* Password */}
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

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    name="rememberMe"
                    checked={formData.rememberMe}
                    onChange={handleInputChange}
                    className="h-4 w-4 accent-[#0a2a5e]"
                  />
                  <label className="text-sm text-gray-600">
                    Remember me
                  </label>
                </div>
                <Link to="/forgot-password" className="text-sm text-[#0a2a5e] hover:underline">
                  Forgot Password?
                </Link>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#0a2a5e] text-white py-2 rounded-lg font-medium hover:bg-[#0a1f44] flex items-center justify-center disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? "Signing In..." : "Sign In"}
                {!isLoading && <ArrowRight className="ml-2 w-4 h-4" />}
              </button>
            </form>

            <p className="text-center text-sm text-gray-500 mt-6">
              Need a candidate account?{" "}
              <Link to="/candidate/signup" className="text-[#0a2a5e] hover:underline font-medium">
                Sign up here
              </Link>
            </p>
          </motion.div>
        </div>

        {/* Right Side - Benefits */}
        <div className="hidden lg:flex bg-gradient-to-br from-[#0a2a5e]/5 to-[#0a2a5e]/15 items-center justify-center p-6 lg:p-12 h-full">
          <motion.div
            className="w-full max-w-lg text-center"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            {/* Hero Image */}
            <div className="mb-6 rounded-2xl shadow-md w-full h-64 overflow-hidden">
              <img
                src={image1}
                alt="Interview Practice"
                className="w-full h-full object-cover"
              />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Ace Your Next Interview
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
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default CandidatePage;
