import { createClient } from '@supabase/supabase-js';
const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase credentials missing in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function test() {
  console.log('Testing Supabase connection...');
  try {
    const { data, error } = await supabase.from('tourist_places').select('*').order('sort_order');
    if (error) {
      console.error('Error fetching tourist_places:', error);
    } else {
      console.log('Success! tourist_places rows count:', data.length);
      console.log('Row data:', data);
    }

    const { data: weekendData, error: errorWeekend } = await supabase.from('weekend_stays').select('*').order('sort_order');
    if (errorWeekend) {
      console.error('Error fetching weekend_stays:', errorWeekend);
    } else {
      console.log('Success! weekend_stays rows count:', weekendData.length);
      console.log('Row data:', weekendData);
    }
  } catch (err) {
    console.error('Exception:', err);
  }
}

test();
