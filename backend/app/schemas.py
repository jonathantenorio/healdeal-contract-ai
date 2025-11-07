from datetime import datetime
from typing import Optional

from pydantic import BaseModel


class ContractBase(BaseModel):
    original_filename: str
    content_type: str
    summary: Optional[str]
    review: Optional[str]
    issues: Optional[str]
    suggestions: Optional[str]
    text_preview: Optional[str]

    class Config:
        orm_mode = True


class ContractCreate(BaseModel):
    pass


class ContractResponse(ContractBase):
    id: int
    created_at: datetime
