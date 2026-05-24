import random
import string
from datetime import datetime
from app import db


def _generar_codigo_guia():
    """Genera un código de guía único con formato SKY-XXX-00000000."""
    letras = "".join(random.choices(string.ascii_uppercase, k=3))
    numeros = "".join(random.choices(string.digits, k=8))
    return f"SKY-{letras}-{numeros}"


class Shipment(db.Model):
    """
    Modelo ORM para la tabla 'envios'.
    Representa cada solicitud de envío creada por un usuario autenticado.
    """
    __tablename__ = "envios"

    # ── Columnas ─────────────────────────────────────────────
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    codigo_guia = db.Column(
        db.String(20),
        unique=True,
        nullable=False,
        default=_generar_codigo_guia,
        index=True,
    )
    user_id = db.Column(
        db.Integer,
        db.ForeignKey("usuarios.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    origen = db.Column(db.String(150), nullable=False)
    destino = db.Column(db.String(150), nullable=False)
    region = db.Column(db.String(100), nullable=True)
    peso = db.Column(db.Float, nullable=False)
    costo_estimado = db.Column(db.Float, nullable=False)
    estado = db.Column(
        db.Enum("pendiente", "en_transito", "entregado", "cancelado", name="estado_enum"),
        default="pendiente",
        nullable=False,
        index=True,
    )
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    updated_at = db.Column(
        db.DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
        nullable=False,
    )

    # ── Métodos ──────────────────────────────────────────────
    def to_dict(self):
        """Serializa el envío a diccionario incluyendo info básica del usuario."""
        return {
            "id": self.id,
            "codigo_guia": self.codigo_guia,
            "user_id": self.user_id,
            "usuario_nombre": self.usuario.nombre_completo if self.usuario else None,
            "origen": self.origen,
            "destino": self.destino,
            "region": self.region,
            "peso": self.peso,
            "costo_estimado": self.costo_estimado,
            "estado": self.estado,
            "created_at": self.created_at.isoformat(),
            "updated_at": self.updated_at.isoformat(),
        }

    def __repr__(self):
        return f"<Shipment {self.codigo_guia} [{self.estado}]>"
