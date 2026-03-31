const express = require('express');
const db = require('../db');

const router = express.Router();

// GET /api/hackathons - List all open hackathons
router.get('/', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM hackathons ORDER BY deadline ASC');
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/hackathons/:id - Specific hackathon details and associated projects
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const hackathonRes = await db.query('SELECT * FROM hackathons WHERE id = $1', [id]);
    if (hackathonRes.rows.length === 0) {
      return res.status(404).json({ error: 'Hackathon not found' });
    }

    const hackathon = hackathonRes.rows[0];

    const projectsRes = await db.query(`
      SELECT p.id, p.title, p.description, p.category, p.status, p.team_size, p.duration, p.work_style, p.created_by, p.created_at, p.demo_url, p.repo_url, 
      COALESCE(pm_count.member_count, 0) as member_count,
      COALESCE((SELECT array_agg(s.name) FROM project_skills ps JOIN skills s ON ps.skill_id = s.id WHERE ps.project_id = p.id), p.skills) as skills
      FROM projects p LEFT JOIN (
        SELECT project_id, COUNT(*) as member_count FROM project_members GROUP BY project_id
      ) pm_count ON p.id = pm_count.project_id
      WHERE p.hackathon_id = $1
      ORDER BY p.created_at DESC
    `, [id]);

    hackathon.projects = projectsRes.rows;

    res.json(hackathon);
  } catch (error) {
    console.error(error);
    if (error.code === '22P02') {
      return res.status(404).json({ error: 'Hackathon not found' });
    }
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
