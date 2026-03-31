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

    // Query 4: Fetch pending join requests for owned projects
    const requestsResult = await db.query(`
      SELECT jr.id, jr.project_id, jr.user_id, jr.message, jr.role, jr.created_at, 
             u.name as user_name, u.avatar_url, u.bio, u.availability,
             COALESCE((SELECT array_agg(s.name) FROM user_skills us JOIN skills s ON us.skill_id = s.id WHERE us.user_id = u.id), u.skills) as user_skills,
             p.title as project_title
      FROM join_requests jr
      JOIN users u ON jr.user_id = u.id
      JOIN projects p ON jr.project_id = p.id
      WHERE p.created_by = $1 AND jr.status = 'pending'
      ORDER BY jr.created_at DESC
    `, [userId]);

    res.json({
      user,
      stats,
      projects: projectsResult.rows,
      requests: requestsResult.rows
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/dashboard/requests/:id/respond - Accept or reject request
router.post('/requests/:id/respond', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // 'accepted' or 'rejected'
    const userId = req.userId;

    if (!['accepted', 'rejected'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    // Verify owner
    const requestRes = await db.query(`
      SELECT jr.*, p.created_by 
      FROM join_requests jr 
      JOIN projects p ON jr.project_id = p.id 
      WHERE jr.id = $1`, [id]);

    if (requestRes.rows.length === 0) {
      return res.status(404).json({ error: 'Request not found' });
    }

    const request = requestRes.rows[0];
    if (request.created_by !== userId) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    await db.query('BEGIN');

    await db.query('UPDATE join_requests SET status = $1 WHERE id = $2', [status, id]);

    if (status === 'accepted') {
      // Add member
      await db.query(
        'INSERT INTO project_members (id, user_id, project_id, role) VALUES (gen_random_uuid(), $1, $2, $3)',
        [request.user_id, request.project_id, request.role || 'Member']
      );
      
      // Notify applicant
      const projectRes = await db.query('SELECT title FROM projects WHERE id = $1', [request.project_id]);
      const pTitle = projectRes.rows[0]?.title || 'a project';
      
      await db.query(`
        INSERT INTO notifications (user_id, type, message, link) VALUES ($1, $2, $3, $4)`,
        [request.user_id, 'request_accepted', `Your request to join "${pTitle}" was accepted!`, `/project/${request.project_id}`]
      );

      // Notify existing members
      const applicantRes = await db.query('SELECT name FROM users WHERE id = $1', [request.user_id]);
      const applicantName = applicantRes.rows[0]?.name || 'A new member';

      const existingMembers = await db.query(`
        SELECT user_id FROM project_members 
        WHERE project_id = $1 AND user_id != $2 AND user_id != $3`,
        [request.project_id, request.user_id, userId]
      );
      
      for (const row of existingMembers.rows) {
        await db.query(`
          INSERT INTO notifications (user_id, type, message, link) VALUES ($1, $2, $3, $4)`,
          [row.user_id, 'new_member', `${applicantName} joined your project "${pTitle}".`, `/project/${request.project_id}`]
        );
      }
    } else if (status === 'rejected') {
      // Notify applicant of rejection
      const projectRes = await db.query('SELECT title FROM projects WHERE id = $1', [request.project_id]);
      const pTitle = projectRes.rows[0]?.title || 'a project';
      
      await db.query(`
        INSERT INTO notifications (user_id, type, message, link) VALUES ($1, $2, $3, $4)`,
        [request.user_id, 'request_rejected', `Your request to join "${pTitle}" was declined.`, `/project/${request.project_id}`]
      );
    }

    await db.query('COMMIT');
    res.json({ success: true, status });
  } catch (error) {
    await db.query('ROLLBACK');
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;

