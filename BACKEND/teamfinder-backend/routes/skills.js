const express = require('express');
const db = require('../db');

const router = express.Router();

// GET /api/skills - Public list of available skills
router.get('/', async (req, res) => {
  try {
    const result = await db.query('SELECT id, name FROM skills ORDER BY name ASC');
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
