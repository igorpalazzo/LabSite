import json
import os
import threading
from copy import deepcopy
from pathlib import Path
from typing import Any

from .config import settings


DEFAULTS: dict[str, list[dict[str, Any]]] = {
    "posts": [],
    "users": [],
    "revisions": [],
    "categories": [
        {"id": "pesquisa", "name": "Pesquisa"},
        {"id": "robotica", "name": "Robótica"},
        {"id": "inteligencia-artificial", "name": "Inteligência Artificial"},
        {"id": "extensao", "name": "Extensão"},
        {"id": "eventos", "name": "Eventos"},
        {"id": "publicacoes", "name": "Publicações"},
        {"id": "institucional", "name": "Institucional"},
    ],
    "tags": [],
}


class JsonStore:
    def __init__(self, root: Path):
        self.root = root
        self._lock = threading.RLock()
        self.root.mkdir(parents=True, exist_ok=True)
        for collection, default in DEFAULTS.items():
            path = self._path(collection)
            if not path.exists():
                self._write(path, default)

    def _path(self, collection: str) -> Path:
        if collection not in DEFAULTS:
            raise ValueError(f"Coleção inválida: {collection}")
        return self.root / f"{collection}.json"

    def _write(self, path: Path, value: Any) -> None:
        temp = path.with_suffix(".json.tmp")
        temp.write_text(
            json.dumps(value, ensure_ascii=False, indent=2), encoding="utf-8"
        )
        os.replace(temp, path)

    def all(self, collection: str) -> list[dict[str, Any]]:
        with self._lock:
            content = json.loads(self._path(collection).read_text(encoding="utf-8"))
            return deepcopy(content)

    def replace(self, collection: str, items: list[dict[str, Any]]) -> None:
        with self._lock:
            self._write(self._path(collection), items)

    def insert(self, collection: str, item: dict[str, Any]) -> dict[str, Any]:
        with self._lock:
            items = self.all(collection)
            items.append(deepcopy(item))
            self._write(self._path(collection), items)
            return deepcopy(item)

    def update(self, collection: str, item_id: str, patch: dict[str, Any]):
        with self._lock:
            items = self.all(collection)
            for index, item in enumerate(items):
                if item.get("id") == item_id:
                    items[index] = {**item, **deepcopy(patch)}
                    self._write(self._path(collection), items)
                    return deepcopy(items[index])
        return None

    def get(self, collection: str, item_id: str):
        return next((x for x in self.all(collection) if x.get("id") == item_id), None)


store = JsonStore(settings.data_dir)

