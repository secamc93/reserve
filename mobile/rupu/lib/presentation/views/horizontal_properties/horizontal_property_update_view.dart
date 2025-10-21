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
  late final HorizontalPropertyUpdateController _controller;

  static const _colorPalette = <String>[
    '#0F172A',
    '#2563EB',
    '#7C3AED',
    '#DB2777',
    '#EA580C',
    '#059669',
    '#14B8A6',
    '#6366F1',
    '#F97316',
    '#0EA5E9',
    '#9333EA',
    '#E11D48',
    '#F59E0B',
    '#22C55E',
    '#84CC16',
    '#A855F7',
    '#F973AB',
    '#2DD4BF',
  ];

  @override
  void initState() {
    super.initState();
    _tag = HorizontalPropertyUpdateController.tagFor(widget.propertyId);
    _controller = Get.put(
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

    return Padding(
      padding: EdgeInsets.only(bottom: viewInsets),
      child: SafeArea(
        child: FractionallySizedBox(
          heightFactor: 0.9,
          child: Scaffold(
            backgroundColor: theme.colorScheme.surface,
            appBar: AppBar(
              title: const Text('Actualizar propiedad horizontal'),
            ),
            body: Obx(() {
              if (_controller.isLoading.value) {
                return const Center(child: CircularProgressIndicator());
              }

              final error = _controller.errorMessage.value;
              if (_controller.property.value == null && error != null) {
                return _ErrorPlaceholder(
                  message: error,
                  onRetry: _controller.loadProperty,
                );
              }

              return Form(
                key: _controller.formKey,
                child: SingleChildScrollView(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      if (error != null)
                        Padding(
                          padding: const EdgeInsets.only(bottom: 12),
                          child: Text(
                            error,
                            style: theme.textTheme.bodyMedium?.copyWith(
                              color: theme.colorScheme.error,
                            ),
                          ),
                        ),
                      _buildTextField(
                        controller: _controller.nameCtrl,
                        label: 'Nombre *',
                        validator: (value) =>
                            (value == null || value.trim().isEmpty)
                                ? 'El nombre es obligatorio'
                                : null,
                      ),
                      const SizedBox(height: 12),
                      _buildTextField(
                        controller: _controller.codeCtrl,
                        label: 'Código único',
                      ),
                      const SizedBox(height: 12),
                      _buildTextField(
                        controller: _controller.addressCtrl,
                        label: 'Dirección',
                        validator: (value) =>
                            (value == null || value.trim().isEmpty)
                                ? 'La dirección es obligatoria'
                                : null,
                      ),
                      const SizedBox(height: 12),
                      _buildTextField(
                        controller: _controller.descriptionCtrl,
                        label: 'Descripción',
                        maxLines: 3,
                      ),
                      const SizedBox(height: 12),
                      _buildTextField(
                        controller: _controller.timezoneCtrl,
                        label: 'Zona horaria',
                      ),
                      const SizedBox(height: 12),
                      Row(
                        children: [
                          Expanded(
                            child: _buildTextField(
                              controller: _controller.totalUnitsCtrl,
                              label: 'Total de unidades',
                              keyboardType: TextInputType.number,
                            ),
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            child: _buildTextField(
                              controller: _controller.totalFloorsCtrl,
                              label: 'Total de pisos',
                              keyboardType: TextInputType.number,
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 12),
                      _buildSwitch(
                        title: '¿Tiene ascensor?',
                        valueListenable: _controller.hasElevator,
                      ),
                      _buildSwitch(
                        title: '¿Tiene parqueadero?',
                        valueListenable: _controller.hasParking,
                      ),
                      _buildSwitch(
                        title: '¿Tiene piscina?',
                        valueListenable: _controller.hasPool,
                      ),
                      _buildSwitch(
                        title: '¿Tiene gimnasio?',
                        valueListenable: _controller.hasGym,
                      ),
                      _buildSwitch(
                        title: '¿Tiene área social?',
                        valueListenable: _controller.hasSocialArea,
                      ),
                      const SizedBox(height: 12),
                      _ColorPaletteField(
                        label: 'Color primario',
                        controller: _controller.primaryColorCtrl,
                        palette: _colorPalette,
                      ),
                      const SizedBox(height: 12),
                      _ColorPaletteField(
                        label: 'Color secundario',
                        controller: _controller.secondaryColorCtrl,
                        palette: _colorPalette,
                      ),
                      const SizedBox(height: 12),
                      _ColorPaletteField(
                        label: 'Color terciario',
                        controller: _controller.tertiaryColorCtrl,
                        palette: _colorPalette,
                      ),
                      const SizedBox(height: 12),
                      _ColorPaletteField(
                        label: 'Color cuaternario',
                        controller: _controller.quaternaryColorCtrl,
                        palette: _colorPalette,
                      ),
                      const SizedBox(height: 12),
                      _buildTextField(
                        controller: _controller.customDomainCtrl,
                        label: 'Dominio personalizado',
                      ),
                      const SizedBox(height: 12),
                      Obx(
                        () => SwitchListTile.adaptive(
                          contentPadding: EdgeInsets.zero,
                          title: const Text('Propiedad activa'),
                          value: _controller.isActive.value,
                          onChanged: (value) => _controller.isActive.value = value,
                        ),
                      ),
                      const SizedBox(height: 12),
                      _FilePickerTile(
                        title: 'Logo',
                        currentUrl: _controller.logoUrl,
                        file: _controller.logoFile,
                        isProcessing: _controller.logoProcessing,
                        onPick: _controller.pickLogo,
                        onRemove: _controller.removeLogoFile,
                        formatSize: _controller.formatFileSize,
                      ),
                      const SizedBox(height: 12),
                      _FilePickerTile(
                        title: 'Imagen del navbar',
                        currentUrl: _controller.navbarUrl,
                        file: _controller.navbarImageFile,
                        isProcessing: _controller.navbarProcessing,
                        onPick: _controller.pickNavbarImage,
                        onRemove: _controller.removeNavbarImageFile,
                        formatSize: _controller.formatFileSize,
                      ),
                      const SizedBox(height: 24),
                      Row(
                        children: [
                          Expanded(
                            child: Obx(() {
                              final saving = _controller.isSaving.value;
                              return OutlinedButton(
                                onPressed:
                                    saving ? null : () => Navigator.of(context).pop(),
                                child: const Text('Cancelar'),
                              );
                            }),
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            child: Obx(() {
                              final saving = _controller.isSaving.value;
                              return FilledButton(
                                onPressed: saving
                                    ? null
                                    : () async {
                                        final result =
                                            await _controller.submit();
                                        if (!mounted) return;
                                        if (result == null) return;
                                        if (result.success) {
                                          Navigator.of(context).pop(result);
                                        } else if (result.message != null) {
                                          ScaffoldMessenger.of(context).showSnackBar(
                                            SnackBar(
                                              content: Text(result.message!),
                                            ),
                                          );
                                        }
                                      },
                                child: saving
                                    ? const SizedBox(
                                        height: 20,
                                        width: 20,
                                        child:
                                            CircularProgressIndicator(strokeWidth: 2),
                                      )
                                    : const Text('Actualizar'),
                              );
                            }),
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

  Widget _buildTextField({
    required TextEditingController controller,
    required String label,
    int maxLines = 1,
    TextInputType? keyboardType,
    String? Function(String?)? validator,
  }) {
    return TextFormField(
      controller: controller,
      decoration: InputDecoration(labelText: label),
      keyboardType: keyboardType,
      maxLines: maxLines,
      validator: validator,
    );
  }

  Widget _buildSwitch({
    required String title,
    required RxBool valueListenable,
  }) {
    return Obx(
      () => SwitchListTile.adaptive(
        contentPadding: EdgeInsets.zero,
        title: Text(title),
        value: valueListenable.value,
        onChanged: (value) => valueListenable.value = value,
      ),
    );
  }
}

class _ErrorPlaceholder extends StatelessWidget {
  final String message;
  final Future<void> Function()? onRetry;

  const _ErrorPlaceholder({
    required this.message,
    this.onRetry,
  });

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(
              message,
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 16),
            if (onRetry != null)
              FilledButton(
                onPressed: onRetry,
                child: const Text('Reintentar'),
              ),
          ],
        ),
      ),
    );
  }
}

class _ColorPaletteField extends StatefulWidget {
  final String label;
  final TextEditingController controller;
  final List<String> palette;

  const _ColorPaletteField({
    required this.label,
    required this.controller,
    required this.palette,
  });

  @override
  State<_ColorPaletteField> createState() => _ColorPaletteFieldState();
}

class _ColorPaletteFieldState extends State<_ColorPaletteField> {
  late VoidCallback _listener;

  @override
  void initState() {
    super.initState();
    _listener = () => setState(() {});
    widget.controller.addListener(_listener);
  }

  @override
  void dispose() {
    widget.controller.removeListener(_listener);
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    Color? selectedColor;
    try {
      final value = widget.controller.text.trim();
      if (value.isNotEmpty) {
        selectedColor = _parseColor(value);
      }
    } catch (_) {}

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        TextFormField(
          controller: widget.controller,
          decoration: InputDecoration(labelText: widget.label),
        ),
        const SizedBox(height: 8),
        Wrap(
          spacing: 8,
          runSpacing: 8,
          children: [
            for (final hex in widget.palette)
              _ColorCircle(
                color: _parseColor(hex),
                isSelected: selectedColor != null &&
                    selectedColor.value == _parseColor(hex).value,
                onTap: () => widget.controller.text = hex,
              ),
          ],
        ),
        const SizedBox(height: 4),
        Text(
          'Selecciona un color o ingresa un valor hex (#RRGGBB).',
          style: theme.textTheme.bodySmall?.copyWith(
            color: theme.colorScheme.onSurfaceVariant,
          ),
        ),
      ],
    );
  }

  Color _parseColor(String value) {
    final normalized = value.trim().replaceFirst('#', '');
    final buffer = StringBuffer();
    if (normalized.length == 6) {
      buffer.write('FF');
    }
    buffer.write(normalized);
    return Color(int.tryParse(buffer.toString(), radix: 16) ?? 0xFF000000);
  }
}

class _ColorCircle extends StatelessWidget {
  final Color color;
  final bool isSelected;
  final VoidCallback onTap;

  const _ColorCircle({
    required this.color,
    required this.isSelected,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final borderColor = isSelected
        ? Theme.of(context).colorScheme.primary
        : Colors.transparent;

    return GestureDetector(
      onTap: onTap,
      child: Container(
        width: 32,
        height: 32,
        decoration: BoxDecoration(
          shape: BoxShape.circle,
          color: color,
          border: Border.all(color: borderColor, width: 3),
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

  _FilePickerTile({
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
    return Obx(() {
      final processing = isProcessing.value;
      final fileValue = file.value;

      return ListTile(
        contentPadding: const EdgeInsets.symmetric(horizontal: 12),
        title: Text(title),
        subtitle: processing
            ? const Text('Procesando archivo...')
            : fileValue != null
                ? Text('${fileValue.fileName} • ${formatSize(fileValue.sizeInBytes)}')
                : currentUrl.value != null
                    ? Text('Actual: ${currentUrl.value}')
                    : const Text('Sin archivo seleccionado'),
        trailing: processing
            ? const SizedBox(
                width: 20,
                height: 20,
                child: CircularProgressIndicator(strokeWidth: 2),
              )
            : Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  if (fileValue != null)
                    IconButton(
                      tooltip: 'Quitar archivo',
                      onPressed: onRemove,
                      icon: const Icon(Icons.close),
                    ),
                  IconButton(
                    tooltip: 'Seleccionar archivo',
                    onPressed: processing ? null : onPick,
                    icon: const Icon(Icons.upload_file_outlined),
                  ),
                ],
              ),
      );
    });
  }
}

