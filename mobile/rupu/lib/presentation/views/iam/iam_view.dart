import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';

import 'package:rupu/domain/entities/iam_business.dart';
import 'package:rupu/domain/entities/iam_business_type.dart';
import 'package:rupu/domain/entities/iam_resource.dart';
import 'package:rupu/domain/entities/iam_user.dart';
import 'package:rupu/presentation/views/iam/controllers/iam_business_types_controller.dart';
import 'package:rupu/presentation/views/iam/controllers/iam_businesses_controller.dart';
import 'package:rupu/presentation/views/iam/controllers/iam_resources_controller.dart';
import 'package:rupu/presentation/views/iam/controllers/iam_users_controller.dart';
import 'package:rupu/presentation/views/roles_permissions/roles_permissions_view.dart';
import 'package:rupu/presentation/views/settings/views/create_user_view.dart';
import 'package:rupu/presentation/views/users/users_controller.dart';

class IamView extends StatefulWidget {
  final int pageIndex;

  const IamView({super.key, required this.pageIndex});

  @override
  State<IamView> createState() => _IamViewState();
}

class _IamViewState extends State<IamView>
    with SingleTickerProviderStateMixin {
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
              .map(
                (tab) => Tab(
                  icon: Icon(tab.icon),
                  text: tab.label,
                ),
              )
              .toList(growable: false),
        ),
      ),
      floatingActionButton: _buildFloatingActionButton(context),
      body: TabBarView(
        controller: _tabController,
        children: [
          const _IamTabPage(
            child: SafeArea(
              top: false,
              bottom: false,
              child: _IamUsersTab(),
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
            child: SafeArea(
              top: false,
              child: _IamResourcesTab(),
            ),
          ),
          const _IamTabPage(
            child: SafeArea(
              top: false,
              child: _IamBusinessTypesTab(),
            ),
          ),
          const _IamTabPage(
            child: SafeArea(
              top: false,
              child: _IamBusinessesTab(),
            ),
          ),
        ],
      ),
    );
  }

  Widget? _buildFloatingActionButton(BuildContext context) {
    if (_tabController.index != 0) return null;
    if (!Get.isRegistered<UsersController>()) return null;
    return _IamUsersFab(pageIndex: widget.pageIndex);
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

class _IamPlaceholderTab extends StatelessWidget {
  final String title;

  const _IamPlaceholderTab({required this.title});

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
  const _IamUsersTab();

  @override
  Widget build(BuildContext context) {
    final tt = Theme.of(context).textTheme;

    return Obx(() {
      final isLoading = controller.isLoading.value;
      final error = controller.errorMessage.value;
      final users = controller.users;
      final total = controller.pagination.value?.total ?? users.length;

      if (isLoading && users.isEmpty) {
        return const Center(child: CircularProgressIndicator());
      }

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
                hintText: 'Nombre, correo, teléfono…',
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
                    'Usuarios encontrados: $total',
                    style: tt.titleMedium?.copyWith(fontWeight: FontWeight.w600),
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
                onRetry: controller.refreshData,
              ),
            ],
            const SizedBox(height: 12),
            if (users.isEmpty && !isLoading)
              const _IamEmptyState(message: 'No se encontraron usuarios.')
            else
              ...users.map((user) => Padding(
                    padding: const EdgeInsets.only(bottom: 12),
                    child: _IamUserCard(user: user),
                  )),
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

class _IamResourcesTab extends GetView<IamResourcesController> {
  const _IamResourcesTab();

  @override
  Widget build(BuildContext context) {
    final tt = Theme.of(context).textTheme;
    final cs = Theme.of(context).colorScheme;

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
                    style: tt.titleMedium?.copyWith(fontWeight: FontWeight.w600),
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
                onRetry: controller.fetchResources,
              ),
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
                    ],
                    rows: resources.map((resource) {
                      return DataRow(cells: [
                        DataCell(Text(resource.name)),
                        DataCell(SizedBox(
                          width: 280,
                          child: Text(
                            resource.description.isEmpty
                                ? '-'
                                : resource.description,
                            maxLines: 2,
                            overflow: TextOverflow.ellipsis,
                          ),
                        )),
                        DataCell(Text(resource.businessTypeName)),
                        DataCell(Text(_formatDate(resource.createdAt))),
                        DataCell(Text(_formatDate(resource.updatedAt))),
                      ]);
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
    final tt = Theme.of(context).textTheme;

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
              _IamErrorCard(
                message: error,
                onRetry: controller.fetchTypes,
              ),
            ],
            const SizedBox(height: 12),
            if (types.isEmpty && !isLoading)
              const _IamEmptyState(
                message: 'No se encontraron tipos de negocio.',
              )
            else
              Wrap(
                spacing: 12,
                runSpacing: 12,
                children: types
                    .map((type) => _IamBusinessTypeCard(type: type))
                    .toList(growable: false),
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
    final tt = Theme.of(context).textTheme;

    return Obx(() {
      final isLoading = controller.isLoading.value;
      final error = controller.errorMessage.value;
      final businesses = controller.businesses;

      if (isLoading && businesses.isEmpty) {
        return const Center(child: CircularProgressIndicator());
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
                      DropdownMenuItem(value: null, child: Text('Todos los estados')),
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
                  child: DataTable(
                    columns: const [
                      DataColumn(label: Text('Logo')),
                      DataColumn(label: Text('Nombre')),
                      DataColumn(label: Text('Tipo de negocio')),
                      DataColumn(label: Text('Estado')),
                      DataColumn(label: Text('Dirección')),
                    ],
                    rows: businesses.map((business) {
                      return DataRow(cells: [
                        DataCell(_IamBusinessLogoCell(logoUrl: business.logoUrl)),
                        DataCell(Text(business.name)),
                        DataCell(Text(business.businessType)),
                        DataCell(_IamStatusChip(active: business.isActive)),
                        DataCell(SizedBox(
                          width: 280,
                          child: Text(
                            business.address.isEmpty ? '-' : business.address,
                            maxLines: 2,
                            overflow: TextOverflow.ellipsis,
                          ),
                        )),
                      ]);
                    }).toList(),
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

  const _IamUserCard({required this.user});

  @override
  Widget build(BuildContext context) {
    final tt = Theme.of(context).textTheme;
    final cs = Theme.of(context).colorScheme;
    final initials = _buildInitials(user.name);
    final lastLogin = _formatDate(user.lastLoginAt);

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
                  backgroundImage:
                      user.avatarUrl.isNotEmpty ? NetworkImage(user.avatarUrl) : null,
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
                        style:
                            tt.titleMedium?.copyWith(fontWeight: FontWeight.w700),
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
                              backgroundColor:
                                  cs.secondaryContainer,
                              labelStyle: tt.labelSmall?.copyWith(
                                color: cs.onSecondaryContainer,
                              ),
                            ),
                          Chip(
                            label: Text('Último acceso: $lastLogin'),
                          ),
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
          ],
        ),
      ),
    );
  }

  String _buildInitials(String name) {
    final parts = name.trim().split(RegExp(r'\s+')).where((e) => e.isNotEmpty);
    if (parts.isEmpty) return 'U';
    return parts
        .take(2)
        .map((p) => p.substring(0, 1))
        .join()
        .toUpperCase();
  }
}

class _IamBusinessTypeCard extends StatelessWidget {
  final IamBusinessType type;

  const _IamBusinessTypeCard({required this.type});

  @override
  Widget build(BuildContext context) {
    final cs = Theme.of(context).colorScheme;
    final tt = Theme.of(context).textTheme;
    return Container(
      width: 220,
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: cs.surface,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: cs.outlineVariant),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(type.icon.isEmpty ? '🏢' : type.icon, style: const TextStyle(fontSize: 28)),
          const SizedBox(height: 8),
          Text(type.name, style: tt.titleMedium?.copyWith(fontWeight: FontWeight.w700)),
          const SizedBox(height: 4),
          Text(type.description, maxLines: 3, overflow: TextOverflow.ellipsis),
          const SizedBox(height: 8),
          _IamStatusChip(active: type.isActive),
        ],
      ),
    );
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
    return CircleAvatar(
      radius: 16,
      backgroundImage: NetworkImage(logoUrl),
    );
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
      backgroundColor:
          active ? cs.primaryContainer : cs.errorContainer,
      labelStyle: Theme.of(context).textTheme.labelSmall?.copyWith(
            color: active ? cs.onPrimaryContainer : cs.onErrorContainer,
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
              style: Theme.of(context)
                  .textTheme
                  .bodyMedium
                  ?.copyWith(color: cs.onErrorContainer),
            ),
            if (onRetry != null) ...[
              const SizedBox(height: 8),
              TextButton(
                onPressed: onRetry,
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
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 32),
      child: Column(
        children: [
          Icon(Icons.inbox_outlined, color: cs.onSurfaceVariant, size: 48),
          const SizedBox(height: 8),
          Text(
            message,
            textAlign: TextAlign.center,
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

String _formatDate(DateTime? value) {
  if (value == null) return '--';
  return DateFormat('dd/MM/yyyy HH:mm').format(value.toLocal());
}

class _IamTabDefinition {
  final String label;
  final IconData icon;

  const _IamTabDefinition(this.label, this.icon);
}
