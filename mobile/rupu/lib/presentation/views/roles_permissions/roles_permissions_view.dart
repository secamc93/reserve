// presentation/views/roles_permissions/roles_permissions_view.dart
import 'package:flutter/material.dart';
import 'package:get/get.dart';

import 'package:rupu/domain/entities/horizontal_property.dart';
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
            final loadingRoles = controller.isLoading.value &&
                controller.roles.isEmpty &&
                controller.permissions.isEmpty;
            final loadingProperties = controller.isLoadingHorizontalProperties.value &&
                controller.horizontalProperties.isEmpty;

            if (loadingRoles && loadingProperties) {
              return const Center(child: CircularProgressIndicator());
            }

            return RefreshIndicator(
              onRefresh: controller.refreshData,
              child: LayoutBuilder(
                builder: (context, constraints) {
                  return SingleChildScrollView(
                    physics: const AlwaysScrollableScrollPhysics(),
                    child: ConstrainedBox(
                      constraints: BoxConstraints(minHeight: constraints.maxHeight),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.stretch,
                        children: [
                          _HorizontalPropertiesSection(controller: controller),
                          const SizedBox(height: 24),
                          const _PropiedadHorizontalMessageCard(),
                          const SizedBox(height: 24),
                          _RolesPermissionsSection(controller: controller),
                        ],
                      ),
                    ),
                  );
                },
              ),
            );
          }),
        ),
      ),
    );
  }
}

class _HorizontalPropertiesSection extends StatelessWidget {
  const _HorizontalPropertiesSection({required this.controller});

  final RolesPermissionsController controller;

  @override
  Widget build(BuildContext context) {
    final tt = Theme.of(context).textTheme;
    final cs = Theme.of(context).colorScheme;

    return Obx(() {
      final isLoading = controller.isLoadingHorizontalProperties.value;
      final error = controller.horizontalPropertiesError.value;
      final page = controller.horizontalPropertiesPage.value;
      final properties = controller.horizontalProperties;
      final total = page?.total ?? properties.length;

      Widget content;
      if (isLoading && properties.isEmpty) {
        content = const Padding(
          padding: EdgeInsets.symmetric(vertical: 32),
          child: Center(child: CircularProgressIndicator()),
        );
      } else if (error != null && properties.isEmpty) {
        content = _HorizontalPropertiesError(
          message: error,
          onRetry: controller.fetchHorizontalProperties,
        );
      } else if (properties.isEmpty) {
        content = const _HorizontalPropertiesEmpty();
      } else {
        content = _HorizontalPropertiesTable(
          properties: properties.toList(growable: false),
          formatDate: controller.formatHorizontalDate,
        );
      }

      return Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Gestión de propiedades Horizontales',
            style: tt.headlineSmall?.copyWith(fontWeight: FontWeight.w700),
          ),
          const SizedBox(height: 8),
          Row(
            children: [
              Expanded(
                child: Text(
                  'Propiedades horizontales: $total',
                  style: tt.titleMedium?.copyWith(
                    fontWeight: FontWeight.w600,
                    color: cs.onSurfaceVariant,
                  ),
                ),
              ),
              if (isLoading && properties.isNotEmpty)
                const SizedBox(
                  width: 20,
                  height: 20,
                  child: CircularProgressIndicator(strokeWidth: 2),
                ),
              const SizedBox(width: 12),
              FilledButton.icon(
                onPressed: () {
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(
                      content: Text('Funcionalidad próxima: agregar propiedad.'),
                    ),
                  );
                },
                icon: const Icon(Icons.add_home_outlined),
                label: const Text('Agregar Propiedad'),
              ),
            ],
          ),
          const SizedBox(height: 12),
          content,
          if (error != null && properties.isNotEmpty) ...[
            const SizedBox(height: 12),
            _HorizontalPropertiesError(
              message: error,
              onRetry: controller.fetchHorizontalProperties,
            ),
          ],
        ],
      );
    });
  }
}

class _HorizontalPropertiesTable extends StatelessWidget {
  const _HorizontalPropertiesTable({
    required this.properties,
    required this.formatDate,
  });

  final List<HorizontalProperty> properties;
  final String Function(DateTime? value) formatDate;

  @override
  Widget build(BuildContext context) {
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
              DataColumn(label: Text('Dirección')),
              DataColumn(label: Text('Unidades')),
              DataColumn(label: Text('Estado')),
              DataColumn(label: Text('Fecha creación')),
              DataColumn(label: Text('Acciones')),
            ],
            rows: properties.map((p) => _buildRow(context, p)).toList(),
          ),
        ),
      ),
    );
  }

  DataRow _buildRow(BuildContext context, HorizontalProperty property) {
    return DataRow(
      cells: [
        DataCell(Text('${property.id}')),
        DataCell(Text(property.name)),
        DataCell(Text(property.address?.isNotEmpty == true ? property.address! : '-')),
        DataCell(Text('${property.totalUnits}')),
        DataCell(_StatusChip(isActive: property.isActive)),
        DataCell(Text(formatDate(property.createdAt))),
        DataCell(Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            _IconActionButton(
              icon: Icons.remove_red_eye_outlined,
              tooltip: 'Ver detalles',
              onPressed: () => _showPending(context),
            ),
            _IconActionButton(
              icon: Icons.edit_outlined,
              tooltip: 'Actualizar',
              onPressed: () => _showPending(context),
            ),
            _IconActionButton(
              icon: Icons.delete_outline,
              tooltip: 'Eliminar',
              onPressed: () => _showPending(context),
            ),
          ],
        )),
      ],
    );
  }

  void _showPending(BuildContext context) {
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('Acción disponible próximamente.'),
      ),
    );
  }
}

class _StatusChip extends StatelessWidget {
  const _StatusChip({required this.isActive});

  final bool isActive;

  @override
  Widget build(BuildContext context) {
    final cs = Theme.of(context).colorScheme;
    final color = isActive ? cs.primary : cs.error;
    final bg = isActive
        ? cs.primaryContainer.withOpacity(.3)
        : cs.errorContainer.withOpacity(.3);

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
      decoration: BoxDecoration(
        color: bg,
        borderRadius: BorderRadius.circular(20),
      ),
      child: Text(
        isActive ? 'Activo' : 'Inactivo',
        style: TextStyle(
          color: color,
          fontWeight: FontWeight.w600,
        ),
      ),
    );
  }
}

class _IconActionButton extends StatelessWidget {
  const _IconActionButton({
    required this.icon,
    required this.tooltip,
    required this.onPressed,
  });

  final IconData icon;
  final String tooltip;
  final VoidCallback onPressed;

  @override
  Widget build(BuildContext context) {
    return IconButton(
      icon: Icon(icon),
      tooltip: tooltip,
      onPressed: onPressed,
    );
  }
}

class _HorizontalPropertiesEmpty extends StatelessWidget {
  const _HorizontalPropertiesEmpty();

  @override
  Widget build(BuildContext context) {
    final tt = Theme.of(context).textTheme;
    final cs = Theme.of(context).colorScheme;
    return Card(
      child: Padding(
        padding: const EdgeInsets.symmetric(vertical: 32, horizontal: 16),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(Icons.apartment_outlined, size: 48, color: cs.onSurfaceVariant),
            const SizedBox(height: 12),
            Text(
              'No se encontraron propiedades horizontales.',
              textAlign: TextAlign.center,
              style: tt.titleMedium,
            ),
          ],
        ),
      ),
    );
  }
}

class _HorizontalPropertiesError extends StatelessWidget {
  const _HorizontalPropertiesError({
    required this.message,
    required this.onRetry,
  });

  final String message;
  final Future<void> Function({Map<String, dynamic>? query}) onRetry;

  @override
  Widget build(BuildContext context) {
    final cs = Theme.of(context).colorScheme;
    return Card(
      color: cs.errorContainer,
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(
              message,
              style: Theme.of(context)
                  .textTheme
                  .bodyMedium
                  ?.copyWith(color: cs.onErrorContainer),
            ),
            const SizedBox(height: 12),
            FilledButton(
              onPressed: () => onRetry(),
              child: const Text('Reintentar'),
            ),
          ],
        ),
      ),
    );
  }
}

class _PropiedadHorizontalMessageCard extends StatelessWidget {
  const _PropiedadHorizontalMessageCard();

  @override
  Widget build(BuildContext context) {
    final cs = Theme.of(context).colorScheme;
    final tt = Theme.of(context).textTheme;

    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Icon(Icons.info_outline, color: cs.primary),
            const SizedBox(width: 12),
            Expanded(
              child: Text(
                'La gestión de usuarios, roles y permisos pertenece al módulo de Propiedad Horizontal.',
                style: tt.bodyLarge,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _RolesPermissionsSection extends StatelessWidget {
  const _RolesPermissionsSection({required this.controller});

  final RolesPermissionsController controller;

  @override
  Widget build(BuildContext context) {
    final tt = Theme.of(context).textTheme;
    final cs = Theme.of(context).colorScheme;

    return Obx(() {
      final tab = controller.selectedTab.value;
      final isRoles = tab == RolesPermissionsTab.roles;
      final total = isRoles
          ? controller.filteredRoles.length
          : controller.filteredPermissions.length;
      final error = controller.errorMessage.value;

      if (error != null &&
          controller.roles.isEmpty &&
          controller.permissions.isEmpty) {
        return _ErrorState(
          message: error,
          onRetry: controller.refreshData,
        );
      }

      return Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Text(
            'Roles y permisos',
            style: tt.headlineSmall?.copyWith(fontWeight: FontWeight.w600),
          ),
          const SizedBox(height: 16),
          _TabsHeader(
            selected: tab,
            onSelect: controller.selectTab,
          ),
          const SizedBox(height: 16),
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
                      onPressed: controller.clearSearch,
                    ),
            ),
          ),
          const SizedBox(height: 8),
          Row(
            children: [
              Expanded(
                child: Text(
                  'Resultados: $total',
                  style: tt.titleMedium?.copyWith(
                    fontWeight: FontWeight.w600,
                    color: cs.onSurfaceVariant,
                  ),
                ),
              ),
              if (controller.isLoading.value)
                const SizedBox(
                  width: 20,
                  height: 20,
                  child: CircularProgressIndicator(strokeWidth: 2),
                ),
            ],
          ),
          const SizedBox(height: 12),
          if (error != null)
            Card(
              color: cs.errorContainer,
              child: Padding(
                padding: const EdgeInsets.all(12),
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Icon(Icons.error_outline, color: cs.error),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Text(
                        error,
                        style: tt.bodyMedium?.copyWith(
                          color: cs.onErrorContainer,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          if (error != null) const SizedBox(height: 12),
          AnimatedSwitcher(
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
        ],
      );
    });
  }
}

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
