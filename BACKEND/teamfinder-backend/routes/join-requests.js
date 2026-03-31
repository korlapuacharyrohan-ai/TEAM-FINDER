const express = require('express');
const auth = require('../middleware/auth');
const db = require('../db');

const router = express.Router();

/**
 * PATCH /api/join-requests/:id/accept
 * Set status to 'accepted', join project_members, notify applicant
 */
router.patch('/:id/accept', auth, async (req, res, next) => {
  try {
    const requestId = req.params.id;
    const userId = req.userId;

    // 1. Get request and project context
    const requestRes = await db.query(
      `SELECT jr.*, p.created_by, p.title 
       FROM join_requests jr 
       JOIN projects p ON jr.project_id = p.id 
       WHERE jr.id = $1`,
      [requestId]
    );

    if (requestRes.rows.length === 0) {
      return res.status(404).json({ error: 'Join request not found' });
    }

    const request = requestRes.rows[0];

    // 2. Ownership check
    if (request.created_by !== userId) {
      return res.status(403).json({ error: 'Unauthorized: Only project owner can accept' });
    }

    if (request.status !== 'pending') {
      return res.status(400).json({ error: `Request already ${request.status}` });
    }

    await db.query('BEGIN');

    // 3. Update request status
    await db.query('UPDATE join_requests SET status = $1 WHERE id = $2', ['accepted', requestId]);

    // 4. Add to project_members
    await db.query(
      'INSERT INTO project_members (project_id, user_id, role) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING',
      [request.project_id, request.user_id, request.role || 'Member']
    );

    // 5. Send notification
    await db.query(
      'INSERT INTO notifications (user_id, type, message, link) VALUES ($1, $2, $3, $4)',
      [request.user_id, 'request_accepted', `Success! You've been recruited for "${request.title}".`, `/project/${request.project_id}`]
    );

    await db.query('COMMIT');

    res.json({ success: true });
  } catch (error) {
    await db.query('ROLLBACK');
    console.error('Join Request Accept Failure:', error);
    next(error);
  }
});

/**
 * PATCH /api/join-requests/:id/reject
 * Set status to 'rejected', notify applicant
 */
router.patch('/:id/reject', auth, async (req, res, next) => {
  try {
    const requestId = req.params.id;
    const userId = req.userId;

    const requestRes = await db.query(
      `SELECT jr.*, p.created_by, p.title 
       FROM join_requests jr 
       JOIN projects p ON jr.project_id = p.id 
       WHERE jr.id = $1`,
      [requestId]
    );

    if (requestRes.rows.length === 0) {
      return res.status(404).json({ error: 'Join request not found' });
    }

    const request = requestRes.rows[0];

    if (request.created_by !== userId) {
      return res.status(403).json({ error: 'Unauthorized: Only project owner can reject' });
    }

    await db.query('BEGIN');

    await db.query('UPDATE join_requests SET status = $1 WHERE id = $2', ['rejected', requestId]);

    await db.query(
      'INSERT INTO notifications (user_id, type, message, link) VALUES ($1, $2, $3, $4)',
      [request.user_id, 'request_rejected', `Update: Your request to join "${request.title}" was declined.`, `/project/${request.project_id}`]
    );

    await db.query('COMMIT');

    res.json({ success: true });
  } catch (error) {
    await db.query('ROLLBACK');
    console.error('Join Request Reject Failure:', error);
    next(error);
  }
});

module.exports = router;
