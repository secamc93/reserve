import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:go_router/go_router.dart';
import '../settings/views/create_user_view.dart';
import 'users_controller.dart';

class UsersView extends StatefulWidget {
  static const name = 'users';
  final int pageIndex;
  const UsersView({super.key, required this.pageIndex});

  @override
  State<UsersView> createState() => _UsersViewState();
}

class _UsersViewState extends State<UsersView> {
  late final UsersController controller;

  @override
  void initState() {
    super.initState();
    controller = Get.put(UsersController());
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Usuarios'), centerTitle: true),
      floatingActionButton: FloatingActionButton(
        onPressed: () => GoRouter.of(context).pushNamed(
          CreateUserView.name,
          pathParameters: {'page': '${widget.pageIndex}'},
        ),
        child: const Icon(Icons.add),
      ),
      body: Obx(() {
        if (controller.isLoading.value && controller.users.isEmpty) {
          return const Center(child: CircularProgressIndicator());
        }
        final error = controller.errorMessage.value;
        if (error != null) {
          return Center(child: Text(error));
        }
        return RefreshIndicator(
          onRefresh: controller.fetchUsers,
          child: ListView(
            padding: const EdgeInsets.all(16),
            children: [
              Row(
                children: [
                  Expanded(
                    child: TextField(
                      controller: controller.pageCtrl,
                      decoration: const InputDecoration(labelText: 'Página'),
                      keyboardType: TextInputType.number,
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: TextField(
                      controller: controller.pageSizeCtrl,
                      decoration:
                          const InputDecoration(labelText: 'Tamaño de página'),
                      keyboardType: TextInputType.number,
                    ),
                  ),
                ],
              ),
              TextField(
                controller: controller.nameCtrl,
                decoration: const InputDecoration(labelText: 'Nombre'),
              ),
              TextField(
                controller: controller.emailCtrl,
                decoration: const InputDecoration(labelText: 'Email'),
              ),
              TextField(
                controller: controller.phoneCtrl,
                decoration: const InputDecoration(labelText: 'Teléfono'),
                keyboardType: TextInputType.phone,
              ),
              DropdownButtonFormField<bool?>(
                value: controller.isActive.value,
                decoration: const InputDecoration(labelText: 'Activo'),
                items: const [
                  DropdownMenuItem<bool?>(value: null, child: Text('Todos')),
                  DropdownMenuItem<bool?>(value: true, child: Text('Activo')),
                  DropdownMenuItem<bool?>(value: false, child: Text('Inactivo')),
                ],
                onChanged: (v) => controller.isActive.value = v,
              ),
              TextField(
                controller: controller.roleIdCtrl,
                decoration: const InputDecoration(labelText: 'ID Rol'),
                keyboardType: TextInputType.number,
              ),
              TextField(
                controller: controller.businessIdCtrl,
                decoration: const InputDecoration(labelText: 'ID Negocio'),
                keyboardType: TextInputType.number,
              ),
              TextField(
                controller: controller.createdAtCtrl,
                decoration: const InputDecoration(
                    labelText: 'Creado en',
                    hintText: 'YYYY-MM-DD o rango'),
              ),
              TextField(
                controller: controller.sortByCtrl,
                decoration: const InputDecoration(labelText: 'Ordenar por'),
              ),
              TextField(
                controller: controller.sortOrderCtrl,
                decoration: const InputDecoration(labelText: 'Orden'),
              ),
              const SizedBox(height: 12),
              ElevatedButton(
                onPressed: controller.fetchUsers,
                child: const Text('Filtrar'),
              ),
              const SizedBox(height: 24),
              for (final u in controller.users)
                ListTile(
                  leading: u.avatarUrl.isNotEmpty
                      ? CircleAvatar(backgroundImage: NetworkImage(u.avatarUrl))
                      : CircleAvatar(
                          child: Text(u.name.isNotEmpty ? u.name[0] : '?'),
                        ),
                  title: Text(u.name),
                  subtitle: Text(u.email),
                  trailing: Icon(
                    u.isActive ? Icons.check_circle : Icons.cancel,
                    color: u.isActive ? Colors.green : Colors.red,
                  ),
                ),
            ],
          ),
        );
      }),
    );
  }
}
