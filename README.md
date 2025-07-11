<p align="center"> <img src="https://komarev.com/ghpvc/?username=Reinosojp96&label=Vistas&color=blue" alt="visitors"/> <img src="https://img.shields.io/github/stars/Reinosojp96/krono_coffe?style=social" alt="stars"/> </p> <h1 align="center">☕ Krono Coffee</h1> <h1 align="center">https://krono-coffee-api.onrender.com</h1> <p align="center"> Aplicación web de gestión para cafeterías con <strong>FastAPI</strong>, <strong>postgreSQL</strong> y <strong>JavaScript</strong>. Diseñada para optimizar menús, pedidos, pagos y promociones a través de una interfaz moderna y eficiente. </p>
 

📸 Vista Previa
<p align="center"> <img src="frontend/preview.png" alt="Captura de pantalla" width="80%"> </p>
🚀 Tecnologías Utilizadas
<div align="left"> <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/html5/html5-original.svg" height="30"/> <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/css3/css3-original.svg" height="30"/> <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg" height="30"/> <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg" height="30"/> <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mysql/mysql-original.svg" height="30"/> <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/fastapi/fastapi-original.svg" height="30"/> </div>
📁 Estructura del Proyecto
bash
Copiar
Editar
krono_coffe_Python/
├── backend/
│   └── app/
│       ├── api/            # Rutas versionadas de la API
│       ├── core/           # Seguridad y configuración
│       ├── crud/           # Lógica de base de datos
│       ├── db/             # Modelo y conexión a la BD
│       └── app_main.py     # Punto de entrada del backend
├── frontend/
│   ├── index.html          # Interfaz principal
│   ├── style.css           # Estilos visuales
│   ├── script.js           # Lógica frontend
│   └── foto.jpg            # Imagen demostrativa
├── requirements.txt        # Dependencias de Python
🔑 Características Principales
✅ Autenticación JWT

📋 Gestión de Menús (crear, editar, listar)

🎁 Promociones y Ofertas vía API

🛒 Pedidos: gestión completa de órdenes

💳 Pagos vinculados a los pedidos

🔄 Sistema de Cambios (opcional)

⚙️ Instalación y Ejecución Local
1. Clonar el repositorio
bash
Copiar
Editar
git clone https://github.com/Reinosojp96/krono_coffe.git
cd krono_coffe_Python
2. Backend
bash
Copiar
Editar
cd backend
python -m venv .venv
source .venv/bin/activate  # En Windows: .venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.app_main:app --reload
Accede a: http://localhost:8000

3. Frontend
Abre frontend/index.html directamente en el navegador
o usa la extensión Live Server de VS Code.

🔌 Conexión Backend ↔ Frontend
En frontend/script.js, configura la URL base de la API:

js
Copiar
Editar
const API_BASE_URL = 'http://localhost:8000/api/v1';
📎 Requisitos
Python 3.11+

Navegador moderno (Chrome, Firefox, Edge)

MySQL 8+ o equivalente compatible con SQLAlchemy

🛡 Seguridad
🔐 JWT para proteger rutas privadas

🌐 Middleware CORS

🧱 Separación de responsabilidades en el código

🤝 Autor
Julian Perdomo

<div align="left"> <a href="mailto:juliandresp09@gmail.com" target="_blank"> <img src="https://img.shields.io/static/v1?message=Gmail&logo=gmail&label=&color=D14836&logoColor=white&style=for-the-badge" height="30"/> </a> <a href="https://www.linkedin.com/in/julian-reinoso-325385336" target="_blank"> <img src="https://img.shields.io/static/v1?message=LinkedIn&logo=linkedin&label=&color=0077B5&logoColor=white&style=for-the-badge" height="30"/> </a> <a href="https://wa.me/3027358711" target="_blank"> <img src="https://img.shields.io/static/v1?message=WhatsApp&logo=whatsapp&label=&color=25D366&logoColor=white&style=for-the-badge" height="30"/> </a> </div>
<p align="center">⭐ ¡Gracias por visitar Krono Coffee! Si te gusta el proyecto, considera dejar una estrella ⭐</p>
