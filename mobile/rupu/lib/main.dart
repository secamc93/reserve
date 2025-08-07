import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:rupu/config/routers/app_router.dart';
import 'package:rupu/config/theme/app_theme.dart';
import 'package:rupu/config/theme/app_theme_controller.dart';

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

      // Estos tres vienen de tu instancia de GoRouter
      routeInformationParser: appRouter.routeInformationParser,
      routerDelegate: appRouter.routerDelegate,
      routeInformationProvider: appRouter.routeInformationProvider,
      theme: AppTheme.instance.lightTheme,
      darkTheme: AppTheme.instance.darkTheme,
      // backButtonDispatcher: appRouter.backButtonDispatcher,
    );
  }
}
