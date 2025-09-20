import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:go_router/go_router.dart';

import 'package:rupu/domain/entities/user_action_result.dart';
import 'package:rupu/domain/entities/user_list_item.dart';

import '../settings/views/create_user_view.dart';
import 'user_detail_view.dart';
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
      floatingActionButton: Obx(() {
        if (!controller.canCreate) return const SizedBox.shrink();
        return FloatingActionButton(
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
        );
      }),
      body: Obx(() {
        if (controller.isLoading.value && controller.users.isEmpty) {
          return const Center(child: CircularProgressIndicator());
        }

        final hasError = controller.errorMessage.value != null;

        if (!controller.canRead) {
          return Center(
            child: Padding(
              padding: const EdgeInsets.all(24),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  const Icon(Icons.lock_outline, size: 48),
                  const SizedBox(height: 12),
                  Text(
                    controller.errorMessage.value ??
                        'No cuentas con permisos para consultar usuarios.',
                    textAlign: TextAlign.center,
                    style: Theme.of(context).textTheme.bodyLarge,
                  ),
                ],
              ),
            ),
          );
        }

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
                            canView: controller.canRead || controller.canUpdate,
                            canDelete: controller.canDelete,
                            isProcessing:
                                controller.deletingUserId.value == user.id,
                            onView: () => _openDetail(context, user.id),
                            onDelete: () => _confirmDelete(context, user),
                          ),
                        ))
                    .toList(),
            ],
          ),
        );
      }),
    );
  }

  Future<void> _openDetail(BuildContext context, int userId) async {
    final result = await GoRouter.of(context).pushNamed(
      UserDetailView.name,
      pathParameters: {
        'page': '$pageIndex',
        'id': '$userId',
      },
    );

    if (!context.mounted) return;

    if (result is UserActionResult && result.success) {
      await controller.fetchUsers();
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(
            result.message ?? 'Usuario eliminado exitosamente.',
          ),
        ),
      );
    }
  }

  Future<void> _confirmDelete(BuildContext context, UserListItem user) async {
    final controller = Get.find<UsersController>();
    final result = await showDialog<bool>(
      context: context,
      builder: (ctx) {
        return AlertDialog(
          title: const Text('Eliminar usuario'),
          content: Text(
            '¿Estás seguro de eliminar a ${user.name}? Esta acción no se puede deshacer.',
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.of(ctx).pop(false),
              child: const Text('Cancelar'),
            ),
            FilledButton(
              onPressed: () => Navigator.of(ctx).pop(true),
              style: FilledButton.styleFrom(
                backgroundColor: Theme.of(ctx).colorScheme.error,
                foregroundColor: Theme.of(ctx).colorScheme.onError,
              ),
              child: const Text('Eliminar'),
            ),
          ],
        );
      },
    );

    if (result != true) return;

    final action = await controller.deleteUser(user.id);
    if (!context.mounted) return;

    final messenger = ScaffoldMessenger.of(context);
    if (action.success) {
      messenger.showSnackBar(
        SnackBar(
          content: Text(action.message ?? 'Usuario eliminado correctamente.'),
        ),
      );
    } else {
      messenger.showSnackBar(
        SnackBar(content: Text(action.message ?? 'No se pudo eliminar el usuario.')),
      );
    }
  }
}
