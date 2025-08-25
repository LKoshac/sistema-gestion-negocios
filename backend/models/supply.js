const sqlite3 = require('sqlite3').verbose();
const config = require('../config/config');

let db = new sqlite3.Database(config.dbPath);

// Crear la tabla de suministros si no existe
db.run(`
    CREATE TABLE IF NOT EXISTS supplies (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nombre TEXT NOT NULL,
        descripcion TEXT,
        categoria TEXT,
        precio_compra REAL DEFAULT 0,
        precio_venta REAL DEFAULT 0,
        stock_minimo INTEGER DEFAULT 0,
        unidad_medida TEXT DEFAULT 'unidad',
        codigo_barras TEXT,
        activo INTEGER DEFAULT 1,
        fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
        fecha_actualizacion DATETIME DEFAULT CURRENT_TIMESTAMP
    )
`);

module.exports = {
    getAll: (callback) => {
        db.all("SELECT * FROM supplies WHERE activo = 1 ORDER BY nombre", callback);
    },

    getById: (id, callback) => {
        db.get("SELECT * FROM supplies WHERE id = ? AND activo = 1", [id], callback);
    },

    getByCategory: (categoria, callback) => {
        db.all("SELECT * FROM supplies WHERE categoria = ? AND activo = 1 ORDER BY nombre", [categoria], callback);
    },

    getLowStock: (callback) => {
        db.all(`
            SELECT s.*, st.cantidad_actual 
            FROM supplies s 
            LEFT JOIN stock st ON s.id = st.suministro_id 
            WHERE s.activo = 1 AND (st.cantidad_actual <= s.stock_minimo OR st.cantidad_actual IS NULL)
            ORDER BY s.nombre
        `, callback);
    },

    create: (supplyData, callback) => {
        const { 
            nombre, 
            descripcion, 
            categoria, 
            precio_compra, 
            precio_venta, 
            stock_minimo, 
            unidad_medida, 
            codigo_barras 
        } = supplyData;
        
        db.run(
            `INSERT INTO supplies 
            (nombre, descripcion, categoria, precio_compra, precio_venta, stock_minimo, unidad_medida, codigo_barras) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [nombre, descripcion, categoria, precio_compra, precio_venta, stock_minimo, unidad_medida, codigo_barras],
            function(err) {
                callback(err, this ? this.lastID : null);
            }
        );
    },

    update: (id, supplyData, callback) => {
        const { 
            nombre, 
            descripcion, 
            categoria, 
            precio_compra, 
            precio_venta, 
            stock_minimo, 
            unidad_medida, 
            codigo_barras 
        } = supplyData;
        
        db.run(
            `UPDATE supplies SET 
            nombre = ?, descripcion = ?, categoria = ?, precio_compra = ?, precio_venta = ?, 
            stock_minimo = ?, unidad_medida = ?, codigo_barras = ?, fecha_actualizacion = CURRENT_TIMESTAMP 
            WHERE id = ?`,
            [nombre, descripcion, categoria, precio_compra, precio_venta, stock_minimo, unidad_medida, codigo_barras, id],
            callback
        );
    },

    delete: (id, callback) => {
        db.run("UPDATE supplies SET activo = 0, fecha_actualizacion = CURRENT_TIMESTAMP WHERE id = ?", [id], callback);
    },

    search: (searchTerm, callback) => {
        const term = `%${searchTerm}%`;
        db.all(
            "SELECT * FROM supplies WHERE (nombre LIKE ? OR descripcion LIKE ? OR categoria LIKE ?) AND activo = 1 ORDER BY nombre",
            [term, term, term],
            callback
        );
    }
};
