const express = require("express");

const router = express.Router();

const {
  findCampusMatches,
} = require("../controllers/campusMatchController");

router.post("/", findCampusMatches);

module.exports = router;