class SuppliersManager {
    constructor() {
        this.suppliers = [];
        this.init();
    }

    init() {
        const addBtn = document.getElementById('add-supplier-btn');
        if (addBtn) {
            addBtn.addEventListener('click', () => this.showAddSupplierModal());
        }
    }

    async load() {
        try {
            app.showTableLoading('suppliers-table-body');
            this.suppliers = await api.getSuppliers();
            this.renderTable();
        } catch (error) {
            console.error('Error cargando proveedores:', error);
            app.showEmptyTable('suppliers-table-body', 'Error cargando datos');
        }
    }

    renderTable() {
        const tbody = document.getElementById('suppliers-table-body');
        if (!tbody) return;

        if (this.suppliers.length === 0) {
            app.showEmptyTable('suppliers-table-body', 'No hay proveedores registrados');
            return;
        }

        tbody.innerHTML = this.suppliers.map(supplier => `
            <tr>
                <td>${supplier.nombre}</td>
                <td>${supplier.telefono || 'No especificado'}</td>
                <td>${supplier.email || 'No especificado'}</td>
                <td>${supplier.ciudad || 'No especificada'}</td>
                <td>${supplier.dias_credito || 0} días</td>
                <td>
                    ${app.createActionButtons([
                        { text: 'Editar', class: 'btn-secondary', onclick: `suppliersManager.editSupplier(${supplier.id})` },
                        { text: 'Eliminar', class: 'btn-danger', onclick: `suppliersManager.deleteSupplier(${supplier.id})` }
                    ])}
                </td>
            </tr>
        `).join('');
    }

    showAddSupplierModal() {
        const modalContent = `
            <form id="supplier-form">
                <div class="form-group">
                    <label>Nombre *</label>
                    <input type="text" name="nombre" required>
                </div>
                <div class="form-group">
                    <label>Teléfono</label>
                    <input type="tel" name="telefono">
                </div>
                <div class="form-group">
                    <label>Email</label>
                    <input type="email" name="email">
                </div>
                <div class="form-group">
                    <label>Ciudad</label>
                    <input type="text" name="ciudad">
                </div>
                <div class="form-group">
                    <label>Días de Crédito</label>
                    <input type="number" name="dias_credito" min="0" value="0">
                </div>
                <div class="flex gap-2 justify-between mt-4">
                    <button type="button" class="btn-secondary" onclick="closeModal()">Cancelar</button>
                    <button type="submit" class="btn-primary">Guardar</button>
                </div>
            </form>
        `;

        app.showModal('Agregar Proveedor', modalContent);

        const form = document.getElementById('supplier-form');
        form.addEventListener('submit', (e) => this.handleSubmit(e));
    }

    async handleSubmit(e) {
        e.preventDefault();
        
        if (!app.validateForm(e.target)) {
            showNotification('Por favor complete los campos requeridos', 'warning');
            return;
        }

        const formData = new FormData(e.target);
        const supplierData = Object.fromEntries(formData.entries());

        try {
            await api.createSupplier(supplierData);
            showNotification('Proveedor creado exitosamente', 'success');
            app.closeModal();
            this.load();
        } catch (error) {
            showNotification(error.message || 'Error creando proveedor', 'error');
        }
    }

    async editSupplier(id) {
        showNotification('Función de edición en desarrollo', 'info');
    }

    async deleteSupplier(id) {
        if (!requireAdmin()) return;

        const confirmed = await app.confirmAction('¿Está seguro de eliminar este proveedor?');
        if (!confirmed) return;

        try {
            await api.deleteSupplier(id);
            showNotification('Proveedor eliminado exitosamente', 'success');
            this.load();
        } catch (error) {
            showNotification(error.message || 'Error eliminando proveedor', 'error');
        }
    }
}

window.SuppliersManager = SuppliersManager;
const suppliersManager = new SuppliersManager();
window.suppliersManager = suppliersManager;
