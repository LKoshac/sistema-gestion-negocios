class PaymentsManager {
    constructor() {
        this.payments = [];
        this.init();
    }

    init() {
        const addBtn = document.getElementById('add-payment-btn');
        if (addBtn) {
            addBtn.addEventListener('click', () => this.showAddPaymentModal());
        }
    }

    async load() {
        try {
            app.showTableLoading('payments-table-body');
            this.payments = await api.getPayments();
            this.renderTable();
        } catch (error) {
            console.error('Error cargando pagos:', error);
            app.showEmptyTable('payments-table-body', 'Error cargando datos', 7);
        }
    }

    renderTable() {
        const tbody = document.getElementById('payments-table-body');
        if (!tbody) return;

        if (this.payments.length === 0) {
            app.showEmptyTable('payments-table-body', 'No hay pagos registrados', 7);
            return;
        }

        tbody.innerHTML = this.payments.map(payment => `
            <tr>
                <td>${app.createStatusBadge(payment.tipo_pago === 'ingreso' ? 'normal' : 'low', capitalize(payment.tipo_pago))}</td>
                <td>${payment.concepto}</td>
                <td>${formatCurrency(payment.monto)}</td>
                <td>${capitalize(payment.metodo_pago || 'No especificado')}</td>
                <td>${formatDate(payment.fecha_pago)}</td>
                <td>${app.createStatusBadge('normal', capitalize(payment.estado))}</td>
                <td>
                    ${app.createActionButtons([
                        { text: 'Ver', class: 'btn-secondary', onclick: `paymentsManager.viewPayment(${payment.id})` }
                    ])}
                </td>
            </tr>
        `).join('');
    }

    showAddPaymentModal() {
        const modalContent = `
            <form id="payment-form">
                <div class="form-group">
                    <label>Tipo de Pago *</label>
                    <select name="tipo_pago" required>
                        <option value="">Seleccionar...</option>
                        <option value="ingreso">Ingreso</option>
                        <option value="egreso">Egreso</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Concepto *</label>
                    <input type="text" name="concepto" required>
                </div>
                <div class="form-group">
                    <label>Monto *</label>
                    <input type="number" name="monto" step="0.01" min="0.01" required>
                </div>
                <div class="form-group">
                    <label>Método de Pago</label>
                    <select name="metodo_pago">
                        <option value="efectivo">Efectivo</option>
                        <option value="tarjeta">Tarjeta</option>
                        <option value="transferencia">Transferencia</option>
                        <option value="cheque">Cheque</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Descripción</label>
                    <textarea name="descripcion" rows="3"></textarea>
                </div>
                <div class="flex gap-2 justify-between mt-4">
                    <button type="button" class="btn-secondary" onclick="closeModal()">Cancelar</button>
                    <button type="submit" class="btn-primary">Registrar</button>
                </div>
            </form>
        `;

        app.showModal('Registrar Pago', modalContent);

        const form = document.getElementById('payment-form');
        form.addEventListener('submit', (e) => this.handleSubmit(e));
    }

    async handleSubmit(e) {
        e.preventDefault();
        
        if (!app.validateForm(e.target)) {
            showNotification('Por favor complete los campos requeridos', 'warning');
            return;
        }

        const formData = new FormData(e.target);
        const paymentData = Object.fromEntries(formData.entries());

        try {
            await api.createPayment(paymentData);
            showNotification('Pago registrado exitosamente', 'success');
            app.closeModal();
            this.load();
        } catch (error) {
            showNotification(error.message || 'Error registrando pago', 'error');
        }
    }

    async viewPayment(id) {
        showNotification('Función en desarrollo', 'info');
    }
}

window.PaymentsManager = PaymentsManager;
const paymentsManager = new PaymentsManager();
window.paymentsManager = paymentsManager;
