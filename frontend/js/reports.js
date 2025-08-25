// Gestor de Reportes y Email
class ReportsManager {
    constructor() {
        this.emailConfig = {
            recipient: '',
            send_day: '1',
            enabled: false
        };
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadEmailConfig();
    }

    setupEventListeners() {
        // Configurar email mensual
        const emailForm = document.getElementById('email-config-form');
        if (emailForm) {
            emailForm.addEventListener('submit', (e) => this.saveEmailConfig(e));
        }

        // Enviar email de prueba
        const testEmailBtn = document.getElementById('test-email-btn');
        if (testEmailBtn) {
            testEmailBtn.addEventListener('click', () => this.sendTestEmail());
        }

        // Generar reportes
        const monthlyReportBtn = document.getElementById('generate-monthly-report');
        if (monthlyReportBtn) {
            monthlyReportBtn.addEventListener('click', () => this.generateMonthlyReport());
        }

        const stockReportBtn = document.getElementById('generate-stock-report');
        if (stockReportBtn) {
            stockReportBtn.addEventListener('click', () => this.generateStockReport());
        }
    }

    async loadEmailConfig() {
        try {
            const config = await api.get('/email/config');
            this.emailConfig = config;
            this.updateEmailConfigUI();
        } catch (error) {
            console.error('Error cargando configuración de email:', error);
        }
    }

    updateEmailConfigUI() {
        const recipientInput = document.getElementById('email-recipient');
        const daySelect = document.getElementById('email-day');
        const enabledCheckbox = document.getElementById('email-enabled');

        if (recipientInput) recipientInput.value = this.emailConfig.recipient || '';
        if (daySelect) daySelect.value = this.emailConfig.send_day || '1';
        if (enabledCheckbox) enabledCheckbox.checked = this.emailConfig.enabled || false;
    }

    async saveEmailConfig(e) {
        e.preventDefault();

        const formData = new FormData(e.target);
        const configData = {
            email_recipient: formData.get('email-recipient') || document.getElementById('email-recipient').value,
            email_day: formData.get('email-day') || document.getElementById('email-day').value,
            email_enabled: document.getElementById('email-enabled').checked
        };

        // Validar email
        if (!configData.email_recipient || !isValidEmail(configData.email_recipient)) {
            showNotification('Por favor ingrese un email válido', 'warning');
            return;
        }

        try {
            const submitBtn = e.target.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="bi bi-hourglass-split"></i> Guardando...';

            await api.post('/email/config', configData);
            
            this.emailConfig = { ...configData };
            showNotification('Configuración de email guardada exitosamente', 'success');

            submitBtn.disabled = false;
            submitBtn.innerHTML = originalText;

        } catch (error) {
            showNotification(error.message || 'Error guardando configuración', 'error');
            
            const submitBtn = e.target.querySelector('button[type="submit"]');
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<i class="bi bi-check-circle"></i> Guardar Configuración';
        }
    }

    async sendTestEmail() {
        const recipient = document.getElementById('email-recipient').value;
        
        if (!recipient || !isValidEmail(recipient)) {
            showNotification('Por favor configure un email válido primero', 'warning');
            return;
        }

        try {
            const testBtn = document.getElementById('test-email-btn');
            const originalText = testBtn.innerHTML;
            testBtn.disabled = true;
            testBtn.innerHTML = '<i class="bi bi-hourglass-split"></i> Enviando...';

            await api.post('/email/test', { recipient });
            
            showNotification('Email de prueba enviado exitosamente', 'success');

            testBtn.disabled = false;
            testBtn.innerHTML = originalText;

        } catch (error) {
            showNotification(error.message || 'Error enviando email de prueba', 'error');
            
            const testBtn = document.getElementById('test-email-btn');
            testBtn.disabled = false;
            testBtn.innerHTML = '<i class="bi bi-send"></i> Enviar Email de Prueba';
        }
    }

    async generateMonthlyReport() {
        try {
            const btn = document.getElementById('generate-monthly-report');
            const originalText = btn.innerHTML;
            btn.disabled = true;
            btn.innerHTML = '<i class="bi bi-hourglass-split"></i> Generando...';

            const reportData = await api.get('/email/monthly-report');
            
            // Crear y descargar reporte
            this.downloadReport(reportData.data, 'reporte-mensual');
            
            showNotification('Reporte mensual generado exitosamente', 'success');

            btn.disabled = false;
            btn.innerHTML = originalText;

        } catch (error) {
            showNotification(error.message || 'Error generando reporte', 'error');
            
            const btn = document.getElementById('generate-monthly-report');
            btn.disabled = false;
            btn.innerHTML = '<i class="bi bi-file-earmark-pdf"></i> Generar Reporte del Mes';
        }
    }

    async generateStockReport() {
        try {
            const btn = document.getElementById('generate-stock-report');
            const originalText = btn.innerHTML;
            btn.disabled = true;
            btn.innerHTML = '<i class="bi bi-hourglass-split"></i> Generando...';

            const stockData = await api.get('/stock');
            
            // Crear reporte de stock
            this.downloadStockReport(stockData);
            
            showNotification('Reporte de inventario generado exitosamente', 'success');

            btn.disabled = false;
            btn.innerHTML = originalText;

        } catch (error) {
            showNotification(error.message || 'Error generando reporte de stock', 'error');
            
            const btn = document.getElementById('generate-stock-report');
            btn.disabled = false;
            btn.innerHTML = '<i class="bi bi-file-earmark-excel"></i> Reporte de Inventario';
        }
    }

    downloadReport(data, filename) {
        // Crear contenido del reporte
        const reportContent = this.createReportContent(data);
        
        // Crear blob y descargar
        const blob = new Blob([reportContent], { type: 'text/html' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${filename}-${new Date().toISOString().split('T')[0]}.html`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    }

    downloadStockReport(stockData) {
        // Crear CSV del inventario
        let csvContent = 'Producto,Stock Actual,Stock Mínimo,Estado,Ubicación\n';
        
        stockData.forEach(item => {
            const status = (item.cantidad_actual || 0) <= (item.stock_minimo || 0) ? 'Stock Bajo' : 'Normal';
            csvContent += `"${item.nombre}",${item.cantidad_actual || 0},${item.stock_minimo || 0},"${status}","${item.ubicacion || 'No especificada'}"\n`;
        });

        // Descargar CSV
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `reporte-inventario-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    }

    createReportContent(data) {
        return `
        <!DOCTYPE html>
        <html lang="es">
        <head>
            <meta charset="UTF-8">
            <title>Reporte Mensual</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 40px; background: #f5f5f5; }
                .container { max-width: 800px; margin: 0 auto; background: white; padding: 40px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
                .header { text-align: center; margin-bottom: 40px; border-bottom: 2px solid #3b82f6; padding-bottom: 20px; }
                .metric { background: #f8fafc; padding: 20px; margin: 15px 0; border-radius: 8px; border-left: 4px solid #3b82f6; }
                .metric-value { font-size: 24px; font-weight: bold; color: #1e293b; }
                .metric-label { color: #64748b; font-size: 14px; }
                table { width: 100%; border-collapse: collapse; margin: 20px 0; }
                th, td { padding: 12px; text-align: left; border-bottom: 1px solid #e2e8f0; }
                th { background: #f1f5f9; font-weight: 600; }
                .footer { text-align: center; margin-top: 40px; color: #64748b; font-size: 12px; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>📊 Reporte Mensual</h1>
                    <p>Período: ${data.period}</p>
                    <p>Generado: ${new Date().toLocaleDateString('es-ES')}</p>
                </div>
                
                <h2>📈 Resumen de Ventas</h2>
                <div class="metric">
                    <div class="metric-value">${data.sales?.total_sales || 0}</div>
                    <div class="metric-label">Total de Ventas</div>
                </div>
                <div class="metric">
                    <div class="metric-value">$${(data.sales?.total_amount || 0).toFixed(2)}</div>
                    <div class="metric-label">Ingresos Totales</div>
                </div>

                <h2>💰 Resumen de Pagos</h2>
                <table>
                    <thead>
                        <tr><th>Tipo</th><th>Cantidad</th><th>Total</th></tr>
                    </thead>
                    <tbody>
                        ${data.payments?.map(p => `
                            <tr>
                                <td>${p.tipo_pago === 'ingreso' ? '📈 Ingresos' : '📉 Egresos'}</td>
                                <td>${p.count}</td>
                                <td>$${p.total.toFixed(2)}</td>
                            </tr>
                        `).join('') || '<tr><td colspan="3">No hay datos</td></tr>'}
                    </tbody>
                </table>

                <h2>⚠️ Productos con Stock Bajo</h2>
                <table>
                    <thead>
                        <tr><th>Producto</th><th>Stock Actual</th><th>Stock Mínimo</th></tr>
                    </thead>
                    <tbody>
                        ${data.lowStock?.map(item => `
                            <tr>
                                <td>${item.nombre}</td>
                                <td>${item.cantidad_actual}</td>
                                <td>${item.stock_minimo}</td>
                            </tr>
                        `).join('') || '<tr><td colspan="3">Todos los productos tienen stock suficiente</td></tr>'}
                    </tbody>
                </table>

                <div class="footer">
                    <p>Sistema de Gestión de Negocios - Reporte Automático</p>
                </div>
            </div>
        </body>
        </html>
        `;
    }

    // Método público para cargar (usado por app.js)
    load() {
        this.loadEmailConfig();
    }
}

// Registrar el gestor globalmente
window.ReportsManager = ReportsManager;
const reportsManager = new ReportsManager();
window.reportsManager = reportsManager;
