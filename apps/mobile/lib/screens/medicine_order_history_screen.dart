import 'package:flutter/material.dart';
import '../services/api_service.dart';
import '../models/medicine_order_model.dart';
import 'dart:async';

const Map<String, String> _statusLabels = {
  'pending': 'অপেক্ষায়',
  'confirmed': 'নিশ্চিত',
  'delivered': 'ডেলিভারি হয়েছে',
  'cancelled': 'বাতিল',
};

const Map<String, Color> _statusColors = {
  'pending': Colors.orange,
  'confirmed': Colors.green,
  'delivered': Colors.blue,
  'cancelled': Colors.red,
};

class MedicineOrderHistoryScreen extends StatefulWidget {
  const MedicineOrderHistoryScreen({super.key});

  @override
  State<MedicineOrderHistoryScreen> createState() =>
      _MedicineOrderHistoryScreenState();
}

class _MedicineOrderHistoryScreenState
    extends State<MedicineOrderHistoryScreen> {
  List<MedicineOrderModel> _orders = [];
  bool _loading = true;
  String? _error;
  Timer? _pollTimer;

  @override
  void initState() {
    super.initState();
    _loadOrders();
    // প্রতি ১০ সেকেন্ডে background-এ check করবে status পরিবর্তন হয়েছে কিনা
    _pollTimer = Timer.periodic(const Duration(seconds: 10), (timer) {
      _loadOrders(silent: true);
    });
  }

  @override
  void dispose() {
    _pollTimer?.cancel();
    super.dispose();
  }

  Future<void> _loadOrders({bool silent = false}) async {
    if (!silent) {
      setState(() {
        _loading = true;
        _error = null;
      });
    }
    try {
      final user = await ApiService.getUser();
      if (user == null) return;
      final response = await ApiService.get(
        '/medicine-orders/user/${user['id']}',
      );
      setState(() {
        _orders = (response as List)
            .map((e) => MedicineOrderModel.fromJson(e))
            .toList();
      });
    } catch (e) {
      setState(() {
        _error = e.toString().replaceFirst('Exception: ', '');
      });
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  Future<void> _cancelOrder(String orderId) async {
    try {
      await ApiService.put('/medicine-orders/$orderId/cancel', {});
      _loadOrders();
      if (!mounted) return;
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(const SnackBar(content: Text('অর্ডার বাতিল করা হয়েছে')));
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(e.toString().replaceFirst('Exception: ', ''))),
      );
    }
  }

  void _confirmCancel(MedicineOrderModel order) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('অর্ডার বাতিল করবেন?'),
        content: const Text('আপনি কি নিশ্চিত যে এই অর্ডারটি বাতিল করতে চান?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('না'),
          ),
          TextButton(
            onPressed: () {
              Navigator.pop(context);
              _cancelOrder(order.id);
            },
            child: const Text(
              'হ্যাঁ, বাতিল করুন',
              style: TextStyle(color: Colors.red),
            ),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('আমার মেডিসিন অর্ডার'),
        backgroundColor: Theme.of(context).colorScheme.primary,
        foregroundColor: Colors.white,
      ),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : _error != null
          ? Center(child: Text(_error!))
          : _orders.isEmpty
          ? const Center(
              child: Text(
                'কোনো অর্ডার পাওয়া যায়নি',
                style: TextStyle(color: Colors.grey),
              ),
            )
          : RefreshIndicator(
              onRefresh: _loadOrders,
              child: ListView.builder(
                padding: const EdgeInsets.all(12),
                itemCount: _orders.length,
                itemBuilder: (context, index) {
                  return _buildOrderCard(_orders[index]);
                },
              ),
            ),
    );
  }

  Widget _buildOrderCard(MedicineOrderModel order) {
    final color = _statusColors[order.status] ?? Colors.grey;
    final label = _statusLabels[order.status] ?? order.status;

    return Card(
      margin: const EdgeInsets.only(bottom: 10),
      child: Padding(
        padding: const EdgeInsets.all(12),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Text(
                  '${order.createdAt.day}/${order.createdAt.month}/${order.createdAt.year}',
                  style: const TextStyle(fontSize: 12, color: Colors.grey),
                ),
                const Spacer(),
                Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 8,
                    vertical: 3,
                  ),
                  decoration: BoxDecoration(
                    color: color.withAlpha(30),
                    borderRadius: BorderRadius.circular(6),
                  ),
                  child: Text(
                    label,
                    style: TextStyle(
                      fontSize: 11,
                      color: color,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 8),
            ...order.items.map(
              (item) => Padding(
                padding: const EdgeInsets.symmetric(vertical: 2),
                child: Row(
                  children: [
                    const Icon(Icons.medication, size: 14, color: Colors.teal),
                    const SizedBox(width: 6),
                    Text(
                      'পরিমাণ: ${item.quantity} × ৳${item.discountedPrice > 0 ? item.discountedPrice.toStringAsFixed(2) : item.unitPrice.toStringAsFixed(2)}',
                      style: const TextStyle(fontSize: 13),
                    ),
                    const Spacer(),
                    Text(
                      '৳${item.subtotal.toStringAsFixed(2)}',
                      style: const TextStyle(
                        fontSize: 13,
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                  ],
                ),
              ),
            ),
            const Divider(height: 16),
            Row(
              children: [
                const Icon(
                  Icons.location_on_outlined,
                  size: 14,
                  color: Colors.grey,
                ),
                const SizedBox(width: 4),
                Expanded(
                  child: Text(
                    order.deliveryAddress,
                    style: const TextStyle(fontSize: 12, color: Colors.grey),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 4),
            Row(
              children: [
                const Icon(Icons.phone_outlined, size: 14, color: Colors.grey),
                const SizedBox(width: 4),
                Text(
                  order.deliveryPhone,
                  style: const TextStyle(fontSize: 12, color: Colors.grey),
                ),
              ],
            ),
            if (order.notes != null && order.notes!.isNotEmpty) ...[
              const SizedBox(height: 4),
              Text(
                'নোট: ${order.notes}',
                style: const TextStyle(fontSize: 12, color: Colors.grey),
              ),
            ],
            if (order.cancellationReason != null &&
                order.cancellationReason!.isNotEmpty) ...[
              const SizedBox(height: 4),
              Text(
                'বাতিলের কারণ: ${order.cancellationReason}',
                style: const TextStyle(fontSize: 12, color: Colors.red),
              ),
            ],
            const SizedBox(height: 8),
            Row(
              children: [
                const Spacer(),
                Text(
                  'মোট: ৳${order.totalAmount.toStringAsFixed(2)}',
                  style: const TextStyle(
                    fontWeight: FontWeight.bold,
                    fontSize: 14,
                  ),
                ),
              ],
            ),
            if (order.status == 'pending') ...[
              const SizedBox(height: 8),
              SizedBox(
                width: double.infinity,
                child: OutlinedButton(
                  onPressed: () => _confirmCancel(order),
                  style: OutlinedButton.styleFrom(foregroundColor: Colors.red),
                  child: const Text('অর্ডার বাতিল করুন'),
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }
}
