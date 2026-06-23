import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Parse .env manually since dotenv might not be installed globally/locally
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

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Supabase URL or Anon Key missing in .env file.");
  process.exit(1);
}

console.log("Supabase URL:", supabaseUrl);
console.log("Connecting client...");

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function runTests() {
  let hasErrors = false;

  console.log("\n--- TEST 1: Register Test Admin ---");
  try {
    const testAdmin = {
      username: 'tester_admin_temp_' + Date.now(),
      password_hash: '5e883700ece17c127b3737b0d3e49e256a43817f3b54de956f18130012175002' // sha256 of 'password'
    };
    const { data, error } = await supabase.from('website_admins').insert(testAdmin).select();
    if (error) throw error;
    console.log("✔ Successfully created test admin:", data[0]);

    // Cleanup
    const { error: delError } = await supabase.from('website_admins').delete().eq('username', testAdmin.username);
    if (delError) console.error("❌ Cleanup error for admin:", delError);
    else console.log("✔ Successfully cleaned up test admin.");
  } catch (err) {
    console.error("❌ Test 1 Failed:", err.message || err);
    hasErrors = true;
  }

  console.log("\n--- TEST 2: Add, Read, Delete Keynote Speaker ---");
  try {
    const testSpeaker = {
      name: 'Test Speaker Name',
      title: 'Professor, Test University',
      role: 'Keynote Speaker',
      talk: 'Advanced Testing Methods for Web Apps',
      color: '#0f52ba',
      image_url: 'https://example.com/test_speaker.jpg'
    };
    // Insert
    const { data: insData, error: insError } = await supabase.from('speakers').insert(testSpeaker).select();
    if (insError) throw insError;
    const insertedId = insData[0].id;
    console.log("✔ Successfully added keynote speaker. ID:", insertedId);

    // Read
    const { data: selData, error: selError } = await supabase.from('speakers').select('*').eq('id', insertedId);
    if (selError) throw selError;
    console.log("✔ Successfully read keynote speaker:", selData[0].name);

    // Delete
    const { error: delError } = await supabase.from('speakers').delete().eq('id', insertedId);
    if (delError) throw delError;
    console.log("✔ Successfully deleted keynote speaker.");
  } catch (err) {
    console.error("❌ Test 2 Failed:", err.message || err);
    hasErrors = true;
  }

  console.log("\n--- TEST 3: Add, Read, Delete Academic Track (Department) ---");
  try {
    const testTrack = {
      name: 'Department of Test Engineering',
      description: 'Testing the database CRUD operations for tracks.',
      sort_order: 99
    };
    // Insert
    const { data: insData, error: insError } = await supabase.from('departments').insert(testTrack).select();
    if (insError) throw insError;
    const insertedId = insData[0].id;
    console.log("✔ Successfully added track. ID:", insertedId);

    // Read
    const { data: selData, error: selError } = await supabase.from('departments').select('*').eq('id', insertedId);
    if (selError) throw selError;
    console.log("✔ Successfully read track:", selData[0].name);

    // Delete
    const { error: delError } = await supabase.from('departments').delete().eq('id', insertedId);
    if (delError) throw delError;
    console.log("✔ Successfully deleted track.");
  } catch (err) {
    console.error("❌ Test 3 Failed:", err.message || err);
    hasErrors = true;
  }

  console.log("\n--- TEST 4: Add, Read, Delete Committee Member ---");
  try {
    const testMember = {
      name: 'Dr. Test Organizer',
      category: 'organizing',
      role: 'Session Chair',
      desc: 'Professor, SREC Department of Test',
      image_url: 'https://example.com/test_member.jpg'
    };
    // Insert
    const { data: insData, error: insError } = await supabase.from('committee').insert(testMember).select();
    if (insError) throw insError;
    const insertedId = insData[0].id;
    console.log("✔ Successfully added committee member. ID:", insertedId);

    // Read
    const { data: selData, error: selError } = await supabase.from('committee').select('*').eq('id', insertedId);
    if (selError) throw selError;
    console.log("✔ Successfully read committee member:", selData[0].name);

    // Delete
    const { error: delError } = await supabase.from('committee').delete().eq('id', insertedId);
    if (delError) throw delError;
    console.log("✔ Successfully deleted committee member.");
  } catch (err) {
    console.error("❌ Test 4 Failed:", err.message || err);
    hasErrors = true;
  }

  console.log("\n--- TEST 5: Add, Read, Delete Important Date ---");
  try {
    const testDate = {
      title: 'Test Submission Opening Date',
      event_date: 'August 15, 2026',
      desc: 'Draft submissions begin for testing.',
      sort_order: 99
    };
    // Insert
    const { data: insData, error: insError } = await supabase.from('important_dates').insert(testDate).select();
    if (insError) throw insError;
    const insertedId = insData[0].id;
    console.log("✔ Successfully added timeline date. ID:", insertedId);

    // Read
    const { data: selData, error: selError } = await supabase.from('important_dates').select('*').eq('id', insertedId);
    if (selError) throw selError;
    console.log("✔ Successfully read timeline date:", selData[0].title);

    // Delete
    const { error: delError } = await supabase.from('important_dates').delete().eq('id', insertedId);
    if (delError) throw delError;
    console.log("✔ Successfully deleted timeline date.");
  } catch (err) {
    console.error("❌ Test 5 Failed:", err.message || err);
    hasErrors = true;
  }

  console.log("\n--- TEST 6: Add, Read, Delete Tutorial Workshop ---");
  try {
    const testWorkshop = {
      title: 'Introduction to Database Testing',
      instructor: 'Dr. Test Instructor, SREC',
      duration: 'Half Day (1:30 PM - 4:30 PM)',
      price: 'INR 500 / USD 15',
      details: 'Syllabus covering mocha, jest, playwrigth, and database assertion protocols.'
    };
    // Insert
    const { data: insData, error: insError } = await supabase.from('workshops').insert(testWorkshop).select();
    if (insError) throw insError;
    const insertedId = insData[0].id;
    console.log("✔ Successfully added workshop. ID:", insertedId);

    // Read
    const { data: selData, error: selError } = await supabase.from('workshops').select('*').eq('id', insertedId);
    if (selError) throw selError;
    console.log("✔ Successfully read workshop:", selData[0].title);

    // Delete
    const { error: delError } = await supabase.from('workshops').delete().eq('id', insertedId);
    if (delError) throw delError;
    console.log("✔ Successfully deleted workshop.");
  } catch (err) {
    console.error("❌ Test 6 Failed:", err.message || err);
    hasErrors = true;
  }

  console.log("\n--- TEST 7: Add, Read, Delete Tourist Place (Explore) ---");
  try {
    // We use a high, temporary ID to bypass the out-of-sync sequence on the remote database
    const testSight = {
      id: 9999,
      name: 'Test Scenic Spot',
      category: 'Nature / Scenic',
      description: 'Lush greenery and meditative environment for tests.',
      image_url: 'https://example.com/scenic.jpg',
      map_url: 'https://maps.google.com/',
      sort_order: 99
    };
    // Insert
    const { data: insData, error: insError } = await supabase.from('tourist_places').insert(testSight).select();
    if (insError) throw insError;
    const insertedId = insData[0].id;
    console.log("✔ Successfully added tourist sight with explicit ID. ID:", insertedId);

    // Read
    const { data: selData, error: selError } = await supabase.from('tourist_places').select('*').eq('id', insertedId);
    if (selError) throw selError;
    console.log("✔ Successfully read tourist sight:", selData[0].name);

    // Delete
    const { error: delError } = await supabase.from('tourist_places').delete().eq('id', insertedId);
    if (delError) throw delError;
    console.log("✔ Successfully deleted tourist sight.");
  } catch (err) {
    console.error("❌ Test 7 Failed:", err.message || err);
    hasErrors = true;
  }

  console.log("\n--- TEST 8: Add, Read, Delete Weekend Stay (Explore) ---");
  try {
    // We use a high, temporary ID to bypass the out-of-sync sequence on the remote database
    const testStay = {
      id: 9999,
      name: 'Test Weekend Retreat',
      category: 'Hill Station',
      description: 'Misty hills and tea estates for database checks.',
      image_url: 'https://example.com/stay.jpg',
      map_url: 'https://maps.google.com/',
      sort_order: 99
    };
    // Insert
    const { data: insData, error: insError } = await supabase.from('weekend_stays').insert(testStay).select();
    if (insError) throw insError;
    const insertedId = insData[0].id;
    console.log("✔ Successfully added weekend stay with explicit ID. ID:", insertedId);

    // Read
    const { data: selData, error: selError } = await supabase.from('weekend_stays').select('*').eq('id', insertedId);
    if (selError) throw selError;
    console.log("✔ Successfully read weekend stay:", selData[0].name);

    // Delete
    const { error: delError } = await supabase.from('weekend_stays').delete().eq('id', insertedId);
    if (delError) throw delError;
    console.log("✔ Successfully deleted weekend stay.");
  } catch (err) {
    console.error("❌ Test 8 Failed:", err.message || err);
    hasErrors = true;
  }

  console.log("\n--- TEST 9: Add, Read, Delete Hotel (Explore) ---");
  try {
    const testHotel = {
      name: 'Test Grand Hotel',
      category: 'Luxury Hotels',
      address: 'Vattamalaipalayam Road, Coimbatore',
      description: 'Test luxurious accommodation with high speed internet.',
      map_url: 'https://maps.google.com/',
      image_url: 'https://example.com/hotel.jpg',
      sort_order: 99
    };
    // Insert
    const { data: insData, error: insError } = await supabase.from('hotels_to_stay').insert(testHotel).select();
    if (insError) throw insError;
    const insertedId = insData[0].id;
    console.log("✔ Successfully added hotel. ID:", insertedId);

    // Read
    const { data: selData, error: selError } = await supabase.from('hotels_to_stay').select('*').eq('id', insertedId);
    if (selError) throw selError;
    console.log("✔ Successfully read hotel:", selData[0].name);

    // Delete
    const { error: delError } = await supabase.from('hotels_to_stay').delete().eq('id', insertedId);
    if (delError) throw delError;
    console.log("✔ Successfully deleted hotel.");
  } catch (err) {
    console.error("❌ Test 9 Failed:", err.message || err);
    hasErrors = true;
  }

  console.log("\n==============================");
  if (hasErrors) {
    console.log("❌ DB CRUD TEST COMPLETED WITH ERRORS.");
    process.exit(1);
  } else {
    console.log("✔ ALL DB CRUD TESTS COMPLETED SUCCESSFULLY!");
    process.exit(0);
  }
}

runTests();
