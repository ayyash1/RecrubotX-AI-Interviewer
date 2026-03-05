from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends
import json
import asyncio
from typing import Dict
import uuid

from database.connection import get_database
from services.interview_service import InterviewService

router = APIRouter(prefix="/ws", tags=["Interview WebSockets"])

class ConnectionManager:
    def __init__(self):
        # Maps session_id to WebSocket connection
        self.active_connections: Dict[str, WebSocket] = {}

    async def connect(self, websocket: WebSocket, session_id: str):
        await websocket.accept()
        self.active_connections[session_id] = websocket

    def disconnect(self, session_id: str):
        if session_id in self.active_connections:
            del self.active_connections[session_id]

    async def send_json(self, session_id: str, message: dict):
        if session_id in self.active_connections:
            await self.active_connections[session_id].send_json(message)

manager = ConnectionManager()


@router.websocket("/interview/{session_id}")
async def websocket_endpoint(websocket: WebSocket, session_id: str):
    await manager.connect(websocket, session_id)
    
    # Import locally to avoid circular import since main.py imports this router
    from main import get_interview_service
    service = get_interview_service()
    
    # We must grab the DB dependency manually since it's a websocket and Depends(get_database)
    # can be tricky in older FastAPI versions without async generators
    # But since service already has db, we can use it.
    
    try:
        while True:
            # Wait for any message from the client
            data = await websocket.receive_text()
            
            try:
                message = json.loads(data)
                msg_type = message.get("type")
                payload = message.get("payload")
                
                if msg_type == "start_interview":
                    # Let the frontend know we are ready
                    await manager.send_json(session_id, {
                        "type": "session_created",
                        "payload": "Session connected securely."
                    })
                    
                    # Generate the first greeting
                    async for chunk in service.process_input(session_id, "INIT"):
                        await manager.send_json(session_id, {
                            "type": "text_chunk",
                            "payload": chunk
                        })
                        
                    # After text finishes streaming, we capture the full response generated
                    # and synthesize it into Audio
                    session_data = await service.get_session(session_id)
                    if session_data:
                        session, _ = session_data
                        if session.transcript:
                            last_interviewer_msg = session.transcript[-1]["content"]
                        audio_bytes = await service.tts_service.generate_speech(last_interviewer_msg)
                        import base64
                        if audio_bytes:
                            b64 = base64.b64encode(audio_bytes).decode("utf-8")
                            await manager.send_json(session_id, {
                                "type": "audio_output",
                                "payload": b64
                            })
                            
                elif msg_type == "audio_data":
                    # Candidate sent a chunk of microphone audio
                    import base64
                    audio_bytes = base64.b64decode(payload)
                    
                    transcription = await service.transcribe_audio(audio_bytes)
                    
                    if transcription and transcription.strip():
                        # Echo back transcription to UI
                        await manager.send_json(session_id, {
                            "type": "transcription",
                            "payload": transcription
                        })
                        
                        # Send transcription to LLM and stream response back
                        async for chunk in service.process_input(session_id, transcription):
                            await manager.send_json(session_id, {
                                "type": "text_chunk",
                                "payload": chunk
                            })
                            
                        # Generate TTS for the completed phrase
                        session_data = await service.get_session(session_id)
                        if session_data:
                            session, _ = session_data
                            last_interviewer_msg = session.transcript[-1]["content"]
                            tts_bytes = await service.tts_service.generate_speech(last_interviewer_msg)
                            if tts_bytes:
                                b64 = base64.b64encode(tts_bytes).decode('utf-8')
                                await manager.send_json(session_id, {
                                    "type": "audio_output",
                                    "payload": b64
                                })

                            if session.stage.value == "finished":
                                # Notify frontend we're calculating
                                await manager.send_json(session_id, {
                                    "type": "interview_concluding",
                                    "payload": "Calculating results..."
                                })
                                # Handle interview end
                                report_dict = await service.finalize_interview(session_id)
                                await manager.send_json(session_id, {
                                    "type": "report",
                                    "payload": report_dict
                                })
                                
                elif msg_type == "text_data":
                    transcription = payload
                    if transcription and transcription.strip():
                        # Echo back transcription to UI
                        await manager.send_json(session_id, {
                            "type": "transcription",
                            "payload": transcription
                        })
                        
                        # Send transcription to LLM and stream response back
                        async for chunk in service.process_input(session_id, transcription):
                            await manager.send_json(session_id, {
                                "type": "text_chunk",
                                "payload": chunk
                            })
                            
                        # Generate TTS for the completed phrase
                        session_data = await service.get_session(session_id)
                        if session_data:
                            session, _ = session_data
                            last_interviewer_msg = session.transcript[-1]["content"]
                            tts_bytes = await service.tts_service.generate_speech(last_interviewer_msg)
                            import base64
                            if tts_bytes:
                                b64 = base64.b64encode(tts_bytes).decode('utf-8')
                                await manager.send_json(session_id, {
                                    "type": "audio_output",
                                    "payload": b64
                                })

                            if session.stage.value == "finished":
                                # Notify frontend we're calculating
                                await manager.send_json(session_id, {
                                    "type": "interview_concluding",
                                    "payload": "Calculating results..."
                                })
                                # Handle interview end
                                report_dict = await service.finalize_interview(session_id)
                                await manager.send_json(session_id, {
                                    "type": "report",
                                    "payload": report_dict
                                })
                                    
                elif msg_type == "interrupt":
                    # Handled natively by wiping the current audio play queue on frontend
                    # Nothing strictly needed on backend unless we want to flag the conversation
                    pass
                    
            except json.JSONDecodeError:
                pass
                
    except WebSocketDisconnect:
        manager.disconnect(session_id)
    except Exception as e:
        import traceback
        traceback.print_exc()
        manager.disconnect(session_id)
