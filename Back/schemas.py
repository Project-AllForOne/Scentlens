from pydantic import BaseModel
from typing import Optional, List

class PerfumeImageItem(BaseModel):
    id: int
    url: str
    perfume_id: int

class PerfumeImageResult(BaseModel):
    id: int
    url: str
    status: str
    local_path: Optional[str] = None
    error: Optional[str] = None

class PerfumeEmbeddingResult(BaseModel):
    id: int
    url: str
    status: str
    embedding: Optional[List[float]] = None
    error: Optional[str] = None