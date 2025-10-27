import 'package:flutter/material.dart';
import 'package:rupu/config/routers/app_bindings.dart';
import 'package:rupu/presentation/views/horizontal_properties/horizontal_properties_view.dart';

class HorizontalPropertiesScreen extends StatelessWidget {
  static const name = 'horizontal-properties-screen';
  final int pageIndex;

  const HorizontalPropertiesScreen({super.key, required this.pageIndex});

  @override
  Widget build(BuildContext context) {
    HorizontalPropertiesBinding.register();
    return HorizontalPropertiesView(pageIndex: pageIndex);
  }
}
