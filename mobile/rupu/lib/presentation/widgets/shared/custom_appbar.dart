import 'package:flutter/material.dart';

class CustomHomeAppBar extends StatelessWidget implements PreferredSizeWidget {
  final String avatarUrl;
  final VoidCallback? onMenuTap;

  const CustomHomeAppBar({super.key, required this.avatarUrl, this.onMenuTap});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final appBarTheme = theme.appBarTheme;
    // Color de fondo (o primary si no está definido)
    final bgColor = appBarTheme.backgroundColor ?? theme.colorScheme.primary;
    // Color de texto/iconos (o onPrimary si no está definido)
    final fgColor = appBarTheme.foregroundColor ?? theme.colorScheme.onPrimary;
    // IconTheme y TextStyle heredados del AppBarTheme si existen
    final iconTheme = appBarTheme.iconTheme ?? IconThemeData(color: fgColor);
    final titleStyle =
        appBarTheme.titleTextStyle ??
        theme.textTheme.titleLarge?.copyWith(
          color: fgColor,
          fontWeight: FontWeight.bold,
        );

    return AppBar(
      backgroundColor: bgColor,
      elevation: appBarTheme.elevation ?? 0,
      centerTitle: true,
      iconTheme: iconTheme,
      titleTextStyle: titleStyle,
      leading: IconButton(
        icon: Icon(Icons.menu),
        onPressed: onMenuTap ?? () => Scaffold.of(context).openDrawer(),
        tooltip: 'Menú',
      ),
      title: const Text('Rupü'),
      actions: [
        // if (avatarUrl.isNotEmpty)
        //   Padding(
        //     padding: const EdgeInsets.only(right: 12),
        //     child: CircleAvatar(
        //       backgroundImage: NetworkImage(avatarUrl),
        //       backgroundColor: Colors.transparent,
        //     ),
        //   ),
      ],
    );
  }

  @override
  Size get preferredSize => const Size.fromHeight(kToolbarHeight);
}
