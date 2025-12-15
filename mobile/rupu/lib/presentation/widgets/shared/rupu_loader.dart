import 'package:flutter/material.dart';
import 'package:lottie/lottie.dart';

/// Widget de loading animado con el logo de Rupu
class RupuLoader extends StatelessWidget {
  final double size;

  const RupuLoader({super.key, this.size = 60});

  /// Loader pequeño para botones e indicadores inline
  const RupuLoader.small({super.key}) : size = 40;

  /// Loader mediano para cards y secciones
  const RupuLoader.medium({super.key}) : size = 60;

  /// Loader grande para pantallas de carga completa
  const RupuLoader.large({super.key}) : size = 100;

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: size,
      height: size,
      child: Lottie.asset(
        'assets/animation/loader/rupu_loader.json',
        fit: BoxFit.contain,
      ),
    );
  }
}
