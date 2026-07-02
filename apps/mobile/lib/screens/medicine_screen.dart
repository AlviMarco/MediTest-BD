import 'package:flutter/material.dart';
import '../services/api_service.dart';
import '../models/medicine_model.dart';
import '../models/bd_address_data.dart';

class MedicineScreen extends StatefulWidget {
  const MedicineScreen({super.key});

  @override
  State<MedicineScreen> createState() => _MedicineScreenState();
}

class _MedicineScreenState extends State<MedicineScreen> {
  List<MedicineModel> _medicines = [];
  bool _loading = true;

  // cart: medicine id -> CartItem
  final Map<String, CartItem> _cart = {};

  @override
  void initState() {
    super.initState();
    _loadMedicines();
  }

  Future<void> _loadMedicines({String? keyword}) async {
    setState(() => _loading = true);
    try {
      final endpoint = (keyword != null && keyword.isNotEmpty)
          ? '/medicines/search?keyword=${Uri.encodeComponent(keyword)}'
          : '/medicines';
      final response = await ApiService.get(endpoint);
      setState(() {
        _medicines = (response as List)
            .map((e) => MedicineModel.fromJson(e))
            .toList();
      });
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(e.toString().replaceFirst('Exception: ', ''))),
      );
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  void _addToCart(MedicineModel medicine) {
    setState(() {
      if (_cart.containsKey(medicine.id)) {
        _cart[medicine.id]!.quantity++;
      } else {
        _cart[medicine.id] = CartItem(medicine: medicine);
      }
    });
  }

  void _removeFromCart(MedicineModel medicine) {
    setState(() {
      if (!_cart.containsKey(medicine.id)) return;
      if (_cart[medicine.id]!.quantity > 1) {
        _cart[medicine.id]!.quantity--;
      } else {
        _cart.remove(medicine.id);
      }
    });
  }

  int get _cartCount =>
      _cart.values.fold(0, (sum, item) => sum + item.quantity);

  double get _cartTotal =>
      _cart.values.fold(0, (sum, item) => sum + item.subtotal);

  void _openCart() {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      builder: (context) => _CartSheet(
        cart: _cart,
        onCheckoutSuccess: () {
          setState(() => _cart.clear());
        },
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Stack(
      children: [
        Column(
          children: [
            Padding(
              padding: const EdgeInsets.all(12),
              child: TextField(
                decoration: InputDecoration(
                  hintText: 'মেডিসিন খুঁজুন...',
                  prefixIcon: const Icon(Icons.search),
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(10),
                  ),
                  isDense: true,
                ),

                onSubmitted: (value) {
                  _loadMedicines(keyword: value);
                },
              ),
            ),
            Expanded(
              child: _loading
                  ? const Center(child: CircularProgressIndicator())
                  : _medicines.isEmpty
                  ? const Center(
                      child: Text(
                        'কোনো মেডিসিন পাওয়া যায়নি',
                        style: TextStyle(color: Colors.grey),
                      ),
                    )
                  : ListView.builder(
                      padding: const EdgeInsets.only(bottom: 80),
                      itemCount: _medicines.length,
                      itemBuilder: (context, index) {
                        return _buildMedicineCard(_medicines[index]);
                      },
                    ),
            ),
          ],
        ),

        // Floating cart bar
        if (_cartCount > 0)
          Positioned(
            bottom: 16,
            left: 16,
            right: 16,
            child: Material(
              elevation: 4,
              borderRadius: BorderRadius.circular(12),
              color: Theme.of(context).colorScheme.primary,
              child: InkWell(
                onTap: _openCart,
                borderRadius: BorderRadius.circular(12),
                child: Padding(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 16,
                    vertical: 14,
                  ),
                  child: Row(
                    children: [
                      Text(
                        'কার্টে: $_cartCount আইটেম',
                        style: const TextStyle(
                          color: Colors.white,
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                      const Spacer(),
                      Text(
                        '৳${_cartTotal.toStringAsFixed(2)}',
                        style: const TextStyle(
                          color: Colors.white,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      const SizedBox(width: 8),
                      const Icon(
                        Icons.shopping_cart,
                        color: Colors.white,
                        size: 18,
                      ),
                    ],
                  ),
                ),
              ),
            ),
          ),
      ],
    );
  }

  Widget _buildMedicineCard(MedicineModel medicine) {
    final inCart = _cart.containsKey(medicine.id);
    final qty = inCart ? _cart[medicine.id]!.quantity : 0;

    return Card(
      margin: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
      child: Padding(
        padding: const EdgeInsets.all(12),
        child: Row(
          children: [
            Container(
              width: 44,
              height: 44,
              decoration: BoxDecoration(
                color: Colors.teal.shade50,
                borderRadius: BorderRadius.circular(8),
              ),
              child: const Icon(Icons.medication, color: Colors.teal),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    medicine.brandName,
                    style: const TextStyle(
                      fontWeight: FontWeight.w600,
                      fontSize: 14,
                    ),
                  ),
                  Text(
                    medicine.genericName,
                    style: const TextStyle(fontSize: 11, color: Colors.grey),
                  ),
                  const SizedBox(height: 4),
                  Row(
                    children: [
                      Text(
                        '৳${medicine.effectivePrice.toStringAsFixed(2)}',
                        style: const TextStyle(
                          fontWeight: FontWeight.bold,
                          fontSize: 13,
                        ),
                      ),
                      if (medicine.discountPercent > 0) ...[
                        const SizedBox(width: 6),
                        Text(
                          '৳${medicine.price.toStringAsFixed(2)}',
                          style: const TextStyle(
                            fontSize: 11,
                            color: Colors.grey,
                            decoration: TextDecoration.lineThrough,
                          ),
                        ),
                        const SizedBox(width: 4),
                        Text(
                          '(${medicine.discountPercent.toStringAsFixed(0)}% ছাড়)',
                          style: const TextStyle(
                            fontSize: 11,
                            color: Colors.green,
                          ),
                        ),
                      ],
                    ],
                  ),
                  if (medicine.requiresPrescription)
                    const Padding(
                      padding: EdgeInsets.only(top: 4),
                      child: Text(
                        'প্রেসক্রিপশন প্রয়োজন',
                        style: TextStyle(fontSize: 10, color: Colors.orange),
                      ),
                    ),
                ],
              ),
            ),
            if (!medicine.isAvailable)
              const Text(
                'স্টকে নেই',
                style: TextStyle(fontSize: 11, color: Colors.red),
              )
            else if (qty == 0)
              IconButton(
                icon: const Icon(Icons.add_shopping_cart, color: Colors.teal),
                onPressed: () => _addToCart(medicine),
              )
            else
              Row(
                children: [
                  IconButton(
                    icon: const Icon(Icons.remove_circle_outline, size: 20),
                    onPressed: () => _removeFromCart(medicine),
                  ),
                  Text(
                    '$qty',
                    style: const TextStyle(fontWeight: FontWeight.w600),
                  ),
                  IconButton(
                    icon: const Icon(Icons.add_circle_outline, size: 20),
                    onPressed: () => _addToCart(medicine),
                  ),
                ],
              ),
          ],
        ),
      ),
    );
  }
}

// Bottom sheet for cart + checkout
class _CartSheet extends StatefulWidget {
  final Map<String, CartItem> cart;
  final VoidCallback onCheckoutSuccess;

  const _CartSheet({required this.cart, required this.onCheckoutSuccess});

  @override
  State<_CartSheet> createState() => _CartSheetState();
}

class _CartSheetState extends State<_CartSheet> {
  final _phoneController = TextEditingController();
  final _unionController = TextEditingController();
  final _couponController = TextEditingController();
  final _notesController = TextEditingController(
    text: 'দয়া করে সন্ধ্যা ৬ টার পর ডেলিভারি দিবেন।',
  );

  String? _selectedDivision;
  String? _selectedDistrict;
  String? _selectedUpazilla;

  bool _placing = false;
  bool _loadingUser = true;

  // Delivery + coupon state
  double _deliveryCharge = 0;
  bool _loadingDelivery = false;

  double _discountAmount = 0;
  String? _appliedCouponCode;
  bool _checkingCoupon = false;
  String? _couponMessage;
  bool _couponValid = false;

  List<String> get _districts {
    if (_selectedDivision == null) return [];
    return bdAddress[_selectedDivision]!.keys.toList();
  }

  List<String> get _upazillas {
    if (_selectedDivision == null || _selectedDistrict == null) return [];
    return bdAddress[_selectedDivision]![_selectedDistrict] ?? [];
  }

  @override
  void initState() {
    super.initState();
    _prefillFromUser();
  }

  Future<void> _prefillFromUser() async {
    final user = await ApiService.getUser();
    if (user != null) {
      setState(() {
        _phoneController.text = user['phone'] ?? '';
        _selectedDivision = user['division'];
        _selectedDistrict = user['district'];
        _selectedUpazilla = user['upazilla'];
        _unionController.text = user['union_name'] ?? '';
      });
      if (_selectedDistrict != null) {
        _fetchDeliveryCharge();
      }
    }
    setState(() => _loadingUser = false);
  }

  double get _subtotal =>
      widget.cart.values.fold(0, (sum, item) => sum + item.subtotal);

  double get _total =>
      (_subtotal + _deliveryCharge - _discountAmount).clamp(0, double.infinity);

  Future<void> _fetchDeliveryCharge() async {
    if (_selectedDistrict == null) return;
    setState(() => _loadingDelivery = true);
    try {
      final zones = await ApiService.get('/delivery-zones');
      final zoneList = zones as List;

      Map<String, dynamic>? matchedZone;
      for (final z in zoneList) {
        if (z['district'] == _selectedDistrict && z['is_active'] == true) {
          matchedZone = z;
          break;
        }
      }
      matchedZone ??= zoneList.firstWhere(
        (z) => z['district'] == 'DEFAULT' && z['is_active'] == true,
        orElse: () => null,
      );

      if (matchedZone != null) {
        final threshold =
            double.tryParse(
              matchedZone['free_delivery_threshold'].toString(),
            ) ??
            0;
        final charge =
            double.tryParse(matchedZone['delivery_charge'].toString()) ?? 0;

        setState(() {
          _deliveryCharge = (threshold > 0 && _subtotal >= threshold)
              ? 0
              : charge;
        });
      } else {
        setState(() => _deliveryCharge = 0);
      }
    } catch (e) {
      setState(() => _deliveryCharge = 0);
    } finally {
      if (mounted) setState(() => _loadingDelivery = false);
    }
  }

  Future<void> _applyCoupon() async {
    final code = _couponController.text.trim();
    if (code.isEmpty) return;

    setState(() {
      _checkingCoupon = true;
      _couponMessage = null;
    });

    try {
      final response = await ApiService.post('/coupons/validate', {
        'code': code,
        'order_amount': _subtotal,
      });

      final valid = response['valid'] == true;

      setState(() {
        _couponValid = valid;
        if (valid) {
          _discountAmount =
              double.tryParse(response['discount_amount'].toString()) ?? 0;
          if (response['free_delivery'] == true) {
            _deliveryCharge = 0;
          }
          _appliedCouponCode = code.toUpperCase();
          _couponMessage = 'কুপন প্রযোজ্য হয়েছে! 🎉';
        } else {
          _discountAmount = 0;
          _appliedCouponCode = null;
          _couponMessage = response['message'] ?? 'কুপন প্রযোজ্য নয়';
        }
      });
    } catch (e) {
      setState(() {
        _couponValid = false;
        _discountAmount = 0;
        _appliedCouponCode = null;
        _couponMessage = e.toString().replaceFirst('Exception: ', '');
      });
    } finally {
      if (mounted) setState(() => _checkingCoupon = false);
    }
  }

  void _removeCoupon() {
    setState(() {
      _appliedCouponCode = null;
      _discountAmount = 0;
      _couponMessage = null;
      _couponValid = false;
      _couponController.clear();
    });
    _fetchDeliveryCharge(); // recalculate delivery in case coupon gave free delivery
  }

  Future<void> _placeOrder() async {
    final phone = _phoneController.text.trim();

    if (phone.isEmpty) {
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(const SnackBar(content: Text('ফোন নাম্বার দিতে হবে')));
      return;
    }
    if (_selectedDivision == null ||
        _selectedDistrict == null ||
        _selectedUpazilla == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('বিভাগ, জেলা এবং উপজেলা সিলেক্ট করুন')),
      );
      return;
    }

    setState(() => _placing = true);

    try {
      final items = widget.cart.values
          .map(
            (item) => {
              'medicine_id': item.medicine.id,
              'quantity': item.quantity,
            },
          )
          .toList();

      final addressParts = [
        _selectedUpazilla,
        if (_unionController.text.trim().isNotEmpty)
          _unionController.text.trim(),
        _selectedDistrict,
        _selectedDivision,
      ];
      final fullAddress = addressParts.join(', ');

      await ApiService.post('/medicine-orders', {
        'items': items,
        'delivery_address': fullAddress,
        'district': _selectedDistrict,
        'delivery_phone': phone,
        if (_notesController.text.trim().isNotEmpty)
          'notes': _notesController.text.trim(),
        if (_appliedCouponCode != null) 'coupon_code': _appliedCouponCode,
      });

      if (!mounted) return;
      Navigator.pop(context);
      widget.onCheckoutSuccess();
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('অর্ডার সফলভাবে দেওয়া হয়েছে')),
      );
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(e.toString().replaceFirst('Exception: ', ''))),
      );
    } finally {
      if (mounted) setState(() => _placing = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_loadingUser) {
      return const SizedBox(
        height: 200,
        child: Center(child: CircularProgressIndicator()),
      );
    }

    return Padding(
      padding: EdgeInsets.only(
        left: 16,
        right: 16,
        top: 16,
        bottom: MediaQuery.of(context).viewInsets.bottom + 16,
      ),
      child: SingleChildScrollView(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          mainAxisSize: MainAxisSize.min,
          children: [
            const Text(
              'আপনার কার্ট',
              style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 12),

            ...widget.cart.values.map(
              (item) => Padding(
                padding: const EdgeInsets.symmetric(vertical: 4),
                child: Row(
                  children: [
                    Expanded(
                      child: Text(
                        '${item.medicine.brandName} x${item.quantity}',
                        style: const TextStyle(fontSize: 13),
                      ),
                    ),
                    Text(
                      '৳${item.subtotal.toStringAsFixed(2)}',
                      style: const TextStyle(
                        fontSize: 13,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ],
                ),
              ),
            ),

            const Divider(),

            const SizedBox(height: 4),
            const Text(
              'ডেলিভারি ঠিকানা',
              style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600),
            ),
            const SizedBox(height: 8),

            DropdownButtonFormField<String>(
              initialValue: _selectedDivision,
              decoration: const InputDecoration(
                labelText: 'বিভাগ *',
                border: OutlineInputBorder(),
                isDense: true,
              ),
              items: bdAddress.keys
                  .map((d) => DropdownMenuItem(value: d, child: Text(d)))
                  .toList(),
              onChanged: (val) {
                setState(() {
                  _selectedDivision = val;
                  _selectedDistrict = null;
                  _selectedUpazilla = null;
                });
              },
            ),
            const SizedBox(height: 10),

            DropdownButtonFormField<String>(
              initialValue: _selectedDistrict,
              decoration: const InputDecoration(
                labelText: 'জেলা *',
                border: OutlineInputBorder(),
                isDense: true,
              ),
              items: _districts
                  .map((d) => DropdownMenuItem(value: d, child: Text(d)))
                  .toList(),
              onChanged: _selectedDivision == null
                  ? null
                  : (val) {
                      setState(() {
                        _selectedDistrict = val;
                        _selectedUpazilla = null;
                      });
                      _fetchDeliveryCharge();
                    },
            ),
            const SizedBox(height: 10),

            DropdownButtonFormField<String>(
              initialValue: _selectedUpazilla,
              decoration: const InputDecoration(
                labelText: 'উপজেলা *',
                border: OutlineInputBorder(),
                isDense: true,
              ),
              items: _upazillas
                  .map((u) => DropdownMenuItem(value: u, child: Text(u)))
                  .toList(),
              onChanged: _selectedDistrict == null
                  ? null
                  : (val) => setState(() => _selectedUpazilla = val),
            ),
            const SizedBox(height: 10),

            TextField(
              controller: _unionController,
              decoration: const InputDecoration(
                labelText: 'ইউনিয়ন/ওয়ার্ড (ঐচ্ছিক)',
                border: OutlineInputBorder(),
                isDense: true,
              ),
            ),
            const SizedBox(height: 16),

            TextField(
              controller: _phoneController,
              keyboardType: TextInputType.phone,
              decoration: const InputDecoration(
                labelText: 'ফোন নাম্বার *',
                border: OutlineInputBorder(),
                isDense: true,
              ),
            ),
            const SizedBox(height: 10),
            TextField(
              controller: _notesController,
              decoration: const InputDecoration(
                labelText: 'নোট (ঐচ্ছিক)',
                border: OutlineInputBorder(),
                isDense: true,
              ),
              maxLines: 2,
            ),
            const SizedBox(height: 16),

            const Text(
              'কুপন কোড',
              style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600),
            ),
            const SizedBox(height: 8),
            Row(
              children: [
                Expanded(
                  child: TextField(
                    controller: _couponController,
                    enabled: _appliedCouponCode == null,
                    decoration: const InputDecoration(
                      hintText: 'কুপন কোড থাকলে লিখুন',
                      border: OutlineInputBorder(),
                      isDense: true,
                    ),
                  ),
                ),
                const SizedBox(width: 8),
                SizedBox(
                  height: 44,
                  child: _appliedCouponCode != null
                      ? OutlinedButton(
                          onPressed: _removeCoupon,
                          style: OutlinedButton.styleFrom(
                            foregroundColor: Colors.red,
                          ),
                          child: const Text('সরান'),
                        )
                      : ElevatedButton(
                          onPressed: _checkingCoupon ? null : _applyCoupon,
                          child: _checkingCoupon
                              ? const SizedBox(
                                  width: 16,
                                  height: 16,
                                  child: CircularProgressIndicator(
                                    strokeWidth: 2,
                                  ),
                                )
                              : const Text('প্রয়োগ'),
                        ),
                ),
              ],
            ),
            if (_couponMessage != null)
              Padding(
                padding: const EdgeInsets.only(top: 6),
                child: Text(
                  _couponMessage!,
                  style: TextStyle(
                    fontSize: 12,
                    color: _couponValid ? Colors.green : Colors.red,
                  ),
                ),
              ),

            const SizedBox(height: 16),
            const Divider(),

            Row(
              children: [
                const Text('সাবটোটাল', style: TextStyle(fontSize: 13)),
                const Spacer(),
                Text(
                  '৳${_subtotal.toStringAsFixed(2)}',
                  style: const TextStyle(fontSize: 13),
                ),
              ],
            ),
            const SizedBox(height: 4),
            Row(
              children: [
                const Text('ডেলিভারি চার্জ', style: TextStyle(fontSize: 13)),
                const Spacer(),
                _loadingDelivery
                    ? const SizedBox(
                        width: 14,
                        height: 14,
                        child: CircularProgressIndicator(strokeWidth: 2),
                      )
                    : Text(
                        _deliveryCharge == 0
                            ? 'ফ্রি'
                            : '৳${_deliveryCharge.toStringAsFixed(2)}',
                        style: TextStyle(
                          fontSize: 13,
                          color: _deliveryCharge == 0 ? Colors.green : null,
                        ),
                      ),
              ],
            ),
            if (_discountAmount > 0) ...[
              const SizedBox(height: 4),
              Row(
                children: [
                  const Text(
                    'কুপন ছাড়',
                    style: TextStyle(fontSize: 13, color: Colors.green),
                  ),
                  const Spacer(),
                  Text(
                    '- ৳${_discountAmount.toStringAsFixed(2)}',
                    style: const TextStyle(fontSize: 13, color: Colors.green),
                  ),
                ],
              ),
            ],
            const Divider(),
            Row(
              children: [
                const Text(
                  'মোট',
                  style: TextStyle(fontWeight: FontWeight.bold),
                ),
                const Spacer(),
                Text(
                  '৳${_total.toStringAsFixed(2)}',
                  style: const TextStyle(
                    fontWeight: FontWeight.bold,
                    fontSize: 16,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),

            SizedBox(
              height: 48,
              child: ElevatedButton(
                onPressed: _placing ? null : _placeOrder,
                style: ElevatedButton.styleFrom(
                  backgroundColor: Theme.of(context).colorScheme.primary,
                  foregroundColor: Colors.white,
                ),
                child: _placing
                    ? const SizedBox(
                        width: 20,
                        height: 20,
                        child: CircularProgressIndicator(
                          color: Colors.white,
                          strokeWidth: 2,
                        ),
                      )
                    : const Text('অর্ডার নিশ্চিত করুন'),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
