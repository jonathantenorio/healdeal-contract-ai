from pathlib import Path
from pydantic import BaseSettings


class Settings(BaseSettings):
    database_url: str = "sqlite:///./contracts.db"
    upload_dir: Path = Path("storage/uploads")
    summary_model: str = "sshleifer/distilbart-cnn-12-6"
    review_model: str = "google/flan-t5-small"
    max_summary_tokens: int = 512
    max_review_tokens: int = 512

    class Config:
        env_file = ".env"
        case_sensitive = False


def get_settings() -> Settings:
    settings = Settings()
    settings.upload_dir.mkdir(parents=True, exist_ok=True)
    return settings
