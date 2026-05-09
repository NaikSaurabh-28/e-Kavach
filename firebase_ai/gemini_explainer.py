import os
from google import genai
from typing import List

def generate_scan_explanation(classification: str, issues: List[str], score: float) -> str:
    """
    Sends malware scan results to the Gemini API and returns a human-readable explanation.
    
    Args:
        classification (str): The type or classification of the threat.
        issues (list of str): A list of specific issues or indicators found.
        score (float): The threat score (e.g., out of 100).
        
    Returns:
        str: A human-readable, non-technical explanation from the Gemini API.
    """
    # Initialize the client. Make sure to set the GEMINI_API_KEY environment variable.
    # Note: This uses the modern google-genai SDK (pip install google-genai)
    client = genai.Client(api_key=os.environ.get("GEMINI_API_KEY"))
    
    issues_str = ", ".join(issues) if issues else "None specified"
    
    prompt = f"""
You are a cybersecurity assistant for Indian court clerks.
Explain the following malware finding in simple English. Keep it non-technical.

Threat Details:
- Classification: {classification}
- Issues Found: {issues_str}
- Threat Score: {score}/100

Please provide the explanation mentioning exactly these points:
- What was found
- Where it was found
- Why dangerous
- Possible impact
- Recommended action
"""

    try:
        # We recommend gemini-2.5-pro for complex reasoning and summarization tasks
        response = client.models.generate_content(
            model='gemini-2.5-pro',
            contents=prompt,
            config={
                'temperature': 0.2, # Low temperature for more factual responses
            }
        )
        return response.text
        
    except Exception as e:
        print(f"Error communicating with Gemini API: {e}")
        return "An error occurred while generating the explanation."

# Example usage:
# if __name__ == "__main__":
#     # Ensure you have your API key set in your environment
#     # os.environ["GEMINI_API_KEY"] = "your_api_key_here"
#     
#     explanation = generate_scan_explanation(
#         classification="Ransomware/Trojan",
#         issues=["Suspicious registry modification", "Encryption routine detected", "Unexpected network connection to known malicious IP"],
#         score=92.5
#     )
#     print(explanation)
