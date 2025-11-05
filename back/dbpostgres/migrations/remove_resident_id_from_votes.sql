-- ========================================================================
-- MIGRACIÓN: Eliminar columna resident_id de la tabla votes
-- ========================================================================
-- 
-- Esta migración elimina la columna resident_id de la tabla votes
-- ya que ahora los votos están relacionados con property_unit_id
--
-- ========================================================================

BEGIN;

-- PASO 1: Verificar que la columna resident_id existe
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'horizontal_property' 
        AND table_name = 'votes' 
        AND column_name = 'resident_id'
    ) THEN
        RAISE NOTICE 'La columna resident_id ya no existe en la tabla votes';
    ELSE
        RAISE NOTICE 'Eliminando columna resident_id de la tabla votes...';
    END IF;
END $$;

-- PASO 2: Eliminar foreign key constraint si existe
ALTER TABLE horizontal_property.votes 
DROP CONSTRAINT IF EXISTS fk_horizontal_property_residents_votes;

-- PASO 3: Eliminar índice único anterior si existe
DROP INDEX IF EXISTS horizontal_property.idx_voting_resident_vote;

-- PASO 4: Eliminar índice de resident_id si existe
DROP INDEX IF EXISTS horizontal_property.idx_votes_resident_id;

-- PASO 5: Eliminar la columna resident_id
ALTER TABLE horizontal_property.votes 
DROP COLUMN IF EXISTS resident_id;

COMMIT;

-- ========================================================================
-- VERIFICACIÓN POST-MIGRACIÓN
-- ========================================================================

-- Verificar que la columna resident_id fue eliminada
SELECT 
    'Verificación de eliminación de resident_id' as descripcion,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_schema = 'horizontal_property' 
            AND table_name = 'votes' 
            AND column_name = 'resident_id'
        ) THEN '❌ ERROR: La columna resident_id aún existe'
        ELSE '✅ ÉXITO: La columna resident_id fue eliminada correctamente'
    END as resultado;

-- Verificar que la columna property_unit_id existe
SELECT 
    'Verificación de property_unit_id' as descripcion,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_schema = 'horizontal_property' 
            AND table_name = 'votes' 
            AND column_name = 'property_unit_id'
        ) THEN '✅ ÉXITO: La columna property_unit_id existe'
        ELSE '❌ ERROR: La columna property_unit_id no existe'
    END as resultado;

-- Mostrar estructura actual de la tabla votes
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'horizontal_property' 
AND table_name = 'votes'
ORDER BY ordinal_position;
