import 'package:flutter/material.dart';
import 'package:rupu/config/helpers/design_helper.dart';

import '../screens/screens.dart';

class DashBoard extends StatelessWidget {
  const DashBoard({super.key, required this.pageIndex});
  final int pageIndex;
  @override
  Widget build(BuildContext context) {
    final tabs = [
      ('Reservas', ReserveScreen(pageIndex: pageIndex)),
      ('Availability', const Design2AvailabilityDashboard()),
      ('Services & Staff', const Design3ServicesStaff()),
      ('Branches', const Design4BranchesManager()),
      ("Today's Schedule", const Design5TodaysSchedule()),
    ];

    return DefaultTabController(
      length: tabs.length,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          // TabBar sin AppBar
          Material(
            color: Theme.of(context).colorScheme.surface,
            child: TabBar(
              isScrollable: true,
              tabs: [for (final t in tabs) Tab(text: t.$1)],
            ),
          ),
          const Divider(height: 1), // separador fino (opcional)
          // Contenido de cada tab
          Expanded(child: TabBarView(children: [for (final t in tabs) t.$2])),
        ],
      ),
    );
  }
}

// ──────────────────────────────────────────────────────────────────────────────
// Design 1 — Booking Hub (acciones rápidas + próximas reservas)
// ──────────────────────────────────────────────────────────────────────────────

// ──────────────────────────────────────────────────────────────────────────────
// Design 2 — Availability Dashboard (KPIs + ocupación + resumen semanal)
// ──────────────────────────────────────────────────────────────────────────────
class Design2AvailabilityDashboard extends StatelessWidget {
  const Design2AvailabilityDashboard({super.key});

  @override
  Widget build(BuildContext context) {
    final kpis = [
      ('Ocupación', '78%'),
      ('Ingresos hoy', 'USD 1.240'),
      ('No-shows', '3'),
      ('Nuevos clientes', '12'),
    ];

    final resources = [
      ('Sala A', .86),
      ('Sala B', .42),
      ('Cabina 1', .72),
      ('Cabina 2', .55),
      ('Mesas', .64),
    ];

    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        Wrap(
          spacing: 16,
          runSpacing: 16,
          children: [
            for (final k in kpis)
              SizedBox(
                width: MediaQuery.of(context).size.width > 600
                    ? (MediaQuery.of(context).size.width - 16 * 3) / 2
                    : double.infinity,
                child: KpiCard(title: k.$1, value: k.$2),
              ),
          ],
        ),
        const SizedBox(height: 16),
        const SectionTitle('Ocupación por recurso'),
        PrimaryCard(
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              children: [
                for (final r in resources)
                  Padding(
                    padding: const EdgeInsets.symmetric(vertical: 8),
                    child: Row(
                      children: [
                        Expanded(child: Text(r.$1)),
                        SizedBox(width: 160, child: ProgressBar(value: r.$2)),
                        const SizedBox(width: 8),
                        SizedBox(
                          width: 40,
                          child: Text(
                            '${(r.$2 * 100).toStringAsFixed(0)}%',
                            textAlign: TextAlign.end,
                          ),
                        ),
                      ],
                    ),
                  ),
              ],
            ),
          ),
        ),
        const SizedBox(height: 16),
        const SectionTitle('Semana en curso'),
        PrimaryCard(
          child: Container(
            height: 160,
            alignment: Alignment.center,
            child: const Text(
              '📊 Inserta aquí tu gráfico de ocupación/ingresos (placeholder)',
            ),
          ),
        ),
      ],
    );
  }
}

class KpiCard extends StatelessWidget {
  const KpiCard({super.key, required this.title, required this.value});
  final String title;
  final String value;
  @override
  Widget build(BuildContext context) {
    final cs = Theme.of(context).colorScheme;
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: cs.tertiaryContainer,
                borderRadius: BorderRadius.circular(12),
              ),
              child: Icon(
                Icons.insights_rounded,
                color: cs.onTertiaryContainer,
              ),
            ),
            const SizedBox(width: 16),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    title,
                    style: Theme.of(context).textTheme.labelLarge!.copyWith(
                      color: cs.onSurfaceVariant,
                    ),
                  ),
                  const SizedBox(height: 6),
                  Text(
                    value,
                    style: Theme.of(context).textTheme.headlineSmall!.copyWith(
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                ],
              ),
            ),
            Icon(Icons.chevron_right_rounded, color: cs.onSurfaceVariant),
          ],
        ),
      ),
    );
  }
}

// ──────────────────────────────────────────────────────────────────────────────
// Design 3 — Services & Staff (chips + estado del personal)
// ──────────────────────────────────────────────────────────────────────────────
class Design3ServicesStaff extends StatelessWidget {
  const Design3ServicesStaff({super.key});

  @override
  Widget build(BuildContext context) {
    final chips = [
      'Corte',
      'Masaje',
      'Reunión',
      'Sala privada',
      'Spa',
      'Catering',
    ];
    final staff = [
      ('Lucía', 'Disponible 10:30', true),
      ('Pablo', 'Ocupado hasta 11:00', false),
      ('Majo', 'Disponible 11:15', true),
      ('Rafa', 'Ocupado hasta 12:00', false),
      ('Irene', 'Disponible 09:45', true),
      ('Tomás', 'Ocupado hasta 10:20', false),
    ];

    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        const SectionTitle('Servicios'),
        Wrap(
          spacing: 8,
          runSpacing: 8,
          children: [
            for (final c in chips)
              FilterChip(
                label: Text(c),
                selected: c == 'Reunión',
                onSelected: (_) {},
              ),
          ],
        ),
        const SizedBox(height: 16),
        const SectionTitle('Personal'),
        GridView.builder(
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          itemCount: staff.length,
          gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
            crossAxisCount: 2,
            mainAxisSpacing: 16,
            crossAxisSpacing: 16,
            childAspectRatio: 1.2,
          ),
          itemBuilder: (_, i) => StaffStatusCard(
            name: staff[i].$1,
            note: staff[i].$2,
            available: staff[i].$3,
            avatarSeed: staff[i].$1,
          ),
        ),
      ],
    );
  }
}

class StaffStatusCard extends StatelessWidget {
  const StaffStatusCard({
    super.key,
    required this.name,
    required this.note,
    required this.available,
    required this.avatarSeed,
  });
  final String name;
  final String note;
  final bool available;
  final String avatarSeed;
  @override
  Widget build(BuildContext context) {
    return PrimaryCard(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                CircleAvatar(
                  backgroundImage: NetworkImage(
                    'https://i.pravatar.cc/100?u=$avatarSeed',
                  ),
                  radius: 22,
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Text(
                    name,
                    style: Theme.of(context).textTheme.titleMedium,
                  ),
                ),
                Icon(
                  available ? Icons.check_circle : Icons.cancel,
                  color: available ? Colors.teal : Colors.redAccent,
                ),
              ],
            ),
            const SizedBox(height: 10),
            Text(
              note,
              style: Theme.of(context).textTheme.bodySmall!.copyWith(
                color: Theme.of(context).colorScheme.onSurfaceVariant,
              ),
            ),
            const Spacer(),
            // Row(
            //   children: [
            //     FilledButton.tonal(
            //       onPressed: () {},
            //       child: const Text('Asignar'),
            //     ),
            //     const SizedBox(width: 8),
            //     OutlinedButton(onPressed: () {}, child: const Text('Agenda')),
            //   ],
            // ),
          ],
        ),
      ),
    );
  }
}

// ──────────────────────────────────────────────────────────────────────────────
// Design 4 — Branches Manager (sucursales + KPIs locales)
// ──────────────────────────────────────────────────────────────────────────────
class Design4BranchesManager extends StatelessWidget {
  const Design4BranchesManager({super.key});

  @override
  Widget build(BuildContext context) {
    final filters = ['Todas', 'Centro', 'Norte', 'Sur'];
    final branches = [
      ('Central', 'Cra 1 #23-10', .82, '09:00 - 20:00'),
      ('Norte', 'Av. 15 #110-05', .56, '10:00 - 21:00'),
      ('Sur', 'Cll 80 #45-12', .71, '08:30 - 19:30'),
    ];

    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        const SectionTitle('Sucursales'),
        Wrap(
          spacing: 8,
          children: [
            for (final f in filters)
              ChoiceChip(
                label: Text(f),
                selected: f == 'Todas',
                onSelected: (_) {},
              ),
          ],
        ),
        const SizedBox(height: 16),
        for (final b in branches)
          Padding(
            padding: const EdgeInsets.only(bottom: 12),
            child: BranchCard(
              name: b.$1,
              address: b.$2,
              occupancy: b.$3,
              hours: b.$4,
            ),
          ),
      ],
    );
  }
}

class BranchCard extends StatelessWidget {
  const BranchCard({
    super.key,
    required this.name,
    required this.address,
    required this.occupancy,
    required this.hours,
  });
  final String name;
  final String address;
  final double occupancy;
  final String hours;
  @override
  Widget build(BuildContext context) {
    final cs = Theme.of(context).colorScheme;
    return PrimaryCard(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                ClipRRect(
                  borderRadius: BorderRadius.circular(12),
                  child: Image.network(
                    'https://picsum.photos/seed/$name/200/120',
                    width: 88,
                    height: 56,
                    fit: BoxFit.cover,
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        name,
                        style: Theme.of(context).textTheme.titleMedium,
                      ),
                      Text(
                        address,
                        style: Theme.of(context).textTheme.bodySmall!.copyWith(
                          color: cs.onSurfaceVariant,
                        ),
                      ),
                      const SizedBox(height: 8),
                      ProgressBar(value: occupancy),
                    ],
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),
            Row(
              children: [
                Icon(Icons.schedule, size: 16, color: cs.onSurfaceVariant),
                const SizedBox(width: 6),
                Text(hours),
                const Spacer(),
                FilledButton.tonal(
                  onPressed: () {},
                  child: const Text('Gestionar'),
                ),
                const SizedBox(width: 8),
                OutlinedButton(onPressed: () {}, child: const Text('Personal')),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

// ──────────────────────────────────────────────────────────────────────────────
// Design 5 — Today\'s Schedule (timeline de citas)
// ──────────────────────────────────────────────────────────────────────────────
class Design5TodaysSchedule extends StatelessWidget {
  const Design5TodaysSchedule({super.key});

  @override
  Widget build(BuildContext context) {
    final appts = [
      ('09:00', 'Ana Gómez', 'Corte de cabello', 45, 'Confirmada'),
      ('09:45', 'Jorge Pérez', 'Sala reunión', 60, 'Pendiente'),
      ('11:00', 'Marta León', 'Masaje relajante', 50, 'Pagada'),
      ('12:30', 'Carlos Ruiz', 'Almuerzo mesa 4', 90, 'Confirmada'),
      ('14:15', 'Iván Díaz', 'Coloración', 80, 'Pendiente'),
    ];

    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        const SectionTitle('Agenda de hoy'),
        for (final a in appts)
          Padding(
            padding: const EdgeInsets.only(bottom: 12),
            child: AppointmentTimelineCard(
              time: a.$1,
              client: a.$2,
              service: a.$3,
              minutes: a.$4,
              status: a.$5,
            ),
          ),
      ],
    );
  }
}

class AppointmentTimelineCard extends StatelessWidget {
  const AppointmentTimelineCard({
    super.key,
    required this.time,
    required this.client,
    required this.service,
    required this.minutes,
    required this.status,
  });
  final String time;
  final String client;
  final String service;
  final int minutes;
  final String status;
  @override
  Widget build(BuildContext context) {
    final tone = status == 'Confirmada'
        ? StatusTone.info
        : status == 'Pendiente'
        ? StatusTone.warning
        : status == 'Cancelada'
        ? StatusTone.danger
        : status == 'Completada'
        ? StatusTone.success
        : StatusTone.info;
    return PrimaryCard(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Column(
              children: [
                Container(
                  width: 8,
                  height: 8,
                  decoration: const BoxDecoration(
                    color: Colors.teal,
                    shape: BoxShape.circle,
                  ),
                ),
                Container(
                  width: 2,
                  height: 52,
                  color: Colors.teal.withValues(alpha: 0.4),
                ),
              ],
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Text(
                        time,
                        style: Theme.of(context).textTheme.titleMedium!
                            .copyWith(fontWeight: FontWeight.w700),
                      ),
                      const SizedBox(width: 12),
                      StatusBadge(status, tone: tone),
                      const Spacer(),
                      IconButton(
                        onPressed: () {},
                        icon: const Icon(Icons.more_horiz),
                      ),
                    ],
                  ),
                  const SizedBox(height: 6),
                  Text(client, style: Theme.of(context).textTheme.titleSmall),
                  Text(
                    service,
                    style: Theme.of(context).textTheme.bodySmall!.copyWith(
                      color: Theme.of(context).colorScheme.onSurfaceVariant,
                    ),
                  ),
                  const SizedBox(height: 10),
                  Row(
                    children: [
                      Icon(
                        Icons.timer_outlined,
                        size: 16,
                        color: Colors.grey[700],
                      ),
                      const SizedBox(width: 6),
                      Text('$minutes min'),
                      const Spacer(),
                      OutlinedButton(
                        onPressed: () {},
                        child: const Text('Reagendar'),
                      ),
                      const SizedBox(width: 8),
                      FilledButton.tonal(
                        onPressed: () {},
                        child: const Text('Check-in'),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
