const express = require('express');
const auth = require('../middleware/auth');
const db = require('../db');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

const router = express.Router();

// UUID Validation Middleware for this router
router.param('id', (req, res, next, id) => {
  if (id && !db.isValidUUID(id)) {
    return res.status(400).json({ error: 'Invalid project reference ID' });
  }
  next();
});


// POST /api/projects - Create project (protected)
router.post('/', auth, async (req, res) => {
  const client = await db.pool.connect();
  try {
    const { title, description, category, status, team_size, duration, work_style, skills, demo_url, repo_url, hackathon_id } = req.body;

    if (!title || !description || !category || !status || !team_size || !duration || !work_style) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    if (!Array.isArray(skills) || skills.length === 0) {
      return res.status(400).json({ error: 'Skills must be a non-empty array' });
    }

    const createdBy = req.userId;

    await client.query('BEGIN');

    const projectResult = await client.query(
      `INSERT INTO projects (id, title, description, category, status, team_size, duration, work_style, skills, demo_url, repo_url, created_by, created_at, hackathon_id) 
       VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW(), $12) RETURNING *`,
      [title, description, category, status, team_size, duration, work_style, skills, demo_url || null, repo_url || null, createdBy, hackathon_id || null]
    );

    const project = projectResult.rows[0];

    await client.query(
      'INSERT INTO project_members (id, user_id, project_id, role) VALUES (gen_random_uuid(), $1, $2, $3)',
      [createdBy, project.id, 'Creator']
    );

    if (skills && skills.length > 0) {
      const skillsRes = await client.query('SELECT id, name FROM skills WHERE name = ANY($1)', [skills]);
      const skillIds = skillsRes.rows.map(r => r.id);
      if (skillIds.length > 0) {
        const insertQuery = `INSERT INTO project_skills (project_id, skill_id) VALUES ${skillIds.map((_, i) => `($1, $${i + 2})`).join(', ')}`;
        await client.query(insertQuery, [project.id, ...skillIds]);
      }
    }

    await client.query('COMMIT');
    res.status(201).json(project);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Project Creation Failure:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  } finally {
    client.release();
  }
});

// GET /api/projects - List/filter projects (public)
router.get('/', async (req, res) => {
  try {
    const { search, category, status, work_style, sort, team_size, skills, is_completed } = req.query;

    const conditions = [];
    const params = [];

    if (search) {
      params.push(`%${search}%`);
      const len = params.length;
      conditions.push(`(p.title ILIKE $${len} OR p.description ILIKE $${len} OR p.category ILIKE $${len} OR EXISTS (SELECT 1 FROM project_skills ps JOIN skills s ON ps.skill_id = s.id WHERE ps.project_id = p.id AND s.name ILIKE $${len}) OR EXISTS (SELECT 1 FROM unnest(p.skills) AS skill WHERE skill ILIKE $${len}))`);
    }

    if (category) {
      params.push(category);
      conditions.push(`p.category = $${params.length}`);
    }

    if (status) {
      params.push(status);
      conditions.push(`p.status = $${params.length}`);
    }

    if (work_style) {
      params.push(work_style);
      conditions.push(`p.work_style = $${params.length}`);
    }

    if (team_size) {
      params.push(team_size);
      conditions.push(`p.team_size = $${params.length}`);
    }

    if (skills) {
      const skillsArray = skills.split(',').map(s => s.trim()).filter(Boolean);
      if (skillsArray.length > 0) {
        params.push(skillsArray);
        const len = params.length;
        conditions.push(`((SELECT count(*) FROM project_skills ps JOIN skills s ON ps.skill_id = s.id WHERE ps.project_id = p.id AND s.name = ANY($${len})) = ${skillsArray.length} OR (SELECT count(*) FROM unnest(p.skills) AS skill WHERE skill = ANY($${len})) = ${skillsArray.length})`);
      }
    }

    if (is_completed === 'true') {
      conditions.push(`p.is_completed = true`);
    }

    let query = `SELECT p.id, p.title, p.description, p.category, p.status, p.team_size, p.duration, p.work_style, p.created_by, p.created_at, p.demo_url, p.repo_url, p.thumbnail_url, p.is_completed, p.hackathon_result, 
      COALESCE(pm_count.member_count, 0) as member_count,
      COALESCE((SELECT array_agg(s.name) FROM project_skills ps JOIN skills s ON ps.skill_id = s.id WHERE ps.project_id = p.id), p.skills) as skills
      FROM projects p LEFT JOIN (
      SELECT project_id, COUNT(*) as member_count FROM project_members GROUP BY project_id
    ) pm_count ON p.id = pm_count.project_id`;
    
    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += sort === 'oldest' ? ' ORDER BY p.created_at ASC' : ' ORDER BY p.created_at DESC';

    const result = await db.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/projects/:id - Get a single project
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    let query = `SELECT p.id, p.title, p.description, p.category, p.status, p.team_size, p.duration, p.work_style, p.created_by, p.created_at, p.demo_url, p.repo_url, p.thumbnail_url, p.is_completed, p.hackathon_result, 
      COALESCE(pm_count.member_count, 0) as member_count,
      COALESCE((SELECT array_agg(s.name) FROM project_skills ps JOIN skills s ON ps.skill_id = s.id WHERE ps.project_id = p.id), p.skills) as skills
      FROM projects p LEFT JOIN (
      SELECT project_id, COUNT(*) as member_count FROM project_members GROUP BY project_id
    ) pm_count ON p.id = pm_count.project_id
    WHERE p.id = $1`;
    const result = await db.query(query, [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Project not found' });
    res.json(result.rows[0]);
  } catch (error) {
    if (error.code === '22P02') return res.status(404).json({ error: 'Project not found' });
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/projects/:id/apply - Specifically apply to join a project
router.post('/:id/apply', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { message } = req.body;

    // Check if project exists and user isn't owner
    const project = await db.query('SELECT created_by FROM projects WHERE id = $1', [id]);
    if (project.rows.length === 0) return res.status(404).json({ error: 'Project not found' });
    if (project.rows[0].created_by === req.userId) return res.status(400).json({ error: 'Cannot apply to your own project' });

    // Check if already a member
    const memberCheck = await db.query('SELECT 1 FROM project_members WHERE project_id = $1 AND user_id = $2', [id, req.userId]);
    if (memberCheck.rows.length > 0) return res.status(400).json({ error: 'Already a member of this project' });

    // Insert request
    await db.query(
      'INSERT INTO join_requests (project_id, user_id, message, status) VALUES ($1, $2, $3, $4) ON CONFLICT (project_id, user_id) DO UPDATE SET message = $3, status = $4',
      [id, req.userId, message || '', 'pending']
    );

    res.json({ success: true, message: 'Application submitted' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE /api/projects/:id - Delete project (Owner only)
router.delete('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const project = await db.query('SELECT created_by FROM projects WHERE id = $1', [id]);
    
    if (project.rows.length === 0) {
      return res.status(404).json({ error: 'Project not found' });
    }
    
    if (project.rows[0].created_by !== req.userId) {
      return res.status(403).json({ error: 'Forbidden: You do not own this project' });
    }

    await db.query('DELETE FROM projects WHERE id = $1', [id]);
    res.json({ success: true });
  } catch (error) {
    console.error('Project Deletion Failure:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// POST /api/projects/:id/join - Legacy join (mapped to Dashboard response for now if still used)
router.post('/:id/join', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { role, message } = req.body;
    const userId = req.userId;

    if (!role || role.trim().length === 0) {
      return res.status(400).json({ error: 'Role is required' });
    }

    // check if already member
    const existingMember = await db.query('SELECT 1 FROM project_members WHERE user_id = $1 AND project_id = $2', [userId, id]);
    if (existingMember.rows.length > 0) {
       return res.status(400).json({ error: 'You are already a member of this project' });
    }

    const membership = await db.query(
      'INSERT INTO join_requests (project_id, user_id, role, message, status) VALUES ($1, $2, $3, $4, $5) RETURNING *', 
      [id, userId, role.trim(), message || '', 'pending']
    );

    res.status(201).json(membership.rows[0]);
  } catch (error) {
    console.error('Legacy Join Failure:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// PUT /api/projects/:id - Update Showcase attributes (protected)
router.put('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { thumbnail_url, is_completed, hackathon_result, demo_url, repo_url } = req.body;
    const userId = req.userId;

    const existingProject = await db.query('SELECT created_by FROM projects WHERE id = $1', [id]);
    if (existingProject.rows.length === 0) {
      return res.status(404).json({ error: 'Project not found' });
    }

    if (existingProject.rows[0].created_by !== userId) {
      return res.status(403).json({ error: 'Unauthorized to edit project settings' });
    }

    const result = await db.query(`
      UPDATE projects 
      SET thumbnail_url = $1, is_completed = $2, hackathon_result = $3, demo_url = $4, repo_url = $5
      WHERE id = $6 RETURNING *
    `, [
      thumbnail_url !== undefined ? thumbnail_url : existingProject.rows[0].thumbnail_url, 
      is_completed !== undefined ? is_completed : existingProject.rows[0].is_completed, 
      hackathon_result !== undefined ? hackathon_result : existingProject.rows[0].hackathon_result, 
      demo_url !== undefined ? demo_url : existingProject.rows[0].demo_url, 
      repo_url !== undefined ? repo_url : existingProject.rows[0].repo_url, 
      id
    ]);

    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/projects/:id/members - Get list of project members (public)
router.get('/:id/members', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query(`
      SELECT u.id, u.name, u.avatar_url, pm.role,
      COALESCE((SELECT array_agg(s.name) FROM user_skills us JOIN skills s ON us.skill_id = s.id WHERE us.user_id = u.id), '{}') as skills
      FROM project_members pm
      JOIN users u ON pm.user_id = u.id
      WHERE pm.project_id = $1
    `, [id]);
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/projects/:id/endorse - Endorse a teammate (protected)
router.post('/:id/endorse', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { endorsed_user_id, skill } = req.body;
    const endorserId = req.userId;

    if (endorsed_user_id && !db.isValidUUID(endorsed_user_id)) {
      return res.status(400).json({ error: 'Invalid user reference for endorsement' });
    }

    if (!endorsed_user_id || !skill) {
      return res.status(400).json({ error: 'Endorsed user and skill are required' });
    }

    if (endorserId === endorsed_user_id) {
      return res.status(400).json({ error: 'You cannot endorse yourself' });
    }

    // verify project is completed
    const projectCheck = await db.query('SELECT is_completed FROM projects WHERE id = $1', [id]);
    if (projectCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Project not found' });
    }
    if (!projectCheck.rows[0].is_completed) {
      return res.status(400).json({ error: 'You can only endorse teammates after the project is completed' });
    }

    // verify both are members
    const members = await db.query('SELECT user_id FROM project_members WHERE project_id = $1 AND user_id IN ($2, $3)', [id, endorserId, endorsed_user_id]);
    
    // We expect 2 members found
    if (members.rows.length !== 2) {
      return res.status(403).json({ error: 'Both you and the endorsed user must be mapped members of this project' });
    }

    const result = await db.query(`
      INSERT INTO endorsements (endorser_id, endorsed_user_id, skill, project_id)
      VALUES ($1, $2, $3, $4) RETURNING *
    `, [endorserId, endorsed_user_id, skill, id]);
    
    const endorserRes = await db.query('SELECT name FROM users WHERE id = $1', [endorserId]);
    const endorserName = endorserRes.rows[0]?.name || 'A teammate';
    
    await db.query(`
      INSERT INTO notifications (user_id, type, message, link)
      VALUES ($1, $2, $3, $4)`,
      [endorsed_user_id, 'endorsement', `${endorserName} formally endorsed you for your ${skill} skills!`, `/profile/${endorsed_user_id}`]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    if (error.code === '23505') { 
      return res.status(400).json({ error: 'You have already endorsed this user for this skill on this project' });
    }
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/projects/:id/suggest-teammates - AI Teammate Suggestion with Gemini 1.5 Flash
router.get('/:id/suggest-teammates', auth, async (req, res) => {
  try {
    const { id } = req.params;

    // Verify ownership and get project details
    const projectRes = await db.query('SELECT title, description, created_by FROM projects WHERE id = $1', [id]);
    if (projectRes.rows.length === 0) return res.status(404).json({ error: 'Project not found' });
    if (projectRes.rows[0].created_by !== req.userId) return res.status(403).json({ error: 'Unauthorized: Owner only' });

    const project = projectRes.rows[0];

    // Fetch project skills
    const projectSkillsRes = await db.query(`
      SELECT s.name FROM project_skills ps
      JOIN skills s ON ps.skill_id = s.id
      WHERE ps.project_id = $1
    `, [id]);
    
    const projectSkillNames = projectSkillsRes.rows.map(r => r.name);
    if (projectSkillNames.length === 0) {
      return res.json({ suggestions: [] });
    }

    // Find top 10 candidates via SQL (SQL logic used for both AI preprocessing and fallback)
    const suggestQuery = `
      WITH candidate_skills AS (
        SELECT u.id, u.name, u.avatar_url, u.bio, u.availability, array_agg(s.name) as user_skills
        FROM users u
        JOIN user_skills us ON u.id = us.user_id
        JOIN skills s ON us.skill_id = s.id
        WHERE u.id != $1
        AND u.last_active >= NOW() - INTERVAL '30 days'
        AND u.id NOT IN (SELECT user_id FROM project_members WHERE project_id = $2)
        GROUP BY u.id
      )
      SELECT *,
      (
        SELECT COUNT(*)
        FROM unnest(user_skills) as uskill
        WHERE uskill = ANY($3)
      ) as overlap_count
      FROM candidate_skills
      WHERE (
        SELECT COUNT(*)
        FROM unnest(user_skills) as uskill
        WHERE uskill = ANY($3)
      ) > 0
      ORDER BY overlap_count DESC, id ASC
      LIMIT 10
    `;

    const candidatesRes = await db.query(suggestQuery, [req.userId, id, projectSkillNames]);
    const candidates = candidatesRes.rows;

    if (candidates.length === 0) {
      return res.json({ suggestions: [] });
    }

    // --- Gemini 1.5 Flash Integration ---
    try {
      const prompt = `
        You are a technical recruiter assistant. Be concise and direct.
        For each candidate, output: name, matched skills (comma-separated),
        skill overlap count, and one sentence (max 15 words) on why they fit.
        No filler phrases. No enthusiasm. Facts only.

        Project: ${project.title} - ${project.description}
        Required Skills: ${projectSkillNames.join(', ')}

        Candidates:
        ${candidates.map(c => `- ID: ${c.id}, Name: ${c.name}, Bio: ${c.bio}, Skills: ${c.user_skills.join(', ')}`).join('\n')}

        Output strictly JSON in this format:
        {
          "suggestions": [
            {
              "userId": "uuid",
              "name": "string",
              "matchedSkills": ["skill1", "skill2"],
              "overlapCount": 0,
              "reason": "string (max 15 words)"
            }
          ]
        }
      `;

      const aiPromise = model.generateContent(prompt);
      const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('AI timeout')), 5000));
      
      const aiResult = await Promise.race([aiPromise, timeoutPromise]);
      const text = aiResult.response.text();
      
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const aiResponse = JSON.parse(jsonMatch[0]);
        const suggestions = aiResponse.suggestions.map(s => {
          const original = candidates.find(c => c.id === s.userId || c.name === s.name);
          return {
            ...s,
            avatar_url: original?.avatar_url,
            availability: original?.availability
          };
        }).slice(0, 5);
        
        return res.json({ suggestions });
      }
    } catch (aiErr) {
      console.error('Gemini Suggestion Protection Triggered (Fallback Used):', aiErr.message);
    }

    // --- Fallback Mechanism ---
    const fallbackResults = candidates.slice(0, 5).map(c => ({
      userId: c.id,
      name: c.name,
      avatar_url: c.avatar_url,
      availability: c.availability,
      matchedSkills: c.user_skills.filter(s => projectSkillNames.includes(s)),
      overlapCount: parseInt(c.overlap_count),
      reason: `Direct skill match (${c.overlap_count} skills).`
    }));

    res.json({ suggestions: fallbackResults });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;

