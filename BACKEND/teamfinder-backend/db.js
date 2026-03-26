const { newDb } = require('pg-mem');
const fs = require('fs');
const { randomUUID } = require('crypto');

const memDb = newDb();

// Register UUID function since pgcrypto is not natively supported by pg-mem
memDb.public.registerFunction({
    name: 'gen_random_uuid',
    returns: 'uuid',
    implementation: () => randomUUID(),
    impure: true
});

// Load schema
const schema = fs.readFileSync(__dirname + '/schema.sql', 'utf8');
const cleanSchema = schema.replace('CREATE EXTENSION IF NOT EXISTS pgcrypto;', '');
memDb.public.none(cleanSchema);

const { Pool } = memDb.adapters.createPg();
const pool = new Pool();

module.exports = {
  query: (text, params) => pool.query(text, params)
};
