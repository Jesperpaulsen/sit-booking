class Preference {
  String time;
  bool isDoubleBooking;

  Preference({this.time, this.isDoubleBooking});

  Preference.fromJson(Map<String, dynamic> json)
      : time = json['time'] ?? '',
        isDoubleBooking = json['isDoubleBooking'] ?? false;

  toJson() {
    return {
      "time": time,
      "isDoubleBooking": isDoubleBooking,
    };
  }
}
