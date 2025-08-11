// presentation/views/reserve/reserve_controller.dart
import 'package:get/get.dart';
import 'package:intl/intl.dart';
import 'package:rupu/domain/entities/reserve.dart';
import 'package:rupu/domain/repositories/reserve_repository.dart';
import 'package:rupu/domain/infrastructure/repositories/reserve_repository_impl.dart';
import 'package:rupu/domain/infrastructure/datasources/reservas_datasource_impl.dart';

class ReserveController extends GetxController {
  final ReserveRepository repository;
  ReserveController()
    : repository = ReserveRepositoryImpl(ReservasDatasourceImpl());

  final isLoading = false.obs;
  final errorMessage = RxnString();
  final reservas = <Reserve>[].obs;

  @override
  void onReady() {
    super.onReady();
    cargarReservasOrdenadas();
  }

  Future<void> cargarReservasOrdenadas() async {
    isLoading.value = true;
    errorMessage.value = null;
    try {
      List<Reserve> items = await repository.obtenerReservas();

      DateTime? parse(dynamic v) => _parseDate(v);
      final now = DateTime.now();
      final startToday = DateTime(now.year, now.month, now.day);

      int group(DateTime? dt) {
        if (dt == null) return 4; // sin fecha -> al final
        final d = DateTime(dt.year, dt.month, dt.day);
        final isToday = d == startToday;
        if (isToday) {
          return dt.isBefore(now) ? 1 : 0; // 0: hoy futuras, 1: hoy pasadas
        }
        if (d.isAfter(startToday)) return 2; // 2: futuras (no hoy)
        return 3; // 3: pasadas (no hoy)
      }

      int safeId(Reserve r) {
        // para desempate estable si tu ID es numérico, ajusta según tu modelo
        return int.tryParse(r.reservaId.toString()) ?? 0;
      }

      items.sort((a, b) {
        final da = parse(a.startAt);
        final db = parse(b.startAt);

        final ga = group(da);
        final gb = group(db);
        final gcmp = ga.compareTo(gb);
        if (gcmp != 0) return gcmp;

        // Dentro de cada grupo:
        switch (ga) {
          case 0: // hoy futuras -> ascendente (más cercana primero)
            final c0 = da!.compareTo(db!);
            if (c0 != 0) return c0;
            break;
          case 1: // hoy pasadas -> descendente (más reciente primero)
            final c1 = db!.compareTo(da!);
            if (c1 != 0) return c1;
            break;
          case 2: // futuras (no hoy) -> ascendente (más próxima primero)
            final c2 = da!.compareTo(db!);
            if (c2 != 0) return c2;
            break;
          case 3: // pasadas (no hoy) -> descendente (más reciente primero)
            final c3 = db!.compareTo(da!);
            if (c3 != 0) return c3;
            break;
          default: // 4: sin fecha -> mantener orden relativo
            break;
        }

        // Desempates (opcional): por fecha de creación y luego por ID
        final ca = parse(a.reservaCreada);
        final cb = parse(b.reservaCreada);
        if (ca != null && cb != null) {
          final c = ca.compareTo(cb);
          if (c != 0) return c;
        }

        return safeId(a).compareTo(safeId(b));
      });

      reservas.assignAll(items);
    } catch (e) {
      errorMessage.value = 'No se pudieron cargar las reservas';
    } finally {
      isLoading.value = false;
    }
  }

  DateTime? _parseDate(dynamic raw) {
    if (raw == null) return null;
    if (raw is DateTime) return raw.toLocal();
    if (raw is String) return DateTime.tryParse(raw)?.toLocal();
    return null;
  }

  // ---- Expuesto para la vista ----
  String cliente(Reserve r) => r.clienteNombre;

  String estado(Reserve r) {
    final s = (r.estadoNombre).toLowerCase();
    if (s.contains('confirm')) return 'Confirmada';
    if (s.contains('pend')) return 'Pendiente';
    if (s.contains('pag')) return 'Pagada';
    return r.estadoNombre.isNotEmpty == true ? r.estadoNombre : 'Pendiente';
  }

  String fecha(Reserve r) {
    final dt = _parseDate(r.startAt);
    if (dt == null) return '-';

    final now = DateTime.now();
    final sameDay =
        dt.year == now.year && dt.month == now.month && dt.day == now.day;

    final h = DateFormat('HH:mm').format(dt); // 24h
    // final h = DateFormat('h:mm a').format(dt);     // 12h AM/PM (opcional)

    if (sameDay) return 'Hoy • $h';

    final d = DateFormat('dd/MM/yyyy').format(dt);
    return '$d • $h';
  }
}
