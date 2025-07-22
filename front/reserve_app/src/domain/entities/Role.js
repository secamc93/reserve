export class Role {
    constructor(data) {
        if (!data) {
            throw new Error('Role data is required');
        }

        this.id = data.id;
        this.name = data.name;
        this.code = data.code;
        this.description = data.description;
        this.level = data.level;
        this.isSystem = data.is_system;
        this.scopeId = data.scope_id;
        this.scopeName = data.scope_name;
        this.scopeCode = data.scope_code;
    }

    isHighLevel() {
        return this.level >= 90;
    }

    toString() {
        return this.name;
    }
} 