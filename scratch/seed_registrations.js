const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://exviushwdtdyotfnphsl.supabase.co';
const supabaseAnonKey = 'sb_publishable_t53cZzUCIE9sj4vfXHbLEQ_6wIHkcrl';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const mockRegistrations = [
  {
    paper_id: 'SREC-2027-042',
    paper_title: 'An Efficient Machine Learning Framework for Edge Devices',
    author_name: 'Dr. Rajesh Kumar',
    email: 'rajesh.kumar@srec.ac.in',
    phone: '+91 9843212345',
    screenshot_name: 'transaction_proof_rajesh.png',
    screenshot_size: 124500,
    register_for_tour: true,
    preferred_tour_place: 'Ooty Botanical Gardens'
  },
  {
    paper_id: 'SREC-2027-109',
    paper_title: 'Deep Learning in Precision Agriculture: A Survey',
    author_name: 'Sarah Jenkins',
    email: 'sjenkins@mit.edu',
    phone: '+1 (617) 555-0199',
    screenshot_name: 'wire_transfer_sarah.pdf',
    screenshot_size: 453000,
    register_for_tour: false,
    preferred_tour_place: null
  },
  {
    paper_id: 'SREC-2027-087',
    paper_title: 'Secure Blockchain-based EHR System for Smart Healthcare',
    author_name: 'Amit Sharma',
    email: 'amit.sharma@iitb.ac.in',
    phone: '+91 8877665544',
    screenshot_name: 'receipt_payment_amit.jpg',
    screenshot_size: 215000,
    register_for_tour: true,
    preferred_tour_place: 'Mudumalai Wildlife Sanctuary'
  }
];

async function seed() {
  console.log('Inserting mock registrations...');
  const { data, error } = await supabase.from('registrations').insert(mockRegistrations);
  if (error) {
    console.error('Error seeding registrations:', error.message);
  } else {
    console.log('Successfully seeded registrations!');
  }
}

seed();
