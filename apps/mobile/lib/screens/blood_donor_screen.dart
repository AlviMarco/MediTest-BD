import 'package:flutter/material.dart';
import '../services/api_service.dart';
import '../models/blood_donor_model.dart';
import '../models/bd_address_data.dart';

class BloodDonorScreen extends StatefulWidget {
  const BloodDonorScreen({super.key});

  @override
  State<BloodDonorScreen> createState() => _BloodDonorScreenState();
}

class _BloodDonorScreenState extends State<BloodDonorScreen> {
  BloodDonorModel? _myDonorProfile;
  bool _loadingProfile = true;
  bool _becomingDonor = false;

  List<BloodDonorModel> _donors = [];
  bool _loadingDonors = true;

  String? _filterBloodGroup;
  String? _filterDivision;
  String? _filterDistrict;

  List<String> get _filterDistricts {
    if (_filterDivision == null) return [];
    return bdAddress[_filterDivision]!.keys.toList();
  }

  @override
  void initState() {
    super.initState();
    _loadMyDonorProfile();
    _loadDonors();
  }

  Future<void> _loadMyDonorProfile() async {
    setState(() => _loadingProfile = true);
    try {
      final user = await ApiService.getUser();
      if (user == null) {
        return;
      }
      final response = await ApiService.get('/blood-donors/user/${user['id']}');
      if (response != null) {
        setState(() {
          _myDonorProfile = BloodDonorModel.fromJson(response);
        });
      }
    } catch (e) {
      // user is not a donor yet — that's fine
    } finally {
      if (mounted) setState(() => _loadingProfile = false);
    }
  }

  Future<void> _loadDonors() async {
    setState(() => _loadingDonors = true);
    try {
      final query = <String>[];
      if (_filterBloodGroup != null) {
        query.add('blood_group=${Uri.encodeComponent(_filterBloodGroup!)}');
      }
      if (_filterDivision != null) {
        query.add('division=${Uri.encodeComponent(_filterDivision!)}');
      }
      if (_filterDistrict != null) {
        query.add('district=${Uri.encodeComponent(_filterDistrict!)}');
      }

      final endpoint =
          '/blood-donors${query.isNotEmpty ? '?${query.join('&')}' : ''}';
      final response = await ApiService.get(endpoint);

      setState(() {
        _donors = (response as List)
            .map((e) => BloodDonorModel.fromJson(e))
            .toList();
      });
    } catch (e) {
      // ignore for now
    } finally {
      if (mounted) setState(() => _loadingDonors = false);
    }
  }

  Future<void> _becomeDonor() async {
    setState(() => _becomingDonor = true);
    try {
      final response = await ApiService.post('/blood-donors/become-donor', {});
      setState(() {
        _myDonorProfile = BloodDonorModel.fromJson(response);
      });
      _loadDonors();
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('অভিনন্দন! আপনি একজন রক্তদাতা হয়েছেন')),
      );
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(e.toString().replaceFirst('Exception: ', ''))),
      );
    } finally {
      if (mounted) setState(() => _becomingDonor = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return RefreshIndicator(
      onRefresh: () async {
        await _loadMyDonorProfile();
        await _loadDonors();
      },
      child: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          _buildDonorStatusCard(),
          const SizedBox(height: 20),
          const Text(
            'রক্তদাতা খুঁজুন',
            style: TextStyle(fontSize: 15, fontWeight: FontWeight.w600),
          ),
          const SizedBox(height: 10),
          _buildFilters(),
          const SizedBox(height: 16),
          _buildDonorList(),
        ],
      ),
    );
  }

  Widget _buildDonorStatusCard() {
    if (_loadingProfile) {
      return const Card(
        child: Padding(
          padding: EdgeInsets.all(16),
          child: Center(child: CircularProgressIndicator()),
        ),
      );
    }

    if (_myDonorProfile != null) {
      return Card(
        color: Colors.green.shade50,
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Row(
            children: [
              const Icon(Icons.verified, color: Colors.green),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'আপনি একজন রক্তদাতা',
                      style: TextStyle(fontWeight: FontWeight.w600),
                    ),
                    Text(
                      'Blood Group: ${_myDonorProfile!.bloodGroup} • ${_myDonorProfile!.isAvailable ? "উপলব্ধ" : "অপেক্ষায়"}',
                      style: const TextStyle(fontSize: 12, color: Colors.grey),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      );
    }

    return Card(
      color: Colors.red.shade50,
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Row(
              children: [
                Icon(Icons.bloodtype, color: Colors.red),
                SizedBox(width: 10),
                Expanded(
                  child: Text(
                    'আপনার প্রোফাইলের তথ্য দিয়ে এক ক্লিকে রক্তদাতা হয়ে যান',
                    style: TextStyle(fontWeight: FontWeight.w600, fontSize: 13),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: _becomingDonor ? null : _becomeDonor,
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.red,
                  foregroundColor: Colors.white,
                ),
                child: _becomingDonor
                    ? const SizedBox(
                        width: 20,
                        height: 20,
                        child: CircularProgressIndicator(
                          color: Colors.white,
                          strokeWidth: 2,
                        ),
                      )
                    : const Text('রক্তদাতা হোন'),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildFilters() {
    return Column(
      children: [
        Row(
          children: [
            Expanded(
              child: DropdownButtonFormField<String>(
                initialValue: _filterBloodGroup,
                decoration: const InputDecoration(
                  labelText: 'Blood Group',
                  border: OutlineInputBorder(),
                  isDense: true,
                ),
                items: bloodGroups
                    .map((bg) => DropdownMenuItem(value: bg, child: Text(bg)))
                    .toList(),
                onChanged: (val) {
                  setState(() => _filterBloodGroup = val);
                  _loadDonors();
                },
              ),
            ),
            const SizedBox(width: 8),
            Expanded(
              child: DropdownButtonFormField<String>(
                initialValue: _filterDivision,
                decoration: const InputDecoration(
                  labelText: 'বিভাগ',
                  border: OutlineInputBorder(),
                  isDense: true,
                ),
                items: bdAddress.keys
                    .map((d) => DropdownMenuItem(value: d, child: Text(d)))
                    .toList(),
                onChanged: (val) {
                  setState(() {
                    _filterDivision = val;
                    _filterDistrict = null;
                  });
                  _loadDonors();
                },
              ),
            ),
          ],
        ),
        const SizedBox(height: 8),
        DropdownButtonFormField<String>(
          initialValue: _filterDistrict,
          decoration: const InputDecoration(
            labelText: 'জেলা',
            border: OutlineInputBorder(),
            isDense: true,
          ),
          items: _filterDistricts
              .map((d) => DropdownMenuItem(value: d, child: Text(d)))
              .toList(),
          onChanged: _filterDivision == null
              ? null
              : (val) {
                  setState(() => _filterDistrict = val);
                  _loadDonors();
                },
        ),
      ],
    );
  }

  Widget _buildDonorList() {
    if (_loadingDonors) {
      return const Padding(
        padding: EdgeInsets.symmetric(vertical: 40),
        child: Center(child: CircularProgressIndicator()),
      );
    }

    if (_donors.isEmpty) {
      return const Padding(
        padding: EdgeInsets.symmetric(vertical: 40),
        child: Center(
          child: Text(
            'কোনো রক্তদাতা পাওয়া যায়নি',
            style: TextStyle(color: Colors.grey),
          ),
        ),
      );
    }

    return Column(
      children: _donors.map((donor) => _buildDonorCard(donor)).toList(),
    );
  }

  Widget _buildDonorCard(BloodDonorModel donor) {
    return Card(
      margin: const EdgeInsets.only(bottom: 8),
      child: ListTile(
        leading: CircleAvatar(
          backgroundColor: Colors.red.shade50,
          child: Text(
            donor.bloodGroup,
            style: const TextStyle(
              color: Colors.red,
              fontWeight: FontWeight.bold,
              fontSize: 12,
            ),
          ),
        ),
        title: Text(
          donor.name,
          style: const TextStyle(fontWeight: FontWeight.w500),
        ),
        subtitle: Text(
          '${donor.upazilla}, ${donor.district}',
          style: const TextStyle(fontSize: 12),
        ),
        trailing: IconButton(
          icon: const Icon(Icons.phone, color: Colors.green),
          onPressed: () {
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(content: Text('ফোন নাম্বার: ${donor.phone}')),
            );
          },
        ),
      ),
    );
  }
}
