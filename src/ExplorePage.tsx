import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen,
  Award,
  MapPin,
  ExternalLink,
  Plus,
  Save,
  Sparkles
} from 'lucide-react';
import { supabase, isSupabaseConfigured } from './supabaseClient';

export interface TouristPlace {
  id?: any;
  name: string;
  category: string;
  description: string;
  image_url?: string;
  map_url?: string;
  sort_order?: number;
}

export interface WeekendStay {
  id?: any;
  name: string;
  category: string;
  description: string;
  image_url?: string;
  map_url?: string;
  sort_order?: number;
}

export interface HotelToStay {
  id?: any;
  name: string;
  category: string;
  address: string;
  description: string;
  map_url: string;
  image_url?: string;
  sort_order?: number;
}

export default function ExplorePage({ adminUser }: { adminUser: string | null }) {
  const [touristPlaces, setTouristPlaces] = useState<TouristPlace[]>([]);
  const [weekendStays, setWeekendStays] = useState<WeekendStay[]>([]);
  const [hotels, setHotels] = useState<HotelToStay[]>([]);
  const [info, setInfo] = useState<Record<string, string>>({});

  const [activeHotelTab, setActiveHotelTab] = useState<string>('Luxury Hotels');
  const [activeSightCategory, setActiveSightCategory] = useState<string>('All');

  // Dashboard category and item selection states
  const [activeCategory, setActiveCategory] = useState<'sights' | 'getaways' | 'hotels'>('sights');
  const [selectedId, setSelectedId] = useState<any>(null);

  // Travel Toolkit states
  const [toolkitTab, setToolkitTab] = useState<'weather' | 'planner' | 'tips'>('weather');
  const [selectedPlannerPlaces, setSelectedPlannerPlaces] = useState<string[]>([]);

  useEffect(() => {
    if (activeCategory === 'sights' && touristPlaces.length > 0) {
      setSelectedId(touristPlaces[0].id || touristPlaces[0].name);
    } else if (activeCategory === 'getaways' && weekendStays.length > 0) {
      setSelectedId(weekendStays[0].id || weekendStays[0].name);
    } else if (activeCategory === 'hotels' && hotels.length > 0) {
      setSelectedId(hotels[0].id || hotels[0].name);
    }
  }, [activeCategory, touristPlaces, weekendStays, hotels]);

  // Admin tabs inside Explore component
  const [adminTab, setAdminTab] = useState<'view' | 'tourist_places' | 'hotels'>('view');

  // CRUD editing states
  const [editingTouristPlace, setEditingTouristPlace] = useState<any | null>(null);
  const [editingWeekendStay, setEditingWeekendStay] = useState<any | null>(null);
  const [editingHotel, setEditingHotel] = useState<any | null>(null);

  const fetchDbData = async () => {
    // 1. Fetch from Local Storage first
    const localTourist = localStorage.getItem('srec_offline_tourist_places');
    if (localTourist) setTouristPlaces(JSON.parse(localTourist));

    const localWeekend = localStorage.getItem('srec_offline_weekend_stays');
    if (localWeekend) setWeekendStays(JSON.parse(localWeekend));

    const localHotels = localStorage.getItem('srec_offline_hotels');
    if (localHotels) setHotels(JSON.parse(localHotels));

    const localInfo = localStorage.getItem('srec_offline_info');
    if (localInfo) {
      try {
        const parsedInfo = JSON.parse(localInfo);
        setInfo(prev => ({ ...prev, ...parsedInfo }));
      } catch (e) {
        console.warn("Offline info parse failed", e);
      }
    }

    // 2. Fetch from Supabase if online
    if (!isSupabaseConfigured || !supabase) return;

    try {
      const { data: touristData, error: errTourist } = await supabase
        .from('tourist_places')
        .select('*')
        .order('sort_order');
      if (!errTourist && touristData) {
        setTouristPlaces(touristData);
        localStorage.setItem('srec_offline_tourist_places', JSON.stringify(touristData));
      }

      const { data: weekendData, error: errWeekend } = await supabase
        .from('weekend_stays')
        .select('*')
        .order('sort_order');
      if (!errWeekend && weekendData) {
        setWeekendStays(weekendData);
        localStorage.setItem('srec_offline_weekend_stays', JSON.stringify(weekendData));
      }

      const { data: hotelsData, error: errHotels } = await supabase
        .from('hotels_to_stay')
        .select('*')
        .order('sort_order');
      if (!errHotels && hotelsData) {
        setHotels(hotelsData);
        localStorage.setItem('srec_offline_hotels', JSON.stringify(hotelsData));
      }

      const { data: infoData, error: errInfo } = await supabase
        .from('conference_info')
        .select('*');
      if (!errInfo && infoData) {
        const infoMap: Record<string, string> = {};
        infoData.forEach((row: any) => {
          infoMap[row.key] = row.value;
        });
        setInfo(prev => ({ ...prev, ...infoMap }));
        localStorage.setItem('srec_offline_info', JSON.stringify(infoMap));
      }
    } catch (err) {
      console.warn('Failed to load online data for ExplorePage.', err);
    }
  };

  useEffect(() => {
    fetchDbData();
  }, []);

  // CRUD Handlers
  const handleSaveTouristPlace = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTouristPlace) return;
    try {
      const dataToSave = {
        name: editingTouristPlace.name,
        category: editingTouristPlace.category,
        description: editingTouristPlace.description,
        image_url: editingTouristPlace.image_url || '',
        map_url: editingTouristPlace.map_url || '',
        sort_order: Number(editingTouristPlace.sort_order || 0)
      };

      if (isSupabaseConfigured && supabase) {
        let error;
        if (editingTouristPlace.id) {
          const res = await supabase.from('tourist_places').update(dataToSave).eq('id', editingTouristPlace.id);
          error = res.error;
        } else {
          const res = await supabase.from('tourist_places').insert(dataToSave);
          error = res.error;
        }
        if (error) throw error;
      } else {
        let list = [...touristPlaces];
        if (editingTouristPlace.id) {
          list = list.map(t => t.id === editingTouristPlace.id ? editingTouristPlace : t);
        } else {
          list.push({ ...editingTouristPlace, id: Date.now() });
        }
        localStorage.setItem('srec_offline_tourist_places', JSON.stringify(list));
      }
      setEditingTouristPlace(null);
      await fetchDbData();
    } catch (err: any) {
      console.error('Save tourist place failed:', err);
      alert('Save tourist place failed: ' + (err.message || err));
    }
  };

  const handleDeleteTouristPlace = async (id: any) => {
    if (!window.confirm('Are you sure you want to delete this tourist place?')) return;
    try {
      if (isSupabaseConfigured && supabase) {
        const { error } = await supabase.from('tourist_places').delete().eq('id', id);
        if (error) throw error;
      } else {
        const list = touristPlaces.filter(t => t.id !== id);
        localStorage.setItem('srec_offline_tourist_places', JSON.stringify(list));
      }
      await fetchDbData();
    } catch (err: any) {
      console.error('Delete tourist place failed:', err);
      alert('Delete tourist place failed: ' + (err.message || err));
    }
  };

  const handleSaveWeekendStay = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingWeekendStay) return;
    try {
      const dataToSave = {
        name: editingWeekendStay.name,
        category: editingWeekendStay.category,
        description: editingWeekendStay.description,
        image_url: editingWeekendStay.image_url || '',
        map_url: editingWeekendStay.map_url || '',
        sort_order: Number(editingWeekendStay.sort_order || 0)
      };

      if (isSupabaseConfigured && supabase) {
        let error;
        if (editingWeekendStay.id) {
          const res = await supabase.from('weekend_stays').update(dataToSave).eq('id', editingWeekendStay.id);
          error = res.error;
        } else {
          const res = await supabase.from('weekend_stays').insert(dataToSave);
          error = res.error;
        }
        if (error) throw error;
      } else {
        let list = [...weekendStays];
        if (editingWeekendStay.id) {
          list = list.map(s => s.id === editingWeekendStay.id ? editingWeekendStay : s);
        } else {
          list.push({ ...editingWeekendStay, id: Date.now() });
        }
        localStorage.setItem('srec_offline_weekend_stays', JSON.stringify(list));
      }
      setEditingWeekendStay(null);
      await fetchDbData();
    } catch (err: any) {
      console.error('Save weekend stay failed:', err);
      alert('Save weekend stay failed: ' + (err.message || err));
    }
  };

  const handleDeleteWeekendStay = async (id: any) => {
    if (!window.confirm('Are you sure you want to delete this weekend stay?')) return;
    try {
      if (isSupabaseConfigured && supabase) {
        const { error } = await supabase.from('weekend_stays').delete().eq('id', id);
        if (error) throw error;
      } else {
        const list = weekendStays.filter(s => s.id !== id);
        localStorage.setItem('srec_offline_weekend_stays', JSON.stringify(list));
      }
      await fetchDbData();
    } catch (err: any) {
      console.error('Delete weekend stay failed:', err);
      alert('Delete weekend stay failed: ' + (err.message || err));
    }
  };

  const handleSaveHotel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingHotel) return;
    try {
      const dataToSave = {
        name: editingHotel.name,
        category: editingHotel.category,
        address: editingHotel.address,
        description: editingHotel.description,
        map_url: editingHotel.map_url,
        image_url: editingHotel.image_url || '',
        sort_order: Number(editingHotel.sort_order || 0)
      };

      if (isSupabaseConfigured && supabase) {
        let error;
        if (editingHotel.id) {
          const res = await supabase.from('hotels_to_stay').update(dataToSave).eq('id', editingHotel.id);
          error = res.error;
        } else {
          const res = await supabase.from('hotels_to_stay').insert(dataToSave);
          error = res.error;
        }
        if (error) throw error;
      } else {
        let list = [...hotels];
        if (editingHotel.id) {
          list = list.map(h => h.id === editingHotel.id ? editingHotel : h);
        } else {
          list.push({ ...editingHotel, id: Date.now() });
        }
        localStorage.setItem('srec_offline_hotels', JSON.stringify(list));
      }
      setEditingHotel(null);
      await fetchDbData();
    } catch (err: any) {
      console.error('Save hotel failed:', err);
      alert('Save hotel failed: ' + (err.message || err));
    }
  };

  const handleDeleteHotel = async (id: any) => {
    if (!window.confirm('Are you sure you want to delete this hotel?')) return;
    try {
      if (isSupabaseConfigured && supabase) {
        const { error } = await supabase.from('hotels_to_stay').delete().eq('id', id);
        if (error) throw error;
      } else {
        const list = hotels.filter(h => h.id !== id);
        localStorage.setItem('srec_offline_hotels', JSON.stringify(list));
      }
      await fetchDbData();
    } catch (err: any) {
      console.error('Delete hotel failed:', err);
      alert('Delete hotel failed: ' + (err.message || err));
    }
  };

  // Animation variants
  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }
    }
  };

  return (
    <div className="explore-container" style={{ padding: 'calc(8rem + var(--banner-height, 0px)) 1.5rem 6rem', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
      <style dangerouslySetInnerHTML={{
        __html: `
        .card-image-zoom {
          transition: transform 0.5s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .glass-card:hover .card-image-zoom,
        div:hover > div > .card-image-zoom {
          transform: scale(1.06);
        }
        
        /* Overhaul the Explore Page style */
        .explore-hero {
          position: relative;
          border-radius: 1.5rem;
          overflow: hidden;
          padding: clamp(2.5rem, 6vw, 4.5rem) clamp(1.5rem, 4vw, 2.5rem);
          text-align: center;
          margin-bottom: 3.5rem;
          background: linear-gradient(135deg, #091d36 0%, #1e293b 100%);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.05);
          color: #ffffff !important;
        }
        .explore-hero h2 {
          color: #ffffff !important;
        }
        .explore-hero-title {
          font-size: clamp(2rem, 5vw, 3.2rem);
          font-weight: 800;
          color: #ffffff !important;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin: 0;
        }
        .explore-card {
          padding: 0;
          display: flex;
          flex-direction: column;
          text-align: left;
          height: 100%;
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 1.25rem;
          overflow: hidden;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.03);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .explore-card:hover {
          transform: translateY(-6px);
          box-shadow: 0 20px 30px rgba(0, 0, 0, 0.08);
          border-color: #3b82f6;
        }
        .explore-card-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.5s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .explore-card:hover .explore-card-img {
          transform: scale(1.08);
        }
        .filter-tabs-container {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
          justify-content: center;
          margin-top: 1rem;
        }
        .filter-tab-btn {
          font-size: 0.85rem;
          padding: 0.5rem 1.25rem;
          border-radius: 2rem;
          cursor: pointer;
          font-weight: 600;
          transition: all 0.2s ease;
        }
        .hotel-tab-btn {
          flex: 1;
          min-width: 120px;
          border: none;
          padding: 0.7rem 1rem;
          border-radius: 0.5rem;
          font-size: 0.85rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s ease;
          text-align: center;
        }
        
        @media (max-width: 768px) {
          .explore-container {
            padding: calc(5rem + var(--banner-height, 0px)) 1rem 4rem !important;
          }
          .explore-hero {
            padding: 3rem 1.5rem;
            margin-bottom: 2rem;
          }
          .explore-grid {
            grid-template-columns: 1fr !important;
            gap: 1.5rem !important;
          }
          .featured-explore-card {
            grid-column: span 1 !important;
            flex-direction: column !important;
          }
          .featured-image-container {
            width: 100% !important;
            height: 200px !important;
          }
          .featured-content-container {
            width: 100% !important;
            padding: 1.5rem !important;
          }
          .hotel-tabs-wrapper {
            flex-direction: column;
            width: 100% !important;
            gap: 0.5rem !important;
          }
          .hotel-tab-btn {
            width: 100%;
          }
        }

        /* Dashboard specific styling */
        .explore-dashboard-grid {
          display: grid;
          grid-template-columns: 4.5fr 5.5fr;
          gap: 2rem;
          align-items: start;
        }
        .explore-sidebar {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }
        .explore-showcase-panel {
          position: sticky;
          top: calc(9rem + var(--banner-height, 0px));
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 1.5rem;
          overflow: hidden;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.04);
          display: flex;
          flex-direction: column;
        }
        .category-tab-container {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1rem;
          margin-bottom: 2.5rem;
        }
        .category-tab-card {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 1.25rem;
          padding: 1.25rem;
          text-align: center;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.02);
        }
        .category-tab-card:hover {
          transform: translateY(-4px);
          border-color: #3b82f6;
          box-shadow: 0 12px 20px rgba(15, 82, 186, 0.05);
        }
        .category-tab-card.active {
          background: linear-gradient(135deg, #091d36 0%, #1e293b 100%);
          border-color: #091d36;
          color: #ffffff !important;
          box-shadow: 0 10px 20px rgba(9, 29, 54, 0.15);
        }
        .category-tab-card.active h4,
        .category-tab-card.active span {
          color: #ffffff !important;
        }
        .list-selector-card {
          display: flex;
          gap: 1.25rem;
          padding: 1rem;
          border-radius: 1rem;
          background: #ffffff;
          border: 1px solid #e2e8f0;
          cursor: pointer;
          transition: all 0.25s ease;
          align-items: center;
          text-align: left;
        }
        .list-selector-card:hover {
          border-color: #3b82f6;
          transform: translateX(4px);
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.03);
        }
        .list-selector-card.active {
          border-color: #3b82f6;
          background: rgba(59, 130, 246, 0.03);
          box-shadow: 0 4px 15px rgba(59, 130, 246, 0.05);
        }
        .list-selector-thumb {
          width: 70px;
          height: 70px;
          border-radius: 0.5rem;
          object-fit: cover;
          flex-shrink: 0;
        }
        .list-selector-card h4 {
          font-size: 1.05rem;
          color: #091d36;
          font-weight: 800;
          margin: 0.15rem 0;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .list-selector-card p {
          font-size: 0.82rem;
          color: #64748b;
          margin: 0;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        
        @media (max-width: 991px) {
          .explore-dashboard-grid {
            grid-template-columns: 1fr;
          }
          .explore-showcase-panel {
            position: relative;
            top: 0;
            margin-bottom: 2rem;
          }
          .category-tab-container {
            grid-template-columns: 1fr;
            gap: 0.5rem;
          }
        }

        /* ================= MOBILE FIX ================= */

        @media (max-width: 768px) {

          .explore-container{
            padding:90px 14px 80px;
            overflow-x:hidden;
          }

          /* Dashboard */
          .explore-dashboard-grid{
            display:flex;
            flex-direction:column;
            gap:20px;
          }

          .explore-showcase-panel{
            position:relative;
            top:0;
            width:100%;
            order:1;
          }

          .explore-sidebar{
            width:100%;
            order:2;
          }

          /* Featured card */

          .explore-showcase-panel img{
            height:220px !important;
            width:100%;
            object-fit:cover;
          }

          .explore-showcase-panel h3{
            font-size:28px;
            line-height:1.3;
            word-break:break-word;
          }

          .explore-showcase-panel p{
            font-size:15px;
            line-height:1.6;
          }

          /* Category buttons */

          .category-tab-container{
            display:grid;
            grid-template-columns:1fr;
            gap:12px;
          }

          .category-tab-card{
            width:100%;
          }

          /* Filter chips */

          .filter-tabs-container,
          .hotel-tabs-wrapper{
            display:flex;
            flex-wrap:wrap;
            gap:8px;
            width:100%;
          }

          .filter-tab-btn,
          .hotel-tab-btn{
            flex:1 1 auto;
            min-width:90px;
          }

          /* List cards */

          .list-selector-card{
            display:flex;
            align-items:flex-start;
            gap:12px;
            padding:12px;
          }

          .list-selector-thumb{
            width:80px;
            height:80px;
            flex-shrink:0;
          }

          .list-selector-card h4{
            font-size:18px;
            white-space:normal;
            overflow:visible;
            text-overflow:unset;
          }

          .list-selector-card p{
            white-space:normal;
          }

          /* Prevent horizontal scroll */

          img{
            max-width:100%;
          }

          *{
            box-sizing:border-box;
          }

          body{
            overflow-x:hidden;
          }
        }
      `}} />
      {/* Admin Tab Switching Toolbar */}
      {adminUser && (
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '1rem',
          marginBottom: '3rem',
          background: 'rgba(255, 255, 255, 0.05)',
          padding: '0.75rem',
          borderRadius: '1rem',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(10px)',
          flexWrap: 'wrap'
        }}>
          <button
            onClick={() => setAdminTab('view')}
            className={`btn ${adminTab === 'view' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ fontSize: '0.85rem', padding: '0.5rem 1.25rem' }}
          >
            View Live Page
          </button>
          <button
            onClick={() => setAdminTab('tourist_places')}
            className={`btn ${adminTab === 'tourist_places' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ fontSize: '0.85rem', padding: '0.5rem 1.25rem' }}
          >
            Manage Sights & Getaways
          </button>
          <button
            onClick={() => setAdminTab('hotels')}
            className={`btn ${adminTab === 'hotels' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ fontSize: '0.85rem', padding: '0.5rem 1.25rem' }}
          >
            Manage Hotels
          </button>
        </div>
      )}

      {adminTab === 'view' && (
        <motion.div initial="hidden" animate="visible" variants={fadeInUp}>
          {/* Header Hero Banner */}
          <div className="explore-hero">
            <div className="bg-radial-overlay" style={{ opacity: 0.15 }} />
            <div style={{ position: 'relative', zIndex: 2 }}>
              <div style={{ display: 'inline-flex', padding: '0.5rem 1rem', borderRadius: '2rem', background: 'rgba(59, 130, 246, 0.1)', color: '#60a5fa', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', gap: '0.5rem', alignItems: 'center', marginBottom: '1.5rem' }}>
                <Sparkles size={14} /> Explore Coimbatore
              </div>
              <h2 className="explore-hero-title" style={{ color: '#ffffff', textShadow: '0 4px 12px rgba(0,0,0,0.25)' }}>
                Coimbatore Discovery Guide
              </h2>
              <div style={{ height: '3px', width: '80px', background: '#3b82f6', margin: '1.5rem auto 0', borderRadius: '2px' }} />
            </div>
          </div>

          {/* About Coimbatore intro */}
          <div className="glass-card" style={{ marginBottom: '3rem', padding: '2rem', textAlign: 'left', background: '#ffffff', border: '1px solid #e2e8f0' }}>
            <h3 style={{ fontSize: '1.5rem', color: '#091d36', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem', fontWeight: 800 }}>
              <BookOpen size={22} style={{ color: '#3b82f6' }} /> About Coimbatore
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', lineHeight: '1.7', margin: 0 }}>
              {info.about_coimbatore_desc}
            </p>
            {info.about_coimbatore_tour_info && (
              <div style={{
                background: 'rgba(59, 130, 246, 0.05)',
                borderLeft: '4px solid #3b82f6',
                borderRadius: '0.5rem',
                padding: '1rem 1.25rem',
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                marginTop: '1.5rem'
              }}>
                <Award size={22} style={{ color: '#3b82f6', flexShrink: 0 }} />
                <p style={{ color: '#1e3a8a', fontSize: '0.95rem', fontWeight: 600, margin: 0, lineHeight: '1.5' }}>
                  {info.about_coimbatore_tour_info}
                </p>
              </div>
            )}
          </div>

          {/* Category Tabs */}
          <div className="category-tab-container">
            {[
              { id: 'sights', label: 'Local Sights', icon: '🗺️', desc: 'Sightseeing attractions' },
              { id: 'getaways', label: 'Weekend Getaways', icon: '⛰️', desc: 'Hill station retreats' },
              { id: 'hotels', label: 'Recommended Stay', icon: '🏨', desc: 'Hotels and lodging' }
            ].map((tab) => {
              const isActive = activeCategory === tab.id;
              return (
                <motion.div
                  key={tab.id}
                  onClick={() => {
                    setActiveCategory(tab.id as any);
                    // Trigger category filters update
                    if (tab.id === 'hotels') {
                      setActiveHotelTab('All Hotels');
                    }
                  }}
                  whileHover={{ y: -4, scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ duration: 0.2 }}
                  className={`category-tab-card ${isActive ? 'active' : ''}`}
                >
                  <span style={{ fontSize: '2rem' }}>{tab.icon}</span>
                  <h4 style={{ fontSize: '1.15rem', margin: 0, fontWeight: 700 }}>{tab.label}</h4>
                  <span style={{ fontSize: '0.75rem', opacity: isActive ? 0.9 : 0.6 }}>{tab.desc}</span>
                </motion.div>
              );
            })}
          </div>

          {/* Split Dashboard Grid */}
          <div className="explore-dashboard-grid">
            {/* Left Column: Selection Showcase Panel */}
            <div className="explore-showcase-panel">
              {(() => {
                // Find selected item data based on current active category
                let selectedItem: any = null;
                if (activeCategory === 'sights') {
                  selectedItem = touristPlaces.find(t => (t.id || t.name) === selectedId) || touristPlaces[0];
                } else if (activeCategory === 'getaways') {
                  selectedItem = weekendStays.find(w => (w.id || w.name) === selectedId) || weekendStays[0];
                } else if (activeCategory === 'hotels') {
                  selectedItem = hotels.find(h => (h.id || h.name) === selectedId) || hotels[0];
                }

                if (!selectedItem) {
                  return (
                    <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
                      Select an item to view details
                    </div>
                  );
                }

                return (
                  <motion.div
                    key={selectedItem.id || selectedItem.name}
                    initial={{ opacity: 0, scale: 0.98, y: 15 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                    style={{ display: 'flex', flexDirection: 'column', height: '100%', width: '100%', flex: 1 }}
                  >
                    {/* Featured Image */}
                    <div style={{ height: '300px', overflow: 'hidden', position: 'relative' }}>
                      <img
                        src={selectedItem.image_url || 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=600&q=80'}
                        alt={selectedItem.name}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                      <span style={{
                        position: 'absolute',
                        bottom: '1rem',
                        left: '1rem',
                        background: 'rgba(9, 29, 54, 0.85)',
                        backdropFilter: 'blur(4px)',
                        color: 'white',
                        padding: '0.35rem 0.85rem',
                        borderRadius: '2rem',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em'
                      }}>
                        {selectedItem.category}
                      </span>
                    </div>

                    {/* Content Details */}
                    <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', flex: 1, gap: '1rem', textAlign: 'left' }}>
                      <h3 style={{ fontSize: '1.6rem', color: '#091d36', fontWeight: 800, margin: 0, lineHeight: 1.3 }}>
                        {selectedItem.name}
                      </h3>
                      
                      {selectedItem.address && (
                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start', color: '#64748b', fontSize: '0.88rem' }}>
                          <MapPin size={16} style={{ color: '#3b82f6', flexShrink: 0, marginTop: '0.1rem' }} />
                          <span>{selectedItem.address}</span>
                        </div>
                      )}

                      <p style={{ color: '#475569', fontSize: '0.95rem', lineHeight: '1.6', margin: 0 }}>
                        {selectedItem.description}
                      </p>

                      {activeCategory === 'hotels' && (
                        <div style={{
                          background: '#f8fafc',
                          border: '1px solid #e2e8f0',
                          borderRadius: '0.75rem',
                          padding: '1rem',
                          fontSize: '0.85rem',
                          color: '#64748b',
                          marginTop: '0.5rem'
                        }}>
                          <strong>Booking note:</strong> SREC does not handle reservation bookings directly. Please contact the hotel directly or use popular online travel services.
                        </div>
                      )}

                      {/* Map Directions Button */}
                      <a
                        href={selectedItem.map_url || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(selectedItem.name + (selectedItem.address ? ' ' + selectedItem.address : ', Coimbatore, Tamil Nadu'))}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-primary"
                        style={{
                          marginTop: 'auto',
                          alignSelf: 'stretch',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '0.5rem',
                          padding: '0.75rem',
                          borderRadius: '0.5rem',
                          textDecoration: 'none',
                          fontWeight: 700
                        }}
                      >
                        <MapPin size={18} /> Open Directions Map <ExternalLink size={14} />
                      </a>
                    </div>
                  </motion.div>
                );
              })()}
            </div>

            {/* Right Column: List Selector Panel */}
            <div className="explore-sidebar">
              {/* Sight / Hotel Category Specific Filters inside side pane */}
              {activeCategory === 'sights' && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', background: '#f1f5f9', padding: '6px', borderRadius: '16px', width: '100%', marginBottom: '1rem' }}>
                  {['All', 'Religious', 'Shopping'].map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setActiveSightCategory(cat)}
                      className={`btn ${activeSightCategory === cat ? 'btn-primary' : 'btn-secondary'}`}
                      style={{ fontSize: '0.75rem', padding: '0.35rem 0.85rem', borderRadius: '2rem', border: 'none', background: activeSightCategory === cat ? '#3b82f6' : 'transparent', color: activeSightCategory === cat ? 'white' : '#64748b' }}
                    >
                      {cat === 'All' ? 'All' : cat === 'Religious' ? 'Spiritual' : 'Shopping'}
                    </button>
                  ))}
                </div>
              )}

              {activeCategory === 'hotels' && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', background: '#f1f5f9', padding: '6px', borderRadius: '16px', width: '100%', marginBottom: '1rem' }}>
                  {['All Hotels', 'Luxury Hotels', 'Mid-Range Hotels', 'Budget-Friendly Hotels'].map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setActiveHotelTab(cat)}
                      className={`btn ${activeHotelTab === cat ? 'btn-primary' : 'btn-secondary'}`}
                      style={{ fontSize: '0.75rem', padding: '0.35rem 0.85rem', borderRadius: '2rem', border: 'none', background: activeHotelTab === cat ? '#3b82f6' : 'transparent', color: activeHotelTab === cat ? 'white' : '#64748b' }}
                    >
                      {cat.replace(' Hotels', '').replace('-Friendly', '')}
                    </button>
                  ))}
                </div>
              )}

              {/* Items List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '720px', overflowY: 'auto', paddingRight: '0.25rem' }}>
                {(() => {
                  let list: any[] = [];
                  if (activeCategory === 'sights') {
                    list = touristPlaces.filter(place => {
                      if (activeSightCategory === 'All') return true;
                      if (activeSightCategory === 'Religious') return place.category.toLowerCase().includes('religious') || place.category.toLowerCase().includes('temple');
                      if (activeSightCategory === 'Shopping') return place.category.toLowerCase().includes('shopping') || place.category.toLowerCase().includes('mall');
                      return true;
                    });
                  } else if (activeCategory === 'getaways') {
                    list = weekendStays;
                  } else if (activeCategory === 'hotels') {
                    list = hotels.filter(hotel => {
                      if (activeHotelTab === 'All Hotels') return true;
                      return hotel.category === activeHotelTab;
                    });
                  }

                  if (list.length === 0) {
                    return (
                      <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b', background: '#f8fafc', borderRadius: '1rem', border: '1px solid #e2e8f0' }}>
                        No places found in this category.
                      </div>
                    );
                  }

                  return list.map((item) => {
                    const itemId = item.id || item.name;
                    const isActive = selectedId === itemId;
                    return (
                      <div
                        key={itemId}
                        onClick={() => {
                          setSelectedId(itemId);
                          if (window.innerWidth <= 768) {
                            const el = document.querySelector('.explore-showcase-panel');
                            if (el) {
                              const headerEl = document.querySelector('.main-header');
                              const offset = headerEl ? headerEl.clientHeight : 76;
                              window.scrollTo({
                                top: el.getBoundingClientRect().top + window.scrollY - offset - 10,
                                behavior: 'smooth'
                              });
                            }
                          }
                        }}
                        className={`list-selector-card ${isActive ? 'active' : ''}`}
                      >
                        <img
                          src={item.image_url || 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=600&q=80'}
                          alt={item.name}
                          className="list-selector-thumb"
                        />
                        <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0 }}>
                          <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#3b82f6', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            {item.category}
                          </span>
                          <h4>
                            {item.name}
                          </h4>
                          <p>
                            {item.description}
                          </p>
                        </div>
                      </div>
                    );
                  });
                })()}
              </div>
            </div>
          </div>

          {/* Coimbatore Travel Toolkit Section */}
          <div className="glass-card" style={{ marginTop: '4rem', padding: '2.5rem', background: '#ffffff', border: '1px solid #e2e8f0', textAlign: 'left' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '1rem', flexWrap: 'wrap' }}>
              <Sparkles size={24} style={{ color: '#3b82f6' }} />
              <div>
                <h3 style={{ fontSize: '1.75rem', color: '#091d36', fontWeight: 800, margin: 0 }}>
                  Coimbatore Travel Toolkit
                </h3>
                <p style={{ color: '#64748b', fontSize: '0.88rem', margin: '0.15rem 0 0' }}>
                  Interactive companion resources for conference attendees
                </p>
              </div>
            </div>

            {/* Toolkit Tabs */}
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
              {[
                { id: 'weather', label: '🌦️ Weather & Forecast', desc: 'Realtime updates' },
                { id: 'planner', label: '🗺️ Custom Route Planner', desc: 'Plan travel from SREC' },
                { id: 'tips', label: '💡 Travel Tips & Hotlines', desc: 'Cabs & local advice' }
              ].map(t => (
                <button
                  key={t.id}
                  onClick={() => setToolkitTab(t.id as any)}
                  className={`btn ${toolkitTab === t.id ? 'btn-primary' : 'btn-secondary'}`}
                  style={{
                    fontSize: '0.82rem',
                    padding: '0.6rem 1.25rem',
                    borderRadius: '0.75rem',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    gap: '0.15rem',
                    textAlign: 'left',
                    minWidth: '180px',
                    boxShadow: toolkitTab === t.id ? '0 4px 12px rgba(59, 130, 246, 0.15)' : 'none'
                  }}
                >
                  <span style={{ fontWeight: 700 }}>{t.label.split(' ').slice(1).join(' ') || t.label}</span>
                  <span style={{ fontSize: '0.7rem', opacity: toolkitTab === t.id ? 0.8 : 0.6, fontWeight: 500 }}>{t.desc}</span>
                </button>
              ))}
            </div>

            {/* Toolkit Panels */}
            <AnimatePresence mode="wait">
              {toolkitTab === 'weather' && (
                <motion.div
                  key="weather"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}
                >
                  {/* Weather Info */}
                  <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '1rem', padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                    <div style={{ fontSize: '3.5rem' }}>🌦️</div>
                    <div>
                      <h4 style={{ fontSize: '1.1rem', color: '#091d36', fontWeight: 800, margin: 0 }}>Coimbatore Current Weather</h4>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.25rem', margin: '0.35rem 0' }}>
                        <span style={{ fontSize: '2.5rem', fontWeight: 800, color: '#0f172a' }}>31°C</span>
                        <span style={{ fontSize: '1.25rem', color: '#64748b', fontWeight: 600 }}>/ 88°F</span>
                      </div>
                      <span style={{ fontSize: '0.85rem', color: '#10b981', fontWeight: 700, background: '#d1fae5', padding: '0.25rem 0.6rem', borderRadius: '1rem' }}>
                        Partly Cloudy
                      </span>
                    </div>
                  </div>

                  {/* Weather Stats Grid */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                    {[
                      { label: 'Humidity', val: '65%' },
                      { label: 'Wind Speed', val: '12 km/h' },
                      { label: 'Rain Chance', val: '10%' }
                    ].map((w, idx) => (
                      <div key={idx} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '0.75rem', padding: '1rem', textAlign: 'center' }}>
                        <span style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{w.label}</span>
                        <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0f172a', marginTop: '0.25rem' }}>{w.val}</div>
                      </div>
                    ))}
                  </div>

                  {/* Recommendations */}
                  <div style={{ gridColumn: 'span 1', background: 'rgba(59, 130, 246, 0.04)', borderLeft: '4px solid #3b82f6', borderRadius: '0.5rem', padding: '1.25rem' }}>
                    <h5 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#1e3a8a', margin: '0 0 0.5rem' }}>Attending Advice</h5>
                    <p style={{ fontSize: '0.88rem', color: '#475569', margin: 0, lineHeight: 1.5 }}>
                      Weather is currently sunny and pleasant. Lightweight cotton clothing is recommended for daytime sessions. If traveling to the hill station getaways (Ooty/Valparai), bring a light sweater as temperatures average 16°C.
                    </p>
                  </div>
                </motion.div>
              )}

              {toolkitTab === 'planner' && (
                <motion.div
                  key="planner"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}
                  className="explore-dashboard-grid"
                >
                  {/* Selectors Checklist */}
                  <div>
                    <h4 style={{ fontSize: '1.1rem', color: '#091d36', fontWeight: 800, margin: '0 0 1rem' }}>Select Places to Visit:</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      {[
                        { name: 'Isha Yoga Center (Adiyogi)', dist: 40, time: 55 },
                        { name: 'Marudamalai Murugan Temple', dist: 22, time: 35 },
                        { name: 'Brookefields Mall (Shopping)', dist: 14, time: 25 },
                        { name: 'Gass Forest Museum', dist: 12, time: 20 },
                        { name: 'Vydehi Waterfalls', dist: 32, time: 50 },
                        { name: 'Ooty Hill Station', dist: 90, time: 150 },
                        { name: 'Siruvani Waterfalls', dist: 45, time: 60 }
                      ].map(place => {
                        const isChecked = selectedPlannerPlaces.includes(place.name);
                        return (
                          <label
                            key={place.name}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '1rem',
                              padding: '0.85rem 1.1rem',
                              background: isChecked ? 'rgba(59, 130, 246, 0.03)' : '#ffffff',
                              border: `1px solid ${isChecked ? '#3b82f6' : '#e2e8f0'}`,
                              borderRadius: '0.75rem',
                              cursor: 'pointer',
                              transition: 'all 0.2s'
                            }}
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => {
                                if (isChecked) {
                                  setSelectedPlannerPlaces(selectedPlannerPlaces.filter(p => p !== place.name));
                                } else {
                                  setSelectedPlannerPlaces([...selectedPlannerPlaces, place.name]);
                                }
                              }}
                              style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                            />
                            <div style={{ flex: 1 }}>
                              <div style={{ fontSize: '0.92rem', fontWeight: 700, color: '#0f172a' }}>{place.name}</div>
                              <div style={{ fontSize: '0.78rem', color: '#64748b' }}>{place.dist} km from SREC (approx. {place.time} mins)</div>
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  {/* Trip Details Card */}
                  <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '1rem', padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
                    <h4 style={{ fontSize: '1.1rem', color: '#091d36', fontWeight: 800, margin: '0 0 1.25rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem' }}>
                      Your Custom Itinerary
                    </h4>

                    {selectedPlannerPlaces.length === 0 ? (
                      <div style={{ margin: 'auto', textAlign: 'center', color: '#64748b', padding: '2rem 0' }}>
                        <span style={{ fontSize: '2.5rem' }}>🗺️</span>
                        <p style={{ fontSize: '0.92rem', margin: '0.75rem 0 0' }}>Check one or more places to generate your route itinerary from SREC campus.</p>
                      </div>
                    ) : (
                      <>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', flex: 1 }}>
                          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', fontSize: '0.9rem', color: '#3b82f6', fontWeight: 700 }}>
                            <span>🏫</span> <span>Start: Sri Ramakrishna Engineering College</span>
                          </div>

                          {selectedPlannerPlaces.map((name, idx) => {
                            const details = [
                              { name: 'Isha Yoga Center (Adiyogi)', dist: 40 },
                              { name: 'Marudamalai Murugan Temple', dist: 22 },
                              { name: 'Brookefields Mall (Shopping)', dist: 14 },
                              { name: 'Gass Forest Museum', dist: 12 },
                              { name: 'Vydehi Waterfalls', dist: 32 },
                              { name: 'Ooty Hill Station', dist: 90 },
                              { name: 'Siruvani Waterfalls', dist: 45 }
                            ].find(p => p.name === name);

                            return (
                              <div key={name} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', fontSize: '0.9rem', color: '#334155', paddingLeft: '1.25rem', borderLeft: '2px dashed #cbd5e1' }}>
                                <span>📍</span> <span>Stop {idx + 1}: {name} (+{details?.dist} km)</span>
                              </div>
                            );
                          })}
                        </div>

                        {/* Totals Summary */}
                        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '0.75rem', padding: '1rem', marginTop: '1.5rem' }}>
                          {(() => {
                            const data = [
                              { name: 'Isha Yoga Center (Adiyogi)', dist: 40, time: 55 },
                              { name: 'Marudamalai Murugan Temple', dist: 22, time: 35 },
                              { name: 'Brookefields Mall (Shopping)', dist: 14, time: 25 },
                              { name: 'Gass Forest Museum', dist: 12, time: 20 },
                              { name: 'Vydehi Waterfalls', dist: 32, time: 50 },
                              { name: 'Ooty Hill Station', dist: 90, time: 150 },
                              { name: 'Siruvani Waterfalls', dist: 45, time: 60 }
                            ];
                            const totals = selectedPlannerPlaces.reduce((acc, name) => {
                              const match = data.find(d => d.name === name);
                              if (match) {
                                acc.dist += match.dist;
                                acc.time += match.time;
                              }
                              return acc;
                            }, { dist: 0, time: 0 });

                            return (
                              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', textAlign: 'center' }}>
                                <div>
                                  <span style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase' }}>Est. Distance</span>
                                  <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#3b82f6', marginTop: '0.15rem' }}>{totals.dist} km</div>
                                </div>
                                <div>
                                  <span style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase' }}>Est. Travel Time</span>
                                  <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#3b82f6', marginTop: '0.15rem' }}>{Math.round(totals.time / 10) * 10} mins</div>
                                </div>
                              </div>
                            );
                          })()}
                        </div>
                      </>
                    )}
                  </div>
                </motion.div>
              )}

              {toolkitTab === 'tips' && (
                <motion.div
                  key="tips"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}
                >
                  {/* Tips list */}
                  <div>
                    <h4 style={{ fontSize: '1.1rem', color: '#091d36', fontWeight: 800, margin: '0 0 1rem' }}>Local Travel Tips</h4>
                    <ul style={{ paddingLeft: '1.25rem', color: '#475569', fontSize: '0.9rem', display: 'flex', flexDirection: 'column', gap: '0.6rem', margin: 0, lineHeight: 1.5 }}>
                      <li><strong>Cab Booking</strong>: Book Red Taxi (local favourite) or OLA/Uber apps directly to avoid dynamic airport surcharges.</li>
                      <li><strong>Attire</strong>: Traditional sites like Marudamalai require conservative dress codes (covered shoulders & knees).</li>
                      <li><strong>Payments</strong>: UPI (Google Pay, PhonePe, Paytm) is accepted everywhere, but keep some cash for remote getaways.</li>
                      <li><strong>Language</strong>: Simple English and Tamil are spoken. SREC coordinators are also available to assist.</li>
                    </ul>
                  </div>

                  {/* Hotlines */}
                  <div>
                    <h4 style={{ fontSize: '1.1rem', color: '#091d36', fontWeight: 800, margin: '0 0 1rem' }}>Support & Helplines</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                      {[
                        { label: 'SREC Secretariat Support', phone: '+914222461588' },
                        { label: 'Red Taxi Booking', phone: '04224567890' },
                        { label: 'Coimbatore Police Desk', phone: '100' },
                        { label: 'Medical Helpline (Ambulance)', phone: '108' }
                      ].map(h => (
                        <a
                          key={h.phone}
                          href={`tel:${h.phone}`}
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: '0.75rem 1rem',
                            background: '#f8fafc',
                            border: '1px solid #e2e8f0',
                            borderRadius: '0.5rem',
                            textDecoration: 'none',
                            fontSize: '0.88rem',
                            transition: 'all 0.2s'
                          }}
                          className="list-selector-card"
                        >
                          <span style={{ fontWeight: 700, color: '#334155' }}>{h.label}</span>
                          <span style={{ color: '#3b82f6', fontWeight: 800 }}>{h.phone}</span>
                        </a>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      )}

      {/* Admin management view for tourist places */}
      {adminTab === 'tourist_places' && (
        <motion.div initial="hidden" animate="visible" variants={fadeInUp} style={{ color: 'white', textAlign: 'left' }}>
          {/* Section 1: Tourist Places */}
          <div className="admin-control-bar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <h4 style={{ fontSize: '1.5rem', margin: 0, fontWeight: 700 }}>Local Tourist Attractions ({touristPlaces.length})</h4>
            {!editingTouristPlace && (
              <button onClick={() => setEditingTouristPlace({ name: '', category: 'Religious site', description: '', sort_order: touristPlaces.length + 1 })} className="btn btn-primary">
                <Plus size={16} /> Add Attraction
              </button>
            )}
          </div>

          {editingTouristPlace && (
            <div className="glass-card" style={{ marginBottom: '3rem', background: '#f8fafc', borderColor: '#3b82f6', padding: '2rem', color: '#0f172a' }}>
              <h5 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', fontWeight: 800 }}>{editingTouristPlace.id ? 'Edit Attraction' : 'Add New Attraction'}</h5>
              <form onSubmit={handleSaveTouristPlace} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div className="admin-form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                  <div className="admin-form-group">
                    <label htmlFor="tourist_name">Name</label>
                    <input
                      id="tourist_name"
                      type="text"
                      required
                      className="form-input"
                      value={editingTouristPlace.name}
                      onChange={(e) => setEditingTouristPlace({ ...editingTouristPlace, name: e.target.value })}
                      placeholder="e.g. Marudamalai Temple"
                    />
                  </div>
                  <div className="admin-form-group">
                    <label htmlFor="tourist_category">Category</label>
                    <input
                      id="tourist_category"
                      type="text"
                      required
                      className="form-input"
                      value={editingTouristPlace.category}
                      onChange={(e) => setEditingTouristPlace({ ...editingTouristPlace, category: e.target.value })}
                      placeholder="e.g. Religious site"
                    />
                  </div>
                </div>

                <div className="admin-form-group">
                  <label htmlFor="tourist_desc">Description</label>
                  <textarea
                    id="tourist_desc"
                    rows={3}
                    required
                    className="form-input"
                    value={editingTouristPlace.description}
                    onChange={(e) => setEditingTouristPlace({ ...editingTouristPlace, description: e.target.value })}
                    placeholder="Brief description of the sightseeing spot"
                  />
                </div>

                <div className="admin-form-group">
                  <label htmlFor="tourist_image_url">Custom Image Link (Optional)</label>
                  <input
                    id="tourist_image_url"
                    type="url"
                    className="form-input"
                    value={editingTouristPlace.image_url || ''}
                    onChange={(e) => setEditingTouristPlace({ ...editingTouristPlace, image_url: e.target.value })}
                    placeholder="https://images.unsplash.com/..."
                  />
                </div>

                <div className="admin-form-group">
                  <label htmlFor="tourist_map_url">Google Maps / Directions URL (Optional)</label>
                  <input
                    id="tourist_map_url"
                    type="url"
                    className="form-input"
                    value={editingTouristPlace.map_url || ''}
                    onChange={(e) => setEditingTouristPlace({ ...editingTouristPlace, map_url: e.target.value })}
                    placeholder="https://www.google.com/maps/dir/?api=1&destination=..."
                  />
                </div>

                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <button type="submit" className="btn btn-primary">
                    <Save size={16} /> Save Attraction
                  </button>
                  <button type="button" onClick={() => setEditingTouristPlace(null)} className="btn btn-secondary">
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="admin-card-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '4rem' }}>
            {touristPlaces.map((place, idx) => (
              <div key={place.id || idx} className="admin-editor-card" style={{ background: '#f8fafc', color: '#0f172a', padding: '1.5rem', borderRadius: '0.75rem', border: '1px solid #cbd5e1' }}>
                <h5 style={{ fontSize: '1.15rem', color: '#091d36', margin: '0 0 0.25rem', fontWeight: 800 }}>{place.name}</h5>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#f59e0b', textTransform: 'uppercase' }}>{place.category}</span>
                <p style={{ fontSize: '0.85rem', color: '#475569', marginTop: '0.5rem', lineHeight: '1.5' }}>{place.description}</p>

                <div className="admin-action-row" style={{ display: 'flex', gap: '0.5rem', marginTop: '1.25rem' }}>
                  <button onClick={() => setEditingTouristPlace(place)} className="btn btn-secondary" style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem' }}>
                    Edit
                  </button>
                  <button onClick={() => handleDeleteTouristPlace(place.id)} className="btn btn-secondary" style={{ color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '0.35rem 0.75rem', fontSize: '0.75rem' }}>
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Section 2: Weekend Getaways */}
          <div className="admin-control-bar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', borderTop: '1px solid rgba(255, 255, 255, 0.1)', paddingTop: '3rem' }}>
            <h4 style={{ fontSize: '1.5rem', margin: 0, fontWeight: 700 }}>Weekend Stays & Getaways ({weekendStays.length})</h4>
            {!editingWeekendStay && (
              <button onClick={() => setEditingWeekendStay({ name: '', category: 'Hill Station', description: '', sort_order: weekendStays.length + 1 })} className="btn btn-primary">
                <Plus size={16} /> Add Getaway
              </button>
            )}
          </div>

          {editingWeekendStay && (
            <div className="glass-card" style={{ marginBottom: '3rem', background: '#f8fafc', borderColor: '#3b82f6', padding: '2rem', color: '#0f172a' }}>
              <h5 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', fontWeight: 800 }}>{editingWeekendStay.id ? 'Edit Getaway Details' : 'Add New Getaway'}</h5>
              <form onSubmit={handleSaveWeekendStay} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div className="admin-form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                  <div className="admin-form-group">
                    <label htmlFor="weekend_name">Name</label>
                    <input
                      id="weekend_name"
                      type="text"
                      required
                      className="form-input"
                      value={editingWeekendStay.name}
                      onChange={(e) => setEditingWeekendStay({ ...editingWeekendStay, name: e.target.value })}
                      placeholder="e.g. Ooty Hill Station"
                    />
                  </div>
                  <div className="admin-form-group">
                    <label htmlFor="weekend_category">Category</label>
                    <input
                      id="weekend_category"
                      type="text"
                      required
                      className="form-input"
                      value={editingWeekendStay.category}
                      onChange={(e) => setEditingWeekendStay({ ...editingWeekendStay, category: e.target.value })}
                      placeholder="e.g. Hill Station"
                    />
                  </div>
                </div>

                <div className="admin-form-group">
                  <label htmlFor="weekend_desc">Description</label>
                  <textarea
                    id="weekend_desc"
                    rows={3}
                    required
                    className="form-input"
                    value={editingWeekendStay.description}
                    onChange={(e) => setEditingWeekendStay({ ...editingWeekendStay, description: e.target.value })}
                    placeholder="Brief description of the getaway place"
                  />
                </div>

                <div className="admin-form-group">
                  <label htmlFor="weekend_image_url">Custom Image Link (Optional)</label>
                  <input
                    id="weekend_image_url"
                    type="url"
                    className="form-input"
                    value={editingWeekendStay.image_url || ''}
                    onChange={(e) => setEditingWeekendStay({ ...editingWeekendStay, image_url: e.target.value })}
                    placeholder="https://images.unsplash.com/..."
                  />
                </div>

                <div className="admin-form-group">
                  <label htmlFor="weekend_map_url">Google Maps / Directions URL (Optional)</label>
                  <input
                    id="weekend_map_url"
                    type="url"
                    className="form-input"
                    value={editingWeekendStay.map_url || ''}
                    onChange={(e) => setEditingWeekendStay({ ...editingWeekendStay, map_url: e.target.value })}
                    placeholder="https://www.google.com/maps/dir/?api=1&destination=..."
                  />
                </div>

                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <button type="submit" className="btn btn-primary">
                    <Save size={16} /> Save Getaway
                  </button>
                  <button type="button" onClick={() => setEditingWeekendStay(null)} className="btn btn-secondary">
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="admin-card-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
            {weekendStays.map((stay, idx) => (
              <div key={stay.id || idx} className="admin-editor-card" style={{ background: '#f8fafc', color: '#0f172a', padding: '1.5rem', borderRadius: '0.75rem', border: '1px solid #cbd5e1' }}>
                <h5 style={{ fontSize: '1.15rem', color: '#091d36', margin: '0 0 0.25rem', fontWeight: 800 }}>{stay.name}</h5>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#8b5cf6', textTransform: 'uppercase' }}>{stay.category}</span>
                <p style={{ fontSize: '0.85rem', color: '#475569', marginTop: '0.5rem', lineHeight: '1.5' }}>{stay.description}</p>

                <div className="admin-action-row" style={{ display: 'flex', gap: '0.5rem', marginTop: '1.25rem' }}>
                  <button onClick={() => setEditingWeekendStay(stay)} className="btn btn-secondary" style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem' }}>
                    Edit
                  </button>
                  <button onClick={() => handleDeleteWeekendStay(stay.id)} className="btn btn-secondary" style={{ color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '0.35rem 0.75rem', fontSize: '0.75rem' }}>
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Admin management view for hotels */}
      {adminTab === 'hotels' && (
        <motion.div initial="hidden" animate="visible" variants={fadeInUp} style={{ color: 'white', textAlign: 'left' }}>
          <div className="admin-control-bar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <h4 style={{ fontSize: '1.5rem', margin: 0, fontWeight: 700 }}>Recommended Hotels ({hotels.length})</h4>
            {!editingHotel && (
              <button onClick={() => setEditingHotel({ name: '', category: 'Luxury Hotels', address: '', description: '', map_url: '', sort_order: hotels.length + 1 })} className="btn btn-primary">
                <Plus size={16} /> Add Hotel
              </button>
            )}
          </div>

          {editingHotel && (
            <div className="glass-card" style={{ marginBottom: '3rem', background: '#f8fafc', borderColor: '#3b82f6', padding: '2rem', color: '#0f172a' }}>
              <h5 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', fontWeight: 800 }}>{editingHotel.id ? 'Edit Hotel Details' : 'Add New Hotel'}</h5>
              <form onSubmit={handleSaveHotel} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div className="admin-form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                  <div className="admin-form-group">
                    <label htmlFor="hotel_name">Hotel Name</label>
                    <input
                      id="hotel_name"
                      type="text"
                      required
                      className="form-input"
                      value={editingHotel.name}
                      onChange={(e) => setEditingHotel({ ...editingHotel, name: e.target.value })}
                      placeholder="e.g. Vivanta"
                    />
                  </div>
                  <div className="admin-form-group">
                    <label htmlFor="hotel_category">Category</label>
                    <select
                      id="hotel_category"
                      required
                      className="form-input"
                      value={editingHotel.category}
                      onChange={(e) => setEditingHotel({ ...editingHotel, category: e.target.value })}
                      style={{ background: 'white' }}
                    >
                      <option value="Luxury Hotels">Luxury Hotels</option>
                      <option value="Mid-Range Hotels">Mid-Range Hotels</option>
                      <option value="Budget-Friendly Hotels">Budget-Friendly Hotels</option>
                    </select>
                  </div>
                </div>

                <div className="admin-form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                  <div className="admin-form-group">
                    <label htmlFor="hotel_address">Address</label>
                    <input
                      id="hotel_address"
                      type="text"
                      required
                      className="form-input"
                      value={editingHotel.address}
                      onChange={(e) => setEditingHotel({ ...editingHotel, address: e.target.value })}
                      placeholder="e.g. Race Course Road, Coimbatore"
                    />
                  </div>
                  <div className="admin-form-group">
                    <label htmlFor="hotel_map_url">Google Maps URL</label>
                    <input
                      id="hotel_map_url"
                      type="url"
                      className="form-input"
                      value={editingHotel.map_url || ''}
                      onChange={(e) => setEditingHotel({ ...editingHotel, map_url: e.target.value })}
                      placeholder="https://maps.google.com/..."
                    />
                  </div>
                </div>

                <div className="admin-form-group">
                  <label htmlFor="hotel_desc">Description</label>
                  <textarea
                    id="hotel_desc"
                    rows={2}
                    required
                    className="form-input"
                    value={editingHotel.description}
                    onChange={(e) => setEditingHotel({ ...editingHotel, description: e.target.value })}
                    placeholder="Brief hotel description..."
                  />
                </div>

                <div className="admin-form-group">
                  <label htmlFor="hotel_image_url">Custom Image Link (Optional)</label>
                  <input
                    id="hotel_image_url"
                    type="url"
                    className="form-input"
                    value={editingHotel.image_url || ''}
                    onChange={(e) => setEditingHotel({ ...editingHotel, image_url: e.target.value })}
                    placeholder="https://images.unsplash.com/..."
                  />
                </div>

                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <button type="submit" className="btn btn-primary">
                    <Save size={16} /> Save Hotel
                  </button>
                  <button type="button" onClick={() => setEditingHotel(null)} className="btn btn-secondary">
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="admin-card-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
            {hotels.map((hotel, idx) => (
              <div key={hotel.id || idx} className="admin-editor-card" style={{ background: '#f8fafc', color: '#0f172a', padding: '1.5rem', borderRadius: '0.75rem', border: '1px solid #cbd5e1' }}>
                <h5 style={{ fontSize: '1.15rem', color: '#091d36', margin: '0 0 0.25rem', fontWeight: 800 }}>{hotel.name}</h5>
                <span className={`card-category-badge`} style={{
                  fontSize: '0.65rem',
                  fontWeight: 700,
                  padding: '0.2rem 0.5rem',
                  borderRadius: '1rem',
                  color: 'white',
                  background: hotel.category.includes('Luxury') ? '#091d36' : hotel.category.includes('Mid') ? '#0f52ba' : '#0ea5e9'
                }}>
                  {hotel.category}
                </span>
                <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '0.5rem 0' }}><strong>Address:</strong> {hotel.address}</p>
                <p style={{ fontSize: '0.85rem', color: '#475569', marginTop: '0.25rem', lineHeight: '1.5' }}>{hotel.description}</p>

                <div className="admin-action-row" style={{ display: 'flex', gap: '0.5rem', marginTop: '1.25rem' }}>
                  <button onClick={() => setEditingHotel(hotel)} className="btn btn-secondary" style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem' }}>
                    Edit
                  </button>
                  <button onClick={() => handleDeleteHotel(hotel.id)} className="btn btn-secondary" style={{ color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '0.35rem 0.75rem', fontSize: '0.75rem' }}>
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
