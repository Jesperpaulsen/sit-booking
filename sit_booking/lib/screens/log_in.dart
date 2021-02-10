import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/material.dart';

class LogIn extends StatefulWidget {
  static final routeName = '/home';

  @override
  _LogInState createState() => _LogInState();
}

class _LogInState extends State<LogIn> {
  final passwordController = new TextEditingController();
  final emailController = new TextEditingController();
  var loading = false;

  Future<void> signIn() async {
    final email = emailController.value.text;
    final password = passwordController.value.text;
    setState(() {
      loading = true;
    });
    try {
      await FirebaseAuth.instance
          .signInWithEmailAndPassword(email: email, password: password);
    } catch (error, stackTrace) {
      print(error);
    }
    setState(() {
      loading = false;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Center(
        child: Container(
          width: 300,
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              TextFormField(
                controller: emailController,
                decoration: InputDecoration(labelText: 'E-post'),
              ),
              TextFormField(
                controller: passwordController,
                decoration: InputDecoration(labelText: 'Passord'),
              ),
              Padding(
                padding: const EdgeInsets.all(8.0),
                child: loading
                    ? CircularProgressIndicator()
                    : ElevatedButton(
                        onPressed: signIn,
                        child: Text('Logg inn'),
                      ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
