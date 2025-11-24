// presentation/views/roles_permissions/roles_permissions_view.dart
import 'package:flutter/material.dart';
import 'package:get/get.dart';

import 'package:rupu/config/helpers/design_helper.dart';
import 'package:rupu/config/helpers/dialog_helper.dart';
import 'package:rupu/domain/entities/permission.dart';
import 'package:rupu/domain/entities/role.dart';
import 'package:rupu/domain/entities/role_action_result.dart';
import 'package:rupu/domain/infrastructure/repositories/iam_repository_impl.dart';
import 'package:rupu/presentation/views/roles_permissions/roles_permissions_controller.dart';
import 'package:rupu/presentation/views/users/widgets/user_detail_widgets.dart';

class RolesPermissionsView extends GetView<RolesPermissionsController> {
  static const name = 'roles-permissions';
  final int pageIndex;

  const RolesPermissionsView({super.key, required this.pageIndex});

  @override
  Widget build(BuildContext context) {
    final cs = Theme.of(context).colorScheme;
    final tt = Theme.of(context).textTheme;

    return Scaffold(
      backgroundColor: cs.surface,
      extendBodyBehindAppBar: true,
      appBar: AppBar(
        elevation: 0,
        scrolledUnderElevation: 0,
        backgroundColor: Colors.transparent,
        title: Text(
          'Usuarios y permisos',
          style: TextStyle(color: cs.onPrimary, fontWeight: FontWeight.bold),
        ),
        centerTitle: true,
        iconTheme: IconThemeData(color: cs.onPrimary),
      ),
      floatingActionButton: Obx(() {
        final tab = controller.selectedTab.value;
        return FloatingActionButton(
          onPressed: () {
            if (tab == RolesPermissionsTab.roles) {
              showRoleFormDialog(context);
            } else {
              showPermissionFormDialog(context);
            }
          },
          backgroundColor: cs.primary,
          foregroundColor: cs.onPrimary,
          tooltip: tab == RolesPermissionsTab.roles
              ? 'Crear rol'
              : 'Crear permiso',
          child: const Icon(Icons.add),
        );
      }),
      body: Stack(
        children: [
          // Gradient Header
          Container(
            height: 200,
            decoration: BoxDecoration(
              gradient: LinearGradient(
                colors: [cs.primary, cs.secondary.withValues(alpha: 0.9)],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
            ),
          ),

          // Main Content
          SafeArea(
            bottom: false,
            child: CustomScrollView(
              slivers: [
                SliverToBoxAdapter(
                  child: Padding(
                    padding: const EdgeInsets.fromLTRB(20, 20, 20, 0),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.stretch,
                      children: [
                        // Tabs
                        Obx(
                          () => _TabsHeader(
                            selected: controller.selectedTab.value,
                            onSelect: controller.selectTab,
                          ),
                        ),

                        const SizedBox(height: 20),

                        // Search Bar
                        GlassContainer(
                          borderRadius: BorderRadius.circular(16),
                          blur: 10,
                          opacity: 0.2,
                          child: TextField(
                            onChanged: controller.setSearch,
                            style: TextStyle(color: cs.onPrimary),
                            cursorColor: cs.onPrimary,
                            decoration: InputDecoration(
                              hintText: 'Buscar...',
                              hintStyle: TextStyle(
                                color: cs.onPrimary.withValues(alpha: 0.7),
                              ),
                              prefixIcon: Icon(
                                Icons.search,
                                color: cs.onPrimary,
                              ),
                              suffixIcon: Obx(
                                () => controller.searchText.value.isNotEmpty
                                    ? IconButton(
                                        icon: Icon(
                                          Icons.clear,
                                          color: cs.onPrimary,
                                        ),
                                        onPressed: controller.clearSearch,
                                      )
                                    : const SizedBox.shrink(),
                              ),
                              border: InputBorder.none,
                              contentPadding: const EdgeInsets.symmetric(
                                horizontal: 20,
                                vertical: 16,
                              ),
                            ),
                          ),
                        ),

                        const SizedBox(height: 20),

                        // Results Count
                        Obx(() {
                          final tab = controller.selectedTab.value;
                          final total = tab == RolesPermissionsTab.roles
                              ? controller.filteredRoles.length
                              : controller.filteredPermissions.length;

                          return Text(
                            'Resultados: $total',
                            style: tt.titleSmall?.copyWith(
                              fontWeight: FontWeight.w600,
                              color: cs.onSurfaceVariant,
                            ),
                          );
                        }),

                        const SizedBox(height: 12),
                      ],
                    ),
                  ),
                ),

                // List Content
                SliverPadding(
                  padding: const EdgeInsets.fromLTRB(20, 0, 20, 80),
                  sliver: Obx(() {
                    if (controller.isLoading.value) {
                      return const SliverFillRemaining(
                        child: Center(child: CircularProgressIndicator()),
                      );
                    }

                    final error = controller.errorMessage.value;
                    if (error != null) {
                      return SliverFillRemaining(
                        child: _ErrorState(
                          message: error,
                          onRetry: controller.refreshData,
                        ),
                      );
                    }

                    final isRoles =
                        controller.selectedTab.value ==
                        RolesPermissionsTab.roles;

                    if (isRoles) {
                      if (controller.filteredRoles.isEmpty) {
                        return const SliverFillRemaining(
                          child: _EmptyState(
                            message: 'No se encontraron roles.',
                          ),
                        );
                      }
                      return SliverList(
                        delegate: SliverChildBuilderDelegate((context, index) {
                          final role = controller.filteredRoles[index];
                          return _RoleCard(
                            role: role,
                            onAssign: () =>
                                showAssignPermissionsDialog(context, role),
                            onEdit: () =>
                                showRoleFormDialog(context, role: role),
                            onDelete: () => _confirmDeleteRole(context, role),
                          );
                        }, childCount: controller.filteredRoles.length),
                      );
                    } else {
                      if (controller.filteredPermissions.isEmpty) {
                        return const SliverFillRemaining(
                          child: _EmptyState(
                            message: 'No se encontraron permisos.',
                          ),
                        );
                      }
                      return SliverList(
                        delegate: SliverChildBuilderDelegate((context, index) {
                          final permission =
                              controller.filteredPermissions[index];
                          return _PermissionCard(
                            permission: permission,
                            onEdit: () => showPermissionFormDialog(
                              context,
                              permission: permission,
                            ),
                            onDelete: () =>
                                _confirmDeletePermission(context, permission),
                          );
                        }, childCount: controller.filteredPermissions.length),
                      );
                    }
                  }),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _TabsHeader extends StatelessWidget {
  const _TabsHeader({required this.selected, required this.onSelect});

  final RolesPermissionsTab selected;
  final ValueChanged<RolesPermissionsTab> onSelect;

  @override
  Widget build(BuildContext context) {
    return GlassContainer(
      borderRadius: BorderRadius.circular(16),
      blur: 10,
      opacity: 0.2,
      padding: const EdgeInsets.all(4),
      child: Row(
        children: [
          Expanded(
            child: _TabButton(
              label: 'Roles',
              isSelected: selected == RolesPermissionsTab.roles,
              onTap: () => onSelect(RolesPermissionsTab.roles),
            ),
          ),
          Expanded(
            child: _TabButton(
              label: 'Permisos',
              isSelected: selected == RolesPermissionsTab.permissions,
              onTap: () => onSelect(RolesPermissionsTab.permissions),
            ),
          ),
        ],
      ),
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
    final cs = Theme.of(context).colorScheme;

    return GestureDetector(
      onTap: onTap,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        padding: const EdgeInsets.symmetric(vertical: 12),
        decoration: BoxDecoration(
          color: isSelected ? cs.surface : Colors.transparent,
          borderRadius: BorderRadius.circular(12),
          boxShadow: isSelected
              ? [
                  BoxShadow(
                    color: Colors.black.withValues(alpha: 0.1),
                    blurRadius: 4,
                    offset: const Offset(0, 2),
                  ),
                ]
              : null,
        ),
        child: Center(
          child: Text(
            label,
            style: TextStyle(
              color: isSelected ? cs.primary : cs.onPrimary,
              fontWeight: FontWeight.w600,
              fontSize: 15,
            ),
          ),
        ),
      ),
    );
  }
}

class _RoleCard extends StatelessWidget {
  final Role role;
  final VoidCallback onAssign;
  final VoidCallback onEdit;
  final VoidCallback onDelete;

  const _RoleCard({
    required this.role,
    required this.onAssign,
    required this.onEdit,
    required this.onDelete,
  });

  @override
  Widget build(BuildContext context) {
    final cs = Theme.of(context).colorScheme;
    final tt = Theme.of(context).textTheme;

    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      decoration: BoxDecoration(
        color: cs.surface,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.05),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: ExpansionTile(
        shape: const Border(),
        collapsedShape: const Border(),
        tilePadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
        leading: Container(
          padding: const EdgeInsets.all(10),
          decoration: BoxDecoration(
            color: cs.primaryContainer,
            shape: BoxShape.circle,
          ),
          child: Icon(Icons.security, color: cs.onPrimaryContainer),
        ),
        title: Text(
          role.name,
          style: tt.titleMedium?.copyWith(fontWeight: FontWeight.bold),
        ),
        subtitle: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const SizedBox(height: 4),
            Row(
              children: [
                _StatusBadge(
                  label: 'Nivel ${role.level}',
                  color: cs.secondary,
                  icon: Icons.layers_outlined,
                ),
                const SizedBox(width: 8),
                if (role.isSystem)
                  _StatusBadge(
                    label: 'Sistema',
                    color: cs.tertiary,
                    icon: Icons.lock_outline,
                  ),
              ],
            ),
          ],
        ),
        children: [
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 0, 16, 16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Divider(),
                if (role.description.isNotEmpty) ...[
                  Text(
                    'Descripción',
                    style: tt.labelMedium?.copyWith(color: cs.primary),
                  ),
                  const SizedBox(height: 4),
                  Text(role.description, style: tt.bodyMedium),
                  const SizedBox(height: 12),
                ],
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Ámbito',
                          style: tt.labelMedium?.copyWith(color: cs.primary),
                        ),
                        Text(
                          role.scopeName ?? role.scopeCode ?? '-',
                          style: tt.bodyMedium,
                        ),
                      ],
                    ),
                    if (role.businessTypeName != null)
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.end,
                        children: [
                          Text(
                            'Tipo de Negocio',
                            style: tt.labelMedium?.copyWith(color: cs.primary),
                          ),
                          Text(role.businessTypeName!, style: tt.bodyMedium),
                        ],
                      ),
                  ],
                ),
                const SizedBox(height: 16),
                Row(
                  mainAxisAlignment: MainAxisAlignment.end,
                  children: [
                    _ActionButton(
                      icon: Icons.fact_check_outlined,
                      tooltip: 'Asignar permisos',
                      onTap: onAssign,
                      color: cs.primary,
                    ),
                    const SizedBox(width: 8),
                    _ActionButton(
                      icon: Icons.edit_outlined,
                      tooltip: 'Editar',
                      onTap: onEdit,
                      color: cs.secondary,
                    ),
                    if (!role.isSystem) ...[
                      const SizedBox(width: 8),
                      _ActionButton(
                        icon: Icons.delete_outline,
                        tooltip: 'Eliminar',
                        onTap: onDelete,
                        color: cs.error,
                      ),
                    ],
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _PermissionCard extends StatelessWidget {
  final Permission permission;
  final VoidCallback onEdit;
  final VoidCallback onDelete;

  const _PermissionCard({
    required this.permission,
    required this.onEdit,
    required this.onDelete,
  });

  @override
  Widget build(BuildContext context) {
    final cs = Theme.of(context).colorScheme;
    final tt = Theme.of(context).textTheme;

    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      decoration: BoxDecoration(
        color: cs.surface,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.05),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: ExpansionTile(
        shape: const Border(),
        collapsedShape: const Border(),
        tilePadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
        leading: Container(
          padding: const EdgeInsets.all(10),
          decoration: BoxDecoration(
            color: cs.secondaryContainer,
            shape: BoxShape.circle,
          ),
          child: Icon(Icons.vpn_key_outlined, color: cs.onSecondaryContainer),
        ),
        title: Text(
          permission.name,
          style: tt.titleMedium?.copyWith(fontWeight: FontWeight.bold),
        ),
        subtitle: Text(
          '${permission.resource} • ${permission.action}',
          style: tt.bodySmall?.copyWith(color: cs.onSurfaceVariant),
        ),
        children: [
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 0, 16, 16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Divider(),
                if (permission.description.isNotEmpty) ...[
                  Text(
                    'Descripción',
                    style: tt.labelMedium?.copyWith(color: cs.primary),
                  ),
                  const SizedBox(height: 4),
                  Text(permission.description, style: tt.bodyMedium),
                  const SizedBox(height: 12),
                ],
                if (permission.businessTypeName != null) ...[
                  Text(
                    'Tipo de Negocio',
                    style: tt.labelMedium?.copyWith(color: cs.primary),
                  ),
                  const SizedBox(height: 4),
                  Text(permission.businessTypeName!, style: tt.bodyMedium),
                  const SizedBox(height: 12),
                ],
                Row(
                  mainAxisAlignment: MainAxisAlignment.end,
                  children: [
                    _ActionButton(
                      icon: Icons.edit_outlined,
                      tooltip: 'Editar',
                      onTap: onEdit,
                      color: cs.secondary,
                    ),
                    const SizedBox(width: 8),
                    _ActionButton(
                      icon: Icons.delete_outline,
                      tooltip: 'Eliminar',
                      onTap: onDelete,
                      color: cs.error,
                    ),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _ActionButton extends StatelessWidget {
  final IconData icon;
  final String tooltip;
  final VoidCallback onTap;
  final Color color;

  const _ActionButton({
    required this.icon,
    required this.tooltip,
    required this.onTap,
    required this.color,
  });

  @override
  Widget build(BuildContext context) {
    return Tooltip(
      message: tooltip,
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          onTap: onTap,
          borderRadius: BorderRadius.circular(50),
          child: Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              border: Border.all(color: color.withValues(alpha: 0.3)),
              color: color.withValues(alpha: 0.1),
            ),
            child: Icon(icon, size: 20, color: color),
          ),
        ),
      ),
    );
  }
}

class _StatusBadge extends StatelessWidget {
  final String label;
  final Color color;
  final IconData icon;

  const _StatusBadge({
    required this.label,
    required this.color,
    required this.icon,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.1),
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: color.withValues(alpha: 0.2)),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 12, color: color),
          const SizedBox(width: 4),
          Text(
            label,
            style: TextStyle(
              color: color,
              fontSize: 11,
              fontWeight: FontWeight.w600,
            ),
          ),
        ],
      ),
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

  if (!context.mounted) return;

  await DialogHelper.showBlurredDialog(
    context: context,
    builder: (ctx) => StatefulBuilder(
      builder: (ctx, setState) {
        return AlertDialog(
          title: Text(role == null ? 'Crear rol' : 'Editar rol'),
          content: SingleChildScrollView(
            child: Form(
              key: formKey,
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  StyledFormField(
                    controller: nameCtrl,
                    label: 'Nombre del rol',
                    icon: Icons.badge_outlined,
                    validator: (value) => value == null || value.trim().isEmpty
                        ? 'Campo obligatorio'
                        : null,
                  ),
                  const SizedBox(height: 12),
                  StyledFormField(
                    controller: descriptionCtrl,
                    label: 'Descripción',
                    icon: Icons.description_outlined,
                  ),
                  const SizedBox(height: 12),
                  DropdownButtonFormField<int>(
                    value: selectedLevel,
                    decoration: DesignHelper.inputDecoration(
                      label: 'Nivel del rol',
                      icon: Icons.layers_outlined,
                      context: ctx,
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
                        child: Text('Nivel 5 - Super Admin'),
                      ),
                    ],
                    onChanged: (value) {
                      if (value != null) setState(() => selectedLevel = value);
                    },
                  ),
                  const SizedBox(height: 12),
                  DropdownButtonFormField<int>(
                    value: selectedScope,
                    decoration: DesignHelper.inputDecoration(
                      label: 'Ámbito',
                      icon: Icons.public,
                      context: ctx,
                    ),
                    items: const [
                      DropdownMenuItem(value: 1, child: Text('Plataforma')),
                      DropdownMenuItem(value: 2, child: Text('Negocio')),
                    ],
                    onChanged: (value) {
                      if (value != null) setState(() => selectedScope = value);
                    },
                  ),
                  const SizedBox(height: 12),
                  DropdownButtonFormField<int?>(
                    value: selectedBusinessType,
                    decoration: DesignHelper.inputDecoration(
                      label: 'Tipo de negocio',
                      icon: Icons.business,
                      context: ctx,
                    ),
                    items: [
                      const DropdownMenuItem(
                        value: null,
                        child: Text('Genérico'),
                      ),
                      ...businessTypes.types.map(
                        (type) => DropdownMenuItem(
                          value: type.id,
                          child: Text(type.name),
                        ),
                      ),
                    ],
                    onChanged: (value) =>
                        setState(() => selectedBusinessType = value),
                  ),
                  const SizedBox(height: 12),
                  CheckboxListTile(
                    contentPadding: EdgeInsets.zero,
                    title: const Text('Rol del sistema'),
                    subtitle: const Text('No se podrá eliminar si está activo'),
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

                // Show loading
                DialogHelper.showLoading(ctx);

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

                // Hide loading
                if (ctx.mounted) Navigator.of(ctx).pop(); // Pop loading

                if (ctx.mounted) {
                  if (result.success) {
                    Navigator.of(ctx).pop(); // Pop dialog
                    DialogHelper.showBlurredDialog(
                      context: ctx,
                      builder: (ctx) => AlertDialog(
                        title: const Text('Éxito'),
                        content: Text(result.message),
                        actions: [
                          FilledButton(
                            onPressed: () => Navigator.of(ctx).pop(),
                            child: const Text('Aceptar'),
                          ),
                        ],
                      ),
                    );
                  } else {
                    DialogHelper.showBlurredDialog(
                      context: ctx,
                      builder: (ctx) => AlertDialog(
                        title: const Text('Error'),
                        content: Text(result.message),
                        actions: [
                          FilledButton(
                            onPressed: () => Navigator.of(ctx).pop(),
                            child: const Text('Aceptar'),
                          ),
                        ],
                      ),
                    );
                  }
                }
              },
              child: Text(role == null ? 'Crear' : 'Guardar'),
            ),
          ],
        );
      },
    ),
  );
}

Future<void> showAssignPermissionsDialog(
  BuildContext context,
  Role role,
) async {
  final controller = Get.find<RolesPermissionsController>();
  final assigned = (await controller.obtenerPermisosAsignados(role.id)).toSet();
  final selected = Set<int>.from(assigned);
  final allPermissions = controller.permissions;

  // Local state for search
  String searchQuery = '';

  if (!context.mounted) return;

  await DialogHelper.showBlurredDialog(
    context: context,
    builder: (ctx) => StatefulBuilder(
      builder: (ctx, setState) {
        final theme = Theme.of(ctx);
        final cs = theme.colorScheme;
        final tt = theme.textTheme;

        final filteredPermissions = allPermissions.where((p) {
          final q = searchQuery.toLowerCase();
          return p.name.toLowerCase().contains(q) ||
              p.resource.toLowerCase().contains(q) ||
              p.action.toLowerCase().contains(q);
        }).toList();

        return AlertDialog(
          backgroundColor: cs.surface,
          surfaceTintColor: Colors.transparent,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(28),
          ),
          titlePadding: const EdgeInsets.fromLTRB(24, 24, 24, 16),
          contentPadding: const EdgeInsets.fromLTRB(0, 0, 0, 24),
          actionsPadding: const EdgeInsets.fromLTRB(24, 0, 24, 24),
          title: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Icon(Icons.shield_outlined, color: cs.primary),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Text(
                      'Asignar permisos',
                      style: tt.headlineSmall?.copyWith(
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 8),
              Text(
                'Rol: ${role.name}',
                style: tt.bodyMedium?.copyWith(color: cs.onSurfaceVariant),
              ),
            ],
          ),
          content: SizedBox(
            width: double.maxFinite,
            height: 500,
            child: Column(
              children: [
                // Search Bar
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 24),
                  child: TextField(
                    onChanged: (value) => setState(() => searchQuery = value),
                    decoration: InputDecoration(
                      hintText: 'Buscar permiso...',
                      prefixIcon: const Icon(Icons.search),
                      filled: true,
                      fillColor: cs.surfaceContainerHighest.withValues(
                        alpha: 0.5,
                      ),
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(12),
                        borderSide: BorderSide.none,
                      ),
                      contentPadding: const EdgeInsets.symmetric(
                        horizontal: 16,
                        vertical: 12,
                      ),
                    ),
                  ),
                ),
                const SizedBox(height: 16),

                // Stats
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 24),
                  child: Row(
                    children: [
                      Text(
                        '${selected.length} seleccionados',
                        style: tt.labelLarge?.copyWith(
                          color: cs.primary,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      const Spacer(),
                      TextButton(
                        onPressed: () {
                          setState(() {
                            if (selected.length == filteredPermissions.length) {
                              selected.clear();
                            } else {
                              selected.addAll(
                                filteredPermissions.map((p) => p.id),
                              );
                            }
                          });
                        },
                        child: Text(
                          selected.length == filteredPermissions.length
                              ? 'Deseleccionar todo'
                              : 'Seleccionar todo',
                        ),
                      ),
                    ],
                  ),
                ),
                const Divider(height: 1),

                // List
                Expanded(
                  child: filteredPermissions.isEmpty
                      ? Center(
                          child: Column(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Icon(
                                Icons.search_off,
                                size: 48,
                                color: cs.onSurfaceVariant.withValues(
                                  alpha: 0.5,
                                ),
                              ),
                              const SizedBox(height: 16),
                              Text(
                                'No se encontraron permisos',
                                style: tt.bodyLarge?.copyWith(
                                  color: cs.onSurfaceVariant,
                                ),
                              ),
                            ],
                          ),
                        )
                      : ListView.separated(
                          padding: const EdgeInsets.symmetric(vertical: 8),
                          itemCount: filteredPermissions.length,
                          separatorBuilder: (_, __) =>
                              const Divider(height: 1, indent: 72),
                          itemBuilder: (context, index) {
                            final permission = filteredPermissions[index];
                            final isSelected = selected.contains(permission.id);
                            final isAssigned = assigned.contains(permission.id);

                            return Material(
                              color: Colors.transparent,
                              child: InkWell(
                                onTap: () {
                                  setState(() {
                                    if (isSelected) {
                                      selected.remove(permission.id);
                                    } else {
                                      selected.add(permission.id);
                                    }
                                  });
                                },
                                child: Padding(
                                  padding: const EdgeInsets.symmetric(
                                    horizontal: 24,
                                    vertical: 12,
                                  ),
                                  child: Row(
                                    children: [
                                      // Checkbox
                                      Container(
                                        width: 24,
                                        height: 24,
                                        decoration: BoxDecoration(
                                          borderRadius: BorderRadius.circular(
                                            6,
                                          ),
                                          border: Border.all(
                                            color: isSelected
                                                ? cs.primary
                                                : cs.outline,
                                            width: 2,
                                          ),
                                          color: isSelected ? cs.primary : null,
                                        ),
                                        child: isSelected
                                            ? Icon(
                                                Icons.check,
                                                size: 16,
                                                color: cs.onPrimary,
                                              )
                                            : null,
                                      ),
                                      const SizedBox(width: 16),

                                      // Content
                                      Expanded(
                                        child: Column(
                                          crossAxisAlignment:
                                              CrossAxisAlignment.start,
                                          children: [
                                            Text(
                                              permission.name,
                                              style: tt.bodyLarge?.copyWith(
                                                fontWeight: FontWeight.w500,
                                              ),
                                            ),
                                            const SizedBox(height: 4),
                                            Row(
                                              children: [
                                                Container(
                                                  padding:
                                                      const EdgeInsets.symmetric(
                                                        horizontal: 6,
                                                        vertical: 2,
                                                      ),
                                                  decoration: BoxDecoration(
                                                    color: cs.secondaryContainer
                                                        .withValues(alpha: 0.5),
                                                    borderRadius:
                                                        BorderRadius.circular(
                                                          4,
                                                        ),
                                                  ),
                                                  child: Text(
                                                    permission.resource,
                                                    style: tt.labelSmall?.copyWith(
                                                      color: cs
                                                          .onSecondaryContainer,
                                                    ),
                                                  ),
                                                ),
                                                const SizedBox(width: 8),
                                                Text(
                                                  permission.action,
                                                  style: tt.bodySmall?.copyWith(
                                                    color: cs.onSurfaceVariant,
                                                  ),
                                                ),
                                              ],
                                            ),
                                          ],
                                        ),
                                      ),

                                      // Assigned Indicator / Remove Action
                                      if (isAssigned)
                                        IconButton(
                                          icon: const Icon(
                                            Icons.remove_circle_outline,
                                          ),
                                          color: cs.error,
                                          tooltip: 'Eliminar asignación actual',
                                          onPressed: () async {
                                            final confirm = await showDialog<bool>(
                                              context: ctx,
                                              builder: (ctx) => AlertDialog(
                                                title: const Text('Confirmar'),
                                                content: const Text(
                                                  '¿Estás seguro de eliminar esta asignación inmediatamente?',
                                                ),
                                                actions: [
                                                  TextButton(
                                                    onPressed: () =>
                                                        Navigator.pop(
                                                          ctx,
                                                          false,
                                                        ),
                                                    child: const Text(
                                                      'Cancelar',
                                                    ),
                                                  ),
                                                  FilledButton(
                                                    onPressed: () =>
                                                        Navigator.pop(
                                                          ctx,
                                                          true,
                                                        ),
                                                    child: const Text(
                                                      'Eliminar',
                                                    ),
                                                  ),
                                                ],
                                              ),
                                            );

                                            if (confirm != true) return;

                                            DialogHelper.showLoading(ctx);
                                            final result = await controller
                                                .eliminarPermisoAsignado(
                                                  role.id,
                                                  permission.id,
                                                );
                                            if (ctx.mounted)
                                              Navigator.of(ctx).pop();

                                            if (result.success) {
                                              setState(() {
                                                selected.remove(permission.id);
                                                assigned.remove(permission.id);
                                              });
                                            } else {
                                              if (ctx.mounted) {
                                                DialogHelper.showBlurredDialog(
                                                  context: ctx,
                                                  builder: (ctx) => AlertDialog(
                                                    title: const Text('Error'),
                                                    content: Text(
                                                      result.message,
                                                    ),
                                                    actions: [
                                                      FilledButton(
                                                        onPressed: () =>
                                                            Navigator.pop(ctx),
                                                        child: const Text(
                                                          'Aceptar',
                                                        ),
                                                      ),
                                                    ],
                                                  ),
                                                );
                                              }
                                            }
                                          },
                                        ),
                                    ],
                                  ),
                                ),
                              ),
                            );
                          },
                        ),
                ),
              ],
            ),
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.of(ctx).pop(),
              child: const Text('Cancelar'),
            ),
            FilledButton(
              onPressed: () async {
                DialogHelper.showLoading(ctx);
                final result = await controller.asignarPermisos(
                  role.id,
                  selected.toList(),
                );
                if (ctx.mounted) Navigator.of(ctx).pop();

                if (ctx.mounted) {
                  if (result.success) {
                    Navigator.of(ctx).pop();
                    DialogHelper.showBlurredDialog(
                      context: ctx,
                      builder: (ctx) => AlertDialog(
                        title: const Text('Éxito'),
                        content: Text(result.message),
                        actions: [
                          FilledButton(
                            onPressed: () => Navigator.of(ctx).pop(),
                            child: const Text('Aceptar'),
                          ),
                        ],
                      ),
                    );
                  } else {
                    DialogHelper.showBlurredDialog(
                      context: ctx,
                      builder: (ctx) => AlertDialog(
                        title: const Text('Error'),
                        content: Text(result.message),
                        actions: [
                          FilledButton(
                            onPressed: () => Navigator.of(ctx).pop(),
                            child: const Text('Aceptar'),
                          ),
                        ],
                      ),
                    );
                  }
                }
              },
              child: const Text('Guardar cambios'),
            ),
          ],
        );
      },
    ),
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
  int? selectedAction = actionsPage.actions.isNotEmpty
      ? actionsPage.actions.first.id
      : null;
  if (permission?.actionId != null) {
    selectedAction = permission?.actionId;
  }

  int selectedScope = permission?.scopeId ?? 1;

  if (!context.mounted) return;

  await DialogHelper.showBlurredDialog(
    context: context,
    builder: (ctx) => StatefulBuilder(
      builder: (ctx, setState) {
        return AlertDialog(
          title: Text(permission == null ? 'Crear permiso' : 'Editar permiso'),
          content: SingleChildScrollView(
            child: Form(
              key: formKey,
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  StyledFormField(
                    controller: nameCtrl,
                    label: 'Nombre del permiso',
                    icon: Icons.vpn_key_outlined,
                    validator: (value) => value == null || value.trim().isEmpty
                        ? 'Campo obligatorio'
                        : null,
                  ),
                  const SizedBox(height: 12),
                  StyledFormField(
                    controller: descriptionCtrl,
                    label: 'Descripción',
                    icon: Icons.description_outlined,
                  ),
                  const SizedBox(height: 12),
                  DropdownButtonFormField<int?>(
                    value: selectedBusinessType,
                    decoration: DesignHelper.inputDecoration(
                      label: 'Tipo de negocio',
                      icon: Icons.business,
                      context: ctx,
                    ),
                    items: [
                      const DropdownMenuItem(
                        value: null,
                        child: Text('Genérico'),
                      ),
                      ...businessTypes.types.map(
                        (type) => DropdownMenuItem(
                          value: type.id,
                          child: Text(type.name),
                        ),
                      ),
                    ],
                    onChanged: (value) =>
                        setState(() => selectedBusinessType = value),
                  ),
                  const SizedBox(height: 12),
                  DropdownButtonFormField<int>(
                    value: selectedResource,
                    decoration: DesignHelper.inputDecoration(
                      label: 'Recurso',
                      icon: Icons.category_outlined,
                      context: ctx,
                    ),
                    isExpanded: true,
                    items: resourcesPage.resources
                        .map(
                          (resource) => DropdownMenuItem(
                            value: resource.id,
                            child: SizedBox(
                              width: double.infinity,
                              child: Text(
                                resource.name,
                                overflow: TextOverflow.ellipsis,
                              ),
                            ),
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
                    value: selectedAction,
                    decoration: DesignHelper.inputDecoration(
                      label: 'Acción',
                      icon: Icons.touch_app_outlined,
                      context: ctx,
                    ),
                    isExpanded: true,
                    items: actionsPage.actions
                        .map(
                          (action) => DropdownMenuItem(
                            value: action.id,
                            child: SizedBox(
                              width: double.infinity,
                              child: Text(
                                '${action.name} - ${action.description}',
                                overflow: TextOverflow.ellipsis,
                              ),
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
                    value: selectedScope,
                    decoration: DesignHelper.inputDecoration(
                      label: 'Ámbito',
                      icon: Icons.public,
                      context: ctx,
                    ),
                    items: const [
                      DropdownMenuItem(value: 1, child: Text('Plataforma')),
                      DropdownMenuItem(value: 2, child: Text('Negocio')),
                    ],
                    onChanged: (value) {
                      if (value != null) setState(() => selectedScope = value);
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

                DialogHelper.showLoading(ctx);

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

                dynamic result;
                if (permission == null) {
                  result = await controller.crearPermiso(payload);
                } else {
                  result = await controller.actualizarPermisoRegistro(
                    permission.id,
                    payload,
                  );
                }

                if (ctx.mounted) Navigator.of(ctx).pop(); // Pop loading

                if (ctx.mounted) {
                  if (result.success) {
                    Navigator.of(ctx).pop(); // Pop dialog
                    DialogHelper.showBlurredDialog(
                      context: ctx,
                      builder: (ctx) => AlertDialog(
                        title: const Text('Éxito'),
                        content: Text(result.message),
                        actions: [
                          FilledButton(
                            onPressed: () => Navigator.of(ctx).pop(),
                            child: const Text('Aceptar'),
                          ),
                        ],
                      ),
                    );
                  } else {
                    DialogHelper.showBlurredDialog(
                      context: ctx,
                      builder: (ctx) => AlertDialog(
                        title: const Text('Error'),
                        content: Text(result.message),
                      ),
                    );
                  }
                }
              },
              child: Text(permission == null ? 'Crear' : 'Guardar'),
            ),
          ],
        );
      },
    ),
  );
}

Future<void> _confirmDeleteRole(BuildContext context, Role role) async {
  final controller = Get.find<RolesPermissionsController>();
  final shouldDelete = await DialogHelper.showBlurredDialog<bool>(
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

  if (!context.mounted) return;
  DialogHelper.showLoading(context);

  final result = await controller.eliminarRol(role.id);

  if (context.mounted) Navigator.of(context).pop(); // Pop loading

  if (context.mounted) {
    DialogHelper.showBlurredDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: Text(result.success ? 'Éxito' : 'Error'),
        content: Text(result.message),
        actions: [
          FilledButton(
            onPressed: () => Navigator.of(context).pop(),
            child: const Text('Aceptar'),
          ),
        ],
      ),
    );
  }
}

Future<void> _confirmDeletePermission(
  BuildContext context,
  Permission permission,
) async {
  final controller = Get.find<RolesPermissionsController>();
  final shouldDelete = await DialogHelper.showBlurredDialog<bool>(
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

  if (!context.mounted) return;
  DialogHelper.showLoading(context);

  final result = await controller.eliminarPermisoRegistro(permission.id);

  if (context.mounted) Navigator.of(context).pop(); // Pop loading

  if (context.mounted) {
    DialogHelper.showBlurredDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: Text(result.success ? 'Éxito' : 'Error'),
        content: Text(result.message),
        actions: [
          FilledButton(
            onPressed: () => Navigator.of(context).pop(),
            child: const Text('Aceptar'),
          ),
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

class RolesPermissionsStandaloneTab
    extends GetView<RolesPermissionsController> {
  final RolesPermissionsTab tab;

  const RolesPermissionsStandaloneTab({super.key, required this.tab});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final tt = theme.textTheme;
    final cs = theme.colorScheme;

    return Obx(() {
      final isLoading = controller.isLoading.value;
      final error = controller.errorMessage.value;

      final isRoles = tab == RolesPermissionsTab.roles;
      final items = isRoles
          ? controller.filteredRoles
          : controller.filteredPermissions;
      final totalCount = items.length;

      if (isLoading && items.isEmpty) {
        return const Center(child: CircularProgressIndicator());
      }

      return RefreshIndicator(
        onRefresh: controller.refreshData,
        child: ListView(
          physics: const AlwaysScrollableScrollPhysics(),
          padding: const EdgeInsets.fromLTRB(16, 16, 16, 24),
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  isRoles ? 'Roles' : 'Permisos',
                  style: tt.titleLarge?.copyWith(fontWeight: FontWeight.w800),
                ),
                if (isLoading)
                  const SizedBox(
                    width: 18,
                    height: 18,
                    child: CircularProgressIndicator(strokeWidth: 2),
                  ),
              ],
            ),
            const SizedBox(height: 4),
            Text(
              isRoles
                  ? 'Define los roles y sus niveles de acceso.'
                  : 'Gestiona los permisos específicos del sistema.',
              style: tt.bodySmall?.copyWith(color: cs.onSurfaceVariant),
            ),
            const SizedBox(height: 16),
            TextField(
              onChanged: controller.setSearch,
              decoration: InputDecoration(
                hintText: isRoles ? 'Buscar rol...' : 'Buscar permiso...',
                prefixIcon: Icon(Icons.search, color: cs.onSurfaceVariant),
                filled: true,
                fillColor: cs.surfaceContainerHighest.withValues(alpha: 0.6),
                contentPadding: const EdgeInsets.symmetric(
                  horizontal: 16,
                  vertical: 0,
                ),
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(999),
                  borderSide: BorderSide.none,
                ),
                suffixIcon: controller.searchText.value.isEmpty
                    ? null
                    : IconButton(
                        icon: const Icon(Icons.close),
                        onPressed: controller.clearSearch,
                      ),
              ),
            ),
            const SizedBox(height: 12),
            Row(
              children: [
                Expanded(
                  child: Text(
                    'Resultados: $totalCount',
                    style: tt.bodySmall?.copyWith(color: cs.onSurfaceVariant),
                  ),
                ),
              ],
            ),
            if (error != null) ...[
              const SizedBox(height: 12),
              _ErrorState(message: error, onRetry: controller.refreshData),
            ],
            const SizedBox(height: 12),
            if (items.isEmpty && !isLoading)
              _EmptyState(
                message: isRoles
                    ? 'No se encontraron roles.'
                    : 'No se encontraron permisos.',
              )
            else
              ...items.map((item) {
                if (isRoles) {
                  final role = item as Role;
                  return _RoleCard(
                    role: role,
                    onAssign: () => showAssignPermissionsDialog(context, role),
                    onEdit: () => showRoleFormDialog(context, role: role),
                    onDelete: () => _confirmDeleteRole(context, role),
                  );
                } else {
                  final permission = item as Permission;
                  return _PermissionCard(
                    permission: permission,
                    onEdit: () => showPermissionFormDialog(
                      context,
                      permission: permission,
                    ),
                    onDelete: () =>
                        _confirmDeletePermission(context, permission),
                  );
                }
              }),
          ],
        ),
      );
    });
  }
}
