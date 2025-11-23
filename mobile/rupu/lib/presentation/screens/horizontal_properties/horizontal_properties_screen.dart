import 'package:flutter/material.dart';
import 'package:get/get.dart';

import 'package:rupu/presentation/screens/horizontal_properties/horizontal_properties_controller.dart';
import 'package:rupu/presentation/views/horizontal_properties/horizontal_properties_view.dart';

class HorizontalPropertiesScreen extends StatelessWidget {
  static const name = 'horizontal-properties-screen';
  final int pageIndex;

  const HorizontalPropertiesScreen({super.key, required this.pageIndex});
  @override
  Widget build(BuildContext context) {
    return GetX<HorizontalPropertiesScreenController>(
      init: HorizontalPropertiesScreenController(pageIndex: pageIndex),
      builder: (controller) {
        controller.scheduleRedirect(context);
        if (controller.redirecting.value) {
          return const SizedBox.shrink();
        }
        return HorizontalPropertiesView(pageIndex: pageIndex);
      },
    );
  }
}
