import 'dart:io';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:rupu/presentation/views/users/user_detail_controller.dart';
import 'package:rupu/presentation/views/users/widgets/user_detail_widgets.dart';
import 'package:rupu/presentation/widgets/image_preview_dialog.dart';

/// Modern avatar section for UserDetailView
class UserDetailAvatarSection extends StatelessWidget {
  final UserDetailController controller;
  final String userName;

  const UserDetailAvatarSection({
    super.key,
    required this.controller,
    required this.userName,
  });

  @override
  Widget build(BuildContext context) {
    final cs = Theme.of(context).colorScheme;
    final tt = Theme.of(context).textTheme;

    return Obx(() {
      final avatarData = controller.avatarFile.value;
      final hasUrl = controller.hasAvatarUrl.value;
      final customUrl = controller.avatarUrlCtrl.text.trim();

      ImageProvider? imageProvider;
      if (avatarData != null) {
        imageProvider = FileImage(File(avatarData.path));
      } else if (hasUrl && customUrl.isNotEmpty) {
        imageProvider = NetworkImage(customUrl);
      }

      final processing = controller.avatarProcessing.value;
      final file = controller.avatarFile.value;

      return Column(
        children: [
          // Avatar with action buttons
          Stack(
            clipBehavior: Clip.none,
            children: [
              Hero(
                tag: 'avatar_$userName',
                child: GradientAvatar(
                  imageProvider: imageProvider,
                  radius: 60,
                  onTap: imageProvider == null
                      ? null
                      : () => showImagePreviewDialog(
                          context,
                          imageProvider: imageProvider!,
                          title: userName,
                          heroTag: 'avatar_$userName',
                        ),
                  child: imageProvider == null
                      ? Icon(Icons.person, size: 60, color: cs.onSurfaceVariant)
                      : null,
                ),
              ),

              // Camera button (bottom right)
              if (controller.canUpdate)
                Positioned(
                  bottom: 4,
                  right: 4,
                  child: AvatarActionButton(
                    icon: Icons.photo_camera,
                    onTap: () => _showAvatarSourceSheet(context, controller),
                  ),
                ),

              // Remove button (top right)
              if (controller.canUpdate && imageProvider != null)
                Positioned(
                  top: 4,
                  right: 4,
                  child: AvatarActionButton(
                    icon: Icons.close,
                    onTap: () => _confirmDelete(context, controller),
                    isError: true,
                  ),
                ),
            ],
          ),

          const SizedBox(height: 16),

          // Status/processing indicator
          if (processing)
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
              decoration: BoxDecoration(
                color: cs.primaryContainer.withValues(alpha: 0.5),
                borderRadius: BorderRadius.circular(20),
              ),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  SizedBox(
                    width: 16,
                    height: 16,
                    child: CircularProgressIndicator(
                      strokeWidth: 2,
                      valueColor: AlwaysStoppedAnimation<Color>(
                        cs.onPrimaryContainer,
                      ),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Text(
                    'Procesando imagen...',
                    style: tt.bodySmall?.copyWith(
                      color: cs.onPrimaryContainer,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                ],
              ),
            )
          else if (file != null)
            StatusBadge(
              text: controller.formatFileSize(file.sizeInBytes),
              color: cs.primary,
            ),

          // Error message
          if (controller.avatarError.value != null) ...[
            const SizedBox(height: 8),
            Text(
              controller.avatarError.value!,
              style: tt.bodySmall?.copyWith(color: cs.error),
              textAlign: TextAlign.center,
            ),
          ],
        ],
      );
    });
  }

  Future<void> _showAvatarSourceSheet(
    BuildContext context,
    UserDetailController controller,
  ) async {
    final cs = Theme.of(context).colorScheme;
    final tt = Theme.of(context).textTheme;

    await showModalBottomSheet<void>(
      context: context,
      useSafeArea: true,
      showDragHandle: true,
      backgroundColor: cs.surface,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(28)),
      ),
      builder: (ctx) {
        return Padding(
          padding: const EdgeInsets.fromLTRB(20, 8, 20, 24),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Row(
                children: [
                  Container(
                    width: 48,
                    height: 48,
                    decoration: BoxDecoration(
                      gradient: LinearGradient(
                        colors: [
                          cs.primary.withValues(alpha: 0.15),
                          cs.secondary.withValues(alpha: 0.12),
                        ],
                      ),
                      borderRadius: BorderRadius.circular(14),
                    ),
                    alignment: Alignment.center,
                    child: Icon(
                      Icons.add_photo_alternate_outlined,
                      color: cs.primary,
                      size: 26,
                    ),
                  ),
                  const SizedBox(width: 14),
                  Text(
                    'Foto de perfil',
                    style: tt.titleLarge?.copyWith(fontWeight: FontWeight.w800),
                  ),
                ],
              ),
              const SizedBox(height: 20),

              // Camera option
              _buildSheetOption(
                context,
                icon: Icons.photo_camera_outlined,
                title: 'Tomar foto',
                subtitle: 'Usa la cámara para capturar la foto',
                onTap: () async {
                  Navigator.of(ctx).pop();
                  await controller.pickAvatarFromCamera();
                },
              ),

              const SizedBox(height: 12),

              // Gallery option
              _buildSheetOption(
                context,
                icon: Icons.photo_library_outlined,
                title: 'Desde galería',
                subtitle: 'Selecciona una foto de tu galería',
                onTap: () async {
                  Navigator.of(ctx).pop();
                  await controller.pickAvatar();
                },
              ),
            ],
          ),
        );
      },
    );
  }

  Widget _buildSheetOption(
    BuildContext context, {
    required IconData icon,
    required String title,
    required String subtitle,
    required VoidCallback onTap,
  }) {
    final cs = Theme.of(context).colorScheme;
    final tt = Theme.of(context).textTheme;

    return Material(
      color: cs.surfaceContainerHighest.withValues(alpha: 0.5),
      borderRadius: BorderRadius.circular(16),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(16),
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
          child: Row(
            children: [
              Container(
                width: 44,
                height: 44,
                decoration: BoxDecoration(
                  color: cs.primaryContainer,
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Icon(icon, color: cs.primary, size: 22),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      title,
                      style: tt.bodyLarge?.copyWith(
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                    Text(
                      subtitle,
                      style: tt.bodySmall?.copyWith(color: cs.onSurfaceVariant),
                    ),
                  ],
                ),
              ),
              Icon(Icons.chevron_right_rounded, color: cs.onSurfaceVariant),
            ],
          ),
        ),
      ),
    );
  }

  Future<void> _confirmDelete(
    BuildContext context,
    UserDetailController controller,
  ) async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (ctx) {
        return AlertDialog(
          title: const Text('¿Eliminar foto?'),
          content: const Text(
            '¿Estás seguro de que quieres eliminar la foto de perfil? Esta acción no se puede deshacer.',
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.of(ctx).pop(false),
              child: const Text('Cancelar'),
            ),
            TextButton(
              onPressed: () => Navigator.of(ctx).pop(true),
              style: TextButton.styleFrom(
                foregroundColor: Theme.of(context).colorScheme.error,
              ),
              child: const Text('Eliminar'),
            ),
          ],
        );
      },
    );

    if (confirmed == true) {
      controller.removeAvatarFile();
    }
  }
}
