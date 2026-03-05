import React, { useState, useEffect, useRef } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { 
  Mic, MicOff, Send, CheckCircle, XCircle, Volume2, Loader, 
  LogOut, LayoutDashboard, Cog, Sparkles, Play, RotateCcw,
  Clock, Target, Award, TrendingUp, Upload, FileText
} from "lucide-react";
import { getCurrentUser, logoutUser } from "./utils/userDatabase";

const VoiceInterview = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [sessionId, setSessionId] = useState(null);
  const [isSetupComplete, setIsSetupComplete] = useState(false);
  
  // Setup state
  const [interviewField, setInterviewField] = useState("");
  const [positionLevel, setPositionLevel] = useState("");
  const [numQuestions, setNumQuestions] = useState(5);
  const [availableFields, setAvailableFields] = useState([]);
  const [availableLevels, setAvailableLevels] = useState([]);
  
  // Candidate Information
  const [candidateName, setCandidateName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [emailAddress, setEmailAddress] = useState("");
  const [education, setEducation] = useState("");
  const [projects, setProjects] = useState("");
  const [skills, setSkills] = useState("");
  const [experience, setExperience] = useState("");
  const [cvFile, setCvFile] = useState(null);
  
  // Interview state
  const [currentQuestion, setCurrentQuestion] = useState("");
  const [currentQuestionNum, setCurrentQuestionNum] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(5);
  const [userAnswer, setUserAnswer] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [currentScore, setCurrentScore] = useState(null);
  const [isComplete, setIsComplete] = useState(false);
  
  // Final report
  const [reportData, setReportData] = useState(null);
  
  // Audio visualization
  const [audioLevel, setAudioLevel] = useState(0);
  const animationRef = useRef(null);
  
  // Audio recording
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const audioStreamRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const silenceTimerRef = useRef(null);
  const recordingTimerRef = useRef(null);
  const lastSoundTimeRef = useRef(Date.now());

  // Get current user and fetch fields on mount
  useEffect(() => {
    const currentUser = getCurrentUser();
    if (!currentUser) {
      navigate("/signin/candidate");
    } else {
      setUser(currentUser);
    }
    fetchAvailableFields();
  }, [navigate]);

  const handleLogout = () => {
    logoutUser();
    navigate("/signin/candidate");
  };

  const fetchAvailableFields = async () => {
    try {
      const response = await fetch("http://localhost:8000/api/voice-interview/available-fields");
      const data = await response.json();
      if (data.success) {
        setAvailableFields(data.fields);
        setAvailableLevels(data.levels);
      }
    } catch (error) {
      console.error("Error fetching fields:", error);
      setAvailableFields([
        "Software Engineering", "Data Science", "Web Development", 
        "Machine Learning", "DevOps", "Cybersecurity"
      ]);
      setAvailableLevels(["Junior", "Intermediate", "Senior"]);
    }
  };

  const handleCvFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.name.toLowerCase().endsWith('.pdf')) {
        alert('Only PDF files are allowed');
        e.target.value = '';
        return;
      }
      setCvFile(file);
    }
  };

  const startInterview = async () => {
    // Validate all required fields
    if (!interviewField || !positionLevel || !candidateName || !phoneNumber || 
        !emailAddress || !education || !projects || !skills || !experience || !cvFile) {
      alert("Please fill in all required fields including CV upload");
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailAddress)) {
      alert("Please enter a valid email address");
      return;
    }

    setIsProcessing(true);
    try {
      const formData = new FormData();
      formData.append('cv_file', cvFile);
      formData.append('interview_field', interviewField);
      formData.append('position_level', positionLevel);
      formData.append('num_questions', numQuestions);
      formData.append('candidate_name', candidateName);
      formData.append('phone_number', phoneNumber);
      formData.append('email_address', emailAddress);
      formData.append('education', education);
      formData.append('projects', projects);
      formData.append('skills', skills);
      formData.append('experience', experience);

      const response = await fetch("http://localhost:8000/api/voice-interview/start-session-with-cv", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      if (data.success) {
        setSessionId(data.session_id);
        setCurrentQuestion(data.question);
        setCurrentQuestionNum(data.current_question);
        setTotalQuestions(data.total_questions);
        setIsSetupComplete(true);
        
        // Speak the question
        speakQuestion(data.question);
      } else {
        alert(data.detail || "Failed to start interview");
      }
    } catch (error) {
      console.error("Error starting interview:", error);
      alert("Failed to start interview. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const speakQuestion = (text) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => {
      setIsSpeaking(false);
      // Automatically start recording after question is spoken
      setTimeout(() => {
        startRecording(true);
      }, 500);
    };
    window.speechSynthesis.speak(utterance);
  };

  const startRecording = async (isAutomatic = false) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioStreamRef.current = stream;
      audioChunksRef.current = [];

      // Setup audio context for real-time level monitoring
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      audioContextRef.current = audioContext;
      
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      analyserRef.current = analyser;
      
      const source = audioContext.createMediaStreamSource(stream);
      source.connect(analyser);

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        
        // Clean up
        if (audioContextRef.current) {
          audioContextRef.current.close();
        }
        if (audioStreamRef.current) {
          audioStreamRef.current.getTracks().forEach(track => track.stop());
        }
        
        // Clear timers
        if (silenceTimerRef.current) {
          clearInterval(silenceTimerRef.current);
        }
        if (recordingTimerRef.current) {
          clearTimeout(recordingTimerRef.current);
        }
        
        await submitAudioAnswer(audioBlob);
      };

      mediaRecorder.start();
      setIsRecording(true);
      lastSoundTimeRef.current = Date.now();

      // Start silence detection (check every 100ms)
      silenceTimerRef.current = setInterval(() => {
        monitorAudioLevel();
      }, 100);

      // Set maximum recording time (1 minute)
      recordingTimerRef.current = setTimeout(() => {
        if (isRecording) {
          console.log("⏱️ Maximum recording time reached (1 minute)");
          stopRecording();
        }
      }, 60000); // 60 seconds

    } catch (error) {
      console.error("Error accessing microphone:", error);
      if (!isAutomatic) {
        alert("Could not access microphone. Please check permissions or type your answer.");
      }
    }
  };

  const monitorAudioLevel = () => {
    if (!analyserRef.current) return;

    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
    analyserRef.current.getByteFrequencyData(dataArray);

    // Calculate average volume
    const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
    setAudioLevel(average);

    // Silence detection threshold (adjust based on environment)
    const silenceThreshold = 10;
    const currentTime = Date.now();

    if (average > silenceThreshold) {
      // Sound detected, reset silence timer
      lastSoundTimeRef.current = currentTime;
    } else {
      // Check if 4 seconds of silence
      const silenceDuration = (currentTime - lastSoundTimeRef.current) / 1000;
      
      if (silenceDuration >= 4 && isRecording) {
        console.log("🤫 4 seconds of silence detected, stopping recording...");
        stopRecording();
      }
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setAudioLevel(0);
      
      // Clear intervals
      if (silenceTimerRef.current) {
        clearInterval(silenceTimerRef.current);
        silenceTimerRef.current = null;
      }
      if (recordingTimerRef.current) {
        clearTimeout(recordingTimerRef.current);
        recordingTimerRef.current = null;
      }
    }
  };

  const submitAudioAnswer = async (audioBlob) => {
    setIsProcessing(true);
    try {
      const formData = new FormData();
      formData.append("session_id", sessionId);
      formData.append("audio_file", audioBlob, "recording.webm");

      const response = await fetch("http://localhost:8000/api/voice-interview/submit-answer", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      if (data.success) {
        setFeedback(data.feedback);
        setCurrentScore(data.score);
        
        // Check if interview is complete
        if (data.is_complete) {
          setIsComplete(true);
          await generateReport();
        } else {
          // Wait 3 seconds then get next question
          setTimeout(async () => {
            await getNextQuestion();
          }, 3000);
        }
      }
    } catch (error) {
      console.error("Error submitting audio:", error);
      alert("Failed to submit audio. Please try again or type your answer.");
    } finally {
      setIsProcessing(false);
    }
  };

  const submitAnswer = async () => {
    if (!userAnswer.trim()) {
      alert("Please provide an answer");
      return;
    }

    setIsProcessing(true);
    try {
      const formData = new FormData();
      formData.append("session_id", sessionId);
      formData.append("text_answer", userAnswer);

      const response = await fetch("http://localhost:8000/api/voice-interview/submit-answer", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      if (data.success) {
        setFeedback(data.feedback);
        setCurrentScore(data.score);
        
        // Check if interview is complete
        if (data.is_complete) {
          setIsComplete(true);
          await generateReport();
        } else {
          // Wait 3 seconds then get next question
          setTimeout(async () => {
            await getNextQuestion();
          }, 3000);
        }
      }
    } catch (error) {
      console.error("Error submitting answer:", error);
      alert("Failed to submit answer. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const getNextQuestion = async () => {
    setFeedback("");
    setCurrentScore(null);
    setUserAnswer("");
    setIsProcessing(true);

    try {
      const response = await fetch(
        `http://localhost:8000/api/voice-interview/next-question?session_id=${sessionId}`,
        { method: "POST" }
      );

      const data = await response.json();
      if (data.success) {
        if (data.complete) {
          setIsComplete(true);
          await generateReport();
        } else {
          setCurrentQuestion(data.question);
          setCurrentQuestionNum(data.current_question);
          speakQuestion(data.question);
        }
      }
    } catch (error) {
      console.error("Error getting next question:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const generateReport = async () => {
    try {
      const response = await fetch(
        `http://localhost:8000/api/voice-interview/generate-report/${sessionId}`,
        { method: "POST" }
      );

      const data = await response.json();
      if (data.success) {
        setReportData(data.summary);
      }
    } catch (error) {
      console.error("Error generating report:", error);
    }
  };

  const restartInterview = () => {
    setSessionId(null);
    setIsSetupComplete(false);
    setCurrentQuestion("");
    setCurrentQuestionNum(0);
    setUserAnswer("");
    setFeedback("");
    setCurrentScore(null);
    setIsComplete(false);
    setReportData(null);
  };

  // Voice animation effect for AI speaking
  useEffect(() => {
    if (isSpeaking) {
      animationRef.current = setInterval(() => {
        setAudioLevel(Math.random() * 100);
      }, 100);
    } else {
      if (animationRef.current) {
        clearInterval(animationRef.current);
      }
      if (!isRecording) {
        setAudioLevel(0);
      }
    }

    return () => {
      if (animationRef.current) {
        clearInterval(animationRef.current);
      }
    };
  }, [isSpeaking]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (audioStreamRef.current) {
        audioStreamRef.current.getTracks().forEach(track => track.stop());
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
      if (silenceTimerRef.current) {
        clearInterval(silenceTimerRef.current);
      }
      if (recordingTimerRef.current) {
        clearTimeout(recordingTimerRef.current);
      }
    };
  }, []);

  // Loading state
  if (!user) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Sidebar Component
  const Sidebar = () => (
    <aside className="w-72 h-screen bg-white shadow-xl flex flex-col p-6 border-r border-gray-200 flex-shrink-0">
      <div className="mb-8 text-center flex-shrink-0">
        <h1 className="text-3xl font-bold text-blue-600">RecruBotX</h1>
      </div>

      <nav className="flex flex-col space-y-4 text-gray-700 flex-shrink-0">
        <NavLink
          to="/candidate/dashboard"
          className={({ isActive }) =>
            `font-medium px-4 py-3 rounded-xl transition-all flex items-center gap-2 ${isActive ? "bg-blue-50 text-blue-600" : "text-gray-700 hover:bg-gray-50 hover:text-blue-600"}`
          }
        >
          <LayoutDashboard className="w-5 h-5" /> Dashboard
        </NavLink>
        
        <NavLink
          to="/candidate/settings"
          className={({ isActive }) =>
            `font-medium px-4 py-3 rounded-xl transition-all flex items-center gap-2 ${isActive ? "bg-blue-50 text-blue-600" : "text-gray-700 hover:bg-gray-50 hover:text-blue-600"}`
          }
        >
          <Cog className="w-5 h-5" /> Settings
        </NavLink>
      </nav>

      <div className="mt-auto flex-shrink-0">
        <div className="mb-4 text-center pb-4 border-b border-gray-200">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4 text-white font-bold text-2xl shadow-lg overflow-hidden">
            {user.profileImage ? (
              <img src={user.profileImage} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <>{user.firstName?.charAt(0)}{user.lastName?.charAt(0)}</>
            )}
          </div>
          <h3 className="font-bold text-gray-800 text-lg">{user.firstName} {user.lastName}</h3>
          <p className="text-sm text-gray-500 mt-1">{user.email}</p>
        </div>

        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-red-500 to-red-600 px-4 py-3 rounded-xl text-white hover:from-red-600 hover:to-red-700 transition-all shadow-md"
        >
          <LogOut className="w-5 h-5" /> Logout
        </button>
      </div>
    </aside>
  );

  // Setup Screen
  if (!isSetupComplete) {
    return (
      <div className="h-screen w-screen flex bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden fixed inset-0">
        <Sidebar />
        
        <main className="flex-1 h-screen flex flex-col overflow-hidden py-6 px-10">
          {/* Welcome Banner */}
                  {/* Top Header */}
        <div className="flex justify-between items-center mb-3 flex-shrink-0">
          <div>
            <h2 className="text-3xl font-bold text-gray-800">AI Voice Interview</h2>
            <p className="mt-1 text-gray-500 text-md py-4">Practice technical interviews with intelligent feedback.</p>
          </div>
        </div>

          {/* Setup Form */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 overflow-hidden">
            {/* Configuration Card */}
            <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg p-8 flex flex-col overflow-hidden">
              <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2 flex-shrink-0">
                <Target className="w-6 h-6 text-blue-600" />
                Configure Your Interview
              </h3>

              <div className="space-y-4 overflow-y-auto pr-2" style={{maxHeight: 'calc(100vh - 300px)'}}>
                {/* Personal Information */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={candidateName}
                    onChange={(e) => setCandidateName(e.target.value)}
                    placeholder="Enter your full name"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition bg-gray-50 hover:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="+1-234-567-8900"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition bg-gray-50 hover:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={emailAddress}
                    onChange={(e) => setEmailAddress(e.target.value)}
                    placeholder="your.email@example.com"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition bg-gray-50 hover:bg-white"
                  />
                </div>

                {/* Interview Field */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Interview Field <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={interviewField}
                    onChange={(e) => setInterviewField(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition bg-gray-50 hover:bg-white"
                  >
                    <option value="">Select a field...</option>
                    {availableFields.map((field) => (
                      <option key={field} value={field}>{field}</option>
                    ))}
                  </select>
                </div>

                {/* Position Level */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Position Level <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {availableLevels.map((level) => (
                      <button
                        key={level}
                        type="button"
                        onClick={() => setPositionLevel(level)}
                        className={`p-3 rounded-xl border-2 transition-all ${
                          positionLevel === level
                            ? "border-blue-500 bg-blue-50 text-blue-700"
                            : "border-gray-200 hover:border-blue-300 hover:bg-gray-50"
                        }`}
                      >
                        <div className="font-semibold text-sm">{level}</div>
                        <div className="text-xs text-gray-500 mt-1">
                          {level === "Junior" && "0-2 years"}
                          {level === "Intermediate" && "2-5 years"}
                          {level === "Senior" && "5+ years"}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Education */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Education <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={education}
                    onChange={(e) => setEducation(e.target.value)}
                    placeholder="Bachelor of Computer Science, MIT, 2020&#10;Master of AI, Stanford, 2022"
                    rows={3}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition bg-gray-50 hover:bg-white resize-none"
                  />
                </div>

                {/* Projects */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Projects <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={projects}
                    onChange={(e) => setProjects(e.target.value)}
                    placeholder="AI Chatbot using NLP and Python&#10;E-commerce Platform with React and Node.js"
                    rows={3}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition bg-gray-50 hover:bg-white resize-none"
                  />
                </div>

                {/* Skills */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Skills <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={skills}
                    onChange={(e) => setSkills(e.target.value)}
                    placeholder="Python, JavaScript, React, MongoDB, FastAPI, Machine Learning"
                    rows={2}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition bg-gray-50 hover:bg-white resize-none"
                  />
                </div>

                {/* Experience */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Experience <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={experience}
                    onChange={(e) => setExperience(e.target.value)}
                    placeholder="3 years as Software Engineer at Tech Corp, worked on cloud infrastructure and microservices"
                    rows={3}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition bg-gray-50 hover:bg-white resize-none"
                  />
                </div>

                {/* CV Upload */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Upload Your CV <span className="text-red-500">*</span>
                  </label>
                  <div className="border-2 border-dashed border-blue-300 rounded-xl p-4 flex flex-col items-center justify-center hover:bg-blue-50 transition">
                    <Upload className="w-6 h-6 text-blue-600 mb-2" />
                    <input
                      id="cvFileUpload"
                      type="file"
                      accept=".pdf"
                      onChange={handleCvFileChange}
                      className="hidden"
                    />
                    <label
                      htmlFor="cvFileUpload"
                      className="cursor-pointer text-blue-600 font-medium hover:underline text-center text-sm"
                    >
                      {cvFile ? (
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4" />
                          <span>{cvFile.name}</span>
                        </div>
                      ) : (
                        "Click to upload your CV (.pdf)"
                      )}
                    </label>
                    <p className="text-xs text-gray-500 mt-1">PDF format only, max 10MB</p>
                  </div>
                </div>
              </div>

              <button
                onClick={startInterview}
                disabled={isProcessing || !interviewField || !positionLevel || !candidateName || !phoneNumber || !emailAddress || !education || !projects || !skills || !experience || !cvFile}
                className="w-full bg-blue-600 text-white py-4 rounded-xl font-semibold hover:bg-blue-700 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 mt-6 flex-shrink-0"
              >
                {isProcessing ? (
                  <>
                    <Loader className="w-5 h-5 animate-spin" />
                    Starting Interview...
                  </>
                ) : (
                  <>
                    <Play className="w-5 h-5" />
                    Start Interview
                  </>
                )}
              </button>
            </div>

            {/* Info Card */}
            <div className="bg-white rounded-2xl shadow-lg p-6 flex-shrink-0 overflow-y-auto"  style={{maxHeight: 'calc(100vh - 180px)'}}>
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-yellow-500" />
                How It Works
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-start gap-3 py-2">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 font-bold text-sm flex-shrink-0">1</div>
                  <div>
                    <p className="font-medium text-gray-800">Upload Your CV</p>
                    <p className="text-sm text-gray-500">Submit your resume in PDF format</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 py-2">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 font-bold text-sm flex-shrink-0">2</div>
                  <div>
                    <p className="font-medium text-gray-800">Start Your Interview</p>
                    <p className="text-sm text-gray-500">Click the Start Interview button to begin</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 py-2">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 font-bold text-sm flex-shrink-0">3</div>
                  <div>
                    <p className="font-medium text-gray-800">AI Asks Questions</p>
                    <p className="text-sm text-gray-500">Respond naturally with video feed</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 py-2">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 font-bold text-sm flex-shrink-0">4</div>
                  <div>
                    <p className="font-medium text-gray-800">Get Feedback</p>
                    <p className="text-sm text-gray-500">Receive instant AI-powered insights</p>
                  </div>
                </div>
              </div>

              <div className="mt-6 p-4 bg-blue-50 rounded-xl">
                <div className="flex items-center gap-2 text-blue-700 font-medium mb-2">
                  <Clock className="w-4 h-4" />
                  Recording Info
                </div>
                <p className="text-sm text-blue-600">
                  Auto-stops after 4 seconds of silence or 1 minute maximum per answer.
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Complete Screen
  if (isComplete && reportData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-3xl shadow-2xl p-8">
            <div className="text-center mb-8">
              <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-4" />
              <h1 className="text-4xl font-bold text-gray-800 mb-2">Interview Complete!</h1>
              <p className="text-gray-600">Great job completing the interview</p>
            </div>

            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Overall Score</h3>
                <div className="text-5xl font-bold text-blue-600">{reportData.avg_score}/100</div>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Performance Level</h3>
                <div className="text-2xl font-bold text-purple-600">{reportData.performance_level}</div>
              </div>
            </div>

            <div className="space-y-6 mb-8">
              {/* Strengths */}
              <div className="bg-green-50 rounded-2xl p-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                  Strengths
                </h3>
                <ul className="space-y-2">
                  {reportData.strengths.map((strength, idx) => (
                    <li key={idx} className="text-gray-700 flex items-start gap-2">
                      <span className="text-green-600 mt-1">•</span>
                      <span>{strength}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Areas for Improvement */}
              <div className="bg-orange-50 rounded-2xl p-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <XCircle className="w-6 h-6 text-orange-600" />
                  Areas for Improvement
                </h3>
                <ul className="space-y-2">
                  {reportData.improvements.map((improvement, idx) => (
                    <li key={idx} className="text-gray-700 flex items-start gap-2">
                      <span className="text-orange-600 mt-1">•</span>
                      <span>{improvement}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={restartInterview}
                className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition shadow-lg"
              >
                Start New Interview
              </button>
              <button
                onClick={() => navigate("/candidate/dashboard")}
                className="flex-1 bg-gray-200 text-gray-800 py-4 rounded-xl font-semibold hover:bg-gray-300 transition"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Interview Screen
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-3xl shadow-2xl p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">{interviewField}</h2>
              <p className="text-gray-600">{positionLevel} Level</p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-indigo-600">
                {currentQuestionNum}/{totalQuestions}
              </div>
              <p className="text-sm text-gray-600">Questions</p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-8">
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-gradient-to-r from-indigo-600 to-purple-600 h-3 rounded-full transition-all duration-500"
                style={{ width: `${(currentQuestionNum / totalQuestions) * 100}%` }}
              ></div>
            </div>
          </div>

          {/* Voice Visualization */}
          <div className="flex justify-center mb-8">
            <div className="relative">
              <div
                className={`w-32 h-32 rounded-full flex items-center justify-center transition-all duration-300 ${
                  isSpeaking
                    ? "bg-gradient-to-br from-blue-400 to-purple-500 shadow-xl"
                    : isRecording
                    ? "bg-gradient-to-br from-red-400 to-pink-500 shadow-xl"
                    : "bg-gradient-to-br from-gray-300 to-gray-400"
                }`}
                style={{
                  transform: `scale(${1 + audioLevel / 200})`,
                }}
              >
                {isSpeaking ? (
                  <Volume2 className="w-16 h-16 text-white" />
                ) : isRecording ? (
                  <Mic className="w-16 h-16 text-white animate-pulse" />
                ) : (
                  <MicOff className="w-16 h-16 text-white" />
                )}
              </div>
              
              {/* Animated rings */}
              {(isSpeaking || isRecording) && (
                <>
                  <div className="absolute inset-0 rounded-full border-4 border-white/30 animate-ping"></div>
                  <div className="absolute inset-0 rounded-full border-4 border-white/20 animate-pulse"></div>
                </>
              )}
            </div>
          </div>

          {/* Question */}
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl p-6 mb-6">
            <p className="text-sm text-gray-600 mb-2 font-semibold">Question:</p>
            <p className="text-xl text-gray-800 font-medium">{currentQuestion}</p>
          </div>

          {/* Recording Status */}
          {isRecording && (
            <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-4 mb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                  <span className="text-red-700 font-semibold">Recording your answer...</span>
                </div>
                <span className="text-sm text-red-600">
                  Stops after 4s silence or 1 minute max
                </span>
              </div>
              <div className="mt-3 text-sm text-red-600">
                💡 Speak clearly into your microphone. Recording will auto-stop when you're done.
              </div>
            </div>
          )}

          {/* Answer Input */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Your Answer {!isRecording && "(or type below)"}:
            </label>
            <textarea
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              placeholder="Voice recording in progress... or type your answer here"
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:outline-none transition resize-none"
              rows="6"
              disabled={isProcessing || isRecording}
            />
          </div>

          {/* Feedback */}
          {feedback && (
            <div className={`rounded-2xl p-6 mb-6 ${currentScore >= 70 ? 'bg-green-50' : currentScore >= 50 ? 'bg-yellow-50' : 'bg-red-50'}`}>
              <div className="flex items-start gap-3">
                {currentScore >= 70 ? (
                  <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                ) : (
                  <XCircle className="w-6 h-6 text-orange-600 flex-shrink-0 mt-1" />
                )}
                <div>
                  <p className="font-semibold text-gray-800 mb-1">Feedback:</p>
                  <p className="text-gray-700">{feedback}</p>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-4">
            {isRecording ? (
              <button
                onClick={stopRecording}
                disabled={isProcessing}
                className="flex-1 bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white py-4 rounded-xl font-semibold transition shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <MicOff className="w-5 h-5" />
                Stop Recording Now
              </button>
            ) : (
              <button
                onClick={submitAnswer}
                disabled={isProcessing || !userAnswer.trim()}
                className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-4 rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-700 transition shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isProcessing ? (
                  <>
                    <Loader className="w-5 h-5 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    Submit Typed Answer
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VoiceInterview;
