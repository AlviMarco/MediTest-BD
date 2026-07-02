class MedicineOrderItemModel {
  final String id;
  final String medicineId;
  final int quantity;
  final double unitPrice;
  final double discountedPrice;
  final double subtotal;

  MedicineOrderItemModel({
    required this.id,
    required this.medicineId,
    required this.quantity,
    required this.unitPrice,
    required this.discountedPrice,
    required this.subtotal,
  });

  factory MedicineOrderItemModel.fromJson(Map<String, dynamic> json) {
    double parseDouble(dynamic v) {
      if (v == null) return 0;
      if (v is num) return v.toDouble();
      return double.tryParse(v.toString()) ?? 0;
    }

    return MedicineOrderItemModel(
      id: json['id'],
      medicineId: json['medicine_id'],
      quantity: json['quantity'] ?? 1,
      unitPrice: parseDouble(json['unit_price']),
      discountedPrice: parseDouble(json['discounted_price']),
      subtotal: parseDouble(json['subtotal']),
    );
  }
}

class MedicineOrderModel {
  final String id;
  final String status;
  final double totalAmount;
  final String deliveryAddress;
  final String deliveryPhone;
  final String? notes;
  final String? cancellationReason;
  final DateTime createdAt;
  final List<MedicineOrderItemModel> items;

  MedicineOrderModel({
    required this.id,
    required this.status,
    required this.totalAmount,
    required this.deliveryAddress,
    required this.deliveryPhone,
    this.notes,
    this.cancellationReason,
    required this.createdAt,
    required this.items,
  });

  factory MedicineOrderModel.fromJson(Map<String, dynamic> json) {
    double parseDouble(dynamic v) {
      if (v == null) return 0;
      if (v is num) return v.toDouble();
      return double.tryParse(v.toString()) ?? 0;
    }

    return MedicineOrderModel(
      id: json['id'],
      status: json['status'] ?? 'pending',
      totalAmount: parseDouble(json['total_amount']),
      deliveryAddress: json['delivery_address'] ?? '',
      deliveryPhone: json['delivery_phone'] ?? '',
      notes: json['notes'],
      cancellationReason: json['cancellation_reason'],
      createdAt: DateTime.tryParse(json['created_at'] ?? '') ?? DateTime.now(),
      items: json['items'] != null
          ? (json['items'] as List)
                .map((e) => MedicineOrderItemModel.fromJson(e))
                .toList()
          : [],
    );
  }
}
