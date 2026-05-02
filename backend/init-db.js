const db = require('./src/config/db');

async function init() {
  try {
    console.log('--- Memulai Inisialisasi Database Supabase ---');
    
    // Perintah SQL untuk membersihkan dan membuat tabel baru
    const sql = `
      DROP TABLE IF EXISTS auth_sessions CASCADE;
      DROP TABLE IF EXISTS users CASCADE;
      
      -- Cek apakah tipe user_role sudah ada, jika belum baru buat
      DO $$ 
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
          CREATE TYPE user_role AS ENUM ('boss', 'admin', 'staff');
        END IF;
      END $$;

      CREATE TABLE users (
          id_user SERIAL PRIMARY KEY,
          nama_lengkap VARCHAR(150) NOT NULL,
          username VARCHAR(50) UNIQUE,
          email VARCHAR(200) UNIQUE NOT NULL,
          password_hash VARCHAR(255) NOT NULL,
          role user_role NOT NULL DEFAULT 'admin',
          is_active BOOLEAN NOT NULL DEFAULT TRUE,
          last_login TIMESTAMP WITH TIME ZONE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE auth_sessions (
          id_session CHAR(64) PRIMARY KEY,
          id_user INTEGER NOT NULL REFERENCES users(id_user) ON DELETE CASCADE,
          ip_address VARCHAR(45),
          user_agent VARCHAR(300),
          expired_at TIMESTAMP WITH TIME ZONE NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      INSERT INTO users (nama_lengkap, username, email, password_hash, role)
      VALUES (
          'Admin Restoran', 
          'admin', 
          'admin@dimsumhouse.id', 
          '$2b$12$KRcODvUfuBu6xQPyW2VmrefrhjvAahmGdqy1x8VWn4Gh1fH7tzMJ6', 
          'admin'
      ) ON CONFLICT (username) DO NOTHING;
    `;

    console.log('Menjalankan query SQL...');
    await db.query(sql);

    console.log('✅ DATABASE BERHASIL DIINISIALISASI!');
    console.log('--- Detail User Admin ---');
    console.log('Username: admin');
    console.log('Password: admin');
    console.log('-------------------------');
    
    process.exit(0);
  } catch (err) {
    console.error('❌ GAGAL:', err.message);
    if (err.detail) console.error('Detail:', err.detail);
    process.exit(1);
  }
}

init();
