-- ========================================================================
-- MIGRACIÓN: Agregar property_unit_id a la tabla votes
-- ========================================================================
-- 
-- Esta migración agrega la columna property_unit_id a votes y migra
-- los datos existentes desde resident_id
--
-- ========================================================================

-- PASO 1: Agregar columna property_unit_id como NULLABLE primero
ALTER TABLE horizontal_property.votes 
ADD COLUMN IF NOT EXISTS property_unit_id BIGINT;

-- PASO 2: Migrar datos existentes de resident_id a property_unit_id
-- Solo si la columna resident_id existe
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'horizontal_property' 
        AND table_name = 'votes' 
        AND column_name = 'resident_id'
    ) THEN
        -- Migrar datos existentes
        UPDATE horizontal_property.votes 
        SET property_unit_id = (
            SELECT ru.property_unit_id 
            FROM horizontal_property.resident_units ru 
            WHERE ru.resident_id = votes.resident_id 
            AND ru.is_main_resident = true
            LIMIT 1
        )
        WHERE property_unit_id IS NULL;
        
        RAISE NOTICE 'Datos migrados de resident_id a property_unit_id';
    ELSE
        RAISE NOTICE 'No hay columna resident_id, saltando migración de datos';
    END IF;
END $$;

-- PASO 3: Hacer property_unit_id NOT NULL
ALTER TABLE horizontal_property.votes 
ALTER COLUMN property_unit_id SET NOT NULL;

-- PASO 4: Crear índice para property_unit_id
CREATE INDEX IF NOT EXISTS idx_votes_property_unit_id 
ON horizontal_property.votes(property_unit_id);

-- PASO 5: Crear nuevo índice único (voting_id, property_unit_id)
DROP INDEX IF EXISTS horizontal_property.idx_voting_resident_vote;
CREATE UNIQUE INDEX IF NOT EXISTS idx_voting_property_unit_vote 
ON horizontal_property.votes(voting_id, property_unit_id);

-- PASO 6: Crear foreign key constraint para property_unit_id
ALTER TABLE horizontal_property.votes 
DROP CONSTRAINT IF EXISTS fk_horizontal_property_property_units_votes;
ALTER TABLE horizontal_property.votes 
ADD CONSTRAINT fk_horizontal_property_property_units_votes 
FOREIGN KEY (property_unit_id) 
REFERENCES horizontal_property.property_units(id) 
ON UPDATE CASCADE ON DELETE CASCADE;

-- PASO 7: Eliminar foreign key constraint anterior para resident_id si existe
ALTER TABLE horizontal_property.votes 
DROP CONSTRAINT IF EXISTS fk_horizontal_property_residents_votes;

-- PASO 8: Eliminar índice de resident_id si existe
DROP INDEX IF EXISTS horizontal_property.idx_votes_resident_id;

-- PASO 9: Eliminar la columna resident_id
ALTER TABLE horizontal_property.votes 
DROP COLUMN IF EXISTS resident_id;
