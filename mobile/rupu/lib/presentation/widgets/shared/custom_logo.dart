import 'package:flutter/material.dart';

/// Placeholder para el logo.
class CustomLogo extends StatelessWidget {
  final double height;
  const CustomLogo({super.key, required this.height});

  @override
  Widget build(BuildContext context) {
    return Container(
      height: height,
      alignment: Alignment.center,
      child: const Placeholder(fallbackHeight: 80, fallbackWidth: 80),
    );
  }
}
