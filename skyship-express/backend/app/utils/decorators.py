from functools import wraps
from flask import jsonify
from flask_jwt_extended import get_jwt_identity
from app.models.user import User


def admin_required(f):
    """
    Decorador que verifica que el usuario autenticado tenga rol 'admin'.
    Debe usarse DESPUÉS de @jwt_required().
    """
    @wraps(f)
    def decorated(*args, **kwargs):
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        if not user:
            return jsonify({"error": "Usuario no encontrado"}), 404
        if user.rol != "admin":
            return jsonify({"error": "Acceso denegado. Se requiere rol administrador"}), 403
        if not user.activo:
            return jsonify({"error": "Cuenta desactivada"}), 403
        return f(*args, **kwargs)
    return decorated


def active_user_required(f):
    """
    Decorador que verifica que el usuario autenticado esté activo.
    Debe usarse DESPUÉS de @jwt_required().
    """
    @wraps(f)
    def decorated(*args, **kwargs):
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        if not user:
            return jsonify({"error": "Usuario no encontrado"}), 404
        if not user.activo:
            return jsonify({"error": "Cuenta desactivada"}), 403
        return f(*args, **kwargs)
    return decorated
