import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:intl/intl.dart';
import 'package:rupu/presentation/views/iam/controllers/iam_logs_controller.dart';

/// Terminal-style logs console widget
class IamLogsTab extends StatefulWidget {
  const IamLogsTab({super.key});

  @override
  State<IamLogsTab> createState() => _IamLogsTabState();
}

class _IamLogsTabState extends State<IamLogsTab> {
  late final IamLogsController controller;
  final ScrollController _scrollController = ScrollController();

  @override
  void initState() {
    super.initState();
    controller = Get.put(IamLogsController(), tag: IamLogsController.tag);

    // Auto-scroll to top when new logs arrive (newest are at top)
    ever(controller.logs, (_) {
      if (controller.autoScroll.value && _scrollController.hasClients) {
        Future.microtask(() {
          _scrollController.animateTo(
            0, // Scroll to top where newest logs are
            duration: const Duration(milliseconds: 100),
            curve: Curves.easeOut,
          );
        });
      }
    });
  }

  @override
  void dispose() {
    _scrollController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final cs = Theme.of(context).colorScheme;
    // Get the bottom padding from system for safe area
    final bottomPadding = MediaQuery.of(context).padding.bottom + 80;

    return Container(
      color: const Color(0xFF1E1E1E), // Dark terminal background
      child: Column(
        children: [
          // Toolbar
          _buildToolbar(cs),

          // Divider
          Container(height: 1, color: Colors.white.withValues(alpha: 0.1)),

          // Logs list
          Expanded(
            child: Obx(() {
              final logs = controller.logs;

              if (logs.isEmpty) {
                return Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(
                        Icons.terminal,
                        size: 64,
                        color: Colors.white.withValues(alpha: 0.3),
                      ),
                      const SizedBox(height: 16),
                      Obx(() {
                        if (controller.isConnecting.value) {
                          return Row(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              SizedBox(
                                width: 16,
                                height: 16,
                                child: CircularProgressIndicator(
                                  strokeWidth: 2,
                                  color: cs.primary,
                                ),
                              ),
                              const SizedBox(width: 12),
                              Text(
                                'Conectando...',
                                style: TextStyle(
                                  color: Colors.white.withValues(alpha: 0.5),
                                  fontFamily: 'monospace',
                                ),
                              ),
                            ],
                          );
                        }
                        if (controller.errorMessage.value != null) {
                          return Padding(
                            padding: const EdgeInsets.symmetric(horizontal: 24),
                            child: Text(
                              controller.errorMessage.value!,
                              textAlign: TextAlign.center,
                              style: const TextStyle(
                                color: Color(0xFFFF6B6B),
                                fontFamily: 'monospace',
                                fontSize: 12,
                              ),
                            ),
                          );
                        }
                        return Text(
                          controller.isPaused.value
                              ? 'Stream pausado'
                              : 'Esperando logs...',
                          style: TextStyle(
                            color: Colors.white.withValues(alpha: 0.5),
                            fontFamily: 'monospace',
                          ),
                        );
                      }),
                    ],
                  ),
                );
              }

              return ListView.builder(
                controller: _scrollController,
                padding: EdgeInsets.only(
                  left: 8,
                  right: 8,
                  top: 8,
                  bottom: bottomPadding, // Padding for bottom nav
                ),
                itemCount: logs.length,
                itemBuilder: (context, index) {
                  final log = logs[index];
                  return _LogEntryWidget(entry: log);
                },
              );
            }),
          ),
        ],
      ),
    );
  }

  Widget _buildToolbar(ColorScheme cs) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 8),
      color: const Color(0xFF252526),
      child: SingleChildScrollView(
        scrollDirection: Axis.horizontal,
        child: Row(
          children: [
            // Connection status indicator
            Obx(() {
              final isConnected = controller.isConnected.value;
              final isConnecting = controller.isConnecting.value;
              return Container(
                width: 8,
                height: 8,
                margin: const EdgeInsets.only(right: 6),
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: isConnecting
                      ? Colors.orange
                      : isConnected
                      ? const Color(0xFF6BCB77)
                      : const Color(0xFFFF6B6B),
                ),
              );
            }),

            // Level filter chips
            _buildLevelChip('ERR', 'error', const Color(0xFFFF6B6B)),
            const SizedBox(width: 4),
            _buildLevelChip('WRN', 'warn', const Color(0xFFFFD93D)),
            const SizedBox(width: 4),
            _buildLevelChip('INF', 'info', const Color(0xFF4D96FF)),
            const SizedBox(width: 4),
            _buildLevelChip('DBG', 'debug', const Color(0xFF6BCB77)),

            const SizedBox(width: 12),

            // Action buttons
            _ToolbarButton(
              icon: Icons.delete_outline,
              tooltip: 'Limpiar',
              size: 18,
              onPressed: controller.clearLogs,
            ),
            Obx(
              () => _ToolbarButton(
                icon: controller.isPaused.value
                    ? Icons.play_arrow
                    : Icons.pause,
                tooltip: controller.isPaused.value ? 'Reanudar' : 'Pausar',
                size: 18,
                onPressed: controller.togglePause,
              ),
            ),
            Obx(
              () => _ToolbarButton(
                icon: Icons.vertical_align_bottom,
                tooltip: 'Auto-scroll',
                size: 18,
                isActive: controller.autoScroll.value,
                onPressed: () =>
                    controller.autoScroll.value = !controller.autoScroll.value,
              ),
            ),
            _ToolbarButton(
              icon: Icons.tune,
              tooltip: 'Filtros',
              size: 18,
              onPressed: () => _showFiltersDialog(context),
            ),
            _ToolbarButton(
              icon: Icons.refresh,
              tooltip: 'Reconectar',
              size: 18,
              onPressed: controller.reconnect,
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildLevelChip(String label, String level, Color color) {
    return Obx(() {
      final isSelected = controller.levelFilter.value == level;
      return GestureDetector(
        onTap: () {
          if (isSelected) {
            controller.setLevelFilter(null);
          } else {
            controller.setLevelFilter(level);
          }
        },
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 150),
          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
          decoration: BoxDecoration(
            color: isSelected
                ? color.withValues(alpha: 0.3)
                : Colors.transparent,
            borderRadius: BorderRadius.circular(4),
            border: Border.all(
              color: color.withValues(alpha: isSelected ? 0.8 : 0.3),
              width: 1,
            ),
          ),
          child: Text(
            label,
            style: TextStyle(
              color: color,
              fontSize: 10,
              fontWeight: FontWeight.bold,
              fontFamily: 'monospace',
            ),
          ),
        ),
      );
    });
  }

  void _showFiltersDialog(BuildContext context) {
    final serviceController = TextEditingController(
      text: controller.serviceFilter.value,
    );
    final moduleController = TextEditingController(
      text: controller.moduleFilter.value,
    );
    final functionController = TextEditingController(
      text: controller.functionFilter.value,
    );
    final searchController = TextEditingController(
      text: controller.searchFilter.value,
    );
    final businessIdController = TextEditingController(
      text: controller.businessIdFilter.value?.toString() ?? '',
    );
    final userIdController = TextEditingController(
      text: controller.userIdFilter.value?.toString() ?? '',
    );

    showDialog(
      context: context,
      builder: (ctx) {
        final cs = Theme.of(ctx).colorScheme;
        return AlertDialog(
          backgroundColor: const Color(0xFF252526),
          title: Row(
            children: [
              Icon(Icons.filter_list, color: cs.primary),
              const SizedBox(width: 8),
              const Text(
                'Filtros de Logs',
                style: TextStyle(color: Colors.white),
              ),
            ],
          ),
          content: SizedBox(
            width: 400,
            child: SingleChildScrollView(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  _FilterField(
                    label: 'Servicio',
                    controller: serviceController,
                    hint: 'ej: auth, api, worker',
                  ),
                  const SizedBox(height: 12),
                  _FilterField(
                    label: 'Módulo',
                    controller: moduleController,
                    hint: 'ej: users, payments',
                  ),
                  const SizedBox(height: 12),
                  _FilterField(
                    label: 'Función',
                    controller: functionController,
                    hint: 'ej: createUser, processPayment',
                  ),
                  const SizedBox(height: 12),
                  _FilterField(
                    label: 'Business ID',
                    controller: businessIdController,
                    hint: 'ej: 123',
                    keyboardType: TextInputType.number,
                  ),
                  const SizedBox(height: 12),
                  _FilterField(
                    label: 'User ID',
                    controller: userIdController,
                    hint: 'ej: 456',
                    keyboardType: TextInputType.number,
                  ),
                  const SizedBox(height: 12),
                  _FilterField(
                    label: 'Buscar en mensaje',
                    controller: searchController,
                    hint: 'texto a buscar...',
                  ),
                ],
              ),
            ),
          ),
          actions: [
            TextButton(
              onPressed: () {
                controller.clearFilters();
                Navigator.of(ctx).pop();
              },
              child: Text('Limpiar filtros', style: TextStyle(color: cs.error)),
            ),
            TextButton(
              onPressed: () => Navigator.of(ctx).pop(),
              child: const Text('Cancelar'),
            ),
            FilledButton(
              onPressed: () {
                controller.applyFilters(
                  service: serviceController.text,
                  module: moduleController.text,
                  function: functionController.text,
                  businessId: int.tryParse(businessIdController.text),
                  userId: int.tryParse(userIdController.text),
                  search: searchController.text,
                );
                Navigator.of(ctx).pop();
              },
              child: const Text('Aplicar'),
            ),
          ],
        );
      },
    );
  }
}

class _ToolbarButton extends StatelessWidget {
  final IconData icon;
  final String tooltip;
  final VoidCallback onPressed;
  final bool isActive;
  final double size;

  const _ToolbarButton({
    required this.icon,
    required this.tooltip,
    required this.onPressed,
    this.isActive = false,
    this.size = 18,
  });

  @override
  Widget build(BuildContext context) {
    return Tooltip(
      message: tooltip,
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          borderRadius: BorderRadius.circular(4),
          onTap: onPressed,
          child: Container(
            padding: const EdgeInsets.all(5),
            decoration: BoxDecoration(
              color: isActive
                  ? Colors.white.withValues(alpha: 0.15)
                  : Colors.transparent,
              borderRadius: BorderRadius.circular(4),
            ),
            child: Icon(
              icon,
              size: size,
              color: isActive
                  ? Colors.white
                  : Colors.white.withValues(alpha: 0.7),
            ),
          ),
        ),
      ),
    );
  }
}

class _FilterField extends StatelessWidget {
  final String label;
  final TextEditingController controller;
  final String hint;
  final TextInputType? keyboardType;

  const _FilterField({
    required this.label,
    required this.controller,
    required this.hint,
    this.keyboardType,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: TextStyle(
            color: Colors.white.withValues(alpha: 0.7),
            fontSize: 12,
            fontWeight: FontWeight.w500,
          ),
        ),
        const SizedBox(height: 4),
        TextField(
          controller: controller,
          keyboardType: keyboardType,
          style: const TextStyle(color: Colors.white, fontFamily: 'monospace'),
          decoration: InputDecoration(
            hintText: hint,
            hintStyle: TextStyle(
              color: Colors.white.withValues(alpha: 0.3),
              fontFamily: 'monospace',
            ),
            filled: true,
            fillColor: const Color(0xFF1E1E1E),
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(6),
              borderSide: BorderSide(
                color: Colors.white.withValues(alpha: 0.2),
              ),
            ),
            enabledBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(6),
              borderSide: BorderSide(
                color: Colors.white.withValues(alpha: 0.2),
              ),
            ),
            focusedBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(6),
              borderSide: const BorderSide(color: Color(0xFF007ACC)),
            ),
            contentPadding: const EdgeInsets.symmetric(
              horizontal: 12,
              vertical: 10,
            ),
          ),
        ),
      ],
    );
  }
}

/// Widget for a single log entry - compact and clean
class _LogEntryWidget extends StatelessWidget {
  final LogEntry entry;

  const _LogEntryWidget({required this.entry});

  @override
  Widget build(BuildContext context) {
    final timeStr = DateFormat('HH:mm:ss').format(entry.timestamp);

    return Container(
      margin: const EdgeInsets.only(bottom: 6),
      padding: const EdgeInsets.all(10),
      decoration: BoxDecoration(
        color: const Color(0xFF2D2D2D),
        borderRadius: BorderRadius.circular(8),
        border: Border(left: BorderSide(color: entry.color, width: 4)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header: Level + Time
          Row(
            children: [
              // Level badge
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                decoration: BoxDecoration(
                  color: entry.color.withValues(alpha: 0.2),
                  borderRadius: BorderRadius.circular(4),
                ),
                child: Text(
                  entry.level.toUpperCase(),
                  style: TextStyle(
                    color: entry.color,
                    fontSize: 10,
                    fontWeight: FontWeight.bold,
                    letterSpacing: 0.5,
                  ),
                ),
              ),
              const SizedBox(width: 10),
              // Timestamp
              Text(
                timeStr,
                style: TextStyle(
                  color: Colors.white.withValues(alpha: 0.4),
                  fontSize: 11,
                  fontFamily: 'monospace',
                ),
              ),
              const Spacer(),
              // Service tag (if available)
              if (entry.service != null)
                Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 6,
                    vertical: 2,
                  ),
                  decoration: BoxDecoration(
                    color: const Color(0xFF3D3D3D),
                    borderRadius: BorderRadius.circular(4),
                  ),
                  child: Text(
                    entry.service!,
                    style: TextStyle(
                      color: Colors.white.withValues(alpha: 0.6),
                      fontSize: 10,
                    ),
                  ),
                ),
            ],
          ),
          const SizedBox(height: 8),
          // Message
          Text(
            entry.message,
            style: TextStyle(
              color: entry.level == 'error'
                  ? entry.color
                  : Colors.white.withValues(alpha: 0.85),
              fontSize: 13,
              height: 1.4,
            ),
          ),
        ],
      ),
    );
  }
}
