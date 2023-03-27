//Firebase Initialization
var admin = require("firebase-admin");
var serviceAccount = require("../serviceKey.json");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://tuzunge-default-rtdb.firebaseio.com",
  authDomain: "https://tuzunge-default-rtdb.firebaseapp.com",
});
export const db = admin.database();
export const auth = admin.auth();
