"""
CV Screening and Ranking Service
Integrates with existing CV screener to rank candidates
"""

import base64
import io
from typing import List, Dict, Any
from cv_screener.gemini_screener import GeminiCVScreener
from cv_screener.cv_parser import parse_cv_file


class CVRankingService:
    """Service to screen and rank multiple CVs against a job description."""
    
    def __init__(self):
        self.screener = GeminiCVScreener()
    
    def decode_base64_file(self, base64_string: str) -> bytes:
        """Decode base64 string to bytes."""
        # Remove data URL prefix if present
        if ',' in base64_string:
            base64_string = base64_string.split(',')[1]
        return base64.b64decode(base64_string)
    
    async def screen_and_rank_cvs(
        self,
        cv_files: List[str],  # Base64 encoded files
        job_description: str,
        interview_field: str,
        position_level: str,
        number_of_questions: int,
        top_n: int
    ) -> List[Dict[str, Any]]:
        """
        Screen multiple CVs and return ranked candidates.
        
        Returns:
            List of ranked candidates with scores and evaluation details
        """
        candidates = []
        
        for idx, cv_base64 in enumerate(cv_files):
            try:
                # Decode CV file
                cv_bytes = self.decode_base64_file(cv_base64)
                
                # Save to temporary file
                import tempfile
                with tempfile.NamedTemporaryFile(delete=False, suffix='.pdf') as tmp_file:
                    tmp_file.write(cv_bytes)
                    tmp_file_path = tmp_file.name
                
                # Parse CV from temporary file
                cv_text = parse_cv_file(tmp_file_path)
                
                # Clean up temporary file
                import os
                os.unlink(tmp_file_path)
                
                # Screen CV against job description
                screening_result = await self.screener.screen_cv(
                    job_description=job_description,
                    cv_content=cv_text,
                    file_name=f"Candidate_{idx+1}.pdf"
                )
                
                # Extract candidate name from CV text (simple extraction)
                candidate_name = self._extract_candidate_name(cv_text, idx)
                
                # Calculate CV score (from screening)
                cv_score = screening_result.get("overall_score", 0)
                
                # Simulate interview score (in real system, this would come from interview data)
                # For now, use a random value between 70-95
                import random
                interview_score = random.uniform(70, 95)
                
                # Simulate facial recognition score (in real system, this would come from facial analysis)
                # For now, use a random value between 75-100
                facial_recognition_score = random.uniform(75, 100)
                
                # Calculate final weighted score
                # CV: 40%, Interview: 40%, Facial Recognition: 20%
                final_score = (cv_score * 0.4) + (interview_score * 0.4) + (facial_recognition_score * 0.2)
                
                # Extract skill scores
                skill_scores = {
                    "Technical Skills": screening_result.get("technical_skills_score", 0),
                    "Communication": screening_result.get("communication_score", 0),
                    "Problem Solving": screening_result.get("problem_solving_score", 0),
                    "Experience": screening_result.get("experience_score", 0)
                }
                
                candidates.append({
                    "candidate_name": candidate_name,
                    "score": final_score,
                    "cv_score": cv_score,
                    "interview_score": interview_score,
                    "facial_recognition_score": facial_recognition_score,
                    "completion": 100,  # Assuming all CVs are complete
                    "skill_scores": skill_scores,
                    "cv_data": {
                        "text": cv_text[:500],  # Store first 500 chars
                        "full_analysis": screening_result
                    },
                    "evaluation_details": screening_result
                })
                
            except Exception as e:
                print(f"Error processing CV {idx + 1}: {str(e)}")
                # Add failed candidate with low score
                candidates.append({
                    "candidate_name": f"Candidate {idx + 1}",
                    "score": 0,
                    "completion": 0,
                    "skill_scores": {},
                    "cv_data": None,
                    "evaluation_details": {"error": str(e)}
                })
        
        # Sort candidates by score (descending)
        candidates.sort(key=lambda x: x["score"], reverse=True)
        
        # Assign ranks
        for rank, candidate in enumerate(candidates, start=1):
            candidate["rank"] = rank
            
            # Determine interview status based on rank and top_n
            if rank <= top_n:
                candidate["interview_status"] = "Shortlisted"
            elif rank <= top_n + 5:
                candidate["interview_status"] = "Review"
            else:
                candidate["interview_status"] = "Not Selected"
        
        return candidates
    
    def _extract_candidate_name(self, cv_text: str, index: int) -> str:
        """
        Extract candidate name from CV text.
        This is a simple implementation - can be enhanced with NLP.
        """
        lines = cv_text.split('\n')
        # Try to find name in first few lines
        for line in lines[:5]:
            line = line.strip()
            if len(line) > 3 and len(line) < 50 and not any(char.isdigit() for char in line):
                # Simple heuristic: likely a name if it's short and has no numbers
                if ' ' in line:  # Has at least first and last name
                    return line
        
        # Fallback to generic name
        return f"Candidate {index + 1}"
