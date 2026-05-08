from fastapi import FastAPI, File, UploadFile, HTTPException
from typing import Dict, Any, List
import io

from parsers import extract_text_from_pdf, extract_text_from_docx
from scanner import analyze_document

app = FastAPI(title="Modular AI Malware Scanner", description="Backend for analyzing PDF and DOCX files")

@app.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    try:
        content = await file.read()
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Could not read file: {str(e)}")
        
    filename = file.filename.lower()
    
    if not (filename.endswith(".pdf") or filename.endswith(".docx") or filename.endswith(".docm")):
        raise HTTPException(status_code=400, detail="Only PDF and DOCX files are supported")
        
    # Extract Text
    extracted_text = ""
    if filename.endswith(".pdf"):
        extracted_text = extract_text_from_pdf(content)
    elif filename.endswith(".docx") or filename.endswith(".docm"):
        extracted_text = extract_text_from_docx(content)
        
    # Analyze Document
    score, classification, issues = analyze_document(content, file.filename, extracted_text)
    
    return {
        "status": "success",
        "filename": file.filename,
        "score": score,
        "classification": classification,
        "detected_issues": issues,
        "extracted_text_preview": extracted_text[:200] + "..." if len(extracted_text) > 200 else extracted_text
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
