from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from scanner import (
    layer1_suspicious_links,
    layer2_macro_detection,
    layer3_hidden_scripts,
    layer4_metadata_anomalies,
    layer5_executable_keywords,
    layer6_suspicious_entropy
)

app = FastAPI(title="e-Kavach Scanner", description="6-Layer Backend Security Scanner")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def classify_threat(layer_results):
    failed_layers = [r['layer'] for r in layer_results if r['status'] == 'FAIL']
    if not failed_layers:
        return None
        
    if len(failed_layers) == 1 and failed_layers[0] == 4:
        return "Trojan"
        
    if 5 in failed_layers:
        return "Ransomware"
    if 2 in failed_layers or 4 in failed_layers:
        return "Trojan"
    if 6 in failed_layers:
        return "Worm"
    if 1 in failed_layers:
        return "Botnet"
    if 3 in failed_layers:
        return "Spyware"
        
    return "Unknown"

@app.post("/api/scan")
async def scan_file(file: UploadFile = File(...)):
    try:
        content = await file.read()
    except Exception:
        return {"error": "Failed to read file"}
        
    filename = file.filename
    
    layers = []
    layers.append(layer1_suspicious_links(content, filename))
    layers.append(layer2_macro_detection(content, filename))
    layers.append(layer3_hidden_scripts(content, filename))
    layers.append(layer4_metadata_anomalies(content, filename))
    layers.append(layer5_executable_keywords(content, filename))
    layers.append(layer6_suspicious_entropy(content, filename))
    
    threat_detected = any(l['status'] == 'FAIL' for l in layers)
    overall_status = "BLOCKED" if threat_detected else "SAFE"
    malware_classification = classify_threat(layers)
    
    return {
        "overall_status": overall_status,
        "threat_detected": threat_detected,
        "malware_classification": malware_classification,
        "layers": layers
    }

# Ensure existing frontend isn't broken by still supporting the /upload route with the 6 layers logic mapped
@app.post("/upload")
async def upload_file_legacy(file: UploadFile = File(...)):
    try:
        content = await file.read()
    except Exception:
        return {"status": "error"}
        
    filename = file.filename
    layers = []
    layers.append(layer1_suspicious_links(content, filename))
    layers.append(layer2_macro_detection(content, filename))
    layers.append(layer3_hidden_scripts(content, filename))
    layers.append(layer4_metadata_anomalies(content, filename))
    layers.append(layer5_executable_keywords(content, filename))
    layers.append(layer6_suspicious_entropy(content, filename))
    
    failed_layers = [l for l in layers if l['status'] == 'FAIL']
    score = len(failed_layers) * 15 # dummy score adapter
    status = "malicious" if failed_layers else "safe"
    classification = classify_threat(layers) or "Safe"
    issues = [l['details'] for l in failed_layers]
    
    return {
        "status": status,
        "score": score,
        "classification": classification,
        "issues": issues
    }

from pydantic import BaseModel
import asyncio
from typing import List
from gemini_explainer import generate_scan_explanation

class ExplainRequest(BaseModel):
    classification: str
    issues: List[str]
    score: float

@app.post("/explain")
async def explain_scan(req: ExplainRequest):
    try:
        loop = asyncio.get_event_loop()
        explanation = await loop.run_in_executor(
            None,
            generate_scan_explanation,
            req.classification,
            req.issues,
            req.score
        )
        return {"explanation": explanation}
    except Exception as e:
        from fastapi import HTTPException
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
