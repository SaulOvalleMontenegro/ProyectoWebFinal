from app import db
from datetime import datetime


class User(db.Model):
    """
    Modelo ORM para la tabla 'usuarios'.
    Representa tanto clientes como administradores del sistema.
    """
    __tablename__ = "usuarios"

    # ── Columnas ─────────────────────────────────────────────
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    nombre_completo = db.Column(db.String(150), nullable=False)
    correo = db.Column(db.String(150), unique=True, nullable=False, index=True)
    telefono = db.Column(db.String(20), nullable=False)
    direccion = db.Column(db.String(300), nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    rol = db.Column(
        db.Enum("usuario", "admin", name="rol_enum"),
        default="usuario",
        nullable=False,
    )
    activo = db.Column(db.Boolean, default=True, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    updated_at = db.Column(
        db.DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
        nullable=False,
    )

    # ── Relaciones ────────────────────────────────────────────
    envios = db.relationship(
        "Shipment",
        backref="usuario",
        lazy="dynamic",
        cascade="all, delete-orphan",
    )

    # ── Métodos ──────────────────────────────────────────────
    def to_dict(self, include_private=False):
        """Serializa el usuario a diccionario (sin exponer password_hash)."""
        data = {
            "id": self.id,
            "nombre_completo": self.nombre_completo,
            "correo": self.correo,
            "telefono": self.telefono,
            "direccion": self.direccion,
            "rol": self.rol,
            "activo": self.activo,
            "created_at": self.created_at.isoformat(),
            "updated_at": self.updated_at.isoformat(),
        }
        return data

    def __repr__(self):
        return f"<User {self.correo} [{self.rol}]>"
