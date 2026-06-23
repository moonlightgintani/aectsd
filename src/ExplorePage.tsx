import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
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
    <div style={{ padding: '8rem 1.5rem 6rem', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
      <style dangerouslySetInnerHTML={{
        __html: `
        .card-image-zoom {
          transition: transform 0.5s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .glass-card:hover .card-image-zoom,
        div:hover > div > .card-image-zoom {
          transform: scale(1.06);
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
          <div style={{
            position: 'relative',
            borderRadius: '1.5rem',
            overflow: 'hidden',
            padding: '5rem 2.5rem',
            textAlign: 'center',
            marginBottom: '4rem',
            background: 'linear-gradient(135deg, #f8fafc 0%, #e0f2fe 100%)',
            boxShadow: '0 10px 30px rgba(9, 29, 54, 0.05)',
            border: '1px solid #e2e8f0'
          }}>
            <div className="bg-grid-overlay" style={{ opacity: 0.05 }} />
            <div style={{ position: 'relative', zIndex: 2 }}>
              <div style={{ display: 'inline-flex', padding: '0.5rem 1rem', borderRadius: '2rem', background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', gap: '0.5rem', alignItems: 'center', marginBottom: '1.5rem' }}>
                <Sparkles size={14} /> Explore Coimbatore
              </div>
              <h2 style={{ fontSize: '3rem', fontWeight: 800, color: '#091d36', margin: 0, textTransform: 'uppercase', letterSpacing: '0.02em', fontFamily: 'var(--font-heading)' }}>
                About Coimbatore & Sights
              </h2>
              <div style={{ height: '3px', width: '80px', background: '#3b82f6', margin: '1.5rem auto 0', borderRadius: '2px' }} />
            </div>
          </div>

          {/* About Coimbatore intro */}
          <div className="glass-card" style={{ marginBottom: '4rem', padding: '2.5rem', textAlign: 'left', background: '#ffffff', border: '1px solid #e2e8f0' }}>
            <h3 style={{ fontSize: '1.75rem', color: '#091d36', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.75rem', fontWeight: 800 }}>
              <BookOpen size={24} style={{ color: '#3b82f6' }} /> About Coimbatore
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', lineHeight: '1.8', margin: 0 }}>
              {info.about_coimbatore_desc}
            </p>

            {/* Tour Arrangement Notice */}
            <div style={{
              background: 'rgba(59, 130, 246, 0.06)',
              borderLeft: '4px solid #3b82f6',
              borderRadius: '0.75rem',
              padding: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: '1.25rem',
              marginTop: '2.5rem',
              boxShadow: '0 4px 12px rgba(59, 130, 246, 0.03)'
            }}>
              <Award size={28} style={{ color: '#3b82f6', flexShrink: 0 }} />
              <p style={{ color: '#1e3a8a', fontSize: '1rem', fontWeight: 600, margin: 0, lineHeight: '1.6' }}>
                {info.about_coimbatore_tour_info}
              </p>
            </div>
          </div>

          {/* Local Sights */}
          {touristPlaces.length > 0 && (
            <div style={{ marginBottom: '5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
                <h3 style={{ fontSize: '2rem', color: '#091d36', fontWeight: 800, margin: 0, textAlign: 'left' }}>
                  Local Sightseeing Places
                </h3>
                
                {/* Sights Category Filter Tabs */}
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  {['All', 'Religious', 'Shopping'].map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setActiveSightCategory(cat)}
                      className={`btn ${activeSightCategory === cat ? 'btn-primary' : 'btn-secondary'}`}
                      style={{ fontSize: '0.8rem', padding: '0.4rem 1rem', borderRadius: '2rem' }}
                    >
                      {cat === 'All' ? 'Show All Sights' : cat === 'Religious' ? 'Spiritual Sights' : 'Shopping & Entertainment'}
                    </button>
                  ))}
                </div>
              </div>

              <div className="explore-grid">
                {(() => {
                  const filtered = touristPlaces.filter(place => {
                    if (activeSightCategory === 'All') return true;
                    if (activeSightCategory === 'Religious') return place.category.toLowerCase().includes('religious') || place.category.toLowerCase().includes('temple');
                    if (activeSightCategory === 'Shopping') return place.category.toLowerCase().includes('shopping') || place.category.toLowerCase().includes('mall');
                    return true;
                  });

                  return filtered.map((place, idx) => {
                    // Make the first card featured on desktop (large horizontal card)
                    const isFeatured = idx === 0 && activeSightCategory === 'All';
                    return (
                      <motion.div
                        key={idx}
                        whileHover={{ y: -6, transition: { duration: 0.2 } }}
                        className={`glass-card ${isFeatured ? 'featured-explore-card' : ''}`}
                        style={{
                          padding: 0,
                          display: 'flex',
                          flexDirection: 'column',
                          textAlign: 'left',
                          height: '100%',
                          background: '#ffffff',
                          border: '1px solid #e2e8f0',
                          borderRadius: '1.25rem',
                          overflow: 'hidden',
                          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.03)'
                        }}
                      >
                        <div className={isFeatured ? 'featured-image-container' : ''} style={{ overflow: 'hidden', position: 'relative', height: isFeatured ? 'auto' : '220px' }}>
                          <a
                            href={place.image_url || 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=600&q=80'}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ display: 'block', width: '100%', height: '100%' }}
                            title="Click to view full image"
                          >
                            <img
                              src={place.image_url || 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=600&q=80'}
                              alt={place.name}
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                              className="card-image-zoom"
                            />
                          </a>
                        </div>
                        <div className={isFeatured ? 'featured-content-container' : ''} style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
                          <span
                            style={{
                              alignSelf: 'flex-start',
                              fontSize: '0.7rem',
                              fontWeight: 800,
                              padding: '0.3rem 0.75rem',
                              borderRadius: '2rem',
                              textTransform: 'uppercase',
                              letterSpacing: '0.05em',
                              marginBottom: '0.85rem',
                              background: place.category.toLowerCase().includes('religious') ? '#fef3c7' : place.category.toLowerCase().includes('nature') ? '#d1fae5' : '#dbeafe',
                              color: place.category.toLowerCase().includes('religious') ? '#b45309' : place.category.toLowerCase().includes('nature') ? '#065f46' : '#1e40af'
                            }}
                          >
                            {place.category}
                          </span>
                          <h4 style={{ fontSize: '1.35rem', color: '#091d36', fontWeight: 800, margin: '0 0 0.75rem', lineHeight: '1.4' }}>{place.name}</h4>
                          <p style={{ fontSize: '0.92rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.6, flex: 1 }}>
                            {place.description}
                          </p>
                          <a
                            href={place.map_url || `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(place.name + ', Coimbatore, Tamil Nadu')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-secondary"
                            style={{
                              fontSize: '0.8rem',
                              padding: '0.5rem 1rem',
                              width: 'fit-content',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.4rem',
                              textDecoration: 'none',
                              borderRadius: '0.5rem',
                              marginTop: '1.25rem'
                            }}
                          >
                            <ExternalLink size={14} style={{ color: '#0f52ba' }} /> View Directions
                          </a>
                        </div>
                      </motion.div>
                    );
                  });
                })()}
              </div>
            </div>
          )}

          {/* Weekend Getaways */}
          {weekendStays.length > 0 && (
            <div style={{ marginBottom: '5rem' }}>
              <h3 style={{ fontSize: '2rem', color: '#091d36', fontWeight: 800, marginBottom: '2.5rem', textAlign: 'left', borderBottom: '1px solid #e2e8f0', paddingBottom: '1rem' }}>
                Weekend Stays & Hill Station Getaways
              </h3>
              <div className="explore-grid">
                {weekendStays.map((stay, idx) => {
                  const isFeatured = idx === 0;
                  return (
                    <motion.div
                      key={idx}
                      whileHover={{ y: -6, transition: { duration: 0.2 } }}
                      className={`glass-card ${isFeatured ? 'featured-explore-card' : ''}`}
                      style={{
                        padding: 0,
                        display: 'flex',
                        flexDirection: 'column',
                        textAlign: 'left',
                        height: '100%',
                        background: '#ffffff',
                        border: '1px solid #e2e8f0',
                        borderRadius: '1.25rem',
                        overflow: 'hidden',
                        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.03)'
                      }}
                    >
                      <div className={isFeatured ? 'featured-image-container' : ''} style={{ overflow: 'hidden', position: 'relative', height: isFeatured ? 'auto' : '220px' }}>
                        <a
                          href={stay.image_url || 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=600&q=80'}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ display: 'block', width: '100%', height: '100%' }}
                          title="Click to view full image"
                        >
                          <img
                            src={stay.image_url || 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=600&q=80'}
                            alt={stay.name}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            className="card-image-zoom"
                          />
                        </a>
                      </div>
                      <div className={isFeatured ? 'featured-content-container' : ''} style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
                        <span
                          style={{
                            alignSelf: 'flex-start',
                            fontSize: '0.7rem',
                            fontWeight: 800,
                            padding: '0.3rem 0.75rem',
                            borderRadius: '2rem',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em',
                            marginBottom: '0.85rem',
                            background: stay.category.toLowerCase().includes('hill') ? '#f3e8ff' : '#d1fae5',
                            color: stay.category.toLowerCase().includes('hill') ? '#6b21a8' : '#065f46'
                          }}
                        >
                          {stay.category}
                        </span>
                        <h4 style={{ fontSize: '1.35rem', color: '#091d36', fontWeight: 800, margin: '0 0 0.75rem', lineHeight: '1.4' }}>{stay.name}</h4>
                        <p style={{ fontSize: '0.92rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.6, flex: 1 }}>
                          {stay.description}
                        </p>
                        <a
                          href={stay.map_url || `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(stay.name + ', Tamil Nadu')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-secondary"
                          style={{
                            fontSize: '0.8rem',
                            padding: '0.5rem 1rem',
                            width: 'fit-content',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.4rem',
                            textDecoration: 'none',
                            borderRadius: '0.5rem',
                            marginTop: '1.25rem'
                          }}
                        >
                          <ExternalLink size={14} style={{ color: '#0f52ba' }} /> View Directions
                        </a>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Accommodation & Hotels */}
          {hotels.length > 0 && (
            <div style={{
              background: '#ffffff',
              borderRadius: '1.5rem',
              padding: '3.5rem 2rem',
              boxShadow: '0 10px 25px rgba(0, 0, 0, 0.03)',
              border: '1px solid #e2e8f0',
              color: '#0f172a'
            }}>
              <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
                <span style={{ color: '#3b82f6', fontWeight: 700, textTransform: 'uppercase', fontSize: '0.9rem', letterSpacing: '0.1em' }}>Accommodation</span>
                <h2 style={{ fontSize: '2.5rem', color: '#091d36', marginTop: '0.5rem', fontWeight: 800 }}>Recommended Hotels for Stay</h2>
                <div style={{ height: '3px', width: '60px', background: '#3b82f6', margin: '1rem auto 0', borderRadius: '2px' }} />
              </div>

              {/* Hotel Category Selector Tabs */}
              <div style={{
                display: 'flex',
                justifyContent: 'center',
                gap: '0.5rem',
                marginBottom: '3rem',
                background: '#f1f5f9',
                padding: '0.35rem',
                borderRadius: '0.75rem',
                border: '1px solid #e2e8f0',
                maxWidth: '550px',
                marginInline: 'auto'
              }}>
                {['Luxury Hotels', 'Mid-Range Hotels', 'Budget-Friendly Hotels'].map((catName) => (
                  <button
                    key={catName}
                    type="button"
                    onClick={() => setActiveHotelTab(catName)}
                    style={{
                      flex: 1,
                      background: activeHotelTab === catName ? 'linear-gradient(135deg, var(--accent) 0%, var(--accent-cyan) 100%)' : 'transparent',
                      color: activeHotelTab === catName ? '#ffffff' : 'var(--text-secondary)',
                      border: 'none',
                      padding: '0.6rem 0.85rem',
                      borderRadius: '0.5rem',
                      fontSize: '0.85rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      boxShadow: activeHotelTab === catName ? '0 2px 8px rgba(15, 82, 186, 0.15)' : 'none'
                    }}
                  >
                    {catName.replace(' Hotels', '').replace('-Friendly', '')}
                  </button>
                ))}
              </div>

              <div className="glass-card" style={{ marginBottom: '3.5rem', textAlign: 'left', background: '#f8fafc', border: '1px solid #e2e8f0', padding: '2rem' }}>
                <h3 style={{ fontSize: '1.5rem', color: '#091d36', marginBottom: '0.75rem', fontWeight: 700 }}>Important Accommodation Notice</h3>
                <p style={{ color: '#475569', fontSize: '1.02rem', lineHeight: '1.7', margin: 0 }}>
                  Conference participants are requested to book their hotel accommodation well in advance. SREC does not handle reservation bookings directly. Please contact the listed luxury, mid-range, or budget hotels below or use popular online travel agencies.
                </p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {(() => {
                  const catHotels = hotels.filter(h => h.category === activeHotelTab);
                  if (catHotels.length === 0) return <p style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>No hotels listed under this category.</p>;

                  return (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '2.5rem' }}>
                      {catHotels.map((hotel, hidx) => (
                        <div
                          key={hidx}
                          style={{
                            background: '#ffffff',
                            border: '1px solid #e2e8f0',
                            borderRadius: '1.25rem',
                            padding: 0,
                            display: 'flex',
                            flexDirection: 'column',
                            textAlign: 'left',
                            height: '100%',
                            overflow: 'hidden',
                            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.03)'
                          }}
                        >
                          <a
                            href={hotel.image_url || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=600&q=80'}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ display: 'block', width: '100%', height: '200px', overflow: 'hidden', position: 'relative' }}
                            title="Click to view full image"
                          >
                            <img
                              src={hotel.image_url || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=600&q=80'}
                              alt={hotel.name}
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                              className="card-image-zoom"
                            />
                          </a>
                          <div style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
                            <h4 style={{ fontSize: '1.35rem', color: '#0f172a', fontWeight: 800, margin: '0 0 0.5rem' }}>{hotel.name}</h4>
                            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start', color: '#64748b', fontSize: '0.85rem', marginBottom: '1rem' }}>
                              <MapPin size={16} style={{ flexShrink: 0, marginTop: '0.1rem', color: '#3b82f6' }} />
                              <span>{hotel.address}</span>
                            </div>
                            <p style={{ fontSize: '0.92rem', color: '#475569', lineHeight: 1.6, margin: '0 0 1.5rem', flex: 1 }}>
                              {hotel.description}
                            </p>
                            <a
                              href={hotel.map_url || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(hotel.name + ' ' + hotel.address)}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="btn btn-secondary"
                              style={{
                                fontSize: '0.8rem',
                                padding: '0.5rem 1rem',
                                width: 'fit-content',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.4rem',
                                textDecoration: 'none',
                                borderRadius: '0.5rem'
                              }}
                            >
                              Get Directions <ExternalLink size={14} />
                            </a>
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </div>

              <div style={{ marginTop: '4rem', textAlign: 'center', borderTop: '1px solid #e2e8f0', paddingTop: '2rem' }}>
                <p style={{ color: '#475569', fontSize: '1rem', margin: 0 }}>
                  Need more accommodation choices in Coimbatore?{' '}
                  <a
                    href="https://www.google.com/travel/hotels/Coimbatore"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: '#3b82f6', fontWeight: 700, textDecoration: 'underline' }}
                  >
                    View hotel directory on Google Travel
                  </a>
                </p>
              </div>
            </div>
          )}
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
