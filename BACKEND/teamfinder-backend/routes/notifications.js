const express = require('express');
const auth = require('../middleware/auth');
const db = require('../db');

const router = express.Router();

router.param('id', (req, res, next, id) => {
  if (id && !db.isValidUUID(id)) {
    return res.status(400).json({ error: 'Invalid notification reference ID' });
  }
  next();
});

// GET /api/notifications - Get all for user
router.get('/', auth, async (req, res) => {
  try {
    const result = await db.query(
      'SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC',
      [req.userId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// PATCH /api/notifications/:id/read - Mark one as read
router.patch('/:id/read', auth, async (req, res) => {
  try {
    const { id } = req.params;
    await db.query(
      'UPDATE notifications SET is_read = true WHERE id = $1 AND user_id = $2',
      [id, req.userId]
    );
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// PATCH /api/notifications/read-all - Mark all as read
router.patch('/read-all', auth, async (req, res) => {
  try {
    await db.query(
      'UPDATE notifications SET is_read = true WHERE user_id = $1',
      [req.userId]
    );
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
