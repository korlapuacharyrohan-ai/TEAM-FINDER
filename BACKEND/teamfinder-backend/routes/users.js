const express = require('express');
const auth = require('../middleware/auth');
const db = require('../db');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

const router = express.Router();

router.param('id', (req, res, next, id) => {
  if (id && id !== 'me' && !db.isValidUUID(id)) {
    return res.status(400).json({ error: 'Invalid user reference ID' });
  }
  next();
});


// GET /api/users - List/filter users
router.get('/', async (req, res) => {
  try {
    const { search, skills, availability } = req.query;

    const conditions = [];
    const params = [];

    if (search) {
      params.push(`%${search}%`);
      const len = params.length;
      conditions.push(`(u.name ILIKE $${len} OR u.bio ILIKE $${len} OR EXISTS (SELECT 1 FROM user_skills us JOIN skills s ON us.skill_id = s.id WHERE us.user_id = u.id AND s.name ILIKE $${len}))`);
    }

    if (availability) {
      params.push(availability);
      conditions.push(`u.availability = $${params.length}`);
    }

    if (skills) {
      const skillsArray = skills.split(',').map(s => s.trim()).filter(Boolean);
      if (skillsArray.length > 0) {
        params.push(skillsArray);
        const len = params.length;
        conditions.push(`(SELECT count(*) FROM user_skills us JOIN skills s ON us.skill_id = s.id WHERE us.user_id = u.id AND s.name = ANY($${len})) = ${skillsArray.length}`);
      }
    }

    let query = `
      SELECT u.id, u.name, u.avatar_url, u.bio, u.availability,
      COALESCE((SELECT array_agg(s.name) FROM user_skills us JOIN skills s ON us.skill_id = s.id WHERE us.user_id = u.id), '{}') as skills
      FROM users u
    `;

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY u.created_at DESC LIMIT 50';

    const result = await db.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/users/:id - Public profile
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Get user details
    const userResult = await db.query(
      `SELECT id, name, email, created_at, avatar_url, bio, github_url, linkedin_url, portfolio_url, availability 
       FROM users WHERE id = $1`,
      [id]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = userResult.rows[0];

    const skillsResult = await db.query(
      `SELECT s.name FROM skills s JOIN user_skills us ON s.id = us.skill_id WHERE us.user_id = $1`,
      [id]
    );
    user.skills = skillsResult.rows.map(r => r.name);

    const endorsementsResult = await db.query(
      `SELECT skill, COUNT(*)::int as count FROM endorsements WHERE endorsed_user_id = $1 GROUP BY skill ORDER BY count DESC`,
      [id]
    );
    user.endorsements = endorsementsResult.rows;

    // Get projects the user is a part of (either created or joined)
    // We group them nicely.
    const projectsResult = await db.query(
      `SELECT p.id, p.title, p.description, p.category, p.status, p.team_size, p.work_style, p.created_by, p.created_at, p.demo_url, p.repo_url,
              pm.role as role,
              COALESCE((SELECT array_agg(s.name) FROM project_skills ps JOIN skills s ON ps.skill_id = s.id WHERE ps.project_id = p.id), p.skills) as skills
       FROM projects p
       JOIN project_members pm ON p.id = pm.project_id
       WHERE pm.user_id = $1
       ORDER BY p.created_at DESC`,
      [id]
    );

    user.projects = projectsResult.rows;

    res.json(user);
  } catch (error) {
    console.error(error);
    if (error.code === '22P02') { // invalid UUID format
      return res.status(404).json({ error: 'User not found' });
    }
    res.status(500).json({ error: 'Server error' });
  }
});

// PATCH /api/users/me - Protected profile update
router.patch('/me', auth, async (req, res) => {
  try {
    const { bio, github_url, linkedin_url, portfolio_url, availability } = req.body;
    const userId = req.userId;

    const updateResult = await db.query(
      `UPDATE users 
       SET bio = COALESCE($1, bio), 
           github_url = COALESCE($2, github_url), 
           linkedin_url = COALESCE($3, linkedin_url), 
           portfolio_url = COALESCE($4, portfolio_url),
           availability = COALESCE($5, availability)
       WHERE id = $6
       RETURNING id, name, email, created_at, avatar_url, bio, github_url, linkedin_url, portfolio_url, availability`,
      [bio || null, github_url || null, linkedin_url || null, portfolio_url || null, availability || null, userId]
    );

    if (updateResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(updateResult.rows[0]);
  } catch (error) {
    console.error('Profile Update Failure:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// POST /api/users/me/skills - Replace user's skills (delete existing, insert new)
router.post('/me/skills', auth, async (req, res) => {
  try {
    const { skills } = req.body;
    const userId = req.userId;

    if (!Array.isArray(skills)) {
      return res.status(400).json({ error: 'Skills must be an array' });
    }

    await db.query('BEGIN');

    // Remove old skills
    await db.query('DELETE FROM user_skills WHERE user_id = $1', [userId]);

    if (skills.length > 0) {
      // Find skill IDs for the provided names
      const skillsRes = await db.query('SELECT id FROM skills WHERE name = ANY($1)', [skills]);
      const skillIds = skillsRes.rows.map(r => r.id);
      
      if (skillIds.length > 0) {
        const insertValues = skillIds.map((_, i) => `($1, $${i + 2})`).join(', ');
        await db.query(`INSERT INTO user_skills (user_id, skill_id) VALUES ${insertValues}`, [userId, ...skillIds]);
      }
    }

    await db.query('COMMIT');
    res.json({ success: true, count: skills.length });
  } catch (error) {
    await db.query('ROLLBACK');
    console.error('Skill Update Failure:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// GET /api/users/:id/match-score - AI Skill Similarity with Gemini 1.5 Flash
router.get('/:id/match-score', auth, async (req, res) => {
  try {
    const targetUserId = req.params.id;
    const currentUserId = req.userId;

    if (targetUserId === currentUserId) {
      return res.json({ score: 100, bullets: ["You share all skills with yourself.", "No complementary skills needed.", "No gaps found."] });
    }

    // Fetch user skills
    const skillsQuery = `
      SELECT u.id, u.name, array_agg(s.name) filter (where s.name is not null) as skill_names
      FROM users u
      LEFT JOIN user_skills us ON u.id = us.user_id
      LEFT JOIN skills s ON us.skill_id = s.id
      WHERE u.id IN ($1, $2)
      GROUP BY u.id
    `;
    const skillsRes = await db.query(skillsQuery, [currentUserId, targetUserId]);
    
    const self = skillsRes.rows.find(r => r.id === currentUserId) || { skill_names: [] };
    const target = skillsRes.rows.find(r => r.id === targetUserId) || { skill_names: [] };

    // Standard Jaccard fallback score
    const selfSet = new Set(self.skill_names);
    const targetSet = new Set(target.skill_names);
    const intersection = new Set([...selfSet].filter(x => targetSet.has(x)));
    const union = new Set([...selfSet, ...targetSet]);
    const fallbackScore = union.size === 0 ? 0 : Math.round((intersection.size / union.size) * 100);

    // --- Gemini 1.5 Flash Analysis ---
    try {
      const prompt = `
        You are a skills analysis tool. Output a match percentage (0-100)
        and exactly 3 bullet points listing shared skills, complementary skills,
        and one gap. Each bullet max 12 words. No preamble.

        Context:
        Self Skills: ${self.skill_names.join(', ') || 'None'}
        Target User Skills: ${target.skill_names.join(', ') || 'None'}

        Output strictly JSON:
        {
          "score": 0,
          "bullets": ["string", "string", "string"]
        }
      `;

      const aiResult = await model.generateContent(prompt);
      const text = aiResult.response.text();
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      
      if (jsonMatch) {
         const parsed = JSON.parse(jsonMatch[0]);
         if (parsed.score !== undefined && Array.isArray(parsed.bullets)) {
            return res.json(parsed);
         }
      }
    } catch (aiErr) {
      console.error('Gemini Match Score Failure:', aiErr);
    }

    res.json({
      score: fallbackScore,
      bullets: [
        `Shared skills: ${Array.from(intersection).slice(0, 3).join(', ') || 'None'}`,
        `Direct overlap: ${intersection.size} total skills.`,
        `Skill gap exists in ${targetSet.size} areas.`
      ]
    });
  } catch (error) {
    console.error('Match Score Route Failure:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;
