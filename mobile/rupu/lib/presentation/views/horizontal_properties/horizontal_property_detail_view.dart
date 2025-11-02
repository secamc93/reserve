library horizontal_property_detail_view;

import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:get/get.dart';
import 'package:rupu/domain/entities/horizontal_property_residents_page.dart';
import 'package:rupu/domain/entities/horizontal_property_unit_detail.dart';
import 'package:rupu/domain/entities/horizontal_property_units_page.dart';
import 'package:rupu/domain/entities/horizontal_property_voting_groups.dart';

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
    final dashboardTag = HorizontalPropertyDashboardController.tagFor(propertyId);
    final unitsTag = HorizontalPropertyUnitsController.tagFor(propertyId);
    final residentsTag =
        HorizontalPropertyResidentsController.tagFor(propertyId);
    final votingTag = HorizontalPropertyVotingController.tagFor(propertyId);

    return DefaultTabController(
      length: 4,
      child: Scaffold(
        appBar: PreferredSize(
          preferredSize: const Size.fromHeight(110),
          child: _PremiumAppBar(
            tag: detailTag,
            tabs: const [
              (Icons.home_outlined, 'Dashboard'),
              (Icons.apartment_outlined, 'Unidades'),
              (Icons.group_outlined, 'Residentes'),
              (Icons.how_to_vote_outlined, 'Votaciones'),
            ],
          ),
        ),
        body: TabBarView(
          children: [
            _DashboardTab(
              controllerTag: dashboardTag,
            ),
            _UnitsTab(controllerTag: unitsTag),
            _ResidentsTab(controllerTag: residentsTag),
            _VotingTab(controllerTag: votingTag),
          ],
        ),
      ),
    );
  }
}

class _PremiumAppBar extends GetWidget<HorizontalPropertyDetailController> {
  final String tag;
  final List<(IconData, String)> tabs;
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
      flexibleSpace: Container(
        decoration: BoxDecoration(
          gradient: LinearGradient(
            colors: [
              cs.primary.withValues(alpha: .10),
              cs.secondary.withValues(alpha: .08),
            ],
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
          ),
        ),
      ),
      title: Obx(() {
        final name = controller.propertyName.trim().isEmpty
            ? 'Propiedad'
            : controller.propertyName;
        return Text(
          name,
          style: tt.titleLarge!.copyWith(
            fontWeight: FontWeight.normal,
            color: cs.onSurface,
          ),
        );
      }),
      bottom: PreferredSize(
        preferredSize: const Size.fromHeight(54),
        child: Padding(
          padding: const EdgeInsets.fromLTRB(12, 0, 12, 10),
          child: _PillTabBar(items: tabs),
        ),
      ),
    );
  }
}

class _PillTabBar extends StatelessWidget {
  final List<(IconData, String)> items;
  const _PillTabBar({required this.items});

  @override
  Widget build(BuildContext context) {
    final cs = Theme.of(context).colorScheme;
    final tabs = items.map((t) => Tab(icon: Icon(t.$1), text: t.$2)).toList();

    return Container(
      height: 50,
      decoration: BoxDecoration(
        color: cs.surfaceContainerHigh,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: cs.outlineVariant),
      ),
      child: TabBar(
        isScrollable: true,
        dividerColor: Colors.transparent,
        indicatorSize: TabBarIndicatorSize.label,
        labelPadding: const EdgeInsets.symmetric(horizontal: 6),
        labelStyle: Theme.of(context)
            .textTheme
            .labelLarge
            ?.copyWith(fontWeight: FontWeight.w800),
        unselectedLabelStyle: Theme.of(context)
            .textTheme
            .labelLarge
            ?.copyWith(fontWeight: FontWeight.w600),
        labelColor: cs.onPrimaryContainer,
        unselectedLabelColor: cs.onSurfaceVariant,
        indicator: ShapeDecoration(
          color: cs.primaryContainer,
          shape: StadiumBorder(
            side: BorderSide(color: cs.primary.withValues(alpha: .25)),
          ),
        ),
        tabs: tabs,
      ),
    );
  }
}
