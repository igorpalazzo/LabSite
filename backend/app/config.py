from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict


BASE_DIR = Path(__file__).resolve().parent.parent
PROJECT_DIR = BASE_DIR.parent


class Settings(BaseSettings):
    app_name: str = "LIRA CMS"
    jwt_secret: str = "desenvolvimento-local-troque-em-producao"
    access_token_minutes: int = 480
    admin_email: str = "admin@liralab.com.br"
    admin_password: str = "LiraAdmin2026!"
    frontend_origin: str = "http://localhost:5173"
    data_dir: Path = BASE_DIR / "data"
    media_dir: Path = BASE_DIR / "media"
    content_dir: Path = PROJECT_DIR / "src" / "data" / "blog"
    static_media_dir: Path = PROJECT_DIR / "public" / "news"
    public_base_url: str = "http://localhost:8000"

    model_config = SettingsConfigDict(
        env_file=(BASE_DIR.parent / ".env", BASE_DIR / ".env"),
        extra="ignore",
    )


settings = Settings()
