# ~/Desktop/hackathons/intelredhat/production/kubo-models/models/lipsync/src/inference.py
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import tempfile
import os
from .processor import LipSyncProcessor

app = FastAPI(title="LipSync Model Service")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize processor
processor = LipSyncProcessor()

@app.get("/")
async def root():
    return {
        "name": "LipSync Model Service",
        "status": "running",
        "version": "1.0.0"
    }

@app.get("/health")
async def health():
    return {"status": "healthy"}

@app.post("/process")
async def process_audio(audio: UploadFile = File(...)):
    try:
        # Create temp file
        suffix = os.path.splitext(audio.filename)[1]
        with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
            content = await audio.read()
            tmp.write(content)
            tmp.flush()
            
            # Process audio
            result = processor.process_audio(tmp.name)
            
            # Clean up
            os.unlink(tmp.name)
            
            return result
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))