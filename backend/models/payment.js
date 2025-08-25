const sqlite3 = require('sqlite3').verbose();
const config = require('../config/config');

let db = new sqlite3.Database(config.dbPath);

// Crear la tabla de pagos si no existe
db.run(`
    CREATE TABLE IF NOT EXISTS payments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        tipo_pago TEXT NOT NULL CHECK(tipo_pago IN ('ingreso', 'egreso')),
        concepto TEXT NOT NULL,
        descripcion TEXT,
        monto REAL NOT NULL,
        metodo_pago TEXT CHECK(metodo_pago IN ('efectivo', 'tarjeta', 'transferencia', 'cheque', 'otro')),
        referencia TEXT,
        proveedor_id INTEGER,
        cliente_nombre TEXT,
        cliente_email TEXT,
        estado TEXT DEFAULT 'completado' CHECK(estado IN ('pendiente', 'completado', 'cancelado', 'reembolsado')),
        fecha_pago DATETIME DEFAULT CURRENT_TIMESTAMP,
        fecha_vencimiento DATETIME,
        usuario_id INTEGER,
        notas TEXT,
        external_payment_id TEXT,
        external_provider TEXT,
        external_status TEXT,
        external_response TEXT,
        FOREIGN KEY (proveedor_id) REFERENCES suppliers (id),
        FOREIGN KEY (usuario_id) REFERENCES users (id)
    )
`);

// Crear tabla de categorías de pagos
db.run(`
    CREATE TABLE IF NOT EXISTS payment_categories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nombre TEXT NOT NULL UNIQUE,
        tipo TEXT NOT NULL CHECK(tipo IN ('ingreso', 'egreso')),
        descripcion TEXT,
        activo INTEGER DEFAULT 1
    )
`);

// Insertar categorías por defecto después de crear la tabla
setTimeout(() => {
    db.run(`INSERT OR IGNORE INTO payment_categories (nombre, tipo, descripcion) VALUES 
        ('Ventas', 'ingreso', 'Ingresos por ventas de productos'),
        ('Servicios', 'ingreso', 'Ingresos por servicios prestados'),
        ('Compra de Suministros', 'egreso', 'Pagos a proveedores por suministros'),
        ('Gastos Operativos', 'egreso', 'Gastos generales del negocio'),
        ('Salarios', 'egreso', 'Pagos de nómina'),
        ('Servicios Públicos', 'egreso', 'Luz, agua, internet, etc.')
    `);
}, 100);

module.exports = {
    getAll: (callback) => {
        db.all(`
            SELECT p.*, pc.nombre as categoria_nombre, u.username, s.nombre as proveedor_nombre
            FROM payments p
            LEFT JOIN payment_categories pc ON p.concepto = pc.nombre
            LEFT JOIN users u ON p.usuario_id = u.id
            LEFT JOIN suppliers s ON p.proveedor_id = s.id
            ORDER BY p.fecha_pago DESC
        `, callback);
    },

    getById: (id, callback) => {
        db.get(`
            SELECT p.*, pc.nombre as categoria_nombre, u.username, s.nombre as proveedor_nombre
            FROM payments p
            LEFT JOIN payment_categories pc ON p.concepto = pc.nombre
            LEFT JOIN users u ON p.usuario_id = u.id
            LEFT JOIN suppliers s ON p.proveedor_id = s.id
            WHERE p.id = ?
        `, [id], callback);
    },

    getByDateRange: (fechaInicio, fechaFin, callback) => {
        db.all(`
            SELECT p.*, pc.nombre as categoria_nombre, u.username, s.nombre as proveedor_nombre
            FROM payments p
            LEFT JOIN payment_categories pc ON p.concepto = pc.nombre
            LEFT JOIN users u ON p.usuario_id = u.id
            LEFT JOIN suppliers s ON p.proveedor_id = s.id
            WHERE DATE(p.fecha_pago) BETWEEN ? AND ?
            ORDER BY p.fecha_pago DESC
        `, [fechaInicio, fechaFin], callback);
    },

    create: (paymentData, callback) => {
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
            estado = 'completado',
            fecha_vencimiento,
            usuario_id,
            notas
        } = paymentData;
        
        db.run(
            `INSERT INTO payments 
            (tipo_pago, concepto, descripcion, monto, metodo_pago, referencia, proveedor_id, 
             cliente_nombre, cliente_email, estado, fecha_vencimiento, usuario_id, notas) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [tipo_pago, concepto, descripcion, monto, metodo_pago, referencia, proveedor_id, 
             cliente_nombre, cliente_email, estado, fecha_vencimiento, usuario_id, notas],
            function(err) {
                callback(err, this ? this.lastID : null);
            }
        );
    },

    update: (id, paymentData, callback) => {
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
        } = paymentData;
        
        db.run(
            `UPDATE payments SET 
            tipo_pago = ?, concepto = ?, descripcion = ?, monto = ?, metodo_pago = ?, 
            referencia = ?, proveedor_id = ?, cliente_nombre = ?, cliente_email = ?, 
            estado = ?, fecha_vencimiento = ?, notas = ?
            WHERE id = ?`,
            [tipo_pago, concepto, descripcion, monto, metodo_pago, referencia, proveedor_id, 
             cliente_nombre, cliente_email, estado, fecha_vencimiento, notas, id],
            callback
        );
    },

    delete: (id, callback) => {
        db.run("DELETE FROM payments WHERE id = ?", [id], callback);
    },

    getByType: (tipo, callback) => {
        db.all(`
            SELECT p.*, pc.nombre as categoria_nombre, u.username, s.nombre as proveedor_nombre
            FROM payments p
            LEFT JOIN payment_categories pc ON p.concepto = pc.nombre
            LEFT JOIN users u ON p.usuario_id = u.id
            LEFT JOIN suppliers s ON p.proveedor_id = s.id
            WHERE p.tipo_pago = ?
            ORDER BY p.fecha_pago DESC
        `, [tipo], callback);
    },

    getCategories: (callback) => {
        db.all("SELECT * FROM payment_categories WHERE activo = 1 ORDER BY tipo, nombre", callback);
    },

    // TODO: Métodos para futuras integraciones de pago
    // processExternalPayment: (paymentData, provider, callback) => {
    //     // Integración con Stripe, PayPal, etc.
    // },
    
    // updateExternalStatus: (paymentId, externalData, callback) => {
    //     // Actualizar estado desde webhook de proveedor externo
    // }
};
