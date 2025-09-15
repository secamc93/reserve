import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:rupu/presentation/views/users/users_controller.dart';

class UsersFiltersPanel extends StatelessWidget {
  final UsersController controller;
  const UsersFiltersPanel({super.key, required this.controller});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Filtros de búsqueda',
              style: theme.textTheme.titleMedium
                  ?.copyWith(fontWeight: FontWeight.w600),
            ),
            const SizedBox(height: 16),
            Row(
              children: [
                Expanded(
                  child: TextField(
                    controller: controller.pageCtrl,
                    keyboardType: TextInputType.number,
                    decoration: const InputDecoration(
                      labelText: 'Página',
                      prefixIcon: Icon(Icons.layers_outlined),
                    ),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: TextField(
                    controller: controller.pageSizeCtrl,
                    keyboardType: TextInputType.number,
                    decoration: const InputDecoration(
                      labelText: 'Tamaño de página',
                      prefixIcon: Icon(Icons.format_list_numbered),
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),
            TextField(
              controller: controller.nameCtrl,
              decoration: const InputDecoration(
                labelText: 'Nombre',
                prefixIcon: Icon(Icons.person_outline),
              ),
            ),
            const SizedBox(height: 12),
            TextField(
              controller: controller.emailCtrl,
              keyboardType: TextInputType.emailAddress,
              decoration: const InputDecoration(
                labelText: 'Email',
                prefixIcon: Icon(Icons.alternate_email_outlined),
              ),
            ),
            const SizedBox(height: 12),
            TextField(
              controller: controller.phoneCtrl,
              keyboardType: TextInputType.phone,
              decoration: const InputDecoration(
                labelText: 'Teléfono',
                prefixIcon: Icon(Icons.phone_iphone),
              ),
            ),
            const SizedBox(height: 12),
            Obx(() => DropdownButtonFormField<bool?>(
                  value: controller.isActive.value,
                  decoration: const InputDecoration(
                    labelText: 'Estado',
                    prefixIcon: Icon(Icons.verified_user_outlined),
                  ),
                  items: const [
                    DropdownMenuItem<bool?>(value: null, child: Text('Todos')),
                    DropdownMenuItem<bool?>(value: true, child: Text('Activo')),
                    DropdownMenuItem<bool?>(value: false, child: Text('Inactivo')),
                  ],
                  onChanged: (value) => controller.isActive.value = value,
                )),
            const SizedBox(height: 12),
            TextField(
              controller: controller.roleIdCtrl,
              keyboardType: TextInputType.number,
              decoration: const InputDecoration(
                labelText: 'ID de rol',
                prefixIcon: Icon(Icons.badge_outlined),
              ),
            ),
            const SizedBox(height: 12),
            TextField(
              controller: controller.businessIdCtrl,
              keyboardType: TextInputType.number,
              decoration: const InputDecoration(
                labelText: 'ID de negocio',
                prefixIcon: Icon(Icons.store_mall_directory_outlined),
              ),
            ),
            const SizedBox(height: 12),
            TextField(
              controller: controller.createdAtCtrl,
              decoration: const InputDecoration(
                labelText: 'Fecha de creación',
                helperText:
                    'Formato YYYY-MM-DD o rango YYYY-MM-DD,YYYY-MM-DD',
                prefixIcon: Icon(Icons.calendar_today_outlined),
              ),
            ),
            const SizedBox(height: 12),
            Row(
              children: [
                Expanded(
                  child: TextField(
                    controller: controller.sortByCtrl,
                    decoration: const InputDecoration(
                      labelText: 'Ordenar por',
                      prefixIcon: Icon(Icons.sort_by_alpha_outlined),
                    ),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: TextField(
                    controller: controller.sortOrderCtrl,
                    decoration: const InputDecoration(
                      labelText: 'Orden',
                      hintText: 'asc o desc',
                      prefixIcon: Icon(Icons.swap_vert_circle_outlined),
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),
            Row(
              children: [
                Expanded(
                  child: ElevatedButton.icon(
                    onPressed: controller.fetchUsers,
                    icon: const Icon(Icons.search),
                    label: const Text('Aplicar filtros'),
                  ),
                ),
                const SizedBox(width: 12),
                TextButton.icon(
                  onPressed: () async {
                    controller.clearFilters();
                    await controller.fetchUsers();
                  },
                  icon: const Icon(Icons.restore),
                  label: const Text('Limpiar'),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
