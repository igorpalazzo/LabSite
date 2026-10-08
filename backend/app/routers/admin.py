from datetime import datetime, timezone
from uuid import uuid4

from fastapi import APIRouter, Depends, HTTPException, Query

from ..schemas import PostInput, ScheduleRequest, UserInput
from ..publisher import export_post, remove_export
from ..security import current_user, hash_password, require_roles
from ..store import store
from ..utils import now_iso, slugify
from .auth import safe_user
from .public import enrich


router = APIRouter(prefix="/admin", tags=["Administração"])


def unique_slug(title: str, current_id: str | None = None) -> str:
    base = slugify(title) or "noticia"
    slugs = {p["slug"] for p in store.all("posts") if p["id"] != current_id}
    slug, index = base, 2
    while slug in slugs:
        slug = f"{base}-{index}"
        index += 1
    return slug


def ensure_editable(post: dict, user: dict):
    if user["role"] == "AUTHOR" and post["author_id"] != user["id"]:
        raise HTTPException(status_code=403, detail="Autores só podem editar suas próprias notícias")


def add_revision(post: dict, user: dict, note: str):
    store.insert(
        "revisions",
        {"id": str(uuid4()), "post_id": post["id"], "snapshot": post, "author_id": user["id"], "author_name": user["name"], "note": note, "created_at": now_iso()},
    )


def sync_tags(tags: list[str]):
    current = store.all("tags")
    known = {item["name"].casefold() for item in current}
    for name in tags:
        clean = name.strip()
        if clean and clean.casefold() not in known:
            current.append({"id": slugify(clean), "name": clean})
            known.add(clean.casefold())
    store.replace("tags", current)


@router.get("/dashboard")
def dashboard(_user: dict = Depends(current_user)):
    posts = store.all("posts")
    counts = {status: sum(1 for p in posts if p["status"] == status) for status in ["DRAFT", "IN_REVIEW", "APPROVED", "SCHEDULED", "PUBLISHED", "ARCHIVED"]}
    return {"counts": counts, "total": len(posts), "recent": [enrich(p) for p in sorted(posts, key=lambda x: x["updated_at"], reverse=True)[:5]]}


@router.get("/posts")
def list_admin_posts(status: str | None = None, q: str | None = None, user: dict = Depends(current_user)):
    posts = store.all("posts")
    if user["role"] == "AUTHOR":
        posts = [p for p in posts if p["author_id"] == user["id"]]
    if status:
        posts = [p for p in posts if p["status"] == status]
    if q:
        posts = [p for p in posts if q.casefold() in p["title"].casefold()]
    return [enrich(p) for p in sorted(posts, key=lambda x: x["updated_at"], reverse=True)]


@router.get("/posts/{post_id}")
def get_admin_post(post_id: str, user: dict = Depends(current_user)):
    post = store.get("posts", post_id)
    if not post:
        raise HTTPException(status_code=404, detail="Notícia não encontrada")
    ensure_editable(post, user)
    return enrich(post)


@router.post("/posts", status_code=201)
def create_post(payload: PostInput, user: dict = Depends(current_user)):
    timestamp = now_iso()
    post = {
        "id": str(uuid4()), **payload.model_dump(mode="json"), "slug": unique_slug(payload.title),
        "status": "DRAFT", "author_id": user["id"], "published_at": None,
        "scheduled_at": None, "created_at": timestamp, "updated_at": timestamp,
    }
    store.insert("posts", post)
    sync_tags(payload.tags)
    add_revision(post, user, "Notícia criada")
    return enrich(post)


@router.patch("/posts/{post_id}")
def update_post(post_id: str, payload: PostInput, user: dict = Depends(current_user)):
    post = store.get("posts", post_id)
    if not post:
        raise HTTPException(status_code=404, detail="Notícia não encontrada")
    ensure_editable(post, user)
    add_revision(post, user, "Versão anterior ao salvamento")
    # O slug é permanente depois da criação para não quebrar URLs já publicadas.
    patch = {**payload.model_dump(mode="json"), "slug": post["slug"], "updated_at": now_iso()}
    sync_tags(payload.tags)
    return enrich(store.update("posts", post_id, patch))


@router.post("/posts/{post_id}/submit")
def submit(post_id: str, user: dict = Depends(current_user)):
    post = store.get("posts", post_id)
    if not post:
        raise HTTPException(status_code=404, detail="Notícia não encontrada")
    ensure_editable(post, user)
    return enrich(store.update("posts", post_id, {"status": "IN_REVIEW", "updated_at": now_iso()}))


@router.post("/posts/{post_id}/approve")
def approve(post_id: str, _user: dict = Depends(require_roles("ADMIN", "EDITOR", "REVIEWER"))):
    if not store.get("posts", post_id):
        raise HTTPException(status_code=404, detail="Notícia não encontrada")
    return enrich(store.update("posts", post_id, {"status": "APPROVED", "updated_at": now_iso()}))


@router.post("/posts/{post_id}/publish")
def publish(post_id: str, _user: dict = Depends(require_roles("ADMIN", "EDITOR"))):
    if not store.get("posts", post_id):
        raise HTTPException(status_code=404, detail="Notícia não encontrada")
    timestamp = now_iso()
    updated = store.update("posts", post_id, {"status": "PUBLISHED", "published_at": timestamp, "scheduled_at": None, "updated_at": timestamp})
    export_post(updated)
    return enrich(updated)


@router.post("/posts/{post_id}/schedule")
def schedule(post_id: str, payload: ScheduleRequest, _user: dict = Depends(require_roles("ADMIN", "EDITOR"))):
    if payload.scheduled_at <= datetime.now(timezone.utc):
        raise HTTPException(status_code=400, detail="O agendamento precisa estar no futuro")
    if not store.get("posts", post_id):
        raise HTTPException(status_code=404, detail="Notícia não encontrada")
    return enrich(store.update("posts", post_id, {"status": "SCHEDULED", "scheduled_at": payload.scheduled_at.isoformat(), "updated_at": now_iso()}))


@router.post("/posts/{post_id}/archive")
def archive(post_id: str, _user: dict = Depends(require_roles("ADMIN", "EDITOR"))):
    post = store.get("posts", post_id)
    if not post:
        raise HTTPException(status_code=404, detail="Notícia não encontrada")
    updated = store.update("posts", post_id, {"status": "ARCHIVED", "updated_at": now_iso()})
    remove_export(post)
    return enrich(updated)


@router.get("/posts/{post_id}/revisions")
def revisions(post_id: str, _user: dict = Depends(current_user)):
    return sorted([r for r in store.all("revisions") if r["post_id"] == post_id], key=lambda r: r["created_at"], reverse=True)


@router.post("/posts/{post_id}/revisions/{revision_id}/restore")
def restore(post_id: str, revision_id: str, user: dict = Depends(current_user)):
    current = store.get("posts", post_id)
    revision = store.get("revisions", revision_id)
    if not current or not revision or revision["post_id"] != post_id:
        raise HTTPException(status_code=404, detail="Revisão não encontrada")
    ensure_editable(current, user)
    add_revision(current, user, "Versão anterior à restauração")
    snapshot = {**revision["snapshot"], "updated_at": now_iso()}
    snapshot.pop("id", None)
    return enrich(store.update("posts", post_id, snapshot))


@router.get("/preview/{post_id}")
def preview(post_id: str, user: dict = Depends(current_user)):
    post = store.get("posts", post_id)
    if not post:
        raise HTTPException(status_code=404, detail="Notícia não encontrada")
    ensure_editable(post, user)
    return enrich(post)


@router.post("/users", status_code=201)
def create_user(payload: UserInput, _admin: dict = Depends(require_roles("ADMIN"))):
    if any(u["email"].lower() == payload.email.lower() for u in store.all("users")):
        raise HTTPException(status_code=409, detail="Este e-mail já está cadastrado")
    user = {"id": str(uuid4()), "name": payload.name, "email": payload.email.lower(), "password_hash": hash_password(payload.password), "role": payload.role, "active": True, "created_at": now_iso()}
    store.insert("users", user)
    return safe_user(user)
