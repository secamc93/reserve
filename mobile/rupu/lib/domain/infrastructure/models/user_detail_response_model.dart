import 'users_response_model.dart';

class UserDetailResponseModel {
  final bool success;
  final UserModel? data;
  final String? message;

  const UserDetailResponseModel({
    required this.success,
    this.data,
    this.message,
  });

  factory UserDetailResponseModel.fromJson(Map<String, dynamic> json) {
    final dataJson = json['data'];
    return UserDetailResponseModel(
      success: json['success'] as bool? ?? false,
      data:
          dataJson is Map<String, dynamic> ? UserModel.fromJson(dataJson) : null,
      message: json['message'] as String?,
    );
  }

  Map<String, dynamic> toJson() => {
        'success': success,
        if (data != null) 'data': data!.toJson(),
        if (message != null) 'message': message,
      };
}
