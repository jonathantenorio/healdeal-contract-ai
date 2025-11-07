from pathlib import Path
from typing import Optional

from PyPDF2 import PdfReader
from docx import Document

try:
    import textract
except ImportError:  # pragma: no cover - optional dependency
    textract = None


class UnsupportedFileFormat(Exception):
    """Raised when the document format cannot be processed."""


def extract_text(path: Path) -> str:
    suffix = path.suffix.lower()
    if suffix == ".pdf":
        return _extract_pdf(path)
    if suffix == ".docx":
        return _extract_docx(path)
    if suffix == ".doc" and textract is not None:
        return _extract_doc(path)
    raise UnsupportedFileFormat(f"Formato não suportado: {suffix}")


def _extract_pdf(path: Path) -> str:
    reader = PdfReader(str(path))
    text_segments = [page.extract_text() or "" for page in reader.pages]
    return "\n".join(segment.strip() for segment in text_segments if segment)


def _extract_docx(path: Path) -> str:
    doc = Document(str(path))
    return "\n".join(paragraph.text.strip() for paragraph in doc.paragraphs if paragraph.text)


def _extract_doc(path: Path) -> str:
    if textract is None:
        raise UnsupportedFileFormat("Suporte a .doc requer a instalação opcional do textract.")
    text: Optional[bytes] = textract.process(str(path))
    return text.decode("utf-8") if text else ""


def build_preview(text: str, max_chars: int = 600) -> str:
    return text[:max_chars] + ("…" if len(text) > max_chars else "")
