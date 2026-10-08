from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import auth, api, ecosystem, smart_features

app = FastAPI(title="CampusPulse API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(api.router, prefix="/api", tags=["api"])
app.include_router(ecosystem.router, prefix="/api", tags=["ecosystem"])
app.include_router(smart_features.router, prefix="/api/smart", tags=["smart_features"])

@app.get("/")
def read_root():
    return {"message": "Welcome to CampusPulse API"}
