// presentation/views/horizontal_property/update/horizontal_property_update_sheet.dart
import 'package:flex_color_picker/flex_color_picker.dart';
import 'package:flutter/material.dart';
import 'package:get/get.dart';

import 'horizontal_property_update_controller.dart';
import 'models/property_file_data.dart';

class HorizontalPropertyUpdateSheet extends StatefulWidget {
  final int propertyId;
  const HorizontalPropertyUpdateSheet({super.key, required this.propertyId});

  @override
  State<HorizontalPropertyUpdateSheet> createState() =>
      _HorizontalPropertyUpdateSheetState();
}

class _HorizontalPropertyUpdateSheetState
    extends State<HorizontalPropertyUpdateSheet> {
  late final String _tag;
  late final HorizontalPropertyUpdateController _c;

  @override
  void initState() {
    super.initState();
    _tag = HorizontalPropertyUpdateController.tagFor(widget.propertyId);
    _c = Get.put(
      HorizontalPropertyUpdateController(propertyId: widget.propertyId),
      tag: _tag,
    );
  }

  @override
  void dispose() {
    if (Get.isRegistered<HorizontalPropertyUpdateController>(tag: _tag)) {
      Get.delete<HorizontalPropertyUpdateController>(tag: _tag);
    }
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final viewInsets = MediaQuery.of(context).viewInsets.bottom;
    final theme = Theme.of(context);
    final cs = theme.colorScheme;

    return Padding(
      padding: EdgeInsets.only(bottom: viewInsets),
      child: SafeArea(
        child: FractionallySizedBox(
          heightFactor: 0.92,
          child: Scaffold(
            // ← no forzamos fondo: respeta el esquema
            backgroundColor: cs.surface,
            appBar: AppBar(
              title: const Text('Actualizar propiedad horizontal'),
              elevation: 0,
              surfaceTintColor: Colors.transparent,
            ),
            body: Obx(() {
              if (_c.isLoading.value) {
                return const Center(child: CircularProgressIndicator());
              }

              final error = _c.errorMessage.value;
              if (_c.property.value == null && error != null) {
                return _ErrorPlaceholder(
                  message: error,
                  onRetry: _c.loadProperty,
                );
              }

              return Form(
                key: _c.formKey,
                child: SingleChildScrollView(
                  physics: const BouncingScrollPhysics(),
                  padding: const EdgeInsets.fromLTRB(16, 14, 16, 24),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      if (error != null)
                        Container(
                          margin: const EdgeInsets.only(bottom: 12),
                          padding: const EdgeInsets.all(12),
                          decoration: BoxDecoration(
                            color: cs.errorContainer,
                            borderRadius: BorderRadius.circular(12),
                            border: Border.all(
                              color: cs.error.withValues(alpha: .2),
                            ),
                          ),
                          child: Text(
                            error,
                            style: TextStyle(color: cs.onErrorContainer),
                          ),
                        ),

                      // ——— Información base
                      _TextField(
                        controller: _c.nameCtrl,
                        label: 'Nombre *',
                        validator: (v) => (v == null || v.trim().isEmpty)
                            ? 'El nombre es obligatorio'
                            : null,
                      ),
                      const SizedBox(height: 12),
                      _TextField(
                        controller: _c.codeCtrl,
                        label: 'Código único',
                      ),
                      const SizedBox(height: 12),
                      _TextField(
                        controller: _c.addressCtrl,
                        label: 'Dirección *',
                        validator: (v) => (v == null || v.trim().isEmpty)
                            ? 'La dirección es obligatoria'
                            : null,
                      ),
                      const SizedBox(height: 12),
                      _TextField(
                        controller: _c.descriptionCtrl,
                        label: 'Descripción',
                        maxLines: 3,
                      ),
                      const SizedBox(height: 12),
                      _TextField(
                        controller: _c.timezoneCtrl,
                        label: 'Zona horaria',
                      ),
                      const SizedBox(height: 12),

                      Row(
                        children: [
                          Expanded(
                            child: _TextField(
                              controller: _c.totalUnitsCtrl,
                              label: 'Total de unidades',
                              keyboardType: TextInputType.number,
                            ),
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            child: _TextField(
                              controller: _c.totalFloorsCtrl,
                              label: 'Total de pisos',
                              keyboardType: TextInputType.number,
                            ),
                          ),
                        ],
                      ),

                      const SizedBox(height: 12),
                      _BoolTile(
                        title: '¿Tiene ascensor?',
                        value: _c.hasElevator,
                      ),
                      _BoolTile(
                        title: '¿Tiene parqueadero?',
                        value: _c.hasParking,
                      ),
                      _BoolTile(title: '¿Tiene piscina?', value: _c.hasPool),
                      _BoolTile(title: '¿Tiene gimnasio?', value: _c.hasGym),
                      _BoolTile(
                        title: '¿Tiene área social?',
                        value: _c.hasSocialArea,
                      ),
                      const SizedBox(height: 8),

                      // ——— Colores (WHEEL + slider)
                      _ColorWheelField(
                        label: 'Color primario',
                        controller: _c.primaryColorCtrl,
                      ),
                      const SizedBox(height: 12),
                      _ColorWheelField(
                        label: 'Color secundario',
                        controller: _c.secondaryColorCtrl,
                      ),
                      const SizedBox(height: 12),
                      _ColorWheelField(
                        label: 'Color terciario',
                        controller: _c.tertiaryColorCtrl,
                      ),
                      const SizedBox(height: 12),
                      _ColorWheelField(
                        label: 'Color cuaternario',
                        controller: _c.quaternaryColorCtrl,
                      ),
                      const SizedBox(height: 12),

                      _TextField(
                        controller: _c.customDomainCtrl,
                        label: 'Dominio personalizado',
                      ),
                      const SizedBox(height: 12),

                      Obx(
                        () => SwitchListTile.adaptive(
                          contentPadding: EdgeInsets.zero,
                          title: const Text('Propiedad activa'),
                          value: _c.isActive.value,
                          onChanged: (v) => _c.isActive.value = v,
                        ),
                      ),

                      const SizedBox(height: 12),
                      _FilePickerTile(
                        title: 'Logo',
                        currentUrl: _c.logoUrl,
                        file: _c.logoFile,
                        isProcessing: _c.logoProcessing,
                        onPick: _c.pickLogo,
                        onRemove: _c.removeLogoFile,
                        formatSize: _c.formatFileSize,
                      ),
                      const SizedBox(height: 12),
                      _FilePickerTile(
                        title: 'Imagen del navbar',
                        currentUrl: _c.navbarUrl,
                        file: _c.navbarImageFile,
                        isProcessing: _c.navbarProcessing,
                        onPick: _c.pickNavbarImage,
                        onRemove: _c.removeNavbarImageFile,
                        formatSize: _c.formatFileSize,
                      ),

                      const SizedBox(height: 22),

                      Row(
                        children: [
                          Expanded(
                            child: Obx(
                              () => OutlinedButton(
                                onPressed: _c.isSaving.value
                                    ? null
                                    : () => Navigator.of(context).pop(),
                                child: const Text('Cancelar'),
                              ),
                            ),
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            child: Obx(
                              () => FilledButton(
                                onPressed: _c.isSaving.value
                                    ? null
                                    : () async {
                                        final result = await _c.submit();
                                        if (!mounted || result == null) return;
                                        if (result.success) {
                                          Navigator.of(context).pop(result);
                                        } else if (result.message != null) {
                                          ScaffoldMessenger.of(
                                            context,
                                          ).showSnackBar(
                                            SnackBar(
                                              content: Text(result.message!),
                                            ),
                                          );
                                        }
                                      },
                                child: _c.isSaving.value
                                    ? const SizedBox(
                                        height: 20,
                                        width: 20,
                                        child: CircularProgressIndicator(
                                          strokeWidth: 2,
                                        ),
                                      )
                                    : const Text('Actualizar'),
                              ),
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              );
            }),
          ),
        ),
      ),
    );
  }
}

// ─────────────────────────────────────────────
// Reusables
// ─────────────────────────────────────────────

class _TextField extends StatelessWidget {
  const _TextField({
    required this.controller,
    required this.label,
    this.maxLines = 1,
    this.keyboardType,
    this.validator,
  });

  final TextEditingController controller;
  final String label;
  final int maxLines;
  final TextInputType? keyboardType;
  final String? Function(String?)? validator;

  @override
  Widget build(BuildContext context) {
    return TextFormField(
      controller: controller,
      maxLines: maxLines,
      keyboardType: keyboardType,
      validator: validator,
      decoration: InputDecoration(labelText: label),
    );
  }
}

class _BoolTile extends StatelessWidget {
  const _BoolTile({required this.title, required this.value});
  final String title;
  final RxBool value;

  @override
  Widget build(BuildContext context) {
    return Obx(
      () => SwitchListTile.adaptive(
        contentPadding: EdgeInsets.zero,
        title: Text(title),
        value: value.value,
        onChanged: (v) => value.value = v,
      ),
    );
  }
}

/// Selector “Color Wheel” estilo premium:
/// - Campo HEX sincronizado (#RRGGBB).
/// - Rueda de color.
/// - Slider de brillo (Value en HSV).
class _ColorWheelField extends StatefulWidget {
  const _ColorWheelField({required this.label, required this.controller});

  final String label;
  final TextEditingController controller;

  @override
  State<_ColorWheelField> createState() => _ColorWheelFieldState();
}

class _ColorWheelFieldState extends State<_ColorWheelField> {
  late Color _current;

  @override
  void initState() {
    super.initState();
    _current = _parse(widget.controller.text) ?? Colors.blue;
  }

  @override
  void didUpdateWidget(covariant _ColorWheelField oldWidget) {
    super.didUpdateWidget(oldWidget);
    final parsed = _parse(widget.controller.text);
    if (parsed != null && parsed != _current) {
      _current = parsed;
    }
  }

  @override
  Widget build(BuildContext context) {
    final cs = Theme.of(context).colorScheme;
    final tt = Theme.of(context).textTheme;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          widget.label,
          style: tt.titleSmall!.copyWith(fontWeight: FontWeight.w800),
        ),
        const SizedBox(height: 8),
        Row(
          children: [
            Expanded(
              child: TextFormField(
                controller: widget.controller,
                decoration: const InputDecoration(
                  prefixText: '# ',
                  labelText: 'HEX (RRGGBB)',
                ),
                onChanged: (v) {
                  final c = _parse(v);
                  if (c != null) setState(() => _current = c);
                },
              ),
            ),
            const SizedBox(width: 10),
            Container(
              width: 40,
              height: 40,
              decoration: BoxDecoration(
                color: _current,
                borderRadius: BorderRadius.circular(8),
                border: Border.all(color: cs.outlineVariant),
              ),
            ),
          ],
        ),
        const SizedBox(height: 10),

        // Color wheel + Brightness slider (en un dialog estilizado)
        OutlinedButton.icon(
          icon: const Icon(Icons.color_lens_outlined),
          label: const Text('Abrir selector'),
          onPressed: () async {
            final picked = await _openWheelPicker(context, _current);
            if (picked != null) {
              setState(() => _current = picked);
              widget.controller.text = _toHex(picked);
            }
          },
        ),
      ],
    );
  }

  Future<Color?> _openWheelPicker(BuildContext context, Color base) async {
    final theme = Theme.of(context);
    final cs = theme.colorScheme;
    Color temp = base;

    return showDialog<Color>(
      context: context,
      builder: (ctx) {
        return AlertDialog(
          titlePadding: const EdgeInsets.fromLTRB(16, 16, 16, 0),
          contentPadding: const EdgeInsets.fromLTRB(16, 12, 16, 0),
          actionsPadding: const EdgeInsets.fromLTRB(16, 0, 16, 12),
          title: Text(
            'Selecciona un color',
            style: theme.textTheme.titleMedium,
          ),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              ColorPicker(
                color: temp,
                onColorChanged: (c) => temp = c,

                // — Wheel puro
                pickersEnabled: const <ColorPickerType, bool>{
                  ColorPickerType.wheel: true,
                  ColorPickerType.accent: false,
                  ColorPickerType.primary: false,
                  ColorPickerType.both: false,
                },

                // Tamaños dentro de los rangos válidos
                wheelDiameter: 220,
                wheelHasBorder: true,

                // wheelBorderColor: cs.outlineVariant,
                width: 32, // 15–150
                height: 36, // 15–150
                // UX
                hasBorder: true,
                showColorName: false,
                showColorCode: true,
                colorCodeHasColor: true,
                colorCodeReadOnly: false,
                enableShadesSelection: true,

                // Tipografías
                materialNameTextStyle: theme.textTheme.labelSmall?.copyWith(
                  color: cs.onSurfaceVariant,
                ),
                colorCodeTextStyle: theme.textTheme.labelMedium,
                heading: const SizedBox.shrink(),
                subheading: const SizedBox.shrink(),
              ),
              const SizedBox(height: 12),
            ],
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.of(ctx).pop(null),
              child: const Text('Cancelar'),
            ),
            FilledButton(
              onPressed: () => Navigator.of(ctx).pop(temp),
              child: const Text('Usar color'),
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

  String _toHex(Color c) =>
      // ignore: deprecated_member_use
      c.value.toRadixString(16).toUpperCase().padLeft(8, '0').substring(2);
}

// ———————————————————— Archivos/errores (tus mismos tiles estilizados) ————————————————————

class _ErrorPlaceholder extends StatelessWidget {
  final String message;
  final Future<void> Function()? onRetry;
  const _ErrorPlaceholder({required this.message, this.onRetry});

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(message, textAlign: TextAlign.center),
            const SizedBox(height: 16),
            if (onRetry != null)
              FilledButton(onPressed: onRetry, child: const Text('Reintentar')),
          ],
        ),
      ),
    );
  }
}

class _FilePickerTile extends StatelessWidget {
  final String title;
  final RxnString currentUrl;
  final Rxn<PropertyFileData> file;
  final RxBool isProcessing;
  final Future<void> Function() onPick;
  final VoidCallback onRemove;
  final String Function(int) formatSize;

  const _FilePickerTile({
    required this.title,
    required this.currentUrl,
    required this.file,
    required this.isProcessing,
    required this.onPick,
    required this.onRemove,
    required this.formatSize,
  });

  @override
  Widget build(BuildContext context) {
    final cs = Theme.of(context).colorScheme;
    return Obx(() {
      final processing = isProcessing.value;
      final fileValue = file.value;

      return Container(
        margin: const EdgeInsets.only(top: 4),
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
        decoration: BoxDecoration(
          color: cs.surface,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: cs.outlineVariant),
        ),
        child: Row(
          children: [
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(title, style: Theme.of(context).textTheme.titleSmall),
                  const SizedBox(height: 4),
                  if (processing)
                    const Text('Procesando archivo...')
                  else if (fileValue != null)
                    Text(
                      '${fileValue.fileName} • ${formatSize(fileValue.sizeInBytes)}',
                    )
                  else if (currentUrl.value != null)
                    Text('Actual: ${currentUrl.value}')
                  else
                    const Text('Sin archivo seleccionado'),
                ],
              ),
            ),
            const SizedBox(width: 8),
            if (processing)
              const SizedBox(
                width: 22,
                height: 22,
                child: CircularProgressIndicator(strokeWidth: 2),
              )
            else ...[
              if (fileValue != null)
                IconButton(
                  tooltip: 'Quitar archivo',
                  onPressed: onRemove,
                  icon: const Icon(Icons.close),
                ),
              IconButton(
                tooltip: 'Seleccionar archivo',
                onPressed: onPick,
                icon: const Icon(Icons.upload_file_outlined),
              ),
            ],
          ],
        ),
      );
    });
  }
}
