const supabase = require('./src/config/supabase');

async function listFiles() {
  try {
    const { data, error } = await supabase.storage.from('menus').list();
    if (error) {
      console.error('Error listing files in "menus":', error.message);
    } else {
      console.log('Files in "menus":', data.map(f => f.name));
    }
  } catch (err) {
    console.error('Fatal:', err.message);
  }
}

listFiles();
