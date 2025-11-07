from datetime import datetime
from sqlalchemy import Column, DateTime, Integer, String, Text

from .database import Base


class Contract(Base):
    __tablename__ = "contracts"

    id = Column(Integer, primary_key=True, index=True)
    original_filename = Column(String, nullable=False)
    stored_filename = Column(String, nullable=False, unique=True)
    content_type = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    summary = Column(Text, nullable=True)
    review = Column(Text, nullable=True)
    issues = Column(Text, nullable=True)
    suggestions = Column(Text, nullable=True)
    text_preview = Column(Text, nullable=True)
