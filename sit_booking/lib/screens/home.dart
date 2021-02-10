import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:sit_booking/models/profile.dart';
import 'package:sit_booking/providers/user_provider.dart';
import 'package:sit_booking/widgets/TimeForDay.dart';

class Home extends StatelessWidget {
  final Profile profile;
  final bool loading;

  Home(this.profile, this.loading);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Sit Dooown ${profile.name}'),
      ),
      body: SingleChildScrollView(
        child: Center(
          child: Consumer(
            builder: (BuildContext context, ScopedReader watch, Widget child) {
              final userProvider = context.read(UserProvider.provider);
              return Column(
                children: [
                  Column(
                      children: this
                          .profile
                          .preferences
                          .asMap()
                          .entries
                          .map((entry) => TimeForDay(
                              userProvider.updatePreference,
                              entry.value,
                              entry.key))
                          .toList()),
                  Padding(
                    padding: const EdgeInsets.all(8.0),
                    child: ElevatedButton(
                      onPressed: userProvider.saveProfile,
                      child: Text('Lagre'),
                    ),
                  ),
                ],
              );
            },
          ),
        ),
      ),
    );
  }
}
