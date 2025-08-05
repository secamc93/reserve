import 'dart:math';

import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:go_router/go_router.dart';

import '../../screens/screens.dart';
import '../../widgets/widgets.dart';
import '../login/login_controller.dart';

class PerfilView extends StatelessWidget {
  final int pageIndex;
  const PerfilView({super.key, required this.pageIndex});

  static final randomIndex = Random().nextInt(100).toString();

  @override
  Widget build(BuildContext context) {
    // final homeController = Get.find<HomeController>();
    final loginController = Get.find<LoginController>();
    final user = loginController.sessionModel.value!.data.user;
    final negocio = loginController.sessionModel.value!.data.businesses;
    final userName = user.name;
    final avatarUrl = user.avatarUrl;
    final email = user.email;

    // Tamaño de la pantalla
    final size = MediaQuery.of(context).size;
    // Orientación de la pantalla
    final isPortrait =
        MediaQuery.of(context).orientation == Orientation.portrait;

    // Tamaño de fuente responsivo
    final fontSize = isPortrait ? size.width * 0.08 : size.height * 0.08;

    return SafeArea(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Padding(
            padding: const EdgeInsets.all(4.0),
            child: CircleAvatar(
              maxRadius: 60,
              backgroundImage: avatarUrl.isNotEmpty
                  ? NetworkImage(avatarUrl)
                  :
                    //TODO colocar en null después solo se pone por prueba
                    NetworkImage(
                      "https://randomuser.me/api/portraits/men/$randomIndex.jpg",
                    ),

              //TODO Descomentar después de colocar null
              // child: avatarUrl.isEmpty ? const Icon(Icons.person) : null,
            ),
          ),
          Text(
            userName,
            textAlign: TextAlign.center,
            style: TextStyle(
              fontSize: fontSize * 0.7,
              fontWeight: FontWeight.bold,
            ),
          ),
          SizedBox(height: size.height * 0.01),
          Text(
            email,
            textAlign: TextAlign.center,
            style: TextStyle(
              fontSize: fontSize * 0.4,
              fontWeight: FontWeight.bold,
            ),
          ),
          SizedBox(height: size.height * 0.08),
          ClipRRect(
            borderRadius: BorderRadius.circular(20),
            child: SizedBox(
              height: size.height * 0.06,
              child: Image.network(
                negocio.first.logoUrl,
                fit: BoxFit.cover,
                errorBuilder: (context, error, stackTrace) {
                  return Image.network(
                    'https://logo.clearbit.com/github.com',
                    fit: BoxFit.cover,
                  );
                },
              ),
            ),
          ),
          SizedBox(height: size.height * 0.03),
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [Text("Negocio: ${negocio.first.name}")],
          ),
          SizedBox(height: size.height * 0.01),

          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [Text("Descripción: ${negocio.first.description}")],
          ),
          SizedBox(height: size.height * 0.01),
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [Text("Dirección: ${negocio.first.address}")],
          ),
          SizedBox(height: size.height * 0.09),
          CustomTextButton(
            onPressed: () {
              GoRouter.of(context).goNamed(
                CambiarContrasenaScreen.name,
                pathParameters: {'page': '0'},
              );
            },
            textButton: 'Cambiar contraseña',
          ),
          SizedBox(height: size.height * 0.01),
          CustomTextButton(
            onPressed: () {
              // Borra tu token, limpias estados y vuelves al login:
              GoRouter.of(
                context,
              ).goNamed(LoginScreen.name, pathParameters: {'page': '0'});
            },
            textButton: 'Cerrar sesión',
          ),
        ],
      ),
    );
  }
}
