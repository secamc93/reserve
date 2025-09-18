import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:rupu/domain/infrastructure/models/login_response_model.dart';

import 'business_selector_controller.dart';

class BusinessSelectorView extends GetView<BusinessSelectorController> {
  const BusinessSelectorView({super.key});

  @override
  Widget build(BuildContext context) {
    final businesses = controller.businesses;
    final theme = Theme.of(context);
    final cs = theme.colorScheme;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Selecciona un negocio'),
      ),
      body: businesses.isEmpty
          ? _EmptyBusinesses(
              messageColor: cs.error,
              onGoBack: controller.goBackToLogin,
            )
          : SafeArea(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Hola ${controller.userName.isNotEmpty ? controller.userName : '👋'}',
                      style: theme.textTheme.titleLarge,
                    ),
                    const SizedBox(height: 8),
                    Text(
                      'Selecciona el negocio con el que deseas trabajar.',
                      style: theme.textTheme.bodyMedium?.copyWith(
                        color: cs.onSurfaceVariant,
                      ),
                    ),
                    const SizedBox(height: 16),
                    Expanded(
                      child: ListView.separated(
                        itemCount: businesses.length,
                        separatorBuilder: (_, __) => const SizedBox(height: 12),
                        itemBuilder: (context, index) {
                          final business = businesses[index];
                          return _BusinessTile(business: business);
                        },
                      ),
                    ),
                    const SizedBox(height: 12),
                    Obx(() {
                      final error = controller.errorMessage.value;
                      if (error == null) return const SizedBox.shrink();
                      return Padding(
                        padding: const EdgeInsets.only(bottom: 12),
                        child: Text(
                          error,
                          style: theme.textTheme.bodyMedium?.copyWith(
                            color: cs.error,
                          ),
                        ),
                      );
                    }),
                    Obx(() {
                      final canContinue = controller.canContinue;
                      return SizedBox(
                        width: double.infinity,
                        child: FilledButton(
                          onPressed: canContinue
                              ? () => controller.confirmSelection(context)
                              : null,
                          child: const Text('Continuar'),
                        ),
                      );
                    }),
                  ],
                ),
              ),
            ),
    );
  }
}

class _BusinessTile extends GetView<BusinessSelectorController> {
  const _BusinessTile({required this.business});

  final BusinessModel business;

  @override
  Widget build(BuildContext context) {
    final cs = Theme.of(context).colorScheme;
    final subtitleStyle = Theme.of(context).textTheme.bodySmall;

    return Obx(() {
      final selectedId = controller.selectedBusinessId.value;
      final isSelected = selectedId == business.id;

      return Card(
        elevation: isSelected ? 4 : 0,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(16),
          side: BorderSide(
            color: isSelected ? cs.primary : cs.outlineVariant,
          ),
        ),
        child: RadioListTile<int>(
          value: business.id,
          groupValue: selectedId,
          onChanged: (_) => controller.selectBusiness(business.id),
          contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
          title: Text(
            business.name,
            style: Theme.of(context).textTheme.titleMedium,
          ),
          subtitle: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              if (business.description.isNotEmpty)
                Text(
                  business.description,
                  style: subtitleStyle,
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                ),
              const SizedBox(height: 4),
              Text(
                business.address,
                style: subtitleStyle?.copyWith(color: cs.onSurfaceVariant),
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
              ),
              const SizedBox(height: 8),
              Wrap(
                spacing: 8,
                runSpacing: 4,
                children: [
                  Chip(
                    label: Text(business.businessType.name),
                    visualDensity: VisualDensity.compact,
                  ),
                  if (business.enableReservations)
                    const Chip(
                      label: Text('Reservas'),
                      visualDensity: VisualDensity.compact,
                    ),
                  if (business.enableDelivery)
                    const Chip(
                      label: Text('Delivery'),
                      visualDensity: VisualDensity.compact,
                    ),
                  if (business.enablePickup)
                    const Chip(
                      label: Text('Pickup'),
                      visualDensity: VisualDensity.compact,
                    ),
                ],
              )
            ],
          ),
          secondary: _BusinessAvatar(
            colorScheme: cs,
            business: business,
            isSelected: isSelected,
          ),
        ),
      );
    });
  }
}

class _BusinessAvatar extends StatelessWidget {
  const _BusinessAvatar({
    required this.colorScheme,
    required this.business,
    required this.isSelected,
  });

  final ColorScheme colorScheme;
  final BusinessModel business;
  final bool isSelected;

  @override
  Widget build(BuildContext context) {
    final hasLogo = business.logoUrl.trim().isNotEmpty;
    final sanitizedName = business.name.trim();
    final initials =
        sanitizedName.isNotEmpty ? sanitizedName[0].toUpperCase() : '?';

    return AnimatedContainer(
      duration: const Duration(milliseconds: 200),
      width: 56,
      height: 56,
      decoration: BoxDecoration(
        shape: BoxShape.circle,
        border: Border.all(
          color: isSelected ? colorScheme.primary : colorScheme.outlineVariant,
          width: 2,
        ),
      ),
      child: ClipOval(
        child: hasLogo
            ? Image.network(
                business.logoUrl,
                fit: BoxFit.cover,
                errorBuilder: (_, __, ___) => _FallbackInitial(initials: initials),
              )
            : _FallbackInitial(initials: initials),
      ),
    );
  }
}

class _FallbackInitial extends StatelessWidget {
  const _FallbackInitial({required this.initials});

  final String initials;

  @override
  Widget build(BuildContext context) {
    final cs = Theme.of(context).colorScheme;
    return Container(
      color: cs.primaryContainer,
      child: Center(
        child: Text(
          initials,
          style: Theme.of(context).textTheme.titleMedium?.copyWith(
                color: cs.onPrimaryContainer,
                fontWeight: FontWeight.bold,
              ),
        ),
      ),
    );
  }
}

class _EmptyBusinesses extends StatelessWidget {
  const _EmptyBusinesses({
    required this.messageColor,
    required this.onGoBack,
  });

  final Color messageColor;
  final VoidCallback onGoBack;

  @override
  Widget build(BuildContext context) {
    return SafeArea(
      child: Center(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(Icons.storefront, size: 72, color: messageColor.withOpacity(.6)),
              const SizedBox(height: 16),
              Text(
                'No encontramos negocios disponibles en tu cuenta.',
                style: Theme.of(context).textTheme.titleMedium?.copyWith(
                      color: messageColor,
                      fontWeight: FontWeight.w600,
                    ),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 12),
              Text(
                'Comunícate con un administrador para asignarte un negocio y vuelve a intentarlo.',
                style: Theme.of(context).textTheme.bodyMedium,
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 24),
              FilledButton.tonalIcon(
                onPressed: onGoBack,
                icon: const Icon(Icons.arrow_back),
                label: const Text('Volver'),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
