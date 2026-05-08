import math
import re
import zipfile
import io
import base64
from typing import Dict, Any, List, Tuple

try:
    import pypdf
    PYPDF_AVAILABLE = True
except ImportError:
    PYPDF_AVAILABLE = False

try:
    from oletools.olevba import VBA_Parser
    OLETOOLS_AVAILABLE = True
except ImportError:
    OLETOOLS_AVAILABLE = False

class MalwareDetector:
    def __init__(self):
        self.DANGEROUS_KEYWORDS = [
            b"powershell", b"cmd.exe", b"base64", b"wget", b"eval", 
            b"shellcode", b"wscript.shell", b"vba", b"autoopen", 
            b"wmic", b"mimikatz", b"invoke-expression", b"hidden", b"curl"
        ]
        self.URL_REGEX = re.compile(rb"https?://(?:[-\w.]|(?:%[\da-fA-F]{2}))+")
        self.BASE64_REGEX = re.compile(rb"(?:[A-Za-z0-9+/]{4}){10,}(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?")
        self.JS_PATTERN = re.compile(rb"<script[^>]*>.*?</script>", re.IGNORECASE | re.DOTALL)
        self.JS_EVAL_PATTERN = re.compile(rb"eval\s*\(|document\.write\s*\(|window\.execScript\s*\(")

    def detect_suspicious_urls(self, content: bytes) -> dict:
        urls = self.URL_REGEX.findall(content)
        unique_urls = list(set(urls))
        if unique_urls:
            return {"score": 20, "reason": f"Suspicious URL(s) detected ({len(unique_urls)} found)"}
        return {"score": 0, "reason": ""}

    def detect_dangerous_keywords(self, content: bytes) -> dict:
        found = []
        lower_content = content.lower()
        for kw in self.DANGEROUS_KEYWORDS:
            if kw in lower_content:
                found.append(kw.decode('utf-8', errors='ignore'))
        if found:
            return {"score": 15, "reason": f"Dangerous keywords detected: {', '.join(found)}"}
        return {"score": 0, "reason": ""}

    def detect_base64_strings(self, content: bytes) -> dict:
        b64_strings = self.BASE64_REGEX.findall(content)
        valid_b64 = []
        for s in b64_strings:
            try:
                decoded = base64.b64decode(s)
                if len(decoded) > 20:  # Filter out small/false positive base64 chunks
                    valid_b64.append(s)
            except Exception:
                pass
                
        if valid_b64:
            return {"score": 20, "reason": f"Encoded text (Base64) detected ({len(valid_b64)} large strings)"}
        return {"score": 0, "reason": ""}

    def calculate_entropy(self, content: bytes) -> dict:
        if not content:
            return {"score": 0, "reason": ""}
        entropy = 0
        for x in range(256):
            p_x = float(content.count(x)) / len(content)
            if p_x > 0:
                entropy += - p_x * math.log2(p_x)
        
        if entropy > 7.5:
            return {"score": 25, "reason": f"High entropy ({entropy:.2f}): Possible packed/encrypted content"}
        return {"score": 0, "reason": ""}

    def extract_pdf_metadata_and_suspicious(self, content: bytes) -> dict:
        if not content.startswith(b"%PDF"):
            return {"score": 0, "reason": ""}
        
        reasons = []
        if b"/JavaScript" in content or b"/JS" in content:
            reasons.append("Embedded JavaScript found in PDF")
        if b"/Launch" in content:
            reasons.append("Launch action found in PDF")
        if b"/EmbeddedFiles" in content:
            reasons.append("Embedded files found in PDF")
            
        if PYPDF_AVAILABLE:
            try:
                reader = pypdf.PdfReader(io.BytesIO(content))
                meta = reader.metadata
                if meta:
                    reasons.append(f"PDF Metadata anomaly/extraction ({len(meta)} keys)")
            except Exception:
                pass
                
        if reasons:
            return {"score": 10, "reason": "Metadata anomaly: " + " | ".join(reasons)}
        return {"score": 0, "reason": ""}

    def detect_macros(self, content: bytes, filename: str) -> dict:
        ext = filename.lower().split('.')[-1]
        if ext not in ['docx', 'docm', 'doc', 'xls', 'xlsm', 'xlsb', 'ppt', 'pptm']:
            return {"score": 0, "reason": ""}

        if OLETOOLS_AVAILABLE:
            try:
                parser = VBA_Parser(filename, data=content)
                if parser.detect_vba_macros():
                    results = parser.analyze_macros()
                    suspicious_count = len([r for r in results if r[0] == 'Suspicious' or r[0] == 'AutoExec'])
                    reasons = ["Macros detected via oletools"]
                    if suspicious_count > 0:
                        reasons.append(f"{suspicious_count} suspicious VBA keywords/autoexec found")
                    return {"score": 40, "reason": " | ".join(reasons)}
                return {"score": 0, "reason": ""}
            except Exception:
                pass
                
        # Fallback to simple zip extraction for OOXML files (docx, docm, etc)
        try:
            with zipfile.ZipFile(io.BytesIO(content)) as z:
                if any("vbaproject" in name.lower() for name in z.namelist()):
                    return {"score": 40, "reason": "Embedded macros (vbaProject.bin) found via Zip archive"}
        except zipfile.BadZipFile:
            pass
            
        return {"score": 0, "reason": ""}

    def detect_scripts(self, content: bytes) -> dict:
        reasons = []
        
        script_tags = self.JS_PATTERN.findall(content)
        if script_tags:
            reasons.append(f"Found {len(script_tags)} <script> tags")
            
        eval_calls = self.JS_EVAL_PATTERN.findall(content)
        if eval_calls:
            reasons.append(f"Found {len(eval_calls)} JavaScript eval/exec/write calls")
            
        if reasons:
            return {"score": 30, "reason": "Scripts detected: " + " | ".join(reasons)}
        return {"score": 0, "reason": ""}

    def analyze(self, content: bytes, filename: str) -> dict:
        results = {
            "total_score": 0,
            "findings": []
        }
        
        checks = [
            self.detect_suspicious_urls(content),
            self.detect_dangerous_keywords(content),
            self.detect_base64_strings(content),
            self.calculate_entropy(content),
            self.extract_pdf_metadata_and_suspicious(content),
            self.detect_macros(content, filename),
            self.detect_scripts(content)
        ]
        
        for check in checks:
            if check["score"] > 0:
                results["total_score"] += check["score"]
                results["findings"].append(check)
                
        score = results["total_score"]
        if score < 20:
            results["classification"] = "Safe"
        elif score < 50:
            results["classification"] = "Phishing Payload"
        elif score <= 80:
            results["classification"] = "Trojan-like"
        else:
            results["classification"] = "Ransomware-like"
            
        return results

# Keep backward compatibility with existing main.py if needed
def analyze_document(content: bytes, filename: str, extracted_text: str) -> Tuple[int, str, List[str]]:
    detector = MalwareDetector()
    analysis = detector.analyze(content, filename)
    
    issues = [f['reason'] for f in analysis['findings']]
    return analysis['total_score'], analysis['classification'], issues
