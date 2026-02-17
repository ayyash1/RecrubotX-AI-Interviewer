import React, { useEffect, useRef, useState } from 'react';
import { Send } from 'lucide-react';

const InterviewInterface = ({
    messages,
    status,
    onAudioData,
    isConnected,
    onSendMessage,
    currentStage,
    interimText
}) => {
    const messagesEndRef = useRef(null);
    const [inputText, setInputText] = useState("");

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, interimText]);

    const handleSend = () => {
        if (inputText.trim()) {
            onSendMessage(inputText);
            setInputText("");
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') handleSend();
    };

    return (
        <div className="flex flex-col h-screen">
            {/* Header */}
            <header className="interview-header flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <div className={`status-dot ${isConnected ? 'online' : 'offline'}`} />
                    <h1 className="text-xl font-semibold">
                        RecruBotX <span className="text-secondary">AI Interviewer</span>
                    </h1>
                </div>
                <div className="flex items-center gap-4 text-sm">
                    <span className="stage-badge">
                        {currentStage || 'Initializing'}
                    </span>
                    <span className="text-secondary">
                        {status.toUpperCase()}
                    </span>
                </div>
            </header>

            {/* Chat Area */}
            <div className="chat-area">
                {messages.map((msg, idx) => (
                    <div key={idx} className={`message ${msg.role}`}>
                        <p className="leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                    </div>
                ))}
                {interimText && (
                    <div className="message candidate interim-placeholder">
                        <p>{interimText}...</p>
                    </div>
                )}
                {status === 'speaking' && !interimText && (
                    <div className="typing-dots">
                        <div className="dot" style={{ animationDelay: '0ms' }} />
                        <div className="dot" style={{ animationDelay: '150ms' }} />
                        <div className="dot" style={{ animationDelay: '300ms' }} />
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Controls Area */}
            <div className="p-6 bg-gray-900 border-t border-gray-800">
                <div className="flex gap-4 items-center">
                    <input
                        type="text"
                        className="input-box"
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
                        placeholder="Type a message if you prefer..."
                        disabled={status === 'processing'}
                    />
                    <button
                        onClick={handleSend}
                        disabled={!inputText.trim() || status === 'processing'}
                        className="primary-btn"
                    >
                        <Send className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default InterviewInterface;
