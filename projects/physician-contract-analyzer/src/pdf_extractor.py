"""PDF text extraction using pdfplumber."""

import io
import pdfplumber


def extract_text_from_pdf(file_bytes: bytes) -> str:
    """Extract all text from a PDF file.

    Args:
        file_bytes: Raw PDF file content.

    Returns:
        Concatenated text from all pages.

    Raises:
        ValueError: If no text could be extracted.
    """
    pages_text: list[str] = []

    with pdfplumber.open(io.BytesIO(file_bytes)) as pdf:
        for i, page in enumerate(pdf.pages):
            text = page.extract_text()
            if text:
                pages_text.append(f"--- Page {i + 1} ---\n{text}")

    if not pages_text:
        raise ValueError(
            "Could not extract any text from the PDF. "
            "The file may be image-based (scanned) or corrupted."
        )

    return "\n\n".join(pages_text)
