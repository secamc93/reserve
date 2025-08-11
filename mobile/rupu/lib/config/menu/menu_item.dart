import 'package:flutter/material.dart';

class MenuItem {
  final String tittle;
  final String subTittle;
  final String link;
  final IconData icon;

  const MenuItem({
    required this.tittle,
    required this.subTittle,
    required this.link,
    required this.icon,
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
  ),
];
