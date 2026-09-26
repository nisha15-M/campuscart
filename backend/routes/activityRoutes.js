const express = require('express');
const router = express.Router();
const Activity = require('../models/Activity');

router.get('/', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const activities = await Activity.find()
      .sort({ createdAt: -1 })
      .limit(limit);
    res.json(activities);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch activity', error: err.message });
  }
});

module.exports = router;