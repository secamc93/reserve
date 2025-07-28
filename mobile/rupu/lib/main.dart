import 'package:flutter/material.dart';
import 'package:get/get_navigation/src/root/get_material_app.dart';
import 'package:rupu/config/routers/app_router.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();

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

      // opcional
      // backButtonDispatcher: appRouter.backButtonDispatcher,
    );
  }
}
