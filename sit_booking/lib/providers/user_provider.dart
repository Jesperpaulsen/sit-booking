import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:sit_booking/api/API.dart';
import 'package:sit_booking/models/profile.dart';
import 'package:sit_booking/services/push_notifications.dart';

class UserState {
  bool loading;
  Profile profile;

  UserState() {
    loading = false;
  }
}

class UserProvider extends StateNotifier<UserState> {
  UserProvider() : super(UserState()) {
    FirebaseAuth.instance.authStateChanges().listen((user) async {
      if (user != null && user.uid.isNotEmpty) {
        final profile = await API.profile.mountProfile(user.uid);
        await PushNotification.instance.requestPermission();
        final token = await PushNotification.instance.getToken();
        profile.FCMToken = token;
        setProfile(profile);
        saveProfile();
      } else {
        setProfile(null);
      }
    });
  }

  setProfile(Profile profile) {
    final newState = state;
    newState.profile = profile;
    state = newState;
  }

  updateToken(String token) {
    final newState = state;
    newState.profile.FCMToken = token;
  }

  updatePreference(int day, String preference) {
    final newState = state;
    newState.profile.preferences[day] = preference;
    state = newState;
  }

  setLoading(bool isLoading) {
    final newState = state;
    newState.loading = isLoading;
    state = newState;
  }

  saveProfile() async {
    setLoading(true);
    try {
      await API.profile.saveProfile(state.profile);
    } catch (error) {
      print(error);
    }
    setLoading(false);
  }

  static final provider = StateNotifierProvider((_) => UserProvider());
}
