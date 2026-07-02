import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';

class ApiService {
  static const String baseUrl = String.fromEnvironment(
    'API_BASE_URL',
    defaultValue: 'http://10.0.2.2:4000/api',
  );
  static const Duration _timeout = Duration(seconds: 20);

  static Future<String?> getToken() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString('token');
  }

  static Future<void> saveToken(String token) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('token', token);
  }

  static Future<void> saveUser(Map<String, dynamic> user) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('user', jsonEncode(user));
  }

  static Future<Map<String, dynamic>?> getUser() async {
    final prefs = await SharedPreferences.getInstance();
    final userStr = prefs.getString('user');
    if (userStr == null) return null;

    try {
      return jsonDecode(userStr) as Map<String, dynamic>;
    } catch (_) {
      await prefs.remove('user');
      return null;
    }
  }

  static Future<void> logout() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('token');
    await prefs.remove('user');
  }

  static Future<Map<String, String>> _headers() async {
    final token = await getToken();
    return {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      if (token != null) 'Authorization': 'Bearer $token',
    };
  }

  static Uri _uri(String endpoint) {
    final normalizedEndpoint = endpoint.startsWith('/') ? endpoint : '/$endpoint';
    return Uri.parse('$baseUrl$normalizedEndpoint');
  }

  static Future<dynamic> get(String endpoint) async {
    final headers = await _headers();
    final response = await http
        .get(_uri(endpoint), headers: headers)
        .timeout(_timeout);
    return _handleResponse(response);
  }

  static Future<dynamic> post(
    String endpoint,
    Map<String, dynamic> body,
  ) async {
    final headers = await _headers();
    final response = await http
        .post(_uri(endpoint), headers: headers, body: jsonEncode(body))
        .timeout(_timeout);
    return _handleResponse(response);
  }

  static Future<dynamic> put(String endpoint, Map<String, dynamic> body) async {
    final headers = await _headers();
    final response = await http
        .put(_uri(endpoint), headers: headers, body: jsonEncode(body))
        .timeout(_timeout);
    return _handleResponse(response);
  }

  static dynamic _handleResponse(http.Response response) {
    final data = _decodeResponse(response.body);

    if (response.statusCode >= 200 && response.statusCode < 300) {
      return data;
    }

    final message = data is Map && data['message'] != null
        ? _messageToString(data['message'])
        : 'Something went wrong. Please try again.';
    throw Exception(message);
  }

  static dynamic _decodeResponse(String body) {
    if (body.isEmpty) return null;

    try {
      return jsonDecode(body);
    } catch (_) {
      return null;
    }
  }

  static String _messageToString(dynamic message) {
    if (message is List) return message.join(', ');
    return message.toString();
  }
}
