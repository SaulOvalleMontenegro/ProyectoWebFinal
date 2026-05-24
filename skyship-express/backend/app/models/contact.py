from datetime import datetime
from app import db


class Contact(db.Model):
    """
    Modelo ORM para la tabla 'contactos'.
    Almacena los mensajes enviados desde el formulario de la landing page.
    """
    __tablename__ = "contactos"

    # ── Columnas ─────────────────────────────────────────────
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    nombre = db.Column(db.String(150), nullable=False)
    correo = db.Column(db.String(150), nullable=False)
    telefono = db.Column(db.String(20), nullable=False)
    mensaje = db.Column(db.Text, nullable=False)
    leido = db.Column(db.Boolean, default=False, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

    # ── Métodos ──────────────────────────────────────────────
    def to_dict(self):
        return {
            "id": self.id,
            "nombre": self.nombre,
            "correo": self.correo,
            "telefono": self.telefono,
            "mensaje": self.mensaje,
            "leido": self.leido,
            "created_at": self.created_at.isoformat(),
        }

    def __repr__(self):
        return f"<Contact {self.nombre} – {self.created_at.date()}>"
