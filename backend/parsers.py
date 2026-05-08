import io
import zipfile
import re

try:
    import pypdf
    PYPDF_AVAILABLE = True
except ImportError:
    PYPDF_AVAILABLE = False

try:
    import docx
    DOCX_AVAILABLE = True
except ImportError:
    DOCX_AVAILABLE = False

def extract_text_from_pdf(content: bytes) -> str:
    if not PYPDF_AVAILABLE:
        # Fallback regex extraction if pypdf is missing
        text = re.sub(rb'[^a-zA-Z0-9 \n\r\t.,!?:;(){}\[\]]', b'', content)
        return text.decode('utf-8', errors='ignore')
    
    try:
        reader = pypdf.PdfReader(io.BytesIO(content))
        text = []
        for page in reader.pages:
            page_text = page.extract_text()
            if page_text:
                text.append(page_text)
        return "\n".join(text)
    except Exception as e:
        return f"Error extracting PDF text: {str(e)}"

def extract_text_from_docx(content: bytes) -> str:
    if not DOCX_AVAILABLE:
        # Fallback to looking at document.xml directly
        try:
            with zipfile.ZipFile(io.BytesIO(content)) as z:
                if 'word/document.xml' in z.namelist():
                    xml_content = z.read('word/document.xml')
                    text = re.sub(rb'<[^>]+>', b' ', xml_content)
                    return text.decode('utf-8', errors='ignore')
        except:
            pass
        return "Error extracting DOCX text without python-docx."

    try:
        doc = docx.Document(io.BytesIO(content))
        text = [p.text for p in doc.paragraphs]
        return "\n".join(text)
    except Exception as e:
        return f"Error extracting DOCX text: {str(e)}"
