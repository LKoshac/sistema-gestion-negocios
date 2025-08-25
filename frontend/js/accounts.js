class AccountsManager {
    constructor() {
        this.accounts = [];
        this.init();
    }

    init() {
        const addBtn = document.getElementById('add-account-btn');
        if (addBtn) {
            addBtn.addEventListener('click', () => this.showAddAccountModal());
        }
    }

    async load() {
        try {
            app.showTableLoading('accounts-table-body');
            this.accounts = await api.getAccounts();
            this.renderTable();
        } catch (error) {
            console.error('Error cargando cuentas:', error);
            app.showEmptyTable('accounts-table-body', 'Error cargando datos', 5);
        }
    }

    renderTable() {
        const tbody = document.getElementById('accounts-table-body');
        if (!tbody) return;

        if (this.accounts.length === 0) {
            app.showEmptyTable('accounts-table-body', 'No hay cuentas registradas', 5);
            return;
        }

        tbody.innerHTML = this.accounts.map(account => `
            <tr>
                <td>${account.codigo}</td>
                <td>${account.nombre}</td>
                <td>${app.createStatusBadge('normal', capitalize(account.tipo_cuenta))}</td>
                <td>${formatCurrency(account.saldo_actual)}</td>
                <td>
                    ${app.createActionButtons([
                        { text: 'Ver', class: 'btn-secondary', onclick: `accountsManager.viewAccount(${account.id})` }
                    ])}
                </td>
            </tr>
        `).join('');
    }

    showAddAccountModal() {
        if (!requireAdmin()) return;

        const modalContent = `
            <form id="account-form">
                <div class="form-group">
                    <label>Código *</label>
                    <input type="text" name="codigo" required>
                </div>
                <div class="form-group">
                    <label>Nombre *</label>
                    <input type="text" name="nombre" required>
                </div>
                <div class="form-group">
                    <label>Tipo de Cuenta *</label>
                    <select name="tipo_cuenta" required>
                        <option value="">Seleccionar...</option>
                        <option value="activo">Activo</option>
                        <option value="pasivo">Pasivo</option>
                        <option value="capital">Capital</option>
                        <option value="ingreso">Ingreso</option>
                        <option value="egreso">Egreso</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Saldo Inicial</label>
                    <input type="number" name="saldo_inicial" step="0.01" value="0">
                </div>
                <div class="form-group">
                    <label>Descripción</label>
                    <textarea name="descripcion" rows="3"></textarea>
                </div>
                <div class="flex gap-2 justify-between mt-4">
                    <button type="button" class="btn-secondary" onclick="closeModal()">Cancelar</button>
                    <button type="submit" class="btn-primary">Crear</button>
                </div>
            </form>
        `;

        app.showModal('Crear Cuenta', modalContent);

        const form = document.getElementById('account-form');
        form.addEventListener('submit', (e) => this.handleSubmit(e));
    }

    async handleSubmit(e) {
        e.preventDefault();
        
        if (!app.validateForm(e.target)) {
            showNotification('Por favor complete los campos requeridos', 'warning');
            return;
        }

        const formData = new FormData(e.target);
        const accountData = Object.fromEntries(formData.entries());

        try {
            await api.createAccount(accountData);
            showNotification('Cuenta creada exitosamente', 'success');
            app.closeModal();
            this.load();
        } catch (error) {
            showNotification(error.message || 'Error creando cuenta', 'error');
        }
    }

    async viewAccount(id) {
        showNotification('Función en desarrollo', 'info');
    }
}

window.AccountsManager = AccountsManager;
const accountsManager = new AccountsManager();
window.accountsManager = accountsManager;
