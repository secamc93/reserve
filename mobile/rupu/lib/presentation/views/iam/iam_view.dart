import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:go_router/go_router.dart';

import 'package:rupu/presentation/views/roles_permissions/roles_permissions_view.dart';
import 'package:rupu/presentation/views/settings/views/create_user_view.dart';
import 'package:rupu/presentation/views/users/users_controller.dart';
import 'package:rupu/presentation/views/users/users_view.dart';

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
          _IamTabPage(
            child: SafeArea(
              top: false,
              bottom: false,
              child: UsersView(pageIndex: widget.pageIndex, embedded: true),
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
              child: _IamPlaceholderTab(title: 'Recursos'),
            ),
          ),
          const _IamTabPage(
            child: SafeArea(
              top: false,
              child: _IamPlaceholderTab(title: 'Tipos de negocio'),
            ),
          ),
          const _IamTabPage(
            child: SafeArea(
              top: false,
              child: _IamPlaceholderTab(title: 'Negocios'),
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

class _IamTabDefinition {
  final String label;
  final IconData icon;

  const _IamTabDefinition(this.label, this.icon);
}
