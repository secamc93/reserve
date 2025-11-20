import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';

import 'package:rupu/domain/entities/iam_business.dart';
import 'package:rupu/domain/entities/iam_business_type.dart';
import 'package:rupu/domain/entities/iam_resource.dart';
import 'package:rupu/domain/entities/iam_user.dart';
import 'package:rupu/domain/entities/user_action_result.dart';
import 'package:rupu/domain/infrastructure/repositories/iam_repository_impl.dart';
import 'package:rupu/presentation/views/iam/controllers/iam_business_types_controller.dart';
import 'package:rupu/presentation/views/iam/controllers/iam_businesses_controller.dart';
import 'package:rupu/presentation/views/iam/controllers/iam_resources_controller.dart';
import 'package:rupu/presentation/views/iam/controllers/iam_users_controller.dart';
import 'package:rupu/presentation/views/roles_permissions/roles_permissions_controller.dart';
import 'package:rupu/presentation/views/roles_permissions/roles_permissions_view.dart';
import 'package:rupu/presentation/views/settings/views/create_user_view.dart';
import 'package:rupu/presentation/views/users/user_detail_view.dart';
import 'package:rupu/presentation/views/users/users_controller.dart';

class IamView extends StatefulWidget {
  final int pageIndex;

  const IamView({super.key, required this.pageIndex});

  @override
  State<IamView> createState() => _IamViewState();
}

class _IamViewState extends State<IamView> with SingleTickerProviderStateMixin {
  late final TabController _tabController;
  final _tabs = const [
    _IamTabDefinition('Usuarios', Icons.people_alt_outlined),
    _IamTabDefinition('Roles', Icons.security_outlined),
    _IamTabDefinition('Permisos', Icons.gavel_outlined),
    _IamTabDefinition('Recursos', Icons.category_outlined),
    _IamTabDefinition('Tipos de negocio', Icons.storefront_outlined),
    _IamTabDefinition('Negocios', Icons.apartment_outlined),
  ];

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: _tabs.length, vsync: this);
    _tabController.addListener(_handleTabChange);
  }

  void _handleTabChange() {
    if (mounted) {
      setState(() {});
    }
  }

  @override
  void dispose() {
    _tabController.removeListener(_handleTabChange);
    _tabController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('IAM'),
        bottom: TabBar(
          controller: _tabController,
          isScrollable: true,
          tabs: _tabs
              .map((tab) => Tab(icon: Icon(tab.icon), text: tab.label))
              .toList(growable: false),
        ),
      ),
      floatingActionButton: _buildFloatingActionButton(context),
      body: TabBarView(
        controller: _tabController,
        children: [
          _IamTabPage(
            child: SafeArea(
              top: false,
              bottom: false,
              child: _IamUsersTab(pageIndex: widget.pageIndex),
            ),
          ),
          const _IamTabPage(
            child: SafeArea(
              top: false,
              bottom: false,
              child: RolesPermissionsStandaloneTab(
                tab: RolesPermissionsTab.roles,
              ),
            ),
          ),
          const _IamTabPage(
            child: SafeArea(
              top: false,
              bottom: false,
              child: RolesPermissionsStandaloneTab(
                tab: RolesPermissionsTab.permissions,
              ),
            ),
          ),
          const _IamTabPage(
            child: SafeArea(top: false, child: _IamResourcesTab()),
          ),
          const _IamTabPage(
            child: SafeArea(top: false, child: _IamBusinessTypesTab()),
          ),
          const _IamTabPage(
            child: SafeArea(top: false, child: _IamBusinessesTab()),
          ),
        ],
      ),
    );
  }

  Widget? _buildFloatingActionButton(BuildContext context) {
    final index = _tabController.index;
    switch (index) {
      case 0:
        if (!Get.isRegistered<UsersController>()) return null;
        return _IamUsersFab(pageIndex: widget.pageIndex);
      case 1:
        if (!Get.isRegistered<RolesPermissionsController>()) return null;
        return FloatingActionButton(
          onPressed: () => showRoleFormDialog(context),
          tooltip: 'Crear rol',
          child: const Icon(Icons.add),
        );
      case 2:
        if (!Get.isRegistered<RolesPermissionsController>()) return null;
        return FloatingActionButton(
          onPressed: () => showPermissionFormDialog(context),
          tooltip: 'Crear permiso',
          child: const Icon(Icons.add),
        );
      case 3:
        if (!Get.isRegistered<IamResourcesController>()) return null;
        return FloatingActionButton(
          onPressed: () => showResourceFormDialog(context),
          tooltip: 'Crear recurso',
          child: const Icon(Icons.add),
        );
      case 4:
        if (!Get.isRegistered<IamBusinessTypesController>()) return null;
        return FloatingActionButton(
          onPressed: () => showBusinessTypeFormDialog(context),
          tooltip: 'Crear tipo de negocio',
          child: const Icon(Icons.add_business),
        );
      default:
        return null;
    }
  }
}

class _IamUsersFab extends StatelessWidget {
  final int pageIndex;

  const _IamUsersFab({required this.pageIndex});

  @override
  Widget build(BuildContext context) {
    final usersController = Get.find<UsersController>();
    final iamUsersController = Get.isRegistered<IamUsersController>()
        ? Get.find<IamUsersController>()
        : null;
    return Obx(() {
      if (!usersController.canCreate) {
        return const SizedBox.shrink();
      }
      return FloatingActionButton(
        onPressed: () async {
          final result = await GoRouter.of(context).pushNamed(
            CreateUserView.name,
            pathParameters: {'page': '$pageIndex'},
          );
          if (result == true) {
            await usersController.fetchUsers();
            await iamUsersController?.fetchUsers();
          }
        },
        child: const Icon(Icons.add),
      );
    });
  }
}

class _IamTabPage extends StatefulWidget {
  final Widget child;

  const _IamTabPage({required this.child});

  @override
  State<_IamTabPage> createState() => _IamTabPageState();
}

class _IamTabPageState extends State<_IamTabPage>
    with AutomaticKeepAliveClientMixin {
  @override
  bool get wantKeepAlive => true;

  @override
  Widget build(BuildContext context) {
    super.build(context);
    return widget.child;
  }
}

class IamPlaceholderTab extends StatelessWidget {
  final String title;

  const IamPlaceholderTab({required this.title});

  @override
  Widget build(BuildContext context) {
    final tt = Theme.of(context).textTheme;
    final cs = Theme.of(context).colorScheme;
    return Center(
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(Icons.upcoming_outlined, size: 48, color: cs.onSurfaceVariant),
          const SizedBox(height: 12),
          Text(
            '$title\nPróximamente',
            textAlign: TextAlign.center,
            style: tt.titleMedium?.copyWith(fontWeight: FontWeight.w600),
          ),
        ],
      ),
    );
  }
}

class _IamUsersTab extends GetView<IamUsersController> {
  final int pageIndex;

  const _IamUsersTab({required this.pageIndex});

  @override
  Widget build(BuildContext context) {
    final tt = Theme.of(context).textTheme;

    return Obx(() {
      final isLoading = controller.isLoading.value;
      final error = controller.errorMessage.value;
      final users = controller.users;

      if (isLoading && users.isEmpty) {
        return const Center(child: CircularProgressIndicator());
      }

      final totalCount = controller.pagination.value?.total ?? users.length;
      final usersController = Get.isRegistered<UsersController>()
          ? Get.find<UsersController>()
          : null;
      final canView =
          (usersController?.canRead ?? false) ||
          (usersController?.canUpdate ?? false);
      final canDelete = usersController?.canDelete ?? false;

      return RefreshIndicator(
        onRefresh: controller.refreshData,
        child: NotificationListener<ScrollNotification>(
          onNotification: (notification) {
            if (notification.metrics.pixels >=
                    notification.metrics.maxScrollExtent - 200 &&
                !controller.isLoadingMore.value) {
              controller.loadMore();
            }
            return false;
          },
          child: ListView(
            physics: const AlwaysScrollableScrollPhysics(),
            padding: const EdgeInsets.all(24),
            children: [
              TextField(
                controller: controller.searchCtrl,
                onChanged: controller.setSearch,
                decoration: InputDecoration(
                  labelText: 'Buscar',
                  hintText: 'Nombre, correo, teléfono…',
                  prefixIcon: const Icon(Icons.search),
                  suffixIcon: controller.searchText.value.isEmpty
                      ? null
                      : IconButton(
                          icon: const Icon(Icons.clear),
                          onPressed: controller.clearSearch,
                        ),
                ),
              ),
              const SizedBox(height: 12),
              Row(
                children: [
                  Expanded(
                    child: Text(
                      'Usuarios encontrados: $totalCount',
                      style: tt.titleMedium?.copyWith(
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ),
                  if (isLoading)
                    const SizedBox(
                      width: 20,
                      height: 20,
                      child: CircularProgressIndicator(strokeWidth: 2),
                    ),
                ],
              ),
              if (error != null) ...[
                const SizedBox(height: 12),
                _IamErrorCard(message: error, onRetry: controller.refreshData),
              ],
              const SizedBox(height: 12),
              if (users.isEmpty && !isLoading)
                const _IamEmptyState(message: 'No se encontraron usuarios.')
              else
                ...users.map(
                  (user) => Padding(
                    padding: const EdgeInsets.only(bottom: 12),
                    child: _IamUserCard(
                      user: user,
                      canView: canView,
                      canDelete: canDelete,
                      isDeleting: controller.deletingUserId.value == user.id,
                      onView: canView
                          ? () => _openDetail(context, user.id)
                          : null,
                      onDelete: canDelete
                          ? () => _confirmDelete(context, user)
                          : null,
                    ),
                  ),
                ),
              if (controller.isLoadingMore.value) ...[
                const SizedBox(height: 16),
                const Center(child: CircularProgressIndicator()),
              ],
            ],
          ),
        ),
      );
    });
  }

  Future<void> _openDetail(BuildContext context, int userId) async {
    final result = await GoRouter.of(context).pushNamed(
      UserDetailView.name,
      pathParameters: {'page': '$pageIndex', 'id': '$userId'},
    );

    if (!context.mounted) return;

    if (result is UserActionResult && result.success) {
      await controller.refreshData();
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(result.message ?? 'Usuario actualizado.')),
      );
    }
  }

  Future<void> _confirmDelete(BuildContext context, IamUser user) async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
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
            child: const Text('Eliminar'),
          ),
        ],
      ),
    );

    if (confirmed != true || !context.mounted) return;

    final result = await controller.deleteUser(user.id);
    if (!context.mounted) return;

    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(
          result.message ??
              (result.success
                  ? 'Usuario eliminado correctamente.'
                  : 'No se pudo eliminar el usuario.'),
        ),
      ),
    );
  }
}

class _IamResourcesTab extends GetView<IamResourcesController> {
  const _IamResourcesTab();

  @override
  Widget build(BuildContext context) {
    final tt = Theme.of(context).textTheme;

    return Obx(() {
      final isLoading = controller.isLoading.value;
      final error = controller.errorMessage.value;
      final resources = controller.resources;

      if (isLoading && resources.isEmpty) {
        return const Center(child: CircularProgressIndicator());
      }

      return RefreshIndicator(
        onRefresh: controller.fetchResources,
        child: ListView(
          physics: const AlwaysScrollableScrollPhysics(),
          padding: const EdgeInsets.all(24),
          children: [
            TextField(
              onChanged: controller.setSearch,
              decoration: InputDecoration(
                labelText: 'Buscar recurso',
                hintText: 'Nombre, descripción…',
                prefixIcon: const Icon(Icons.search),
                suffixIcon: controller.searchText.value.isEmpty
                    ? null
                    : IconButton(
                        icon: const Icon(Icons.clear),
                        onPressed: () => controller.setSearch(''),
                      ),
              ),
            ),
            const SizedBox(height: 12),
            Row(
              children: [
                Expanded(
                  child: Text(
                    'Recursos: ${controller.total.value}',
                    style: tt.titleMedium?.copyWith(
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ),
                if (isLoading)
                  const SizedBox(
                    width: 20,
                    height: 20,
                    child: CircularProgressIndicator(strokeWidth: 2),
                  ),
              ],
            ),
            if (error != null) ...[
              const SizedBox(height: 12),
              _IamErrorCard(message: error, onRetry: controller.fetchResources),
            ],
            const SizedBox(height: 12),
            if (resources.isEmpty && !isLoading)
              const _IamEmptyState(message: 'No se encontraron recursos.')
            else
              Card(
                clipBehavior: Clip.antiAlias,
                child: SingleChildScrollView(
                  scrollDirection: Axis.horizontal,
                  padding: const EdgeInsets.all(16),
                  child: DataTable(
                    columns: const [
                      DataColumn(label: Text('Nombre')),
                      DataColumn(label: Text('Descripción')),
                      DataColumn(label: Text('Tipo de negocio')),
                      DataColumn(label: Text('Creado')),
                      DataColumn(label: Text('Actualizado')),
                      DataColumn(label: Text('Acciones')),
                    ],
                    rows: resources.map((resource) {
                      return DataRow(
                        cells: [
                          DataCell(Text(resource.name)),
                          DataCell(
                            SizedBox(
                              width: 280,
                              child: Text(
                                resource.description.isEmpty
                                    ? '-'
                                    : resource.description,
                                maxLines: 2,
                                overflow: TextOverflow.ellipsis,
                              ),
                            ),
                          ),
                          DataCell(
                            Text(
                              resource.businessTypeName.isEmpty
                                  ? '-'
                                  : resource.businessTypeName,
                            ),
                          ),
                          DataCell(
                            Text(_formatFriendlyDate(resource.createdAt)),
                          ),
                          DataCell(
                            Text(_formatFriendlyDate(resource.updatedAt)),
                          ),
                          DataCell(
                            Row(
                              children: [
                                IconButton(
                                  tooltip: 'Editar',
                                  icon: const Icon(Icons.edit_outlined),
                                  onPressed: () => showResourceFormDialog(
                                    context,
                                    resource: resource,
                                  ),
                                ),
                                IconButton(
                                  tooltip: 'Eliminar',
                                  icon: const Icon(Icons.delete_outline),
                                  onPressed: () => confirmDeleteResourceDialog(
                                    context,
                                    resource,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ],
                      );
                    }).toList(),
                  ),
                ),
              ),
            if (controller.totalPages.value > 1) ...[
              const SizedBox(height: 8),
              _IamPaginationControls(
                currentPage: controller.page.value,
                lastPage: controller.totalPages.value,
                hasPrev: controller.page.value > 1,
                hasNext: controller.page.value < controller.totalPages.value,
                onPrev: controller.page.value > 1
                    ? controller.previousPage
                    : null,
                onNext: controller.page.value < controller.totalPages.value
                    ? controller.nextPage
                    : null,
              ),
            ],
          ],
        ),
      );
    });
  }
}

class _IamBusinessTypesTab extends GetView<IamBusinessTypesController> {
  const _IamBusinessTypesTab();

  @override
  Widget build(BuildContext context) {
    return Obx(() {
      final isLoading = controller.isLoading.value;
      final error = controller.errorMessage.value;
      final types = controller.filteredTypes;

      if (isLoading && controller.types.isEmpty) {
        return const Center(child: CircularProgressIndicator());
      }

      return RefreshIndicator(
        onRefresh: controller.fetchTypes,
        child: ListView(
          physics: const AlwaysScrollableScrollPhysics(),
          padding: const EdgeInsets.all(24),
          children: [
            TextField(
              onChanged: controller.setSearch,
              decoration: InputDecoration(
                labelText: 'Buscar tipo de negocio',
                prefixIcon: const Icon(Icons.search),
                suffixIcon: controller.searchText.value.isEmpty
                    ? null
                    : IconButton(
                        icon: const Icon(Icons.clear),
                        onPressed: () => controller.setSearch(''),
                      ),
              ),
            ),
            if (error != null) ...[
              const SizedBox(height: 12),
              _IamErrorCard(message: error, onRetry: controller.fetchTypes),
            ],
            const SizedBox(height: 12),
            if (types.isEmpty && !isLoading)
              const _IamEmptyState(
                message: 'No se encontraron tipos de negocio.',
              )
            else
              Card(
                clipBehavior: Clip.antiAlias,
                child: SingleChildScrollView(
                  scrollDirection: Axis.horizontal,
                  padding: const EdgeInsets.all(16),
                  child: DataTable(
                    columns: const [
                      DataColumn(label: Text('Nombre')),
                      DataColumn(label: Text('Código')),
                      DataColumn(label: Text('Icono')),
                      DataColumn(label: Text('Estado')),
                      DataColumn(label: Text('Creado')),
                      DataColumn(label: Text('Acciones')),
                    ],
                    rows: types
                        .map(
                          (type) => DataRow(
                            cells: [
                              DataCell(Text(type.name)),
                              DataCell(Text(type.code)),
                              DataCell(Text(type.icon)),
                              DataCell(_IamStatusChip(active: type.isActive)),
                              DataCell(
                                Text(_formatFriendlyDate(type.createdAt)),
                              ),
                              DataCell(
                                Row(
                                  mainAxisSize: MainAxisSize.min,
                                  children: [
                                    IconButton(
                                      tooltip: 'Editar',
                                      onPressed: () =>
                                          showBusinessTypeFormDialog(
                                            context,
                                            type: type,
                                          ),
                                      icon: const Icon(Icons.edit_outlined),
                                    ),
                                    Obx(() {
                                      final isDeleting = controller
                                          .deletingTypeIds
                                          .contains(type.id);
                                      return IconButton(
                                        tooltip: 'Eliminar',
                                        onPressed: isDeleting
                                            ? null
                                            : () =>
                                                  confirmDeleteBusinessTypeDialog(
                                                    context,
                                                    type,
                                                  ),
                                        icon: isDeleting
                                            ? const SizedBox(
                                                width: 16,
                                                height: 16,
                                                child:
                                                    CircularProgressIndicator(
                                                      strokeWidth: 2,
                                                    ),
                                              )
                                            : const Icon(Icons.delete_outline),
                                      );
                                    }),
                                  ],
                                ),
                              ),
                            ],
                          ),
                        )
                        .toList(),
                  ),
                ),
              ),
          ],
        ),
      );
    });
  }
}

class _IamBusinessesTab extends GetView<IamBusinessesController> {
  const _IamBusinessesTab();

  @override
  Widget build(BuildContext context) {
    Future<void> _showConfiguredResourcesDialog(
      BuildContext context,
      IamBusiness business,
    ) async {
      final resources = <IamBusinessConfiguredResource>[];
      final togglingIds = <int>{};
      bool isLoading = true;
      String? error;
      bool initialized = false;

      await showDialog<void>(
        context: context,
        builder: (dialogCtx) {
          return StatefulBuilder(
            builder: (dialogCtx, setState) {
              Future<void> load() async {
                setState(() {
                  isLoading = true;
                  error = null;
                });
                try {
                  final data = await controller.getConfiguredResources(
                    business.id,
                  );
                  setState(() {
                    resources
                      ..clear()
                      ..addAll(data);
                    isLoading = false;
                  });
                } catch (_) {
                  setState(() {
                    error =
                        'No se pudieron cargar los recursos configurados. Intenta nuevamente.';
                    isLoading = false;
                  });
                }
              }

              Future<void> toggleResource(
                IamBusinessConfiguredResource resource,
              ) async {
                if (togglingIds.contains(resource.id)) return;
                setState(() => togglingIds.add(resource.id));
                final activate = !resource.isActive;
                final result = await controller.toggleConfiguredResource(
                  resourceId: resource.id,
                  activate: activate,
                  businessId: business.id,
                );
                if (!dialogCtx.mounted) return;
                setState(() {
                  togglingIds.remove(resource.id);
                  if (result.success) {
                    final index = resources.indexWhere(
                      (r) => r.id == resource.id,
                    );
                    if (index >= 0) {
                      resources[index] = resources[index].copyWith(
                        isActive: activate,
                      );
                    }
                  }
                });
                if (context.mounted) {
                  _showIamSnackBar(context, result.message);
                }
              }

              if (!initialized) {
                initialized = true;
                Future.microtask(load);
              }

              Widget content;
              if (isLoading) {
                content = const SizedBox(
                  height: 220,
                  width: 420,
                  child: Center(child: CircularProgressIndicator()),
                );
              } else if (error != null) {
                content = SizedBox(
                  width: 420,
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Text(error!, textAlign: TextAlign.center),
                      const SizedBox(height: 12),
                      FilledButton.tonal(
                        onPressed: load,
                        child: const Text('Reintentar'),
                      ),
                    ],
                  ),
                );
              } else if (resources.isEmpty) {
                content = const SizedBox(
                  width: 420,
                  child: Padding(
                    padding: EdgeInsets.symmetric(vertical: 24),
                    child: Text(
                      'No hay recursos configurados para este negocio.',
                      textAlign: TextAlign.center,
                    ),
                  ),
                );
              } else {
                content = SizedBox(
                  width: 460,
                  height: 360,
                  child: ListView.separated(
                    itemCount: resources.length,
                    separatorBuilder: (_, __) => const Divider(height: 1),
                    itemBuilder: (_, index) {
                      final resource = resources[index];
                      final isToggling = togglingIds.contains(resource.id);
                      final isActive = resource.isActive;
                      final theme = Theme.of(dialogCtx);
                      final cs = theme.colorScheme;
                      final buttonColor = isActive ? Colors.green : cs.error;
                      final textColor = isActive ? Colors.white : cs.onError;
                      return ListTile(
                        title: Text(resource.name),
                        subtitle: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Text(
                              resource.description?.isNotEmpty == true
                                  ? resource.description!
                                  : 'Sin descripción',
                            ),
                            const SizedBox(height: 4),
                            Text(
                              isActive
                                  ? 'Toca el botón para desactivar este recurso.'
                                  : 'Toca el botón para activar este recurso.',
                              style: theme.textTheme.bodySmall?.copyWith(
                                color: cs.onSurfaceVariant,
                              ),
                            ),
                          ],
                        ),
                        trailing: FilledButton(
                          style: FilledButton.styleFrom(
                            backgroundColor: buttonColor,
                            foregroundColor: textColor,
                          ),
                          onPressed: isToggling
                              ? null
                              : () => toggleResource(resource),
                          child: isToggling
                              ? const SizedBox(
                                  width: 16,
                                  height: 16,
                                  child: CircularProgressIndicator(
                                    strokeWidth: 2,
                                  ),
                                )
                              : Text(isActive ? 'Activo' : 'Inactivo'),
                        ),
                      );
                    },
                  ),
                );
              }

              return AlertDialog(
                title: Text('Recursos de ${business.name}'),
                content: content,
                actions: [
                  TextButton(
                    onPressed: () => Navigator.of(dialogCtx).pop(),
                    child: const Text('Cerrar'),
                  ),
                ],
              );
            },
          );
        },
      );
    }

    return Obx(() {
      final isLoading = controller.isLoading.value;
      final error = controller.errorMessage.value;
      final businesses = controller.businesses;

      if (isLoading && businesses.isEmpty) {
        return const Center(child: CircularProgressIndicator());
      }

      List<DataCell> _buildBusinessRowCells(
        BuildContext context,
        IamBusiness business, {
        required int expectedLength,
      }) {
        final cells = <DataCell>[
          DataCell(_IamBusinessLogoCell(logoUrl: business.logoUrl)),
          DataCell(Text(business.name)),
          DataCell(Text(business.businessType)),
          DataCell(_IamStatusChip(active: business.isActive)),
          DataCell(
            SizedBox(
              width: 280,
              child: Text(
                business.address.isEmpty ? '-' : business.address,
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
              ),
            ),
          ),
          DataCell(Text(_formatFriendlyDate(business.createdAt))),
          DataCell(
            Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                IconButton(
                  tooltip: 'Ver recursos configurados',
                  icon: const Icon(Icons.widgets_outlined),
                  onPressed: () =>
                      _showConfiguredResourcesDialog(context, business),
                ),
              ],
            ),
          ),
        ];

        assert(
          cells.length == expectedLength,
          'Cada fila debe tener $expectedLength celdas en la tabla de negocios.',
        );

        return cells;
      }

      return RefreshIndicator(
        onRefresh: controller.fetchBusinesses,
        child: ListView(
          physics: const AlwaysScrollableScrollPhysics(),
          padding: const EdgeInsets.all(24),
          children: [
            TextField(
              onChanged: controller.setSearch,
              decoration: InputDecoration(
                labelText: 'Buscar negocio',
                prefixIcon: const Icon(Icons.search),
                suffixIcon: controller.searchText.value.isEmpty
                    ? null
                    : IconButton(
                        icon: const Icon(Icons.clear),
                        onPressed: () => controller.setSearch(''),
                      ),
              ),
            ),
            const SizedBox(height: 12),
            Row(
              children: [
                Expanded(
                  child: DropdownButton<bool?>(
                    value: controller.statusFilter.value,
                    onChanged: controller.setStatusFilter,
                    underline: const SizedBox.shrink(),
                    items: const [
                      DropdownMenuItem(
                        value: null,
                        child: Text('Todos los estados'),
                      ),
                      DropdownMenuItem(value: true, child: Text('Activos')),
                      DropdownMenuItem(value: false, child: Text('Inactivos')),
                    ],
                  ),
                ),
                if (isLoading)
                  const SizedBox(
                    width: 20,
                    height: 20,
                    child: CircularProgressIndicator(strokeWidth: 2),
                  ),
              ],
            ),
            if (error != null) ...[
              const SizedBox(height: 12),
              _IamErrorCard(
                message: error,
                onRetry: controller.fetchBusinesses,
              ),
            ],
            const SizedBox(height: 12),
            if (businesses.isEmpty && !isLoading)
              const _IamEmptyState(message: 'No se encontraron negocios.')
            else
              Card(
                clipBehavior: Clip.antiAlias,
                child: SingleChildScrollView(
                  scrollDirection: Axis.horizontal,
                  padding: const EdgeInsets.all(16),
                  child: Builder(
                    builder: (tableCtx) {
                      const columns = <DataColumn>[
                        DataColumn(label: Text('Logo')),
                        DataColumn(label: Text('Nombre')),
                        DataColumn(label: Text('Tipo de negocio')),
                        DataColumn(label: Text('Estado')),
                        DataColumn(label: Text('Dirección')),
                        DataColumn(label: Text('Creado')),
                        DataColumn(label: Text('Acciones')),
                      ];
                      final rows = businesses
                          .map(
                            (business) => DataRow(
                              cells: _buildBusinessRowCells(
                                tableCtx,
                                business,
                                expectedLength: columns.length,
                              ),
                            ),
                          )
                          .toList(growable: false);
                      return DataTable(columns: columns, rows: rows);
                    },
                  ),
                ),
              ),
            if (controller.pagination.value != null) ...[
              const SizedBox(height: 8),
              _IamPaginationControls(
                currentPage: controller.pagination.value!.currentPage,
                lastPage: controller.pagination.value!.lastPage,
                hasPrev: controller.pagination.value!.hasPrev,
                hasNext: controller.pagination.value!.hasNext,
                onPrev: controller.pagination.value!.hasPrev
                    ? controller.previousPage
                    : null,
                onNext: controller.pagination.value!.hasNext
                    ? controller.nextPage
                    : null,
              ),
            ],
          ],
        ),
      );
    });
  }
}

class _IamUserCard extends StatelessWidget {
  final IamUser user;
  final VoidCallback? onView;
  final VoidCallback? onDelete;
  final bool canView;
  final bool canDelete;
  final bool isDeleting;

  const _IamUserCard({
    required this.user,
    this.onView,
    this.onDelete,
    this.canView = false,
    this.canDelete = false,
    this.isDeleting = false,
  });

  @override
  Widget build(BuildContext context) {
    final tt = Theme.of(context).textTheme;
    final cs = Theme.of(context).colorScheme;
    final initials = _buildInitials(user.name);
    final lastLogin = _formatFriendlyDateTime(user.lastLoginAt);

    return Card(
      clipBehavior: Clip.antiAlias,
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                CircleAvatar(
                  radius: 28,
                  backgroundImage: user.avatarUrl.isNotEmpty
                      ? NetworkImage(user.avatarUrl)
                      : null,
                  child: user.avatarUrl.isEmpty
                      ? Text(initials, style: tt.titleMedium)
                      : null,
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        user.name,
                        style: tt.titleMedium?.copyWith(
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(user.email, style: tt.bodyMedium),
                      if (user.phone.isNotEmpty) ...[
                        const SizedBox(height: 2),
                        Text(user.phone, style: tt.bodySmall),
                      ],
                      const SizedBox(height: 8),
                      Wrap(
                        spacing: 8,
                        runSpacing: 4,
                        children: [
                          _IamStatusChip(active: user.isActive),
                          if (user.isSuperUser)
                            Chip(
                              label: const Text('Super usuario'),
                              backgroundColor: cs.secondaryContainer,
                              labelStyle: tt.labelSmall?.copyWith(
                                color: cs.onSecondaryContainer,
                              ),
                            ),
                          Chip(label: Text('Último acceso: $lastLogin')),
                        ],
                      ),
                    ],
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),
            if (user.assignments.isEmpty)
              Text(
                'Sin rol asignado',
                style: tt.bodySmall?.copyWith(color: cs.onSurfaceVariant),
              )
            else
              Wrap(
                spacing: 8,
                runSpacing: 8,
                children: user.assignments
                    .map(
                      (assignment) => Chip(
                        label: Text(
                          '${assignment.businessName ?? 'Negocio'}:${assignment.roleName ?? 'Sin rol'}',
                        ),
                      ),
                    )
                    .toList(growable: false),
              ),
            const SizedBox(height: 12),
            if (canView || canDelete)
              Wrap(
                spacing: 12,
                runSpacing: 8,
                children: [
                  if (canView)
                    TextButton.icon(
                      onPressed: onView,
                      icon: const Icon(Icons.visibility_outlined),
                      label: const Text('Ver detalle'),
                    ),
                  if (canDelete)
                    TextButton.icon(
                      onPressed: isDeleting ? null : onDelete,
                      icon: isDeleting
                          ? const SizedBox(
                              width: 16,
                              height: 16,
                              child: CircularProgressIndicator(strokeWidth: 2),
                            )
                          : const Icon(Icons.delete_outline),
                      label: Text(isDeleting ? 'Eliminando…' : 'Eliminar'),
                      style: TextButton.styleFrom(foregroundColor: cs.error),
                    ),
                ],
              ),
          ],
        ),
      ),
    );
  }

  String _buildInitials(String name) {
    final parts = name.trim().split(RegExp(r'\s+')).where((e) => e.isNotEmpty);
    if (parts.isEmpty) return 'U';
    return parts.take(2).map((p) => p.substring(0, 1)).join().toUpperCase();
  }
}

class _IamBusinessLogoCell extends StatelessWidget {
  final String logoUrl;

  const _IamBusinessLogoCell({required this.logoUrl});

  @override
  Widget build(BuildContext context) {
    if (logoUrl.isEmpty) {
      return const Text('Sin logo');
    }
    return CircleAvatar(radius: 16, backgroundImage: NetworkImage(logoUrl));
  }
}

class _IamStatusChip extends StatelessWidget {
  final bool active;

  const _IamStatusChip({required this.active});

  @override
  Widget build(BuildContext context) {
    final cs = Theme.of(context).colorScheme;
    return Chip(
      label: Text(active ? 'Activo' : 'Inactivo'),
      backgroundColor: active ? cs.primaryContainer : cs.errorContainer,
      labelStyle: Theme.of(context).textTheme.labelSmall?.copyWith(
        color: active ? cs.onPrimaryContainer : cs.onErrorContainer,
      ),
    );
  }
}

class _BusinessTypeInfoCard extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    final cs = Theme.of(context).colorScheme;
    final tt = Theme.of(context).textTheme;
    const tips = [
      'El código debe ser único y en minúsculas',
      'El icono se mostrará en la interfaz de usuario',
      'Los tipos inactivos no aparecerán en las listas de selección',
    ];
    return Card(
      color: cs.secondaryContainer,
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Información importante',
              style: tt.titleSmall?.copyWith(
                fontWeight: FontWeight.w700,
                color: cs.onSecondaryContainer,
              ),
            ),
            const SizedBox(height: 8),
            ...tips.map(
              (tip) => Padding(
                padding: const EdgeInsets.only(bottom: 4),
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text('• '),
                    Expanded(
                      child: Text(
                        tip,
                        style: tt.bodySmall?.copyWith(
                          color: cs.onSecondaryContainer,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _IamErrorCard extends StatelessWidget {
  final String message;
  final Future<void> Function()? onRetry;

  const _IamErrorCard({required this.message, this.onRetry});

  @override
  Widget build(BuildContext context) {
    final cs = Theme.of(context).colorScheme;
    return Card(
      color: cs.errorContainer,
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              message,
              style: Theme.of(
                context,
              ).textTheme.bodyMedium?.copyWith(color: cs.onErrorContainer),
            ),
            if (onRetry != null) ...[
              const SizedBox(height: 8),
              TextButton(onPressed: onRetry, child: const Text('Reintentar')),
            ],
          ],
        ),
      ),
    );
  }
}

class _IamEmptyState extends StatelessWidget {
  final String message;

  const _IamEmptyState({required this.message});

  @override
  Widget build(BuildContext context) {
    final cs = Theme.of(context).colorScheme;
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 32),
      child: Column(
        children: [
          Icon(Icons.inbox_outlined, color: cs.onSurfaceVariant, size: 48),
          const SizedBox(height: 8),
          Text(message, textAlign: TextAlign.center),
        ],
      ),
    );
  }
}

class _IamPaginationControls extends StatelessWidget {
  final int currentPage;
  final int lastPage;
  final bool hasPrev;
  final bool hasNext;
  final VoidCallback? onPrev;
  final VoidCallback? onNext;

  const _IamPaginationControls({
    required this.currentPage,
    required this.lastPage,
    required this.hasPrev,
    required this.hasNext,
    this.onPrev,
    this.onNext,
  });

  @override
  Widget build(BuildContext context) {
    final tt = Theme.of(context).textTheme;
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text('Página $currentPage de $lastPage', style: tt.bodyMedium),
        Row(
          children: [
            IconButton(
              icon: const Icon(Icons.chevron_left),
              onPressed: hasPrev ? onPrev : null,
            ),
            IconButton(
              icon: const Icon(Icons.chevron_right),
              onPressed: hasNext ? onNext : null,
            ),
          ],
        ),
      ],
    );
  }
}

final DateFormat _friendlyDateFormat = DateFormat('d MMM yyyy', 'es');
final DateFormat _friendlyDateTimeFormat = DateFormat('d MMM yyyy HH:mm', 'es');

String _formatFriendlyDate(DateTime? value) {
  if (value == null) return '--';
  return _friendlyDateFormat.format(value.toLocal());
}

String _formatFriendlyDateTime(DateTime? value) {
  if (value == null) return '--';
  return _friendlyDateTimeFormat.format(value.toLocal());
}

void _showIamSnackBar(BuildContext context, String message) {
  ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(message)));
}

Future<void> showResourceFormDialog(
  BuildContext context, {
  IamResource? resource,
}) async {
  if (!Get.isRegistered<IamResourcesController>()) return;
  final controller = Get.find<IamResourcesController>();
  final iamRepository = IamRepositoryImpl();
  final businessTypes = await iamRepository.getBusinessTypes();
  int? normalizeBusinessTypeId(int? value) {
    if (value == null || value <= 0) return null;
    return value;
  }

  final formKey = GlobalKey<FormState>();
  final nameCtrl = TextEditingController(text: resource?.name ?? '');
  final descriptionCtrl = TextEditingController(
    text: resource?.description ?? '',
  );
  int? selectedBusinessType = normalizeBusinessTypeId(resource?.businessTypeId);

  await showDialog(
    context: context,
    builder: (ctx) => AlertDialog(
      title: Text(resource == null ? 'Crear recurso' : 'Editar recurso'),
      content: Form(
        key: formKey,
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            TextFormField(
              controller: nameCtrl,
              decoration: const InputDecoration(
                labelText: 'Nombre del recurso',
              ),
              validator: (value) => value == null || value.trim().isEmpty
                  ? 'Campo obligatorio'
                  : null,
            ),
            const SizedBox(height: 12),
            DropdownButtonFormField<int?>(
              initialValue: selectedBusinessType,
              decoration: const InputDecoration(
                labelText: 'Tipo de negocio (opcional)',
              ),
              items: [
                const DropdownMenuItem(value: null, child: Text('Genérico')),
                ...businessTypes.types
                    .map(
                      (type) => DropdownMenuItem(
                        value: type.id,
                        child: Text(type.name),
                      ),
                    )
                    .toList(),
              ],
              onChanged: (value) => selectedBusinessType = value,
            ),
            const SizedBox(height: 12),
            TextFormField(
              controller: descriptionCtrl,
              decoration: const InputDecoration(labelText: 'Descripción'),
              minLines: 2,
              maxLines: 3,
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
            if (!formKey.currentState!.validate()) return;
            if (resource == null) {
              final result = await controller.createResource(
                name: nameCtrl.text.trim(),
                businessTypeId: normalizeBusinessTypeId(selectedBusinessType),
                description: descriptionCtrl.text.trim(),
              );
              if (result != null) {
                Navigator.of(ctx).pop();
                _showIamSnackBar(context, result.message);
              }
            } else {
              final result = await controller.updateResource(
                id: resource.id,
                name: nameCtrl.text.trim(),
                businessTypeId: normalizeBusinessTypeId(selectedBusinessType),
                description: descriptionCtrl.text.trim(),
              );
              if (result != null) {
                Navigator.of(ctx).pop();
                _showIamSnackBar(context, result.message);
              }
            }
          },
          child: Text(resource == null ? 'Crear recurso' : 'Guardar cambios'),
        ),
      ],
    ),
  );
}

Future<void> confirmDeleteResourceDialog(
  BuildContext context,
  IamResource resource,
) async {
  if (!Get.isRegistered<IamResourcesController>()) return;
  final controller = Get.find<IamResourcesController>();
  final shouldDelete = await showDialog<bool>(
    context: context,
    builder: (ctx) => AlertDialog(
      title: const Text('Eliminar recurso'),
      content: Text('¿Eliminar ${resource.name}?'),
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
  final result = await controller.deleteResource(resource.id);
  if (result != null) {
    _showIamSnackBar(context, result.message);
  }
}

Future<void> showBusinessTypeFormDialog(
  BuildContext context, {
  IamBusinessType? type,
}) async {
  if (!Get.isRegistered<IamBusinessTypesController>()) return;
  final controller = Get.find<IamBusinessTypesController>();
  final formKey = GlobalKey<FormState>();
  final nameCtrl = TextEditingController(text: type?.name ?? '');
  final codeCtrl = TextEditingController(text: type?.code ?? '');
  final descriptionCtrl = TextEditingController(text: type?.description ?? '');
  final iconCtrl = TextEditingController(text: type?.icon ?? '');
  bool isActive = type?.isActive ?? true;
  bool isSaving = false;

  final result = await showDialog<IamBusinessTypeMutationResult>(
    context: context,
    builder: (dialogCtx) {
      return StatefulBuilder(
        builder: (dialogCtx, setState) {
          Future<void> submit() async {
            if (!formKey.currentState!.validate()) return;
            setState(() => isSaving = true);
            final mutation = await controller.saveBusinessType(
              id: type?.id,
              name: nameCtrl.text.trim(),
              code: codeCtrl.text.trim(),
              description: descriptionCtrl.text.trim(),
              icon: iconCtrl.text.trim(),
              isActive: isActive,
            );
            if (!dialogCtx.mounted) return;
            setState(() => isSaving = false);
            Navigator.of(dialogCtx).pop(mutation);
          }

          return AlertDialog(
            title: Text(
              type == null ? 'Crear tipo de negocio' : 'Editar tipo de negocio',
            ),
            content: SingleChildScrollView(
              child: Form(
                key: formKey,
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    TextFormField(
                      controller: nameCtrl,
                      decoration: const InputDecoration(labelText: 'Nombre'),
                      validator: (value) =>
                          (value == null || value.trim().isEmpty)
                          ? 'Requerido'
                          : null,
                    ),
                    const SizedBox(height: 12),
                    TextFormField(
                      controller: codeCtrl,
                      decoration: const InputDecoration(
                        labelText: 'Código',
                        helperText: 'Debe ser único y en minúsculas.',
                      ),
                      validator: (value) =>
                          (value == null || value.trim().isEmpty)
                          ? 'Requerido'
                          : null,
                    ),
                    const SizedBox(height: 12),
                    TextFormField(
                      controller: descriptionCtrl,
                      decoration: const InputDecoration(
                        labelText: 'Descripción',
                      ),
                      maxLines: 3,
                    ),
                    const SizedBox(height: 12),
                    TextFormField(
                      controller: iconCtrl,
                      decoration: const InputDecoration(
                        labelText: 'Icono',
                        helperText:
                            'Selecciona uno de la lista o ingresa un emoji.',
                      ),
                    ),
                    const SizedBox(height: 8),
                    Align(
                      alignment: Alignment.centerLeft,
                      child: Wrap(
                        spacing: 8,
                        runSpacing: 8,
                        children: controller.availableIcons
                            .map(
                              (icon) => ChoiceChip(
                                label: Text(icon),
                                selected: iconCtrl.text.trim() == icon,
                                onSelected: (_) {
                                  iconCtrl.text = icon;
                                  setState(() {});
                                },
                              ),
                            )
                            .toList(),
                      ),
                    ),
                    const SizedBox(height: 12),
                    CheckboxListTile(
                      value: isActive,
                      onChanged: (value) {
                        setState(() => isActive = value ?? isActive);
                      },
                      title: const Text('¿Activo?'),
                      contentPadding: EdgeInsets.zero,
                    ),
                    const SizedBox(height: 12),
                    _BusinessTypeInfoCard(),
                  ],
                ),
              ),
            ),
            actions: [
              TextButton(
                onPressed: () => Navigator.of(dialogCtx).pop(),
                child: const Text('Cancelar'),
              ),
              FilledButton(
                onPressed: isSaving ? null : submit,
                child: isSaving
                    ? const SizedBox(
                        width: 18,
                        height: 18,
                        child: CircularProgressIndicator(strokeWidth: 2),
                      )
                    : const Text('Guardar'),
              ),
            ],
          );
        },
      );
    },
  );

  nameCtrl.dispose();
  codeCtrl.dispose();
  descriptionCtrl.dispose();
  iconCtrl.dispose();

  if (result != null && context.mounted) {
    final message = result.message.isNotEmpty
        ? result.message
        : 'Operación completada.';
    _showIamSnackBar(context, message);
  }
}

Future<void> confirmDeleteBusinessTypeDialog(
  BuildContext context,
  IamBusinessType type,
) async {
  if (!Get.isRegistered<IamBusinessTypesController>()) return;
  final controller = Get.find<IamBusinessTypesController>();
  final confirmed =
      await showDialog<bool>(
        context: context,
        builder: (dialogCtx) => AlertDialog(
          title: const Text('Eliminar tipo de negocio'),
          content: Text(
            '¿Deseas eliminar ${type.name}? Esta acción no se puede deshacer.',
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.of(dialogCtx).pop(false),
              child: const Text('Cancelar'),
            ),
            FilledButton(
              onPressed: () => Navigator.of(dialogCtx).pop(true),
              style: FilledButton.styleFrom(
                backgroundColor: Theme.of(dialogCtx).colorScheme.error,
                foregroundColor: Theme.of(dialogCtx).colorScheme.onError,
              ),
              child: const Text('Eliminar'),
            ),
          ],
        ),
      ) ??
      false;

  if (!confirmed) return;
  final result = await controller.deleteBusinessType(type.id);
  if (!context.mounted) return;
  _showIamSnackBar(context, result.message);
}

class _IamTabDefinition {
  final String label;
  final IconData icon;

  const _IamTabDefinition(this.label, this.icon);
}
