import 'package:flutter/material.dart';

/// Pantalla de login estilizada con campos validados y UI responsive.
class LoginView extends StatefulWidget {
  const LoginView({super.key});

  @override
  State<LoginView> createState() => _LoginViewState();
}

class _LoginViewState extends State<LoginView> {
  final _formKey = GlobalKey<FormState>();
  final TextEditingController _emailController = TextEditingController();
  final TextEditingController _passwordController = TextEditingController();

  @override
  void dispose() {
    _emailController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final size = MediaQuery.of(context).size;
    return Scaffold(
      body: Center(
        child: SingleChildScrollView(
          padding: EdgeInsets.symmetric(
            horizontal: size.width * 0.1,
            vertical: size.height * 0.05,
          ),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              LogoPlaceholder(height: size.height * 0.2),
              const SizedBox(height: 32),
              LoginForm(
                formKey: _formKey,
                emailController: _emailController,
                passwordController: _passwordController,
                onSubmit: () {
                  if (_formKey.currentState!.validate()) {
                    // TODO: Implementar lógica de login
                  }
                },
              ),
            ],
          ),
        ),
      ),
    );
  }
}

/// Placeholder para el logo de la aplicación.
class LogoPlaceholder extends StatelessWidget {
  final double height;
  const LogoPlaceholder({super.key, required this.height});

  @override
  Widget build(BuildContext context) {
    return Container(
      height: height,
      alignment: Alignment.center,
      child: const Placeholder(fallbackHeight: 80, fallbackWidth: 80),
    );
  }
}

/// Formulario de login separado en widget para mayor mantenibilidad.
class LoginForm extends StatelessWidget {
  final GlobalKey<FormState> formKey;
  final TextEditingController emailController;
  final TextEditingController passwordController;
  final VoidCallback onSubmit;

  const LoginForm({
    super.key,
    required this.formKey,
    required this.emailController,
    required this.passwordController,
    required this.onSubmit,
  });

  @override
  Widget build(BuildContext context) {
    return Form(
      key: formKey,
      child: Column(
        children: [
          EmailField(controller: emailController),
          const SizedBox(height: 16),
          PasswordField(controller: passwordController),
          const SizedBox(height: 24),
          LoginButton(onPressed: onSubmit),
        ],
      ),
    );
  }
}

/// Campo de texto para email con validación de formato.
class EmailField extends StatelessWidget {
  final TextEditingController controller;
  const EmailField({super.key, required this.controller});

  @override
  Widget build(BuildContext context) {
    return TextFormField(
      controller: controller,
      decoration: InputDecoration(
        labelText: 'Email',
        hintText: 'ejemplo@dominio.com',
        border: OutlineInputBorder(borderRadius: BorderRadius.circular(8)),
      ),
      keyboardType: TextInputType.emailAddress,
      validator: (value) {
        if (value == null || value.isEmpty) return 'El email es requerido';
        final regex = RegExp(r'^[^@\s]+@[^@\s]+\.[^@\s]+\$');
        if (!regex.hasMatch(value)) return 'Ingresa un email válido';
        return null;
      },
    );
  }
}

/// Campo de texto para contraseña con validación de longitud mínima.
class PasswordField extends StatelessWidget {
  final TextEditingController controller;
  const PasswordField({super.key, required this.controller});

  @override
  Widget build(BuildContext context) {
    return TextFormField(
      controller: controller,
      decoration: InputDecoration(
        labelText: 'Contraseña',
        hintText: 'Ingresa tu contraseña',
        border: OutlineInputBorder(borderRadius: BorderRadius.circular(8)),
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

/// Botón de login con estilo y bordes redondeados.
class LoginButton extends StatelessWidget {
  final VoidCallback onPressed;
  const LoginButton({super.key, required this.onPressed});

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: double.infinity,
      child: ElevatedButton(
        onPressed: onPressed,
        style: ElevatedButton.styleFrom(
          padding: const EdgeInsets.symmetric(vertical: 16),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
        ),
        child: const Text('Iniciar sesión'),
      ),
    );
  }
}
