import json
import os
import shutil
from copy import deepcopy
from pathlib import Path
from urllib.parse import urlparse

from .config import settings
from .store import store


def _static_url(url: str, slug: str) -> str:
    if not url:
        return ""

    parsed = urlparse(url)
    if not parsed.path.startswith("/media/"):
        return url

    filename = Path(parsed.path).name
    source = (settings.media_dir / filename).resolve()
    media_root = settings.media_dir.resolve()
    if source.parent != media_root or not source.is_file():
        return url

    destination_dir = settings.static_media_dir / slug
    destination_dir.mkdir(parents=True, exist_ok=True)
    shutil.copy2(source, destination_dir / filename)
    return f"/news/{slug}/{filename}"


def export_post(post: dict) -> Path:
    exported = deepcopy(post)
    slug = exported["slug"]

    author = store.get("users", exported.get("author_id", ""))
    exported["author"] = {
        "id": author.get("id") if author else exported.get("author_id"),
        "name": author.get("name", "Equipe LIRA") if author else "Equipe LIRA",
    }
    category = next(
        (
            item
            for item in store.all("categories")
            if item["id"] == exported.get("category_id")
        ),
        {"id": "institucional", "name": "Institucional"},
    )
    exported["category"] = category
    exported["status"] = "PUBLISHED"
    exported["cover_image_url"] = _static_url(
        exported.get("cover_image_url", ""), slug
    )

    for block in exported.get("content", []):
        if block.get("type") == "image":
            data = block.setdefault("data", {})
            data["url"] = _static_url(str(data.get("url", "")), slug)

    settings.content_dir.mkdir(parents=True, exist_ok=True)
    destination = settings.content_dir / f"{slug}.json"
    temporary = destination.with_suffix(".json.tmp")
    temporary.write_text(
        json.dumps(exported, ensure_ascii=False, indent=2), encoding="utf-8"
    )
    os.replace(temporary, destination)
    return destination


def remove_export(post: dict) -> None:
    path = settings.content_dir / f"{post['slug']}.json"
    if path.is_file():
        path.unlink()


def _normalize_static(path: Path, source: dict) -> dict:
    slug = source.get("slug") or path.stem
    raw_content = source.get("content", [])
    if raw_content and all(isinstance(item, str) for item in raw_content):
        content = [
            {
                "id": f"{slug}-{index + 1}",
                "type": "paragraph",
                "data": {"text": text},
            }
            for index, text in enumerate(raw_content)
        ]
    else:
        content = raw_content

    published_at = source.get("published_at")
    if not published_at and source.get("date"):
        published_at = f"{source['date']}T12:00:00-03:00"

    return {
        "id": source.get("id", f"static-{slug}"),
        "title": source.get("title", "Notícia sem título"),
        "slug": slug,
        "subtitle": source.get("subtitle", source.get("abstract", "")),
        "excerpt": source.get("excerpt", source.get("abstract", "")),
        "content": content,
        "cover_image_url": source.get(
            "cover_image_url", source.get("placeholder", "")
        ),
        "cover_image_alt": source.get(
            "cover_image_alt", source.get("title", "")
        ),
        "cover_image_credit": source.get("cover_image_credit", ""),
        "author_id": source.get("author_id", "lira-team"),
        "category_id": source.get("category_id", "institucional"),
        "tags": source.get("tags", []),
        "status": "PUBLISHED",
        "seo_title": source.get("seo_title", ""),
        "seo_description": source.get(
            "seo_description", source.get("abstract", "")
        ),
        "published_at": published_at,
        "scheduled_at": None,
        "created_at": source.get("created_at", published_at),
        "updated_at": source.get("updated_at", published_at),
    }


def sync_static_content() -> None:
    settings.content_dir.mkdir(parents=True, exist_ok=True)
    posts = store.all("posts")
    known_slugs = {post.get("slug") for post in posts}
    changed = False

    for path in sorted(settings.content_dir.glob("*.json")):
        try:
            source = json.loads(path.read_text(encoding="utf-8"))
        except (json.JSONDecodeError, OSError):
            continue
        article = _normalize_static(path, source)
        if article["slug"] not in known_slugs:
            posts.append(article)
            known_slugs.add(article["slug"])
            changed = True

    if changed:
        store.replace("posts", posts)

