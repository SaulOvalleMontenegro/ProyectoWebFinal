# ✈ SkyShip Express – Plataforma Web Full-Stack

**Programación Web | Universidad Rafael Landívar | 1S2026**

Sistema web completo para la empresa de paquetería SkyShip Express. Incluye landing page, portal de usuario, gestión de envíos y panel administrativo.

---

## 🏗️ Arquitectura

```
skyship-express/
├── frontend/          React + Vite (Puerto 5173)
│   ├── src/
│   │   ├── components/    Navbar, Footer, PrivateRoute
│   │   ├── context/       AuthContext (manejo de sesión JWT)
│   │   ├── pages/         Home, Login, Register, Dashboard, Admin
│   │   ├── services/      api.js (cliente HTTP para el backend)
│   │   └── Imagenes/      ← COPIAR desde proyecto AEROPAQ
└── backend/           Python + Flask + SQLAlchemy (Puerto 5000)
    ├── app/
    │   ├── models/        User, Shipment, Contact (ORM SQLAlchemy)
    │   ├── routes/        auth, shipments, admin, contact
    │   └── utils/         decorators (admin_required)
    └── scripts/
        └── seed.py        Carga datos iniciales de prueba
```

**Diagrama AWS (Producción):**
```
Internet → Route 53 → CloudFront → S3 (React build)
                  ↓
          ALB → Elastic Beanstalk (Flask/Gunicorn)
                  ↓
              RDS MySQL (skyship_db)
```

---

## ⚙️ Tecnologías utilizadas

| Capa       | Tecnología             | Justificación |
|------------|------------------------|---------------|
| Frontend   | React 19 + Vite 8      | Ecosistema moderno, HMR rápido, componentes reutilizables |
| Routing    | React Router DOM v7    | SPA con protección de rutas |
| Backend    | Python + Flask 3.1     | Ligero, flexible, amplio soporte académico |
| ORM        | Flask-SQLAlchemy 3.1   | Consultas tipadas, soporte MySQL/PostgreSQL, migrations |
| Auth       | Flask-JWT-Extended     | JWT stateless, ideal para APIs REST |
| Passwords  | Flask-Bcrypt           | Hashing bcrypt seguro |
| CORS       | Flask-CORS             | Permite consumo desde el frontend |
| Base datos | MySQL (PyMySQL driver) | Relacional, compatible con AWS RDS |
| Despliegue | AWS (EB + S3 + RDS)    | Escalable, requisito del proyecto |

---

## 🚀 Cómo ejecutar el proyecto

### Pre-requisitos
- Node.js ≥ 18
- Python ≥ 3.11
- MySQL corriendo localmente
- Git

---

### 1️⃣ Base de datos (MySQL)

```sql
-- En MySQL Workbench o terminal:
CREATE DATABASE skyship_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

---

### 2️⃣ Backend (Flask)

```bash
cd backend

# Crear entorno virtual
python -m venv venv

# Activar (Windows)
venv\Scripts\activate

# Activar (macOS/Linux)
source venv/bin/activate

# Instalar dependencias
pip install -r requirements.txt

# Configurar variables de entorno
copy .env.example .env     # Windows
# cp .env.example .env     # macOS/Linux

# Editar .env con tus credenciales de MySQL

# Correr el servidor (también crea las tablas)
python run.py
```

El backend estará disponible en: **http://localhost:5000**

#### Cargar datos de prueba (seed):
```bash
python scripts/seed.py
```

---

### 3️⃣ Frontend (React)

```bash
cd frontend

# Instalar dependencias
npm install

# Configurar variables de entorno
copy .env.example .env     # Windows
# cp .env.example .env     # macOS/Linux

# ⚠️ IMPORTANTE: Copiar las imágenes del proyecto AEROPAQ
# Copiar la carpeta "Imagenes" desde:
# ..\..\..\Proyecto Web\AEROPAQ_WEB_PRIMER_PROYECTO\src\Imagenes\
# Hacia:
# frontend\src\Imagenes\

# Iniciar en modo desarrollo
npm run dev
```

El frontend estará en: **http://localhost:5173**

---

## 🔑 Credenciales de prueba

| Rol          | Correo                | Contraseña  |
|--------------|-----------------------|-------------|
| Administrador | `admin@skyship.com`  | `Admin1234!` |
| Usuario 1    | `maria@correo.com`   | `User1234!`  |
| Usuario 2    | `carlos@correo.com`  | `User1234!`  |

---

## 🌐 Endpoints de la API

### Auth
| Método | Ruta                  | Descripción               | Auth |
|--------|-----------------------|---------------------------|------|
| POST   | `/api/auth/register`  | Registrar nuevo usuario   | No   |
| POST   | `/api/auth/login`     | Iniciar sesión (JWT)      | No   |
| GET    | `/api/auth/me`        | Obtener usuario actual    | JWT  |

### Envíos
| Método | Ruta                      | Descripción                | Auth      |
|--------|---------------------------|----------------------------|-----------|
| GET    | `/api/shipments`          | Listar mis envíos          | JWT       |
| POST   | `/api/shipments`          | Crear nuevo envío          | JWT       |
| GET    | `/api/shipments/<id>`     | Obtener envío por ID       | JWT       |

### Admin
| Método | Ruta                          | Descripción                | Auth        |
|--------|-------------------------------|----------------------------|-------------|
| GET    | `/api/admin/dashboard`        | Estadísticas del tablero   | JWT + Admin |
| GET    | `/api/admin/users`            | Listar usuarios            | JWT + Admin |
| PUT    | `/api/admin/users/<id>`       | Actualizar usuario         | JWT + Admin |
| DELETE | `/api/admin/users/<id>`       | Eliminar usuario           | JWT + Admin |
| GET    | `/api/admin/shipments`        | Listar todos los envíos    | JWT + Admin |
| PUT    | `/api/admin/shipments/<id>`   | Actualizar envío           | JWT + Admin |
| DELETE | `/api/admin/shipments/<id>`   | Eliminar envío             | JWT + Admin |
| GET    | `/api/admin/contacts`         | Ver mensajes de contacto   | JWT + Admin |

### Contacto
| Método | Ruta            | Descripción                     | Auth |
|--------|-----------------|----------------------------------|------|
| POST   | `/api/contact`  | Enviar mensaje de contacto       | No   |

---

## ☁️ Despliegue en AWS

### Frontend (S3 + CloudFront)

```bash
# Construir el proyecto
cd frontend
npm run build

# Subir a S3
aws s3 sync dist/ s3://tu-bucket-skyship/ --delete

# Invalidar cache de CloudFront
aws cloudfront create-invalidation --distribution-id XXXXX --paths "/*"
```

### Backend (Elastic Beanstalk)

```bash
cd backend

# Inicializar EB CLI
eb init skyship-backend --platform python-3.11 --region us-east-1

# Crear entorno
eb create skyship-prod

# Variables de entorno en AWS (consola EB → Configuration → Environment Properties):
# FLASK_ENV=production
# SECRET_KEY=clave-segura-produccion
# JWT_SECRET_KEY=clave-jwt-produccion
# DB_USER=admin
# DB_PASSWORD=tu_pass
# DB_HOST=skyship.xxxxx.us-east-1.rds.amazonaws.com
# DB_PORT=3306
# DB_NAME=skyship_db
# CORS_ORIGINS=https://dxxxxxxxx.cloudfront.net

# Desplegar
eb deploy
```

### Base de datos (RDS MySQL)
1. Crear instancia RDS MySQL en AWS Console
2. Engine: MySQL 8.0
3. Instance class: `db.t3.micro` (free tier)
4. Nombre de DB: `skyship_db`
5. Actualizar `DB_HOST` en las variables de entorno de EB

---

## 📋 Funcionalidades implementadas

### ✅ Landing Page
- [x] Resumen de servicios
- [x] Historia, misión, visión, valores
- [x] FAQ interactivo
- [x] Cotizador de envíos
- [x] Formulario de contacto (guardado en BD)
- [x] Sitio responsivo (mobile-first)

### ✅ Registro e Inicio de Sesión
- [x] Nombre completo, correo, teléfono, dirección, contraseña
- [x] Validaciones front y backend
- [x] JWT con 24h de expiración
- [x] Protección de rutas (PrivateRoute)

### ✅ Envíos (usuario autenticado)
- [x] Listar envíos del usuario
- [x] Crear nuevo envío
- [x] Código de guía único (SKY-XXX-00000000)
- [x] Filtros por estado
- [x] Estadísticas personales

### ✅ Panel Administrativo
- [x] Tablero con KPIs (usuarios, envíos, ingresos, mensajes)
- [x] Gráfico de envíos por estado
- [x] Gráfico de envíos por mes (últimos 6)
- [x] Envíos por región
- [x] CRUD completo de usuarios
- [x] CRUD completo de envíos
- [x] Gestión de roles y estado de cuentas

### ✅ Seguridad
- [x] Contraseñas hasheadas con bcrypt
- [x] Autenticación JWT
- [x] Rutas protegidas por rol
- [x] Validaciones de entrada en backend
- [x] CORS configurado

---

## 🔧 Decisiones técnicas

1. **Flask-SQLAlchemy como ORM**: Permite escribir consultas en Python puro sin SQL manual, facilita el cambio de base de datos, soporta relaciones, `filter_by`, `group_by`, `func.count()`, etc.

2. **JWT stateless**: No se necesita mantener sesiones en el servidor, escalable horizontalmente en AWS.

3. **React sin librerías de UI de terceros**: Cumple el requisito "no templates de terceros". Todo el CSS es propio.

4. **Vite proxy en desarrollo**: Evita problemas de CORS en local sin modificar el backend.

5. **Pool de conexiones SQLAlchemy**: Configurado con `pool_pre_ping=True` para reconexión automática, importante en AWS RDS con timeouts.

---

*Proyecto desarrollado para el curso Programación Web – Universidad Rafael Landívar – 1S2026*
