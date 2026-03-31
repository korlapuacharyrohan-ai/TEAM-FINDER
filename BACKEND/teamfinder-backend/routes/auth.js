const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const passport = require('passport');
const GitHubStrategy = require('passport-github2').Strategy;
const db = require('../db');
const { encrypt } = require('../utils/encryption');
const auth = require('../middleware/auth');

const router = express.Router();

router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const existingUser = await db.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      return res.status(409).json({ error: 'Email already in use' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await db.query(
      'INSERT INTO users (id, name, email, password, created_at) VALUES (gen_random_uuid(), $1, $2, $3, NOW()) RETURNING id, name, email',
      [name, email, hashedPassword]
    );

    const token = jwt.sign({ userId: user.rows[0].id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.status(201).json({
      success: true,
      user: user.rows[0]
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const result = await db.query('SELECT id, name, email, password FROM users WHERE email = $1', [email]);
    
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = result.rows[0];

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    const { password: _, ...userWithoutPassword } = user;

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.json({
      success: true,
      user: userWithoutPassword
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/auth/me - Check current authentication status
router.get('/me', auth, async (req, res) => {
  try {
    const result = await db.query(
      'SELECT id, name, email, avatar_url, bio FROM users WHERE id = $1',
      [req.userId]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'User not found' });
    res.json({ success: true, user: result.rows[0] });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/auth/exchange - Exchange temp code for httpOnly token
router.post('/exchange', async (req, res) => {
  try {
    const { code } = req.body;
    if (!code) return res.status(400).json({ error: 'Code is required' });

    const result = await db.query(
      'DELETE FROM auth_codes WHERE code = $1 AND expires_at > NOW() RETURNING user_id',
      [code]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ error: 'Invalid or expired code' });
    }

    const userId = result.rows[0].user_id;
    const user = await db.query('SELECT id, name, email FROM users WHERE id = $1', [userId]);

    const token = jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.json({ success: true, user: user.rows[0] });
  } catch (error) {
    console.error('Exchange error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/auth/logout - Clear httpOnly cookie
router.post('/logout', (req, res) => {
  res.clearCookie('token');
  res.json({ success: true });
});


const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID || 'mock_client_id';
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET || 'mock_client_secret';

passport.use(new GitHubStrategy({
    clientID: GITHUB_CLIENT_ID,
    clientSecret: GITHUB_CLIENT_SECRET,
    callbackURL: process.env.GITHUB_REDIRECT_URI,
    passReqToCallback: true
  },
  async function(req, accessToken, refreshToken, profile, done) {
    try {
      // Look for a token representing an existing platform user connecting GitHub
      const jwtToken = req.session?.githubStateToken;
      let existingUserId = null;
      
      if (jwtToken) {
        try {
          const decoded = jwt.verify(jwtToken, process.env.JWT_SECRET);
          existingUserId = decoded.userId;
        } catch (e) {
          console.error("Invalid explicit token during github connect:", e);
        }
      }

      const topLanguages = [];
      try {
        const reposRes = await fetch(`https://api.github.com/users/${profile.username}/repos?per_page=100`, {
          headers: { 'Authorization': `token ${accessToken}` }
        });
        const repos = await reposRes.json();
        if (Array.isArray(repos)) {
          const langCounts = {};
          repos.forEach(r => {
            if (r.language) langCounts[r.language] = (langCounts[r.language] || 0) + 1;
          });
          const sorted = Object.entries(langCounts).sort((a,b) => b[1] - a[1]);
          sorted.slice(0, 5).forEach(s => topLanguages.push(s[0]));
        }
      } catch (err) {
        console.error('Failed fetching GitHub repos for auto-hydration', err);
      }

      const encryptedToken = encrypt(accessToken);

      if (existingUserId) {
        await db.query(`
          UPDATE users SET github_id = $1, github_access_token = $2, avatar_url = COALESCE(avatar_url, $3), github_url = COALESCE(github_url, $4)
          WHERE id = $5
        `, [profile.id, encryptedToken, profile.photos?.[0]?.value, profile.profileUrl, existingUserId]);
        
        if (topLanguages.length > 0) {
           const skillsRes = await db.query('SELECT id, name FROM skills WHERE name = ANY($1)', [topLanguages]);
           const skillIds = skillsRes.rows.map(r => r.id);
           if (skillIds.length > 0) {
             const insertQuery = `INSERT INTO user_skills (user_id, skill_id) VALUES ${skillIds.map((_, i) => `($1, $${i + 2})`).join(', ')} ON CONFLICT DO NOTHING`;
             await db.query(insertQuery, [existingUserId, ...skillIds]);
           }
        }
        return done(null, { id: existingUserId });
      }

      const gitCheck = await db.query('SELECT id FROM users WHERE github_id = $1', [profile.id]);
      if (gitCheck.rows.length > 0) {
        await db.query('UPDATE users SET github_access_token = $1 WHERE github_id = $2', [encryptedToken, profile.id]);
        return done(null, gitCheck.rows[0]);
      }

      const email = profile.emails && profile.emails.length > 0 ? profile.emails[0].value : null;
      if (email) {
        const emailCheck = await db.query('SELECT id FROM users WHERE email = $1', [email]);
        if (emailCheck.rows.length > 0) {
           await db.query('UPDATE users SET github_id = $1, github_access_token = $2 WHERE id = $3', [profile.id, encryptedToken, emailCheck.rows[0].id]);
           return done(null, emailCheck.rows[0]);
        }
      }

      const name = profile.displayName || profile.username;
      
      const newUser = await db.query(
        'INSERT INTO users (id, name, email, avatar_url, github_url, github_id, github_access_token, created_at) VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, NOW()) RETURNING id',
        [name, email || `${profile.username}@github.local`, profile.photos?.[0]?.value, profile.profileUrl, profile.id, encryptedToken]
      );

      const newId = newUser.rows[0].id;
      if (topLanguages.length > 0) {
         const skillsRes = await db.query('SELECT id, name FROM skills WHERE name = ANY($1)', [topLanguages]);
         const skillIds = skillsRes.rows.map(r => r.id);
         if (skillIds.length > 0) {
           const insertQuery = `INSERT INTO user_skills (user_id, skill_id) VALUES ${skillIds.map((_, i) => `($1, $${i + 2})`).join(', ')}`;
           await db.query(insertQuery, [newId, ...skillIds]);
         }
      }

      return done(null, newUser.rows[0]);
    } catch (err) {
      console.error('OAuth Handler Crash:', err);
      return done(err, null);
    }
  }
));

router.get('/github', (req, res, next) => {
  if (req.query.token) {
    req.session.githubStateToken = req.query.token;
  } else {
    delete req.session.githubStateToken;
  }
  passport.authenticate('github', { scope: ['user:email', 'repo'] })(req, res, next);
});

router.get('/github/callback', 
  (req, res, next) => {
    if (!process.env.FRONTEND_URL) {
      return res.status(500).json({ error: 'Server configuration error: FRONTEND_URL is not set. Cannot perform OAuth redirect.' });
    }
    passport.authenticate('github', { failureRedirect: `${process.env.FRONTEND_URL}/login?error=oauth_failed` })(req, res, next);
  },
  async function(req, res) {
    try {
      const codeRes = await db.query(
        'INSERT INTO auth_codes (user_id) VALUES ($1) RETURNING code',
        [req.user.id]
      );
      const code = codeRes.rows[0].code;
      res.redirect(`${process.env.FRONTEND_URL}/oauth-success?code=${code}`);
    } catch (err) {
      console.error('OAuth Code Gen Error:', err);
      res.redirect(`${process.env.FRONTEND_URL}/login?error=auth_code_failed`);
    }
  }

);

module.exports = router;
