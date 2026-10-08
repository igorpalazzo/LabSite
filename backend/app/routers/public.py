from datetime import datetime, timezone

from fastapi import APIRouter, HTTPException, Query

from ..store import store


router = APIRouter(tags=["Site público"])


def enrich(post: dict) -> dict:
    author = store.get("users", post.get("author_id", "")) or {"name": "Equipe LIRA"}
    category = next(
        (c for c in store.all("categories") if c["id"] == post.get("category_id")),
        {"id": "institucional", "name": "Institucional"},
    )
    return {**post, "author": {"id": author.get("id"), "name": author["name"]}, "category": category}


def is_public(post: dict) -> bool:
    return post.get("status") == "PUBLISHED" and post.get("published_at")


@router.get("/posts")
def list_posts(
    page: int = Query(1, ge=1),
    limit: int = Query(12, ge=1, le=50),
    category: str | None = None,
    q: str | None = None,
):
    posts = [p for p in store.all("posts") if is_public(p)]
    if category:
        posts = [p for p in posts if p.get("category_id") == category]
    if q:
        needle = q.casefold()
        posts = [p for p in posts if needle in (p.get("title", "") + " " + p.get("excerpt", "")).casefold()]
    posts.sort(key=lambda p: p.get("published_at", ""), reverse=True)
    start = (page - 1) * limit
    return {"items": [enrich(p) for p in posts[start : start + limit]], "total": len(posts), "page": page}


@router.get("/posts/{slug}")
def get_post(slug: str):
    post = next((p for p in store.all("posts") if p["slug"] == slug and is_public(p)), None)
    if not post:
        raise HTTPException(status_code=404, detail="Notícia não encontrada")
    related = [
        enrich(p)
        for p in store.all("posts")
        if p["id"] != post["id"] and is_public(p) and p.get("category_id") == post.get("category_id")
    ][:3]
    return {**enrich(post), "related": related}


@router.get("/categories")
def categories():
    return store.all("categories")


@router.get("/health")
def health():
    return {"status": "ok", "time": datetime.now(timezone.utc).isoformat()}

