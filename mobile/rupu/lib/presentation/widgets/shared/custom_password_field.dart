import 'package:flutter/material.dart';

/// Campo de texto de contraseña con validación.
class CustomPasswordField extends StatelessWidget {
  final TextEditingController controller;
  final String labelText;
  final String hintText;
  const CustomPasswordField({
    super.key,
    required this.controller,
    required this.labelText,
    required this.hintText,
  });

  @override
  Widget build(BuildContext context) {
    return TextFormField(
      controller: controller,
      decoration: InputDecoration(
        labelText: labelText,
        hintText: hintText,
        border: OutlineInputBorder(borderRadius: BorderRadius.circular(14)),
      ),
      obscureText: true,
      validator: (value) {
        if (value == null || value.isEmpty) return 'La contraseña es requerida';
        if (value.length < 6) return 'Mínimo 6 caracteres';
        return null;
      },
    );
  }
}
