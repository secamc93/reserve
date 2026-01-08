-- Migración: Crear tablas del módulo de visitas
-- Ejecutar con: psql -d tu_base_de_datos -f 002_visits_tables.sql

-- Asegurar que el esquema existe
CREATE SCHEMA IF NOT EXISTS horizontal_property;

-- Tabla: visit_types (Tipos de visita)
CREATE TABLE IF NOT EXISTS horizontal_property.visit_types (
    id SERIAL PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMPTZ,
    name VARCHAR(50) NOT NULL UNIQUE,
    code VARCHAR(20) NOT NULL UNIQUE,
    description VARCHAR(255),
    requires_authorization BOOLEAN DEFAULT FALSE,
    requires_vehicle_registration BOOLEAN DEFAULT FALSE,
    requires_companions BOOLEAN DEFAULT FALSE,
    requires_assets_tracking BOOLEAN DEFAULT FALSE,
    max_duration_hours INTEGER,
    default_duration_minutes INTEGER,
    is_active BOOLEAN DEFAULT TRUE
);

-- Tabla: visit_statuses (Estados de visita)
CREATE TABLE IF NOT EXISTS horizontal_property.visit_statuses (
    id SERIAL PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMPTZ,
    code VARCHAR(20) NOT NULL UNIQUE,
    name VARCHAR(50) NOT NULL,
    description VARCHAR(255),
    is_final BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE
);

-- Tabla: visitors (Visitantes - maestro)
CREATE TABLE IF NOT EXISTS horizontal_property.visitors (
    id SERIAL PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMPTZ,
    business_id INTEGER,
    dni VARCHAR(20) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    email VARCHAR(100),
    photo_url VARCHAR(500),
    has_blacklist BOOLEAN DEFAULT FALSE,
    is_verified BOOLEAN DEFAULT FALSE,
    last_visit_at TIMESTAMPTZ,
    total_visits INTEGER DEFAULT 0,
    notes TEXT,
    CONSTRAINT uq_visitor_dni_business UNIQUE (dni, business_id)
);

-- Tabla: visitor_vehicles (Vehículos de visitantes)
CREATE TABLE IF NOT EXISTS horizontal_property.visitor_vehicles (
    id SERIAL PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMPTZ,
    business_id INTEGER NOT NULL,
    visitor_id INTEGER,
    plate VARCHAR(20) NOT NULL,
    brand VARCHAR(50),
    model VARCHAR(50),
    color VARCHAR(30),
    year INTEGER,
    parking_slot_id INTEGER,
    parking_number VARCHAR(20),
    parking_zone VARCHAR(20),
    is_occupied BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    CONSTRAINT uq_business_vehicle_plate UNIQUE (business_id, plate)
);

-- Tabla: visits (Visitas)
CREATE TABLE IF NOT EXISTS horizontal_property.visits (
    id SERIAL PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMPTZ,
    business_id INTEGER NOT NULL,
    visitor_id INTEGER NOT NULL,
    property_unit_id INTEGER NOT NULL,
    resident_id INTEGER,
    visit_type_id INTEGER NOT NULL,
    visit_status_id INTEGER NOT NULL,
    visitor_vehicle_id INTEGER,
    scheduled_date DATE NOT NULL,
    scheduled_start_time TIMESTAMPTZ NOT NULL,
    scheduled_end_time TIMESTAMPTZ,
    actual_entry_time TIMESTAMPTZ,
    actual_exit_time TIMESTAMPTZ,
    duration_minutes INTEGER,
    authorization_code VARCHAR(20),
    qr_code VARCHAR(100),
    qr_code_expires_at TIMESTAMPTZ,
    authorized_by_resident_id INTEGER,
    authorization_date TIMESTAMPTZ,
    authorization_expires_at TIMESTAMPTZ,
    registered_by_user_id INTEGER,
    entry_registered_by_user_id INTEGER,
    exit_registered_by_user_id INTEGER,
    entry_gate VARCHAR(50),
    exit_gate VARCHAR(50),
    entry_method VARCHAR(20),
    purpose VARCHAR(255),
    number_of_visitors INTEGER DEFAULT 1,
    has_companions BOOLEAN DEFAULT FALSE,
    has_assets BOOLEAN DEFAULT FALSE,
    notes TEXT,
    is_recurring BOOLEAN DEFAULT FALSE,
    recurring_pattern_id INTEGER,
    parent_visit_id INTEGER,
    duration_exceeded BOOLEAN DEFAULT FALSE,
    duration_exceeded_at TIMESTAMPTZ,
    alert_sent BOOLEAN DEFAULT FALSE,
    notify_resident BOOLEAN DEFAULT TRUE,
    notify_security BOOLEAN DEFAULT FALSE,
    notification_sent_at TIMESTAMPTZ
);

-- Tabla: visit_companions (Acompañantes de visita)
CREATE TABLE IF NOT EXISTS horizontal_property.visit_companions (
    id SERIAL PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMPTZ,
    visit_id INTEGER NOT NULL,
    visitor_id INTEGER,
    companion_name VARCHAR(100) NOT NULL,
    companion_dni VARCHAR(20) NOT NULL,
    companion_phone VARCHAR(20),
    is_minor BOOLEAN DEFAULT FALSE,
    relationship VARCHAR(50),
    notes TEXT
);

-- Tabla: visit_assets (Activos/equipos de visita)
CREATE TABLE IF NOT EXISTS horizontal_property.visit_assets (
    id SERIAL PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMPTZ,
    visit_id INTEGER NOT NULL,
    asset_name VARCHAR(100) NOT NULL,
    asset_description VARCHAR(255),
    asset_serial VARCHAR(50),
    asset_brand VARCHAR(50),
    entry_registered BOOLEAN DEFAULT FALSE,
    entry_registered_at TIMESTAMPTZ,
    exit_registered BOOLEAN DEFAULT FALSE,
    exit_registered_at TIMESTAMPTZ,
    notes TEXT
);

-- Tabla: visit_blacklists (Lista negra de visitantes)
CREATE TABLE IF NOT EXISTS horizontal_property.visit_blacklists (
    id SERIAL PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMPTZ,
    business_id INTEGER NOT NULL,
    visitor_id INTEGER NOT NULL,
    reason VARCHAR(255) NOT NULL,
    blocked_by_user_id INTEGER,
    blocked_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMPTZ,
    is_permanent BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    notes TEXT
);

-- Tabla: visit_recurring_patterns (Patrones recurrentes)
CREATE TABLE IF NOT EXISTS horizontal_property.visit_recurring_patterns (
    id SERIAL PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMPTZ,
    business_id INTEGER NOT NULL,
    property_unit_id INTEGER NOT NULL,
    visit_type_id INTEGER NOT NULL,
    visitor_id INTEGER NOT NULL,
    visitor_vehicle_id INTEGER,
    pattern_type VARCHAR(20) NOT NULL,
    day_of_week INTEGER,
    day_of_month INTEGER,
    start_time TIME,
    end_time TIME,
    start_date DATE NOT NULL,
    end_date DATE,
    is_active BOOLEAN DEFAULT TRUE,
    notes TEXT
);

-- Tabla: visit_restrictions (Restricciones de visita)
CREATE TABLE IF NOT EXISTS horizontal_property.visit_restrictions (
    id SERIAL PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMPTZ,
    business_id INTEGER NOT NULL,
    visit_type_id INTEGER,
    property_unit_id INTEGER,
    start_time TIME,
    end_time TIME,
    days_of_week VARCHAR(20),
    max_visits_per_day INTEGER,
    is_active BOOLEAN DEFAULT TRUE,
    reason VARCHAR(255)
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_visits_business_id ON horizontal_property.visits(business_id);
CREATE INDEX IF NOT EXISTS idx_visits_visitor_id ON horizontal_property.visits(visitor_id);
CREATE INDEX IF NOT EXISTS idx_visits_property_unit_id ON horizontal_property.visits(property_unit_id);
CREATE INDEX IF NOT EXISTS idx_visits_scheduled_date ON horizontal_property.visits(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_visits_visit_type_id ON horizontal_property.visits(visit_type_id);
CREATE INDEX IF NOT EXISTS idx_visits_visit_status_id ON horizontal_property.visits(visit_status_id);
CREATE INDEX IF NOT EXISTS idx_visitors_business_id ON horizontal_property.visitors(business_id);
CREATE INDEX IF NOT EXISTS idx_visit_companions_visit_id ON horizontal_property.visit_companions(visit_id);
CREATE INDEX IF NOT EXISTS idx_visit_assets_visit_id ON horizontal_property.visit_assets(visit_id);
CREATE INDEX IF NOT EXISTS idx_visit_blacklists_business_id ON horizontal_property.visit_blacklists(business_id);
CREATE INDEX IF NOT EXISTS idx_visit_blacklists_visitor_id ON horizontal_property.visit_blacklists(visitor_id);

-- Insertar datos iniciales: Tipos de visita
INSERT INTO horizontal_property.visit_types (name, code, description, requires_authorization, requires_vehicle_registration, requires_companions, requires_assets_tracking, default_duration_minutes, is_active)
VALUES 
    ('Familiar', 'family', 'Visita de familiares', false, false, true, false, 240, true),
    ('Amigo', 'friend', 'Visita de amigos', false, false, true, false, 180, true),
    ('Delivery', 'delivery', 'Entregas a domicilio', false, false, false, false, 15, true),
    ('Servicio Técnico', 'technician', 'Personal de servicio técnico', true, false, false, true, 120, true),
    ('Proveedor', 'supplier', 'Proveedores y contratistas', true, true, true, true, 240, true),
    ('Otro', 'other', 'Otros tipos de visita', false, false, false, false, 60, true)
ON CONFLICT (code) DO NOTHING;

-- Insertar datos iniciales: Estados de visita
INSERT INTO horizontal_property.visit_statuses (code, name, description, is_final, is_active)
VALUES 
    ('pending', 'Pendiente', 'Visita programada pendiente de autorización', false, true),
    ('authorized', 'Autorizada', 'Visita autorizada por el residente', false, true),
    ('in_progress', 'En Curso', 'Visitante dentro del conjunto', false, true),
    ('completed', 'Completada', 'Visita finalizada correctamente', true, true),
    ('cancelled', 'Cancelada', 'Visita cancelada antes de realizarse', true, true),
    ('expired', 'Expirada', 'Visita expirada sin realizarse', true, true),
    ('rejected', 'Rechazada', 'Visita rechazada por el residente', true, true)
ON CONFLICT (code) DO NOTHING;

-- Mensaje de confirmación
DO $$
BEGIN
    RAISE NOTICE '✅ Migración de tablas de visitas completada exitosamente';
END $$;
