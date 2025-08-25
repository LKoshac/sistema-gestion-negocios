const stockModel = require('../models/stock');

exports.getAllStock = (req, res, next) => {
    try {
        stockModel.getAll((err, stock) => {
            if (err) return next(err);
            res.json(stock);
        });
    } catch (error) {
        next(error);
    }
};

exports.getLowStock = (req, res, next) => {
    try {
        stockModel.getLowStock((err, lowStock) => {
            if (err) return next(err);
            res.json(lowStock);
        });
    } catch (error) {
        next(error);
    }
};

exports.getStockBySupply = (req, res, next) => {
    try {
        const { suministroId } = req.params;
        
        stockModel.getBySupplyId(suministroId, (err, stock) => {
            if (err) return next(err);
            
            if (!stock) {
                return res.status(404).json({
                    error: 'Stock no encontrado',
                    message: 'No se encontró información de stock para este suministro'
                });
            }
            
            res.json(stock);
        });
    } catch (error) {
        next(error);
    }
};

exports.updateStock = (req, res, next) => {
    try {
        const { suministroId } = req.params;
        const { cantidad_actual, ubicacion } = req.body;

        if (cantidad_actual === undefined) {
            return res.status(400).json({
                error: 'Datos incompletos',
                message: 'La cantidad actual es requerida'
            });
        }

        if (cantidad_actual < 0) {
            return res.status(400).json({
                error: 'Cantidad inválida',
                message: 'La cantidad no puede ser negativa'
            });
        }

        const stockData = {
            suministro_id: suministroId,
            cantidad_actual,
            ubicacion
        };

        stockModel.createOrUpdate(stockData, (err) => {
            if (err) return next(err);
            
            res.json({
                message: 'Stock actualizado exitosamente'
            });
        });
    } catch (error) {
        next(error);
    }
};

exports.addMovement = (req, res, next) => {
    try {
        const { suministroId } = req.params;
        const { tipo_movimiento, cantidad, motivo, referencia } = req.body;

        if (!tipo_movimiento || !cantidad) {
            return res.status(400).json({
                error: 'Datos incompletos',
                message: 'Tipo de movimiento y cantidad son requeridos'
            });
        }

        const validMovements = ['entrada', 'salida', 'ajuste', 'reserva', 'liberacion'];
        if (!validMovements.includes(tipo_movimiento)) {
            return res.status(400).json({
                error: 'Tipo de movimiento inválido',
                message: 'Los tipos válidos son: entrada, salida, ajuste, reserva, liberacion'
            });
        }

        if (cantidad <= 0) {
            return res.status(400).json({
                error: 'Cantidad inválida',
                message: 'La cantidad debe ser mayor a cero'
            });
        }

        const movementData = {
            suministro_id: suministroId,
            tipo_movimiento,
            cantidad,
            motivo,
            referencia,
            usuario_id: req.user ? req.user.id : null
        };

        stockModel.addMovement(movementData, (err) => {
            if (err) return next(err);
            
            res.status(201).json({
                message: 'Movimiento de stock registrado exitosamente'
            });
        });
    } catch (error) {
        next(error);
    }
};

exports.getMovements = (req, res, next) => {
    try {
        const { suministroId } = req.params;
        
        stockModel.getMovements(suministroId, (err, movements) => {
            if (err) return next(err);
            res.json(movements);
        });
    } catch (error) {
        next(error);
    }
};

exports.getAllMovements = (req, res, next) => {
    try {
        const { limit = 100 } = req.query;
        
        stockModel.getMovements(null, (err, movements) => {
            if (err) return next(err);
            
            // Limitar resultados si se especifica
            const limitedMovements = limit ? movements.slice(0, parseInt(limit)) : movements;
            res.json(limitedMovements);
        });
    } catch (error) {
        next(error);
    }
};

exports.reserveStock = (req, res, next) => {
    try {
        const { suministroId } = req.params;
        const { cantidad } = req.body;

        if (!cantidad || cantidad <= 0) {
            return res.status(400).json({
                error: 'Cantidad inválida',
                message: 'La cantidad debe ser mayor a cero'
            });
        }

        // Verificar que hay suficiente stock disponible
        stockModel.getBySupplyId(suministroId, (err, stock) => {
            if (err) return next(err);
            
            if (!stock) {
                return res.status(404).json({
                    error: 'Stock no encontrado',
                    message: 'No se encontró información de stock para este suministro'
                });
            }

            const stockDisponible = stock.cantidad_actual - stock.cantidad_reservada;
            if (stockDisponible < cantidad) {
                return res.status(400).json({
                    error: 'Stock insuficiente',
                    message: `Solo hay ${stockDisponible} unidades disponibles`
                });
            }

            stockModel.reserveStock(suministroId, cantidad, (err) => {
                if (err) return next(err);
                
                // Registrar movimiento de reserva
                const movementData = {
                    suministro_id: suministroId,
                    tipo_movimiento: 'reserva',
                    cantidad,
                    motivo: 'Reserva de stock',
                    referencia: `RESERVA-${Date.now()}`,
                    usuario_id: req.user ? req.user.id : null
                };

                stockModel.addMovement(movementData, (err) => {
                    if (err) return next(err);
                    
                    res.json({
                        message: 'Stock reservado exitosamente'
                    });
                });
            });
        });
    } catch (error) {
        next(error);
    }
};

exports.releaseStock = (req, res, next) => {
    try {
        const { suministroId } = req.params;
        const { cantidad } = req.body;

        if (!cantidad || cantidad <= 0) {
            return res.status(400).json({
                error: 'Cantidad inválida',
                message: 'La cantidad debe ser mayor a cero'
            });
        }

        // Verificar que hay suficiente stock reservado
        stockModel.getBySupplyId(suministroId, (err, stock) => {
            if (err) return next(err);
            
            if (!stock) {
                return res.status(404).json({
                    error: 'Stock no encontrado',
                    message: 'No se encontró información de stock para este suministro'
                });
            }

            if (stock.cantidad_reservada < cantidad) {
                return res.status(400).json({
                    error: 'Cantidad inválida',
                    message: `Solo hay ${stock.cantidad_reservada} unidades reservadas`
                });
            }

            stockModel.releaseStock(suministroId, cantidad, (err) => {
                if (err) return next(err);
                
                // Registrar movimiento de liberación
                const movementData = {
                    suministro_id: suministroId,
                    tipo_movimiento: 'liberacion',
                    cantidad,
                    motivo: 'Liberación de stock reservado',
                    referencia: `LIBERACION-${Date.now()}`,
                    usuario_id: req.user ? req.user.id : null
                };

                stockModel.addMovement(movementData, (err) => {
                    if (err) return next(err);
                    
                    res.json({
                        message: 'Stock liberado exitosamente'
                    });
                });
            });
        });
    } catch (error) {
        next(error);
    }
};

exports.adjustStock = (req, res, next) => {
    try {
        const { suministroId } = req.params;
        const { nueva_cantidad, motivo } = req.body;

        if (nueva_cantidad === undefined || nueva_cantidad < 0) {
            return res.status(400).json({
                error: 'Cantidad inválida',
                message: 'La nueva cantidad debe ser mayor o igual a cero'
            });
        }

        const movementData = {
            suministro_id: suministroId,
            tipo_movimiento: 'ajuste',
            cantidad: nueva_cantidad,
            motivo: motivo || 'Ajuste de inventario',
            referencia: `AJUSTE-${Date.now()}`,
            usuario_id: req.user ? req.user.id : null
        };

        stockModel.addMovement(movementData, (err) => {
            if (err) return next(err);
            
            res.json({
                message: 'Ajuste de stock realizado exitosamente'
            });
        });
    } catch (error) {
        next(error);
    }
};

exports.getStockReport = (req, res, next) => {
    try {
        const { fecha_inicio, fecha_fin } = req.query;

        // Si no se proporcionan fechas, usar el mes actual
        const fechaInicio = fecha_inicio || new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];
        const fechaFin = fecha_fin || new Date().toISOString().split('T')[0];

        stockModel.getAll((err, allStock) => {
            if (err) return next(err);
            
            stockModel.getLowStock((err, lowStock) => {
                if (err) return next(err);
                
                const report = {
                    fecha_reporte: new Date().toISOString(),
                    periodo: {
                        inicio: fechaInicio,
                        fin: fechaFin
                    },
                    resumen: {
                        total_suministros: allStock.length,
                        suministros_bajo_stock: lowStock.length,
                        valor_total_inventario: allStock.reduce((total, item) => {
                            return total + (item.cantidad_actual * (item.precio_compra || 0));
                        }, 0)
                    },
                    stock_actual: allStock,
                    alertas_stock_bajo: lowStock
                };
                
                res.json(report);
            });
        });
    } catch (error) {
        next(error);
    }
};
