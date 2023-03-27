import { db, auth } from "../Models/Model";
const express = require("express");
const router = express.Router();
const crypto = require("crypto");

function generateUserId() {
  return crypto.randomBytes(10).toString("hex");
} //Generate user ID

router.post("/", (req, res) => {
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

  auth
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
      console.log("Successfully created new user:", userRecord.uid);
      var ref = db.ref("users/" + user.userID);
      ref.set(user);
      res.json(userRecord);
    }) // send data to the dbs
    .catch(function (error) {
      console.log("Error creating new user:", error);
      res.json({ status: false, message: error.message });
    });
});

module.exports = router;
