const express = require('express');
const auth = require('../middleware/auth');
const db = require('../db');

const router = express.Router();

// POST /api/projects - Create project (protected)
router.post('/', auth, async (req, res) => {
  try {
    const { title, description, category, status, team_size, duration, work_style, skills } = req.body;

    // Validate scalar fields
    if (!title || !description || !category || !status || !team_size || !duration || !work_style) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Validate skills array
    if (!Array.isArray(skills) || skills.length === 0) {
      return res.status(400).json({ error: 'Skills must be a non-empty array' });
    }

    const createdBy = req.userId;

    // Insert project
    const projectResult = await db.query(
      `INSERT INTO projects (id, title, description, category, status, team_size, duration, work_style, skills, created_by, created_at) 
       VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8, $9, NOW()) RETURNING *`,
      [title, description, category, status, team_size, duration, work_style, skills, createdBy]
    );

    const project = projectResult.rows[0];

    // Add creator as member
    await db.query(
      'INSERT INTO project_members (id, user_id, project_id) VALUES (gen_random_uuid(), $1, $2)',
      [createdBy, project.id]
    );

    res.status(201).json(project);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/projects - List/filter projects (public)
router.get('/', async (req, res) => {
  try {
    const { search, category, status, work_style, sort } = req.query;

    const conditions = [];
    const params = [];

    if (search) {
      params.push(`%${search}%`);
      conditions.push(`(title ILIKE $${params.length} OR description ILIKE $${params.length} OR category ILIKE $${params.length} OR EXISTS (SELECT 1 FROM unnest(skills) AS skill WHERE skill ILIKE $${params.length}))`);
    }

    if (category) {
      params.push(category);
      conditions.push(`category = $${params.length}`);
    }

    if (status) {
      params.push(status);
      conditions.push(`status = $${params.length}`);
    }

    if (work_style) {
      params.push(work_style);
      conditions.push(`work_style = $${params.length}`);
    }

let query = `SELECT p.*, COALESCE(pm_count.member_count, 0) as member_count FROM projects p LEFT JOIN (
      SELECT project_id, COUNT(*) as member_count FROM project_members GROUP BY project_id
    ) pm_count ON p.id = pm_count.project_id`;
    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += sort === 'oldest' ? ' ORDER BY created_at ASC' : ' ORDER BY created_at DESC';

    const result = await db.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
