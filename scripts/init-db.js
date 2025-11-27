const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

async function initDb() {
    const connectionString = process.argv[2];
    if (!connectionString) {
        console.error('Please provide the connection string as an argument.');
        process.exit(1);
    }

    const client = new Client({
        connectionString: connectionString,
        ssl: { rejectUnauthorized: false } // Required for Timescale Cloud usually
    });

    try {
        await client.connect();
        console.log('Connected to database.');

        const schemaPath = path.join(__dirname, '..', 'schema.sql');
        const schemaSql = fs.readFileSync(schemaPath, 'utf8');

        console.log('Applying schema...');
        await client.query(schemaSql);
        console.log('Schema applied successfully!');

    } catch (err) {
        console.error('Error applying schema:', err);
    } finally {
        await client.end();
    }
}

initDb();
