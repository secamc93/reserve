import 'dart:ui';
import 'package:flutter/material.dart';

Future<void> showImagePreviewDialog(
  BuildContext context, {
  ImageProvider? imageProvider,
  String? imageUrl,
  String? title,
  String? heroTag,
}) async {
  final provider =
      imageProvider ??
      (imageUrl != null && imageUrl.isNotEmpty ? NetworkImage(imageUrl) : null);
  if (provider == null) return;

  await Navigator.of(context).push(
    PageRouteBuilder(
      opaque: false,
      barrierColor: Colors
          .transparent, // Changed to transparent as background is handled by BackdropFilter
      barrierDismissible: true,
      pageBuilder: (context, animation, secondaryAnimation) {
        return FadeTransition(
          opacity: animation,
          child: Stack(
            fit: StackFit.expand,
            children: [
              // Blurred background
              BackdropFilter(
                filter: ImageFilter.blur(sigmaX: 10, sigmaY: 10),
                child: Container(color: Colors.black.withValues(alpha: 0.8)),
              ),

              // Image
              Center(
                child: InteractiveViewer(
                  minScale: 0.5,
                  maxScale: 4.0,
                  child: heroTag != null
                      ? Hero(
                          tag: heroTag,
                          child: Image(image: provider, fit: BoxFit.contain),
                        )
                      : Image(image: provider, fit: BoxFit.contain),
                ),
              ),

              // Title (bottom) with gradient
              if (title != null)
                Positioned(
                  bottom: 0,
                  left: 0,
                  right: 0,
                  child: Container(
                    padding: EdgeInsets.fromLTRB(
                      24,
                      40,
                      24,
                      MediaQuery.of(context).padding.bottom + 24,
                    ),
                    decoration: BoxDecoration(
                      gradient: LinearGradient(
                        begin: Alignment.topCenter,
                        end: Alignment.bottomCenter,
                        colors: [
                          Colors.transparent,
                          Colors.black.withValues(alpha: 0.8),
                        ],
                      ),
                    ),
                    child: Material(
                      color: Colors.transparent,
                      child: Text(
                        title,
                        textAlign: TextAlign.center,
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 18,
                          fontWeight: FontWeight.w600,
                          letterSpacing: 0.5,
                        ),
                      ),
                    ),
                  ),
                ),

              // Close button (top right) - Moved to end for Z-index
              Positioned(
                top: MediaQuery.of(context).padding.top + 12,
                right: 16,
                child: Material(
                  color: Colors.transparent,
                  child: InkWell(
                    onTap: () => Navigator.of(context).pop(),
                    borderRadius: BorderRadius.circular(30),
                    child: Container(
                      padding: const EdgeInsets.all(8),
                      decoration: BoxDecoration(
                        color: Colors.black.withValues(alpha: 0.4),
                        shape: BoxShape.circle,
                        border: Border.all(
                          color: Colors.white.withValues(alpha: 0.2),
                          width: 1,
                        ),
                      ),
                      child: const Icon(
                        Icons.close,
                        color: Colors.white,
                        size: 24,
                      ),
                    ),
                  ),
                ),
              ),
            ],
          ),
        );
      },
    ),
  );
}
