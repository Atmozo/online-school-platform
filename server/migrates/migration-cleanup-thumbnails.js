// migration-cleanup-thumbnails.js

/**
 * Migration to remove redundant thumbnail columns and create the correct one
 */
async function up(db) {
  try {
    console.log('Starting thumbnail columns cleanup...');
    
    // Get all column names from the courses table
    const [columns] = await db.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_NAME = 'courses'
    `);
    
    const columnNames = columns.map(col => col.COLUMN_NAME);
    
    // List of columns to remove
    const columnsToRemove = ['thambnail', 'thumb', 'thumbs', 'thumbnails', 'thumbnail'];
    
    // Drop existing columns if they exist
    for (const colName of columnsToRemove) {
      if (columnNames.includes(colName)) {
        console.log(`Dropping column: ${colName}`);
        await db.query(`ALTER TABLE courses DROP COLUMN ${colName}`);
      } else {
        console.log(`Column ${colName} does not exist, skipping`);
      }
    }
    
    // Add the new thumbnail column
    console.log('Adding new thumbnail column...');
    await db.query(`ALTER TABLE courses ADD COLUMN thumbnail TEXT`);
    
    console.log('Thumbnail column cleanup completed successfully');
    return true;
  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  }
}

/**
 * Revert the migration (note: original columns won't be recreated)
 */
async function down(db) {
  try {
    console.log('Reverting thumbnail column...');
    
    // Check if thumbnail column exists before trying to drop it
    const [columns] = await db.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_NAME = 'courses' 
      AND COLUMN_NAME = 'thumbnail'
    `);
    
    if (columns.length > 0) {
      await db.query(`ALTER TABLE courses DROP COLUMN thumbnail`);
      console.log('Thumbnail column removed successfully');
    } else {
      console.log('Thumbnail column does not exist, nothing to revert');
    }
    
    return true;
  } catch (error) {
    console.error('Migration rollback failed:', error);
    throw error;
  }
}

module.exports = {
  up,
  down
};
