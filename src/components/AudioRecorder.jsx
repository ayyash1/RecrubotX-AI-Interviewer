import { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Send, Activity } from 'lucide-react';

/**
 * AudioRecorder Component
 * 
 * Modes:
 * 1. isRecording: Active listening for user speech -> Send to backend
 * 2. isDetectingInterrupt: Passive listening for loud speech -> Interrupt AI
 */
const AudioRecorder = ({
  onAudioData,
  onInterrupt,
  isRecording,
  isDetectingInterrupt
}) => {

  // Refs for current props to avoid stale closures in event listeners
  const isRecordingRef = useRef(isRecording);
  const isDetectingInterruptRef = useRef(isDetectingInterrupt);

  const detectionStartTimeRef = useRef(0);

  useEffect(() => {
    if (isDetectingInterrupt && !isDetectingInterruptRef.current) {
      detectionStartTimeRef.current = Date.now();
    }
    isRecordingRef.current = isRecording;
    isDetectingInterruptRef.current = isDetectingInterrupt;
  }, [isRecording, isDetectingInterrupt]);

  const [currentVolume, setCurrentVolume] = useState(0);
  const [micLabel, setMicLabel] = useState("");
  const [errorMessage, setErrorMessage] = useState(null);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const mediaRecorderRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const silenceTimerRef = useRef(null);
  const streamRef = useRef(null);
  const animationFrameRef = useRef(null);

  // VAD Configuration
  const VAD_THRESHOLD = 8;          // Recording trigger
  const INTERRUPT_THRESHOLD = 30;   // Higher threshold for barge-in
  const SILENCE_DURATION = 2000;    // Wait 2.0s before sending audio (User Requirement)

  // Initialize Microphone once
  useEffect(() => {
    initMicrophone();
    return () => cleanupMicrophone();
  }, []); // Run once on mount

  const initMicrophone = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      // Get Mic Label
      const track = stream.getAudioTracks()[0];
      setMicLabel(track.label || "Default Microphone");

      // Audio Context
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      audioContextRef.current = audioContext;

      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 512;
      source.connect(analyser);
      analyserRef.current = analyser;

      // MediaRecorder setup
      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0 && isRecordingRef.current) { // Check strict ref
          onAudioData(event.data);
        }
      };

      monitorAudioLevel();
    } catch (err) {
      console.error("Mic Access Error:", err);
      setErrorMessage("Microphone access denied");
    }
  };

  const cleanupMicrophone = () => {
    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
    }
  };

  const monitorAudioLevel = () => {
    if (!analyserRef.current) return;

    const dataArray = new Uint8Array(analyserRef.current.fftSize);
    analyserRef.current.getByteTimeDomainData(dataArray);

    // Calculate Volume (Root Mean Square or just simple deviation)
    let sum = 0;
    for (let i = 0; i < dataArray.length; i++) {
      const amplitude = Math.abs(dataArray[i] - 128);
      sum += amplitude;
    }
    const average = sum / dataArray.length;
    const normalizedVolume = Math.min(100, (average * 5)); // Amplify sensitivity

    setCurrentVolume(normalizedVolume);

    // --- LOGIC BRANCH ---

    // 1. Interrupt Detection Mode (AI Speaking)
    if (isDetectingInterruptRef.current) {
      if (normalizedVolume > INTERRUPT_THRESHOLD) {
        // Grace period: Ignore interrupts for first 1s of speech to avoid self-echo/noise causing instant stop
        if (Date.now() - detectionStartTimeRef.current > 1000) {
          console.log(`[VAD] Interrupt Detected! Vol: ${normalizedVolume.toFixed(1)}`);
          onInterrupt(); // Trigger immediate stop
        }
      }
    }

    // 2. Recording Mode (Listening)
    if (isRecordingRef.current) {
      if (normalizedVolume > VAD_THRESHOLD) {
        if (!isSpeaking) {
          console.log(`[VAD] Speech Start`);
          setIsSpeaking(true);
          if (mediaRecorderRef.current?.state === 'inactive') {
            mediaRecorderRef.current.start();
          }
        }

        // Definite speech -> Reset silence timer
        if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
        silenceTimerRef.current = setTimeout(() => {
          console.log(`[VAD] Speech End (Silence)`);
          setIsSpeaking(false);
          if (mediaRecorderRef.current?.state === 'recording') {
            // mediaRecorder.stop() triggers 'ondataavailable'
            mediaRecorderRef.current.stop();
          }
        }, SILENCE_DURATION);
      }
    }

    animationFrameRef.current = requestAnimationFrame(monitorAudioLevel);
  };

  // UI Helper
  const getStatusColor = () => {
    if (errorMessage) return 'bg-red-500';
    if (isRecording) return isSpeaking ? 'bg-green-500' : 'bg-blue-500'; // Active Listening
    if (isDetectingInterrupt) return 'bg-yellow-500'; // Interruption Watch
    return 'bg-gray-600'; // Idle/Processing
  };

  const getStatusText = () => {
    if (errorMessage) return errorMessage;
    if (isRecording) return isSpeaking ? "Listening..." : "Waiting for speech...";
    if (isDetectingInterrupt) return "AI Speaking (listening for interrupt)...";
    return "Processing...";
  };

  return (
    <div className="audio-recorder-container">

      {/* Status Indicator */}
      <div className="recorder-status">
        <div className={`status-indicator ${getStatusColor()}`} />
        <div className="status-text-wrapper">
          <span className="status-main-text">
            {getStatusText()}
          </span>
          <span className="mic-label">{micLabel}</span>
        </div>
      </div>

      {/* Volume & Controls */}
      <div className="volume-section">
        {isRecording ? <Mic className="volume-icon active" /> : <Activity className="volume-icon" />}

        {/* Volume Bar */}
        <div className="volume-track">
          <div
            className={`volume-level ${isDetectingInterrupt && currentVolume > INTERRUPT_THRESHOLD ? 'bg-red-500' :
              (isSpeaking ? 'bg-green-500' : 'bg-blue-400')
              }`}
            style={{ width: `${Math.min(100, currentVolume)}%` }}
          />
        </div>
      </div>

      {/* Manual Send Button */}
      {isSpeaking && isRecording && (
        <button
          onClick={() => {
            if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
            setIsSpeaking(false);
            if (mediaRecorderRef.current?.state === 'recording') {
              mediaRecorderRef.current.stop();
            }
          }}
          className="send-btn"
        >
          <Send className="w-3 h-3" />
          SEND
        </button>
      )}
    </div>
  );
};

export default AudioRecorder;
