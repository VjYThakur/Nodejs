var express = require("express");
var router = express.Router();

// Basic route for users (expand as needed)
router.get("/", function (req, res, next) {
  res.send("respond with a resource");
});

module.exports = router;
