import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';
import * as schema from './schema';

async function main() {
  const client = createClient({
    url: 'file:local.db',
  });
  const db = drizzle(client, { schema });
  
  console.log('Syncing schema...');
  // Drizzle doesn't have a built-in sync method like Sequelize, 
  // but we can at least check if we can connect.
  try {
    const result = await db.select().from(schema.neighborhoods).limit(1);
    console.log('Connection successful, neighborhoods found:', result.length);
  } catch (error) {
    console.error('Error connecting or schema mismatch:', error);
  }
  
  await client.close();
}

main();
