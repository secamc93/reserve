# Debug Guide - Deeplink GoException Issue

## Estado Actual

El error persiste:
```
GoException: routes for location: rupu://home/0/horizontal-properties
```

## Pasos de Diagnóstico

### 1. ¿Reconstruiste la app?

**CRÍTICO**: Después de cambiar `main.dart`, DEBES reconstruir completamente:

```bash
# Detén la app si está corriendo
# Luego ejecuta:
flutter clean
flutter run
```

Sin esto, la app sigue usando la versión anterior con `GetMaterialApp.router`.

### 2. Verifica que el cambio se aplicó

Abre `lib/main.dart` y verifica que la línea 20 diga:
```dart
return MaterialApp.router(  // ✅ Correcto
```

NO debe decir:
```dart
return GetMaterialApp.router(  // ❌ Incorrecto
```

### 3. Información necesaria para debugging

Si ya reconstruiste la app y sigue el error, necesito:

1. **Plataforma**: ¿iOS o Android?
2. **Logs completos**: Copia TODA la salida de la consola cuando ejecutas el deeplink
3. **Estado de la app**: ¿La app está cerrada, en background, o abierta cuando ejecutas el deeplink?
4. **Versión de Flutter**: Ejecuta `flutter --version` y pega el resultado

### 4. Comandos para obtener logs detallados

**iOS**:
```bash
# Inicia la app con logs
flutter run --verbose

# En otra terminal, ejecuta el deeplink
xcrun simctl openurl booted "rupu://home/0/horizontal-properties"

# Copia TODA la salida de la primera terminal
```

**Android**:
```bash
# Inicia la app con logs
flutter run --verbose

# En otra terminal, ejecuta el deeplink
adb shell am start -W -a android.intent.action.VIEW -d "rupu://home/0/horizontal-properties" com.rupu.app

# Copia TODA la salida de la primera terminal
```

## Posibles Causas Adicionales

Si MaterialApp.router no resuelve el problema, podría ser:

1. **Hot reload no es suficiente**: Necesitas reinicio completo (`flutter run`)
2. **Cache de iOS/Android**: Necesitas desinstalar la app del simulador/emulador
3. **Configuración de go_router**: Puede necesitar configuración adicional
4. **Package name incorrecto**: El package name en AndroidManifest debe coincidir

## Próximos Pasos

Por favor confirma:
- [ ] ¿Ejecutaste `flutter clean` y `flutter run`?
- [ ] ¿El cambio está en `main.dart` (MaterialApp.router)?
- [ ] ¿Qué plataforma estás probando?
- [ ] ¿Puedes pegar los logs completos?
