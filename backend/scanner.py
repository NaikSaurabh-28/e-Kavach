import math
import re
from typing import Dict, Any, List, Tuple
import zipfile
import io

DANGEROUS_KEYWORDS = [
    "cmd.exe", "powershell", "eval", "shellcode", "wscript.shell", 
    "vba", "autoopen", "wmic", "mimikatz", "invoke-expression",
    "base64", "hidden"
]

URL_REGEX = re.compile(r"https?://(?:[-\w.]|(?:%[\da-fA-F]{2}))+")

def calculate_entropy(data: bytes) -> float:
    if not data:
        return 0.0
    entropy = 0
    for x in range(256):
        p_x = float(data.count(x)) / len(data)
        if p_x > 0:
            entropy += - p_x * math.log2(p_x)
    return entropy

def detect_urls(text: str) -> List[str]:
    urls = URL_REGEX.findall(text)
    return list(set(urls))

def detect_keywords(text: str) -> List[str]:
    found = []
    lower_text = text.lower()
    for kw in DANGEROUS_KEYWORDS:
        if kw in lower_text:
            found.append(kw)
    return list(set(found))

def check_docx_macros(content: bytes) -> bool:
    try:
        with zipfile.ZipFile(io.BytesIO(content)) as z:
            return any("vbaproject" in name.lower() for name in z.namelist())
    except zipfile.BadZipFile:
        return False

def check_pdf_suspicious_elements(content: bytes) -> List[str]:
    issues = []
    if b"/JavaScript" in content or b"/JS" in content:
        issues.append("Embedded JavaScript found")
    if b"/Launch" in content:
        issues.append("Launch action found")
    if b"/EmbeddedFiles" in content:
        issues.append("Embedded files found")
    return issues

def analyze_document(content: bytes, filename: str, extracted_text: str) -> Tuple[int, str, List[str]]:
    score = 0
    issues = []
    filename = filename.lower()
    
    # 1. Entropy
    entropy = calculate_entropy(content)
    if entropy > 7.5:
        score += 3
        issues.append(f"High entropy ({entropy:.2f}): Possible packed/encrypted content")
        
    # 2. Text Analysis
    urls = detect_urls(extracted_text)
    if urls:
        score += 1
        issues.append(f"Found {len(urls)} URLs")
        
    keywords = detect_keywords(extracted_text)
    if keywords:
        score += 2 * len(keywords)
        issues.append(f"Dangerous keywords found: {', '.join(keywords)}")
        
    # 3. File-specific checks
    if filename.endswith(".pdf") or content.startswith(b"%PDF"):
        pdf_issues = check_pdf_suspicious_elements(content)
        for issue in pdf_issues:
            score += 3
            issues.append(f"PDF Issue: {issue}")
            
    elif filename.endswith(".docx") or filename.endswith(".docm") or content.startswith(b"PK"):
        if check_docx_macros(content):
            score += 4
            issues.append("DOCX Issue: Embedded macros (VBA) found")

    # Determine classification based on score
    if score == 0:
        classification = "Safe"
    elif score < 4:
        classification = "Low Risk / Suspicious"
    elif score < 7:
        classification = "Medium Risk / Malicious"
    else:
        classification = "High Risk / Malware"
        
    return score, classification, issues
