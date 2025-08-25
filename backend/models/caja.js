const sqlite3 = require('sqlite3').verbose();
const config = require('../config/config');

let db = new sqlite3.Database(config.dbPath);

// Crear la tabla de cajas si no existe
db.run(`
    CREATE TABLE IF NOT EXISTS cajas (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nombre TEXT NOT NULL,
        descripcion TEXT,
        ubicacion TEXT,
        activo INTEGER DEFAULT 1,
        fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP
    )
`);

// Crear la tabla de sesiones de caja
db.run(`
    CREATE TABLE IF NOT EXISTS caja_sessions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        caja_id INTEGER NOT NULL,
        usuario_id INTEGER NOT NULL,
        fecha_apertura DATETIME DEFAULT CURRENT_TIMESTAMP,
        fecha_cierre DATETIME,
        monto_inicial REAL DEFAULT 0,
        monto_final REAL DEFAULT 0,
        total_ventas REAL DEFAULT 0,
        total_efectivo REAL DEFAULT 0,
        total_tarjeta REAL DEFAULT 0,
        total_transferencia REAL DEFAULT 0,
        estado TEXT DEFAULT 'abierta' CHECK(estado IN ('abierta', 'cerrada')),
        notas_apertura TEXT,
        notas_cierre TEXT,
        FOREIGN KEY (caja_id) REFERENCES cajas (id),
        FOREIGN KEY (usuario_id) REFERENCES users (id)
    )
`);

// Crear la tabla de ventas
db.run(`
    CREATE TABLE IF NOT EXISTS sales (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        numero_venta TEXT UNIQUE NOT NULL,
        caja_session_id INTEGER NOT NULL,
        cliente_nombre TEXT,
        cliente_email TEXT,
        cliente_telefono TEXT,
        subtotal REAL NOT NULL DEFAULT 0,
        descuento REAL DEFAULT 0,
        impuestos REAL DEFAULT 0,
        total REAL NOT NULL DEFAULT 0,
        metodo_pago TEXT NOT NULL CHECK(metodo_pago IN ('efectivo', 'tarjeta', 'transferencia', 'mixto')),
        estado TEXT DEFAULT 'completada' CHECK(estado IN ('pendiente', 'completada', 'cancelada', 'reembolsada')),
        fecha_venta DATETIME DEFAULT CURRENT_TIMESTAMP,
        usuario_id INTEGER,
        notas TEXT,
        FOREIGN KEY (caja_session_id) REFERENCES caja_sessions (id),
        FOREIGN KEY (usuario_id) REFERENCES users (id)
    )
`);

// Crear la tabla de detalles de venta
db.run(`
    CREATE TABLE IF NOT EXISTS sale_details (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        venta_id INTEGER NOT NULL,
        suministro_id INTEGER NOT NULL,
        cantidad INTEGER NOT NULL,
        precio_unitario REAL NOT NULL,
        descuento_item REAL DEFAULT 0,
        subtotal_item REAL NOT NULL,
        FOREIGN KEY (venta_id) REFERENCES sales (id),
        FOREIGN KEY (suministro_id) REFERENCES supplies (id)
    )
`);

// Crear la tabla de movimientos de caja
db.run(`
    CREATE TABLE IF NOT EXISTS caja_movements (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        caja_session_id INTEGER NOT NULL,
        tipo_movimiento TEXT NOT NULL CHECK(tipo_movimiento IN ('entrada', 'salida', 'venta', 'devolucion')),
        monto REAL NOT NULL,
        concepto TEXT NOT NULL,
        referencia TEXT,
        metodo_pago TEXT,
        fecha_movimiento DATETIME DEFAULT CURRENT_TIMESTAMP,
        usuario_id INTEGER,
        venta_id INTEGER,
        FOREIGN KEY (caja_session_id) REFERENCES caja_sessions (id),
        FOREIGN KEY (usuario_id) REFERENCES users (id),
        FOREIGN KEY (venta_id) REFERENCES sales (id)
    )
`);

// Insertar caja por defecto después de crear las tablas
setTimeout(() => {
    db.run(`INSERT OR IGNORE INTO cajas (id, nombre, descripcion, ubicacion) VALUES 
        (1, 'Caja Principal', 'Caja principal del negocio', 'Mostrador principal')
    `);
}, 200);

module.exports = {
    // Gestión de cajas
    getAllCajas: (callback) => {
        db.all("SELECT * FROM cajas WHERE activo = 1 ORDER BY nombre", callback);
    },

    getCajaById: (id, callback) => {
        db.get("SELECT * FROM cajas WHERE id = ? AND activo = 1", [id], callback);
    },

    createCaja: (cajaData, callback) => {
        const { nombre, descripcion, ubicacion } = cajaData;
        db.run(
            "INSERT INTO cajas (nombre, descripcion, ubicacion) VALUES (?, ?, ?)",
            [nombre, descripcion, ubicacion],
            function(err) {
                callback(err, this ? this.lastID : null);
            }
        );
    },

    // Gestión de sesiones de caja
    openSession: (sessionData, callback) => {
        const { caja_id, usuario_id, monto_inicial, notas_apertura } = sessionData;
        
        // Verificar que no haya una sesión abierta
        db.get("SELECT id FROM caja_sessions WHERE caja_id = ? AND estado = 'abierta'", [caja_id], (err, row) => {
            if (err) return callback(err);
            if (row) return callback(new Error('Ya existe una sesión abierta para esta caja'));
            
            db.run(
                "INSERT INTO caja_sessions (caja_id, usuario_id, monto_inicial, notas_apertura) VALUES (?, ?, ?, ?)",
                [caja_id, usuario_id, monto_inicial, notas_apertura],
                function(err) {
                    callback(err, this ? this.lastID : null);
                }
            );
        });
    },

    closeSession: (sessionId, sessionData, callback) => {
        const { monto_final, notas_cierre } = sessionData;
        
        // Calcular totales de la sesión
        db.get(`
            SELECT 
                SUM(CASE WHEN tipo_movimiento = 'venta' AND metodo_pago = 'efectivo' THEN monto ELSE 0 END) as total_efectivo,
                SUM(CASE WHEN tipo_movimiento = 'venta' AND metodo_pago = 'tarjeta' THEN monto ELSE 0 END) as total_tarjeta,
                SUM(CASE WHEN tipo_movimiento = 'venta' AND metodo_pago = 'transferencia' THEN monto ELSE 0 END) as total_transferencia,
                SUM(CASE WHEN tipo_movimiento = 'venta' THEN monto ELSE 0 END) as total_ventas
            FROM caja_movements 
            WHERE caja_session_id = ?
        `, [sessionId], (err, totals) => {
            if (err) return callback(err);
            
            db.run(
                `UPDATE caja_sessions SET 
                fecha_cierre = CURRENT_TIMESTAMP, 
                monto_final = ?, 
                total_ventas = ?, 
                total_efectivo = ?, 
                total_tarjeta = ?, 
                total_transferencia = ?, 
                estado = 'cerrada', 
                notas_cierre = ? 
                WHERE id = ?`,
                [monto_final, totals.total_ventas || 0, totals.total_efectivo || 0, 
                 totals.total_tarjeta || 0, totals.total_transferencia || 0, notas_cierre, sessionId],
                callback
            );
        });
    },

    getActiveSession: (cajaId, callback) => {
        db.get(`
            SELECT cs.*, c.nombre as caja_nombre, u.username
            FROM caja_sessions cs
            JOIN cajas c ON cs.caja_id = c.id
            JOIN users u ON cs.usuario_id = u.id
            WHERE cs.caja_id = ? AND cs.estado = 'abierta'
        `, [cajaId], callback);
    },

    // Gestión de ventas
    createSale: (saleData, callback) => {
        const { 
            caja_session_id, 
            cliente_nombre, 
            cliente_email, 
            cliente_telefono, 
            subtotal, 
            descuento = 0, 
            impuestos = 0, 
            total, 
            metodo_pago, 
            usuario_id, 
            notas,
            items 
        } = saleData;
        
        // Generar número de venta
        const numeroVenta = `V${Date.now()}`;
        
        db.run(
            `INSERT INTO sales 
            (numero_venta, caja_session_id, cliente_nombre, cliente_email, cliente_telefono, 
             subtotal, descuento, impuestos, total, metodo_pago, usuario_id, notas) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [numeroVenta, caja_session_id, cliente_nombre, cliente_email, cliente_telefono, 
             subtotal, descuento, impuestos, total, metodo_pago, usuario_id, notas],
            function(err) {
                if (err) return callback(err);
                
                const ventaId = this.lastID;
                
                // Insertar detalles de venta
                const insertDetails = (items, index = 0) => {
                    if (index >= items.length) {
                        // Registrar movimiento de caja
                        module.exports.addMovement({
                            caja_session_id,
                            tipo_movimiento: 'venta',
                            monto: total,
                            concepto: `Venta ${numeroVenta}`,
                            referencia: numeroVenta,
                            metodo_pago,
                            usuario_id,
                            venta_id: ventaId
                        }, (err) => {
                            callback(err, ventaId);
                        });
                        return;
                    }
                    
                    const item = items[index];
                    db.run(
                        "INSERT INTO sale_details (venta_id, suministro_id, cantidad, precio_unitario, descuento_item, subtotal_item) VALUES (?, ?, ?, ?, ?, ?)",
                        [ventaId, item.suministro_id, item.cantidad, item.precio_unitario, item.descuento_item || 0, item.subtotal_item],
                        (err) => {
                            if (err) return callback(err);
                            insertDetails(items, index + 1);
                        }
                    );
                };
                
                if (items && items.length > 0) {
                    insertDetails(items);
                } else {
                    callback(null, ventaId);
                }
            }
        );
    },

    getSaleById: (id, callback) => {
        db.get(`
            SELECT s.*, cs.caja_id, c.nombre as caja_nombre, u.username
            FROM sales s
            JOIN caja_sessions cs ON s.caja_session_id = cs.id
            JOIN cajas c ON cs.caja_id = c.id
            LEFT JOIN users u ON s.usuario_id = u.id
            WHERE s.id = ?
        `, [id], callback);
    },

    getSaleDetails: (ventaId, callback) => {
        db.all(`
            SELECT sd.*, sup.nombre, sup.descripcion, sup.unidad_medida
            FROM sale_details sd
            JOIN supplies sup ON sd.suministro_id = sup.id
            WHERE sd.venta_id = ?
        `, [ventaId], callback);
    },

    getSalesBySession: (sessionId, callback) => {
        db.all(`
            SELECT s.*, u.username
            FROM sales s
            LEFT JOIN users u ON s.usuario_id = u.id
            WHERE s.caja_session_id = ?
            ORDER BY s.fecha_venta DESC
        `, [sessionId], callback);
    },

    // Movimientos de caja
    addMovement: (movementData, callback) => {
        const { 
            caja_session_id, 
            tipo_movimiento, 
            monto, 
            concepto, 
            referencia, 
            metodo_pago, 
            usuario_id, 
            venta_id 
        } = movementData;
        
        db.run(
            `INSERT INTO caja_movements 
            (caja_session_id, tipo_movimiento, monto, concepto, referencia, metodo_pago, usuario_id, venta_id) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [caja_session_id, tipo_movimiento, monto, concepto, referencia, metodo_pago, usuario_id, venta_id],
            function(err) {
                callback(err, this ? this.lastID : null);
            }
        );
    },

    getMovementsBySession: (sessionId, callback) => {
        db.all(`
            SELECT cm.*, u.username
            FROM caja_movements cm
            LEFT JOIN users u ON cm.usuario_id = u.id
            WHERE cm.caja_session_id = ?
            ORDER BY cm.fecha_movimiento DESC
        `, [sessionId], callback);
    },

    // Reportes
    getDailySales: (fecha, callback) => {
        db.all(`
            SELECT s.*, cs.caja_id, c.nombre as caja_nombre, u.username
            FROM sales s
            JOIN caja_sessions cs ON s.caja_session_id = cs.id
            JOIN cajas c ON cs.caja_id = c.id
            LEFT JOIN users u ON s.usuario_id = u.id
            WHERE DATE(s.fecha_venta) = ?
            ORDER BY s.fecha_venta DESC
        `, [fecha], callback);
    },

    getSalesReport: (fechaInicio, fechaFin, callback) => {
        db.all(`
            SELECT 
                DATE(s.fecha_venta) as fecha,
                COUNT(*) as total_ventas,
                SUM(s.total) as total_ingresos,
                AVG(s.total) as promedio_venta
            FROM sales s
            WHERE DATE(s.fecha_venta) BETWEEN ? AND ?
            AND s.estado = 'completada'
            GROUP BY DATE(s.fecha_venta)
            ORDER BY fecha DESC
        `, [fechaInicio, fechaFin], callback);
    }
};
