import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Camera, Eye, EyeOff, Check, X } from "lucide-react";
import { getCurrentUser, updateCurrentUser } from "./utils/userDatabase";
import CandidateSidebar from "./components/CandidateSidebar";

const CandidateSettings = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [user, setUser] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [toast, setToast] = useState({ show: false, message: "", type: "" });
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    newPassword: "",
    confirmPassword: "",
    profileImage: null,
  });

  // Load user data on mount
  useEffect(() => {
    const currentUser = getCurrentUser();
    if (!currentUser) {
      navigate("/candidate/signin");
    } else {
      setUser(currentUser);
      setFormData({
        firstName: currentUser.firstName || "",
        lastName: currentUser.lastName || "",
        email: currentUser.email || "",
        newPassword: "",
        confirmPassword: "",
        profileImage: currentUser.profileImage || null,
      });
    }
  }, [navigate]);

  // Handle Input Changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Handle Image Upload
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        showToast("Image size should be less than 5MB", "error");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result;
        setFormData({ ...formData, profileImage: base64String });
        // Immediately persist to localStorage for consistency
        const updatedData = {
          ...user,
          profileImage: base64String,
        };
        updateCurrentUser(updatedData);
      };
      reader.readAsDataURL(file);
    }
  };

  // Show toast notification
  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "" }), 3000);
  };

  // Handle Save
  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);

    // Validate passwords if changing
    if (formData.newPassword || formData.confirmPassword) {
      if (formData.newPassword !== formData.confirmPassword) {
        showToast("Passwords do not match!", "error");
        setIsLoading(false);
        return;
      }
      if (formData.newPassword.length < 6) {
        showToast("Password must be at least 6 characters!", "error");
        setIsLoading(false);
        return;
      }
    }

    // Update user data
    const updatedData = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      profileImage: formData.profileImage, // Already persisted on upload, but include for consistency
    };

    const updatedUser = updateCurrentUser(updatedData);
    if (updatedUser) {
      setUser(updatedUser);
      showToast("Settings saved successfully!", "success");
      // Clear password fields
      setFormData(prev => ({ ...prev, newPassword: "", confirmPassword: "" }));
    } else {
      showToast("Failed to save settings!", "error");
    }

    setIsLoading(false);
  };



  // Get initials for avatar
  const getInitials = () => {
    if (formData.firstName && formData.lastName) {
      return `${formData.firstName.charAt(0)}${formData.lastName.charAt(0)}`;
    }
    return "U";
  };

  if (!user) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0a2a5e]"></div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen flex bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden fixed inset-0">
      <CandidateSidebar />

      {/* Main Content - Scrollable */}
      <main className="flex-1 h-screen flex flex-col overflow-hidden py-8 px-8">
        {/* Header */}
        <div className="mb-6 flex-shrink-0 flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold text-[#0a2a5e]">Account Settings</h2>
            <p className="text-gray-500 text-md mt-1 py-2">Manage your profile and account preferences</p>
          </div>
        </div>

        {/* Settings Form - Full Page Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-lg p-8 w-full">
            <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl mx-auto">
              {/* Profile Picture Section */}
              <div className="flex items-center gap-6 pb-6 border-b border-gray-200">
                <div className="relative group">
                  <div className="w-24 h-24 bg-gradient-to-br from-[#0a2a5e] to-[#2b4c8c] rounded-full flex items-center justify-center text-white font-bold text-3xl shadow-lg overflow-hidden">
                    {formData.profileImage ? (
                      <img src={formData.profileImage} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      getInitials()
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute bottom-0 right-0 w-8 h-8 bg-[#0a2a5e] rounded-full flex items-center justify-center text-white shadow-md hover:bg-[#061a3d] transition-all"
                  >
                    <Camera className="w-4 h-4" />
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">Profile Picture</h3>
                  <p className="text-sm text-gray-500 mt-1">Click the camera icon to upload a new photo</p>
                </div>
              </div>

              {/* Full Name Section */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-medium text-gray-700 mb-2">First Name</label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#0a2a5e] focus:border-transparent outline-none transition-all"
                    required
                  />
                </div>
                <div>
                  <label className="block font-medium text-gray-700 mb-2">Last Name</label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                    required
                  />
                </div>
              </div>

              {/* Email Section */}
              <div>
                <label className="block font-medium text-gray-700 mb-2">Email Address</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  required
                />
              </div>

              {/* Change Password Section */}
              <div className="pt-4 border-t border-gray-200">
                <h3 className="font-semibold text-gray-800 mb-4">Change Password</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="relative">
                    <label className="block font-medium text-gray-700 mb-2">New Password</label>
                    <input
                      type={showPassword ? "text" : "password"}
                      name="newPassword"
                      value={formData.newPassword}
                      onChange={handleChange}
                      placeholder="Enter new password"
                      className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-11 text-gray-500 hover:text-gray-700"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  <div className="relative">
                    <label className="block font-medium text-gray-700 mb-2">Confirm Password</label>
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="Confirm new password"
                      className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-4 top-11 text-gray-500 hover:text-gray-700"
                    >
                      {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
                <p className="text-sm text-gray-500 mt-2">Leave blank if you don't want to change your password</p>
              </div>

              {/* Save Button */}
              <div className="pt-4 flex justify-end">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-8 py-3 bg-gradient-to-r from-[#0a2a5e] to-[#0d3b82] text-white rounded-xl font-semibold hover:from-[#061a3d] hover:to-[#0a2a5e] transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  ) : (
                    <>
                      <Check className="w-5 h-5" />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>

      {/* Toast Notification */}
      {toast.show && (
        <div className={`fixed bottom-5 right-5 px-6 py-4 rounded-xl shadow-lg flex items-center gap-3 animate-bounce ${toast.type === "success" ? "bg-green-600 text-white" : "bg-red-600 text-white"
          }`}>
          {toast.type === "success" ? <Check className="w-5 h-5" /> : <X className="w-5 h-5" />}
          {toast.message}
        </div>
      )}
    </div>
  );
};

export default CandidateSettings;
