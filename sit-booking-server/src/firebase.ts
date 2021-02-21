import * as admin from 'firebase-admin';

const serviceAccount = require('../serviceAccount.json');

admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
const firestore = admin.firestore();
const auth = admin.auth();
const messaging = admin.messaging();

export default admin;
export { firestore, auth, messaging };