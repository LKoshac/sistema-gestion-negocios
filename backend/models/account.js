const sqlite3 = require('sqlite3').verbose();
const config = require('../config/config');

let db = new sqlite3.Database(config.dbPath);

// Crear la tabla de cuentas contables si no existe
db.run(`
    CREATE TABLE IF NOT EXISTS accounts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        codigo TEXT UNIQUE NOT NULL,
        nombre TEXT NOT NULL,
        tipo_cuenta TEXT NOT NULL CHECK(tipo_cuenta IN ('activo', 'pasivo', 'capital', 'ingreso', 'egreso')),
        subtipo TEXT,
        descripcion TEXT,
        saldo_inicial REAL DEFAULT 0,
        saldo_actual REAL DEFAULT 0,
        cuenta_padre_id INTEGER,
        nivel INTEGER DEFAULT 1,
        activo INTEGER DEFAULT 1,
        fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
        fecha_actualizacion DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (cuenta_padre_id) REFERENCES accounts (id)
    )
`);

// Crear tabla de movimientos contables
db.run(`
    CREATE TABLE IF NOT EXISTS account_movements (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        cuenta_id INTEGER NOT NULL,
        tipo_movimiento TEXT NOT NULL CHECK(tipo_movimiento IN ('debe', 'haber')),
        monto REAL NOT NULL,
        concepto TEXT NOT NULL,
        referencia TEXT,
        documento TEXT,
        fecha_movimiento DATETIME DEFAULT CURRENT_TIMESTAMP,
        usuario_id INTEGER,
        asiento_id INTEGER,
        FOREIGN KEY (cuenta_id) REFERENCES accounts (id),
        FOREIGN KEY (usuario_id) REFERENCES users (id)
    )
`);

// Crear tabla de asientos contables
db.run(`
    CREATE TABLE IF NOT EXISTS accounting_entries (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        numero_asiento TEXT UNIQUE NOT NULL,
        fecha_asiento DATETIME DEFAULT CURRENT_TIMESTAMP,
        concepto TEXT NOT NULL,
        total_debe REAL DEFAULT 0,
        total_haber REAL DEFAULT 0,
        estado TEXT DEFAULT 'borrador' CHECK(estado IN ('borrador', 'confirmado', 'cancelado')),
        usuario_id INTEGER,
        fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (usuario_id) REFERENCES users (id)
    )
`);

// Insertar cuentas básicas por defecto después de crear las tablas
setTimeout(() => {
    db.run(`INSERT OR IGNORE INTO accounts (codigo, nombre, tipo_cuenta, subtipo, descripcion) VALUES 
        ('1000', 'ACTIVOS', 'activo', 'grupo', 'Grupo principal de activos'),
        ('1100', 'Activo Circulante', 'activo', 'subgrupo', 'Activos de corto plazo'),
        ('1101', 'Caja', 'activo', 'detalle', 'Dinero en efectivo'),
        ('1102', 'Bancos', 'activo', 'detalle', 'Cuentas bancarias'),
        ('1103', 'Inventarios', 'activo', 'detalle', 'Mercancías y suministros'),
        ('1104', 'Cuentas por Cobrar', 'activo', 'detalle', 'Dinero que nos deben'),
        ('2000', 'PASIVOS', 'pasivo', 'grupo', 'Grupo principal de pasivos'),
        ('2100', 'Pasivo Circulante', 'pasivo', 'subgrupo', 'Pasivos de corto plazo'),
        ('2101', 'Cuentas por Pagar', 'pasivo', 'detalle', 'Dinero que debemos'),
        ('2102', 'Proveedores', 'pasivo', 'detalle', 'Deudas con proveedores'),
        ('3000', 'CAPITAL', 'capital', 'grupo', 'Capital del negocio'),
        ('3101', 'Capital Social', 'capital', 'detalle', 'Aportación inicial'),
        ('4000', 'INGRESOS', 'ingreso', 'grupo', 'Ingresos del negocio'),
        ('4101', 'Ventas', 'ingreso', 'detalle', 'Ingresos por ventas'),
        ('4102', 'Servicios', 'ingreso', 'detalle', 'Ingresos por servicios'),
        ('5000', 'EGRESOS', 'egreso', 'grupo', 'Gastos del negocio'),
        ('5101', 'Compras', 'egreso', 'detalle', 'Compra de mercancías'),
        ('5102', 'Gastos Operativos', 'egreso', 'detalle', 'Gastos de operación'),
        ('5103', 'Salarios', 'egreso', 'detalle', 'Pagos de nómina')
    `);
}, 150);

module.exports = {
    getAll: (callback) => {
        db.all(`
            SELECT a.*, ap.nombre as cuenta_padre_nombre
            FROM accounts a
            LEFT JOIN accounts ap ON a.cuenta_padre_id = ap.id
            WHERE a.activo = 1
            ORDER BY a.codigo
        `, callback);
    },

    getById: (id, callback) => {
        db.get(`
            SELECT a.*, ap.nombre as cuenta_padre_nombre
            FROM accounts a
            LEFT JOIN accounts ap ON a.cuenta_padre_id = ap.id
            WHERE a.id = ? AND a.activo = 1
        `, [id], callback);
    },

    getByType: (tipo, callback) => {
        db.all(`
            SELECT a.*, ap.nombre as cuenta_padre_nombre
            FROM accounts a
            LEFT JOIN accounts ap ON a.cuenta_padre_id = ap.id
            WHERE a.tipo_cuenta = ? AND a.activo = 1
            ORDER BY a.codigo
        `, [tipo], callback);
    },

    create: (accountData, callback) => {
        const { 
            codigo, 
            nombre, 
            tipo_cuenta, 
            subtipo, 
            descripcion, 
            saldo_inicial = 0, 
            cuenta_padre_id, 
            nivel = 1 
        } = accountData;
        
        db.run(
            `INSERT INTO accounts 
            (codigo, nombre, tipo_cuenta, subtipo, descripcion, saldo_inicial, saldo_actual, cuenta_padre_id, nivel) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [codigo, nombre, tipo_cuenta, subtipo, descripcion, saldo_inicial, saldo_inicial, cuenta_padre_id, nivel],
            function(err) {
                callback(err, this ? this.lastID : null);
            }
        );
    },

    update: (id, accountData, callback) => {
        const { 
            codigo, 
            nombre, 
            tipo_cuenta, 
            subtipo, 
            descripcion, 
            cuenta_padre_id, 
            nivel 
        } = accountData;
        
        db.run(
            `UPDATE accounts SET 
            codigo = ?, nombre = ?, tipo_cuenta = ?, subtipo = ?, descripcion = ?, 
            cuenta_padre_id = ?, nivel = ?, fecha_actualizacion = CURRENT_TIMESTAMP 
            WHERE id = ?`,
            [codigo, nombre, tipo_cuenta, subtipo, descripcion, cuenta_padre_id, nivel, id],
            callback
        );
    },

    delete: (id, callback) => {
        db.run("UPDATE accounts SET activo = 0, fecha_actualizacion = CURRENT_TIMESTAMP WHERE id = ?", [id], callback);
    },

    addMovement: (movementData, callback) => {
        const { 
            cuenta_id, 
            tipo_movimiento, 
            monto, 
            concepto, 
            referencia, 
            documento, 
            usuario_id, 
            asiento_id 
        } = movementData;
        
        db.run(
            `INSERT INTO account_movements 
            (cuenta_id, tipo_movimiento, monto, concepto, referencia, documento, usuario_id, asiento_id) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [cuenta_id, tipo_movimiento, monto, concepto, referencia, documento, usuario_id, asiento_id],
            function(err) {
                if (err) return callback(err);
                
                // Actualizar saldo de la cuenta
                module.exports.updateBalance(cuenta_id, callback);
            }
        );
    },

    updateBalance: (cuentaId, callback) => {
        db.all(`
            SELECT 
                SUM(CASE WHEN tipo_movimiento = 'debe' THEN monto ELSE 0 END) as total_debe,
                SUM(CASE WHEN tipo_movimiento = 'haber' THEN monto ELSE 0 END) as total_haber
            FROM account_movements 
            WHERE cuenta_id = ?
        `, [cuentaId], (err, rows) => {
            if (err) return callback(err);
            
            const totalDebe = rows[0].total_debe || 0;
            const totalHaber = rows[0].total_haber || 0;
            
            // Obtener saldo inicial y tipo de cuenta
            db.get("SELECT saldo_inicial, tipo_cuenta FROM accounts WHERE id = ?", [cuentaId], (err, account) => {
                if (err) return callback(err);
                
                let saldoActual = account.saldo_inicial;
                
                // Calcular saldo según el tipo de cuenta
                if (account.tipo_cuenta === 'activo' || account.tipo_cuenta === 'egreso') {
                    saldoActual = account.saldo_inicial + totalDebe - totalHaber;
                } else {
                    saldoActual = account.saldo_inicial + totalHaber - totalDebe;
                }
                
                db.run(
                    "UPDATE accounts SET saldo_actual = ?, fecha_actualizacion = CURRENT_TIMESTAMP WHERE id = ?",
                    [saldoActual, cuentaId],
                    callback
                );
            });
        });
    },

    getMovements: (cuentaId, callback) => {
        db.all(`
            SELECT am.*, u.username, ae.numero_asiento
            FROM account_movements am
            LEFT JOIN users u ON am.usuario_id = u.id
            LEFT JOIN accounting_entries ae ON am.asiento_id = ae.id
            WHERE am.cuenta_id = ?
            ORDER BY am.fecha_movimiento DESC
        `, [cuentaId], callback);
    },

    getBalanceSheet: (callback) => {
        db.all(`
            SELECT 
                tipo_cuenta,
                SUM(saldo_actual) as total_saldo
            FROM accounts 
            WHERE activo = 1 AND subtipo = 'detalle'
            GROUP BY tipo_cuenta
        `, callback);
    },

    getIncomeStatement: (fechaInicio, fechaFin, callback) => {
        db.all(`
            SELECT 
                a.tipo_cuenta,
                a.nombre,
                SUM(CASE WHEN am.tipo_movimiento = 'debe' THEN am.monto ELSE -am.monto END) as total
            FROM accounts a
            JOIN account_movements am ON a.id = am.cuenta_id
            WHERE a.tipo_cuenta IN ('ingreso', 'egreso') 
            AND DATE(am.fecha_movimiento) BETWEEN ? AND ?
            AND a.activo = 1
            GROUP BY a.tipo_cuenta, a.id
            ORDER BY a.tipo_cuenta, a.codigo
        `, [fechaInicio, fechaFin], callback);
    }
};
