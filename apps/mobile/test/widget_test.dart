import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:shared_preferences/shared_preferences.dart';

import 'package:meditest_mobile_app/main.dart';

void main() {
  testWidgets('shows login screen when no saved token', (
    WidgetTester tester,
  ) async {
    SharedPreferences.setMockInitialValues({});

    await tester.pumpWidget(const MyApp());
    await tester.pumpAndSettle();

    expect(find.text('MediTest BD'), findsOneWidget);
    expect(find.textContaining('Email'), findsOneWidget);
    expect(find.byType(TextField), findsNWidgets(2));
  });
}
