import 'package:flutter/material.dart';

String _norm(String s) {
  final lower = s.toLowerCase();
  // Quita tildes/diacríticos de forma simple:
  const from = 'áàäâãéèëêíìïîóòöôõúùüûñç';
  const to = 'aaaaaeeeeiiiiooooouuuunc';
  final buffer = StringBuffer();
  for (final ch in lower.characters) {
    final idx = from.indexOf(ch);
    buffer.write(idx == -1 ? ch : to[idx]);
  }
  return buffer.toString();
}

/// Compara de forma segura (sin regex) si `text` contiene `query`.
bool safeContains(String text, String query) {
  if (query.trim().isEmpty) return true;
  return _norm(text).contains(_norm(query));
}
