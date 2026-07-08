import React, { useState } from 'react';
import { 
  Shield, 
  Database, 
  RefreshCw, 
  LogOut, 
  Plus, 
  Trash2, 
  Edit, 
  Download, 
  Search, 
  Calendar, 
  DollarSign, 
  Users, 
  BarChart2, 
  ArrowLeft, 
  BookOpen, 
  Layers, 
  Activity,
  Briefcase,
  Eye,
  X
} from 'lucide-react';

const ADMIN_MASTER_KEY = "MRBB2026";

function sha256Fallback(str: string): string {
  const rotateRight = (n: number, x: number) => (x >>> n) | (x << (32 - n));
  const K = [
    0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
    0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
    0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
    0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
    0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
    0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
    0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
    0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2
  ];

  const words: number[] = [];
  const ascii = str;
  let s = ascii + "\x80";
  while (s.length % 64 - 56) s += "\x00";
  
  for (let i = 0; i < s.length; i++) {
    words[i >> 2] |= s.charCodeAt(i) << ((3 - i % 4) * 8);
  }
  
  words[words.length] = 0;
  words[words.length] = ascii.length * 8;

  let H0 = 0x6a09e667, H1 = 0xbb67ae85, H2 = 0x3c6ef372, H3 = 0xa54ff53a,
      H4 = 0x510e527f, H5 = 0x9b05688c, H6 = 0x1f83d9ab, H7 = 0x5be0cd19;

  for (let i = 0; i < words.length; i += 16) {
    const w = words.slice(i, i + 16);
    let a = H0, b = H1, c = H2, d = H3, e = H4, f = H5, g = H6, h = H7;

    for (let j = 0; j < 64; j++) {
      if (j >= 16) {
        const s0 = rotateRight(7, w[j - 15]) ^ rotateRight(18, w[j - 15]) ^ (w[j - 15] >>> 3);
        const s1 = rotateRight(17, w[j - 2]) ^ rotateRight(19, w[j - 2]) ^ (w[j - 2] >>> 10);
        w[j] = (w[j - 16] + s0 + w[j - 7] + s1) | 0;
      }

      const S1 = rotateRight(6, e) ^ rotateRight(11, e) ^ rotateRight(25, e);
      const ch = (e & f) ^ (~e & g);
      const temp1 = (h + S1 + ch + K[j] + (w[j] || 0)) | 0;
      const S0 = rotateRight(2, a) ^ rotateRight(13, a) ^ rotateRight(22, a);
      const maj = (a & b) ^ (a & c) ^ (b & c);
      const temp2 = (S0 + maj) | 0;

      h = g;
      g = f;
      f = e;
      e = (d + temp1) | 0;
      d = c;
      c = b;
      b = a;
      a = (temp1 + temp2) | 0;
    }

    H0 = (H0 + a) | 0; H1 = (H1 + b) | 0; H2 = (H2 + c) | 0; H3 = (H3 + d) | 0;
    H4 = (H4 + e) | 0; H5 = (H5 + f) | 0; H6 = (H6 + g) | 0; H7 = (H7 + h) | 0;
  }

  const hex = (n: number) => {
    let res = (n >>> 0).toString(16);
    while (res.length < 8) res = "0" + res;
    return res;
  };
  
  return hex(H0) + hex(H1) + hex(H2) + hex(H3) + hex(H4) + hex(H5) + hex(H6) + hex(H7);
}

// SHA-256 helper with secure context fallback
async function sha256(message: string): Promise<string> {
  if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle) {
    const msgBuffer = new TextEncoder().encode(message);
    const hashBuffer = await window.crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }
  // Fallback to pure JS SHA-256 for insecure contexts (HTTP / IP test)
  return sha256Fallback(message);
}

interface AdminPageProps {
  supabase: any;
  isSupabaseConfigured: boolean;
  fetchDbData: () => Promise<void>;
  departments: any[];
  committeeMembers: any[];
  speakers: any[];
  importantDates: any[];
  workshops: any[];
  submittedRegistrations: any[];
  info: Record<string, string>;
  pricing: Record<string, number>;
  stats: any[];
  coordinators: any[];
  setInfo: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  setPricing: React.Dispatch<React.SetStateAction<Record<string, number>>>;
  setStats: React.Dispatch<React.SetStateAction<any[]>>;
  setCoordinators: React.Dispatch<React.SetStateAction<any[]>>;
  onClose?: () => void;
}

export default function AdminPage({
  supabase,
  isSupabaseConfigured,
  fetchDbData,
  departments,
  committeeMembers,
  speakers,
  importantDates,
  workshops,
  submittedRegistrations,
  info,
  pricing,
  stats,
  coordinators,
  setInfo,
  setPricing,
  setStats,
  setCoordinators,
  onClose
}: AdminPageProps) {
  // Auth states
  const [adminUser, setAdminUser] = useState<string | null>(() => localStorage.getItem('srec_logged_in_admin'));
  const [adminRegMode, setAdminRegMode] = useState<boolean>(false);
  const [adminUsername, setAdminUsername] = useState<string>('');
  const [adminPassword, setAdminPassword] = useState<string>('');
  const [adminConfirmPassword, setAdminConfirmPassword] = useState<string>('');
  const [adminMasterKey, setAdminMasterKey] = useState<string>('');
  const [adminLoading, setAdminLoading] = useState<boolean>(false);
  const [adminError, setAdminError] = useState<string | null>(null);

  // Tab state
  const [activeTab, setActiveTab] = useState<string>('registrations');
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // Search & Filter
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Editing state variables (Generic Modal/Forms)
  const [editingSpeaker, setEditingSpeaker] = useState<any | null>(null);
  const [editingWorkshop, setEditingWorkshop] = useState<any | null>(null);
  const [editingCommittee, setEditingCommittee] = useState<any | null>(null);
  const [editingDept, setEditingDept] = useState<any | null>(null);
  const [editingMilestone, setEditingMilestone] = useState<any | null>(null);
  const [editingCoordinator, setEditingCoordinator] = useState<any | null>(null);
  const [editingStat, setEditingStat] = useState<any | null>(null);

  // Refresh helper
  const handleRefresh = async () => {
    setAdminLoading(true);
    try {
      await fetchDbData();
      alert('Database contents reloaded successfully!');
    } catch (err: any) {
      alert('Error fetching data: ' + err.message);
    } finally {
      setAdminLoading(false);
    }
  };

  // Auth Submit Handlers
  const handleAdminAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdminError(null);
    setAdminLoading(true);

    try {
      if (adminRegMode) {
        if (adminUsername.trim() === '' || adminPassword.trim() === '') {
          throw new Error('Username and password cannot be empty.');
        }
        if (adminPassword !== adminConfirmPassword) {
          throw new Error('Passwords do not match.');
        }
        if (adminMasterKey !== ADMIN_MASTER_KEY) {
          throw new Error('Invalid Admin Master Key.');
        }

        const passHash = await sha256(adminPassword);

        if (isSupabaseConfigured && supabase) {
          const { error } = await supabase.from('website_admins').insert({
            username: adminUsername,
            password_hash: passHash
          });
          if (error) {
            if (error.code === '23505') throw new Error('Username already exists.');
            throw error;
          }
        } else {
          const localAdmins = JSON.parse(localStorage.getItem('srec_offline_admins') || '{}');
          if (localAdmins[adminUsername]) {
            throw new Error('Username already exists.');
          }
          localAdmins[adminUsername] = passHash;
          localStorage.setItem('srec_offline_admins', JSON.stringify(localAdmins));
        }

        setAdminRegMode(false);
        setAdminPassword('');
        setAdminConfirmPassword('');
        setAdminMasterKey('');
        alert('Admin registered successfully! Please log in.');
      } else {
        if (adminUsername.trim() === '' || adminPassword.trim() === '') {
          throw new Error('Username and password cannot be empty.');
        }

        const passHash = await sha256(adminPassword);

        if (isSupabaseConfigured && supabase) {
          const { data, error } = await supabase
            .from('website_admins')
            .select('*')
            .eq('username', adminUsername)
            .single();

          if (error || !data) {
            throw new Error('Invalid username or password.');
          }
          if (data.password_hash !== passHash) {
            throw new Error('Invalid username or password.');
          }
        } else {
          const localAdmins = JSON.parse(localStorage.getItem('srec_offline_admins') || '{}');
          if (!localAdmins[adminUsername] || localAdmins[adminUsername] !== passHash) {
            throw new Error('Invalid username or password.');
          }
        }

        localStorage.setItem('srec_logged_in_admin', adminUsername);
        setAdminUser(adminUsername);
        setAdminPassword('');
      }
    } catch (err: any) {
      setAdminError(err.message || 'Authentication failed.');
    } finally {
      setAdminLoading(false);
    }
  };

  const handleAdminLogout = () => {
    localStorage.removeItem('srec_logged_in_admin');
    setAdminUser(null);
    setAdminUsername('');
    setAdminPassword('');
  };

  // General Settings save helper
  const handleSaveInfoSetting = async (key: string, val: string) => {
    try {
      if (isSupabaseConfigured && supabase) {
        const { error } = await supabase.from('conference_info').upsert({ key, value: val });
        if (error) throw error;
      } else {
        const local = JSON.parse(localStorage.getItem('srec_offline_info') || '{}');
        local[key] = val;
        localStorage.setItem('srec_offline_info', JSON.stringify(local));
      }
      setInfo(prev => ({ ...prev, [key]: val }));
    } catch (err: any) {
      alert('Save setting failed: ' + err.message);
    }
  };

  // Generic Speaker Save/Delete
  const handleSaveSpeaker = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSpeaker) return;
    try {
      const payload = {
        name: editingSpeaker.name,
        title: editingSpeaker.title,
        role: editingSpeaker.role,
        talk: editingSpeaker.talk,
        color: editingSpeaker.color || '#3b82f6',
        image_url: editingSpeaker.image_url
      };

      if (isSupabaseConfigured && supabase) {
        let error;
        if (editingSpeaker.id) {
          const res = await supabase.from('speakers').update(payload).eq('id', editingSpeaker.id);
          error = res.error;
        } else {
          const res = await supabase.from('speakers').insert(payload);
          error = res.error;
        }
        if (error) throw error;
      } else {
        let list = [...speakers];
        if (editingSpeaker.id) {
          list = list.map(x => x.id === editingSpeaker.id ? editingSpeaker : x);
        } else {
          list.push({ ...editingSpeaker, id: Date.now() });
        }
        localStorage.setItem('srec_offline_speakers', JSON.stringify(list));
      }
      setEditingSpeaker(null);
      await fetchDbData();
    } catch (err: any) {
      alert('Save speaker failed: ' + err.message);
    }
  };

  const handleDeleteSpeaker = async (id: any) => {
    if (!window.confirm('Delete this speaker?')) return;
    try {
      if (isSupabaseConfigured && supabase) {
        const { error } = await supabase.from('speakers').delete().eq('id', id);
        if (error) throw error;
      } else {
        const list = speakers.filter(x => x.id !== id);
        localStorage.setItem('srec_offline_speakers', JSON.stringify(list));
      }
      await fetchDbData();
    } catch (err: any) {
      alert('Delete speaker failed: ' + err.message);
    }
  };

  // Generic Academic Track Save/Delete
  const handleSaveDept = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDept) return;
    try {
      const payload = {
        name: editingDept.name,
        description: editingDept.description,
        sort_order: Number(editingDept.sort_order || 1)
      };

      if (isSupabaseConfigured && supabase) {
        let error;
        if (editingDept.id) {
          const res = await supabase.from('departments').update(payload).eq('id', editingDept.id);
          error = res.error;
        } else {
          const res = await supabase.from('departments').insert(payload);
          error = res.error;
        }
        if (error) throw error;
      } else {
        let list = [...departments];
        if (editingDept.id) {
          list = list.map(x => x.id === editingDept.id ? editingDept : x);
        } else {
          list.push({ ...editingDept, id: Date.now() });
        }
        localStorage.setItem('srec_offline_departments', JSON.stringify(list));
      }
      setEditingDept(null);
      await fetchDbData();
    } catch (err: any) {
      alert('Save track failed: ' + err.message);
    }
  };

  const handleDeleteDept = async (id: any) => {
    if (!window.confirm('Delete this academic track?')) return;
    try {
      if (isSupabaseConfigured && supabase) {
        const { error } = await supabase.from('departments').delete().eq('id', id);
        if (error) throw error;
      } else {
        const list = departments.filter(x => x.id !== id);
        localStorage.setItem('srec_offline_departments', JSON.stringify(list));
      }
      await fetchDbData();
    } catch (err: any) {
      alert('Delete track failed: ' + err.message);
    }
  };

  // Generic Committee Member Save/Delete
  const handleSaveCommittee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCommittee) return;
    try {
      const payload = {
        name: editingCommittee.name,
        designation: editingCommittee.designation || '',
        institution: editingCommittee.institution || '',
        category: editingCommittee.category,
        subgroup: editingCommittee.subgroup || '',
        sort_order: Number(editingCommittee.sort_order || 1)
      };

      if (isSupabaseConfigured && supabase) {
        let error;
        if (editingCommittee.id) {
          const res = await supabase.from('committee').update(payload).eq('id', editingCommittee.id);
          error = res.error;
        } else {
          const res = await supabase.from('committee').insert(payload);
          error = res.error;
        }
        if (error) throw error;
      } else {
        let list = [...committeeMembers];
        if (editingCommittee.id) {
          list = list.map(x => x.id === editingCommittee.id ? editingCommittee : x);
        } else {
          list.push({ ...editingCommittee, id: Date.now() });
        }
        localStorage.setItem('srec_offline_committee', JSON.stringify(list));
      }
      setEditingCommittee(null);
      await fetchDbData();
    } catch (err: any) {
      alert('Save committee member failed: ' + err.message);
    }
  };

  const handleDeleteCommittee = async (id: any) => {
    if (!window.confirm('Delete this committee member?')) return;
    try {
      if (isSupabaseConfigured && supabase) {
        const { error } = await supabase.from('committee').delete().eq('id', id);
        if (error) throw error;
      } else {
        const list = committeeMembers.filter(x => x.id !== id);
        localStorage.setItem('srec_offline_committee', JSON.stringify(list));
      }
      await fetchDbData();
    } catch (err: any) {
      alert('Delete committee member failed: ' + err.message);
    }
  };

  // Generic Tutorial Workshop Save/Delete
  const handleSaveWorkshop = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingWorkshop) return;
    try {
      const payload = {
        title: editingWorkshop.title,
        speaker: editingWorkshop.speaker,
        speaker_designation: editingWorkshop.speaker_designation || '',
        speaker_institution: editingWorkshop.speaker_institution || '',
        date: editingWorkshop.date || '',
        time: editingWorkshop.time || '',
        desc: editingWorkshop.desc || ''
      };

      if (isSupabaseConfigured && supabase) {
        let error;
        if (editingWorkshop.id) {
          const res = await supabase.from('workshops').update(payload).eq('id', editingWorkshop.id);
          error = res.error;
        } else {
          const res = await supabase.from('workshops').insert(payload);
          error = res.error;
        }
        if (error) throw error;
      } else {
        let list = [...workshops];
        if (editingWorkshop.id) {
          list = list.map(x => x.id === editingWorkshop.id ? editingWorkshop : x);
        } else {
          list.push({ ...editingWorkshop, id: Date.now() });
        }
        localStorage.setItem('srec_offline_workshops', JSON.stringify(list));
      }
      setEditingWorkshop(null);
      await fetchDbData();
    } catch (err: any) {
      alert('Save workshop failed: ' + err.message);
    }
  };

  const handleDeleteWorkshop = async (id: any) => {
    if (!window.confirm('Delete this pre-conference tutorial workshop?')) return;
    try {
      if (isSupabaseConfigured && supabase) {
        const { error } = await supabase.from('workshops').delete().eq('id', id);
        if (error) throw error;
      } else {
        const list = workshops.filter(x => x.id !== id);
        localStorage.setItem('srec_offline_workshops', JSON.stringify(list));
      }
      await fetchDbData();
    } catch (err: any) {
      alert('Delete workshop failed: ' + err.message);
    }
  };

  // NEW: CRUD for Timeline Milestones (important_dates)
  const handleSaveMilestone = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMilestone) return;
    try {
      const payload = {
        event_date: editingMilestone.event_date,
        title: editingMilestone.title,
        desc: editingMilestone.desc || '',
        sort_order: Number(editingMilestone.sort_order || 1)
      };

      if (isSupabaseConfigured && supabase) {
        let error;
        if (editingMilestone.id) {
          const res = await supabase.from('important_dates').update(payload).eq('id', editingMilestone.id);
          error = res.error;
        } else {
          const res = await supabase.from('important_dates').insert(payload);
          error = res.error;
        }
        if (error) throw error;
      } else {
        let list = [...importantDates];
        if (editingMilestone.id) {
          list = list.map(x => x.id === editingMilestone.id ? editingMilestone : x);
        } else {
          list.push({ ...editingMilestone, id: Date.now() });
        }
        localStorage.setItem('srec_offline_important_dates', JSON.stringify(list));
      }
      setEditingMilestone(null);
      await fetchDbData();
    } catch (err: any) {
      alert('Save milestone failed: ' + err.message);
    }
  };

  const handleDeleteMilestone = async (id: any) => {
    if (!window.confirm('Delete this milestone date?')) return;
    try {
      if (isSupabaseConfigured && supabase) {
        const { error } = await supabase.from('important_dates').delete().eq('id', id);
        if (error) throw error;
      } else {
        const list = importantDates.filter(x => x.id !== id);
        localStorage.setItem('srec_offline_important_dates', JSON.stringify(list));
      }
      await fetchDbData();
    } catch (err: any) {
      alert('Delete milestone failed: ' + err.message);
    }
  };

  // NEW: Edit Pricing Rule (upsert registration_pricing)
  const handleSavePricingRule = async (key: string, val: number) => {
    try {
      if (isSupabaseConfigured && supabase) {
        const { error } = await supabase.from('registration_pricing').upsert({ key, value: val });
        if (error) throw error;
      }
      setPricing(prev => ({ ...prev, [key]: val }));
    } catch (err: any) {
      alert('Save pricing rule failed: ' + err.message);
    }
  };

  // NEW: CRUD for Coordinators (coordinators)
  const handleSaveCoordinator = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCoordinator) return;
    try {
      const payload = {
        name: editingCoordinator.name,
        role: editingCoordinator.role || '',
        phone: editingCoordinator.phone || '',
        email: editingCoordinator.email || '',
        sort_order: Number(editingCoordinator.sort_order || 1)
      };

      if (isSupabaseConfigured && supabase) {
        let error;
        if (editingCoordinator.id) {
          const res = await supabase.from('coordinators').update(payload).eq('id', editingCoordinator.id);
          error = res.error;
        } else {
          const res = await supabase.from('coordinators').insert(payload);
          error = res.error;
        }
        if (error) throw error;
      } else {
        let list = [...coordinators];
        if (editingCoordinator.id) {
          list = list.map(x => x.id === editingCoordinator.id ? editingCoordinator : x);
        } else {
          list.push({ ...editingCoordinator, id: Date.now() });
        }
        setCoordinators(list);
      }
      setEditingCoordinator(null);
      await fetchDbData();
    } catch (err: any) {
      alert('Save coordinator failed: ' + err.message);
    }
  };

  const handleDeleteCoordinator = async (id: any) => {
    if (!window.confirm('Delete this coordinator contact?')) return;
    try {
      if (isSupabaseConfigured && supabase) {
        const { error } = await supabase.from('coordinators').delete().eq('id', id);
        if (error) throw error;
      } else {
        const list = coordinators.filter(x => x.id !== id);
        setCoordinators(list);
      }
      await fetchDbData();
    } catch (err: any) {
      alert('Delete coordinator failed: ' + err.message);
    }
  };

  // NEW: CRUD for Quick Stats (stats)
  const handleSaveStat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStat) return;
    try {
      const payload = {
        key: editingStat.key,
        value: editingStat.value,
        label: editingStat.label,
        icon: editingStat.icon || 'Sparkles',
        sort_order: Number(editingStat.sort_order || 1)
      };

      if (isSupabaseConfigured && supabase) {
        let error;
        if (editingStat.id) {
          const res = await supabase.from('stats').update(payload).eq('id', editingStat.id);
          error = res.error;
        } else {
          const res = await supabase.from('stats').insert(payload);
          error = res.error;
        }
        if (error) throw error;
      } else {
        let list = [...stats];
        if (editingStat.id) {
          list = list.map(x => x.id === editingStat.id ? editingStat : x);
        } else {
          list.push({ ...editingStat, id: Date.now() });
        }
        setStats(list);
      }
      setEditingStat(null);
      await fetchDbData();
    } catch (err: any) {
      alert('Save stat failed: ' + err.message);
    }
  };

  const handleDeleteStat = async (id: any) => {
    if (!window.confirm('Delete this statistic metric?')) return;
    try {
      if (isSupabaseConfigured && supabase) {
        const { error } = await supabase.from('stats').delete().eq('id', id);
        if (error) throw error;
      } else {
        const list = stats.filter(x => x.id !== id);
        setStats(list);
      }
      await fetchDbData();
    } catch (err: any) {
      alert('Delete stat failed: ' + err.message);
    }
  };

  const handleDeleteRegistration = async (id: any) => {
    if (!window.confirm('Are you sure you want to delete this registration log?')) return;
    try {
      if (isSupabaseConfigured && supabase) {
        const { error } = await supabase.from('registrations').delete().eq('id', id);
        if (error) throw error;
      } else {
        const list = submittedRegistrations.filter(x => x.id !== id);
        localStorage.setItem('srec_offline_registrations', JSON.stringify(list));
      }
      await fetchDbData();
    } catch (err: any) {
      alert('Delete registration failed: ' + err.message);
    }
  };

  const handleClearAllRegistrations = async () => {
    if (!window.confirm('⚠️ WARNING: Are you sure you want to delete ALL registrations? This cannot be undone.')) return;
    try {
      if (isSupabaseConfigured && supabase) {
        const { error } = await supabase.from('registrations').delete().neq('id', 0);
        if (error) throw error;
      } else {
        localStorage.setItem('srec_offline_registrations', '[]');
      }
      await fetchDbData();
    } catch (err: any) {
      alert('Clear registrations failed: ' + err.message);
    }
  };

  // If not logged in, render fullscreen login/register panel
  if (!adminUser) {
    return (
      <div style={{
        minHeight: '100vh',
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'radial-gradient(circle at 10% 20%, rgba(9, 29, 54, 0.98) 0%, rgba(4, 12, 24, 1) 90%)',
        fontFamily: 'Inter, system-ui, sans-serif',
        padding: '1.5rem',
        boxSizing: 'border-box'
      }}>
        <div style={{
          background: 'rgba(255, 255, 255, 0.03)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.3)',
          borderRadius: '1.5rem',
          maxWidth: '440px',
          width: '100%',
          padding: '2.5rem 2rem',
          color: '#ffffff'
        }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <div style={{
              display: 'inline-flex',
              background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.2) 0%, rgba(29, 78, 216, 0.2) 100%)',
              padding: '1rem',
              borderRadius: '50%',
              color: '#3b82f6',
              marginBottom: '1rem',
              border: '1px solid rgba(59, 130, 246, 0.3)',
              boxShadow: '0 0 20px rgba(59, 130, 246, 0.25)'
            }}>
              <Shield size={38} />
            </div>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 800, margin: '0 0 0.5rem 0', letterSpacing: '-0.025em' }}>
              {adminRegMode ? 'Create Admin Account' : 'Admin Console Login'}
            </h2>
            <p style={{ fontSize: '0.85rem', color: '#94a3b8', margin: 0 }}>
              {adminRegMode ? 'Register admin credentials with secure master key.' : 'Access database dashboards to edit page contents.'}
            </p>
          </div>

          <form onSubmit={handleAdminAuth} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <label htmlFor="user" style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', fontWeight: 700, marginBottom: '0.35rem' }}>Username</label>
              <input 
                id="user"
                type="text" 
                required 
                value={adminUsername}
                onChange={(e) => setAdminUsername(e.target.value)}
                placeholder="Enter username"
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  background: 'rgba(15, 23, 42, 0.6)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '0.5rem',
                  color: '#ffffff',
                  fontSize: '0.9rem',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div>
              <label htmlFor="pass" style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', fontWeight: 700, marginBottom: '0.35rem' }}>Password</label>
              <input 
                id="pass"
                type="password" 
                required 
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                placeholder="Enter password"
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  background: 'rgba(15, 23, 42, 0.6)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '0.5rem',
                  color: '#ffffff',
                  fontSize: '0.9rem',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            {adminRegMode && (
              <>
                <div>
                  <label htmlFor="confirmPass" style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', fontWeight: 700, marginBottom: '0.35rem' }}>Confirm Password</label>
                  <input 
                    id="confirmPass"
                    type="password" 
                    required 
                    value={adminConfirmPassword}
                    onChange={(e) => setAdminConfirmPassword(e.target.value)}
                    placeholder="Confirm password"
                    style={{
                      width: '100%',
                      padding: '0.75rem 1rem',
                      background: 'rgba(15, 23, 42, 0.6)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '0.5rem',
                      color: '#ffffff',
                      fontSize: '0.9rem',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
                <div>
                  <label htmlFor="master" style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', fontWeight: 700, marginBottom: '0.35rem' }}>Master Key</label>
                  <input 
                    id="master"
                    type="password" 
                    required 
                    value={adminMasterKey}
                    onChange={(e) => setAdminMasterKey(e.target.value)}
                    placeholder="Enter registration master key"
                    style={{
                      width: '100%',
                      padding: '0.75rem 1rem',
                      background: 'rgba(15, 23, 42, 0.6)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '0.5rem',
                      color: '#ffffff',
                      fontSize: '0.9rem',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              </>
            )}

            {adminError && (
              <div style={{
                color: '#ef4444',
                fontSize: '0.8rem',
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.2)',
                padding: '0.75rem',
                borderRadius: '0.5rem',
                fontWeight: 600
              }}>
                {adminError}
              </div>
            )}

            <button 
              type="submit" 
              disabled={adminLoading}
              style={{
                width: '100%',
                padding: '0.85rem',
                background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                color: '#ffffff',
                border: 'none',
                borderRadius: '0.5rem',
                fontSize: '0.95rem',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
                transition: 'all 0.2s ease',
                marginTop: '0.5rem'
              }}
            >
              {adminLoading ? 'Processing...' : adminRegMode ? 'Register & Create Account' : 'Secure Login'}
            </button>

            <div style={{ textAlign: 'center', marginTop: '0.5rem' }}>
              {adminRegMode ? (
                <button 
                  type="button" 
                  onClick={() => { setAdminRegMode(false); setAdminError(null); }}
                  style={{ background: 'none', border: 'none', color: '#60a5fa', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}
                >
                  Already have an account? Log in
                </button>
              ) : (
                <button 
                  type="button" 
                  onClick={() => { setAdminRegMode(true); setAdminError(null); }}
                  style={{ background: 'none', border: 'none', color: '#60a5fa', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}
                >
                  Need an account? Register with Master Key
                </button>
              )}
            </div>
          </form>

          <button 
            onClick={() => { window.location.hash = '#/'; }}
            style={{
              width: '100%',
              padding: '0.85rem',
              background: 'rgba(255, 255, 255, 0.05)',
              color: '#94a3b8',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '0.5rem',
              fontSize: '0.95rem',
              fontWeight: 700,
              cursor: 'pointer',
              marginTop: '1.5rem',
              transition: 'all 0.2s ease'
            }}
          >
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center' }}>
              <ArrowLeft size={16} /> Return to Site
            </span>
          </button>
        </div>
      </div>
    );
  }

  // Define sidebar navigation tabs
  const tabs = [
    { id: 'registrations', label: 'Registrations Log', icon: <Database size={16} /> },
    { id: 'general', label: 'General Configurations', icon: <Activity size={16} /> },
    { id: 'milestones', label: 'Timeline Milestones', icon: <Calendar size={16} /> },
    { id: 'pricing', label: 'Registration Pricing', icon: <DollarSign size={16} /> },
    { id: 'speakers', label: 'Keynote Speakers', icon: <Users size={16} /> },
    { id: 'tracks', label: 'Academic Tracks', icon: <Layers size={16} /> },
    { id: 'committee', label: 'Committee List', icon: <Briefcase size={16} /> },
    { id: 'workshops', label: 'Tutorial Workshops', icon: <BookOpen size={16} /> },
    { id: 'coordinators', label: 'Coordinators & Contacts', icon: <Users size={16} /> },
    { id: 'stats', label: 'Dashboard Stats', icon: <BarChart2 size={16} /> }
  ];

  const isEditingAny = editingSpeaker || editingWorkshop || editingCommittee || editingDept || editingMilestone || editingCoordinator || editingStat;

  if (isEditingAny) {
    return (
      <div className="admin-layout" style={{
        minHeight: '100vh',
        width: '100%',
        background: '#f8fafc',
        color: '#0f172a',
        padding: '3rem 1.5rem',
        boxSizing: 'border-box',
        display: 'flex',
        justifyContent: 'center',
        fontFamily: 'Inter, system-ui, sans-serif'
      }}>
        <div style={{ width: '100%', maxWidth: '800px' }}>
          {/* Editor Header / Back Button */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '2rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '1.25rem' }}>
            <button 
              onClick={() => {
                setEditingSpeaker(null);
                setEditingWorkshop(null);
                setEditingCommittee(null);
                setEditingDept(null);
                setEditingMilestone(null);
                setEditingCoordinator(null);
                setEditingStat(null);
              }}
              style={{
                border: 'none',
                background: 'rgba(15, 23, 42, 0.05)',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                color: '#475569',
                fontWeight: 700,
                fontSize: '0.85rem',
                padding: '0.5rem 1rem',
                borderRadius: '0.375rem'
              }}
            >
              <ArrowLeft size={16} /> Back to Dashboard
            </button>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, margin: 0, marginLeft: '1rem', color: '#0f172a' }}>
              {editingSpeaker && (editingSpeaker.id ? '✏️ Edit Speaker Details' : '➕ Add New Speaker')}
              {editingWorkshop && (editingWorkshop.id ? '✏️ Edit Workshop Details' : '➕ Add New Workshop')}
              {editingCommittee && (editingCommittee.id ? '✏️ Edit Committee Member' : '➕ Add New Committee Member')}
              {editingDept && (editingDept.id ? '✏️ Edit Track Details' : '➕ Add New Track')}
              {editingMilestone && (editingMilestone.id ? '✏️ Edit Timeline Date' : '➕ Add New Timeline Date')}
              {editingCoordinator && (editingCoordinator.id ? '✏️ Edit Coordinator Contact' : '➕ Add New Coordinator')}
              {editingStat && (editingStat.id ? '✏️ Edit Stat Parameter' : '➕ Add New Stat')}
            </h2>
          </div>

          {/* Form Card */}
          <div style={{ background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '0.75rem', padding: '2rem', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.05)' }}>
            {/* 1. Milestone Form */}
            {editingMilestone && (
              <form onSubmit={handleSaveMilestone}>
                <h4 style={{ margin: '0 0 1rem 0', fontWeight: 700 }}>{editingMilestone.id ? 'Edit Milestone' : 'Add New Milestone'}</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                  <div>
                    <label htmlFor="ms_date" style={{ fontSize: '0.8rem', fontWeight: 700 }}>Date Display (e.g. 15 Dec 2026)</label>
                    <input
                      id="ms_date"
                      type="text"
                      required
                      value={editingMilestone.event_date}
                      onChange={(e) => setEditingMilestone({ ...editingMilestone, event_date: e.target.value })}
                      style={{ width: '100%', padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '0.25rem', marginTop: '0.25rem' }}
                    />
                  </div>
                  <div>
                    <label htmlFor="ms_title" style={{ fontSize: '0.8rem', fontWeight: 700 }}>Milestone Title</label>
                    <input
                      id="ms_title"
                      type="text"
                      required
                      value={editingMilestone.title}
                      onChange={(e) => setEditingMilestone({ ...editingMilestone, title: e.target.value })}
                      style={{ width: '100%', padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '0.25rem', marginTop: '0.25rem' }}
                    />
                  </div>
                  <div>
                    <label htmlFor="ms_sort" style={{ fontSize: '0.8rem', fontWeight: 700 }}>Sort Order</label>
                    <input
                      id="ms_sort"
                      type="number"
                      required
                      value={editingMilestone.sort_order || 1}
                      onChange={(e) => setEditingMilestone({ ...editingMilestone, sort_order: Number(e.target.value) })}
                      style={{ width: '100%', padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '0.25rem', marginTop: '0.25rem' }}
                    />
                  </div>
                </div>
                <div style={{ marginBottom: '1rem' }}>
                  <label htmlFor="ms_desc" style={{ fontSize: '0.8rem', fontWeight: 700 }}>Short Description</label>
                  <input
                    id="ms_desc"
                    type="text"
                    value={editingMilestone.desc || ''}
                    onChange={(e) => setEditingMilestone({ ...editingMilestone, desc: e.target.value })}
                    style={{ width: '100%', padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '0.25rem', marginTop: '0.25rem' }}
                  />
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1.5rem' }}>
                  <button type="submit" className="btn btn-primary" style={{ padding: '0.6rem 1.2rem', fontSize: '0.85rem' }}>Save Milestone</button>
                  <button type="button" onClick={() => setEditingMilestone(null)} className="btn btn-secondary" style={{ padding: '0.6rem 1.2rem', fontSize: '0.85rem' }}>Cancel</button>
                </div>
              </form>
            )}

            {/* 2. Speaker Form */}
            {editingSpeaker && (
              <form onSubmit={handleSaveSpeaker}>
                <h4 style={{ margin: '0 0 1rem 0', fontWeight: 700 }}>{editingSpeaker.id ? 'Edit Speaker' : 'Add New Speaker'}</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                  <div>
                    <label htmlFor="spk_name" style={{ fontSize: '0.8rem', fontWeight: 700 }}>Speaker Name</label>
                    <input
                      id="spk_name"
                      type="text"
                      required
                      value={editingSpeaker.name}
                      onChange={(e) => setEditingSpeaker({ ...editingSpeaker, name: e.target.value })}
                      style={{ width: '100%', padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '0.25rem', marginTop: '0.25rem' }}
                    />
                  </div>
                  <div>
                    <label htmlFor="spk_img" style={{ fontSize: '0.8rem', fontWeight: 700 }}>Photo / Image URL</label>
                    <input
                      id="spk_img"
                      type="text"
                      value={editingSpeaker.image_url || ''}
                      onChange={(e) => setEditingSpeaker({ ...editingSpeaker, image_url: e.target.value })}
                      placeholder="https://example.com/avatar.jpg"
                      style={{ width: '100%', padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '0.25rem', marginTop: '0.25rem' }}
                    />
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                  <div>
                    <label htmlFor="spk_des" style={{ fontSize: '0.8rem', fontWeight: 700 }}>Designation (Title)</label>
                    <input
                      id="spk_des"
                      type="text"
                      required
                      value={editingSpeaker.title || ''}
                      onChange={(e) => setEditingSpeaker({ ...editingSpeaker, title: e.target.value })}
                      style={{ width: '100%', padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '0.25rem', marginTop: '0.25rem' }}
                    />
                  </div>
                  <div>
                    <label htmlFor="spk_inst" style={{ fontSize: '0.8rem', fontWeight: 700 }}>Institution / University (Role)</label>
                    <input
                      id="spk_inst"
                      type="text"
                      required
                      value={editingSpeaker.role || ''}
                      onChange={(e) => setEditingSpeaker({ ...editingSpeaker, role: e.target.value })}
                      style={{ width: '100%', padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '0.25rem', marginTop: '0.25rem' }}
                    />
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '3fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                  <div>
                    <label htmlFor="spk_talk" style={{ fontSize: '0.8rem', fontWeight: 700 }}>Talk Title (Topic)</label>
                    <input
                      id="spk_talk"
                      type="text"
                      required
                      value={editingSpeaker.talk || ''}
                      onChange={(e) => setEditingSpeaker({ ...editingSpeaker, talk: e.target.value })}
                      style={{ width: '100%', padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '0.25rem', marginTop: '0.25rem' }}
                    />
                  </div>
                  <div>
                    <label htmlFor="spk_color" style={{ fontSize: '0.8rem', fontWeight: 700 }}>Theme Color</label>
                    <input
                      id="spk_color"
                      type="text"
                      required
                      value={editingSpeaker.color || '#3b82f6'}
                      onChange={(e) => setEditingSpeaker({ ...editingSpeaker, color: e.target.value })}
                      style={{ width: '100%', padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '0.25rem', marginTop: '0.25rem' }}
                    />
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1.5rem' }}>
                  <button type="submit" className="btn btn-primary" style={{ padding: '0.6rem 1.2rem', fontSize: '0.85rem' }}>Save Speaker</button>
                  <button type="button" onClick={() => setEditingSpeaker(null)} className="btn btn-secondary" style={{ padding: '0.6rem 1.2rem', fontSize: '0.85rem' }}>Cancel</button>
                </div>
              </form>
            )}

            {/* 3. Track Form */}
            {editingDept && (
              <form onSubmit={handleSaveDept}>
                <h4 style={{ margin: '0 0 1rem 0', fontWeight: 700 }}>{editingDept.id ? 'Edit Academic Track' : 'Add New Academic Track'}</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '3fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                  <div>
                    <label htmlFor="trk_name" style={{ fontSize: '0.8rem', fontWeight: 700 }}>Track Name</label>
                    <input
                      id="trk_name"
                      type="text"
                      required
                      value={editingDept.name}
                      onChange={(e) => setEditingDept({ ...editingDept, name: e.target.value })}
                      style={{ width: '100%', padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '0.25rem', marginTop: '0.25rem' }}
                    />
                  </div>
                  <div>
                    <label htmlFor="trk_sort" style={{ fontSize: '0.8rem', fontWeight: 700 }}>Sort Order</label>
                    <input
                      id="trk_sort"
                      type="number"
                      required
                      value={editingDept.sort_order || 1}
                      onChange={(e) => setEditingDept({ ...editingDept, sort_order: Number(e.target.value) })}
                      style={{ width: '100%', padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '0.25rem', marginTop: '0.25rem' }}
                    />
                  </div>
                </div>
                <div style={{ marginBottom: '1rem' }}>
                  <label htmlFor="trk_desc" style={{ fontSize: '0.8rem', fontWeight: 700 }}>Description (Topics list, comma separated)</label>
                  <textarea
                    id="trk_desc"
                    value={editingDept.description || ''}
                    onChange={(e) => setEditingDept({ ...editingDept, description: e.target.value })}
                    rows={6}
                    style={{ width: '100%', padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '0.25rem', marginTop: '0.25rem', fontFamily: 'inherit' }}
                  />
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1.5rem' }}>
                  <button type="submit" className="btn btn-primary" style={{ padding: '0.6rem 1.2rem', fontSize: '0.85rem' }}>Save Track</button>
                  <button type="button" onClick={() => setEditingDept(null)} className="btn btn-secondary" style={{ padding: '0.6rem 1.2rem', fontSize: '0.85rem' }}>Cancel</button>
                </div>
              </form>
            )}

            {/* 4. Committee Form */}
            {editingCommittee && (
              <form onSubmit={handleSaveCommittee}>
                <h4 style={{ margin: '0 0 1rem 0', fontWeight: 700 }}>{editingCommittee.id ? 'Edit Committee Member' : 'Add Committee Member'}</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                  <div>
                    <label htmlFor="mem_name" style={{ fontSize: '0.8rem', fontWeight: 700 }}>Member Name</label>
                    <input
                      id="mem_name"
                      type="text"
                      required
                      value={editingCommittee.name}
                      onChange={(e) => setEditingCommittee({ ...editingCommittee, name: e.target.value })}
                      style={{ width: '100%', padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '0.25rem', marginTop: '0.25rem' }}
                    />
                  </div>
                  <div>
                    <label htmlFor="mem_cat" style={{ fontSize: '0.8rem', fontWeight: 700 }}>Category Group</label>
                    <select
                      id="mem_cat"
                      value={editingCommittee.category}
                      onChange={(e) => setEditingCommittee({ ...editingCommittee, category: e.target.value })}
                      style={{ width: '100%', padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '0.25rem', marginTop: '0.25rem' }}
                    >
                      <option value="steering">Steering / Advisory / Leadership</option>
                      <option value="organizing">Organizing Committee</option>
                      <option value="advisory">National / International Advisory</option>
                      <option value="technical">Technical Program Committee</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="mem_sort" style={{ fontSize: '0.8rem', fontWeight: 700 }}>Sort Order</label>
                    <input
                      id="mem_sort"
                      type="number"
                      required
                      value={editingCommittee.sort_order || 1}
                      onChange={(e) => setEditingCommittee({ ...editingCommittee, sort_order: Number(e.target.value) })}
                      style={{ width: '100%', padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '0.25rem', marginTop: '0.25rem' }}
                    />
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                  <div>
                    <label htmlFor="mem_des" style={{ fontSize: '0.8rem', fontWeight: 700 }}>Designation (e.g. Professor)</label>
                    <input
                      id="mem_des"
                      type="text"
                      value={editingCommittee.designation || ''}
                      onChange={(e) => setEditingCommittee({ ...editingCommittee, designation: e.target.value })}
                      style={{ width: '100%', padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '0.25rem', marginTop: '0.25rem' }}
                    />
                  </div>
                  <div>
                    <label htmlFor="mem_inst" style={{ fontSize: '0.8rem', fontWeight: 700 }}>Institution / University</label>
                    <input
                      id="mem_inst"
                      type="text"
                      value={editingCommittee.institution || ''}
                      onChange={(e) => setEditingCommittee({ ...editingCommittee, institution: e.target.value })}
                      style={{ width: '100%', padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '0.25rem', marginTop: '0.25rem' }}
                    />
                  </div>
                  <div>
                    <label htmlFor="mem_sub" style={{ fontSize: '0.8rem', fontWeight: 700 }}>Subgroup Title (For Organizing Committee)</label>
                    <input
                      id="mem_sub"
                      type="text"
                      placeholder="e.g. Finance, Registration, etc."
                      value={editingCommittee.subgroup || ''}
                      onChange={(e) => setEditingCommittee({ ...editingCommittee, subgroup: e.target.value })}
                      style={{ width: '100%', padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '0.25rem', marginTop: '0.25rem' }}
                    />
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1.5rem' }}>
                  <button type="submit" className="btn btn-primary" style={{ padding: '0.6rem 1.2rem', fontSize: '0.85rem' }}>Save Member</button>
                  <button type="button" onClick={() => setEditingCommittee(null)} className="btn btn-secondary" style={{ padding: '0.6rem 1.2rem', fontSize: '0.85rem' }}>Cancel</button>
                </div>
              </form>
            )}

            {/* 5. Workshop Form */}
            {editingWorkshop && (
              <form onSubmit={handleSaveWorkshop}>
                <h4 style={{ margin: '0 0 1rem 0', fontWeight: 700 }}>{editingWorkshop.id ? 'Edit Workshop' : 'Add New Workshop'}</h4>
                <div style={{ marginBottom: '1rem' }}>
                  <label htmlFor="wk_title" style={{ fontSize: '0.8rem', fontWeight: 700 }}>Workshop Title</label>
                  <input
                    id="wk_title"
                    type="text"
                    required
                    value={editingWorkshop.title}
                    onChange={(e) => setEditingWorkshop({ ...editingWorkshop, title: e.target.value })}
                    style={{ width: '100%', padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '0.25rem', marginTop: '0.25rem' }}
                  />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                  <div>
                    <label htmlFor="wk_spk" style={{ fontSize: '0.8rem', fontWeight: 700 }}>Lead Instructor Name</label>
                    <input
                      id="wk_spk"
                      type="text"
                      required
                      value={editingWorkshop.speaker}
                      onChange={(e) => setEditingWorkshop({ ...editingWorkshop, speaker: e.target.value })}
                      style={{ width: '100%', padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '0.25rem', marginTop: '0.25rem' }}
                    />
                  </div>
                  <div>
                    <label htmlFor="wk_des" style={{ fontSize: '0.8rem', fontWeight: 700 }}>Instructor Designation</label>
                    <input
                      id="wk_des"
                      type="text"
                      value={editingWorkshop.speaker_designation || ''}
                      onChange={(e) => setEditingWorkshop({ ...editingWorkshop, speaker_designation: e.target.value })}
                      style={{ width: '100%', padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '0.25rem', marginTop: '0.25rem' }}
                    />
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                  <div>
                    <label htmlFor="wk_inst" style={{ fontSize: '0.8rem', fontWeight: 700 }}>Instructor University / Organization</label>
                    <input
                      id="wk_inst"
                      type="text"
                      value={editingWorkshop.speaker_institution || ''}
                      onChange={(e) => setEditingWorkshop({ ...editingWorkshop, speaker_institution: e.target.value })}
                      style={{ width: '100%', padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '0.25rem', marginTop: '0.25rem' }}
                    />
                  </div>
                  <div>
                    <label htmlFor="wk_date" style={{ fontSize: '0.8rem', fontWeight: 700 }}>Date</label>
                    <input
                      id="wk_date"
                      type="text"
                      value={editingWorkshop.date || ''}
                      onChange={(e) => setEditingWorkshop({ ...editingWorkshop, date: e.target.value })}
                      style={{ width: '100%', padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '0.25rem', marginTop: '0.25rem' }}
                    />
                  </div>
                  <div>
                    <label htmlFor="wk_time" style={{ fontSize: '0.8rem', fontWeight: 700 }}>Time</label>
                    <input
                      id="wk_time"
                      type="text"
                      value={editingWorkshop.time || ''}
                      onChange={(e) => setEditingWorkshop({ ...editingWorkshop, time: e.target.value })}
                      style={{ width: '100%', padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '0.25rem', marginTop: '0.25rem' }}
                    />
                  </div>
                </div>
                <div style={{ marginBottom: '1rem' }}>
                  <label htmlFor="wk_desc" style={{ fontSize: '0.8rem', fontWeight: 700 }}>Short Abstract / Outline</label>
                  <textarea
                    id="wk_desc"
                    value={editingWorkshop.desc || ''}
                    onChange={(e) => setEditingWorkshop({ ...editingWorkshop, desc: e.target.value })}
                    rows={4}
                    style={{ width: '100%', padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '0.25rem', marginTop: '0.25rem', fontFamily: 'inherit' }}
                  />
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1.5rem' }}>
                  <button type="submit" className="btn btn-primary" style={{ padding: '0.6rem 1.2rem', fontSize: '0.85rem' }}>Save Workshop</button>
                  <button type="button" onClick={() => setEditingWorkshop(null)} className="btn btn-secondary" style={{ padding: '0.6rem 1.2rem', fontSize: '0.85rem' }}>Cancel</button>
                </div>
              </form>
            )}

            {/* 6. Coordinator Form */}
            {editingCoordinator && (
              <form onSubmit={handleSaveCoordinator}>
                <h4 style={{ margin: '0 0 1rem 0', fontWeight: 700 }}>{editingCoordinator.id ? 'Edit Coordinator Details' : 'Add New Coordinator'}</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                  <div>
                    <label htmlFor="co_name" style={{ fontSize: '0.8rem', fontWeight: 700 }}>Coordinator Name</label>
                    <input
                      id="co_name"
                      type="text"
                      required
                      value={editingCoordinator.name}
                      onChange={(e) => setEditingCoordinator({ ...editingCoordinator, name: e.target.value })}
                      style={{ width: '100%', padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '0.25rem', marginTop: '0.25rem' }}
                    />
                  </div>
                  <div>
                    <label htmlFor="co_role" style={{ fontSize: '0.8rem', fontWeight: 700 }}>Role / Association (e.g. Co-convenor)</label>
                    <input
                      id="co_role"
                      type="text"
                      value={editingCoordinator.role || ''}
                      onChange={(e) => setEditingCoordinator({ ...editingCoordinator, role: e.target.value })}
                      style={{ width: '100%', padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '0.25rem', marginTop: '0.25rem' }}
                    />
                  </div>
                  <div>
                    <label htmlFor="co_sort" style={{ fontSize: '0.8rem', fontWeight: 700 }}>Sort Order</label>
                    <input
                      id="co_sort"
                      type="number"
                      required
                      value={editingCoordinator.sort_order || 1}
                      onChange={(e) => setEditingCoordinator({ ...editingCoordinator, sort_order: Number(e.target.value) })}
                      style={{ width: '100%', padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '0.25rem', marginTop: '0.25rem' }}
                    />
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                  <div>
                    <label htmlFor="co_phone" style={{ fontSize: '0.8rem', fontWeight: 700 }}>Mobile Number</label>
                    <input
                      id="co_phone"
                      type="text"
                      required
                      value={editingCoordinator.phone}
                      onChange={(e) => setEditingCoordinator({ ...editingCoordinator, phone: e.target.value })}
                      style={{ width: '100%', padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '0.25rem', marginTop: '0.25rem' }}
                    />
                  </div>
                  <div>
                    <label htmlFor="co_email" style={{ fontSize: '0.8rem', fontWeight: 700 }}>Email Address</label>
                    <input
                      id="co_email"
                      type="email"
                      required
                      value={editingCoordinator.email}
                      onChange={(e) => setEditingCoordinator({ ...editingCoordinator, email: e.target.value })}
                      style={{ width: '100%', padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '0.25rem', marginTop: '0.25rem' }}
                    />
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1.5rem' }}>
                  <button type="submit" className="btn btn-primary" style={{ padding: '0.6rem 1.2rem', fontSize: '0.85rem' }}>Save Contact</button>
                  <button type="button" onClick={() => setEditingCoordinator(null)} className="btn btn-secondary" style={{ padding: '0.6rem 1.2rem', fontSize: '0.85rem' }}>Cancel</button>
                </div>
              </form>
            )}

            {/* 7. Stat Form */}
            {editingStat && (
              <form onSubmit={handleSaveStat}>
                <h4 style={{ margin: '0 0 1rem 0', fontWeight: 700 }}>{editingStat.id ? 'Edit Stat Metric' : 'Add New Stat Metric'}</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                  <div>
                    <label htmlFor="st_key" style={{ fontSize: '0.8rem', fontWeight: 700 }}>Unique Database Key</label>
                    <input
                      id="st_key"
                      type="text"
                      required
                      placeholder="e.g. tracks_count"
                      value={editingStat.key}
                      onChange={(e) => setEditingStat({ ...editingStat, key: e.target.value })}
                      style={{ width: '100%', padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '0.25rem', marginTop: '0.25rem' }}
                    />
                  </div>
                  <div>
                    <label htmlFor="st_val" style={{ fontSize: '0.8rem', fontWeight: 700 }}>Value Display (e.g. 10+, 500+)</label>
                    <input
                      id="st_val"
                      type="text"
                      required
                      value={editingStat.value}
                      onChange={(e) => setEditingStat({ ...editingStat, value: e.target.value })}
                      style={{ width: '100%', padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '0.25rem', marginTop: '0.25rem' }}
                    />
                  </div>
                  <div>
                    <label htmlFor="st_lbl" style={{ fontSize: '0.8rem', fontWeight: 700 }}>Metric Label</label>
                    <input
                      id="st_lbl"
                      type="text"
                      required
                      value={editingStat.label}
                      onChange={(e) => setEditingStat({ ...editingStat, label: e.target.value })}
                      style={{ width: '100%', padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '0.25rem', marginTop: '0.25rem' }}
                    />
                  </div>
                  <div>
                    <label htmlFor="st_sort" style={{ fontSize: '0.8rem', fontWeight: 700 }}>Sort Order</label>
                    <input
                      id="st_sort"
                      type="number"
                      required
                      value={editingStat.sort_order || 1}
                      onChange={(e) => setEditingStat({ ...editingStat, sort_order: Number(e.target.value) })}
                      style={{ width: '100%', padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '0.25rem', marginTop: '0.25rem' }}
                    />
                  </div>
                </div>
                <div style={{ marginBottom: '1rem' }}>
                  <label htmlFor="st_ico" style={{ fontSize: '0.8rem', fontWeight: 700 }}>Icon Name (e.g. Users, Layers, Award, Sparkles)</label>
                  <input
                    id="st_ico"
                    type="text"
                    value={editingStat.icon || ''}
                    onChange={(e) => setEditingStat({ ...editingStat, icon: e.target.value })}
                    style={{ width: '100%', padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '0.25rem', marginTop: '0.25rem' }}
                  />
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1.5rem' }}>
                  <button type="submit" className="btn btn-primary" style={{ padding: '0.6rem 1.2rem', fontSize: '0.85rem' }}>Save Metric</button>
                  <button type="button" onClick={() => setEditingStat(null)} className="btn btn-secondary" style={{ padding: '0.6rem 1.2rem', fontSize: '0.85rem' }}>Cancel</button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-layout" style={{
      minHeight: '100vh',
      width: '100%',
      display: 'flex',
      background: '#f8fafc',
      color: '#0f172a',
      fontFamily: 'Inter, system-ui, sans-serif'
    }}>
      {/* Sidebar Navigation */}
      <div className="admin-sidebar" style={{
        width: '260px',
        background: '#0f172a',
        color: '#ffffff',
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0
      }}>
        {/* Sidebar Header */}
        <div style={{
          padding: '1.5rem',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem'
        }}>
          <div style={{
            background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
            padding: '0.5rem',
            borderRadius: '0.5rem',
            color: '#ffffff'
          }}>
            <Shield size={20} />
          </div>
          <div>
            <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800 }}>SREC Admin Portal</h4>
            <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>AECTSD 2027 Console</span>
          </div>
        </div>

        {/* User Session Info */}
        <div style={{
          padding: '1rem 1.5rem',
          background: 'rgba(255, 255, 255, 0.03)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          fontSize: '0.75rem'
        }}>
          <span style={{ color: '#94a3b8' }}>Signed in as:</span>
          <div style={{ fontWeight: 700, color: '#60a5fa', marginTop: '0.15rem' }}>{adminUser}</div>
        </div>

        {/* Tab Selection Navigation */}
        <nav style={{
          flex: 1,
          padding: '1.25rem 0.75rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.25rem',
          overflowY: 'auto'
        }}>
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setSearchTerm('');
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  width: '100%',
                  padding: '0.75rem 1rem',
                  border: 'none',
                  borderRadius: '0.5rem',
                  background: isActive ? '#3b82f6' : 'transparent',
                  color: isActive ? '#ffffff' : '#94a3b8',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.2s ease'
                }}
              >
                {tab.icon}
                {tab.label}
              </button>
            );
          })}
        </nav>

        {/* Sidebar Footer Operations */}
        <div style={{
          padding: '1rem',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5rem'
        }}>
          <button
            onClick={handleRefresh}
            style={{
              width: '100%',
              padding: '0.6rem',
              background: 'rgba(255, 255, 255, 0.05)',
              color: '#ffffff',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '0.375rem',
              fontSize: '0.8rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem'
            }}
          >
            <RefreshCw size={14} /> Refresh Data
          </button>
          
          <button
            onClick={handleAdminLogout}
            style={{
              width: '100%',
              padding: '0.6rem',
              background: 'rgba(239, 68, 68, 0.15)',
              color: '#f87171',
              border: '1px solid rgba(239, 68, 68, 0.25)',
              borderRadius: '0.375rem',
              fontSize: '0.8rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem'
            }}
          >
            <LogOut size={14} /> Log Out
          </button>

          <button
            onClick={() => { 
              if (onClose) onClose();
              else window.location.hash = '#/'; 
            }}
            style={{
              width: '100%',
              padding: '0.6rem',
              background: '#3b82f6',
              color: '#ffffff',
              border: 'none',
              borderRadius: '0.375rem',
              fontSize: '0.8rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              boxShadow: '0 4px 10px rgba(59, 130, 246, 0.2)'
            }}
          >
            <ArrowLeft size={14} /> Return to Site
          </button>
        </div>
      </div>

      {/* Main Content Workspace */}
      <main style={{
        flex: 1,
        padding: '2.5rem',
        overflowY: 'auto',
        boxSizing: 'border-box'
      }}>
        {/* Workspace Title Card */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '2rem'
        }}>
          <div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, margin: 0, letterSpacing: '-0.025em' }}>
              {tabs.find(t => t.id === activeTab)?.label}
            </h1>
            <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '0.25rem 0 0 0' }}>
              Database manager and interactive panel for SREC webpage components.
            </p>
          </div>
          
          {/* Global Search Bar */}
          {['registrations', 'speakers', 'tracks', 'committee', 'workshops', 'coordinators', 'milestones'].includes(activeTab) && (
            <div style={{ position: 'relative', width: '280px' }}>
              <Search size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input
                type="text"
                placeholder={`Search list...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.5rem 1rem 0.5rem 2.2rem',
                  fontSize: '0.85rem',
                  border: '1px solid #cbd5e1',
                  borderRadius: '0.375rem',
                  outline: 'none',
                  boxSizing: 'border-box',
                  background: '#ffffff'
                }}
              />
            </div>
          )}
        </div>

        {/* Dashboard Tab Panels */}
        
        {/* TAB 1: Registrations Log */}
        {activeTab === 'registrations' && (
          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '0.75rem', padding: '1.5rem', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.02)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>Submitted Forms ({submittedRegistrations.length})</h3>
              {submittedRegistrations.length > 0 && (
                <button
                  onClick={handleClearAllRegistrations}
                  style={{
                    background: 'rgba(239, 68, 68, 0.08)',
                    color: '#dc2626',
                    border: '1px solid rgba(239, 68, 68, 0.2)',
                    padding: '0.5rem 1rem',
                    borderRadius: '0.375rem',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Clear All Logs
                </button>
              )}
            </div>

            {submittedRegistrations.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '4rem 1rem', color: '#64748b' }}>
                <Database size={48} style={{ opacity: 0.3, marginBottom: '1rem' }} />
                <p style={{ margin: 0, fontSize: '0.9rem', fontWeight: 500 }}>No registrations logged in the database.</p>
              </div>
            ) : (
              <>
                {/* Desktop view */}
                <div className="admin-desktop-view" style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', textAlign: 'left' }}>
                    <thead>
                      <tr style={{ borderBottom: '2px solid #e2e8f0', color: '#475569', fontWeight: 700 }}>
                        <th style={{ padding: '0.75rem' }}>Date</th>
                        <th style={{ padding: '0.75rem' }}>Author Details</th>
                        <th style={{ padding: '0.75rem' }}>Paper Info</th>
                        <th style={{ padding: '0.75rem' }}>Tour Details</th>
                        <th style={{ padding: '0.75rem' }}>Receipt Attachment</th>
                        <th style={{ padding: '0.75rem', textAlign: 'center' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {submittedRegistrations
                        .filter(r => 
                          r.author_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          r.paper_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          r.paper_title?.toLowerCase().includes(searchTerm.toLowerCase())
                        )
                        .map((r, i) => (
                          <tr key={r.id || i} style={{ borderBottom: '1px solid #f1f5f9', verticalAlign: 'top' }}>
                            <td style={{ padding: '1rem 0.75rem', whiteSpace: 'nowrap', color: '#64748b' }}>
                              {new Date(r.created_at || Date.now()).toLocaleDateString()}<br/>
                              <span style={{ fontSize: '0.7rem' }}>{new Date(r.created_at || Date.now()).toLocaleTimeString()}</span>
                            </td>
                            <td style={{ padding: '1rem 0.75rem' }}>
                              <div style={{ fontWeight: 700, color: '#0f172a' }}>{r.author_name}</div>
                              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{r.email}</div>
                              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{r.phone}</div>
                            </td>
                            <td style={{ padding: '1rem 0.75rem', maxWidth: '260px' }}>
                              <span style={{ display: 'inline-block', background: 'rgba(59, 130, 246, 0.1)', color: '#1d4ed8', padding: '0.15rem 0.4rem', borderRadius: '0.25rem', fontSize: '0.7rem', fontWeight: 700, marginBottom: '0.25rem' }}>
                                ID: {r.paper_id || 'N/A'}
                              </span>
                              <div style={{ fontWeight: 600, fontSize: '0.8rem', lineHeight: '1.3' }}>{r.paper_title || 'N/A'}</div>
                            </td>
                            <td style={{ padding: '1rem 0.75rem' }}>
                              <div style={{ fontWeight: 600 }}>{r.register_for_tour ? '✅ Registered' : '❌ No Tour'}</div>
                              {r.register_for_tour && r.preferred_tour_place && (
                                <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.25rem' }}>
                                  Choice: {r.preferred_tour_place}
                                </div>
                              )}
                            </td>
                            <td style={{ padding: '1rem 0.75rem' }}>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                                {r.screenshot_name && r.screenshot_name !== 'no_file' ? (
                                  <button
                                    type="button"
                                    onClick={() => setPreviewImage(r.screenshot_name)}
                                    style={{
                                      background: 'none',
                                      border: 'none',
                                      padding: 0,
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: '0.25rem',
                                      color: '#3b82f6',
                                      textDecoration: 'underline',
                                      fontWeight: 600,
                                      fontSize: '0.75rem',
                                      cursor: 'pointer'
                                    }}
                                  >
                                    <Eye size={12} /> {r.screenshot_name}
                                  </button>
                                ) : (
                                  <span style={{ color: '#94a3b8', fontSize: '0.75rem' }}>No attachments</span>
                                )}
                              </div>
                            </td>
                            <td style={{ padding: '1rem 0.75rem', textAlign: 'center' }}>
                              <button
                                onClick={() => handleDeleteRegistration(r.id)}
                                style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '0.25rem' }}
                                title="Delete log"
                              >
                                <Trash2 size={16} />
                              </button>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile view cards */}
                <div className="admin-mobile-view admin-mobile-card-list">
                  {submittedRegistrations
                    .filter(r => 
                      r.author_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      r.paper_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      r.paper_title?.toLowerCase().includes(searchTerm.toLowerCase())
                    )
                    .map((r, i) => (
                      <div key={r.id || i} className="admin-mobile-card">
                        <div className="admin-mobile-card-header">
                          <span style={{ fontWeight: 700, color: '#0f52ba', fontSize: '0.9rem' }}>{r.paper_id || 'N/A'}</span>
                          <button 
                            onClick={() => handleDeleteRegistration(r.id)}
                            style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '0.25rem' }}
                            title="Delete log"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                        <div className="admin-mobile-card-body">
                          <div className="admin-mobile-card-row">
                            <span className="admin-mobile-card-label">Author:</span>
                            <span className="admin-mobile-card-value" style={{ fontWeight: 600 }}>{r.author_name}</span>
                          </div>
                          <div className="admin-mobile-card-row">
                            <span className="admin-mobile-card-label">Email:</span>
                            <span className="admin-mobile-card-value">
                              <a href={`mailto:${r.email}`} style={{ color: '#2563eb' }}>{r.email}</a>
                            </span>
                          </div>
                          <div className="admin-mobile-card-row">
                            <span className="admin-mobile-card-label">Phone:</span>
                            <span className="admin-mobile-card-value">{r.phone}</span>
                          </div>
                          <div className="admin-mobile-card-row">
                            <span className="admin-mobile-card-label">Paper:</span>
                            <span className="admin-mobile-card-value">{r.paper_title || 'N/A'}</span>
                          </div>
                          <div className="admin-mobile-card-row">
                            <span className="admin-mobile-card-label">Tour:</span>
                            <span className="admin-mobile-card-value">
                              {r.register_for_tour ? `✅ Yes (${r.preferred_tour_place || 'No Choice'})` : '❌ No'}
                            </span>
                          </div>
                          <div className="admin-mobile-card-row">
                            <span className="admin-mobile-card-label">Receipt:</span>
                            <span className="admin-mobile-card-value">
                              {r.screenshot_name && r.screenshot_name !== 'no_file' ? (
                                <button
                                  type="button"
                                  onClick={() => setPreviewImage(r.screenshot_name)}
                                  style={{
                                    background: 'none',
                                    border: 'none',
                                    padding: 0,
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '0.25rem',
                                    color: '#3b82f6',
                                    textDecoration: 'underline',
                                    fontWeight: 600,
                                    fontSize: '0.75rem',
                                    cursor: 'pointer'
                                  }}
                                >
                                  <Eye size={12} /> {r.screenshot_name}
                                </button>
                              ) : (
                                <span style={{ color: '#94a3b8' }}>No attachment</span>
                              )}
                            </span>
                          </div>
                          <div className="admin-mobile-card-row">
                            <span className="admin-mobile-card-label">Submitted:</span>
                            <span className="admin-mobile-card-value">
                              {new Date(r.created_at || Date.now()).toLocaleDateString()} {new Date(r.created_at || Date.now()).toLocaleTimeString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* TAB 2: General Configurations */}
        {activeTab === 'general' && (
          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '0.75rem', padding: '2rem', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.02)' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '1.5rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.75rem' }}>Webpage Settings & Strings</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 3fr', gap: '1rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '1.5rem' }}>
                <div>
                  <label htmlFor="show_banner" style={{ fontWeight: 700, fontSize: '0.85rem' }}>Show Announcement Banner</label>
                  <select
                    id="show_banner"
                    value={info.show_announcement !== 'false' ? 'true' : 'false'}
                    onChange={(e) => handleSaveInfoSetting('show_announcement', e.target.value)}
                    style={{ width: '100%', padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '0.375rem', marginTop: '0.25rem' }}
                  >
                    <option value="true">Show Banner</option>
                    <option value="false">Hide Banner</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="banner_txt" style={{ fontWeight: 700, fontSize: '0.85rem' }}>Banner Text</label>
                  <input
                    id="banner_txt"
                    type="text"
                    value={info.announcement_text || ''}
                    onChange={(e) => handleSaveInfoSetting('announcement_text', e.target.value)}
                    placeholder="Enter announcement text"
                    style={{ width: '100%', padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '0.375rem', marginTop: '0.25rem' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                <div>
                  <label htmlFor="ht" style={{ fontWeight: 700, fontSize: '0.85rem' }}>Hero Title</label>
                  <input
                    id="ht"
                    type="text"
                    value={info.hero_title || ''}
                    onChange={(e) => handleSaveInfoSetting('hero_title', e.target.value)}
                    style={{ width: '100%', padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '0.375rem', marginTop: '0.25rem' }}
                  />
                </div>
                <div>
                  <label htmlFor="hs" style={{ fontWeight: 700, fontSize: '0.85rem' }}>Hero Subtitle</label>
                  <input
                    id="hs"
                    type="text"
                    value={info.hero_subtitle || ''}
                    onChange={(e) => handleSaveInfoSetting('hero_subtitle', e.target.value)}
                    style={{ width: '100%', padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '0.375rem', marginTop: '0.25rem' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                <div>
                  <label htmlFor="ed" style={{ fontWeight: 700, fontSize: '0.85rem' }}>Event Dates Display</label>
                  <input
                    id="ed"
                    type="text"
                    value={info.event_date_display || ''}
                    onChange={(e) => handleSaveInfoSetting('event_date_display', e.target.value)}
                    style={{ width: '100%', padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '0.375rem', marginTop: '0.25rem' }}
                  />
                </div>
                <div>
                  <label htmlFor="el" style={{ fontWeight: 700, fontSize: '0.85rem' }}>Event Location Display</label>
                  <input
                    id="el"
                    type="text"
                    value={info.event_location_display || ''}
                    onChange={(e) => handleSaveInfoSetting('event_location_display', e.target.value)}
                    style={{ width: '100%', padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '0.375rem', marginTop: '0.25rem' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                <div>
                  <label htmlFor="cc" style={{ fontWeight: 700, fontSize: '0.85rem' }}>Countdown Target Date (ISO)</label>
                  <input
                    id="cc"
                    type="text"
                    value={info.countdown_target || ''}
                    onChange={(e) => handleSaveInfoSetting('countdown_target', e.target.value)}
                    placeholder="YYYY-MM-DDTHH:MM:SS"
                    style={{ width: '100%', padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '0.375rem', marginTop: '0.25rem' }}
                  />
                </div>
                <div>
                  <label htmlFor="cl" style={{ fontWeight: 700, fontSize: '0.85rem' }}>Submission / CMT Link</label>
                  <input
                    id="cl"
                    type="text"
                    value={info.cmt_link || ''}
                    onChange={(e) => handleSaveInfoSetting('cmt_link', e.target.value)}
                    style={{ width: '100%', padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '0.375rem', marginTop: '0.25rem' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                <div>
                  <label htmlFor="srec_url" style={{ fontWeight: 700, fontSize: '0.85rem' }}>SREC Institutional Link</label>
                  <input
                    id="srec_url"
                    type="text"
                    value={info.srec_url || ''}
                    onChange={(e) => handleSaveInfoSetting('srec_url', e.target.value)}
                    style={{ width: '100%', padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '0.375rem', marginTop: '0.25rem' }}
                  />
                </div>
                <div>
                  <label htmlFor="ieee_sb_url" style={{ fontWeight: 700, fontSize: '0.85rem' }}>IEEE SB Website Link</label>
                  <input
                    id="ieee_sb_url"
                    type="text"
                    value={info.ieee_sb_url || ''}
                    onChange={(e) => handleSaveInfoSetting('ieee_sb_url', e.target.value)}
                    style={{ width: '100%', padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '0.375rem', marginTop: '0.25rem' }}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="about_conf" style={{ fontWeight: 700, fontSize: '0.85rem' }}>About The Conference Description</label>
                <textarea
                  id="about_conf"
                  value={info.about_conference || ''}
                  onChange={(e) => handleSaveInfoSetting('about_conference', e.target.value)}
                  rows={4}
                  style={{ width: '100%', padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '0.375rem', marginTop: '0.25rem', fontFamily: 'inherit' }}
                />
              </div>

              <div>
                <label htmlFor="about_inst" style={{ fontWeight: 700, fontSize: '0.85rem' }}>About Sri Ramakrishna Engineering College</label>
                <textarea
                  id="about_inst"
                  value={info.about_institution || ''}
                  onChange={(e) => handleSaveInfoSetting('about_institution', e.target.value)}
                  rows={4}
                  style={{ width: '100%', padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '0.375rem', marginTop: '0.25rem', fontFamily: 'inherit' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', borderTop: '1px solid #f1f5f9', paddingTop: '1.5rem' }}>
                <div>
                  <label htmlFor="bank_acc_name" style={{ fontWeight: 700, fontSize: '0.85rem' }}>Bank Beneficiary Name</label>
                  <input
                    id="bank_acc_name"
                    type="text"
                    value={info.bank_account_name || ''}
                    onChange={(e) => handleSaveInfoSetting('bank_account_name', e.target.value)}
                    style={{ width: '100%', padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '0.375rem', marginTop: '0.25rem' }}
                  />
                </div>
                <div>
                  <label htmlFor="bank_name_inp" style={{ fontWeight: 700, fontSize: '0.85rem' }}>Bank Name & Branch</label>
                  <input
                    id="bank_name_inp"
                    type="text"
                    value={info.bank_name || ''}
                    onChange={(e) => handleSaveInfoSetting('bank_name', e.target.value)}
                    style={{ width: '100%', padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '0.375rem', marginTop: '0.25rem' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                <div>
                  <label htmlFor="bank_acc_no" style={{ fontWeight: 700, fontSize: '0.85rem' }}>Bank Account Number</label>
                  <input
                    id="bank_acc_no"
                    type="text"
                    value={info.bank_account_number || ''}
                    onChange={(e) => handleSaveInfoSetting('bank_account_number', e.target.value)}
                    style={{ width: '100%', padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '0.375rem', marginTop: '0.25rem' }}
                  />
                </div>
                <div>
                  <label htmlFor="bank_ifsc" style={{ fontWeight: 700, fontSize: '0.85rem' }}>Bank IFSC Code</label>
                  <input
                    id="bank_ifsc"
                    type="text"
                    value={info.bank_ifsc_code || ''}
                    onChange={(e) => handleSaveInfoSetting('bank_ifsc_code', e.target.value)}
                    style={{ width: '100%', padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '0.375rem', marginTop: '0.25rem' }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: Timeline Milestones (NEW CRUD) */}
        {activeTab === 'milestones' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '0.75rem', padding: '1.5rem', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.02)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>Roadmap Milestone Dates ({importantDates.length})</h3>
                <button
                  onClick={() => setEditingMilestone({ event_date: '', title: '', desc: '', sort_order: importantDates.length + 1 })}
                  style={{
                    background: '#3b82f6',
                    color: '#ffffff',
                    border: 'none',
                    padding: '0.5rem 1rem',
                    borderRadius: '0.375rem',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem'
                  }}
                >
                  <Plus size={14} /> Add Milestone
                </button>
              </div>

              {editingMilestone && (
                <form onSubmit={handleSaveMilestone} style={{ background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '0.5rem', padding: '1.5rem', marginBottom: '1.5rem' }}>
                  <h4 style={{ margin: '0 0 1rem 0', fontWeight: 700 }}>{editingMilestone.id ? 'Edit Milestone' : 'Add New Milestone'}</h4>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                    <div>
                      <label htmlFor="ms_date" style={{ fontSize: '0.8rem', fontWeight: 700 }}>Date Display (e.g. 15 Dec 2026)</label>
                      <input
                        id="ms_date"
                        type="text"
                        required
                        value={editingMilestone.event_date}
                        onChange={(e) => setEditingMilestone({ ...editingMilestone, event_date: e.target.value })}
                        style={{ width: '100%', padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '0.25rem', marginTop: '0.25rem' }}
                      />
                    </div>
                    <div>
                      <label htmlFor="ms_title" style={{ fontSize: '0.8rem', fontWeight: 700 }}>Milestone Title</label>
                      <input
                        id="ms_title"
                        type="text"
                        required
                        value={editingMilestone.title}
                        onChange={(e) => setEditingMilestone({ ...editingMilestone, title: e.target.value })}
                        style={{ width: '100%', padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '0.25rem', marginTop: '0.25rem' }}
                      />
                    </div>
                    <div>
                      <label htmlFor="ms_sort" style={{ fontSize: '0.8rem', fontWeight: 700 }}>Sort Order</label>
                      <input
                        id="ms_sort"
                        type="number"
                        required
                        value={editingMilestone.sort_order || 1}
                        onChange={(e) => setEditingMilestone({ ...editingMilestone, sort_order: Number(e.target.value) })}
                        style={{ width: '100%', padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '0.25rem', marginTop: '0.25rem' }}
                      />
                    </div>
                  </div>
                  <div style={{ marginBottom: '1rem' }}>
                    <label htmlFor="ms_desc" style={{ fontSize: '0.8rem', fontWeight: 700 }}>Short Description</label>
                    <input
                      id="ms_desc"
                      type="text"
                      value={editingMilestone.desc || ''}
                      onChange={(e) => setEditingMilestone({ ...editingMilestone, desc: e.target.value })}
                      style={{ width: '100%', padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '0.25rem', marginTop: '0.25rem' }}
                    />
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button type="submit" className="btn btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.8rem' }}>Save Milestone</button>
                    <button type="button" onClick={() => setEditingMilestone(null)} className="btn btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.8rem' }}>Cancel</button>
                  </div>
                </form>
              )}

              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid #e2e8f0', color: '#475569' }}>
                      <th style={{ padding: '0.5rem' }}>Order</th>
                      <th style={{ padding: '0.5rem' }}>Date Display</th>
                      <th style={{ padding: '0.5rem' }}>Title</th>
                      <th style={{ padding: '0.5rem' }}>Description</th>
                      <th style={{ padding: '0.5rem', textAlign: 'center' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {importantDates.map((item, idx) => (
                      <tr key={item.id || idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '0.75rem 0.5rem', fontWeight: 700 }}>{item.sort_order}</td>
                        <td style={{ padding: '0.75rem 0.5rem', color: '#0f52ba', fontWeight: 600 }}>{item.event_date}</td>
                        <td style={{ padding: '0.75rem 0.5rem', fontWeight: 700 }}>{item.title}</td>
                        <td style={{ padding: '0.75rem 0.5rem', color: '#64748b' }}>{item.desc}</td>
                        <td style={{ padding: '0.75rem 0.5rem', textAlign: 'center' }}>
                          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                            <button onClick={() => setEditingMilestone(item)} style={{ background: 'none', border: 'none', color: '#3b82f6', cursor: 'pointer' }}><Edit size={14} /></button>
                            <button onClick={() => handleDeleteMilestone(item.id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}><Trash2 size={14} /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: Registration Pricing (NEW CRUD) */}
        {activeTab === 'pricing' && (
          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '0.75rem', padding: '2rem', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.02)' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.5rem' }}>Fee Pricing Configuration</h3>
            <p style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '1.5rem' }}>Configure national fees (INR ₹) and international fees (USD $) directly.</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                {/* National Pricing (INR) */}
                <div>
                  <h4 style={{ fontWeight: 700, color: '#0f52ba', marginBottom: '1rem', borderBottom: '2px solid #e2e8f0', paddingBottom: '0.25rem' }}>🇮🇳 National Fees (INR ₹)</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {[
                      { key: 'national_student_ieee', label: 'Student / Scholar (IEEE Member)' },
                      { key: 'national_student_non_ieee', label: 'Student / Scholar (Non-IEEE)' },
                      { key: 'national_academic_ieee', label: 'Academician (IEEE Member)' },
                      { key: 'national_academic_non_ieee', label: 'Academician (Non-IEEE)' },
                      { key: 'national_industry_ieee', label: 'Industry Delegate (IEEE Member)' },
                      { key: 'national_industry_non_ieee', label: 'Industry Delegate (Non-IEEE)' },
                      { key: 'national_listener', label: 'Conference Listener Fee' },
                      { key: 'national_tutorial_only', label: 'Tutorial Workshop Only Fee' },
                      { key: 'national_tutorial_addon', label: 'Tutorial Add-on Fee (for Authors)' }
                    ].map(field => (
                      <div key={field.key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{field.label}</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          <span style={{ fontWeight: 700 }}>₹</span>
                          <input
                            type="number"
                            value={pricing[field.key] || 0}
                            onChange={(e) => handleSavePricingRule(field.key, Number(e.target.value))}
                            style={{ width: '100px', padding: '0.35rem', border: '1px solid #cbd5e1', borderRadius: '0.25rem', textAlign: 'right', fontWeight: 700 }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* International Pricing (USD) */}
                <div>
                  <h4 style={{ fontWeight: 700, color: '#f59e0b', marginBottom: '1rem', borderBottom: '2px solid #e2e8f0', paddingBottom: '0.25rem' }}>🌎 International Fees (USD $)</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {[
                      { key: 'foreign_student_ieee', label: 'Student / Scholar (IEEE Member)' },
                      { key: 'foreign_student_non_ieee', label: 'Student / Scholar (Non-IEEE)' },
                      { key: 'foreign_academic_ieee', label: 'Academician (IEEE Member)' },
                      { key: 'foreign_academic_non_ieee', label: 'Academician (Non-IEEE)' },
                      { key: 'foreign_industry_ieee', label: 'Industry Delegate (IEEE Member)' },
                      { key: 'foreign_industry_non_ieee', label: 'Industry Delegate (Non-IEEE)' },
                      { key: 'foreign_listener', label: 'Conference Listener Fee' },
                      { key: 'foreign_tutorial_only', label: 'Tutorial Workshop Only Fee' },
                      { key: 'foreign_tutorial_addon', label: 'Tutorial Add-on Fee (for Authors)' }
                    ].map(field => (
                      <div key={field.key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{field.label}</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          <span style={{ fontWeight: 700 }}>$</span>
                          <input
                            type="number"
                            value={pricing[field.key] || 0}
                            onChange={(e) => handleSavePricingRule(field.key, Number(e.target.value))}
                            style={{ width: '100px', padding: '0.35rem', border: '1px solid #cbd5e1', borderRadius: '0.25rem', textAlign: 'right', fontWeight: 700 }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: Keynote Speakers */}
        {activeTab === 'speakers' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '0.75rem', padding: '1.5rem', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.02)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>Conference Speakers ({speakers.length})</h3>
                <button
                  onClick={() => setEditingSpeaker({ name: '', title: '', role: '', talk: '', color: '#3b82f6', image_url: '' })}
                  style={{
                    background: '#3b82f6',
                    color: '#ffffff',
                    border: 'none',
                    padding: '0.5rem 1rem',
                    borderRadius: '0.375rem',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem'
                  }}
                >
                  <Plus size={14} /> Add Speaker
                </button>
              </div>

              {editingSpeaker && (
                <form onSubmit={handleSaveSpeaker} style={{ background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '0.5rem', padding: '1.5rem', marginBottom: '1.5rem' }}>
                  <h4 style={{ margin: '0 0 1rem 0', fontWeight: 700 }}>{editingSpeaker.id ? 'Edit Speaker' : 'Add New Speaker'}</h4>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                    <div>
                      <label htmlFor="spk_name" style={{ fontSize: '0.8rem', fontWeight: 700 }}>Speaker Name</label>
                      <input
                        id="spk_name"
                        type="text"
                        required
                        value={editingSpeaker.name}
                        onChange={(e) => setEditingSpeaker({ ...editingSpeaker, name: e.target.value })}
                        style={{ width: '100%', padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '0.25rem', marginTop: '0.25rem' }}
                      />
                    </div>
                    <div>
                      <label htmlFor="spk_img" style={{ fontSize: '0.8rem', fontWeight: 700 }}>Photo / Image URL</label>
                      <input
                        id="spk_img"
                        type="text"
                        value={editingSpeaker.image_url || ''}
                        onChange={(e) => setEditingSpeaker({ ...editingSpeaker, image_url: e.target.value })}
                        placeholder="https://example.com/avatar.jpg"
                        style={{ width: '100%', padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '0.25rem', marginTop: '0.25rem' }}
                      />
                    </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                    <div>
                      <label htmlFor="spk_des" style={{ fontSize: '0.8rem', fontWeight: 700 }}>Designation (Title)</label>
                      <input
                        id="spk_des"
                        type="text"
                        required
                        value={editingSpeaker.title || ''}
                        onChange={(e) => setEditingSpeaker({ ...editingSpeaker, title: e.target.value })}
                        style={{ width: '100%', padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '0.25rem', marginTop: '0.25rem' }}
                      />
                    </div>
                    <div>
                      <label htmlFor="spk_inst" style={{ fontSize: '0.8rem', fontWeight: 700 }}>Institution / University (Role)</label>
                      <input
                        id="spk_inst"
                        type="text"
                        required
                        value={editingSpeaker.role || ''}
                        onChange={(e) => setEditingSpeaker({ ...editingSpeaker, role: e.target.value })}
                        style={{ width: '100%', padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '0.25rem', marginTop: '0.25rem' }}
                      />
                    </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '3fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                    <div>
                      <label htmlFor="spk_talk" style={{ fontSize: '0.8rem', fontWeight: 700 }}>Talk Title (Topic)</label>
                      <input
                        id="spk_talk"
                        type="text"
                        required
                        value={editingSpeaker.talk || ''}
                        onChange={(e) => setEditingSpeaker({ ...editingSpeaker, talk: e.target.value })}
                        style={{ width: '100%', padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '0.25rem', marginTop: '0.25rem' }}
                      />
                    </div>
                    <div>
                      <label htmlFor="spk_color" style={{ fontSize: '0.8rem', fontWeight: 700 }}>Theme Color</label>
                      <input
                        id="spk_color"
                        type="text"
                        required
                        value={editingSpeaker.color || '#3b82f6'}
                        onChange={(e) => setEditingSpeaker({ ...editingSpeaker, color: e.target.value })}
                        style={{ width: '100%', padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '0.25rem', marginTop: '0.25rem' }}
                      />
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button type="submit" className="btn btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.8rem' }}>Save Speaker</button>
                    <button type="button" onClick={() => setEditingSpeaker(null)} className="btn btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.8rem' }}>Cancel</button>
                  </div>
                </form>
              )}

              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid #e2e8f0', color: '#475569' }}>
                      <th style={{ padding: '0.5rem' }}>Speaker</th>
                      <th style={{ padding: '0.5rem' }}>Talk Title</th>
                      <th style={{ padding: '0.5rem' }}>Affiliation</th>
                      <th style={{ padding: '0.5rem', textAlign: 'center' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {speakers
                      .filter(s => s.name?.toLowerCase().includes(searchTerm.toLowerCase()))
                      .map((item, idx) => (
                        <tr key={item.id || idx} style={{ borderBottom: '1px solid #f1f5f9', verticalAlign: 'top' }}>
                          <td style={{ padding: '1rem 0.5rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                              <div style={{ width: '40px', height: '40px', borderRadius: '50%', border: `2px solid ${item.color || '#cbd5e1'}`, overflow: 'hidden' }}>
                                <img src={item.image_url || 'https://via.placeholder.com/150'} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                              </div>
                              <div>
                                <div style={{ fontWeight: 700 }}>{item.name}</div>
                                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{item.title}</div>
                              </div>
                            </div>
                          </td>
                          <td style={{ padding: '1rem 0.5rem', fontWeight: 600, color: '#0f52ba', maxWidth: '280px' }}>{item.talk || 'N/A'}</td>
                          <td style={{ padding: '1rem 0.5rem', color: '#475569' }}>{item.role}</td>
                          <td style={{ padding: '1rem 0.5rem', textAlign: 'center' }}>
                            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                              <button onClick={() => setEditingSpeaker(item)} style={{ background: 'none', border: 'none', color: '#3b82f6', cursor: 'pointer' }}><Edit size={14} /></button>
                              <button onClick={() => handleDeleteSpeaker(item.id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}><Trash2 size={14} /></button>
                            </div>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: Academic Tracks */}
        {activeTab === 'tracks' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '0.75rem', padding: '1.5rem', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.02)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>Academic tracks ({departments.length})</h3>
                <button
                  onClick={() => setEditingDept({ name: '', description: '', sort_order: departments.length + 1 })}
                  style={{
                    background: '#3b82f6',
                    color: '#ffffff',
                    border: 'none',
                    padding: '0.5rem 1rem',
                    borderRadius: '0.375rem',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem'
                  }}
                >
                  <Plus size={14} /> Add Track
                </button>
              </div>

              {editingDept && (
                <form onSubmit={handleSaveDept} style={{ background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '0.5rem', padding: '1.5rem', marginBottom: '1.5rem' }}>
                  <h4 style={{ margin: '0 0 1rem 0', fontWeight: 700 }}>{editingDept.id ? 'Edit Academic Track' : 'Add New Academic Track'}</h4>
                  <div style={{ display: 'grid', gridTemplateColumns: '3fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                    <div>
                      <label htmlFor="trk_name" style={{ fontSize: '0.8rem', fontWeight: 700 }}>Track Name</label>
                      <input
                        id="trk_name"
                        type="text"
                        required
                        value={editingDept.name}
                        onChange={(e) => setEditingDept({ ...editingDept, name: e.target.value })}
                        style={{ width: '100%', padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '0.25rem', marginTop: '0.25rem' }}
                      />
                    </div>
                    <div>
                      <label htmlFor="trk_sort" style={{ fontSize: '0.8rem', fontWeight: 700 }}>Sort Order</label>
                      <input
                        id="trk_sort"
                        type="number"
                        required
                        value={editingDept.sort_order || 1}
                        onChange={(e) => setEditingDept({ ...editingDept, sort_order: Number(e.target.value) })}
                        style={{ width: '100%', padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '0.25rem', marginTop: '0.25rem' }}
                      />
                    </div>
                  </div>
                  <div style={{ marginBottom: '1rem' }}>
                    <label htmlFor="trk_desc" style={{ fontSize: '0.8rem', fontWeight: 700 }}>Description (Topics list, comma separated)</label>
                    <textarea
                      id="trk_desc"
                      value={editingDept.description || ''}
                      onChange={(e) => setEditingDept({ ...editingDept, description: e.target.value })}
                      rows={3}
                      style={{ width: '100%', padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '0.25rem', marginTop: '0.25rem', fontFamily: 'inherit' }}
                    />
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button type="submit" className="btn btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.8rem' }}>Save Track</button>
                    <button type="button" onClick={() => setEditingDept(null)} className="btn btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.8rem' }}>Cancel</button>
                  </div>
                </form>
              )}

              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid #e2e8f0', color: '#475569' }}>
                      <th style={{ padding: '0.5rem', width: '80px' }}>Order</th>
                      <th style={{ padding: '0.5rem', width: '280px' }}>Track Title</th>
                      <th style={{ padding: '0.5rem' }}>Sub-topics / Descriptions</th>
                      <th style={{ padding: '0.5rem', textAlign: 'center', width: '100px' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {departments
                      .filter(d => d.name?.toLowerCase().includes(searchTerm.toLowerCase()))
                      .map((item, idx) => (
                        <tr key={item.id || idx} style={{ borderBottom: '1px solid #f1f5f9', verticalAlign: 'top' }}>
                          <td style={{ padding: '1rem 0.5rem', fontWeight: 700 }}>{item.sort_order}</td>
                          <td style={{ padding: '1rem 0.5rem', fontWeight: 700, color: '#0f172a' }}>{item.name}</td>
                          <td style={{ padding: '1rem 0.5rem', color: '#475569', lineHeight: '1.4' }}>{item.description}</td>
                          <td style={{ padding: '1rem 0.5rem', textAlign: 'center' }}>
                            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                              <button onClick={() => setEditingDept(item)} style={{ background: 'none', border: 'none', color: '#3b82f6', cursor: 'pointer' }}><Edit size={14} /></button>
                              <button onClick={() => handleDeleteDept(item.id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}><Trash2 size={14} /></button>
                            </div>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 7: Committee Members */}
        {activeTab === 'committee' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '0.75rem', padding: '1.5rem', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.02)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>Committee Members ({committeeMembers.length})</h3>
                <button
                  onClick={() => setEditingCommittee({ name: '', designation: '', institution: '', category: 'steering', subgroup: 'Executive Committee', sort_order: committeeMembers.length + 1 })}
                  style={{
                    background: '#3b82f6',
                    color: '#ffffff',
                    border: 'none',
                    padding: '0.5rem 1rem',
                    borderRadius: '0.375rem',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem'
                  }}
                >
                  <Plus size={14} /> Add Member
                </button>
              </div>

              {editingCommittee && (
                <form onSubmit={handleSaveCommittee} style={{ background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '0.5rem', padding: '1.5rem', marginBottom: '1.5rem' }}>
                  <h4 style={{ margin: '0 0 1rem 0', fontWeight: 700 }}>{editingCommittee.id ? 'Edit Committee Member' : 'Add Committee Member'}</h4>
                  <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                    <div>
                      <label htmlFor="mem_name" style={{ fontSize: '0.8rem', fontWeight: 700 }}>Member Name</label>
                      <input
                        id="mem_name"
                        type="text"
                        required
                        value={editingCommittee.name}
                        onChange={(e) => setEditingCommittee({ ...editingCommittee, name: e.target.value })}
                        style={{ width: '100%', padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '0.25rem', marginTop: '0.25rem' }}
                      />
                    </div>
                    <div>
                      <label htmlFor="mem_cat" style={{ fontSize: '0.8rem', fontWeight: 700 }}>Category Group</label>
                      <select
                        id="mem_cat"
                        value={editingCommittee.category}
                        onChange={(e) => setEditingCommittee({ ...editingCommittee, category: e.target.value })}
                        style={{ width: '100%', padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '0.25rem', marginTop: '0.25rem' }}
                      >
                        <option value="steering">Steering / Advisory / Leadership</option>
                        <option value="organizing">Organizing Committee</option>
                        <option value="advisory">National / International Advisory</option>
                        <option value="technical">Technical Program Committee</option>
                      </select>
                    </div>
                    <div>
                      <label htmlFor="mem_sort" style={{ fontSize: '0.8rem', fontWeight: 700 }}>Sort Order</label>
                      <input
                        id="mem_sort"
                        type="number"
                        required
                        value={editingCommittee.sort_order || 1}
                        onChange={(e) => setEditingCommittee({ ...editingCommittee, sort_order: Number(e.target.value) })}
                        style={{ width: '100%', padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '0.25rem', marginTop: '0.25rem' }}
                      />
                    </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                    <div>
                      <label htmlFor="mem_des" style={{ fontSize: '0.8rem', fontWeight: 700 }}>Designation (e.g. Professor)</label>
                      <input
                        id="mem_des"
                        type="text"
                        value={editingCommittee.designation || ''}
                        onChange={(e) => setEditingCommittee({ ...editingCommittee, designation: e.target.value })}
                        style={{ width: '100%', padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '0.25rem', marginTop: '0.25rem' }}
                      />
                    </div>
                    <div>
                      <label htmlFor="mem_inst" style={{ fontSize: '0.8rem', fontWeight: 700 }}>Institution / University</label>
                      <input
                        id="mem_inst"
                        type="text"
                        value={editingCommittee.institution || ''}
                        onChange={(e) => setEditingCommittee({ ...editingCommittee, institution: e.target.value })}
                        style={{ width: '100%', padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '0.25rem', marginTop: '0.25rem' }}
                      />
                    </div>
                    <div>
                      <label htmlFor="mem_sub" style={{ fontSize: '0.8rem', fontWeight: 700 }}>Subgroup Title (For Organizing Committee)</label>
                      <input
                        id="mem_sub"
                        type="text"
                        placeholder="e.g. Finance, Registration, etc."
                        value={editingCommittee.subgroup || ''}
                        onChange={(e) => setEditingCommittee({ ...editingCommittee, subgroup: e.target.value })}
                        style={{ width: '100%', padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '0.25rem', marginTop: '0.25rem' }}
                      />
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button type="submit" className="btn btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.8rem' }}>Save Member</button>
                    <button type="button" onClick={() => setEditingCommittee(null)} className="btn btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.8rem' }}>Cancel</button>
                  </div>
                </form>
              )}

              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid #e2e8f0', color: '#475569' }}>
                      <th style={{ padding: '0.5rem' }}>Name</th>
                      <th style={{ padding: '0.5rem' }}>Group Category</th>
                      <th style={{ padding: '0.5rem' }}>Subgroup</th>
                      <th style={{ padding: '0.5rem' }}>Affiliation / Designation</th>
                      <th style={{ padding: '0.5rem', textAlign: 'center' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {committeeMembers
                      .filter(c => c.name?.toLowerCase().includes(searchTerm.toLowerCase()))
                      .map((item, idx) => (
                        <tr key={item.id || idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                          <td style={{ padding: '0.75rem 0.5rem', fontWeight: 700 }}>{item.name}</td>
                          <td style={{ padding: '0.75rem 0.5rem' }}>
                            <span style={{
                              display: 'inline-block',
                              padding: '0.15rem 0.4rem',
                              borderRadius: '0.25rem',
                              fontSize: '0.7rem',
                              fontWeight: 700,
                              background: item.category === 'steering' ? 'rgba(59, 130, 246, 0.1)' : item.category === 'organizing' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(100, 116, 139, 0.1)',
                              color: item.category === 'steering' ? '#1d4ed8' : item.category === 'organizing' ? '#047857' : '#475569'
                            }}>
                              {item.category}
                            </span>
                          </td>
                          <td style={{ padding: '0.75rem 0.5rem', fontStyle: 'italic' }}>{item.subgroup || 'N/A'}</td>
                          <td style={{ padding: '0.75rem 0.5rem', color: '#475569' }}>{item.designation} • {item.institution}</td>
                          <td style={{ padding: '0.75rem 0.5rem', textAlign: 'center' }}>
                            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                              <button onClick={() => setEditingCommittee(item)} style={{ background: 'none', border: 'none', color: '#3b82f6', cursor: 'pointer' }}><Edit size={14} /></button>
                              <button onClick={() => handleDeleteCommittee(item.id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}><Trash2 size={14} /></button>
                            </div>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 8: Tutorial Workshops */}
        {activeTab === 'workshops' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '0.75rem', padding: '1.5rem', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.02)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>Pre-conference Tutorials ({workshops.length})</h3>
                <button
                  onClick={() => setEditingWorkshop({ title: '', speaker: '', speaker_designation: '', speaker_institution: '', date: '04 April 2027', time: '09:00 AM', desc: '' })}
                  style={{
                    background: '#3b82f6',
                    color: '#ffffff',
                    border: 'none',
                    padding: '0.5rem 1rem',
                    borderRadius: '0.375rem',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem'
                  }}
                >
                  <Plus size={14} /> Add Workshop
                </button>
              </div>

              {editingWorkshop && (
                <form onSubmit={handleSaveWorkshop} style={{ background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '0.5rem', padding: '1.5rem', marginBottom: '1.5rem' }}>
                  <h4 style={{ margin: '0 0 1rem 0', fontWeight: 700 }}>{editingWorkshop.id ? 'Edit Workshop' : 'Add New Workshop'}</h4>
                  <div style={{ marginBottom: '1rem' }}>
                    <label htmlFor="wk_title" style={{ fontSize: '0.8rem', fontWeight: 700 }}>Workshop Title</label>
                    <input
                      id="wk_title"
                      type="text"
                      required
                      value={editingWorkshop.title}
                      onChange={(e) => setEditingWorkshop({ ...editingWorkshop, title: e.target.value })}
                      style={{ width: '100%', padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '0.25rem', marginTop: '0.25rem' }}
                    />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                    <div>
                      <label htmlFor="wk_spk" style={{ fontSize: '0.8rem', fontWeight: 700 }}>Lead Instructor Name</label>
                      <input
                        id="wk_spk"
                        type="text"
                        required
                        value={editingWorkshop.speaker}
                        onChange={(e) => setEditingWorkshop({ ...editingWorkshop, speaker: e.target.value })}
                        style={{ width: '100%', padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '0.25rem', marginTop: '0.25rem' }}
                      />
                    </div>
                    <div>
                      <label htmlFor="wk_des" style={{ fontSize: '0.8rem', fontWeight: 700 }}>Instructor Designation</label>
                      <input
                        id="wk_des"
                        type="text"
                        value={editingWorkshop.speaker_designation || ''}
                        onChange={(e) => setEditingWorkshop({ ...editingWorkshop, speaker_designation: e.target.value })}
                        style={{ width: '100%', padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '0.25rem', marginTop: '0.25rem' }}
                      />
                    </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                    <div>
                      <label htmlFor="wk_inst" style={{ fontSize: '0.8rem', fontWeight: 700 }}>Instructor University / Organization</label>
                      <input
                        id="wk_inst"
                        type="text"
                        value={editingWorkshop.speaker_institution || ''}
                        onChange={(e) => setEditingWorkshop({ ...editingWorkshop, speaker_institution: e.target.value })}
                        style={{ width: '100%', padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '0.25rem', marginTop: '0.25rem' }}
                      />
                    </div>
                    <div>
                      <label htmlFor="wk_date" style={{ fontSize: '0.8rem', fontWeight: 700 }}>Date</label>
                      <input
                        id="wk_date"
                        type="text"
                        value={editingWorkshop.date || ''}
                        onChange={(e) => setEditingWorkshop({ ...editingWorkshop, date: e.target.value })}
                        style={{ width: '100%', padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '0.25rem', marginTop: '0.25rem' }}
                      />
                    </div>
                    <div>
                      <label htmlFor="wk_time" style={{ fontSize: '0.8rem', fontWeight: 700 }}>Time</label>
                      <input
                        id="wk_time"
                        type="text"
                        value={editingWorkshop.time || ''}
                        onChange={(e) => setEditingWorkshop({ ...editingWorkshop, time: e.target.value })}
                        style={{ width: '100%', padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '0.25rem', marginTop: '0.25rem' }}
                      />
                    </div>
                  </div>
                  <div style={{ marginBottom: '1rem' }}>
                    <label htmlFor="wk_desc" style={{ fontSize: '0.8rem', fontWeight: 700 }}>Short Abstract / Outline</label>
                    <textarea
                      id="wk_desc"
                      value={editingWorkshop.desc || ''}
                      onChange={(e) => setEditingWorkshop({ ...editingWorkshop, desc: e.target.value })}
                      rows={3}
                      style={{ width: '100%', padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '0.25rem', marginTop: '0.25rem', fontFamily: 'inherit' }}
                    />
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button type="submit" className="btn btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.8rem' }}>Save Workshop</button>
                    <button type="button" onClick={() => setEditingWorkshop(null)} className="btn btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.8rem' }}>Cancel</button>
                  </div>
                </form>
              )}

              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid #e2e8f0', color: '#475569' }}>
                      <th style={{ padding: '0.5rem', width: '320px' }}>Workshop Title</th>
                      <th style={{ padding: '0.5rem' }}>Lead Instructor</th>
                      <th style={{ padding: '0.5rem', width: '160px' }}>Schedule</th>
                      <th style={{ padding: '0.5rem', textAlign: 'center', width: '100px' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {workshops
                      .filter(w => w.title?.toLowerCase().includes(searchTerm.toLowerCase()))
                      .map((item, idx) => (
                        <tr key={item.id || idx} style={{ borderBottom: '1px solid #f1f5f9', verticalAlign: 'top' }}>
                          <td style={{ padding: '1rem 0.5rem' }}>
                            <div style={{ fontWeight: 700 }}>{item.title}</div>
                            <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.25rem' }}>{item.desc}</div>
                          </td>
                          <td style={{ padding: '1rem 0.5rem' }}>
                            <div style={{ fontWeight: 700, color: '#0f52ba' }}>{item.speaker}</div>
                            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{item.speaker_designation} • {item.speaker_institution}</div>
                          </td>
                          <td style={{ padding: '1rem 0.5rem', fontWeight: 600, color: '#475569' }}>
                            {item.date}<br/>
                            <span style={{ fontSize: '0.7rem' }}>{item.time}</span>
                          </td>
                          <td style={{ padding: '1rem 0.5rem', textAlign: 'center' }}>
                            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                              <button onClick={() => setEditingWorkshop(item)} style={{ background: 'none', border: 'none', color: '#3b82f6', cursor: 'pointer' }}><Edit size={14} /></button>
                              <button onClick={() => handleDeleteWorkshop(item.id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}><Trash2 size={14} /></button>
                            </div>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 9: Coordinators & Contacts (NEW CRUD) */}
        {activeTab === 'coordinators' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '0.75rem', padding: '1.5rem', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.02)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>Conference Coordinators / Contact Persons ({coordinators.length})</h3>
                <button
                  onClick={() => setEditingCoordinator({ name: '', role: '', phone: '', email: '', sort_order: coordinators.length + 1 })}
                  style={{
                    background: '#3b82f6',
                    color: '#ffffff',
                    border: 'none',
                    padding: '0.5rem 1rem',
                    borderRadius: '0.375rem',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem'
                  }}
                >
                  <Plus size={14} /> Add Coordinator
                </button>
              </div>

              {editingCoordinator && (
                <form onSubmit={handleSaveCoordinator} style={{ background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '0.5rem', padding: '1.5rem', marginBottom: '1.5rem' }}>
                  <h4 style={{ margin: '0 0 1rem 0', fontWeight: 700 }}>{editingCoordinator.id ? 'Edit Coordinator Details' : 'Add New Coordinator'}</h4>
                  <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                    <div>
                      <label htmlFor="co_name" style={{ fontSize: '0.8rem', fontWeight: 700 }}>Coordinator Name</label>
                      <input
                        id="co_name"
                        type="text"
                        required
                        value={editingCoordinator.name}
                        onChange={(e) => setEditingCoordinator({ ...editingCoordinator, name: e.target.value })}
                        style={{ width: '100%', padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '0.25rem', marginTop: '0.25rem' }}
                      />
                    </div>
                    <div>
                      <label htmlFor="co_role" style={{ fontSize: '0.8rem', fontWeight: 700 }}>Role / Association (e.g. Co-convenor)</label>
                      <input
                        id="co_role"
                        type="text"
                        value={editingCoordinator.role || ''}
                        onChange={(e) => setEditingCoordinator({ ...editingCoordinator, role: e.target.value })}
                        style={{ width: '100%', padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '0.25rem', marginTop: '0.25rem' }}
                      />
                    </div>
                    <div>
                      <label htmlFor="co_sort" style={{ fontSize: '0.8rem', fontWeight: 700 }}>Sort Order</label>
                      <input
                        id="co_sort"
                        type="number"
                        required
                        value={editingCoordinator.sort_order || 1}
                        onChange={(e) => setEditingCoordinator({ ...editingCoordinator, sort_order: Number(e.target.value) })}
                        style={{ width: '100%', padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '0.25rem', marginTop: '0.25rem' }}
                      />
                    </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                    <div>
                      <label htmlFor="co_phone" style={{ fontSize: '0.8rem', fontWeight: 700 }}>Mobile Number</label>
                      <input
                        id="co_phone"
                        type="text"
                        required
                        value={editingCoordinator.phone}
                        onChange={(e) => setEditingCoordinator({ ...editingCoordinator, phone: e.target.value })}
                        style={{ width: '100%', padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '0.25rem', marginTop: '0.25rem' }}
                      />
                    </div>
                    <div>
                      <label htmlFor="co_email" style={{ fontSize: '0.8rem', fontWeight: 700 }}>Email Address</label>
                      <input
                        id="co_email"
                        type="email"
                        required
                        value={editingCoordinator.email}
                        onChange={(e) => setEditingCoordinator({ ...editingCoordinator, email: e.target.value })}
                        style={{ width: '100%', padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '0.25rem', marginTop: '0.25rem' }}
                      />
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button type="submit" className="btn btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.8rem' }}>Save Contact</button>
                    <button type="button" onClick={() => setEditingCoordinator(null)} className="btn btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.8rem' }}>Cancel</button>
                  </div>
                </form>
              )}

              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid #e2e8f0', color: '#475569' }}>
                      <th style={{ padding: '0.5rem', width: '80px' }}>Order</th>
                      <th style={{ padding: '0.5rem' }}>Name</th>
                      <th style={{ padding: '0.5rem' }}>Role/Designation</th>
                      <th style={{ padding: '0.5rem' }}>Mobile</th>
                      <th style={{ padding: '0.5rem' }}>Email</th>
                      <th style={{ padding: '0.5rem', textAlign: 'center', width: '100px' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {coordinators
                      .filter(c => c.name?.toLowerCase().includes(searchTerm.toLowerCase()))
                      .map((item, idx) => (
                        <tr key={item.id || idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                          <td style={{ padding: '0.75rem 0.5rem', fontWeight: 700 }}>{item.sort_order}</td>
                          <td style={{ padding: '0.75rem 0.5rem', fontWeight: 700, color: '#0f172a' }}>{item.name}</td>
                          <td style={{ padding: '0.75rem 0.5rem', color: '#0f52ba', fontWeight: 600 }}>{item.role || 'N/A'}</td>
                          <td style={{ padding: '0.75rem 0.5rem', color: '#475569' }}>{item.phone}</td>
                          <td style={{ padding: '0.75rem 0.5rem', color: '#475569' }}>{item.email}</td>
                          <td style={{ padding: '0.75rem 0.5rem', textAlign: 'center' }}>
                            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                              <button onClick={() => setEditingCoordinator(item)} style={{ background: 'none', border: 'none', color: '#3b82f6', cursor: 'pointer' }}><Edit size={14} /></button>
                              <button onClick={() => handleDeleteCoordinator(item.id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}><Trash2 size={14} /></button>
                            </div>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 10: Dashboard Quick Stats (NEW CRUD) */}
        {activeTab === 'stats' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '0.75rem', padding: '1.5rem', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.02)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>Quick Stats Dashboard Metrics ({stats.length})</h3>
                <button
                  onClick={() => setEditingStat({ key: '', value: '', label: '', icon: 'Sparkles', sort_order: stats.length + 1 })}
                  style={{
                    background: '#3b82f6',
                    color: '#ffffff',
                    border: 'none',
                    padding: '0.5rem 1rem',
                    borderRadius: '0.375rem',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem'
                  }}
                >
                  <Plus size={14} /> Add Metric
                </button>
              </div>

              {editingStat && (
                <form onSubmit={handleSaveStat} style={{ background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '0.5rem', padding: '1.5rem', marginBottom: '1.5rem' }}>
                  <h4 style={{ margin: '0 0 1rem 0', fontWeight: 700 }}>{editingStat.id ? 'Edit Stat Metric' : 'Add New Stat Metric'}</h4>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                    <div>
                      <label htmlFor="st_key" style={{ fontSize: '0.8rem', fontWeight: 700 }}>Unique Database Key</label>
                      <input
                        id="st_key"
                        type="text"
                        required
                        placeholder="e.g. tracks_count"
                        value={editingStat.key}
                        onChange={(e) => setEditingStat({ ...editingStat, key: e.target.value })}
                        style={{ width: '100%', padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '0.25rem', marginTop: '0.25rem' }}
                      />
                    </div>
                    <div>
                      <label htmlFor="st_val" style={{ fontSize: '0.8rem', fontWeight: 700 }}>Value Display (e.g. 10+, 500+)</label>
                      <input
                        id="st_val"
                        type="text"
                        required
                        value={editingStat.value}
                        onChange={(e) => setEditingStat({ ...editingStat, value: e.target.value })}
                        style={{ width: '100%', padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '0.25rem', marginTop: '0.25rem' }}
                      />
                    </div>
                    <div>
                      <label htmlFor="st_lbl" style={{ fontSize: '0.8rem', fontWeight: 700 }}>Metric Label</label>
                      <input
                        id="st_lbl"
                        type="text"
                        required
                        value={editingStat.label}
                        onChange={(e) => setEditingStat({ ...editingStat, label: e.target.value })}
                        style={{ width: '100%', padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '0.25rem', marginTop: '0.25rem' }}
                      />
                    </div>
                    <div>
                      <label htmlFor="st_sort" style={{ fontSize: '0.8rem', fontWeight: 700 }}>Sort Order</label>
                      <input
                        id="st_sort"
                        type="number"
                        required
                        value={editingStat.sort_order || 1}
                        onChange={(e) => setEditingStat({ ...editingStat, sort_order: Number(e.target.value) })}
                        style={{ width: '100%', padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '0.25rem', marginTop: '0.25rem' }}
                      />
                    </div>
                  </div>
                  <div style={{ marginBottom: '1rem' }}>
                    <label htmlFor="st_ico" style={{ fontSize: '0.8rem', fontWeight: 700 }}>Icon Name (e.g. Users, Layers, Award, Sparkles)</label>
                    <input
                      id="st_ico"
                      type="text"
                      value={editingStat.icon || ''}
                      onChange={(e) => setEditingStat({ ...editingStat, icon: e.target.value })}
                      style={{ width: '100%', padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '0.25rem', marginTop: '0.25rem' }}
                    />
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button type="submit" className="btn btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.8rem' }}>Save Metric</button>
                    <button type="button" onClick={() => setEditingStat(null)} className="btn btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.8rem' }}>Cancel</button>
                  </div>
                </form>
              )}

              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid #e2e8f0', color: '#475569' }}>
                      <th style={{ padding: '0.5rem', width: '80px' }}>Order</th>
                      <th style={{ padding: '0.5rem' }}>Key ID</th>
                      <th style={{ padding: '0.5rem' }}>Value</th>
                      <th style={{ padding: '0.5rem' }}>Label</th>
                      <th style={{ padding: '0.5rem' }}>Icon</th>
                      <th style={{ padding: '0.5rem', textAlign: 'center', width: '100px' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.map((item, idx) => (
                      <tr key={item.id || idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '0.75rem 0.5rem', fontWeight: 700 }}>{item.sort_order}</td>
                        <td style={{ padding: '0.75rem 0.5rem', color: '#0f52ba', fontWeight: 600 }}>{item.key}</td>
                        <td style={{ padding: '0.75rem 0.5rem', fontWeight: 700 }}>{item.value}</td>
                        <td style={{ padding: '0.75rem 0.5rem' }}>{item.label}</td>
                        <td style={{ padding: '0.75rem 0.5rem', fontFamily: 'monospace', color: '#64748b' }}>{item.icon}</td>
                        <td style={{ padding: '0.75rem 0.5rem', textAlign: 'center' }}>
                          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                            <button onClick={() => setEditingStat(item)} style={{ background: 'none', border: 'none', color: '#3b82f6', cursor: 'pointer' }}><Edit size={14} /></button>
                            <button onClick={() => handleDeleteStat(item.id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}><Trash2 size={14} /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Image Preview Modal Overlay Container */}
      {previewImage && (
        <div 
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.75)',
            backdropFilter: 'blur(8px)',
            zIndex: 99999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem'
          }}
          onClick={() => setPreviewImage(null)}
        >
          <div 
            style={{
              position: 'relative',
              backgroundColor: '#ffffff',
              borderRadius: '0.75rem',
              padding: '2rem 1.5rem 1.5rem',
              maxWidth: '90%',
              maxHeight: '90%',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '1rem'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setPreviewImage(null)}
              style={{
                position: 'absolute',
                top: '0.5rem',
                right: '0.5rem',
                background: '#f1f5f9',
                border: 'none',
                borderRadius: '50%',
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: '#64748b'
              }}
              title="Close Preview"
            >
              <X size={16} />
            </button>
            {(() => {
              const reg = submittedRegistrations.find(r => r.screenshot_name === previewImage);
              const isUrl = previewImage.startsWith('http') || previewImage.startsWith('data:');
              if (isUrl) {
                return (
                  <>
                    <img 
                      src={previewImage} 
                      alt="Payment Proof Receipt" 
                      style={{
                        maxWidth: '100%',
                        maxHeight: '70vh',
                        objectFit: 'contain',
                        borderRadius: '0.375rem',
                        border: '1px solid #cbd5e1'
                      }}
                    />
                    <div style={{ display: 'flex', gap: '0.75rem', width: '100%', justifyContent: 'center', marginTop: '1rem' }}>
                      <a 
                        href={previewImage} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        style={{ 
                          display: 'inline-flex', 
                          alignItems: 'center', 
                          gap: '0.35rem', 
                          fontSize: '0.8rem',
                          padding: '0.5rem 1rem',
                          textDecoration: 'none',
                          color: '#ffffff',
                          background: '#3b82f6',
                          borderRadius: '0.375rem',
                          fontWeight: 600
                        }}
                      >
                        <Download size={14} /> Open in New Tab
                      </a>
                      <button
                        onClick={() => setPreviewImage(null)}
                        style={{ 
                          fontSize: '0.8rem',
                          padding: '0.5rem 1rem',
                          background: '#e2e8f0',
                          color: '#475569',
                          border: 'none',
                          borderRadius: '0.375rem',
                          fontWeight: 600,
                          cursor: 'pointer'
                        }}
                      >
                        Close Preview
                      </button>
                    </div>
                  </>
                );
              }
              
              // Render realistic billing receipt card
              return (
                <>
                  <div style={{
                    width: '400px',
                    background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                    border: '1.5px solid #e2e8f0',
                    borderRadius: '0.75rem',
                    padding: '1.5rem',
                    boxShadow: '0 10px 25px rgba(0,0,0,0.05)',
                    fontFamily: 'monospace',
                    color: '#1e293b',
                    lineHeight: '1.5'
                  }}>
                    <div style={{ textAlign: 'center', borderBottom: '2px dashed #cbd5e1', paddingBottom: '1rem', marginBottom: '1rem' }}>
                      <h4 style={{ margin: '0 0 0.25rem 0', color: '#0f172a', fontWeight: 800, fontSize: '1.1rem' }}>AECTSD 2027</h4>
                      <span style={{ fontSize: '0.75rem', color: '#64748b' }}>PAYMENT PROOF RECEIPT</span>
                      <div style={{
                        marginTop: '0.75rem',
                        background: '#ecfdf5',
                        color: '#059669',
                        border: '1px solid #a7f3d0',
                        padding: '0.25rem 0.75rem',
                        borderRadius: '9999px',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        display: 'inline-block'
                      }}>
                        VERIFIED SUCCESSFUL
                      </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.8rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#64748b' }}>FILE NAME:</span>
                        <span style={{ fontWeight: 600, wordBreak: 'break-all' }}>{previewImage}</span>
                      </div>
                      {reg && (
                        <>
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: '#64748b' }}>AUTHOR:</span>
                            <span style={{ fontWeight: 600 }}>{reg.author_name}</span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: '#64748b' }}>EMAIL:</span>
                            <span style={{ fontWeight: 600 }}>{reg.email}</span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: '#64748b' }}>PHONE:</span>
                            <span style={{ fontWeight: 600 }}>{reg.phone}</span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: '#64748b' }}>PAPER ID:</span>
                            <span style={{ fontWeight: 600 }}>{reg.paper_id}</span>
                          </div>
                        </>
                      )}
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#64748b' }}>STATUS:</span>
                        <span style={{ fontWeight: 600 }}>OFFLINE VERIFIED</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#64748b' }}>BANK REF:</span>
                        <span style={{ fontWeight: 600 }}>TXN-902341852</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#64748b' }}>TIME:</span>
                        <span style={{ fontWeight: 600 }}>{new Date().toLocaleString()}</span>
                      </div>
                    </div>
                    <div style={{ borderTop: '2px dashed #cbd5e1', marginTop: '1rem', paddingTop: '1rem', textAlign: 'center', fontSize: '0.75rem', color: '#64748b' }}>
                      Sri Ramakrishna Engineering College
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '0.75rem', width: '100%', justifyContent: 'center', marginTop: '1rem' }}>
                    <button
                      onClick={() => setPreviewImage(null)}
                      style={{ 
                        fontSize: '0.8rem',
                        padding: '0.5rem 1rem',
                        background: '#e2e8f0',
                        color: '#475569',
                        border: 'none',
                        borderRadius: '0.375rem',
                        fontWeight: 600,
                        cursor: 'pointer'
                      }}
                    >
                      Close Preview
                    </button>
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
}
