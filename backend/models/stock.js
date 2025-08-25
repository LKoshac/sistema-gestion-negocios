const sqlite3 = require('sqlite3').verbose();
const config = require('../config/config');

let db = new sqlite3.Database(config.dbPath);

// Crear la tabla de stock si no existe
db.run(`
    CREATE TABLE IF NOT EXISTS stock (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        suministro_id INTEGER NOT NULL,
        cantidad_actual INTEGER DEFAULT 0,
        cantidad_reservada INTEGER DEFAULT 0,
        ubicacion TEXT,
        fecha_actualizacion DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (suministro_id) REFERENCES supplies (id)
    )
`);

// Crear la tabla de movimientos de stock
db.run(`
    CREATE TABLE IF NOT EXISTS stock_movements (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        suministro_id INTEGER NOT NULL,
        tipo_movimiento TEXT NOT NULL CHECK(tipo_movimiento IN ('entrada', 'salida', 'ajuste', 'reserva', 'liberacion')),
        cantidad INTEGER NOT NULL,
        cantidad_anterior INTEGER,
        cantidad_nueva INTEGER,
        motivo TEXT,
        referencia TEXT,
        usuario_id INTEGER,
        fecha_movimiento DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (suministro_id) REFERENCES supplies (id),
        FOREIGN KEY (usuario_id) REFERENCES users (id)
    )
`);

module.exports = {
    getAll: (callback) => {
        db.all(`
            SELECT s.*, sup.nombre, sup.descripcion, sup.stock_minimo, sup.unidad_medida
            FROM stock s
            JOIN supplies sup ON s.suministro_id = sup.id
            WHERE sup.activo = 1
            ORDER BY sup.nombre
        `, callback);
    },

    getBySupplyId: (suministroId, callback) => {
        db.get(`
            SELECT s.*, sup.nombre, sup.descripcion, sup.stock_minimo, sup.unidad_medida
            FROM stock s
            JOIN supplies sup ON s.suministro_id = sup.id
            WHERE s.suministro_id = ? AND sup.activo = 1
        `, [suministroId], callback);
    },

    getLowStock: (callback) => {
        db.all(`
            SELECT s.*, sup.nombre, sup.descripcion, sup.stock_minimo, sup.unidad_medida
            FROM stock s
            JOIN supplies sup ON s.suministro_id = sup.id
            WHERE sup.activo = 1 AND s.cantidad_actual <= sup.stock_minimo
            ORDER BY sup.nombre
        `, callback);
    },

    createOrUpdate: (stockData, callback) => {
        const { suministro_id, cantidad_actual, ubicacion } = stockData;
        
        // Verificar si ya existe stock para este suministro
        db.get("SELECT id FROM stock WHERE suministro_id = ?", [suministro_id], (err, row) => {
            if (err) return callback(err);
            
            if (row) {
                // Actualizar stock existente
                db.run(
                    "UPDATE stock SET cantidad_actual = ?, ubicacion = ?, fecha_actualizacion = CURRENT_TIMESTAMP WHERE suministro_id = ?",
                    [cantidad_actual, ubicacion, suministro_id],
                    callback
                );
            } else {
                // Crear nuevo registro de stock
                db.run(
                    "INSERT INTO stock (suministro_id, cantidad_actual, ubicacion) VALUES (?, ?, ?)",
                    [suministro_id, cantidad_actual, ubicacion],
                    function(err) {
                        callback(err, this ? this.lastID : null);
                    }
                );
            }
        });
    },

    addMovement: (movementData, callback) => {
        const { 
            suministro_id, 
            tipo_movimiento, 
            cantidad, 
            motivo, 
            referencia, 
            usuario_id 
        } = movementData;

        // Obtener cantidad actual
        db.get("SELECT cantidad_actual FROM stock WHERE suministro_id = ?", [suministro_id], (err, row) => {
            if (err) return callback(err);
            
            const cantidadAnterior = row ? row.cantidad_actual : 0;
            let cantidadNueva = cantidadAnterior;
            
            // Calcular nueva cantidad según el tipo de movimiento
            switch (tipo_movimiento) {
                case 'entrada':
                    cantidadNueva = cantidadAnterior + cantidad;
                    break;
                case 'salida':
                    cantidadNueva = cantidadAnterior - cantidad;
                    break;
                case 'ajuste':
                    cantidadNueva = cantidad; // La cantidad es el nuevo total
                    break;
                default:
                    cantidadNueva = cantidadAnterior;
            }

            // Insertar movimiento
            db.run(
                `INSERT INTO stock_movements 
                (suministro_id, tipo_movimiento, cantidad, cantidad_anterior, cantidad_nueva, motivo, referencia, usuario_id) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                [suministro_id, tipo_movimiento, cantidad, cantidadAnterior, cantidadNueva, motivo, referencia, usuario_id],
                (err) => {
                    if (err) return callback(err);
                    
                    // Actualizar stock actual
                    if (tipo_movimiento !== 'reserva' && tipo_movimiento !== 'liberacion') {
                        module.exports.createOrUpdate({
                            suministro_id,
                            cantidad_actual: cantidadNueva,
                            ubicacion: row ? row.ubicacion : null
                        }, callback);
                    } else {
                        callback(null);
                    }
                }
            );
        });
    },

    getMovements: (suministroId, callback) => {
        const query = suministroId 
            ? `SELECT sm.*, sup.nombre as suministro_nombre, u.username 
               FROM stock_movements sm 
               JOIN supplies sup ON sm.suministro_id = sup.id 
               LEFT JOIN users u ON sm.usuario_id = u.id 
               WHERE sm.suministro_id = ? 
               ORDER BY sm.fecha_movimiento DESC`
            : `SELECT sm.*, sup.nombre as suministro_nombre, u.username 
               FROM stock_movements sm 
               JOIN supplies sup ON sm.suministro_id = sup.id 
               LEFT JOIN users u ON sm.usuario_id = u.id 
               ORDER BY sm.fecha_movimiento DESC LIMIT 100`;
        
        const params = suministroId ? [suministroId] : [];
        db.all(query, params, callback);
    },

    reserveStock: (suministroId, cantidad, callback) => {
        db.run(
            "UPDATE stock SET cantidad_reservada = cantidad_reservada + ? WHERE suministro_id = ?",
            [cantidad, suministroId],
            callback
        );
    },

    releaseStock: (suministroId, cantidad, callback) => {
        db.run(
            "UPDATE stock SET cantidad_reservada = cantidad_reservada - ? WHERE suministro_id = ?",
            [cantidad, suministroId],
            callback
        );
    }
};
