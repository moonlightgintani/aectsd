import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

// Load env variables manually from .env if needed, though Bun does it automatically
const envPath = path.resolve(process.cwd(), '.env');
let supabaseUrl = '';
let supabaseKey = '';

if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  const lines = envContent.split('\n');
  for (const line of lines) {
    if (line.startsWith('VITE_SUPABASE_URL=')) {
      supabaseUrl = line.split('=')[1].trim();
    } else if (line.startsWith('VITE_SUPABASE_ANON_KEY=')) {
      supabaseKey = line.split('=')[1].trim();
    }
  }
}

// Fallback to standard process.env if available
supabaseUrl = supabaseUrl || process.env.VITE_SUPABASE_URL || '';
supabaseKey = supabaseKey || process.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseKey) {
  console.error('Error: Supabase URL and Key must be defined in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const committeeData = [
  // Patron
  { category: 'organizing', role: 'Patron', name: 'Thiru. R. Sundar', desc: 'Managing Trustee, SNR Sons Charitable Trust, Coimbatore' },
  { category: 'organizing', role: 'Patron', name: 'Thiru. S. Narendran', desc: 'Joint Managing Trustee, SNR Sons Charitable Trust, Coimbatore' },
  
  // General Chairs
  { category: 'organizing', role: 'General Chair', name: 'Dr. A. Soundarrajan', desc: 'Principal, Sri Ramakrishna Engineering College' },
  { category: 'organizing', role: 'General Chair', name: 'Dr. P. Sakthivel', desc: 'IEEE Madras Section & Professor, Department of ECE, Anna University Chennai.' },
  
  // Conference Chair
  { category: 'organizing', role: 'Conference Chair & Organizing Secretary', name: 'Dr. R. Shanmugasundaram', desc: 'Professor - EEE' },
  
  // Session Chair
  { category: 'organizing', role: 'Session Chair', name: 'Dr. N. Sathish Kumar', desc: 'Professor - ECE' },
  
  // Members
  { category: 'organizing', role: 'Member', name: 'Mrs. N. Divya', desc: 'Asst. Prof. (Sr.G) - EEE' },
  { category: 'organizing', role: 'Member', name: 'Mrs. R. Kiruba', desc: 'Asst. Prof. (Sr. G) - EIE' },
  { category: 'organizing', role: 'Member', name: 'Dr. S. P. Vimal', desc: 'Asso. Prof. - ECE' },
  { category: 'organizing', role: 'Member', name: 'Dr. J. Selva Kumar', desc: 'Professor - CSE' },
  { category: 'organizing', role: 'Member', name: 'Mrs. R. Rajalakshmi', desc: 'Asst. Prof. (OG) - IT' },
  { category: 'organizing', role: 'Member', name: 'Mrs. G. Lavanya', desc: 'Asst. Prof. (Sl.G) - BME' },
  
  // Finance Chair
  { category: 'organizing', role: 'Finance Chair & Joint-Organizing Secretary', name: 'Dr. K. Balamurugan', desc: 'Asso. Prof - EEE' },
  { category: 'organizing', role: 'Finance Committee Member', name: 'Mr. C. Praveenkumar', desc: 'Asst. Prof. (Sl.g) - ECE' },
  
  // Publication Chair
  { category: 'organizing', role: 'Publication Chair', name: 'Dr. V. Rukkumani', desc: 'Asso. Professor - EIE' },
  { category: 'organizing', role: 'Publication Committee Member', name: 'Mr. R. Santhoshkumar', desc: 'Asst. Prof. - EEE' },
  { category: 'organizing', role: 'Publication Committee Member', name: 'Dr. M. Priyadharshini', desc: 'Asst. Prof. - ECE' },
  { category: 'organizing', role: 'Publication Committee Member', name: 'Mr. I. Aravindaguru', desc: 'Asst. Prof. (Sr. G) - EIE' },
  { category: 'organizing', role: 'Publication Committee Member', name: 'Mrs. C. Sowntharya', desc: 'Asst. Prof. (Sr.G) - CSE' },
  { category: 'organizing', role: 'Publication Committee Member', name: 'Dr. N. Saranya', desc: 'AP (Sl.G)' },
  { category: 'organizing', role: 'Publication Committee Member', name: 'Dr. P. Vishnu Vardhan', desc: 'Asst. Prof. (Sr.G) - BME' },
  
  // Local Arrangements Chair
  { category: 'organizing', role: 'Local Arrangements Chair', name: 'Dr. Deepa B Prabhu', desc: 'Asso. Prof. - BME' },
  { category: 'organizing', role: 'Local Arrangements Committee Member', name: 'Dr. V. Radhika', desc: 'Asso. Prof. - BME' },
  { category: 'organizing', role: 'Local Arrangements Committee Member', name: 'Mr. B. Marisekar', desc: 'Asst. Prof. (Sl.G) - EEE' },
  { category: 'organizing', role: 'Local Arrangements Committee Member', name: 'Dr. M. Logaprakash', desc: 'Asst. Prof. (Sl. G) - AIDS' },
  
  // Registration Chair
  { category: 'organizing', role: 'Registration Chair', name: 'Mrs. S. Jansi Rani', desc: 'Asst. Prof. (Sl.G) - IT' },
  { category: 'organizing', role: 'Registration Committee Member', name: 'Dr. H. Vidhya', desc: 'Asst. Prof. (Sr.G) - EEE' },
  { category: 'organizing', role: 'Registration Committee Member', name: 'Mrs. T. Anitha', desc: 'Asst. Prof. (Sl.G) - EIE' },
  { category: 'organizing', role: 'Registration Committee Member', name: 'Mrs. M. Jaishree', desc: 'Asst. Prof. (Sl.G) - ECE' },
  { category: 'organizing', role: 'Registration Committee Member', name: 'Mrs. R. S. Ramya', desc: 'Asst. Prof. (Sr.G) - CSE' },
  { category: 'organizing', role: 'Registration Committee Member', name: 'Mr. S. Jeevanandham', desc: 'Asst. Prof. (Sr.G) - IT' },
  { category: 'organizing', role: 'Registration Committee Member', name: 'Mrs. L. Divyalakshmi', desc: 'Asst. Prof. (Sl.G) - BME' },
  
  // Conference Pre-Tutorial Sessions Chair
  { category: 'organizing', role: 'Conference Pre-Tutorial Sessions Chair', name: 'Dr. S. P. Vimal', desc: 'Asso. Prof. - ECE' },
  { category: 'organizing', role: 'Pre-Tutorial Sessions Committee Member', name: 'Mrs. B. Kalaimathi', desc: 'Asst. Prof. (Sr.G) - ECE' },
  { category: 'organizing', role: 'Pre-Tutorial Sessions Committee Member', name: 'Dr. A. Vijay', desc: 'Asst. Prof. (Sr.G) - ECE' },
  { category: 'organizing', role: 'Pre-Tutorial Sessions Committee Member', name: 'Mrs. M. Kowsalya', desc: 'Asso. Prof. - ECE & Asst. Prof. (Sr.G) - ECE' },
  
  // Technical Review Committee
  { category: 'organizing', role: 'Technical Review Committee Convener', name: 'Dr. R. Shanmugasundaram', desc: 'Professor - EEE' },
  { category: 'organizing', role: 'Technical Review Committee Member', name: 'Dr. K. Balamurugan', desc: 'Asso. Prof. - EEE' },
  { category: 'organizing', role: 'Technical Review Committee Member', name: 'Mr. R. Mohan Kumar', desc: 'Asst. Prof. (Sl.G) - EEE' },
  { category: 'organizing', role: 'Technical Review Committee Member', name: 'Mr. B. Sridhar', desc: 'Asst. Prof. (Sl.G) - EEE' },
  { category: 'organizing', role: 'Technical Review Committee Member', name: 'Dr. M. Kasiselvanathan', desc: 'Asso. Prof. - ECE' },
  { category: 'organizing', role: 'Technical Review Committee Member', name: 'Mr. C. Mathan', desc: 'Asst. Prof. (Sr. G) - EIE' },
  { category: 'organizing', role: 'Technical Review Committee Member', name: 'Dr. P. Mathiyalagan', desc: 'Asso. Prof. - CSE' },
  { category: 'organizing', role: 'Technical Review Committee Member', name: 'Mrs. S. S. Sugantha Mallika', desc: 'Asst. Prof. (Sl.G) - IT' },
  { category: 'organizing', role: 'Technical Review Committee Member', name: 'Dr. M. Jeevitha Priya', desc: 'Asst. Prof. - BME' },
  
  // Outreach and Promotion Committee
  { category: 'organizing', role: 'Outreach and Promotion Committee Convener', name: 'Dr. M. S. Geetha Devasena', desc: 'Professor - CSE' },
  { category: 'organizing', role: 'Outreach and Promotion Committee Member', name: 'Dr. M. Kalaiarasu', desc: 'Asso. Prof. - IT' },
  { category: 'organizing', role: 'Outreach and Promotion Committee Member', name: 'Dr. R. Kingsy Grace', desc: 'Asso. Prof. - CSE' },
  { category: 'organizing', role: 'Outreach and Promotion Committee Member', name: 'Dr. R. Vijaya Kumar', desc: 'Asst. Prof. (Sl.G) - CSE' },
  { category: 'organizing', role: 'Outreach and Promotion Committee Member', name: 'Mr. C. Praveenkumar', desc: 'Asst. Prof. (Sr.G) - EEE' },
  { category: 'organizing', role: 'Outreach and Promotion Committee Member', name: 'Mrs. R.S. Ramya', desc: 'Asst. Prof. (Sr.G) - CSE' },
  
  // Website and Social Media Promotion Committee
  { category: 'organizing', role: 'Website and Social Media Promotion Committee Chair', name: 'Dr. S. Harihara Gopalan', desc: 'Asso. Prof. - CSE' },
  { category: 'organizing', role: 'Website and Social Media Promotion Committee Member', name: 'Mr. K. Robin Johny', desc: 'Asst. Prof. (Sr.G) - AERO' },
  { category: 'organizing', role: 'Website and Social Media Promotion Committee Member', name: 'Mr. R. S. Vishnudurai', desc: 'Asst. Prof. (Sr.G) - CSE' },
  { category: 'organizing', role: 'Website and Social Media Promotion Committee Member', name: 'Dr. A. Vijay', desc: 'Asst. Prof. (Sr. G) - ECE' },
  
  // Hospitality Committee
  { category: 'organizing', role: 'Hospitality Committee Convener', name: 'Dr. P. Perumal', desc: 'Professor - CSE' },
  { category: 'organizing', role: 'Hospitality Committee Member', name: 'Dr. B. Mathivanan', desc: 'Asso. Prof. - CSE' },
  { category: 'organizing', role: 'Hospitality Committee Member', name: 'Dr. M. Nagarajapandian', desc: 'Asst. Prof. (Sl.G) - EIE' },
  { category: 'organizing', role: 'Hospitality Committee Member', name: 'Mr. V. Krishna Kumar', desc: 'Asst. Prof. (Sl.G) - CSE' },
  { category: 'organizing', role: 'Hospitality Committee Member', name: 'Dr. N. Suresh Kumar', desc: 'Asso. Prof. - IT' },
  { category: 'organizing', role: 'Hospitality Committee Member', name: 'Dr. P. Sebastian Vindro Jude', desc: 'Asst. Prof. (Sl.G) - EEE' }
];

async function sync() {
  console.log('Clearing old organizing committee data...');
  const { error: deleteError } = await supabase
    .from('committee')
    .delete()
    .eq('category', 'organizing');

  if (deleteError) {
    console.error('Delete error:', deleteError);
    process.exit(1);
  }

  console.log(`Inserting ${committeeData.length} new organizing committee members...`);
  const { error: insertError } = await supabase
    .from('committee')
    .insert(committeeData);

  if (insertError) {
    console.error('Insert error:', insertError);
    process.exit(1);
  }

  console.log('Organizing committee synced successfully!');
}

sync();
