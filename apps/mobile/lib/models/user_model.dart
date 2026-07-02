class UserModel {
  final String id;
  final String name;
  final String? email;
  final String? phone;
  final int roleId;

  UserModel({
    required this.id,
    required this.name,
    this.email,
    this.phone,
    required this.roleId,
  });

  factory UserModel.fromJson(Map<String, dynamic> json) {
    return UserModel(
      id: json['id'],
      name: json['name'],
      email: json['email'],
      phone: json['phone'],
      roleId: json['role_id'] is int
          ? json['role_id']
          : int.tryParse(json['role_id'].toString()) ?? 4,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'email': email,
      'phone': phone,
      'role_id': roleId,
    };
  }
}
