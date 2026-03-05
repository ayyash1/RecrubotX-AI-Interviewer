"""
CV Screener Package
====================

A comprehensive CV screening system using Google Gemini 2.5 Flash AI.

Main Components:
- GeminiCVScreener: AI-powered CV screening and ranking
- parse_cv_file: Extract text from PDF, DOCX, and TXT files

Usage Example:
    from cv_screener import GeminiCVScreener, parse_cv_file
    
    screener = GeminiCVScreener()
    cv_text = parse_cv_file("path/to/cv.pdf")
    result = await screener.screen_cv(job_description, cv_text, "cv.pdf")
"""

from .gemini_screener import GeminiCVScreener
from .cv_parser import parse_cv_file

__all__ = ["GeminiCVScreener", "parse_cv_file"]
__version__ = "1.0.0"
