const express = require('express');
const auth = require('../middleware/auth');
const db = require('../db');

const router = express.Router();

// GET /api/notifications - List user's notifications
router.get('/', auth, async (req, res, next) => {
  try {
    const result = await db.query(
      'SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC LIMIT 50',
      [req.userId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    next(error);
  }
});

// PATCH /api/notifications/read-all - Mark all as read
router.patch('/read-all', auth, async (req, res, next) => {
  try {
    await db.query(
      'UPDATE notifications SET is_read = true WHERE user_id = $1 AND is_read = false',
      [req.userId]
    );
    res.json({ success: true });
  } catch (error) {
    console.error('Error marking all notifications read:', error);
    next(error);
  }
});

// PATCH /api/notifications/:id/read - Mark one as read
router.patch('/:id/read', auth, async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await db.query(
      'UPDATE notifications SET is_read = true WHERE id = $1 AND user_id = $2 RETURNING *',
      [id, req.userId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Notification not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error marking notification read:', error);
    next(error);
  }
});

module.exports = router;
