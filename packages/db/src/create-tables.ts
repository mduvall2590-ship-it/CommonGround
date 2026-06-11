import { createClient } from '@libsql/client';

async function main() {
  const client = createClient({
    url: 'file:local.db',
  });
  
  const sql = `
CREATE TABLE IF NOT EXISTS neighborhoods (id TEXT PRIMARY KEY, name TEXT NOT NULL, location TEXT, created_at INTEGER NOT NULL);
CREATE TABLE IF NOT EXISTS neighborhood_configs (neighborhood_id TEXT PRIMARY KEY REFERENCES neighborhoods(id), default_quorum INTEGER NOT NULL DEFAULT 20, default_threshold INTEGER NOT NULL DEFAULT 51, default_voting_period_days INTEGER NOT NULL DEFAULT 7, expense_threshold_cents INTEGER NOT NULL DEFAULT 50000);
CREATE TABLE IF NOT EXISTS users (id TEXT PRIMARY KEY, email TEXT NOT NULL UNIQUE, password_hash TEXT NOT NULL, name TEXT NOT NULL, neighborhood_id TEXT REFERENCES neighborhoods(id), role TEXT NOT NULL, created_at INTEGER NOT NULL);
CREATE TABLE IF NOT EXISTS properties (id TEXT PRIMARY KEY, neighborhood_id TEXT NOT NULL REFERENCES neighborhoods(id), address TEXT NOT NULL, owner_id TEXT REFERENCES users(id), created_at INTEGER NOT NULL);
CREATE TABLE IF NOT EXISTS dues (id TEXT PRIMARY KEY, property_id TEXT NOT NULL REFERENCES properties(id), amount INTEGER NOT NULL, status TEXT NOT NULL, due_date INTEGER NOT NULL, paid_at INTEGER);
CREATE TABLE IF NOT EXISTS maintenance_requests (id TEXT PRIMARY KEY, property_id TEXT NOT NULL REFERENCES properties(id), requester_id TEXT NOT NULL REFERENCES users(id), title TEXT NOT NULL, description TEXT, category TEXT, status TEXT NOT NULL, priority TEXT NOT NULL, vendor_id TEXT REFERENCES vendors(id), rating INTEGER, feedback TEXT, created_at INTEGER NOT NULL);
CREATE TABLE IF NOT EXISTS vendors (id TEXT PRIMARY KEY, neighborhood_id TEXT NOT NULL REFERENCES neighborhoods(id), name TEXT NOT NULL, category TEXT NOT NULL, contact_info TEXT, rating INTEGER, created_at INTEGER NOT NULL);
CREATE TABLE IF NOT EXISTS quotes (id TEXT PRIMARY KEY, request_id TEXT NOT NULL REFERENCES maintenance_requests(id), vendor_id TEXT NOT NULL REFERENCES vendors(id), amount_cents INTEGER NOT NULL, estimated_start_date INTEGER, estimated_end_date INTEGER, notes TEXT, status TEXT NOT NULL, created_at INTEGER NOT NULL);
CREATE TABLE IF NOT EXISTS proposals (id TEXT PRIMARY KEY, neighborhood_id TEXT NOT NULL REFERENCES neighborhoods(id), proposer_id TEXT NOT NULL REFERENCES users(id), title TEXT NOT NULL, description TEXT NOT NULL, type TEXT NOT NULL, rationale TEXT, options TEXT NOT NULL, status TEXT NOT NULL, quorum_required INTEGER NOT NULL, threshold_required INTEGER NOT NULL, discussion_ends_at INTEGER, voting_ends_at INTEGER NOT NULL, collective_board_weight INTEGER NOT NULL DEFAULT 0, metadata TEXT, created_at INTEGER NOT NULL);
CREATE TABLE IF NOT EXISTS ballots (id TEXT PRIMARY KEY, proposal_id TEXT NOT NULL REFERENCES proposals(id), user_id TEXT NOT NULL REFERENCES users(id), property_id TEXT NOT NULL REFERENCES properties(id), selection TEXT NOT NULL, is_board_vote INTEGER NOT NULL DEFAULT 0, created_at INTEGER NOT NULL);
CREATE TABLE IF NOT EXISTS rules (id TEXT PRIMARY KEY, neighborhood_id TEXT NOT NULL REFERENCES neighborhoods(id), proposal_id TEXT REFERENCES proposals(id), title TEXT NOT NULL, content TEXT NOT NULL, version INTEGER NOT NULL DEFAULT 1, parent_rule_id TEXT REFERENCES rules(id), created_at INTEGER NOT NULL);
CREATE TABLE IF NOT EXISTS budgets (id TEXT PRIMARY KEY, neighborhood_id TEXT NOT NULL REFERENCES neighborhoods(id), year INTEGER NOT NULL, category TEXT NOT NULL, amount_cents INTEGER NOT NULL, created_at INTEGER NOT NULL);
CREATE TABLE IF NOT EXISTS expenses (id TEXT PRIMARY KEY, neighborhood_id TEXT NOT NULL REFERENCES neighborhoods(id), proposal_id TEXT REFERENCES proposals(id), amount INTEGER NOT NULL, description TEXT NOT NULL, category TEXT NOT NULL, created_at INTEGER NOT NULL);
CREATE TABLE IF NOT EXISTS audit_trail (id TEXT PRIMARY KEY, neighborhood_id TEXT NOT NULL REFERENCES neighborhoods(id), user_id TEXT REFERENCES users(id), action TEXT NOT NULL, entity_type TEXT NOT NULL, entity_id TEXT NOT NULL, metadata TEXT, created_at INTEGER NOT NULL);
CREATE TABLE IF NOT EXISTS improvement_ideas (id TEXT PRIMARY KEY, neighborhood_id TEXT NOT NULL REFERENCES neighborhoods(id), user_id TEXT NOT NULL REFERENCES users(id), title TEXT NOT NULL, description TEXT NOT NULL, status TEXT NOT NULL, upvotes_count INTEGER NOT NULL DEFAULT 0, proposal_id TEXT REFERENCES proposals(id), created_at INTEGER NOT NULL);
CREATE TABLE IF NOT EXISTS improvement_upvotes (id TEXT PRIMARY KEY, idea_id TEXT NOT NULL REFERENCES improvement_ideas(id), user_id TEXT NOT NULL REFERENCES users(id), created_at INTEGER NOT NULL);
CREATE TABLE IF NOT EXISTS ai_summaries (id TEXT PRIMARY KEY, proposal_id TEXT NOT NULL UNIQUE REFERENCES proposals(id), summary_text TEXT NOT NULL, sentiment_score INTEGER, key_points_json TEXT, updated_at INTEGER NOT NULL);
CREATE TABLE IF NOT EXISTS audit_logs (id TEXT PRIMARY KEY, expense_id TEXT NOT NULL REFERENCES expenses(id), status TEXT NOT NULL, authorization_source_type TEXT, authorization_source_id TEXT, reasoning TEXT, confidence_score INTEGER, created_at INTEGER NOT NULL);
CREATE TABLE IF NOT EXISTS comments (id TEXT PRIMARY KEY, proposal_id TEXT NOT NULL REFERENCES proposals(id), user_id TEXT NOT NULL REFERENCES users(id), content TEXT NOT NULL, created_at INTEGER NOT NULL);
  `;

  console.log('Creating tables...');
  const statements = sql.trim().split(';').filter(s => s.trim().length > 0);
  for (const statement of statements) {
    console.log('Executing:', statement.trim().substring(0, 50) + '...');
    await client.execute(statement);
  }
  
  console.log('Tables created successfully.');
  await client.close();
}

main().catch(console.error);
