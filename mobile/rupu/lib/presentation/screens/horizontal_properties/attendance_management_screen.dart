import 'package:flutter/material.dart';
import 'package:rupu/config/routers/app_bindings.dart';
import 'package:rupu/domain/entities/horizontal_property_voting_groups.dart';
import 'package:rupu/presentation/views/horizontal_properties/attendance_management_view.dart';

class AttendanceManagementScreen extends StatelessWidget {
  static const name = 'attendance-management-screen';
  final int pageIndex;
  final int propertyId;
  final int votingGroupId;
  final HorizontalPropertyVotingGroup? group;

  const AttendanceManagementScreen({
    super.key,
    required this.pageIndex,
    required this.propertyId,
    required this.votingGroupId,
    this.group,
  });

  @override
  Widget build(BuildContext context) {
    AttendanceManagementBinding.register(
      propertyId: propertyId,
      votingGroupId: votingGroupId,
      businessId: group?.businessId ?? 0,
      group: group,
    );

    return AttendanceManagementView(
      propertyId: propertyId,
      votingGroupId: votingGroupId,
    );
  }
}
