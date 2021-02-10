import * as admin from 'firebase-admin';

const serviceAccount = require('../serviceAccount.json');

admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
const firestore = admin.firestore();
const auth = admin.auth();

export default admin;
export { firestore, auth };