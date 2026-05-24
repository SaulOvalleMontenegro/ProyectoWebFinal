from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity

from app import db
from app.models.shipment import Shipment
from app.models.user import User
from app.utils.decorators import active_user_required

shipments_bp = Blueprint("shipments", __name__)

# Tarifas de costo (mismas que el cotizador del frontend)
_TARIFAS = {
    "misma_ciudad":       {"base": 25, "por_kg": 5},
    "otro_departamento":  {"base": 55, "por_kg": 8},
    "internacional":      {"base": 150, "por_kg": 20},
}


# ── GET /api/shipments ────────────────────────────────────────────────────────

@shipments_bp.route("", methods=["GET"])
@jwt_required()
@active_user_required
def listar_envios():
    """Devuelve todos los envíos del usuario autenticado (ORM dynamic query)."""
    user_id = get_jwt_identity()
    user = User.query.get(user_id)

    # ORM: consulta dinámica sobre la relación, ordenada por fecha
    envios = (
        user.envios
        .order_by(Shipment.created_at.desc())
        .all()
    )
    return jsonify({"envios": [e.to_dict() for e in envios]}), 200


# ── POST /api/shipments ───────────────────────────────────────────────────────

@shipments_bp.route("", methods=["POST"])
@jwt_required()
@active_user_required
def crear_envio():
    """Crea un nuevo envío para el usuario autenticado."""
    user_id = get_jwt_identity()
    data = request.get_json(silent=True)
    if not data:
        return jsonify({"error": "Cuerpo JSON inválido"}), 400

    # Validaciones
    for campo in ["origen", "destino", "peso", "tipo_ruta"]:
        if not data.get(campo):
            return jsonify({"error": f"El campo '{campo}' es requerido"}), 400

    tipo = data.get("tipo_ruta", "misma_ciudad")
    if tipo not in _TARIFAS:
        return jsonify({"error": "Tipo de ruta inválido"}), 400

    try:
        peso = float(data["peso"])
        if peso <= 0:
            raise ValueError
    except (ValueError, TypeError):
        return jsonify({"error": "El peso debe ser un número mayor a 0"}), 400

    # Calcular costo estimado
    tarifa = _TARIFAS[tipo]
    nivel_mult = 1.6 if data.get("nivel") == "expres" else 1.0
    costo = (tarifa["base"] + peso * tarifa["por_kg"]) * nivel_mult
    if data.get("recoleccion"):
        costo += 20
    if data.get("seguro"):
        costo += 15

    # Crear envío (ORM)
    envio = Shipment(
        user_id=int(user_id),
        origen=data["origen"].strip(),
        destino=data["destino"].strip(),
        region=data.get("region", "").strip() or None,
        peso=peso,
        costo_estimado=round(costo, 2),
    )
    db.session.add(envio)
    db.session.commit()

    return jsonify({
        "message": "Envío creado exitosamente",
        "envio": envio.to_dict(),
    }), 201


# ── GET /api/shipments/<id> ───────────────────────────────────────────────────

@shipments_bp.route("/<int:envio_id>", methods=["GET"])
@jwt_required()
@active_user_required
def obtener_envio(envio_id):
    """Obtiene un envío por ID (solo si pertenece al usuario autenticado)."""
    user_id = get_jwt_identity()

    # ORM: buscar con filter (asegura que el envío sea del usuario)
    envio = Shipment.query.filter_by(id=envio_id, user_id=int(user_id)).first()
    if not envio:
        return jsonify({"error": "Envío no encontrado"}), 404

    return jsonify({"envio": envio.to_dict()}), 200
