import { useState, useEffect } from 'react';

const DebugPanel = ({ debugInfo }) => {
    const [isOpen, setIsOpen] = useState(true);

    return (
        <div style={{
            position: 'fixed',
            bottom: '100px',
            right: '20px',
            width: '350px',
            backgroundColor: '#1a1a1a',
            border: '2px solid #00ff00',
            borderRadius: '8px',
            padding: '12px',
            fontSize: '11px',
            fontFamily: 'monospace',
            color: '#00ff00',
            zIndex: 9999,
            maxHeight: isOpen ? '400px' : '40px',
            overflow: 'hidden',
            transition: 'max-height 0.3s'
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <strong style={{ color: '#ffff00' }}>🔧 DEBUG PANEL</strong>
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    style={{
                        background: '#333',
                        color: '#fff',
                        border: 'none',
                        padding: '2px 8px',
                        cursor: 'pointer',
                        borderRadius: '3px'
                    }}
                >
                    {isOpen ? '−' : '+'}
                </button>
            </div>

            {isOpen && (
                <div style={{ overflow: 'auto', maxHeight: '350px' }}>
                    <div style={{ marginBottom: '8px' }}>
                        <div><strong>WebSocket:</strong> {debugInfo.wsStatus || 'Unknown'}</div>
                        <div><strong>Status:</strong> {debugInfo.status || 'Unknown'}</div>
                        <div><strong>Speech Recog:</strong> {debugInfo.speechStatus || 'Unknown'}</div>
                        <div><strong>Audio Playing:</strong> {debugInfo.audioPlaying ? 'YES' : 'NO'}</div>
                    </div>

                    <hr style={{ borderColor: '#333', margin: '8px 0' }} />

                    <div style={{ marginBottom: '8px' }}>
                        <strong>Recent Events:</strong>
                        <div style={{
                            maxHeight: '150px',
                            overflow: 'auto',
                            backgroundColor: '#0a0a0a',
                            padding: '4px',
                            marginTop: '4px',
                            fontSize: '10px'
                        }}>
                            {debugInfo.events && debugInfo.events.length > 0 ? (
                                debugInfo.events.slice(-10).reverse().map((event, idx) => (
                                    <div key={idx} style={{
                                        borderBottom: '1px solid #222',
                                        padding: '2px 0',
                                        color: event.includes('ERROR') ? '#ff0000' : '#00ff00'
                                    }}>
                                        {event}
                                    </div>
                                ))
                            ) : (
                                <div style={{ color: '#666' }}>No events yet</div>
                            )}
                        </div>
                    </div>

                    <hr style={{ borderColor: '#333', margin: '8px 0' }} />

                    <div>
                        <strong>Last Message:</strong>
                        <div style={{
                            backgroundColor: '#0a0a0a',
                            padding: '4px',
                            marginTop: '4px',
                            wordBreak: 'break-all',
                            fontSize: '10px',
                            maxHeight: '60px',
                            overflow: 'auto'
                        }}>
                            {debugInfo.lastMessage || 'None'}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DebugPanel;
