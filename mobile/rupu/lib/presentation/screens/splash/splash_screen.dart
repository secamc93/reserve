import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:lottie/lottie.dart';
import 'package:rupu/presentation/screens/login/login_screen.dart';

/// Splash screen with animated Rupu logo
class SplashScreen extends StatefulWidget {
  static const name = 'splash-screen';

  const SplashScreen({super.key});

  @override
  State<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends State<SplashScreen>
    with TickerProviderStateMixin {
  late AnimationController _controller;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(vsync: this);
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  void _onAnimationComplete() {
    // Navigate to login after animation completes
    if (mounted) {
      context.goNamed(LoginScreen.name, pathParameters: {'page': '0'});
    }
  }

  @override
  Widget build(BuildContext context) {
    // Get background color matching the animation's background (#101418)
    const backgroundColor = Color(0xFF101418);

    return Scaffold(
      backgroundColor: backgroundColor,
      body: Center(
        child: Lottie.asset(
          'assets/animation/rupu_icon_animation.json',
          controller: _controller,
          onLoaded: (composition) {
            _controller
              ..duration = composition.duration
              ..forward().whenComplete(_onAnimationComplete);
          },
          width: MediaQuery.of(context).size.width * 0.8,
          height: MediaQuery.of(context).size.width * 0.8,
          fit: BoxFit.contain,
          // Map animation image reference to actual asset location
          imageProviderFactory: (asset) {
            return const AssetImage('assets/icon/logo_rupu.png');
          },
        ),
      ),
    );
  }
}
