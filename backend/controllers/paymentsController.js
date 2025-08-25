const paymentModel = require('../models/payment');

exports.getAllPayments = (req, res, next) => {
    try {
        const { tipo, fecha_inicio, fecha_fin } = req.query;

        if (fecha_inicio && fecha_fin) {
            paymentModel.getByDateRange(fecha_inicio, fecha_fin, (err, payments) => {
                if (err) return next(err);
                
                // Filtrar por tipo si se especifica
                const filteredPayments = tipo 
                    ? payments.filter(p => p.tipo_pago === tipo)
                    : payments;
                
                res.json(filteredPayments);
            });
        } else if (tipo) {
            paymentModel.getByType(tipo, (err, payments) => {
                if (err) return next(err);
                res.json(payments);
            });
        } else {
            paymentModel.getAll((err, payments) => {
                if (err) return next(err);
                res.json(payments);
            });
        }
    } catch (error) {
        next(error);
    }
};

exports.getPaymentById = (req, res, next) => {
    try {
        const { id } = req.params;
        
        paymentModel.getById(id, (err, payment) => {
            if (err) return next(err);
            
            if (!payment) {
                return res.status(404).json({
                    error: 'Pago no encontrado',
                    message: 'El pago solicitado no existe'
                });
            }
            
            res.json(payment);
        });
    } catch (error) {
        next(error);
    }
};

exports.createPayment = (req, res, next) => {
    try {
        const { 
            tipo_pago, 
            concepto, 
            descripcion, 
            monto, 
            metodo_pago, 
            referencia, 
            proveedor_id, 
            cliente_nombre, 
            cliente_email, 
            estado,
            fecha_vencimiento,
            notas
        } = req.body;

        if (!tipo_pago || !concepto || !monto) {
            return res.status(400).json({
                error: 'Datos incompletos',
                message: 'Tipo de pago, concepto y monto son requeridos'
            });
        }

        const validTypes = ['ingreso', 'egreso'];
        if (!validTypes.includes(tipo_pago)) {
            return res.status(400).json({
                error: 'Tipo de pago inválido',
                message: 'Los tipos válidos son: ingreso, egreso'
            });
        }

        if (monto <= 0) {
            return res.status(400).json({
                error: 'Monto inválido',
                message: 'El monto debe ser mayor a cero'
            });
        }

        // Validar email del cliente si se proporciona
        if (cliente_email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cliente_email)) {
            return res.status(400).json({
                error: 'Email inválido',
                message: 'El formato del email del cliente no es válido'
            });
        }

        const paymentData = {
            tipo_pago,
            concepto,
            descripcion,
            monto,
            metodo_pago,
            referencia,
            proveedor_id,
            cliente_nombre,
            cliente_email,
            estado: estado || 'completado',
            fecha_vencimiento,
            usuario_id: req.user ? req.user.id : null,
            notas
        };

        // TODO: Aquí se integrarían los servicios de pago externos
        // if (metodo_pago === 'tarjeta' && external_payment_required) {
        //     return processExternalPayment(paymentData, res, next);
        // }

        paymentModel.create(paymentData, (err, paymentId) => {
            if (err) return next(err);
            
            res.status(201).json({
                message: 'Pago registrado exitosamente',
                paymentId,
                // TODO: Incluir información de procesamiento externo si aplica
                // external_reference: externalPaymentId
            });
        });
    } catch (error) {
        next(error);
    }
};

exports.updatePayment = (req, res, next) => {
    try {
        const { id } = req.params;
        const { 
            tipo_pago, 
            concepto, 
            descripcion, 
            monto, 
            metodo_pago, 
            referencia, 
            proveedor_id, 
            cliente_nombre, 
            cliente_email, 
            estado,
            fecha_vencimiento,
            notas
        } = req.body;

        if (!tipo_pago || !concepto || !monto) {
            return res.status(400).json({
                error: 'Datos incompletos',
                message: 'Tipo de pago, concepto y monto son requeridos'
            });
        }

        const validTypes = ['ingreso', 'egreso'];
        if (!validTypes.includes(tipo_pago)) {
            return res.status(400).json({
                error: 'Tipo de pago inválido',
                message: 'Los tipos válidos son: ingreso, egreso'
            });
        }

        if (monto <= 0) {
            return res.status(400).json({
                error: 'Monto inválido',
                message: 'El monto debe ser mayor a cero'
            });
        }

        // Validar email del cliente si se proporciona
        if (cliente_email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cliente_email)) {
            return res.status(400).json({
                error: 'Email inválido',
                message: 'El formato del email del cliente no es válido'
            });
        }

        const paymentData = {
            tipo_pago,
            concepto,
            descripcion,
            monto,
            metodo_pago,
            referencia,
            proveedor_id,
            cliente_nombre,
            cliente_email,
            estado,
            fecha_vencimiento,
            notas
        };

        paymentModel.update(id, paymentData, (err) => {
            if (err) return next(err);
            
            res.json({
                message: 'Pago actualizado exitosamente'
            });
        });
    } catch (error) {
        next(error);
    }
};

exports.deletePayment = (req, res, next) => {
    try {
        const { id } = req.params;

        paymentModel.delete(id, (err) => {
            if (err) return next(err);
            
            res.json({
                message: 'Pago eliminado exitosamente'
            });
        });
    } catch (error) {
        next(error);
    }
};

exports.getPaymentCategories = (req, res, next) => {
    try {
        paymentModel.getCategories((err, categories) => {
            if (err) return next(err);
            res.json(categories);
        });
    } catch (error) {
        next(error);
    }
};

exports.getPaymentsByType = (req, res, next) => {
    try {
        const { tipo } = req.params;

        const validTypes = ['ingreso', 'egreso'];
        if (!validTypes.includes(tipo)) {
            return res.status(400).json({
                error: 'Tipo inválido',
                message: 'Los tipos válidos son: ingreso, egreso'
            });
        }

        paymentModel.getByType(tipo, (err, payments) => {
            if (err) return next(err);
            res.json(payments);
        });
    } catch (error) {
        next(error);
    }
};

exports.getPaymentsReport = (req, res, next) => {
    try {
        const { fecha_inicio, fecha_fin, tipo } = req.query;

        // Si no se proporcionan fechas, usar el mes actual
        const fechaInicio = fecha_inicio || new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];
        const fechaFin = fecha_fin || new Date().toISOString().split('T')[0];

        paymentModel.getByDateRange(fechaInicio, fechaFin, (err, payments) => {
            if (err) return next(err);
            
            // Filtrar por tipo si se especifica
            const filteredPayments = tipo 
                ? payments.filter(p => p.tipo_pago === tipo)
                : payments;

            // Calcular estadísticas
            const ingresos = filteredPayments.filter(p => p.tipo_pago === 'ingreso');
            const egresos = filteredPayments.filter(p => p.tipo_pago === 'egreso');
            
            const totalIngresos = ingresos.reduce((sum, p) => sum + p.monto, 0);
            const totalEgresos = egresos.reduce((sum, p) => sum + p.monto, 0);
            const balance = totalIngresos - totalEgresos;

            // Agrupar por método de pago
            const porMetodo = {};
            filteredPayments.forEach(payment => {
                const metodo = payment.metodo_pago || 'no_especificado';
                if (!porMetodo[metodo]) {
                    porMetodo[metodo] = { cantidad: 0, total: 0 };
                }
                porMetodo[metodo].cantidad++;
                porMetodo[metodo].total += payment.monto;
            });

            // Agrupar por concepto
            const porConcepto = {};
            filteredPayments.forEach(payment => {
                const concepto = payment.concepto || 'no_especificado';
                if (!porConcepto[concepto]) {
                    porConcepto[concepto] = { cantidad: 0, total: 0 };
                }
                porConcepto[concepto].cantidad++;
                porConcepto[concepto].total += payment.monto;
            });

            const report = {
                fecha_reporte: new Date().toISOString(),
                periodo: {
                    inicio: fechaInicio,
                    fin: fechaFin
                },
                resumen: {
                    total_pagos: filteredPayments.length,
                    total_ingresos: totalIngresos,
                    total_egresos: totalEgresos,
                    balance: balance,
                    cantidad_ingresos: ingresos.length,
                    cantidad_egresos: egresos.length
                },
                por_metodo_pago: porMetodo,
                por_concepto: porConcepto,
                pagos: filteredPayments
            };

            res.json(report);
        });
    } catch (error) {
        next(error);
    }
};

// TODO: Métodos para futuras integraciones de pago externo
/*
exports.processExternalPayment = (req, res, next) => {
    try {
        const { provider, payment_data } = req.body;
        
        // Integración con Stripe
        if (provider === 'stripe') {
            // const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
            // ... lógica de Stripe
        }
        
        // Integración con PayPal
        if (provider === 'paypal') {
            // const paypal = require('@paypal/checkout-server-sdk');
            // ... lógica de PayPal
        }
        
        res.json({
            message: 'Pago procesado externamente',
            external_id: 'external_payment_id'
        });
    } catch (error) {
        next(error);
    }
};

exports.handlePaymentWebhook = (req, res, next) => {
    try {
        const { provider, event_type, payment_data } = req.body;
        
        // Manejar webhooks de diferentes proveedores
        switch (provider) {
            case 'stripe':
                // Manejar eventos de Stripe
                break;
            case 'paypal':
                // Manejar eventos de PayPal
                break;
            default:
                return res.status(400).json({ error: 'Proveedor no soportado' });
        }
        
        res.json({ received: true });
    } catch (error) {
        next(error);
    }
};
*/
