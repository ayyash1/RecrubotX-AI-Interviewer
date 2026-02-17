from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from app.services.interview_flow import InterviewFlowManager, InterviewConfig
from app.services.stt_service import STTService
from app.services.tts_service import TTSService
import json
import base64
import os
from datetime import datetime

router = APIRouter()
manager = InterviewFlowManager()
stt_service = STTService()
tts_service = TTSService() # Default voice is good, can change later

@router.websocket("/ws/interview")
async def websocket_endpoint(websocket: WebSocket):
    print("WebSocket connection attempt received")
    await websocket.accept()
    session_id = None
    
    try:
        while True:
            data = await websocket.receive_text()
            message = json.loads(data)
            
            msg_type = message.get("type")
            payload = message.get("payload")

            if msg_type == "start_interview":
                config = InterviewConfig(**payload)
                session_id = manager.create_session(config)
                await websocket.send_json({"type": "session_created", "payload": session_id})
                
                initial_input = "Hello, I am ready for the interview."
                full_response = ""
                print(f"Starting interview session: {session_id}")
                async for chunk in manager.process_input(session_id, initial_input):
                    full_response += chunk
                    await websocket.send_json({"type": "text_chunk", "payload": chunk})
                
                print(f"LLM Response: {full_response[:50]}...")
                
                # Generate TTS for full response
                try:
                    audio_bytes = await tts_service.generate_speech(full_response)
                    if audio_bytes:
                        print(f"TTS Generated: {len(audio_bytes)} bytes")
                        audio_b64 = base64.b64encode(audio_bytes).decode('utf-8')
                        await websocket.send_json({"type": "audio_output", "payload": audio_b64})
                    else:
                        print("TTS Generation returned None")
                except Exception as tts_e:
                    print(f"TTS Error: {tts_e}")
                
                await websocket.send_json({"type": "response_complete"})

            elif msg_type == "interrupt":
                print(f"Interruption received for session {session_id}")
                # Ideally, we would signal the generator to stop, but since we await full response,
                # we can't easily interrupt the currently running generate_speech loop in this simple architecture.
                # However, the frontend has already stopped playing audio.
                # For streaming architecture, we would set a flag here.
                pass

            elif msg_type == "audio_data":
                if not session_id:
                    print("Received audio_data without active session")
                    continue
                
                # Decode audio from frontend (webm/blob)
                print(f"Received audio_data payload: {len(payload)} chars")
                audio_bytes = base64.b64decode(payload)
                print(f"Decoded {len(audio_bytes)} bytes")
                text_input = await stt_service.transcribe(audio_bytes)
                print(f"Trascription result: '{text_input}'")
                
                if text_input:
                    await websocket.send_json({"type": "transcription", "payload": text_input})

                    full_response = ""
                    async for chunk in manager.process_input(session_id, text_input):
                        full_response += chunk
                        await websocket.send_json({"type": "text_chunk", "payload": chunk})
                    
                    # Generate TTS for full response
                    audio_bytes = await tts_service.generate_speech(full_response)
                    if audio_bytes:
                        audio_b64 = base64.b64encode(audio_bytes).decode('utf-8')
                        await websocket.send_json({"type": "audio_output", "payload": audio_b64})

                    await websocket.send_json({"type": "response_complete"})

                    # Check for Interview Completion
                    session = manager.get_session(session_id)
                    if session and session.stage.value == "finished":
                         print(f"Interview Finished for session {session_id}. Generating Report...")
                         # Placeholder Report (for now)
                         report = {
                             "score": 85,
                             "summary": "This is a placeholder report generated automatically as the interview concluded based on the 'finished' trigger. The candidate performed well.",
                             "skills": [
                                 {"name": "Communication", "score": 90, "feedback": "Excellent clarity."},
                                 {"name": "Technical", "score": 80, "feedback": "Solid foundation."},
                                 {"name": "Confidence", "score": 85, "feedback": "Very confident."}
                             ],
                             "strengths": ["Clear voice", "Good pacing"],
                             "weaknesses": ["Could elaborate more"],
                             "verdict": "Hire"
                         }
                         
                         # Save report to disk
                         save_report_to_disk(report, session.candidate_name)
                         
                         await websocket.send_json({"type": "report", "payload": report})

            elif msg_type == "text_input":
                if not session_id:
                    continue
                
                print(f"Processing text input for session {session_id}")
                full_response = ""
                async for chunk in manager.process_input(session_id, payload):
                    full_response += chunk
                    await websocket.send_json({"type": "text_chunk", "payload": chunk})
                
                print(f"LLM Response: {full_response[:50]}...")

                # Generate TTS for full response
                try:
                    audio_bytes = await tts_service.generate_speech(full_response)
                    if audio_bytes:
                        print(f"TTS Generated: {len(audio_bytes)} bytes")
                        audio_b64 = base64.b64encode(audio_bytes).decode('utf-8')
                        await websocket.send_json({"type": "audio_output", "payload": audio_b64})
                    else:
                        print("TTS Generation returned None")
                except Exception as tts_e:
                    print(f"TTS Error: {tts_e}")

                await websocket.send_json({"type": "response_complete"})

    except WebSocketDisconnect:
        print(f"Client disconnected: {session_id}")
    except Exception as e:
        import traceback
        traceback.print_exc()
        print(f"WebSocket Error: {e}")
        try:
            await websocket.send_json({"type": "error", "payload": str(e)})
        except:
            pass
        await websocket.close()

def save_report_to_disk(report_data: dict, candidate_name: str):
    try:
        # Create directory
        directory = "reports/candidates"
        os.makedirs(directory, exist_ok=True)
        
        # Create filename
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        safe_name = "".join([c for c in candidate_name if c.isalnum() or c in (' ', '_')]).strip().replace(' ', '_')
        filename = f"{directory}/{safe_name}_{timestamp}_report.json"
        
        # Save
        with open(filename, "w") as f:
            json.dump(report_data, f, indent=4)
        
        print(f"Report saved to {filename}")
        return filename
    except Exception as e:
        print(f"Error saving report: {e}")
        return None
