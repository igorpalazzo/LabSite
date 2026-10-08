from datetime import datetime
from typing import Any, Literal

from pydantic import BaseModel, EmailStr, Field


PostStatus = Literal["DRAFT", "IN_REVIEW", "APPROVED", "SCHEDULED", "PUBLISHED", "ARCHIVED"]


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class Block(BaseModel):
    id: str
    type: Literal["paragraph", "heading", "quote", "image", "list"]
    data: dict[str, Any] = Field(default_factory=dict)


class PostInput(BaseModel):
    title: str = Field(min_length=3, max_length=250)
    subtitle: str = ""
    excerpt: str = ""
    category_id: str = "institucional"
    tags: list[str] = Field(default_factory=list)
    content: list[Block] = Field(default_factory=list)
    cover_image_url: str = ""
    cover_image_alt: str = ""
    cover_image_credit: str = ""
    seo_title: str = Field(default="", max_length=70)
    seo_description: str = Field(default="", max_length=170)


class ScheduleRequest(BaseModel):
    scheduled_at: datetime


class UserInput(BaseModel):
    name: str
    email: EmailStr
    password: str = Field(min_length=8)
    role: Literal["ADMIN", "EDITOR", "AUTHOR", "REVIEWER"] = "AUTHOR"

