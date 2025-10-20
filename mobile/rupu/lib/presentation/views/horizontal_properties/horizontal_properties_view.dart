import 'package:flutter/material.dart';
import 'package:get/get.dart';

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
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Obx(() {
            if (controller.isLoading.value && controller.properties.isEmpty) {
              return const Center(child: CircularProgressIndicator());
            }

            final error = controller.errorMessage.value;

            return Column(
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
                      onPressed: () {
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(
                            content: Text(
                              'La funcionalidad de agregar propiedad estará disponible próximamente.',
                            ),
                          ),
                        );
                      },
                      icon: const Icon(Icons.add_home_work_outlined),
                      label: const Text('Agregar Propiedad'),
                    ),
                    if (controller.isLoading.value) ...[
                      const SizedBox(width: 16),
                      const SizedBox(
                        height: 24,
                        width: 24,
                        child: CircularProgressIndicator(strokeWidth: 2),
                      ),
                    ]
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
                          Icon(Icons.error_outline,
                              color: theme.colorScheme.onErrorContainer),
                          const SizedBox(width: 12),
                          Expanded(
                            child: Text(
                              error,
                              style: theme.textTheme.bodyMedium?.copyWith(
                                color: theme.colorScheme.onErrorContainer,
                              ),
                            ),
                          ),
                          IconButton(
                            tooltip: 'Reintentar',
                            onPressed: controller.fetchProperties,
                            icon: const Icon(Icons.refresh),
                          )
                        ],
                      ),
                    ),
                  ),
                if (error != null) const SizedBox(height: 12),
                if (controller.properties.isEmpty && error == null)
                  Expanded(
                    child: Center(
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
                    ),
                  )
                else if (controller.properties.isNotEmpty)
                  Expanded(
                    child: Card(
                      clipBehavior: Clip.antiAlias,
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.stretch,
                        children: [
                          Expanded(
                            child: SingleChildScrollView(
                              scrollDirection: Axis.horizontal,
                              child: ConstrainedBox(
                                constraints: const BoxConstraints(minWidth: 900),
                                child: SingleChildScrollView(
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
                                      DataColumn(label: Text('Fecha creación')),
                                      DataColumn(label: Text('Acciones')),
                                    ],
                                    rows: controller.properties
                                        .map(
                                          (property) => DataRow(
                                            cells: [
                                              DataCell(Text('${property.id}')),
                                              DataCell(Text(property.name)),
                                              DataCell(Text(
                                                  property.address?.isNotEmpty == true
                                                      ? property.address!
                                                      : 'Sin dirección')),
                                              DataCell(Text(
                                                  property.totalUnits?.toString() ??
                                                      'N/A')),
                                              DataCell(
                                                Chip(
                                                  label: Text(property.isActive
                                                      ? 'Activo'
                                                      : 'Inactivo'),
                                                  backgroundColor: property.isActive
                                                      ? theme.colorScheme
                                                          .secondaryContainer
                                                      : theme.colorScheme
                                                          .errorContainer,
                                                  labelStyle: theme
                                                      .textTheme
                                                      .labelMedium
                                                      ?.copyWith(
                                                        color: property.isActive
                                                            ? theme.colorScheme
                                                                .onSecondaryContainer
                                                            : theme.colorScheme
                                                                .onErrorContainer,
                                                      ),
                                                ),
                                              ),
                                              DataCell(Text(
                                                  controller.formatDate(
                                                      property.createdAt))),
                                              DataCell(
                                                Row(
                                                  mainAxisSize: MainAxisSize.min,
                                                  children: [
                                                    IconButton(
                                                      tooltip: 'Ver',
                                                      onPressed: () {
                                                        ScaffoldMessenger.of(
                                                                context)
                                                            .showSnackBar(
                                                          SnackBar(
                                                            content: Text(
                                                              'Ver ${property.name} estará disponible próximamente.',
                                                            ),
                                                          ),
                                                        );
                                                      },
                                                      icon: const Icon(
                                                          Icons.visibility_outlined),
                                                    ),
                                                    IconButton(
                                                      tooltip: 'Eliminar',
                                                      onPressed: () {
                                                        ScaffoldMessenger.of(
                                                                context)
                                                            .showSnackBar(
                                                          SnackBar(
                                                            content: Text(
                                                              'Eliminar ${property.name} estará disponible próximamente.',
                                                            ),
                                                          ),
                                                        );
                                                      },
                                                      icon: const Icon(
                                                          Icons.delete_outline),
                                                    ),
                                                    IconButton(
                                                      tooltip: 'Actualizar',
                                                      onPressed: () {
                                                        ScaffoldMessenger.of(
                                                                context)
                                                            .showSnackBar(
                                                          SnackBar(
                                                            content: Text(
                                                              'Actualizar ${property.name} estará disponible próximamente.',
                                                            ),
                                                          ),
                                                        );
                                                      },
                                                      icon: const Icon(
                                                          Icons.edit_outlined),
                                                    ),
                                                  ],
                                                ),
                                              ),
                                            ],
                                          ),
                                        )
                                        .toList(),
                                  ),
                                ),
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
              ],
            );
          }),
        ),
      ),
    );
  }
}
