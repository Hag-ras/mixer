from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import mixer_router, beam_router

app = FastAPI(title="FT Mixer & Beamforming Lab")

# ALLOW CORS for Frontend (React runs on port 5173)
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register Routers
app.include_router(mixer_router.router)
app.include_router(beam_router.router)

@app.get("/")
def read_root():
    return {"status": "Server is running"}
