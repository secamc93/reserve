// presentation/views/reserve/reserve_controller.dart
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:intl/intl.dart';
import 'package:rupu/domain/entities/reserve.dart';
import 'package:rupu/domain/repositories/reserve_repository.dart';
import 'package:rupu/domain/infrastructure/repositories/reserve_repository_impl.dart';
import 'package:rupu/domain/infrastructure/datasources/reservas_datasource_impl.dart';
import 'package:rupu/presentation/views/login/login_controller.dart';

class ReserveController extends GetxController {
  final ReserveRepository repository;
  ReserveController()
    : repository = ReserveRepositoryImpl(ReservasDatasourceImpl());

  final LoginController _loginController = Get.find<LoginController>();

  final isLoading = false.obs;
  final errorMessage = RxnString();

  /// 👇 Dos listas separadas según la vista
  final reservasHoy = <Reserve>[].obs; // Home
  final reservasTodas = <Reserve>[].obs; // Calendario

  final isSaving = false.obs;
  Worker? _businessWorker;

  @override
  void onInit() {
    super.onInit();
    _businessWorker = ever(_loginController.selectedBusiness, (_) {
      reservasHoy.clear();
      reservasTodas.clear();
      cargarReservasHoy();
      cargarReservasTodas(silent: true);
    });
  }

  @override
  void onReady() {
    super.onReady();
    cargarReservasHoy(); // Home por defecto
  }

  @override
  void onClose() {
    _businessWorker?.dispose();
    super.onClose();
  }

  // ================= Crear =================
  Future<bool> crearReserva({
    required int businessId,
    required String name,
    required DateTime startAt,
    required DateTime endAt,
    required int numberOfGuests,
    String? dni,
    String? email,
    String? phone,
  }) async {
    debugPrint('CTRL crearReserva -> dni="$dni" email="$email" phone="$phone"');
    try {
      final created = await repository.crearReserva(
        businessId: businessId,
        name: name,
        startAt: startAt,
        endAt: endAt,
        numberOfGuests: numberOfGuests,
        dni: dni,
        email: email,
        phone: phone,
      );

      // 1) Calendario: siempre contiene todas
      reservasTodas.add(created);
      _sortTodas();

      // 2) Home: solo si es HOY
      final now = DateTime.now();
      if (_isSameDay(startAt, now)) {
        reservasHoy.add(created);
        _sortHoy();
      }

      return true;
    } catch (e) {
      debugPrint('CTRL crearReserva error: $e');
      return false;
    }
  }

  // ================= Cancelar =================
  Future<bool> cancelarReserva({required int id, String? reason}) async {
    try {
      isSaving.value = true;
      final cancelled = await repository.cancelarReserva(id: id, reason: reason);
      actualizarLocal(cancelled);
      return true;
    } catch (e) {
      debugPrint('CTRL cancelarReserva error: $e');
      return false;
    } finally {
      isSaving.value = false;
    }
  }

  // ================= Check-in =================
  Future<bool> checkInReserva({required int id}) async {
    try {
      isSaving.value = true;

      Reserve? r;
      try {
        r = reservasHoy.firstWhere((e) => e.reservaId == id);
      } catch (_) {}
      if (r == null) {
        try {
          r = reservasTodas.firstWhere((e) => e.reservaId == id);
        } catch (_) {}
      }
      r ??= await repository.obtenerReserva(id: id);

      final updated = await repository.actualizarReserva(
        id: id,
        startAt: r.startAt,
        endAt: r.endAt,
        numberOfGuests: r.numberOfGuests,
        statusId: 2,
        tableId: r.mesaId,
      );

      actualizarLocal(updated);
      return true;
    } catch (e) {
      debugPrint('CTRL checkInReserva error: $e');
      return false;
    } finally {
      isSaving.value = false;
    }
  }

  // ================= Home (solo HOY) =================
  Future<void> cargarReservasHoy({bool silent = false, int? businessId}) async {
    final id = businessId ?? _loginController.selectedBusinessId;
    if (id == null) {
      reservasHoy.clear();
      if (!silent) {
        errorMessage.value = 'No hay negocio seleccionado.';
      }
      return;
    }

    if (!silent) isLoading.value = true;
    errorMessage.value = null;
    try {
      final items = await repository.obtenerReservas(businessId: id);

      final now = DateTime.now();
      final soloHoy = <Reserve>[];

      for (final r in items) {
        final dt = _parseDate(r.startAt);
        if (dt != null && _isSameDay(dt, now)) {
          soloHoy.add(r);
        }
      }

      // ordenar para Home:
      reservasHoy.assignAll(_sortedHoyFrom(soloHoy, now));

      // opcional: cachear todas si quieres (no obligatorio)
      // reservasTodas.assignAll(_sortedTodasFrom(items));
    } catch (e) {
      errorMessage.value = 'No se pudieron cargar las reservas de hoy';
    } finally {
      if (!silent) isLoading.value = false;
    }
  }

  // ================= Calendario (TODAS) =================
  Future<void> cargarReservasTodas({bool silent = false, int? businessId}) async {
    final id = businessId ?? _loginController.selectedBusinessId;
    if (id == null) {
      reservasTodas.clear();
      if (!silent) {
        errorMessage.value = 'No hay negocio seleccionado.';
      }
      return;
    }

    if (!silent) isLoading.value = true;
    errorMessage.value = null;
    try {
      final items = await repository.obtenerReservas(businessId: id);
      reservasTodas.assignAll(_sortedTodasFrom(items));
    } catch (e) {
      errorMessage.value = 'No se pudieron cargar todas las reservas';
    } finally {
      if (!silent) isLoading.value = false;
    }
  }

  // ================= Helpers de ordenamiento =================
  List<Reserve> _sortedHoyFrom(List<Reserve> list, DateTime now) {
    final futuras = <Reserve>[];
    final pasadas = <Reserve>[];

    for (final r in list) {
      final dt = _parseDate(r.startAt)!;
      if (dt.isAfter(now)) {
        futuras.add(r);
      } else {
        pasadas.add(r);
      }
    }
    futuras.sort(
      (a, b) => _parseDate(a.startAt)!.compareTo(_parseDate(b.startAt)!),
    ); // asc
    pasadas.sort(
      (a, b) => _parseDate(b.startAt)!.compareTo(_parseDate(a.startAt)!),
    ); // desc
    return [...futuras, ...pasadas];
  }

  void _sortHoy() {
    final now = DateTime.now();
    reservasHoy.assignAll(_sortedHoyFrom(reservasHoy.toList(), now));
  }

  List<Reserve> _sortedTodasFrom(List<Reserve> list) {
    final copy = [...list];
    copy.sort((a, b) {
      final da = _parseDate(a.startAt) ?? DateTime(9999);
      final db = _parseDate(b.startAt) ?? DateTime(9999);
      final c = da.compareTo(db);
      if (c != 0) return c;
      final ea = _parseDate(a.endAt) ?? da;
      final eb = _parseDate(b.endAt) ?? db;
      return ea.compareTo(eb);
    });
    return copy;
  }

  void _sortTodas() {
    reservasTodas.assignAll(_sortedTodasFrom(reservasTodas.toList()));
  }

  // ================= Actualizar en memoria =================
  void actualizarLocal(Reserve updated) {
    final idxTodas =
        reservasTodas.indexWhere((r) => r.reservaId == updated.reservaId);
    if (idxTodas != -1) {
      reservasTodas[idxTodas] = updated;
      _sortTodas();
    }

    final idxHoy =
        reservasHoy.indexWhere((r) => r.reservaId == updated.reservaId);
    final start = _parseDate(updated.startAt);
    final now = DateTime.now();
    final sameDay = start != null && _isSameDay(start, now);

    if (sameDay) {
      if (idxHoy != -1) {
        reservasHoy[idxHoy] = updated;
      } else {
        reservasHoy.add(updated);
      }
      _sortHoy();
    } else {
      if (idxHoy != -1) reservasHoy.removeAt(idxHoy);
    }
  }

  // ================= Utils =================
  DateTime? _parseDate(dynamic raw) {
    if (raw == null) return null;
    if (raw is DateTime) return raw.toLocal();
    if (raw is String) return DateTime.tryParse(raw)?.toLocal();
    return null;
  }

  bool _isSameDay(DateTime a, DateTime b) =>
      a.year == b.year && a.month == b.month && a.day == b.day;

  // ---- Expuesto para la vista (Home) ----
  String cliente(Reserve r) => r.clienteNombre;

  String estado(Reserve r) {
    final s = (r.estadoNombre).toLowerCase();
    if (s.contains('confirm')) return 'Confirmada';
    if (s.contains('pend')) return 'Pendiente';
    if (s.contains('pag')) return 'Pagada';
    if (s.contains('Cancelada')) return 'Cancelada';
    if (s.contains('Completada')) return 'Completada';

    return r.estadoNombre.isNotEmpty == true ? r.estadoNombre : 'Pendiente';
  }

  String fechaHome(Reserve r) {
    final dt = _parseDate(r.startAt);
    if (dt == null) return '-';
    final h = DateFormat('HH:mm').format(dt); // 24h
    return 'Hoy • $h';
  }
}
