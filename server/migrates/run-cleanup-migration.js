// run-cleanup-migration.js

// Import your existing database connection
const db = require('../db/connection'); 

/**
 * Run the thumbnail cleanup migration
 */
async function runCleanupMigration() {
  try {
    console.log('Starting migration using existing database connection');
    
    // Import the migration
    const migration = require('./migration-cleanup-thumbnails');
    
    // Check if we should run up or down migration
    const direction = process.argv[2] === 'down' ? 'down' : 'up';
    
    console.log(`Running ${direction} migration for thumbnail cleanup...`);
    
    // Run the appropriate migration function
    await migration[direction](db);
    
    console.log('Migration completed successfully');
  } catch (error) {
    console.error('Error running migration:', error);
  }
}

runCleanupMigration();
