# 🚀 Sistema de Gestión de Negocios

Una aplicación web completa para la gestión integral de negocios, desarrollada con **Node.js**, **Express**, **SQLite** y **JavaScript vanilla** con un elegante tema oscuro.

## 📋 Características Principales

### 🎯 Módulos Funcionales
- **👤 Gestión de Usuarios**: Autenticación, roles y permisos
- **📦 Suministros**: Catálogo de productos y servicios
- **📊 Control de Stock**: Inventario y movimientos en tiempo real
- **🏢 Proveedores**: Gestión de relaciones comerciales
- **💰 Pagos**: Control de ingresos y egresos
- **📋 Contabilidad**: Plan de cuentas y reportes financieros
- **🛒 Punto de Venta**: Sistema POS completo
- **📈 Dashboard**: Métricas y KPIs en tiempo real

### 🎨 Interfaz de Usuario
- **🌙 Tema Oscuro Moderno**: Diseño elegante y profesional
- **📱 Responsive Design**: Adaptable a todos los dispositivos
- **⚡ Animaciones Suaves**: Transiciones y efectos visuales
- **🔍 Búsqueda Avanzada**: Filtros y ordenamiento
- **📊 Reportes Interactivos**: Dashboards dinámicos

## 🛠️ Tecnologías Utilizadas

### Backend
- **Node.js** - Runtime de JavaScript
- **Express.js** - Framework web
- **SQLite** - Base de datos embebida
- **JWT** - Autenticación segura
- **bcrypt** - Encriptación de contraseñas
- **CORS** - Intercambio de recursos

### Frontend
- **HTML5** - Estructura semántica
- **CSS3** - Estilos modernos con variables CSS
- **JavaScript ES6+** - Lógica del cliente
- **Fetch API** - Comunicación con backend
- **Google Fonts** - Tipografía Inter

## 📁 Estructura del Proyecto

```
📦 sistema-gestion-negocios/
├── 📂 backend/
│   ├── 📂 config/
│   │   └── config.js              # Configuración general
│   ├── 📂 controllers/
│   │   ├── usersController.js     # Lógica de usuarios
│   │   ├── suppliesController.js  # Lógica de suministros
│   │   ├── stockController.js     # Lógica de stock
│   │   ├── suppliersController.js # Lógica de proveedores
│   │   ├── paymentsController.js  # Lógica de pagos
│   │   ├── accountsController.js  # Lógica contable
│   │   └── cajaController.js      # Lógica de POS
│   ├── 📂 middlewares/
│   │   ├── authMiddleware.js      # Autenticación JWT
│   │   └── errorMiddleware.js     # Manejo de errores
│   ├── 📂 models/
│   │   ├── user.js                # Modelo de usuarios
│   │   ├── supply.js              # Modelo de suministros
│   │   ├── stock.js               # Modelo de stock
│   │   ├── supplier.js            # Modelo de proveedores
│   │   ├── payment.js             # Modelo de pagos
│   │   ├── account.js             # Modelo contable
│   │   └── caja.js                # Modelo de POS
│   ├── 📂 routes/
│   │   ├── usersRoutes.js         # Rutas de usuarios
│   │   ├── suppliesRoutes.js      # Rutas de suministros
│   │   ├── stockRoutes.js         # Rutas de stock
│   │   ├── suppliersRoutes.js     # Rutas de proveedores
│   │   ├── paymentsRoutes.js      # Rutas de pagos
│   │   ├── accountsRoutes.js      # Rutas contables
│   │   └── cajaRoutes.js          # Rutas de POS
│   ├── app.js                     # Aplicación principal
│   ├── package.json               # Dependencias backend
│   └── database.sqlite            # Base de datos SQLite
├── 📂 frontend/
│   ├── 📂 js/
│   │   ├── api.js                 # Cliente API
│   │   ├── auth.js                # Autenticación frontend
│   │   ├── app.js                 # Aplicación principal
│   │   ├── dashboard.js           # Dashboard
│   │   ├── supplies.js            # Gestión suministros
│   │   ├── stock.js               # Control stock
│   │   ├── suppliers.js           # Gestión proveedores
│   │   ├── payments.js            # Gestión pagos
│   │   ├── accounts.js            # Gestión contable
│   │   ├── caja.js                # Punto de venta
│   │   └── users.js               # Gestión usuarios
│   ├── 📂 styles/
│   │   ├── main.css               # Estilos originales
│   │   └── dark-theme.css         # Tema oscuro
│   └── index.html                 # Página principal
├── MANUAL_USUARIO.md              # Manual de usuario
└── README.md                      # Documentación técnica
```

## 🚀 Instalación y Configuración

### Prerrequisitos
- **Node.js** v14 o superior
- **npm** v6 o superior
- **Python 3** (para servidor frontend)

### 1. Clonar el Repositorio
```bash
git clone <repository-url>
cd sistema-gestion-negocios
```

### 2. Configurar Backend
```bash
cd backend
npm install
npm start
```
El servidor backend estará disponible en `http://localhost:3001`

### 3. Configurar Frontend
```bash
cd frontend
python3 -m http.server 8000
```
La aplicación estará disponible en `http://localhost:8000/frontend/`

### 4. Acceso Inicial
- **URL**: `http://localhost:8000/frontend/`
- **Usuario**: `admin`
- **Contraseña**: `admin123`

## 🗄️ Base de Datos

### Esquema SQLite
La aplicación utiliza SQLite con las siguientes tablas principales:

#### Usuarios
```sql
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT DEFAULT 'empleado',
    nombre TEXT NOT NULL,
    apellido TEXT NOT NULL,
    telefono TEXT,
    activo INTEGER DEFAULT 1,
    fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

#### Suministros
```sql
CREATE TABLE supplies (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL,
    descripcion TEXT,
    categoria TEXT,
    precio_compra REAL DEFAULT 0,
    precio_venta REAL DEFAULT 0,
    stock_minimo INTEGER DEFAULT 0,
    unidad_medida TEXT DEFAULT 'unidad',
    codigo_barras TEXT,
    activo INTEGER DEFAULT 1,
    fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

#### Stock
```sql
CREATE TABLE stock (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    suministro_id INTEGER NOT NULL,
    cantidad_actual INTEGER DEFAULT 0,
    cantidad_reservada INTEGER DEFAULT 0,
    ubicacion TEXT,
    fecha_actualizacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (suministro_id) REFERENCES supplies (id)
);
```

## 🔐 Autenticación y Seguridad

### JWT (JSON Web Tokens)
- **Expiración**: 8 horas
- **Algoritmo**: HS256
- **Payload**: ID, username, role, nombre, apellido

### Roles y Permisos
- **👑 Admin**: Acceso completo a todas las funciones
- **👤 Empleado**: Acceso limitado (sin gestión de usuarios)

### Middleware de Autenticación
```javascript
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
        return res.status(401).json({ error: 'Token requerido' });
    }
    
    jwt.verify(token, config.jwtSecret, (err, user) => {
        if (err) return res.status(403).json({ error: 'Token inválido' });
        req.user = user;
        next();
    });
};
```

## 🎨 Tema Oscuro

### Variables CSS
```css
:root {
    --primary-color: #3b82f6;
    --background-color: #0f172a;
    --surface-color: #1e293b;
    --text-primary: #f1f5f9;
    --text-secondary: #94a3b8;
    --border-color: #334155;
}
```

### Características Visuales
- **Gradientes**: Efectos visuales modernos
- **Sombras**: Profundidad y elevación
- **Animaciones**: Transiciones suaves
- **Hover Effects**: Interactividad mejorada

## 📡 API Endpoints

### Autenticación
```
POST /api/usuarios/login          # Iniciar sesión
GET  /api/usuarios/profile        # Perfil del usuario
```

### Suministros
```
GET    /api/suministros           # Listar suministros
POST   /api/suministros           # Crear suministro
GET    /api/suministros/:id       # Obtener suministro
PUT    /api/suministros/:id       # Actualizar suministro
DELETE /api/suministros/:id       # Eliminar suministro
GET    /api/suministros/search    # Buscar suministros
```

### Stock
```
GET  /api/stock                   # Listar stock
GET  /api/stock/:id               # Stock por suministro
PUT  /api/stock/:id               # Actualizar stock
POST /api/stock/:id/movements     # Registrar movimiento
GET  /api/stock/low-stock         # Stock bajo
```

### Proveedores
```
GET    /api/proveedores           # Listar proveedores
POST   /api/proveedores           # Crear proveedor
GET    /api/proveedores/:id       # Obtener proveedor
PUT    /api/proveedores/:id       # Actualizar proveedor
DELETE /api/proveedores/:id       # Eliminar proveedor
```

### Pagos
```
GET  /api/pagos                   # Listar pagos
POST /api/pagos                   # Registrar pago
GET  /api/pagos/report            # Reporte de pagos
GET  /api/pagos/type/:tipo        # Pagos por tipo
```

### Cuentas Contables
```
GET  /api/cuentas                 # Plan de cuentas
POST /api/cuentas                 # Crear cuenta
GET  /api/cuentas/balance-sheet   # Balance general
GET  /api/cuentas/income-statement # Estado de resultados
```

### Punto de Venta
```
POST /api/caja/sessions/open      # Abrir sesión
PUT  /api/caja/sessions/:id/close # Cerrar sesión
POST /api/caja/sales              # Registrar venta
GET  /api/caja/sales/daily        # Ventas del día
```

## 🧪 Testing

### Pruebas Manuales
1. **Autenticación**: Login/logout
2. **CRUD Operations**: Crear, leer, actualizar, eliminar
3. **Validaciones**: Campos requeridos, formatos
4. **Permisos**: Acceso por roles
5. **Responsive**: Diferentes dispositivos

### Herramientas Recomendadas
- **Postman**: Testing de API
- **Chrome DevTools**: Debug frontend
- **SQLite Browser**: Inspección de BD

## 🔧 Configuración Avanzada

### Variables de Entorno
```javascript
// backend/config/config.js
module.exports = {
    port: process.env.PORT || 3001,
    jwtSecret: process.env.JWT_SECRET || 'tu-secreto-jwt',
    dbPath: process.env.DB_PATH || './database.sqlite'
};
```

### CORS Configuration
```javascript
app.use(cors({
    origin: ['http://localhost:3000', 'http://localhost:8000'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
```

## 🚀 Despliegue

### Producción
1. **Backend**: Usar PM2 o similar
2. **Frontend**: Servidor web (Nginx, Apache)
3. **Base de datos**: Migrar a PostgreSQL/MySQL
4. **SSL**: Certificados HTTPS
5. **Dominio**: Configurar DNS

### Docker (Opcional)
```dockerfile
# Dockerfile para backend
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3001
CMD ["npm", "start"]
```

## 🐛 Solución de Problemas

### Errores Comunes

#### "EADDRINUSE: address already in use"
```bash
# Liberar puerto
fuser -k 3001/tcp
```

#### "NetworkError when attempting to fetch"
- Verificar que backend esté funcionando
- Comprobar configuración CORS
- Revisar URL de API en frontend

#### "Token inválido"
- Verificar expiración del token
- Comprobar secreto JWT
- Revisar headers de autorización

## 🔮 Roadmap

### Próximas Funcionalidades
- [ ] **Integración de Pagos**: Stripe, PayPal
- [ ] **Reportes Avanzados**: Gráficos interactivos
- [ ] **Notificaciones Push**: Alertas en tiempo real
- [ ] **Multi-empresa**: Gestión de múltiples negocios
- [ ] **API REST completa**: Documentación OpenAPI
- [ ] **Tests automatizados**: Jest, Cypress
- [ ] **PWA**: Aplicación web progresiva
- [ ] **Backup automático**: Respaldo de datos

### Mejoras Técnicas
- [ ] **TypeScript**: Tipado estático
- [ ] **React/Vue**: Framework frontend moderno
- [ ] **PostgreSQL**: Base de datos robusta
- [ ] **Redis**: Cache y sesiones
- [ ] **Docker**: Containerización
- [ ] **CI/CD**: Integración continua

## 🤝 Contribución

### Cómo Contribuir
1. Fork del repositorio
2. Crear rama feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit cambios (`git commit -am 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Crear Pull Request

### Estándares de Código
- **ESLint**: Linting de JavaScript
- **Prettier**: Formateo de código
- **Conventional Commits**: Mensajes de commit
- **JSDoc**: Documentación de funciones

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 👥 Equipo

- **Desarrollador Principal**: Sistema de Gestión de Negocios
- **Arquitectura**: Node.js + Express + SQLite
- **Frontend**: JavaScript Vanilla + CSS3
- **Diseño**: Tema Oscuro Moderno

## 📞 Soporte

Para soporte técnico o consultas:
- **Issues**: Crear issue en GitHub
- **Documentación**: Ver `MANUAL_USUARIO.md`
- **Email**: [tu-email@ejemplo.com]

---

**¡Gracias por usar nuestro Sistema de Gestión de Negocios! 🚀**

*Desarrollado con ❤️ para hacer la gestión de negocios más fácil y eficiente.*
