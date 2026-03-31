const express = require('express');
const db = require('../db');

const router = express.Router();

router.param('id', (req, res, next, id) => {
  if (id && !db.isValidUUID(id)) {
    return res.status(400).json({ error: 'Invalid hackathon reference ID' });
  }
  next();
});

// GET /api/hackathons - List all
router.get('/', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM hackathons ORDER BY deadline ASC');
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/hackathons/:id - Get one with projects
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const hackathon = await db.query('SELECT * FROM hackathons WHERE id = $1', [id]);
    if (hackathon.rows.length === 0) return res.status(404).json({ error: 'Hackathon not found' });

    const projects = await db.query(`
      SELECT p.id, p.title, p.description, p.status, p.team_size,
      COALESCE((SELECT array_agg(s.name) FROM project_skills ps JOIN skills s ON ps.skill_id = s.id WHERE ps.project_id = p.id), '{}') as skills
      FROM projects p
      WHERE p.hackathon_id = $1
    `, [id]);

    res.json({ ...hackathon.rows[0], projects: projects.rows });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
