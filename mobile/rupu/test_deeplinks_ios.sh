#!/bin/bash

# Script de prueba de deeplinks para iOS
# Asegúrate de tener el simulador ejecutándose

DEEPLINKS=(
    "rupu://home/0"
    "rupu://home/0/perfil"
    "rupu://home/0/ajustes"
    "rupu://home/0/reserve"
    "rupu://home/0/users"
    "rupu://home/0/horizontal-properties"
    "rupu://login/0"
    "rupu://business/select"
)

echo "🧪 Probando deeplinks en iOS..."
echo "================================"
echo ""

# Verificar que hay un simulador ejecutándose
if ! xcrun simctl list devices | grep -q "Booted"; then
    echo "❌ Error: No hay ningún simulador ejecutándose"
    echo "   Inicia un simulador primero"
    echo ""
    echo "   Puedes hacerlo con:"
    echo "   - Abrir Xcode y ejecutar el simulador"
    echo "   - Desde terminal: open -a Simulator"
    exit 1
fi

echo "✅ Simulador detectado"
echo ""

# Obtener el ID del simulador en ejecución
BOOTED_DEVICE=$(xcrun simctl list devices | grep "Booted" | head -n 1)
echo "📱 Dispositivo: $BOOTED_DEVICE"
echo ""
echo "Iniciando pruebas de deeplinks..."
echo ""

for deeplink in "${DEEPLINKS[@]}"
do
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "📱 Probando: $deeplink"
    echo ""
    
    # Ejecutar el deeplink
    xcrun simctl openurl booted "$deeplink"
    
    if [ $? -eq 0 ]; then
        echo "✅ Deeplink enviado correctamente"
    else
        echo "❌ Error al enviar deeplink"
    fi
    
    echo "⏳ Esperando 3 segundos..."
    sleep 3
    echo ""
done

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "✨ Pruebas completadas!"
echo ""
echo "📊 Resumen:"
echo "   - Deeplinks probados: ${#DEEPLINKS[@]}"
echo ""
echo "💡 Verifica que la app navegó correctamente a cada pantalla"
