// index.js
const express = require("express");
const User = require("../models/User");
const bcrypt = require("bcrypt");
const router = express.Router();

// GET home page
router.get("/", (req, res) => {
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
    return res.status(400).send("Passwords do not match.");
  }

  try {
    const hashedPassword = await bcrypt.hash(pwd, 10);
    const user = new User({
      firstName: fname,
      lastName: lname,
      email,
      password: hashedPassword,
    });

    await user.save();
    console.log("User registered:", user);
    res.redirect("/viewrecord");
  } catch (err) {
    console.error("Error creating record:", err);
    res.status(500).send("Error occurred while saving data.");
  }
});

// User registration route
router.post("/register", async (req, res) => {
  const { firstName, lastName, email, password } = req.body;

  try {
    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "User already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = new User({
      firstName,
      lastName,
      email,
      password: hashedPassword,
    });
    await user.save();

    res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    res.status(500).json({ error: "Server error: " + err.message });
  }
});

// Display Edit form
router.get("/edit/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).send("User not found.");
    }
    res.render("editrecord", { user });
  } catch (err) {
    console.error("Error fetching user for edit:", err);
    res.status(500).send("Error occurred while fetching user.");
  }
});

// Handle Edit form submission
router.post("/edit/:id", async (req, res) => {
  const { fname, lname, email } = req.body;
  try {
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

// Route to delete a user by ID
router.get("/delete/:userId", async (req, res) => {
  try {
    const deletedUser = await User.findByIdAndDelete(req.params.userId);
    if (!deletedUser) {
      return res.status(404).send("User not found");
    }
    res.redirect("/viewrecord");
  } catch (err) {
    console.error("Error deleting user:", err);
    res.status(500).send("Server error");
  }
});

// Display Login form
router.get("/login", (req, res) => {
  res.render("login");
});

//login handling

router.post("/login", async function (req, res) {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      console.error("Email and password are required.");
      return res.status(400).send("Email and password are required.");
    }
    console.log("Input validated");

    // Find the user by email
    const foundUser = await User.findOne({ email });
    console.log("User found:", foundUser);

    if (!foundUser) {
      console.error("User not found");
      return res.status(401).send("User not found");
    }
    console.log("User verification successful");

    // Compare the hashed password
    const isMatch = await bcrypt.compare(password, foundUser.password);
    console.log("Password match:", isMatch); // Debug: Check if password matches

    if (!isMatch) {
      console.error("Invalid email or password.");
      return res.status(401).send("Invalid email or password.");
    }

    // Set user info in session
    // req.session.userId = foundUser._id; // Save user ID in session
    // req.session.userName = foundUser.fname; // Save user name in session

    // Redirect to the view record page
    res.redirect("/viewrecord");
  } catch (err) {
    console.error("Error during login:", err);
    res.status(500).send("Internal server error.");
  }
});

// Global error handling
router.use((err, req, res, next) => {
  console.error("Global Error:", err);
  res.status(err.status || 500).send("Something broke!");
});

module.exports = router;
