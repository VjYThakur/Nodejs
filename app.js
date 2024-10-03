// server.js
var createError = require("http-errors");
const express = require("express");
const cors = require("cors");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const mongoose = require("mongoose");
require("dotenv").config(); // Load environment variables from .env file
const bodyParser = require("body-parser");

// Import routers
const indexRouter = require("./routes/index");
const usersRouter = require("./routes/users"); // If you have user-specific routes

const app = express();
const port = process.env.PORT || 4000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(logger("dev")); // Logger middleware
app.use(cookieParser()); // Cookie parser middleware
app.use(express.static(path.join(__dirname, "public"))); // Serve static files
app.use(bodyParser.urlencoded({ extended: false }));

// Setup routes
app.use("/", indexRouter);
app.use("/users", usersRouter); // If you have user-specific routes

// View engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "jade");

// Database connection
mongoose
  .connect(process.env.MONGODB_URI || "mongodb://localhost:27017/Testing")
  .then(() => console.log("Database connected successfully"))
  .catch((err) => console.error("Database connection error:", err));

// Start the server
const server = app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
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
