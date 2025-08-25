const sqlite3 = require('sqlite3').verbose();
const config = require('../config/config');

let db = new sqlite3.Database(config.dbPath);

// Crear la tabla de proveedores si no existe
db.run(`
    CREATE TABLE IF NOT EXISTS suppliers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nombre TEXT NOT NULL,
        razon_social TEXT,
        rfc TEXT,
        telefono TEXT,
        email TEXT,
        direccion TEXT,
        ciudad TEXT,
        estado TEXT,
        codigo_postal TEXT,
        contacto_principal TEXT,
        telefono_contacto TEXT,
        email_contacto TEXT,
        condiciones_pago TEXT,
        dias_credito INTEGER DEFAULT 0,
        activo INTEGER DEFAULT 1,
        fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
        fecha_actualizacion DATETIME DEFAULT CURRENT_TIMESTAMP
    )
`);

// Crear tabla de relación proveedor-suministros
db.run(`
    CREATE TABLE IF NOT EXISTS supplier_supplies (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        proveedor_id INTEGER NOT NULL,
        suministro_id INTEGER NOT NULL,
        precio_proveedor REAL,
        tiempo_entrega_dias INTEGER,
        cantidad_minima INTEGER DEFAULT 1,
        activo INTEGER DEFAULT 1,
        fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (proveedor_id) REFERENCES suppliers (id),
        FOREIGN KEY (suministro_id) REFERENCES supplies (id),
        UNIQUE(proveedor_id, suministro_id)
    )
`);

module.exports = {
    getAll: (callback) => {
        db.all("SELECT * FROM suppliers WHERE activo = 1 ORDER BY nombre", callback);
    },

    getById: (id, callback) => {
        db.get("SELECT * FROM suppliers WHERE id = ? AND activo = 1", [id], callback);
    },

    create: (supplierData, callback) => {
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
        } = supplierData;
        
        db.run(
            `INSERT INTO suppliers 
            (nombre, razon_social, rfc, telefono, email, direccion, ciudad, estado, codigo_postal,
             contacto_principal, telefono_contacto, email_contacto, condiciones_pago, dias_credito) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [nombre, razon_social, rfc, telefono, email, direccion, ciudad, estado, codigo_postal,
             contacto_principal, telefono_contacto, email_contacto, condiciones_pago, dias_credito],
            function(err) {
                callback(err, this ? this.lastID : null);
            }
        );
    },

    update: (id, supplierData, callback) => {
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
        } = supplierData;
        
        db.run(
            `UPDATE suppliers SET 
            nombre = ?, razon_social = ?, rfc = ?, telefono = ?, email = ?, direccion = ?, 
            ciudad = ?, estado = ?, codigo_postal = ?, contacto_principal = ?, telefono_contacto = ?, 
            email_contacto = ?, condiciones_pago = ?, dias_credito = ?, fecha_actualizacion = CURRENT_TIMESTAMP 
            WHERE id = ?`,
            [nombre, razon_social, rfc, telefono, email, direccion, ciudad, estado, codigo_postal,
             contacto_principal, telefono_contacto, email_contacto, condiciones_pago, dias_credito, id],
            callback
        );
    },

    delete: (id, callback) => {
        db.run("UPDATE suppliers SET activo = 0, fecha_actualizacion = CURRENT_TIMESTAMP WHERE id = ?", [id], callback);
    },

    search: (searchTerm, callback) => {
        const term = `%${searchTerm}%`;
        db.all(
            `SELECT * FROM suppliers 
            WHERE (nombre LIKE ? OR razon_social LIKE ? OR rfc LIKE ? OR email LIKE ?) 
            AND activo = 1 ORDER BY nombre`,
            [term, term, term, term],
            callback
        );
    },

    getSupplies: (supplierId, callback) => {
        db.all(`
            SELECT ss.*, s.nombre, s.descripcion, s.unidad_medida
            FROM supplier_supplies ss
            JOIN supplies s ON ss.suministro_id = s.id
            WHERE ss.proveedor_id = ? AND ss.activo = 1 AND s.activo = 1
            ORDER BY s.nombre
        `, [supplierId], callback);
    },

    addSupply: (supplierSupplyData, callback) => {
        const { proveedor_id, suministro_id, precio_proveedor, tiempo_entrega_dias, cantidad_minima } = supplierSupplyData;
        
        db.run(
            `INSERT OR REPLACE INTO supplier_supplies 
            (proveedor_id, suministro_id, precio_proveedor, tiempo_entrega_dias, cantidad_minima) 
            VALUES (?, ?, ?, ?, ?)`,
            [proveedor_id, suministro_id, precio_proveedor, tiempo_entrega_dias, cantidad_minima],
            function(err) {
                callback(err, this ? this.lastID : null);
            }
        );
    },

    removeSupply: (supplierId, supplyId, callback) => {
        db.run(
            "UPDATE supplier_supplies SET activo = 0 WHERE proveedor_id = ? AND suministro_id = ?",
            [supplierId, supplyId],
            callback
        );
    },

    getBestPriceForSupply: (supplyId, callback) => {
        db.all(`
            SELECT ss.*, sup.nombre as proveedor_nombre, sup.telefono, sup.email
            FROM supplier_supplies ss
            JOIN suppliers sup ON ss.proveedor_id = sup.id
            WHERE ss.suministro_id = ? AND ss.activo = 1 AND sup.activo = 1
            ORDER BY ss.precio_proveedor ASC
        `, [supplyId], callback);
    }
};
