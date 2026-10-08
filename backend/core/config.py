from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "CampusPulse"
    DATABASE_URL: str = "sqlite:///./campuspulse.db"
    SECRET_KEY: str = "supersecretkey_for_campuspulse_jwt_token"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440

    class Config:
        env_file = "../.env"

settings = Settings()
