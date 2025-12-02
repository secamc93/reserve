# Guía de Pruebas de Deeplinks - Rupu App

Esta guía te ayudará a probar los deeplinks de la aplicación Rupu tanto en Android como en iOS.

## 📋 Tabla de Contenidos

- [Deeplinks Disponibles](#deeplinks-disponibles)
- [Pruebas en Android](#pruebas-en-android)
- [Pruebas en iOS](#pruebas-en-ios)
- [Casos de Prueba](#casos-de-prueba)
- [Troubleshooting](#troubleshooting)

## 🔗 Deeplinks Disponibles

### Esquema Custom URL: `rupu://`

La aplicación está configurada para responder a los siguientes deeplinks:

| Deeplink | Descripción | Requiere Auth |
|----------|-------------|---------------|
| `rupu://home/0` | Ir al home | ✅ |
| `rupu://home/0/perfil` | Ver perfil | ✅ |
| `rupu://home/0/ajustes` | Ver ajustes | ✅ |
| `rupu://home/0/reserve` | Ver reservas | ✅ |
| `rupu://home/0/reserve/123` | Ver reserva específica (ID: 123) | ✅ |
| `rupu://home/0/users` | Ver usuarios | ✅ |
| `rupu://home/0/iam` | Ver IAM | ✅ |
| `rupu://home/0/horizontal-properties` | Ver propiedades horizontales | ✅ |
| `rupu://home/0/horizontal-properties/456` | Ver propiedad específica (ID: 456) | ✅ |
| `rupu://login/0` | Ir al login | ❌ |
| `rupu://business/select` | Selector de negocio | ✅ |

### Universal Links (Producción): `https://app.rupu.com/*`

Los mismos paths están disponibles con el esquema HTTPS:
- `https://app.rupu.com/home/0`
- `https://app.rupu.com/home/0/reserve`
- etc.

> **Nota**: Los Universal Links requieren configuración adicional en el servidor (archivo `.well-known/apple-app-site-association` para iOS y `assetlinks.json` para Android).

---

## 🤖 Pruebas en Android

### Requisitos
- Android Studio con ADB instalado
- Dispositivo Android físico o emulador en ejecución
- App instalada en el dispositivo/emulador

### Método 1: Usando ADB (Recomendado para pruebas)

#### 1. Verificar que el dispositivo esté conectado

```bash
adb devices
```

Deberías ver tu dispositivo listado. Si no, asegúrate de que esté conectado y que la depuración USB esté habilitada.

#### 2. Probar deeplinks básicos

```bash
# Ir al home
adb shell am start -W -a android.intent.action.VIEW -d "rupu://home/0" com.rupu.app

# Ir al login
adb shell am start -W -a android.intent.action.VIEW -d "rupu://login/0" com.rupu.app

# Ir al perfil
adb shell am start -W -a android.intent.action.VIEW -d "rupu://home/0/perfil" com.rupu.app

# Ir a reservas
adb shell am start -W -a android.intent.action.VIEW -d "rupu://home/0/reserve" com.rupu.app
```

#### 3. Probar deeplinks con parámetros

```bash
# Ver reserva con ID 123
adb shell am start -W -a android.intent.action.VIEW -d "rupu://home/0/reserve/123" com.rupu.app

# Ver propiedad horizontal con ID 456
adb shell am start -W -a android.intent.action.VIEW -d "rupu://home/0/horizontal-properties/456" com.rupu.app

# Ver usuario con ID 789
adb shell am start -W -a android.intent.action.VIEW -d "rupu://home/0/users/789" com.rupu.app
```

#### 4. Probar App Links (HTTPS)

```bash
# Ir al home con HTTPS
adb shell am start -W -a android.intent.action.VIEW -d "https://app.rupu.com/home/0" com.rupu.app

# Ver reserva con HTTPS
adb shell am start -W -a android.intent.action.VIEW -d "https://app.rupu.com/home/0/reserve/123" com.rupu.app
```

### Método 2: Usando Chrome en el dispositivo

1. Abre Chrome en tu dispositivo Android
2. Escribe el deeplink en la barra de direcciones:
   ```
   rupu://home/0
   ```
3. Chrome debería preguntar si quieres abrir la app Rupu
4. Selecciona "Abrir en Rupu"

### Método 3: Usando HTML de prueba

Crea un archivo HTML simple:

```html
<!DOCTYPE html>
<html>
<head>
    <title>Rupu Deeplink Test</title>
</head>
<body>
    <h1>Prueba de Deeplinks Rupu</h1>
    <ul>
        <li><a href="rupu://home/0">Ir al Home</a></li>
        <li><a href="rupu://home/0/perfil">Ver Perfil</a></li>
        <li><a href="rupu://home/0/reserve">Ver Reservas</a></li>
        <li><a href="rupu://home/0/reserve/123">Ver Reserva 123</a></li>
    </ul>
</body>
</html>
```

1. Súbelo a un servidor web o usa Python para servir localmente:
   ```bash
   python3 -m http.server 8000
   ```
2. Abre `http://localhost:8000` en Chrome en tu dispositivo
3. Toca los enlaces

### Verificar la configuración de intent-filters

```bash
# Ver todos los intent-filters de la app
adb shell dumpsys package com.rupu.app | grep -A 10 "android.intent.action.VIEW"
```

---

## 🍎 Pruebas en iOS

### Requisitos
- Xcode instalado
- Simulador iOS o dispositivo físico
- App instalada en el simulador/dispositivo

### Método 1: Usando xcrun simctl (Simulador)

#### 1. Listar simuladores disponibles

```bash
xcrun simctl list devices | grep Booted
```

#### 2. Abrir deeplinks en el simulador

```bash
# Ir al home
xcrun simctl openurl booted "rupu://home/0"

# Ir al login
xcrun simctl openurl booted "rupu://login/0"

# Ir al perfil
xcrun simctl openurl booted "rupu://home/0/perfil"

# Ver reserva específica
xcrun simctl openurl booted "rupu://home/0/reserve/123"

# Ver propiedad horizontal
xcrun simctl openurl booted "rupu://home/0/horizontal-properties/456"
```

### Método 2: Safari en el simulador/dispositivo

1. Abre Safari en el simulador o dispositivo
2. Escribe el deeplink en la barra de direcciones:
   ```
   rupu://home/0
   ```
3. Safari debería abrir automáticamente la app

### Método 3: Notas app

1. Abre la app **Notas** en iOS
2. Crea una nueva nota
3. Escribe el deeplink:
   ```
   rupu://home/0/reserve/123
   ```
4. Toca el enlace en la nota
5. La app debería abrirse

### Método 4: Envío por Mensaje/Email (Dispositivo Real)

1. Envíate un mensaje o email con el deeplink
2. Toca el enlace
3. iOS debería preguntar si quieres abrir en Rupu

### Verificar configuración de URL Schemes

```bash
# Ver la configuración de Info.plist
/usr/libexec/PlistBuddy -c "Print CFBundleURLTypes" ios/Runner/Info.plist
```

---

## ✅ Casos de Prueba

### Prueba 1: App cerrada → Deeplink abre la app

1. **Cerrar completamente la app** (swipe up desde el app switcher)
2. Ejecutar deeplink:
   ```bash
   # Android
   adb shell am start -W -a android.intent.action.VIEW -d "rupu://home/0" com.rupu.app
   
   # iOS
   xcrun simctl openurl booted "rupu://home/0"
   ```
3. **Resultado esperado**: La app se abre y navega a la pantalla del home

### Prueba 2: App en background → Deeplink trae la app al frente

1. **Abrir la app y dejarla en background** (presionar home)
2. Ejecutar deeplink:
   ```bash
   # Android
   adb shell am start -W -a android.intent.action.VIEW -d "rupu://home/0/perfil" com.rupu.app
   
   # iOS
   xcrun simctl openurl booted "rupu://home/0/perfil"
   ```
3. **Resultado esperado**: La app vuelve al frente y navega a perfil

### Prueba 3: Navegación a pantalla específica con ID

1. Cerrar la app
2. Ejecutar deeplink con parámetro:
   ```bash
   # Android
   adb shell am start -W -a android.intent.action.VIEW -d "rupu://home/0/reserve/123" com.rupu.app
   
   # iOS
   xcrun simctl openurl booted "rupu://home/0/reserve/123"
   ```
3. **Resultado esperado**: La app se abre y navega al detalle de la reserva con ID 123

### Prueba 4: Ruta inválida

1. Ejecutar deeplink con ruta que no existe:
   ```bash
   # Android
   adb shell am start -W -a android.intent.action.VIEW -d "rupu://ruta-inexistente" com.rupu.app
   
   # iOS
   xcrun simctl openurl booted "rupu://ruta-inexistente"
   ```
2. **Resultado esperado**: La app se abre pero go_router maneja el error (puede redirigir a login o mostrar pantalla de error)

### Prueba 5: Autenticación requerida

1. **Cerrar sesión** en la app
2. Ejecutar deeplink a ruta protegida:
   ```bash
   # Android
   adb shell am start -W -a android.intent.action.VIEW -d "rupu://home/0/reserve" com.rupu.app
   
   # iOS
   xcrun simctl openurl booted "rupu://home/0/reserve"
   ```
3. **Resultado esperado**: La app debería redirigir al login o mostrar "No autorizado"

### Prueba 6: Múltiples deeplinks en secuencia

1. Ejecutar varios deeplinks uno tras otro:
   ```bash
   # Android
   adb shell am start -W -a android.intent.action.VIEW -d "rupu://home/0" com.rupu.app
   sleep 2
   adb shell am start -W -a android.intent.action.VIEW -d "rupu://home/0/perfil" com.rupu.app
   sleep 2
   adb shell am start -W -a android.intent.action.VIEW -d "rupu://home/0/ajustes" com.rupu.app
   ```
2. **Resultado esperado**: La app navega correctamente a cada pantalla

---

## 🔧 Troubleshooting

### Android

#### El deeplink no abre la app

**Verificar:**
1. ¿La app está instalada?
   ```bash
   adb shell pm list packages | grep rupu
   ```
2. ¿El package name es correcto en AndroidManifest.xml?
   - Debe coincidir con el usado en el comando ADB
3. ¿Los intent-filters están configurados correctamente?
   ```bash
   adb shell dumpsys package com.rupu.app | grep -A 10 "android.intent.action.VIEW"
   ```

#### El deeplink abre el navegador en lugar de la app

**Solución:**
1. Borra la asociación del navegador:
   ```bash
   adb shell pm clear com.android.chrome
   ```
2. Intenta el deeplink nuevamente

#### Verificar logs

```bash
# Ver logs de la app
adb logcat | grep rupu

# Ver logs de intents
adb logcat | grep Intent
```

### iOS

#### El deeplink no abre la app

**Verificar:**
1. ¿La app está instalada en el simulador?
2. ¿El URL scheme está configurado en Info.plist?
   ```bash
   /usr/libexec/PlistBuddy -c "Print CFBundleURLTypes" ios/Runner/Info.plist
   ```
3. ¿El simulador está en ejecución?
   ```bash
   xcrun simctl list devices | grep Booted
   ```

#### Safari no reconoce el deeplink

**Solución:**
1. Cierra Safari completamente
2. Reinicia el simulador
3. Intenta nuevamente

#### Ver logs del simulador

```bash
# Ver logs en tiempo real
xcrun simctl spawn booted log stream --predicate 'processImagePath contains "Runner"'
```

---

## 🚀 Script de Prueba Automatizado

### Android - test_deeplinks_android.sh

Crea este script para probar múltiples deeplinks automáticamente:

```bash
#!/bin/bash

PACKAGE="com.rupu.app"
DEEPLINKS=(
    "rupu://home/0"
    "rupu://home/0/perfil"
    "rupu://home/0/ajustes"
    "rupu://home/0/reserve"
    "rupu://login/0"
)

echo "🧪 Probando deeplinks en Android..."
echo "=================================="

for deeplink in "${DEEPLINKS[@]}"
do
    echo ""
    echo "📱 Probando: $deeplink"
    adb shell am start -W -a android.intent.action.VIEW -d "$deeplink" $PACKAGE
    echo "✅ Deeplink enviado"
    sleep 3
done

echo ""
echo "✨ Pruebas completadas!"
```

Hazlo ejecutable y corre:
```bash
chmod +x test_deeplinks_android.sh
./test_deeplinks_android.sh
```

### iOS - test_deeplinks_ios.sh

```bash
#!/bin/bash

DEEPLINKS=(
    "rupu://home/0"
    "rupu://home/0/perfil"
    "rupu://home/0/ajustes"
    "rupu://home/0/reserve"
    "rupu://login/0"
)

echo "🧪 Probando deeplinks en iOS..."
echo "=================================="

for deeplink in "${DEEPLINKS[@]}"
do
    echo ""
    echo "📱 Probando: $deeplink"
    xcrun simctl openurl booted "$deeplink"
    echo "✅ Deeplink enviado"
    sleep 3
done

echo ""
echo "✨ Pruebas completadas!"
```

Hazlo ejecutable y corre:
```bash
chmod +x test_deeplinks_ios.sh
./test_deeplinks_ios.sh
```

---

## 📝 Notas Adicionales

### Configuración para Producción (Universal Links / App Links)

Para habilitar Universal Links (iOS) y App Links (Android) en producción, necesitas:

#### iOS - Universal Links

1. Crear archivo `.well-known/apple-app-site-association` en tu servidor:
   ```json
   {
     "applinks": {
       "apps": [],
       "details": [
         {
           "appID": "TEAM_ID.com.rupu.app",
           "paths": ["*"]
         }
       ]
     }
   }
   ```
2. Subir a `https://app.rupu.com/.well-known/apple-app-site-association`
3. Agregar el dominio en Xcode: Signing & Capabilities → Associated Domains → `applinks:app.rupu.com`

#### Android - App Links

1. Crear archivo `assetlinks.json`:
   ```json
   [{
     "relation": ["delegate_permission/common.handle_all_urls"],
     "target": {
       "namespace": "android_app",
       "package_name": "com.rupu.app",
       "sha256_cert_fingerprints": ["YOUR_CERT_FINGERPRINT"]
     }
   }]
   ```
2. Subir a `https://app.rupu.com/.well-known/assetlinks.json`
3. Obtener el fingerprint:
   ```bash
   keytool -list -v -keystore your-release-key.keystore
   ```

### Recursos Útiles

- [go_router Documentation](https://pub.dev/packages/go_router)
- [Android Deep Links](https://developer.android.com/training/app-links)
- [iOS Universal Links](https://developer.apple.com/ios/universal-links/)
- [Flutter Deep Linking](https://docs.flutter.dev/development/ui/navigation/deep-linking)

---

¡Feliz testing! 🎉
