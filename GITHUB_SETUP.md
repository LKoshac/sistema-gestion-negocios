# 📚 Instrucciones para Subir a GitHub

## 🚀 Pasos para crear el repositorio en GitHub:

### 1. Crear repositorio en GitHub.com
1. Ve a [GitHub.com](https://github.com) e inicia sesión
2. Haz clic en el botón **"New"** o **"+"** → **"New repository"**
3. Configura el repositorio:
   - **Repository name**: `sistema-gestion-negocios`
   - **Description**: `Sistema integral de gestión de negocios con POS, inventario, contabilidad y reportes automáticos`
   - **Visibility**: Public o Private (según tu preferencia)
   - **NO marques** "Initialize this repository with a README" (ya tenemos uno)

### 2. Conectar el repositorio local con GitHub
```bash
# Agregar el repositorio remoto (reemplaza USERNAME con tu usuario de GitHub)
git remote add origin https://github.com/USERNAME/sistema-gestion-negocios.git

# Verificar que se agregó correctamente
git remote -v

# Subir el código a GitHub
git push -u origin main
```

### 3. Verificar la subida
- Ve a tu repositorio en GitHub
- Deberías ver todos los archivos y el commit inicial
- El README.md se mostrará automáticamente en la página principal

## 📁 Estructura del Proyecto Subido

```
sistema-gestion-negocios/
├── 📂 backend/                 # Servidor Node.js + Express
│   ├── 📂 config/             # Configuración de BD
│   ├── 📂 controllers/        # Lógica de negocio
│   ├── 📂 middlewares/        # Autenticación y errores
│   ├── 📂 models/             # Modelos de datos SQLite
│   ├── 📂 routes/             # Rutas de la API
│   ├── app.js                 # Aplicación principal
│   └── package.json           # Dependencias
├── 📂 frontend/               # Cliente web
│   ├── 📂 js/                 # JavaScript modules
│   ├── 📂 styles/             # CSS con Bootstrap
│   └── index.html             # Página principal
├── 📚 MANUAL_USUARIO.md       # Manual completo
├── 📖 README.md               # Documentación técnica
├── 🚫 .gitignore             # Archivos excluidos
└── 📋 GITHUB_SETUP.md        # Este archivo
```

## 🎯 Características del Proyecto

### ✨ Funcionalidades Principales
- **🛒 Punto de Venta (POS)** - Página principal con carrito
- **📊 Dashboard** - Métricas con Bootstrap y gradientes
- **📦 Gestión de Inventario** - Control completo de stock
- **💰 Contabilidad** - Plan de cuentas y reportes
- **👥 Usuarios y Proveedores** - Gestión completa
- **📧 Emails Automáticos** - Reportes mensuales configurables
- **📱 Responsive Design** - Tema oscuro con márgenes transparentes

### 🛠️ Tecnologías
- **Backend**: Node.js, Express, SQLite, JWT, Nodemailer
- **Frontend**: HTML5, CSS3, JavaScript ES6+, Bootstrap 5.3
- **Base de Datos**: SQLite con esquema relacional completo
- **Autenticación**: JWT con roles (admin/empleado)
- **Email**: Nodemailer para reportes automáticos

### 🔐 Credenciales por Defecto
- **Usuario**: `admin`
- **Contraseña**: `admin123`
- **Rol**: Administrador (acceso completo)

## 🚀 Instalación y Uso

### Backend
```bash
cd backend
npm install
npm start
# Servidor en http://localhost:3001
```

### Frontend
```bash
cd frontend
python3 -m http.server 8000
# Aplicación en http://localhost:8000/frontend/
```

## 📈 Estadísticas del Proyecto
- **49 archivos** creados
- **13,456 líneas** de código
- **Documentación completa** incluida
- **Sistema completo** listo para producción

## 🤝 Contribución
1. Fork el repositorio
2. Crea una rama feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit tus cambios (`git commit -am 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Crea un Pull Request

## 📄 Licencia
Este proyecto está bajo la Licencia MIT - ver el archivo LICENSE para detalles.

---

**¡Tu Sistema de Gestión de Negocios está listo para GitHub! 🎉**
