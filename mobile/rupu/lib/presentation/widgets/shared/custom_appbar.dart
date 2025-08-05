import 'package:flutter/material.dart';

class CustomHomeAppBar extends StatelessWidget implements PreferredSizeWidget {
  final String avatarUrl;
  final VoidCallback? onMenuTap;

  const CustomHomeAppBar({super.key, required this.avatarUrl, this.onMenuTap});

  @override
  Widget build(BuildContext context) {
    return AppBar(
      backgroundColor: Colors.white,
      elevation: 0,
      actions: [
        // Padding(
        //   padding: const EdgeInsets.all(4.0),
        //   child: CircleAvatar(
        //     backgroundImage: avatarUrl.isNotEmpty
        //         ? NetworkImage(avatarUrl)
        //         : null,
        //     child: avatarUrl.isEmpty ? const Icon(Icons.person) : null,
        //   ),
        // ),
      ],

      leading: IconButton(
        icon: const Icon(Icons.menu, color: Colors.black),
        onPressed: onMenuTap ?? () => Scaffold.of(context).openDrawer(),
        tooltip: 'Menú',
      ),
      title: const Text(
        'Rupü',
        style: TextStyle(color: Colors.black, fontWeight: FontWeight.bold),
      ),
      centerTitle: true,
      iconTheme: const IconThemeData(color: Colors.black),
    );
  }

  @override
  Size get preferredSize => const Size.fromHeight(kToolbarHeight);
}
