import 'package:flutter/material.dart';
import 'package:rupu/presentation/views/dashboard/dashboard_view.dart';

class DashBoard extends StatelessWidget {
  const DashBoard({super.key, required this.pageIndex});

  final int pageIndex;

  @override
  Widget build(BuildContext context) {
    // Ya no redireccionamos automáticamente.
    // Mostramos directamente la vista del Dashboard.
    return const DashboardView();
  }
}
