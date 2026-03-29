const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  connectionTimeoutMillis: 5000,
  idleTimeoutMillis: 30000,
  max: 20
});

pool.on('error', (err, client) => {
  console.error('CRITICAL: Database pool error:', err.message);
});

const connectDb = async () => {
  try {
    const client = await pool.connect();
    console.log('Database connection successful');
    
    const checkTable = await client.query(`
      SELECT EXISTS (
        SELECT FROM pg_tables
        WHERE schemaname = 'public' AND tablename  = 'users'
      );
    `);

    if (checkTable.rows[0].exists) {
      console.log('Database already initialized');
    } else {
      const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
      await client.query(schema);
      console.log('Schema created successfully');
    }
    
    // Auto-migrate new columns
    try {
      await client.query(`
        ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url TEXT;
        ALTER TABLE users ADD COLUMN IF NOT EXISTS bio VARCHAR(300);
        ALTER TABLE users ADD COLUMN IF NOT EXISTS github_url TEXT;
        ALTER TABLE users ADD COLUMN IF NOT EXISTS linkedin_url TEXT;
        ALTER TABLE users ADD COLUMN IF NOT EXISTS portfolio_url TEXT;
        ALTER TABLE users ADD COLUMN IF NOT EXISTS skills TEXT[] DEFAULT '{}';
        ALTER TABLE users ADD COLUMN IF NOT EXISTS availability VARCHAR(100) DEFAULT 'Available';
        ALTER TABLE users ADD COLUMN IF NOT EXISTS github_id TEXT UNIQUE;
        ALTER TABLE users ADD COLUMN IF NOT EXISTS github_access_token TEXT;
        ALTER TABLE users ADD COLUMN IF NOT EXISTS last_active TIMESTAMP DEFAULT NOW();
      `);
      console.log('User profile fields ensured');
    } catch (migErr) {
      console.error('Migration error:', migErr.message);
    }

    try {
      await client.query(`
        CREATE TABLE IF NOT EXISTS skills (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          name TEXT UNIQUE NOT NULL
        );
        CREATE TABLE IF NOT EXISTS user_skills (
          user_id UUID REFERENCES users(id) ON DELETE CASCADE,
          skill_id UUID REFERENCES skills(id) ON DELETE CASCADE,
          PRIMARY KEY (user_id, skill_id)
        );
        CREATE TABLE IF NOT EXISTS project_skills (
          project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
          skill_id UUID REFERENCES skills(id) ON DELETE CASCADE,
          PRIMARY KEY (project_id, skill_id)
        );
      `);

      const INITIAL_SKILLS = [
        'React', 'Node.js', 'Python', 'Machine Learning', 'UI/UX', 'Blockchain', 'DevOps',
        'Java', 'C++', 'C#', 'Go', 'Rust', 'Swift', 'Kotlin', 'TypeScript', 'JavaScript',
        'Angular', 'Vue.js', 'Svelte', 'Django', 'Flask', 'Spring Boot', 'Ruby on Rails',
        'Docker', 'Kubernetes', 'AWS', 'Azure', 'GCP', 'SQL', 'NoSQL', 'GraphQL', 'REST API',
        'Data Science', 'Data Engineering', 'Cybersecurity', 'Product Management', 'Agile'
      ];
      
      const insertPromises = INITIAL_SKILLS.map(skill => 
        client.query('INSERT INTO skills (name) VALUES ($1) ON CONFLICT (name) DO NOTHING', [skill])
      );
      await Promise.all(insertPromises);
      console.log('Skill tables and initial data ensured');
    } catch (migErr) {
      console.error('Skills migration error:', migErr.message);
    }

    try {
      await client.query(`
        ALTER TABLE project_members ADD COLUMN IF NOT EXISTS role VARCHAR(100) DEFAULT 'Member';
        ALTER TABLE project_members ADD COLUMN IF NOT EXISTS joined_at TIMESTAMP DEFAULT NOW();
        ALTER TABLE projects ADD COLUMN IF NOT EXISTS demo_url TEXT;
        ALTER TABLE projects ADD COLUMN IF NOT EXISTS repo_url TEXT;
        ALTER TABLE projects ADD COLUMN IF NOT EXISTS thumbnail_url TEXT;
        ALTER TABLE projects ADD COLUMN IF NOT EXISTS is_completed BOOLEAN DEFAULT false;
        ALTER TABLE projects ADD COLUMN IF NOT EXISTS hackathon_result VARCHAR(200);
      `);
      console.log('Project additions ensured');
    } catch (migErr) {
      console.error('Project additions migration error:', migErr.message);
    }
    
    try {
      await client.query(`
        CREATE TABLE IF NOT EXISTS hackathons (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          name TEXT UNIQUE NOT NULL,
          description TEXT NOT NULL,
          deadline TIMESTAMP NOT NULL,
          prize TEXT NOT NULL,
          theme_tags TEXT[] DEFAULT '{}',
          external_link TEXT NOT NULL
        );
        ALTER TABLE projects ADD COLUMN IF NOT EXISTS hackathon_id UUID REFERENCES hackathons(id) ON DELETE SET NULL;
      `);
      
      const SEED_HACKATHONS = [
        { name: 'Global AI Hackathon 2026', desc: 'Build the next generation of generative AI tools. Integrate massive scale LLMs directly into intuitive platforms.', deadline: '2026-06-15T23:59:59Z', prize: '$50,000 USD', tags: ['AI', 'Machine Learning', 'API'], link: 'https://devpost.com/global-ai-2026' },
        { name: 'Web3 Builders Jam', desc: 'Create decentralized applications for the modern web.', deadline: '2026-05-20T23:59:59Z', prize: '10 ETH', tags: ['Blockchain', 'Web3', 'DeFi'], link: 'https://ethglobal.com/web3-jam' },
        { name: 'ClimateTech Challenge', desc: 'Solutions to help mitigate the effects of climate change. Help farmers save water or optimize the energy grids.', deadline: '2026-07-01T23:59:59Z', prize: '$25,000 USD + Mentorship', tags: ['Climate', 'Sustainability', 'GreenTech'], link: 'https://climatetech.dev/hackathon' },
        { name: 'HealthHack 2026', desc: 'Innovations in healthcare telemetry and patient management architectures focusing tightly on scalability.', deadline: '2026-08-10T23:59:59Z', prize: '$15,000 USD', tags: ['Health', 'Data', 'IoT'], link: 'https://healthhack.org/2026' },
        { name: 'FinTech Disruptors', desc: 'Redefining personal finance and payment gateways globally. Create the best way to move money across borders.', deadline: '2026-05-30T23:59:59Z', prize: '$30,000 USD', tags: ['FinTech', 'Payments', 'Security'], link: 'https://fintechdisruptors.com' },
        { name: 'GameJam 48H', desc: 'Build an indie game over a single weekend around the theme: Space Exploration.', deadline: '2026-04-12T23:59:59Z', prize: '$5,000 + Publishing Deal', tags: ['Gaming', 'Unity', 'Godot'], link: 'https://gamejam.com/48h' },
        { name: 'EdTech Innovators', desc: 'Revolutionizing remote and hybrid learning workflows for higher education students globally.', deadline: '2026-06-05T23:59:59Z', prize: '$10,000 USD', tags: ['Education', 'EdTech', 'Social'], link: 'https://edtechhack.org' },
        { name: 'SpaceApps Challenge', desc: 'Solve challenges using open data and open source tooling hosted by international space agencies.', deadline: '2026-10-01T23:59:59Z', prize: 'Agency Tour + Grant', tags: ['Space', 'Data', 'Open Source'], link: 'https://spaceapps.dev' },
        { name: 'Accessibility First', desc: 'Design tools that guarantee web components stay compliant and fully usable by folks requiring accessibility tools.', deadline: '2026-07-20T23:59:59Z', prize: '$12,000 USD', tags: ['Accessibility', 'UI/UX', 'Web'], link: 'https://a11yhackathon.com' },
        { name: 'Smart City Hack', desc: 'Optimize urban logistics, smart grids, and autonomous public transport algorithms.', deadline: '2026-09-15T23:59:59Z', prize: '$20,000 Pilot Program', tags: ['Smart City', 'IoT', 'Logistics'], link: 'https://smartcityhack.gov' }
      ];

      const insertHackPromises = SEED_HACKATHONS.map(h => 
        client.query('INSERT INTO hackathons (name, description, deadline, prize, theme_tags, external_link) VALUES ($1, $2, $3, $4, $5, $6) ON CONFLICT (name) DO NOTHING', [h.name, h.desc, h.deadline, h.prize, h.tags, h.link])
      );
      await Promise.all(insertHackPromises);
      console.log('Hackathons setup ensured');
    } catch (migErr) {
      console.error('Hackathon migration error:', migErr.message);
    }

    try {
      await client.query(`
        CREATE TABLE IF NOT EXISTS join_requests (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
          user_id UUID REFERENCES users(id) ON DELETE CASCADE,
          message TEXT,
          role VARCHAR(100),
          status VARCHAR(20) DEFAULT 'pending',
          created_at TIMESTAMP DEFAULT NOW()
        );
        -- Ensure unique constraint for join requests
        ALTER TABLE join_requests DROP CONSTRAINT IF EXISTS unique_project_user;
        ALTER TABLE join_requests ADD CONSTRAINT unique_project_user UNIQUE(project_id, user_id);
      `);
      console.log('Join requests schema ensured');
    } catch (migErr) {
      console.error('Join requests migration error:', migErr.message);
    }

    try {
      await client.query(`
        CREATE TABLE IF NOT EXISTS notifications (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID REFERENCES users(id) ON DELETE CASCADE,
          type VARCHAR(50),
          message TEXT NOT NULL,
          is_read BOOLEAN DEFAULT false,
          link TEXT,
          created_at TIMESTAMP DEFAULT NOW()
        );
      `);
      console.log('Notifications schema ensured');
    } catch (migErr) {
      console.error('Notifications migration error:', migErr.message);
    }

    try {
      await client.query(`
        CREATE TABLE IF NOT EXISTS endorsements (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          endorser_id UUID REFERENCES users(id) ON DELETE CASCADE,
          endorsed_user_id UUID REFERENCES users(id) ON DELETE CASCADE,
          skill TEXT NOT NULL,
          project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
          created_at TIMESTAMP DEFAULT NOW(),
          UNIQUE(endorser_id, endorsed_user_id, skill, project_id)
        );
      `);
      console.log('Endorsements schema ensured');
    } catch (migErr) {
      console.error('Endorsements migration error:', migErr.message);
    }

    try {
      await client.query(`
        CREATE TABLE IF NOT EXISTS auth_codes (
          code UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID REFERENCES users(id) ON DELETE CASCADE,
          expires_at TIMESTAMP NOT NULL DEFAULT (NOW() + INTERVAL '60 seconds')
        );
      `);
      console.log('Auth codes schema ensured');
    } catch (migErr) {
      console.error('Auth codes migration error:', migErr.message);
    }


    client.release();
  } catch (err) {
    console.error('FATAL: Database connection failed on startup:', err.message);
  }
};

connectDb();

module.exports = {
  query: async (text, params) => {
    try {
      return await pool.query(text, params);
    } catch (err) {
      console.error('Database query error:', err.message);
      throw err;
    }
  }
};
