class StockManager {
    constructor() {
        this.stock = [];
        this.init();
    }

    init() {
        const addBtn = document.getElementById('add-movement-btn');
        if (addBtn) {
            addBtn.addEventListener('click', () => this.showAddMovementModal());
        }
    }

    async load() {
        try {
            app.showTableLoading('stock-table-body');
            this.stock = await api.getStock();
            this.renderTable();
        } catch (error) {
            console.error('Error cargando stock:', error);
            app.showEmptyTable('stock-table-body', 'Error cargando datos');
        }
    }

    renderTable() {
        const tbody = document.getElementById('stock-table-body');
        if (!tbody) return;

        if (this.stock.length === 0) {
            app.showEmptyTable('stock-table-body', 'No hay datos de stock');
            return;
        }

        tbody.innerHTML = this.stock.map(item => `
            <tr>
                <td>${item.nombre}</td>
                <td>${item.cantidad_actual || 0}</td>
                <td>${item.stock_minimo || 0}</td>
                <td>${this.getStockStatus(item)}</td>
                <td>${item.ubicacion || 'No especificada'}</td>
                <td>
                    ${app.createActionButtons([
                        { text: 'Movimientos', class: 'btn-secondary', onclick: `stockManager.viewMovements(${item.suministro_id})` }
                    ])}
                </td>
            </tr>
        `).join('');
    }

    getStockStatus(item) {
        const actual = item.cantidad_actual || 0;
        const minimo = item.stock_minimo || 0;
        
        if (actual <= minimo) {
            return app.createStatusBadge('low', 'Stock Bajo');
        }
        return app.createStatusBadge('normal', 'Normal');
    }

    showAddMovementModal() {
        const modalContent = `
            <form id="movement-form">
                <div class="form-group">
                    <label>Tipo de Movimiento *</label>
                    <select name="tipo_movimiento" required>
                        <option value="">Seleccionar...</option>
                        <option value="entrada">Entrada</option>
                        <option value="salida">Salida</option>
                        <option value="ajuste">Ajuste</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Cantidad *</label>
                    <input type="number" name="cantidad" min="1" required>
                </div>
                <div class="form-group">
                    <label>Motivo</label>
                    <input type="text" name="motivo">
                </div>
                <div class="flex gap-2 justify-between mt-4">
                    <button type="button" class="btn-secondary" onclick="closeModal()">Cancelar</button>
                    <button type="submit" class="btn-primary">Registrar</button>
                </div>
            </form>
        `;
        app.showModal('Registrar Movimiento', modalContent);
    }

    async viewMovements(supplyId) {
        showNotification('Función en desarrollo', 'info');
    }
}

window.StockManager = StockManager;
const stockManager = new StockManager();
window.stockManager = stockManager;
