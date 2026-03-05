import React, { useState, useEffect, useRef } from 'react';
import {
    Mic,
    MicOff,
    Video,
    VideoOff,
    MessageSquare,
    User,
    Clock,
    ChevronRight,
    ChevronLeft, // Add ChevronLeft for restore button
    X
} from 'lucide-react';
import { ConversationState } from '../../services/ConversationStateMachine';
import { correctGrammar } from '../../utils/grammarUtils';

// Live Caption Component (Updated for Relative Flow)
const LiveCaption = ({ text, isVisible }) => {
    return (
        <div
            className={`transition-all duration-300 transform
                ${isVisible && text ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
            `}
        >
            <div className="live-caption">
                {text}
            </div>
        </div>
    );
};

const LiveInterviewSession = ({
    messages,
    status,
    interimText,
    candidateName,
    jobRole,
    onInterrupt,
    liveCaption, /* Accept liveCaption from App parent */
    onEndInterview,
    isConnected
}) => {
    // State
    const [isTranscriptVisible, setIsTranscriptVisible] = useState(true);
    const [elapsedTime, setElapsedTime] = useState(0);
    const [isMicOn, setIsMicOn] = useState(true);
    const [isCamOn, setIsCamOn] = useState(true);

    // Derived State
    const isAiSpeaking = status === ConversationState.AI_SPEAKING;
    const isUserSpeaking = status === ConversationState.PROCESSING || interimText.length > 0;
    const isListening = status === ConversationState.LISTENING;

    // Timer
    useEffect(() => {
        const timer = setInterval(() => setElapsedTime(prev => prev + 1), 1000);
        return () => clearInterval(timer);
    }, []);

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    // Video Preview
    const videoRef = useRef(null);
    useEffect(() => {
        let activeStream = null;
        let isMounted = true;

        const startVideo = async () => {
            if (!isCamOn) {
                if (videoRef.current) videoRef.current.srcObject = null;
                return;
            }
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
                if (!isMounted) {
                    // Stop it immediately if the component unmounted while waiting for user permission
                    stream.getTracks().forEach(track => track.stop());
                    return;
                }
                activeStream = stream;
                if (videoRef.current) videoRef.current.srcObject = stream;
            } catch (err) {
                console.error("Video access denied:", err);
            }
        };

        startVideo();

        return () => {
            isMounted = false;
            if (activeStream) {
                activeStream.getTracks().forEach(track => track.stop());
            }
            if (videoRef.current && videoRef.current.srcObject) {
                const tracks = videoRef.current.srcObject.getTracks();
                tracks.forEach(track => track.stop());
                videoRef.current.srcObject = null;
            }
        };
    }, [isCamOn]);

    // Auto-scroll Transcript
    const transcriptRef = useRef(null);
    useEffect(() => {
        if (transcriptRef.current) {
            transcriptRef.current.scrollTo({ top: transcriptRef.current.scrollHeight, behavior: 'smooth' });
        }
    }, [messages, interimText]);

    return (
        <div className="flex h-screen bg-slate-900 text-white overflow-hidden font-sans">

            {/* MAIN STAGE (Video Area) */}
            <div className="flex-1 flex flex-col relative transition-all duration-300">

                {/* TOP HEADER OVERLAY */}
                <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-start z-20 pointer-events-none">
                    <div className="bg-black/40 backdrop-blur-md px-4 py-2 rounded-full flex items-center gap-3 border border-white/10 pointer-events-auto">
                        <div className={`w-2.5 h-2.5 rounded-full ${isAiSpeaking ? 'bg-blue-500 animate-pulse' : 'bg-green-500'}`}></div>
                        <span className="text-sm font-medium text-slate-200">
                            {isAiSpeaking ? 'AI Speaking' : isListening ? 'Listening' : 'Thinking...'}
                        </span>
                        <div className="w-px h-4 bg-white/20 mx-1"></div>
                        <span className="text-sm font-mono text-slate-300 flex items-center gap-2">
                            <Clock className="w-3.5 h-3.5" />
                            {formatTime(elapsedTime)}
                        </span>
                    </div>

                    <div className="bg-black/40 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 pointer-events-auto flex items-center gap-3">
                        <span className="text-sm font-medium text-slate-200">{jobRole} Interview</span>
                        {isConnected !== undefined && (
                            <>
                                <div className="w-px h-4 bg-white/20 mx-1"></div>
                                {isConnected ? (
                                    <span className="flex items-center gap-2 text-green-400 font-medium text-sm">
                                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span> Connected
                                    </span>
                                ) : (
                                    <span className="flex items-center gap-2 text-orange-400 font-medium text-sm">
                                        <span className="w-2 h-2 rounded-full bg-orange-500"></span> Connecting...
                                    </span>
                                )}
                            </>
                        )}
                    </div>
                </div>

                {/* USER SELF-VIEW (FLOATING PIP) */}
                <div className="absolute top-24 right-6 w-48 aspect-video bg-black rounded-xl overflow-hidden shadow-2xl border border-white/10 group z-30">
                    {isCamOn ? (
                        <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover transform scale-x-[-1]" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center bg-slate-800">
                            <VideoOff className="w-6 h-6 text-slate-500" />
                        </div>
                    )}
                    <div className="absolute bottom-2 left-2 text-[10px] font-medium bg-black/60 px-2 py-0.5 rounded text-white">
                        You
                    </div>
                </div>

                {/* CENTRAL CONTENT (AI AVATAR) */}
                <div className="flex-1 flex flex-col items-center justify-center p-8 relative overflow-y-auto min-h-0 scrollbar-hide">

                    <div className="w-full flex flex-col items-center space-y-8">
                        {/* AI VISUALIZER */}
                        <div className={`relative transition-all duration-700 ${isAiSpeaking ? 'scale-110' : 'scale-100'}`}>
                            <div className="w-48 h-48 md:w-64 md:h-64 rounded-full bg-gradient-to-b from-slate-700 to-slate-800 flex items-center justify-center shadow-2xl relative z-10 border border-slate-600">
                                <User className="w-24 h-24 text-slate-400" />
                            </div>

                            {/* Glow/Pulse Effects */}
                            {isAiSpeaking && (
                                <>
                                    <div className="absolute inset-0 rounded-full bg-blue-500/20 blur-xl animate-pulse"></div>
                                    <div className="absolute -inset-4 rounded-full border border-blue-500/30 animate-ping opacity-20"></div>
                                </>
                            )}
                        </div>

                        {/* LIVE CAPTION - Now strictly under the avatar in flow */}
                        <div className="h-12 flex items-center justify-center w-full max-w-2xl px-4">
                            <LiveCaption text={correctGrammar(liveCaption)} isVisible={isAiSpeaking} />
                        </div>
                    </div>

                </div>

                {/* BOTTOM CONTROL BAR */}
                <div className="h-24 flex items-center justify-center z-20">

                    <div className="bg-slate-800/80 backdrop-blur-xl border border-white/10 px-6 py-3 rounded-2xl flex items-center gap-4 shadow-2xl mb-8">
                        <ControlBtn
                            icon={isMicOn ? Mic : MicOff}
                            active={isMicOn}
                            onClick={() => setIsMicOn(!isMicOn)}
                            label={isMicOn ? "Mute" : "Unmute"}
                        />
                        <ControlBtn
                            icon={isCamOn ? Video : VideoOff}
                            active={isCamOn}
                            onClick={() => setIsCamOn(!isCamOn)}
                            label={isCamOn ? "Stop Video" : "Start Video"}
                        />

                        <div className="w-px h-8 bg-white/10 mx-2"></div>

                        <button
                            onClick={() => setIsTranscriptVisible(!isTranscriptVisible)}
                            className={`p-3 rounded-xl transition-all flex flex-col items-center gap-1 ${isTranscriptVisible ? 'bg-blue-600/20 text-blue-400' : 'hover:bg-white/5 text-slate-400'}`}
                        >
                            <MessageSquare className="w-5 h-5" />
                        </button>

                        <div className="w-px h-8 bg-white/10 mx-2"></div>

                        <button
                            className="bg-red-500 hover:bg-red-600 text-white px-6 py-2.5 rounded-xl font-medium transition-colors text-sm"
                            onClick={() => {
                                if (onEndInterview) {
                                    onEndInterview();
                                } else {
                                    window.location.reload();
                                }
                            }}
                        >
                            End Interview
                        </button>
                    </div>
                </div>

                {/* RESTORE SIDEBAR BUTTON (Floating) */}
                {!isTranscriptVisible && (
                    <button
                        onClick={() => setIsTranscriptVisible(true)}
                        className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-slate-800/80 p-2 rounded-l-xl border-l border-t border-b border-slate-700 hover:bg-slate-700 transition-all z-30"
                    >
                        <ChevronLeft className="w-5 h-5 text-slate-400" />
                    </button>
                )}
            </div>

            {/* SIDEBAR (TRANSCRIPT) */}
            <div
                className={`bg-slate-900 border-l border-slate-700 flex flex-col z-30 transition-all duration-300 ease-in-out
                    ${isTranscriptVisible ? 'w-96 opacity-100 translate-x-0' : 'w-0 opacity-0 translate-x-full overflow-hidden'}`}
            >
                <div className="p-4 border-b border-slate-700 flex justify-between items-center bg-slate-800/50 min-w-[384px]"> {/* min-w to prevent content squishing during transition */}
                    <h3 className="font-semibold text-slate-200">Transcript</h3>
                    <button onClick={() => setIsTranscriptVisible(false)} className="bg-slate-700/50 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition-colors" title="Hide Transcript">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-4 min-w-[384px]" ref={transcriptRef}>
                    {messages.length === 0 && (
                        <p className="text-center text-slate-500 text-sm mt-10">Transcript will appear here...</p>
                    )}

                    {messages.map((msg, idx) => (
                        <div key={idx} className={`flex ${msg.role === 'candidate' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[85%] p-3 rounded-2xl text-sm leading-relaxed ${msg.role === 'candidate'
                                ? 'bg-blue-600 text-white rounded-tr-none'
                                : 'bg-slate-800 text-slate-200 rounded-tl-none border border-slate-700'
                                }`}>
                                <p>{correctGrammar(msg.content)}</p>
                            </div>
                        </div>
                    ))}

                    {interimText && (
                        <div className="flex justify-end">
                            <div className="max-w-[85%] p-3 rounded-2xl text-sm leading-relaxed bg-blue-600/50 text-white/90 rounded-tr-none animate-pulse">
                                <p>{correctGrammar(interimText)}...</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

        </div>
    );
};

const ControlBtn = ({ icon: Icon, active, onClick, label }) => (
    <button
        onClick={onClick}
        className={`p-3 rounded-xl transition-all flex flex-col items-center gap-1 min-w-[60px] ${active ? 'hover:bg-white/10 text-slate-200' : 'bg-red-500/20 text-red-400'
            }`}
    >
        <Icon className="w-5 h-5" />
        {/* <span className="text-[10px] font-medium opacity-80">{label}</span> */}
    </button>
);

export default LiveInterviewSession;
