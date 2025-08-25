const supplierModel = require('../models/supplier');

exports.getAllSuppliers = (req, res, next) => {
    try {
        supplierModel.getAll((err, suppliers) => {
            if (err) return next(err);
            res.json(suppliers);
        });
    } catch (error) {
        next(error);
    }
};

exports.getSupplierById = (req, res, next) => {
    try {
        const { id } = req.params;
        
        supplierModel.getById(id, (err, supplier) => {
            if (err) return next(err);
            
            if (!supplier) {
                return res.status(404).json({
                    error: 'Proveedor no encontrado',
                    message: 'El proveedor solicitado no existe'
                });
            }
            
            res.json(supplier);
        });
    } catch (error) {
        next(error);
    }
};

exports.createSupplier = (req, res, next) => {
    try {
        const { 
            nombre, 
            razon_social, 
            rfc, 
            telefono, 
            email, 
            direccion, 
            ciudad, 
            estado, 
            codigo_postal,
            contacto_principal,
            telefono_contacto,
            email_contacto,
            condiciones_pago,
            dias_credito
        } = req.body;

        if (!nombre) {
            return res.status(400).json({
                error: 'Datos incompletos',
                message: 'El nombre del proveedor es requerido'
            });
        }

        // Validar email si se proporciona
        if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return res.status(400).json({
                error: 'Email inválido',
                message: 'El formato del email no es válido'
            });
        }

        // Validar email de contacto si se proporciona
        if (email_contacto && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email_contacto)) {
            return res.status(400).json({
                error: 'Email de contacto inválido',
                message: 'El formato del email de contacto no es válido'
            });
        }

        const supplierData = {
            nombre,
            razon_social,
            rfc,
            telefono,
            email,
            direccion,
            ciudad,
            estado,
            codigo_postal,
            contacto_principal,
            telefono_contacto,
            email_contacto,
            condiciones_pago,
            dias_credito: dias_credito || 0
        };

        supplierModel.create(supplierData, (err, supplierId) => {
            if (err) return next(err);
            
            res.status(201).json({
                message: 'Proveedor creado exitosamente',
                supplierId
            });
        });
    } catch (error) {
        next(error);
    }
};

exports.updateSupplier = (req, res, next) => {
    try {
        const { id } = req.params;
        const { 
            nombre, 
            razon_social, 
            rfc, 
            telefono, 
            email, 
            direccion, 
            ciudad, 
            estado, 
            codigo_postal,
            contacto_principal,
            telefono_contacto,
            email_contacto,
            condiciones_pago,
            dias_credito
        } = req.body;

        if (!nombre) {
            return res.status(400).json({
                error: 'Datos incompletos',
                message: 'El nombre del proveedor es requerido'
            });
        }

        // Validar email si se proporciona
        if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return res.status(400).json({
                error: 'Email inválido',
                message: 'El formato del email no es válido'
            });
        }

        // Validar email de contacto si se proporciona
        if (email_contacto && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email_contacto)) {
            return res.status(400).json({
                error: 'Email de contacto inválido',
                message: 'El formato del email de contacto no es válido'
            });
        }

        const supplierData = {
            nombre,
            razon_social,
            rfc,
            telefono,
            email,
            direccion,
            ciudad,
            estado,
            codigo_postal,
            contacto_principal,
            telefono_contacto,
            email_contacto,
            condiciones_pago,
            dias_credito
        };

        supplierModel.update(id, supplierData, (err) => {
            if (err) return next(err);
            
            res.json({
                message: 'Proveedor actualizado exitosamente'
            });
        });
    } catch (error) {
        next(error);
    }
};

exports.deleteSupplier = (req, res, next) => {
    try {
        const { id } = req.params;

        supplierModel.delete(id, (err) => {
            if (err) return next(err);
            
            res.json({
                message: 'Proveedor eliminado exitosamente'
            });
        });
    } catch (error) {
        next(error);
    }
};

exports.searchSuppliers = (req, res, next) => {
    try {
        const { q } = req.query;

        if (!q) {
            return res.status(400).json({
                error: 'Parámetro faltante',
                message: 'El término de búsqueda es requerido'
            });
        }

        supplierModel.search(q, (err, suppliers) => {
            if (err) return next(err);
            res.json(suppliers);
        });
    } catch (error) {
        next(error);
    }
};

exports.getSupplierSupplies = (req, res, next) => {
    try {
        const { id } = req.params;
        
        supplierModel.getSupplies(id, (err, supplies) => {
            if (err) return next(err);
            res.json(supplies);
        });
    } catch (error) {
        next(error);
    }
};

exports.addSupplyToSupplier = (req, res, next) => {
    try {
        const { id } = req.params;
        const { suministro_id, precio_proveedor, tiempo_entrega_dias, cantidad_minima } = req.body;

        if (!suministro_id) {
            return res.status(400).json({
                error: 'Datos incompletos',
                message: 'El ID del suministro es requerido'
            });
        }

        if (precio_proveedor && precio_proveedor < 0) {
            return res.status(400).json({
                error: 'Precio inválido',
                message: 'El precio no puede ser negativo'
            });
        }

        if (tiempo_entrega_dias && tiempo_entrega_dias < 0) {
            return res.status(400).json({
                error: 'Tiempo de entrega inválido',
                message: 'El tiempo de entrega no puede ser negativo'
            });
        }

        if (cantidad_minima && cantidad_minima < 1) {
            return res.status(400).json({
                error: 'Cantidad mínima inválida',
                message: 'La cantidad mínima debe ser mayor a cero'
            });
        }

        const supplierSupplyData = {
            proveedor_id: id,
            suministro_id,
            precio_proveedor: precio_proveedor || null,
            tiempo_entrega_dias: tiempo_entrega_dias || null,
            cantidad_minima: cantidad_minima || 1
        };

        supplierModel.addSupply(supplierSupplyData, (err, relationId) => {
            if (err) return next(err);
            
            res.status(201).json({
                message: 'Suministro agregado al proveedor exitosamente',
                relationId
            });
        });
    } catch (error) {
        next(error);
    }
};

exports.removeSupplyFromSupplier = (req, res, next) => {
    try {
        const { id, suministroId } = req.params;

        supplierModel.removeSupply(id, suministroId, (err) => {
            if (err) return next(err);
            
            res.json({
                message: 'Suministro removido del proveedor exitosamente'
            });
        });
    } catch (error) {
        next(error);
    }
};

exports.getBestPriceForSupply = (req, res, next) => {
    try {
        const { suministroId } = req.params;
        
        supplierModel.getBestPriceForSupply(suministroId, (err, suppliers) => {
            if (err) return next(err);
            
            if (!suppliers || suppliers.length === 0) {
                return res.status(404).json({
                    error: 'No se encontraron proveedores',
                    message: 'No hay proveedores disponibles para este suministro'
                });
            }
            
            res.json(suppliers);
        });
    } catch (error) {
        next(error);
    }
};

exports.getSupplierReport = (req, res, next) => {
    try {
        const { id } = req.params;
        const { fecha_inicio, fecha_fin } = req.query;

        // Obtener información del proveedor
        supplierModel.getById(id, (err, supplier) => {
            if (err) return next(err);
            
            if (!supplier) {
                return res.status(404).json({
                    error: 'Proveedor no encontrado',
                    message: 'El proveedor solicitado no existe'
                });
            }

            // Obtener suministros del proveedor
            supplierModel.getSupplies(id, (err, supplies) => {
                if (err) return next(err);
                
                const report = {
                    fecha_reporte: new Date().toISOString(),
                    proveedor: supplier,
                    periodo: {
                        inicio: fecha_inicio || 'N/A',
                        fin: fecha_fin || 'N/A'
                    },
                    resumen: {
                        total_suministros: supplies.length,
                        precio_promedio: supplies.length > 0 
                            ? supplies.reduce((sum, s) => sum + (s.precio_proveedor || 0), 0) / supplies.length 
                            : 0,
                        tiempo_entrega_promedio: supplies.length > 0 
                            ? supplies.reduce((sum, s) => sum + (s.tiempo_entrega_dias || 0), 0) / supplies.length 
                            : 0
                    },
                    suministros: supplies
                };
                
                res.json(report);
            });
        });
    } catch (error) {
        next(error);
    }
};

exports.getAllSuppliersReport = (req, res, next) => {
    try {
        supplierModel.getAll((err, suppliers) => {
            if (err) return next(err);
            
            const report = {
                fecha_reporte: new Date().toISOString(),
                resumen: {
                    total_proveedores: suppliers.length,
                    proveedores_activos: suppliers.filter(s => s.activo).length
                },
                proveedores: suppliers.map(supplier => ({
                    id: supplier.id,
                    nombre: supplier.nombre,
                    telefono: supplier.telefono,
                    email: supplier.email,
                    ciudad: supplier.ciudad,
                    estado: supplier.estado,
                    condiciones_pago: supplier.condiciones_pago,
                    dias_credito: supplier.dias_credito,
                    activo: supplier.activo
                }))
            };
            
            res.json(report);
        });
    } catch (error) {
        next(error);
    }
};
