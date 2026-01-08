-- Seed data: Estados de paquete iniciales
-- Ejecutar con: psql -d tu_base_de_datos -f 003_package_statuses_seed.sql

-- Insertar estados de paquete si no existen
INSERT INTO horizontal_property.package_statuses (code, name, description, is_final, is_active)
VALUES
    ('received', 'Recibido', 'Paquete recibido en portería', false, true),
    ('in_storage', 'En Almacén', 'Paquete en almacenamiento esperando entrega', false, true),
    ('notified', 'Notificado', 'Residente ha sido notificado de la llegada', false, true),
    ('delivered', 'Entregado', 'Paquete entregado al residente', true, true),
    ('returned', 'Retornado', 'Paquete retornado al remitente', true, true),
    ('lost', 'Perdido', 'Paquete reportado como perdido', true, true)
ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    is_final = EXCLUDED.is_final,
    is_active = EXCLUDED.is_active;

-- Mensaje de confirmación
DO $$
BEGIN
    RAISE NOTICE 'Estados de paquete insertados/actualizados exitosamente';
END $$;