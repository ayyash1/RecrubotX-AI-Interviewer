"""
CV Information Extractor
=========================

Extracts structured information from CV text using Google Gemini AI.

Extracts:
- Contact Information (phone, email)
- Education
- Projects
- Skills
- Experience
- Certifications
- Professional Summary

Author: RecruBotX Team
"""

from google import genai
from google.genai import types
import os
import json
from typing import Dict, Any, List
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configure Gemini
# Prefer GEMINI_API_KEY for consistency across the project
GOOGLE_API_KEY = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")

if not GOOGLE_API_KEY:
    print("[WARNING] GEMINI_API_KEY not found in environment variables!")
    client = None
else:
    client = genai.Client(api_key=GOOGLE_API_KEY)
    print("[DEBUG] Google Gen AI Client initialized successfully")


def extract_cv_information(cv_text: str) -> Dict[str, Any]:
    """
    Extract structured information from CV text using AI.
    
    Args:
        cv_text: Raw text extracted from CV
        
    Returns:
        Dictionary containing extracted CV information with keys:
        - candidate_name: Full name of candidate
        - phone_number: Contact phone number
        - email_address: Email address
        - education: List of educational qualifications
        - projects: List of projects with descriptions
        - skills: List of technical and professional skills
        - experience: Years of experience or description
        - certifications: List of professional certifications
        - summary: Brief professional summary
    """
    
    prompt = f"""
You are an expert CV parser. Extract the following information from the CV text below and return it as a JSON object.

Extract:
1. candidate_name: Full name of the candidate (string)
2. phone_number: Phone number (string, format as found)
3. email_address: Email address (string)
4. education: List of educational qualifications with degree, institution, and year (list of strings)
5. projects: List of projects with brief descriptions (list of strings)
6. skills: List of all technical and professional skills (list of strings)
7. experience: Total years of experience or description of work experience (string)
8. certifications: List of professional certifications (list of strings)
9. summary: A brief professional summary (2-3 sentences) (string)

If any field is not found, use null for strings, empty array [] for lists.

Return ONLY a valid JSON object with these exact keys. No additional text.

CV Text:
{cv_text}

JSON Output:
"""
    
    # Check if API key is configured
    if not client:
        print("[ERROR] Cannot extract CV info: Google Gen AI Client not initialized")
        return {
            "candidate_name": None,
            "phone_number": None,
            "email_address": None,
            "education": [],
            "projects": [],
            "skills": [],
            "experience": None,
            "certifications": [],
            "summary": None,
            "error": "Google API Client not configured"
        }
    
    try:
        print(f"[DEBUG] Sending {len(cv_text)} characters to Gemini for extraction...")
        
        # Primary model
        target_model = "gemini-2.5-flash"
        
        try:
            response = client.models.generate_content(
                model=target_model,
                contents=prompt,
                config=types.GenerateContentConfig(
                    temperature=0.1,
                )
            )
        except Exception as e:
            if "404" in str(e):
                print(f"[WARNING] 404 for {target_model}. Trying fallback...")
                # Try fallback (Gemini 2.0 Flash)
                response = client.models.generate_content(
                    model="gemini-2.0-flash",
                    contents=prompt,
                    config=types.GenerateContentConfig(
                        temperature=0.1,
                    )
                )
            else:
                raise e
        
        # Extract JSON from response
        response_text = response.text.strip()
        print(f"[DEBUG] Received response from Gemini: {len(response_text)} characters")
        print(f"[DEBUG] Response preview: {response_text[:300]}...")
        
        # Remove markdown code blocks if present
        if response_text.startswith("```json"):
            response_text = response_text[7:]
        if response_text.startswith("```"):
            response_text = response_text[3:]
        if response_text.endswith("```"):
            response_text = response_text[:-3]
        
        response_text = response_text.strip()
        
        # Parse JSON
        print("[DEBUG] Parsing JSON response...")
        extracted_data = json.loads(response_text)
        print(f"[DEBUG] Successfully parsed JSON with {len(extracted_data)} fields")
        
        # Ensure all required fields exist with proper defaults
        result = {
            "candidate_name": extracted_data.get("candidate_name"),
            "phone_number": extracted_data.get("phone_number"),
            "email_address": extracted_data.get("email_address"),
            "education": extracted_data.get("education", []),
            "projects": extracted_data.get("projects", []),
            "skills": extracted_data.get("skills", []),
            "experience": extracted_data.get("experience"),
            "certifications": extracted_data.get("certifications", []),
            "summary": extracted_data.get("summary")
        }
        
        print(f"[DEBUG] Extraction successful - Name: {result.get('candidate_name')}, Skills: {len(result.get('skills', []))}")
        return result
        
    except json.JSONDecodeError as e:
        print(f"[ERROR] JSON parsing failed: {str(e)}")
        print(f"[ERROR] Raw response: {response_text[:500]}")
        # Return empty structure on error
        return {
            "candidate_name": None,
            "phone_number": None,
            "email_address": None,
            "education": [],
            "projects": [],
            "skills": [],
            "experience": None,
            "certifications": [],
            "summary": None,
            "error": f"JSON parsing failed: {str(e)}"
        }
    except Exception as e:
        print(f"[ERROR] CV extraction failed: {str(e)}")
        import traceback
        traceback.print_exc()
        # Return empty structure on error
        return {
            "candidate_name": None,
            "phone_number": None,
            "email_address": None,
            "education": [],
            "projects": [],
            "skills": [],
            "experience": None,
            "certifications": [],
            "summary": None,
            "error": str(e)
        }


def format_cv_summary(cv_data: Dict[str, Any]) -> str:
    """
    Format extracted CV data into a readable summary.
    
    Args:
        cv_data: Dictionary containing extracted CV information
        
    Returns:
        Formatted string summary of the CV
    """
    summary_parts = []
    
    if cv_data.get("candidate_name"):
        summary_parts.append(f"Candidate: {cv_data['candidate_name']}")
    
    if cv_data.get("email_address"):
        summary_parts.append(f"Email: {cv_data['email_address']}")
    
    if cv_data.get("phone_number"):
        summary_parts.append(f"Phone: {cv_data['phone_number']}")
    
    if cv_data.get("experience"):
        summary_parts.append(f"Experience: {cv_data['experience']}")
    
    if cv_data.get("education"):
        summary_parts.append(f"Education: {len(cv_data['education'])} qualification(s)")
    
    if cv_data.get("skills"):
        summary_parts.append(f"Skills: {', '.join(cv_data['skills'][:5])}" + 
                           (f" and {len(cv_data['skills']) - 5} more" if len(cv_data['skills']) > 5 else ""))
    
    if cv_data.get("projects"):
        summary_parts.append(f"Projects: {len(cv_data['projects'])} project(s)")
    
    if cv_data.get("certifications"):
        summary_parts.append(f"Certifications: {len(cv_data['certifications'])} certification(s)")
    
    return "\n".join(summary_parts)
