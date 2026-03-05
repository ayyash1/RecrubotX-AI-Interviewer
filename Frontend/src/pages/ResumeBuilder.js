import React, { useState, useEffect } from "react";
import { Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getCurrentUser } from "../utils/userDatabase";
import CandidateSidebar from "../components/CandidateSidebar";
import DownloadButton from "../components/DownloadButton";

// Import Builder Components
import DoubleColumnBuilder from "./builders/DoubleColumnBuilder";
import SimpleBuilder from "./builders/SimpleBuilder";
import ElegantBuilder from "./builders/ElegantBuilder";

const ResumeBuilder = () => {
  const [user, setUser] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const navigate = useNavigate();

  // Get current user on component mount
  useEffect(() => {
    const currentUser = getCurrentUser();
    if (!currentUser) {
      navigate("/candidate/signin");
    } else {
      setUser(currentUser);
    }
  }, [navigate]);



  // Get selected template from localStorage safely
  // Default to "simple" if nothing selected
  const selectedTemplate = localStorage.getItem("selectedTemplate") || "Simple";

  // common props to pass to builders
  const builderProps = {
    user,
    showPreview,
    setShowPreview
  };

  // Render the appropriate builder based on template ID
  const renderBuilder = () => {
    // Normalize string to handle case sensitivity issues (e.g. "Simple" vs "simple")
    const templateId = selectedTemplate.toLowerCase();

    switch (templateId) {
      case "double-column":
        return <DoubleColumnBuilder {...builderProps} />;
      case "simple":
        return <SimpleBuilder {...builderProps} />;
      case "elegant":
        return <ElegantBuilder {...builderProps} />;
      default:
        // Fallback to simple if unknown
        return <SimpleBuilder {...builderProps} />;
    }
  };

  if (!user) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0a2a5e] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen flex bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden fixed inset-0">
      {/* Sidebar */}
      <CandidateSidebar />

      {/* Main Content */}
      <main className="flex-1 h-screen flex flex-col overflow-hidden py-8 px-8">
        {/* Top Header */}
        <div className="mb-6 flex-shrink-0 flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold text-[#0a2a5e]">Build Your Resume</h2>
            <p className="text-gray-500 text-md mt-1 py-2">Fill in your details and watch your professional resume come to life.</p>
          </div>
        </div>

        {/* Builder Content - Dynamic based on template */}
        <div className="flex-1 overflow-y-auto px-10 py-8">
          {renderBuilder()}
        </div>

        {/* Bottom Action Bar - "The Similar Line" */}
        <div className="flex justify-end items-center gap-4 py-5 px-10 bg-white/80 backdrop-blur-lg border-t border-gray-200 flex-shrink-0">
          <button
            onClick={() => setShowPreview(!showPreview)}
            className="flex items-center gap-2 px-8 py-3 bg-white text-[#0a2a5e] border-2 border-[#0a2a5e] rounded-xl font-bold hover:bg-[#0a2a5e]/5 transition-all shadow-sm"
          >
            <Eye className="w-5 h-5" />
            {showPreview ? "Edit" : "Preview"}
          </button>
          <DownloadButton
            showPreview={showPreview}
            setShowPreview={setShowPreview}
            className="flex items-center gap-2 px-8 py-3 bg-[#0a2a5e] text-white rounded-xl font-bold hover:bg-[#061a3d] transition-all shadow-sm"
          />
        </div>
      </main>
    </div>
  );
};

export default ResumeBuilder;
