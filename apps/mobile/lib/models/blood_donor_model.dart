class BloodDonorModel {
  final String id;
  final String userId;
  final String name;
  final String phone;
  final String bloodGroup;
  final String division;
  final String district;
  final String upazilla;
  final String? unionName;
  final bool isAvailable;

  BloodDonorModel({
    required this.id,
    required this.userId,
    required this.name,
    required this.phone,
    required this.bloodGroup,
    required this.division,
    required this.district,
    required this.upazilla,
    this.unionName,
    required this.isAvailable,
  });

  factory BloodDonorModel.fromJson(Map<String, dynamic> json) {
    return BloodDonorModel(
      id: json['id'],
      userId: json['user_id'],
      name: json['name'],
      phone: json['phone'],
      bloodGroup: json['blood_group'],
      division: json['division'],
      district: json['district'],
      upazilla: json['upazilla'],
      unionName: json['union_name'],
      isAvailable: json['is_available'] ?? true,
    );
  }
}
