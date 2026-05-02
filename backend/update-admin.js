const bcrypt = require('bcryptjs');
const db = require('./src/config/db');

async function updateAdmin() {
  try {
    const newUsername = 'AdminPS027';
    const newPassword = 'Admincc26';
    
    console.log('Generating hash for new password...');
    const salt = await bcrypt.genSalt(12);
    const hash = await bcrypt.hash(newPassword, salt);
    
    console.log('Updating database...');
    const result = await db.query(
      'UPDATE users SET username = $1, password_hash = $2 WHERE username = $3 OR id_user = 1',
      [newUsername, hash, 'admin']
    );

    if (result.rowCount > 0) {
      console.log('✅ BERHASIL! Akun admin telah diperbarui.');
      console.log('--------------------------------------');
      console.log('Username Baru: ' + newUsername);
      console.log('Password Baru: ' + newPassword);
      console.log('--------------------------------------');
    } else {
      console.log('❌ GAGAL: User admin tidak ditemukan di database.');
    }
    
    process.exit(0);
  } catch (err) {
    console.error('❌ ERROR:', err.message);
    process.exit(1);
  }
}

updateAdmin();
