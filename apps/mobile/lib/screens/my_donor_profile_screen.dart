import 'package:flutter/material.dart';
import '../services/api_service.dart';
import '../models/blood_donor_model.dart';

class MyDonorProfileScreen extends StatefulWidget {
  const MyDonorProfileScreen({super.key});

  @override
  State<MyDonorProfileScreen> createState() => _MyDonorProfileScreenState();
}

class _MyDonorProfileScreenState extends State<MyDonorProfileScreen> {
  BloodDonorModel? _donor;
  bool _loading = true;
  String? _error;
  bool _updating = false;

  @override
  void initState() {
    super.initState();
    _loadProfile();
  }

  Future<void> _loadProfile() async {
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      final user = await ApiService.getUser();
      if (user == null) return;
      final response = await ApiService.get('/blood-donors/user/${user['id']}');
      if (response != null) {
        setState(() {
          _donor = BloodDonorModel.fromJson(response);
        });
      } else {
        setState(() {
          _error =
              'আপনি এখনো রক্তদাতা হননি, রক্তদাতা হিসেবে নিবন্ধন করুন, এবং প্রতিবারের রক্তদানের তথ্য এখানে আপডেট করে বুঝে নিন আমাদের হেলথ কয়েন, যেটা দিয়ে আপনি খুব সহজেই বিভিন্ন মেডিসিন ও মেডিটেস্ট বিডি এর বিভিন্ন সার্ভিস থেকে ডিসকাউন্ট বুঝে নিন। আপনার রক্তদান বাঁচাতে পারে কারো প্রান। এসো রক্তদান করি, এবং অন্যদেরও উৎসাহিত করি। মেডিটেস্ট বিডি রক্ত গ্রহিতার কাছে থেকে কোন প্রকার ফি নেয় না, মেডিটেস্ট বিডি একটি সম্পুর্ন অলাভজনক স্বেচ্ছাসেবী সংগঠন, রক্তদাতাদের যেসব রিওয়ার্ড দেওয়া হয় সেটা সম্পুর্ন মেডিটেস্ট বিডি নিজে বহন করে। মেডিটেস্ট বিডি - আপনার স্বাস্থ্য, আমাদের অঙ্গীকার।';
        });
      }
    } catch (e) {
      setState(() {
        _error = e.toString().replaceFirst('Exception: ', '');
      });
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  Future<void> _toggleAvailability(bool value) async {
    if (_donor == null) return;
    setState(() => _updating = true);
    try {
      if (value) {
        // Available করার চেষ্টা — backend ৯০ দিন cooldown check করবে
        await ApiService.put('/blood-donors/${_donor!.id}/available', {});
      } else {
        await ApiService.put('/blood-donors/${_donor!.id}', {
          'is_available': false,
        });
      }
      await _loadProfile();
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(e.toString().replaceFirst('Exception: ', ''))),
      );
    } finally {
      if (mounted) setState(() => _updating = false);
    }
  }

  Future<void> _setDonationDate(DateTime date) async {
    if (_donor == null) return;
    setState(() => _updating = true);
    try {
      final dateStr =
          '${date.year}-${date.month.toString().padLeft(2, '0')}-${date.day.toString().padLeft(2, '0')}';
      await ApiService.put('/blood-donors/${_donor!.id}', {
        'last_donation_date': dateStr,
      });
      await _loadProfile();
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text(
            'রক্তদানের তারিখ সংরক্ষণ করা হয়েছে। ৯০ দিন পর আবার উপলব্ধ হবেন।',
          ),
        ),
      );
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(e.toString().replaceFirst('Exception: ', ''))),
      );
    } finally {
      if (mounted) setState(() => _updating = false);
    }
  }

  Future<void> _pickDonationDate() async {
    final picked = await showDatePicker(
      context: context,
      initialDate: DateTime.now(),
      firstDate: DateTime(2020),
      lastDate: DateTime.now(),
    );
    if (picked != null) {
      _setDonationDate(picked);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('আমার রক্তদান প্রোফাইল'),
        backgroundColor: Theme.of(context).colorScheme.primary,
        foregroundColor: Colors.white,
      ),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : _error != null
          ? _buildEmptyDonorState()
          : RefreshIndicator(
              onRefresh: _loadProfile,
              child: ListView(
                padding: const EdgeInsets.all(16),
                children: [
                  Card(
                    child: Padding(
                      padding: const EdgeInsets.all(16),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            children: [
                              CircleAvatar(
                                backgroundColor: Colors.red.shade50,
                                child: Text(
                                  _donor!.bloodGroup,
                                  style: const TextStyle(
                                    color: Colors.red,
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                              ),
                              const SizedBox(width: 12),
                              Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    _donor!.name,
                                    style: const TextStyle(
                                      fontWeight: FontWeight.w600,
                                      fontSize: 15,
                                    ),
                                  ),
                                  Text(
                                    _donor!.phone,
                                    style: const TextStyle(
                                      fontSize: 12,
                                      color: Colors.grey,
                                    ),
                                  ),
                                ],
                              ),
                            ],
                          ),
                          const Divider(height: 24),
                          _infoRow(
                            Icons.location_on_outlined,
                            'এলাকা',
                            '${_donor!.upazilla}, ${_donor!.district}, ${_donor!.division}',
                          ),
                          if (_donor!.unionName != null &&
                              _donor!.unionName!.isNotEmpty)
                            _infoRow(
                              Icons.home_outlined,
                              'ইউনিয়ন/ওয়ার্ড',
                              _donor!.unionName!,
                            ),
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(height: 16),

                  Card(
                    child: SwitchListTile(
                      title: const Text('উপলব্ধ আছি (Available)'),
                      subtitle: Text(
                        _donor!.isAvailable
                            ? 'অন্যরা আপনাকে খুঁজে পাবে'
                            : 'আপনাকে search-এ দেখানো হবে না',
                        style: const TextStyle(fontSize: 12),
                      ),
                      value: _donor!.isAvailable,
                      onChanged: _updating ? null : _toggleAvailability,
                      activeThumbColor: Theme.of(context).colorScheme.primary,
                    ),
                  ),
                  const SizedBox(height: 16),

                  Card(
                    child: ListTile(
                      leading: const Icon(Icons.calendar_month_outlined),
                      title: const Text('সর্বশেষ রক্তদানের তারিখ সেট করুন'),
                      subtitle: const Text(
                        'রক্তদান করার পর এখানে তারিখ দিন — ৯০ দিনের জন্য আপনি অনুপলব্ধ হয়ে যাবেন',
                        style: TextStyle(fontSize: 12),
                      ),
                      trailing: const Icon(Icons.chevron_right),
                      onTap: _updating ? null : _pickDonationDate,
                    ),
                  ),

                  if (_updating)
                    const Padding(
                      padding: EdgeInsets.only(top: 16),
                      child: Center(child: CircularProgressIndicator()),
                    ),
                ],
              ),
            ),
    );
  }

  Widget _infoRow(IconData icon, String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(icon, size: 16, color: Colors.grey),
          const SizedBox(width: 8),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  label,
                  style: const TextStyle(fontSize: 11, color: Colors.grey),
                ),
                Text(value, style: const TextStyle(fontSize: 13)),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildEmptyDonorState() {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(24),
      child: Column(
        children: [
          const SizedBox(height: 16),
          Container(
            width: 72,
            height: 72,
            decoration: BoxDecoration(
              color: Colors.grey.shade100,
              shape: BoxShape.circle,
            ),
            child: const Icon(
              Icons.water_drop_outlined,
              size: 36,
              color: Colors.deepOrange,
            ),
          ),
          const SizedBox(height: 20),
          const Text(
            'আপনি এখনো রক্তদাতা হননি',
            style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600),
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 4),
          const Text(
            'রক্তদাতা হিসেবে নিবন্ধন করুন এবং হেলথ কয়েন উপার্জন শুরু করুন',
            style: TextStyle(fontSize: 13, color: Colors.grey),
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 20),

          _buildInfoTip(
            Icons.monetization_on_outlined,
            Colors.amber.shade800,
            'প্রতিবারের রক্তদানের তথ্য আপডেট করে হেলথ কয়েন অর্জন করুন, যা দিয়ে আপনি মেডিটেস্ট বিডি এর মেডিসিন ও বিভিন্ন সার্ভিসে ছাড় পাবেন।',
          ),
          const SizedBox(height: 10),
          _buildInfoTip(
            Icons.volunteer_activism_outlined,
            Colors.teal.shade700,
            'মেডিটেস্ট বিডি একটি অলাভজনক প্রতিষ্ঠান, দৈনন্দিন জীবনে অনেক মানুষ রক্তের অভাবে মারাও যায়, তাদের কথা ভেবেই আমরা কাজ করছি — এখানে রক্ত দাতা/গ্রহিতার কাছ থেকে কোনো প্রকার অর্থ নেওয়া হয় না, সমস্ত রিওয়ার্ড এর খরচ আমরা নিজেরাই বহন করি। আমাদের লক্ষ্য একটাই রক্তের অভাবে আমাদের দেশে একজন মানুষও যেন মারা না যায়, তাই আমরা চাই সবাই রক্তদাতা হোক, এবং অন্যদেরও উৎসাহিত করুক। আপনার রক্তদান বাঁচাতে পারে কারো প্রান।',
          ),
          const SizedBox(height: 20),

          SizedBox(
            width: double.infinity,
            height: 48,
            child: ElevatedButton.icon(
              onPressed: () {
                Navigator.pop(context);
                // ব্যবহারকারীকে Blood Donor ট্যাবে গিয়ে "Become Donor" করতে হবে
              },
              icon: const Icon(Icons.add_circle_outline, size: 20),
              label: const Text('রক্তদাতা হোন'),
              style: ElevatedButton.styleFrom(
                backgroundColor: Theme.of(context).colorScheme.primary,
                foregroundColor: Colors.white,
              ),
            ),
          ),

          const SizedBox(height: 14),
          Text(
            'মেডিটেস্ট বিডি — আপনার সুস্বাস্থ্য, আমাদের অঙ্গীকার।',
            style: TextStyle(
              fontSize: 12,
              color: Colors.grey.shade500,
              fontStyle: FontStyle.italic,
            ),
            textAlign: TextAlign.center,
          ),
        ],
      ),
    );
  }

  Widget _buildInfoTip(IconData icon, Color iconColor, String text) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: Colors.grey.shade50,
        borderRadius: BorderRadius.circular(10),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(icon, size: 18, color: iconColor),
          const SizedBox(width: 10),
          Expanded(
            child: Text(
              text,
              style: const TextStyle(fontSize: 13, height: 1.5),
            ),
          ),
        ],
      ),
    );
  }
}
