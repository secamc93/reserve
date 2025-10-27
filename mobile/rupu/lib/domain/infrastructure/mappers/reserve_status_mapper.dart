import 'package:rupu/domain/entities/reserve_status.dart';
import 'package:rupu/domain/infrastructure/models/reserve_status_response_model.dart';

class ReserveStatusMapper {
  static ReserveStatus fromModel(ReserveStatusModel model) => ReserveStatus(
        id: model.id,
        code: model.code,
        name: model.name,
      );

  static List<ReserveStatus> listFromResponse(
          ReserveStatusResponseModel model) =>
      model.data.map(fromModel).toList();
}
