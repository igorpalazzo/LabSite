import asyncio
from contextlib import asynccontextmanager
from datetime import datetime, timezone

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from .config import settings
from .publisher import export_post, sync_static_content
from .routers import admin, auth, media, public
from .security import ensure_admin
from .store import store
from .utils import now_iso


async def publish_scheduled():
    while True:
        now = datetime.now(timezone.utc)
        posts = store.all("posts")
        changed = False
        for post in posts:
            if post.get("status") == "SCHEDULED" and post.get("scheduled_at"):
                scheduled = datetime.fromisoformat(post["scheduled_at"].replace("Z", "+00:00"))
                if scheduled <= now:
                    post.update({"status": "PUBLISHED", "published_at": now_iso(), "updated_at": now_iso()})
                    export_post(post)
                    changed = True
        if changed:
            store.replace("posts", posts)
        await asyncio.sleep(30)


@asynccontextmanager
async def lifespan(_app: FastAPI):
    ensure_admin()
    sync_static_content()
    task = asyncio.create_task(publish_scheduled())
    yield
    task.cancel()


app = FastAPI(title=settings.app_name, version="1.0.0", lifespan=lifespan)
app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=r"^https?://(localhost|127\.0\.0\.1)(:\d+)?$",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
settings.media_dir.mkdir(parents=True, exist_ok=True)
app.mount("/media", StaticFiles(directory=settings.media_dir), name="media")
app.include_router(auth.router, prefix="/api/v1")
app.include_router(public.router, prefix="/api/v1")
app.include_router(admin.router, prefix="/api/v1")
app.include_router(media.router, prefix="/api/v1")


@app.get("/")
def root():
    return {"name": settings.app_name, "docs": "/docs"}
