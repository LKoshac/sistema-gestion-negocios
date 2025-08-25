function errorHandler(err, req, res, next) {
    console.error('Error capturado:', err.stack);

    // Error de validación
    if (err.name === 'ValidationError') {
        return res.status(400).json({
            error: 'Error de validación',
            message: err.message,
            details: err.errors
        });
    }

    // Error de JWT
    if (err.name === 'JsonWebTokenError') {
        return res.status(401).json({
            error: 'Token inválido',
            message: 'El token proporcionado no es válido'
        });
    }

    // Error de JWT expirado
    if (err.name === 'TokenExpiredError') {
        return res.status(401).json({
            error: 'Token expirado',
            message: 'El token ha expirado, por favor inicia sesión nuevamente'
        });
    }

    // Error de base de datos SQLite
    if (err.code && err.code.startsWith('SQLITE_')) {
        return res.status(500).json({
            error: 'Error de base de datos',
            message: 'Error interno de la base de datos'
        });
    }

    // Error personalizado con status
    if (err.status) {
        return res.status(err.status).json({
            error: err.message || 'Error del servidor',
            message: err.details || 'Ha ocurrido un error'
        });
    }

    // Error genérico del servidor
    res.status(500).json({
        error: 'Error interno del servidor',
        message: 'Ha ocurrido un error inesperado'
    });
}

module.exports = errorHandler;
