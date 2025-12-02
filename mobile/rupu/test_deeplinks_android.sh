#!/bin/bash

# Script de prueba de deeplinks para Android
# Asegúrate de tener un dispositivo o emulador conectado

PACKAGE="com.rupu.app"
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

echo "🧪 Probando deeplinks en Android..."
echo "===================================="
echo ""

# Verificar que hay un dispositivo conectado
if ! adb devices | grep -q "device$"; then
    echo "❌ Error: No se encontró ningún dispositivo conectado"
    echo "   Conecta un dispositivo o inicia un emulador"
    exit 1
fi

echo "✅ Dispositivo conectado detectado"
echo ""

# Verificar que la app está instalada
if ! adb shell pm list packages | grep -q "$PACKAGE"; then
    echo "❌ Error: La app $PACKAGE no está instalada"
    echo "   Instala la app primero con: flutter run"
    exit 1
fi

echo "✅ App $PACKAGE encontrada"
echo ""
echo "Iniciando pruebas de deeplinks..."
echo ""

for deeplink in "${DEEPLINKS[@]}"
do
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "📱 Probando: $deeplink"
    echo ""
    
    # Ejecutar el deeplink
    adb shell am start -W -a android.intent.action.VIEW -d "$deeplink" $PACKAGE 2>&1 | grep -E "(Starting|Error|Warning)"
    
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
echo "   - Package: $PACKAGE"
echo ""
echo "💡 Verifica que la app navegó correctamente a cada pantalla"
