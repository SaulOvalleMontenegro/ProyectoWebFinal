from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager
from flask_bcrypt import Bcrypt
from flask_cors import CORS

# Extensiones globales (se inicializan con la app en create_app)
db = SQLAlchemy()
jwt = JWTManager()
bcrypt = Bcrypt()


def create_app():
    """Factory function que crea y configura la aplicación Flask."""
    app = Flask(__name__)

    # Cargar configuración
    from app.config import Config
    app.config.from_object(Config)

    # Inicializar extensiones
    db.init_app(app)
    jwt.init_app(app)
    bcrypt.init_app(app)
    CORS(
        app,
        resources={r"/api/*": {"origins": app.config.get("CORS_ORIGINS", "*")}},
        supports_credentials=True,
    )

    # Registrar blueprints (rutas)
    from app.routes.auth import auth_bp
    from app.routes.shipments import shipments_bp
    from app.routes.admin import admin_bp
    from app.routes.contact import contact_bp

    app.register_blueprint(auth_bp, url_prefix="/api/auth")
    app.register_blueprint(shipments_bp, url_prefix="/api/shipments")
    app.register_blueprint(admin_bp, url_prefix="/api/admin")
    app.register_blueprint(contact_bp, url_prefix="/api/contact")

    # Ruta de salud (health check para AWS)
    @app.route("/api/health")
    def health():
        return {"status": "ok", "app": "SkyShip Express API"}, 200

    return app
