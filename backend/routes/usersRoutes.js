const express = require('express');
const router = express.Router();
const usersController = require('../controllers/usersController');
const { authenticateToken, requireAdmin } = require('../middlewares/authMiddleware');

// Rutas públicas (sin autenticación)
router.post('/login', usersController.login);

// Rutas protegidas (requieren autenticación)
router.get('/profile', authenticateToken, usersController.getProfile);
router.put('/profile', authenticateToken, usersController.updateProfile);

// Rutas de administrador (requieren autenticación y rol admin)
router.post('/register', authenticateToken, requireAdmin, usersController.register);
router.get('/', authenticateToken, requireAdmin, usersController.getAllUsers);
router.get('/:id', authenticateToken, requireAdmin, usersController.getUserById);
router.put('/:id', authenticateToken, requireAdmin, usersController.updateUser);
router.put('/:id/password', authenticateToken, requireAdmin, usersController.updatePassword);
router.delete('/:id', authenticateToken, requireAdmin, usersController.deleteUser);

module.exports = router;
