const express = require('express');
const router = express.Router();
const accountsController = require('../controllers/accountsController');
const { authenticateToken, requireAdmin } = require('../middlewares/authMiddleware');

// Todas las rutas requieren autenticación
router.use(authenticateToken);

// Rutas de consulta (empleados y admin)
router.get('/', accountsController.getAllAccounts);
router.get('/balance-sheet', accountsController.getBalanceSheet);
router.get('/income-statement', accountsController.getIncomeStatement);
router.get('/report', accountsController.getAccountsReport);
router.get('/type/:tipo', accountsController.getAccountsByType);
router.get('/:id', accountsController.getAccountById);
router.get('/:id/movements', accountsController.getAccountMovements);

// Rutas de modificación (solo admin puede crear/modificar cuentas)
router.post('/', requireAdmin, accountsController.createAccount);
router.put('/:id', requireAdmin, accountsController.updateAccount);
router.delete('/:id', requireAdmin, accountsController.deleteAccount);

// Rutas de movimientos contables (empleados pueden registrar movimientos básicos)
router.post('/:id/movements', accountsController.addMovement);

module.exports = router;
