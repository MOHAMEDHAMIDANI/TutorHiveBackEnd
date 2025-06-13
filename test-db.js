const { Client } = require('pg');

const client = new Client({
  host: 'pg-2c95dce5-mohahamidani1-8fbd.e.aivencloud.com',
  port: 17406,
  database: 'defaultdb',
  user: 'avnadmin',
  password: 'AVNS_tKxd4MAUj4LumJWCgOX',
  ssl: {
    rejectUnauthorized: false
  }
});

async function testConnection() {
  try {
    console.log('Attempting to connect to the database...');
    await client.connect();
    console.log('Successfully connected to the database!');
    
    const result = await client.query('SELECT NOW()');
    console.log('Database time:', result.rows[0].now);
    
    await client.end();
  } catch (err) {
    console.error('Error connecting to the database:', err);
  }
}

testConnection(); 