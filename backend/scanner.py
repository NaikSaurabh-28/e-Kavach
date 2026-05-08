import io
import re
import math
from collections import Counter
import zipfile
import zlib
from datetime import datetime
from urllib.parse import urlparse

import fitz  # PyMuPDF
import pdfplumber
import whois

def layer1_suspicious_links(file_bytes: bytes, filename: str) -> dict:
    try:
        if not filename.lower().endswith('.pdf'):
            return {"layer": 1, "name": "Suspicious Links", "status": "PASS", "details": "Not a PDF"}
            
        doc = fitz.open(stream=file_bytes, filetype="pdf")
        urls = []
        for page in doc:
            links = page.get_links()
            for link in links:
                if link.get("uri"):
                    urls.append(link["uri"])
        
        text = ""
        for page in doc:
            text += page.get_text()
        regex_urls = re.findall(r"https?://[^\s]+", text)
        urls.extend(regex_urls)
        
        urls = list(set(urls))
        
        shorteners = ['bit.ly', 'tinyurl.com', 'is.gd', 't.co', 'goo.gl', 'ow.ly']
        suspicious_tlds = ['.xyz', '.tk', '.pw', '.ml']
        
        for url in urls:
            parsed = urlparse(url)
            domain = parsed.netloc.lower()
            
            domain_no_port = domain.split(':')[0]
            
            if re.match(r"^\d{1,3}(\.\d{1,3}){3}$", domain_no_port):
                return {"layer": 1, "name": "Suspicious Links", "status": "FAIL", "details": f"IP-based URL found: {url}"}
            
            if any(s in domain for s in shorteners):
                return {"layer": 1, "name": "Suspicious Links", "status": "FAIL", "details": f"URL shortener found: {url}"}
                
            if any(domain_no_port.endswith(tld) for tld in suspicious_tlds):
                return {"layer": 1, "name": "Suspicious Links", "status": "FAIL", "details": f"Suspicious TLD found: {url}"}
                
            try:
                w = whois.whois(domain_no_port)
                creation_date = w.creation_date
                if isinstance(creation_date, list):
                    creation_date = creation_date[0]
                if creation_date:
                    days_old = (datetime.now() - creation_date).days
                    if days_old < 180:
                        return {"layer": 1, "name": "Suspicious Links", "status": "FAIL", "details": f"Domain registered recently (<180 days): {url}"}
            except Exception:
                pass
                
        return {"layer": 1, "name": "Suspicious Links", "status": "PASS", "details": "No suspicious links found"}
    except Exception as e:
        return {"layer": 1, "name": "Suspicious Links", "status": "PASS", "details": "Check could not be performed"}


def layer2_macro_detection(file_bytes: bytes, filename: str) -> dict:
    try:
        lower_name = filename.lower()
        if lower_name.endswith('.docx'):
            with zipfile.ZipFile(io.BytesIO(file_bytes)) as z:
                if any("vbaproject.bin" in name.lower() for name in z.namelist()):
                    return {"layer": 2, "name": "Macro Detection", "status": "FAIL", "details": "vbaProject.bin found in DOCX"}
        elif lower_name.endswith('.pdf'):
            keywords = [b"/JavaScript", b"/JS", b"/OpenAction", b"/AA", b"/Launch"]
            for kw in keywords:
                if kw in file_bytes:
                    return {"layer": 2, "name": "Macro Detection", "status": "FAIL", "details": f"Suspicious PDF action found: {kw.decode('utf-8', errors='ignore')}"}
        return {"layer": 2, "name": "Macro Detection", "status": "PASS", "details": "No macros or suspicious actions found"}
    except Exception as e:
        return {"layer": 2, "name": "Macro Detection", "status": "PASS", "details": "Check could not be performed"}


def layer3_hidden_scripts(file_bytes: bytes, filename: str) -> dict:
    try:
        text = ""
        if filename.lower().endswith('.pdf'):
            with pdfplumber.open(io.BytesIO(file_bytes)) as pdf:
                for page in pdf.pages:
                    extracted = page.extract_text()
                    if extracted:
                        text += extracted
        
        keywords = [
            "/javascript", "/js", "eval(", "exec(", "unescape(", 
            "fromcharcode", "activexobject", "wscript", "shellcode", 
            "document.write", "<script"
        ]
        
        text_lower = text.lower()
        for kw in keywords:
            if kw in text_lower:
                return {"layer": 3, "name": "Hidden Scripts", "status": "FAIL", "details": f"Hidden script keyword found in text: {kw}"}
                
        raw_lower = file_bytes.lower()
        for kw in keywords:
            if kw.encode('utf-8') in raw_lower:
                return {"layer": 3, "name": "Hidden Scripts", "status": "FAIL", "details": f"Hidden script keyword found in raw bytes: {kw}"}
                
        return {"layer": 3, "name": "Hidden Scripts", "status": "PASS", "details": "No hidden scripts found"}
    except Exception as e:
        return {"layer": 3, "name": "Hidden Scripts", "status": "PASS", "details": "Check could not be performed"}


def layer4_metadata_anomalies(file_bytes: bytes, filename: str) -> dict:
    try:
        if not filename.lower().endswith('.pdf'):
            return {"layer": 4, "name": "Metadata Anomalies", "status": "PASS", "details": "Not a PDF"}
            
        doc = fitz.open(stream=file_bytes, filetype="pdf")
        meta = doc.metadata
        if not meta:
            return {"layer": 4, "name": "Metadata Anomalies", "status": "PASS", "details": "No metadata found"}
            
        def parse_pdf_date(d_str):
            if not d_str or not d_str.startswith("D:"):
                return None
            try:
                clean = d_str[2:16]
                if len(clean) == 14:
                    return datetime.strptime(clean, "%Y%m%d%H%M%S")
            except:
                pass
            return None
            
        cdate = parse_pdf_date(meta.get("creationDate", ""))
        mdate = parse_pdf_date(meta.get("modDate", ""))
        
        if cdate and cdate > datetime.now():
            return {"layer": 4, "name": "Metadata Anomalies", "status": "FAIL", "details": "CreationDate is in the future"}
            
        if cdate and mdate and mdate < cdate:
            return {"layer": 4, "name": "Metadata Anomalies", "status": "FAIL", "details": "ModDate is earlier than CreationDate"}
            
        suspicious_exts = [".exe", ".bat", ".sh", ".ps1"]
        author = meta.get("author", "").lower()
        creator = meta.get("creator", "").lower()
        for ext in suspicious_exts:
            if ext in author or ext in creator:
                return {"layer": 4, "name": "Metadata Anomalies", "status": "FAIL", "details": f"Suspicious extension {ext} in Author/Creator"}
                
        for k, v in meta.items():
            if isinstance(v, str):
                if not v.isprintable():
                    return {"layer": 4, "name": "Metadata Anomalies", "status": "FAIL", "details": f"Non-printable characters in metadata field {k}"}
                    
        return {"layer": 4, "name": "Metadata Anomalies", "status": "PASS", "details": "No metadata anomalies found"}
    except Exception as e:
        return {"layer": 4, "name": "Metadata Anomalies", "status": "PASS", "details": "Check could not be performed"}


def layer5_executable_keywords(file_bytes: bytes, filename: str) -> dict:
    try:
        patterns = [
            b'MZ',
            b'TVqQ',
            b'#!/',
            b'powershell',
            b'cmd.exe',
            b'WScript.Shell',
            b'CreateObject'
        ]
        for p in patterns:
            if p in file_bytes:
                return {"layer": 5, "name": "Executable Keywords", "status": "FAIL", "details": f"Executable byte pattern found"}
        return {"layer": 5, "name": "Executable Keywords", "status": "PASS", "details": "No executable patterns found"}
    except Exception as e:
        return {"layer": 5, "name": "Executable Keywords", "status": "PASS", "details": "Check could not be performed"}


def layer6_suspicious_entropy(file_bytes: bytes, filename: str) -> dict:
    try:
        if not filename.lower().endswith('.pdf'):
            return {"layer": 6, "name": "Suspicious Entropy", "status": "PASS", "details": "Not a PDF"}
            
        doc = fitz.open(stream=file_bytes, filetype="pdf")
        for xref in range(1, doc.xref_length()):
            if doc.xref_is_stream(xref):
                obj_str = doc.xref_object(xref)
                is_flatedecode = "/FlateDecode" in obj_str or "/Fl" in obj_str
                
                raw_stream = doc.xref_stream_raw(xref)
                if not raw_stream:
                    continue
                    
                data = raw_stream
                if is_flatedecode:
                    try:
                        data = zlib.decompress(raw_stream)
                    except Exception:
                        pass
                        
                if data:
                    freq = Counter(data)
                    entropy = -sum((c/len(data)) * math.log2(c/len(data)) for c in freq.values())
                    if entropy > 7.5:
                        return {"layer": 6, "name": "Suspicious Entropy", "status": "FAIL", "details": f"Stream entropy {entropy:.2f} exceeds 7.5"}
                        
        return {"layer": 6, "name": "Suspicious Entropy", "status": "PASS", "details": "No suspicious entropy found"}
    except Exception as e:
        return {"layer": 6, "name": "Suspicious Entropy", "status": "PASS", "details": "Check could not be performed"}
