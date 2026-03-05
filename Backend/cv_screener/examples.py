"""
CV Screener Usage Examples
===========================

This file demonstrates various ways to use the cv_screener module.
"""

import asyncio
import os
from cv_screener import GeminiCVScreener, parse_cv_file


# Example 1: Basic CV Screening
async def example_basic_screening():
    """Screen a single CV against a job description."""
    
    print("=== Example 1: Basic CV Screening ===\n")
    
    # Initialize screener
    screener = GeminiCVScreener()
    
    # Sample job description
    job_description = """
    Software Engineer Position
    
    Requirements:
    - Bachelor's degree in Computer Science or related field
    - 3+ years of Python development experience
    - Experience with web frameworks (Django, FastAPI, Flask)
    - Strong problem-solving skills
    - Experience with Git and Agile methodologies
    
    Preferred:
    - AWS/Cloud platform experience
    - React or frontend framework knowledge
    - Open source contributions
    """
    
    # Parse CV (replace with actual CV path)
    cv_path = "cv/example_resume.pdf"
    if os.path.exists(cv_path):
        cv_content = parse_cv_file(cv_path)
        
        # Screen the CV
        result = await screener.screen_cv(
            job_description=job_description,
            cv_content=cv_content,
            file_name="example_resume.pdf"
        )
        
        # Display results
        print(f"Candidate: {result['candidate_name']}")
        print(f"Overall Score: {result['overall_score']}/100")
        print(f"\nDetailed Scores:")
        print(f"  Skills Match: {result['skills_match']}/100")
        print(f"  Experience Match: {result['experience_match']}/100")
        print(f"  Education Match: {result['education_match']}/100")
        print(f"\nRecommendation: {result['recommendation']}")
        print(f"\nSummary: {result['summary']}")
        
        if result['strengths']:
            print(f"\nStrengths:")
            for strength in result['strengths']:
                print(f"  ✓ {strength}")
        
        if result['weaknesses']:
            print(f"\nAreas for Improvement:")
            for weakness in result['weaknesses']:
                print(f"  • {weakness}")
    else:
        print(f"CV file not found: {cv_path}")


# Example 2: Batch Screening Multiple CVs
async def example_batch_screening():
    """Screen multiple CVs and rank them."""
    
    print("\n\n=== Example 2: Batch Screening Multiple CVs ===\n")
    
    screener = GeminiCVScreener()
    
    job_description = """
    Senior Full Stack Developer
    
    Must Have:
    - 5+ years software development
    - Python and JavaScript expertise
    - React, Node.js, FastAPI
    - Database design (PostgreSQL, MongoDB)
    - RESTful API development
    
    Nice to Have:
    - DevOps/CI-CD experience
    - Docker, Kubernetes
    - Team leadership
    """
    
    # List of CV files to screen
    cv_folder = "cv"
    cv_files = [
        "Nafeel Ahamed.pdf",
        "Saffiul Haq.pdf",
        "Safia.pdf"
    ]
    
    results = []
    
    print("Screening candidates...")
    for cv_file in cv_files:
        cv_path = os.path.join(cv_folder, cv_file)
        
        if os.path.exists(cv_path):
            try:
                cv_content = parse_cv_file(cv_path)
                result = await screener.screen_cv(
                    job_description=job_description,
                    cv_content=cv_content,
                    file_name=cv_file
                )
                results.append(result)
                print(f"  ✓ Screened {cv_file}")
            except Exception as e:
                print(f"  ✗ Error screening {cv_file}: {e}")
        else:
            print(f"  ✗ File not found: {cv_file}")
    
    if results:
        # Compare and rank candidates
        comparison = await screener.compare_candidates(job_description, results)
        
        print(f"\n=== Results ({len(results)} candidates) ===\n")
        
        for i, candidate in enumerate(comparison['ranked_candidates'], 1):
            print(f"{i}. {candidate['candidate_name']}")
            print(f"   Score: {candidate['overall_score']}/100")
            print(f"   Recommendation: {candidate['recommendation']}")
            print(f"   File: {candidate['file_name']}\n")
        
        print("=== AI Comparison Summary ===")
        print(comparison['comparison_summary'])


# Example 3: Error Handling
async def example_error_handling():
    """Demonstrate proper error handling."""
    
    print("\n\n=== Example 3: Error Handling ===\n")
    
    # Handle missing API key
    try:
        screener = GeminiCVScreener()
        print("✓ Screener initialized successfully")
    except ValueError as e:
        print(f"✗ Configuration error: {e}")
        return
    
    # Handle unsupported file format
    try:
        parse_cv_file("example.xyz")
    except ValueError as e:
        print(f"✓ Caught unsupported format: {e}")
    
    # Handle missing file
    try:
        parse_cv_file("nonexistent_file.pdf")
    except FileNotFoundError as e:
        print(f"✓ Caught missing file: {e}")
    
    # Handle parsing errors gracefully
    cv_path = "cv/JD01.txt"
    if os.path.exists(cv_path):
        try:
            content = parse_cv_file(cv_path)
            print(f"✓ Successfully parsed {cv_path}")
            print(f"  Extracted {len(content)} characters")
        except Exception as e:
            print(f"✗ Error parsing: {e}")


# Example 4: Custom API Key Usage
async def example_custom_api_key():
    """Use custom API key instead of environment variable."""
    
    print("\n\n=== Example 4: Custom API Key ===\n")
    
    # You can pass API key directly (not recommended for production)
    # api_key = "your_api_key_here"
    # screener = GeminiCVScreener(api_key=api_key)
    
    # Better: use environment variable (default behavior)
    screener = GeminiCVScreener()
    print("✓ Using API key from environment variable")


# Example 5: File Format Detection
def example_file_formats():
    """Show supported file formats."""
    
    print("\n\n=== Example 5: Supported File Formats ===\n")
    
    test_files = [
        ("resume.pdf", "PDF format"),
        ("resume.docx", "Microsoft Word format"),
        ("resume.doc", "Legacy Word format"),
        ("resume.txt", "Plain text format"),
    ]
    
    print("Supported formats:")
    for filename, description in test_files:
        print(f"  ✓ {filename} - {description}")
    
    print("\nNote: Files are automatically detected based on extension.")


# Main execution
async def main():
    """Run all examples."""
    
    print("=" * 60)
    print("CV SCREENER MODULE - USAGE EXAMPLES")
    print("=" * 60)
    
    # Run examples
    await example_basic_screening()
    # await example_batch_screening()  # Uncomment to run
    await example_error_handling()
    # await example_custom_api_key()  # Uncomment to run
    example_file_formats()
    
    print("\n" + "=" * 60)
    print("Examples completed!")
    print("=" * 60)


if __name__ == "__main__":
    # Check if we're in the correct directory
    if not os.path.exists("cv_screener"):
        print("Error: Please run this script from the Backend directory")
        print("Usage: cd Backend && python -m cv_screener.examples")
    else:
        asyncio.run(main())
