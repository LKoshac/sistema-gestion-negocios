// Aplicación principal
class App {
    constructor() {
        this.currentSection = 'dashboard';
        this.managers = {};
        this.init();
    }

    init() {
        this.setupNavigation();
        this.setupModal();
        this.initializeManagers();
        
        // Verificar autenticación al cargar
        if (authManager.isAuthenticated()) {
            authManager.showMainApp();
        } else {
            authManager.showLoginScreen();
        }
    }

    setupNavigation() {
        const navLinks = document.querySelectorAll('.nav-link');
        const menuToggle = document.getElementById('menu-toggle');
        const sidebar = document.getElementById('sidebar');
        const sidebarOverlay = document.getElementById('sidebar-overlay');
        
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const section = link.getAttribute('data-section');
                this.navigateToSection(section);
                
                // Cerrar sidebar en móvil después de navegar
                if (window.innerWidth <= 992) {
                    this.closeMobileSidebar();
                }
            });
        });

        // Toggle del menú móvil
        if (menuToggle) {
            menuToggle.addEventListener('click', () => {
                this.toggleMobileSidebar();
            });
        }

        // Cerrar sidebar al hacer clic en overlay
        if (sidebarOverlay) {
            sidebarOverlay.addEventListener('click', () => {
                this.closeMobileSidebar();
            });
        }

        // Manejar redimensionamiento de ventana
        window.addEventListener('resize', () => {
            if (window.innerWidth > 992) {
                this.closeMobileSidebar();
            }
        });
    }

    toggleMobileSidebar() {
        const sidebar = document.getElementById('sidebar');
        const overlay = document.getElementById('sidebar-overlay');
        
        if (sidebar && overlay) {
            sidebar.classList.toggle('show');
            overlay.classList.toggle('show');
        }
    }

    closeMobileSidebar() {
        const sidebar = document.getElementById('sidebar');
        const overlay = document.getElementById('sidebar-overlay');
        
        if (sidebar && overlay) {
            sidebar.classList.remove('show');
            overlay.classList.remove('show');
        }
    }

    navigateToSection(section) {
        if (!requireAuth()) return;
        
        // Actualizar navegación activa
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });
        
        document.querySelector(`[data-section="${section}"]`).classList.add('active');
        
        // Mostrar sección correspondiente
        document.querySelectorAll('.content-section').forEach(sec => {
            sec.classList.remove('active');
        });
        
        const targetSection = document.getElementById(`${section}-section`);
        if (targetSection) {
            targetSection.classList.add('active');
            this.currentSection = section;
            
            // Cargar datos de la sección
            this.loadSectionData(section);
        }
    }

    loadSectionData(section) {
        const manager = this.managers[section];
        if (manager && typeof manager.load === 'function') {
            manager.load();
        }
    }

    setupModal() {
        const modal = document.getElementById('modal-container');
        const closeBtn = document.getElementById('modal-close');
        
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                this.closeModal();
            });
        }
        
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.closeModal();
                }
            });
        }
    }

    showModal(title, content) {
        const modal = document.getElementById('modal-container');
        const modalTitle = document.getElementById('modal-title');
        const modalBody = document.getElementById('modal-body');
        
        if (modalTitle) modalTitle.textContent = title;
        if (modalBody) modalBody.innerHTML = content;
        if (modal) modal.style.display = 'flex';
        
        // Enfocar el primer input si existe
        setTimeout(() => {
            const firstInput = modalBody.querySelector('input, select, textarea');
            if (firstInput) firstInput.focus();
        }, 100);
    }

    closeModal() {
        const modal = document.getElementById('modal-container');
        if (modal) modal.style.display = 'none';
    }

    initializeManagers() {
        // Inicializar gestores de cada sección cuando estén disponibles
        document.addEventListener('DOMContentLoaded', () => {
            // Caja (página de inicio)
            if (window.CajaManager) {
                this.managers.caja = new window.CajaManager();
                window.cajaManager = this.managers.caja;
            }
            
            // Dashboard
            if (window.DashboardManager) {
                this.managers.dashboard = new window.DashboardManager();
                window.dashboardManager = this.managers.dashboard;
            }
            
            // Suministros
            if (window.SuppliesManager) {
                this.managers.suministros = new window.SuppliesManager();
            }
            
            // Stock
            if (window.StockManager) {
                this.managers.stock = new window.StockManager();
            }
            
            // Proveedores
            if (window.SuppliersManager) {
                this.managers.proveedores = new window.SuppliersManager();
            }
            
            // Pagos
            if (window.PaymentsManager) {
                this.managers.pagos = new window.PaymentsManager();
            }
            
            // Cuentas
            if (window.AccountsManager) {
                this.managers.cuentas = new window.AccountsManager();
            }
            
            // Caja
            if (window.CajaManager) {
                this.managers.caja = new window.CajaManager();
            }
            
            // Usuarios
            if (window.UsersManager) {
                this.managers.usuarios = new window.UsersManager();
            }
            
            // Reportes
            if (window.ReportsManager) {
                this.managers.reportes = new window.ReportsManager();
            }
        });
    }

    // Método para refrescar la sección actual
    refresh() {
        this.loadSectionData(this.currentSection);
    }

    // Método para mostrar loading en una tabla
    showTableLoading(tableBodyId) {
        const tbody = document.getElementById(tableBodyId);
        if (tbody) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="100%" class="text-center" style="padding: 2rem;">
                        <div class="loading" style="margin: 0 auto;"></div>
                        <p style="margin-top: 1rem; color: var(--text-secondary);">Cargando datos...</p>
                    </td>
                </tr>
            `;
        }
    }

    // Método para mostrar mensaje cuando no hay datos
    showEmptyTable(tableBodyId, message = 'No hay datos disponibles', colspan = 6) {
        const tbody = document.getElementById(tableBodyId);
        if (tbody) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="${colspan}" class="text-center" style="padding: 2rem; color: var(--text-secondary);">
                        ${message}
                    </td>
                </tr>
            `;
        }
    }

    // Método para crear botones de acción
    createActionButtons(actions) {
        const buttonsHtml = actions.map(action => {
            const btnClass = action.class || 'btn-secondary';
            const onclick = action.onclick || '';
            return `<button class="${btnClass}" onclick="${onclick}" title="${action.title || ''}">${action.text}</button>`;
        }).join(' ');
        
        return `<div class="flex gap-2">${buttonsHtml}</div>`;
    }

    // Método para crear badge de estado
    createStatusBadge(status, text) {
        return `<span class="status-badge status-${status}">${text}</span>`;
    }

    // Método para validar formulario
    validateForm(formElement) {
        const inputs = formElement.querySelectorAll('input[required], select[required], textarea[required]');
        let isValid = true;
        
        inputs.forEach(input => {
            if (!input.value.trim()) {
                input.style.borderColor = 'var(--error-color)';
                isValid = false;
            } else {
                input.style.borderColor = 'var(--border-color)';
            }
        });
        
        return isValid;
    }

    // Método para limpiar formulario
    clearForm(formElement) {
        const inputs = formElement.querySelectorAll('input, select, textarea');
        inputs.forEach(input => {
            if (input.type === 'checkbox' || input.type === 'radio') {
                input.checked = false;
            } else {
                input.value = '';
            }
            input.style.borderColor = 'var(--border-color)';
        });
    }

    // Método para confirmar acción
    async confirmAction(message, title = 'Confirmar acción') {
        return new Promise((resolve) => {
            const confirmHtml = `
                <div class="text-center">
                    <p style="margin-bottom: 2rem;">${message}</p>
                    <div class="flex gap-2 justify-center">
                        <button class="btn-danger" onclick="app.resolveConfirm(true)">Confirmar</button>
                        <button class="btn-secondary" onclick="app.resolveConfirm(false)">Cancelar</button>
                    </div>
                </div>
            `;
            
            this.confirmResolve = resolve;
            this.showModal(title, confirmHtml);
        });
    }

    resolveConfirm(result) {
        if (this.confirmResolve) {
            this.confirmResolve(result);
            this.confirmResolve = null;
        }
        this.closeModal();
    }
}

// Instancia global de la aplicación
const app = new App();

// Funciones globales para uso en HTML
window.app = app;
window.showModal = (title, content) => app.showModal(title, content);
window.closeModal = () => app.closeModal();

// Función para formatear números
function formatNumber(num) {
    return new Intl.NumberFormat('es-ES').format(num || 0);
}

// Función para truncar texto
function truncateText(text, maxLength = 50) {
    if (!text) return '';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
}

// Función para capitalizar primera letra
function capitalize(str) {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

// Función para generar ID único
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Función para parsear fecha ISO a formato local
function parseISODate(isoString) {
    if (!isoString) return '';
    const date = new Date(isoString);
    return date.toLocaleDateString('es-ES');
}

// Función para obtener fecha actual en formato YYYY-MM-DD
function getCurrentDate() {
    return new Date().toISOString().split('T')[0];
}

// Función para obtener fecha y hora actual en formato YYYY-MM-DDTHH:mm
function getCurrentDateTime() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    
    return `${year}-${month}-${day}T${hours}:${minutes}`;
}

// Manejar errores globales
window.addEventListener('error', function(e) {
    console.error('Error global:', e.error);
    showNotification('Ha ocurrido un error inesperado', 'error');
});

// Manejar promesas rechazadas
window.addEventListener('unhandledrejection', function(e) {
    console.error('Promesa rechazada:', e.reason);
    showNotification('Error en la aplicación', 'error');
});

console.log('🚀 Aplicación de Gestión de Negocios cargada correctamente');
