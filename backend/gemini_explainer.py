import os
from typing import List

def generate_scan_explanation(classification: str, issues: List[str], score: float) -> str:
    """
    Sends malware scan results to the Gemini API and returns a human-readable explanation.
    Falls back to a built-in explanation if API key is missing or call fails.
    """
    issues_str = ", ".join(issues) if issues else "None"

    # --- Built-in fallback explanation (no API key required) ---
    def built_in_explanation() -> str:
        if classification == "Safe" or score == 0:
            return (
                "✅ Document Scan Complete — No Threats Found\n\n"
                "What was checked: The document was scanned for dangerous keywords, embedded scripts, "
                "suspicious macros, hidden executable payloads, and unusual encoding patterns.\n\n"
                "Result: The file appears safe. No malicious indicators were detected. "
                "It does not contain embedded JavaScript, macro viruses, shellcode, or suspicious network beacons.\n\n"
                "Recommended Action: This document can be safely submitted and processed through the e-Kavach filing system."
            )
        else:
            issue_text = "\n• ".join(issues) if issues else "General suspicious patterns"
            risk_level = "low" if score < 30 else "moderate" if score < 55 else "high" if score < 75 else "critical"
            return (
                f"⚠️ Threat Detected — {classification} (Score: {score}/100, Risk: {risk_level.upper()})\n\n"
                f"What was found:\n• {issue_text}\n\n"
                f"Why it is dangerous: Documents with these characteristics may attempt to run hidden programs, "
                f"steal sensitive information, or spread malware when opened. This is especially dangerous "
                f"in official court filing systems where many people access shared documents.\n\n"
                f"Possible Impact: If this document is opened on a government network, it could compromise "
                f"case records, expose confidential legal data, or infect other connected systems.\n\n"
                f"Recommended Action: Do NOT open or forward this file. Report it to your system administrator immediately. "
                f"The file has been quarantined and flagged for manual forensic review."
            )

    # Try Gemini API if key is available
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        print("[gemini_explainer] GEMINI_API_KEY not set — using built-in explanation.")
        return built_in_explanation()

    try:
        from google import genai

        client = genai.Client(api_key=api_key)

        prompt = f"""You are a cybersecurity assistant for Indian court clerks and advocates using the e-Kavach secure document filing portal.
Explain the following document scan result in simple, clear English. Avoid technical jargon.

Scan Results:
- Classification: {classification}
- Issues Found: {issues_str}
- Threat Score: {score}/100

Please structure your explanation with these sections:
1. What was found (simple description)
2. Where it was found (in the document structure)
3. Why it is dangerous (plain language risk)
4. Possible impact on court systems
5. Recommended action for the clerk/advocate

Keep the tone professional and helpful. If the file is Safe (score 0), reassure the user and explain what was checked."""

        response = client.models.generate_content(
            model='gemini-2.0-flash',
            contents=prompt,
            config={'temperature': 0.2},
        )
        return response.text

    except Exception as e:
        print(f"[gemini_explainer] Gemini API error: {e} — using built-in explanation.")
        return built_in_explanation()
