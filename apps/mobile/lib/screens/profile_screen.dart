import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../services/api_service.dart';
import 'login_screen.dart';
import 'medicine_order_history_screen.dart';
import 'referral_list_screen.dart';
import 'my_donor_profile_screen.dart';

class ProfileScreen extends StatefulWidget {
  const ProfileScreen({super.key});

  @override
  State<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen> {
  Map<String, dynamic>? _user;

  @override
  void initState() {
    super.initState();
    _loadUser();
  }

  Future<void> _loadUser() async {
    final user = await ApiService.getUser();
    setState(() {
      _user = user;
    });
  }

  Future<void> _logout() async {
    await ApiService.logout();
    if (!mounted) return;
    Navigator.pushAndRemoveUntil(
      context,
      MaterialPageRoute(builder: (context) => const LoginScreen()),
      (route) => false,
    );
  }

  Widget _buildReferralCard() {
    final code = _user!['referral_code'] as String;
    final coins = _user!['health_coins'] ?? 0;
    return Card(
      color: Colors.amber.shade50,
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                const Icon(Icons.card_giftcard, color: Colors.orange),
                const SizedBox(width: 8),
                const Expanded(
                  child: Text(
                    'আপনার রেফারেল কোড',
                    style: TextStyle(fontWeight: FontWeight.w600, fontSize: 13),
                  ),
                ),
                Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 8,
                    vertical: 4,
                  ),
                  decoration: BoxDecoration(
                    color: Colors.orange,
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: Row(
                    children: [
                      const Icon(
                        Icons.monetization_on,
                        color: Colors.white,
                        size: 14,
                      ),
                      const SizedBox(width: 4),
                      Text(
                        '$coins',
                        style: const TextStyle(
                          color: Colors.white,
                          fontWeight: FontWeight.bold,
                          fontSize: 12,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
            const SizedBox(height: 4),
            const Text(
              'বন্ধুদের শেয়ার করুন, তারা রেজিস্টার করলে আপনি ৫০ এবং তারা ২৫ হেলথ কয়েন পাবে',
              style: TextStyle(fontSize: 11, color: Colors.grey),
            ),
            const SizedBox(height: 10),
            Container(
              width: double.infinity,
              padding: const EdgeInsets.symmetric(vertical: 10),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(8),
                border: Border.all(color: Colors.orange.shade200),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Text(
                    code,
                    style: const TextStyle(
                      fontWeight: FontWeight.bold,
                      fontSize: 16,
                      letterSpacing: 2,
                    ),
                  ),
                  const SizedBox(width: 12),
                  GestureDetector(
                    onTap: () {
                      Clipboard.setData(ClipboardData(text: code));
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(content: Text('কোড কপি করা হয়েছে')),
                      );
                    },
                    child: const Icon(
                      Icons.copy,
                      size: 18,
                      color: Colors.orange,
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 8),
            SizedBox(
              width: double.infinity,
              child: TextButton.icon(
                onPressed: () {
                  Navigator.push(
                    context,
                    MaterialPageRoute(
                      builder: (context) => const ReferralListScreen(),
                    ),
                  );
                },
                icon: const Icon(Icons.people_outline, size: 18),
                label: const Text('আমার রেফার করা ব্যক্তিরা'),
              ),
            ),
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    if (_user == null) {
      return const Center(child: CircularProgressIndicator());
    }

    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        children: [
          const SizedBox(height: 16),
          CircleAvatar(
            radius: 36,
            backgroundColor: Theme.of(
              context,
            ).colorScheme.primary.withAlpha(30),
            child: Text(
              (_user!['name'] ?? '').toString().isNotEmpty
                  ? _user!['name'][0]
                  : '?',
              style: TextStyle(
                fontSize: 28,
                fontWeight: FontWeight.bold,
                color: Theme.of(context).colorScheme.primary,
              ),
            ),
          ),
          const SizedBox(height: 12),
          Text(
            _user!['name'] ?? '',
            style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
          ),
          Text(
            _user!['phone'] ?? _user!['email'] ?? '',
            style: const TextStyle(color: Colors.grey),
          ),

          const SizedBox(height: 16),
          if (_user!['referral_code'] != null) _buildReferralCard(),
          const SizedBox(height: 24),

           _buildMenuItem(
            Icons.bloodtype_outlined,
            'আমার রক্তদান প্রোফাইল',
            () {
              Navigator.push(
                context,
                MaterialPageRoute(
                  builder: (context) => const MyDonorProfileScreen(),
                ),
              );
            },
          ),

          _buildMenuItem(Icons.medication_outlined, 'আমার মেডিসিন অর্ডার', () {
            Navigator.push(
              context,
              MaterialPageRoute(
                builder: (context) => const MedicineOrderHistoryScreen(),
              ),
            );
          }),
          _buildMenuItem(Icons.edit_outlined, 'প্রোফাইল এডিট', () {}),

          const SizedBox(height: 16),
          _buildMenuItem(Icons.logout, 'লগআউট', _logout, color: Colors.red),
        ],
      ),
    );
  }

  Widget _buildMenuItem(
    IconData icon,
    String title,
    VoidCallback onTap, {
    Color? color,
  }) {
    return Card(
      margin: const EdgeInsets.only(bottom: 8),
      child: ListTile(
        leading: Icon(icon, color: color),
        title: Text(title, style: TextStyle(color: color)),
        trailing: const Icon(Icons.chevron_right, size: 18),
        onTap: onTap,
      ),
    );
  }
}
