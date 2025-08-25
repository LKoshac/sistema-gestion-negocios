class UsersManager {
    constructor() {
        this.users = [];
        this.init();
    }

    init() {
        const addBtn = document.getElementById('add-user-btn');
        if (addBtn) {
            addBtn.addEventListener('click', () => this.showAddUserModal());
        }
    }

    async load() {
        if (!requireAdmin()) return;

        try {
            app.showTableLoading('users-table-body');
            this.users = await api.getUsers();
            this.renderTable();
        } catch (error) {
            console.error('Error cargando usuarios:', error);
            app.showEmptyTable('users-table-body', 'Error cargando datos', 6);
        }
    }

    renderTable() {
        const tbody = document.getElementById('users-table-body');
        if (!tbody) return;

        if (this.users.length === 0) {
            app.showEmptyTable('users-table-body', 'No hay usuarios registrados', 6);
            return;
        }

        tbody.innerHTML = this.users.map(user => `
            <tr>
                <td>${user.username}</td>
                <td>${user.nombre} ${user.apellido}</td>
                <td>${user.email}</td>
                <td>${app.createStatusBadge(user.role === 'admin' ? 'normal' : 'low', capitalize(user.role))}</td>
                <td>${app.createStatusBadge(user.activo ? 'active' : 'inactive', user.activo ? 'Activo' : 'Inactivo')}</td>
                <td>
                    ${app.createActionButtons([
                        { text: 'Editar', class: 'btn-secondary', onclick: `usersManager.editUser(${user.id})` },
                        { text: 'Eliminar', class: 'btn-danger', onclick: `usersManager.deleteUser(${user.id})` }
                    ])}
                </td>
            </tr>
        `).join('');
    }

    showAddUserModal() {
        if (!requireAdmin()) return;

        const modalContent = `
            <form id="user-form">
                <div class="form-group">
                    <label>Nombre de Usuario *</label>
                    <input type="text" name="username" required>
                </div>
                <div class="form-group">
                    <label>Email *</label>
                    <input type="email" name="email" required>
                </div>
                <div class="form-group">
                    <label>Contraseña *</label>
                    <input type="password" name="password" required minlength="6">
                </div>
                <div class="form-group">
                    <label>Nombre *</label>
                    <input type="text" name="nombre" required>
                </div>
                <div class="form-group">
                    <label>Apellido *</label>
                    <input type="text" name="apellido" required>
                </div>
                <div class="form-group">
                    <label>Teléfono</label>
                    <input type="tel" name="telefono">
                </div>
                <div class="form-group">
                    <label>Rol *</label>
                    <select name="role" required>
                        <option value="">Seleccionar...</option>
                        <option value="empleado">Empleado</option>
                        <option value="admin">Administrador</option>
                    </select>
                </div>
                <div class="flex gap-2 justify-between mt-4">
                    <button type="button" class="btn-secondary" onclick="closeModal()">Cancelar</button>
                    <button type="submit" class="btn-primary">Crear Usuario</button>
                </div>
            </form>
        `;

        app.showModal('Crear Usuario', modalContent);

        const form = document.getElementById('user-form');
        form.addEventListener('submit', (e) => this.handleSubmit(e));
    }

    async handleSubmit(e) {
        e.preventDefault();
        
        if (!app.validateForm(e.target)) {
            showNotification('Por favor complete los campos requeridos', 'warning');
            return;
        }

        const formData = new FormData(e.target);
        const userData = Object.fromEntries(formData.entries());

        // Validar email
        if (!isValidEmail(userData.email)) {
            showNotification('Por favor ingrese un email válido', 'warning');
            return;
        }

        // Validar contraseña
        if (userData.password.length < 6) {
            showNotification('La contraseña debe tener al menos 6 caracteres', 'warning');
            return;
        }

        try {
            await api.createUser(userData);
            showNotification('Usuario creado exitosamente', 'success');
            app.closeModal();
            this.load();
        } catch (error) {
            showNotification(error.message || 'Error creando usuario', 'error');
        }
    }

    async editUser(id) {
        showNotification('Función de edición en desarrollo', 'info');
    }

    async deleteUser(id) {
        if (!requireAdmin()) return;

        const confirmed = await app.confirmAction('¿Está seguro de eliminar este usuario?');
        if (!confirmed) return;

        try {
            await api.deleteUser(id);
            showNotification('Usuario eliminado exitosamente', 'success');
            this.load();
        } catch (error) {
            showNotification(error.message || 'Error eliminando usuario', 'error');
        }
    }
}

window.UsersManager = UsersManager;
const usersManager = new UsersManager();
window.usersManager = usersManager;
