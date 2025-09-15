import 'package:flutter/material.dart';

import 'package:rupu/domain/entities/user_list_item.dart';

class UserListCard extends StatelessWidget {
  final UserListItem user;
  final String Function(DateTime?) formatDate;

  const UserListCard({super.key, required this.user, required this.formatDate});

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
