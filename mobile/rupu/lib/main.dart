import 'dart:async';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:rupu/config/routers/app_router.dart';
import 'package:rupu/config/theme/app_theme.dart';
import 'package:rupu/config/theme/app_theme_controller.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:syncfusion_localizations/syncfusion_localizations.dart';
import 'package:app_links/app_links.dart';
import 'package:rupu/presentation/views/login/login_controller.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  Get.put(AppThemeController());
  runApp(const MainApp());
}

/// Public helper class to manage deeplink navigation after authentication
class DeepLinkManager {
  static String? _pendingDeepLink;

  static String? get pendingDeepLink => _pendingDeepLink;

  static void setPendingDeepLink(String? path) {
    _pendingDeepLink = path;
  }

  static void navigateToPendingDeepLink() {
    if (_pendingDeepLink != null) {
      final path = _pendingDeepLink!;
      _pendingDeepLink = null;
      debugPrint('🔗 Navegando a deeplink pendiente después de login: $path');

      // Wait a bit to ensure session is fully initialized
      Future.delayed(const Duration(milliseconds: 800), () {
        try {
          appRouter.go(path);
        } catch (e) {
          debugPrint('❌ Error al navegar a deeplink pendiente: $e');
        }
      });
    }
  }
}

class MainApp extends StatefulWidget {
  const MainApp({super.key});

  @override
  State<MainApp> createState() => _MainAppState();
}

class _MainAppState extends State<MainApp> {
  late AppLinks _appLinks;
  StreamSubscription<Uri>? _linkSubscription;
  String? _pendingDeepLink;

  @override
  void initState() {
    super.initState();
    _initDeepLinks();
  }

  @override
  void dispose() {
    _linkSubscription?.cancel();
    super.dispose();
  }

  Future<void> _initDeepLinks() async {
    _appLinks = AppLinks();

    // Handle initial link if app was opened from a deeplink
    final initialUri = await _appLinks.getInitialLink();
    if (initialUri != null) {
      final path = _parseDeepLink(initialUri);
      if (path != null) {
        _processDeepLink(path);
      }
    }

    // Handle links while app is running
    _linkSubscription = _appLinks.uriLinkStream.listen(
      (uri) {
        final path = _parseDeepLink(uri);
        if (path != null) {
          // Navigate immediately for links while app is running
          _processDeepLink(path);
        }
      },
      onError: (err) {
        debugPrint('Error al procesar deeplink: $err');
      },
    );
  }

  String? _parseDeepLink(Uri uri) {
    debugPrint('📱 Deeplink recibido: $uri');
    debugPrint('   - scheme: ${uri.scheme}');
    debugPrint('   - host: ${uri.host}');
    debugPrint('   - path: ${uri.path}');

    String path;

    // For custom scheme (rupu://), we need to combine host + path
    if (uri.scheme == 'rupu' && uri.host.isNotEmpty) {
      path = '/${uri.host}${uri.path}';
    } else {
      // For https:// or other schemes, use path directly
      path = uri.path;
    }

    debugPrint('🔗 Path parseado: $path');
    return path;
  }

  void _processDeepLink(String path) {
    // Check if user is authenticated
    final isAuthenticated = _isUserAuthenticated();

    if (!isAuthenticated && !path.startsWith('/login')) {
      // User not authenticated and trying to access protected route
      debugPrint('⚠️ Usuario no autenticado. Guardando deeplink: $path');
      DeepLinkManager.setPendingDeepLink(path);
      _pendingDeepLink = path;

      // Redirect to login
      WidgetsBinding.instance.addPostFrameCallback((_) {
        _navigateWithRetry('/login/0');
      });
    } else {
      // User is authenticated or accessing login, proceed with navigation
      _navigateToPath(path);
    }
  }

  bool _isUserAuthenticated() {
    // Check if LoginController exists and has a valid session
    if (!Get.isRegistered<LoginController>()) {
      return false;
    }

    final loginController = Get.find<LoginController>();
    final hasSession = loginController.sessionModel.value != null;
    final hasBusinessSelected =
        loginController.selectedBusinessId != null ||
        loginController.isSuperAdmin;

    debugPrint(
      '🔐 Estado de autenticación: session=$hasSession, business=$hasBusinessSelected',
    );
    return hasSession && hasBusinessSelected;
  }

  void _navigateToPath(String path) {
    // Schedule navigation with retry logic
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _navigateWithRetry(path);
    });
  }

  Future<void> _navigateWithRetry(
    String path, {
    int attempt = 1,
    int maxAttempts = 5,
  }) async {
    try {
      // Wait a bit longer on first attempt to ensure router is ready
      if (attempt == 1) {
        await Future.delayed(const Duration(milliseconds: 500));
      }

      // Verify router is ready by checking if we can get current location
      final currentLocation = appRouter.routerDelegate.currentConfiguration.uri
          .toString();
      debugPrint('✅ Router listo. Ubicación actual: $currentLocation');

      // Use goNamed or push to avoid GlobalKey conflicts
      // Clear the navigation stack to prevent duplicate keys
      appRouter.go(path);
      debugPrint('✅ Navegación exitosa a: $path');

      // Clear pending deeplink
      if (_pendingDeepLink == path) {
        setState(() {
          _pendingDeepLink = null;
        });
      }
    } catch (e) {
      if (attempt < maxAttempts) {
        // Calculate exponential backoff: 100ms, 200ms, 400ms, 800ms, 1600ms
        final delayMs = 100 * (1 << (attempt - 1));
        debugPrint(
          '⚠️ Intento $attempt/$maxAttempts falló. Reintentando en ${delayMs}ms...',
        );

        await Future.delayed(Duration(milliseconds: delayMs));
        await _navigateWithRetry(
          path,
          attempt: attempt + 1,
          maxAttempts: maxAttempts,
        );
      } else {
        debugPrint(
          '❌ Error al navegar con deeplink después de $maxAttempts intentos: $e',
        );
        // Clear pending on final failure
        if (_pendingDeepLink == path) {
          setState(() {
            _pendingDeepLink = null;
          });
        }
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return MaterialApp.router(
      debugShowCheckedModeBanner: false,

      // GoRouter
      routeInformationParser: appRouter.routeInformationParser,
      routerDelegate: appRouter.routerDelegate,
      routeInformationProvider: appRouter.routeInformationProvider,

      // Temas
      theme: AppTheme.instance.lightTheme,
      darkTheme: AppTheme.instance.darkTheme,
      themeMode: ThemeMode.light,

      // 🌎 Localización (Material + Cupertino + Syncfusion)
      locale: const Locale(
        'es',
        'CO',
      ), // fuerza español (puedes quitar la región si quieres)
      supportedLocales: const [Locale('es', 'CO'), Locale('es'), Locale('en')],
      localizationsDelegates: const [
        GlobalMaterialLocalizations.delegate,
        GlobalWidgetsLocalizations.delegate,
        GlobalCupertinoLocalizations.delegate,
        SfGlobalLocalizations
            .delegate, // 🔑 necesario para que Syncfusion muestre ES
      ],
      // Si prefieres tomar el idioma del dispositivo y caer a ES si no está:
      // locale: Get.deviceLocale ?? const Locale('es', 'CO'),

      // ⏱️ Opcional: forzar formato 24h en toda la app (incluye SfCalendar)
      builder: (context, child) {
        final mq = MediaQuery.of(context);
        return MediaQuery(
          data: mq.copyWith(alwaysUse24HourFormat: true),
          child: child ?? const SizedBox.shrink(),
        );
      },
    );
  }
}
