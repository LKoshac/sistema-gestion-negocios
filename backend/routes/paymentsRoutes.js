const express = require('express');
const router = express.Router();
const paymentsController = require('../controllers/paymentsController');
const { authenticateToken, requireAdmin } = require('../middlewares/authMiddleware');

// Todas las rutas requieren autenticación
router.use(authenticateToken);

// Rutas de consulta (empleados y admin)
router.get('/', paymentsController.getAllPayments);
router.get('/categories', paymentsController.getPaymentCategories);
router.get('/report', paymentsController.getPaymentsReport);
router.get('/type/:tipo', paymentsController.getPaymentsByType);
router.get('/:id', paymentsController.getPaymentById);

// Rutas de modificación (empleados pueden crear pagos básicos)
router.post('/', paymentsController.createPayment);

// Rutas de administración (solo admin)
router.put('/:id', requireAdmin, paymentsController.updatePayment);
router.delete('/:id', requireAdmin, paymentsController.deletePayment);

// TODO: Rutas para futuras integraciones de pago externo
// router.post('/external', paymentsController.processExternalPayment);
// router.post('/webhook/:provider', paymentsController.handlePaymentWebhook);

module.exports = router;
