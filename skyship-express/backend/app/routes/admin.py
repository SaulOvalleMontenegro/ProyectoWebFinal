from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from sqlalchemy import func, extract
from datetime import datetime, timedelta

from app import db, bcrypt
from app.models.user import User
from app.models.shipment import Shipment
from app.models.contact import Contact
from app.utils.decorators import admin_required

admin_bp = Blueprint("admin", __name__)


# ── GET /api/admin/dashboard ──────────────────────────────────────────────────

@admin_bp.route("/dashboard", methods=["GET"])
@jwt_required()
@admin_required
def dashboard():
    """Tablero con estadísticas relevantes para la empresa (ORM aggregations)."""

    # Totales generales
    total_usuarios = User.query.filter_by(rol="usuario").count()
    total_envios = Shipment.query.count()
    total_contactos = Contact.query.count()

    # Envíos por estado (ORM group_by)
    estados = (
        db.session.query(Shipment.estado, func.count(Shipment.id).label("total"))
        .group_by(Shipment.estado)
        .all()
    )
    envios_por_estado = {e.estado: e.total for e in estados}

    # Envíos por mes (últimos 6 meses)
    hace_6_meses = datetime.utcnow() - timedelta(days=180)
    por_mes = (
        db.session.query(
            extract("year", Shipment.created_at).label("anio"),
            extract("month", Shipment.created_at).label("mes"),
            func.count(Shipment.id).label("total"),
        )
        .filter(Shipment.created_at >= hace_6_meses)
        .group_by("anio", "mes")
        .order_by("anio", "mes")
        .all()
    )
    envios_por_mes = [
        {"anio": int(r.anio), "mes": int(r.mes), "total": r.total}
        for r in por_mes
    ]

    # Envíos por región (ORM group_by con filter)
    por_region = (
        db.session.query(Shipment.region, func.count(Shipment.id).label("total"))
        .filter(Shipment.region.isnot(None))
        .group_by(Shipment.region)
        .order_by(func.count(Shipment.id).desc())
        .limit(10)
        .all()
    )
    envios_por_region = [{"region": r.region, "total": r.total} for r in por_region]

    # Ingresos estimados totales
    ingresos = db.session.query(func.sum(Shipment.costo_estimado)).scalar() or 0

    # Mensajes de contacto no leídos
    contactos_no_leidos = Contact.query.filter_by(leido=False).count()

    # Últimos 5 envíos
    ultimos_envios = (
        Shipment.query.order_by(Shipment.created_at.desc()).limit(5).all()
    )

    return jsonify({
        "total_usuarios": total_usuarios,
        "total_envios": total_envios,
        "total_contactos": total_contactos,
        "contactos_no_leidos": contactos_no_leidos,
        "ingresos_estimados": round(ingresos, 2),
        "envios_por_estado": envios_por_estado,
        "envios_por_mes": envios_por_mes,
        "envios_por_region": envios_por_region,
        "ultimos_envios": [e.to_dict() for e in ultimos_envios],
    }), 200


# ── USUARIOS ──────────────────────────────────────────────────────────────────

@admin_bp.route("/users", methods=["GET"])
@jwt_required()
@admin_required
def listar_usuarios():
    """Lista todos los usuarios (ORM: filter + order_by)."""
    usuarios = User.query.order_by(User.created_at.desc()).all()
    return jsonify({"usuarios": [u.to_dict() for u in usuarios]}), 200


@admin_bp.route("/users/<int:user_id>", methods=["PUT"])
@jwt_required()
@admin_required
def actualizar_usuario(user_id):
    """Actualiza datos de un usuario (ORM update)."""
    user = User.query.get_or_404(user_id, description="Usuario no encontrado")
    data = request.get_json(silent=True) or {}

    if "nombre_completo" in data and data["nombre_completo"].strip():
        user.nombre_completo = data["nombre_completo"].strip()
    if "telefono" in data and data["telefono"].strip():
        user.telefono = data["telefono"].strip()
    if "direccion" in data and data["direccion"].strip():
        user.direccion = data["direccion"].strip()
    if "rol" in data and data["rol"] in ("usuario", "admin"):
        user.rol = data["rol"]
    if "activo" in data and isinstance(data["activo"], bool):
        user.activo = data["activo"]
    if "password" in data and data["password"]:
        if len(data["password"]) < 6:
            return jsonify({"error": "La contraseña debe tener al menos 6 caracteres"}), 400
        user.password_hash = bcrypt.generate_password_hash(data["password"]).decode("utf-8")

    db.session.commit()
    return jsonify({"message": "Usuario actualizado", "usuario": user.to_dict()}), 200


@admin_bp.route("/users/<int:user_id>", methods=["DELETE"])
@jwt_required()
@admin_required
def eliminar_usuario(user_id):
    """Elimina un usuario y sus datos personales (ORM delete)."""
    current_user_id = get_jwt_identity()
    if str(user_id) == str(current_user_id):
        return jsonify({"error": "No puedes eliminar tu propia cuenta"}), 400

    user = User.query.get_or_404(user_id, description="Usuario no encontrado")
    db.session.delete(user)
    db.session.commit()
    return jsonify({"message": "Usuario eliminado correctamente"}), 200


# ── ENVÍOS ────────────────────────────────────────────────────────────────────

@admin_bp.route("/shipments", methods=["GET"])
@jwt_required()
@admin_required
def listar_todos_envios():
    """Lista todos los envíos del sistema con filtros opcionales."""
    estado = request.args.get("estado")
    region = request.args.get("region")

    query = Shipment.query

    # ORM: filtros dinámicos
    if estado:
        query = query.filter(Shipment.estado == estado)
    if region:
        query = query.filter(Shipment.region.ilike(f"%{region}%"))

    envios = query.order_by(Shipment.created_at.desc()).all()
    return jsonify({"envios": [e.to_dict() for e in envios]}), 200


@admin_bp.route("/shipments/<int:envio_id>", methods=["PUT"])
@jwt_required()
@admin_required
def actualizar_envio(envio_id):
    """Actualiza un envío (especialmente su estado)."""
    envio = Shipment.query.get_or_404(envio_id, description="Envío no encontrado")
    data = request.get_json(silent=True) or {}

    estados_validos = ("pendiente", "en_transito", "entregado", "cancelado")
    if "estado" in data and data["estado"] in estados_validos:
        envio.estado = data["estado"]
    if "region" in data:
        envio.region = data["region"].strip() or None
    if "costo_estimado" in data:
        try:
            envio.costo_estimado = round(float(data["costo_estimado"]), 2)
        except (ValueError, TypeError):
            return jsonify({"error": "Costo inválido"}), 400

    db.session.commit()
    return jsonify({"message": "Envío actualizado", "envio": envio.to_dict()}), 200


@admin_bp.route("/shipments/<int:envio_id>", methods=["DELETE"])
@jwt_required()
@admin_required
def eliminar_envio(envio_id):
    """Elimina un envío del sistema."""
    envio = Shipment.query.get_or_404(envio_id, description="Envío no encontrado")
    db.session.delete(envio)
    db.session.commit()
    return jsonify({"message": "Envío eliminado correctamente"}), 200


# ── CONTACTOS ─────────────────────────────────────────────────────────────────

@admin_bp.route("/contacts", methods=["GET"])
@jwt_required()
@admin_required
def listar_contactos():
    """Lista todos los mensajes de contacto."""
    contactos = Contact.query.order_by(Contact.created_at.desc()).all()
    return jsonify({"contactos": [c.to_dict() for c in contactos]}), 200
