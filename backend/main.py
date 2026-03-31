from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Import routers
from routes import auth, predictions

# Database client
db_client: AsyncIOMotorClient = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    global db_client
    mongodb_url = os.getenv("MONGODB_URL", "mongodb+srv://user:password@cluster.mongodb.net/astrology")
    db_client = AsyncIOMotorClient(mongodb_url)
    app.db = db_client["astrology"]
    print("✓ Connected to MongoDB")
    yield
    # Shutdown
    db_client.close()
    print("✓ MongoDB connection closed")

app = FastAPI(title="Astrology API", version="1.0.0", lifespan=lifespan)

# Determine allowed origins for CORS. Render backend needs to know Vercel's domain.
frontend_env = os.getenv("FRONTEND_URL", "http://localhost:3000")
origins = [origin.strip() for origin in frontend_env.split(",") if origin.strip()]

# Always allow local development domains
for local in ["http://localhost:3000", "http://localhost:8000"]:
    if local not in origins:
        origins.append(local)

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(predictions.router, prefix="/api/predictions", tags=["predictions"])

@app.get("/")
async def root():
    return {"message": "Astrology API is running"}

@app.get("/health")
async def health():
    return {"status": "ok"}

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port)
