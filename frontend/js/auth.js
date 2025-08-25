// Gestión de autenticación
class AuthManager {
    constructor() {
        this.currentUser = null;
        this.token = localStorage.getItem('token');
        this.init();
    }

    init() {
        // Verificar si hay un token guardado
        if (this.token) {
            this.validateToken();
        }
    }

    async validateToken() {
        try {
            // Intentar obtener información del usuario con el token actual
            const response = await api.get('/usuarios/profile');
            this.currentUser = response;
            this.showMainApp();
        } catch (error) {
            // Token inválido, limpiar y mostrar login
            this.logout();
        }
    }

    async login(username, password) {
        try {
            const response = await api.login(username, password);
            
            this.currentUser = response.user;
            this.token = response.token;
            
            // Actualizar UI
            this.showMainApp();
            this.updateUserInfo();
            
            showNotification('Inicio de sesión exitoso', 'success');
            return true;
        } catch (error) {
            showNotification(error.message || 'Error al iniciar sesión', 'error');
            return false;
        }
    }

    logout() {
        // Limpiar datos de autenticación
        this.currentUser = null;
        this.token = null;
        api.logout();
        
        // Mostrar pantalla de login
        this.showLoginScreen();
        
        showNotification('Sesión cerrada', 'info');
    }

    showLoginScreen() {
        document.getElementById('login-screen').style.display = 'flex';
        document.getElementById('main-app').style.display = 'none';
        
        // Limpiar clases de rol
        document.body.classList.remove('admin', 'empleado');
    }

    showMainApp() {
        document.getElementById('login-screen').style.display = 'none';
        document.getElementById('main-app').style.display = 'flex';
        
        // Agregar clase de rol al body
        if (this.currentUser && this.currentUser.role) {
            document.body.classList.add(this.currentUser.role);
        }
        
        this.updateUserInfo();
        
        // Cargar dashboard por defecto
        if (window.dashboardManager) {
            window.dashboardManager.loadDashboard();
        }
    }

    updateUserInfo() {
        const userInfoElement = document.getElementById('user-info');
        const logoutBtn = document.getElementById('logout-btn');
        
        if (this.currentUser) {
            userInfoElement.textContent = `Bienvenido, ${this.currentUser.nombre} ${this.currentUser.apellido}`;
            logoutBtn.style.display = 'inline-block';
        } else {
            userInfoElement.textContent = 'Bienvenido';
            logoutBtn.style.display = 'none';
        }
    }

    isAuthenticated() {
        return this.currentUser !== null && this.token !== null;
    }

    isAdmin() {
        return this.currentUser && this.currentUser.role === 'admin';
    }

    getCurrentUser() {
        return this.currentUser;
    }

    getToken() {
        return this.token;
    }
}

// Instancia global del gestor de autenticación
const authManager = new AuthManager();

// Event listeners para el formulario de login
document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('login-form');
    const logoutBtn = document.getElementById('logout-btn');

    // Manejar envío del formulario de login
    if (loginForm) {
        loginForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const username = document.getElementById('username').value.trim();
            const password = document.getElementById('password').value;
            
            if (!username || !password) {
                showNotification('Por favor, complete todos los campos', 'warning');
                return;
            }
            
            // Deshabilitar el botón mientras se procesa
            const submitBtn = loginForm.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<span class="loading"></span> Iniciando sesión...';
            
            try {
                const success = await authManager.login(username, password);
                
                if (success) {
                    // Limpiar formulario
                    loginForm.reset();
                }
            } finally {
                // Rehabilitar el botón
                submitBtn.disabled = false;
                submitBtn.textContent = originalText;
            }
        });
    }

    // Manejar botón de logout
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            authManager.logout();
        });
    }

    // Auto-completar campos de login para desarrollo
    const usernameField = document.getElementById('username');
    const passwordField = document.getElementById('password');
    
    if (usernameField && !usernameField.value) {
        usernameField.value = 'admin';
    }
    
    if (passwordField && !passwordField.value) {
        passwordField.value = 'admin123';
    }
});

// Interceptor para manejar errores de autenticación en las peticiones API
const originalRequest = api.request;
api.request = async function(endpoint, options = {}) {
    try {
        return await originalRequest.call(this, endpoint, options);
    } catch (error) {
        // Si el error es de autenticación, cerrar sesión
        if (error.message && (
            error.message.includes('Token') || 
            error.message.includes('Unauthorized') ||
            error.message.includes('403') ||
            error.message.includes('401')
        )) {
            authManager.logout();
        }
        throw error;
    }
};

// Función para verificar permisos
function requireAuth() {
    if (!authManager.isAuthenticated()) {
        authManager.showLoginScreen();
        return false;
    }
    return true;
}

function requireAdmin() {
    if (!authManager.isAuthenticated()) {
        authManager.showLoginScreen();
        return false;
    }
    
    if (!authManager.isAdmin()) {
        showNotification('No tienes permisos para realizar esta acción', 'error');
        return false;
    }
    
    return true;
}

// Exportar funciones globales
window.authManager = authManager;
window.requireAuth = requireAuth;
window.requireAdmin = requireAdmin;
