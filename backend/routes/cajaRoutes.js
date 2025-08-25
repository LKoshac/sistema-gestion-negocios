const express = require('express');
const router = express.Router();
const cajaController = require('../controllers/cajaController');
const { authenticateToken, requireAdmin } = require('../middlewares/authMiddleware');

// Todas las rutas requieren autenticación
router.use(authenticateToken);

// Rutas de gestión de cajas (consulta para empleados, modificación solo admin)
router.get('/cajas', cajaController.getAllCajas);
router.get('/cajas/:id', cajaController.getCajaById);
router.post('/cajas', requireAdmin, cajaController.createCaja);

// Rutas de sesiones de caja (empleados pueden abrir/cerrar sesiones)
router.post('/sessions/open', cajaController.openSession);
router.put('/sessions/:sessionId/close', cajaController.closeSession);
router.get('/cajas/:cajaId/active-session', cajaController.getActiveSession);

// Rutas de ventas (empleados pueden crear ventas)
router.post('/sales', cajaController.createSale);
router.get('/sales/:id', cajaController.getSaleById);
router.get('/sessions/:sessionId/sales', cajaController.getSalesBySession);

// Rutas de movimientos de caja (empleados pueden registrar movimientos básicos)
router.post('/movements', cajaController.addMovement);
router.get('/sessions/:sessionId/movements', cajaController.getMovementsBySession);

// Rutas de reportes (empleados pueden ver reportes básicos, admin todos)
router.get('/sales/daily', cajaController.getDailySales);
router.get('/sales/report', cajaController.getSalesReport);
router.get('/cajas/:cajaId/report', requireAdmin, cajaController.getCajaReport);

module.exports = router;
