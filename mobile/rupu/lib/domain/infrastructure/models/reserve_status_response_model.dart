class ReserveStatusResponseModel {
  final bool success;
  final List<ReserveStatusModel> data;

  ReserveStatusResponseModel({
    required this.success,
    required this.data,
  });

  factory ReserveStatusResponseModel.fromJson(Map<String, dynamic> json) {
    final dataJson = json['data'];
    final estados = <ReserveStatusModel>[];
    if (dataJson is List) {
      estados.addAll(
        dataJson.whereType<Map<String, dynamic>>().map(ReserveStatusModel.fromJson),
      );
    }
    return ReserveStatusResponseModel(
      success: json['success'] as bool? ?? false,
      data: estados,
    );
  }
}

class ReserveStatusModel {
  final int id;
  final String code;
  final String name;

  ReserveStatusModel({
    required this.id,
    required this.code,
    required this.name,
  });

  factory ReserveStatusModel.fromJson(Map<String, dynamic> json) => ReserveStatusModel(
        id: _toInt(json['id']) ?? 0,
        code: (json['code'] ?? '') as String,
        name: (json['name'] ?? '') as String,
      );

  Map<String, dynamic> toJson() => {
        'id': id,
        'code': code,
        'name': name,
      };
}

int? _toInt(dynamic v) {
  if (v == null) return null;
  if (v is int) return v;
  if (v is num) return v.toInt();
  if (v is String) return int.tryParse(v);
  return null;
}
