from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import os
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="Structural Analogy API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory session store
# session_id -> context_dict
session_store = {}

from routes.upload import router as upload_router
from routes.search import router as search_router

app.include_router(upload_router)
app.include_router(search_router)

@app.get("/")
async def root():
    return {"message": "Structural Analogy API is running"}

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
