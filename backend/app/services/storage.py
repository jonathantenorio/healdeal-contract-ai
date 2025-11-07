import shutil
import uuid
from pathlib import Path

from fastapi import UploadFile

from ..config import get_settings

settings = get_settings()


def save_upload_file(upload: UploadFile) -> Path:
    extension = Path(upload.filename).suffix
    stored_name = f"{uuid.uuid4().hex}{extension}"
    destination = settings.upload_dir / stored_name

    with destination.open("wb") as buffer:
        shutil.copyfileobj(upload.file, buffer)

    return destination


def read_file(path: Path) -> bytes:
    with path.open("rb") as file:
        return file.read()
