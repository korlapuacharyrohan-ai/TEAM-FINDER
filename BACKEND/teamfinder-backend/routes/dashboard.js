const express = require('express');
const auth = require('../middleware/auth');
const db = require('../db');

const router = express.Router();

// GET /api/dashboard - Dashboard data (protected)
router.get('/', auth, async (req, res) => {
  try {
    const userId = req.userId;

    // Query 1: Fetch user info
    const userResult = await db.query(
      'SELECT name, email FROM users WHERE id = $1',
      [userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = userResult.rows[0];

    // Query 2: Fetch stats in one query
    const statsResult = await db.query(`
      SELECT
        COUNT(*) AS "totalProjects",
        COUNT(*) FILTER (WHERE status = 'Recruiting') AS "recruiting",
        COUNT(*) FILTER (WHERE status = 'Active') AS "active",
        COUNT(*) FILTER (WHERE created_by = $1) AS "myProjects"
      FROM projects
    `, [userId]);

    const stats = statsResult.rows[0];
    stats.totalProjects = parseInt(stats.totalProjects);
    stats.recruiting = parseInt(stats.recruiting);
    stats.active = parseInt(stats.active);
    stats.myProjects = parseInt(stats.myProjects);

    // Query 3: Fetch all projects
    const projectsResult = await db.query('SELECT * FROM projects ORDER BY created_at DESC');

    res.json({
      user,
      stats,
      projects: projectsResult.rows
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;

