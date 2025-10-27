import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:rupu/config/routers/app_router.dart';
import 'package:rupu/config/theme/app_theme.dart';
import 'package:rupu/config/theme/app_theme_controller.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:syncfusion_localizations/syncfusion_localizations.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  Get.put(AppThemeController());
  runApp(const MainApp());
}

class MainApp extends StatelessWidget {
  const MainApp({super.key});

  @override
  Widget build(BuildContext context) {
    return GetMaterialApp.router(
      debugShowCheckedModeBanner: false,

      // GoRouter
      routeInformationParser: appRouter.routeInformationParser,
      routerDelegate: appRouter.routerDelegate,
      routeInformationProvider: appRouter.routeInformationProvider,
      // backButtonDispatcher: appRouter.backButtonDispatcher, // opcional

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
