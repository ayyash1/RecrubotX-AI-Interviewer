// src/pages/AnalyzeResume.jsx
import React, { useState, useEffect } from "react";
import { Upload, FileText, Loader2, Sparkles, User, Award, Target, ArrowRight, CheckCircle, ThumbsUp, AlertCircle, AlertTriangle, TrendingUp, Download } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getCurrentUser } from "./utils/userDatabase";
import CandidateSidebar from "./components/CandidateSidebar";
import jsPDF from 'jspdf';
import API_BASE_URL from "./apiConfig";

const AnalyzeResume = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [file, setFile] = useState(null);
  const [jobDesc, setJobDesc] = useState("");
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Helper function to render text with bold formatting (**text**)
  const renderTextWithBold = (text) => {
    if (!text) return "";
    if (typeof text !== 'string') return text;

    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={index}>{part.slice(2, -2)}</strong>;
      }
      return part;
    });
  };

  // Custom animation styles for border and badge pulse
  const animationStyles = `
    @keyframes borderPulseGreen {
      0%, 100% { border-color: rgb(34, 197, 94); box-shadow: 0 0 20px rgba(34, 197, 94, 0.3); }
      50% { border-color: white; box-shadow: 0 0 40px rgba(34, 197, 94, 0.8), 0 0 80px rgba(255, 255, 255, 0.4); }
    }
    @keyframes borderPulseBlue {
      0%, 100% { border-color: rgb(59, 130, 246); box-shadow: 0 0 20px rgba(59, 130, 246, 0.3); }
      50% { border-color: white; box-shadow: 0 0 40px rgba(59, 130, 246, 0.8), 0 0 80px rgba(255, 255, 255, 0.4); }
    }
    @keyframes borderPulseYellow {
      0%, 100% { border-color: rgb(250, 204, 21); box-shadow: 0 0 20px rgba(250, 204, 21, 0.3); }
      50% { border-color: white; box-shadow: 0 0 40px rgba(250, 204, 21, 0.8), 0 0 80px rgba(255, 255, 255, 0.4); }
    }
    @keyframes borderPulseRed {
      0%, 100% { border-color: rgb(239, 68, 68); box-shadow: 0 0 20px rgba(239, 68, 68, 0.3); }
      50% { border-color: white; box-shadow: 0 0 40px rgba(239, 68, 68, 0.8), 0 0 80px rgba(255, 255, 255, 0.4); }
    }
    .border-pulse-green { animation: borderPulseGreen 2s ease-in-out infinite; }
    .border-pulse-blue { animation: borderPulseBlue 2s ease-in-out infinite; }
    .border-pulse-yellow { animation: borderPulseYellow 2s ease-in-out infinite; }
    .border-pulse-red { animation: borderPulseRed 2s ease-in-out infinite; }
  `;

  // Get current user on component mount
  useEffect(() => {
    const currentUser = getCurrentUser();
    if (!currentUser) {
      navigate("/candidate/signin");
    } else {
      setUser(currentUser);
    }
  }, [navigate]);

  const handleFileChange = (e) => {
    setFile(e.target.files[0] || null);
  };

  const handleAnalyze = async () => {
    setError("");
    setAnalysis(null);
    if (!file) {
      setError("Please upload a CV file (.pdf or .docx).");
      return;
    }

    if (!jobDesc.trim()) {
      setError("Please paste the Job Description. It is required for CV analysis.");
      return;
    }

    setLoading(true);

    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("job_description", jobDesc);

      const res = await fetch(`${API_BASE_URL}/candidate/analyze-resume`, {
        method: "POST",
        body: fd,
      });

      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || `HTTP ${res.status}`);
      }

      const payload = await res.json();

      if (payload && payload.error) {
        throw new Error(payload.error);
      }

      // Handle the response - the backend returns the analysis data directly in payload
      const analysisData = {
        formatted_analysis: payload.formatted_analysis || payload.summary || "",
        professional_summary: payload.professional_summary || payload.summary || "",
        core_strengths: payload.core_strengths || (payload.strengths ? payload.strengths.join("\n• ") : ""),
        role_recommendations: payload.recommendation || "",
        skill_gaps: payload.skill_gaps || (payload.weaknesses ? payload.weaknesses.join("\n• ") : ""),
        next_steps: payload.next_steps || "",
        next_steps_list: payload.next_steps_list || [],
        raw_analysis: payload.analysis?.full_analysis || "",
        overall_score: payload.overall_score || 0,
        skills_match: payload.skills_match || 0,
        experience_match: payload.experience_match || 0,
        education_match: payload.education_match || 0,
        candidate_name: payload.candidate_name || "Unknown",
        strengths: payload.strengths || [],
        weaknesses: payload.weaknesses || [],
        recommendation: payload.recommendation || "",
        hasJobDescription: true // JD is always provided now
      };

      setAnalysis(analysisData);
    } catch (err) {
      console.error("Analyze error:", err);
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  // Download PDF Report function
  const downloadReport = () => {
    const doc = new jsPDF('p', 'mm', 'a4');
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    const contentWidth = pageWidth - (2 * margin);
    let yPosition = margin;

    // Helper to draw text with bold parts (**text**)
    const drawStyledText = (text, x, y, maxWidth) => {
      const parts = text.split(/(\*\*.*?\*\*)/g);
      let currentX = x;

      parts.forEach(part => {
        if (part.startsWith('**') && part.endsWith('**')) {
          doc.setFont(undefined, 'bold');
          const boldText = part.slice(2, -2);
          doc.text(boldText, currentX, y);
          currentX += doc.getTextWidth(boldText);
          doc.setFont(undefined, 'normal');
        } else if (part) {
          doc.text(part, currentX, y);
          currentX += doc.getTextWidth(part);
        }
      });
    };

    // Helper to split and draw text with bold support across multiple lines
    const drawWrappedStyledText = (text, x, y, maxWidth, lineHeight = 5) => {
      // Split text into lines while respecting bold markers (complex in jsPDF)
      // Simpler approach: split by space, but that loses precision.
      // Better: Use a simple line wrapping logic that treats bold parts as units.

      const words = text.split(/(\*\*.*?\*\*|\s+)/g).filter(w => w !== undefined && w !== '');
      let currentLine = "";
      let tempY = y;
      let lineSegments = [];
      let currentLineWidth = 0;

      words.forEach(word => {
        let cleanWord = word;
        let isBold = false;
        if (word.startsWith('**') && word.endsWith('**')) {
          cleanWord = word.slice(2, -2);
          isBold = true;
          doc.setFont(undefined, 'bold');
        } else {
          doc.setFont(undefined, 'normal');
        }

        const wordWidth = doc.getTextWidth(cleanWord);

        if (currentLineWidth + wordWidth > maxWidth - 5) { // 5mm safety buffer
          // Draw current line
          let segmentX = x;
          lineSegments.forEach(seg => {
            doc.setFont(undefined, seg.bold ? 'bold' : 'normal');
            doc.text(seg.text, segmentX, tempY);
            segmentX += doc.getTextWidth(seg.text);
          });

          tempY += lineHeight;
          if (tempY > pageHeight - 20) {
            doc.addPage();
            tempY = margin;
          }

          lineSegments = [{ text: cleanWord, bold: isBold }];
          currentLineWidth = wordWidth;
        } else {
          lineSegments.push({ text: cleanWord, bold: isBold });
          currentLineWidth += wordWidth;
        }
      });

      // Draw last line
      let segmentX = x;
      lineSegments.forEach(seg => {
        doc.setFont(undefined, seg.bold ? 'bold' : 'normal');
        doc.text(seg.text, segmentX, tempY);
        segmentX += doc.getTextWidth(seg.text);
      });

      return tempY + lineHeight;
    };

    // Blue theme color
    const primaryBlue = [30, 74, 142]; // #1e4a8e
    const lightBlue = [59, 130, 246];
    const textGray = [50, 50, 50];

    // Header with blue background
    doc.setFillColor(...primaryBlue);
    doc.rect(0, 0, pageWidth, 45, 'F');

    // RecruBotX Title
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont(undefined, 'bold');
    doc.text('RecruBotX', margin, 20);

    // CV Screening subtitle
    doc.setFontSize(14);
    doc.setFont(undefined, 'normal');
    doc.text('Resume Analyzer Analysis Report', margin, 30);

    // Date
    doc.setFontSize(10);
    const reportDate = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    doc.text(`Generated: ${reportDate}`, margin, 38);

    yPosition = 55;

    // Candidate Name
    if (analysis.candidate_name && analysis.candidate_name !== 'Unknown') {
      doc.setTextColor(...primaryBlue);
      doc.setFontSize(16);
      doc.setFont(undefined, 'bold');
      doc.text(`Candidate: ${analysis.candidate_name}`, margin, yPosition);
      yPosition += 12;
    }

    // Recommendation Badge (if JD provided)
    if (analysis.recommendation && analysis.hasJobDescription) {
      doc.setFontSize(12);
      doc.setFont(undefined, 'bold');
      const recText = `Recommendation: ${analysis.recommendation}`;
      doc.setTextColor(...primaryBlue);
      doc.text(recText, margin, yPosition);
      yPosition += 10;
    }

    // Reset text color
    doc.setTextColor(...textGray);
    yPosition += 5;

    // Compatibility Analysis (if JD provided)
    if (analysis.hasJobDescription) {
      doc.setFillColor(...lightBlue);
      doc.rect(margin, yPosition, contentWidth, 8, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(12);
      doc.setFont(undefined, 'bold');
      doc.text('Compatibility Analysis', margin + 3, yPosition + 5.5);
      yPosition += 12;

      doc.setTextColor(...textGray);
      doc.setFontSize(10);
      doc.setFont(undefined, 'normal');
      const scores = [
        `Overall Match: ${analysis.overall_score || 0}%`,
        `Skills Match: ${analysis.skills_match || 0}%`,
        `Experience Match: ${analysis.experience_match || 0}%`,
        `Education Match: ${analysis.education_match || 0}%`
      ];
      scores.forEach(score => {
        doc.text(`• ${score}`, margin + 5, yPosition);
        yPosition += 6;
      });
      yPosition += 5;
    }

    // Professional Summary
    if (analysis.summary) {
      if (yPosition > pageHeight - 40) {
        doc.addPage();
        yPosition = margin;
      }
      doc.setFillColor(...lightBlue);
      doc.rect(margin, yPosition, contentWidth, 8, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(12);
      doc.setFont(undefined, 'bold');
      doc.text('Professional Summary', margin + 3, yPosition + 5.5);
      yPosition += 12;

      doc.setTextColor(...textGray);
      doc.setFontSize(10);
      doc.setFont(undefined, 'normal');

      yPosition = drawWrappedStyledText(analysis.professional_summary, margin + 5, yPosition, contentWidth - 10);
      yPosition += 5;
    }

    // Key Strengths
    if (analysis.strengths && analysis.strengths.length > 0) {
      if (yPosition > pageHeight - 40) {
        doc.addPage();
        yPosition = margin;
      }
      doc.setFillColor(...lightBlue);
      doc.rect(margin, yPosition, contentWidth, 8, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(12);
      doc.setFont(undefined, 'bold');
      doc.text('Key Strengths', margin + 3, yPosition + 5.5);
      yPosition += 12;

      doc.setTextColor(...textGray);
      doc.setFontSize(10);
      doc.setFont(undefined, 'normal');
      analysis.strengths.forEach(strength => {
        yPosition = drawWrappedStyledText(`• ${strength}`, margin + 5, yPosition, contentWidth - 10);
        yPosition += 1;
      });
      yPosition += 5;
    }

    // Areas for Development
    if (analysis.weaknesses && analysis.weaknesses.length > 0) {
      if (yPosition > pageHeight - 40) {
        doc.addPage();
        yPosition = margin;
      }
      doc.setFillColor(...lightBlue);
      doc.rect(margin, yPosition, contentWidth, 8, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(12);
      doc.setFont(undefined, 'bold');
      doc.text('Areas for Development', margin + 3, yPosition + 5.5);
      yPosition += 12;

      doc.setTextColor(...textGray);
      doc.setFontSize(10);
      doc.setFont(undefined, 'normal');
      analysis.weaknesses.forEach(weakness => {
        yPosition = drawWrappedStyledText(`• ${weakness}`, margin + 5, yPosition, contentWidth - 10);
        yPosition += 1;
      });
      yPosition += 5;
    }

    // Recommended Next Steps
    if (analysis.next_steps) {
      if (yPosition > pageHeight - 40) {
        doc.addPage();
        yPosition = margin;
      }
      doc.setFillColor(...lightBlue);
      doc.rect(margin, yPosition, contentWidth, 8, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(12);
      doc.setFont(undefined, 'bold');
      doc.text('Recommended Next Steps', margin + 3, yPosition + 5.5);
      yPosition += 12;

      doc.setTextColor(...textGray);
      doc.setFontSize(10);
      doc.setFont(undefined, 'normal');
      const steps = analysis.next_steps_list?.length > 0
        ? analysis.next_steps_list
        : analysis.next_steps.split(/[.!]\s+/).filter(s => s.trim());

      steps.forEach(step => {
        const stepText = typeof step === 'string'
          ? (step.trim() + (step.trim().match(/[.!]$/) ? '' : '.'))
          : step;
        yPosition = drawWrappedStyledText(`• ${stepText}`, margin + 5, yPosition, contentWidth - 10);
        yPosition += 1;
      });
    }

    // Footer
    const footerY = pageHeight - 15;
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text('Generated by RecruBotX - AI-Powered CV Screening', pageWidth / 2, footerY, { align: 'center' });

    // Save PDF
    const fileName = `CV_Analysis_${analysis.candidate_name || 'Report'}_${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);
  };

  // Show loading state while checking authentication
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
      <style>{animationStyles}</style>
      <CandidateSidebar />

      {/* Main Content */}
      <main className="flex-1 h-screen flex flex-col overflow-hidden py-8 px-8">
        {/* Top Header */}
        <div className="mb-6 flex-shrink-0 flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold text-[#0a2a5e]">Resume Analyzer</h2>
            <p className="text-gray-500 text-md mt-1 py-2">Upload your resume and paste the job description to analyze compatibility.</p>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-lg p-8 w-full">
            {/* Upload and Job Description Side by Side */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* Upload Section */}
              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2"><Upload className="w-5 h-5" /> Upload Your CV</h3>
                <div className="border-2 border-dashed border-[#0a2a5e]/30 rounded-xl p-8 flex flex-col items-center justify-center hover:bg-[#0a2a5e]/5 transition h-64">
                  <Upload className="w-12 h-12 text-[#0a2a5e] mb-3" />
                  <input
                    id="fileUpload"
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <label
                    htmlFor="fileUpload"
                    className="cursor-pointer text-[#0a2a5e] font-medium hover:underline text-center"
                  >
                    {file ? (
                      <div className="flex items-center gap-2">
                        <FileText className="w-5 h-5" />
                        <span>{file.name}</span>
                      </div>
                    ) : (
                      "Click to upload your CV (.pdf / .docx)"
                    )}
                  </label>
                </div>
              </div>

              {/* Job Description Section */}
              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2"><FileText className="w-5 h-5" /> Job Description <span className="text-red-500">*</span> <span className="text-sm font-normal text-gray-500">(Required)</span></h3>
                <textarea
                  value={jobDesc}
                  onChange={(e) => setJobDesc(e.target.value)}
                  className="w-full p-4 rounded-lg border-2 border-gray-300 focus:border-[#0a2a5e] focus:outline-none h-64 resize-none"
                  placeholder="Paste the job description here to analyze compatibility with your CV..."
                />
              </div>
            </div>

            {/* Analyze Button */}
            <div className="mb-6 flex justify-center">
              <button
                onClick={handleAnalyze}
                disabled={loading || !file || !jobDesc.trim()}
                className={`w-1/4 py-4 rounded-lg font-semibold transition flex items-center justify-center gap-2 shadow-lg ${loading || !file || !jobDesc.trim() ? 'bg-gray-400 cursor-not-allowed text-gray-200' : 'bg-gradient-to-r from-[#0a2a5e] to-[#0d3b82] text-white hover:from-[#061a3d] hover:to-[#0a2a5e]'}`}
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin w-5 h-5" />
                    Analyzing Your CV...
                  </>
                ) : (
                  <>
                    <FileText className="w-5 h-5" />
                    Analyze Resume
                  </>
                )}
              </button>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            {/* Analysis Results */}
            {analysis && typeof analysis === 'object' && (
              <div className="mt-8 space-y-6">
                {/* Header */}
                <div className="bg-[#0a2a5e] text-white rounded-2xl p-6 shadow-xl">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Sparkles className="w-8 h-8 text-yellow-300" />
                      <div>
                        <h2 className="text-2xl font-bold">AI Analysis Results</h2>
                        {analysis.candidate_name && analysis.candidate_name !== 'Unknown' && (
                          <p className="text-blue-100 text-sm mt-1">Analysis for <span className="font-semibold text-white">{analysis.candidate_name}</span></p>
                        )}
                      </div>
                    </div>
                    {/* Recommendation Badge on Right Side (Only show when JD is provided) */}
                    {analysis.recommendation && analysis.hasJobDescription && (
                      <div className="px-6 py-3 rounded-xl text-base font-semibold shadow-lg border-2 transition-all duration-300 hover:shadow-2xl hover:scale-105 animation-pulse bg-gradient-to-br from-[#0a2a5e] to-[#0d3b82] text-white border-[#0a2a5e]/50 border-pulse-blue">
                        <div className="flex items-center gap-2">
                          {analysis.recommendation === 'Strongly Recommend' && <CheckCircle className="w-5 h-5" />}
                          {analysis.recommendation === 'Recommend' && <ThumbsUp className="w-5 h-5" />}
                          {analysis.recommendation === 'Consider' && <AlertCircle className="w-5 h-5" />}
                          {analysis.recommendation === 'Not Recommended' && <AlertTriangle className="w-5 h-5" />}
                          <span>{analysis.recommendation}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Match Scores - Bullet Format (Only show when JD is provided) */}
                {analysis.hasJobDescription && (
                  <div className="bg-white p-6 rounded-xl border-l-4 border-[#0a2a5e] shadow-lg">
                    <h3 className="text-lg font-bold text-[#0a2a5e] mb-4 flex items-center gap-2">
                      <span className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-[#0a2a5e] border-2 border-[#0a2a5e]/30">
                        <Target className="w-5 h-5" />
                      </span>
                      Compatibility Analysis
                    </h3>
                    <ul className="space-y-3">
                      <li className="flex items-start gap-3 text-gray-700">
                        <span className="w-6 h-6 rounded-full flex items-center justify-center text-[#0a2a5e] font-bold text-xs flex-shrink-0 mt-0.5">✓</span>
                        <span className="leading-relaxed"><span className="font-semibold text-[#0a2a5e]">Overall Match:</span> {analysis.overall_score || 0}%</span>
                      </li>
                      <li className="flex items-start gap-3 text-gray-700">
                        <span className="w-6 h-6 rounded-full flex items-center justify-center text-[#0a2a5e] font-bold text-xs flex-shrink-0 mt-0.5">✓</span>
                        <span className="leading-relaxed"><span className="font-semibold text-[#0a2a5e]">Skills Match:</span> {analysis.skills_match || 0}%</span>
                      </li>
                      <li className="flex items-start gap-3 text-gray-700">
                        <span className="w-6 h-6 rounded-full flex items-center justify-center text-[#0a2a5e] font-bold text-xs flex-shrink-0 mt-0.5">✓</span>
                        <span className="leading-relaxed"><span className="font-semibold text-[#0a2a5e]">Experience Match:</span> {analysis.experience_match || 0}%</span>
                      </li>
                      <li className="flex items-start gap-3 text-gray-700">
                        <span className="w-6 h-6 rounded-full flex items-center justify-center text-[#0a2a5e] font-bold text-xs flex-shrink-0 mt-0.5">✓</span>
                        <span className="leading-relaxed"><span className="font-semibold text-[#0a2a5e]">Education Match:</span> {analysis.education_match || 0}%</span>
                      </li>
                    </ul>
                  </div>
                )}

                {/* Professional Summary - Blue Theme */}
                {analysis.professional_summary && (
                  <div className="bg-white from-[#0a2a5e]/5 to-[#0a2a5e]/10 p-6 rounded-xl border-l-4 border-[#0a2a5e] shadow-lg">
                    <h3 className="text-lg font-bold text-[#0a2a5e] mb-3 flex items-center gap-2">
                      <span className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-[#0a2a5e] border-2 border-[#0a2a5e]/30">
                        <User className="w-5 h-5" />
                      </span>
                      Professional Summary
                    </h3>
                    <ul className="space-y-3">
                      {analysis.professional_summary.split(/[.!]\s+/).filter(s => s.trim()).map((point, index) => (
                        <li key={index} className="flex items-start gap-3 text-gray-700">
                          <span className="w-6 h-6 rounded-full flex items-center justify-center text-[#0a2a5e] font-bold text-xs flex-shrink-0 mt-0.5">✓</span>
                          <span className="leading-relaxed">{renderTextWithBold(point.trim())}{point.trim().match(/[.!]$/) ? '' : '.'}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Strengths */}
                {analysis.strengths && analysis.strengths.length > 0 && (
                  <div className="bg-white p-6 rounded-xl border-l-4 border-[#0a2a5e] shadow-lg hover:shadow-xl transition">
                    <h3 className="text-lg font-bold text-[#0a2a5e] mb-4 flex items-center gap-2">
                      <span className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-[#0a2a5e] border-2 border-[#0a2a5e]/30">
                        <Award className="w-5 h-5" />
                      </span>
                      Key Strengths
                    </h3>
                    <ul className="space-y-3">
                      {analysis.strengths.map((strength, index) => (
                        <li key={index} className="flex items-start gap-3 text-gray-700">
                          <span className="w-6 h-6 rounded-full flex items-center justify-center text-[#0a2a5e] font-bold text-xs flex-shrink-0 mt-0.5">✓</span>
                          <span className="leading-relaxed">{renderTextWithBold(strength)}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}


                {/* Areas for Improvement */}
                {analysis.weaknesses && analysis.weaknesses.length > 0 && (
                  <div className="bg-white p-6 rounded-xl border-l-4 border-[#0a2a5e] shadow-lg hover:shadow-xl transition">
                    <h3 className="text-lg font-bold text-[#0a2a5e] mb-4 flex items-center gap-2">
                      <span className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-[#0a2a5e] border-2 border-[#0a2a5e]/30">
                        <TrendingUp className="w-5 h-5" />
                      </span>
                      Areas for Development
                    </h3>
                    <ul className="space-y-3">
                      {analysis.weaknesses.map((weakness, index) => (
                        <li key={index} className="flex items-start gap-3 text-gray-700">
                          <span className="w-6 h-6 rounded-full flex items-center justify-center text-[#0a2a5e] font-bold text-xs flex-shrink-0 mt-0.5">✓</span>
                          <span className="leading-relaxed">{renderTextWithBold(weakness)}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Next Steps - Blue Theme */}
                {(analysis.next_steps_list?.length > 0 || analysis.next_steps) && (
                  <div className="bg-white p-6 rounded-xl border-l-4 border-[#0a2a5e] shadow-lg hover:shadow-xl transition">
                    <h3 className="text-lg font-bold text-[#0a2a5e] mb-4 flex items-center gap-2">
                      <span className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-[#0a2a5e] border-2 border-[#0a2a5e]/30">
                        <ArrowRight className="w-5 h-5" />
                      </span>
                      Recommended Next Steps
                    </h3>
                    <ul className="space-y-3">
                      {(analysis.next_steps_list?.length > 0
                        ? analysis.next_steps_list
                        : analysis.next_steps.split(/[.!]\s+/).filter(s => s.trim())
                      ).map((step, index) => (
                        <li key={index} className="flex items-start gap-3 text-gray-700">
                          <span className="w-6 h-6 rounded-full flex items-center justify-center text-[#0a2a5e] font-bold text-xs flex-shrink-0 mt-0.5">✓</span>
                          <span className="leading-relaxed">{renderTextWithBold(typeof step === 'string' ? (step.trim().match(/[.!]$/) ? step.trim() : step.trim() + '.') : step)}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Download Report Button */}
                <div className="mt-8 flex justify-center">
                  <button
                    onClick={downloadReport}
                    className="bg-gradient-to-r from-[#0a2a5e] to-[#0d3b82] hover:from-[#061a3d] hover:to-[#0a2a5e] text-white px-8 py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-3 transform hover:scale-105"
                  >
                    <Download className="w-5 h-5" />
                    Download Report
                  </button>
                </div>
              </div>
            )}
          </div>
        </div >
      </main >
    </div >
  );
};

export default AnalyzeResume;
