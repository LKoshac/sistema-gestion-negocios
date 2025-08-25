const express = require('express');
const router = express.Router();
const EmailController = require('../controllers/emailController');
const { authenticateToken, requireAdmin } = require('../middlewares/authMiddleware');

// Todas las rutas requieren autenticación
router.use(authenticateToken);

// Configurar email mensual (solo admin)
router.post('/config', requireAdmin, EmailController.configureMonthlyEmail);

// Obtener configuración de email
router.get('/config', EmailController.getEmailConfig);

// Enviar email de prueba
router.post('/test', EmailController.sendTestEmail);

// Generar reporte mensual manual
router.get('/monthly-report', async (req, res) => {
    try {
        const reportData = await EmailController.generateMonthlyReport();
        res.json({
            message: 'Reporte mensual generado exitosamente',
            data: reportData
        });
    } catch (error) {
        console.error('Error generando reporte:', error);
        res.status(500).json({ error: 'Error generando reporte mensual' });
    }
});

module.exports = router;
