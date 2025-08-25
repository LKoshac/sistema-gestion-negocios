const nodemailer = require('nodemailer');
const db = require('../config/config').db;

// Configuración de email (simulada - en producción usar variables de entorno)
const emailConfig = {
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
        user: process.env.EMAIL_USER || 'tu-email@gmail.com',
        pass: process.env.EMAIL_PASS || 'tu-password-app'
    }
};

// Crear transporter de nodemailer
const transporter = nodemailer.createTransporter(emailConfig);

class EmailController {
    // Configurar email mensual
    static configureMonthlyEmail(req, res) {
        try {
            const { email_recipient, email_day, email_enabled } = req.body;
            
            // Validar datos
            if (!email_recipient || !email_day) {
                return res.status(400).json({ 
                    error: 'Email destinatario y día son requeridos' 
                });
            }

            // Guardar configuración en base de datos
            db.run(`
                INSERT OR REPLACE INTO email_config 
                (id, recipient, send_day, enabled, created_by, updated_at) 
                VALUES (1, ?, ?, ?, ?, CURRENT_TIMESTAMP)
            `, [email_recipient, email_day, email_enabled ? 1 : 0, req.user.id], function(err) {
                if (err) {
                    console.error('Error guardando configuración de email:', err);
                    return res.status(500).json({ error: 'Error guardando configuración' });
                }

                res.json({
                    message: 'Configuración de email guardada exitosamente',
                    config: {
                        recipient: email_recipient,
                        send_day: email_day,
                        enabled: email_enabled
                    }
                });
            });

        } catch (error) {
            console.error('Error en configureMonthlyEmail:', error);
            res.status(500).json({ error: 'Error interno del servidor' });
        }
    }

    // Obtener configuración de email
    static getEmailConfig(req, res) {
        try {
            db.get(`
                SELECT recipient, send_day, enabled, updated_at 
                FROM email_config 
                WHERE id = 1
            `, (err, row) => {
                if (err) {
                    console.error('Error obteniendo configuración:', err);
                    return res.status(500).json({ error: 'Error obteniendo configuración' });
                }

                if (!row) {
                    return res.json({
                        recipient: '',
                        send_day: '1',
                        enabled: false
                    });
                }

                res.json({
                    recipient: row.recipient,
                    send_day: row.send_day,
                    enabled: row.enabled === 1,
                    last_updated: row.updated_at
                });
            });

        } catch (error) {
            console.error('Error en getEmailConfig:', error);
            res.status(500).json({ error: 'Error interno del servidor' });
        }
    }

    // Generar reporte mensual
    static async generateMonthlyReport() {
        return new Promise((resolve, reject) => {
            const currentDate = new Date();
            const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
            const lastDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
            
            const startDate = firstDay.toISOString().split('T')[0];
            const endDate = lastDay.toISOString().split('T')[0];

            // Obtener datos del mes
            const queries = {
                sales: `
                    SELECT COUNT(*) as total_sales, SUM(total) as total_amount
                    FROM sales 
                    WHERE DATE(fecha_venta) BETWEEN ? AND ?
                `,
                payments: `
                    SELECT 
                        tipo_pago,
                        COUNT(*) as count,
                        SUM(monto) as total
                    FROM payments 
                    WHERE DATE(fecha_pago) BETWEEN ? AND ?
                    GROUP BY tipo_pago
                `,
                lowStock: `
                    SELECT s.nombre, st.cantidad_actual, s.stock_minimo
                    FROM supplies s
                    JOIN stock st ON s.id = st.suministro_id
                    WHERE st.cantidad_actual <= s.stock_minimo
                `,
                topProducts: `
                    SELECT s.nombre, COUNT(*) as sales_count
                    FROM sales_items si
                    JOIN supplies s ON si.suministro_id = s.id
                    JOIN sales sa ON si.venta_id = sa.id
                    WHERE DATE(sa.fecha_venta) BETWEEN ? AND ?
                    GROUP BY s.id, s.nombre
                    ORDER BY sales_count DESC
                    LIMIT 5
                `
            };

            const reportData = {};

            // Ejecutar consultas
            db.get(queries.sales, [startDate, endDate], (err, salesData) => {
                if (err) return reject(err);
                reportData.sales = salesData;

                db.all(queries.payments, [startDate, endDate], (err, paymentsData) => {
                    if (err) return reject(err);
                    reportData.payments = paymentsData;

                    db.all(queries.lowStock, (err, lowStockData) => {
                        if (err) return reject(err);
                        reportData.lowStock = lowStockData;

                        db.all(queries.topProducts, [startDate, endDate], (err, topProductsData) => {
                            if (err) return reject(err);
                            reportData.topProducts = topProductsData;

                            resolve({
                                period: `${firstDay.toLocaleDateString('es-ES')} - ${lastDay.toLocaleDateString('es-ES')}`,
                                ...reportData
                            });
                        });
                    });
                });
            });
        });
    }

    // Enviar email de prueba
    static async sendTestEmail(req, res) {
        try {
            const { recipient } = req.body;
            
            if (!recipient) {
                return res.status(400).json({ error: 'Email destinatario requerido' });
            }

            // Generar reporte
            const reportData = await EmailController.generateMonthlyReport();
            
            // Crear HTML del email
            const emailHTML = EmailController.createEmailHTML(reportData, true);

            // Configurar email
            const mailOptions = {
                from: emailConfig.auth.user,
                to: recipient,
                subject: '📊 Email de Prueba - Reporte Mensual',
                html: emailHTML
            };

            // Enviar email (simulado en desarrollo)
            if (process.env.NODE_ENV === 'production') {
                await transporter.sendMail(mailOptions);
            }

            res.json({
                message: 'Email de prueba enviado exitosamente',
                recipient: recipient,
                preview: emailHTML
            });

        } catch (error) {
            console.error('Error enviando email de prueba:', error);
            res.status(500).json({ error: 'Error enviando email de prueba' });
        }
    }

    // Crear HTML del email
    static createEmailHTML(reportData, isTest = false) {
        const testBadge = isTest ? '<span style="background: #f59e0b; color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px;">PRUEBA</span>' : '';
        
        return `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <title>Reporte Mensual</title>
            <style>
                body { font-family: 'Inter', Arial, sans-serif; background: #f8fafc; margin: 0; padding: 20px; }
                .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
                .header { background: linear-gradient(135deg, #3b82f6, #2563eb); color: white; padding: 30px; text-align: center; }
                .content { padding: 30px; }
                .metric-card { background: #f8fafc; border-radius: 8px; padding: 20px; margin: 15px 0; border-left: 4px solid #3b82f6; }
                .metric-value { font-size: 24px; font-weight: bold; color: #1e293b; }
                .metric-label { color: #64748b; font-size: 14px; }
                .table { width: 100%; border-collapse: collapse; margin: 15px 0; }
                .table th, .table td { padding: 12px; text-align: left; border-bottom: 1px solid #e2e8f0; }
                .table th { background: #f1f5f9; font-weight: 600; }
                .footer { background: #1e293b; color: white; padding: 20px; text-align: center; font-size: 14px; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>📊 Reporte Mensual ${testBadge}</h1>
                    <p>Período: ${reportData.period}</p>
                </div>
                
                <div class="content">
                    <h2>📈 Resumen de Ventas</h2>
                    <div class="metric-card">
                        <div class="metric-value">${reportData.sales?.total_sales || 0}</div>
                        <div class="metric-label">Total de Ventas</div>
                    </div>
                    <div class="metric-card">
                        <div class="metric-value">$${(reportData.sales?.total_amount || 0).toFixed(2)}</div>
                        <div class="metric-label">Ingresos Totales</div>
                    </div>

                    <h2>💰 Resumen de Pagos</h2>
                    <table class="table">
                        <thead>
                            <tr>
                                <th>Tipo</th>
                                <th>Cantidad</th>
                                <th>Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${reportData.payments?.map(p => `
                                <tr>
                                    <td>${p.tipo_pago === 'ingreso' ? '📈 Ingresos' : '📉 Egresos'}</td>
                                    <td>${p.count}</td>
                                    <td>$${p.total.toFixed(2)}</td>
                                </tr>
                            `).join('') || '<tr><td colspan="3">No hay datos</td></tr>'}
                        </tbody>
                    </table>

                    <h2>⚠️ Productos con Stock Bajo</h2>
                    <table class="table">
                        <thead>
                            <tr>
                                <th>Producto</th>
                                <th>Stock Actual</th>
                                <th>Stock Mínimo</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${reportData.lowStock?.map(item => `
                                <tr>
                                    <td>${item.nombre}</td>
                                    <td>${item.cantidad_actual}</td>
                                    <td>${item.stock_minimo}</td>
                                </tr>
                            `).join('') || '<tr><td colspan="3">Todos los productos tienen stock suficiente</td></tr>'}
                        </tbody>
                    </table>

                    <h2>🏆 Productos Más Vendidos</h2>
                    <table class="table">
                        <thead>
                            <tr>
                                <th>Producto</th>
                                <th>Ventas</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${reportData.topProducts?.map(item => `
                                <tr>
                                    <td>${item.nombre}</td>
                                    <td>${item.sales_count}</td>
                                </tr>
                            `).join('') || '<tr><td colspan="2">No hay datos de ventas</td></tr>'}
                        </tbody>
                    </table>
                </div>

                <div class="footer">
                    <p>📧 Reporte generado automáticamente por el Sistema de Gestión de Negocios</p>
                    <p>Fecha de generación: ${new Date().toLocaleDateString('es-ES')}</p>
                </div>
            </div>
        </body>
        </html>
        `;
    }

    // Enviar reporte mensual automático
    static async sendMonthlyReport() {
        try {
            // Obtener configuración
            const config = await new Promise((resolve, reject) => {
                db.get('SELECT * FROM email_config WHERE id = 1 AND enabled = 1', (err, row) => {
                    if (err) reject(err);
                    else resolve(row);
                });
            });

            if (!config) {
                console.log('Email mensual no configurado o deshabilitado');
                return;
            }

            // Verificar si es el día correcto
            const today = new Date().getDate();
            const sendDay = parseInt(config.send_day);
            
            if (today !== sendDay && !(sendDay === 30 && today === new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate())) {
                return;
            }

            // Generar y enviar reporte
            const reportData = await EmailController.generateMonthlyReport();
            const emailHTML = EmailController.createEmailHTML(reportData);

            const mailOptions = {
                from: emailConfig.auth.user,
                to: config.recipient,
                subject: `📊 Reporte Mensual - ${reportData.period}`,
                html: emailHTML
            };

            if (process.env.NODE_ENV === 'production') {
                await transporter.sendMail(mailOptions);
            }

            console.log(`Reporte mensual enviado a ${config.recipient}`);

        } catch (error) {
            console.error('Error enviando reporte mensual:', error);
        }
    }
}

module.exports = EmailController;
