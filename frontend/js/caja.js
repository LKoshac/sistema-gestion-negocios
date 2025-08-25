class CajaManager {
    constructor() {
        this.activeSession = null;
        this.sales = [];
        this.init();
    }

    init() {
        const openBtn = document.getElementById('open-session-btn');
        const closeBtn = document.getElementById('close-session-btn');
        
        if (openBtn) {
            openBtn.addEventListener('click', () => this.showOpenSessionModal());
        }
        
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.showCloseSessionModal());
        }
    }

    async load() {
        try {
            await this.checkActiveSession();
            await this.loadDailySales();
        } catch (error) {
            console.error('Error cargando caja:', error);
        }
    }

    async checkActiveSession() {
        try {
            this.activeSession = await api.getActiveSession(1); // Caja principal
            this.updateSessionUI();
        } catch (error) {
            this.activeSession = null;
            this.updateSessionUI();
        }
    }

    updateSessionUI() {
        const sessionInfo = document.getElementById('session-info');
        const openBtn = document.getElementById('open-session-btn');
        const closeBtn = document.getElementById('close-session-btn');
        const initialAmount = document.getElementById('initial-amount');

        if (this.activeSession) {
            if (sessionInfo) sessionInfo.style.display = 'block';
            if (openBtn) openBtn.style.display = 'none';
            if (closeBtn) closeBtn.style.display = 'inline-block';
            if (initialAmount) initialAmount.textContent = this.activeSession.monto_inicial || 0;
        } else {
            if (sessionInfo) sessionInfo.style.display = 'none';
            if (openBtn) openBtn.style.display = 'inline-block';
            if (closeBtn) closeBtn.style.display = 'none';
        }
    }

    async loadDailySales() {
        try {
            const today = getCurrentDate();
            const salesData = await api.getDailySales(today);
            this.sales = salesData.ventas || [];
            this.renderSalesTable();
            
            const dailySalesElement = document.getElementById('daily-sales');
            if (dailySalesElement && salesData.resumen) {
                dailySalesElement.textContent = salesData.resumen.total_ingresos || 0;
            }
        } catch (error) {
            console.error('Error cargando ventas:', error);
            this.sales = [];
            this.renderSalesTable();
        }
    }

    renderSalesTable() {
        const tbody = document.getElementById('sales-table-body');
        if (!tbody) return;

        if (this.sales.length === 0) {
            app.showEmptyTable('sales-table-body', 'No hay ventas registradas hoy', 5);
            return;
        }

        tbody.innerHTML = this.sales.map(sale => `
            <tr>
                <td>${sale.numero_venta}</td>
                <td>${sale.cliente_nombre || 'Cliente general'}</td>
                <td>${formatCurrency(sale.total)}</td>
                <td>${capitalize(sale.metodo_pago)}</td>
                <td>${formatDate(sale.fecha_venta)}</td>
            </tr>
        `).join('');
    }

    showOpenSessionModal() {
        const modalContent = `
            <form id="open-session-form">
                <div class="form-group">
                    <label>Monto Inicial *</label>
                    <input type="number" name="monto_inicial" step="0.01" min="0" required value="0">
                </div>
                <div class="form-group">
                    <label>Notas de Apertura</label>
                    <textarea name="notas_apertura" rows="3"></textarea>
                </div>
                <div class="flex gap-2 justify-between mt-4">
                    <button type="button" class="btn-secondary" onclick="closeModal()">Cancelar</button>
                    <button type="submit" class="btn-primary">Abrir Sesión</button>
                </div>
            </form>
        `;

        app.showModal('Abrir Sesión de Caja', modalContent);

        const form = document.getElementById('open-session-form');
        form.addEventListener('submit', (e) => this.handleOpenSession(e));
    }

    async handleOpenSession(e) {
        e.preventDefault();
        
        if (!app.validateForm(e.target)) {
            showNotification('Por favor complete los campos requeridos', 'warning');
            return;
        }

        const formData = new FormData(e.target);
        const sessionData = Object.fromEntries(formData.entries());
        sessionData.caja_id = 1; // Caja principal

        try {
            await api.openCajaSession(sessionData);
            showNotification('Sesión de caja abierta exitosamente', 'success');
            app.closeModal();
            this.load();
        } catch (error) {
            showNotification(error.message || 'Error abriendo sesión', 'error');
        }
    }

    showCloseSessionModal() {
        const modalContent = `
            <form id="close-session-form">
                <div class="form-group">
                    <label>Monto Final *</label>
                    <input type="number" name="monto_final" step="0.01" min="0" required>
                </div>
                <div class="form-group">
                    <label>Notas de Cierre</label>
                    <textarea name="notas_cierre" rows="3"></textarea>
                </div>
                <div class="flex gap-2 justify-between mt-4">
                    <button type="button" class="btn-secondary" onclick="closeModal()">Cancelar</button>
                    <button type="submit" class="btn-danger">Cerrar Sesión</button>
                </div>
            </form>
        `;

        app.showModal('Cerrar Sesión de Caja', modalContent);

        const form = document.getElementById('close-session-form');
        form.addEventListener('submit', (e) => this.handleCloseSession(e));
    }

    async handleCloseSession(e) {
        e.preventDefault();
        
        if (!app.validateForm(e.target)) {
            showNotification('Por favor complete los campos requeridos', 'warning');
            return;
        }

        const formData = new FormData(e.target);
        const sessionData = Object.fromEntries(formData.entries());

        try {
            await api.closeCajaSession(this.activeSession.id, sessionData);
            showNotification('Sesión de caja cerrada exitosamente', 'success');
            app.closeModal();
            this.load();
        } catch (error) {
            showNotification(error.message || 'Error cerrando sesión', 'error');
        }
    }
}

window.CajaManager = CajaManager;
const cajaManager = new CajaManager();
window.cajaManager = cajaManager;
