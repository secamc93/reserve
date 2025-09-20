// presentation/views/business_selector/business_selector_view.dart
import 'package:flutter/material.dart';
import 'package:get/get.dart';

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

        return SafeArea(
          child: Column(
            children: [
              // Header fijo
              Padding(
                padding: const EdgeInsets.fromLTRB(16, 16, 16, 8),
                child: BusinessHeader(
                  greeting:
                      'Hola ${controller.userName.isNotEmpty ? controller.userName : '👋'}',
                  subtitle: 'Selecciona el negocio con el que deseas trabajar.',
                ),
              ),

              // Solo las cards scrollean
              Expanded(
                child: ListView.separated(
                  padding: const EdgeInsets.fromLTRB(16, 8, 16, 24 + 72),
                  itemCount: businesses.length,
                  separatorBuilder: (_, __) => const SizedBox(height: 12),
                  itemBuilder: (context, index) {
                    final b = businesses[index];
                    return BusinessCard(
                      key: ValueKey(b.id), // <- ayuda al reciclado
                      business: b,
                      selected:
                          selectedId ==
                          b.id, // <- se actualiza al cambiar selección
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

        if (!hasItems) return const SizedBox.shrink();

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
            padding: const EdgeInsets.fromLTRB(16, 10, 16, 16),
            child: SizedBox(
              width: double.infinity,
              height: 52,
              child: FilledButton(
                onPressed: canContinue
                    ? () => controller.confirmSelection(context)
                    : null,
                child: const Text('Continuar'),
              ),
            ),
          ),
        );
      }),
    );
  }
}
