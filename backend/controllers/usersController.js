const userModel = require('../models/user');
const jwt = require('jsonwebtoken');
const config = require('../config/config');

exports.login = (req, res, next) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({
                error: 'Datos incompletos',
                message: 'Username y password son requeridos'
            });
        }

        userModel.getByUsername(username, (err, user) => {
            if (err) return next(err);
            
            if (!user) {
                return res.status(401).json({
                    error: 'Credenciales inválidas',
                    message: 'Usuario no encontrado'
                });
            }

            if (!user.activo) {
                return res.status(401).json({
                    error: 'Usuario inactivo',
                    message: 'El usuario está desactivado'
                });
            }

            userModel.validatePassword(password, user.password, (err, isValid) => {
                if (err) return next(err);
                
                if (!isValid) {
                    return res.status(401).json({
                        error: 'Credenciales inválidas',
                        message: 'Contraseña incorrecta'
                    });
                }

                const token = jwt.sign(
                    { 
                        id: user.id, 
                        username: user.username, 
                        role: user.role,
                        nombre: user.nombre,
                        apellido: user.apellido
                    },
                    config.jwtSecret,
                    { expiresIn: '8h' }
                );

                res.json({
                    message: 'Login exitoso',
                    token,
                    user: {
                        id: user.id,
                        username: user.username,
                        email: user.email,
                        role: user.role,
                        nombre: user.nombre,
                        apellido: user.apellido
                    }
                });
            });
        });
    } catch (error) {
        next(error);
    }
};

exports.register = (req, res, next) => {
    try {
        const { username, email, password, role, nombre, apellido, telefono } = req.body;

        if (!username || !email || !password || !nombre || !apellido) {
            return res.status(400).json({
                error: 'Datos incompletos',
                message: 'Todos los campos obligatorios deben ser completados'
            });
        }

        // Verificar si el usuario ya existe
        userModel.getByUsername(username, (err, existingUser) => {
            if (err) return next(err);
            
            if (existingUser) {
                return res.status(409).json({
                    error: 'Usuario existente',
                    message: 'El nombre de usuario ya está en uso'
                });
            }

            // Verificar si el email ya existe
            userModel.getByEmail(email, (err, existingEmail) => {
                if (err) return next(err);
                
                if (existingEmail) {
                    return res.status(409).json({
                        error: 'Email existente',
                        message: 'El email ya está registrado'
                    });
                }

                const userData = {
                    username,
                    email,
                    password,
                    role: role || 'empleado',
                    nombre,
                    apellido,
                    telefono
                };

                userModel.create(userData, (err, userId) => {
                    if (err) return next(err);
                    
                    res.status(201).json({
                        message: 'Usuario creado exitosamente',
                        userId
                    });
                });
            });
        });
    } catch (error) {
        next(error);
    }
};

exports.getAllUsers = (req, res, next) => {
    try {
        userModel.getAll((err, users) => {
            if (err) return next(err);
            res.json(users);
        });
    } catch (error) {
        next(error);
    }
};

exports.getUserById = (req, res, next) => {
    try {
        const { id } = req.params;
        
        userModel.getById(id, (err, user) => {
            if (err) return next(err);
            
            if (!user) {
                return res.status(404).json({
                    error: 'Usuario no encontrado',
                    message: 'El usuario solicitado no existe'
                });
            }
            
            res.json(user);
        });
    } catch (error) {
        next(error);
    }
};

exports.updateUser = (req, res, next) => {
    try {
        const { id } = req.params;
        const { username, email, role, nombre, apellido, telefono, activo } = req.body;

        if (!username || !email || !nombre || !apellido) {
            return res.status(400).json({
                error: 'Datos incompletos',
                message: 'Todos los campos obligatorios deben ser completados'
            });
        }

        const userData = {
            username,
            email,
            role,
            nombre,
            apellido,
            telefono,
            activo: activo !== undefined ? activo : 1
        };

        userModel.update(id, userData, (err) => {
            if (err) return next(err);
            
            res.json({
                message: 'Usuario actualizado exitosamente'
            });
        });
    } catch (error) {
        next(error);
    }
};

exports.updatePassword = (req, res, next) => {
    try {
        const { id } = req.params;
        const { newPassword } = req.body;

        if (!newPassword) {
            return res.status(400).json({
                error: 'Datos incompletos',
                message: 'La nueva contraseña es requerida'
            });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({
                error: 'Contraseña inválida',
                message: 'La contraseña debe tener al menos 6 caracteres'
            });
        }

        userModel.updatePassword(id, newPassword, (err) => {
            if (err) return next(err);
            
            res.json({
                message: 'Contraseña actualizada exitosamente'
            });
        });
    } catch (error) {
        next(error);
    }
};

exports.deleteUser = (req, res, next) => {
    try {
        const { id } = req.params;

        // No permitir eliminar al usuario actual
        if (req.user && req.user.id == id) {
            return res.status(400).json({
                error: 'Operación no permitida',
                message: 'No puedes eliminar tu propio usuario'
            });
        }

        userModel.delete(id, (err) => {
            if (err) return next(err);
            
            res.json({
                message: 'Usuario eliminado exitosamente'
            });
        });
    } catch (error) {
        next(error);
    }
};

exports.getProfile = (req, res, next) => {
    try {
        const userId = req.user.id;
        
        userModel.getById(userId, (err, user) => {
            if (err) return next(err);
            
            if (!user) {
                return res.status(404).json({
                    error: 'Usuario no encontrado',
                    message: 'El perfil del usuario no existe'
                });
            }
            
            res.json(user);
        });
    } catch (error) {
        next(error);
    }
};

exports.updateProfile = (req, res, next) => {
    try {
        const userId = req.user.id;
        const { username, email, nombre, apellido, telefono } = req.body;

        if (!username || !email || !nombre || !apellido) {
            return res.status(400).json({
                error: 'Datos incompletos',
                message: 'Todos los campos obligatorios deben ser completados'
            });
        }

        const userData = {
            username,
            email,
            nombre,
            apellido,
            telefono,
            role: req.user.role, // Mantener el rol actual
            activo: 1 // Mantener activo
        };

        userModel.update(userId, userData, (err) => {
            if (err) return next(err);
            
            res.json({
                message: 'Perfil actualizado exitosamente'
            });
        });
    } catch (error) {
        next(error);
    }
};
