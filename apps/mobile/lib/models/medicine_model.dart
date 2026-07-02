class MedicineModel {
  final String id;
  final String brandName;
  final String genericName;
  final String? manufacturer;
  final String? dosageForm;
  final String? strength;
  final double price;
  final double discountPercent;
  final double discountedPrice;
  final bool isAvailable;
  final bool requiresPrescription;

  MedicineModel({
    required this.id,
    required this.brandName,
    required this.genericName,
    this.manufacturer,
    this.dosageForm,
    this.strength,
    required this.price,
    required this.discountPercent,
    required this.discountedPrice,
    required this.isAvailable,
    required this.requiresPrescription,
  });

  // Effective price — discounted_price if set and > 0, otherwise price
  double get effectivePrice => discountedPrice > 0 ? discountedPrice : price;

  factory MedicineModel.fromJson(Map<String, dynamic> json) {
    double parseDouble(dynamic v) {
      if (v == null) return 0;
      if (v is num) return v.toDouble();
      return double.tryParse(v.toString()) ?? 0;
    }

    return MedicineModel(
      id: json['id'],
      brandName: json['brand_name'] ?? '',
      genericName: json['generic_name'] ?? '',
      manufacturer: json['manufacturer'],
      dosageForm: json['dosage_form'],
      strength: json['strength'],
      price: parseDouble(json['price']),
      discountPercent: parseDouble(json['discount_percent']),
      discountedPrice: parseDouble(json['discounted_price']),
      isAvailable: json['is_available'] ?? true,
      requiresPrescription: json['requires_prescription'] ?? false,
    );
  }
}

// Represents one line item in the cart (medicine + chosen quantity)
class CartItem {
  final MedicineModel medicine;
  int quantity;

  CartItem({required this.medicine, this.quantity = 1});

  double get subtotal => medicine.effectivePrice * quantity;
}
