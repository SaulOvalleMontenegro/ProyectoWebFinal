import re
from flask import Blueprint, request, jsonify
from app import db
from app.models.contact import Contact

contact_bp = Blueprint("contact", __name__)


@contact_bp.route("", methods=["POST"])
def enviar_contacto():
    """
    Guarda un mensaje de contacto del formulario de la landing page.
    No requiere autenticación.
    """
    data = request.get_json(silent=True)
    if not data:
        return jsonify({"error": "Cuerpo JSON inválido"}), 400

    # Validaciones
    for campo in ["nombre", "correo", "telefono", "mensaje"]:
        if not data.get(campo, "").strip():
            return jsonify({"error": f"El campo '{campo}' es requerido"}), 400

    if len(data["nombre"].strip()) < 2:
        return jsonify({"error": "El nombre debe tener al menos 2 caracteres"}), 400

    if not re.match(r"^[^\s@]+@[^\s@]+\.[^\s@]+$", data["correo"]):
        return jsonify({"error": "Correo electrónico inválido"}), 400

    if not re.match(r"^[\d\s\+\-\(\)]{7,15}$", data["telefono"]):
        return jsonify({"error": "Teléfono inválido (7-15 dígitos)"}), 400

    if len(data["mensaje"].strip()) < 10:
        return jsonify({"error": "El mensaje debe tener al menos 10 caracteres"}), 400

    # Guardar en base de datos (ORM)
    contacto = Contact(
        nombre=data["nombre"].strip(),
        correo=data["correo"].lower().strip(),
        telefono=data["telefono"].strip(),
        mensaje=data["mensaje"].strip(),
    )
    db.session.add(contacto)
    db.session.commit()

    return jsonify({"message": "Mensaje enviado correctamente"}), 201
