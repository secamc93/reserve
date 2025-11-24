// presentation/views/business_selector/business_selector_view.dart
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:rupu/config/helpers/responsive_helper.dart';

import 'business_selector_controller.dart';
import 'widgets/business_card.dart';
import 'widgets/business_header.dart';
import 'widgets/empty_businesses.dart';

class BusinessSelectorView extends GetView<BusinessSelectorController> {
  const BusinessSelectorView({super.key});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final cs = theme.colorScheme;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Selecciona un negocio'),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => controller.goBackToLogin(context),
        ),
      ),

      // BODY
      body: Obx(() {
        final businesses = controller.businesses; // RxList
        final selectedId =
            controller.selectedBusinessId.value; // <- ¡escuchar también esto!

        if (businesses.isEmpty) {
          return EmptyBusinesses(
            messageColor: cs.error,
            onGoBack: controller.goBackToLogin,
          );
        }

        final isTablet = ResponsiveHelper.isTablet(context);
        final padding = ResponsiveHelper.getAdaptivePadding(context);
        final gridColumns = ResponsiveHelper.getGridColumns(
          context,
          mobile: 1,
          tablet: 2,
          largeTablet: 3,
        );

        return SafeArea(
          child: Column(
            children: [
              // Header fijo
              Padding(
                padding: EdgeInsets.fromLTRB(
                  padding.left,
                  padding.top,
                  padding.right,
                  padding.top / 2,
                ),
                child: BusinessHeader(
                  greeting:
                      'Hola ${controller.userName.isNotEmpty ? controller.userName : '👋'}',
                  subtitle: 'Selecciona el negocio con el que deseas trabajar.',
                ),
              ),

              // Solo las cards scrollean
              Expanded(
                child: isTablet
                    ? GridView.builder(
                        padding: EdgeInsets.fromLTRB(
                          padding.left,
                          padding.top / 2,
                          padding.right,
                          24 + 72,
                        ),
                        gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
                          crossAxisCount: gridColumns,
                          crossAxisSpacing: ResponsiveHelper.getSpacing(
                            context,
                          ),
                          mainAxisSpacing: ResponsiveHelper.getSpacing(context),
                          childAspectRatio: 2.5,
                        ),
                        itemCount: businesses.length,
                        itemBuilder: (context, index) {
                          final b = businesses[index];
                          return BusinessCard(
                            key: ValueKey(b.id),
                            business: b,
                            selected: selectedId == b.id,
                            onTap: () => controller.selectBusiness(b.id),
                          );
                        },
                      )
                    : ListView.separated(
                        padding: EdgeInsets.fromLTRB(
                          padding.left,
                          padding.top / 2,
                          padding.right,
                          24 + 72,
                        ),
                        itemCount: businesses.length,
                        separatorBuilder: (_, __) => SizedBox(
                          height: ResponsiveHelper.getSpacing(context) * 0.75,
                        ),
                        itemBuilder: (context, index) {
                          final b = businesses[index];
                          return BusinessCard(
                            key: ValueKey(b.id),
                            business: b,
                            selected: selectedId == b.id,
                            onTap: () => controller.selectBusiness(b.id),
                          );
                        },
                      ),
              ),
            ],
          ),
        );
      }),

      // BOTÓN FIJO ABAJO
      bottomNavigationBar: Obx(() {
        final hasItems = controller.businesses.isNotEmpty; // escucha lista
        final canContinue =
            controller.selectedBusinessId.value != null; // <- escucha selección
        final isProcessing = controller.isProcessing.value;
        final errorText = controller.errorMessage.value;

        if (!hasItems) return const SizedBox.shrink();

        final padding = ResponsiveHelper.getAdaptivePadding(context);

        return SafeArea(
          top: false,
          child: Container(
            decoration: BoxDecoration(
              color: Theme.of(context).colorScheme.surface,
              border: Border(
                top: BorderSide(
                  color: Theme.of(context).colorScheme.outlineVariant,
                ),
              ),
            ),
            padding: EdgeInsets.fromLTRB(
              padding.left,
              10,
              padding.right,
              padding.bottom,
            ),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                if (errorText != null) ...[
                  Text(
                    errorText,
                    style: TextStyle(
                      color: Theme.of(context).colorScheme.error,
                    ),
                    textAlign: TextAlign.center,
                  ),
                  const SizedBox(height: 8),
                ],
                SizedBox(
                  width: double.infinity,
                  height: 52,
                  child: FilledButton(
                    onPressed: canContinue && !isProcessing
                        ? () => controller.confirmSelection(context)
                        : null,
                    child: isProcessing
                        ? const SizedBox(
                            width: 22,
                            height: 22,
                            child: CircularProgressIndicator(strokeWidth: 2),
                          )
                        : const Text('Continuar'),
                  ),
                ),
              ],
            ),
          ),
        );
      }),
    );
  }
}
