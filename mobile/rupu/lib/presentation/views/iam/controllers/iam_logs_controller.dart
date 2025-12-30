import 'dart:async';
import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:http/http.dart' as http;
import 'package:rupu/config/helpers/global_vars.dart';
import 'package:rupu/config/constants/secure_storage/token_storage.dart';

/// Entity representing a single log entry from the SSE stream
class LogEntry {
  final DateTime timestamp;
  final String level;
  final String message;
  final String? service;
  final String? module;
  final String? function;
  final int? businessId;
  final int? userId;
  final Map<String, dynamic>? meta;

  LogEntry({
    required this.timestamp,
    required this.level,
    required this.message,
    this.service,
    this.module,
    this.function,
    this.businessId,
    this.userId,
    this.meta,
  });

  /// Regex to strip ANSI escape codes
  static final _ansiPattern = RegExp(
    r'\x1B(?:[@-Z\\-_]|\[[0-?]*[ -/]*[@-~])',
    multiLine: true,
  );

  /// Strip ANSI escape codes from a string
  static String _stripAnsi(String text) {
    return text.replaceAll(_ansiPattern, '').trim();
  }

  factory LogEntry.fromJson(Map<String, dynamic> json) {
    // Get raw message and strip ANSI codes
    final rawMessage = (json['message'] ?? json['msg'] ?? '').toString();
    final cleanMessage = _stripAnsi(rawMessage);

    return LogEntry(
      timestamp: DateTime.tryParse(json['timestamp'] ?? '') ?? DateTime.now(),
      level: (json['level'] ?? 'info').toString().toLowerCase(),
      message: cleanMessage,
      service: json['service']?.toString(),
      module: json['module']?.toString(),
      function: json['function']?.toString(),
      businessId: json['business_id'] is int
          ? json['business_id']
          : int.tryParse(json['business_id']?.toString() ?? ''),
      userId: json['user_id'] is int
          ? json['user_id']
          : int.tryParse(json['user_id']?.toString() ?? ''),
      meta: json['meta'] is Map<String, dynamic> ? json['meta'] : null,
    );
  }

  /// Get color based on log level
  Color get color {
    switch (level) {
      case 'error':
        return const Color(0xFFFF6B6B); // Red
      case 'warn':
      case 'warning':
        return const Color(0xFFFFD93D); // Yellow
      case 'debug':
        return const Color(0xFF6BCB77); // Green
      case 'info':
      default:
        return const Color(0xFF4D96FF); // Blue
    }
  }

  /// Get icon based on log level
  IconData get icon {
    switch (level) {
      case 'error':
        return Icons.error_outline;
      case 'warn':
      case 'warning':
        return Icons.warning_amber_outlined;
      case 'debug':
        return Icons.bug_report_outlined;
      case 'info':
      default:
        return Icons.info_outline;
    }
  }
}

/// Controller for the logs SSE stream
class IamLogsController extends GetxController {
  static const String tag = 'IamLogsController';

  // Logs list
  final logs = <LogEntry>[].obs;

  // Connection status
  final isConnected = false.obs;
  final isConnecting = false.obs;
  final errorMessage = Rxn<String>();

  // Filters
  final levelFilter = Rxn<String>();
  final serviceFilter = ''.obs;
  final moduleFilter = ''.obs;
  final functionFilter = ''.obs;
  final businessIdFilter = Rxn<int>();
  final userIdFilter = Rxn<int>();
  final searchFilter = ''.obs;

  // Auto-scroll
  final autoScroll = true.obs;

  // Pause/Resume
  final isPaused = false.obs;

  // Max logs to keep in memory
  static const int maxLogs = 1000;

  // HTTP client and response
  http.Client? _client;
  StreamSubscription<String>? _subscription;

  @override
  void onInit() {
    super.onInit();
    connect();
  }

  @override
  void onClose() {
    disconnect();
    super.onClose();
  }

  /// Build the stream URL with query parameters
  String _buildStreamUrl() {
    final uri = Uri.parse('${GlobVars.baseUrl}/logs/stream');
    final params = <String, String>{};

    if (levelFilter.value != null) {
      params['level'] = levelFilter.value!;
    }
    if (serviceFilter.value.isNotEmpty) {
      params['service'] = serviceFilter.value;
    }
    if (moduleFilter.value.isNotEmpty) {
      params['module'] = moduleFilter.value;
    }
    if (functionFilter.value.isNotEmpty) {
      params['function'] = functionFilter.value;
    }
    if (businessIdFilter.value != null) {
      params['business_id'] = businessIdFilter.value.toString();
    }
    if (userIdFilter.value != null) {
      params['user_id'] = userIdFilter.value.toString();
    }
    if (searchFilter.value.isNotEmpty) {
      params['search'] = searchFilter.value;
    }

    return uri
        .replace(queryParameters: params.isNotEmpty ? params : null)
        .toString();
  }

  /// Connect to the SSE stream
  Future<void> connect() async {
    if (isConnecting.value || isConnected.value) return;

    isConnecting.value = true;
    errorMessage.value = null;

    try {
      final tokenStorage = TokenStorage();
      final token = await tokenStorage.readBusinessToken();
      if (token == null || token.isEmpty) {
        throw Exception('No token available');
      }

      _client = http.Client();
      final request = http.Request('GET', Uri.parse(_buildStreamUrl()));
      request.headers['Authorization'] = 'Bearer $token';
      request.headers['Accept'] = 'text/event-stream';
      request.headers['Cache-Control'] = 'no-cache';

      final response = await _client!.send(request);

      if (response.statusCode != 200) {
        throw Exception('Failed to connect: ${response.statusCode}');
      }

      isConnected.value = true;
      isConnecting.value = false;

      // Listen to the stream
      _subscription = response.stream
          .transform(utf8.decoder)
          .transform(const LineSplitter())
          .listen(
            _handleSSELine,
            onError: (error) {
              errorMessage.value = 'Stream error: $error';
              isConnected.value = false;
            },
            onDone: () {
              isConnected.value = false;
              // Auto-reconnect after 3 seconds
              Future.delayed(const Duration(seconds: 3), () {
                if (!isPaused.value) {
                  connect();
                }
              });
            },
          );
    } catch (e) {
      errorMessage.value = 'Connection error: $e';
      isConnecting.value = false;
      isConnected.value = false;
    }
  }

  /// Handle a single SSE line
  void _handleSSELine(String line) {
    if (isPaused.value) return;

    // SSE format: "data: {...json...}"
    if (line.startsWith('data:')) {
      final jsonStr = line.substring(5).trim();
      if (jsonStr.isEmpty || jsonStr == '[DONE]') return;

      try {
        final json = jsonDecode(jsonStr) as Map<String, dynamic>;
        final entry = LogEntry.fromJson(json);

        // Insert at beginning so newest logs appear at top
        logs.insert(0, entry);

        // Keep only the last maxLogs entries (remove from end)
        if (logs.length > maxLogs) {
          logs.removeRange(maxLogs, logs.length);
        }
      } catch (e) {
        // Ignore malformed JSON
        debugPrint('Failed to parse log: $e');
      }
    }
  }

  /// Disconnect from the SSE stream
  void disconnect() {
    _subscription?.cancel();
    _subscription = null;
    _client?.close();
    _client = null;
    isConnected.value = false;
    isConnecting.value = false;
  }

  /// Reconnect with new filters (clears existing logs)
  Future<void> reconnect() async {
    disconnect();
    logs.clear(); // Clear logs when reconnecting
    await Future.delayed(const Duration(milliseconds: 100));
    await connect();
  }

  /// Toggle pause/resume
  void togglePause() {
    isPaused.value = !isPaused.value;
    if (!isPaused.value && !isConnected.value) {
      connect();
    }
  }

  /// Clear all logs
  void clearLogs() {
    logs.clear();
  }

  /// Set level filter and reconnect
  void setLevelFilter(String? level) {
    levelFilter.value = level;
    reconnect();
  }

  /// Apply filters and reconnect
  void applyFilters({
    String? service,
    String? module,
    String? function,
    int? businessId,
    int? userId,
    String? search,
  }) {
    if (service != null) serviceFilter.value = service;
    if (module != null) moduleFilter.value = module;
    if (function != null) functionFilter.value = function;
    businessIdFilter.value = businessId;
    userIdFilter.value = userId;
    if (search != null) searchFilter.value = search;
    reconnect();
  }

  /// Clear all filters
  void clearFilters() {
    levelFilter.value = null;
    serviceFilter.value = '';
    moduleFilter.value = '';
    functionFilter.value = '';
    businessIdFilter.value = null;
    userIdFilter.value = null;
    searchFilter.value = '';
    reconnect();
  }
}
