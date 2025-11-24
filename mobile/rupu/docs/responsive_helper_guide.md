# ResponsiveHelper - Guía de Uso

## Descripción

`ResponsiveHelper` es una clase helper que proporciona utilidades para crear diseños responsivos que se adapten a diferentes tamaños de pantalla (móvil, tablet, iPad, desktop).

## Breakpoints

El helper utiliza los siguientes breakpoints estándar:

- **Móvil**: < 600px
- **Tablet**: 600px - 899px  
- **Tablet Grande/iPad Pro**: 900px - 1199px
- **Desktop**: >= 1200px

## Métodos Principales

### Detección de Dispositivo

```dart
// Verificar si es tablet o mayor (>= 600px)
if (ResponsiveHelper.isTablet(context)) {
  // Mostrar layout para tablet
}

// Verificar si es tablet grande (>= 900px)
if (ResponsiveHelper.isLargeTablet(context)) {
  // Mostrar layout para iPad Pro o tablets grandes
}

// Verificar si es desktop (>= 1200px)
if (ResponsiveHelper.isDesktop(context)) {
  // Mostrar layout para desktop
}

// Verificar si es solo móvil (< 600px)
if (ResponsiveHelper.isMobile(context)) {
  // Mostrar layout para móvil
}

// Verificar orientación
if (ResponsiveHelper.isLandscape(context)) {
  // Ajustar para modo horizontal
}

// Obtener tipo de dispositivo como enum
final deviceType = ResponsiveHelper.getDeviceType(context);
switch (deviceType) {
  case DeviceType.mobile:
    // Layout móvil
    break;
  case DeviceType.tablet:
    // Layout tablet
    break;
  case DeviceType.largeTablet:
    // Layout tablet grande
    break;
  case DeviceType.desktop:
    // Layout desktop
    break;
}
```

### Valores Adaptativos

```dart
// Obtener valor adaptativo según tamaño de pantalla
final padding = ResponsiveHelper.value<double>(
  context,
  mobile: 16.0,
  tablet: 24.0,
  largeTablet: 32.0,
  desktop: 40.0,
);

// Ejemplo con widgets
final Widget icon = ResponsiveHelper.value<Widget>(
  context,
  mobile: Icon(Icons.menu, size: 24),
  tablet: Icon(Icons.menu, size: 32),
);
```

### Métodos de Conveniencia

```dart
// Obtener columnas para grid
final columns = ResponsiveHelper.getGridColumns(context);
// Móvil: 1, Tablet: 2, Tablet Grande: 3, Desktop: 4

// Obtener columnas personalizadas
final customColumns = ResponsiveHelper.getGridColumns(
  context,
  mobile: 1,
  tablet: 3,
  largeTablet: 4,
  desktop: 6,
);

// Padding adaptativo
final padding = ResponsiveHelper.getAdaptivePadding(context);
// Móvil: 16, Tablet: 24, Tablet Grande: 32, Desktop: 40

// Espaciado adaptativo
final spacing = ResponsiveHelper.getSpacing(context);

// Ancho máximo de contenido
final maxWidth = ResponsiveHelper.getMaxContentWidth(context);

// Tamaño de iconos adaptativo
final iconSize = ResponsiveHelper.getIconSize(context);

// Border radius adaptativo
final borderRadius = ResponsiveHelper.getBorderRadius(context);

// Escala de fuente adaptativa
final fontScale = ResponsiveHelper.getFontSizeScale(context);
```

### Builder Pattern

```dart
// Construir diferentes widgets según el tamaño de pantalla
ResponsiveHelper.builder(
  context,
  mobile: (context) => MobileLayout(),
  tablet: (context) => TabletLayout(),
  desktop: (context) => DesktopLayout(),
)

// Si no se proporciona un builder específico, se usa el más cercano
ResponsiveHelper.builder(
  context,
  mobile: (context) => MobileLayout(),
  tablet: (context) => TabletLayout(),
  // desktop usará TabletLayout por fallback
)
```

## Ejemplos Prácticos

### Ejemplo 1: Layout Responsivo Simple

```dart
class MyResponsiveView extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return ResponsiveHelper.builder(
      context,
      mobile: (context) => _MobileLayout(),
      tablet: (context) => _TabletLayout(),
    );
  }
}
```

### Ejemplo 2: Grid Adaptativo

```dart
GridView.builder(
  gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
    crossAxisCount: ResponsiveHelper.getGridColumns(context),
    crossAxisSpacing: ResponsiveHelper.getSpacing(context),
    mainAxisSpacing: ResponsiveHelper.getSpacing(context),
  ),
  itemBuilder: (context, index) => MyCard(),
)
```

### Ejemplo 3: Padding y Espaciado Adaptativo

```dart
Padding(
  padding: ResponsiveHelper.getAdaptivePadding(context),
  child: Column(
    children: [
      Text('Título'),
      SizedBox(height: ResponsiveHelper.getSpacing(context)),
      Text('Contenido'),
    ],
  ),
)
```

### Ejemplo 4: Tamaños Adaptativos Personalizados

```dart
Container(
  width: ResponsiveHelper.value(
    context,
    mobile: 100.0,
    tablet: 150.0,
    desktop: 200.0,
  ),
  height: ResponsiveHelper.value(
    context,
    mobile: 100.0,
    tablet: 150.0,
    desktop: 200.0,
  ),
  child: Image.asset('logo.png'),
)
```

### Ejemplo 5: Login View (Caso Real)

```dart
class LoginView extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: ResponsiveHelper.isTablet(context)
          ? _TabletLayout() // Split screen para tablets
          : _MobileLayout(), // Single column para móviles
    );
  }
}

class _MobileLayout extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    final isLandscape = ResponsiveHelper.isLandscape(context);
    
    return SingleChildScrollView(
      padding: ResponsiveHelper.getAdaptivePadding(context),
      child: Column(
        children: [
          Logo(
            height: isLandscape ? 80 : 140,
          ),
          SizedBox(height: isLandscape ? 16 : 48),
          LoginForm(),
        ],
      ),
    );
  }
}

class _TabletLayout extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    final isLargeTablet = ResponsiveHelper.isLargeTablet(context);
    
    return Row(
      children: [
        Expanded(
          flex: isLargeTablet ? 5 : 4,
          child: BrandingSection(),
        ),
        Expanded(
          flex: isLargeTablet ? 6 : 5,
          child: LoginFormSection(),
        ),
      ],
    );
  }
}
```

## Mejores Prácticas

1. **Usa los métodos de conveniencia**: En lugar de hacer cálculos manuales, usa `getSpacing()`, `getAdaptivePadding()`, etc.

2. **Consistencia**: Usa los mismos breakpoints en toda la app para mantener consistencia.

3. **Fallback**: Siempre proporciona al menos el valor `mobile` en `ResponsiveHelper.value()`.

4. **Performance**: Los métodos son ligeros y pueden llamarse en `build()` sin problemas.

5. **Orientación**: Considera tanto el tamaño como la orientación para móviles en landscape.

## Migración de Código Existente

### Antes (Manual):
```dart
final size = MediaQuery.sizeOf(context);
final isTablet = size.width >= 600;
final padding = isTablet ? 24.0 : 16.0;
```

### Después (Con ResponsiveHelper):
```dart
final isTablet = ResponsiveHelper.isTablet(context);
final padding = ResponsiveHelper.getSpacing(context);
```

## Archivo de Ubicación

`/lib/config/helpers/responsive_helper.dart`

## Importar en tus archivos

```dart
import 'package:rupu/config/helpers/responsive_helper.dart';
```
