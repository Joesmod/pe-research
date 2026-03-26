"""Pydantic response models for the Physician Contract Analyzer."""

from pydantic import BaseModel, Field


class KeyTerm(BaseModel):
    """A single extracted contract term with analysis."""

    category: str = Field(
        description="Term category (e.g., Compensation, Tail Coverage, Non-Compete)"
    )
    extracted_text: str = Field(
        description="Relevant text extracted from the contract"
    )
    plain_english: str = Field(
        description="Plain-English explanation of what this means for the physician"
    )
    risk_level: str = Field(
        description="Risk level: low, medium, high, or critical"
    )


class RedFlag(BaseModel):
    """A detected red flag in the contract."""

    title: str = Field(description="Short title of the red flag")
    description: str = Field(description="Detailed explanation of the concern")
    severity: str = Field(description="Severity: warning, danger, or critical")
    recommendation: str = Field(description="What the physician should do about this")


class AnalysisResponse(BaseModel):
    """Full contract analysis response."""

    summary: str = Field(description="Executive summary of the contract")
    key_terms: list[KeyTerm] = Field(default_factory=list)
    red_flags: list[RedFlag] = Field(default_factory=list)
    overall_risk_score: int = Field(
        ge=1, le=10,
        description="Overall risk score from 1 (very favorable) to 10 (very risky)"
    )


class HealthResponse(BaseModel):
    status: str = "ok"
    service: str = "physician-contract-analyzer"
