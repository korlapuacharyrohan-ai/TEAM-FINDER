const jwt = require('jsonwebtoken');
const db = require('../db');

const auth = (req, res, next) => {
  try {
    let token = req.cookies?.token;

    if (!token && req.headers.authorization?.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }
    
    if (!token) {
      return res.status(401).json({ error: 'Missing or invalid token' });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    req.userId = decoded.userId;
    req.user = { id: decoded.userId };

    
    // Asynchronously update last active status
    db.query('UPDATE users SET last_active = NOW() WHERE id = $1', [decoded.userId])
      .catch(err => console.error('Failed to update activity status:', err.message));
    
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
};

module.exports = auth;
