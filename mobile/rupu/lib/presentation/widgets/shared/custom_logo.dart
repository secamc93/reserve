import 'package:flutter/material.dart';

/// Placeholder para el logo, ahora con posibilidad de mostrar una imagen.
class CustomLogo extends StatelessWidget {
  final double height;

  /// Ruta de la imagen. Si es null, se muestra el Placeholder.
  final String? imagePath;

  /// Si la ruta comienza con "http", cargará desde red;
  /// en caso contrario, asumirá que es un asset.
  const CustomLogo({super.key, required this.height, this.imagePath});

  @override
  Widget build(BuildContext context) {
    Widget child;
    if (imagePath == null) {
      // Sin ruta, muestro el placeholder
      child = const Placeholder(fallbackHeight: 80, fallbackWidth: 80);
    } else if (imagePath!.startsWith('http')) {
      // Ruta de red
      child = Image.network(
        imagePath!,
        height: height,
        fit: BoxFit.contain,
        errorBuilder: (_, __, ___) => const Icon(Icons.error),
      );
    } else {
      // Ruta de asset local
      child = Image.asset(imagePath!, height: height, fit: BoxFit.contain);
    }

    return Container(height: height, alignment: Alignment.center, child: child);
  }
}
