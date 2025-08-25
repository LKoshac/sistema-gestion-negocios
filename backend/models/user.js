const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const config = require('../config/config');

let db = new sqlite3.Database(config.dbPath);

// Crear la tabla de usuarios si no existe
db.run(`
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role TEXT DEFAULT 'empleado' CHECK(role IN ('admin', 'empleado')),
        nombre TEXT NOT NULL,
        apellido TEXT NOT NULL,
        telefono TEXT,
        activo INTEGER DEFAULT 1,
        fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
        fecha_actualizacion DATETIME DEFAULT CURRENT_TIMESTAMP
    )
`);

// Crear usuario admin por defecto si no existe
db.get("SELECT COUNT(*) as count FROM users WHERE role = 'admin'", (err, row) => {
    if (!err && row.count === 0) {
        const defaultAdmin = {
            username: 'admin',
            email: 'admin@negocio.com',
            password: 'admin123',
            role: 'admin',
            nombre: 'Administrador',
            apellido: 'Sistema'
        };
        
        bcrypt.hash(defaultAdmin.password, 10, (err, hashedPassword) => {
            if (!err) {
                db.run(
                    "INSERT INTO users (username, email, password, role, nombre, apellido) VALUES (?, ?, ?, ?, ?, ?)",
                    [defaultAdmin.username, defaultAdmin.email, hashedPassword, defaultAdmin.role, defaultAdmin.nombre, defaultAdmin.apellido]
                );
            }
        });
    }
});

module.exports = {
    getAll: (callback) => {
        db.all("SELECT id, username, email, role, nombre, apellido, telefono, activo, fecha_creacion FROM users", callback);
    },

    getById: (id, callback) => {
        db.get("SELECT id, username, email, role, nombre, apellido, telefono, activo, fecha_creacion FROM users WHERE id = ?", [id], callback);
    },

    getByUsername: (username, callback) => {
        db.get("SELECT * FROM users WHERE username = ?", [username], callback);
    },

    getByEmail: (email, callback) => {
        db.get("SELECT * FROM users WHERE email = ?", [email], callback);
    },

    create: (userData, callback) => {
        const { username, email, password, role = 'empleado', nombre, apellido, telefono } = userData;
        
        bcrypt.hash(password, 10, (err, hashedPassword) => {
            if (err) return callback(err);
            
            db.run(
                "INSERT INTO users (username, email, password, role, nombre, apellido, telefono) VALUES (?, ?, ?, ?, ?, ?, ?)",
                [username, email, hashedPassword, role, nombre, apellido, telefono],
                function(err) {
                    callback(err, this ? this.lastID : null);
                }
            );
        });
    },

    update: (id, userData, callback) => {
        const { username, email, role, nombre, apellido, telefono, activo } = userData;
        
        db.run(
            "UPDATE users SET username = ?, email = ?, role = ?, nombre = ?, apellido = ?, telefono = ?, activo = ?, fecha_actualizacion = CURRENT_TIMESTAMP WHERE id = ?",
            [username, email, role, nombre, apellido, telefono, activo, id],
            callback
        );
    },

    updatePassword: (id, newPassword, callback) => {
        bcrypt.hash(newPassword, 10, (err, hashedPassword) => {
            if (err) return callback(err);
            
            db.run(
                "UPDATE users SET password = ?, fecha_actualizacion = CURRENT_TIMESTAMP WHERE id = ?",
                [hashedPassword, id],
                callback
            );
        });
    },

    delete: (id, callback) => {
        db.run("DELETE FROM users WHERE id = ?", [id], callback);
    },

    validatePassword: (plainPassword, hashedPassword, callback) => {
        bcrypt.compare(plainPassword, hashedPassword, callback);
    }
};
