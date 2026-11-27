import 'dart:io';
import 'dart:typed_data';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:ademicon_app/telas/gestor/home_gestor.dart';

void main() {
  testWidgets('Render original manager home with isolated demonstration data', (tester) async {
    tester.view.physicalSize = const Size(430, 900);
    tester.view.devicePixelRatio = 1;
    SharedPreferences.setMockInitialValues({});
    // Deep-link platform channels are not used by this isolated screenshot.
    for (final channel in ['com.llfbandit.app_links/events', 'com.llfbandit.app_links/messages', 'dev.fluttercommunity.plus/connectivity_status', 'dev.fluttercommunity.plus/connectivity']) {
      TestDefaultBinaryMessengerBinding.instance.defaultBinaryMessenger.setMockMethodCallHandler(MethodChannel(channel), (call) async => call.method == 'check' ? ['wifi'] : null);
    }
    final font = FontLoader('Roboto');
    font.addFont(Future.value(ByteData.sublistView(File('test/Roboto-Regular.ttf').readAsBytesSync())));
    await font.load();
    final icons = FontLoader('MaterialIcons');
    icons.addFont(Future.value(ByteData.sublistView(File('test/MaterialIcons-Regular.otf').readAsBytesSync())));
    await icons.load();
    await Supabase.initialize(url: 'http://127.0.0.1:9', anonKey: 'preview-only-not-a-credential', authOptions: const FlutterAuthClientOptions(autoRefreshToken: false));
    await tester.pumpWidget(MaterialApp(debugShowCheckedModeBanner: false, theme: ThemeData(fontFamily:'Roboto', useMaterial3:true, colorScheme:ColorScheme.fromSeed(seedColor:Colors.indigo)), home: const RepaintBoundary(key: Key('capture'), child: HomeGestor())));
    await tester.runAsync(() async {
      final context = tester.element(find.byType(HomeGestor));
      await precacheImage(const AssetImage('assets/Logo.png'), context);
      await precacheImage(const AssetImage('assets/Linha_Lateral.png'), context);
    });
    await tester.pumpAndSettle();
    await expectLater(find.byKey(const Key('capture')), matchesGoldenFile('generated/ademiconnect.png'));
    await tester.pumpWidget(const SizedBox());
    await Supabase.instance.dispose();
  });
}
