#!/bin/bash

# ========================================================================
# Script para ejecutar migración completa de VOTES de RESIDENT a PROPERTY_UNIT
# ========================================================================

echo "🔄 Iniciando migración completa de votos de residentes a unidades..."

# Configuración de base de datos
DB_HOST="localhost"
DB_PORT="5432"
DB_NAME="central_reserve"
DB_USER="postgres"
DB_PASSWORD="postgres"

echo "📝 Paso 1: Asegurando que property_unit_id existe en votes..."
psql -h $DB_HOST -p $DB_PORT -d $DB_NAME -U $DB_USER -f dbpostgres/migrations/ensure_property_unit_id_in_votes.sql

if [ $? -eq 0 ]; then
    echo "✅ Paso 1 completado: property_unit_id configurado"
else
    echo "❌ Error en Paso 1. Revisar logs."
    exit 1
fi

echo ""
echo "📝 Paso 2: Eliminando columna resident_id de votes..."
psql -h $DB_HOST -p $DB_PORT -d $DB_NAME -U $DB_USER -f dbpostgres/migrations/remove_resident_id_from_votes.sql

if [ $? -eq 0 ]; then
    echo "✅ Paso 2 completado: resident_id eliminado"
else
    echo "❌ Error en Paso 2. Revisar logs."
    exit 1
fi

echo ""
echo "🎉 Migración completada exitosamente!"
echo ""
echo "📊 Resumen de cambios:"
echo "1. ✅ Columna property_unit_id agregada a votes"
echo "2. ✅ Índices y constraints actualizados"
echo "3. ✅ Columna resident_id eliminada"
echo "4. ✅ Datos migrados correctamente"
echo ""
echo "⚠️  IMPORTANTE: El sistema ahora usa PropertyUnitID en lugar de ResidentID"
echo "   - Los votos están relacionados con unidades residenciales"
echo "   - Los residentes pueden cambiar sin afectar los votos"
echo "   - Cada unidad tiene derecho a voto"
