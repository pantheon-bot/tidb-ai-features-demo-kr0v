import { readFileSync } from 'fs';
import { join } from 'path';
import db from './db';
import { sql } from 'kysely';

export async function runMigrations() {
  const migrationPath = join(process.cwd(), 'src/lib/db/migrations/001_create_tables.sql');
  const migrationSQL = readFileSync(migrationPath, 'utf-8');

  // Remove comments and split by semicolon
  const cleanSQL = migrationSQL
    .split('\n')
    .filter(line => !line.trim().startsWith('--'))
    .join('\n');

  const statements = cleanSQL
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0);

  console.log(`Running ${statements.length} migration statements...`);

  for (let i = 0; i < statements.length; i++) {
    const statement = statements[i];
    try {
      await sql.raw(statement).execute(db);
      console.log(`✓ Executed statement ${i + 1}/${statements.length}`);
    } catch (error) {
      // Ignore "already exists" errors
      const errorMessage = error instanceof Error ? error.message : '';
      if (!errorMessage.includes('already exists') && !errorMessage.includes('Duplicate')) {
        console.error(`Migration error on statement ${i + 1}:`, errorMessage);
        console.error('Statement:', statement.substring(0, 100));
        throw error;
      } else {
        console.log(`✓ Statement ${i + 1}/${statements.length} - object already exists, skipping`);
      }
    }
  }

  console.log('Migrations completed successfully!');
}

// Run migrations if this file is executed directly
if (require.main === module) {
  runMigrations()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('Migration failed:', error);
      process.exit(1);
    });
}
