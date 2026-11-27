import 'dart:io';
import 'dart:typed_data';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:ademicon_app/telas/login.dart';

void main() {
  testWidgets('Render original public login screen without production data', (tester) async {
    tester.view.physicalSize = const Size(430, 900);
    tester.view.devicePixelRatio = 1;
    SharedPreferences.setMockInitialValues({});
    // Deep-link platform channels are not used by this isolated screenshot.
    for (final channel in ['com.llfbandit.app_links/events', 'com.llfbandit.app_links/messages']) {
      TestDefaultBinaryMessengerBinding.instance.defaultBinaryMessenger.setMockMethodCallHandler(MethodChannel(channel), (_) async => null);
    }
    final font = FontLoader('Roboto');
    font.addFont(Future.value(ByteData.sublistView(File('test/Roboto-Regular.ttf').readAsBytesSync())));
    await font.load();
    await Supabase.initialize(url: 'http://127.0.0.1:9', anonKey: 'preview-only-not-a-credential', authOptions: const FlutterAuthClientOptions(autoRefreshToken: false));
    await tester.pumpWidget(MaterialApp(debugShowCheckedModeBanner: false, theme: ThemeData(fontFamily:'Roboto', useMaterial3:true, colorScheme:ColorScheme.fromSeed(seedColor:Colors.indigo)), home: const RepaintBoundary(key: Key('capture'), child: LoginPage())));
    await tester.runAsync(() async {
      final context = tester.element(find.byType(LoginPage));
      await precacheImage(const AssetImage('assets/Logo.png'), context);
      await precacheImage(const AssetImage('assets/Linha_Lateral.png'), context);
    });
    await tester.pumpAndSettle();
    await expectLater(find.byKey(const Key('capture')), matchesGoldenFile('generated/ademiconnect.png'));
    await tester.pumpWidget(const SizedBox());
    await Supabase.instance.dispose();
  });
}
