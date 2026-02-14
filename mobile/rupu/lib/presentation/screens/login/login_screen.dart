import 'package:flutter/material.dart';
import 'package:upgrader/upgrader.dart';
import 'package:url_launcher/url_launcher.dart';

import '../../views/../views/views.dart';

class LoginScreen extends StatelessWidget {
  static const name = 'login-screen';
  final int pageIndex;

  // URL de tu app en la Play Store
  static const String _playStoreUrl =
      'https://play.google.com/store/apps/details?id=com.rupu.app';

  const LoginScreen({super.key, required this.pageIndex});

  Future<void> _openPlayStore() async {
    final uri = Uri.parse(_playStoreUrl);
    if (await canLaunchUrl(uri)) {
      await launchUrl(uri, mode: LaunchMode.externalApplication);
    }
  }

  @override
  Widget build(BuildContext context) {
    final viewRoutes = <Widget>[
      LoginView(pageIndex: pageIndex),
      const SizedBox(),
    ];

    return UpgradeAlert(
      upgrader: Upgrader(
        languageCode: 'es',
        durationUntilAlertAgain: const Duration(days: 1),
        messages: UpgraderMessages(code: 'es'),
        // debugLogging: true, // Descomentar para depuración
        // debugDisplayAlways: true, // SOLO para pruebas internas
      ),
      showIgnore: false,
      showLater: true,
      onUpdate: () {
        // Abrir Play Store manualmente ya que en pruebas internas no hay URL
        _openPlayStore();
        return true; // Indica que manejamos la acción
      },
      child: Scaffold(
        body: IndexedStack(index: pageIndex, children: viewRoutes),
      ),
    );
  }
}
