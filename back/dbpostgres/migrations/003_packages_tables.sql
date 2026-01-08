-- Migration: Crear tablas del modulo de paquetes
-- Ejecutar con: psql -d tu_base_de_datos -f 003_packages_tables.sql

-- Asegurar que el esquema existe
CREATE SCHEMA IF NOT EXISTS horizontal_property;

-- ============================================
-- Tabla: package_statuses (Estados de paquete)
-- ============================================
CREATE TABLE IF NOT EXISTS horizontal_property.package_statuses (
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

-- Comentario de la tabla
COMMENT ON TABLE horizontal_property.package_statuses IS 'Estados posibles de un paquete en el sistema';

-- ============================================
-- Tabla: packages (Paquetes)
-- ============================================
CREATE TABLE IF NOT EXISTS horizontal_property.packages (
    id SERIAL PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMPTZ,
    business_id INTEGER NOT NULL,
    property_unit_id INTEGER NOT NULL,
    resident_id INTEGER,
    package_status_id INTEGER NOT NULL,
    carrier VARCHAR(100),
    tracking_number VARCHAR(100),
    qr_code VARCHAR(500),
    received_by_user_id INTEGER,
    received_at TIMESTAMPTZ,
    delivered_by_user_id INTEGER,
    delivered_at TIMESTAMPTZ,
    description VARCHAR(500),
    notes TEXT,
    notify_resident BOOLEAN DEFAULT TRUE,
    notification_sent_at TIMESTAMPTZ
);

-- Comentario de la tabla
COMMENT ON TABLE horizontal_property.packages IS 'Registro de paquetes recibidos en la propiedad horizontal';

-- ============================================
-- Indices para optimizar consultas
-- ============================================
CREATE INDEX IF NOT EXISTS idx_packages_business_id ON horizontal_property.packages(business_id);
CREATE INDEX IF NOT EXISTS idx_packages_property_unit_id ON horizontal_property.packages(property_unit_id);
CREATE INDEX IF NOT EXISTS idx_packages_resident_id ON horizontal_property.packages(resident_id);
CREATE INDEX IF NOT EXISTS idx_packages_package_status_id ON horizontal_property.packages(package_status_id);
CREATE INDEX IF NOT EXISTS idx_packages_tracking_number ON horizontal_property.packages(tracking_number);
CREATE INDEX IF NOT EXISTS idx_packages_qr_code ON horizontal_property.packages(qr_code);
CREATE INDEX IF NOT EXISTS idx_packages_received_at ON horizontal_property.packages(received_at);
CREATE INDEX IF NOT EXISTS idx_packages_delivered_at ON horizontal_property.packages(delivered_at);
CREATE INDEX IF NOT EXISTS idx_packages_created_at ON horizontal_property.packages(created_at);

-- Indice para soft delete
CREATE INDEX IF NOT EXISTS idx_packages_deleted_at ON horizontal_property.packages(deleted_at);
CREATE INDEX IF NOT EXISTS idx_package_statuses_deleted_at ON horizontal_property.package_statuses(deleted_at);

-- ============================================
-- Seed data: Estados de paquete iniciales
-- ============================================
INSERT INTO horizontal_property.package_statuses (code, name, description, is_final, is_active)
VALUES
    ('received', 'Recibido', 'Paquete recibido en porteria', false, true),
    ('in_storage', 'En Almacen', 'Paquete en almacenamiento esperando entrega', false, true),
    ('notified', 'Notificado', 'Residente ha sido notificado de la llegada', false, true),
    ('delivered', 'Entregado', 'Paquete entregado al residente', true, true),
    ('returned', 'Retornado', 'Paquete retornado al remitente', true, true),
    ('lost', 'Perdido', 'Paquete reportado como perdido', true, true)
ON CONFLICT (code) DO NOTHING;

-- ============================================
-- Mensaje de confirmacion
-- ============================================
DO $$
BEGIN
    RAISE NOTICE 'Migracion de tablas de paquetes completada exitosamente';
END $$;
