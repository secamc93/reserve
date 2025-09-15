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
          child: ListView.builder(
            itemCount: controller.users.length,
            itemBuilder: (context, index) {
              final u = controller.users[index];
              return ListTile(
                leading: u.avatarUrl.isNotEmpty
                    ? CircleAvatar(backgroundImage: NetworkImage(u.avatarUrl))
                    : CircleAvatar(child: Text(u.name.isNotEmpty ? u.name[0] : '?')),
                title: Text(u.name),
                subtitle: Text(u.email),
                trailing: Icon(
                  u.isActive ? Icons.check_circle : Icons.cancel,
                  color: u.isActive ? Colors.green : Colors.red,
                ),
              );
            },
          ),
        );
      }),
    );
  }
}
