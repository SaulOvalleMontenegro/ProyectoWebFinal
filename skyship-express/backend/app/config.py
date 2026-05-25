import os
from datetime import timedelta
from dotenv import load_dotenv

# Carga variables locales si existen (útil para desarrollo)
# override=False asegura que las variables del sistema (AWS) tengan prioridad
load_dotenv(override=False)

class Config:
    # ── Seguridad ────────────────────────────────────────────
    SECRET_KEY = os.getenv("SECRET_KEY", "dev-secret-key-CHANGE-IN-PROD")
    JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "jwt-secret-key-CHANGE-IN-PROD")
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=24)

    # ── Base de datos (SQLAlchemy ORM + PyMySQL) ─────────────
    # Usamos valores por defecto seguros para desarrollo local, 
    # pero en AWS tomará los valores que configuraste con 'eb setenv'
    _DB_USER = os.environ.get("DB_USER")
    _DB_PASSWORD = os.environ.get("DB_PASSWORD")
    _DB_HOST = os.environ.get("DB_HOST")
    _DB_PORT = os.environ.get("DB_PORT", "3306")
    _DB_NAME = os.environ.get("DB_NAME")

    # Construcción segura
    SQLALCHEMY_DATABASE_URI = f"mysql+pymysql://{_DB_USER}:{_DB_PASSWORD}@{_DB_HOST}:{_DB_PORT}/{_DB_NAME}"
    
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SQLALCHEMY_ENGINE_OPTIONS = {
        "pool_pre_ping": True,  # Reconecta si la conexión cae (crucial en AWS RDS)
        "pool_recycle": 300,    # Recicla conexiones cada 5 min
        "pool_size": 10,
        "max_overflow": 20,
    }

    # ── Pepper (seguridad adicional de contraseñas) ──────────
    PASSWORD_PEPPER = os.getenv("PASSWORD_PEPPER", "skyship-default-pepper-CHANGE-IN-PROD")

    # ── CORS ─────────────────────────────────────────────────
    CORS_ORIGINS = os.getenv("CORS_ORIGINS", "http://localhost:5173")

    # ── Entorno ──────────────────────────────────────────────
    FLASK_ENV = os.getenv("FLASK_ENV", "development")
    DEBUG = FLASK_ENV == "development"