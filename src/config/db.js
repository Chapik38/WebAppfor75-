const mysql = require('mysql2/promise');
const env = require('./env');

let pool;

async function ensureDatabase() {
  const admin = await mysql.createConnection({
    host: env.db.host,
    port: env.db.port,
    user: env.db.user,
    password: env.db.password
  });
  await admin.query(`CREATE DATABASE IF NOT EXISTS \`${env.db.name}\``);
  await admin.end();
}

async function getPool() {
  if (!pool) {
    await ensureDatabase();
    pool = mysql.createPool({
      host: env.db.host,
      port: env.db.port,
      user: env.db.user,
      password: env.db.password,
      database: env.db.name,
      waitForConnections: true,
      connectionLimit: 10
    });
  }
  return pool;
}

module.exports = { getPool };
