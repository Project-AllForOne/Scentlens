# uvicorn main:app --host 127.0.0.1 --port 8000
from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
import requests, faiss, json, torch, io, os, logging
import numpy as np
from contextlib import asynccontextmanager

os.environ["KMP_DUPLICATE_LIB_OK"] = "True"

# 로그
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# DB, FAISS 인덱스 초기화
db_images = []
db_embeddings = []
index = None
perfume_data = []

@asynccontextmanager
async def lifespan(app: FastAPI):
    init()
    yield

app = FastAPI(lifespan=lifespan)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:8080", "http://localhost:8001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 서버 시작 전 미리 실행할 코드; 서버를 initialize하여 데이터 로드, 이미지 다운로드, 임베딩 계산, FAISS 인덱스 생성을 미리 수행
def init():
    global db_images, db_embeddings, index, perfume_data

    # JSON 데이터 로드
    perfume_image_data = load_json("./perfume_image.json", "perfume image")
    perfume_data = load_json("./perfume.json", "perfume")

    if not perfume_image_data or not perfume_data:
        logger.error("Initialization failed due to missing or invalid JSON data.")
        return

    # 이미지 다운로드
    downloaded_images = download_images(perfume_image_data)
    if not downloaded_images:
        logger.error("Initialization failed due to image downloading errors.")
        return

    # 임베딩 계산
    embeddings_data = compute_embeddings(downloaded_images)
    if not embeddings_data:
        logger.error("Initialization failed due to embedding computation errors.")
        return

    # DB에 이미지 및 임베딩 저장
    populate_db(downloaded_images, embeddings_data)

    # FAISS 인덱스 생성
    create_faiss_index()

# 지정된 파일 경로에서 JSON 데이터를 로드
def load_json(file_path, data_name):
    try:
        with open(file_path, "r", encoding="utf-8") as f:
            data = json.load(f)
            logger.info(f"Loaded {len(data)} {data_name} data from JSON.")
            return data
    except Exception as e:
        logger.error(f"Failed to load {data_name} JSON: {str(e)}")
        return None

# 이미지 다운로드를 위한 배치 요청을 전송하고 응답을 반환
def download_images(perfume_image_data):
    try:
        response = requests.post("http://localhost:8001/download_images/", json=perfume_image_data)
        if response.status_code == 200:
            logger.info("Successfully downloaded images.")
            return response.json()
        else:
            logger.error(f"Failed to download images. Status code: {response.status_code}")
            return None
    except Exception as e:
        logger.error(f"Error during image downloading: {e}")
        return None

# 다운로드된 이미지에 대해 임베딩 계산을 위한 배치 요청을 전송
def compute_embeddings(downloaded_images):
    try:
        response = requests.post("http://localhost:8001/get_or_compute_embeddings/", json=downloaded_images)
        if response.status_code == 200:
            logger.info("Successfully computed embeddings.")
            return response.json()
        else:
            logger.error(f"Failed to compute embeddings. Status code: {response.status_code}")
            return None
    except Exception as e:
        logger.error(f"Error during embedding computation: {e}")
        return None

# DB에 이미지 및 임베딩 데이터 저장
def populate_db(downloaded_images, embeddings_data):
    global db_images, db_embeddings

    for item in embeddings_data:
        if item["status"] == "success":
            db_images.append({"id": item["id"], "url": item["url"]})
            embedding = torch.tensor(item["embedding"])
            db_embeddings.append(embedding)
        else:
            logger.error(f"Failed to process embedding for image ID {item['id']} from URL {item['url']}: {item['error']}")

# 계산된 임베딩을 사용하여 FAISS 인덱스를 생성
def create_faiss_index():
    global db_embeddings, index

    if db_embeddings:
        db_embeddings = torch.stack(db_embeddings)
        db_embeddings = db_embeddings / db_embeddings.norm(dim=1, keepdim=True)

        dimension = db_embeddings.shape[1]
        index = faiss.GpuIndexFlatIP(faiss.StandardGpuResources(), dimension)
        index.add(db_embeddings.numpy())
        logger.info("FAISS index created successfully.")
    else:
        logger.info("No embeddings available. Initializing an empty FAISS index.")
        index = faiss.GpuIndexFlatIP(faiss.StandardGpuResources(), 1)

# 임베딩값으로 향수 매칭
def get_matching_perfumes(embedding, db_images, db_embeddings, perfume_data, threshold=0.3):
    # FAISS 인덱스에서 검색
    D, I = index.search(np.array(embedding).reshape(1, -1), k=10)

    results = [
        {
            "index": int(i),
            "id": db_images[i]["id"],
            "url": db_images[i]["url"],
            "similarity": float(D[0][idx]),
        }
        for idx, i in enumerate(I[0])
        if float(D[0][idx]) > threshold
    ]

    ids = [result["id"] for result in results]
    matching_perfumes = [
        {
            "id": item["id"],
            "name": item["name"],
            "brand": item["brand"],
            "description": item["description"],
            "similarity": next(
                (result["similarity"] for result in results if result["id"] == item["id"]), None
            ),
            "url": next(
                (result["url"] for result in results if result["id"] == item["id"]), None
            ),
        }
        for item in perfume_data if item["id"] in ids
    ]

    return sorted(matching_perfumes, key=lambda x: x["similarity"], reverse=True)

@app.post("/get_perfume_details/")
async def search_image(file: UploadFile = File(...)):
    try:
        # GPU 임베딩 서비스 호출
        image_bytes = await file.read()

        compute_url = "http://localhost:8001/compute_embedding_of_uploaded_file/"
        response = requests.post(
            compute_url, files={"file": ("uploaded_image.png", image_bytes)}
        )

        if response.status_code == 200:
            embedding = response.json().get("embedding")
            
            if embedding is not None:
                matching_perfumes = get_matching_perfumes(embedding, db_images, db_embeddings, perfume_data)

                return {"perfumes": sorted(matching_perfumes, key=lambda x: x["similarity"], reverse=True)}
            else:
                return {"error": "No embedding found in the response"}
        else:
            return {"error": f"Failed to get embedding. Status code: {response.status_code}"}
    except Exception as e:
        logger.error(f"Error retrieving perfume details: {e}")
        return {"error": str(e)}
