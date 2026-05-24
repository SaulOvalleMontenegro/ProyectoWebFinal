import re
from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity

from app import db, bcrypt
from app.models.user import User


# ── Helper: pepper ────────────────────────────────────────────────────────────

def _apply_pepper(password: str) -> str:
    """Concatena el pepper (secreto de servidor) a la contraseña.
    El pepper vive en config/env, nunca en la base de datos.
    Incluso si roban la BD completa, los hashes son inútiles sin él."""
    pepper = current_app.config.get("PASSWORD_PEPPER", "")
    return password + pepper

auth_bp = Blueprint("auth", __name__)


# ── Helpers de validación ─────────────────────────────────────────────────────

def _validar_correo(correo):
    return bool(re.match(r"^[^\s@]+@[^\s@]+\.[^\s@]+$", correo))

def _validar_telefono(telefono):
    return bool(re.match(r"^[\d\s\+\-\(\)]{7,15}$", telefono))


# ── POST /api/auth/register ───────────────────────────────────────────────────

@auth_bp.route("/register", methods=["POST"])
def register():
    """Registra un nuevo usuario en el sistema."""
    data = request.get_json(silent=True)
    if not data:
        return jsonify({"error": "Cuerpo JSON inválido"}), 400

    # Validaciones
    campos = ["nombre_completo", "correo", "telefono", "direccion", "password"]
    for campo in campos:
        if not data.get(campo, "").strip():
            return jsonify({"error": f"El campo '{campo}' es requerido"}), 400

    if len(data["nombre_completo"].strip()) < 2:
        return jsonify({"error": "El nombre debe tener al menos 2 caracteres"}), 400

    if not _validar_correo(data["correo"]):
        return jsonify({"error": "Correo electrónico inválido"}), 400

    if not _validar_telefono(data["telefono"]):
        return jsonify({"error": "Número de teléfono inválido"}), 400

    if len(data["password"]) < 6:
        return jsonify({"error": "La contraseña debe tener al menos 6 caracteres"}), 400

    # Verificar correo único (ORM query)
    if User.query.filter_by(correo=data["correo"].lower()).first():
        return jsonify({"error": "El correo ya está registrado"}), 409

    # Crear usuario (ORM) — hash + salt (bcrypt automático) + pepper (secreto de servidor)
    password_hash = bcrypt.generate_password_hash(_apply_pepper(data["password"])).decode("utf-8")
    user = User(
        nombre_completo=data["nombre_completo"].strip(),
        correo=data["correo"].lower().strip(),
        telefono=data["telefono"].strip(),
        direccion=data["direccion"].strip(),
        password_hash=password_hash,
    )
    db.session.add(user)
    db.session.commit()

    token = create_access_token(identity=str(user.id))
    return jsonify({
        "message": "Usuario registrado exitosamente",
        "token": token,
        "user": user.to_dict(),
    }), 201


# ── POST /api/auth/login ──────────────────────────────────────────────────────

@auth_bp.route("/login", methods=["POST"])
def login():
    """Autentica un usuario y devuelve un JWT."""
    data = request.get_json(silent=True)
    if not data:
        return jsonify({"error": "Cuerpo JSON inválido"}), 400

    correo = data.get("correo", "").lower().strip()
    password = data.get("password", "")

    if not correo or not password:
        return jsonify({"error": "Correo y contraseña son requeridos"}), 400

    # Buscar usuario por correo (ORM query con filter_by)
    user = User.query.filter_by(correo=correo).first()

    if not user or not bcrypt.check_password_hash(user.password_hash, _apply_pepper(password)):
        return jsonify({"error": "Credenciales incorrectas"}), 401

    if not user.activo:
        return jsonify({"error": "Cuenta desactivada. Contacta al administrador"}), 403

    token = create_access_token(identity=str(user.id))
    return jsonify({
        "message": "Login exitoso",
        "token": token,
        "user": user.to_dict(),
    }), 200


# ── GET /api/auth/me ──────────────────────────────────────────────────────────

@auth_bp.route("/me", methods=["GET"])
@jwt_required()
def me():
    """Devuelve la información del usuario autenticado."""
    user_id = get_jwt_identity()
    user = User.query.get(user_id)   # ORM: buscar por PK
    if not user:
        return jsonify({"error": "Usuario no encontrado"}), 404
    return jsonify({"user": user.to_dict()}), 200
