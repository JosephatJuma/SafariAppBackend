const functions = require("firebase-functions");

// // Create and deploy your first functions
// // https://firebase.google.com/docs/functions/get-started
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//   functions.logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });

//Firebase Initialization
var admin = require("firebase-admin");
var serviceAccount = require("./serviceKey.json");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://tuzunge-default-rtdb.firebaseio.com",
  authDomain: "https://tuzunge-default-rtdb.firebaseapp.com",
});
var db = admin.database();

const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const nodemailer = require("nodemailer");
const app = express();

app.use(express.json());
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));

//Functions
const crypto = require("crypto");
function generateUserId() {
  //create user id (random number)
  return crypto.randomBytes(10).toString("hex");
}
function generateServiceId() {
  //gernerate a booking id
  return 10000 + Math.floor(Math.random() * 90000);
}
function getCurrentDateAndTime() {
  //generate the time
  const today = new Date();
  return today.toLocaleString();
}

//AUTHENTICATION MODULES
app.post("/user/create/", (req, res) => {
  const id = generateUserId();
  const user = {
    email: req.body.email,
    emailVerified: false,
    password: req.body.password,
    displayName: req.body.name,
    photoURL: "http://www.example.com/12345678/photo.png",
    disabled: true,
    name: req.body.name,
    userID: id,
    city: req.body.city,
    phone: req.body.phone,
  };

  admin
    .auth()
    .createUser({
      email: req.body.email,
      emailVerified: false,
      password: req.body.password,
      displayName: req.body.name,
      disabled: false,
      uid: id,
      name: req.body.name,
      phoneNumber: req.body.phone,
    })
    .then(function (userRecord) {
      // See the UserRecord reference doc for the contents of userRecord.
      console.log("Successfully created new user:", userRecord.uid);
      var ref = db.ref("users/" + user.userID);
      ref.set(user);
      res.json(userRecord);
    })
    .catch(function (error) {
      console.log("Error creating new user:", error);
      res.json({ status: false, message: error.message });
    });
});

app.get("/user/login", (req, res) => {
  const email = "jumajosephat61@gmail.com";
  const password = "Jose@2000";
  const auth = admin.auth();

  auth
    .getUserByEmail(email)
    .then((userRecord) => {
      const userID = userRecord.uid;
      //console.log(userRecord);
      return auth.createSessionCookie(userID, {
        expiresIn: 2000000,
      });
    })
    .then((sessionCookie) => {
      // Sign in user with the session cookie.
    })
    .catch((error) => {
      console.log("Error signing in: ", error.message);

      res.send(error);
    });
});

//GET SERVICES MODULES
//get all the trips added
app.get("/all/trips/", (req, res) => {
  db.ref("/trips")
    .once("value", function (snapshot) {
      const result = snapshot.val();
    })
    .then((result) => {
      console.log(result);
      res.json(result.val());
    })
    .catch((error) => {
      res.send(error);
    });
});

//get bookings for a particular user
app.post("/user/all/bookings", (req, res) => {
  const uid = req.body.userID;
  db.ref("/bookings/" + uid)
    .once("value", function (snapshot) {
      const result = snapshot.val();
      console.log(result);
    })
    .then((result) => {
      res.json(result);
    })
    .catch((error) => {
      res.send(error);
    });
});

//book a trip
app.post("/user/booking/", (req, res) => {
  console.log(req.body);
  const tripID = "T45757";
  const userID = req.body.userID;
  const cost = 120000;
  amountPaid = 100000;
  const date = getCurrentDateAndTime();
  const id = "B" + generateServiceId();
  const booking = {
    id: id,
    userID: userID,
    tripID: req.body.id,
    dateBooked: date,
    cost: cost, //req.body.amount,
    amountPaid: amountPaid, //req.body.amountPaid,
    cleared: false, //req.body.cleared,
    balance: cost - amountPaid,
    dueDate: "20/02/2023", // req.body.dueDate,
  };
  var ref = db.ref("bookings/" + userID + "/" + id);
  ref
    .set(booking)
    .then(() => {
      res.json(booking);
    })
    .catch((error) => {
      res.send(error);
    });
});

//ADMINSTARTIVE
//add a new trip
app.get("/admin/add/trip", (req, res) => {
  const id = "T" + generateServiceId();
  const date = getCurrentDateAndTime();
  const details = {
    id: id,
    title: "Visit Kalangala",
    createdOn: date,
    photoURL: "https://randomuser.me/api/portraits/men/36.jpg",
    venue: { lat: 1000, long: 2000, location: "Kalangala District" },
    scheduled: "20/02/2023",
  };
  var ref = db.ref("trips/" + id);
  ref.set(details);
  res.json(details);
  console.log(details);
});

const port = 10000;
//launch the server
app.listen(port, () => {
  console.log("Running on port " + port);
});
