"""OpenAI-powered contract analysis logic."""

import json
import os

from openai import AsyncOpenAI

from models import AnalysisResponse
from prompts import SYSTEM_PROMPT, USER_PROMPT_TEMPLATE


# Lazy-init client so import doesn't fail without the key
_client: AsyncOpenAI | None = None


def _get_client() -> AsyncOpenAI:
    global _client
    if _client is None:
        api_key = os.environ.get("OPENAI_API_KEY")
        if not api_key:
            raise RuntimeError("OPENAI_API_KEY environment variable is not set")
        _client = AsyncOpenAI(api_key=api_key)
    return _client


# GPT-4 has ~128K context; truncate to stay well within limits
MAX_CONTRACT_CHARS = 100_000


async def analyze_contract(contract_text: str) -> AnalysisResponse:
    """Send contract text to GPT-4 and return structured analysis.

    Args:
        contract_text: Extracted text from the PDF.

    Returns:
        Validated AnalysisResponse.
    """
    # Truncate very long contracts with a note
    if len(contract_text) > MAX_CONTRACT_CHARS:
        contract_text = (
            contract_text[:MAX_CONTRACT_CHARS]
            + "\n\n[TEXT TRUNCATED — contract exceeds analysis limit]"
        )

    client = _get_client()

    response = await client.chat.completions.create(
        model="gpt-4o",
        temperature=0.2,
        response_format={"type": "json_object"},
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {
                "role": "user",
                "content": USER_PROMPT_TEMPLATE.format(contract_text=contract_text),
            },
        ],
    )

    raw = response.choices[0].message.content
    data = json.loads(raw)

    return AnalysisResponse(**data)
