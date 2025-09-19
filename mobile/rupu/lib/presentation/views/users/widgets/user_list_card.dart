import 'package:flutter/material.dart';

import 'package:rupu/domain/entities/user_list_item.dart';

class UserListCard extends StatelessWidget {
  final UserListItem user;
  final String Function(DateTime?) formatDate;
  final VoidCallback? onView;
  final VoidCallback? onDelete;
  final bool canView;
  final bool canDelete;
  final bool isProcessing;

  const UserListCard({
    super.key,
    required this.user,
    required this.formatDate,
    this.onView,
    this.onDelete,
    this.canView = false,
    this.canDelete = false,
    this.isProcessing = false,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final avatar = user.avatarUrl.isNotEmpty
        ? CircleAvatar(
            radius: 28,
            backgroundImage: NetworkImage(user.avatarUrl),
          )
        : CircleAvatar(
            radius: 28,
            child: Text(
              _initialsFromName(user.name),
            ),
          );

    final statusColor = user.isActive
        ? theme.colorScheme.secondaryContainer
        : theme.colorScheme.errorContainer;
    final statusOnColor = user.isActive
        ? theme.colorScheme.onSecondaryContainer
        : theme.colorScheme.onErrorContainer;

    return Card(
      elevation: 1,
      clipBehavior: Clip.antiAlias,
      child: InkWell(
        onTap: canView && onView != null ? onView : null,
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
            Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                avatar,
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        user.name,
                        style: theme.textTheme.titleMedium?.copyWith(
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                      const SizedBox(height: 4),
                      SelectableText(
                        user.email,
                        style: theme.textTheme.bodyMedium,
                      ),
                      if (user.phone.isNotEmpty) ...[
                        const SizedBox(height: 4),
                        Text(
                          user.phone,
                          style: theme.textTheme.bodySmall,
                        ),
                      ],
                    ],
                  ),
                ),
                Chip(
                  backgroundColor: statusColor,
                  label: Text(user.isActive ? 'Activo' : 'Inactivo'),
                  labelStyle: theme.textTheme.labelMedium?.copyWith(
                    color: statusOnColor,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),
            _InfoRow(
              icon: Icons.login_rounded,
              label: 'Último acceso',
              value: formatDate(user.lastLoginAt),
            ),
            if (user.createdAt != null)
              _InfoRow(
                icon: Icons.event_available_outlined,
                label: 'Creado',
                value: formatDate(user.createdAt),
              ),
            if (user.updatedAt != null)
              _InfoRow(
                icon: Icons.update,
                label: 'Actualizado',
                value: formatDate(user.updatedAt),
              ),
            if (user.roles.isNotEmpty) ...[
              const SizedBox(height: 12),
              Text('Roles', style: theme.textTheme.labelLarge),
              const SizedBox(height: 4),
              Wrap(
                spacing: 8,
                runSpacing: 6,
                children: [
                  for (final role in user.roles)
                    Chip(
                      avatar: const Icon(Icons.security_outlined, size: 18),
                      label: Text(role.name),
                    ),
                ],
              ),
            ],
            if (user.businesses.isNotEmpty) ...[
              const SizedBox(height: 12),
              Text('Negocios', style: theme.textTheme.labelLarge),
              const SizedBox(height: 4),
              Wrap(
                spacing: 8,
                runSpacing: 6,
                children: [
                  for (final business in user.businesses)
                    Chip(
                      avatar: const Icon(Icons.storefront_outlined, size: 18),
                      label: Text(business.name),
                    ),
                ],
              ),
            ],
            if ((canView && onView != null) || (canDelete && onDelete != null))
              const SizedBox(height: 16),
            if ((canView && onView != null) || (canDelete && onDelete != null))
              const Divider(height: 1),
            if ((canView && onView != null) || (canDelete && onDelete != null))
              const SizedBox(height: 12),
            if ((canView && onView != null) || (canDelete && onDelete != null))
              Wrap(
                spacing: 12,
                runSpacing: 8,
                children: [
                  if (canView && onView != null)
                    FilledButton.tonalIcon(
                      onPressed: isProcessing ? null : onView,
                      icon: const Icon(Icons.visibility_outlined),
                      label: const Text('Ver detalles'),
                    ),
                  if (canDelete && onDelete != null)
                    isProcessing
                        ? const SizedBox(
                            width: 40,
                            height: 40,
                            child: Center(
                              child: CircularProgressIndicator(strokeWidth: 2),
                            ),
                          )
                        : OutlinedButton.icon(
                            onPressed: onDelete,
                            style: OutlinedButton.styleFrom(
                              foregroundColor: theme.colorScheme.error,
                              side: BorderSide(color: theme.colorScheme.error),
                            ),
                            icon: const Icon(Icons.delete_outline),
                            label: const Text('Eliminar'),
                          ),
                ],
              ),
          ],
        ),
      ),
    );
  }
}

class _InfoRow extends StatelessWidget {
  final IconData icon;
  final String label;
  final String value;

  const _InfoRow({
    required this.icon,
    required this.label,
    required this.value,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 2),
      child: Row(
        children: [
          Icon(icon, size: 18, color: theme.colorScheme.primary),
          const SizedBox(width: 8),
          Text(
            '$label:',
            style: theme.textTheme.bodySmall?.copyWith(
              fontWeight: FontWeight.w600,
            ),
          ),
          const SizedBox(width: 6),
          Expanded(
            child: Text(
              value,
              style: theme.textTheme.bodySmall,
            ),
          ),
        ],
      ),
    );
  }
}

String _initialsFromName(String name) {
  final trimmed = name.trim();
  if (trimmed.isEmpty) return '?';
  final runeIterator = trimmed.runes.iterator;
  if (!runeIterator.moveNext()) return '?';
  return String.fromCharCode(runeIterator.current).toUpperCase();
}
