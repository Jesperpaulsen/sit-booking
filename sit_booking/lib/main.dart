import 'package:firebase_core/firebase_core.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:sit_booking/providers/user_provider.dart';
import 'package:sit_booking/screens/home.dart';
import 'package:sit_booking/screens/log_in.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await Firebase.initializeApp();
  runApp(ProviderScope(child: MyApp()));
}

class MyApp extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Sit Booking',
      theme: ThemeData(
        primarySwatch: Colors.pink,
      ),
      home: Consumer(
        builder: (BuildContext context, ScopedReader watch, Widget child) {
          final profileState = watch(UserProvider.provider.state);
          if (profileState.profile != null)
            return Home(profileState.profile, profileState.loading);
          return LogIn();
        },
      ),
    );
  }
}
