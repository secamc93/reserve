import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:go_router/go_router.dart';

import '../settings/views/create_user_view.dart';
import 'users_controller.dart';
import 'widgets/user_list_card.dart';
import 'widgets/users_filters_panel.dart';

class UsersView extends GetView<UsersController> {
  static const name = 'users';
  final int pageIndex;
  const UsersView({super.key, required this.pageIndex});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Usuarios'), centerTitle: true),
      floatingActionButton: FloatingActionButton(
        onPressed: () async {
          final result = await GoRouter.of(context).pushNamed(
            CreateUserView.name,
            pathParameters: {'page': '$pageIndex'},
          );
          if (result == true) {
            await controller.fetchUsers();
          }
        },
        child: const Icon(Icons.add),
      ),
      body: Obx(() {
        if (controller.isLoading.value && controller.users.isEmpty) {
          return const Center(child: CircularProgressIndicator());
        }

        final hasError = controller.errorMessage.value != null;

        return RefreshIndicator(
          onRefresh: controller.fetchUsers,
          child: ListView(
            physics: const AlwaysScrollableScrollPhysics(),
            padding: const EdgeInsets.all(16),
            children: [
              UsersFiltersPanel(controller: controller),
              const SizedBox(height: 16),
              if (hasError)
                Card(
                  color: Theme.of(context).colorScheme.errorContainer,
                  child: Padding(
                    padding: const EdgeInsets.all(12),
                    child: Text(
                      controller.errorMessage.value!,
                      style: Theme.of(context)
                          .textTheme
                          .bodyMedium
                          ?.copyWith(
                            color: Theme.of(context)
                                .colorScheme
                                .onErrorContainer,
                          ),
                    ),
                  ),
                ),
              Row(
                children: [
                  Expanded(
                    child: Text(
                      'Total de usuarios: ${controller.totalCount.value}',
                      style: Theme.of(context)
                          .textTheme
                          .titleMedium
                          ?.copyWith(fontWeight: FontWeight.w600),
                    ),
                  ),
                  if (controller.isLoading.value)
                    const SizedBox(
                      width: 24,
                      height: 24,
                      child: CircularProgressIndicator(strokeWidth: 2),
                    ),
                ],
              ),
              const SizedBox(height: 12),
              if (controller.users.isEmpty && !hasError)
                Card(
                  child: Padding(
                    padding: const EdgeInsets.all(16),
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      children: const [
                        Icon(Icons.people_alt_outlined, size: 48),
                        SizedBox(height: 8),
                        Text(
                          'No se encontraron usuarios con los filtros aplicados.',
                          textAlign: TextAlign.center,
                        ),
                      ],
                    ),
                  ),
                )
              else
                ...controller.users
                    .map((user) => Padding(
                          padding: const EdgeInsets.only(bottom: 12),
                          child: UserListCard(
                            user: user,
                            formatDate: controller.formatDate,
                          ),
                        ))
                    .toList(),
            ],
          ),
        );
      }),
    );
  }
}
