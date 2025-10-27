import 'package:flutter/material.dart';
import 'package:rupu/config/routers/app_bindings.dart';
import 'package:rupu/presentation/views/horizontal_properties/horizontal_property_detail_view.dart';

class HorizontalPropertyDetailScreen extends StatelessWidget {
  static const name = 'horizontal-property-detail-screen';
  final int pageIndex;
  final int propertyId;

  const HorizontalPropertyDetailScreen({
    super.key,
    required this.pageIndex,
    required this.propertyId,
  });

  @override
  Widget build(BuildContext context) {
    HorizontalPropertyDetailBinding.register(propertyId: propertyId);
    return HorizontalPropertyDetailView(propertyId: propertyId);
  }
}
