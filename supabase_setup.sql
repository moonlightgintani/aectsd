DROP SCHEMA IF EXISTS public CASCADE;

CREATE SCHEMA public;

-- (Optional) Restore the default privileges
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO public;

CREATE TABLE IF NOT EXISTS departments (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    sort_order INT NOT NULL
);

-- 2. Committee table
CREATE TABLE IF NOT EXISTS committee (
    id SERIAL PRIMARY KEY,
    category VARCHAR(50) NOT NULL,
    role VARCHAR(100),
    name VARCHAR(255) NOT NULL,
    "desc" TEXT NOT NULL,
    image_url TEXT
);

-- 3. Speakers table
CREATE TABLE IF NOT EXISTS speakers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    title VARCHAR(255) NOT NULL,
    role VARCHAR(255) NOT NULL,
    talk TEXT NOT NULL,
    color VARCHAR(50) NOT NULL,
    image_url TEXT
);

-- 4. Important Dates table
CREATE TABLE IF NOT EXISTS important_dates (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    event_date VARCHAR(100) NOT NULL,
    "desc" TEXT NOT NULL,
    sort_order INT NOT NULL
);

-- 5. Workshops table
CREATE TABLE IF NOT EXISTS workshops (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    instructor VARCHAR(255) NOT NULL,
    duration VARCHAR(100) NOT NULL,
    price VARCHAR(100) NOT NULL,
    details TEXT NOT NULL
);

-- 6. Registration Fees table (kept for summary overview displaying rates)
CREATE TABLE IF NOT EXISTS registration_fees (
    id SERIAL PRIMARY KEY,
    member_type VARCHAR(255) NOT NULL,
    inr_reg VARCHAR(50) NOT NULL,
    inr_early VARCHAR(50) NOT NULL,
    usd_phys_reg VARCHAR(50) NOT NULL,
    usd_phys_early VARCHAR(50) NOT NULL,
    usd_virt_reg VARCHAR(50) NOT NULL,
    usd_virt_early VARCHAR(50) NOT NULL,
    sort_order INT NOT NULL
);

-- 7. Stats table
CREATE TABLE IF NOT EXISTS stats (
    id SERIAL PRIMARY KEY,
    number VARCHAR(50) NOT NULL,
    label VARCHAR(255) NOT NULL,
    sort_order INT NOT NULL
);

-- 8. Coordinators table
CREATE TABLE IF NOT EXISTS coordinators (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(255) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    sort_order INT NOT NULL
);

-- 9. Conference Info table (Key-Value metadata store)
CREATE TABLE IF NOT EXISTS conference_info (
    key VARCHAR(255) PRIMARY KEY,
    value TEXT NOT NULL
);

-- 10. Registration Pricing table (for dynamic fee calculator base rates and modifiers)
CREATE TABLE IF NOT EXISTS registration_pricing (
    key VARCHAR(255) PRIMARY KEY,
    value NUMERIC NOT NULL,
    currency VARCHAR(10) NOT NULL -- 'INR' or 'USD'
);

-- 11. Registrations table (stores submissions)
CREATE TABLE IF NOT EXISTS registrations (
    id SERIAL PRIMARY KEY,
    paper_id VARCHAR(100),
    paper_title VARCHAR(255),
    author_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    screenshot_name VARCHAR(255),
    screenshot_size INT,
    register_for_tour BOOLEAN DEFAULT FALSE,
    preferred_tour_place VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Enable Row Level Security (RLS) for all tables to allow anonymous SELECT access
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE committee ENABLE ROW LEVEL SECURITY;
ALTER TABLE speakers ENABLE ROW LEVEL SECURITY; 
ALTER TABLE important_dates ENABLE ROW LEVEL SECURITY;
ALTER TABLE workshops ENABLE ROW LEVEL SECURITY;
ALTER TABLE registration_fees ENABLE ROW LEVEL SECURITY;
ALTER TABLE stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE coordinators ENABLE ROW LEVEL SECURITY;
ALTER TABLE conference_info ENABLE ROW LEVEL SECURITY;
ALTER TABLE registration_pricing ENABLE ROW LEVEL SECURITY;
ALTER TABLE registrations ENABLE ROW LEVEL SECURITY;

-- Create policy to allow public select access
CREATE POLICY "Allow public SELECT on departments" ON departments FOR SELECT USING (true);
CREATE POLICY "Allow public SELECT on committee" ON committee FOR SELECT USING (true);
CREATE POLICY "Allow public SELECT on speakers" ON speakers FOR SELECT USING (true);
CREATE POLICY "Allow public SELECT on important_dates" ON important_dates FOR SELECT USING (true);
CREATE POLICY "Allow public SELECT on workshops" ON workshops FOR SELECT USING (true);
CREATE POLICY "Allow public SELECT on registration_fees" ON registration_fees FOR SELECT USING (true);
CREATE POLICY "Allow public SELECT on stats" ON stats FOR SELECT USING (true);
CREATE POLICY "Allow public SELECT on coordinators" ON coordinators FOR SELECT USING (true);
CREATE POLICY "Allow public SELECT on conference_info" ON conference_info FOR SELECT USING (true);
CREATE POLICY "Allow public SELECT on registration_pricing" ON registration_pricing FOR SELECT USING (true);

-- Create policy to allow anonymous insert into registrations (to submit forms)
CREATE POLICY "Allow public INSERT on registrations" ON registrations FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public SELECT on registrations" ON registrations FOR SELECT USING (true);


-- 12. website_admins table
CREATE TABLE IF NOT EXISTS website_admins (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE website_admins ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public SELECT on website_admins" ON website_admins FOR SELECT USING (true);
CREATE POLICY "Allow public INSERT on website_admins" ON website_admins FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public UPDATE on website_admins" ON website_admins FOR UPDATE USING (true);
CREATE POLICY "Allow public DELETE on website_admins" ON website_admins FOR DELETE USING (true);

-- Also add write policies for other tables so that logged-in clients can insert/update/delete records
CREATE POLICY "Allow anonymous INSERT on departments" ON departments FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anonymous UPDATE on departments" ON departments FOR UPDATE USING (true);
CREATE POLICY "Allow anonymous DELETE on departments" ON departments FOR DELETE USING (true);

CREATE POLICY "Allow anonymous INSERT on committee" ON committee FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anonymous UPDATE on committee" ON committee FOR UPDATE USING (true);
CREATE POLICY "Allow anonymous DELETE on committee" ON committee FOR DELETE USING (true);

CREATE POLICY "Allow anonymous INSERT on speakers" ON speakers FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anonymous UPDATE on speakers" ON speakers FOR UPDATE USING (true);
CREATE POLICY "Allow anonymous DELETE on speakers" ON speakers FOR DELETE USING (true);

CREATE POLICY "Allow anonymous INSERT on important_dates" ON important_dates FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anonymous UPDATE on important_dates" ON important_dates FOR UPDATE USING (true);
CREATE POLICY "Allow anonymous DELETE on important_dates" ON important_dates FOR DELETE USING (true);

CREATE POLICY "Allow anonymous INSERT on workshops" ON workshops FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anonymous UPDATE on workshops" ON workshops FOR UPDATE USING (true);
CREATE POLICY "Allow anonymous DELETE on workshops" ON workshops FOR DELETE USING (true);

CREATE POLICY "Allow anonymous INSERT on registration_fees" ON registration_fees FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anonymous UPDATE on registration_fees" ON registration_fees FOR UPDATE USING (true);
CREATE POLICY "Allow anonymous DELETE on registration_fees" ON registration_fees FOR DELETE USING (true);

CREATE POLICY "Allow anonymous INSERT on stats" ON stats FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anonymous UPDATE on stats" ON stats FOR UPDATE USING (true);
CREATE POLICY "Allow anonymous DELETE on stats" ON stats FOR DELETE USING (true);

CREATE POLICY "Allow anonymous INSERT on coordinators" ON coordinators FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anonymous UPDATE on coordinators" ON coordinators FOR UPDATE USING (true);
CREATE POLICY "Allow anonymous DELETE on coordinators" ON coordinators FOR DELETE USING (true);

CREATE POLICY "Allow anonymous INSERT on conference_info" ON conference_info FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anonymous UPDATE on conference_info" ON conference_info FOR UPDATE USING (true);
CREATE POLICY "Allow anonymous DELETE on conference_info" ON conference_info FOR DELETE USING (true);

CREATE POLICY "Allow anonymous INSERT on registration_pricing" ON registration_pricing FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anonymous UPDATE on registration_pricing" ON registration_pricing FOR UPDATE USING (true);
CREATE POLICY "Allow anonymous DELETE on registration_pricing" ON registration_pricing FOR DELETE USING (true);

CREATE POLICY "Allow anonymous UPDATE on registrations" ON registrations FOR UPDATE USING (true);
CREATE POLICY "Allow anonymous DELETE on registrations" ON registrations FOR DELETE USING (true);

-- 14. Tourist Places table
CREATE TABLE IF NOT EXISTS tourist_places (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(255) NOT NULL,
    description TEXT,
    image_url TEXT,
    map_url TEXT,
    sort_order INT DEFAULT 0
);

ALTER TABLE tourist_places ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public SELECT on tourist_places" ON tourist_places FOR SELECT USING (true);
CREATE POLICY "Allow anonymous INSERT on tourist_places" ON tourist_places FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anonymous UPDATE on tourist_places" ON tourist_places FOR UPDATE USING (true);
CREATE POLICY "Allow anonymous DELETE on tourist_places" ON tourist_places FOR DELETE USING (true);

-- 15. Weekend Stays table
CREATE TABLE IF NOT EXISTS weekend_stays (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(255) NOT NULL,
    description TEXT,
    image_url TEXT,
    map_url TEXT,
    sort_order INT DEFAULT 0
);

ALTER TABLE weekend_stays ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public SELECT on weekend_stays" ON weekend_stays FOR SELECT USING (true);
CREATE POLICY "Allow anonymous INSERT on weekend_stays" ON weekend_stays FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anonymous UPDATE on weekend_stays" ON weekend_stays FOR UPDATE USING (true);
CREATE POLICY "Allow anonymous DELETE on weekend_stays" ON weekend_stays FOR DELETE USING (true);

-- 16. Hotels to Stay table
CREATE TABLE IF NOT EXISTS hotels_to_stay (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(255) NOT NULL,
    address VARCHAR(255) NOT NULL,
    description TEXT,
    map_url TEXT,
    image_url TEXT,
    sort_order INT DEFAULT 0
);

ALTER TABLE hotels_to_stay ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public SELECT on hotels_to_stay" ON hotels_to_stay FOR SELECT USING (true);
CREATE POLICY "Allow anonymous INSERT on hotels_to_stay" ON hotels_to_stay FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anonymous UPDATE on hotels_to_stay" ON hotels_to_stay FOR UPDATE USING (true);
CREATE POLICY "Allow anonymous DELETE on hotels_to_stay" ON hotels_to_stay FOR DELETE USING (true);

-- Seed defaults for Coimbatore details and tour
INSERT INTO conference_info (key, value) VALUES
('about_coimbatore_desc', 'Coimbatore, often referred to as the "Manchester of South India", is a dynamic city in Tamil Nadu, India, known for its industrial prowess, pleasant climate, and cultural heritage. It is a popular destination for conferences and business events, offering excellent infrastructure and connectivity. Coimbatore International Airport connects the city to major Indian cities like Chennai, Bangalore, Mumbai, and Delhi, as well as international destinations like Singapore and Sharjah. Coimbatore Junction is a major railway hub with frequent trains to all parts of India. It is also well-connected via National Highways, making it accessible by road from nearby cities like Chennai, Bangalore, and Kochi. Coimbatore is widely recognized as an emerging education hub in South India. The city is home to a variety of prestigious educational institutions, spanning schools, colleges, and specialized training centers. It offers a holistic educational environment with a focus on academics, innovation, and industry integration. The ideal time to visit Coimbatore is between September and March, when the weather is pleasant and conducive to travel.'),
('about_coimbatore_tour_info', 'Half-a-day tour will be arranged to visit nearest site seeing places based on number of participant’s registered for tour.'),
('show_announcement', 'true'),
('announcement_text', '📢 Call for Papers! Mark your calendars: The Call for Papers for AECTSD 2027 opens on 15th December 2026. Start preparing your submission'),
('about_conference', 'We are delighted to inform the upcoming International Conference on Advances in Engineering and Computing Technologies for Sustainable Development (AECTSD 2027) is organized by the Department of Electrical and Electronics Engineering, Electronics and Communication Engineering, Electronics and Instrumentation, Biomedical Engineering, Computer Science Engineering and Information Technology of Sri Ramakrishna Engineering College, Coimbatore, Tamilnadu, India during 17th and 18th December 2027. This technical co-sponsor for this conference is IEEE Madras Section. This interdisciplinary conference provides a dynamic platform for students, academicians, researchers, and industry professionals from around the globe to exchange ideas and collaborate, explore innovative solutions, present their latest research, and explore cutting-edge advancements across multiple fields of technology to facilitate the growth and prosperity of society as a whole. This interdisciplinary conference aims to foster collaboration and knowledge sharing across a diverse tracks from various domains such as Power and Energy, Embedded and Communication, Biomedical Engineering, Instrumentation and Control, Computational Intelligence, Big Data, Internet of Things and Security, and other related areas including core sciences and engineering. In addition to the technical sessions, there will be pre-conference tutorial and keynote addresses.'),
('advisory_committee_desc', 'The Advisory Committee comprises of experienced professionals, experts, or senior members, to provide strategic advice and guidance for the conference. This committee help shape the event''s vision and content while offering insights to maintain its relevance and quality, and supports the organizers in achieving the conference''s goals and maintaining its prestige.'),
('technical_committee_desc', 'The Technical Committee is comprised of researchers, scholars, and technical specialists who oversee the peer-review process and review submitted manuscripts. They evaluate papers based on originality, technical depth, and relevance to the conference tracks to ensure the highest standards of academic excellence and publication quality.'),
('about_trust', 'SNR Sons Charitable Trust was found in the year 1970 by the illustrious sons of Sri. S. N. Rangasamy Naidu namely, Late Sri Chinnasamy Naidu, Late Sri. P. R. Ramaswami Naidu, Sr. R. Doraiswami Naidu and Sevaratna Dr.R.Venkatesalu Naidu. Being an ardent devotee of Sri Ramakrishna Paramahamsa, all the institutions started by the Trust bear the name of the HolySage "Sri Ramakrishna".\n\nFollowing the Principles of Sri Ramakrishna Paramahamsa''s Philosophy of God through man'', the Trust successfully runs 15 organisations significantly catering to social causes of society focusing on Health Care, Education and Service. Apart from healthcare, it is education that has attracted the attention of the SNR Sons Charitable Trust. This extraordinary penchant for education has resulted in bringing some of the sterling Educational Institutions and Courses within the reach of many, who would otherwise have been left dreaming about education at such levels.'),
('about_institution', 'Sri Ramakrishna Engineering College (SREC), Coimbatore established in the year 1994 by SNR Sons Charitable Trust is one of the 17 institutions managed by the trust. SREC is an autonomous institution offering 12 Undergraduate programmes in the disciplines of Aeronautical, Biomedical, Civil, Mechanical, Electronics and Communication, Electrical and Electronics, Electronics and Instrumentation, Information Technology, Computer Science and Engineering, Robotics and Automation, Artificial Intelligence and Data Science and M.Tech Computer Science and Engineering (5 Year Integrated). The institution offers Seven Post Graduate programmes in Engineering and Technology with specializations of Manufacturing Engineering, Power Electronics and Drives, VLSI Design, Computer Science and Engineering , Embedded System Technologies, Control and Instrumentation Engineering and Nanoscience and Technology, in addition to MBA.'),
('speakers_desc', 'We are honored to present our distinguished Keynote Speakers of ICAECTSD 2025, invited to deliver a featured address at a conference. Their presentations set the tone for the event, aligning with its central theme. The industry leaders and renowned academics, will share their insights on cutting-edge technologies on topics pertaining to the scope of the conference.'),
('workshops_desc', 'The pre-conference tutorial sessions will be held on the first day of conference, designed to provide in-depth knowledge and hands-on training on specific topics related to the conference theme. These tutorials are conducted by experts to cater for the participants looking to enhance their skills and understanding on specific area related to the conference theme.'),
('workshops_title', 'Pre-conference Tutorials'),
('speakers_title', 'Keynote Speakers'),
('steering_committee_desc', 'The Steering Committee comprises of eminent faculty members responsible for overseeing the planning, execution, and strategic direction of a conference. The committee also provides guidance on key decisions, ensures alignment with the conference''s goals, and maintains its quality and reputation over time. This Committee plays a crucial role in shaping the overall success of the event.'),
('committee_tab_steering', 'Steering Committee'),
('committee_tab_tech', 'Technical Program'),
('hero_title', 'Welcome to ICAECTSD 2027'),
('hero_subtitle', 'Second IEEE International Conference On Advances in Engineering and Computing Technologies for Sustainable Development (ICAECTSD) 2027'),
('event_date_display', '17th and 18th December 2027'),
('event_location_display', 'Sri Ramakrishna Engineering College, Coimbatore, Tamilnadu, India'),
('hero_countdown_title', 'Conference Countdown'),
('label_days', 'Days'),
('label_hours', 'Hours'),
('label_mins', 'Minutes'),
('label_secs', 'Seconds'),
('hero_btn_submit', 'Submit Paper'),
('hero_btn_register', 'Calculate Fees'),
('submission_card_title', 'Submit Your Application through CMT'),
('submission_card_desc', 'Submit your research papers directly via the Microsoft CMT portal. Make sure to adhere to all formatting guidelines before uploading your work.'),
('label_conf_id', 'Conference CMT Portal ID:'),
('cmt_id', 'ICAECTSD 2027'),
('cmt_link', 'https://cmt3.research.microsoft.com/aectsd2025'),
('submission_btn_cmt', 'Go to CMT Submission Portal'),
('contact_badge', 'Connect'),
('contact_title', 'Contact Us'),
('contact_form_title', 'Send Us a Message'),
('contact_form_label_name', 'Your Name'),
('contact_form_placeholder_name', 'Enter full name'),
('contact_form_label_email', 'Email Address'),
('contact_form_placeholder_email', 'Enter email address'),
('contact_form_label_subject', 'Subject'),
('contact_form_placeholder_subject', 'How can we help?'),
('contact_form_label_message', 'Message'),
('contact_form_placeholder_message', 'Type details here...'),
('contact_form_btn_send', 'Send Message'),
('contact_sec_title', 'Organizing Secretariat'),
('secretariat_address', 'Department of EEE / ECE,\nSri Ramakrishna Engineering College,\nVattamalaipalayam, N.G.G.O Colony Post,\nCoimbatore, Tamilnadu - 641022, India.'),
('secretariat_email', 'aectsd2027@srec.ac.in'),
('secretariat_phone', '+91 9080296675'),
('contact_coord_title', 'Conference Coordinators'),
('cfp_badge', 'Track'),
('cfp_title', 'Call for Papers'),
('cfp_desc', 'Authors are invited to submit original, unpublished research papers in standard IEEE format. All accepted and registered papers will be published in the conference proceedings.'),
('cfp_btn_word', 'Download Word Template'),
('cfp_btn_latex', 'Download LaTeX Template'),
('alert_download_word', 'Downloading Microsoft Word template...'),
('alert_download_latex', 'Downloading LaTeX template...'),
('guidelines_badge', 'Guidelines'),
('guidelines_title', 'Submission Guidelines'),
('workshops_badge', 'Tutorials'),
('workshops_btn_reg', 'Register for Workshops'),
('workshop_label', 'Workshop'),
('label_lead_instructor', 'Lead Instructor:'),
('label_fee', 'Registration Fee:')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

-- Seed tourist places
INSERT INTO "public"."tourist_places" ("id", "name", "category", "description", "image_url", "map_url", "sort_order") VALUES
(1, 'Isha Yoga Center - Dhyanalinga and Adiyogi Statue', 'Religious site', 'Features the magnificent 112-foot Adiyogi Shiva bust, a world-renowned spiritual destination.', 'https://lh3.googleusercontent.com/gps-cs-s/APNQkAEMlOakFgT7WvRoBKhBbZ0kg-C5SpNIWBIaEmf-kR0-SPAKPn-BavJQeuDcz_vgNuC-K7csINCMCBy-nkQdsc6ZZC29jCs5ht-481TuO0W3Y4xwTmtj2fttMsZ18fubqhXedUc=s1360-w1360-h1020-rw', 'https://www.google.com/maps/dir/?api=1&destination=Isha+Yoga+Center+Coimbatore', 1),
(2, 'Dhyanalinga Temple', 'Religious site', 'A unique meditative space located at the foothills of Velliangiri Mountains offering a peaceful, spiritual atmosphere.', 'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/08/58/71/56/dhyanalinga-temple.jpg?w=800&h=500&s=1', 'https://www.google.com/maps/dir/?api=1&destination=Dhyanalinga+Temple+Coimbatore', 2),
(3, 'Marudamalai Temple', 'Religious site', 'An ancient hilltop temple dedicated to Lord Murugan, offering scenic views of the city and surroundings.', 'https://i.redd.it/maruthamalai-temple-visit-pleasant-visit-rant-v0-hv6riir4kb4f1.jpg?width=2268&format=pjpg&auto=webp&s=212606f86838ec5145cc634a4c05dfc5691ffb0c', 'https://www.google.com/maps/dir/?api=1&destination=Marudamalai+Temple+Coimbatore', 3),
(4, 'Kovai Kutralam Water Falls', 'Nature / Scenic', 'Beautiful, serene waterfalls nestled in the Siruvani hills, famous for its refreshing natural streams.', 'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/17/4a/f9/c2/kovai-kutralam-water.jpg?w=1200&h=-1&s=1', 'https://www.google.com/maps/dir/?api=1&destination=Kovai+Kutralam+Water+Falls', 4),
(5, 'Brookefields Mall', 'Shopping / Entertainment', 'A modern, prime shopping mall in Coimbatore offering global brands, food courts, and multiplex theatres.', 'https://res.cloudinary.com/dyiffrkzh/image/upload/c_fill,f_auto,fl_progressive.strip_profile,g_center,h_400,q_auto,w_700/v1692700582/bbj/kvwsmkhxaamjghnlfc1u.webp', 'https://www.google.com/maps/dir/?api=1&destination=Brookefields+Mall+Coimbatore', 5),
(6, 'Black Thunder Theme Park', 'Amusement Park', 'A massive, thrilling water theme park situated at the foot of Nilgiris near Mettupalayam.', 'https://assets.simplotel.com/simplotel/image/upload/w_5000,h_3750/x_0,y_0,w_5000,h_2810,c_crop,q_80,fl_progressive/w_900,h_506,f_auto,c_fit/black-thunder---water-theme-park/Lucky_Ariel_vttsit', 'https://www.google.com/maps/dir/?api=1&destination=Black+Thunder+Theme+Park+Mettupalayam', 6),
(7, 'Eachanari Vinayagar Temple', 'Religious site', 'A historic temple dedicated to Lord Ganesha, famous for its grand 6-foot tall idol and architecture.', 'https://imagedelivery.net/y9EHf1toWJTBqJVsQzJU4g/www.indianholiday.com/2024/09/coimbatore-1.png/w=9999', 'https://www.google.com/maps/dir/?api=1&destination=Eachanari+Vinayagar+Temple', 7),
(8, 'Kovai Kondattam', 'Amusement Park', 'An eco-friendly amusement park situated on Siruvani Main Road, perfect for family entertainment.', 'https://www.kovaikondattam.com/images/gallery/35.jpg', 'https://www.google.com/maps/dir/?api=1&destination=Kovai+Kondattam', 8),
(9, 'Horticulture Farms, Kallar', 'Nature / Botanical', 'Lush state horticultural farm near Mettupalayam showcasing diverse fruit varieties and rare plants.', 'https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?auto=format&fit=crop&w=600&q=80', 'https://www.google.com/maps/dir/?api=1&destination=Horticulture+Farms+Kallar', 9);


-- Seed weekend stays
INSERT INTO "public"."weekend_stays" ("id", "name", "category", "description", "image_url", "map_url", "sort_order") VALUES
(1, 'Ooty Hill Station (Udhagamandalam)', 'Hill Station', 'The legendary Queen of Hill Stations, famous for its tea estates, Nilgiri Mountain Railway, and botanical gardens.', 'https://hblimg.mmtcdn.com/content/hubble/img/destimg/mmt/destination/m_Ooty_main_tv_destination_img_1_l_764_1269.jpg', 'https://www.google.com/maps/dir/?api=1&destination=Ooty+Tamil+Nadu', 1),
(2, 'Coonoor Hill Station', 'Hill Station', 'A quieter Nilgiri retreat famous for Sim’s Park, dolphin’s nose viewpoints, and panoramic tea valley walks.', 'https://www.hillsandwills.com/blog_images/60779.jpg', 'https://www.google.com/maps/dir/?api=1&destination=Coonoor+Tamil+Nadu', 2),
(3, 'Valparai Hill Station', 'Hill Station', 'A pristine, misty hill station surrounded by tea plantations and rich wildlife in the Western Ghats.', 'https://gktoursandtravel.in/wp-content/uploads/2025/03/Valparai_Hills_Tour_Packages.webp', 'https://www.google.com/maps/dir/?api=1&destination=Valparai+Tamil+Nadu', 3),
(4, 'Munnar Hill Station', 'Hill Station', 'Famous destination in nearby Kerala boasting vast rolling tea estates, waterfalls, and scenic mist-filled peaks.', 'https://miro.medium.com/1*cWyYxjVyB80sUhUwV-hK5A.jpeg', 'https://www.google.com/maps/dir/?api=1&destination=Munnar+Kerala', 4),
(5, 'Athirapally Waterfalls', 'Nature / Scenic', 'A majestic 80-foot waterfall in Kerala, often referred to as the Niagara of India, surrounded by green rainforests.', 'https://static.wixstatic.com/media/5d0430_6b8ae72d753d4bfd84707c5b0478c592~mv2.webp', 'https://www.google.com/maps/dir/?api=1&destination=Athirapally+Waterfalls', 5),
(6, 'Kodaikanal Hill Station', 'Hill Station', 'The Princess of Hill Stations, renowned for its star-shaped lake, pine forests, and cool mountain air.', 'https://static.toiimg.com/thumb/msid-119353067,width-1280,height-720,imgsize-158872,resizemode-6,overlay-toi_sw,pt-32,y_pad-40/photo.jpg', 'https://www.google.com/maps/dir/?api=1&destination=Kodaikanal+Tamil+Nadu', 6),
(7, 'Topslip Anamalai Tiger Reserve', 'Wildlife Sanctuary / Nature', 'A famous national park and tiger reserve rich in biodiversity, offering elephant rides and forest safaris.', 'https://d3fphkxyf5o5bm.cloudfront.net/image-resize/format=webp,w=720/QwRY54Li1HMwD7oNfpaD4NK9335zBaD1Vd5gnhXSD7', 'https://www.google.com/maps/dir/?api=1&destination=Topslip+Anamalai+Tiger+Reserve', 7);


-- Seed hotels
INSERT INTO hotels_to_stay (name, category, address, description, map_url, image_url, sort_order) VALUES
-- Luxury Hotels
('Vivanta', 'Luxury Hotels', 'Race Course Road, Coimbatore', '5-star luxury hotel in the heart of Coimbatore featuring premium amenities and dining.', 'https://maps.google.com/?q=Vivanta+Coimbatore', 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=600&q=80', 1),
('The Residency Towers', 'Luxury Hotels', 'Avinashi Road, Coimbatore', 'Highly rated premium business hotel offering deluxe suites and wellness centers.', 'https://maps.google.com/?q=The+Residency+Towers+Coimbatore', 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=600&q=80', 2),
('Le Meridien', 'Luxury Hotels', 'Neelambur, Coimbatore', 'Luxurious 5-star hotel with grand event spaces near the international airport.', 'https://maps.google.com/?q=Le+Meridien+Coimbatore', 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=600&q=80', 3),
('Radisson Blu', 'Luxury Hotels', 'Avinashi Road, Coimbatore', 'Upscale modern business hotel featuring a roof-top pool and fine dining.', 'https://maps.google.com/?q=Radisson+Blu+Coimbatore', 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=600&q=80', 4),
('Hash Six Hotel', 'Luxury Hotels', 'Saibaba Colony, Coimbatore', 'Sleek luxury hotel offering exceptional boutique rooms, dining, and hospitality.', 'https://maps.google.com/?q=Hash+Six+Hotel+Coimbatore', 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=600&q=80', 5),
('Lemon Tree Hotel', 'Luxury Hotels', 'Avinashi Road, Coimbatore', 'Vibrant upscale business hotel located strategically near key commercial hubs.', 'https://maps.google.com/?q=Lemon+Tree+Hotel+Coimbatore', 'https://images.unsplash.com/photo-1445019980597-93fa8acb246c?auto=format&fit=crop&w=600&q=80', 6),
-- Mid-Range Hotels
('Hotel CAG Pride', 'Mid-Range Hotels', 'Gandhipuram, Coimbatore', 'Respected corporate hotel offering warm hospitality, comfortable stays, and quality dining.', 'https://maps.google.com/?q=Hotel+CAG+Pride+Coimbatore', 'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=600&q=80', 7),
('City Tower', 'Mid-Range Hotels', 'Gandhipuram, Coimbatore', 'Classic business hotel offering spacious rooms, convenient location, and prompt services.', 'https://maps.google.com/?q=City+Tower+Coimbatore', 'https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?auto=format&fit=crop&w=600&q=80', 8),
('Hotel Alankar', 'Mid-Range Hotels', 'Gandhipuram, Coimbatore', 'Comfortable business hotel famous for its cozy accommodation and multi-cuisine restaurant.', 'https://maps.google.com/?q=Hotel+Alankar+Coimbatore', 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=600&q=80', 9),
('Fairfield by Marriott', 'Mid-Range Hotels', 'Avinashi Road, Coimbatore', 'Contemporary comfort and business amenities situated close to Coimbatore Airport.', 'https://maps.google.com/?q=Fairfield+by+Marriott+Coimbatore', 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=600&q=80', 10),
('Welcomhotel (ITC Hotels)', 'Mid-Range Hotels', 'Race Course, Coimbatore', 'Premium heritage-themed hotel offering top-class dining, wellness, and stay experiences.', 'https://maps.google.com/?q=Welcomhotel+Coimbatore', 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=600&q=80', 11),
('Hotel KISCOL Grands', 'Mid-Range Hotels', 'Ramnagar, Coimbatore', 'Modern, high-comfort hotel featuring premium facilities in the central business area.', 'https://maps.google.com/?q=Hotel+KISCOL+Grands+Coimbatore', 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=600&q=80', 12),
('Rathna Residency', 'Mid-Range Hotels', 'Town Hall, Coimbatore', 'Centrally located business hotel renowned for its cozy environment and great hospitality.', 'https://maps.google.com/?q=Rathna+Residency+Coimbatore', 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=600&q=80', 13),
('Hotel Vijay Park Inn', 'Mid-Range Hotels', 'Ramnagar, Coimbatore', 'Affordable business hotel offering neat accommodation, conference halls, and dining.', 'https://maps.google.com/?q=Hotel+Vijay+Park+Inn+Coimbatore', 'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=600&q=80', 14),
-- Budget-Friendly Hotels
('Sri Aarvee Hotels', 'Budget-Friendly Hotels', 'Gandhipuram, Coimbatore', 'Value-for-money hotel providing essential comforts and prime accessibility.', 'https://maps.google.com/?q=Sri+Aarvee+Hotels+Coimbatore', 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=600&q=80', 15),
('Zone by The Park', 'Budget-Friendly Hotels', 'Avinashi Road, Coimbatore', 'Trendy, social hotel offering active spaces, smart amenities, and neat rooms.', 'https://maps.google.com/?q=Zone+by+The+Park+Coimbatore', 'https://images.unsplash.com/photo-1445019980597-93fa8acb246c?auto=format&fit=crop&w=600&q=80', 16),
('Hotel Jothi Grand', 'Budget-Friendly Hotels', 'Near KCT, Saravanampatti, Coimbatore', 'Pocket-friendly hotel near IT parks and educational institutions in Saravanampatti.', 'https://maps.google.com/?q=Hotel+Jothi+Grand+Coimbatore', 'https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?auto=format&fit=crop&w=600&q=80', 17);

-- Seed important dates
INSERT INTO "public"."important_dates" ("title", "event_date", "desc", "sort_order") VALUES
('Call for Papers', 'December 15, 2026', 'Call for Papers opens via CMT Portal.', 1),
('Paper Submission Deadline', 'April 30, 2027', 'All draft manuscripts must be submitted.', 2),
('Paper Acceptance Notification', 'June 30, 2027', 'Notification of acceptance or rejection.', 3),
('Camera-ready Paper Submission Deadline', 'July 31, 2027', 'Deadline for final camera-ready upload.', 4),
('Early Bird Registration Deadline', 'August 15, 2027', 'Discounted early registration closes.', 5),
('Final Registration Deadline', 'September 30, 2027', 'Regular registration closes.', 6),
('Late Fee Registration Deadline', 'October 10, 2027', 'Last chance registration with late fee surcharge.', 7),
('Pre-conference Tutorials Registration', 'November 15, 2027', 'Registration deadline for tutorial sessions.', 8),
('Conference Date', 'December 17-18, 2027', 'AECTSD 2027 Conference sessions.');

-- Seed departments (tracks)
INSERT INTO "public"."departments" ("name", "description", "sort_order") VALUES
('Track 1: Artificial Intelligence, Data Science and Intelligent Computing', 'Focuses on Artificial Intelligence, Data Science and Intelligent Computing.\n\nSubtopics:\n• Artificial Intelligence and Machine Learning\n• Deep Learning and Generative AI\n• Agentic AI and Autonomous Intelligent Systems\n• Natural Language Processing\n• Computer Vision\n• Data Science and Big Data Analytics\n• Explainable and Responsible AI\n• High-Performance Computing', 1),
('Track 2: Computing Technologies and Software Systems', 'Focuses on Computing Technologies and Software Systems.\n\nSubtopics:\n• Software Engineering\n• Cloud, Edge and Fog Computing\n• Distributed Computing\n• Internet of Things (IoT)\n• Digital Twin Technologies\n• Human-Computer Interaction\n• Mobile and Web Technologies\n• DevOps and Software Quality', 2),
('Track 3: Cyber Security, Blockchain and Quantum Computing', 'Focuses on Cyber Security, Blockchain and Quantum Computing.\n\nSubtopics:\n• Cyber Security and Network Security\n• Ethical Hacking and Digital Forensics\n• Blockchain Technologies\n• Privacy-Preserving Computing\n• Applied Cryptography\n• Quantum Computing\n• Quantum Algorithms\n• Quantum Communication and Security\n• Post-Quantum Cryptography', 3),
('Track 4: Electronics, Communication and Embedded Intelligence', 'Focuses on Electronics, Communication and Embedded Intelligence.\n\nSubtopics:\n• Embedded Systems\n• VLSI Design\n• Semiconductor Devices\n• Signal, Image and Video Processing\n• Wireless Communication (5G/6G)\n• Sensor Networks\n• Embedded AI\n• Intelligent Electronic Systems', 4),
('Track 5: Electrical, Energy and Smart Technologies', 'Focuses on Electrical, Energy and Smart Technologies.\n\nSubtopics:\n• Smart Grid Technologies\n• Renewable Energy Systems\n• Electric Vehicles and Charging Infrastructure\n• Power Electronics and Drives\n• Energy Storage Systems\n• Intelligent Power Systems\n• Sustainable Energy Technologies\n• Smart Sensors and Instrumentation', 5),
('Track 6: Emerging Technologies for Sustainable Development', 'Focuses on Emerging Technologies for Sustainable Development.\n\nSubtopics:\n• Digital Healthcare\n• Biomedical Engineering\n• Bioinformatics\n• Smart Agriculture\n• AR/VR/XR Technologies\n• Green Computing\n• Sustainable ICT Solutions\n• Industry 5.0 and Digital Transformation\n• Technology for UN Sustainable Development Goals (SDGs)', 6);


-- Seed committee members
INSERT INTO "public"."committee" ("category", "role", "name", "desc") VALUES
('steering', 'Steering Committee Member', 'Dr. N. Susila', 'Professor and Head, Department of Information Technology'),
('steering', 'Steering Committee Member', 'Dr. M. S. Geetha Devasena', 'Professor and Head, Department of Computer Science Engineering'),
('steering', 'Steering Committee Member', 'Dr. A. Grace Selvarani', 'Professor and Head, Department of M.Tech Computer Science Engineering'),
('steering', 'Steering Committee Member', 'Dr. R. Shanmugasundaram', 'Professor and Head, Department of Electronics and Instrumentation Engineering'),
('steering', 'Steering Committee Member', 'Dr. S. Allirani', 'Professor and Head, Department of Electrical and Electronics Engineering'),
('steering', 'Steering Committee Member', 'Dr. M. Jagadeeswari', 'Professor and Head, Department of Electronics and Communication Engineering'),
('steering', 'Steering Committee Member', 'Dr. N. Sathish Kumar', 'Professor and Head, Department of Bio-Medical Engineering'),
('organizing', 'Chief Patron', 'Dr. Sundar Ramakrishnan', 'Managing Trustee, SNR Sons Charitable Trust, Coimbatore'),
('organizing', 'Chief Patron', 'Thiru. S. Narendran', 'Joint Managing Trustee, SNR Sons Charitable Trust, Coimbatore'),
('organizing', 'General Chair', 'Dr. A. Soundarrajan', 'Principal, Sri Ramakrishna Engineering College'),
('organizing', 'General Chair', 'Dr. P. Sakthivel', 'Chairman, IEEE Madras Section'),
('organizing', 'General Chair', 'Dr. S. Radha', 'Secretary, IEEE Madras Section'),
('organizing', 'General Chair', 'Dr. S. Brindha', 'Treasurer, IEEE Madras Section'),
('organizing', 'Conference Chair', 'Dr. V. Karpagam', 'Organizing Secretary, Professor & Head - AI&DS'),
('organizing', 'Session Chair', 'Dr. R. Kingsy Grace', 'Professor - AI&DS'),
('organizing', 'Member', 'Mrs. N. Divya', 'Asst. Prof. (Sr.G) - EEE'),
('organizing', 'Member', 'Mrs. R. Kiruba', 'Asst. Prof. (Sr. G) - EIE'),
('organizing', 'Member', 'Dr. S. P. Vimal', 'Asso. Prof. - ECE'),
('organizing', 'Member', 'Dr. J. Selva Kumar', 'Professor - M.Tech CSE'),
('organizing', 'Member', 'Mrs. R. Rajalakshmi', 'Asst. Prof. (OG) - IT'),
('organizing', 'Member', 'Mrs. G. Lavanya', 'Asst. Prof. (Sl.G) - BME'),
('organizing', 'Program and Finance Chair', 'Dr. K. Balamurugan', 'Asso. Prof - EEE'),
('organizing', 'Program and Finance Committee Member', 'Dr. C. Praveenkumar', 'Asst. Prof. (Sl.Gr) - EEE'),
('organizing', 'Publication Chair', 'Mrs. S. Jansi Rani', 'Asst. Prof. (Sl.Gr) - IT'),
('organizing', 'Publication Committee Member', 'Mr. I. Aravindaguru', 'Asst. Prof. (Sr. G) - EIE'),
('organizing', 'Publication Committee Member', 'Mrs. C. Sowntharya', 'Asst. Prof. (Sr.G) - CSE'),
('organizing', 'Publication Committee Member', 'Dr. N. Saranya', 'AP (Sl.G)'),
('organizing', 'Publication Committee Member', 'Dr. P. Vishnu Vardhan', 'Asst. Prof. (Sr.G) - BME'),
('organizing', 'Local Arrangements Chair', 'Dr. Deepa B Prabhu', 'Asso. Prof. - BME'),
('organizing', 'Local Arrangements Committee Member', 'Dr. V. Radhika', 'Asso. Prof. - BME'),
('organizing', 'Local Arrangements Committee Member', 'Mr. B. Marisekar', 'Asst. Prof. (Sl.G) - EEE'),
('organizing', 'Local Arrangements Committee Member', 'Dr. M. Logaprakash', 'Asst. Prof. (Sl. G) - AIDS'),
('organizing', 'Registration Chair', 'Dr. V. Radhika', 'Asso. Prof. - BME'),
('organizing', 'Registration Committee Member', 'Dr. H. Vidhya', 'Asst. Prof. (Sr.G) - EEE'),
('organizing', 'Registration Committee Member', 'Mrs. T. Anitha', 'Asst. Prof. (Sl.G) - EIE'),
('organizing', 'Registration Committee Member', 'Mrs. M. Jaishree', 'Asst. Prof. (Sl.G) - ECE'),
('organizing', 'Registration Committee Member', 'Mrs. R. S. Ramya', 'Asst. Prof. (Sr.G) - CSE'),
('organizing', 'Registration Committee Member', 'Mr. S. Jeevanandham', 'Asst. Prof. (Sr.G) - IT'),
('organizing', 'Registration Committee Member', 'Mrs. L. Divyalakshmi', 'Asst. Prof. (Sl.G) - BME'),
('organizing', 'Conference Pre-Tutorial Sessions Chair', 'Dr. C. Praveen Kumar', 'Asst. Prof. (Sl.Gr) - EEE'),
('organizing', 'Pre-Tutorial Sessions Committee Member', 'Mrs. B. Kalaimathi', 'Asst. Prof. (Sr.G) - ECE'),
('organizing', 'Pre-Tutorial Sessions Committee Member', 'Dr. A. Vijay', 'Asst. Prof. (Sr.G) - ECE'),
('organizing', 'Pre-Tutorial Sessions Committee Member', 'Mrs. M. Kowsalya (Sr.G) - ECE', 'Asso. Prof. - ECE'),
('organizing', 'Technical Review Committee Convener', 'Dr. V. Karpagam', 'Professor & Head - AI&DS'),
('organizing', 'Technical Review Committee Member', 'Dr. V. Rukkumani', 'Asso. Prof. - EIE'),
('organizing', 'Technical Review Committee Member', 'Dr. M. Kasi Selvanathan', 'Asso. Prof. - ECE'),
('organizing', 'Technical Review Committee Member', 'Dr. K. Balachander', 'Asst. Prof. (Sl.G) - EEE'),
('organizing', 'Technical Review Committee Member', 'Dr. J. Anitha', 'Proffessor - AI&DS'),
('organizing', 'Technical Review Committee Member', 'Dr. B. Mathivanan', 'Asso. Prof. - CSE'),
('organizing', 'Outreach and Promotion Committee Convener', 'Dr. V. Rukkumani', 'Asso. Prof. - EIE'),
('organizing', 'Outreach and Promotion Committee Member', 'Dr. M. Kalaiarasu', 'Professor - IT'),
('organizing', 'Website and Social Media Promotion Committee Chair', 'Mr. R. S. Vishnu Durai', 'Asst. Prof. (Sl.Gr) - AI&DS'),
('organizing', 'Website and Social Media Promotion Committee Member', 'Mr. K. Robin Johny', 'Asst. Prof. (Sr.G) - AERO'),
('organizing', 'Website and Social Media Promotion Committee Member', 'Mr. G. Narendran', 'Asst. Prof. (Sl.Gr) - IT'),
('organizing', 'Hospitality Committee Convener', 'Dr. P. Perumal', 'Professor - CSE'),
('organizing', 'Hospitality Committee Member', 'Dr. M. Nagarajapandian', 'Asst. Prof. (Sl.G) - EIE'),
('organizing', 'Hospitality Committee Member', 'Mr. V. Krishna Kumar', 'Asst. Prof. (Sl.G) - CSE'),
('organizing', 'Hospitality Committee Member', 'Dr. M. Logaprakash', 'Asst. Prof. (Sl.G) - AI&DS'),
('advisory', 'Advisory Committee Member', 'Dr. K. Ramesh', 'Principal Scientist, ICAR-Central Institute for Cotton Research (CICR) Regional Station, Coimbatore, Tamilnadu'),
('advisory', 'Advisory Committee Member', 'Dr. Karthik Seemakurthy', 'Research Scientist, Hydronium Energies Ltd, London UK'),
('advisory', 'Advisory Committee Member', 'Dr. Hareesh Janakiraman', 'Director, Embedded Guru LLC, USA'),
('advisory', 'Advisory Committee Member', 'Dr. R. Gheorghiță Ghinea', 'Director R and D, Brunel University of London, UK'),
('advisory', 'Advisory Committee Member', 'Dr. A. R Abdul Rajak', 'Head EEE, BITS Pilani, Dubai Campus, Dubai'),
('advisory', 'Advisory Committee Member', 'Mr. C. Senthilnathan', 'Associate Director, Virtusa Corporation, USA'),
('advisory', 'Advisory Committee Member', 'Mr. Soundararajan Manthiri', 'Sr. Energy Management System Manager, California, United States'),
('advisory', 'Advisory Committee Member', 'Dr. Keerthivasan Krishnamoorthy', 'Professor, University of Technology and Applied Sciences, Muscat, Sultanate of Oman'),
('advisory', 'Advisory Committee Member', 'Dr. Shankar Venugopal', 'Vice President, Mahindra Research Valley, Chennai'),
('advisory', 'Advisory Committee Member', 'Mr. Shekhar Malani', 'Managing Director, Devise Electronics Pvt. Ltd., Pune'),
('advisory', 'Advisory Committee Member', 'Dr. S. Joseph Gladwin', 'Vice-Chairman – Industry, Associate General Manager, BigCat Wireless Pvt. Ltd., Chennai'),
('advisory', 'Advisory Committee Member', 'Dr. Selvakumar Ramasethu', 'Senior PRL. Solution Engineer, Cadence Design System, Bengaluru, India'),
('advisory', 'Advisory Committee Member', 'Dr. Paramasivam Shanmugam', 'R & D and Engineering Leader, ESAB, Danfoss Drives, Chennai'),
('advisory', 'Advisory Committee Member', 'Dr. Thanga Raj Chelliah', 'Professor and Head, Water Resources Development and Management Department, IIT Roorkee, Uttrakhand'),
('advisory', 'Advisory Committee Member', 'Dr. R. Venkatesh Babu', 'Professor, Department of Computational and Data Sciences Indian Institute of Science, Bangalore, Karnataka'),
('advisory', 'Advisory Committee Member', 'Dr. Anantha Padmanabha', 'Assistant Professor, Department of Computer Science and Engineering, IITM, Chennai, Tamilnadu'),
('advisory', 'Advisory Committee Member', 'Dr. Gopalakrishnan Srinivasan', 'Assistant Professor, Department of Computer Science and Engineering, IITM, Chennai, Tamilnadu'),
('advisory', 'Advisory Committee Member', 'Dr. M. Sabarimalai Manikandan', 'Associate Professor, IIT Palakad, India'),
('advisory', 'Advisory Committee Member', 'Dr. M. Tottappan', 'Associate Professor, IIT (Bhu), Varanasi, India.'),
('advisory', 'Advisory Committee Member', 'Dr. Yadaiah Narri', 'Professor (Retired), Jawaharlal Nehru Technological University Hyderabad, Telangana'),
('advisory', 'Advisory Committee Member', 'Dr. K. Udhaykumar', 'Associate Professor, Department of Electrical and Electronics Engineering, Anna University, Chennai, Tamilnadu.'),
('advisory', 'Advisory Committee Member', 'Dr. S. Radha', 'Treasurer, IEEE Madras Section, Senior Professor, SSN College of Engineering, Chennai'),
('advisory', 'Advisory Committee Member', 'Dr. P. Sakthivel', 'Vice-Chairman, Academics, Anna University, Chennai'),
('advisory', 'Advisory Committee Member', 'Dr. S. Nickolas', 'Professor and Head of the Department, Computer Applications, NIT, Trichy, Tamilnadu'),
('advisory', 'Advisory Committee Member', 'Dr. D. Sriram Kumar', 'Professor, NIT, Tiruchirappalli, India'),
('advisory', 'Advisory Committee Member', 'Dr. S. M. Sameer', 'Professor, NIT Calicut, India'),
('advisory', 'Advisory Committee Member', 'Dr. Harigovindan', 'Associate Professor, NIT Puducherry, India'),
('advisory', 'Advisory Committee Member', 'Dr. P. Karuppanan', 'Associate Professor, MNIT, Allahabad, UP'),
('advisory', 'Advisory Committee Member', 'Dr. R. Jayabarathi', 'Associate Professor, Department of Electrical and Electronics Engineering, Amrita School of Engineering, Coimbatore'),
('advisory', 'Advisory Committee Member', 'Dr. S. Albert Alexander', 'IEEE Chairman, PELS, Professor, VIT, Vellore'),
('advisory', 'Advisory Committee Member', 'Dr. Ramalatha Marimuthu', 'Director, iExplore Foundation for Sustainable Development, Coimbatore'),
('advisory', 'Advisory Committee Member', 'Dr. Debarati Sen', 'Professor, GSSS, IIT Kharagpur, West Bengal');

-- Seed coordinators
INSERT INTO "public"."coordinators" ("role", "name", "phone", "sort_order") VALUES
('Publications Coordinator', 'Dr. M. Jagadeeswari', '+91 94435 56903', 1),
('Technical Program Coordinator', 'Dr. A. Grace Selvarani', '+91 98427 12604', 2);

-- 13. Restore necessary permissions to API gateway roles (anon, authenticated, service_role)
-- Dropping and recreating the public schema revokes default permissions for these roles.
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO anon, authenticated, service_role;

-- 14. Supabase Storage bucket for payment proof screenshots
-- Run this in Supabase SQL Editor if bucket doesn't exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'payment-proofs',
  'payment-proofs',
  true,
  10485760,  -- 10 MB limit
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif', 'application/pdf']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 10485760,
  allowed_mime_types = ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif', 'application/pdf'];

-- Allow anyone to upload to this bucket (anon INSERT)
CREATE POLICY "Allow public upload to payment-proofs"
  ON storage.objects FOR INSERT
  TO anon, authenticated
  WITH CHECK (bucket_id = 'payment-proofs');

-- Allow anyone to view files in this bucket (public SELECT)
CREATE POLICY "Allow public read from payment-proofs"
  ON storage.objects FOR SELECT
  TO anon, authenticated, public
  USING (bucket_id = 'payment-proofs');



