import 'package:flutter/material.dart';
import 'package:sit_booking/models/preference.dart';

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
  final Function(int day, Preference preference) updatePreference;
  final Preference preference;
  final int dayNumber;
  final now = DateTime.now();

  TimeForDay(this.updatePreference, this.preference, this.dayNumber);

  @override
  _TimeForDayState createState() => _TimeForDayState();
}

class _TimeForDayState extends State<TimeForDay> {
  Future<void> selectTime(BuildContext context) async {
    final hourAndMinute = widget.preference.time.split(':');
    final hour = hourAndMinute[0];
    final minute = hourAndMinute.length > 1 ? hourAndMinute[1] : '00';

    TimeOfDay selectedTime = await showTimePicker(
      initialEntryMode: TimePickerEntryMode.input,
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
    if (selectedTime == null) return;
    widget.updatePreference(
        widget.dayNumber,
        Preference(
          time:
              '${selectedTime.hour < 10 ? '0${selectedTime.hour}' : selectedTime.hour}:${selectedTime.minute == 30 ? 30 : '00'}',
          isDoubleBooking: widget.preference.isDoubleBooking,
        ));
  }

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: EdgeInsets.symmetric(horizontal: 20, vertical: 4),
      child: Container(
        foregroundDecoration: BoxDecoration(
            color: widget.preference.time == ''
                ? Colors.grey.withOpacity(0.2)
                : null),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceEvenly,
          children: [
            Switch(
                value: (widget.preference.time != ''),
                onChanged: (bool isChecked) {
                  if (!isChecked)
                    widget.updatePreference(
                      widget.dayNumber,
                      Preference(
                        time: '',
                        isDoubleBooking: widget.preference.isDoubleBooking,
                      ),
                    );
                  else
                    widget.updatePreference(
                      widget.dayNumber,
                      Preference(
                        time:
                            '${widget.now.hour}:${widget.now.minute == 30 ? 30 : '00'}',
                        isDoubleBooking: widget.preference.isDoubleBooking,
                      ),
                    );
                }),
            Text(weekdayMap[widget.dayNumber]),
            TextButton(
              onPressed: () => selectTime(context),
              child: Text(widget.preference.time),
            ),
            Checkbox(
              value: widget.preference.isDoubleBooking,
              onChanged: widget.preference.time != ''
                  ? (isChecked) => widget.updatePreference(
                        widget.dayNumber,
                        Preference(
                          time: widget.preference.time,
                          isDoubleBooking: isChecked,
                        ),
                      )
                  : null,
            ),
            Text('Dobbel?')
          ],
        ),
      ),
    );
  }
}
