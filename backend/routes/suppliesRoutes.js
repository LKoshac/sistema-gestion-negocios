const express = require('express');
const router = express.Router();
const suppliesController = require('../controllers/suppliesController');
const { authenticateToken, requireAdmin } = require('../middlewares/authMiddleware');

// Todas las rutas requieren autenticación
router.use(authenticateToken);

// Rutas de consulta (empleados y admin)
router.get('/', suppliesController.getAllSupplies);
router.get('/search', suppliesController.searchSupplies);
router.get('/categories', suppliesController.getCategories);
router.get('/low-stock', suppliesController.getLowStockSupplies);
router.get('/category/:categoria', suppliesController.getSuppliesByCategory);
router.get('/:id', suppliesController.getSupplyById);
router.get('/:id/stock', suppliesController.getSupplyStock);
router.get('/:id/movements', suppliesController.getStockMovements);

// Rutas de modificación (solo admin)
router.post('/', requireAdmin, suppliesController.createSupply);
router.put('/:id', requireAdmin, suppliesController.updateSupply);
router.delete('/:id', requireAdmin, suppliesController.deleteSupply);

// Rutas de stock (empleados pueden actualizar stock, solo admin puede eliminar)
router.put('/:id/stock', suppliesController.updateSupplyStock);
router.post('/:id/movements', suppliesController.addStockMovement);

module.exports = router;
