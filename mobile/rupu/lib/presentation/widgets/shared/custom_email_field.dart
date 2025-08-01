import 'package:flutter/material.dart';

/// Campo de texto de email con validación.
class CustomEmailField extends StatelessWidget {
  final TextEditingController controller;
  final String labelText;
  final String hintText;

  const CustomEmailField({
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
      keyboardType: TextInputType.emailAddress,
      validator: (value) {
        final email = value?.trim() ?? '';
        if (email.isEmpty) {
          return 'El email es requerido';
        }
        // Expresión regular para formato de email
        final regex = RegExp(r'^[^@\s]+@[^@\s]+\.[^@\s]+$');
        if (!regex.hasMatch(email)) {
          return 'Ingresa un email válido';
        }
        return null;
      },
    );
  }
}
