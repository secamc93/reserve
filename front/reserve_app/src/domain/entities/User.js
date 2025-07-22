export class User {
    constructor(data) {
        if (!data) {
            throw new Error('User data is required');
        }

        this.id = data.id;
        this.name = data.name;
        this.email = data.email;
        this.phone = data.phone;
        this.isActive = data.is_active;
        this.roles = data.roles || [];
        this.businesses = data.businesses || [];
        this.createdAt = new Date(data.created_at);
        this.updatedAt = new Date(data.updated_at);
        this.lastLoginAt = data.last_login_at ? new Date(data.last_login_at) : null;
    }

    hasRole(roleCode) {
        return this.roles.some(role => role.code === roleCode);
    }

    hasAnyRole(roleCodes) {
        return roleCodes.some(code => this.hasRole(code));
    }

    isSuperAdmin() {
        return this.hasRole('super_admin');
    }

    isAdmin() {
        return this.hasAnyRole(['admin', 'super_admin']);
    }

    getFormattedRoles() {
        return this.roles.map(role => role.name).join(', ');
    }

    getFormattedBusinesses() {
        return this.businesses.map(business => business.name).join(', ');
    }

    getDisplayName() {
        return `${this.name} (${this.email})`;
    }

    getStatusText() {
        return this.isActive ? 'Activo' : 'Inactivo';
    }

    getStatusColor() {
        return this.isActive ? '#28A745' : '#DC3545';
    }

    toString() {
        return this.getDisplayName();
    }
} 