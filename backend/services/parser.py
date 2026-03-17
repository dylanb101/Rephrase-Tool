import fitz  # PyMuPDF
import docx
from typing import BinaryIO

def parse_document(file_bytes: bytes, filename: str) -> str:
    """
    Parses a PDF or Word document and returns the first 6000 words as a string.
    """
    ext = filename.lower().split(".")[-1]
    text = ""

    if ext == "pdf":
        doc = fitz.open(stream=file_bytes, filetype="pdf")
        for page in doc:
            text += page.get_text()
        doc.close()
    elif ext in ["docx", "doc"]:
        from io import BytesIO
        doc = docx.Document(BytesIO(file_bytes))
        for para in doc.paragraphs:
            text += para.text + "\n"
    else:
        raise ValueError(f"Unsupported file type: {ext}")

    # Truncate to 6000 words
    words = text.split()
    if len(words) > 6000:
        text = " ".join(words[:6000])
    
    return text.strip()
