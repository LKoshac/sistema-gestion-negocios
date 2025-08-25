const jwt = require('jsonwebtoken');
const config = require('../config/config');

function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
        return res.status(401).json({ 
            error: 'Token de acceso requerido',
            message: 'No se proporcionó token de autenticación' 
        });
    }

    jwt.verify(token, config.jwtSecret, (err, user) => {
        if (err) {
            return res.status(403).json({ 
                error: 'Token inválido',
                message: 'El token proporcionado no es válido o ha expirado' 
            });
        }
        req.user = user;
        next();
    });
}

function requireAdmin(req, res, next) {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({ 
            error: 'Acceso denegado',
            message: 'Se requieren permisos de administrador' 
        });
    }
}

module.exports = {
    authenticateToken,
    requireAdmin
};
