const express = require("express");
const User = require("../models/User"); // Assuming you are using the User model
const router = express.Router();

/* GET home page */
router.get("/", function (req, res, next) {
  res.render("index", { title: "Express" });
});

// Display User Records
router.get("/viewrecord", async (req, res) => {
  try {
    const users = await User.find();
    res.render("viewrecord", { users });
  } catch (err) {
    console.error("Error fetching records:", err);
    res.status(500).send("Error occurred while retrieving records.");
  }
});

// Route for handling registration
router.post("/register", async (req, res) => {
  const { fname, lname, email, pwd, pwdConfirm } = req.body;

  if (pwd !== pwdConfirm) {
    return res.send("Passwords do not match.");
  }

  try {
    const user = new User({
      firstName: fname,
      lastName: lname,
      email: email,
      password: pwd,
    });

    await user.save();
    console.log("User registered:", user);
    res.redirect("/viewrecord");
  } catch (err) {
    console.error("Error creating record:", err);
    res.status(500).send("Error occurred while saving data.");
  }
});

// Display Login form
router.get("/login", (req, res) => {
  res.render("login");
});

// Handle Login form submission
router.post("/login", async (req, res) => {
  const { fname, password } = req.body;

  try {
    const user = await User.findOne({ firstName: fname });
    if (!user || !(await user.matchPassword(password))) {
      return res.send("Invalid credentials");
    }

    req.session.userId = user._id;
    res.redirect("/viewrecord");
  } catch (err) {
    console.error("Error during login:", err);
    res.status(500).send("Error occurred while logging in.");
  }
});

// Display Edit form
router.get("/edit/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    res.render("editrecord", { user });
  } catch (err) {
    console.error("Error fetching user for edit:", err);
    res.status(500).send("Error occurred while fetching user.");
  }
});

// Handle Edit form submission
router.post("/edit/:id", async (req, res) => {
  try {
    const { fname, lname, email } = req.body;
    await User.findByIdAndUpdate(req.params.id, {
      firstName: fname,
      lastName: lname,
      email,
    });
    res.redirect("/viewrecord");
  } catch (err) {
    console.error("Error updating record:", err);
    res.status(500).send("Error occurred while updating record.");
  }
});

module.exports = router;
