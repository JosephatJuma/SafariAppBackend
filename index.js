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
const app = express();
const host = "0000/0";

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
app.get("/", (req, res) => {
  res.send("Up and runnibg");
});
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
      phoneNumber: req.body.phone,
    })
    .then(function (userRecord) {
      // sned data to the dbs
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
      return auth.createSessionCookie(userID, {
        expiresIn: 2000000,
      });
    })
    .then((sessionCookie) => {}) // Sign in user with the session cookie.
    .catch((error) => {
      console.log("Error signing in: ", error.message);
      res.send(error);
    });
});

//GET SERVICES MODULES
//get all the trips added
app.get("/all/trips/", (req, res) => {
  db.ref("/trips")
    .once("value", function (snapshot) {})
    .then((result) => {
      console.log(result);
      res.json(result.val());
    })
    .catch((error) => {
      res.send(error);
    });
});
//get all bookings for admin user
app.get("/all/bookings/", (req, res) => {
  db.ref("/bookings/" + "4b9dcea643c661370d33")
    .once("value", function (snapshot) {})
    .then((result) => {
      console.log(result);
      res.json(result.val());
    })
    .catch((error) => {
      res.send(error);
    });
});
//get all users for admin user
app.get("/all/users/", (req, res) => {
  db.ref("/users/")
    .once("value", function (snapshot) {})
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
    })
    .then((result) => {
      res.json(result);
    })
    .catch((error) => {
      res.send(error.message);
    });
});

app.post("/search", (req, res) => {
  const searchTerm = req.body.searchTerm;
  console.log(searchTerm);
  db.ref("trips")
    .orderByChild("trips")
    .equalTo(searchTerm)
    .once("value")
    .then((snapshot) => {
      const items = snapshot.val();
      console.log(items);
    })
    .catch((error) => {
      console.error(error);
    });
});

//book a trip and save to db
app.post("/user/booking/", (req, res) => {
  const userID = req.body.userID;
  const date = getCurrentDateAndTime();
  const id = "B" + generateServiceId();
  const booking = {
    bookingDate: date,
    id: id,
    userID: userID,
    confirmed: req.body.confirmed,
    trip: req.body.item,
    tripID: req.body.item.id,
  };
  var ref = db.ref("bookings/" + userID + "/" + id);
  ref
    .set(booking)
    .then(() => {
      res.json(booking);
    })
    .catch((error) => {
      res.send(error.message);
    });
});

//ADMINSTARTIVE
//add a new trip
app.post("/admin/add/trip", (req, res) => {
  // const sql =
  //   "INSERT INTO trips(id, firstName, lastName,Phone, email,password) VALUES (?,?,?,?,?,?)";
  // databaseConnection.query(
  //   sql,
  //   [id, fname, lname, phone, email, password],
  //   (err, result) => {
  //     if (err) throw error;
  //     console.log(result);
  //     if (result) {
  //       const message = "Successfully resigstered, Now login";
  //       res.send(message);
  //     }
  //   }
  // );
  const id = "T" + generateServiceId();
  const date = getCurrentDateAndTime();
  const details = {
    id: id,
    title: req.body.title,
    createdOn: date,
    description: req.body.description,
    photoURL:
      "https://reactnativecode.com/wp-content/uploads/2018/02/Default_Image_Thumbnail.png",
    startDate: req.body.startDate,
    endDate: req.body.endDate,
    price: req.body.amount,
    destination: req.body.destination,
  };
  var ref = db.ref("trips/" + id);
  ref.set(details);
  res.json({ message: "Successfully added trip" });
});

//flutterwave payment

app.get("/payment", (req, res) => {
  const FLW_PUBLIC_KEY = "FLWPUBK_TEST-9b20b51419bb0e23f960a0d675a78c75-X";
  const FLW_SECRET_KEY = "FLWSECK_TEST-42d83c2dec42a31c028c19d47e5551c9-X";
  const Flutterwave = require("flutterwave-node-v3");
  const flw = new Flutterwave(FLW_PUBLIC_KEY, FLW_SECRET_KEY);
  const ug_mobile_money = async () => {
    try {
      const payload = {
        tx_ref: "MC-1585230950508",
        amount: "15000",
        email: "jumajosephat61@gmail.com",
        phone_number: "+256702206985",
        currency: "UGX",
        fullname: "Juma Josephat",
        redirect_url: "https://rave-webhook.herokuapp.com/receivepayment",
        voucher: "128373",
        network: "MTN",
      };

      const response = await flw.MobileMoney.uganda(payload);
      res.send(response.meta.authorization.redirect);
      res.end();
    } catch (error) {
      //console.log(error);
      res.send(error);
    }
  };
  ug_mobile_money();
});

const port = 3000;

//launch the server
app.listen(port,"0000/0", () => {
  console.log("Running on port " + port);
});
