const supabase = require('./src/config/supabase');

async function listBuckets() {
  try {
    const { data, error } = await supabase.storage.listBuckets();
    if (error) {
      console.error('Error listing buckets:', error.message);
    } else {
      console.log('Buckets:', data.map(b => b.name));
    }
  } catch (err) {
    console.error('Fatal:', err.message);
  }
}

listBuckets();
