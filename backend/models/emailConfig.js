const db = require('../config/config').db;

// Crear tabla de configuración de email
db.run(`
    CREATE TABLE IF NOT EXISTS email_config (
        id INTEGER PRIMARY KEY,
        recipient TEXT NOT NULL,
        send_day INTEGER NOT NULL DEFAULT 1,
        enabled INTEGER DEFAULT 0,
        created_by INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (created_by) REFERENCES users (id)
    )
`);

// Crear tabla para log de emails enviados
db.run(`
    CREATE TABLE IF NOT EXISTS email_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        recipient TEXT NOT NULL,
        subject TEXT NOT NULL,
        status TEXT DEFAULT 'sent',
        error_message TEXT,
        sent_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        report_period TEXT
    )
`);

console.log('📧 Tablas de configuración de email creadas');

module.exports = db;
