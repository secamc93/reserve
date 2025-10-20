// presentation/views/roles_permissions/roles_permissions_view.dart
import 'package:flutter/material.dart';
import 'package:get/get.dart';

import 'package:rupu/domain/entities/roles_permisos.dart';
import 'roles_permissions_controller.dart';

class RolesPermissionsView extends GetView<RolesPermissionsController> {
  static const name = 'roles-permissions';
  final int pageIndex;

  const RolesPermissionsView({super.key, required this.pageIndex});

  @override
  Widget build(BuildContext context) {
    final cs = Theme.of(context).colorScheme;
    final tt = Theme.of(context).textTheme;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Usuarios y permisos'),
        centerTitle: true,
      ),
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Obx(() {
            if (controller.isLoading.value) {
              return const Center(child: CircularProgressIndicator());
            }

            final error = controller.errorMessage.value;
            if (error != null) {
              return _ErrorState(
                message: error,
                onRetry: controller.refreshData,
              );
            }

            final tab = controller.selectedTab.value;
            final isRoles = tab == RolesPermissionsTab.roles;
            final total = isRoles
                ? controller.filteredRoles.length
                : controller.filteredPermissions.length;

            return Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                // Tabs premium
                _TabsHeader(
                  selected: tab,
                  onSelect: controller.selectTab,
                ),
                const SizedBox(height: 16),

                // Search bar segura
                TextField(
                  onChanged: controller.setSearch,
                  decoration: InputDecoration(
                    labelText: 'Buscar',
                    hintText: 'ID, nombre, descripción, recurso, acción…',
                    prefixIcon: const Icon(Icons.search),
                    suffixIcon: controller.searchText.value.isEmpty
                        ? null
                        : IconButton(
                            tooltip: 'Limpiar',
                            icon: const Icon(Icons.clear),
                            onPressed: () {
                              controller.clearSearch();
                              // Fuerza repaint rápido del TextField
                              // al limpiar programáticamente (opcional)
                              // -> usando GetX no es imprescindible.
                            },
                          ),
                  ),
                ),
                const SizedBox(height: 8),

                Align(
                  alignment: Alignment.centerLeft,
                  child: Text(
                    'Resultados: $total',
                    style: tt.titleMedium?.copyWith(
                      fontWeight: FontWeight.w600,
                      color: cs.onSurfaceVariant,
                    ),
                  ),
                ),
                const SizedBox(height: 12),

                Expanded(
                  child: AnimatedSwitcher(
                    duration: const Duration(milliseconds: 250),
                    child: isRoles
                        ? _RolesTable(
                            key: const ValueKey('roles-table'),
                            roles: controller.filteredRoles,
                          )
                        : _PermissionsTable(
                            key: const ValueKey('permissions-table'),
                            permissions: controller.filteredPermissions,
                          ),
                  ),
                ),
              ],
            );
          }),
        ),
      ),
    );
  }
}

// -------------------- (resto de widgets igual que ya los tienes) --------------------

class _TabsHeader extends StatelessWidget {
  const _TabsHeader({
    required this.selected,
    required this.onSelect,
  });

  final RolesPermissionsTab selected;
  final ValueChanged<RolesPermissionsTab> onSelect;

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Expanded(
          child: _TabButton(
            label: 'Roles',
            isSelected: selected == RolesPermissionsTab.roles,
            onTap: () => onSelect(RolesPermissionsTab.roles),
          ),
        ),
        const SizedBox(width: 12),
        Expanded(
          child: _TabButton(
            label: 'Permisos',
            isSelected: selected == RolesPermissionsTab.permissions,
            onTap: () => onSelect(RolesPermissionsTab.permissions),
          ),
        ),
      ],
    );
  }
}

class _TabButton extends StatelessWidget {
  const _TabButton({
    required this.label,
    required this.isSelected,
    required this.onTap,
  });

  final String label;
  final bool isSelected;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return AnimatedContainer(
      duration: const Duration(milliseconds: 200),
      decoration: BoxDecoration(
        color: isSelected
            ? theme.colorScheme.primary.withOpacity(0.12)
            : theme.colorScheme.surface,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
          color: isSelected
              ? theme.colorScheme.primary
              : theme.colorScheme.outlineVariant,
        ),
      ),
      child: InkWell(
        borderRadius: BorderRadius.circular(12),
        onTap: onTap,
        child: Padding(
          padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 16),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(
                isSelected ? Icons.check_circle : Icons.radio_button_unchecked,
                size: 18,
                color: isSelected
                    ? theme.colorScheme.primary
                    : theme.colorScheme.onSurfaceVariant,
              ),
              const SizedBox(width: 8),
              Text(
                label,
                style: theme.textTheme.titleMedium?.copyWith(
                  color: isSelected
                      ? theme.colorScheme.primary
                      : theme.colorScheme.onSurfaceVariant,
                  fontWeight: FontWeight.w600,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _RolesTable extends StatelessWidget {
  const _RolesTable({super.key, required this.roles});
  final List<Role> roles;

  @override
  Widget build(BuildContext context) {
    if (roles.isEmpty) {
      return const _EmptyState(message: 'No hay roles.');
    }

    return Card(
      clipBehavior: Clip.antiAlias,
      child: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: SingleChildScrollView(
          scrollDirection: Axis.horizontal,
          child: DataTable(
            columns: const [
              DataColumn(label: Text('ID')),
              DataColumn(label: Text('Nombre')),
              DataColumn(label: Text('Descripción')),
              DataColumn(label: Text('Alcance')),
              DataColumn(label: Text('Nivel')),
              DataColumn(label: Text('Sistema')),
            ],
            rows: roles.map(_buildRow).toList(),
          ),
        ),
      ),
    );
  }

  DataRow _buildRow(Role role) {
    final scope = role.scopeName?.isNotEmpty == true
        ? role.scopeName!
        : (role.scopeCode?.isNotEmpty == true ? role.scopeCode! : '-');

    return DataRow(
      cells: [
        DataCell(Text('${role.id}')),
        DataCell(Text(role.name)),
        DataCell(Text(role.description.isNotEmpty ? role.description : '-')),
        DataCell(Text(scope)),
        DataCell(Text('${role.level}')),
        DataCell(Icon(
          role.isSystem ? Icons.check_circle : Icons.cancel,
          color: role.isSystem ? Colors.green : Colors.redAccent,
        )),
      ],
    );
  }
}

class _PermissionsTable extends StatelessWidget {
  const _PermissionsTable({super.key, required this.permissions});
  final List<Permission> permissions;

  @override
  Widget build(BuildContext context) {
    if (permissions.isEmpty) {
      return const _EmptyState(message: 'No hay permisos.');
    }

    return Card(
      clipBehavior: Clip.antiAlias,
      child: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: SingleChildScrollView(
          scrollDirection: Axis.horizontal,
          child: DataTable(
            columns: const [
              DataColumn(label: Text('ID')),
              DataColumn(label: Text('Recurso')),
              DataColumn(label: Text('Acción')),
              DataColumn(label: Text('Descripción')),
            ],
            rows: permissions.map(_buildRow).toList(),
          ),
        ),
      ),
    );
  }

  DataRow _buildRow(Permission p) {
    return DataRow(
      cells: [
        DataCell(Text('${p.id}')),
        DataCell(Text(p.resource.isNotEmpty ? p.resource : '-')),
        DataCell(Text(p.action.isNotEmpty ? p.action : '-')),
        DataCell(
          ConstrainedBox(
            constraints: const BoxConstraints(maxWidth: 280),
            child: Text(
              p.description.isNotEmpty ? p.description : '-',
              softWrap: true,
            ),
          ),
        ),
      ],
    );
  }
}

class _EmptyState extends StatelessWidget {
  const _EmptyState({required this.message});
  final String message;

  @override
  Widget build(BuildContext context) {
    final cs = Theme.of(context).colorScheme;
    return Center(
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(Icons.inbox_outlined, size: 48, color: cs.onSurfaceVariant),
          const SizedBox(height: 12),
          Text(message, style: Theme.of(context).textTheme.titleMedium),
        ],
      ),
    );
  }
}

class _ErrorState extends StatelessWidget {
  const _ErrorState({required this.message, required this.onRetry});
  final String message;
  final Future<void> Function() onRetry;

  @override
  Widget build(BuildContext context) {
    final cs = Theme.of(context).colorScheme;
    return Center(
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(Icons.error_outline, size: 48, color: cs.error),
          const SizedBox(height: 12),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 24),
            child: Text(
              message,
              style: Theme.of(context).textTheme.titleMedium,
              textAlign: TextAlign.center,
            ),
          ),
          const SizedBox(height: 16),
          FilledButton(onPressed: onRetry, child: const Text('Reintentar')),
        ],
      ),
    );
  }
}
