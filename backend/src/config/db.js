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
  ssl: {
    rejectUnauthorized: false
  },
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000, 
});

const maskedUrl = process.env.DATABASE_URL ? process.env.DATABASE_URL.replace(/:([^:@]+)@/, ':****@') : 'MISSING';
console.log('[db.js] Pool initialized. URL:', maskedUrl);
console.log('[db.js] Type of pool.query:', typeof pool.query);

pool.query('SELECT NOW()')
  .then(() => {
    console.log(`✅  PostgreSQL Supabase terhubung`);
  })
  .catch(err => {
    console.error('❌  Gagal konek Supabase:', err.message);
    console.error('    → Cek DATABASE_URL di .env');
  });

module.exports = pool;