# 📚 Manual de Usuario - Sistema de Gestión de Negocios

## 🚀 Introducción

Bienvenido al **Sistema de Gestión de Negocios**, una aplicación web completa diseñada para administrar todos los aspectos de tu negocio de manera eficiente y profesional.

---

## 🔧 Instalación y Configuración

### Requisitos del Sistema
- **Node.js** (versión 14 o superior)
- **Python 3** (para servidor frontend)
- **Navegador web moderno** (Chrome, Firefox, Safari, Edge)

### Iniciar la Aplicación

1. **Backend (API)**:
   ```bash
   cd backend
   npm install
   npm start
   ```
   - Servidor: `http://localhost:3001`

2. **Frontend (Interfaz)**:
   ```bash
   cd frontend
   python3 -m http.server 8000
   ```
   - Aplicación: `http://localhost:8000/frontend/`

---

## 🔐 Acceso al Sistema

### Credenciales por Defecto
- **Usuario**: `admin`
- **Contraseña**: `admin123`
- **Rol**: Administrador (acceso completo)

### Tipos de Usuario
- **👑 Administrador**: Acceso completo a todas las funciones
- **👤 Empleado**: Acceso limitado (sin gestión de usuarios)

---

## 🏠 Dashboard Principal

Al iniciar sesión, verás el **Dashboard** con métricas importantes:

### 📊 Métricas Principales
- **💰 Resumen de Ventas**: Total de ingresos del día
- **📦 Stock Bajo**: Productos que necesitan reposición
- **🏢 Proveedores**: Número de proveedores activos
- **💹 Balance**: Diferencia entre ingresos y egresos

---

## 📦 Gestión de Suministros

### ➕ Agregar Suministro
1. Ir a **"Suministros"** en el menú lateral
2. Hacer clic en **"Agregar Suministro"**
3. Completar el formulario:
   - **Nombre**: Nombre del producto/servicio
   - **Descripción**: Detalles adicionales
   - **Categoría**: Clasificación del producto
   - **Precio de Compra**: Costo de adquisición
   - **Precio de Venta**: Precio al público
   - **Stock Mínimo**: Cantidad mínima en inventario
   - **Unidad de Medida**: Unidad, Kg, Litro, etc.

### 📝 Gestionar Suministros
- **Ver todos**: Lista completa con filtros
- **Editar**: Modificar información existente
- **Eliminar**: Remover productos (solo admin)
- **Buscar**: Filtrar por nombre o categoría

---

## 📊 Control de Stock

### 📈 Movimientos de Stock
1. Ir a **"Control Stock"**
2. Hacer clic en **"Registrar Movimiento"**
3. Seleccionar tipo:
   - **Entrada**: Compras, devoluciones
   - **Salida**: Ventas, pérdidas
   - **Ajuste**: Correcciones de inventario

### 🔍 Monitoreo
- **Stock actual**: Cantidad disponible
- **Stock reservado**: Cantidad apartada
- **Alertas**: Productos con stock bajo
- **Historial**: Todos los movimientos

---

## 🏢 Gestión de Proveedores

### ➕ Agregar Proveedor
1. Ir a **"Proveedores"**
2. Hacer clic en **"Agregar Proveedor"**
3. Completar información:
   - **Datos básicos**: Nombre, razón social, RFC
   - **Contacto**: Teléfono, email, dirección
   - **Condiciones**: Días de crédito, términos de pago

### 🔗 Gestión de Relaciones
- **Asignar suministros**: Vincular productos con proveedores
- **Precios especiales**: Configurar precios por proveedor
- **Tiempos de entrega**: Establecer plazos de entrega
- **Reportes**: Análisis de desempeño por proveedor

---

## 💰 Gestión de Pagos

### 💳 Registrar Pagos
1. Ir a **"Pagos"**
2. Hacer clic en **"Registrar Pago"**
3. Especificar:
   - **Tipo**: Ingreso o Egreso
   - **Concepto**: Descripción del pago
   - **Monto**: Cantidad en dinero
   - **Método**: Efectivo, tarjeta, transferencia
   - **Descripción**: Detalles adicionales

### 📈 Categorías de Pagos
- **Ingresos**: Ventas, servicios, otros ingresos
- **Egresos**: Compras, gastos operativos, salarios

### 📊 Reportes de Pagos
- **Por período**: Filtrar por fechas
- **Por tipo**: Ingresos vs egresos
- **Por método**: Efectivo, tarjeta, etc.
- **Balance**: Estado financiero general

---

## 📋 Gestión Contable

### 🏦 Plan de Cuentas
La aplicación incluye un plan de cuentas preconfigurado:

#### 1️⃣ ACTIVOS (1000-1999)
- **1101 - Caja**: Dinero en efectivo
- **1102 - Bancos**: Cuentas bancarias
- **1103 - Inventarios**: Mercancías y suministros
- **1104 - Cuentas por Cobrar**: Dinero que nos deben

#### 2️⃣ PASIVOS (2000-2999)
- **2101 - Cuentas por Pagar**: Dinero que debemos
- **2102 - Proveedores**: Deudas con proveedores

#### 3️⃣ CAPITAL (3000-3999)
- **3101 - Capital Social**: Aportación inicial

#### 4️⃣ INGRESOS (4000-4999)
- **4101 - Ventas**: Ingresos por ventas
- **4102 - Servicios**: Ingresos por servicios

#### 5️⃣ EGRESOS (5000-5999)
- **5101 - Compras**: Compra de mercancías
- **5102 - Gastos Operativos**: Gastos de operación
- **5103 - Salarios**: Pagos de nómina

### ➕ Crear Nueva Cuenta
1. Ir a **"Cuentas"**
2. Hacer clic en **"Agregar Cuenta"**
3. Completar:
   - **Código**: Número único de cuenta
   - **Nombre**: Descripción de la cuenta
   - **Tipo**: Activo, Pasivo, Capital, Ingreso, Egreso
   - **Saldo Inicial**: Monto inicial (opcional)

### 📊 Reportes Contables
- **Balance General**: Estado de activos, pasivos y capital
- **Estado de Resultados**: Ingresos vs egresos
- **Movimientos por Cuenta**: Historial detallado

---

## 🛒 Punto de Venta (Caja)

### 🔓 Abrir Sesión de Caja
1. Ir a **"Caja"**
2. Hacer clic en **"Abrir Sesión"**
3. Especificar:
   - **Monto inicial**: Dinero en caja al inicio
   - **Notas**: Observaciones de apertura

### 💳 Procesar Ventas
1. Con sesión abierta, registrar ventas
2. Agregar productos al carrito
3. Especificar:
   - **Cliente**: Información del comprador (opcional)
   - **Método de pago**: Efectivo, tarjeta, transferencia
   - **Descuentos**: Si aplican
   - **Impuestos**: Si corresponden

### 🔒 Cerrar Sesión de Caja
1. Hacer clic en **"Cerrar Sesión"**
2. Especificar:
   - **Monto final**: Dinero en caja al cierre
   - **Notas**: Observaciones del día

### 📈 Reportes de Caja
- **Ventas del día**: Resumen diario
- **Por método de pago**: Desglose de pagos
- **Histórico**: Ventas por período

---

## 👥 Gestión de Usuarios (Solo Admin)

### ➕ Crear Usuario
1. Ir a **"Usuarios"**
2. Hacer clic en **"Agregar Usuario"**
3. Completar:
   - **Datos de acceso**: Username, email, contraseña
   - **Información personal**: Nombre, apellido, teléfono
   - **Rol**: Administrador o Empleado

### 🔧 Gestionar Usuarios
- **Editar**: Modificar información
- **Cambiar contraseña**: Actualizar credenciales
- **Activar/Desactivar**: Controlar acceso
- **Eliminar**: Remover usuarios (con precaución)

---

## 🎨 Características de la Interfaz

### 🌙 Tema Oscuro
- **Diseño moderno**: Colores oscuros elegantes
- **Mejor legibilidad**: Alto contraste
- **Menos fatiga visual**: Ideal para uso prolongado
- **Efectos visuales**: Gradientes y sombras sutiles

### 📱 Responsive Design
- **Adaptable**: Funciona en desktop, tablet y móvil
- **Navegación intuitiva**: Menú lateral colapsible
- **Modales elegantes**: Formularios flotantes
- **Animaciones suaves**: Transiciones fluidas

---

## 🔧 Funciones Avanzadas

### 🔍 Búsqueda y Filtros
- **Búsqueda global**: En todas las secciones
- **Filtros por fecha**: Reportes personalizados
- **Filtros por categoría**: Organización eficiente
- **Ordenamiento**: Por diferentes criterios

### 📊 Reportes y Analytics
- **Dashboards interactivos**: Métricas en tiempo real
- **Exportación**: Datos en diferentes formatos
- **Gráficos**: Visualización de tendencias
- **Alertas**: Notificaciones automáticas

### 🔐 Seguridad
- **Autenticación JWT**: Tokens seguros
- **Roles y permisos**: Control de acceso
- **Validación de datos**: Entrada segura
- **Logs de actividad**: Registro de acciones

---

## 🆘 Solución de Problemas

### ❌ Problemas Comunes

#### "NetworkError when attempting to fetch resource"
**Solución**:
1. Verificar que el backend esté funcionando: `http://localhost:3001`
2. Reiniciar el servidor backend: `cd backend && npm start`
3. Verificar configuración CORS en `backend/app.js`

#### "Error de conexión"
**Solución**:
1. Verificar que ambos servidores estén activos
2. Comprobar puertos: Frontend (8000), Backend (3001)
3. Revisar firewall y antivirus

#### "Usuario o contraseña incorrectos"
**Solución**:
1. Usar credenciales por defecto: `admin / admin123`
2. Verificar que no haya espacios extra
3. Revisar que Caps Lock esté desactivado

### 🔄 Reiniciar Sistema
```bash
# Detener procesos
fuser -k 3001/tcp
fuser -k 8000/tcp

# Reiniciar backend
cd backend && npm start

# Reiniciar frontend (nueva terminal)
cd frontend && python3 -m http.server 8000
```

---

## 📞 Soporte Técnico

### 🐛 Reportar Problemas
- **Logs del navegador**: Abrir DevTools (F12) → Console
- **Logs del servidor**: Revisar terminal del backend
- **Información del sistema**: Navegador, OS, versión Node.js

### 💡 Mejoras y Sugerencias
- **Funcionalidades nuevas**: Proponer características
- **Mejoras de UI/UX**: Sugerir cambios de interfaz
- **Optimizaciones**: Reportar lentitud o problemas

---

## 🚀 Próximas Funcionalidades

### 🔮 En Desarrollo
- **Integración de pagos**: Stripe, PayPal
- **Reportes avanzados**: Más gráficos y métricas
- **Notificaciones**: Alertas en tiempo real
- **API externa**: Integración con otros sistemas
- **Backup automático**: Respaldo de datos
- **Multi-empresa**: Gestión de múltiples negocios

---

## 📝 Notas Importantes

### ⚠️ Recomendaciones
- **Backup regular**: Respaldar base de datos periódicamente
- **Contraseñas seguras**: Cambiar credenciales por defecto
- **Actualizaciones**: Mantener sistema actualizado
- **Capacitación**: Entrenar a usuarios en el sistema

### 🔒 Seguridad
- **No compartir credenciales**: Cada usuario debe tener su cuenta
- **Cerrar sesión**: Al terminar de usar el sistema
- **Red segura**: Usar conexiones confiables
- **Permisos**: Asignar solo los necesarios por rol

---

## 📚 Glosario

- **API**: Interfaz de programación de aplicaciones
- **Backend**: Servidor que procesa la lógica del negocio
- **Frontend**: Interfaz de usuario que ves en el navegador
- **JWT**: Token de autenticación seguro
- **CORS**: Política de intercambio de recursos entre dominios
- **Stock**: Inventario o existencias
- **Dashboard**: Panel de control principal
- **Modal**: Ventana emergente para formularios

---

**¡Gracias por usar nuestro Sistema de Gestión de Negocios! 🎉**

*Para más información o soporte, consulta la documentación técnica o contacta al administrador del sistema.*
