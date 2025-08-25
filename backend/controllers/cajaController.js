const cajaModel = require('../models/caja');
const stockModel = require('../models/stock');

// Gestión de cajas
exports.getAllCajas = (req, res, next) => {
    try {
        cajaModel.getAllCajas((err, cajas) => {
            if (err) return next(err);
            res.json(cajas);
        });
    } catch (error) {
        next(error);
    }
};

exports.getCajaById = (req, res, next) => {
    try {
        const { id } = req.params;
        
        cajaModel.getCajaById(id, (err, caja) => {
            if (err) return next(err);
            
            if (!caja) {
                return res.status(404).json({
                    error: 'Caja no encontrada',
                    message: 'La caja solicitada no existe'
                });
            }
            
            res.json(caja);
        });
    } catch (error) {
        next(error);
    }
};

exports.createCaja = (req, res, next) => {
    try {
        const { nombre, descripcion, ubicacion } = req.body;

        if (!nombre) {
            return res.status(400).json({
                error: 'Datos incompletos',
                message: 'El nombre de la caja es requerido'
            });
        }

        const cajaData = { nombre, descripcion, ubicacion };

        cajaModel.createCaja(cajaData, (err, cajaId) => {
            if (err) return next(err);
            
            res.status(201).json({
                message: 'Caja creada exitosamente',
                cajaId
            });
        });
    } catch (error) {
        next(error);
    }
};

// Gestión de sesiones de caja
exports.openSession = (req, res, next) => {
    try {
        const { caja_id, monto_inicial, notas_apertura } = req.body;

        if (!caja_id) {
            return res.status(400).json({
                error: 'Datos incompletos',
                message: 'El ID de la caja es requerido'
            });
        }

        if (monto_inicial < 0) {
            return res.status(400).json({
                error: 'Monto inválido',
                message: 'El monto inicial no puede ser negativo'
            });
        }

        const sessionData = {
            caja_id,
            usuario_id: req.user ? req.user.id : null,
            monto_inicial: monto_inicial || 0,
            notas_apertura
        };

        cajaModel.openSession(sessionData, (err, sessionId) => {
            if (err) {
                if (err.message.includes('sesión abierta')) {
                    return res.status(409).json({
                        error: 'Sesión existente',
                        message: err.message
                    });
                }
                return next(err);
            }
            
            res.status(201).json({
                message: 'Sesión de caja abierta exitosamente',
                sessionId
            });
        });
    } catch (error) {
        next(error);
    }
};

exports.closeSession = (req, res, next) => {
    try {
        const { sessionId } = req.params;
        const { monto_final, notas_cierre } = req.body;

        if (monto_final === undefined || monto_final < 0) {
            return res.status(400).json({
                error: 'Monto inválido',
                message: 'El monto final debe ser mayor o igual a cero'
            });
        }

        const sessionData = { monto_final, notas_cierre };

        cajaModel.closeSession(sessionId, sessionData, (err) => {
            if (err) return next(err);
            
            res.json({
                message: 'Sesión de caja cerrada exitosamente'
            });
        });
    } catch (error) {
        next(error);
    }
};

exports.getActiveSession = (req, res, next) => {
    try {
        const { cajaId } = req.params;
        
        cajaModel.getActiveSession(cajaId, (err, session) => {
            if (err) return next(err);
            
            if (!session) {
                return res.status(404).json({
                    error: 'Sesión no encontrada',
                    message: 'No hay una sesión activa para esta caja'
                });
            }
            
            res.json(session);
        });
    } catch (error) {
        next(error);
    }
};

// Gestión de ventas
exports.createSale = (req, res, next) => {
    try {
        const { 
            caja_session_id, 
            cliente_nombre, 
            cliente_email, 
            cliente_telefono, 
            items, 
            descuento, 
            impuestos, 
            metodo_pago, 
            notas 
        } = req.body;

        if (!caja_session_id || !items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({
                error: 'Datos incompletos',
                message: 'ID de sesión de caja e items son requeridos'
            });
        }

        if (!metodo_pago) {
            return res.status(400).json({
                error: 'Datos incompletos',
                message: 'El método de pago es requerido'
            });
        }

        // Validar email del cliente si se proporciona
        if (cliente_email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cliente_email)) {
            return res.status(400).json({
                error: 'Email inválido',
                message: 'El formato del email del cliente no es válido'
            });
        }

        // Validar items y calcular totales
        let subtotal = 0;
        const validatedItems = [];

        for (const item of items) {
            if (!item.suministro_id || !item.cantidad || !item.precio_unitario) {
                return res.status(400).json({
                    error: 'Item inválido',
                    message: 'Cada item debe tener suministro_id, cantidad y precio_unitario'
                });
            }

            if (item.cantidad <= 0 || item.precio_unitario <= 0) {
                return res.status(400).json({
                    error: 'Valores inválidos',
                    message: 'La cantidad y precio unitario deben ser mayores a cero'
                });
            }

            const descuentoItem = item.descuento_item || 0;
            const subtotalItem = (item.cantidad * item.precio_unitario) - descuentoItem;
            
            validatedItems.push({
                ...item,
                descuento_item: descuentoItem,
                subtotal_item: subtotalItem
            });

            subtotal += subtotalItem;
        }

        const descuentoTotal = descuento || 0;
        const impuestosTotal = impuestos || 0;
        const total = subtotal - descuentoTotal + impuestosTotal;

        if (total <= 0) {
            return res.status(400).json({
                error: 'Total inválido',
                message: 'El total de la venta debe ser mayor a cero'
            });
        }

        const saleData = {
            caja_session_id,
            cliente_nombre,
            cliente_email,
            cliente_telefono,
            subtotal,
            descuento: descuentoTotal,
            impuestos: impuestosTotal,
            total,
            metodo_pago,
            usuario_id: req.user ? req.user.id : null,
            notas,
            items: validatedItems
        };

        // Verificar stock disponible antes de crear la venta
        let stockChecksPending = validatedItems.length;
        let stockErrors = [];

        validatedItems.forEach(item => {
            stockModel.getBySupplyId(item.suministro_id, (err, stock) => {
                stockChecksPending--;
                
                if (err) {
                    stockErrors.push(`Error verificando stock del item ${item.suministro_id}`);
                } else if (!stock || stock.cantidad_actual < item.cantidad) {
                    stockErrors.push(`Stock insuficiente para el item ${item.suministro_id}`);
                }

                // Cuando todas las verificaciones estén completas
                if (stockChecksPending === 0) {
                    if (stockErrors.length > 0) {
                        return res.status(400).json({
                            error: 'Stock insuficiente',
                            message: 'No hay suficiente stock para algunos items',
                            details: stockErrors
                        });
                    }

                    // Crear la venta
                    cajaModel.createSale(saleData, (err, ventaId) => {
                        if (err) return next(err);
                        
                        // Actualizar stock (reducir cantidades vendidas)
                        validatedItems.forEach(item => {
                            const movementData = {
                                suministro_id: item.suministro_id,
                                tipo_movimiento: 'salida',
                                cantidad: item.cantidad,
                                motivo: `Venta #${ventaId}`,
                                referencia: `VENTA-${ventaId}`,
                                usuario_id: req.user ? req.user.id : null
                            };

                            stockModel.addMovement(movementData, (err) => {
                                if (err) console.error('Error actualizando stock:', err);
                            });
                        });

                        res.status(201).json({
                            message: 'Venta registrada exitosamente',
                            ventaId,
                            total
                        });
                    });
                }
            });
        });
    } catch (error) {
        next(error);
    }
};

exports.getSaleById = (req, res, next) => {
    try {
        const { id } = req.params;
        
        cajaModel.getSaleById(id, (err, sale) => {
            if (err) return next(err);
            
            if (!sale) {
                return res.status(404).json({
                    error: 'Venta no encontrada',
                    message: 'La venta solicitada no existe'
                });
            }

            // Obtener detalles de la venta
            cajaModel.getSaleDetails(id, (err, details) => {
                if (err) return next(err);
                
                res.json({
                    ...sale,
                    items: details
                });
            });
        });
    } catch (error) {
        next(error);
    }
};

exports.getSalesBySession = (req, res, next) => {
    try {
        const { sessionId } = req.params;
        
        cajaModel.getSalesBySession(sessionId, (err, sales) => {
            if (err) return next(err);
            res.json(sales);
        });
    } catch (error) {
        next(error);
    }
};

// Movimientos de caja
exports.addMovement = (req, res, next) => {
    try {
        const { 
            caja_session_id, 
            tipo_movimiento, 
            monto, 
            concepto, 
            referencia, 
            metodo_pago 
        } = req.body;

        if (!caja_session_id || !tipo_movimiento || !monto || !concepto) {
            return res.status(400).json({
                error: 'Datos incompletos',
                message: 'Sesión, tipo de movimiento, monto y concepto son requeridos'
            });
        }

        const validMovements = ['entrada', 'salida', 'venta', 'devolucion'];
        if (!validMovements.includes(tipo_movimiento)) {
            return res.status(400).json({
                error: 'Tipo de movimiento inválido',
                message: 'Los tipos válidos son: entrada, salida, venta, devolucion'
            });
        }

        if (monto <= 0) {
            return res.status(400).json({
                error: 'Monto inválido',
                message: 'El monto debe ser mayor a cero'
            });
        }

        const movementData = {
            caja_session_id,
            tipo_movimiento,
            monto,
            concepto,
            referencia,
            metodo_pago,
            usuario_id: req.user ? req.user.id : null
        };

        cajaModel.addMovement(movementData, (err, movementId) => {
            if (err) return next(err);
            
            res.status(201).json({
                message: 'Movimiento registrado exitosamente',
                movementId
            });
        });
    } catch (error) {
        next(error);
    }
};

exports.getMovementsBySession = (req, res, next) => {
    try {
        const { sessionId } = req.params;
        
        cajaModel.getMovementsBySession(sessionId, (err, movements) => {
            if (err) return next(err);
            res.json(movements);
        });
    } catch (error) {
        next(error);
    }
};

// Reportes
exports.getDailySales = (req, res, next) => {
    try {
        const { fecha } = req.query;
        const fechaConsulta = fecha || new Date().toISOString().split('T')[0];
        
        cajaModel.getDailySales(fechaConsulta, (err, sales) => {
            if (err) return next(err);
            
            // Calcular estadísticas del día
            const totalVentas = sales.length;
            const totalIngresos = sales.reduce((sum, sale) => sum + sale.total, 0);
            const promedioVenta = totalVentas > 0 ? totalIngresos / totalVentas : 0;

            // Agrupar por método de pago
            const porMetodoPago = {};
            sales.forEach(sale => {
                const metodo = sale.metodo_pago || 'no_especificado';
                if (!porMetodoPago[metodo]) {
                    porMetodoPago[metodo] = { cantidad: 0, total: 0 };
                }
                porMetodoPago[metodo].cantidad++;
                porMetodoPago[metodo].total += sale.total;
            });

            res.json({
                fecha: fechaConsulta,
                resumen: {
                    total_ventas: totalVentas,
                    total_ingresos: totalIngresos,
                    promedio_venta: promedioVenta
                },
                por_metodo_pago: porMetodoPago,
                ventas: sales
            });
        });
    } catch (error) {
        next(error);
    }
};

exports.getSalesReport = (req, res, next) => {
    try {
        const { fecha_inicio, fecha_fin } = req.query;

        // Si no se proporcionan fechas, usar el mes actual
        const fechaInicio = fecha_inicio || new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];
        const fechaFin = fecha_fin || new Date().toISOString().split('T')[0];

        cajaModel.getSalesReport(fechaInicio, fechaFin, (err, salesData) => {
            if (err) return next(err);
            
            const totalVentas = salesData.reduce((sum, day) => sum + day.total_ventas, 0);
            const totalIngresos = salesData.reduce((sum, day) => sum + day.total_ingresos, 0);
            const promedioVentasPorDia = salesData.length > 0 ? totalVentas / salesData.length : 0;
            const promedioIngresosPorDia = salesData.length > 0 ? totalIngresos / salesData.length : 0;

            res.json({
                fecha_reporte: new Date().toISOString(),
                periodo: {
                    inicio: fechaInicio,
                    fin: fechaFin
                },
                resumen: {
                    total_ventas: totalVentas,
                    total_ingresos: totalIngresos,
                    promedio_ventas_por_dia: promedioVentasPorDia,
                    promedio_ingresos_por_dia: promedioIngresosPorDia,
                    dias_con_ventas: salesData.length
                },
                ventas_por_dia: salesData
            });
        });
    } catch (error) {
        next(error);
    }
};

exports.getCajaReport = (req, res, next) => {
    try {
        const { cajaId } = req.params;
        const { fecha_inicio, fecha_fin } = req.query;

        // Obtener información de la caja
        cajaModel.getCajaById(cajaId, (err, caja) => {
            if (err) return next(err);
            
            if (!caja) {
                return res.status(404).json({
                    error: 'Caja no encontrada',
                    message: 'La caja solicitada no existe'
                });
            }

            // Si no se proporcionan fechas, usar el día actual
            const fechaInicio = fecha_inicio || new Date().toISOString().split('T')[0];
            const fechaFin = fecha_fin || new Date().toISOString().split('T')[0];

            cajaModel.getDailySales(fechaInicio, (err, sales) => {
                if (err) return next(err);
                
                // Filtrar ventas de esta caja específica
                const cajaSales = sales.filter(sale => sale.caja_id == cajaId);
                
                const report = {
                    fecha_reporte: new Date().toISOString(),
                    caja: caja,
                    periodo: {
                        inicio: fechaInicio,
                        fin: fechaFin
                    },
                    resumen: {
                        total_ventas: cajaSales.length,
                        total_ingresos: cajaSales.reduce((sum, sale) => sum + sale.total, 0)
                    },
                    ventas: cajaSales
                };
                
                res.json(report);
            });
        });
    } catch (error) {
        next(error);
    }
};
