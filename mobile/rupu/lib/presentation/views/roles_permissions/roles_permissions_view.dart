// presentation/views/roles_permissions/roles_permissions_view.dart
import 'package:flutter/material.dart';
import 'package:get/get.dart';

import 'package:rupu/domain/entities/role_action_result.dart';
import 'package:rupu/domain/entities/roles_permisos.dart';
import 'package:rupu/domain/infrastructure/repositories/iam_repository_impl.dart';
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
      floatingActionButton: Obx(() {
        // if (!controller.canCreate) return const SizedBox.shrink();
        final tab = controller.selectedTab.value;
        if (tab == RolesPermissionsTab.roles) {
          return FloatingActionButton(
            onPressed: () => showRoleFormDialog(context),
            tooltip: 'Crear rol',
            child: const Icon(Icons.add),
          );
        }
        if (tab == RolesPermissionsTab.permissions) {
          return FloatingActionButton(
            onPressed: () => showPermissionFormDialog(context),
            tooltip: 'Crear permiso',
            child: const Icon(Icons.add),
          );
        }
        return const SizedBox.shrink();
      }),
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
                _TabsHeader(selected: tab, onSelect: controller.selectTab),
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
                            onAssignPermissions: (role) =>
                                showAssignPermissionsDialog(context, role),
                            onEdit: (role) =>
                                showRoleFormDialog(context, role: role),
                            onDelete: (role) =>
                                _confirmDeleteRole(context, role),
                          )
                        : _PermissionsTable(
                            key: const ValueKey('permissions-table'),
                            permissions: controller.filteredPermissions,
                            onEdit: (permission) => showPermissionFormDialog(
                              context,
                              permission: permission,
                            ),
                            onDelete: (permission) =>
                                _confirmDeletePermission(context, permission),
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

class RolesPermissionsStandaloneTab
    extends GetWidget<RolesPermissionsController> {
  final RolesPermissionsTab tab;

  const RolesPermissionsStandaloneTab({super.key, required this.tab});

  @override
  Widget build(BuildContext context) {
    final cs = Theme.of(context).colorScheme;
    final tt = Theme.of(context).textTheme;

    return Obx(() {
      final isLoading = controller.isLoading.value;
      final error = controller.errorMessage.value;

      if (isLoading && _isTabEmpty) {
        return const Center(child: CircularProgressIndicator());
      }

      if (error != null) {
        return _ErrorState(message: error, onRetry: controller.refreshData);
      }

      final isRolesTab = tab == RolesPermissionsTab.roles;
      final roles = controller.filteredRoles;
      final perms = controller.filteredPermissions;
      final totalLabel = isRolesTab
          ? 'Roles encontrados: '
          : 'Permisos encontrados: ';
      final totalCount = isRolesTab ? roles.length : perms.length;

      return RefreshIndicator(
        onRefresh: controller.refreshData,
        child: ListView(
          physics: const AlwaysScrollableScrollPhysics(),
          padding: const EdgeInsets.all(24),
          children: [
            TextField(
              onChanged: controller.setSearch,
              decoration: InputDecoration(
                labelText: 'Buscar',
                hintText: isRolesTab
                    ? 'ID, nombre, descripción…'
                    : 'ID, recurso, acción…',
                prefixIcon: const Icon(Icons.search),
                suffixIcon: controller.searchText.value.isEmpty
                    ? null
                    : IconButton(
                        tooltip: 'Limpiar',
                        icon: const Icon(Icons.clear),
                        onPressed: controller.clearSearch,
                      ),
              ),
            ),
            const SizedBox(height: 12),
            Text(
              '$totalLabel$totalCount',
              style: tt.titleMedium?.copyWith(
                fontWeight: FontWeight.w600,
                color: cs.onSurfaceVariant,
              ),
            ),
            const SizedBox(height: 12),
            if (isRolesTab)
              (roles.isEmpty)
                  ? const _EmptyState(
                      message:
                          'No se encontraron roles con los criterios aplicados.',
                    )
                  : AnimatedSwitcher(
                      duration: const Duration(milliseconds: 250),
                      child: _RolesTable(
                        key: const ValueKey('roles-tab-panel'),
                        roles: roles,
                        onAssignPermissions: (role) =>
                            showAssignPermissionsDialog(context, role),
                        onEdit: (role) =>
                            showRoleFormDialog(context, role: role),
                        onDelete: (role) => _confirmDeleteRole(context, role),
                      ),
                    )
            else
              (perms.isEmpty)
                  ? const _EmptyState(
                      message:
                          'No se encontraron permisos con los criterios aplicados.',
                    )
                  : AnimatedSwitcher(
                      duration: const Duration(milliseconds: 250),
                      child: _PermissionsTable(
                        key: const ValueKey('permissions-tab-panel'),
                        permissions: perms,
                        onEdit: (permission) => showPermissionFormDialog(
                          context,
                          permission: permission,
                        ),
                        onDelete: (permission) =>
                            _confirmDeletePermission(context, permission),
                      ),
                    ),
          ],
        ),
      );
    });
  }

  bool get _isTabEmpty => tab == RolesPermissionsTab.roles
      ? controller.roles.isEmpty
      : controller.permissions.isEmpty;
}

// -------------------- (resto de widgets igual que ya los tienes) --------------------

class _TabsHeader extends StatelessWidget {
  const _TabsHeader({required this.selected, required this.onSelect});

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
            ? theme.colorScheme.primary.withValues(alpha: 0.12)
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
  const _RolesTable({
    super.key,
    required this.roles,
    this.onAssignPermissions,
    this.onEdit,
    this.onDelete,
  });
  final List<Role> roles;
  final ValueChanged<Role>? onAssignPermissions;
  final ValueChanged<Role>? onEdit;
  final ValueChanged<Role>? onDelete;

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
              DataColumn(label: Text('Tipo de negocio')),
              DataColumn(label: Text('Alcance')),
              DataColumn(label: Text('Nivel')),
              DataColumn(label: Text('Tipo')),
              DataColumn(label: Text('Acciones')),
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
        DataCell(
          Text(
            role.businessTypeName?.isNotEmpty == true
                ? role.businessTypeName!
                : '-',
          ),
        ),
        DataCell(Text(scope)),
        DataCell(Text('${role.level}')),
        DataCell(_RoleTypeChip(isSystem: role.isSystem)),
        DataCell(
          Row(
            children: [
              IconButton(
                tooltip: 'Asignar permisos',
                icon: const Icon(Icons.fact_check_outlined),
                onPressed: onAssignPermissions == null
                    ? null
                    : () => onAssignPermissions!(role),
              ),
              IconButton(
                tooltip: 'Editar rol',
                icon: const Icon(Icons.edit_outlined),
                onPressed: onEdit == null ? null : () => onEdit!(role),
              ),
              if (!role.isSystem)
                IconButton(
                  tooltip: 'Eliminar rol',
                  icon: const Icon(Icons.delete_outline),
                  onPressed: onDelete == null ? null : () => onDelete!(role),
                ),
            ],
          ),
        ),
      ],
    );
  }
}

class _PermissionsTable extends StatelessWidget {
  const _PermissionsTable({
    super.key,
    required this.permissions,
    this.onEdit,
    this.onDelete,
  });
  final List<Permission> permissions;
  final ValueChanged<Permission>? onEdit;
  final ValueChanged<Permission>? onDelete;

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
              DataColumn(label: Text('Nombre del permiso')),
              DataColumn(label: Text('Descripción')),
              DataColumn(label: Text('Recurso')),
              DataColumn(label: Text('Acción')),
              DataColumn(label: Text('Tipo de negocio')),
              DataColumn(label: Text('Acciones')),
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
        DataCell(Text(p.name.isNotEmpty ? p.name : '-')),
        DataCell(
          ConstrainedBox(
            constraints: const BoxConstraints(maxWidth: 280),
            child: Text(p.description.isNotEmpty ? p.description : '-'),
          ),
        ),
        DataCell(Text(p.resource.isNotEmpty ? p.resource : '-')),
        DataCell(Text(p.action.isNotEmpty ? p.action : '-')),
        DataCell(Text(p.businessTypeName ?? '-')),
        DataCell(
          Row(
            children: [
              IconButton(
                tooltip: 'Editar permiso',
                icon: const Icon(Icons.edit_outlined),
                onPressed: onEdit == null ? null : () => onEdit!(p),
              ),
              IconButton(
                tooltip: 'Eliminar permiso',
                icon: const Icon(Icons.delete_outline),
                onPressed: onDelete == null ? null : () => onDelete!(p),
              ),
            ],
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

class _RoleTypeChip extends StatelessWidget {
  final bool isSystem;

  const _RoleTypeChip({required this.isSystem});

  @override
  Widget build(BuildContext context) {
    final cs = Theme.of(context).colorScheme;
    final background = isSystem ? cs.tertiaryContainer : cs.primaryContainer;
    final foreground = isSystem
        ? cs.onTertiaryContainer
        : cs.onPrimaryContainer;
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
      decoration: BoxDecoration(
        color: background,
        borderRadius: BorderRadius.circular(999),
      ),
      child: Text(
        isSystem ? 'Sistema' : 'Personalizado',
        style: Theme.of(context).textTheme.labelSmall?.copyWith(
          color: foreground,
          fontWeight: FontWeight.w600,
        ),
      ),
    );
  }
}

Future<void> showRoleFormDialog(BuildContext context, {Role? role}) async {
  final controller = Get.find<RolesPermissionsController>();
  final iamRepository = IamRepositoryImpl();
  final businessTypes = await iamRepository.getBusinessTypes();
  final formKey = GlobalKey<FormState>();
  final nameCtrl = TextEditingController(text: role?.name ?? '');
  final codeCtrl = TextEditingController(text: role?.code ?? '');
  final descriptionCtrl = TextEditingController(text: role?.description ?? '');
  int selectedLevel = role?.level ?? 1;
  int selectedScope = role?.scopeId ?? 1;
  int? selectedBusinessType = role?.businessTypeId;
  bool isSystem = role?.isSystem ?? false;

  await showDialog(
    context: context,
    builder: (ctx) {
      return StatefulBuilder(
        builder: (ctx, setState) {
          return AlertDialog(
            title: Text(role == null ? 'Crear rol' : 'Editar rol'),
            content: SingleChildScrollView(
              child: Form(
                key: formKey,
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    TextFormField(
                      controller: nameCtrl,
                      decoration: const InputDecoration(
                        labelText: 'Nombre del rol',
                      ),
                      validator: (value) =>
                          value == null || value.trim().isEmpty
                          ? 'Campo obligatorio'
                          : null,
                    ),
                    // const SizedBox(height: 12),
                    // TextFormField(
                    //   controller: codeCtrl,
                    //   decoration: const InputDecoration(
                    //     labelText: 'Código del rol',
                    //   ),
                    //   validator: (value) =>
                    //       value == null || value.trim().isEmpty
                    //       ? 'Campo obligatorio'
                    //       : null,
                    // ),
                    const SizedBox(height: 12),
                    TextFormField(
                      controller: descriptionCtrl,
                      decoration: const InputDecoration(
                        labelText: 'Descripción',
                      ),
                      minLines: 2,
                      maxLines: 3,
                    ),
                    const SizedBox(height: 12),
                    DropdownButtonFormField<int>(
                      initialValue: selectedLevel,
                      decoration: const InputDecoration(
                        labelText: 'Nivel del rol',
                      ),
                      items: const [
                        DropdownMenuItem(
                          value: 1,
                          child: Text('Nivel 1 - Básico'),
                        ),
                        DropdownMenuItem(
                          value: 2,
                          child: Text('Nivel 2 - Intermedio'),
                        ),
                        DropdownMenuItem(
                          value: 3,
                          child: Text('Nivel 3 - Avanzado'),
                        ),
                        DropdownMenuItem(
                          value: 4,
                          child: Text('Nivel 4 - Administrador'),
                        ),
                        DropdownMenuItem(
                          value: 5,
                          child: Text('Nivel 5 - Super Administrador'),
                        ),
                      ],
                      onChanged: (value) {
                        if (value != null) {
                          setState(() => selectedLevel = value);
                        }
                      },
                    ),
                    const SizedBox(height: 12),
                    DropdownButtonFormField<int>(
                      initialValue: selectedScope,
                      decoration: const InputDecoration(labelText: 'Ámbito'),
                      items: const [
                        DropdownMenuItem(value: 1, child: Text('Plataforma')),
                        DropdownMenuItem(value: 2, child: Text('Negocio')),
                      ],
                      onChanged: (value) {
                        if (value != null) {
                          setState(() => selectedScope = value);
                        }
                      },
                    ),
                    const SizedBox(height: 12),
                    DropdownButtonFormField<int?>(
                      initialValue: selectedBusinessType,
                      decoration: const InputDecoration(
                        labelText: 'Business type',
                      ),
                      items: [
                        const DropdownMenuItem(
                          value: null,
                          child: Text('Genérico'),
                        ),
                        ...businessTypes.types
                            .map(
                              (type) => DropdownMenuItem(
                                value: type.id,
                                child: Text(type.name),
                              ),
                            )
                            .toList(),
                      ],
                      onChanged: (value) =>
                          setState(() => selectedBusinessType = value),
                    ),
                    const SizedBox(height: 12),
                    CheckboxListTile(
                      contentPadding: EdgeInsets.zero,
                      title: const Text(
                        'Rol del sistema (no se puede eliminar)',
                      ),
                      value: isSystem,
                      onChanged: (value) =>
                          setState(() => isSystem = value ?? false),
                    ),
                  ],
                ),
              ),
            ),
            actions: [
              TextButton(
                onPressed: () => Navigator.of(ctx).pop(),
                child: const Text('Cancelar'),
              ),
              FilledButton(
                onPressed: () async {
                  if (!formKey.currentState!.validate()) return;
                  final payload = {
                    'name': nameCtrl.text.trim(),
                    'code': codeCtrl.text.trim(),
                    'description': descriptionCtrl.text.trim(),
                    'level': selectedLevel,
                    'scope_id': selectedScope,
                    if (selectedBusinessType != null)
                      'business_type_id': selectedBusinessType,
                    'is_system': isSystem,
                  };
                  RoleActionResult result;
                  if (role == null) {
                    result = await controller.crearRol(payload);
                  } else {
                    result = await controller.actualizarRol(role.id, payload);
                  }
                  if (result.success) {
                    Navigator.of(ctx).pop();
                    _showIamSnack(context, result.message);
                  } else {
                    _showIamSnack(context, result.message);
                  }
                },
                child: Text(role == null ? 'Crear rol' : 'Guardar cambios'),
              ),
            ],
          );
        },
      );
    },
  );
}

Future<void> showAssignPermissionsDialog(
  BuildContext context,
  Role role,
) async {
  final controller = Get.find<RolesPermissionsController>();
  final assigned = (await controller.obtenerPermisosAsignados(role.id)).toSet();
  final selected = Set<int>.from(assigned);
  final permissions = controller.permissions;

  await showDialog(
    context: context,
    builder: (ctx) {
      return StatefulBuilder(
        builder: (ctx, setState) {
          return AlertDialog(
            title: Text('Permisos para ${role.name}'),
            content: SizedBox(
              width: 420,
              height: 420,
              child: permissions.isEmpty
                  ? const Center(child: Text('No hay permisos disponibles.'))
                  : ListView(
                      children: permissions.map((permission) {
                        final isSelected = selected.contains(permission.id);
                        final isAssigned = assigned.contains(permission.id);
                        return CheckboxListTile(
                          value: isSelected,
                          onChanged: (value) {
                            setState(() {
                              if (value == true) {
                                selected.add(permission.id);
                              } else {
                                selected.remove(permission.id);
                              }
                            });
                          },
                          title: Text(permission.name),
                          subtitle: Text(
                            '${permission.resource} - ${permission.action}',
                          ),
                          secondary: IconButton(
                            icon: const Icon(Icons.remove_circle_outline),
                            tooltip: 'Eliminar permiso del rol',
                            onPressed: isAssigned
                                ? () async {
                                    final result = await controller
                                        .eliminarPermisoAsignado(
                                          role.id,
                                          permission.id,
                                        );
                                    if (result.success) {
                                      setState(() {
                                        selected.remove(permission.id);
                                        assigned.remove(permission.id);
                                      });
                                      _showIamSnack(context, result.message);
                                    } else {
                                      _showIamSnack(ctx, result.message);
                                    }
                                  }
                                : null,
                          ),
                        );
                      }).toList(),
                    ),
            ),
            actions: [
              TextButton(
                onPressed: () => Navigator.of(ctx).pop(),
                child: const Text('Cancelar'),
              ),
              FilledButton(
                onPressed: () async {
                  final result = await controller.asignarPermisos(
                    role.id,
                    selected.toList(),
                  );
                  if (result.success) {
                    Navigator.of(ctx).pop();
                    _showIamSnack(context, result.message);
                  } else {
                    _showIamSnack(context, result.message);
                  }
                },
                child: const Text('Asignar permisos'),
              ),
            ],
          );
        },
      );
    },
  );
}

Future<void> showPermissionFormDialog(
  BuildContext context, {
  Permission? permission,
}) async {
  final controller = Get.find<RolesPermissionsController>();
  final iamRepository = IamRepositoryImpl();
  final businessTypes = await iamRepository.getBusinessTypes();
  final resourcesPage = await iamRepository.getResources(pageSize: 100);
  final actionsPage = await iamRepository.getActions(pageSize: 100);

  final formKey = GlobalKey<FormState>();
  final nameCtrl = TextEditingController(text: permission?.name ?? '');
  final codeCtrl = TextEditingController(text: permission?.code ?? '');
  final descriptionCtrl = TextEditingController(
    text: permission?.description ?? '',
  );
  int? selectedBusinessType = permission?.businessTypeId;
  int? selectedResource =
      permission?.resourceId ??
      (resourcesPage.resources.isNotEmpty
          ? resourcesPage.resources.first.id
          : null);
  int? selectedAction =
      permission?.actionId ??
      (actionsPage.actions.isNotEmpty ? actionsPage.actions.first.id : null);
  int selectedScope = permission?.scopeId ?? 1;

  await showDialog(
    context: context,
    builder: (ctx) {
      return StatefulBuilder(
        builder: (ctx, setState) {
          return AlertDialog(
            title: Text(
              permission == null ? 'Crear permiso' : 'Editar permiso',
            ),
            content: SingleChildScrollView(
              child: Form(
                key: formKey,
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    TextFormField(
                      controller: nameCtrl,
                      decoration: const InputDecoration(
                        labelText: 'Nombre del permiso',
                      ),
                      validator: (value) =>
                          value == null || value.trim().isEmpty
                          ? 'Campo obligatorio'
                          : null,
                    ),
                    // const SizedBox(height: 12),
                    // TextFormField(
                    //   controller: codeCtrl,
                    //   decoration: const InputDecoration(labelText: 'Código'),
                    //   validator: (value) =>
                    //       value == null || value.trim().isEmpty
                    //       ? 'Campo obligatorio'
                    //       : null,
                    // ),
                    const SizedBox(height: 12),
                    TextFormField(
                      controller: descriptionCtrl,
                      decoration: const InputDecoration(
                        labelText: 'Descripción',
                      ),
                      minLines: 2,
                      maxLines: 3,
                    ),
                    const SizedBox(height: 12),
                    DropdownButtonFormField<int?>(
                      initialValue: selectedBusinessType,
                      decoration: const InputDecoration(
                        labelText: 'Tipo de negocio',
                      ),
                      items: [
                        const DropdownMenuItem(
                          value: null,
                          child: Text('Genérico'),
                        ),
                        ...businessTypes.types
                            .map(
                              (type) => DropdownMenuItem(
                                value: type.id,
                                child: Text(type.name),
                              ),
                            )
                            .toList(),
                      ],
                      onChanged: (value) =>
                          setState(() => selectedBusinessType = value),
                    ),
                    const SizedBox(height: 12),
                    DropdownButtonFormField<int>(
                      initialValue: selectedResource,
                      decoration: const InputDecoration(labelText: 'Recursos'),
                      items: resourcesPage.resources
                          .map(
                            (resource) => DropdownMenuItem(
                              value: resource.id,
                              child: Text(resource.name),
                            ),
                          )
                          .toList(),
                      onChanged: (value) =>
                          setState(() => selectedResource = value),
                      validator: (value) =>
                          value == null ? 'Seleccione un recurso' : null,
                    ),
                    const SizedBox(height: 12),
                    DropdownButtonFormField<int>(
                      initialValue: selectedAction,
                      decoration: const InputDecoration(labelText: 'Acción'),
                      items: actionsPage.actions
                          .map(
                            (action) => DropdownMenuItem(
                              value: action.id,
                              child: Text(
                                '${action.name} - ${action.description}',
                              ),
                            ),
                          )
                          .toList(),
                      onChanged: (value) =>
                          setState(() => selectedAction = value),
                      validator: (value) =>
                          value == null ? 'Seleccione una acción' : null,
                    ),
                    const SizedBox(height: 12),
                    DropdownButtonFormField<int>(
                      initialValue: selectedScope,
                      decoration: const InputDecoration(
                        labelText: 'Scope / Ámbito',
                      ),
                      items: const [
                        DropdownMenuItem(value: 1, child: Text('Plataforma')),
                        DropdownMenuItem(value: 2, child: Text('Negocio')),
                      ],
                      onChanged: (value) {
                        if (value != null) {
                          setState(() => selectedScope = value);
                        }
                      },
                    ),
                  ],
                ),
              ),
            ),
            actions: [
              TextButton(
                onPressed: () => Navigator.of(ctx).pop(),
                child: const Text('Cancelar'),
              ),
              FilledButton(
                onPressed: () async {
                  if (!formKey.currentState!.validate()) return;
                  final payload = {
                    'name': nameCtrl.text.trim(),
                    'code': codeCtrl.text.trim(),
                    'description': descriptionCtrl.text.trim(),
                    'resource_id': selectedResource,
                    'action_id': selectedAction,
                    'scope_id': selectedScope,
                    if (selectedBusinessType != null)
                      'business_type_id': selectedBusinessType,
                  };
                  if (permission == null) {
                    final result = await controller.crearPermiso(payload);
                    if (result.success) {
                      Navigator.of(ctx).pop();
                      _showIamSnack(context, result.message);
                    } else {
                      _showIamSnack(context, result.message);
                    }
                  } else {
                    final result = await controller.actualizarPermisoRegistro(
                      permission.id,
                      payload,
                    );
                    if (result.success) {
                      Navigator.of(ctx).pop();
                      _showIamSnack(context, result.message);
                    } else {
                      _showIamSnack(context, result.message);
                    }
                  }
                },
                child: Text(
                  permission == null ? 'Crear permiso' : 'Guardar cambios',
                ),
              ),
            ],
          );
        },
      );
    },
  );
}

Future<void> _confirmDeleteRole(BuildContext context, Role role) async {
  final controller = Get.find<RolesPermissionsController>();
  final shouldDelete = await showDialog<bool>(
    context: context,
    builder: (ctx) => AlertDialog(
      title: const Text('Eliminar rol'),
      content: Text('¿Deseas eliminar el rol ${role.name}?'),
      actions: [
        TextButton(
          onPressed: () => Navigator.of(ctx).pop(false),
          child: const Text('Cancelar'),
        ),
        FilledButton(
          onPressed: () => Navigator.of(ctx).pop(true),
          child: const Text('Eliminar'),
        ),
      ],
    ),
  );
  if (shouldDelete != true) return;
  final result = await controller.eliminarRol(role.id);
  _showIamSnack(context, result.message);
}

Future<void> _confirmDeletePermission(
  BuildContext context,
  Permission permission,
) async {
  final controller = Get.find<RolesPermissionsController>();
  final shouldDelete = await showDialog<bool>(
    context: context,
    builder: (ctx) => AlertDialog(
      title: const Text('Eliminar permiso'),
      content: Text('¿Eliminar ${permission.name}?'),
      actions: [
        TextButton(
          onPressed: () => Navigator.of(ctx).pop(false),
          child: const Text('Cancelar'),
        ),
        FilledButton(
          onPressed: () => Navigator.of(ctx).pop(true),
          child: const Text('Eliminar'),
        ),
      ],
    ),
  );
  if (shouldDelete != true) return;
  final result = await controller.eliminarPermisoRegistro(permission.id);
  _showIamSnack(context, result.message);
}

void _showIamSnack(BuildContext context, String message) {
  ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(message)));
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
