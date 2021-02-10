class Profile {
  String email;
  String name;
  int phone;
  String sitPassword;
  String userID;
  List<String> preferences;

  Profile(
      {this.email,
      this.name,
      this.phone,
      this.sitPassword,
      this.userID,
      this.preferences});

  Profile.fromJson(Map<String, dynamic> json)
      : email = json['email'] ?? '',
        name = json['name'] ?? '',
        phone = json['phone'] ?? '',
        sitPassword = json['sitPassword'] ?? '',
        userID = json['userID'] ?? '',
        preferences = convertDynamicListToStringList(json['preferences']);

  toJson() {
    return {
      'email': email,
      'name': name,
      'phone': phone,
      'sitPassword': sitPassword,
      'userID': userID,
      'preferences': preferences
    };
  }
}

convertDynamicListToStringList(List<dynamic> jsonList) {
  final List<String> res = [];
  for (final object in jsonList) {
    res.add(object as String);
  }
  return res;
}
