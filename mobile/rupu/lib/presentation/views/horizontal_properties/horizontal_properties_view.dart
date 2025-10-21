import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:go_router/go_router.dart';

import 'horizontal_properties_controller.dart';

class HorizontalPropertiesView extends GetView<HorizontalPropertiesController> {
  static const name = 'horizontal-properties';
  final int pageIndex;

  const HorizontalPropertiesView({super.key, required this.pageIndex});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Propiedades horizontales'),
        centerTitle: true,
      ),
      body: SafeArea(
        child: Obx(() {
          if (controller.isLoading.value && controller.properties.isEmpty) {
            return const Center(child: CircularProgressIndicator());
          }

          final error = controller.errorMessage.value;

          return RefreshIndicator(
            onRefresh: controller.fetchProperties,
            child: LayoutBuilder(
              builder: (context, constraints) {
                return SingleChildScrollView(
                  physics: const AlwaysScrollableScrollPhysics(),
                  child: ConstrainedBox(
                    constraints: BoxConstraints(
                      minHeight: constraints.maxHeight,
                    ),
                    child: Padding(
                      padding: const EdgeInsets.all(24),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'Gestión de propiedades Horizontales',
                            style: theme.textTheme.headlineSmall?.copyWith(
                              fontWeight: FontWeight.w700,
                            ),
                          ),
                          const SizedBox(height: 8),
                          Text(
                            'Propiedades horizontales: ${controller.total.value}',
                            style: theme.textTheme.titleMedium,
                          ),
                          const SizedBox(height: 16),
                          Row(
                            children: [
                              FilledButton.icon(
                                onPressed: () =>
                                    _showCreatePropertyDialog(context),
                                icon: const Icon(Icons.add_home_work_outlined),
                                label: const Text('Agregar Propiedad'),
                              ),
                              if (controller.isLoading.value) ...[
                                const SizedBox(width: 16),
                                const SizedBox(
                                  height: 24,
                                  width: 24,
                                  child: CircularProgressIndicator(
                                    strokeWidth: 2,
                                  ),
                                ),
                              ],
                            ],
                          ),
                          const SizedBox(height: 16),
                          if (error != null)
                            Card(
                              color: theme.colorScheme.errorContainer,
                              child: Padding(
                                padding: const EdgeInsets.all(16),
                                child: Row(
                                  children: [
                                    Icon(
                                      Icons.error_outline,
                                      color: theme.colorScheme.onErrorContainer,
                                    ),
                                    const SizedBox(width: 12),
                                    Expanded(
                                      child: Text(
                                        error,
                                        style: theme.textTheme.bodyMedium
                                            ?.copyWith(
                                              color: theme
                                                  .colorScheme
                                                  .onErrorContainer,
                                            ),
                                      ),
                                    ),
                                    IconButton(
                                      tooltip: 'Reintentar',
                                      onPressed: controller.fetchProperties,
                                      icon: const Icon(Icons.refresh),
                                    ),
                                  ],
                                ),
                              ),
                            ),
                          if (error != null) const SizedBox(height: 12),
                          if (controller.properties.isEmpty && error == null)
                            Padding(
                              padding: const EdgeInsets.symmetric(vertical: 48),
                              child: Column(
                                mainAxisSize: MainAxisSize.min,
                                children: const [
                                  Icon(Icons.apartment_outlined, size: 48),
                                  SizedBox(height: 12),
                                  Text(
                                    'No se encontraron propiedades horizontales.',
                                  ),
                                ],
                              ),
                            )
                          else if (controller.properties.isNotEmpty)
                            Card(
                              clipBehavior: Clip.antiAlias,
                              child: SingleChildScrollView(
                                scrollDirection: Axis.vertical,
                                child: SingleChildScrollView(
                                  scrollDirection: Axis.horizontal,
                                  child: ConstrainedBox(
                                    constraints: const BoxConstraints(
                                      minWidth: 900,
                                    ),
                                    child: DataTable(
                                      headingRowColor:
                                          MaterialStateProperty.all(
                                            theme.colorScheme.surfaceVariant,
                                          ),
                                      columns: const [
                                        DataColumn(label: Text('ID')),
                                        DataColumn(label: Text('Nombre')),
                                        DataColumn(label: Text('Dirección')),
                                        DataColumn(label: Text('Unidades')),
                                        DataColumn(label: Text('Estado')),
                                        DataColumn(
                                          label: Text('Fecha creación'),
                                        ),
                                        DataColumn(label: Text('Acciones')),
                                      ],
                                      rows: controller.properties.map((
                                        property,
                                      ) {
                                        final isDeleting = controller
                                            .isDeleting(property.id);
                                        return DataRow(
                                          cells: [
                                            DataCell(Text('${property.id}')),
                                            DataCell(Text(property.name)),
                                            DataCell(
                                              Text(
                                                property.address?.isNotEmpty ==
                                                        true
                                                    ? property.address!
                                                    : 'Sin dirección',
                                              ),
                                            ),
                                            DataCell(
                                              Text(
                                                property.totalUnits
                                                        ?.toString() ??
                                                    'N/A',
                                              ),
                                            ),
                                            DataCell(
                                              Chip(
                                                label: Text(
                                                  property.isActive
                                                      ? 'Activo'
                                                      : 'Inactivo',
                                                ),
                                                backgroundColor:
                                                    property.isActive
                                                    ? theme
                                                          .colorScheme
                                                          .secondaryContainer
                                                    : theme
                                                          .colorScheme
                                                          .errorContainer,
                                                labelStyle: theme
                                                    .textTheme
                                                    .labelMedium
                                                    ?.copyWith(
                                                      color: property.isActive
                                                          ? theme
                                                                .colorScheme
                                                                .onSecondaryContainer
                                                          : theme
                                                                .colorScheme
                                                                .onErrorContainer,
                                                    ),
                                              ),
                                            ),
                                            DataCell(
                                              Text(
                                                controller.formatDate(
                                                  property.createdAt,
                                                ),
                                              ),
                                            ),
                                            DataCell(
                                              Row(
                                                mainAxisSize: MainAxisSize.min,
                                                children: [
                                                  IconButton(
                                                    tooltip: 'Ver',
                                                    onPressed: () {
                                                      final path =
                                                          '/home/$pageIndex/horizontal-properties/${property.id}';
                                                      context.push(path);
                                                    },
                                                    icon: const Icon(
                                                      Icons.visibility_outlined,
                                                    ),
                                                  ),
                                                  IconButton(
                                                    tooltip: 'Eliminar',
                                                    onPressed: () async {
                                                      if (controller.isDeleting(
                                                        property.id,
                                                      )) {
                                                        return;
                                                      }

                                                      final confirmed = await showDialog<bool>(
                                                        context: context,
                                                        builder: (dialogCtx) {
                                                          return AlertDialog(
                                                            title: const Text(
                                                              'Confirmar eliminación',
                                                            ),
                                                            content: Text(
                                                              '¿Está seguro de eliminar "${property.name}"? Esta acción no se puede deshacer.',
                                                            ),
                                                            actions: [
                                                              TextButton(
                                                                onPressed: () =>
                                                                    Navigator.of(
                                                                      dialogCtx,
                                                                    ).pop(
                                                                      false,
                                                                    ),
                                                                child:
                                                                    const Text(
                                                                      'Cancelar',
                                                                    ),
                                                              ),
                                                              FilledButton(
                                                                onPressed: () =>
                                                                    Navigator.of(
                                                                      dialogCtx,
                                                                    ).pop(true),
                                                                child:
                                                                    const Text(
                                                                      'Eliminar',
                                                                    ),
                                                              ),
                                                            ],
                                                          );
                                                        },
                                                      );

                                                      if (confirmed != true) {
                                                        return;
                                                      }

                                                      final result =
                                                          await controller
                                                              .deleteProperty(
                                                                id: property.id,
                                                              );

                                                      ScaffoldMessenger.of(
                                                        context,
                                                      ).showSnackBar(
                                                        SnackBar(
                                                          content: Text(
                                                            result.message ??
                                                                (result.success
                                                                    ? 'Propiedad horizontal eliminada exitosamente.'
                                                                    : 'No se pudo eliminar la propiedad horizontal.'),
                                                          ),
                                                          backgroundColor:
                                                              result.success
                                                              ? null
                                                              : theme
                                                                    .colorScheme
                                                                    .error,
                                                        ),
                                                      );
                                                    },
                                                    icon:
                                                        controller.isDeleting(
                                                          property.id,
                                                        )
                                                        ? const SizedBox(
                                                            height: 20,
                                                            width: 20,
                                                            child:
                                                                CircularProgressIndicator(
                                                                  strokeWidth:
                                                                      2,
                                                                ),
                                                          )
                                                        : const Icon(
                                                            Icons
                                                                .delete_outline,
                                                          ),
                                                  ),
                                                  IconButton(
                                                    tooltip: 'Actualizar',
                                                    onPressed: () {
                                                      ScaffoldMessenger.of(
                                                        context,
                                                      ).showSnackBar(
                                                        SnackBar(
                                                          content: Text(
                                                            'Actualizar ${property.name} estará disponible próximamente.',
                                                          ),
                                                        ),
                                                      );
                                                    },
                                                    icon: const Icon(
                                                      Icons.edit_outlined,
                                                    ),
                                                  ),
                                                ],
                                              ),
                                            ),
                                          ],
                                        );
                                      }).toList(),
                                    ),
                                  ),
                                ),
                              ),
                            ),
                          const SizedBox(height: 24),
                        ],
                      ),
                    ),
                  ),
                );
              },
            ),
          );
        }),
      ),
    );
  }

  Future<void> _showCreatePropertyDialog(BuildContext context) async {
    controller.resetCreateForm();
    await showDialog<void>(
      context: context,
      barrierDismissible: false,
      builder: (dialogCtx) {
        final dialogTheme = Theme.of(dialogCtx);
        return Obx(() {
          final isCreating = controller.isCreating.value;
          return AlertDialog(
            title: const Text('Crear nueva propiedad horizontal'),
            content: Form(
              key: controller.createFormKey,
              child: SingleChildScrollView(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Text(
                      'Información básica',
                      style: dialogTheme.textTheme.titleMedium?.copyWith(
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                    const SizedBox(height: 12),
                    TextFormField(
                      controller: controller.createNameCtrl,
                      textCapitalization: TextCapitalization.words,
                      decoration: const InputDecoration(
                        labelText: 'Nombre *',
                        hintText: 'Ingresa el nombre de la propiedad',
                      ),
                      validator: (value) {
                        if (value == null || value.trim().isEmpty) {
                          return 'El nombre es obligatorio';
                        }
                        return null;
                      },
                    ),
                    const SizedBox(height: 12),
                    TextFormField(
                      controller: controller.createAddressCtrl,
                      textCapitalization: TextCapitalization.sentences,
                      decoration: const InputDecoration(
                        labelText: 'Dirección *',
                        hintText: 'Ingresa la dirección de la propiedad',
                      ),
                      validator: (value) {
                        if (value == null || value.trim().isEmpty) {
                          return 'La dirección es obligatoria';
                        }
                        return null;
                      },
                    ),
                    Offstage(
                      offstage: true,
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const SizedBox(height: 12),
                          TextFormField(
                            controller: controller.createCodeCtrl,
                            decoration: const InputDecoration(
                              labelText: 'Código único',
                            ),
                          ),
                          const SizedBox(height: 12),
                          TextFormField(
                            controller: controller.createTimezoneCtrl,
                            decoration: const InputDecoration(
                              labelText: 'Zona horaria',
                            ),
                          ),
                          const SizedBox(height: 12),
                          TextFormField(
                            controller: controller.createDescriptionCtrl,
                            decoration: const InputDecoration(
                              labelText: 'Descripción',
                            ),
                            maxLines: 3,
                          ),
                          const SizedBox(height: 12),
                          TextFormField(
                            controller: controller.createTotalUnitsCtrl,
                            decoration: const InputDecoration(
                              labelText: 'Total de unidades',
                            ),
                            keyboardType: TextInputType.number,
                          ),
                          const SizedBox(height: 12),
                          TextFormField(
                            controller: controller.createTotalFloorsCtrl,
                            decoration: const InputDecoration(
                              labelText: 'Total de pisos',
                            ),
                            keyboardType: TextInputType.number,
                          ),
                          const SizedBox(height: 12),
                          Obx(
                            () => CheckboxListTile(
                              contentPadding: EdgeInsets.zero,
                              title: const Text('Tiene ascensor'),
                              value: controller.hasElevator.value,
                              onChanged: (value) =>
                                  controller.hasElevator.value = value ?? false,
                            ),
                          ),
                          Obx(
                            () => CheckboxListTile(
                              contentPadding: EdgeInsets.zero,
                              title: const Text('Tiene parqueadero'),
                              value: controller.hasParking.value,
                              onChanged: (value) =>
                                  controller.hasParking.value = value ?? false,
                            ),
                          ),
                          Obx(
                            () => CheckboxListTile(
                              contentPadding: EdgeInsets.zero,
                              title: const Text('Tiene piscina'),
                              value: controller.hasPool.value,
                              onChanged: (value) =>
                                  controller.hasPool.value = value ?? false,
                            ),
                          ),
                          Obx(
                            () => CheckboxListTile(
                              contentPadding: EdgeInsets.zero,
                              title: const Text('Tiene gimnasio'),
                              value: controller.hasGym.value,
                              onChanged: (value) =>
                                  controller.hasGym.value = value ?? false,
                            ),
                          ),
                          Obx(
                            () => CheckboxListTile(
                              contentPadding: EdgeInsets.zero,
                              title: const Text('Tiene área social'),
                              value: controller.hasSocialArea.value,
                              onChanged: (value) =>
                                  controller.hasSocialArea.value =
                                      value ?? false,
                            ),
                          ),
                          const SizedBox(height: 12),
                          TextFormField(
                            controller: controller.createPrimaryColorCtrl,
                            decoration: const InputDecoration(
                              labelText: 'Color primario',
                            ),
                          ),
                          const SizedBox(height: 12),
                          TextFormField(
                            controller: controller.createSecondaryColorCtrl,
                            decoration: const InputDecoration(
                              labelText: 'Color secundario',
                            ),
                          ),
                          const SizedBox(height: 12),
                          TextFormField(
                            controller: controller.createTertiaryColorCtrl,
                            decoration: const InputDecoration(
                              labelText: 'Color terciario',
                            ),
                          ),
                          const SizedBox(height: 12),
                          TextFormField(
                            controller: controller.createQuaternaryColorCtrl,
                            decoration: const InputDecoration(
                              labelText: 'Color cuaternario',
                            ),
                          ),
                          const SizedBox(height: 12),
                          TextFormField(
                            controller: controller.createCustomDomainCtrl,
                            decoration: const InputDecoration(
                              labelText: 'Dominio personalizado',
                            ),
                          ),
                          const SizedBox(height: 12),
                          Obx(
                            () => CheckboxListTile(
                              contentPadding: EdgeInsets.zero,
                              title: const Text(
                                'Crear unidades automáticamente',
                              ),
                              value: controller.createUnits.value,
                              onChanged: (value) =>
                                  controller.createUnits.value = value ?? false,
                            ),
                          ),
                          const SizedBox(height: 12),
                          TextFormField(
                            controller: controller.createUnitPrefixCtrl,
                            decoration: const InputDecoration(
                              labelText: 'Prefijo unidades',
                            ),
                          ),
                          const SizedBox(height: 12),
                          TextFormField(
                            controller: controller.createUnitTypeCtrl,
                            decoration: const InputDecoration(
                              labelText: 'Tipo unidad',
                            ),
                          ),
                          const SizedBox(height: 12),
                          TextFormField(
                            controller: controller.createUnitsPerFloorCtrl,
                            decoration: const InputDecoration(
                              labelText: 'Unidades por piso',
                            ),
                            keyboardType: TextInputType.number,
                          ),
                          const SizedBox(height: 12),
                          TextFormField(
                            controller: controller.createStartUnitNumberCtrl,
                            decoration: const InputDecoration(
                              labelText: 'Número inicial',
                            ),
                            keyboardType: TextInputType.number,
                          ),
                          const SizedBox(height: 12),
                          Obx(
                            () => CheckboxListTile(
                              contentPadding: EdgeInsets.zero,
                              title: const Text('Crear comités requeridos'),
                              value: controller.createRequiredCommittees.value,
                              onChanged: (value) =>
                                  controller.createRequiredCommittees.value =
                                      value ?? false,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ),
            actions: [
              TextButton(
                onPressed: isCreating
                    ? null
                    : () {
                        controller.resetCreateForm();
                        Navigator.of(dialogCtx).pop();
                      },
                child: const Text('Cancelar'),
              ),
              FilledButton(
                onPressed: isCreating
                    ? null
                    : () async {
                        FocusScope.of(dialogCtx).unfocus();
                        final result = await controller.createProperty();
                        final messenger = ScaffoldMessenger.of(context);
                        if (result.success) {
                          Navigator.of(dialogCtx).pop();
                          messenger.showSnackBar(
                            SnackBar(
                              content: Text(
                                result.message ??
                                    'Propiedad horizontal creada exitosamente.',
                              ),
                            ),
                          );
                        } else {
                          final message = result.message?.isNotEmpty == true
                              ? result.message!
                              : 'No se pudo crear la propiedad horizontal.';
                          messenger.showSnackBar(
                            SnackBar(
                              content: Text(message),
                              backgroundColor: Theme.of(
                                context,
                              ).colorScheme.error,
                            ),
                          );
                        }
                      },
                child: isCreating
                    ? const SizedBox(
                        width: 20,
                        height: 20,
                        child: CircularProgressIndicator(strokeWidth: 2),
                      )
                    : const Text('Crear propiedad'),
              ),
            ],
          );
        });
      },
    );
  }
}
