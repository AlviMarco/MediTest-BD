import 'package:flutter/material.dart';
import '../services/api_service.dart';

class ReferralListScreen extends StatefulWidget {
  const ReferralListScreen({super.key});

  @override
  State<ReferralListScreen> createState() => _ReferralListScreenState();
}

class _ReferralListScreenState extends State<ReferralListScreen> {
  bool _loading = true;
  String? _error;
  int _totalReferrals = 0;
  List<dynamic> _referredUsers = [];

  @override
  void initState() {
    super.initState();
    _loadStats();
  }

  Future<void> _loadStats() async {
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      final response = await ApiService.get('/users/referral-stats');
      setState(() {
        _totalReferrals = response['total_referrals'] ?? 0;
        _referredUsers = response['referred_users'] ?? [];
      });
    } catch (e) {
      setState(() {
        _error = e.toString().replaceFirst('Exception: ', '');
      });
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('আমার রেফার করা ব্যক্তিরা'),
        backgroundColor: Theme.of(context).colorScheme.primary,
        foregroundColor: Colors.white,
      ),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : _error != null
          ? Center(child: Text(_error!))
          : RefreshIndicator(
              onRefresh: _loadStats,
              child: ListView(
                padding: const EdgeInsets.all(16),
                children: [
                  Card(
                    color: Colors.amber.shade50,
                    child: Padding(
                      padding: const EdgeInsets.all(16),
                      child: Row(
                        children: [
                          const Icon(
                            Icons.group,
                            color: Colors.orange,
                            size: 28,
                          ),
                          const SizedBox(width: 12),
                          Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                '$_totalReferrals জন',
                                style: const TextStyle(
                                  fontSize: 18,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                              const Text(
                                'আপনার কোড দিয়ে রেজিস্টার করেছে',
                                style: TextStyle(
                                  fontSize: 12,
                                  color: Colors.grey,
                                ),
                              ),
                            ],
                          ),
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(height: 16),
                  if (_referredUsers.isEmpty)
                    const Padding(
                      padding: EdgeInsets.symmetric(vertical: 40),
                      child: Center(
                        child: Text(
                          'এখনো কেউ আপনার কোড ব্যবহার করেনি,আপনার কোডটি আপনার বন্দুদের সাথে শেয়ার করুন, এবং ৫০ হেলথ কয়েন পেয়ে যান, আপনার কোডে আপনার বন্ধুরা রেজিস্ট্রেশন করলে আপনার বন্ধুরা পাবে ২৫ হেলথ কয়েন আর আপনি পাচ্ছেন ৫০ হেলথ কয়েন, এটা দিয়ে আপনি বিভিন্ন কুপন কোড কিনতে পারবেন, যা দিয়ে আপনি ঔষধ ও মেডিটেস্ট বিডি এর যাবতীয় সেবা গুলোতে ডিসকাউন্ট পেয়ে যাবেন। মেডিটেস্ট বিডি ব্যাবহার করার জন্য আপনাকে অসংখ্য ধন্যবাদ। ',
                          style: TextStyle(color: Colors.grey),
                        ),
                      ),
                    )
                  else
                    ..._referredUsers.map(
                      (u) => Card(
                        margin: const EdgeInsets.only(bottom: 8),
                        child: ListTile(
                          leading: CircleAvatar(
                            backgroundColor: Theme.of(
                              context,
                            ).colorScheme.primary.withAlpha(30),
                            child: Text(
                              (u['name'] ?? '').toString().isNotEmpty
                                  ? u['name'][0]
                                  : '?',
                              style: TextStyle(
                                color: Theme.of(context).colorScheme.primary,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ),
                          title: Text(u['name'] ?? ''),
                          subtitle: Text(
                            _formatDate(u['created_at']),
                            style: const TextStyle(fontSize: 12),
                          ),
                          trailing: const Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Icon(
                                Icons.monetization_on,
                                color: Colors.orange,
                                size: 16,
                              ),
                              SizedBox(width: 4),
                              Text(
                                '+৫০',
                                style: TextStyle(fontWeight: FontWeight.w600),
                              ),
                            ],
                          ),
                        ),
                      ),
                    ),
                ],
              ),
            ),
    );
  }

  String _formatDate(String? dateStr) {
    if (dateStr == null) return '';
    final date = DateTime.tryParse(dateStr);
    if (date == null) return '';
    return '${date.day}/${date.month}/${date.year}';
  }
}
