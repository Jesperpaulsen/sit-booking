import 'package:flutter/material.dart';

final weekdayMap = {
  0: 'Mandag',
  1: 'Tirsdag',
  2: 'Onsdag',
  3: 'Torsdag',
  4: 'Fredag',
  5: 'Lørdag',
  6: 'Søndag',
};

class TimeForDay extends StatefulWidget {
  final Function(int day, String preference) updatePreference;
  final String preference;
  final int dayNumber;
  final now = DateTime.now();

  TimeForDay(this.updatePreference, this.preference, this.dayNumber);

  @override
  _TimeForDayState createState() => _TimeForDayState();
}

class _TimeForDayState extends State<TimeForDay> {
  Future<void> selectTime(BuildContext context) async {
    final hourAndMinute = widget.preference.split(':');
    final hour = hourAndMinute[0];
    final minute = hourAndMinute.length > 1 ? hourAndMinute[1] : '00';

    TimeOfDay selectedTime = await showTimePicker(
      initialTime: TimeOfDay(
          hour: int.parse(hour) ?? widget.now.hour,
          minute: int.parse(minute) ?? widget.now.minute),
      context: context,
      builder: (BuildContext context, Widget child) {
        return MediaQuery(
          data: MediaQuery.of(context).copyWith(
            alwaysUse24HourFormat: true,
          ),
          child: child,
        );
      },
    );
    widget.updatePreference(widget.dayNumber,
        '${selectedTime.hour < 10 ? '0${selectedTime.hour}' : selectedTime.hour}:${selectedTime.minute == 30 ? 30 : '00'}');
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: EdgeInsets.only(top: 20),
      width: 200,
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Checkbox(
              value: (widget.preference != ''),
              onChanged: (bool isChecked) {
                if (!isChecked)
                  widget.updatePreference(widget.dayNumber, '');
                else
                  widget.updatePreference(widget.dayNumber,
                      '${widget.now.hour}:${widget.now.minute == 30 ? 30 : '00'}');
              }),
          Text(weekdayMap[widget.dayNumber]),
          TextButton(
              onPressed: () => selectTime(context),
              child: Text(widget.preference))
        ],
      ),
    );
  }
}
