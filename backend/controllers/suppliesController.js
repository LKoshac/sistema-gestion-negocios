const supplyModel = require('../models/supply');
const stockModel = require('../models/stock');

exports.getAllSupplies = (req, res, next) => {
    try {
        supplyModel.getAll((err, supplies) => {
            if (err) return next(err);
            res.json(supplies);
        });
    } catch (error) {
        next(error);
    }
};

exports.getSupplyById = (req, res, next) => {
    try {
        const { id } = req.params;
        
        supplyModel.getById(id, (err, supply) => {
            if (err) return next(err);
            
            if (!supply) {
                return res.status(404).json({
                    error: 'Suministro no encontrado',
                    message: 'El suministro solicitado no existe'
                });
            }
            
            // Obtener información de stock
            stockModel.getBySupplyId(id, (err, stock) => {
                if (err) return next(err);
                
                res.json({
                    ...supply,
                    stock: stock || { cantidad_actual: 0, cantidad_reservada: 0 }
                });
            });
        });
    } catch (error) {
        next(error);
    }
};

exports.getSuppliesByCategory = (req, res, next) => {
    try {
        const { categoria } = req.params;
        
        supplyModel.getByCategory(categoria, (err, supplies) => {
            if (err) return next(err);
            res.json(supplies);
        });
    } catch (error) {
        next(error);
    }
};

exports.getLowStockSupplies = (req, res, next) => {
    try {
        supplyModel.getLowStock((err, supplies) => {
            if (err) return next(err);
            res.json(supplies);
        });
    } catch (error) {
        next(error);
    }
};

exports.createSupply = (req, res, next) => {
    try {
        const { 
            nombre, 
            descripcion, 
            categoria, 
            precio_compra, 
            precio_venta, 
            stock_minimo, 
            unidad_medida, 
            codigo_barras 
        } = req.body;

        if (!nombre) {
            return res.status(400).json({
                error: 'Datos incompletos',
                message: 'El nombre del suministro es requerido'
            });
        }

        const supplyData = {
            nombre,
            descripcion,
            categoria,
            precio_compra: precio_compra || 0,
            precio_venta: precio_venta || 0,
            stock_minimo: stock_minimo || 0,
            unidad_medida: unidad_medida || 'unidad',
            codigo_barras
        };

        supplyModel.create(supplyData, (err, supplyId) => {
            if (err) return next(err);
            
            // Crear registro inicial de stock
            stockModel.createOrUpdate({
                suministro_id: supplyId,
                cantidad_actual: 0,
                ubicacion: null
            }, (err) => {
                if (err) return next(err);
                
                res.status(201).json({
                    message: 'Suministro creado exitosamente',
                    supplyId
                });
            });
        });
    } catch (error) {
        next(error);
    }
};

exports.updateSupply = (req, res, next) => {
    try {
        const { id } = req.params;
        const { 
            nombre, 
            descripcion, 
            categoria, 
            precio_compra, 
            precio_venta, 
            stock_minimo, 
            unidad_medida, 
            codigo_barras 
        } = req.body;

        if (!nombre) {
            return res.status(400).json({
                error: 'Datos incompletos',
                message: 'El nombre del suministro es requerido'
            });
        }

        const supplyData = {
            nombre,
            descripcion,
            categoria,
            precio_compra,
            precio_venta,
            stock_minimo,
            unidad_medida,
            codigo_barras
        };

        supplyModel.update(id, supplyData, (err) => {
            if (err) return next(err);
            
            res.json({
                message: 'Suministro actualizado exitosamente'
            });
        });
    } catch (error) {
        next(error);
    }
};

exports.deleteSupply = (req, res, next) => {
    try {
        const { id } = req.params;

        supplyModel.delete(id, (err) => {
            if (err) return next(err);
            
            res.json({
                message: 'Suministro eliminado exitosamente'
            });
        });
    } catch (error) {
        next(error);
    }
};

exports.searchSupplies = (req, res, next) => {
    try {
        const { q } = req.query;

        if (!q) {
            return res.status(400).json({
                error: 'Parámetro faltante',
                message: 'El término de búsqueda es requerido'
            });
        }

        supplyModel.search(q, (err, supplies) => {
            if (err) return next(err);
            res.json(supplies);
        });
    } catch (error) {
        next(error);
    }
};

exports.getSupplyStock = (req, res, next) => {
    try {
        const { id } = req.params;
        
        stockModel.getBySupplyId(id, (err, stock) => {
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

exports.updateSupplyStock = (req, res, next) => {
    try {
        const { id } = req.params;
        const { cantidad_actual, ubicacion } = req.body;

        if (cantidad_actual === undefined) {
            return res.status(400).json({
                error: 'Datos incompletos',
                message: 'La cantidad actual es requerida'
            });
        }

        const stockData = {
            suministro_id: id,
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

exports.addStockMovement = (req, res, next) => {
    try {
        const { id } = req.params;
        const { tipo_movimiento, cantidad, motivo, referencia } = req.body;

        if (!tipo_movimiento || !cantidad) {
            return res.status(400).json({
                error: 'Datos incompletos',
                message: 'Tipo de movimiento y cantidad son requeridos'
            });
        }

        const movementData = {
            suministro_id: id,
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

exports.getStockMovements = (req, res, next) => {
    try {
        const { id } = req.params;
        
        stockModel.getMovements(id, (err, movements) => {
            if (err) return next(err);
            res.json(movements);
        });
    } catch (error) {
        next(error);
    }
};

exports.getCategories = (req, res, next) => {
    try {
        // Obtener categorías únicas de los suministros
        supplyModel.getAll((err, supplies) => {
            if (err) return next(err);
            
            const categories = [...new Set(supplies
                .map(supply => supply.categoria)
                .filter(categoria => categoria && categoria.trim() !== '')
            )];
            
            res.json(categories);
        });
    } catch (error) {
        next(error);
    }
};
