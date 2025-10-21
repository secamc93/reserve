import 'package:rupu/domain/entities/horizontal_properties_page.dart';
import 'package:rupu/domain/entities/horizontal_property_action_result.dart';
import 'package:rupu/domain/entities/horizontal_property_create_result.dart';

abstract class HorizontalPropertiesRepository {
  Future<HorizontalPropertiesPage> getHorizontalProperties({
    Map<String, dynamic>? query,
  });

  Future<HorizontalPropertyCreateResult> createHorizontalProperty({
    required Map<String, dynamic> data,
  });

  Future<HorizontalPropertyActionResult> deleteHorizontalProperty({
    required int id,
  });
}
