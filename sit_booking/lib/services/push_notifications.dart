import 'dart:io';

import 'package:firebase_messaging/firebase_messaging.dart';

class PushNotification {
  final _fcm = FirebaseMessaging.instance;
  String _token;

  PushNotification._privateConstructor();

  static final instance = PushNotification._privateConstructor();

  Future<void> requestPermission() async {
    try {
      if (Platform.isIOS) await _fcm.requestPermission();
    } catch (error) {
      print(error);
    }
  }

  Future<String> getToken() async {
    try {
      return _fcm.getToken();
    } catch (error) {
      print(error);
      return '';
    }
  }
}
