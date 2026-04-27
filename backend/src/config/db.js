// ================================================================
// src/config/db.js — Koneksi PostgreSQL Supabase via pg Pool
// ================================================================
'use strict';

const { Pool } = require('pg');
const dns = require('dns');
require('dotenv').config();

// PAKSA Node.js pakai IPv4 (Solusi ENETUNREACH di Railway)
dns.setDefaultResultOrder('ipv4first');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

console.log('[db.js] Pool initialized. Type of pool.query:', typeof pool.query);

pool.query('SELECT NOW()')
  .then(() => {
    console.log(`✅  PostgreSQL Supabase terhubung`);
  })
  .catch(err => {
    console.error('❌  Gagal konek Supabase:', err.message);
    console.error('    → Cek DATABASE_URL di .env');
  });

module.exports = pool;