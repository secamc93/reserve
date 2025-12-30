library horizontal_property_detail_view;

import 'dart:async';
import 'dart:io' show Platform;
import 'package:rupu/presentation/views/horizontal_properties/voting_live_view.dart';
import 'dart:math' as math;

import 'package:flex_color_picker/flex_color_picker.dart';
import 'package:rupu/presentation/widgets/shared/rupu_loader.dart';
import 'package:syncfusion_flutter_charts/charts.dart';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';
import 'package:rupu/config/helpers/design_helper.dart';
import 'package:rupu/config/helpers/responsive_helper.dart';
import 'package:rupu/config/helpers/dialog_helper.dart';
import 'package:rupu/domain/entities/horizontal_property_action_result.dart';
import 'package:rupu/domain/entities/horizontal_property_resident_detail.dart';
import 'package:rupu/domain/entities/horizontal_property_residents_page.dart';
import 'package:rupu/domain/entities/horizontal_property_unit_detail.dart';
import 'package:rupu/domain/entities/horizontal_property_units_page.dart';
import 'package:rupu/domain/entities/horizontal_property_voting.dart';
import 'package:rupu/domain/repositories/horizontal_properties_repository.dart';
import 'package:rupu/presentation/views/login/login_controller.dart';

import 'controllers/horizontal_property_dashboard_controller.dart';
import 'controllers/horizontal_property_residents_controller.dart';
import 'controllers/horizontal_property_units_controller.dart';
import 'controllers/horizontal_property_voting_controller.dart';
import 'horizontal_property_detail_controller.dart';

part 'horizontal_property_detail_dashboard_tab.dart';
part 'horizontal_property_detail_units_tab.dart';
part 'horizontal_property_detail_residents_tab.dart';
part 'horizontal_property_detail_voting_tab.dart';
part 'horizontal_property_detail_shared_widgets.dart';

class HorizontalPropertyDetailView
    extends GetView<HorizontalPropertyDetailController> {
  static const name = 'horizontal-property-detail';
  final int propertyId;

  HorizontalPropertyDetailView({super.key, required this.propertyId});

  @override
  String? get tag => HorizontalPropertyDetailController.tagFor(propertyId);

  @override
  Widget build(BuildContext context) {
    final detailTag = tag!;
    final dashboardTag = HorizontalPropertyDashboardController.tagFor(
      propertyId,
    );
    final unitsTag = HorizontalPropertyUnitsController.tagFor(propertyId);
    final residentsTag = HorizontalPropertyResidentsController.tagFor(
      propertyId,
    );
    final votingTag = HorizontalPropertyVotingController.tagFor(propertyId);

    return DefaultTabController(
      length: 4,
      child: Scaffold(
        appBar: PreferredSize(
          preferredSize: const Size.fromHeight(110),
          child: _PremiumAppBar(
            tag: detailTag,
            tabs: const [
              _TabDefinition(Icons.home_outlined, 'Dashboard'),
              _TabDefinition(Icons.apartment_outlined, 'Unidades'),
              _TabDefinition(Icons.group_outlined, 'Residentes'),
              _TabDefinition(Icons.how_to_vote_outlined, 'Votaciones'),
            ],
          ),
        ),
        body: TabBarView(
          children: [
            _DashboardTab(controllerTag: dashboardTag),
            _UnitsTab(controllerTag: unitsTag),
            _ResidentsTab(controllerTag: residentsTag),
            _VotingTab(controllerTag: votingTag),
          ],
        ),
      ),
    );
  }
}

class _TabDefinition {
  final IconData icon;
  final String label;
  const _TabDefinition(this.icon, this.label);
}

class _PremiumAppBar extends GetWidget<HorizontalPropertyDetailController> {
  final String tag;
  final List<_TabDefinition> tabs;
  const _PremiumAppBar({required this.tag, required this.tabs});

  @override
  Widget build(BuildContext context) {
    final cs = Theme.of(context).colorScheme;
    final tt = Theme.of(context).textTheme;

    return AppBar(
      iconTheme: IconThemeData(color: cs.primary),
      actionsIconTheme: IconThemeData(color: cs.primary),
      foregroundColor: cs.onSurface,
      backgroundColor: cs.surface,
      elevation: 0,
      scrolledUnderElevation: 2,
      surfaceTintColor: Colors.transparent,
      centerTitle: false,
      titleSpacing: 16,
      title: Obx(() {
        final name = controller.propertyName.trim().isEmpty
            ? 'Propiedad'
            : controller.propertyName;
        return Text(
          name,
          style: tt.titleLarge!.copyWith(
            fontWeight: FontWeight.w600,
            color: cs.onSurface,
          ),
        );
      }),
      // 🔹 Aquí dejamos el TabBar casi “crudo”
      bottom: PreferredSize(
        preferredSize: const Size.fromHeight(48),
        child: _PillTabBar(items: tabs),
      ),
    );
  }
}

class _PillTabBar extends StatelessWidget {
  final List<_TabDefinition> items;
  const _PillTabBar({required this.items});

  @override
  Widget build(BuildContext context) {
    if (Platform.isIOS) {
      return _buildIOSPillChips(context);
    }
    return _buildMaterialTabBar(context);
  }

  /// iOS-style scrollable pill chips
  Widget _buildIOSPillChips(BuildContext context) {
    final theme = Theme.of(context);
    final cs = theme.colorScheme;
    final tt = theme.textTheme;
    final tabController = DefaultTabController.of(context);

    return AnimatedBuilder(
      animation: tabController,
      builder: (context, _) => SizedBox(
        height: 44,
        child: ListView.separated(
          scrollDirection: Axis.horizontal,
          padding: const EdgeInsets.symmetric(horizontal: 12),
          itemCount: items.length,
          separatorBuilder: (_, __) => const SizedBox(width: 8),
          itemBuilder: (context, index) {
            final isSelected = tabController.index == index;
            final item = items[index];

            return GestureDetector(
              onTap: () => tabController.animateTo(index),
              child: AnimatedContainer(
                duration: const Duration(milliseconds: 200),
                curve: Curves.easeOutCubic,
                padding: const EdgeInsets.symmetric(
                  horizontal: 14,
                  vertical: 8,
                ),
                decoration: BoxDecoration(
                  color: isSelected
                      ? cs.primary.withValues(alpha: 0.15)
                      : cs.surfaceContainerHighest.withValues(alpha: 0.5),
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(
                    color: isSelected
                        ? cs.primary.withValues(alpha: 0.4)
                        : cs.outlineVariant.withValues(alpha: 0.3),
                    width: 1,
                  ),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Icon(
                      item.icon,
                      size: 18,
                      color: isSelected ? cs.primary : cs.onSurfaceVariant,
                    ),
                    const SizedBox(width: 6),
                    Text(
                      item.label,
                      style: tt.labelMedium?.copyWith(
                        color: isSelected ? cs.primary : cs.onSurfaceVariant,
                        fontWeight: isSelected
                            ? FontWeight.w600
                            : FontWeight.w500,
                      ),
                    ),
                  ],
                ),
              ),
            );
          },
        ),
      ),
    );
  }

  /// Material-style TabBar
  Widget _buildMaterialTabBar(BuildContext context) {
    final theme = Theme.of(context);
    final cs = theme.colorScheme;

    final tabs = items
        .map((item) => Tab(icon: Icon(item.icon), text: item.label))
        .toList();

    return TabBar(
      tabs: tabs,
      isScrollable: true,
      indicatorColor: cs.primary,
      labelColor: cs.primary,
      unselectedLabelColor: cs.onSurfaceVariant,
      labelStyle: theme.textTheme.labelLarge,
      unselectedLabelStyle: theme.textTheme.labelLarge,
    );
  }
}
