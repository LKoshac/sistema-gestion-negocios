// Gestor del Dashboard
class DashboardManager {
    constructor() {
        this.data = {
            totalSales: 0,
            lowStockCount: 0,
            suppliersCount: 0,
            balance: 0
        };
        this.init();
    }

    init() {
        // El dashboard se carga automáticamente cuando se autentica el usuario
    }

    async loadDashboard() {
        try {
            await Promise.all([
                this.loadSalesData(),
                this.loadStockData(),
                this.loadSuppliersData(),
                this.loadBalanceData()
            ]);
            
            this.updateDashboardUI();
        } catch (error) {
            console.error('Error cargando dashboard:', error);
            showNotification('Error cargando datos del dashboard', 'error');
        }
    }

    async loadSalesData() {
        try {
            const today = getCurrentDate();
            const salesData = await api.getDailySales(today);
            
            this.data.totalSales = salesData.resumen ? salesData.resumen.total_ingresos : 0;
        } catch (error) {
            console.error('Error cargando datos de ventas:', error);
            this.data.totalSales = 0;
        }
    }

    async loadStockData() {
        try {
            const lowStockData = await api.getLowStock();
            this.data.lowStockCount = lowStockData.length || 0;
        } catch (error) {
            console.error('Error cargando datos de stock:', error);
            this.data.lowStockCount = 0;
        }
    }

    async loadSuppliersData() {
        try {
            const suppliersData = await api.getSuppliers();
            this.data.suppliersCount = suppliersData.length || 0;
        } catch (error) {
            console.error('Error cargando datos de proveedores:', error);
            this.data.suppliersCount = 0;
        }
    }

    async loadBalanceData() {
        try {
            const startDate = new Date();
            startDate.setDate(1); // Primer día del mes
            const endDate = new Date();
            
            const paymentsReport = await api.getPaymentsReport(
                startDate.toISOString().split('T')[0],
                endDate.toISOString().split('T')[0]
            );
            
            if (paymentsReport.resumen) {
                this.data.balance = paymentsReport.resumen.balance || 0;
            } else {
                this.data.balance = 0;
            }
        } catch (error) {
            console.error('Error cargando datos de balance:', error);
            this.data.balance = 0;
        }
    }

    updateDashboardUI() {
        // Actualizar métricas en el dashboard
        const totalSalesElement = document.getElementById('total-sales');
        const lowStockElement = document.getElementById('low-stock-count');
        const suppliersElement = document.getElementById('suppliers-count');
        const balanceElement = document.getElementById('balance');

        if (totalSalesElement) {
            totalSalesElement.textContent = formatCurrency(this.data.totalSales);
        }

        if (lowStockElement) {
            lowStockElement.textContent = formatNumber(this.data.lowStockCount);
            
            // Cambiar color si hay productos con stock bajo
            const card = lowStockElement.closest('.dashboard-card');
            if (this.data.lowStockCount > 0) {
                card.style.borderLeft = '4px solid var(--warning-color)';
            } else {
                card.style.borderLeft = '4px solid var(--success-color)';
            }
        }

        if (suppliersElement) {
            suppliersElement.textContent = formatNumber(this.data.suppliersCount);
        }

        if (balanceElement) {
            balanceElement.textContent = formatCurrency(this.data.balance);
            
            // Cambiar color según el balance
            if (this.data.balance >= 0) {
                balanceElement.style.color = 'var(--success-color)';
            } else {
                balanceElement.style.color = 'var(--error-color)';
            }
        }
    }

    // Método para refrescar el dashboard
    async refresh() {
        await this.loadDashboard();
    }

    // Método público para cargar (usado por app.js)
    load() {
        this.loadDashboard();
    }
}

// Registrar el gestor globalmente
window.DashboardManager = DashboardManager;
