// Configuración de la API
const API_BASE_URL = 'http://localhost:3001/api';

// Clase para manejar las llamadas a la API
class ApiClient {
    constructor() {
        this.token = localStorage.getItem('token');
    }

    // Configurar headers por defecto
    getHeaders() {
        const headers = {
            'Content-Type': 'application/json',
        };
        
        if (this.token) {
            headers['Authorization'] = `Bearer ${this.token}`;
        }
        
        return headers;
    }

    // Método genérico para hacer peticiones
    async request(endpoint, options = {}) {
        const url = `${API_BASE_URL}${endpoint}`;
        const config = {
            headers: this.getHeaders(),
            ...options,
        };

        try {
            const response = await fetch(url, config);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || data.error || 'Error en la petición');
            }

            return data;
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }

    // Métodos HTTP
    async get(endpoint) {
        return this.request(endpoint, { method: 'GET' });
    }

    async post(endpoint, data) {
        return this.request(endpoint, {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    async put(endpoint, data) {
        return this.request(endpoint, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    }

    async delete(endpoint) {
        return this.request(endpoint, { method: 'DELETE' });
    }

    // Actualizar token
    setToken(token) {
        this.token = token;
        if (token) {
            localStorage.setItem('token', token);
        } else {
            localStorage.removeItem('token');
        }
    }

    // Métodos específicos de la API

    // Usuarios
    async login(username, password) {
        const response = await this.post('/usuarios/login', { username, password });
        if (response.token) {
            this.setToken(response.token);
        }
        return response;
    }

    async logout() {
        this.setToken(null);
    }

    async getUsers() {
        return this.get('/usuarios');
    }

    async createUser(userData) {
        return this.post('/usuarios/register', userData);
    }

    async updateUser(id, userData) {
        return this.put(`/usuarios/${id}`, userData);
    }

    async deleteUser(id) {
        return this.delete(`/usuarios/${id}`);
    }

    // Suministros
    async getSupplies() {
        return this.get('/suministros');
    }

    async getSupplyById(id) {
        return this.get(`/suministros/${id}`);
    }

    async createSupply(supplyData) {
        return this.post('/suministros', supplyData);
    }

    async updateSupply(id, supplyData) {
        return this.put(`/suministros/${id}`, supplyData);
    }

    async deleteSupply(id) {
        return this.delete(`/suministros/${id}`);
    }

    async searchSupplies(query) {
        return this.get(`/suministros/search?q=${encodeURIComponent(query)}`);
    }

    async getLowStockSupplies() {
        return this.get('/suministros/low-stock');
    }

    // Stock
    async getStock() {
        return this.get('/stock');
    }

    async getStockBySupply(supplyId) {
        return this.get(`/stock/${supplyId}`);
    }

    async updateStock(supplyId, stockData) {
        return this.put(`/stock/${supplyId}`, stockData);
    }

    async addStockMovement(supplyId, movementData) {
        return this.post(`/stock/${supplyId}/movements`, movementData);
    }

    async getStockMovements(supplyId) {
        return this.get(`/stock/${supplyId}/movements`);
    }

    async getLowStock() {
        return this.get('/stock/low-stock');
    }

    // Proveedores
    async getSuppliers() {
        return this.get('/proveedores');
    }

    async getSupplierById(id) {
        return this.get(`/proveedores/${id}`);
    }

    async createSupplier(supplierData) {
        return this.post('/proveedores', supplierData);
    }

    async updateSupplier(id, supplierData) {
        return this.put(`/proveedores/${id}`, supplierData);
    }

    async deleteSupplier(id) {
        return this.delete(`/proveedores/${id}`);
    }

    async searchSuppliers(query) {
        return this.get(`/proveedores/search?q=${encodeURIComponent(query)}`);
    }

    // Pagos
    async getPayments() {
        return this.get('/pagos');
    }

    async getPaymentById(id) {
        return this.get(`/pagos/${id}`);
    }

    async createPayment(paymentData) {
        return this.post('/pagos', paymentData);
    }

    async updatePayment(id, paymentData) {
        return this.put(`/pagos/${id}`, paymentData);
    }

    async deletePayment(id) {
        return this.delete(`/pagos/${id}`);
    }

    async getPaymentsByType(type) {
        return this.get(`/pagos/type/${type}`);
    }

    async getPaymentsReport(startDate, endDate) {
        let url = '/pagos/report';
        const params = new URLSearchParams();
        if (startDate) params.append('fecha_inicio', startDate);
        if (endDate) params.append('fecha_fin', endDate);
        if (params.toString()) url += `?${params.toString()}`;
        return this.get(url);
    }

    // Cuentas
    async getAccounts() {
        return this.get('/cuentas');
    }

    async getAccountById(id) {
        return this.get(`/cuentas/${id}`);
    }

    async createAccount(accountData) {
        return this.post('/cuentas', accountData);
    }

    async updateAccount(id, accountData) {
        return this.put(`/cuentas/${id}`, accountData);
    }

    async deleteAccount(id) {
        return this.delete(`/cuentas/${id}`);
    }

    async getAccountsByType(type) {
        return this.get(`/cuentas/type/${type}`);
    }

    async getBalanceSheet() {
        return this.get('/cuentas/balance-sheet');
    }

    async getIncomeStatement(startDate, endDate) {
        let url = '/cuentas/income-statement';
        const params = new URLSearchParams();
        if (startDate) params.append('fecha_inicio', startDate);
        if (endDate) params.append('fecha_fin', endDate);
        if (params.toString()) url += `?${params.toString()}`;
        return this.get(url);
    }

    // Caja
    async getCajas() {
        return this.get('/caja/cajas');
    }

    async openCajaSession(sessionData) {
        return this.post('/caja/sessions/open', sessionData);
    }

    async closeCajaSession(sessionId, sessionData) {
        return this.put(`/caja/sessions/${sessionId}/close`, sessionData);
    }

    async getActiveSession(cajaId) {
        return this.get(`/caja/cajas/${cajaId}/active-session`);
    }

    async createSale(saleData) {
        return this.post('/caja/sales', saleData);
    }

    async getDailySales(date) {
        let url = '/caja/sales/daily';
        if (date) url += `?fecha=${date}`;
        return this.get(url);
    }

    async getSalesReport(startDate, endDate) {
        let url = '/caja/sales/report';
        const params = new URLSearchParams();
        if (startDate) params.append('fecha_inicio', startDate);
        if (endDate) params.append('fecha_fin', endDate);
        if (params.toString()) url += `?${params.toString()}`;
        return this.get(url);
    }

    // Health check
    async healthCheck() {
        return this.get('/health');
    }

    // Email Configuration
    async getEmailConfig() {
        return this.get('/email/config');
    }

    async saveEmailConfig(configData) {
        return this.post('/email/config', configData);
    }

    async sendTestEmail(recipient) {
        return this.post('/email/test', { recipient });
    }

    async generateMonthlyReport() {
        return this.get('/email/monthly-report');
    }
}

// Instancia global de la API
const api = new ApiClient();

// Función para mostrar notificaciones
function showNotification(message, type = 'info') {
    // Crear elemento de notificación
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    // Estilos inline para la notificación
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        color: white;
        font-weight: 500;
        z-index: 3000;
        max-width: 300px;
        box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
        transform: translateX(100%);
        transition: transform 0.3s ease;
    `;
    
    // Colores según el tipo
    const colors = {
        success: '#10b981',
        error: '#ef4444',
        warning: '#f59e0b',
        info: '#2563eb'
    };
    
    notification.style.backgroundColor = colors[type] || colors.info;
    
    // Agregar al DOM
    document.body.appendChild(notification);
    
    // Animar entrada
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Remover después de 5 segundos
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 5000);
}

// Función para formatear fechas
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Función para formatear moneda
function formatCurrency(amount) {
    return new Intl.NumberFormat('es-ES', {
        style: 'currency',
        currency: 'USD'
    }).format(amount || 0);
}

// Función para validar email
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Función para debounce (útil para búsquedas)
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}
