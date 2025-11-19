import 'package:flutter/material.dart';

Future<void> showImagePreviewDialog(
  BuildContext context, {
  ImageProvider? imageProvider,
  String? imageUrl,
  String? title,
}) async {
  final provider = imageProvider ??
      (imageUrl != null && imageUrl.isNotEmpty
          ? NetworkImage(imageUrl)
          : null);
  if (provider == null) return;
  await showDialog<void>(
    context: context,
    builder: (dialogCtx) {
      return Dialog(
        clipBehavior: Clip.antiAlias,
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            if (title != null)
              Padding(
                padding: const EdgeInsets.fromLTRB(16, 16, 16, 0),
                child: Text(
                  title,
                  style: Theme.of(context)
                      .textTheme
                      .titleMedium
                      ?.copyWith(fontWeight: FontWeight.w700),
                ),
              ),
            Flexible(
              child: InteractiveViewer(
                child: AspectRatio(
                  aspectRatio: 1,
                  child: Image(
                    image: provider,
                    fit: BoxFit.contain,
                    errorBuilder: (_, __, ___) => const Padding(
                      padding: EdgeInsets.all(24),
                      child: Text('No se pudo cargar la imagen.'),
                    ),
                  ),
                ),
              ),
            ),
            TextButton(
              onPressed: () => Navigator.of(dialogCtx).pop(),
              child: const Text('Cerrar'),
            ),
          ],
        ),
      );
    },
  );
}
