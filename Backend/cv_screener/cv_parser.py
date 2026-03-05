"""
CV File Parser
==============

Utilities for extracting text content from various CV file formats.

Supported Formats:
- PDF (.pdf)
- Microsoft Word (.docx, .doc)
- Plain Text (.txt)

The parser automatically detects the file format and uses the appropriate
method to extract text content while handling encoding issues gracefully.

Author: RecruBotX Team
Version: 1.0.0
"""

import os
from typing import Optional, Callable


def parse_pdf(file_path: str) -> str:
    """
    Extract text from a PDF file.
    
    Args:
        file_path: Path to the PDF file
        
    Returns:
        Extracted text content
        
    Raises:
        Exception: If PDF parsing fails
    """
    try:
        from PyPDF2 import PdfReader
        
        reader = PdfReader(file_path)
        text_parts = []
        
        for page in reader.pages:
            page_text = page.extract_text()
            if page_text:
                text_parts.append(page_text)
        
        return "\n".join(text_parts).strip()
        
    except ImportError:
        raise Exception("PyPDF2 not installed. Run: pip install PyPDF2")
    except Exception as e:
        raise Exception(f"Error parsing PDF '{file_path}': {str(e)}")


def parse_docx(file_path: str) -> str:
    """
    Extract text from a Microsoft Word document.
    
    Args:
        file_path: Path to the DOCX/DOC file
        
    Returns:
        Extracted text content
        
    Raises:
        Exception: If DOCX parsing fails
    """
    try:
        from docx import Document
        
        doc = Document(file_path)
        paragraphs = [paragraph.text for paragraph in doc.paragraphs if paragraph.text.strip()]
        
        return "\n".join(paragraphs).strip()
        
    except ImportError:
        raise Exception("python-docx not installed. Run: pip install python-docx")
    except Exception as e:
        raise Exception(f"Error parsing DOCX '{file_path}': {str(e)}")


def parse_txt(file_path: str) -> str:
    """
    Extract text from a plain text file.
    
    Attempts UTF-8 encoding first, falls back to Latin-1 if needed.
    
    Args:
        file_path: Path to the TXT file
        
    Returns:
        File content as string
        
    Raises:
        Exception: If file reading fails
    """
    encodings = ["utf-8", "latin-1", "cp1252"]
    
    for encoding in encodings:
        try:
            with open(file_path, "r", encoding=encoding) as f:
                return f.read().strip()
        except UnicodeDecodeError:
            continue
    
    raise Exception(f"Could not decode text file '{file_path}' with common encodings")


# Supported file formats and their parser functions
FILE_PARSERS = {
    ".pdf": parse_pdf,
    ".docx": parse_docx,
    ".doc": parse_docx,
    ".txt": parse_txt,
}


def parse_cv_file(file_path: str) -> str:
    """
    Parse a CV file and extract its text content.
    
    Automatically detects the file format and uses the appropriate parser.
    Supports PDF, DOCX, DOC, and TXT formats.
    
    Args:
        file_path: Path to the CV file
        
    Returns:
        Extracted text content from the CV
        
    Raises:
        FileNotFoundError: If the file doesn't exist
        ValueError: If the file format is not supported
        Exception: If parsing fails
        
    Example:
        text = parse_cv_file("resume.pdf")
        print(f"Extracted {len(text)} characters")
    """
    # Validate file exists
    if not os.path.exists(file_path):
        raise FileNotFoundError(f"CV file not found: {file_path}")
    
    # Get file extension
    _, ext = os.path.splitext(file_path)
    ext = ext.lower()
    
    # Get appropriate parser
    parser_func = FILE_PARSERS.get(ext)
    
    if parser_func:
        return parser_func(file_path)
    
    # Fallback: try as plain text
    try:
        return parse_txt(file_path)
    except Exception:
        supported = ", ".join(FILE_PARSERS.keys())
        raise ValueError(
            f"Unsupported file format '{ext}'. Supported formats: {supported}"
        )
