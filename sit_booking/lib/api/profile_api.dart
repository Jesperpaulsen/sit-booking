import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:sit_booking/models/profile.dart';

class ProfileAPI {
  Future<Profile> mountProfile(String uid) async {
    final profileDoc =
        await FirebaseFirestore.instance.collection('profiles').doc(uid).get();
    return Profile.fromJson(profileDoc.data());
  }

  Future<void> saveProfile(Profile profile) async {
    return FirebaseFirestore.instance
        .collection('profiles')
        .doc(profile.userID)
        .update(profile.toJson());
  }
}
