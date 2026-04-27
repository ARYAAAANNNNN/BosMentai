// ================================================================
// src/config/db.js — Koneksi Supabase Client
// ================================================================
'use strict';

const { createClient } = require('@supabase/supabase-js'); 
require('dotenv').config();

const supabase = createClient(                            
  process.env.SUPABASE_URL,                              
  process.env.SUPABASE_SERVICE_ROLE_KEY                  
);                                                         

supabase                                                  
  .from('menu')        
  .select('count')                                        
  .then(({ error }) => {                                  
    if (error) throw error;                                
    console.log(`✅  Supabase terhubung ke project: "${process.env.SUPABASE_URL}"`);
  })                                                      
  .catch(err => {                                         
    console.error('❌  Gagal konek Supabase:', err.message); 
    console.error('    → Cek SUPABASE_URL dan SUPABASE_SERVICE_ROLE_KEY di .env');
  });                                                     

module.exports = supabase;                             