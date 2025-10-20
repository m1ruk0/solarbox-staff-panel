const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('SUPABASE_URL и SUPABASE_KEY должны быть указаны в .env файле');
}

const supabase = createClient(supabaseUrl, supabaseKey);

console.log('✅ Supabase клиент инициализирован');

module.exports = supabase;
