import os
from datetime import timedelta
from dotenv import load_dotenv

load_dotenv()


class Config:
    # ── Seguridad ────────────────────────────────────────────
    SECRET_KEY = os.getenv("SECRET_KEY", "dev-secret-key-CHANGE-IN-PROD")
    JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "jwt-secret-key-CHANGE-IN-PROD")
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=24)

    # ── Base de datos (SQLAlchemy ORM + PyMySQL) ─────────────
    _DB_USER = os.getenv("DB_USER", "root")
    _DB_PASSWORD = os.getenv("DB_PASSWORD", "")
    _DB_HOST = os.getenv("DB_HOST", "localhost")
    _DB_PORT = os.getenv("DB_PORT", "3306")
    _DB_NAME = os.getenv("DB_NAME", "skyship_db")

    SQLALCHEMY_DATABASE_URI = os.getenv(
        "DATABASE_URL",
        f"mysql+pymysql://{_DB_USER}:{_DB_PASSWORD}@{_DB_HOST}:{_DB_PORT}/{_DB_NAME}",
    )
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SQLALCHEMY_ENGINE_OPTIONS = {
        "pool_pre_ping": True,   # Reconecta si la conexión cae (importante en AWS RDS)
        "pool_recycle": 300,     # Recicla conexiones cada 5 min
        "pool_size": 10,
        "max_overflow": 20,
    }

    # ── Pepper (seguridad adicional de contraseñas) ──────────
    # Se concatena a la contraseña ANTES de hashear con bcrypt.
    # Nunca se guarda en la BD. Si se filtra la BD, los hashes
    # son inútiles sin este valor.
    PASSWORD_PEPPER = os.getenv("PASSWORD_PEPPER", "skyship-default-pepper-CHANGE-IN-PROD")

    # ── CORS ─────────────────────────────────────────────────
    CORS_ORIGINS = os.getenv("CORS_ORIGINS", "http://localhost:5173")

    # ── Entorno ──────────────────────────────────────────────
    FLASK_ENV = os.getenv("FLASK_ENV", "development")
    DEBUG = FLASK_ENV == "development"
