// Gestor de Suministros
class SuppliesManager {
    constructor() {
        this.supplies = [];
        this.init();
    }

    init() {
        this.setupEventListeners();
    }

    setupEventListeners() {
        const addBtn = document.getElementById('add-supply-btn');
        if (addBtn) {
            addBtn.addEventListener('click', () => this.showAddSupplyModal());
        }
    }

    async load() {
        try {
            app.showTableLoading('supplies-table-body');
            this.supplies = await api.getSupplies();
            this.renderTable();
        } catch (error) {
            console.error('Error cargando suministros:', error);
            showNotification('Error cargando suministros', 'error');
            app.showEmptyTable('supplies-table-body', 'Error cargando datos');
        }
    }

    renderTable() {
        const tbody = document.getElementById('supplies-table-body');
        if (!tbody) return;

        if (this.supplies.length === 0) {
            app.showEmptyTable('supplies-table-body', 'No hay suministros registrados');
            return;
        }

        tbody.innerHTML = this.supplies.map(supply => `
            <tr>
                <td>${supply.nombre}</td>
                <td>${supply.categoria || 'Sin categoría'}</td>
                <td>${formatCurrency(supply.precio_compra)}</td>
                <td>${formatCurrency(supply.precio_venta)}</td>
                <td>${supply.stock_minimo || 0}</td>
                <td>
                    ${app.createActionButtons([
                        { text: 'Editar', class: 'btn-secondary', onclick: `suppliesManager.editSupply(${supply.id})` },
                        { text: 'Eliminar', class: 'btn-danger', onclick: `suppliesManager.deleteSupply(${supply.id})` }
                    ])}
                </td>
            </tr>
        `).join('');
    }

    showAddSupplyModal() {
        const modalContent = `
            <form id="supply-form">
                <div class="form-group">
                    <label for="supply-name">Nombre *</label>
                    <input type="text" id="supply-name" name="nombre" required>
                </div>
                <div class="form-group">
                    <label for="supply-description">Descripción</label>
                    <textarea id="supply-description" name="descripcion" rows="3"></textarea>
                </div>
                <div class="form-group">
                    <label for="supply-category">Categoría</label>
                    <input type="text" id="supply-category" name="categoria">
                </div>
                <div class="form-group">
                    <label for="supply-buy-price">Precio de Compra</label>
                    <input type="number" id="supply-buy-price" name="precio_compra" step="0.01" min="0">
                </div>
                <div class="form-group">
                    <label for="supply-sell-price">Precio de Venta</label>
                    <input type="number" id="supply-sell-price" name="precio_venta" step="0.01" min="0">
                </div>
                <div class="form-group">
                    <label for="supply-min-stock">Stock Mínimo</label>
                    <input type="number" id="supply-min-stock" name="stock_minimo" min="0" value="0">
                </div>
                <div class="form-group">
                    <label for="supply-unit">Unidad de Medida</label>
                    <select id="supply-unit" name="unidad_medida">
                        <option value="unidad">Unidad</option>
                        <option value="kg">Kilogramo</option>
                        <option value="litro">Litro</option>
                        <option value="metro">Metro</option>
                        <option value="caja">Caja</option>
                    </select>
                </div>
                <div class="flex gap-2 justify-between mt-4">
                    <button type="button" class="btn-secondary" onclick="closeModal()">Cancelar</button>
                    <button type="submit" class="btn-primary">Guardar</button>
                </div>
            </form>
        `;

        app.showModal('Agregar Suministro', modalContent);

        const form = document.getElementById('supply-form');
        form.addEventListener('submit', (e) => this.handleSubmit(e));
    }

    async handleSubmit(e) {
        e.preventDefault();
        
        if (!app.validateForm(e.target)) {
            showNotification('Por favor complete los campos requeridos', 'warning');
            return;
        }

        const formData = new FormData(e.target);
        const supplyData = Object.fromEntries(formData.entries());

        try {
            await api.createSupply(supplyData);
            showNotification('Suministro creado exitosamente', 'success');
            app.closeModal();
            this.load();
        } catch (error) {
            showNotification(error.message || 'Error creando suministro', 'error');
        }
    }

    async editSupply(id) {
        // Implementar edición
        showNotification('Función de edición en desarrollo', 'info');
    }

    async deleteSupply(id) {
        if (!requireAdmin()) return;

        const confirmed = await app.confirmAction('¿Está seguro de eliminar este suministro?');
        if (!confirmed) return;

        try {
            await api.deleteSupply(id);
            showNotification('Suministro eliminado exitosamente', 'success');
            this.load();
        } catch (error) {
            showNotification(error.message || 'Error eliminando suministro', 'error');
        }
    }
}

window.SuppliesManager = SuppliesManager;
const suppliesManager = new SuppliesManager();
window.suppliesManager = suppliesManager;
