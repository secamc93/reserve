class SimpleResponseModel {
  final bool success;
  final String? message;

  const SimpleResponseModel({
    required this.success,
    this.message,
  });

  factory SimpleResponseModel.fromJson(Map<String, dynamic> json) {
    return SimpleResponseModel(
      success: json['success'] as bool? ?? false,
      message: json['message'] as String?,
    );
  }

  Map<String, dynamic> toJson() => {
        'success': success,
        if (message != null) 'message': message,
      };
}
