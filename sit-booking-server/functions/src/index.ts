import * as functions from "firebase-functions";
import * as admin from 'firebase-admin';
// // Start writing Firebase Functions
// // https://firebase.google.com/docs/functions/typescript
//
// export const helloWorld = functions.https.onRequest((request, response) => {
//   functions.logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });

admin.initializeApp();

export const updatePassword = functions.region('europe-west1').https.onRequest(async (request, response) => {
  let password = ''
  let phone = ''

  var lines = request.body.plain.split('\n') as string;
  for(const line of lines){
    if (line.includes('Brukernavn')) {
      const startIndex = line.indexOf(' ')
      phone = line.substring(startIndex).trimStart()
    }
    else if (line.includes('Passord')) {
      const startIndex = line.indexOf(' ')
      password = line.substring(startIndex).trimStart()
    }
  }

  console.log(password);

  try {
    const snapshot = await admin.firestore().collection('profiles').where('phone', '==', Number(phone)).get();
    if (!snapshot.empty) {
      const id = snapshot.docs[0].id;
      console.log(id);
      if (id) await admin.firestore().collection('profiles').doc(id).update({ sitPassword: password });
    }
  } catch (e) {
    console.log(e);
  }

  response.status(200).send();
});