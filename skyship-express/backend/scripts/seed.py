"""
Script de semilla para poblar la base de datos con datos iniciales.
Uso:  python scripts/seed.py
"""
import sys
import os

# Asegurar que el path raíz del proyecto esté en el PYTHONPATH
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from dotenv import load_dotenv
load_dotenv()

from app import create_app, db, bcrypt
from app.models.user import User
from app.models.shipment import Shipment
from app.models.contact import Contact
from app.models.shipment import _generar_codigo_guia


def seed():
    app = create_app()

    with app.app_context():
        print("🌱 Inicializando base de datos SkyShip Express...")
        db.create_all()

        # Recuperar pepper desde config (mismo que usa auth.py)
        pepper = app.config.get("PASSWORD_PEPPER", "")

        # ── Usuarios de prueba ────────────────────────────────
        usuarios_data = [
            {
                "nombre_completo": "Administrador SkyShip",
                "correo": "admin@skyship.com",
                "password": "Admin1234!",
                "telefono": "+502 1234-0000",
                "direccion": "Avenida Reforma 12-01, Zona 10, Guatemala",
                "rol": "admin",
            },
            {
                "nombre_completo": "María García López",
                "correo": "maria@correo.com",
                "password": "User1234!",
                "telefono": "+502 5555-1234",
                "direccion": "Calle 5 Av. 3, Zona 1, Guatemala City",
                "rol": "usuario",
            },
            {
                "nombre_completo": "Carlos Mendoza",
                "correo": "carlos@correo.com",
                "password": "User1234!",
                "telefono": "+502 4321-9876",
                "direccion": "13 Calle 4-28, Zona 11, Guatemala",
                "rol": "usuario",
            },
        ]

        usuarios_creados = {}
        for u_data in usuarios_data:
            existente = User.query.filter_by(correo=u_data["correo"]).first()
            if existente:
                print(f"  ⚠️  Usuario ya existe: {u_data['correo']}")
                usuarios_creados[u_data["correo"]] = existente
                continue

            pw_hash = bcrypt.generate_password_hash(u_data["password"] + pepper).decode("utf-8")
            user = User(
                nombre_completo=u_data["nombre_completo"],
                correo=u_data["correo"],
                telefono=u_data["telefono"],
                direccion=u_data["direccion"],
                password_hash=pw_hash,
                rol=u_data["rol"],
            )
            db.session.add(user)
            db.session.flush()  # Para obtener el ID
            usuarios_creados[u_data["correo"]] = user
            print(f"  ✅ Usuario creado: {u_data['correo']} [{u_data['rol']}]")

        db.session.commit()

        # ── Envíos de prueba ──────────────────────────────────
        maria = usuarios_creados.get("maria@correo.com")
        carlos = usuarios_creados.get("carlos@correo.com")

        envios_data = [
            {
                "user": maria,
                "origen": "Guatemala City",
                "destino": "Quetzaltenango",
                "region": "Occidente",
                "peso": 2.5,
                "costo_estimado": 75.00,
                "estado": "entregado",
            },
            {
                "user": maria,
                "origen": "Guatemala City",
                "destino": "Miami, FL, USA",
                "region": "Internacional",
                "peso": 1.2,
                "costo_estimado": 174.00,
                "estado": "en_transito",
            },
            {
                "user": maria,
                "origen": "Antigua Guatemala",
                "destino": "Cobán, Alta Verapaz",
                "region": "Norte",
                "peso": 0.8,
                "costo_estimado": 61.40,
                "estado": "pendiente",
            },
            {
                "user": carlos,
                "origen": "Guatemala City",
                "destino": "Escuintla",
                "region": "Sur",
                "peso": 5.0,
                "costo_estimado": 95.00,
                "estado": "entregado",
            },
            {
                "user": carlos,
                "origen": "Xela",
                "destino": "Petén",
                "region": "Norte",
                "peso": 3.0,
                "costo_estimado": 79.00,
                "estado": "pendiente",
            },
        ]

        for e_data in envios_data:
            if not e_data["user"]:
                continue
            envio = Shipment(
                user_id=e_data["user"].id,
                origen=e_data["origen"],
                destino=e_data["destino"],
                region=e_data["region"],
                peso=e_data["peso"],
                costo_estimado=e_data["costo_estimado"],
                estado=e_data["estado"],
            )
            db.session.add(envio)
            print(f"  📦 Envío creado: {e_data['origen']} → {e_data['destino']}")

        # ── Contacto de prueba ────────────────────────────────
        if not Contact.query.first():
            contacto = Contact(
                nombre="Pedro Ramírez",
                correo="pedro@ejemplo.com",
                telefono="+502 7890-1234",
                mensaje="Hola, quisiera información sobre tarifas de envío internacional a México.",
            )
            db.session.add(contacto)
            print("  📧 Contacto de prueba creado")

        db.session.commit()

        print("\n✅ ¡Seed completado exitosamente!\n")
        print("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
        print("📋 CREDENCIALES DE PRUEBA:")
        print("  Administrador: admin@skyship.com  /  Admin1234!")
        print("  Usuario 1:     maria@correo.com   /  User1234!")
        print("  Usuario 2:     carlos@correo.com  /  User1234!")
        print("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n")


if __name__ == "__main__":
    seed()
