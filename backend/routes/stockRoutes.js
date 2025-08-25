const express = require('express');
const router = express.Router();
const stockController = require('../controllers/stockController');
const { authenticateToken, requireAdmin } = require('../middlewares/authMiddleware');

// Todas las rutas requieren autenticación
router.use(authenticateToken);

// Rutas de consulta (empleados y admin)
router.get('/', stockController.getAllStock);
router.get('/low-stock', stockController.getLowStock);
router.get('/movements', stockController.getAllMovements);
router.get('/report', stockController.getStockReport);
router.get('/:suministroId', stockController.getStockBySupply);
router.get('/:suministroId/movements', stockController.getMovements);

// Rutas de modificación (empleados pueden hacer movimientos básicos)
router.put('/:suministroId', stockController.updateStock);
router.post('/:suministroId/movements', stockController.addMovement);
router.post('/:suministroId/reserve', stockController.reserveStock);
router.post('/:suministroId/release', stockController.releaseStock);

// Rutas de ajuste (solo admin)
router.post('/:suministroId/adjust', requireAdmin, stockController.adjustStock);

module.exports = router;
