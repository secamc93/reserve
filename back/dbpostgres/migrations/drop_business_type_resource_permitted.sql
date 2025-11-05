-- Migración para eliminar la tabla BusinessTypeResourcePermitted
-- Esta tabla ya no es necesaria porque Resource tiene una relación directa con BusinessType

-- PASO 1: Eliminar las restricciones de foreign key en business_resource_configured
ALTER TABLE business_resource_configured 
DROP CONSTRAINT IF EXISTS fk_business_resource_configured_business_type_resource_permitted;

-- PASO 2: Eliminar la columna business_type_resource_permitted_id de business_resource_configured
ALTER TABLE business_resource_configured 
DROP COLUMN IF EXISTS business_type_resource_permitted_id;

-- PASO 3: Eliminar la columna business_type_id de business_resource_configured
-- (ya no es necesaria porque business_type_id se obtiene de resources a través de resource_id)
ALTER TABLE business_resource_configured 
DROP COLUMN IF EXISTS business_type_id;

-- PASO 4: Eliminar las restricciones de foreign key en business_type_resource_permitted
ALTER TABLE business_type_resource_permitted 
DROP CONSTRAINT IF EXISTS fk_business_type_resource_permitted_business,
DROP CONSTRAINT IF EXISTS fk_business_type_resource_permitted_business_type,
DROP CONSTRAINT IF EXISTS fk_business_type_resource_permitted_resource;

-- PASO 5: Eliminar la tabla business_type_resource_permitted
DROP TABLE IF EXISTS business_type_resource_permitted CASCADE;

-- PASO 6: Eliminar restricción y relación en resources
ALTER TABLE resources 
DROP CONSTRAINT IF EXISTS fk_resources_business_type_resource_permitted;

-- NOTA IMPORTANTE:
-- - Las nuevas columnas (resource_id) y relaciones las agregará GORM automáticamente
--   al ejecutar las migraciones basándose en los modelos actualizados
-- - Esta query solo elimina las columnas y tablas antiguas

