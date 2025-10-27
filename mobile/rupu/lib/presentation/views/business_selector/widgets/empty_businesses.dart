// presentation/views/business_selector/widgets/empty_businesses.dart
import 'package:flutter/material.dart';

class EmptyBusinesses extends StatelessWidget {
  const EmptyBusinesses({
    super.key,
    required this.messageColor,
    required this.onGoBack,
  });

  final Color messageColor;
  final void Function(BuildContext context) onGoBack;

  @override
  Widget build(BuildContext context) {
    final tt = Theme.of(context).textTheme;
    return SafeArea(
      child: Center(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(
                Icons.storefront,
                size: 72,
                color: messageColor.withValues(alpha: .6),
              ),
              const SizedBox(height: 16),
              Text(
                'No encontramos negocios disponibles en tu cuenta.',
                style: tt.titleMedium?.copyWith(
                  color: messageColor,
                  fontWeight: FontWeight.w600,
                ),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 12),
              Text(
                'Comunícate con un administrador para asignarte un negocio y vuelve a intentarlo.',
                style: tt.bodyMedium,
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 24),
              FilledButton.tonalIcon(
                onPressed: () => onGoBack(context),
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
