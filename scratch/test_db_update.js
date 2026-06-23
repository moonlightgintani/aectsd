import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Parse .env manually
const envPath = path.resolve(process.cwd(), '.env');
const envContent = fs.readFileSync(envPath, 'utf-8');
const envVars = {};
envContent.split('\n').forEach(line => {
  const parts = line.split('=');
  if (parts.length >= 2) {
    const key = parts[0].trim();
    const value = parts.slice(1).join('=').trim().replace(/(^"|"$)/g, '');
    envVars[key] = value;
  }
});

const supabaseUrl = envVars.VITE_SUPABASE_URL;
const supabaseAnonKey = envVars.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testUpdate() {
  try {
    console.log("Inserting speaker...");
    const { data: insData, error: insError } = await supabase.from('speakers').insert({
      name: 'Temp Speaker To Update',
      title: 'Testing Update',
      role: 'Speaker',
      talk: 'Update testing',
      color: '#0f52ba'
    }).select();
    if (insError) throw insError;
    const speakerId = insData[0].id;
    console.log("✔ Inserted speaker ID:", speakerId);

    console.log("Updating speaker...");
    const { data: updData, error: updError } = await supabase.from('speakers')
      .update({ name: 'Updated Speaker Name' })
      .eq('id', speakerId)
      .select();
    if (updError) throw updError;
    console.log("✔ Updated speaker data:", updData[0]);

    console.log("Deleting speaker...");
    const { error: delError } = await supabase.from('speakers').delete().eq('id', speakerId);
    if (delError) throw delError;
    console.log("✔ Deleted speaker.");

    console.log("\n✔ UPDATE TEST COMPLETED SUCCESSFULLY!");
    process.exit(0);
  } catch (err) {
    console.error("❌ UPDATE TEST FAILED:", err);
    process.exit(1);
  }
}

testUpdate();
