import io
import math
import re
import zipfile
import os
from fastapi import FastAPI, File, UploadFile, HTTPException, Form
from typing import Dict, Any, List, Optional
import google.generativeai as genai

app = FastAPI(title="AI Malware Document Scanner")

# Gemini Configuration
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "YOUR_GEMINI_API_KEY")
genai.configure(api_key=GEMINI_API_KEY)
model = genai.GenerativeModel('gemini-1.5-pro-latest')

DANGEROUS_KEYWORDS = [
    b"cmd.exe", b"powershell", b"eval(", b"shellcode", b"wscript.shell", 
    b"vba", b"autoopen", b"wmic", b"mimikatz", b"invoke-expression"
]

URL_REGEX = re.compile(rb"https?://(?:[-\w.]|(?:%[\da-fA-F]{2}))+")

def calculate_entropy(data: bytes) -> float:
    if not data:
        return 0.0
    entropy = 0
    for x in range(256):
        p_x = float(data.count(x)) / len(data)
        if p_x > 0:
            entropy += - p_x * math.log2(p_x)
    return entropy

def detect_urls(data: bytes) -> List[str]:
    urls = URL_REGEX.findall(data)
    return list(set([url.decode('utf-8', errors='ignore') for url in urls]))

def detect_keywords(data: bytes) -> List[str]:
    found = []
    for kw in DANGEROUS_KEYWORDS:
        if kw.lower() in data.lower():
            found.append(kw.decode('utf-8'))
    return found

def analyze_docx_macros(data: bytes) -> bool:
    # A simple heuristic: check if word/vbaProject.bin exists in the zip
    try:
        with zipfile.ZipFile(io.BytesIO(data)) as z:
            return any("vbaproject" in name.lower() for name in z.namelist())
    except zipfile.BadZipFile:
        return False

def analyze_pdf(data: bytes) -> Dict[str, Any]:
    # Very basic PDF analysis heuristic
    is_pdf = data.startswith(b"%PDF")
    has_javascript = b"/JavaScript" in data or b"/JS" in data
    has_launch = b"/Launch" in data
    has_embedded_files = b"/EmbeddedFiles" in data
    
    return {
        "is_valid_pdf": is_pdf,
        "has_javascript": has_javascript,
        "has_launch_action": has_launch,
        "has_embedded_files": has_embedded_files,
    }

def determine_classification(features: Dict[str, Any]) -> str:
    score = 0
    if features.get("has_macros", False):
        score += 3
    if features.get("dangerous_keywords", []):
        score += 2 * len(features["dangerous_keywords"])
    
    pdf_details = features.get("pdf_details", {})
    if pdf_details.get("has_javascript"): score += 2
    if pdf_details.get("has_launch_action"): score += 3
    
    if features.get("entropy", 0) > 7.5:
        score += 2
        
    if score == 0:
        return "Safe"
    elif score < 4:
        return "Suspicious"
    elif score < 7:
        return "Malicious - Generic"
    else:
        # Multi-class distinction heuristic
        if features.get("has_macros") and features.get("dangerous_keywords"):
            return "Malicious - Macro Downloader"
        return "Malicious - High Risk"

async def generate_explanation(features: Dict[str, Any], classification: str) -> str:
    prompt = f"""
    As a cybersecurity expert, analyze the following extracted features of a scanned document and explain why it was classified as '{classification}'.
    Provide a concise, easy-to-understand explanation for a security analyst.
    
    File Features:
    - Type: {features.get('file_type')}
    - Size: {features.get('file_size_bytes')} bytes
    - Entropy: {features.get('entropy')} (High entropy > 7.5 indicates possible packing/encryption)
    - Has Macros: {features.get('has_macros')}
    - Dangerous Keywords: {', '.join(features.get('dangerous_keywords', []))}
    - Suspicious URLs count: {features.get('suspicious_urls_found')}
    - PDF Details: {features.get('pdf_details', 'N/A')}
    
    Explanation:
    """
    try:
        response = model.generate_content(prompt)
        return response.text
    except Exception as e:
        return f"Could not generate AI explanation. Error: {str(e)}"

@app.post("/scan")
async def scan_file(file: UploadFile = File(...), generate_ai_report: bool = Form(False)) -> Dict[str, Any]:
    try:
        content = await file.read()
    except Exception as e:
        raise HTTPException(status_code=400, detail="Could not read file")

    filename = file.filename.lower()
    
    entropy = calculate_entropy(content)
    urls = detect_urls(content)
    keywords = detect_keywords(content)
    
    file_type = "unknown"
    has_macros = False
    pdf_details = {}
    
    if filename.endswith(".docx") or filename.endswith(".docm") or content.startswith(b"PK"):
        file_type = "docx/zip"
        has_macros = analyze_docx_macros(content)
    elif filename.endswith(".pdf") or content.startswith(b"%PDF"):
        file_type = "pdf"
        pdf_details = analyze_pdf(content)
        
    features = {
        "filename": file.filename,
        "file_size_bytes": len(content),
        "file_type": file_type,
        "entropy": round(entropy, 4),
        "suspicious_urls_found": len(urls),
        "urls": urls[:10], # limit to 10 in response
        "dangerous_keywords": keywords,
        "has_macros": has_macros,
    }
    
    if file_type == "pdf":
        features["pdf_details"] = pdf_details

    classification = determine_classification(features)
    
    response = {
        "status": "success",
        "classification": classification,
        "features": features
    }
    
    if generate_ai_report:
        ai_explanation = await generate_explanation(features, classification)
        response["ai_explanation"] = ai_explanation
        
    return response

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
