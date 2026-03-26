"""FastAPI application for Physician Contract Analyzer."""

from fastapi import FastAPI, File, HTTPException, UploadFile

from analyzer import analyze_contract
from models import AnalysisResponse, HealthResponse
from pdf_extractor import extract_text_from_pdf

app = FastAPI(
    title="Physician Contract Analyzer",
    description="Upload a physician employment contract PDF for AI-powered analysis.",
    version="0.1.0",
)

# 20 MB upload limit
MAX_FILE_SIZE = 20 * 1024 * 1024


@app.get("/health", response_model=HealthResponse)
async def health_check():
    """Service health check."""
    return HealthResponse()


@app.post("/analyze", response_model=AnalysisResponse)
async def analyze(file: UploadFile = File(..., description="Physician contract PDF")):
    """Upload a physician contract PDF and receive a structured analysis.

    Returns key terms with plain-English explanations, red flags, and an
    overall risk score from 1 (very favorable) to 10 (very risky).
    """
    # Validate file type
    if file.content_type not in ("application/pdf", "application/octet-stream"):
        raise HTTPException(
            status_code=400,
            detail=f"Expected a PDF file, got {file.content_type}",
        )

    # Read and validate size
    contents = await file.read()
    if len(contents) > MAX_FILE_SIZE:
        raise HTTPException(status_code=400, detail="File exceeds 20 MB limit")

    # Extract text
    try:
        contract_text = extract_text_from_pdf(contents)
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))

    # Analyze with GPT-4
    try:
        result = await analyze_contract(contract_text)
    except RuntimeError as e:
        raise HTTPException(status_code=500, detail=str(e))
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Analysis failed: {type(e).__name__}: {e}",
        )

    return result


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
