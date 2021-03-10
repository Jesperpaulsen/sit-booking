import 'package:sit_booking/models/preference.dart';

class Profile {
  String email;
  String name;
  int phone;
  String sitPassword;
  String userID;
  List<Preference> preferences;
  String FCMToken;

  Profile({
    this.email,
    this.name,
    this.phone,
    this.sitPassword,
    this.userID,
    this.preferences,
    this.FCMToken,
  });

  Profile.fromJson(Map<String, dynamic> json)
      : email = json['email'] ?? '',
        name = json['name'] ?? '',
        phone = json['phone'] ?? '',
        sitPassword = json['sitPassword'] ?? '',
        userID = json['userID'] ?? '',
        FCMToken = json['FCMToken'] ?? '',
        preferences = convertDynamicListToPreferenceList(json['preferences']);

  toJson() {
    return {
      'email': email,
      'name': name,
      'phone': phone,
      'sitPassword': sitPassword,
      'userID': userID,
      'preferences':
          preferences.map((preference) => preference.toJson()).toList(),
      'FCMToken': FCMToken
    };
  }
}

convertDynamicListToPreferenceList(List<dynamic> jsonList) {
  final List<Preference> res = [];
  for (final object in jsonList) {
    if (object is String)
      res.add(Preference(time: object, isDoubleBooking: false));
    else
      res.add(Preference.fromJson(object));
  }
  return res;
}
