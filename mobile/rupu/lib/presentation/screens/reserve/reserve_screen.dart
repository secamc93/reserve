import 'package:flutter/material.dart';
import 'package:rupu/presentation/views/reserve/views/reserve_view.dart';

class ReserveScreen extends StatelessWidget {
  static const name = 'reserve';
  final int pageIndex;
  const ReserveScreen({super.key, required this.pageIndex});

  @override
  Widget build(BuildContext context) {
    // Si necesitas un Scaffold, puedes envolverla:
    // return Scaffold(body: ReserveView(pageIndex: pageIndex));
    return ReserveView(pageIndex: pageIndex);
  }
}
