import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';

import 'package:flutter/services.dart';
import 'package:rupu/domain/entities/iam_business.dart';
import 'package:rupu/domain/entities/iam_business_type.dart';
import 'package:rupu/domain/entities/iam_resource.dart';
import 'package:rupu/domain/entities/iam_user.dart';
import 'package:rupu/domain/entities/role.dart';
import 'package:rupu/domain/entities/iam_generate_password_result.dart';
import 'package:rupu/domain/entities/user_action_result.dart';
import 'package:rupu/domain/infrastructure/repositories/iam_repository_impl.dart';
import 'package:rupu/presentation/views/iam/controllers/iam_business_types_controller.dart';
import 'package:rupu/presentation/views/iam/controllers/iam_businesses_controller.dart';
import 'package:rupu/presentation/views/iam/controllers/iam_resources_controller.dart';
import 'package:rupu/presentation/views/iam/controllers/iam_users_controller.dart';
import 'package:rupu/presentation/views/roles_permissions/roles_permissions_controller.dart';
import 'package:rupu/presentation/views/roles_permissions/roles_permissions_view.dart';
import 'package:rupu/presentation/views/settings/views/create_user_view.dart';

import 'package:rupu/config/helpers/design_helper.dart';
import 'package:rupu/config/helpers/responsive_helper.dart';
import 'package:rupu/presentation/views/users/user_detail_view.dart';
import 'package:rupu/presentation/views/users/users_controller.dart';
import 'package:rupu/presentation/widgets/image_preview_dialog.dart';

class IamView extends StatelessWidget {
  final int pageIndex;

  const IamView({super.key, required this.pageIndex});

  static const _tabs = [
    _IamTabDefinition('Usuarios', Icons.people_alt_outlined),
    _IamTabDefinition('Roles', Icons.security_outlined),
    _IamTabDefinition('Permisos', Icons.gavel_outlined),
    _IamTabDefinition('Recursos', Icons.category_outlined),
    _IamTabDefinition('Tipos de negocio', Icons.storefront_outlined),
    _IamTabDefinition('Negocios', Icons.apartment_outlined),
  ];

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final cs = theme.colorScheme;
    final tt = theme.textTheme;

    return DefaultTabController(
      length: _tabs.length,
      child: Builder(
        builder: (context) {
          final tabController = DefaultTabController.of(context);
          return Scaffold(
            backgroundColor: cs.surface,
            appBar: AppBar(
              elevation: 0,
              scrolledUnderElevation: 0,
              backgroundColor: Colors.transparent,
              toolbarHeight: 68,
              flexibleSpace: Container(
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    colors: [cs.primary, cs.secondary.withValues(alpha: 0.85)],
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                  ),
                ),
              ),
              titleSpacing: 16,
              title: Row(
                children: [
                  Icon(Icons.shield_outlined, size: 26, color: Colors.white),
                  const SizedBox(width: 8),
                  Text(
                    'IAM',
                    style: tt.titleLarge?.copyWith(
                      fontWeight: FontWeight.w800,
                      color: Colors.white,
                      letterSpacing: 0.4,
                    ),
                  ),
                ],
              ),
              bottom: PreferredSize(
                preferredSize: const Size.fromHeight(60),
                child: Align(
                  alignment: Alignment.centerLeft,
                  child: TabBar(
                    controller: tabController,
                    isScrollable: true,
                    padding: const EdgeInsets.fromLTRB(12, 8, 12, 12),
                    labelPadding: const EdgeInsets.symmetric(horizontal: 6),
                    indicator: BoxDecoration(
                      color: Colors.white.withValues(alpha: 0.18),
                      borderRadius: BorderRadius.circular(999),
                    ),
                    indicatorSize: TabBarIndicatorSize.label,
                    labelColor: Colors.white,
                    unselectedLabelColor: Colors.white.withValues(alpha: 0.8),
                    labelStyle: tt.labelLarge?.copyWith(
                      fontWeight: FontWeight.w600,
                    ),
                    unselectedLabelStyle: tt.labelLarge,
                    tabs: _tabs
                        .map(
                          (tab) => Tab(
                            iconMargin: const EdgeInsets.only(bottom: 2),
                            icon: Icon(tab.icon, size: 20),
                            text: tab.label,
                          ),
                        )
                        .toList(growable: false),
                  ),
                ),
              ),
            ),
            floatingActionButton: AnimatedBuilder(
              animation: tabController.animation!,
              builder: (_, __) =>
                  _buildFloatingActionButton(context, tabController.index) ??
                  const SizedBox.shrink(),
            ),
            body: Container(
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  colors: [
                    cs.surface,
                    cs.surfaceContainerHighest.withValues(alpha: 0.25),
                  ],
                  begin: Alignment.topCenter,
                  end: Alignment.bottomCenter,
                ),
              ),
              child: TabBarView(
                controller: tabController,
                children: [
                  _IamTabPage(
                    child: SafeArea(
                      top: false,
                      bottom: false,
                      child: _IamUsersTab(pageIndex: pageIndex),
                    ),
                  ),
                  _IamTabPage(
                    child: SafeArea(
                      top: false,
                      bottom: false,
                      child: RolesPermissionsStandaloneTab(
                        tab: RolesPermissionsTab.roles,
                      ),
                    ),
                  ),
                  _IamTabPage(
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
            ),
          );
        },
      ),
    );
  }

  Widget? _buildFloatingActionButton(BuildContext context, int index) {
    switch (index) {
      case 0:
        if (!Get.isRegistered<UsersController>()) return null;
        return _IamUsersFab(pageIndex: pageIndex);
      case 1:
        if (!Get.isRegistered<RolesPermissionsController>()) return null;
        return FloatingActionButton.extended(
          onPressed: () => showRoleFormDialog(context),
          tooltip: 'Crear rol',
          icon: const Icon(Icons.add),
          label: const Text('Nuevo rol'),
        );
      case 2:
        if (!Get.isRegistered<RolesPermissionsController>()) return null;
        return FloatingActionButton.extended(
          onPressed: () => showPermissionFormDialog(context),
          tooltip: 'Crear permiso',
          icon: const Icon(Icons.add),
          label: const Text('Nuevo permiso'),
        );
      case 3:
        if (!Get.isRegistered<IamResourcesController>()) return null;
        return FloatingActionButton.extended(
          onPressed: () => showResourceFormDialog(context),
          tooltip: 'Crear recurso',
          icon: const Icon(Icons.add),
          label: const Text('Nuevo recurso'),
        );
      case 4:
        if (!Get.isRegistered<IamBusinessTypesController>()) return null;
        return FloatingActionButton.extended(
          onPressed: () => showBusinessTypeFormDialog(context),
          tooltip: 'Crear tipo de negocio',
          icon: const Icon(Icons.add_business),
          label: const Text('Nuevo tipo'),
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
      return FloatingActionButton.extended(
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
        icon: const Icon(Icons.person_add_alt_1_outlined),
        label: const Text('Nuevo usuario'),
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
    final theme = Theme.of(context);
    final tt = theme.textTheme;
    final cs = theme.colorScheme;

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
          child: Center(
            child: ConstrainedBox(
              constraints: const BoxConstraints(maxWidth: 1000),
              child: ListView(
                physics: const AlwaysScrollableScrollPhysics(),
                padding: ResponsiveHelper.getAdaptivePadding(context),
                children: [
                  // Header estilo sección
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        'Usuarios',
                        style: tt.titleLarge?.copyWith(
                          fontWeight: FontWeight.w800,
                        ),
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
                    'Gestiona las personas que tienen acceso a tu espacio.',
                    style: tt.bodySmall?.copyWith(color: cs.onSurfaceVariant),
                  ),
                  const SizedBox(height: 16),

                  // Search bar tipo Instagram
                  TextField(
                    controller: controller.searchCtrl,
                    onChanged: controller.setSearch,
                    decoration: InputDecoration(
                      hintText: 'Buscar por nombre, correo o teléfono',
                      prefixIcon: Icon(
                        Icons.search,
                        color: cs.onSurfaceVariant,
                      ),
                      filled: true,
                      fillColor: cs.surfaceContainerHighest.withValues(
                        alpha: 0.6,
                      ),
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
                          'Usuarios encontrados: $totalCount',
                          style: tt.bodySmall?.copyWith(
                            color: cs.onSurfaceVariant,
                          ),
                        ),
                      ),
                    ],
                  ),

                  if (error != null) ...[
                    const SizedBox(height: 12),
                    _IamErrorCard(
                      message: error,
                      onRetry: controller.refreshData,
                    ),
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
                          isDeleting:
                              controller.deletingUserId.value == user.id,
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
    final theme = Theme.of(context);
    final tt = theme.textTheme;
    final cs = theme.colorScheme;

    return Obx(() {
      final isLoading = controller.isLoading.value;
      final error = controller.errorMessage.value;
      final resources = controller.resources;

      if (isLoading && resources.isEmpty) {
        return const Center(child: CircularProgressIndicator());
      }

      return RefreshIndicator(
        onRefresh: controller.fetchResources,
        child: Center(
          child: ConstrainedBox(
            constraints: const BoxConstraints(maxWidth: 1000),
            child: ListView(
              physics: const AlwaysScrollableScrollPhysics(),
              padding: ResponsiveHelper.getAdaptivePadding(context),
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      'Recursos',
                      style: tt.titleLarge?.copyWith(
                        fontWeight: FontWeight.w800,
                      ),
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
                  'Módulos y funcionalidades disponibles en tu espacio.',
                  style: tt.bodySmall?.copyWith(color: cs.onSurfaceVariant),
                ),
                const SizedBox(height: 16),
                TextField(
                  onChanged: controller.setSearch,
                  decoration: InputDecoration(
                    hintText: 'Buscar recurso por nombre o descripción',
                    prefixIcon: Icon(Icons.search, color: cs.onSurfaceVariant),
                    filled: true,
                    fillColor: cs.surfaceContainerHighest.withValues(
                      alpha: 0.6,
                    ),
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
                        style: tt.bodySmall?.copyWith(
                          color: cs.onSurfaceVariant,
                        ),
                      ),
                    ),
                  ],
                ),
                if (error != null) ...[
                  const SizedBox(height: 12),
                  _IamErrorCard(
                    message: error,
                    onRetry: controller.fetchResources,
                  ),
                ],
                const SizedBox(height: 12),
                if (resources.isEmpty && !isLoading)
                  const _IamEmptyState(message: 'No se encontraron recursos.')
                else
                  ...resources.map(
                    (resource) => Container(
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
                        tilePadding: const EdgeInsets.symmetric(
                          horizontal: 16,
                          vertical: 8,
                        ),
                        leading: Container(
                          padding: const EdgeInsets.all(10),
                          decoration: BoxDecoration(
                            color: cs.primaryContainer,
                            shape: BoxShape.circle,
                          ),
                          child: Icon(
                            Icons.category_outlined,
                            color: cs.onPrimaryContainer,
                          ),
                        ),
                        title: Text(
                          resource.name,
                          style: tt.titleMedium?.copyWith(
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        subtitle: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const SizedBox(height: 4),
                            if (resource.description.isNotEmpty)
                              Text(
                                resource.description,
                                maxLines: 2,
                                overflow: TextOverflow.ellipsis,
                                style: tt.bodySmall?.copyWith(
                                  color: cs.onSurfaceVariant,
                                ),
                              ),
                            const SizedBox(height: 4),
                            if (resource.businessTypeName.isNotEmpty)
                              Container(
                                padding: const EdgeInsets.symmetric(
                                  horizontal: 8,
                                  vertical: 4,
                                ),
                                decoration: BoxDecoration(
                                  color: cs.secondaryContainer.withValues(
                                    alpha: 0.5,
                                  ),
                                  borderRadius: BorderRadius.circular(8),
                                ),
                                child: Text(
                                  resource.businessTypeName,
                                  style: tt.labelSmall?.copyWith(
                                    color: cs.onSecondaryContainer,
                                  ),
                                ),
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
                                const SizedBox(height: 8),
                                Row(
                                  mainAxisAlignment:
                                      MainAxisAlignment.spaceBetween,
                                  children: [
                                    Column(
                                      crossAxisAlignment:
                                          CrossAxisAlignment.start,
                                      children: [
                                        Text(
                                          'Creado',
                                          style: tt.labelSmall?.copyWith(
                                            color: cs.onSurfaceVariant,
                                          ),
                                        ),
                                        Text(
                                          _formatFriendlyDate(
                                            resource.createdAt,
                                          ),
                                          style: tt.bodyMedium,
                                        ),
                                      ],
                                    ),
                                    Column(
                                      crossAxisAlignment:
                                          CrossAxisAlignment.end,
                                      children: [
                                        Text(
                                          'Actualizado',
                                          style: tt.labelSmall?.copyWith(
                                            color: cs.onSurfaceVariant,
                                          ),
                                        ),
                                        Text(
                                          _formatFriendlyDate(
                                            resource.updatedAt,
                                          ),
                                          style: tt.bodyMedium,
                                        ),
                                      ],
                                    ),
                                  ],
                                ),
                                const SizedBox(height: 16),
                                Row(
                                  mainAxisAlignment: MainAxisAlignment.end,
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
                                      color: cs.error,
                                      onPressed: () =>
                                          confirmDeleteResourceDialog(
                                            context,
                                            resource,
                                          ),
                                    ),
                                  ],
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                if (controller.totalPages.value > 1) ...[
                  const SizedBox(height: 8),
                  _IamPaginationControls(
                    currentPage: controller.page.value,
                    lastPage: controller.totalPages.value,
                    hasPrev: controller.page.value > 1,
                    hasNext:
                        controller.page.value < controller.totalPages.value,
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
          ),
        ),
      );
    });
  }
}

class _IamBusinessTypesTab extends GetView<IamBusinessTypesController> {
  const _IamBusinessTypesTab();

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final tt = theme.textTheme;
    final cs = theme.colorScheme;

    return Obx(() {
      final isLoading = controller.isLoading.value;
      final error = controller.errorMessage.value;
      final types = controller.filteredTypes;

      if (isLoading && controller.types.isEmpty) {
        return const Center(child: CircularProgressIndicator());
      }

      return RefreshIndicator(
        onRefresh: controller.fetchTypes,
        child: Center(
          child: ConstrainedBox(
            constraints: const BoxConstraints(maxWidth: 1000),
            child: ListView(
              physics: const AlwaysScrollableScrollPhysics(),
              padding: ResponsiveHelper.getAdaptivePadding(context),
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      'Tipos de negocio',
                      style: tt.titleLarge?.copyWith(
                        fontWeight: FontWeight.w800,
                      ),
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
                  'Agrupa tus espacios por tipo para una mejor organización.',
                  style: tt.bodySmall?.copyWith(color: cs.onSurfaceVariant),
                ),
                const SizedBox(height: 16),
                TextField(
                  onChanged: controller.setSearch,
                  decoration: InputDecoration(
                    hintText: 'Buscar tipo de negocio',
                    prefixIcon: Icon(Icons.search, color: cs.onSurfaceVariant),
                    filled: true,
                    fillColor: cs.surfaceContainerHighest.withValues(
                      alpha: 0.6,
                    ),
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
                  ...types.map(
                    (type) => Container(
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
                      child: ListTile(
                        contentPadding: const EdgeInsets.symmetric(
                          horizontal: 16,
                          vertical: 12,
                        ),
                        leading: Container(
                          padding: const EdgeInsets.all(10),
                          decoration: BoxDecoration(
                            color: type.isActive
                                ? cs.primaryContainer
                                : cs.surfaceContainerHighest,
                            shape: BoxShape.circle,
                          ),
                          child: Text(
                            type.icon.isNotEmpty ? type.icon : '📦',
                            style: const TextStyle(fontSize: 24),
                          ),
                        ),
                        title: Row(
                          children: [
                            Expanded(
                              child: Text(
                                type.name,
                                style: tt.titleMedium?.copyWith(
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                            ),
                            _IamStatusChip(active: type.isActive),
                          ],
                        ),
                        subtitle: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const SizedBox(height: 4),
                            Container(
                              padding: const EdgeInsets.symmetric(
                                horizontal: 8,
                                vertical: 4,
                              ),
                              decoration: BoxDecoration(
                                color: cs.secondaryContainer.withValues(
                                  alpha: 0.5,
                                ),
                                borderRadius: BorderRadius.circular(8),
                              ),
                              child: Text(
                                type.code,
                                style: tt.labelSmall?.copyWith(
                                  color: cs.onSecondaryContainer,
                                  fontFamily: 'monospace',
                                ),
                              ),
                            ),
                            const SizedBox(height: 8),
                            Text(
                              'Creado: ${_formatFriendlyDate(type.createdAt)}',
                              style: tt.labelSmall?.copyWith(
                                color: cs.onSurfaceVariant,
                              ),
                            ),
                          ],
                        ),
                        trailing: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            IconButton(
                              tooltip: 'Editar',
                              onPressed: () => showBusinessTypeFormDialog(
                                context,
                                type: type,
                              ),
                              icon: const Icon(Icons.edit_outlined),
                            ),
                            Obx(() {
                              final isDeleting = controller.deletingTypeIds
                                  .contains(type.id);
                              return IconButton(
                                tooltip: 'Eliminar',
                                onPressed: isDeleting
                                    ? null
                                    : () => confirmDeleteBusinessTypeDialog(
                                        context,
                                        type,
                                      ),
                                icon: isDeleting
                                    ? const SizedBox(
                                        width: 16,
                                        height: 16,
                                        child: CircularProgressIndicator(
                                          strokeWidth: 2,
                                        ),
                                      )
                                    : Icon(
                                        Icons.delete_outline,
                                        color: cs.error,
                                      ),
                              );
                            }),
                          ],
                        ),
                      ),
                    ),
                  ),
              ],
            ),
          ),
        ),
      );
    });
  }
}

class _IamBusinessesTab extends GetView<IamBusinessesController> {
  const _IamBusinessesTab();

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final tt = theme.textTheme;
    final cs = theme.colorScheme;

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
                      final dialogTheme = Theme.of(dialogCtx);
                      final dialogCs = dialogTheme.colorScheme;
                      final buttonColor = isActive
                          ? Colors.green
                          : dialogCs.error;
                      final textColor = isActive
                          ? Colors.white
                          : dialogCs.onError;
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
                              style: dialogTheme.textTheme.bodySmall?.copyWith(
                                color: dialogCs.onSurfaceVariant,
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

      return RefreshIndicator(
        onRefresh: controller.fetchBusinesses,
        child: Center(
          child: ConstrainedBox(
            constraints: const BoxConstraints(maxWidth: 1000),
            child: ListView(
              physics: const AlwaysScrollableScrollPhysics(),
              padding: ResponsiveHelper.getAdaptivePadding(context),
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      'Negocios',
                      style: tt.titleLarge?.copyWith(
                        fontWeight: FontWeight.w800,
                      ),
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
                  'Espacios, edificios o negocios que pertenecen a tu organización.',
                  style: tt.bodySmall?.copyWith(color: cs.onSurfaceVariant),
                ),
                const SizedBox(height: 16),
                TextField(
                  onChanged: controller.setSearch,
                  decoration: InputDecoration(
                    hintText: 'Buscar negocio por nombre o dirección',
                    prefixIcon: Icon(Icons.search, color: cs.onSurfaceVariant),
                    filled: true,
                    fillColor: cs.surfaceContainerHighest.withValues(
                      alpha: 0.6,
                    ),
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
                          DropdownMenuItem(
                            value: false,
                            child: Text('Inactivos'),
                          ),
                        ],
                      ),
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
                  ...businesses.map(
                    (business) => Container(
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
                        tilePadding: const EdgeInsets.symmetric(
                          horizontal: 16,
                          vertical: 8,
                        ),
                        leading: _IamBusinessLogoCell(
                          logoUrl: business.logoUrl,
                        ),
                        title: Row(
                          children: [
                            Expanded(
                              child: Text(
                                business.name,
                                style: tt.titleMedium?.copyWith(
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                            ),
                            _IamStatusChip(active: business.isActive),
                          ],
                        ),
                        subtitle: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const SizedBox(height: 4),
                            if (business.businessType.isNotEmpty)
                              Container(
                                padding: const EdgeInsets.symmetric(
                                  horizontal: 8,
                                  vertical: 4,
                                ),
                                decoration: BoxDecoration(
                                  color: cs.secondaryContainer.withValues(
                                    alpha: 0.5,
                                  ),
                                  borderRadius: BorderRadius.circular(8),
                                ),
                                child: Text(
                                  business.businessType,
                                  style: tt.labelSmall?.copyWith(
                                    color: cs.onSecondaryContainer,
                                  ),
                                ),
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
                                const SizedBox(height: 8),
                                if (business.address.isNotEmpty) ...[
                                  Row(
                                    children: [
                                      Icon(
                                        Icons.location_on_outlined,
                                        size: 16,
                                        color: cs.onSurfaceVariant,
                                      ),
                                      const SizedBox(width: 8),
                                      Expanded(
                                        child: Text(
                                          business.address,
                                          style: tt.bodyMedium,
                                        ),
                                      ),
                                    ],
                                  ),
                                  const SizedBox(height: 12),
                                ],
                                Text(
                                  'Creado: ${_formatFriendlyDate(business.createdAt)}',
                                  style: tt.labelSmall?.copyWith(
                                    color: cs.onSurfaceVariant,
                                  ),
                                ),
                                const SizedBox(height: 16),
                                FilledButton.icon(
                                  onPressed: () =>
                                      _showConfiguredResourcesDialog(
                                        context,
                                        business,
                                      ),
                                  icon: const Icon(Icons.widgets_outlined),
                                  label: const Text(
                                    'Ver recursos configurados',
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ],
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
          ),
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
    final theme = Theme.of(context);
    final tt = theme.textTheme;
    final cs = theme.colorScheme;
    final initials = _buildInitials(user.name);
    final lastLogin = _formatFriendlyDateTime(user.lastLoginAt);

    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(20),
        color: cs.surface,
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.04),
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
        border: Border.all(
          color: cs.outlineVariant.withValues(alpha: 0.3),
          width: 1,
        ),
      ),
      child: Material(
        color: Colors.transparent,
        borderRadius: BorderRadius.circular(20),
        child: InkWell(
          onTap: canView ? onView : null,
          borderRadius: BorderRadius.circular(20),
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Header: avatar + nombre + estado
                Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Avatar con gradiente border
                    Container(
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        gradient: user.isActive
                            ? LinearGradient(
                                colors: [cs.primary, cs.secondary],
                                begin: Alignment.topLeft,
                                end: Alignment.bottomRight,
                              )
                            : null,
                        border: !user.isActive
                            ? Border.all(color: cs.outlineVariant, width: 2)
                            : null,
                      ),
                      padding: const EdgeInsets.all(2.5),
                      child: GestureDetector(
                        onTap: user.avatarUrl.isNotEmpty
                            ? () => showImagePreviewDialog(
                                context,
                                imageProvider: NetworkImage(user.avatarUrl),
                                title: user.name,
                                heroTag: 'iam_avatar_${user.id}',
                              )
                            : null,
                        child: Hero(
                          tag: 'iam_avatar_${user.id}',
                          child: CircleAvatar(
                            radius: 28,
                            backgroundImage: user.avatarUrl.isNotEmpty
                                ? NetworkImage(user.avatarUrl)
                                : null,
                            backgroundColor: user.avatarUrl.isEmpty
                                ? cs.primaryContainer.withValues(alpha: 0.5)
                                : cs.surfaceContainerHighest,
                            child: user.avatarUrl.isEmpty
                                ? Text(
                                    initials,
                                    style: tt.titleMedium?.copyWith(
                                      fontWeight: FontWeight.w800,
                                      color: cs.onPrimaryContainer,
                                    ),
                                  )
                                : null,
                          ),
                        ),
                      ),
                    ),

                    const SizedBox(width: 14),

                    // Nombre, email, teléfono
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            children: [
                              Expanded(
                                child: Text(
                                  user.name,
                                  maxLines: 1,
                                  overflow: TextOverflow.ellipsis,
                                  style: tt.titleMedium?.copyWith(
                                    fontWeight: FontWeight.w700,
                                    letterSpacing: -0.2,
                                  ),
                                ),
                              ),
                              if (user.isSuperUser)
                                Container(
                                  margin: const EdgeInsets.only(left: 6),
                                  padding: const EdgeInsets.symmetric(
                                    horizontal: 8,
                                    vertical: 4,
                                  ),
                                  decoration: BoxDecoration(
                                    gradient: LinearGradient(
                                      colors: [
                                        cs.primary.withValues(alpha: 0.15),
                                        cs.secondary.withValues(alpha: 0.12),
                                      ],
                                    ),
                                    borderRadius: BorderRadius.circular(8),
                                  ),
                                  child: Row(
                                    mainAxisSize: MainAxisSize.min,
                                    children: [
                                      Icon(
                                        Icons.star_rounded,
                                        size: 14,
                                        color: cs.primary,
                                      ),
                                      const SizedBox(width: 4),
                                      Text(
                                        'Super',
                                        style: tt.labelSmall?.copyWith(
                                          color: cs.primary,
                                          fontWeight: FontWeight.w600,
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                            ],
                          ),

                          const SizedBox(height: 4),

                          Row(
                            children: [
                              Icon(
                                Icons.email_outlined,
                                size: 14,
                                color: cs.onSurfaceVariant,
                              ),
                              const SizedBox(width: 6),
                              Expanded(
                                child: Text(
                                  user.email,
                                  maxLines: 1,
                                  overflow: TextOverflow.ellipsis,
                                  style: tt.bodySmall?.copyWith(
                                    color: cs.onSurfaceVariant,
                                  ),
                                ),
                              ),
                            ],
                          ),

                          if (user.phone.isNotEmpty) ...[
                            const SizedBox(height: 3),
                            Row(
                              children: [
                                Icon(
                                  Icons.phone_outlined,
                                  size: 14,
                                  color: cs.onSurfaceVariant,
                                ),
                                const SizedBox(width: 6),
                                Text(
                                  user.phone,
                                  maxLines: 1,
                                  overflow: TextOverflow.ellipsis,
                                  style: tt.bodySmall?.copyWith(
                                    color: cs.onSurfaceVariant,
                                  ),
                                ),
                              ],
                            ),
                          ],
                        ],
                      ),
                    ),

                    const SizedBox(width: 8),

                    // Status indicator
                    Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 10,
                        vertical: 6,
                      ),
                      decoration: BoxDecoration(
                        color: user.isActive
                            ? Colors.green.withValues(alpha: 0.1)
                            : cs.surfaceContainerHighest,
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(
                          color: user.isActive
                              ? Colors.green.withValues(alpha: 0.3)
                              : cs.outlineVariant,
                        ),
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Container(
                            width: 8,
                            height: 8,
                            decoration: BoxDecoration(
                              color: user.isActive ? Colors.green : cs.outline,
                              shape: BoxShape.circle,
                            ),
                          ),
                          const SizedBox(width: 6),
                          Text(
                            user.isActive ? 'Activo' : 'Inactivo',
                            style: tt.labelSmall?.copyWith(
                              color: user.isActive
                                  ? Colors.green
                                  : cs.onSurfaceVariant,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),

                const SizedBox(height: 12),

                // Last login info
                Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 12,
                    vertical: 8,
                  ),
                  decoration: BoxDecoration(
                    color: cs.surfaceContainerHighest.withValues(alpha: 0.5),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(
                        Icons.schedule_outlined,
                        size: 14,
                        color: cs.onSurfaceVariant,
                      ),
                      const SizedBox(width: 6),
                      Text(
                        'Último acceso: $lastLogin',
                        style: tt.labelSmall?.copyWith(
                          color: cs.onSurfaceVariant,
                        ),
                      ),
                    ],
                  ),
                ),

                const SizedBox(height: 12),

                // Assignments
                if (user.assignments.isEmpty)
                  Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: cs.surfaceContainerHighest.withValues(alpha: 0.3),
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(
                        color: cs.outlineVariant.withValues(alpha: 0.5),
                        style: BorderStyle.solid,
                        width: 1,
                      ),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(
                          Icons.info_outline,
                          size: 16,
                          color: cs.onSurfaceVariant,
                        ),
                        const SizedBox(width: 8),
                        Text(
                          'Sin rol asignado',
                          style: tt.bodySmall?.copyWith(
                            color: cs.onSurfaceVariant,
                          ),
                        ),
                      ],
                    ),
                  )
                else
                  Wrap(
                    spacing: 8,
                    runSpacing: 8,
                    children: user.assignments
                        .map(
                          (assignment) => Container(
                            padding: const EdgeInsets.symmetric(
                              horizontal: 12,
                              vertical: 8,
                            ),
                            decoration: BoxDecoration(
                              color: cs.primaryContainer.withValues(alpha: 0.5),
                              borderRadius: BorderRadius.circular(12),
                              border: Border.all(
                                color: cs.primary.withValues(alpha: 0.2),
                              ),
                            ),
                            child: Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                Icon(
                                  Icons.business_outlined,
                                  size: 14,
                                  color: cs.primary,
                                ),
                                const SizedBox(width: 6),
                                ConstrainedBox(
                                  constraints: const BoxConstraints(
                                    maxWidth: 200,
                                  ),
                                  child: Text(
                                    '${assignment.businessName ?? 'Negocio'} · ${assignment.roleName ?? 'Sin rol'}',
                                    style: tt.labelSmall?.copyWith(
                                      color: cs.onPrimaryContainer,
                                      fontWeight: FontWeight.w600,
                                    ),
                                    maxLines: 1,
                                    overflow: TextOverflow.ellipsis,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        )
                        .toList(growable: false),
                  ),

                // Action buttons
                if (canView || canDelete) ...[
                  const SizedBox(height: 14),
                  const Divider(height: 1),
                  const SizedBox(height: 10),

                  Wrap(
                    spacing: 8,
                    runSpacing: 8,
                    children: [
                      if (canView)
                        Material(
                          color: cs.surfaceContainerHighest.withValues(
                            alpha: 0.5,
                          ),
                          borderRadius: BorderRadius.circular(12),
                          child: InkWell(
                            onTap: onView,
                            borderRadius: BorderRadius.circular(12),
                            child: Padding(
                              padding: const EdgeInsets.symmetric(
                                horizontal: 14,
                                vertical: 10,
                              ),
                              child: Row(
                                mainAxisSize: MainAxisSize.min,
                                children: [
                                  Icon(
                                    Icons.visibility_outlined,
                                    size: 18,
                                    color: cs.primary,
                                  ),
                                  const SizedBox(width: 8),
                                  Text(
                                    'Ver detalle',
                                    style: tt.labelMedium?.copyWith(
                                      fontWeight: FontWeight.w600,
                                      color: cs.primary,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ),
                        ),

                      Material(
                        color: cs.primaryContainer.withValues(alpha: 0.5),
                        borderRadius: BorderRadius.circular(12),
                        child: InkWell(
                          onTap: () => showAssignRolesDialog(context, user),
                          borderRadius: BorderRadius.circular(12),
                          child: Padding(
                            padding: const EdgeInsets.symmetric(
                              horizontal: 14,
                              vertical: 10,
                            ),
                            child: Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                Icon(
                                  Icons.admin_panel_settings_outlined,
                                  size: 18,
                                  color: cs.primary,
                                ),
                                const SizedBox(width: 8),
                                Text(
                                  'Asignar roles',
                                  style: tt.labelMedium?.copyWith(
                                    fontWeight: FontWeight.w600,
                                    color: cs.onPrimaryContainer,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ),
                      ),

                      Material(
                        color: cs.primaryContainer.withValues(alpha: 0.5),
                        borderRadius: BorderRadius.circular(12),
                        child: InkWell(
                          onTap: () =>
                              showGeneratePasswordDialog(context, user),
                          borderRadius: BorderRadius.circular(12),
                          child: Padding(
                            padding: const EdgeInsets.symmetric(
                              horizontal: 14,
                              vertical: 10,
                            ),
                            child: Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                Icon(
                                  Icons.key_outlined,
                                  size: 18,
                                  color: cs.primary,
                                ),
                                const SizedBox(width: 8),
                                Text(
                                  'Generar contraseña',
                                  style: tt.labelMedium?.copyWith(
                                    fontWeight: FontWeight.w600,
                                    color: cs.onPrimaryContainer,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ),
                      ),

                      if (canDelete)
                        Material(
                          color: cs.errorContainer.withValues(alpha: 0.3),
                          borderRadius: BorderRadius.circular(12),
                          child: InkWell(
                            onTap: isDeleting ? null : onDelete,
                            borderRadius: BorderRadius.circular(12),
                            child: Padding(
                              padding: const EdgeInsets.symmetric(
                                horizontal: 14,
                                vertical: 10,
                              ),
                              child: Row(
                                mainAxisSize: MainAxisSize.min,
                                children: [
                                  if (isDeleting)
                                    SizedBox(
                                      width: 16,
                                      height: 16,
                                      child: CircularProgressIndicator(
                                        strokeWidth: 2,
                                        valueColor:
                                            AlwaysStoppedAnimation<Color>(
                                              cs.error,
                                            ),
                                      ),
                                    )
                                  else
                                    Icon(
                                      Icons.delete_outline,
                                      size: 18,
                                      color: cs.error,
                                    ),
                                  const SizedBox(width: 8),
                                  Text(
                                    isDeleting ? 'Eliminando…' : 'Eliminar',
                                    style: tt.labelMedium?.copyWith(
                                      fontWeight: FontWeight.w600,
                                      color: cs.error,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ),
                        ),
                    ],
                  ),
                ],
              ],
            ),
          ),
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
    final cs = Theme.of(context).colorScheme;
    if (logoUrl.isEmpty) {
      return CircleAvatar(
        radius: 16,
        backgroundColor: cs.surfaceContainerHighest,
        child: Icon(
          Icons.apartment_outlined,
          size: 16,
          color: cs.onSurfaceVariant,
        ),
      );
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
      visualDensity: VisualDensity.compact,
      padding: const EdgeInsets.symmetric(horizontal: 8),
      label: Text(active ? 'Activo' : 'Inactivo'),
      backgroundColor: active ? cs.primaryContainer : cs.errorContainer,
      labelStyle: Theme.of(context).textTheme.labelSmall?.copyWith(
        color: active ? cs.onPrimaryContainer : cs.onErrorContainer,
      ),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(999)),
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
      elevation: 0,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
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
    final tt = Theme.of(context).textTheme;
    return Card(
      elevation: 0,
      color: cs.errorContainer,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      child: Padding(
        padding: const EdgeInsets.all(14),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Ocurrió un problema',
              style: tt.titleSmall?.copyWith(
                color: cs.onErrorContainer,
                fontWeight: FontWeight.w600,
              ),
            ),
            const SizedBox(height: 4),
            Text(
              message,
              style: tt.bodyMedium?.copyWith(color: cs.onErrorContainer),
            ),
            if (onRetry != null) ...[
              const SizedBox(height: 8),
              TextButton(
                onPressed: onRetry,
                style: TextButton.styleFrom(
                  foregroundColor: cs.onErrorContainer,
                ),
                child: const Text('Reintentar'),
              ),
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
    final tt = Theme.of(context).textTheme;
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 32),
      child: Column(
        children: [
          Icon(Icons.inbox_outlined, color: cs.onSurfaceVariant, size: 40),
          const SizedBox(height: 8),
          Text(
            message,
            textAlign: TextAlign.center,
            style: tt.bodyMedium?.copyWith(color: cs.onSurfaceVariant),
          ),
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
    final cs = Theme.of(context).colorScheme;
    return Padding(
      padding: const EdgeInsets.only(top: 4),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(
            'Página $currentPage de $lastPage',
            style: tt.bodySmall?.copyWith(color: cs.onSurfaceVariant),
          ),
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
      ),
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
    builder: (ctx) {
      final theme = Theme.of(ctx);
      final cs = theme.colorScheme;
      final tt = theme.textTheme;

      return AlertDialog(
        backgroundColor: cs.surface,
        surfaceTintColor: Colors.transparent,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(28)),
        titlePadding: const EdgeInsets.fromLTRB(24, 24, 24, 16),
        contentPadding: const EdgeInsets.fromLTRB(24, 0, 24, 0),
        actionsPadding: const EdgeInsets.fromLTRB(24, 0, 24, 24),
        title: Row(
          children: [
            Icon(Icons.category_outlined, color: cs.primary),
            const SizedBox(width: 12),
            Text(
              resource == null ? 'Crear recurso' : 'Editar recurso',
              style: tt.headlineSmall?.copyWith(fontWeight: FontWeight.bold),
            ),
          ],
        ),
        content: SingleChildScrollView(
          child: Form(
            key: formKey,
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                const SizedBox(height: 16),
                TextFormField(
                  controller: nameCtrl,
                  decoration: DesignHelper.inputDecoration(
                    label: 'Nombre del recurso',
                    icon: Icons.label_outlined,
                    context: ctx,
                  ),
                  validator: (value) => value == null || value.trim().isEmpty
                      ? 'Campo obligatorio'
                      : null,
                ),
                const SizedBox(height: 16),
                DropdownButtonFormField<int?>(
                  initialValue: selectedBusinessType,
                  decoration: DesignHelper.inputDecoration(
                    label: 'Tipo de negocio (opcional)',
                    icon: Icons.business,
                    context: ctx,
                  ),
                  isExpanded: true,
                  items: [
                    const DropdownMenuItem(
                      value: null,
                      child: Text('Genérico'),
                    ),
                    ...businessTypes.types
                        .map(
                          (type) => DropdownMenuItem(
                            value: type.id,
                            child: Text(
                              type.name,
                              overflow: TextOverflow.ellipsis,
                            ),
                          ),
                        )
                        .toList(),
                  ],
                  onChanged: (value) => selectedBusinessType = value,
                ),
                const SizedBox(height: 16),
                TextFormField(
                  controller: descriptionCtrl,
                  decoration: DesignHelper.inputDecoration(
                    label: 'Descripción',
                    icon: Icons.description_outlined,
                    context: ctx,
                  ),
                  minLines: 3,
                  maxLines: 5,
                ),
                const SizedBox(height: 16),
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
              if (resource == null) {
                final result = await controller.createResource(
                  name: nameCtrl.text.trim(),
                  businessTypeId: normalizeBusinessTypeId(selectedBusinessType),
                  description: descriptionCtrl.text.trim(),
                );
                if (result != null && ctx.mounted) {
                  Navigator.of(ctx).pop();
                  if (context.mounted) {
                    _showIamSnackBar(context, result.message);
                  }
                }
              } else {
                final result = await controller.updateResource(
                  id: resource.id,
                  name: nameCtrl.text.trim(),
                  businessTypeId: normalizeBusinessTypeId(selectedBusinessType),
                  description: descriptionCtrl.text.trim(),
                );
                if (result != null && ctx.mounted) {
                  Navigator.of(ctx).pop();
                  if (context.mounted) {
                    _showIamSnackBar(context, result.message);
                  }
                }
              }
            },
            child: Text(resource == null ? 'Crear recurso' : 'Guardar cambios'),
          ),
        ],
      );
    },
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
          final theme = Theme.of(dialogCtx);
          final cs = theme.colorScheme;
          final tt = theme.textTheme;

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
            backgroundColor: cs.surface,
            surfaceTintColor: Colors.transparent,
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(28),
            ),
            titlePadding: const EdgeInsets.fromLTRB(24, 24, 24, 16),
            contentPadding: const EdgeInsets.fromLTRB(24, 0, 24, 0),
            actionsPadding: const EdgeInsets.fromLTRB(24, 0, 24, 24),
            title: Row(
              children: [
                Icon(Icons.business, color: cs.primary),
                const SizedBox(width: 12),
                Expanded(
                  child: Text(
                    type == null
                        ? 'Crear tipo de negocio'
                        : 'Editar tipo de negocio',
                    style: tt.headlineSmall?.copyWith(
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
              ],
            ),
            content: SingleChildScrollView(
              child: Form(
                key: formKey,
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    const SizedBox(height: 16),
                    TextFormField(
                      controller: nameCtrl,
                      decoration: DesignHelper.inputDecoration(
                        label: 'Nombre',
                        icon: Icons.label_outlined,
                        context: dialogCtx,
                      ),
                      validator: (value) =>
                          (value == null || value.trim().isEmpty)
                          ? 'Requerido'
                          : null,
                    ),
                    const SizedBox(height: 16),
                    TextFormField(
                      controller: codeCtrl,
                      decoration: DesignHelper.inputDecoration(
                        label: 'Código',
                        icon: Icons.code,
                        context: dialogCtx,
                      ).copyWith(helperText: 'Debe ser único y en minúsculas.'),
                      validator: (value) =>
                          (value == null || value.trim().isEmpty)
                          ? 'Requerido'
                          : null,
                    ),
                    const SizedBox(height: 16),
                    TextFormField(
                      controller: descriptionCtrl,
                      decoration: DesignHelper.inputDecoration(
                        label: 'Descripción',
                        icon: Icons.description_outlined,
                        context: dialogCtx,
                      ),
                      maxLines: 3,
                    ),
                    const SizedBox(height: 16),
                    TextFormField(
                      controller: iconCtrl,
                      decoration:
                          DesignHelper.inputDecoration(
                            label: 'Icono',
                            icon: Icons.emoji_emotions_outlined,
                            context: dialogCtx,
                          ).copyWith(
                            helperText:
                                'Selecciona uno de la lista o ingresa un emoji.',
                          ),
                    ),
                    const SizedBox(height: 12),
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
                    const SizedBox(height: 16),
                    Container(
                      decoration: BoxDecoration(
                        color: cs.surfaceContainerHighest.withValues(
                          alpha: 0.5,
                        ),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: CheckboxListTile(
                        value: isActive,
                        onChanged: (value) {
                          setState(() => isActive = value ?? isActive);
                        },
                        title: const Text('¿Activo?'),
                        subtitle: const Text(
                          'Los tipos inactivos no se mostrarán en nuevos negocios',
                        ),
                        contentPadding: const EdgeInsets.symmetric(
                          horizontal: 12,
                        ),
                      ),
                    ),
                    const SizedBox(height: 16),
                    _BusinessTypeInfoCard(),
                    const SizedBox(height: 16),
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

/// Muestra diálogo para generar una nueva contraseña para el usuario
Future<void> showGeneratePasswordDialog(
  BuildContext context,
  IamUser user,
) async {
  if (!Get.isRegistered<IamUsersController>()) return;
  final controller = Get.find<IamUsersController>();

  // 1. Confirmación
  final confirmed = await showDialog<bool>(
    context: context,
    builder: (ctx) => AlertDialog(
      title: const Text('Generar contraseña'),
      content: Text(
        '¿Estás seguro de generar una nueva contraseña para ${user.name}?',
      ),
      actions: [
        TextButton(
          onPressed: () => Navigator.of(ctx).pop(false),
          child: const Text('Cancelar'),
        ),
        FilledButton(
          onPressed: () => Navigator.of(ctx).pop(true),
          child: const Text('Confirmar'),
        ),
      ],
    ),
  );

  if (confirmed != true) return;

  // 2. Generar contraseña
  if (!context.mounted) return;
  showDialog(
    context: context,
    barrierDismissible: false,
    builder: (ctx) => const Center(child: CircularProgressIndicator()),
  );

  try {
    final result = await controller.generatePassword(user.id);
    if (!context.mounted) return;
    Navigator.of(context, rootNavigator: true).pop(); // Close loading

    if (result.success) {
      _showPasswordBottomSheet(context, result);
    } else {
      _showIamSnackBar(context, result.message);
    }
  } catch (e) {
    if (!context.mounted) return;
    Navigator.of(context, rootNavigator: true).pop(); // Close loading
    _showIamSnackBar(context, 'Error al generar contraseña: $e');
  }
}

void _showPasswordBottomSheet(
  BuildContext context,
  IamGeneratePasswordResult result,
) {
  showModalBottomSheet(
    context: context,
    isScrollControlled: true,
    backgroundColor: Colors.transparent,
    builder: (ctx) {
      final theme = Theme.of(ctx);
      final cs = theme.colorScheme;
      final tt = theme.textTheme;

      return GlassContainer(
        borderRadius: const BorderRadius.vertical(top: Radius.circular(20)),
        blur: 20,
        opacity: 0.9,
        child: Padding(
          padding: const EdgeInsets.fromLTRB(24, 24, 24, 40),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Icon(Icons.check_circle, color: Colors.green, size: 28),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Text(
                      'Contraseña generada',
                      style: tt.titleMedium?.copyWith(
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                  IconButton(
                    icon: const Icon(Icons.close),
                    onPressed: () => Navigator.of(ctx).pop(),
                  ),
                ],
              ),
              const SizedBox(height: 24),
              Text('Correo electrónico', style: tt.labelMedium),
              const SizedBox(height: 8),
              _CopyableField(label: 'Correo', value: result.email),
              const SizedBox(height: 20),
              Text('Contraseña generada', style: tt.labelMedium),
              const SizedBox(height: 8),
              _CopyableField(
                label: 'Contraseña',
                value: result.password,
                isPassword: true,
              ),
              const SizedBox(height: 16),
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: cs.errorContainer.withValues(alpha: 0.5),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Row(
                  children: [
                    Icon(
                      Icons.warning_amber_rounded,
                      color: cs.error,
                      size: 20,
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Text(
                        '⚠️ Solo se muestra una vez. Asegúrate de copiarla.',
                        style: tt.bodySmall?.copyWith(color: cs.error),
                      ),
                    ),
                  ],
                ),
              ),
              if (result.message.isNotEmpty) ...[
                const SizedBox(height: 16),
                Text(result.message, style: tt.bodySmall),
              ],
              const SizedBox(height: 24),
              SizedBox(
                width: double.infinity,
                child: FilledButton(
                  onPressed: () => Navigator.of(ctx).pop(),
                  child: const Text('Cerrar'),
                ),
              ),
            ],
          ),
        ),
      );
    },
  );
}

class _CopyableField extends StatelessWidget {
  final String label;
  final String value;
  final bool isPassword;

  const _CopyableField({
    required this.label,
    required this.value,
    this.isPassword = false,
  });

  @override
  Widget build(BuildContext context) {
    final cs = Theme.of(context).colorScheme;
    return Container(
      decoration: BoxDecoration(
        border: Border.all(color: cs.outlineVariant),
        borderRadius: BorderRadius.circular(12),
      ),
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      child: Row(
        children: [
          Expanded(
            child: SelectableText(
              value,
              style: const TextStyle(fontFamily: 'monospace', fontSize: 16),
            ),
          ),
          IconButton(
            icon: const Icon(Icons.copy, size: 20),
            onPressed: () {
              Clipboard.setData(ClipboardData(text: value));
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(
                  content: Text('$label copiado al portapapeles'),
                  duration: const Duration(seconds: 2),
                ),
              );
            },
          ),
        ],
      ),
    );
  }
}

/// Muestra diálogo para asignar roles a un usuario
Future<void> showAssignRolesDialog(BuildContext context, IamUser user) async {
  debugPrint('═══════════════════════════════════════');
  debugPrint('IAM: showAssignRolesDialog called for user: ${user.name}');
  if (!Get.isRegistered<IamUsersController>()) {
    debugPrint('IAM: IamUsersController not registered!');
    return;
  }
  final controller = Get.find<IamUsersController>();

  // Group assignments by business
  final assignmentsByBusiness = <int, List<IamBusinessRoleAssignment>>{};
  for (final assignment in user.assignments) {
    assignmentsByBusiness
        .putIfAbsent(assignment.businessId, () => [])
        .add(assignment);
  }

  debugPrint('IAM: Total businesses for user: ${assignmentsByBusiness.length}');
  for (var entry in assignmentsByBusiness.entries) {
    debugPrint(
      'IAM: Business ${entry.key} has ${entry.value.length} assignments',
    );
    for (var a in entry.value) {
      debugPrint(
        'IAM:   - BusinessTypeId: ${a.businessTypeId}, RoleId: ${a.roleId}',
      );
    }
  }

  final businessRoles = <int, List<Role>>{};
  List<IamBusinessType> businessTypes = [];
  Map<int, int> businessTypeIdMap = {}; // Map businessId -> businessTypeId

  // Show loading
  showDialog(
    context: context,
    barrierDismissible: false,
    builder: (ctx) => const Center(child: CircularProgressIndicator()),
  );

  try {
    // Load business types first
    debugPrint('IAM: Loading business types...');
    if (Get.isRegistered<IamBusinessTypesController>()) {
      final typesController = Get.find<IamBusinessTypesController>();
      if (typesController.types.isEmpty) {
        await typesController.fetchTypes();
      }
      businessTypes = typesController.types.toList();
      debugPrint('IAM: Loaded ${businessTypes.length} business types');
    }

    // Load businesses to get business_type_id for each business
    debugPrint('IAM: Loading businesses to get business_type_id...');
    if (Get.isRegistered<IamBusinessesController>()) {
      // Load all businesses without pagination
      final allBusinessesResult = await controller.repository.getBusinesses(
        page: 1,
        perPage: 1000, // Get all businesses
      );
      debugPrint(
        'IAM: Loaded ${allBusinessesResult.businesses.length} businesses',
      );

      // Create map of businessId -> businessTypeId
      for (final business in allBusinessesResult.businesses) {
        businessTypeIdMap[business.id] = business.businessTypeId;
        debugPrint(
          'IAM: Business ${business.id} (${business.name}) -> Type ${business.businessTypeId}',
        );
      }
    }

    debugPrint('IAM: Starting role fetch loop...');
    for (final entry in assignmentsByBusiness.entries) {
      final businessId = entry.key;

      // Get businessTypeId from the map we loaded from /businesses endpoint
      final businessTypeId = businessTypeIdMap[businessId];

      debugPrint(
        'IAM: BusinessId: $businessId, BusinessTypeId from map: $businessTypeId',
      );

      // Fetch roles filtered by businessTypeId (if null, it will fetch all roles)
      debugPrint(
        'IAM: Calling fetchRoles with businessTypeId=$businessTypeId for business $businessId...',
      );
      final roles = await controller.fetchRoles(businessTypeId: businessTypeId);
      debugPrint(
        'IAM: ✓ Roles fetched for business $businessId: ${roles.length} roles',
      );
      for (var r in roles) {
        debugPrint('IAM:   - ${r.name} (TypeId: ${r.businessTypeId})');
      }
      businessRoles[businessId] = roles;
    }

    debugPrint('IAM: businessRoles map summary:');
    for (var entry in businessRoles.entries) {
      debugPrint('IAM:   Business ${entry.key} => ${entry.value.length} roles');
    }

    if (!context.mounted) return;
    Navigator.of(context, rootNavigator: true).pop(); // Close loading

    // Initialize selected roles
    final initialRoles = <int, List<int>>{};
    for (final entry in assignmentsByBusiness.entries) {
      final businessId = entry.key;
      final assignments = entry.value;
      if (assignments.isNotEmpty) {
        initialRoles[businessId] = [assignments.first.roleId];
      }
    }
    controller.initSelectedRoles(initialRoles);

    debugPrint('IAM: About to show _AssignRolesContent dialog...');
    await showDialog(
      context: context,
      barrierColor: Colors.black.withValues(alpha: 0.2),
      builder: (ctx) => _AssignRolesContent(
        user: user,
        assignmentsByBusiness: assignmentsByBusiness,
        businessRoles: businessRoles,
        businessTypes: businessTypes,
        businessTypeIdMap: businessTypeIdMap,
        controller: controller,
      ),
    );
    debugPrint('IAM: Dialog closed');
  } catch (e) {
    debugPrint('IAM: ✗ ERROR in showAssignRolesDialog: $e');
    debugPrint('IAM: Stack trace: ${StackTrace.current}');
    if (!context.mounted) return;
    Navigator.of(context, rootNavigator: true).pop(); // Close loading
    _showIamSnackBar(context, 'Error al cargar roles: $e');
  }
  debugPrint('═══════════════════════════════════════');
}

class _AssignRolesContent extends StatelessWidget {
  final IamUser user;
  final Map<int, List<IamBusinessRoleAssignment>> assignmentsByBusiness;
  final Map<int, List<Role>> businessRoles;
  final List<IamBusinessType> businessTypes;
  final Map<int, int> businessTypeIdMap; // Map businessId -> businessTypeId
  final IamUsersController controller;

  const _AssignRolesContent({
    required this.user,
    required this.assignmentsByBusiness,
    required this.businessRoles,
    required this.businessTypes,
    required this.businessTypeIdMap,
    required this.controller,
  });

  @override
  Widget build(BuildContext context) {
    debugPrint('IAM UI: _AssignRolesContent.build() called');
    debugPrint('IAM UI: businessRoles map has ${businessRoles.length} entries');

    final theme = Theme.of(context);
    final cs = theme.colorScheme;
    final tt = theme.textTheme;

    return Center(
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: GlassContainer(
          width: 500,
          borderRadius: BorderRadius.circular(20),
          padding: const EdgeInsets.all(24),
          blur: 15,
          opacity: 0.85,
          child: Material(
            color: Colors.transparent,
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Row(
                  children: [
                    Icon(Icons.admin_panel_settings, color: cs.primary),
                    const SizedBox(width: 12),
                    const Expanded(child: Text('Asignar roles')),
                  ],
                ),
                const SizedBox(height: 16),
                Flexible(
                  child: SingleChildScrollView(
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Usuario: ${user.name}',
                          style: tt.bodyMedium?.copyWith(
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                        const SizedBox(height: 16),
                        Container(
                          padding: const EdgeInsets.all(12),
                          decoration: BoxDecoration(
                            color: cs.surfaceContainerHighest.withValues(
                              alpha: 0.5,
                            ),
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: Text(
                            'Selecciona un rol para cada negocio asociado al usuario. Los roles se filtran automáticamente según el tipo de negocio.',
                            style: tt.bodySmall,
                          ),
                        ),
                        const SizedBox(height: 20),
                        if (assignmentsByBusiness.isEmpty)
                          const Center(
                            child: Text(
                              'El usuario no tiene negocios asignados.',
                            ),
                          )
                        else
                          ...assignmentsByBusiness.entries.map((entry) {
                            final businessId = entry.key;
                            final assignments = entry.value;
                            final businessName =
                                assignments.firstOrNull?.businessName ??
                                'Negocio #$businessId';

                            // Get businessTypeId from the businesses map (loaded from /businesses endpoint)
                            var businessTypeId = businessTypeIdMap[businessId];

                            debugPrint(
                              'IAM UI: Business $businessId - businessTypeId from map: $businessTypeId',
                            );

                            // Fallback: Try to get from assignments if not in map
                            if (businessTypeId == null) {
                              businessTypeId = assignments
                                  .map((e) => e.businessTypeId)
                                  .where((id) => id != null && id > 0)
                                  .firstOrNull;
                              debugPrint(
                                'IAM UI: Business $businessId - businessTypeId from assignments: $businessTypeId',
                              );
                            }

                            // Second fallback: Try to infer from the assigned role
                            if (businessTypeId == null &&
                                assignments.isNotEmpty) {
                              final assignedRoleId = assignments.first.roleId;
                              final roles = businessRoles[businessId] ?? [];
                              final assignedRole = roles.firstWhereOrNull(
                                (r) => r.id == assignedRoleId,
                              );
                              if (assignedRole != null &&
                                  assignedRole.businessTypeId != null) {
                                businessTypeId = assignedRole.businessTypeId;
                                debugPrint(
                                  'IAM UI: Business $businessId - businessTypeId inferred from role: $businessTypeId',
                                );
                              }
                            }

                            // Find the business type name
                            debugPrint(
                              'IAM UI: --- Business Type Resolution ---',
                            );
                            debugPrint('IAM UI: BusinessId: $businessId');
                            debugPrint(
                              'IAM UI: Resolved businessTypeId: $businessTypeId',
                            );
                            debugPrint(
                              'IAM UI: Available business types (${businessTypes.length}):',
                            );
                            for (var bt in businessTypes) {
                              debugPrint(
                                'IAM UI:   - ID: ${bt.id}, Name: ${bt.name}, Icon: ${bt.icon}',
                              );
                            }

                            String businessTypeDisplay;
                            if (businessTypeId != null) {
                              final type = businessTypes.firstWhereOrNull(
                                (t) => t.id == businessTypeId,
                              );
                              debugPrint(
                                'IAM UI: Looking for type with ID $businessTypeId... Found: ${type?.name ?? "NOT FOUND"}',
                              );

                              if (type != null) {
                                // Only show the icon if it's an actual emoji (Unicode character)
                                // Icons like "building" are just text, not emojis
                                final hasEmoji =
                                    type.icon.isNotEmpty &&
                                    type.icon.runes.length == 1 &&
                                    type.icon.runes.first > 0x1F000;
                                businessTypeDisplay = hasEmoji
                                    ? '${type.icon} ${type.name}'
                                    : type.name;
                              } else {
                                businessTypeDisplay =
                                    'Tipo: ID $businessTypeId';
                              }
                            } else {
                              debugPrint(
                                'IAM UI: ⚠️ businessTypeId is NULL - showing "Sin tipo definido"',
                              );
                              businessTypeDisplay = 'Sin tipo definido';
                            }

                            final roles = businessRoles[businessId] ?? [];

                            debugPrint(
                              'IAM UI: Rendering business $businessId ($businessName) - Type: $businessTypeDisplay - ${roles.length} roles',
                            );

                            return Padding(
                              padding: const EdgeInsets.only(bottom: 16),
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    businessName,
                                    style: tt.titleSmall?.copyWith(
                                      fontWeight: FontWeight.bold,
                                    ),
                                  ),
                                  const SizedBox(height: 4),
                                  Text(
                                    businessTypeDisplay,
                                    style: tt.bodySmall?.copyWith(
                                      color: cs.onSurfaceVariant,
                                    ),
                                  ),
                                  const SizedBox(height: 8),
                                  if (roles.isEmpty)
                                    Container(
                                      padding: const EdgeInsets.all(12),
                                      decoration: BoxDecoration(
                                        color: cs.errorContainer.withValues(
                                          alpha: 0.3,
                                        ),
                                        borderRadius: BorderRadius.circular(8),
                                        border: Border.all(
                                          color: cs.error.withValues(
                                            alpha: 0.3,
                                          ),
                                        ),
                                      ),
                                      child: Row(
                                        children: [
                                          Icon(
                                            Icons.warning_amber_rounded,
                                            color: cs.error,
                                            size: 20,
                                          ),
                                          const SizedBox(width: 8),
                                          Expanded(
                                            child: Text(
                                              'No hay roles disponibles para este tipo de negocio.',
                                              style: tt.bodySmall?.copyWith(
                                                color: cs.error,
                                              ),
                                            ),
                                          ),
                                        ],
                                      ),
                                    )
                                  else
                                    Obx(() {
                                      final selected =
                                          controller.selectedRoles[businessId];
                                      final selectedId = selected?.firstOrNull;
                                      return DropdownButtonFormField<int>(
                                        initialValue:
                                            roles.any((r) => r.id == selectedId)
                                            ? selectedId
                                            : null,
                                        decoration: InputDecoration(
                                          border: OutlineInputBorder(
                                            borderRadius: BorderRadius.circular(
                                              12,
                                            ),
                                          ),
                                          contentPadding:
                                              const EdgeInsets.symmetric(
                                                horizontal: 2,
                                                vertical: 8,
                                              ),
                                          filled: true,
                                          fillColor: cs.surface.withValues(
                                            alpha: 0.5,
                                          ),
                                        ),
                                        items: roles.map((role) {
                                          return DropdownMenuItem<int>(
                                            value: role.id,
                                            child: Text(
                                              role.name,
                                              style: TextStyle(fontSize: 12),
                                            ),
                                          );
                                        }).toList(),
                                        onChanged: (value) {
                                          if (value != null) {
                                            // Clear and set new
                                            controller
                                                .selectedRoles[businessId] = [
                                              value,
                                            ];
                                          }
                                        },
                                        hint: const Text('Seleccionar rol'),
                                      );
                                    }),
                                ],
                              ),
                            );
                          }),
                      ],
                    ),
                  ),
                ),
                const SizedBox(height: 24),
                Row(
                  mainAxisAlignment: MainAxisAlignment.end,
                  children: [
                    TextButton(
                      onPressed: () => Navigator.of(context).pop(),
                      child: const Text('Cancelar'),
                    ),
                    const SizedBox(width: 8),
                    FilledButton(
                      onPressed: () async {
                        // Build map of business_id -> role_id from selected roles
                        final assignments = <int, int>{};
                        for (var entry in controller.selectedRoles.entries) {
                          final businessId = entry.key;
                          final roleIds = entry.value;
                          if (roleIds.isNotEmpty && roleIds.first > 0) {
                            assignments[businessId] = roleIds.first;
                          }
                        }

                        if (assignments.isEmpty) {
                          ScaffoldMessenger.of(context).showSnackBar(
                            const SnackBar(
                              content: Text(
                                'Debes seleccionar al menos un rol',
                              ),
                            ),
                          );
                          return;
                        }

                        // Show loading
                        showDialog(
                          context: context,
                          barrierDismissible: false,
                          builder: (ctx) =>
                              const Center(child: CircularProgressIndicator()),
                        );

                        try {
                          final result = await controller.assignRoles(
                            userId: user.id,
                            businessRoleAssignments: assignments,
                          );

                          if (!context.mounted) return;
                          Navigator.of(
                            context,
                            rootNavigator: true,
                          ).pop(); // Close loading
                          Navigator.of(context).pop(); // Close dialog

                          _showIamSnackBar(
                            context,
                            result.message ?? 'Operación completada',
                          );
                        } catch (e) {
                          if (!context.mounted) return;
                          Navigator.of(
                            context,
                            rootNavigator: true,
                          ).pop(); // Close loading
                          _showIamSnackBar(
                            context,
                            'Error al asignar roles: $e',
                          );
                        }
                      },
                      child: const Text('Asignar Roles'),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class _IamTabDefinition {
  final String label;
  final IconData icon;

  const _IamTabDefinition(this.label, this.icon);
}
