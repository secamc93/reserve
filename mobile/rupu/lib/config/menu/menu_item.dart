import 'package:flutter/material.dart';

class MenuAccessRequirement {
  /// Recurso tal como llega en el JSON de permisos (ej. "reservations").
  final String resource;

  /// Acciones requeridas para mostrar el elemento. Basta con que el usuario
  /// tenga una de ellas. Si está vacío solo se valida el recurso.
  final List<String> actions;

  /// Cuando es `true` se validará que el recurso venga activo (`active`)
  /// dentro de la respuesta del backend.
  final bool requireActive;

  const MenuAccessRequirement({
    required this.resource,
    this.actions = const <String>[],
    this.requireActive = true,
  });
}

class MenuItem {
  final String tittle;
  final String subTittle;
  final String link;
  final IconData icon;
  final MenuAccessRequirement? access;

  const MenuItem({
    required this.tittle,
    required this.subTittle,
    required this.link,
    required this.icon,
    this.access,
  });
}

const appMenuItems = <MenuItem>[
  // MenuItem(
  //   tittle: 'Perfil',
  //   subTittle: '',
  //   link: '/home/0/perfil',
  //   icon: Icons.person,
  // ),
  // MenuItem(
  //   tittle: 'Cambiar contraseña',
  //   subTittle: 'Cambiar contraseña',
  //   link: '/home/0/cambiar_contrasena',
  //   icon: Icons.key_outlined,
  // ),
  MenuItem(
    tittle: 'Reservas',
    subTittle: '',
    link: '/home/0/reserve',
    icon: Icons.calendar_month_outlined,
    access: MenuAccessRequirement(
      resource: 'reservations',
      actions: ['Read'],
    ),
  ),
];
