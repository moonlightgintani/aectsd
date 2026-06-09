-- Create tables for SREC AECTSD 2027 Conference Website database
-- Remove everything in the default schema
DROP SCHEMA IF EXISTS public CASCADE;

-- Re‑create the schema so you can create new tables again
CREATE SCHEMA public;

-- (Optional) Restore the default privileges
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO public;
-- 1. Departments table (replaces tracks to store full paragraphs of organizing departments)
CREATE TABLE IF NOT EXISTS departments (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    sort_order INT NOT NULL
);

-- 2. Committee table
CREATE TABLE IF NOT EXISTS committee (
    id SERIAL PRIMARY KEY,
    category VARCHAR(50) NOT NULL, -- 'organizing', 'advisory', 'technical'
    role VARCHAR(100),
    name VARCHAR(255) NOT NULL,
    "desc" TEXT NOT NULL
);

-- 3. Speakers table
CREATE TABLE IF NOT EXISTS speakers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    title VARCHAR(255) NOT NULL,
    role VARCHAR(255) NOT NULL,
    talk TEXT NOT NULL,
    color VARCHAR(50) NOT NULL
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

-- Seed Data: Insert SREC Departments
INSERT INTO departments (name, description, sort_order) VALUES
('Department of Electrical and Electronics Engineering', 'The Department of Electrical and Electronics Engineering was established in 1994. It offers a four-year B.E. (Electrical and Electronics Engineering) Programme. The department also offers a Ph.D. Programme to promote research activities in the areas related to Electrical Engineering. The consultancy services are also rendered by the department. It has a distinguished team of faculty consisting of 9 Doctorates and 9 Post Graduates who have registered for Ph.D. in different areas of Electrical and Electronics Engineering and have rich industrial/research/teaching experience. The Programmes offered by the department are Accredited by the National Board of Accreditation, New Delhi.', 1),
('Department of Electronics and Communication Engineering', 'The Department of Electronics and Communication Engineering was established in the year 1994 offering an Undergraduate programme in Electronics and Communication Engineering and two postgraduate programmes - VLSI Design and Embedded System Technologies. The UG programme is accredited and re-accredited by the National Board of Accreditation, New Delhi, since 2007. The department enables the students to attain excellence in domain technologies of Electronics and Communication with curricula focusing on the requirements specified by industries. The department has 36 faculty members with 14 members holding doctoral degrees. The department is recognized as a research centre with all computing facilities and state-of-the-art laboratories.', 2),
('Department of Computer Science and Engineering', 'The Department of Computer Science and Engineering (CSE) was established in 1994 and has since earned NBA accreditation on five occasions. The department offers a Post Graduate Programme on M.E. Artificial Intelligence and Data Science. The department boasts exceptional infrastructure and has secured funding from prestigious agencies such as AICTE, UGC, DRDO, ISRO, and BRNS. It has also forged strategic partnerships through Memoranda of Understanding (MoUs) with leading organizations including TNAU, L&T Technologies, GE Healthcare, Roots Industries, and more. It features state-of-the-art laboratories, including Centres of Excellence on AR/VR, GE Healthcare, Virtusa, and GPU Learning.', 3),
('Department of Information Technology', 'The Department of Information Technology was established in 1998. It is accredited by the National Board of Accreditation (NBA) since 2007 and Permanently Affiliated to Anna University, Chennai. The department has been recognized as a Research Center by Anna University, Chennai. The department has state-of-the-art infrastructure facilities with experienced faculty members. The department has received various funds from AICTE, Anna University, NABARD, CSIR & IEEE-WIE. Faculty members and students are actively involved in internships at the Center for Brain Computing Research. The Apple iOS Mobile Application Development Laboratory was established with high-end iMac machines worth INR 40 lakhs.', 4),
('Department of Electronics and Instrumentation Engineering', 'The Department of Electronics and Instrumentation Engineering (UG) was established in the year 2001. The department is recognized as a Research centre for pursuing Ph.D. by Anna University, Chennai, and is accredited by the National Board of Accreditation (NBA), New Delhi since 2007. It is equipped with a Centre of Excellence for LabVIEW by National Instruments, Bangalore and Industrial Standards Laboratories. The department has received funds from AICTE under the MODROBs scheme and is involved in doing consultancy projects for industries for about Rs. 45,00,000/-.', 5),
('Department of Biomedical Engineering', 'Biomedical engineers analyze and design solutions to problems in biology and medicine, with the goal of improving the quality and effectiveness of patient care. SREC''s Biomedical Engineering department covers recent advances in the growing field of biomedical technology, instrumentation, and administration. Contributions focus on theoretical and practical problems associated with the development of medical technology, introducing new engineering methods into public health, hospitals, and patient care to improve diagnosis and therapy.', 6);

-- Seed Data: Insert SREC Committee members
-- Seed Data: Insert SREC Committee members
INSERT INTO committee (category, role, name, "desc") VALUES
('organizing', 'Patron', 'Thiru. R. Sundar', 'Managing Trustee, SNR Sons Charitable Trust, Coimbatore'),
('organizing', 'Patron', 'Thiru. S. Narendran', 'Joint Managing Trustee, SNR Sons Charitable Trust, Coimbatore'),
('organizing', 'General Chair', 'Dr. A. Soundarrajan', 'Principal, Sri Ramakrishna Engineering College'),
('organizing', 'General Chair', 'Dr. P. Sakthivel', 'IEEE Madras Section & Professor, Department of ECE, Anna University Chennai.'),
('organizing', 'Conference Chair & Organizing Secretary', 'Dr. R. Shanmugasundaram', 'Professor - EEE'),
('organizing', 'Session Chair', 'Dr. N. Sathish Kumar', 'Professor - ECE'),
('organizing', 'Member', 'Mrs. N. Divya', 'Asst. Prof. (Sr.G) - EEE'),
('organizing', 'Member', 'Mrs. R. Kiruba', 'Asst. Prof. (Sr. G) - EIE'),
('organizing', 'Member', 'Dr. S. P. Vimal', 'Asso. Prof. - ECE'),
('organizing', 'Member', 'Dr. J. Selva Kumar', 'Professor - CSE'),
('organizing', 'Member', 'Mrs. R. Rajalakshmi', 'Asst. Prof. (OG) - IT'),
('organizing', 'Member', 'Mrs. G. Lavanya', 'Asst. Prof. (Sl.G) - BME'),
('organizing', 'Finance Chair & Joint-Organizing Secretary', 'Dr. K. Balamurugan', 'Asso. Prof - EEE'),
('organizing', 'Finance Committee Member', 'Mr. C. Praveenkumar', 'Asst. Prof. (Sl.g) - ECE'),
('organizing', 'Publication Chair', 'Dr. V. Rukkumani', 'Asso. Professor - EIE'),
('organizing', 'Publication Committee Member', 'Mr. R. Santhoshkumar', 'Asst. Prof. - EEE'),
('organizing', 'Publication Committee Member', 'Dr. M. Priyadharshini', 'Asst. Prof. - ECE'),
('organizing', 'Publication Committee Member', 'Mr. I. Aravindaguru', 'Asst. Prof. (Sr. G) - EIE'),
('organizing', 'Publication Committee Member', 'Mrs. C. Sowntharya', 'Asst. Prof. (Sr.G) - CSE'),
('organizing', 'Publication Committee Member', 'Dr. N. Saranya', 'AP (Sl.G)'),
('organizing', 'Publication Committee Member', 'Dr. P. Vishnu Vardhan', 'Asst. Prof. (Sr.G) - BME'),
('organizing', 'Local Arrangements Chair', 'Dr. Deepa B Prabhu', 'Asso. Prof. - BME'),
('organizing', 'Local Arrangements Committee Member', 'Dr. V. Radhika', 'Asso. Prof. - BME'),
('organizing', 'Local Arrangements Committee Member', 'Mr. B. Marisekar', 'Asst. Prof. (Sl.G) - EEE'),
('organizing', 'Local Arrangements Committee Member', 'Dr. M. Logaprakash', 'Asst. Prof. (Sl. G) - AIDS'),
('organizing', 'Registration Chair', 'Mrs. S. Jansi Rani', 'Asst. Prof. (Sl.G) - IT'),
('organizing', 'Registration Committee Member', 'Dr. H. Vidhya', 'Asst. Prof. (Sr.G) - EEE'),
('organizing', 'Registration Committee Member', 'Mrs. T. Anitha', 'Asst. Prof. (Sl.G) - EIE'),
('organizing', 'Registration Committee Member', 'Mrs. M. Jaishree', 'Asst. Prof. (Sl.G) - ECE'),
('organizing', 'Registration Committee Member', 'Mrs. R. S. Ramya', 'Asst. Prof. (Sr.G) - CSE'),
('organizing', 'Registration Committee Member', 'Mr. S. Jeevanandham', 'Asst. Prof. (Sr.G) - IT'),
('organizing', 'Registration Committee Member', 'Mrs. L. Divyalakshmi', 'Asst. Prof. (Sl.G) - BME'),
('organizing', 'Conference Pre-Tutorial Sessions Chair', 'Dr. S. P. Vimal', 'Asso. Prof. - ECE'),
('organizing', 'Pre-Tutorial Sessions Committee Member', 'Mrs. B. Kalaimathi', 'Asst. Prof. (Sr.G) - ECE'),
('organizing', 'Pre-Tutorial Sessions Committee Member', 'Dr. A. Vijay', 'Asst. Prof. (Sr.G) - ECE'),
('organizing', 'Pre-Tutorial Sessions Committee Member', 'Mrs. M. Kowsalya', 'Asso. Prof. - ECE & Asst. Prof. (Sr.G) - ECE'),
('organizing', 'Technical Review Committee Convener', 'Dr. R. Shanmugasundaram', 'Professor - EEE'),
('organizing', 'Technical Review Committee Member', 'Dr. K. Balamurugan', 'Asso. Prof. - EEE'),
('organizing', 'Technical Review Committee Member', 'Mr. R. Mohan Kumar', 'Asst. Prof. (Sl.G) - EEE'),
('organizing', 'Technical Review Committee Member', 'Mr. B. Sridhar', 'Asst. Prof. (Sl.G) - EEE'),
('organizing', 'Technical Review Committee Member', 'Dr. M. Kasiselvanathan', 'Asso. Prof. - ECE'),
('organizing', 'Technical Review Committee Member', 'Mr. C. Mathan', 'Asst. Prof. (Sr. G) - EIE'),
('organizing', 'Technical Review Committee Member', 'Dr. P. Mathiyalagan', 'Asso. Prof. - CSE'),
('organizing', 'Technical Review Committee Member', 'Mrs. S. S. Sugantha Mallika', 'Asst. Prof. (Sl.G) - IT'),
('organizing', 'Technical Review Committee Member', 'Dr. M. Jeevitha Priya', 'Asst. Prof. - BME'),
('organizing', 'Outreach and Promotion Committee Convener', 'Dr. M. S. Geetha Devasena', 'Professor - CSE'),
('organizing', 'Outreach and Promotion Committee Member', 'Dr. M. Kalaiarasu', 'Asso. Prof. - IT'),
('organizing', 'Outreach and Promotion Committee Member', 'Dr. R. Kingsy Grace', 'Asso. Prof. - CSE'),
('organizing', 'Outreach and Promotion Committee Member', 'Dr. R. Vijaya Kumar', 'Asst. Prof. (Sl.G) - CSE'),
('organizing', 'Outreach and Promotion Committee Member', 'Mr. C. Praveenkumar', 'Asst. Prof. (Sr.G) - EEE'),
('organizing', 'Outreach and Promotion Committee Member', 'Mrs. R.S. Ramya', 'Asst. Prof. (Sr.G) - CSE'),
('organizing', 'Website and Social Media Promotion Committee Chair', 'Dr. S. Harihara Gopalan', 'Asso. Prof. - CSE'),
('organizing', 'Website and Social Media Promotion Committee Member', 'Mr. K. Robin Johny', 'Asst. Prof. (Sr.G) - AERO'),
('organizing', 'Website and Social Media Promotion Committee Member', 'Mr. R. S. Vishnudurai', 'Asst. Prof. (Sr.G) - CSE'),
('organizing', 'Website and Social Media Promotion Committee Member', 'Dr. A. Vijay', 'Asst. Prof. (Sr. G) - ECE'),
('organizing', 'Hospitality Committee Convener', 'Dr. P. Perumal', 'Professor - CSE'),
('organizing', 'Hospitality Committee Member', 'Dr. B. Mathivanan', 'Asso. Prof. - CSE'),
('organizing', 'Hospitality Committee Member', 'Dr. M. Nagarajapandian', 'Asst. Prof. (Sl.G) - EIE'),
('organizing', 'Hospitality Committee Member', 'Mr. V. Krishna Kumar', 'Asst. Prof. (Sl.G) - CSE'),
('organizing', 'Hospitality Committee Member', 'Dr. N. Suresh Kumar', 'Asso. Prof. - IT'),
('organizing', 'Hospitality Committee Member', 'Dr. P. Sebastian Vindro Jude', 'Asst. Prof. (Sl.G) - EEE'),
('advisory', null, 'Dr. Saifur Rahman', 'Virginia Tech, USA (IEEE President 2023)'),
('advisory', null, 'Dr. Ramesh Bansal', 'University of Sharjah, Sharjah, UAE'),
('advisory', null, 'Dr. Frede Blaabjerg', 'Aalborg University, Denmark'),
('advisory', null, 'Dr. Subhransu Sekhar Dash', 'Professor, SRM Institute, India'),
('advisory', null, 'Dr. Vincenzo Piuri', 'University of Milan, Italy'),
('technical', null, 'Dr. B. Chitti Babu', 'IIITD&M Kancheepuram, India'),
('technical', null, 'Dr. P. Karuppanan', 'MNNIT Allahabad, India'),
('technical', null, 'Dr. S. K. Patnaik', 'Anna University, Chennai, India'),
('technical', null, 'Dr. R. Harikumar', 'GCT Coimbatore, India');

-- Seed Data: Insert speakers
INSERT INTO speakers (name, title, role, talk, color) VALUES
('Dr. Saifur Rahman', 'Professor, Virginia Tech, USA', 'Former IEEE President & CEO (2023)', 'AI Integration in Modern Clean Energy Microgrids', '#0f52ba'),
('Dr. Frede Blaabjerg', 'Professor, Aalborg University, Denmark', 'Highly Cited Researcher & Power Electronics Pioneer', 'Reliability and Grid Integration of Power Electronics', '#06b6d4'),
('Dr. Rajkumar Buyya', 'Professor, University of Melbourne, Australia', 'Director, Cloud Computing and Distributed Systems Lab', 'Cognitive Cloud-Edge Computing for IoT Applications', '#f58220');

-- Seed Data: Insert important dates
INSERT INTO important_dates (title, event_date, "desc", sort_order) VALUES
('Full Paper Submission Opens', 'October 15, 2026', 'All draft manuscripts to be uploaded via CMT portal.', 1),
('Paper Submission Deadline', 'December 20, 2026', 'Final extension date for submissions.', 2),
('Acceptance Notification', 'January 25, 2027', 'Peer review comments and status delivered to corresponding author.', 3),
('Camera Ready Submission & Registration', 'February 20, 2027', 'Final camera-ready version submission and author fee payment.', 4),
('Pre-Conference Workshops', 'April 03, 2027', 'Hands-on intensive masterclasses on campus.', 5),
('Conference Dates', 'April 04 & 05, 2027', 'Inaugural speeches, technical sessions, and networking dinner.', 6);

-- Seed Data: Insert workshops
INSERT INTO workshops (title, instructor, duration, price, details) VALUES
('AI-Driven IoT in Smart Grids', 'Dr. Ramesh Bansal, University of Sharjah, UAE', 'Full Day (9:00 AM - 4:00 PM)', 'INR 1,000 / USD 40', 'This workshop provides a complete hands-on framework to integrate machine learning models on edge IoT nodes designed for smart meter analytics, solar microgrid forecasting, and grid load management.'),
('Next-Gen VLSI Design Flow & Verification', 'Industry Leads, Synopsys / SREC EDA Lab Coordinators', 'Full Day (9:30 AM - 4:30 PM)', 'INR 1,250 / USD 50', 'Explore advanced ASIC synthesis pipelines using industry standard electronic design automation (EDA) tools. Topics include functional coverage, RTL simulation methodologies, and formal verification.');

-- Seed Data: Insert registration fees for displaying in tables
INSERT INTO registration_fees (member_type, inr_reg, inr_early, usd_phys_reg, usd_phys_early, usd_virt_reg, usd_virt_early, sort_order) VALUES
('Student & Scholar (Conference Only)', '7,000', '6,000', '200', '175', '125', '100', 1),
('Student & Scholar (Conf + Tutorial)', '7,500', '6,500', '225', '200', '150', '125', 2),
('Professionals (Conference Only)', '8,000', '7,000', '250', '225', '175', '150', 3),
('Professionals (Conf + Tutorial)', '8,500', '7,500', '300', '275', '225', '200', 4);

-- Seed Data: Insert stats
INSERT INTO stats (number, label, sort_order) VALUES
('17', 'Trust Institutions', 1),
('30+', 'Years Excellence', 2),
('12+', 'UG Programmes', 3),
('7+', 'PG Programmes', 4);

-- Seed Data: Insert coordinators
INSERT INTO coordinators (name, role, phone, sort_order) VALUES
('Dr. M. Jagadeeswari', 'Publications Coordinator', '+91 94435 56903', 1),
('Dr. A. Grace Selvarani', 'Technical Program Coordinator', '+91 98427 12604', 2);

-- Seed Data: Insert registration pricing configuration (for the calculator)
INSERT INTO registration_pricing (key, value, currency) VALUES
-- Indian Student Fees
('base_conf_student_ieee_inr', 6000, 'INR'),
('base_conf_student_non_ieee_inr', 7000, 'INR'),
('base_tut_student_ieee_inr', 1000, 'INR'),
('base_tut_student_non_ieee_inr', 1250, 'INR'),
('base_both_student_ieee_inr', 6500, 'INR'),
('base_both_student_non_ieee_inr', 7500, 'INR'),
('base_listener_student_ieee_inr', 3500, 'INR'),
('base_listener_student_non_ieee_inr', 5000, 'INR'),

-- Indian Professional Fees
('base_conf_prof_ieee_inr', 7000, 'INR'),
('base_conf_prof_non_ieee_inr', 8000, 'INR'),
('base_tut_prof_ieee_inr', 1250, 'INR'),
('base_tut_prof_non_ieee_inr', 1500, 'INR'),
('base_both_prof_ieee_inr', 7500, 'INR'),
('base_both_prof_non_ieee_inr', 8500, 'INR'),
('base_listener_prof_ieee_inr', 4500, 'INR'),
('base_listener_prof_non_ieee_inr', 6000, 'INR'),

-- Indian Modifiers
('add_paper_inr', 3000, 'INR'),
('extra_page_inr', 500, 'INR'),
('late_penalty_inr', 1000, 'INR'),
('virtual_addon_inr', 1000, 'INR'),
('workshop_addon_inr', 500, 'INR'),

-- International Student Fees
('base_conf_student_ieee_usd', 150, 'USD'),
('base_conf_student_non_ieee_usd', 200, 'USD'),
('base_tut_student_ieee_usd', 40, 'USD'),
('base_tut_student_non_ieee_usd', 50, 'USD'),
('base_both_student_ieee_usd', 175, 'USD'),
('base_both_student_non_ieee_usd', 225, 'USD'),

-- International Professional Fees
('base_conf_prof_ieee_usd', 200, 'USD'),
('base_conf_prof_non_ieee_usd', 250, 'USD'),
('base_tut_prof_ieee_usd', 50, 'USD'),
('base_tut_prof_non_ieee_usd', 75, 'USD'),
('base_both_prof_ieee_usd', 225, 'USD'),
('base_both_prof_non_ieee_usd', 300, 'USD'),

-- International Modifiers
('add_paper_usd', 50, 'USD'),
('extra_page_usd', 20, 'USD'),
('late_penalty_usd', 25, 'USD'),
('virtual_addon_usd', 25, 'USD'),
('workshop_addon_usd', 10, 'USD');

-- Seed Data: Insert general conference settings
INSERT INTO conference_info (key, value) VALUES
('about_trust', 'SNR Sons Charitable Trust was founded in the year 1970 by the illustrious sons of Sri. S. N. Rangasamy Naidu namely, Late Sri Chinnasamy Naidu, Late Sri. P. R. Ramaswami Naidu, Sri. R. Doraiswami Naidu and Sevaratna Dr. R. Venkatesalu Naidu. Being an ardent devotee of Sri Ramakrishna Paramahamsa, all the institutions started by the Trust bear the name of the Holy Sage ''Sri Ramakrishna''. Following the Principles of Sri Ramakrishna Paramahamsa''s Philosophy of ''God through man'', the Trust successfully runs 15 organisations significantly catering to social causes of society focusing on Health Care, Education and Service.'),
('about_institution', 'Sri Ramakrishna Engineering College (SREC), Coimbatore, established in the year 1994 by SNR Sons Charitable Trust, is one of the 17 institutions managed by the trust. SREC is an autonomous institution offering 12 Undergraduate programmes and 7 Post Graduate programmes in Engineering and Technology, in addition to MBA. The college stands as a beacon of academic excellence in Southern India, fostering character development alongside high-quality engineering training.'),
('countdown_target', '2027-04-04T09:00:00'),
('event_date_display', 'April 04 & 05, 2027'),
('event_location_display', 'Sri Ramakrishna Engineering College, Coimbatore, Tamilnadu, India.'),
('cmt_id', 'aectsd2027'),
('cmt_link', 'https://cmt3.research.microsoft.com/'),
('bank_account_name', 'Sri Ramakrishna Engineering College - AECTSD'),
('bank_name', 'ICICI Bank, Coimbatore'),
('bank_account_number', '058705008310'),
('bank_ifsc_code', 'ICIC0000587'),
('bank_branch_location', 'SREC Campus Branch, Coimbatore'),
('bank_important_note', 'Please include your Paper ID in the payment reference. Once the wire transfer transaction completes successfully, authors are requested to upload the scanned payment receipt copy in the registration form below.'),
('secretariat_address', 'Department of EEE / ECE,\nSri Ramakrishna Engineering College,\nVattamalaipalayam, N.G.G.O Colony Post,\nCoimbatore, Tamilnadu - 641022, India.'),
('secretariat_email', 'aectsd2027@srec.ac.in'),
('secretariat_phone', '+91 (422) 2461588 / 2460088'),
('logo_title', 'SRI RAMAKRISHNA'),
('logo_subtitle', 'Engineering College'),
('logo_tagline', 'Elegance & Excellence'),
('nav_home', 'Home'),
('nav_about', 'About Us'),
('nav_committee', 'Committee'),
('nav_speakers', 'Speakers'),
('nav_call_for_papers', 'Call For Papers'),
('nav_important_dates', 'Important Dates'),
('nav_workshops', 'Workshops'),
('nav_guidelines', 'Guidelines'),
('nav_paper_submission', 'Paper Submission'),
('nav_registration', 'Registration'),
('nav_contact_us', 'Contact Us'),
('hero_title', 'AECTSD 2027'),
('hero_subtitle', 'INTERNATIONAL CONFERENCE ON ADVANCED ELECTRONICS, COMMUNICATION, TRUST, SECURITY AND DEVICES'),
('hero_countdown_title', 'Countdown to Conference Launch'),
('hero_btn_submit', 'Submit Your Paper'),
('hero_btn_register', 'Calculate & Register'),
('about_badge', 'About SREC'),
('about_title', 'The Trust & Institution'),
('about_card_conf_title', 'SNR Sons Charitable Trust'),
('about_card_inst_title', 'Sri Ramakrishna Engineering College'),
('committee_badge', 'Leadership'),
('committee_title', 'Organizing & Advisory Committees'),
('committee_tab_org', 'Organizing Committee'),
('committee_tab_adv', 'Advisory Committee'),
('committee_tab_tech', 'Technical Program'),
('speakers_badge', 'Experts'),
('speakers_title', 'Keynote Speakers'),
('speakers_keynote_label', 'Keynote Address'),
('cfp_badge', 'Organizing Departments'),
('cfp_title', 'Academic Departments'),
('cfp_desc', 'AECTSD 2027 is jointly organized by the leading departments of Sri Ramakrishna Engineering College, representing cutting-edge fields in engineering, computational research, and biological instrumentation.'),
('cfp_btn_word', 'Download MS Word Template'),
('cfp_btn_latex', 'Download LaTeX Template'),
('dates_badge', 'Timeline'),
('dates_title', 'Important Dates'),
('workshops_badge', 'Co-Events'),
('workshops_title', 'Pre-Conference Tutorials'),
('workshops_desc', 'Expand your skills with pre-conference tutorials led by expert academic and industry speakers on April 3, 2027. Certificates will be awarded.'),
('workshops_btn_reg', 'Register for Tutorial'),
('guidelines_badge', 'Guidelines'),
('guidelines_title', 'Registration Guidelines'),
('guidelines_sub1', 'Registration Policies'),
('guidelines_sub2', 'Publication & Proceedings'),
('guidelines_bullets_formatting', 'At least one of the authors of each accepted paper must register for the conference for the paper to be included in the conference proceedings.
Full registration includes the registration of one paper. Additional papers for a single registration come with an additional fee.
The maximum length of the paper is 6 pages including figures, tables, and references.
A fee of Rs. 500 (or USD 20) will be applied for each additional page (with a maximum of 2 pages).'),
('guidelines_bullets_presentation', 'All accepted and presented papers of AECTSD 2027 will be forwarded for possible inclusion in the IEEE Xplore digital library.
Registration fee covers admission to all sessions, publishing costs, welcome reception, conference kit, refreshments, working lunches, banquet dinner, and a half-a-day tour to nearby places.
Only presented papers will be recommended for technical indexing in IEEE Xplore.'),
('submission_badge', 'Portal'),
('submission_title', 'Paper Submission'),
('submission_card_title', 'Submit via Microsoft CMT'),
('submission_card_desc', 'Ready to submit your findings? Authors are requested to submit draft manuscripts via the Microsoft CMT online conference submission portal. Please ensure all author details are removed if a double-blind peer review is requested.'),
('submission_btn_cmt', 'Go to CMT Submission Portal'),
('reg_badge', 'Fees'),
('reg_title', 'Conference Registration'),
('reg_table_header_member', 'Delegate Category'),
('reg_table_header_indian', 'Indian delegates (in Rupees)'),
('reg_table_header_foreign', 'Foreign delegates (in US Dollars)'),
('reg_table_header_foreign_note', '*Virtual mode option is available for registration fees.'),
('reg_table_header_regular', 'Regular'),
('reg_table_header_early', 'Early bird'),
('reg_table_header_physical', 'Physical Mode'),
('reg_table_header_virtual', 'Virtual Mode'),
('reg_notice_non_presenter', '*Indian Non-Author Attendees: Students = Rs.3500 (Non-IEEE: Rs.5000) | Professionals = Rs.4500 (Non-IEEE: Rs.6000)'),
('reg_notice_certificate', '"Early bird discounts: INR 1000 / USD 25 on conference fees. Penalty for late registration (from Nov 1, 2026) is INR 1000 / USD 25."'),
('reg_link_label', 'Payment Mode & Instructions:'),
('reg_btn_click', 'Calculate & Pay Below'),
('reg_bank_title', 'Bank Account Details'),
('reg_bank_desc', 'Please find the official banking channels to process registration fees. Bank transfer references must include your Paper ID.'),
('reg_bank_label_acc_name', 'Account Name'),
('reg_bank_label_bank_name', 'Bank Name'),
('reg_bank_label_acc_num', 'Account Number'),
('reg_bank_label_ifsc', 'IFSC Code'),
('reg_bank_label_branch', 'Branch Location'),
('reg_bank_important_note_label', 'Important Note'),
('contact_badge', 'Connect'),
('contact_title', 'Contact Us'),
('contact_form_title', 'Send Us a Message'),
('contact_form_success_title', 'Message Sent Successfully!'),
('contact_form_success_desc', 'Thank you for reaching out. A coordinator will get back to you shortly.'),
('contact_form_label_name', 'Your Name'),
('contact_form_label_email', 'Email Address'),
('contact_form_label_subject', 'Subject'),
('contact_form_label_message', 'Message'),
('contact_form_btn_send', 'Send Message'),
('contact_form_placeholder_name', 'Enter full name'),
('contact_form_placeholder_email', 'Enter email address'),
('contact_form_placeholder_subject', 'How can we help?'),
('contact_form_placeholder_message', 'Type details here...'),
('contact_sec_title', 'Organizing Secretariat'),
('contact_coord_title', 'Conference Coordinators'),
('footer_copyright', '© 2027 Sri Ramakrishna Engineering College. All Rights Reserved.'),
('footer_sponsor', 'Technical Co-sponsored by IEEE Section. Managed by SNR Sons Charitable Trust.'),
('label_days', 'Days'),
('label_hours', 'Hours'),
('label_mins', 'Mins'),
('label_secs', 'Secs'),
('workshop_label', 'Tutorial'),
('label_lead_instructor', 'Lead Instructor:'),
('label_fee', 'Price:'),
('label_conf_id', 'Conference ID:'),
('alert_download_word', 'Downloading AECTSD Word Template Package...'),
('alert_download_latex', 'Downloading AECTSD LaTeX Template Package...'),
('alert_registration', 'Scroll down to use the interactive Registration Calculator and Payment submission form.');

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
('about_coimbatore_tour_info', 'Half-a-day tour will be arranged to visit nearest site seeing places based on number of participant’s registered for tour.')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

-- Seed tourist places
INSERT INTO tourist_places (name, category, description, sort_order) VALUES
('Isha Yoga Center - Dhyanalinga and Adiyogi Statue', 'Religious site', 'Features the magnificent 112-foot Adiyogi Shiva bust, a world-renowned spiritual destination.', 1),
('Dhyanalinga Temple', 'Religious site', 'A unique meditative space located at the foothills of Velliangiri Mountains offering a peaceful, spiritual atmosphere.', 2),
('Marudamalai Temple', 'Religious site', 'An ancient hilltop temple dedicated to Lord Murugan, offering scenic views of the city and surroundings.', 3),
('Kovai Kutralam Water Falls', 'Nature / Scenic', 'Beautiful, serene waterfalls nestled in the Siruvani hills, famous for its refreshing natural streams.', 4),
('Brookefields Mall', 'Shopping / Entertainment', 'A modern, prime shopping mall in Coimbatore offering global brands, food courts, and multiplex theatres.', 5),
('Black Thunder Theme Park', 'Amusement Park', 'A massive, thrilling water theme park situated at the foot of Nilgiris near Mettupalayam.', 6),
('Eachanari Vinayagar Temple', 'Religious site', 'A historic temple dedicated to Lord Ganesha, famous for its grand 6-foot tall idol and architecture.', 7),
('Kovai Kondattam', 'Amusement Park', 'An eco-friendly amusement park situated on Siruvani Main Road, perfect for family entertainment.', 8),
('Horticulture Farms, Kallar', 'Nature / Botanical', 'Lush state horticultural farm near Mettupalayam showcasing diverse fruit varieties and rare plants.', 9);

-- Seed weekend stays
INSERT INTO weekend_stays (name, category, description, sort_order) VALUES
('Ooty Hill Station (Udhagamandalam)', 'Hill Station', 'The legendary Queen of Hill Stations, famous for its tea estates, Nilgiri Mountain Railway, and botanical gardens.', 1),
('Coonoor Hill Station', 'Hill Station', 'A quieter Nilgiri retreat famous for Sim’s Park, dolphin’s nose viewpoints, and panoramic tea valley walks.', 2),
('Valparai Hill Station', 'Hill Station', 'A pristine, misty hill station surrounded by tea plantations and rich wildlife in the Western Ghats.', 3),
('Munnar Hill Station', 'Hill Station', 'Famous destination in nearby Kerala boasting vast rolling tea estates, waterfalls, and scenic mist-filled peaks.', 4),
('Athirapally Waterfalls', 'Nature / Scenic', 'A majestic 80-foot waterfall in Kerala, often referred to as the Niagara of India, surrounded by green rainforests.', 5),
('Kodaikanal Hill Station', 'Hill Station', 'The Princess of Hill Stations, renowned for its star-shaped lake, pine forests, and cool mountain air.', 6),
('Topslip Anamalai Tiger Reserve', 'Wildlife Sanctuary / Nature', 'A famous national park and tiger reserve rich in biodiversity, offering elephant rides and forest safaris.', 7);

-- Seed hotels
INSERT INTO hotels_to_stay (name, category, address, description, map_url, sort_order) VALUES
-- Luxury Hotels
('Vivanta', 'Luxury Hotels', 'Race Course Road, Coimbatore', '5-star luxury hotel in the heart of Coimbatore featuring premium amenities and dining.', 'https://maps.google.com/?q=Vivanta+Coimbatore', 1),
('The Residency Towers', 'Luxury Hotels', 'Avinashi Road, Coimbatore', 'Highly rated premium business hotel offering deluxe suites and wellness centers.', 'https://maps.google.com/?q=The+Residency+Towers+Coimbatore', 2),
('Le Meridien', 'Luxury Hotels', 'Neelambur, Coimbatore', 'Luxurious 5-star hotel with grand event spaces near the international airport.', 'https://maps.google.com/?q=Le+Meridien+Coimbatore', 3),
('Radisson Blu', 'Luxury Hotels', 'Avinashi Road, Coimbatore', 'Upscale modern business hotel featuring a roof-top pool and fine dining.', 'https://maps.google.com/?q=Radisson+Blu+Coimbatore', 4),
('Hash Six Hotel', 'Luxury Hotels', 'Saibaba Colony, Coimbatore', 'Sleek luxury hotel offering exceptional boutique rooms, dining, and hospitality.', 'https://maps.google.com/?q=Hash+Six+Hotel+Coimbatore', 5),
('Lemon Tree Hotel', 'Luxury Hotels', 'Avinashi Road, Coimbatore', 'Vibrant upscale business hotel located strategically near key commercial hubs.', 'https://maps.google.com/?q=Lemon+Tree+Hotel+Coimbatore', 6),
-- Mid-Range Hotels
('Hotel CAG Pride', 'Mid-Range Hotels', 'Gandhipuram, Coimbatore', 'Respected corporate hotel offering warm hospitality, comfortable stays, and quality dining.', 'https://maps.google.com/?q=Hotel+CAG+Pride+Coimbatore', 7),
('City Tower', 'Mid-Range Hotels', 'Gandhipuram, Coimbatore', 'Classic business hotel offering spacious rooms, convenient location, and prompt services.', 'https://maps.google.com/?q=City+Tower+Coimbatore', 8),
('Hotel Alankar', 'Mid-Range Hotels', 'Gandhipuram, Coimbatore', 'Comfortable business hotel famous for its cozy accommodation and multi-cuisine restaurant.', 'https://maps.google.com/?q=Hotel+Alankar+Coimbatore', 9),
('Fairfield by Marriott', 'Mid-Range Hotels', 'Avinashi Road, Coimbatore', 'Contemporary comfort and business amenities situated close to Coimbatore Airport.', 'https://maps.google.com/?q=Fairfield+by+Marriott+Coimbatore', 10),
('Welcomhotel (ITC Hotels)', 'Mid-Range Hotels', 'Race Course, Coimbatore', 'Premium heritage-themed hotel offering top-class dining, wellness, and stay experiences.', 'https://maps.google.com/?q=Welcomhotel+Coimbatore', 11),
('Hotel KISCOL Grands', 'Mid-Range Hotels', 'Ramnagar, Coimbatore', 'Modern, high-comfort hotel featuring premium facilities in the central business area.', 'https://maps.google.com/?q=Hotel+KISCOL+Grands+Coimbatore', 12),
('Rathna Residency', 'Mid-Range Hotels', 'Town Hall, Coimbatore', 'Centrally located business hotel renowned for its cozy environment and great hospitality.', 'https://maps.google.com/?q=Rathna+Residency+Coimbatore', 13),
('Hotel Vijay Park Inn', 'Mid-Range Hotels', 'Ramnagar, Coimbatore', 'Affordable business hotel offering neat accommodation, conference halls, and dining.', 'https://maps.google.com/?q=Hotel+Vijay+Park+Inn+Coimbatore', 14),
-- Budget-Friendly Hotels
('Sri Aarvee Hotels', 'Budget-Friendly Hotels', 'Gandhipuram, Coimbatore', 'Value-for-money hotel providing essential comforts and prime accessibility.', 'https://maps.google.com/?q=Sri+Aarvee+Hotels+Coimbatore', 15),
('Zone by The Park', 'Budget-Friendly Hotels', 'Avinashi Road, Coimbatore', 'Trendy, social hotel offering active spaces, smart amenities, and neat rooms.', 'https://maps.google.com/?q=Zone+by+The+Park+Coimbatore', 16),
('Hotel Jothi Grand', 'Budget-Friendly Hotels', 'Near KCT, Saravanampatti, Coimbatore', 'Pocket-friendly hotel near IT parks and educational institutions in Saravanampatti.', 'https://maps.google.com/?q=Hotel+Jothi+Grand+Coimbatore', 17);

-- 13. Restore necessary permissions to API gateway roles (anon, authenticated, service_role)
-- Dropping and recreating the public schema revokes default permissions for these roles.
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO anon, authenticated, service_role;


