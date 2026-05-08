const pool = require('./backend/src/config/db');
pool.query("SELECT DISTINCT id_kategori FROM menu")
  .then(r => console.log(r.rows))
  .catch(console.error)
  .finally(() => pool.end());



