const express = require('express');
const auth = require('../middleware/auth');
const db = require('../db');

const router = express.Router();

router.param('requestId', (req, res, next, id) => {
  if (id && !db.isValidUUID(id)) {
    return res.status(400).json({ error: 'Invalid request reference ID' });
  }
  next();
});

router.param('id', (req, res, next, id) => {
  if (id && !db.isValidUUID(id)) {
    return res.status(400).json({ error: 'Invalid project reference ID' });
  }
  next();
});

// GET /api/projects/:id/requests - Get all requests for a project (Owner only)
router.get('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const project = await db.query('SELECT created_by FROM projects WHERE id = $1', [id]);
    if (project.rows.length === 0) return res.status(404).json({ error: 'Project not found' });
    if (project.rows[0].created_by !== req.userId) return res.status(403).json({ error: 'Unauthorized' });

    const result = await db.query(`
      SELECT jr.id, jr.user_id, jr.message, jr.role, jr.status, jr.created_at,
             u.name as user_name, u.avatar_url, u.availability,
             COALESCE((SELECT array_agg(s.name) FROM user_skills us JOIN skills s ON us.skill_id = s.id WHERE us.user_id = u.id), '{}') as user_skills
      FROM join_requests jr
      JOIN users u ON jr.user_id = u.id
      WHERE jr.project_id = $1 AND jr.status = 'pending'
    `, [id]);
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// PATCH /api/join-requests/:requestId/:status - Respond to a request
router.patch('/:requestId/:status', auth, async (req, res) => {
  const client = await db.pool.connect();
  try {
    const { requestId, status } = req.params;
    if (!['accepted', 'rejected'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    await client.query('BEGIN');

    const request = await client.query('SELECT jr.project_id, jr.user_id, jr.role, p.created_by, p.title FROM join_requests jr JOIN projects p ON jr.project_id = p.id WHERE jr.id = $1', [requestId]);
    if (request.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Request not found' });
    }

    if (request.rows[0].created_by !== req.userId) {
      await client.query('ROLLBACK');
      return res.status(403).json({ error: 'Unauthorized' });
    }

    await client.query('UPDATE join_requests SET status = $1 WHERE id = $2', [status, requestId]);

    if (status === 'accepted') {
      await client.query(
        'INSERT INTO project_members (id, user_id, project_id, role) VALUES (gen_random_uuid(), $1, $2, $3) ON CONFLICT DO NOTHING',
        [request.rows[0].user_id, request.rows[0].project_id, request.rows[0].role || 'Contributor']
      );
    }

    const msg = status === 'accepted' ? `SQUAD ENLISTED: You have been accepted into ${request.rows[0].title}` : `MISSION UPDATE: Your application to ${request.rows[0].title} was not accepted at this time.`;
    await client.query('INSERT INTO notifications (user_id, type, message, link) VALUES ($1, $2, $3, $4)', 
      [request.rows[0].user_id, 'join_response', msg, `/project/${request.rows[0].project_id}`]
    );

    await client.query('COMMIT');
    res.json({ success: true });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  } finally {
    client.release();
  }
});

module.exports = router;
