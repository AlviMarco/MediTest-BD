import 'package:flutter/material.dart';
import '../services/api_service.dart';
import 'main_navigation.dart';
import '../models/bd_address_data.dart';

class RegisterScreen extends StatefulWidget {
  const RegisterScreen({super.key});

  @override
  State<RegisterScreen> createState() => _RegisterScreenState();
}

class _RegisterScreenState extends State<RegisterScreen> {
  final _nameController = TextEditingController();
  final _emailController = TextEditingController();
  final _phoneController = TextEditingController();
  final _passwordController = TextEditingController();
  final _unionController = TextEditingController();
  final _referralController = TextEditingController();

  String? _selectedBloodGroup;
  String? _selectedDivision;
  String? _selectedDistrict;
  String? _selectedUpazilla;

  bool _isLoading = false;
  String? _errorMessage;

  List<String> get _districts {
    if (_selectedDivision == null) return [];
    return bdAddress[_selectedDivision]!.keys.toList();
  }

  List<String> get _upazillas {
    if (_selectedDivision == null || _selectedDistrict == null) return [];
    return bdAddress[_selectedDivision]![_selectedDistrict] ?? [];
  }

  Future<void> _handleRegister() async {
    final name = _nameController.text.trim();
    final email = _emailController.text.trim();
    final phone = _phoneController.text.trim();
    final password = _passwordController.text.trim();

    if (name.isEmpty) {
      setState(() => _errorMessage = 'নাম দিতে হবে');
      return;
    }
    if (phone.isEmpty) {
      setState(() => _errorMessage = 'Phone Number দিতে হবে');
      return;
    }
    if (password.isEmpty) {
      setState(() => _errorMessage = 'পাসওয়ার্ড দিতে হবে');
      return;
    }
    if (_selectedDivision == null) {
      setState(() => _errorMessage = 'বিভাগ সিলেক্ট করুন');
      return;
    }
    if (_selectedDistrict == null) {
      setState(() => _errorMessage = 'জেলা সিলেক্ট করুন');
      return;
    }
    if (_selectedUpazilla == null) {
      setState(() => _errorMessage = 'উপজেলা সিলেক্ট করুন');
      return;
    }

    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    try {
      final body = {
        'name': name,
        if (email.isNotEmpty) 'email': email,
        'phone': phone,
        'password': password,
        'blood_group': _selectedBloodGroup,
        'division': _selectedDivision,
        'district': _selectedDistrict,
        'upazilla': _selectedUpazilla,
        'union_name': _unionController.text.trim().isNotEmpty
            ? _unionController.text.trim()
            : null,
        'referral_code': _referralController.text.trim().isNotEmpty
            ? _referralController.text.trim()
            : null,
      };

      final response = await ApiService.post('/auth/register', body);
      await ApiService.saveToken(response['token']);
      await ApiService.saveUser(response['user']);

      if (!mounted) return;
      Navigator.pushReplacement(
        context,
        MaterialPageRoute(builder: (context) => const MainNavigation()),
      );
    } catch (e) {
      setState(() {
        _errorMessage = e.toString().replaceFirst('Exception: ', '');
      });
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('রেজিস্টার করুন'),
        backgroundColor: Theme.of(context).colorScheme.primary,
        foregroundColor: Colors.white,
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(20),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              // নাম
              TextField(
                controller: _nameController,
                decoration: const InputDecoration(
                  labelText: 'নাম *',
                  prefixIcon: Icon(Icons.person_outline),
                  border: OutlineInputBorder(),
                ),
              ),
              const SizedBox(height: 12),

              // Phone
              TextField(
                controller: _phoneController,
                keyboardType: TextInputType.phone,
                decoration: const InputDecoration(
                  labelText: 'Phone Number *',
                  prefixIcon: Icon(Icons.phone_outlined),
                  border: OutlineInputBorder(),
                ),
              ),
              const SizedBox(height: 12),

              // Email
              TextField(
                controller: _emailController,
                decoration: const InputDecoration(
                  labelText: 'Email (ঐচ্ছিক)',
                  prefixIcon: Icon(Icons.email_outlined),
                  border: OutlineInputBorder(),
                ),
              ),
              const SizedBox(height: 12),

              // Password
              TextField(
                controller: _passwordController,
                obscureText: true,
                decoration: const InputDecoration(
                  labelText: 'পাসওয়ার্ড *',
                  prefixIcon: Icon(Icons.lock_outline),
                  border: OutlineInputBorder(),
                ),
              ),
              const SizedBox(height: 16),

              // Blood Group
              DropdownButtonFormField<String>(
                initialValue: _selectedBloodGroup,
                decoration: const InputDecoration(
                  labelText: 'Blood Group (ঐচ্ছিক)',
                  prefixIcon: Icon(Icons.bloodtype_outlined),
                  border: OutlineInputBorder(),
                ),
                items: bloodGroups
                    .map((bg) => DropdownMenuItem(value: bg, child: Text(bg)))
                    .toList(),
                onChanged: (val) => setState(() => _selectedBloodGroup = val),
              ),
              const SizedBox(height: 12),

              // Division
              DropdownButtonFormField<String>(
                initialValue: _selectedDivision,
                decoration: const InputDecoration(
                  labelText: 'বিভাগ *',
                  prefixIcon: Icon(Icons.location_on_outlined),
                  border: OutlineInputBorder(),
                ),
                items: bdAddress.keys
                    .map((d) => DropdownMenuItem(value: d, child: Text(d)))
                    .toList(),
                onChanged: (val) => setState(() {
                  _selectedDivision = val;
                  _selectedDistrict = null;
                  _selectedUpazilla = null;
                }),
              ),
              const SizedBox(height: 12),

              // District
              DropdownButtonFormField<String>(
                initialValue: _selectedDistrict,
                decoration: const InputDecoration(
                  labelText: 'জেলা *',
                  prefixIcon: Icon(Icons.location_on_outlined),
                  border: OutlineInputBorder(),
                ),
                items: _districts
                    .map((d) => DropdownMenuItem(value: d, child: Text(d)))
                    .toList(),
                onChanged: _selectedDivision == null
                    ? null
                    : (val) => setState(() {
                        _selectedDistrict = val;
                        _selectedUpazilla = null;
                      }),
              ),
              const SizedBox(height: 12),

              // Upazilla
              DropdownButtonFormField<String>(
                initialValue: _selectedUpazilla,
                decoration: const InputDecoration(
                  labelText: 'উপজেলা *',
                  prefixIcon: Icon(Icons.location_on_outlined),
                  border: OutlineInputBorder(),
                ),
                items: _upazillas
                    .map((u) => DropdownMenuItem(value: u, child: Text(u)))
                    .toList(),
                onChanged: _selectedDistrict == null
                    ? null
                    : (val) => setState(() => _selectedUpazilla = val),
              ),
              const SizedBox(height: 12),

              // Union
              TextField(
                controller: _unionController,
                decoration: const InputDecoration(
                  labelText: 'ইউনিয়ন/ওয়ার্ড (ঐচ্ছিক)',
                  prefixIcon: Icon(Icons.location_on_outlined),
                  border: OutlineInputBorder(),
                ),
              ),

              const SizedBox(height: 12),

              // Referral Code
              TextField(
                controller: _referralController,
                decoration: const InputDecoration(
                  labelText: 'রেফারেল কোড (ঐচ্ছিক)',
                  prefixIcon: Icon(Icons.card_giftcard_outlined),
                  border: OutlineInputBorder(),
                ),
                textCapitalization: TextCapitalization.characters,
              ),

              if (_errorMessage != null)
                Padding(
                  padding: const EdgeInsets.only(top: 12),
                  child: Text(
                    _errorMessage!,
                    style: const TextStyle(color: Colors.red, fontSize: 13),
                  ),
                ),

              const SizedBox(height: 20),

              SizedBox(
                height: 48,
                child: ElevatedButton(
                  onPressed: _isLoading ? null : _handleRegister,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Theme.of(context).colorScheme.primary,
                    foregroundColor: Colors.white,
                  ),
                  child: _isLoading
                      ? const SizedBox(
                          width: 22,
                          height: 22,
                          child: CircularProgressIndicator(
                            color: Colors.white,
                            strokeWidth: 2,
                          ),
                        )
                      : const Text('রেজিস্টার করুন'),
                ),
              ),
              const SizedBox(height: 20),
            ],
          ),
        ),
      ),
    );
  }
}
