-- ========================================================================
-- MIGRACIÓN: Asegurar que property_unit_id existe en la tabla votes
-- ========================================================================
-- 
-- Esta migración verifica y crea la columna property_unit_id en votes
-- si no existe, y migra los datos existentes
--
-- ========================================================================

BEGIN;

-- PASO 1: Verificar si property_unit_id existe
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'horizontal_property' 
        AND table_name = 'votes' 
        AND column_name = 'property_unit_id'
    ) THEN
        RAISE NOTICE 'Creando columna property_unit_id en votes...';
        
        -- Crear la columna property_unit_id
        ALTER TABLE horizontal_property.votes 
        ADD COLUMN property_unit_id INTEGER;
        
        -- Migrar datos existentes (si hay votos con resident_id)
        -- Esto asume que ya ejecutaste la migración anterior
        UPDATE horizontal_property.votes 
        SET property_unit_id = (
            SELECT ru.property_unit_id 
            FROM horizontal_property.resident_units ru 
            WHERE ru.resident_id = votes.resident_id 
            AND ru.is_main_resident = true
            LIMIT 1
        )
        WHERE property_unit_id IS NULL 
        AND EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_schema = 'horizontal_property' 
            AND table_name = 'votes' 
            AND column_name = 'resident_id'
        );
        
        -- Hacer property_unit_id NOT NULL
        ALTER TABLE horizontal_property.votes 
        ALTER COLUMN property_unit_id SET NOT NULL;
        
        -- Crear índice para property_unit_id
        CREATE INDEX idx_votes_property_unit_id ON horizontal_property.votes(property_unit_id);
        
        -- Crear nuevo índice único (voting_id, property_unit_id)
        CREATE UNIQUE INDEX idx_voting_property_unit_vote 
        ON horizontal_property.votes(voting_id, property_unit_id);
        
        -- Crear foreign key constraint para property_unit_id
        ALTER TABLE horizontal_property.votes 
        ADD CONSTRAINT fk_horizontal_property_property_units_votes 
        FOREIGN KEY (property_unit_id) 
        REFERENCES horizontal_property.property_units(id) 
        ON UPDATE CASCADE ON DELETE CASCADE;
        
        RAISE NOTICE 'Columna property_unit_id creada exitosamente';
    ELSE
        RAISE NOTICE 'La columna property_unit_id ya existe';
    END IF;
END $$;

COMMIT;

-- ========================================================================
-- VERIFICACIÓN POST-MIGRACIÓN
-- ========================================================================

-- Verificar estructura de la tabla votes
SELECT 
    'Estructura actual de votes' as descripcion,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'horizontal_property' 
AND table_name = 'votes'
ORDER BY ordinal_position;

-- Verificar constraints
SELECT 
    'Constraints de votes' as descripcion,
    constraint_name,
    constraint_type
FROM information_schema.table_constraints 
WHERE table_schema = 'horizontal_property' 
AND table_name = 'votes';

-- Verificar índices
SELECT 
    'Índices de votes' as descripcion,
    indexname,
    indexdef
FROM pg_indexes 
WHERE schemaname = 'horizontal_property' 
AND tablename = 'votes';
