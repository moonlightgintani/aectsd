import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://exviushwdtdyotfnphsl.supabase.co';
const supabaseAnonKey = 'sb_publishable_t53cZzUCIE9sj4vfXHbLEQ_6wIHkcrl';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const tracks = [
  {
    name: 'Power and Energy Systems',
    description: 'Focuses on power systems operation, renewable integrations, electric machines, smart grids, electric vehicles, and AI/ML applications in electrical engineering.',
    subtopics: [
      'Power System Operation and Control',
      'Advanced Transmission and Distribution Systems',
      'Smart Grids and Micro Grids',
      'Renewable Energy Systems',
      'Electrical Machinery and Control',
      'Electric Vehicles',
      'Emerging Power Electronics Converters',
      'Energy Storage Systems',
      'AI/ML Applications in Electrical Engineering',
      'Sustainable Energy Systems'
    ]
  },
  {
    name: 'Emerging Embedded and Communication Systems',
    description: 'Covers VLSI design, semiconductor devices, communication networks, green communication, embedded systems, and IoT applications.',
    subtopics: [
      'Microelectronics',
      'Semiconductor Devices',
      'Circuits and Systems',
      'Embedded Systems',
      'VLSI Design',
      '5G/6G Technology',
      'Communication Protocols and Networks',
      'Green and Sustainable Communication Systems',
      'Signal, Speech and Image Processing',
      'RF, Microwaves & Optical Communication',
      'Digital Communication Technologies and Systems',
      'Sensor Networks & IoT',
      'Embedded AI'
    ]
  },
  {
    name: 'Instrumentation and Control Systems',
    description: 'Highlights process control, automation, industrial controls, actuators, robotics, quantum sensors, and cyber-physical systems.',
    subtopics: [
      'Smart Instrumentation and Control Systems',
      'AI and Machine Learning in Control and Instrumentation Applications',
      'Process Control',
      'Instrumentation Systems',
      'DCS and SCADA',
      'Automation and Industrial Control',
      'CAN',
      'Sensors and Actuators',
      'Cyber-Physical Systems and Industrial IoT',
      'Robotics and Autonomous Systems',
      'Measurement Techniques and Metrology',
      'Wearable and Portable Sensing Devices',
      'Quantum Sensors and Measurement Technologies'
    ]
  },
  {
    name: 'Biomedical Engineering and Sciences',
    description: 'Explores bio-sensors, micro/nano bio-engineering, biomedical imaging, remote healthcare, big data in health, and smart implants.',
    subtopics: [
      'Disruptive technologies in healthcare - AI/ML',
      'Micro/Nano Bio-engineering',
      'Biomedical Instrumentation and Devices',
      'Biosensors/ Micro/Nano and Wearable Technologies',
      'Biomedical Imaging and Image Processing',
      'Biomedical and Health Informatics',
      'IoT in Healthcare',
      'Diagnostic, Therapeutic and Rehabilitation Engineering',
      'Big Data Analytics in Healthcare',
      'Telemedicine and Remote Healthcare',
      'Smart Implants and Biocompatible Devices',
      'Bio-photonics and Optical Technologies'
    ]
  },
  {
    name: 'Emerging Computing Technologies and Computational Intelligence',
    description: 'Covers machine learning algorithms, generative AI, parallel systems, computing architectures, and the societal impact of AI.',
    subtopics: [
      'Artificial Intelligence',
      'Machine Learning',
      'Generative AI',
      'Computational Intelligence Techniques',
      'High-Performance and Parallel Computing',
      'Edge, IoT, and Cyber-Physical Systems',
      'Ethics and Societal Impact of AI',
      'Intelligent Software and Systems'
    ]
  },
  {
    name: 'Transformative Technologies in Big Data, Internet of Things and Security',
    description: 'Focuses on analytics modeling, cloud security, cybersecurity threats, threat intelligence, blockchain, and IoT integration.',
    subtopics: [
      'Predictive Modeling',
      'Business Intelligence and Real-Time Analytics',
      'AI-Driven Automation',
      'Edge Computing',
      'Cloud Computing',
      'IoT Security',
      'Cybersecurity',
      'Ethical Hacking and Threat Intelligence',
      'Data Science and Big Data Analytics',
      'AI and Big Data Integration',
      'Blockchain Technologies'
    ]
  }
];

async function update() {
  console.log('1. Clearing departments table...');
  const { error: deleteErr } = await supabase.from('departments').delete().neq('id', 0);
  if (deleteErr) {
    console.error('Delete error:', deleteErr.message);
    return;
  }
  console.log('SUCCESS: Cleared departments.');

  console.log('2. Inserting new tracks...');
  const { error: insertErr } = await supabase.from('departments').insert(tracks);
  if (insertErr) {
    console.error('Insert error:', insertErr.message);
    return;
  }
  console.log(`SUCCESS: Inserted ${tracks.length} tracks.`);

  console.log('3. Updating cfp_badge to "Track" in conference_info...');
  const { error: configErr } = await supabase.from('conference_info').upsert({
    key: 'cfp_badge',
    value: 'Track'
  });
  if (configErr) {
    console.error('Config error:', configErr.message);
  } else {
    console.log('SUCCESS: Updated cfp_badge to "Track".');
  }
}

update();
