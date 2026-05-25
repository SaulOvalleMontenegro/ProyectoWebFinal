import os
from dotenv import load_dotenv

load_dotenv()

from app import create_app, db

app = create_app()

# Al poner esto aquí afuera, Gunicorn lo ejecutará al arrancar en AWS
with app.app_context():
    db.create_all()
    print("✅ Base de datos inicializada (o verificada) correctamente.")

# Esto solo se ejecutará cuando corras el servidor en tu computadora (local)
if __name__ == '__main__':
    port = int(os.getenv('PORT', 8000))
    debug = os.getenv('FLASK_ENV', 'development') == 'development'
    print(f"🚀 SkyShip Express API corriendo en http://localhost:{port}")
    app.run(host='0.0.0.0', port=port, debug=debug)