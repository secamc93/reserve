import 'package:flutter/material.dart';

/// Campo de texto de email con validación.
class CustomField extends StatelessWidget {
  final TextEditingController controller;
  final String labelText;
  final String hintText;
  final bool? obscureText;

  const CustomField({
    super.key,
    required this.controller,
    required this.labelText,
    required this.hintText,
    this.obscureText,
  });

  @override
  Widget build(BuildContext context) {
    return TextFormField(
      controller: controller,
      decoration: InputDecoration(
        labelText: labelText,
        hintText: hintText,
        border: OutlineInputBorder(borderRadius: BorderRadius.circular(8)),
      ),
      obscureText: obscureText ?? false,
      keyboardType: TextInputType.text,
    );
  }
}
