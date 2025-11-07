from pathlib import Path
from typing import List

from fastapi import Depends, FastAPI, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, HTMLResponse
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session

from . import models, schemas
from .config import get_settings
from .database import Base, engine, get_db
from .services import analyzer as analyzer_service
from .services import document_processor, storage

settings = get_settings()
Base.metadata.create_all(bind=engine)

FRONTEND_DIR = Path(__file__).resolve().parents[2] / "frontend"

app = FastAPI(title="HealDeal Contract Analyzer")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

if FRONTEND_DIR.exists():
    app.mount("/static", StaticFiles(directory=FRONTEND_DIR), name="static")


@app.get("/", response_class=HTMLResponse)
def serve_frontend_root() -> HTMLResponse:
    index_path = FRONTEND_DIR / "index.html"
    if not index_path.exists():
        raise HTTPException(status_code=404, detail="Interface web não disponível")
    return HTMLResponse(index_path.read_text(encoding="utf-8"))


@app.post("/contracts", response_model=schemas.ContractResponse)
def upload_contract(
    file: UploadFile,
    db: Session = Depends(get_db),
) -> schemas.ContractResponse:
    if Path(file.filename).suffix.lower() not in {".pdf", ".doc", ".docx"}:
        raise HTTPException(status_code=400, detail="Formato de arquivo não suportado")

    stored_path = storage.save_upload_file(file)
    try:
        text = document_processor.extract_text(stored_path)
    except document_processor.UnsupportedFileFormat as error:
        stored_path.unlink(missing_ok=True)
        raise HTTPException(status_code=415, detail=str(error)) from error

    analyzer = analyzer_service.get_analyzer()
    analysis = analyzer.analyze(text)

    contract = models.Contract(
        original_filename=file.filename,
        stored_filename=stored_path.name,
        content_type=file.content_type or "application/octet-stream",
        summary=analysis["summary"],
        review=analysis["review"],
        issues=analysis["issues"],
        suggestions=analysis["suggestions"],
        text_preview=document_processor.build_preview(text),
    )
    db.add(contract)
    db.commit()
    db.refresh(contract)

    return contract


@app.get("/contracts", response_model=List[schemas.ContractResponse])
def list_contracts(db: Session = Depends(get_db)) -> List[schemas.ContractResponse]:
    return db.query(models.Contract).order_by(models.Contract.created_at.desc()).all()


@app.get("/contracts/{contract_id}", response_model=schemas.ContractResponse)
def get_contract(contract_id: int, db: Session = Depends(get_db)) -> schemas.ContractResponse:
    contract = db.query(models.Contract).filter(models.Contract.id == contract_id).first()
    if not contract:
        raise HTTPException(status_code=404, detail="Contrato não encontrado")
    return contract


@app.get("/contracts/{contract_id}/download")
def download_contract(contract_id: int, db: Session = Depends(get_db)) -> FileResponse:
    contract = db.query(models.Contract).filter(models.Contract.id == contract_id).first()
    if not contract:
        raise HTTPException(status_code=404, detail="Contrato não encontrado")

    file_path = settings.upload_dir / contract.stored_filename
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="Arquivo não encontrado")

    return FileResponse(
        path=file_path,
        media_type=contract.content_type,
        filename=contract.original_filename,
    )
