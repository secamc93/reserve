import 'package:flutter/material.dart';
import 'package:get/get.dart';

import 'horizontal_property_detail_controller.dart';

class HorizontalPropertyDetailView
    extends GetView<HorizontalPropertyDetailController> {
  static const name = 'horizontal-property-detail';
  final int propertyId;

  HorizontalPropertyDetailView({super.key, required this.propertyId});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Detalle propiedad')),
      body: const Center(child: Text('Detalle propiedad')),
    );
  }
}
