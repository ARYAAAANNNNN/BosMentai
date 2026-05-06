const pool = require('./backend/src/config/db');
pool.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'menu'")
  .then(r => console.log(r.rows))
  .catch(console.error)
  .finally(() => pool.end());
