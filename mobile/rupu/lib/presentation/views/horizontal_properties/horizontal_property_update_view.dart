// presentation/views/horizontal_property/update/horizontal_property_update_sheet.dart

import 'package:flex_color_picker/flex_color_picker.dart';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:rupu/config/helpers/responsive_helper.dart';
import 'package:rupu/presentation/widgets/shared/rupu_loader.dart';

import 'horizontal_property_update_controller.dart';
import 'models/property_file_data.dart';

class HorizontalPropertyUpdateSheet
    extends GetWidget<HorizontalPropertyUpdateController> {
  final int propertyId;
  final String controllerTag;

  HorizontalPropertyUpdateSheet({super.key, required this.propertyId})
    : controllerTag = HorizontalPropertyUpdateController.tagFor(propertyId) {
    if (!Get.isRegistered<HorizontalPropertyUpdateController>(
      tag: controllerTag,
    )) {
      Get.put(
        HorizontalPropertyUpdateController(propertyId: propertyId),
        tag: controllerTag,
      );
    }
  }

  @override
  String? get tag => controllerTag;

  @override
  Widget build(BuildContext context) {
    final viewInsets = MediaQuery.of(context).viewInsets.bottom;
    final theme = Theme.of(context);
    final cs = theme.colorScheme;
    final isTablet = ResponsiveHelper.isTablet(context);

    return Padding(
      padding: EdgeInsets.only(bottom: viewInsets),
      child: SafeArea(
        child: FractionallySizedBox(
          heightFactor: 0.92,
          widthFactor: isTablet ? 0.6 : 1.0,
          child: PopScope(
            canPop: true,
            onPopInvokedWithResult: (didPop, result) {
              if (didPop &&
                  Get.isRegistered<HorizontalPropertyUpdateController>(
                    tag: controllerTag,
                  )) {
                Get.delete<HorizontalPropertyUpdateController>(
                  tag: controllerTag,
                );
              }
            },
            child: Scaffold(
              backgroundColor: Colors.transparent,
              body: Container(
                decoration: BoxDecoration(
                  color: cs.surface,
                  borderRadius: const BorderRadius.vertical(
                    top: Radius.circular(28),
                  ),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withValues(alpha: 0.2),
                      blurRadius: 20,
                      offset: const Offset(0, -5),
                    ),
                  ],
                ),
                child: Column(
                  children: [
                    // Handle bar
                    Center(
                      child: Container(
                        margin: const EdgeInsets.only(top: 12, bottom: 8),
                        width: 40,
                        height: 4,
                        decoration: BoxDecoration(
                          color: cs.onSurfaceVariant.withValues(alpha: 0.4),
                          borderRadius: BorderRadius.circular(2),
                        ),
                      ),
                    ),
                    // Header
                    Padding(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 24,
                        vertical: 12,
                      ),
                      child: Row(
                        children: [
                          Container(
                            padding: const EdgeInsets.all(10),
                            decoration: BoxDecoration(
                              color: cs.primaryContainer.withValues(alpha: 0.3),
                              borderRadius: BorderRadius.circular(12),
                            ),
                            child: Icon(
                              Icons.edit_location_alt_outlined,
                              color: cs.primary,
                            ),
                          ),
                          const SizedBox(width: 16),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  'Actualizar Propiedad',
                                  style: theme.textTheme.titleLarge?.copyWith(
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                                Text(
                                  'Modifica los detalles de tu conjunto',
                                  style: theme.textTheme.bodyMedium?.copyWith(
                                    color: cs.onSurfaceVariant,
                                  ),
                                ),
                              ],
                            ),
                          ),
                          IconButton(
                            onPressed: () => Navigator.of(context).pop(),
                            icon: const Icon(Icons.close_rounded),
                            style: IconButton.styleFrom(
                              backgroundColor: cs.surfaceContainerHighest
                                  .withValues(alpha: 0.5),
                            ),
                          ),
                        ],
                      ),
                    ),
                    const Divider(height: 1),
                    // Content
                    Expanded(
                      child: Obx(() {
                        if (controller.isLoading.value) {
                          return const Center(
                            child: RupuLoader(),
                          );
                        }

                        final error = controller.errorMessage.value;
                        if (controller.property.value == null &&
                            error != null) {
                          return _ErrorPlaceholder(
                            message: error,
                            onRetry: controller.loadProperty,
                          );
                        }

                        return Form(
                          key: controller.formKey,
                          child: ListView(
                            physics: const BouncingScrollPhysics(),
                            padding: const EdgeInsets.all(24),
                            children: [
                              if (error != null)
                                Container(
                                  margin: const EdgeInsets.only(bottom: 24),
                                  padding: const EdgeInsets.all(16),
                                  decoration: BoxDecoration(
                                    color: cs.errorContainer.withValues(
                                      alpha: 0.5,
                                    ),
                                    borderRadius: BorderRadius.circular(16),
                                    border: Border.all(
                                      color: cs.error.withValues(alpha: 0.2),
                                    ),
                                  ),
                                  child: Row(
                                    children: [
                                      Icon(
                                        Icons.error_outline_rounded,
                                        color: cs.error,
                                      ),
                                      const SizedBox(width: 12),
                                      Expanded(
                                        child: Text(
                                          error,
                                          style: TextStyle(
                                            color: cs.onErrorContainer,
                                            fontWeight: FontWeight.w500,
                                          ),
                                        ),
                                      ),
                                    ],
                                  ),
                                ),

                              _SectionHeader(
                                title: 'Información General',
                                icon: Icons.info_outline_rounded,
                              ),
                              const SizedBox(height: 16),
                              _StyledContainer(
                                child: Column(
                                  children: [
                                    _TextField(
                                      controller: controller.nameCtrl,
                                      label: 'Nombre de la propiedad',
                                      hint: 'Ej. Edificio Altavista',
                                      prefixIcon: Icons.business_rounded,
                                      validator: (v) =>
                                          (v == null || v.trim().isEmpty)
                                          ? 'El nombre es obligatorio'
                                          : null,
                                    ),
                                    const SizedBox(height: 16),
                                    _TextField(
                                      controller: controller.codeCtrl,
                                      label: 'Código único',
                                      hint: 'Código identificador',
                                      prefixIcon: Icons.qr_code_rounded,
                                    ),
                                    const SizedBox(height: 16),
                                    _TextField(
                                      controller: controller.addressCtrl,
                                      label: 'Dirección',
                                      hint: 'Dirección física',
                                      prefixIcon: Icons.location_on_outlined,
                                      validator: (v) =>
                                          (v == null || v.trim().isEmpty)
                                          ? 'La dirección es obligatoria'
                                          : null,
                                    ),
                                    const SizedBox(height: 16),
                                    _TextField(
                                      controller: controller.descriptionCtrl,
                                      label: 'Descripción',
                                      hint: 'Breve descripción...',
                                      maxLines: 3,
                                      prefixIcon: Icons.description_outlined,
                                    ),
                                  ],
                                ),
                              ),

                              const SizedBox(height: 24),
                              _SectionHeader(
                                title: 'Detalles y Amenidades',
                                icon: Icons.category_outlined,
                              ),
                              const SizedBox(height: 16),
                              _StyledContainer(
                                child: Column(
                                  children: [
                                    Row(
                                      children: [
                                        Expanded(
                                          child: _TextField(
                                            controller:
                                                controller.totalUnitsCtrl,
                                            label: 'Unidades',
                                            hint: '0',
                                            keyboardType: TextInputType.number,
                                            prefixIcon:
                                                Icons.home_work_outlined,
                                          ),
                                        ),
                                        const SizedBox(width: 16),
                                        Expanded(
                                          child: _TextField(
                                            controller:
                                                controller.totalFloorsCtrl,
                                            label: 'Pisos',
                                            hint: '0',
                                            keyboardType: TextInputType.number,
                                            prefixIcon: Icons.layers_outlined,
                                          ),
                                        ),
                                      ],
                                    ),
                                    const SizedBox(height: 16),
                                    _TextField(
                                      controller: controller.timezoneCtrl,
                                      label: 'Zona Horaria',
                                      prefixIcon: Icons.schedule_rounded,
                                    ),
                                    const SizedBox(height: 16),
                                    Divider(
                                      color: cs.outlineVariant.withValues(
                                        alpha: 0.5,
                                      ),
                                    ),
                                    _BoolTile(
                                      title: 'Ascensor',
                                      icon: Icons.elevator_outlined,
                                      value: controller.hasElevator,
                                    ),
                                    _BoolTile(
                                      title: 'Parqueadero',
                                      icon: Icons.local_parking_rounded,
                                      value: controller.hasParking,
                                    ),
                                    _BoolTile(
                                      title: 'Piscina',
                                      icon: Icons.pool_rounded,
                                      value: controller.hasPool,
                                    ),
                                    _BoolTile(
                                      title: 'Gimnasio',
                                      icon: Icons.fitness_center_rounded,
                                      value: controller.hasGym,
                                    ),
                                    _BoolTile(
                                      title: 'Área Social',
                                      icon: Icons.deck_outlined,
                                      value: controller.hasSocialArea,
                                    ),
                                  ],
                                ),
                              ),

                              const SizedBox(height: 24),
                              _SectionHeader(
                                title: 'Personalización',
                                icon: Icons.palette_outlined,
                              ),
                              const SizedBox(height: 16),
                              _StyledContainer(
                                child: Column(
                                  children: [
                                    _ColorWheelField(
                                      label: 'Color Primario',
                                      controller: controller.primaryColorCtrl,
                                      color: controller.primaryColor,
                                      onColorChanged:
                                          controller.setPrimaryColor,
                                    ),
                                    const SizedBox(height: 16),
                                    _ColorWheelField(
                                      label: 'Color Secundario',
                                      controller: controller.secondaryColorCtrl,
                                      color: controller.secondaryColor,
                                      onColorChanged:
                                          controller.setSecondaryColor,
                                    ),
                                    const SizedBox(height: 16),
                                    _ColorWheelField(
                                      label: 'Color Terciario',
                                      controller: controller.tertiaryColorCtrl,
                                      color: controller.tertiaryColor,
                                      onColorChanged:
                                          controller.setTertiaryColor,
                                    ),
                                    const SizedBox(height: 16),
                                    _ColorWheelField(
                                      label: 'Color Cuaternario',
                                      controller:
                                          controller.quaternaryColorCtrl,
                                      color: controller.quaternaryColor,
                                      onColorChanged:
                                          controller.setQuaternaryColor,
                                    ),
                                    const SizedBox(height: 24),
                                    _TextField(
                                      controller: controller.customDomainCtrl,
                                      label: 'Dominio Personalizado',
                                      hint: 'ejemplo.com',
                                      prefixIcon: Icons.public_rounded,
                                    ),
                                  ],
                                ),
                              ),

                              const SizedBox(height: 24),
                              _SectionHeader(
                                title: 'Recursos',
                                icon: Icons.image_outlined,
                              ),
                              const SizedBox(height: 16),
                              _StyledContainer(
                                child: Column(
                                  children: [
                                    _FilePickerTile(
                                      title: 'Logo de la Propiedad',
                                      currentUrl: controller.logoUrl,
                                      isClearing: controller.clearLogo,
                                      file: controller.logoFile,
                                      isProcessing: controller.logoProcessing,
                                      onPick: controller.pickLogo,
                                      onRemoveFile: controller.removeLogoFile,
                                      onClearExisting:
                                          controller.clearExistingLogo,
                                      onRestoreExisting:
                                          controller.restoreExistingLogo,
                                      formatSize: controller.formatFileSize,
                                    ),
                                    const SizedBox(height: 16),
                                    Divider(
                                      color: cs.outlineVariant.withValues(
                                        alpha: 0.5,
                                      ),
                                    ),
                                    const SizedBox(height: 16),
                                    _FilePickerTile(
                                      title: 'Imagen del Navbar',
                                      currentUrl: controller.navbarUrl,
                                      isClearing: controller.clearNavbarImage,
                                      file: controller.navbarImageFile,
                                      isProcessing: controller.navbarProcessing,
                                      onPick: controller.pickNavbarImage,
                                      onRemoveFile:
                                          controller.removeNavbarImageFile,
                                      onClearExisting:
                                          controller.clearExistingNavbarImage,
                                      onRestoreExisting:
                                          controller.restoreExistingNavbarImage,
                                      formatSize: controller.formatFileSize,
                                    ),
                                  ],
                                ),
                              ),

                              const SizedBox(height: 24),
                              _StyledContainer(
                                color: cs.primaryContainer.withValues(
                                  alpha: 0.3,
                                ),
                                child: Obx(
                                  () => SwitchListTile.adaptive(
                                    contentPadding: const EdgeInsets.symmetric(
                                      horizontal: 8,
                                    ),
                                    title: const Text(
                                      'Propiedad Activa',
                                      style: TextStyle(
                                        fontWeight: FontWeight.w600,
                                      ),
                                    ),
                                    subtitle: const Text(
                                      'Habilitar acceso a usuarios',
                                    ),
                                    value: controller.isActive.value,
                                    onChanged: (v) =>
                                        controller.isActive.value = v,
                                    secondary: Icon(
                                      Icons.verified_user_outlined,
                                      color: cs.primary,
                                    ),
                                  ),
                                ),
                              ),

                              const SizedBox(height: 32),
                              Row(
                                children: [
                                  Expanded(
                                    child: Obx(
                                      () => OutlinedButton(
                                        onPressed: controller.isSaving.value
                                            ? null
                                            : () {
                                                if (Get.isRegistered<
                                                  HorizontalPropertyUpdateController
                                                >(tag: controllerTag)) {
                                                  Get.delete<
                                                    HorizontalPropertyUpdateController
                                                  >(tag: controllerTag);
                                                }
                                                Navigator.of(context).pop();
                                              },
                                        style: OutlinedButton.styleFrom(
                                          padding: const EdgeInsets.symmetric(
                                            vertical: 16,
                                          ),
                                          shape: RoundedRectangleBorder(
                                            borderRadius: BorderRadius.circular(
                                              16,
                                            ),
                                          ),
                                        ),
                                        child: const Text('Cancelar'),
                                      ),
                                    ),
                                  ),
                                  const SizedBox(width: 16),
                                  Expanded(
                                    child: Obx(
                                      () => FilledButton(
                                        onPressed: controller.isSaving.value
                                            ? null
                                            : () async {
                                                final result = await controller
                                                    .submit();
                                                if (!context.mounted ||
                                                    result == null) {
                                                  return;
                                                }
                                                if (result.success) {
                                                  if (Get.isRegistered<
                                                    HorizontalPropertyUpdateController
                                                  >(tag: controllerTag)) {
                                                    Get.delete<
                                                      HorizontalPropertyUpdateController
                                                    >(tag: controllerTag);
                                                  }
                                                  Navigator.of(
                                                    context,
                                                  ).pop(result);
                                                } else if (result.message !=
                                                    null) {
                                                  ScaffoldMessenger.of(
                                                    context,
                                                  ).showSnackBar(
                                                    SnackBar(
                                                      content: Text(
                                                        result.message!,
                                                      ),
                                                      behavior: SnackBarBehavior
                                                          .floating,
                                                      backgroundColor: cs.error,
                                                    ),
                                                  );
                                                }
                                              },
                                        style: FilledButton.styleFrom(
                                          padding: const EdgeInsets.symmetric(
                                            vertical: 16,
                                          ),
                                          shape: RoundedRectangleBorder(
                                            borderRadius: BorderRadius.circular(
                                              16,
                                            ),
                                          ),
                                        ),
                                        child: controller.isSaving.value
                                            ? SizedBox(
                                                height: 20,
                                                width: 20,
                                                child:
                                                    CircularProgressIndicator(
                                                      strokeWidth: 2,
                                                      color: cs.onPrimary,
                                                    ),
                                              )
                                            : const Text(
                                                'Guardar Cambios',
                                                style: TextStyle(
                                                  fontWeight: FontWeight.bold,
                                                ),
                                              ),
                                      ),
                                    ),
                                  ),
                                ],
                              ),
                              const SizedBox(height: 24),
                            ],
                          ),
                        );
                      }),
                    ),
                  ],
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}

// ─────────────────────────────────────────────
// Reusables
// ─────────────────────────────────────────────

class _SectionHeader extends StatelessWidget {
  final String title;
  final IconData icon;

  const _SectionHeader({required this.title, required this.icon});

  @override
  Widget build(BuildContext context) {
    final cs = Theme.of(context).colorScheme;
    return Row(
      children: [
        Icon(icon, size: 20, color: cs.primary),
        const SizedBox(width: 8),
        Text(
          title,
          style: TextStyle(
            fontSize: 16,
            fontWeight: FontWeight.bold,
            color: cs.onSurface,
          ),
        ),
      ],
    );
  }
}

class _StyledContainer extends StatelessWidget {
  final Widget child;
  final Color? color;

  const _StyledContainer({required this.child, this.color});

  @override
  Widget build(BuildContext context) {
    final cs = Theme.of(context).colorScheme;
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: color ?? cs.surfaceContainerHighest.withValues(alpha: 0.3),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: cs.outlineVariant.withValues(alpha: 0.3)),
      ),
      child: child,
    );
  }
}

class _TextField extends StatelessWidget {
  const _TextField({
    required this.controller,
    required this.label,
    this.hint,
    this.maxLines = 1,
    this.keyboardType,
    this.validator,
    this.prefixIcon,
  });

  final TextEditingController controller;
  final String label;
  final String? hint;
  final int maxLines;
  final TextInputType? keyboardType;
  final String? Function(String?)? validator;
  final IconData? prefixIcon;

  @override
  Widget build(BuildContext context) {
    return TextFormField(
      controller: controller,
      maxLines: maxLines,
      keyboardType: keyboardType,
      validator: validator,
      style: const TextStyle(fontSize: 15),
      decoration: InputDecoration(
        labelText: label,
        hintText: hint,
        prefixIcon: prefixIcon != null ? Icon(prefixIcon, size: 22) : null,
        filled: true,
        fillColor: Theme.of(context).colorScheme.surface,
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: BorderSide.none,
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: BorderSide.none,
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: BorderSide(
            color: Theme.of(context).colorScheme.primary,
            width: 1.5,
          ),
        ),
        contentPadding: const EdgeInsets.symmetric(
          horizontal: 16,
          vertical: 14,
        ),
      ),
    );
  }
}

class _BoolTile extends StatelessWidget {
  const _BoolTile({
    required this.title,
    required this.value,
    required this.icon,
  });
  final String title;
  final RxBool value;
  final IconData icon;

  @override
  Widget build(BuildContext context) {
    final cs = Theme.of(context).colorScheme;
    return Obx(
      () => SwitchListTile.adaptive(
        contentPadding: EdgeInsets.zero,
        title: Row(
          children: [
            Icon(icon, size: 20, color: cs.onSurfaceVariant),
            const SizedBox(width: 12),
            Text(title, style: const TextStyle(fontSize: 15)),
          ],
        ),
        value: value.value,
        onChanged: (v) => value.value = v,
        activeThumbColor: cs.primary,
      ),
    );
  }
}

class _ColorWheelField extends StatelessWidget {
  const _ColorWheelField({
    required this.label,
    required this.controller,
    required this.color,
    required this.onColorChanged,
  });

  final String label;
  final TextEditingController controller;
  final Rx<Color> color;
  final ValueChanged<Color> onColorChanged;

  @override
  Widget build(BuildContext context) {
    final cs = Theme.of(context).colorScheme;
    final tt = Theme.of(context).textTheme;

    return Obx(() {
      final current = color.value;
      return Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                width: 24,
                height: 24,
                decoration: BoxDecoration(
                  color: current,
                  shape: BoxShape.circle,
                  border: Border.all(color: cs.outlineVariant, width: 2),
                ),
              ),
              const SizedBox(width: 10),
              Text(
                label,
                style: tt.titleSmall!.copyWith(fontWeight: FontWeight.w700),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Row(
            children: [
              Expanded(
                child: TextFormField(
                  controller: controller,
                  style: const TextStyle(
                    fontFamily: 'monospace',
                    fontWeight: FontWeight.w600,
                  ),
                  decoration: InputDecoration(
                    prefixText: '# ',
                    hintText: 'RRGGBB',
                    filled: true,
                    fillColor: cs.surface,
                    contentPadding: const EdgeInsets.symmetric(
                      horizontal: 16,
                      vertical: 12,
                    ),
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                      borderSide: BorderSide.none,
                    ),
                  ),
                  onChanged: (v) {
                    final parsed = _parse(v);
                    if (parsed != null) {
                      onColorChanged(parsed);
                    }
                  },
                ),
              ),
              const SizedBox(width: 12),
              IconButton.filledTonal(
                onPressed: () async {
                  final picked = await _openWheelPicker(context, current);
                  if (picked != null) {
                    onColorChanged(picked);
                  }
                },
                icon: const Icon(Icons.colorize_rounded),
                tooltip: 'Seleccionar color',
              ),
            ],
          ),
        ],
      );
    });
  }

  Future<Color?> _openWheelPicker(BuildContext context, Color base) async {
    final theme = Theme.of(context);
    final cs = theme.colorScheme;
    Color temp = base;

    return showDialog<Color>(
      context: context,
      builder: (ctx) {
        return AlertDialog(
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(24),
          ),
          titlePadding: const EdgeInsets.fromLTRB(24, 24, 24, 0),
          contentPadding: const EdgeInsets.fromLTRB(24, 16, 24, 0),
          actionsPadding: const EdgeInsets.fromLTRB(24, 16, 24, 24),
          title: Row(
            children: [
              Icon(Icons.palette_rounded, color: cs.primary),
              const SizedBox(width: 12),
              Text(
                'Seleccionar Color',
                style: theme.textTheme.titleMedium?.copyWith(
                  fontWeight: FontWeight.bold,
                ),
              ),
            ],
          ),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              ColorPicker(
                color: temp,
                onColorChanged: (c) => temp = c,
                pickersEnabled: const <ColorPickerType, bool>{
                  ColorPickerType.wheel: true,
                  ColorPickerType.accent: false,
                  ColorPickerType.primary: false,
                  ColorPickerType.both: false,
                },
                wheelDiameter: 200,
                wheelHasBorder: true,
                width: 32,
                height: 36,
                hasBorder: true,
                showColorName: false,
                showColorCode: true,
                colorCodeHasColor: true,
                colorCodeReadOnly: false,
                enableShadesSelection: true,
                materialNameTextStyle: theme.textTheme.labelSmall?.copyWith(
                  color: cs.onSurfaceVariant,
                ),
                colorCodeTextStyle: theme.textTheme.labelMedium,
                heading: const SizedBox.shrink(),
                subheading: const SizedBox.shrink(),
              ),
            ],
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.of(ctx).pop(null),
              child: const Text('Cancelar'),
            ),
            FilledButton(
              onPressed: () => Navigator.of(ctx).pop(temp),
              child: const Text('Usar Color'),
            ),
          ],
        );
      },
    );
  }

  Color? _parse(String raw) {
    final v = raw.trim().replaceAll('#', '');
    if (v.length != 6) return null;
    final int? n = int.tryParse(v, radix: 16);
    if (n == null) return null;
    return Color(0xFF000000 | n);
  }
}

class _ErrorPlaceholder extends StatelessWidget {
  final String message;
  final Future<void> Function()? onRetry;
  const _ErrorPlaceholder({required this.message, this.onRetry});

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(
              Icons.error_outline_rounded,
              size: 48,
              color: Theme.of(context).colorScheme.error,
            ),
            const SizedBox(height: 16),
            Text(
              message,
              textAlign: TextAlign.center,
              style: Theme.of(context).textTheme.bodyLarge,
            ),
            const SizedBox(height: 24),
            if (onRetry != null)
              FilledButton.icon(
                onPressed: onRetry,
                icon: const Icon(Icons.refresh_rounded),
                label: const Text('Reintentar'),
              ),
          ],
        ),
      ),
    );
  }
}

class _FilePickerTile extends StatelessWidget {
  final String title;
  final RxnString currentUrl;
  final RxBool isClearing;
  final Rxn<PropertyFileData> file;
  final RxBool isProcessing;
  final Future<void> Function() onPick;
  final VoidCallback onRemoveFile;
  final VoidCallback onClearExisting;
  final VoidCallback onRestoreExisting;
  final String Function(int) formatSize;

  const _FilePickerTile({
    required this.title,
    required this.currentUrl,
    required this.isClearing,
    required this.file,
    required this.isProcessing,
    required this.onPick,
    required this.onRemoveFile,
    required this.onClearExisting,
    required this.onRestoreExisting,
    required this.formatSize,
  });

  @override
  Widget build(BuildContext context) {
    final cs = Theme.of(context).colorScheme;
    return Obx(() {
      final processing = isProcessing.value;
      final fileValue = file.value;
      final urlValue = currentUrl.value;
      final hasUrl = urlValue != null && urlValue.isNotEmpty;
      final clearing = isClearing.value;

      return Container(
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: cs.surface,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: cs.outlineVariant.withValues(alpha: 0.5)),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Icon(
                  Icons.insert_drive_file_outlined,
                  size: 20,
                  color: cs.primary,
                ),
                const SizedBox(width: 8),
                Text(
                  title,
                  style: const TextStyle(fontWeight: FontWeight.w600),
                ),
              ],
            ),
            const SizedBox(height: 12),
            Row(
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      if (processing)
                        Row(
                          children: [
                            SizedBox(
                              width: 16,
                              height: 16,
                              child: CircularProgressIndicator(
                                strokeWidth: 2,
                                color: cs.primary,
                              ),
                            ),
                            const SizedBox(width: 8),
                            const Text(
                              'Procesando...',
                              style: TextStyle(fontSize: 13),
                            ),
                          ],
                        )
                      else if (fileValue != null)
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              fileValue.fileName,
                              style: const TextStyle(
                                fontWeight: FontWeight.bold,
                                fontSize: 13,
                              ),
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                            ),
                            Text(
                              formatSize(fileValue.sizeInBytes),
                              style: TextStyle(
                                color: cs.onSurfaceVariant,
                                fontSize: 12,
                              ),
                            ),
                          ],
                        )
                      else if (clearing)
                        Text(
                          'Se eliminará la imagen actual',
                          style: TextStyle(
                            color: cs.error,
                            fontSize: 13,
                            fontStyle: FontStyle.italic,
                          ),
                        )
                      else if (hasUrl)
                        Row(
                          children: [
                            Icon(
                              Icons.check_circle_outline,
                              size: 16,
                              color: cs.tertiary,
                            ),
                            const SizedBox(width: 6),
                            Expanded(
                              child: Text(
                                'Imagen actual cargada',
                                style: TextStyle(
                                  color: cs.tertiary,
                                  fontSize: 13,
                                ),
                              ),
                            ),
                          ],
                        )
                      else
                        Text(
                          'Ningún archivo seleccionado',
                          style: TextStyle(
                            color: cs.onSurfaceVariant,
                            fontSize: 13,
                          ),
                        ),
                    ],
                  ),
                ),
                const SizedBox(width: 8),
                if (!processing) ...[
                  if (fileValue != null)
                    IconButton(
                      tooltip: 'Quitar archivo',
                      onPressed: onRemoveFile,
                      icon: const Icon(Icons.close_rounded),
                      style: IconButton.styleFrom(
                        backgroundColor: cs.errorContainer,
                        foregroundColor: cs.error,
                      ),
                    ),
                  if (hasUrl && !clearing && fileValue == null)
                    IconButton(
                      tooltip: 'Eliminar imagen actual',
                      onPressed: onClearExisting,
                      icon: const Icon(Icons.delete_outline_rounded),
                      style: IconButton.styleFrom(
                        backgroundColor: cs.surfaceContainerHighest,
                      ),
                    ),
                  if (clearing)
                    IconButton(
                      tooltip: 'Deshacer',
                      onPressed: onRestoreExisting,
                      icon: const Icon(Icons.undo_rounded),
                      style: IconButton.styleFrom(
                        backgroundColor: cs.tertiaryContainer,
                        foregroundColor: cs.tertiary,
                      ),
                    ),
                  IconButton(
                    tooltip: 'Subir archivo',
                    onPressed: onPick,
                    icon: const Icon(Icons.upload_file_rounded),
                    style: IconButton.styleFrom(
                      backgroundColor: cs.primaryContainer,
                      foregroundColor: cs.primary,
                    ),
                  ),
                ],
              ],
            ),
          ],
        ),
      );
    });
  }
}
