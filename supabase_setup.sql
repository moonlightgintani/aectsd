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
('about_coimbatore_tour_info', 'Half-a-day tour will be arranged to visit nearest site seeing places based on number of participant’s registered for tour.')
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

-- 13. Restore necessary permissions to API gateway roles (anon, authenticated, service_role)
-- Dropping and recreating the public schema revokes default permissions for these roles.
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO anon, authenticated, service_role;


