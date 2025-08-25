const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const port = process.env.PORT || 3001;

// Middlewares globales
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cors({
    origin: ['http://localhost:3000', 'http://localhost:8000', 'http://127.0.0.1:8000'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Middleware de logging
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

// Importar modelos (esto creará las tablas)
require('./models/user');
require('./models/supply');
require('./models/stock');
require('./models/supplier');
require('./models/payment');
require('./models/account');
require('./models/caja');
require('./models/emailConfig');

// Importar rutas
const suppliesRoutes = require('./routes/suppliesRoutes');
const paymentsRoutes = require('./routes/paymentsRoutes');
const accountsRoutes = require('./routes/accountsRoutes');
const suppliersRoutes = require('./routes/suppliersRoutes');
const stockRoutes = require('./routes/stockRoutes');
const cajaRoutes = require('./routes/cajaRoutes');
const usersRoutes = require('./routes/usersRoutes');
const emailRoutes = require('./routes/emailRoutes');

// Configurar rutas de la API
app.use('/api/suministros', suppliesRoutes);
app.use('/api/pagos', paymentsRoutes);
app.use('/api/cuentas', accountsRoutes);
app.use('/api/proveedores', suppliersRoutes);
app.use('/api/stock', stockRoutes);
app.use('/api/caja', cajaRoutes);
app.use('/api/usuarios', usersRoutes);
app.use('/api/email', emailRoutes);

// Ruta de prueba
app.get('/', (req, res) => {
    res.json({
        message: 'API de Gestión de Negocios',
        version: '1.0.0',
        endpoints: {
            usuarios: '/api/usuarios',
            suministros: '/api/suministros',
            stock: '/api/stock',
            proveedores: '/api/proveedores',
            pagos: '/api/pagos',
            cuentas: '/api/cuentas',
            caja: '/api/caja'
        },
        status: 'Funcionando correctamente'
    });
});

// Ruta para verificar el estado de la API
app.get('/api/health', (req, res) => {
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || 'development'
    });
});

// Manejo de rutas no encontradas
app.use('*', (req, res) => {
    res.status(404).json({
        error: 'Ruta no encontrada',
        message: `La ruta ${req.originalUrl} no existe`,
        availableEndpoints: [
            '/api/usuarios',
            '/api/suministros',
            '/api/stock',
            '/api/proveedores',
            '/api/pagos',
            '/api/cuentas',
            '/api/caja'
        ]
    });
});

// Manejo centralizado de errores
const errorMiddleware = require('./middlewares/errorMiddleware');
app.use(errorMiddleware);

// Iniciar servidor
app.listen(port, () => {
    console.log('='.repeat(50));
    console.log('🚀 SERVIDOR DE GESTIÓN DE NEGOCIOS INICIADO');
    console.log('='.repeat(50));
    console.log(`📍 Puerto: ${port}`);
    console.log(`🌐 URL: http://localhost:${port}`);
    console.log(`📊 API Health: http://localhost:${port}/api/health`);
    console.log('='.repeat(50));
    console.log('📋 Endpoints disponibles:');
    console.log('   • Usuarios:    /api/usuarios');
    console.log('   • Suministros: /api/suministros');
    console.log('   • Stock:       /api/stock');
    console.log('   • Proveedores: /api/proveedores');
    console.log('   • Pagos:       /api/pagos');
    console.log('   • Cuentas:     /api/cuentas');
    console.log('   • Caja:        /api/caja');
    console.log('='.repeat(50));
    console.log('👤 Usuario admin por defecto:');
    console.log('   • Username: admin');
    console.log('   • Password: admin123');
    console.log('='.repeat(50));
});

// Manejo de errores no capturados
process.on('uncaughtException', (error) => {
    console.error('Error no capturado:', error);
    process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Promesa rechazada no manejada:', reason);
    process.exit(1);
});

module.exports = app;
