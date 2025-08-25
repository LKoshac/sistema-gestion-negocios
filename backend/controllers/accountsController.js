const accountModel = require('../models/account');

exports.getAllAccounts = (req, res, next) => {
    try {
        const { tipo } = req.query;

        if (tipo) {
            accountModel.getByType(tipo, (err, accounts) => {
                if (err) return next(err);
                res.json(accounts);
            });
        } else {
            accountModel.getAll((err, accounts) => {
                if (err) return next(err);
                res.json(accounts);
            });
        }
    } catch (error) {
        next(error);
    }
};

exports.getAccountById = (req, res, next) => {
    try {
        const { id } = req.params;
        
        accountModel.getById(id, (err, account) => {
            if (err) return next(err);
            
            if (!account) {
                return res.status(404).json({
                    error: 'Cuenta no encontrada',
                    message: 'La cuenta solicitada no existe'
                });
            }
            
            res.json(account);
        });
    } catch (error) {
        next(error);
    }
};

exports.getAccountsByType = (req, res, next) => {
    try {
        const { tipo } = req.params;

        const validTypes = ['activo', 'pasivo', 'capital', 'ingreso', 'egreso'];
        if (!validTypes.includes(tipo)) {
            return res.status(400).json({
                error: 'Tipo de cuenta inválido',
                message: 'Los tipos válidos son: activo, pasivo, capital, ingreso, egreso'
            });
        }

        accountModel.getByType(tipo, (err, accounts) => {
            if (err) return next(err);
            res.json(accounts);
        });
    } catch (error) {
        next(error);
    }
};

exports.createAccount = (req, res, next) => {
    try {
        const { 
            codigo, 
            nombre, 
            tipo_cuenta, 
            subtipo, 
            descripcion, 
            saldo_inicial, 
            cuenta_padre_id, 
            nivel 
        } = req.body;

        if (!codigo || !nombre || !tipo_cuenta) {
            return res.status(400).json({
                error: 'Datos incompletos',
                message: 'Código, nombre y tipo de cuenta son requeridos'
            });
        }

        const validTypes = ['activo', 'pasivo', 'capital', 'ingreso', 'egreso'];
        if (!validTypes.includes(tipo_cuenta)) {
            return res.status(400).json({
                error: 'Tipo de cuenta inválido',
                message: 'Los tipos válidos son: activo, pasivo, capital, ingreso, egreso'
            });
        }

        // Validar que el código no esté duplicado
        accountModel.getAll((err, accounts) => {
            if (err) return next(err);
            
            const existingAccount = accounts.find(acc => acc.codigo === codigo);
            if (existingAccount) {
                return res.status(409).json({
                    error: 'Código duplicado',
                    message: 'Ya existe una cuenta con este código'
                });
            }

            const accountData = {
                codigo,
                nombre,
                tipo_cuenta,
                subtipo,
                descripcion,
                saldo_inicial: saldo_inicial || 0,
                cuenta_padre_id,
                nivel: nivel || 1
            };

            accountModel.create(accountData, (err, accountId) => {
                if (err) return next(err);
                
                res.status(201).json({
                    message: 'Cuenta creada exitosamente',
                    accountId
                });
            });
        });
    } catch (error) {
        next(error);
    }
};

exports.updateAccount = (req, res, next) => {
    try {
        const { id } = req.params;
        const { 
            codigo, 
            nombre, 
            tipo_cuenta, 
            subtipo, 
            descripcion, 
            cuenta_padre_id, 
            nivel 
        } = req.body;

        if (!codigo || !nombre || !tipo_cuenta) {
            return res.status(400).json({
                error: 'Datos incompletos',
                message: 'Código, nombre y tipo de cuenta son requeridos'
            });
        }

        const validTypes = ['activo', 'pasivo', 'capital', 'ingreso', 'egreso'];
        if (!validTypes.includes(tipo_cuenta)) {
            return res.status(400).json({
                error: 'Tipo de cuenta inválido',
                message: 'Los tipos válidos son: activo, pasivo, capital, ingreso, egreso'
            });
        }

        const accountData = {
            codigo,
            nombre,
            tipo_cuenta,
            subtipo,
            descripcion,
            cuenta_padre_id,
            nivel
        };

        accountModel.update(id, accountData, (err) => {
            if (err) return next(err);
            
            res.json({
                message: 'Cuenta actualizada exitosamente'
            });
        });
    } catch (error) {
        next(error);
    }
};

exports.deleteAccount = (req, res, next) => {
    try {
        const { id } = req.params;

        // Verificar que la cuenta no tenga movimientos
        accountModel.getMovements(id, (err, movements) => {
            if (err) return next(err);
            
            if (movements && movements.length > 0) {
                return res.status(400).json({
                    error: 'Cuenta con movimientos',
                    message: 'No se puede eliminar una cuenta que tiene movimientos registrados'
                });
            }

            accountModel.delete(id, (err) => {
                if (err) return next(err);
                
                res.json({
                    message: 'Cuenta eliminada exitosamente'
                });
            });
        });
    } catch (error) {
        next(error);
    }
};

exports.addMovement = (req, res, next) => {
    try {
        const { id } = req.params;
        const { 
            tipo_movimiento, 
            monto, 
            concepto, 
            referencia, 
            documento, 
            asiento_id 
        } = req.body;

        if (!tipo_movimiento || !monto || !concepto) {
            return res.status(400).json({
                error: 'Datos incompletos',
                message: 'Tipo de movimiento, monto y concepto son requeridos'
            });
        }

        const validMovements = ['debe', 'haber'];
        if (!validMovements.includes(tipo_movimiento)) {
            return res.status(400).json({
                error: 'Tipo de movimiento inválido',
                message: 'Los tipos válidos son: debe, haber'
            });
        }

        if (monto <= 0) {
            return res.status(400).json({
                error: 'Monto inválido',
                message: 'El monto debe ser mayor a cero'
            });
        }

        const movementData = {
            cuenta_id: id,
            tipo_movimiento,
            monto,
            concepto,
            referencia,
            documento,
            usuario_id: req.user ? req.user.id : null,
            asiento_id
        };

        accountModel.addMovement(movementData, (err) => {
            if (err) return next(err);
            
            res.status(201).json({
                message: 'Movimiento registrado exitosamente'
            });
        });
    } catch (error) {
        next(error);
    }
};

exports.getAccountMovements = (req, res, next) => {
    try {
        const { id } = req.params;
        
        accountModel.getMovements(id, (err, movements) => {
            if (err) return next(err);
            res.json(movements);
        });
    } catch (error) {
        next(error);
    }
};

exports.getBalanceSheet = (req, res, next) => {
    try {
        accountModel.getBalanceSheet((err, balanceData) => {
            if (err) return next(err);
            
            // Organizar datos del balance
            const balance = {
                fecha_reporte: new Date().toISOString(),
                activos: 0,
                pasivos: 0,
                capital: 0
            };

            balanceData.forEach(item => {
                switch (item.tipo_cuenta) {
                    case 'activo':
                        balance.activos += item.total_saldo || 0;
                        break;
                    case 'pasivo':
                        balance.pasivos += item.total_saldo || 0;
                        break;
                    case 'capital':
                        balance.capital += item.total_saldo || 0;
                        break;
                }
            });

            balance.total_pasivo_capital = balance.pasivos + balance.capital;
            balance.diferencia = balance.activos - balance.total_pasivo_capital;

            res.json({
                balance_general: balance,
                detalle_por_tipo: balanceData
            });
        });
    } catch (error) {
        next(error);
    }
};

exports.getIncomeStatement = (req, res, next) => {
    try {
        const { fecha_inicio, fecha_fin } = req.query;

        // Si no se proporcionan fechas, usar el mes actual
        const fechaInicio = fecha_inicio || new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];
        const fechaFin = fecha_fin || new Date().toISOString().split('T')[0];

        accountModel.getIncomeStatement(fechaInicio, fechaFin, (err, incomeData) => {
            if (err) return next(err);
            
            // Organizar datos del estado de resultados
            const statement = {
                fecha_reporte: new Date().toISOString(),
                periodo: {
                    inicio: fechaInicio,
                    fin: fechaFin
                },
                ingresos: 0,
                egresos: 0,
                utilidad_bruta: 0,
                detalle_ingresos: [],
                detalle_egresos: []
            };

            incomeData.forEach(item => {
                if (item.tipo_cuenta === 'ingreso') {
                    statement.ingresos += Math.abs(item.total || 0);
                    statement.detalle_ingresos.push({
                        cuenta: item.nombre,
                        monto: Math.abs(item.total || 0)
                    });
                } else if (item.tipo_cuenta === 'egreso') {
                    statement.egresos += Math.abs(item.total || 0);
                    statement.detalle_egresos.push({
                        cuenta: item.nombre,
                        monto: Math.abs(item.total || 0)
                    });
                }
            });

            statement.utilidad_bruta = statement.ingresos - statement.egresos;

            res.json(statement);
        });
    } catch (error) {
        next(error);
    }
};

exports.getAccountsReport = (req, res, next) => {
    try {
        const { tipo, fecha_inicio, fecha_fin } = req.query;

        accountModel.getAll((err, accounts) => {
            if (err) return next(err);
            
            // Filtrar por tipo si se especifica
            const filteredAccounts = tipo 
                ? accounts.filter(acc => acc.tipo_cuenta === tipo)
                : accounts;

            // Calcular estadísticas
            const estadisticas = {
                total_cuentas: filteredAccounts.length,
                por_tipo: {},
                saldo_total: 0
            };

            filteredAccounts.forEach(account => {
                const tipo = account.tipo_cuenta;
                if (!estadisticas.por_tipo[tipo]) {
                    estadisticas.por_tipo[tipo] = { cantidad: 0, saldo_total: 0 };
                }
                estadisticas.por_tipo[tipo].cantidad++;
                estadisticas.por_tipo[tipo].saldo_total += account.saldo_actual || 0;
                estadisticas.saldo_total += account.saldo_actual || 0;
            });

            const report = {
                fecha_reporte: new Date().toISOString(),
                periodo: {
                    inicio: fecha_inicio || 'N/A',
                    fin: fecha_fin || 'N/A'
                },
                estadisticas,
                cuentas: filteredAccounts
            };

            res.json(report);
        });
    } catch (error) {
        next(error);
    }
};
