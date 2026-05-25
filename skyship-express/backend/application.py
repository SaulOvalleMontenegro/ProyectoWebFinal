import os
from dotenv import load_dotenv
load_dotenv()

from app import create_app, db

application = create_app()

with application.app_context():
    db.create_all()