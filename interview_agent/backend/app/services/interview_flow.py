from app.models.interview import InterviewState, InterviewConfig, InterviewStage
from app.services.llm_service import LLMService
from app.core.prompts import INTERVIEWER_SYSTEM_PROMPT, STAGE_INSTRUCTIONS
from typing import Dict, Optional
import uuid

class InterviewFlowManager:
    def __init__(self):
        self.sessions: Dict[str, InterviewState] = {}
        self.llm_service = LLMService()

    def create_session(self, config: InterviewConfig) -> str:
        session_id = str(uuid.uuid4())
        self.sessions[session_id] = InterviewState(
            candidate_name=config.candidate_name,
            job_role=config.job_role,
            stage=InterviewStage.INTRODUCTION
        )
        return session_id

    def get_session(self, session_id: str) -> Optional[InterviewState]:
        return self.sessions.get(session_id)

    async def process_input(self, session_id: str, user_input: str):
        session = self.get_session(session_id)
        if not session:
            yield "Error: Session not found."
            return

        # 1. Update Transcript with User Input
        session.transcript.append({"role": "candidate", "content": user_input})
        
        # 2. Determine Stage & Instructions
        current_stage = session.stage
        interaction_count = len([x for x in session.transcript if x["role"] == "interviewer"])

        # Simple Stage Transition Logic (could be improved with LLM logic later)
        if current_stage == InterviewStage.INTRODUCTION and interaction_count > 0:
            session.stage = InterviewStage.WARMUP
        elif current_stage == InterviewStage.WARMUP and interaction_count > 2:
            session.stage = InterviewStage.CORE
        elif current_stage == InterviewStage.CORE and interaction_count > 7:
            session.stage = InterviewStage.WRAPUP

        stage_instructions = STAGE_INSTRUCTIONS.get(session.stage.value, "")

        # 3. Construct History
        history = []
        
        # Add System Prompt
        system_prompt = INTERVIEWER_SYSTEM_PROMPT.format(
            candidate_name=session.candidate_name,
            job_role=session.job_role,
            stage=session.stage.value,
            stage_instructions=stage_instructions
        )
        history.append({"role": "system", "content": system_prompt})

        # Add Chat History
        for msg in session.transcript[-10:]: # Keep last 10 turns
             # Map roles for Groq/Llama
             role = "user" if msg["role"] == "candidate" else "assistant"
             history.append({"role": role, "content": msg["content"]})

        # 4. Generate AI Response
        # We pass user_input as prompt, LLMService appends it as user message.
        ai_response_chunks = []
        async for chunk in self.llm_service.generate_response(user_input, history=history):
            ai_response_chunks.append(chunk)
            yield chunk

        full_response = "".join(ai_response_chunks)
        
        # 5. Update Transcript with AI Response
        session.transcript.append({"role": "interviewer", "content": full_response})

        if "interview is now concluded" in full_response.lower():
            session.stage = InterviewStage.FINISHED
