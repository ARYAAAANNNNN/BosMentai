const pool = require('./src/config/db');
const fs = require('fs');
const path = require('path');

async function migrate() {
    try {
        const sqlPath = path.join(__dirname, 'database', 'migration_ala_carte.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');
        
        console.log('Running migration...');
        await pool.query(sql);
        console.log('Migration successful!');
        process.exit(0);
    } catch (err) {
        console.error('Migration failed:', err);
        process.exit(1);
    }
}

migrate();
