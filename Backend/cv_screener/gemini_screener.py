"""
Gemini CV Screener
==================

AI-powered CV screening using Google Gemini 1.5 Flash model.

This module provides intelligent CV analysis by comparing candidate resumes
against job descriptions and generating detailed scoring and recommendations.
"""

import os
import json
import re
import asyncio
from pathlib import Path
from typing import Dict, Any, List, Optional
from google import genai
from google.genai import types
from dotenv import load_dotenv

# Load environment variables
load_dotenv()


class GeminiCVScreener:
    """
    AI-Powered CV Screening System
    """
    
    # Primary model name - using 2.5 flash for stability
    MODEL_NAME = "gemini-2.5-flash"
    
    def __init__(self, api_key: Optional[str] = None):
        """Initialize the CV screener."""
        self.api_key = api_key or os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")
        
        if not self.api_key:
            print("[ERROR] GEMINI_API_KEY not found in environment variables!")
            raise ValueError("GEMINI_API_KEY not found.")
        
        try:
            self.client = genai.Client(api_key=self.api_key)
            print("[DEBUG] Gemini Client initialized successfully")
        except Exception as e:
            print(f"[ERROR] Failed to initialize Gemini Client: {e}")
            self.client = None
        
        # Configure generation settings
        self.generation_config = types.GenerateContentConfig(
            temperature=0.1,
            top_p=0.95,
            top_k=40,
            max_output_tokens=8192,
        )

        # Debug: List available models to help resolve 404 errors
        if self.client:
            try:
                print("[DEBUG] Listing available Gemini models:")
                models = self.client.models.list()
                for m in models:
                    print(f"  - {m.name}")
            except Exception as e:
                print(f"[DEBUG] Could not list models (this is normal for limited API keys): {e}")
        
        self.screening_prompt = """
You are an elite HR recruiter and career strategist. Analyze the provided CV against the Job Description.
Return ONLY a valid JSON object.

## JOB DESCRIPTION:
{job_description}

## CV CONTENT:
{cv_content}

## OUTPUT FORMAT (Return ONLY valid JSON):
{{
    "candidate_name": "Full Name",
    "overall_score": 0-100,
    "skills_match": 0-100,
    "experience_match": 0-100,
    "education_match": 0-100,
    "strengths": ["list of 3-5 specific strengths"],
    "weaknesses": ["list of 3-5 specific areas for improvement"],
    "recommendation": "Strongly Recommend / Recommend / Consider / Not Recommended",
    "summary": "2-3 sentences executive summary"
}}
"""

        # Dedicated prompt for candidate-facing detailed analysis (JD is mandatory)
        self.candidate_analysis_prompt = """
You are a world-class Senior Hiring Manager with over 100 years of combined recruitment expertise and an ATS-friendly resume analyzer.
Your task is to perform a thorough, detailed comparison of the candidate's CV/Resume against the provided Job Description.
Be specific, actionable, and reference exact requirements from the JD throughout your analysis.

Return ONLY a valid JSON object.

## JOB DESCRIPTION:
{job_description}

## CV CONTENT:
{cv_content}

## INSTRUCTIONS:
1. **Professional Summary**: Write a detailed, multi-paragraph professional summary (at least 5-6 sentences) that evaluates the candidate holistically against the JD. Mention specific skills, years of experience, education, and how they align or misalign with the role. This summary should be easy for the candidate to read and understand exactly where they stand.
2. **Key Strengths**: Provide AT LEAST 6 specific strengths. Each strength MUST reference a requirement from the JD and explain how the candidate meets or exceeds it. Be specific — cite exact skills, technologies, or experiences from the CV that match the JD.
3. **Areas for Development**: Provide AT LEAST 6 specific areas where the candidate falls short relative to the JD. Each point MUST reference a specific JD requirement that is missing, weak, or under-represented in the CV. Offer constructive phrasing.
4. **Recommended Next Steps**: Provide AT LEAST 6 actionable, specific recommendations. Each recommendation should be tied to a gap identified in the analysis and reference the JD. Include suggestions like courses, certifications, projects, or experience to gain.
5. **Scores**: Provide percentage-based match scores comparing the CV to the JD.
6. **Recommendation**: Based on the overall analysis, classify as one of: "Strongly Recommend", "Recommend", "Consider", or "Not Recommended".

## OUTPUT FORMAT (Return ONLY valid JSON — no markdown, no extra text):
{{
    "candidate_name": "Full Name extracted from CV",
    "overall_score": 0-100,
    "skills_match": 0-100,
    "experience_match": 0-100,
    "education_match": 0-100,
    "professional_summary": "Detailed multi-paragraph professional summary comparing CV to JD (at least 5-6 sentences)",
    "strengths": ["strength 1 referencing JD", "strength 2 referencing JD", "...at least 6 items"],
    "weaknesses": ["area for development 1 referencing JD", "area 2 referencing JD", "...at least 6 items"],
    "next_steps": ["specific actionable step 1 tied to JD gap", "step 2", "...at least 6 items"],
    "recommendation": "Strongly Recommend / Recommend / Consider / Not Recommended",
    "summary": "2-3 sentence executive summary for quick reference"
}}
"""

        self.master_screening_prompt = """
You are an AI CV evaluation engine.

Your task:
Evaluate the candidate CV strictly based on relevance to the provided job description.

Use only the structured CV data provided.
Do NOT invent information.
Do NOT assume missing data.

Return ONLY valid JSON.
Do NOT include explanation.
Do NOT include markdown.
Do NOT include extra text.

Scoring Scale:
0 = Not Relevant
100 = Highly Relevant

Scoring Criteria:
- technical_score (40%)
- experience_score (30%)
- project_score (20%)
- education_score (10%)

Calculate overall_cv_score as weighted average.

Return format:

{{
  "technical_score": number,
  "experience_score": number,
  "project_score": number,
  "education_score": number,
  "overall_cv_score": number
}}

Job Description:
{job_description}

Parsed CV Data:
{cv_content}
"""

        self.weighted_screening_prompt = """
You are an elite HR recruiter and career strategist. Analyze the provided CV against the Job Description.
Score the candidate on each of the following criteria from 0 to 100. Also extract the candidate's name and email address from the CV.
Return ONLY a valid JSON object.

## JOB DESCRIPTION:
{job_description}

## CV CONTENT:
{cv_content}

## SCORING CRITERIA (score each 0-100):
1. Professional Experience - Relevant work experience, job roles, duration, and career progression
2. Projects and Achievements - Notable projects, accomplishments, awards, and measurable results
3. Educational Qualifications - Degrees, academic performance, relevant coursework
4. Certifications and Licenses - Professional certifications, industry licenses, accreditations
5. Publications - Research papers, articles, conference presentations, patents
6. Technical Skills - Programming languages, tools, frameworks, technical competencies relevant to the role
7. Other Details - Soft skills, languages, volunteer work, extracurricular activities, cultural fit

## OUTPUT FORMAT (Return ONLY valid JSON):
{{
    "candidate_name": "Full Name from CV",
    "email": "email@example.com extracted from CV or empty string if not found",
    "professional_experience": 0-100,
    "projects_achievements": 0-100,
    "educational_qualifications": 0-100,
    "certifications_licenses": 0-100,
    "publications": 0-100,
    "technical_skills": 0-100,
    "other_details": 0-100,
    "strengths": ["list of 3-5 specific strengths"],
    "weaknesses": ["list of 3-5 specific areas for improvement"],
    "recommendation": "Strongly Recommend / Recommend / Consider / Not Recommended",
    "summary": "2-3 sentences executive summary"
}}
"""

    def _process_response(self, response: Any, file_name: str) -> Dict[str, Any]:
        """Parse and clean the AI response."""
        try:
            result_text = (response.text or "").strip()
            
            # Clean up markdown blocks
            if result_text.startswith("```"):
                result_text = re.sub(r'^```(?:json)?\s*\n?', '', result_text)
                result_text = re.sub(r'\n?```\s*$', '', result_text)
            
            try:
                result = json.loads(result_text)
            except json.JSONDecodeError:
                json_match = re.search(r'\{[\s\S]*\}', result_text)
                if json_match:
                    result = json.loads(json_match.group())
                else:
                    raise ValueError(f"Could not parse JSON: {result_text[:100]}")
            
            # Defaults and normalization
            result["file_name"] = file_name
            result.setdefault("candidate_name", "Unknown")
            result.setdefault("overall_score", 0)
            result.setdefault("skills_match", 0)
            result.setdefault("experience_match", 0)
            result.setdefault("education_match", 0)
            result.setdefault("strengths", [])
            result.setdefault("weaknesses", [])
            result.setdefault("recommendation", "Not Evaluated")
            result.setdefault("summary", "No summary generated")
            
            return result
        except Exception as e:
            print(f"[ERROR] Failed to process Gemini response: {e}")
            raise e

    async def _call_gemini(self, prompt: str, file_name: str) -> Dict[str, Any]:
        """Call Gemini with fallback model support."""
        if not self.client:
            return self._error_response(file_name, "Gemini Client not initialized. Check API Key.")

        loop = asyncio.get_event_loop()
        try:
            try:
                print(f"[DEBUG] Attempting analysis with {self.MODEL_NAME}...")
                response = await loop.run_in_executor(
                    None,
                    lambda: self.client.models.generate_content(
                        model=self.MODEL_NAME,
                        contents=prompt,
                        config=self.generation_config
                    )
                )
                return self._process_response(response, file_name)
            except Exception as e:
                error_str = str(e)
                if "404" in error_str:
                    print(f"[WARNING] 404 for {self.MODEL_NAME}. Trying fallback models...")
                    for fallback in ["gemini-1.5-flash", "gemini-2.0-flash-exp", "gemini-1.5-flash-8b", "gemini-1.5-pro"]:
                        if fallback == self.MODEL_NAME: continue
                        try:
                            print(f"[DEBUG] Trying fallback: {fallback}")
                            response = await loop.run_in_executor(
                                None,
                                lambda: self.client.models.generate_content(
                                    model=fallback,
                                    contents=prompt,
                                    config=self.generation_config
                                )
                            )
                            return self._process_response(response, file_name)
                        except:
                            continue
                raise e
        except Exception as e:
            error_msg = str(e)
            print(f"[ERROR] Gemini call failed: {error_msg}")
            if "11001" in error_msg or "getaddrinfo failed" in error_msg:
                return self._error_response(file_name, "Network Error: Cannot reach AI servers. Please check your internet/DNS settings.")
            return self._error_response(file_name, f"AI Analysis failed: {error_msg}")

    async def screen_cv(self, job_description: str, cv_content: str, file_name: str) -> Dict[str, Any]:
        """Screen a CV using Gemini (original generic prompt)."""
        prompt = self.screening_prompt.format(
            job_description=job_description,
            cv_content=cv_content
        )
        return await self._call_gemini(prompt, file_name)

    async def screen_cv_candidate(self, job_description: str, cv_content: str, file_name: str) -> Dict[str, Any]:
        """Screen a CV using the detailed candidate analysis prompt (JD is mandatory)."""
        prompt = self.candidate_analysis_prompt.format(
            job_description=job_description,
            cv_content=cv_content
        )
        return await self._call_gemini(prompt, file_name)

    async def screen_cv_master(self, job_description: str, cv_content: str, file_name: str) -> Dict[str, Any]:
        """Screen a CV using the master screening prompt (Anti-Gravity)."""
        prompt = self.master_screening_prompt.format(
            job_description=job_description,
            cv_content=cv_content
        )
        result = await self._call_gemini(prompt, file_name)
        
        # Ensure the expected keys exist even if the model fails
        return {
            "technical_score": float(result.get("technical_score", 0)),
            "experience_score": float(result.get("experience_score", 0)),
            "project_score": float(result.get("project_score", 0)),
            "education_score": float(result.get("education_score", 0)),
            "overall_cv_score": float(result.get("overall_cv_score", 0))
        }

    async def screen_cv_weighted(self, job_description: str, cv_content: str, file_name: str, weightages: Dict[str, float]) -> Dict[str, Any]:
        """
        Screen a CV using the weighted criteria prompt.
        Computes a weighted final score based on recruiter-defined percentages.
        """
        prompt = self.weighted_screening_prompt.format(
            job_description=job_description,
            cv_content=cv_content
        )
        result = await self._call_gemini(prompt, file_name)

        # If error response, return as-is
        if result.get("candidate_name") == "Error During Analysis":
            return result

        # Compute weighted score from sub-scores
        criteria_keys = [
            "professional_experience", "projects_achievements",
            "educational_qualifications", "certifications_licenses",
            "publications", "technical_skills", "other_details"
        ]
        weighted_score = 0.0
        for key in criteria_keys:
            sub_score = float(result.get(key, 0))
            weight = float(weightages.get(key, 0))
            weighted_score += sub_score * (weight / 100.0)

        result["overall_score"] = round(weighted_score, 2)
        result["weightages_applied"] = weightages
        return result

    def _error_response(self, file_name: str, message: str) -> Dict[str, Any]:
        """Generate a consistent error response structure."""
        return {
            "candidate_name": "Error During Analysis",
            "file_name": file_name,
            "overall_score": 0,
            "skills_match": 0,
            "experience_match": 0,
            "education_match": 0,
            "strengths": [],
            "weaknesses": [message],
            "recommendation": "Technical Error",
            "summary": message
        }

    async def compare_candidates(self, job_description: str, candidates: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Compare multiple candidates."""
        if not candidates:
            return {"error": "No candidates to compare"}
        
        ranked = sorted(candidates, key=lambda x: x.get("overall_score", 0), reverse=True)
        prompt = f"Compare these candidates for the role: {job_description[:500]}\nCandidates: {json.dumps(ranked[:5])}"
        
        try:
            loop = asyncio.get_event_loop()
            response = await loop.run_in_executor(
                None,
                lambda: self.client.models.generate_content(
                    model=self.MODEL_NAME,
                    contents=prompt
                )
            )
            return {
                "ranked_candidates": ranked,
                "comparison_summary": response.text.strip(),
                "top_recommendation": ranked[0]
            }
        except Exception as e:
            return {"ranked_candidates": ranked, "comparison_summary": f"Error: {e}", "top_recommendation": ranked[0]}