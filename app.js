const express = require("express");
const User = require("./models/User"); // Adjust the path if necessary
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const path = require("path");
const cookieParser = require("cookie-parser"); // Add this import
const logger = require("morgan"); // Add this import

// Import routers
const indexRouter = require("./routes/index"); // Define or adjust the path if necessary
const usersRouter = require("./routes/users"); // Define or adjust the path if necessary

const app = express();
const port = process.env.PORT || 4000;
const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret"; // Use environment variable for secret

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(logger("dev")); // Added logger middleware
app.use(cookieParser()); // Added cookieParser middleware
app.use(express.static(path.join(__dirname, "public")));

// Setup routes
app.use("/", indexRouter);
app.use("/users", usersRouter);
app.use("/viewrecord", indexRouter); // Confirm if indexRouter is appropriate
app.use("/editrecord", indexRouter); // Confirm if indexRouter is appropriate

// View engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "jade");

// Database connection
const mongoose = require("mongoose");
const MongoClient = require("mongodb").MongoClient;
mongoose
  .connect("mongodb://localhost:27017/Testing")
  .then(() => console.log("Database connected successfully"))
  .catch((err) => console.log("Database connection error:", err));

const connect = mongoose.connection;
connect.once("open", function () {
  console.log("Database connected successfully");
});

connect.on("error", function (err) {
  console.log("Database connection error: " + err);
});

// User registration route
app.post("/register", async (req, res) => {
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

// User login route
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: "Invalid email or password" });
    }

    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: "1h" });

    res.json({ token });
  } catch (err) {
    res.status(500).json({ error: "Server error: " + err.message });
  }
});

// Start the server
const server = app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

// Handle port conflict errors
server.on("error", (err) => {
  if (err.code === "EADDRINUSE") {
    console.error(`Port ${port} is already in use, choosing another port...`);
    const newServer = app.listen(0, () => {
      console.log(`Server is running on port ${newServer.address().port}`);
    });
  } else {
    console.error(err);
  }
});

module.exports = app;
