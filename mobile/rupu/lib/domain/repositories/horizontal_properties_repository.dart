import 'package:rupu/domain/entities/horizontal_properties_page.dart';

abstract class HorizontalPropertiesRepository {
  Future<HorizontalPropertiesPage> getHorizontalProperties({
    Map<String, dynamic>? query,
  });
}
