import 'package:flutter/material.dart';

import '../../views/business_selector/business_selector_view.dart';

class BusinessSelectorScreen extends StatelessWidget {
  static const name = 'business-selector-screen';

  const BusinessSelectorScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return const BusinessSelectorView();
  }
}
