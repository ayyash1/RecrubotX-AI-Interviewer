from pydantic import BaseModel, Field
from typing import List, Optional
from enum import Enum

class InterviewStage(str, Enum):
    INTRODUCTION = "introduction"
    WARMUP = "warmup"
    CORE = "core"
    WRAPUP = "wrapup"
    FINISHED = "finished"

class Question(BaseModel):
    text: str
    stage: InterviewStage
    difficulty: str = "medium"

class InterviewState(BaseModel):
    candidate_name: str
    job_role: str
    stage: InterviewStage = InterviewStage.INTRODUCTION
    questions_asked: List[Question] = []
    responses: List[str] = []
    skills_covered: List[str] = []
    current_difficulty: str = "medium"
    transcript: List[dict] = [] # {"role": "interviewer"|"candidate", "text": "..."}

class InterviewConfig(BaseModel):
    candidate_name: str
    job_role: str
    experience_level: str = "junior" # junior, mid, senior
