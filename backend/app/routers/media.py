from pathlib import Path
from uuid import uuid4

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile

from ..config import settings
from ..security import current_user


router = APIRouter(prefix="/admin/media", tags=["Mídia"])
ALLOWED = {"image/jpeg": ".jpg", "image/png": ".png", "image/webp": ".webp", "image/gif": ".gif"}
MAX_BYTES = 8 * 1024 * 1024


@router.post("/upload")
async def upload(file: UploadFile = File(...), _user: dict = Depends(current_user)):
    if file.content_type not in ALLOWED:
        raise HTTPException(status_code=415, detail="Envie uma imagem JPG, PNG, WebP ou GIF")
    content = await file.read(MAX_BYTES + 1)
    if len(content) > MAX_BYTES:
        raise HTTPException(status_code=413, detail="A imagem deve ter no máximo 8 MB")
    settings.media_dir.mkdir(parents=True, exist_ok=True)
    filename = f"{uuid4().hex}{ALLOWED[file.content_type]}"
    (settings.media_dir / filename).write_bytes(content)
    return {"url": f"{settings.public_base_url}/media/{filename}", "filename": filename}

