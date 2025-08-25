const express = require('express');
const router = express.Router();
const suppliersController = require('../controllers/suppliersController');
const { authenticateToken, requireAdmin } = require('../middlewares/authMiddleware');

// Todas las rutas requieren autenticación
router.use(authenticateToken);

// Rutas de consulta (empleados y admin)
router.get('/', suppliersController.getAllSuppliers);
router.get('/search', suppliersController.searchSuppliers);
router.get('/report', suppliersController.getAllSuppliersReport);
router.get('/:id', suppliersController.getSupplierById);
router.get('/:id/supplies', suppliersController.getSupplierSupplies);
router.get('/:id/report', suppliersController.getSupplierReport);
router.get('/supply/:suministroId/best-price', suppliersController.getBestPriceForSupply);

// Rutas de modificación (solo admin)
router.post('/', requireAdmin, suppliersController.createSupplier);
router.put('/:id', requireAdmin, suppliersController.updateSupplier);
router.delete('/:id', requireAdmin, suppliersController.deleteSupplier);

// Rutas de gestión de suministros del proveedor (solo admin)
router.post('/:id/supplies', requireAdmin, suppliersController.addSupplyToSupplier);
router.delete('/:id/supplies/:suministroId', requireAdmin, suppliersController.removeSupplyFromSupplier);

module.exports = router;
