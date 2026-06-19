import React, { useState, useEffect } from 'react';
import { 
  motion, 
  AnimatePresence, 
  useScroll, 
  useSpring 
} from 'framer-motion';
import { 
  Calendar, 
  MapPin, 
  Clock, 
  Download, 
  ExternalLink, 
  Mail, 
  Phone, 
  User, 
  BookOpen, 
  Award, 
  Layers, 
  Terminal, 
  ChevronRight, 
  CheckCircle, 
  DollarSign, 
  ArrowUp,
  Menu,
  X,
  FileText,
  Shield,
  Trash2,
  Plus,
  Save,
  LogOut,
  Eye,
  RefreshCw,
  Database
} from 'lucide-react';
import { SrecLogo } from './components/SrecLogo';
import acLogo from './assets/ac.png';
import srecLogo from './assets/srec-logo.png';
import { supabase, isSupabaseConfigured } from './supabaseClient';
import ExplorePage from './ExplorePage';

// Navigation Items
const NAV_ITEMS = [
  { id: 'home', label: 'Home' },
  { id: 'about', label: 'About Us' },
  { id: 'committee', label: 'Committee' },
  { id: 'speakers', label: 'Speakers' },
  { id: 'call-for-papers', label: 'Call For Papers' },
  { id: 'important-dates', label: 'Important Dates' },
  { id: 'workshops', label: 'Workshops' },
  { id: 'guidelines', label: 'Guidelines' },
  { id: 'paper-submission', label: 'Paper Submission' },
  { id: 'registration', label: 'Registration' },
  { id: 'explore', label: 'Explore' },
  { id: 'contact-us', label: 'Contact Us' }, 
  { id: 'location', label: 'Directions' },
  { id: 'ieee-sb', label: 'IEEE SB', external: true }
];

interface Department {
  id?: any;
  name: string;
  description: string;
  sort_order?: number;
}

interface CommitteeMember {
  id?: any;
  category: 'organizing' | 'advisory' | 'technical';
  role: string | null;
  name: string;
  desc: string;
  image_url?: string;
}

interface Speaker {
  id?: any;
  name: string;
  title: string;
  role: string;
  talk: string;
  color: string;
  image_url?: string;
}

interface ImportantDate {
  id?: any;
  title: string;
  event_date: string;
  desc: string;
  sort_order?: number;
}

interface Workshop {
  id?: any;
  title: string;
  instructor: string;
  duration: string;
  price: string;
  details: string;
}

interface RegistrationFee {
  member_type: string;
  inr_reg: string;
  inr_early: string;
  usd_phys_reg: string;
  usd_phys_early: string;
  usd_virt_reg: string;
  usd_virt_early: string;
}

interface Stat {
  number: string;
  label: string;
}

interface Coordinator {
  name: string;
  role: string;
  phone: string;
}




const parseDateDisplay = (dateStr: string) => {
  const cleaned = dateStr.trim();
  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const shortMonths: Record<string, string> = {
    "January": "JAN", "February": "FEB", "March": "MAR", "April": "APR", "May": "MAY", "June": "JUN",
    "July": "JUL", "August": "AUG", "September": "SEP", "October": "OCT", "November": "NOV", "December": "DEC"
  };

  let month = "DATE";
  let day = "??";
  let year = "2027";

  for (const m of months) {
    if (cleaned.includes(m)) {
      month = shortMonths[m];
      const afterMonth = cleaned.replace(m, '').trim();
      const parts = afterMonth.split(',');
      if (parts.length >= 2) {
        day = parts[0].trim().replace('&', '-').replace(/\s+/g, ' ');
        year = parts[1].trim();
      } else {
        const spaceParts = afterMonth.split(/\s+/);
        if (spaceParts.length >= 2) {
          day = spaceParts[0].trim();
          year = spaceParts[1].trim();
        }
      }
      break;
    }
  }

  // Custom overrides for known dates to be perfectly formatted
  if (cleaned.includes("October 15")) { month = "OCT"; day = "15"; year = "2026"; }
  else if (cleaned.includes("December 20")) { month = "DEC"; day = "20"; year = "2026"; }
  else if (cleaned.includes("January 25")) { month = "JAN"; day = "25"; year = "2027"; }
  else if (cleaned.includes("February 20")) { month = "FEB"; day = "20"; year = "2027"; }
  else if (cleaned.includes("April 03")) { month = "APR"; day = "03"; year = "2027"; }
  else if (cleaned.includes("April 04") || cleaned.includes("April 4")) { month = "APR"; day = "04-05"; year = "2027"; }

  return { month, day, year };
};

const ROLE_HEADERS: Record<string, string> = {
  'Patron': 'Patrons',
  'General Chair': 'General Chairs',
  'Conference Chair & Organizing Secretary': 'Conference Chair & Organizing Secretary',
  'Session Chair': 'Session Chair',
  'Member': 'Organizing Committee Members',
  'Finance Chair & Joint-Organizing Secretary': 'Finance Chair & Joint-Organizing Secretary',
  'Finance Committee Member': 'Finance Committee Members',
  'Publication Chair': 'Publication Chair',
  'Publication Committee Member': 'Publication Committee Members',
  'Local Arrangements Chair': 'Local Arrangements Chair',
  'Local Arrangements Committee Member': 'Local Arrangements Committee Members',
  'Registration Chair': 'Registration Chair',
  'Registration Committee Member': 'Registration Committee Members',
  'Conference Pre-Tutorial Sessions Chair': 'Conference Pre-Tutorial Sessions Chair',
  'Pre-Tutorial Sessions Committee Member': 'Pre-Tutorial Sessions Committee Members',
  'Technical Review Committee Convener': 'Technical Review Committee Convener',
  'Technical Review Committee Member': 'Technical Review Committee Members',
  'Outreach and Promotion Committee Convener': 'Outreach and Promotion Committee Convener',
  'Outreach and Promotion Committee Member': 'Outreach and Promotion Committee Members',
  'Website and Social Media Promotion Committee Chair': 'Website and Social Media Promotion Committee Chair',
  'Website and Social Media Promotion Committee Member': 'Website and Social Media Promotion Committee Members',
  'Hospitality Committee Convener': 'Hospitality Committee Convener',
  'Hospitality Committee Member': 'Hospitality Committee Members'
};

const LEADERSHIP_ROLES = new Set([
  'Patron',
  'General Chair',
  'Conference Chair & Organizing Secretary',
  'Session Chair'
]);

const SUBCOMMITTEES = [
  {
    name: 'Finance Committee',
    chairRole: 'Finance Chair & Joint-Organizing Secretary',
    memberRole: 'Finance Committee Member'
  },
  {
    name: 'Publication Committee',
    chairRole: 'Publication Chair',
    memberRole: 'Publication Committee Member'
  },
  {
    name: 'Local Arrangements Committee',
    chairRole: 'Local Arrangements Chair',
    memberRole: 'Local Arrangements Committee Member'
  },
  {
    name: 'Registration Committee',
    chairRole: 'Registration Chair',
    memberRole: 'Registration Committee Member'
  },
  {
    name: 'Conference Pre-Tutorial Sessions Committee',
    chairRole: 'Conference Pre-Tutorial Sessions Chair',
    memberRole: 'Pre-Tutorial Sessions Committee Member'
  },
  {
    name: 'Technical Review Committee',
    chairRole: 'Technical Review Committee Convener',
    memberRole: 'Technical Review Committee Member'
  },
  {
    name: 'Outreach and Promotion Committee',
    chairRole: 'Outreach and Promotion Committee Convener',
    memberRole: 'Outreach and Promotion Committee Member'
  },
  {
    name: 'Website and Social Media Promotion Committee',
    chairRole: 'Website and Social Media Promotion Committee Chair',
    memberRole: 'Website and Social Media Promotion Committee Member'
  },
  {
    name: 'Hospitality Committee',
    chairRole: 'Hospitality Committee Convener',
    memberRole: 'Hospitality Committee Member'
  }
];

const ADMIN_MASTER_KEY = "MRBB2026";

async function sha256(message: string): Promise<string> {
  // Check if Web Crypto API is available (only available in Secure Contexts, i.e., HTTPS or localhost)
  if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle) {
    try {
      const msgBuffer = new TextEncoder().encode(message);
      const hashBuffer = await window.crypto.subtle.digest('SHA-256', msgBuffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      return hashHex;
    } catch (e) {
      console.warn("Secure crypto failed, falling back to JS implementation:", e);
    }
  }

  // Fallback pure JS SHA-256 implementation for insecure HTTP contexts
  function sha256_fallback(str: string): string {
    const rotateRight = (n: number, x: number) => (x >>> n) | (x << (32 - n));
    
    const hash = [
      0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a,
      0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19
    ];
    
    const k = [
      0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
      0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
      0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
      0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
      0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
      0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
      0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
      0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2
    ];

    const msgBuffer = new TextEncoder().encode(str);
    const words = new Uint32Array(((msgBuffer.length + 8) >> 6) + 1 << 4);
    
    for (let i = 0; i < msgBuffer.length; i++) {
      words[i >> 2] |= msgBuffer[i] << (24 - (i % 4) * 8);
    }
    
    words[msgBuffer.length >> 2] |= 0x80 << (24 - (msgBuffer.length % 4) * 8);
    words[words.length - 1] = msgBuffer.length * 8;
    
    for (let i = 0; i < words.length; i += 16) {
      const w = new Uint32Array(64);
      for (let j = 0; j < 16; j++) w[j] = words[i + j];
      for (let j = 16; j < 64; j++) {
        const s0 = rotateRight(7, w[j - 15]) ^ rotateRight(18, w[j - 15]) ^ (w[j - 15] >>> 3);
        const s1 = rotateRight(17, w[j - 2]) ^ rotateRight(19, w[j - 2]) ^ (w[j - 2] >>> 10);
        w[j] = (w[j - 16] + s0 + w[j - 7] + s1) | 0;
      }
      
      let [a, b, c, d, e, f, g, h] = hash;
      
      for (let j = 0; j < 64; j++) {
        const S1 = rotateRight(6, e) ^ rotateRight(11, e) ^ rotateRight(25, e);
        const ch = (e & f) ^ (~e & g);
        const temp1 = (h + S1 + ch + k[j] + w[j]) | 0;
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
      
      hash[0] = (hash[0] + a) | 0;
      hash[1] = (hash[1] + b) | 0;
      hash[2] = (hash[2] + c) | 0;
      hash[3] = (hash[3] + d) | 0;
      hash[4] = (hash[4] + e) | 0;
      hash[5] = (hash[5] + f) | 0;
      hash[6] = (hash[6] + g) | 0;
      hash[7] = (hash[7] + h) | 0;
    }
    
    return Array.from(hash).map(h => (h >>> 0).toString(16).padStart(8, '0')).join('');
  }

  return sha256_fallback(message);
}

export default function App() {
  const [activeSection, setActiveSection] = useState('home');
  const [currentPage, setCurrentPage] = useState<'main' | 'explore'>('main');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [committeeTab, setCommitteeTab] = useState<'organizing' | 'advisory' | 'technical'>('organizing');
  const [showScrollTop, setShowScrollTop] = useState(false);
  
  // Database content states
  const [departments, setDepartments] = useState<Department[]>([]);
  const [committeeMembers, setCommitteeMembers] = useState<CommitteeMember[]>([]);
  const [speakers, setSpeakers] = useState<Speaker[]>([]);
  const [importantDates, setImportantDates] = useState<ImportantDate[]>([]);
  const [workshops, setWorkshops] = useState<Workshop[]>([]);
  const [registrationFees, setRegistrationFees] = useState<RegistrationFee[]>([]);
  const [stats, setStats] = useState<Stat[]>([]);
  const [coordinators, setCoordinators] = useState<Coordinator[]>([]);
  const [info, setInfo] = useState<Record<string, string>>({});
  const [pricing, setPricing] = useState<Record<string, number>>({});
  const [selectedDept, setSelectedDept] = useState<Department | null>(null);
  const [showCalcModal, setShowCalcModal] = useState<boolean>(false);

  // Admin Portal states
  const [adminUser, setAdminUser] = useState<string | null>(() => localStorage.getItem('srec_logged_in_admin'));
  const [showAdminPortal, setShowAdminPortal] = useState<boolean>(false);
  const [adminTab, setAdminTab] = useState<string>('overview');
  const [adminRegMode, setAdminRegMode] = useState<boolean>(false);
  const [adminUsername, setAdminUsername] = useState<string>('');
  const [adminPassword, setAdminPassword] = useState<string>('');
  const [adminConfirmPassword, setAdminConfirmPassword] = useState<string>('');
  const [adminMasterKey, setAdminMasterKey] = useState<string>('');
  const [adminLoading, setAdminLoading] = useState<boolean>(false);
  const [adminError, setAdminError] = useState<string | null>(null);

  // Registrations state
  const [submittedRegistrations, setSubmittedRegistrations] = useState<any[]>([]);

  // CRUD Editing states
  const [editingSpeaker, setEditingSpeaker] = useState<any | null>(null);
  const [editingDate, setEditingDate] = useState<any | null>(null);
  const [editingWorkshop, setEditingWorkshop] = useState<any | null>(null);
  const [editingCommittee, setEditingCommittee] = useState<any | null>(null);
  const [editingDept, setEditingDept] = useState<any | null>(null);


  // Contact form state
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });

  // Registration calculator and submission states
  const [isIndian, setIsIndian] = useState<boolean>(true);
  const [isStudent, setIsStudent] = useState<boolean>(true);
  const [isIeeeMember, setIsIeeeMember] = useState<boolean>(true);
  const [regOption, setRegOption] = useState<'conference' | 'tutorial' | 'both' | 'listener'>('conference');
  const [isLate, setIsLate] = useState<boolean>(false);
  const [pageCount, setPageCount] = useState<number>(6);
  const [workshopAddon, setWorkshopAddon] = useState<boolean>(false);
  const [virtualMode, setVirtualMode] = useState<boolean>(false);
  
  // Registration form inputs
  const [regPaperId, setRegPaperId] = useState<string>('');
  const [regPaperTitle, setRegPaperTitle] = useState<string>('');
  const [regAuthorName, setRegAuthorName] = useState<string>('');
  const [regEmail, setRegEmail] = useState<string>('');
  const [regPhone, setRegPhone] = useState<string>('');
  const [regScreenshot, setRegScreenshot] = useState<File | null>(null);
  const [regRegisterForTour, setRegRegisterForTour] = useState<boolean>(false);
  const [regPreferredTourPlace, setRegPreferredTourPlace] = useState<string>('');
  
  // Submitting states
  const [regSubmitting, setRegSubmitting] = useState<boolean>(false);
  const [regSuccess, setRegSuccess] = useState<boolean>(false);
  const [regError, setRegError] = useState<string | null>(null);
  const [showRegValidation, setShowRegValidation] = useState<boolean>(false);

  // Admin Portal authentication handlers
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
        setAdminError(null);
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
        setAdminError(null);
      }
    } catch (err: any) {
      setAdminError(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setAdminLoading(false);
    }
  };

  const handleAdminLogout = () => {
    localStorage.removeItem('srec_logged_in_admin');
    setAdminUser(null);
    setAdminUsername('');
    setAdminPassword('');
    setAdminTab('overview');
  };

  // CRUD Save & Delete Handlers
  const handleSaveDept = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDept) return;
    try {
      const dataToSave = {
        name: editingDept.name,
        description: editingDept.description,
        sort_order: Number(editingDept.sort_order || 1)
      };

      if (isSupabaseConfigured && supabase) {
        if (editingDept.id) {
          await supabase.from('departments').update(dataToSave).eq('id', editingDept.id);
        } else {
          await supabase.from('departments').insert(dataToSave);
        }
      } else {
        let list = [...departments];
        if (editingDept.id) {
          list = list.map(d => d.id === editingDept.id ? editingDept : d);
        } else {
          list.push({ ...editingDept, id: Date.now() });
        }
        localStorage.setItem('srec_offline_departments', JSON.stringify(list));
      }
      setEditingDept(null);
      await fetchDbData();
    } catch (err) {
      console.error('Save department failed:', err);
    }
  };

  const handleDeleteDept = async (id: any) => {
    if (!window.confirm('Are you sure you want to delete this department track?')) return;
    try {
      if (isSupabaseConfigured && supabase) {
        await supabase.from('departments').delete().eq('id', id);
      } else {
        const list = departments.filter(d => (d as any).id !== id);
        localStorage.setItem('srec_offline_departments', JSON.stringify(list));
      }
      await fetchDbData();
    } catch (err) {
      console.error('Delete department failed:', err);
    }
  };

  const handleSaveSpeaker = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSpeaker) return;
    try {
      const dataToSave = {
        name: editingSpeaker.name,
        title: editingSpeaker.title,
        role: editingSpeaker.role,
        talk: editingSpeaker.talk,
        color: editingSpeaker.color || '#0f52ba',
        image_url: editingSpeaker.image_url || null
      };

      if (isSupabaseConfigured && supabase) {
        if (editingSpeaker.id) {
          await supabase.from('speakers').update(dataToSave).eq('id', editingSpeaker.id);
        } else {
          await supabase.from('speakers').insert(dataToSave);
        }
      } else {
        let list = [...speakers];
        if (editingSpeaker.id) {
          list = list.map(s => (s as any).id === editingSpeaker.id ? editingSpeaker : s);
        } else {
          list.push({ ...editingSpeaker, id: Date.now() });
        }
        localStorage.setItem('srec_offline_speakers', JSON.stringify(list));
      }
      setEditingSpeaker(null);
      await fetchDbData();
    } catch (err) {
      console.error('Save speaker failed:', err);
    }
  };

  const handleDeleteSpeaker = async (id: any) => {
    if (!window.confirm('Are you sure you want to delete this speaker?')) return;
    try {
      if (isSupabaseConfigured && supabase) {
        await supabase.from('speakers').delete().eq('id', id);
      } else {
        const list = speakers.filter(s => (s as any).id !== id);
        localStorage.setItem('srec_offline_speakers', JSON.stringify(list));
      }
      await fetchDbData();
    } catch (err) {
      console.error('Delete speaker failed:', err);
    }
  };

  const handleSaveDate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDate) return;
    try {
      const dataToSave = {
        title: editingDate.title,
        event_date: editingDate.event_date,
        desc: editingDate.desc,
        sort_order: Number(editingDate.sort_order || 1)
      };

      if (isSupabaseConfigured && supabase) {
        if (editingDate.id) {
          await supabase.from('important_dates').update(dataToSave).eq('id', editingDate.id);
        } else {
          await supabase.from('important_dates').insert(dataToSave);
        }
      } else {
        let list = [...importantDates];
        if (editingDate.id) {
          list = list.map(d => (d as any).id === editingDate.id ? editingDate : d);
        } else {
          list.push({ ...editingDate, id: Date.now() });
        }
        localStorage.setItem('srec_offline_important_dates', JSON.stringify(list));
      }
      setEditingDate(null);
      await fetchDbData();
    } catch (err) {
      console.error('Save date failed:', err);
    }
  };

  const handleDeleteDate = async (id: any) => {
    if (!window.confirm('Are you sure you want to delete this date?')) return;
    try {
      if (isSupabaseConfigured && supabase) {
        await supabase.from('important_dates').delete().eq('id', id);
      } else {
        const list = importantDates.filter(d => (d as any).id !== id);
        localStorage.setItem('srec_offline_important_dates', JSON.stringify(list));
      }
      await fetchDbData();
    } catch (err) {
      console.error('Delete date failed:', err);
    }
  };

  const handleSaveWorkshop = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingWorkshop) return;
    try {
      const dataToSave = {
        title: editingWorkshop.title,
        instructor: editingWorkshop.instructor,
        duration: editingWorkshop.duration,
        price: editingWorkshop.price,
        details: editingWorkshop.details
      };

      if (isSupabaseConfigured && supabase) {
        if (editingWorkshop.id) {
          await supabase.from('workshops').update(dataToSave).eq('id', editingWorkshop.id);
        } else {
          await supabase.from('workshops').insert(dataToSave);
        }
      } else {
        let list = [...workshops];
        if (editingWorkshop.id) {
          list = list.map(w => (w as any).id === editingWorkshop.id ? editingWorkshop : w);
        } else {
          list.push({ ...editingWorkshop, id: Date.now() });
        }
        localStorage.setItem('srec_offline_workshops', JSON.stringify(list));
      }
      setEditingWorkshop(null);
      await fetchDbData();
    } catch (err) {
      console.error('Save workshop failed:', err);
    }
  };

  const handleDeleteWorkshop = async (id: any) => {
    if (!window.confirm('Are you sure you want to delete this workshop?')) return;
    try {
      if (isSupabaseConfigured && supabase) {
        await supabase.from('workshops').delete().eq('id', id);
      } else {
        const list = workshops.filter(w => (w as any).id !== id);
        localStorage.setItem('srec_offline_workshops', JSON.stringify(list));
      }
      await fetchDbData();
    } catch (err) {
      console.error('Delete workshop failed:', err);
    }
  };

  

  const handleSaveCommittee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCommittee) return;
    try {
      const dataToSave = {
        category: editingCommittee.category,
        role: editingCommittee.role || null,
        name: editingCommittee.name,
        desc: editingCommittee.desc,
        image_url: editingCommittee.image_url || null
      };

      if (isSupabaseConfigured && supabase) {
        if (editingCommittee.id) {
          await supabase.from('committee').update(dataToSave).eq('id', editingCommittee.id);
        } else {
          await supabase.from('committee').insert(dataToSave);
        }
      } else {
        let list = [...committeeMembers];
        if (editingCommittee.id) {
          list = list.map(c => (c as any).id === editingCommittee.id ? editingCommittee : c);
        } else {
          list.push({ ...editingCommittee, id: Date.now() });
        }
        localStorage.setItem('srec_offline_committee', JSON.stringify(list));
      }
      setEditingCommittee(null);
      await fetchDbData();
    } catch (err) {
      console.error('Save committee member failed:', err);
    }
  };

  const handleDeleteCommittee = async (id: any) => {
    if (!window.confirm('Are you sure you want to delete this committee member?')) return;
    try {
      if (isSupabaseConfigured && supabase) {
        await supabase.from('committee').delete().eq('id', id);
      } else {
        const list = committeeMembers.filter(c => (c as any).id !== id);
        localStorage.setItem('srec_offline_committee', JSON.stringify(list));
      }
      await fetchDbData();
    } catch (err) {
      console.error('Delete committee member failed:', err);
    }
  };

  const handleSaveInfoSetting = async (key: string, val: string) => {
    try {
      if (isSupabaseConfigured && supabase) {
        await supabase.from('conference_info').upsert({ key, value: val });
      }
      const updatedInfo = { ...info, [key]: val };
      setInfo(updatedInfo);
      localStorage.setItem('srec_offline_info', JSON.stringify(updatedInfo));
    } catch (err) {
      console.error('Save setting failed:', err);
    }
  };

  const handleDeleteRegistration = async (id: any) => {
    if (!window.confirm('Are you sure you want to delete this registration log?')) return;
    try {
      if (isSupabaseConfigured && supabase) {
        await supabase.from('registrations').delete().eq('id', id);
      } else {
        const list = submittedRegistrations.filter(r => r.id !== id);
        localStorage.setItem('srec_offline_registrations', JSON.stringify(list));
      }
      await fetchDbData();
    } catch (err) {
      console.error('Delete registration failed:', err);
    }
  };

  const handleClearAllRegistrations = async () => {
    if (!window.confirm('WARNING: Are you sure you want to delete ALL registrations? This cannot be undone.')) return;
    try {
      if (isSupabaseConfigured && supabase) {
        await supabase.from('registrations').delete().neq('id', 0);
      } else {
        localStorage.setItem('srec_offline_registrations', JSON.stringify([]));
      }
      await fetchDbData();
    } catch (err) {
      console.error('Clear registrations failed:', err);
    }
  };

  // Group organizing committee members by their position/role
  const organizingMembers = committeeMembers.filter(m => m.category === 'organizing');
  const groupedOrganizing: { role: string; members: CommitteeMember[] }[] = [];
  const seenRoles = new Set<string>();

  organizingMembers.forEach(member => {
    const role = member.role || 'Member';
    if (!seenRoles.has(role)) {
      seenRoles.add(role);
      groupedOrganizing.push({ role, members: [] });
    }
    const group = groupedOrganizing.find(g => g.role === role);
    if (group) {
      group.members.push(member);
    }
  });

  const calculateTotalFees = () => {
    const suffix = isIndian ? 'inr' : 'usd';
    let baseKey = 'base_';
    
    // Choose base pricing option
    if (regOption === 'conference') {
      baseKey += `conf_${isStudent ? 'student' : 'prof'}_${isIeeeMember ? 'ieee' : 'non_ieee'}_${suffix}`;
    } else if (regOption === 'tutorial') {
      baseKey += `tut_${isStudent ? 'student' : 'prof'}_${isIeeeMember ? 'ieee' : 'non_ieee'}_${suffix}`;
    } else if (regOption === 'both') {
      baseKey += `both_${isStudent ? 'student' : 'prof'}_${isIeeeMember ? 'ieee' : 'non_ieee'}_${suffix}`;
    } else {
      // Listener (Indian only)
      if (isIndian) {
        baseKey += `listener_${isStudent ? 'student' : 'prof'}_${isIeeeMember ? 'ieee' : 'non_ieee'}_inr`;
      } else {
        // Fallback for international listeners
        baseKey += `conf_student_ieee_usd`; 
      }
    }

    const baseFallbacks: Record<string, number> = {
      base_conf_student_ieee_inr: 6000,
      base_conf_student_non_ieee_inr: 7000,
      base_conf_prof_ieee_inr: 7000,
      base_conf_prof_non_ieee_inr: 8000,
      base_tut_student_ieee_inr: 1000,
      base_tut_student_non_ieee_inr: 1250,
      base_tut_prof_ieee_inr: 1250,
      base_tut_prof_non_ieee_inr: 1500,
      base_both_student_ieee_inr: 6500,
      base_both_student_non_ieee_inr: 7500,
      base_both_prof_ieee_inr: 7500,
      base_both_prof_non_ieee_inr: 8500,
      base_listener_student_ieee_inr: 3500,
      base_listener_student_non_ieee_inr: 5000,
      base_listener_prof_ieee_inr: 4500,
      base_listener_prof_non_ieee_inr: 6000,
      
      base_conf_student_ieee_usd: 150,
      base_conf_student_non_ieee_usd: 200,
      base_conf_prof_ieee_usd: 200,
      base_conf_prof_non_ieee_usd: 250,
      base_tut_student_ieee_usd: 40,
      base_tut_student_non_ieee_usd: 50,
      base_tut_prof_ieee_usd: 50,
      base_tut_prof_non_ieee_usd: 75,
      base_both_student_ieee_usd: 175,
      base_both_student_non_ieee_usd: 225,
      base_both_prof_ieee_usd: 225,
      base_both_prof_non_ieee_usd: 300
    };

    const baseFee = pricing[baseKey] !== undefined ? pricing[baseKey] : (baseFallbacks[baseKey] || 0);

    // Apply modifiers
    let penalty = 0;
    if (isLate) {
      const penaltyKey = `late_penalty_${suffix}`;
      const fallbackPenalty = isIndian ? 1000 : 25;
      penalty = pricing[penaltyKey] !== undefined ? pricing[penaltyKey] : fallbackPenalty;
    }

    let extraPageFee = 0;
    if (pageCount > 6) {
      const extraPageKey = `extra_page_${suffix}`;
      const fallbackExtra = isIndian ? 500 : 20;
      const extraRate = pricing[extraPageKey] !== undefined ? pricing[extraPageKey] : fallbackExtra;
      extraPageFee = (pageCount - 6) * extraRate;
    }

    let workshopFee = 0;
    if (workshopAddon) {
      const workshopKey = `workshop_addon_${suffix}`;
      const fallbackWorkshop = isIndian ? 500 : 10;
      workshopFee = pricing[workshopKey] !== undefined ? pricing[workshopKey] : fallbackWorkshop;
    }

    let virtualFee = 0;
    if (virtualMode) {
      const virtualKey = `virtual_addon_${suffix}`;
      const fallbackVirtual = isIndian ? 1000 : 25;
      virtualFee = pricing[virtualKey] !== undefined ? pricing[virtualKey] : fallbackVirtual;
    }

    const total = baseFee + penalty + extraPageFee + workshopFee + virtualFee;

    return {
      baseFee,
      penalty,
      extraPageFee,
      workshopFee,
      virtualFee,
      total,
      currencySymbol: isIndian ? '₹' : '$',
      currency: isIndian ? 'INR' : 'USD'
    };
  };

  const handleRegistrationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!regPaperId || !regAuthorName || !regPaperTitle || !regEmail || !regPhone || !regScreenshot) {
      setShowRegValidation(true);
      setRegError('Please fill out all required fields and upload the payment screenshot.');
      return;
    }

    setRegSubmitting(true);
    setRegError(null);
    setShowRegValidation(false);
    
    try {
      if (!isSupabaseConfigured || !supabase) {
        // Mock success if Supabase is offline
        setTimeout(() => {
          const newReg = {
            id: Date.now(),
            paper_id: regPaperId || 'N/A',
            paper_title: regPaperTitle || 'Listener Registration',
            author_name: regAuthorName,
            email: regEmail,
            phone: regPhone,
            screenshot_name: regScreenshot ? regScreenshot.name : 'offline_mode_proof.png',
            screenshot_size: regScreenshot ? regScreenshot.size : 102450,
            register_for_tour: regRegisterForTour,
            preferred_tour_place: regPreferredTourPlace || null,
            created_at: new Date().toISOString()
          };
          const existingRegs = JSON.parse(localStorage.getItem('srec_offline_registrations') || '[]');
          const updatedRegs = [newReg, ...existingRegs];
          localStorage.setItem('srec_offline_registrations', JSON.stringify(updatedRegs));
          setSubmittedRegistrations(updatedRegs);

          setRegSubmitting(false);
          setRegSuccess(true);
        }, 1200);
        return;
      }
      
      const { error } = await supabase.from('registrations').insert({
        paper_id: regPaperId,
        paper_title: regPaperTitle,
        author_name: regAuthorName,
        email: regEmail,
        phone: regPhone,
        screenshot_name: regScreenshot ? regScreenshot.name : 'no_file',
        screenshot_size: regScreenshot ? regScreenshot.size : 0,
        register_for_tour: regRegisterForTour,
        preferred_tour_place: regPreferredTourPlace || null
      });
      
      if (error) {
        throw error;
      }

      setRegSuccess(true);
      fetchDbData();
      
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to submit registration. Please try again.';
      console.error('Registration submission error:', err);
      setRegError(errorMsg);
    } finally {
      setRegSubmitting(false);
    }
  };

  // Dynamic document title update based on logo/hero title
  useEffect(() => {
    if (info.hero_title) {
      document.title = `${info.hero_title} | ${info.logo_title || 'Sri Ramakrishna Engineering College'}`;
    }
  }, [info.hero_title, info.logo_title]);

  // Scroll Progress
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  // Countdown timer calculation
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isOver: false
  });

  // Fetch all content from Supabase database (Gracefully falls back to mock data if unconfigured/offline)
  const fetchDbData = async () => {
    // 1. Load localStorage updates first so they render immediately
    const localDepts = localStorage.getItem('srec_offline_departments');
    if (localDepts) setDepartments(JSON.parse(localDepts));
    
    const localCommittee = localStorage.getItem('srec_offline_committee');
    if (localCommittee) setCommitteeMembers(JSON.parse(localCommittee));

    const localSpeakers = localStorage.getItem('srec_offline_speakers');
    if (localSpeakers) setSpeakers(JSON.parse(localSpeakers));

    const localDates = localStorage.getItem('srec_offline_important_dates');
    if (localDates) setImportantDates(JSON.parse(localDates));

    const localWorkshops = localStorage.getItem('srec_offline_workshops');
    if (localWorkshops) setWorkshops(JSON.parse(localWorkshops));

    const localInfo = localStorage.getItem('srec_offline_info');
    if (localInfo) setInfo(prev => ({ ...prev, ...JSON.parse(localInfo) }));

    const localRegs = localStorage.getItem('srec_offline_registrations');
    if (localRegs) setSubmittedRegistrations(JSON.parse(localRegs));

    // 2. Fetch from database if Supabase is connected
    if (!isSupabaseConfigured || !supabase) {
      console.info('Supabase not fully configured. Running on localStorage data.');
      return;
    }

    try {
      // Fetch departments
      const { data: deptData, error: errDept } = await supabase.from('departments').select('*').order('sort_order');
      if (!errDept && deptData && deptData.length > 0) setDepartments(deptData);

      // Fetch committee
      const { data: committeeData, error: errCommittee } = await supabase.from('committee').select('*').order('id');
      if (!errCommittee && committeeData && committeeData.length > 0) setCommitteeMembers(committeeData);

      // Fetch speakers
      const { data: speakersData, error: errSpeakers } = await supabase.from('speakers').select('*').order('id');
      if (!errSpeakers && speakersData && speakersData.length > 0) setSpeakers(speakersData);

      // Fetch important dates
      const { data: datesData, error: errDates } = await supabase.from('important_dates').select('*').order('sort_order');
      if (!errDates && datesData && datesData.length > 0) setImportantDates(datesData);

      // Fetch workshops
      const { data: workshopsData, error: errWorkshops } = await supabase.from('workshops').select('*').order('id');
      if (!errWorkshops && workshopsData && workshopsData.length > 0) setWorkshops(workshopsData);

      // Fetch registration fees
      const { data: feesData, error: errFees } = await supabase.from('registration_fees').select('*').order('sort_order');
      if (!errFees && feesData && feesData.length > 0) setRegistrationFees(feesData);

      // Fetch stats
      const { data: statsData, error: errStats } = await supabase.from('stats').select('*').order('sort_order');
      if (!errStats && statsData && statsData.length > 0) setStats(statsData);

      // Fetch coordinators
      const { data: coordinatorsData, error: errCoordinators } = await supabase.from('coordinators').select('*').order('sort_order');
      if (!errCoordinators && coordinatorsData && coordinatorsData.length > 0) setCoordinators(coordinatorsData);

      // Fetch registration pricing rules
      const { data: pricingData, error: errPricing } = await supabase.from('registration_pricing').select('*');
      if (!errPricing && pricingData && pricingData.length > 0) {
        const pricingMap: Record<string, number> = {};
        pricingData.forEach((row: any) => {
          pricingMap[row.key] = Number(row.value);
        });
        setPricing(pricingMap);
      }

      // Fetch conference info
      const { data: infoData, error: errInfo } = await supabase.from('conference_info').select('*');
      if (!errInfo && infoData && infoData.length > 0) {
        const infoMap: Record<string, string> = {};
        infoData.forEach((row: any) => {
          infoMap[row.key] = row.value;
        });
        setInfo(prev => ({ ...prev, ...infoMap }));
      }

      // Fetch registrations log
      const { data: registrationsLog, error: errReg } = await supabase.from('registrations').select('*').order('created_at', { ascending: false });
      if (!errReg && registrationsLog) setSubmittedRegistrations(registrationsLog);


    } catch (err) {
      console.warn('Failed to load online data. Falling back to offline fallback state.', err);
    }
  };

  useEffect(() => {
    fetchDbData();
  }, []);

  useEffect(() => {
    const targetTime = info.countdown_target ? new Date(info.countdown_target).getTime() : new Date('2027-04-04T09:00:00').getTime();
    const interval = setInterval(() => {
      const now = new Date().getTime();
      const difference = targetTime - now;

      if (difference <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, isOver: true });
        clearInterval(interval);
      } else {
        const d = Math.floor(difference / (1000 * 60 * 60 * 24));
        const h = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const m = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const s = Math.floor((difference % (1000 * 60)) / 1000);
        setTimeLeft({ days: d, hours: h, minutes: m, seconds: s, isOver: false });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [info.countdown_target]);

  // Track active section on scroll
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 500) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }

      const scrollPosition = window.scrollY + 200; // Offset for header

      for (const item of NAV_ITEMS) {
        const el = document.getElementById(item.id);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPosition >= top && scrollPosition < top + height) {
            setActiveSection(item.id);
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    if (id === 'explore') {
      setCurrentPage('explore');
      setActiveSection('explore');
      setMobileMenuOpen(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setCurrentPage('main');

    // Allow state change and DOM rendering to complete if switching back from explore page
    setTimeout(() => {
      const el = document.getElementById(id);
      if (el) {
        window.scrollTo({
          top: el.offsetTop - 95, // Header height offset
          behavior: 'smooth'
        });
        setActiveSection(id);
        setMobileMenuOpen(false);
      }
    }, currentPage === 'explore' ? 100 : 0);
  };

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitted(true);
    setTimeout(() => {
      setFormSubmitted(false);
      setFormData({ name: '', email: '', subject: '', message: '' });
    }, 4000);
  };

  // Framer Motion Animation Presets
  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }
    }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const navLabelMap: Record<string, string> = {
    home: info.nav_home,
    about: info.nav_about,
    committee: info.nav_committee,
    speakers: info.nav_speakers,
    'call-for-papers': info.nav_call_for_papers,
    'important-dates': info.nav_important_dates,
    workshops: info.nav_workshops,
    guidelines: info.nav_guidelines,
    'paper-submission': info.nav_paper_submission,
    registration: info.nav_registration,
    explore: info.nav_explore || "Explore",
    venue: info.nav_venue || "Venue",
    'contact-us': info.nav_contact_us,
    'ieee-sb': info.nav_ieee_sb || "IEEE SB"
  };

  return (
    <div style={{ position: 'relative', width: '100%', minHeight: '100vh', background: 'var(--bg-deep)' }}>
      {/* Background Grids and Overlays */}
      <div className="bg-grid-overlay" />
      <div className="bg-radial-overlay" />

      {/* Top Page Progress Indicator */}
      <motion.div 
        style={{
          scaleX,
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          height: '4px',
          background: 'linear-gradient(90deg, #3b82f6 0%, #06b6d4 100%)',
          transformOrigin: '0%',
          zIndex: 100
        }} 
      />

      {/* Header / Navbar */}
      <header style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '95px',
        background: '#ffffff',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
        borderBottom: '1px solid rgba(0, 0, 0, 0.06)',
        zIndex: 90,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 2rem'
      }}>
        <a 
          href={info.srec_url || "https://srec.ac.in/"} 
          target="_blank" 
          rel="noopener noreferrer"
          title="Sri Ramakrishna Engineering College"
          style={{ display: 'inline-flex', cursor: 'pointer', textDecoration: 'none' }}
        >
          <SrecLogo lightText={false} height="85px" />
        </a>

        {/* Desktop Navigation Links */}
        <nav className="desktop-nav">
          <ul style={{ display: 'flex', gap: '0.35rem', listStyle: 'none', alignItems: 'center', margin: 0, padding: 0 }}>
            {NAV_ITEMS.map((item) => (
              <li key={item.id}>
                {item.external ? (
                  <a
                    href={
                      item.id === 'ieee-sb'
                        ? (info.ieee_sb_url || "https://ieeesrecsbs.vercel.app/")
                        : (info.snr_url || info.snr_trust_url || "https://www.snrst.org")
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="nav-link"
                    style={{ textDecoration: 'none', display: 'inline-block' }}
                  >
                    {navLabelMap[item.id] || item.label}
                  </a>
                ) : (
                  <button
                    onClick={() => scrollToSection(item.id)}
                    className={`nav-link ${activeSection === item.id ? 'active' : ''}`}
                  >
                    {navLabelMap[item.id] || item.label}
                    {activeSection === item.id && (
                      <motion.div 
                        layoutId="activeIndicator"
                        style={{
                          position: 'absolute',
                          bottom: 0,
                          left: 0,
                          right: 0,
                          height: '2.5px',
                          background: '#3b82f6',
                          borderRadius: '2px'
                        }}
                      />
                    )}
                  </button>
                )}
              </li>
            ))}
          </ul>
        </nav>

        {/* AC Logo and Mobile Navigation Toggle Container */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <img 
            src={acLogo} 
            alt="AECTSD Logo" 
            onClick={() => {
              setShowAdminPortal(true);
              setAdminRegMode(false);
              setAdminError(null);
            }}
            style={{ 
              height: '80px', 
              width: 'auto', 
              display: 'block', 
              flexShrink: 0,
              cursor: 'pointer'
            }} 
          />

          {/* Mobile Navigation Toggle */}
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            style={{
              background: 'rgba(15, 23, 42, 0.05)',
              border: '1px solid rgba(15, 23, 42, 0.1)',
              borderRadius: '0.375rem',
              padding: '0.5rem',
              color: '#0f172a',
              cursor: 'pointer'
            }}
            className="mobile-nav-toggle"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </header>

      {/* Mobile Drawer Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            style={{
              position: 'fixed',
              top: '95px',
              left: 0,
              width: '100%',
              background: 'rgba(255, 255, 255, 0.98)',
              backdropFilter: 'blur(20px)',
              borderBottom: '1px solid rgba(0, 0, 0, 0.1)',
              padding: '1.5rem',
              zIndex: 89,
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem'
            }}
            className="mobile-nav-toggle"
          >
            {NAV_ITEMS.map((item) => (
              item.external ? (
                <a
                  key={item.id}
                  href={
                    item.id === 'ieee-sb'
                      ? (info.ieee_sb_url || "https://ieeesrecsbs.vercel.app/")
                      : (info.snr_url || info.snr_trust_url || "https://www.snrst.org")
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#1e293b',
                    textAlign: 'left',
                    padding: '0.75rem 1rem',
                    borderRadius: '0.5rem',
                    fontSize: '1rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    width: '100%',
                    textDecoration: 'none',
                    display: 'block'
                  }}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {navLabelMap[item.id] || item.label}
                </a>
              ) : (
                <button
                  key={item.id}
                  onClick={() => {
                    scrollToSection(item.id);
                    setMobileMenuOpen(false);
                  }}
                  style={{
                    background: activeSection === item.id ? 'rgba(59, 130, 246, 0.08)' : 'transparent',
                    border: 'none',
                    color: activeSection === item.id ? '#3b82f6' : '#1e293b',
                    textAlign: 'left',
                    padding: '0.75rem 1rem',
                    borderRadius: '0.5rem',
                    fontSize: '1rem',
                    fontWeight: activeSection === item.id ? '700' : '600',
                    cursor: 'pointer',
                    width: '100%'
                  }}
                >
                  {navLabelMap[item.id] || item.label}
                </button>
              )
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {currentPage === 'explore' ? (
        <ExplorePage adminUser={adminUser} />
      ) : (
        <>
          {/* Hero Section */}
          <section 
            id="home" 
        style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          position: 'relative',
          padding: '8rem 1.5rem 6rem',
          backgroundImage: `url(${info.hero_bg_url || 'https://images.shiksha.com/mediadata/images/1488263707phpWPR1Pb.jpeg'})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          textAlign: 'center',
          overflow: 'hidden'
        }}
      >
        {/* Light overlay for exact readability and style match */}
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(to bottom, rgba(255, 255, 255, 0.4) 0%, rgba(255, 255, 255, 0.75) 60%, rgba(255, 255, 255, 1) 100%)',
          zIndex: 1
        }} />

        <div style={{ position: 'relative', zIndex: 2, maxWidth: '1000px', width: '100%' }}>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="hero-title md:text-7xl"
          >
            {info.hero_title}
          </motion.h1>
 
          {/* Large Subtitle (Full Conference Name) */}
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            style={{
              fontSize: '1.5rem',
              fontWeight: 700,
              color: 'var(--primary)', // SREC Navy
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              margin: '0 auto 2.5rem',
              maxWidth: '850px',
              lineHeight: 1.4
            }}
            className="md:text-2xl"
          >
            {info.hero_subtitle}
          </motion.h2>

          {/* Date and Location Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '3rem'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.35rem', fontWeight: 700, color: '#0f172a' }}>
              <Calendar size={22} className="text-blue-600" />
              <span>{info.event_date_display}</span>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem', color: '#475569', fontSize: '1.05rem', fontWeight: 500 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <MapPin size={18} className="text-blue-600" />
                <span>{(info.event_location_display || '').includes(',') ? info.event_location_display.split(',')[0] + ',' : (info.event_location_display || '')}</span>
              </div>
              {(info.event_location_display || '').includes(',') && (
                <span>{info.event_location_display.split(',').slice(1).join(',').trim()}</span>
              )}
            </div>
          </motion.div>

          {/* Countdown Clock */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            style={{
              display: 'inline-flex',
              flexDirection: 'column',
              alignItems: 'center',
              background: '#ffffff',
              border: '1px solid rgba(0, 0, 0, 0.08)',
              borderRadius: '1rem',
              padding: '1.5rem 2.5rem',
              boxShadow: '0 10px 25px rgba(0, 0, 0, 0.04)',
              marginBottom: '3rem'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#d97706', fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.75rem' }}>
              <Clock size={16} />
              <span>{info.hero_countdown_title}</span>
            </div>
            
            <div style={{ display: 'flex', gap: '1.5rem' }}>
              {[
                { label: info.label_days, value: timeLeft.days },
                { label: info.label_hours, value: timeLeft.hours },
                { label: info.label_mins, value: timeLeft.minutes },
                { label: info.label_secs, value: timeLeft.seconds }
              ].map((t, idx) => (
                <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <span style={{ fontSize: '2.5rem', fontWeight: 800, color: '#0f172a', fontFamily: 'var(--font-heading)', minWidth: '60px' }}>
                    {String(t.value).padStart(2, '0')}
                  </span>
                  <span style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>
                    {t.label}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Actions */}
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            style={{ display: 'flex', gap: '1.25rem', justifyContent: 'center', flexWrap: 'wrap' }}
          >
            <button onClick={() => scrollToSection('paper-submission')} className="btn btn-primary" style={{ fontSize: '1rem', padding: '1rem 2rem' }}>
              <FileText size={18} />
              {info.hero_btn_submit}
            </button>
            <button onClick={() => setShowCalcModal(true)} className="btn btn-secondary" style={{ fontSize: '1rem', padding: '1rem 2rem' }}>
              {info.hero_btn_register}
              <ChevronRight size={18} />
            </button>
          </motion.div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="section">
        <div className="container">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={fadeInUp}
            style={{ textAlign: 'center', marginBottom: '4rem' }}
          >
            <span style={{ color: '#3b82f6', fontWeight: 700, textTransform: 'uppercase', fontSize: '0.9rem', letterSpacing: '0.1em' }}>{info.about_badge}</span>
            <h2 style={{ fontSize: '2.5rem', color: 'white', marginTop: '0.5rem' }}>{info.about_title}</h2>
            <div style={{ height: '3px', width: '60px', background: '#3b82f6', margin: '1rem auto 0' }} />
          </motion.div>

          <div className="grid-2-col" style={{ gap: '2rem' }}>
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="glass-card"
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
                <BookOpen className="text-blue-400" size={24} />
                <h3 style={{ fontSize: '1.5rem', color: 'white' }}>{info.about_card_conf_title}</h3>
              </div>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem', whiteSpace: 'pre-line' }}>
                {info.about_trust || info.about_conference}
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="glass-card"
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
                <Award className="text-amber-400" size={24} />
                <h3 style={{ fontSize: '1.5rem', color: 'white' }}>{info.about_card_inst_title}</h3>
              </div>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem', whiteSpace: 'pre-line' }}>
                {info.about_institution}
              </p>
            </motion.div>
          </div>

          {/* Stats Bar */}
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid-4-col"
            style={{ marginTop: '4rem' }}
          >
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                className="glass-card"
                style={{ textAlign: 'center', padding: '1.5rem' }}
              >
                <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#3b82f6', fontFamily: 'var(--font-heading)' }}>{stat.number}</div>
                <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: 500 }}>{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Committee Section */}
      <section id="committee" className="section">
        <div className="container">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            style={{ textAlign: 'center', marginBottom: '4rem' }}
          >
            <span style={{ color: '#3b82f6', fontWeight: 700, textTransform: 'uppercase', fontSize: '0.9rem', letterSpacing: '0.1em' }}>{info.committee_badge}</span>
            <h2 style={{ fontSize: '2.5rem', color: 'white', marginTop: '0.5rem' }}>{info.committee_title}</h2>
            <div style={{ height: '3px', width: '60px', background: '#3b82f6', margin: '1rem auto 0' }} />
          </motion.div>

          {/* Committee Tabs */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginBottom: '3rem', flexWrap: 'wrap' }}>
            {([
              { id: 'organizing', label: info.committee_tab_org },
              { id: 'advisory', label: info.committee_tab_adv },
              { id: 'technical', label: info.committee_tab_tech }
            ] as { id: 'organizing' | 'advisory' | 'technical', label: string }[]).map((tab) => (
              <button
                key={tab.id}
                onClick={() => setCommitteeTab(tab.id)}
                className={`btn ${committeeTab === tab.id ? 'btn-primary' : 'btn-secondary'}`}
                style={{ borderRadius: '2rem' }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Committee Content Cards */}
          <AnimatePresence mode="wait">
            <motion.div
              key={committeeTab}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
            >
              {committeeTab === 'organizing' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4rem', width: '100%' }}>
                  {/* Top Leadership Row 1: Patrons and General Chairs side-by-side */}
                  <div className="grid-2-col" style={{ alignItems: 'start', gap: '2rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      <h3 style={{ fontSize: '1.35rem', color: 'var(--primary)', marginBottom: '1rem', fontWeight: 700, textAlign: 'center' }}>
                        Patrons
                      </h3>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {committeeMembers.filter(m => m.category === 'organizing' && m.role === 'Patron').map((member, mIdx) => {
                          const showPic = LEADERSHIP_ROLES.has(member.role || '');
                          return (
                            <div 
                              key={mIdx} 
                              className="glass-card" 
                              style={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: '1rem',
                                borderLeft: '4px solid #0f52ba',
                                textAlign: 'left',
                                padding: '1.25rem',
                                width: '100%'
                              }}
                            >
                              {showPic && (
                                <img 
                                  src={member.image_url || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(member.name)}&backgroundColor=0f52ba,06b6d4,f58220`}
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(member.name)}&backgroundColor=0f52ba,06b6d4,f58220`;
                                  }}
                                  alt={member.name}
                                  style={{
                                    width: '55px',
                                    height: '55px',
                                    borderRadius: '50%',
                                    objectFit: 'cover',
                                    border: '2px solid rgba(59, 130, 246, 0.2)',
                                    flexShrink: 0
                                  }}
                                />
                              )}
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                                <h4 style={{ fontSize: '1.1rem', margin: 0 }}>{member.name}</h4>
                                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0 }}>{member.desc}</p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      <h3 style={{ fontSize: '1.35rem', color: 'var(--primary)', marginBottom: '1rem', fontWeight: 700, textAlign: 'center' }}>
                        General Chairs
                      </h3>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {committeeMembers.filter(m => m.category === 'organizing' && m.role === 'General Chair').map((member, mIdx) => {
                          const showPic = LEADERSHIP_ROLES.has(member.role || '');
                          return (
                            <div 
                              key={mIdx} 
                              className="glass-card" 
                              style={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: '1rem',
                                borderLeft: '4px solid #0f52ba',
                                textAlign: 'left',
                                padding: '1.25rem',
                                width: '100%'
                              }}
                            >
                              {showPic && (
                                <img 
                                  src={member.image_url || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(member.name)}&backgroundColor=0f52ba,06b6d4,f58220`}
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(member.name)}&backgroundColor=0f52ba,06b6d4,f58220`;
                                  }}
                                  alt={member.name}
                                  style={{
                                    width: '55px',
                                    height: '55px',
                                    borderRadius: '50%',
                                    objectFit: 'cover',
                                    border: '2px solid rgba(59, 130, 246, 0.2)',
                                    flexShrink: 0
                                  }}
                                />
                              )}
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                                <h4 style={{ fontSize: '1.1rem', margin: 0 }}>{member.name}</h4>
                                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0 }}>{member.desc}</p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Top Leadership Row 2: Conference Chair and Session Chair side-by-side */}
                  <div className="grid-2-col" style={{ alignItems: 'start', gap: '2rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      <h3 style={{ fontSize: '1.35rem', color: 'var(--primary)', marginBottom: '1rem', fontWeight: 700, textAlign: 'center' }}>
                        Conference Chair & Organizing Secretary
                      </h3>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {committeeMembers.filter(m => m.category === 'organizing' && m.role === 'Conference Chair & Organizing Secretary').map((member, mIdx) => {
                          const showPic = LEADERSHIP_ROLES.has(member.role || '');
                          return (
                            <div 
                              key={mIdx} 
                              className="glass-card" 
                              style={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: '1rem',
                                borderLeft: '4px solid #0f52ba',
                                textAlign: 'left',
                                padding: '1.25rem',
                                width: '100%'
                              }}
                            >
                              {showPic && (
                                <img 
                                  src={member.image_url || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(member.name)}&backgroundColor=0f52ba,06b6d4,f58220`}
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(member.name)}&backgroundColor=0f52ba,06b6d4,f58220`;
                                  }}
                                  alt={member.name}
                                  style={{
                                    width: '55px',
                                    height: '55px',
                                    borderRadius: '50%',
                                    objectFit: 'cover',
                                    border: '2px solid rgba(59, 130, 246, 0.2)',
                                    flexShrink: 0
                                  }}
                                />
                              )}
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                                <h4 style={{ fontSize: '1.1rem', margin: 0 }}>{member.name}</h4>
                                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0 }}>{member.desc}</p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      <h3 style={{ fontSize: '1.35rem', color: 'var(--primary)', marginBottom: '1rem', fontWeight: 700, textAlign: 'center' }}>
                        Session Chair
                      </h3>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {committeeMembers.filter(m => m.category === 'organizing' && m.role === 'Session Chair').map((member, mIdx) => {
                          const showPic = LEADERSHIP_ROLES.has(member.role || '');
                          return (
                            <div 
                              key={mIdx} 
                              className="glass-card" 
                              style={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: '1rem',
                                borderLeft: '4px solid #0f52ba',
                                textAlign: 'left',
                                padding: '1.25rem',
                                width: '100%'
                              }}
                            >
                              {showPic && (
                                <img 
                                  src={member.image_url || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(member.name)}&backgroundColor=0f52ba,06b6d4,f58220`}
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(member.name)}&backgroundColor=0f52ba,06b6d4,f58220`;
                                  }}
                                  alt={member.name}
                                  style={{
                                    width: '55px',
                                    height: '55px',
                                    borderRadius: '50%',
                                    objectFit: 'cover',
                                    border: '2px solid rgba(59, 130, 246, 0.2)',
                                    flexShrink: 0
                                  }}
                                />
                              )}
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                                <h4 style={{ fontSize: '1.1rem', margin: 0 }}>{member.name}</h4>
                                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0 }}>{member.desc}</p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Subcommittees rendered as hierarchy trees */}
                  {SUBCOMMITTEES.map((sub, idx) => {
                    const chairs = committeeMembers.filter(m => m.category === 'organizing' && m.role === sub.chairRole);
                    const members = committeeMembers.filter(m => m.category === 'organizing' && m.role === sub.memberRole);

                    if (chairs.length === 0 && members.length === 0) return null;

                    return (
                      <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', alignItems: 'center', width: '100%' }}>
                        <h3 style={{ 
                          fontSize: '1.35rem', 
                          color: 'var(--primary)', 
                          marginBottom: '0.5rem',
                          fontWeight: 700,
                          textAlign: 'center'
                        }}>
                          {sub.name}
                        </h3>

                        {/* Chair(s) - Centered */}
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem', flexWrap: 'wrap', width: '100%' }}>
                          {chairs.map((member, mIdx) => {
                            const showPic = LEADERSHIP_ROLES.has(member.role || '');
                            return (
                              <div 
                                key={mIdx} 
                                className="glass-card" 
                                style={{ 
                                  display: 'flex', 
                                  alignItems: 'center', 
                                  gap: '1rem',
                                  borderLeft: '4px solid #0f52ba',
                                  textAlign: 'left',
                                  padding: '1.25rem',
                                  width: '100%',
                                  maxWidth: '400px'
                                }}
                              >
                                {showPic && (
                                  <img 
                                    src={member.image_url || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(member.name)}&backgroundColor=0f52ba,06b6d4,f58220`}
                                    onError={(e) => {
                                      (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(member.name)}&backgroundColor=0f52ba,06b6d4,f58220`;
                                    }}
                                    alt={member.name}
                                    style={{
                                      width: '55px',
                                      height: '55px',
                                      borderRadius: '50%',
                                      objectFit: 'cover',
                                      border: '2px solid rgba(59, 130, 246, 0.2)',
                                      flexShrink: 0
                                    }}
                                  />
                                )}
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                                  <h4 style={{ fontSize: '1.1rem', margin: 0 }}>{member.name}</h4>
                                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0 }}>{member.desc}</p>
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        {/* Subcommittee Members in a 3-column Grid */}
                        {members.length > 0 && (
                          <div className="grid-3-col" style={{ width: '100%', gap: '1.5rem' }}>
                            {members.map((member, mIdx) => {
                              const showPic = LEADERSHIP_ROLES.has(member.role || '');
                              return (
                                <div 
                                  key={mIdx} 
                                  className="glass-card" 
                                  style={{ 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    gap: '1rem',
                                    borderLeft: '4px solid #0f52ba',
                                    textAlign: 'left',
                                    padding: '1.25rem',
                                    width: '100%'
                                  }}
                                >
                                  {showPic && (
                                    <img 
                                      src={member.image_url || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(member.name)}&backgroundColor=0f52ba,06b6d4,f58220`}
                                      onError={(e) => {
                                        (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(member.name)}&backgroundColor=0f52ba,06b6d4,f58220`;
                                      }}
                                      alt={member.name}
                                      style={{
                                        width: '55px',
                                        height: '55px',
                                        borderRadius: '50%',
                                        objectFit: 'cover',
                                        border: '2px solid rgba(59, 130, 246, 0.2)',
                                        flexShrink: 0
                                      }}
                                    />
                                  )}
                                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                                    <h4 style={{ fontSize: '1.1rem', margin: 0 }}>{member.name}</h4>
                                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0 }}>{member.desc}</p>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {/* General Members (Organizing Committee Members) at the bottom */}
                  {committeeMembers.filter(m => m.category === 'organizing' && (m.role === 'Member' || !m.role)).length > 0 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', alignItems: 'center' }}>
                      <h3 style={{ 
                        fontSize: '1.5rem', 
                        color: 'var(--primary)', 
                        marginBottom: '1rem',
                        fontWeight: 700,
                        textAlign: 'center'
                      }}>
                        {ROLE_HEADERS['Member'] || 'Organizing Committee Members'}
                      </h3>
                      <div className="grid-3-col" style={{ width: '100%', gap: '1.5rem' }}>
                        {committeeMembers.filter(m => m.category === 'organizing' && (m.role === 'Member' || !m.role)).map((member, mIdx) => (
                          <div 
                            key={mIdx} 
                            className="glass-card" 
                            style={{ 
                              display: 'flex', 
                              alignItems: 'center', 
                              gap: '1rem',
                              borderLeft: '4px solid #0f52ba',
                              textAlign: 'left',
                              padding: '1.25rem'
                            }}
                          >
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                              <h4 style={{ fontSize: '1.1rem', margin: 0 }}>{member.name}</h4>
                              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0 }}>{member.desc}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {committeeTab === 'advisory' && (
                <div className="grid-2-col">
                  {committeeMembers.filter(m => m.category === 'advisory').map((adviser, index) => (
                    <div key={index} className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.25rem' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', textAlign: 'left' }}>
                        {adviser.role && <span style={{ fontSize: '0.75rem', color: '#d97706', fontWeight: 700, textTransform: 'uppercase' }}>{adviser.role}</span>}
                        <h4 style={{ fontSize: '1.1rem', margin: 0 }}>{adviser.name}</h4>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0 }}>{adviser.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {committeeTab === 'technical' && (
                <div className="grid-2-col">
                  {committeeMembers.filter(m => m.category === 'technical').map((tech, index) => (
                    <div key={index} className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.25rem' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', textAlign: 'left' }}>
                        {tech.role && <span style={{ fontSize: '0.75rem', color: '#d97706', fontWeight: 700, textTransform: 'uppercase' }}>{tech.role}</span>}
                        <h4 style={{ fontSize: '1.1rem', margin: 0 }}>{tech.name}</h4>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0 }}>{tech.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </section>

      {/* Speakers Section */}
      <section id="speakers" className="section">
        <div className="container">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            style={{ textAlign: 'center', marginBottom: '4rem' }}
          >
            <span style={{ color: '#3b82f6', fontWeight: 700, textTransform: 'uppercase', fontSize: '0.9rem', letterSpacing: '0.1em' }}>{info.speakers_badge}</span>
            <h2 style={{ fontSize: '2.5rem', color: 'white', marginTop: '0.5rem' }}>{info.speakers_title}</h2>
            <div style={{ height: '3px', width: '60px', background: '#3b82f6', margin: '1rem auto 0' }} />
          </motion.div>

          <div className="grid-3-col" style={{ gap: '2rem' }}>
            {speakers.map((speaker, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="glass-card"
                style={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center', 
                  textAlign: 'center',
                  borderTop: `4px solid ${speaker.color}`
                }}
              >
                <div style={{ 
                  width: '90px', 
                  height: '90px', 
                  borderRadius: '50%', 
                  background: 'rgba(0, 0, 0, 0.02)', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  border: `2px solid ${speaker.color}`,
                  marginBottom: '1.25rem',
                  overflow: 'hidden'
                }}>
                  {speaker.image_url ? (
                    <img 
                      src={speaker.image_url} 
                      alt={speaker.name} 
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                    />
                  ) : (
                    <User size={45} style={{ color: speaker.color }} />
                  )}
                </div>
                <h3 style={{ fontSize: '1.35rem', color: 'white', marginBottom: '0.25rem' }}>{speaker.name}</h3>
                <span style={{ fontSize: '0.85rem', color: speaker.color, fontWeight: 700, textTransform: 'uppercase' }}>{speaker.title}</span>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '0.5rem 0 1.25rem' }}>{speaker.role}</p>
                <div style={{ 
                  background: 'rgba(0, 0, 0, 0.02)', 
                  border: '1px solid rgba(0, 0, 0, 0.06)',
                  padding: '1rem', 
                  borderRadius: '0.5rem', 
                  width: '100%', 
                  marginTop: 'auto' 
                }}>
                  <span style={{ display: 'block', fontSize: '0.75rem', color: '#d97706', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>{info.speakers_keynote_label}</span>
                  <span style={{ fontSize: '0.9rem', color: '#1e293b', fontWeight: 600 }}>"{speaker.talk}"</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Call For Papers Section */}
      <section id="call-for-papers" className="section">
        <div className="container">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            style={{ textAlign: 'center', marginBottom: '4rem' }}
          >
            <span style={{ color: '#3b82f6', fontWeight: 700, textTransform: 'uppercase', fontSize: '0.9rem', letterSpacing: '0.1em' }}>{info.cfp_badge}</span>
            <h2 style={{ fontSize: '2.5rem', color: 'white', marginTop: '0.5rem' }}>{info.cfp_title}</h2>
            <div style={{ height: '3px', width: '60px', background: '#3b82f6', margin: '1rem auto 0' }} />
            <p style={{ color: 'var(--text-secondary)', marginTop: '1.5rem', maxWidth: '800px', marginInline: 'auto' }}>
              {info.cfp_desc}
            </p>
          </motion.div>

          {/* Departments grid */}
          <div className="grid-3-col">
            {departments.map((dept, index) => (
              <div 
                key={index} 
                className="glass-card" 
                onClick={() => setSelectedDept(dept)}
                style={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  gap: '1rem', 
                  cursor: 'pointer',
                  justifyContent: 'space-between',
                  height: '100%',
                  minHeight: '180px'
                }}
              >
                <div>
                  <span style={{ fontSize: '0.85rem', color: 'var(--gold)', fontWeight: 800, textTransform: 'uppercase' }}>
                    {info.cfp_badge} {index + 1}
                  </span>
                  <h3 style={{ fontSize: '1.2rem', marginTop: '0.5rem', lineHeight: '1.4', fontWeight: 700 }}>
                    {dept.name}
                  </h3>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.85rem', color: '#0f52ba', fontWeight: 700, marginTop: 'auto' }}>
                  <span>View Scope Details</span>
                  <ChevronRight size={16} />
                </div>
              </div>
            ))}
          </div>

          {/* Template Downloads */}
          <div style={{ marginTop: '3.5rem', display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <a href="#" className="btn btn-secondary" onClick={(e) => { e.preventDefault(); alert(info.alert_download_word); }}>
              <Download size={16} />
              {info.cfp_btn_word}
            </a>
            <a href="#" className="btn btn-secondary" onClick={(e) => { e.preventDefault(); alert(info.alert_download_latex); }}>
              <Download size={16} />
              {info.cfp_btn_latex}
            </a>
          </div>
        </div>
      </section>

      {/* Important Dates Section */}
      <section id="important-dates" className="section">
        <div className="container">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            style={{ textAlign: 'center', marginBottom: '4rem' }}
          >
            <span style={{ color: '#3b82f6', fontWeight: 700, textTransform: 'uppercase', fontSize: '0.9rem', letterSpacing: '0.1em' }}>{info.dates_badge}</span>
            <h2 style={{ fontSize: '2.5rem', color: 'white', marginTop: '0.5rem' }}>{info.dates_title}</h2>
            <div style={{ height: '3px', width: '60px', background: '#3b82f6', margin: '1rem auto 0' }} />
          </motion.div>

          {/* Grid of Important Dates */}
          <div className="grid-3-col" style={{ gap: '2rem' }}>
            {importantDates.map((evt, idx) => {
              const { month, day, year } = parseDateDisplay(evt.event_date);
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 25 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: idx * 0.1 }}
                  className="important-date-card"
                  style={{
                    display: 'flex',
                    flexDirection: 'row',
                    gap: '1.25rem',
                    alignItems: 'center',
                    padding: '1.5rem',
                    background: 'var(--glass-bg)',
                    border: '1px solid var(--glass-border)',
                    borderRadius: '1rem',
                    boxShadow: 'var(--shadow-lg)',
                    height: '100%'
                  }}
                >
                  {/* Calendar Badge */}
                  <div style={{
                    width: '75px',
                    height: '85px',
                    background: '#ffffff',
                    borderRadius: '0.75rem',
                    boxShadow: '0 4px 10px rgba(0, 0, 0, 0.08)',
                    border: '1px solid rgba(0, 0, 0, 0.08)',
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden',
                    flexShrink: 0,
                    textAlign: 'center'
                  }}>
                    <div style={{
                      background: 'linear-gradient(135deg, #0f52ba 0%, #091d36 100%)',
                      color: '#ffffff',
                      fontSize: '0.75rem',
                      fontWeight: 800,
                      padding: '0.35rem 0',
                      letterSpacing: '0.05em',
                      textTransform: 'uppercase'
                    }}>
                      {month}
                    </div>
                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center',
                      alignItems: 'center',
                      flexGrow: 1,
                      padding: '0.25rem 0'
                    }}>
                      <span style={{
                        fontSize: day.length > 2 ? '1.15rem' : '1.75rem',
                        fontWeight: 800,
                        color: '#0f172a',
                        lineHeight: 1
                      }}>
                        {day}
                      </span>
                      <span style={{
                        fontSize: '0.65rem',
                        color: '#64748b',
                        fontWeight: 600,
                        marginTop: '0.15rem'
                      }}>
                        {year}
                      </span>
                    </div>
                  </div>

                  {/* Date details */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', textAlign: 'left', flexGrow: 1 }}>
                    <h4 style={{ fontSize: '1.15rem', margin: 0, fontWeight: 700, lineHeight: '1.3', color: '#091d36' }}>
                      {evt.title}
                    </h4>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: 0, lineHeight: '1.5' }}>
                      {evt.desc}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Workshops Section */}
      <section id="workshops" className="section">
        <div className="container">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            style={{ textAlign: 'center', marginBottom: '4rem' }}
          >
            <span style={{ color: '#3b82f6', fontWeight: 700, textTransform: 'uppercase', fontSize: '0.9rem', letterSpacing: '0.1em' }}>{info.workshops_badge}</span>
            <h2 style={{ fontSize: '2.5rem', color: 'white', marginTop: '0.5rem' }}>{info.workshops_title}</h2>
            <div style={{ height: '3px', width: '60px', background: '#3b82f6', margin: '1rem auto 0' }} />
            <p style={{ color: 'var(--text-secondary)', marginTop: '1.5rem', maxWidth: '800px', marginInline: 'auto' }}>
              {info.workshops_desc}
            </p>
          </motion.div>

          <div className="grid-2-col" style={{ gap: '2rem' }}>
            {workshops.map((wk, index) => (
              <div key={index} className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <span style={{ fontSize: '0.8rem', color: '#f59e0b', fontWeight: 800, textTransform: 'uppercase' }}>{info.workshop_label} {index + 1}</span>
                <h3 style={{ fontSize: '1.5rem', color: 'white' }}>{wk.title}</h3>
                <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                  <strong>{info.label_lead_instructor}</strong> {wk.instructor}
                </div>
                <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.85rem', color: '#06b6d4', fontWeight: 600 }}>
                  <span>{wk.duration}</span>
                  <span>{info.label_fee} {wk.price}</span>
                </div>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>{wk.details}</p>
                <button 
                  onClick={() => scrollToSection('registration')} 
                  className="btn btn-secondary" 
                  style={{ marginTop: 'auto', alignSelf: 'flex-start' }}
                >
                  {info.workshops_btn_reg}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Guidelines Section */}
      <section id="guidelines" className="section">
        <div className="container">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            style={{ textAlign: 'center', marginBottom: '4rem' }}
          >
            <span style={{ color: '#3b82f6', fontWeight: 700, textTransform: 'uppercase', fontSize: '0.9rem', letterSpacing: '0.1em' }}>{info.guidelines_badge}</span>
            <h2 style={{ fontSize: '2.5rem', color: 'white', marginTop: '0.5rem' }}>{info.guidelines_title}</h2>
            <div style={{ height: '3px', width: '60px', background: '#3b82f6', margin: '1rem auto 0' }} />
          </motion.div>

          <div className="grid-2-col" style={{ gap: '2rem' }}>
            <div className="glass-card">
              <h3 style={{ fontSize: '1.35rem', color: 'white', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CheckCircle className="text-green-500" size={20} />
                {info.guidelines_sub1}
              </h3>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.95rem', color: 'var(--text-secondary)' }}>
                {(info.guidelines_bullets_formatting || '').split('\n').map((bullet, idx) => (
                  <li key={idx}>• {bullet}</li>
                ))}
              </ul>
            </div>

            <div className="glass-card">
              <h3 style={{ fontSize: '1.35rem', color: 'white', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CheckCircle className="text-green-500" size={20} />
                {info.guidelines_sub2}
              </h3>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.95rem', color: 'var(--text-secondary)' }}>
                {(info.guidelines_bullets_presentation || '').split('\n').map((bullet, idx) => (
                  <li key={idx}>• {bullet}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Paper Submission Section */}
      <section id="paper-submission" className="section">
        <div className="container">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            style={{ textAlign: 'center', marginBottom: '4rem' }}
          >
            <span style={{ color: '#3b82f6', fontWeight: 700, textTransform: 'uppercase', fontSize: '0.9rem', letterSpacing: '0.1em' }}>{info.submission_badge}</span>
            <h2 style={{ fontSize: '2.5rem', color: 'white', marginTop: '0.5rem' }}>{info.submission_title}</h2>
            <div style={{ height: '3px', width: '60px', background: '#3b82f6', margin: '1rem auto 0' }} />
          </motion.div>

          <div className="glass-card" style={{ maxWidth: '800px', margin: '0 auto', padding: '3rem 2rem', textAlign: 'center' }}>
            <div style={{ display: 'inline-flex', background: 'rgba(59, 130, 246, 0.1)', padding: '1rem', borderRadius: '50%', color: '#3b82f6', marginBottom: '1.5rem' }}>
              <Layers size={36} />
            </div>
            
            <h3 style={{ fontSize: '1.75rem', color: 'white', marginBottom: '1rem' }}>{info.submission_card_title}</h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', maxWidth: '600px', marginInline: 'auto' }}>
              {info.submission_card_desc}
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center', marginBottom: '2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', color: '#64748b' }}>
                <Terminal size={14} />
                <span>{info.label_conf_id} <strong>{info.cmt_id}</strong></span>
              </div>
            </div>

            <a 
              href={info.cmt_link} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="btn btn-primary"
              style={{ fontSize: '1.1rem', padding: '1rem 2.5rem' }}
            >
              {info.submission_btn_cmt}
              <ExternalLink size={18} />
            </a>
          </div>
        </div>
      </section>

      {/* Registration Section */}
      <section id="registration" className="section">
        <div className="container">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            style={{ textAlign: 'center', marginBottom: '4rem' }}
          >
            <span style={{ color: '#3b82f6', fontWeight: 700, textTransform: 'uppercase', fontSize: '0.9rem', letterSpacing: '0.1em' }}>{info.reg_badge}</span>
            <h2 style={{ fontSize: '2.5rem', color: 'white', marginTop: '0.5rem' }}>{info.reg_title}</h2>
            <div style={{ height: '3px', width: '60px', background: '#3b82f6', margin: '1rem auto 0' }} />
          </motion.div>

          {/* Pricing Table */}
          <div className="registration-table-container">
            <table className="registration-table">
              <thead>
                <tr>
                  <th rowSpan={3} style={{ width: '25%' }}>{info.reg_table_header_member}</th>
                  <th colSpan={2}>{info.reg_table_header_indian}</th>
                  <th colSpan={4}>
                    {info.reg_table_header_foreign}<br />
                    <span style={{ fontSize: '0.75rem', fontWeight: 500, opacity: 0.8 }}>
                      {info.reg_table_header_foreign_note}
                    </span>
                  </th>
                </tr>
                <tr>
                  <th rowSpan={2}>{info.reg_table_header_regular}</th>
                  <th rowSpan={2}>{info.reg_table_header_early}</th>
                  <th colSpan={2}>{info.reg_table_header_physical}</th>
                  <th colSpan={2}>{info.reg_table_header_virtual}</th>
                </tr>
                <tr>
                  <th>{info.reg_table_header_regular}</th>
                  <th>{info.reg_table_header_early}</th>
                  <th>{info.reg_table_header_regular}</th>
                  <th>{info.reg_table_header_early}</th>
                </tr>
              </thead>
              <tbody>
                {registrationFees.map((row, index) => (
                  <tr key={index}>
                    <td style={{ fontWeight: 600, textAlign: 'left' }}>{row.member_type}</td>
                    <td>{row.inr_reg}</td>
                    <td>{row.inr_early}</td>
                    <td>{row.usd_phys_reg}</td>
                    <td>{row.usd_phys_early}</td>
                    <td>{row.usd_virt_reg}</td>
                    <td>{row.usd_virt_early}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{ marginBottom: '3rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <p style={{ color: '#d97706', fontWeight: 600, fontSize: '0.95rem' }}>
              {info.reg_notice_non_presenter}
            </p>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', fontWeight: 600, fontStyle: 'italic', lineHeight: 1.5 }}>
              {info.reg_notice_certificate}
            </p>
                  <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', alignItems: 'flex-start' }}>
              <h4 style={{ fontSize: '1.2rem', color: '#0f172a', fontWeight: 700 }}>{info.reg_link_label}</h4>
              <button 
                className="btn btn-primary" 
                style={{ background: '#0b2240', border: '1px solid rgba(0,0,0,0.1)', padding: '0.75rem 2.5rem', fontSize: '1rem' }}
                onClick={() => setShowCalcModal(true)}
              >
                {info.reg_btn_click}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Us Section */}
      <section id="contact-us" className="section">
        <div className="container">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            style={{ textAlign: 'center', marginBottom: '4rem' }}
          >
            <span style={{ color: '#3b82f6', fontWeight: 700, textTransform: 'uppercase', fontSize: '0.9rem', letterSpacing: '0.1em' }}>{info.contact_badge}</span>
            <h2 style={{ fontSize: '2.5rem', color: 'white', marginTop: '0.5rem' }}>{info.contact_title}</h2>
            <div style={{ height: '3px', width: '60px', background: '#3b82f6', margin: '1rem auto 0' }} />
          </motion.div>

          <div className="grid-2-col" style={{ gap: '2rem' }}>
            {/* Contact Form */}
            <div className="glass-card">
              <h3 style={{ fontSize: '1.5rem', color: 'white', marginBottom: '1.5rem' }}>{info.contact_form_title}</h3>
              
              {formSubmitted ? (
                <div style={{ 
                  background: 'rgba(34, 197, 94, 0.1)', 
                  border: '1px solid rgba(34, 197, 94, 0.3)', 
                  borderRadius: '0.5rem', 
                  padding: '1.5rem',
                  textAlign: 'center',
                  color: '#4ade80'
                }}>
                  <CheckCircle size={36} style={{ margin: '0 auto 1rem' }} />
                  <h4 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>{info.contact_form_success_title}</h4>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{info.contact_form_success_desc}</p>
                </div>
              ) : (
                <form onSubmit={handleContactSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div>
                    <label style={{ fontSize: '0.85rem', color: '#cbd5e1', fontWeight: 600, display: 'block', marginBottom: '0.5rem' }}>{info.contact_form_label_name}</label>
                    <input 
                      type="text" 
                      required 
                      className="form-input" 
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder={info.contact_form_placeholder_name} 
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.85rem', color: '#cbd5e1', fontWeight: 600, display: 'block', marginBottom: '0.5rem' }}>{info.contact_form_label_email}</label>
                    <input 
                      type="email" 
                      required 
                      className="form-input" 
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder={info.contact_form_placeholder_email} 
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.85rem', color: '#cbd5e1', fontWeight: 600, display: 'block', marginBottom: '0.5rem' }}>{info.contact_form_label_subject}</label>
                    <input 
                      type="text" 
                      required 
                      className="form-input" 
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      placeholder={info.contact_form_placeholder_subject} 
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.85rem', color: '#cbd5e1', fontWeight: 600, display: 'block', marginBottom: '0.5rem' }}>{info.contact_form_label_message}</label>
                    <textarea 
                      rows={4} 
                      required 
                      className="form-input" 
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder={info.contact_form_placeholder_message} 
                    />
                  </div>

                  <button type="submit" className="btn btn-primary" style={{ alignSelf: 'flex-start', marginTop: '0.5rem' }}>
                    {info.contact_form_btn_send}
                  </button>
                </form>
              )}
            </div>

            {/* Address & Coordinators */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div className="glass-card">
                <h3 style={{ fontSize: '1.35rem', color: 'white', marginBottom: '12.25px' }}>{info.contact_sec_title}</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                  <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <MapPin size={20} className="text-blue-400" style={{ flexShrink: 0 }} />
                    <span style={{ whiteSpace: 'pre-line' }}>
                      {info.secretariat_address}
                    </span>
                  </div>
                  
                  <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                    <Mail size={18} className="text-blue-400" />
                    <a href={`mailto:${info.secretariat_email}`} style={{ color: '#60a5fa', textDecoration: 'none' }}>{info.secretariat_email}</a>
                  </div>

                  <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                    <Phone size={18} className="text-blue-400" />
                    <span>{info.secretariat_phone}</span>
                  </div>
                </div>
              </div>

              {/* Coordinators */}
              <div className="glass-card">
                <h3 style={{ fontSize: '1.35rem', color: 'white', marginBottom: '1.25rem' }}>{info.contact_coord_title}</h3>
                <div className="grid-2-col" style={{ gap: '1rem' }}>
                  {coordinators.map((coord, cidx) => (
                    <div key={cidx} style={{ background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '0.5rem', border: '1px solid rgba(255,255,255,0.04)' }}>
                      <span style={{ fontSize: '0.75rem', color: '#f59e0b', fontWeight: 800, textTransform: 'uppercase' }}>{coord.role}</span>
                      <h4 style={{ fontSize: '1.05rem', color: 'white', margin: '0.25rem 0' }}>{coord.name}</h4>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                        <Phone size={12} />
                        <span>{coord.phone}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Map & Directions Section */}
      <section id="venue" className="section" style={{ background: '#ffffff' }}>
        <div className="container">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            style={{ textAlign: 'center', marginBottom: '4rem' }}
          >
            <span style={{ color: '#3b82f6', fontWeight: 700, textTransform: 'uppercase', fontSize: '0.9rem', letterSpacing: '0.1em' }}>Venue</span>
            <h2 style={{ fontSize: '2.5rem', color: '#091d36', marginTop: '0.5rem' }}>Map & Directions</h2>
            <div style={{ height: '3px', width: '60px', background: '#3b82f6', margin: '1rem auto 0' }} />
          </motion.div>

          <div className="grid-2-col" style={{ gap: '2rem', marginBottom: '3.5rem', alignItems: 'stretch' }}>
            {/* College Mini Map */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="map-container"
            >
              <iframe 
                title="SREC Campus Map"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3915.150328964016!2d76.9632117754871!3d11.102171853099849!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3ba8f7000afa766b%3A0x2b5757b8d520a3af!2sSri%20Ramakrishna%20Engineering%20College!5e0!3m2!1sen!2sin!4v1780992469751!5m2!1sen!2sin"
                allowFullScreen={true}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </motion.div>

            {/* Directions details */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="glass-card"
              style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}
            >
              <h3 style={{ fontSize: '1.5rem', color: '#091d36', marginBottom: '1.25rem' }}>How to Reach SREC</h3>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.95rem', lineHeight: '1.6' }}>
                Sri Ramakrishna Engineering College is situated in Vattamalaipalayam, Coimbatore. It is well connected by road and public transport from all parts of Coimbatore city.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div style={{ display: 'flex', gap: '0.85rem', alignItems: 'flex-start' }}>
                  <div style={{ background: 'rgba(59, 130, 246, 0.08)', padding: '0.5rem', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3b82f6' }}>
                    <MapPin size={20} />
                  </div>
                  <div>
                    <h4 style={{ fontSize: '0.95rem', fontWeight: 700, margin: '0 0 0.15rem' }}>Coimbatore International Airport</h4>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Distance: ~18 km | Approx. 35 mins drive via Saravanampatti</span>
                  </div>
                </div>
                
                <div style={{ display: 'flex', gap: '0.85rem', alignItems: 'flex-start' }}>
                  <div style={{ background: 'rgba(59, 130, 246, 0.08)', padding: '0.5rem', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3b82f6' }}>
                    <MapPin size={20} />
                  </div>
                  <div>
                    <h4 style={{ fontSize: '0.95rem', fontWeight: 700, margin: '0 0 0.15rem' }}>Coimbatore Junction (CBE) Railway Station</h4>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Distance: ~14 km | Approx. 30 mins drive via Gandhipuram</span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.85rem', alignItems: 'flex-start' }}>
                  <div style={{ background: 'rgba(59, 130, 246, 0.08)', padding: '0.5rem', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3b82f6' }}>
                    <MapPin size={20} />
                  </div>
                  <div>
                    <h4 style={{ fontSize: '0.95rem', fontWeight: 700, margin: '0 0 0.15rem' }}>Gandhipuram Town Bus Stand</h4>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Distance: ~12 km | Local city buses (Route 45 series) available frequently</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* QR Navigation Cards */}
          <div className="qr-section">
            <h3 style={{ fontSize: '1.75rem', color: '#091d36', fontWeight: 800, textAlign: 'center', marginBottom: '0.5rem' }}>
              Navigate with QR Codes: Find Your Way Easily!
            </h3>
            <p style={{ color: '#475569', fontSize: '0.95rem', textAlign: 'center', marginBottom: '2.5rem' }}>
              Scan the QR codes below on your mobile device to open live GPS directions directly in Google Maps.
            </p>

            <div className="qr-card-grid">
              {[
                {
                  route: "Route Saravanampatti - SREC",
                  url: "https://www.google.com/maps/dir/Saravanampatti,+Coimbatore,+Tamil+Nadu/Sri+Ramakrishna+Engineering+College,+Vattamalaipalayam,+Coimbatore,+Tamil+Nadu+641022/"
                },
                {
                  route: "Route Gandhipuram - SREC",
                  url: "https://www.google.com/maps/dir/Gandhipuram,+Coimbatore,+Tamil+Nadu/Sri+Ramakrishna+Engineering+College,+Vattamalaipalayam,+Coimbatore,+Tamil+Nadu+641022/"
                },
                {
                  route: "Route CBE Railway Station - SREC",
                  url: "https://www.google.com/maps/dir/Coimbatore+Junction,+State+Bank+Rd,+Gopalapuram,+Coimbatore,+Tamil+Nadu+641018/Sri+Ramakrishna+Engineering+College,+Vattamalaipalayam,+Coimbatore,+Tamil+Nadu+641022/"
                }
              ].map((qr, qidx) => (
                <motion.div
                  key={qidx}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: qidx * 0.15 }}
                  className="qr-card"
                >
                  <a 
                    href={info.srec_url || "https://srec.ac.in/"}
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Sri Ramakrishna Engineering College"
                    className="qr-card-header"
                    style={{ textDecoration: 'none', display: 'flex', alignItems: 'center' }}
                  >
                    <img 
                      src={srecLogo} 
                      alt="SREC Logo" 
                      className="qr-card-header-logo"
                    />
                    <div className="qr-card-header-text" style={{ paddingLeft: '1rem', textAlign: 'left' }}>
                      <h4 className="qr-card-header-title">Sri Ramakrishna</h4>
                      <p className="qr-card-header-subtitle">Engineering College</p>
                    </div>
                  </a>
                  
                  <div className="qr-gold-container">
                    <div className="qr-code-wrapper">
                      <img 
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(qr.url)}`}
                        alt={`QR Code for ${qr.route}`}
                        className="qr-code-img"
                        loading="lazy"
                      />
                    </div>
                  </div>

                  <div className="qr-card-footer">
                    <p className="qr-card-footer-text">
                      Scan the QR code for Route<br />
                      <strong>{qr.route.replace('Route ', '')}</strong>
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>
        </>
      )}


      {/* Footer */}
      <footer style={{
        background: 'var(--bg-deep)',
        borderTop: '1px solid rgba(255, 255, 255, 0.05)',
        padding: '3rem 0',
        textAlign: 'center',
        position: 'relative',
        zIndex: 5
      }}>
        <div className="container">
          <a 
            href={info.srec_url || "https://srec.ac.in/"} 
            target="_blank" 
            rel="noopener noreferrer"
            title="Sri Ramakrishna Engineering College"
            style={{ display: 'inline-flex', textDecoration: 'none', margin: '0 auto 1.5rem', justifyContent: 'center' }}
          >
            <SrecLogo lightText={true} className="justify-center" style={{ justifyContent: 'center' }} />
          </a>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
            {info.footer_copyright}
          </p>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
            {info.footer_sponsor}
          </p>
        </div>
      </footer>

      {/* Scroll to top button */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            style={{
              position: 'fixed',
              bottom: '2rem',
              right: '2rem',
              background: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '50%',
              width: '45px',
              height: '45px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(59, 130, 246, 0.5)',
              zIndex: 95
            }}
          >
            <ArrowUp size={20} />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Call For Papers Scope Modal */}
      <AnimatePresence>
        {selectedDept && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.6)',
              backdropFilter: 'blur(4px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 9999,
              padding: '1.5rem'
            }}
            onClick={() => setSelectedDept(null)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '1rem',
                padding: '2rem',
                maxWidth: '600px',
                width: '100%',
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                position: 'relative'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                onClick={() => setSelectedDept(null)}
                style={{
                  position: 'absolute',
                  top: '1rem',
                  right: '1rem',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#64748b'
                }}
              >
                <X size={24} />
              </button>

              {/* Badge */}
              <span style={{ fontSize: '0.8rem', color: '#f58220', fontWeight: 800, textTransform: 'uppercase', display: 'block', marginBottom: '0.5rem' }}>
                {info.cfp_badge}
              </span>

              {/* Title */}
              <h3 style={{ fontSize: '1.4rem', color: '#091d36', fontWeight: 700, marginBottom: '1.25rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.75rem' }}>
                {selectedDept.name}
              </h3>

              {/* Description */}
              <p style={{ fontSize: '0.95rem', color: '#475569', lineHeight: '1.7', marginBottom: '2rem', whiteSpace: 'pre-line' }}>
                {selectedDept.description}
              </p>

              {/* PDF Link & Action Buttons */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                <a
                  href="https://www.ieee.org/content/dam/ieee-org/ieee/web/org/pubs/format-guidelines-for-conference-papers.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-secondary"
                  style={{ fontSize: '0.9rem', gap: '0.5rem', display: 'flex', alignItems: 'center' }}
                >
                  <Download size={16} />
                  Open Paper Format (PDF)
                </a>
                <button
                  onClick={() => setSelectedDept(null)}
                  className="btn btn-primary"
                  style={{ fontSize: '0.9rem' }}
                >
                  Close Window
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Registration Calculator & Payment Modal */}
      <AnimatePresence>
        {showCalcModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.6)',
              backdropFilter: 'blur(4px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 9999,
              padding: '1.5rem'
            }}
            onClick={() => setShowCalcModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '1rem',
                padding: '2rem',
                maxWidth: '900px',
                width: '100%',
                maxHeight: '90vh',
                overflowY: 'auto',
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                position: 'relative'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                onClick={() => setShowCalcModal(false)}
                style={{
                  position: 'absolute',
                  top: '1rem',
                  right: '1rem',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#64748b'
                }}
              >
                <X size={24} />
              </button>

              {/* Title */}
              <div style={{ textAlign: 'center', borderBottom: '1px solid rgba(0,0,0,0.06)', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--gold)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Registration Portal</span>
                <h3 style={{ fontSize: '1.75rem', color: '#091d36', marginTop: '0.25rem', fontWeight: 700 }}>Payment Instructions & Fee Calculator</h3>
              </div>

              {/* Grid content inside modal */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                
                {/* 1. Wire Transfer Instructions */}
                <div style={{ background: 'rgba(59, 130, 246, 0.03)', border: '1px solid rgba(59, 130, 246, 0.12)', borderRadius: '0.75rem', padding: '1.25rem' }}>
                  <h4 style={{ fontSize: '1.15rem', color: '#091d36', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700 }}>
                    <DollarSign size={18} className="text-blue-500" />
                    {info.reg_bank_title}
                  </h4>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1rem' }}>
                    {info.reg_bank_desc}
                  </p>
                  
                  <div className="grid-2-col" style={{ gap: '1.5rem', alignItems: 'start' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                      <tbody>
                        {[
                          { label: info.reg_bank_label_acc_name, value: info.bank_account_name },
                          { label: info.reg_bank_label_bank_name, value: info.bank_name },
                          { label: info.reg_bank_label_acc_num, value: info.bank_account_number },
                          { label: info.reg_bank_label_ifsc, value: info.bank_ifsc_code },
                          { label: info.reg_bank_label_branch, value: info.bank_branch_location }
                        ].map((bank, bidx) => (
                          <tr key={bidx} style={{ borderBottom: '1px solid rgba(0,0,0,0.04)' }}>
                            <td style={{ padding: '0.5rem 0', fontWeight: 600, color: '#0f172a', textAlign: 'left' }}>{bank.label}</td>
                            <td style={{ padding: '0.5rem 0', color: 'var(--text-secondary)', textAlign: 'right' }}>{bank.value}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>

                    <div style={{ background: 'rgba(245, 158, 11, 0.06)', border: '1px solid rgba(245, 158, 11, 0.15)', borderRadius: '0.5rem', padding: '1rem', height: '100%' }}>
                      <span style={{ fontSize: '0.75rem', color: '#f59e0b', fontWeight: 800, textTransform: 'uppercase', display: 'block', marginBottom: '0.25rem' }}>Important Payment Note</span>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.4, margin: 0 }}>
                        {info.bank_important_note}
                      </p>
                    </div>
                  </div>
                </div>

                {/* 2. Calculator & Form Grid */}
                <div className="grid-2-col" style={{ gap: '2rem', alignItems: 'start' }}>
                  
                  {/* Left Column: Selections */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    <h4 style={{ fontSize: '1.15rem', color: '#091d36', borderBottom: '1px solid rgba(0,0,0,0.05)', paddingBottom: '0.5rem', fontWeight: 700 }}>1. Calculate Fee</h4>
                    
                    {/* Indian vs International */}
                    <div>
                      <label style={{ fontSize: '0.8rem', color: '#334155', fontWeight: 700, display: 'block', marginBottom: '0.35rem' }}>Are you Indian or International?*</label>
                      <div style={{ display: 'flex', gap: '0.75rem' }}>
                        <button 
                          type="button" 
                          onClick={() => { setIsIndian(true); setRegOption('conference'); }} 
                          className={`btn ${isIndian ? 'btn-primary' : 'btn-secondary'}`}
                          style={{ flex: 1, borderRadius: '0.375rem', fontSize: '0.85rem', padding: '0.5rem 1rem' }}
                        >
                          Indian
                        </button>
                        <button 
                          type="button" 
                          onClick={() => { setIsIndian(false); if (regOption === 'listener') setRegOption('conference'); }} 
                          className={`btn ${!isIndian ? 'btn-primary' : 'btn-secondary'}`}
                          style={{ flex: 1, borderRadius: '0.375rem', fontSize: '0.85rem', padding: '0.5rem 1rem' }}
                        >
                          International
                        </button>
                      </div>
                    </div>

                    {/* Student vs Professional */}
                    <div>
                      <label style={{ fontSize: '0.8rem', color: '#334155', fontWeight: 700, display: 'block', marginBottom: '0.35rem' }}>Are you a student or a professional?*</label>
                      <div style={{ display: 'flex', gap: '0.75rem' }}>
                        <button 
                          type="button" 
                          onClick={() => setIsStudent(true)} 
                          className={`btn ${isStudent ? 'btn-primary' : 'btn-secondary'}`}
                          style={{ flex: 1, borderRadius: '0.375rem', fontSize: '0.85rem', padding: '0.5rem 1rem' }}
                        >
                          Student / Scholar
                        </button>
                        <button 
                          type="button" 
                          onClick={() => setIsStudent(false)} 
                          className={`btn ${!isStudent ? 'btn-primary' : 'btn-secondary'}`}
                          style={{ flex: 1, borderRadius: '0.375rem', fontSize: '0.85rem', padding: '0.5rem 1rem' }}
                        >
                          Professional
                        </button>
                      </div>
                    </div>

                    {/* IEEE Member */}
                    <div>
                      <label style={{ fontSize: '0.8rem', color: '#334155', fontWeight: 700, display: 'block', marginBottom: '0.35rem' }}>Are you an IEEE member?*</label>
                      <div style={{ display: 'flex', gap: '0.75rem' }}>
                        <button 
                          type="button" 
                          onClick={() => setIsIeeeMember(true)} 
                          className={`btn ${isIeeeMember ? 'btn-primary' : 'btn-secondary'}`}
                          style={{ flex: 1, borderRadius: '0.375rem', fontSize: '0.85rem', padding: '0.5rem 1rem' }}
                        >
                          Yes (IEEE Member)
                        </button>
                        <button 
                          type="button" 
                          onClick={() => setIsIeeeMember(false)} 
                          className={`btn ${!isIeeeMember ? 'btn-primary' : 'btn-secondary'}`}
                          style={{ flex: 1, borderRadius: '0.375rem', fontSize: '0.85rem', padding: '0.5rem 1rem' }}
                        >
                          No (Non-IEEE Member)
                        </button>
                      </div>
                    </div>

                    {/* Registration Option */}
                    <div>
                      <label htmlFor="modal-reg-option" style={{ fontSize: '0.8rem', color: '#334155', fontWeight: 700, display: 'block', marginBottom: '0.35rem' }}>Select Registration Option*</label>
                      <select 
                        id="modal-reg-option"
                        value={regOption} 
                        onChange={(e) => setRegOption(e.target.value as 'conference' | 'tutorial' | 'both' | 'listener')}
                        className="form-input"
                        style={{ background: '#ffffff', color: '#0f172a', padding: '0.5rem 0.75rem', fontSize: '0.85rem' }}
                      >
                        <option value="conference">Conference Only</option>
                        <option value="tutorial">Tutorial Only</option>
                        <option value="both">Conference + Tutorial</option>
                        {isIndian && <option value="listener">Indian Non-Author Attendee (Listener)</option>}
                      </select>
                    </div>

                    {/* Number of Pages */}
                    {regOption !== 'listener' && (
                      <div>
                        <label htmlFor="modal-page-count" style={{ fontSize: '0.8rem', color: '#334155', fontWeight: 700, display: 'block', marginBottom: '0.35rem' }}>Number of Pages (Limit 1-12. Base covers 6 pages)*</label>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <input 
                            id="modal-page-count"
                            type="number" 
                            min="1" 
                            max="12" 
                            value={pageCount} 
                            onChange={(e) => setPageCount(Math.max(1, Math.min(12, Number(e.target.value))))}
                            className="form-input"
                            style={{ maxWidth: '80px', padding: '0.5rem', fontSize: '0.85rem' }}
                          />
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                            {pageCount > 6 ? `+${pageCount - 6} Extra Page(s)` : 'Standard length'}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Modifiers */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.25rem' }}>
                      <label style={{ fontSize: '0.8rem', color: '#334155', fontWeight: 700 }}>Additional Settings</label>
                      
                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.8rem', color: '#1e293b' }}>
                        <input 
                          type="checkbox" 
                          checked={isLate} 
                          onChange={(e) => setIsLate(e.target.checked)}
                          style={{ width: '14px', height: '14px' }}
                        />
                        <span>Late Penalty (From: Nov 1, 2026)</span>
                      </label>

                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.8rem', color: '#1e293b' }}>
                        <input 
                          type="checkbox" 
                          checked={workshopAddon} 
                          onChange={(e) => setWorkshopAddon(e.target.checked)}
                          style={{ width: '14px', height: '14px' }}
                        />
                        <span>Pre-conference workshop addon (+{isIndian ? '₹500' : '$10'})</span>
                      </label>

                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.8rem', color: '#1e293b' }}>
                        <input 
                          type="checkbox" 
                          checked={virtualMode} 
                          onChange={(e) => setVirtualMode(e.target.checked)}
                          style={{ width: '14px', height: '14px' }}
                        />
                        <span>Virtual Mode Presentation addon (+{isIndian ? '₹1000' : '$25'})</span>
                      </label>
                    </div>
                  </div>

                  {/* Right Column: Billing & Form */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    {/* Billing Summary Box */}
                    <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '0.75rem', padding: '1.25rem' }}>
                      <h4 style={{ fontSize: '1rem', color: '#091d36', marginBottom: '0.75rem', borderBottom: '1px solid #cbd5e1', paddingBottom: '0.35rem', fontWeight: 700 }}>Fee Breakdown</h4>
                      
                      {(() => {
                        const bill = calculateTotalFees();
                        return (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.8rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                              <span>Base Fee:</span>
                              <span style={{ fontWeight: 600, color: '#0f172a' }}>{bill.currencySymbol}{bill.baseFee}</span>
                            </div>
                            
                            {bill.penalty > 0 && (
                              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#dc2626' }}>
                                <span>Late Penalty:</span>
                                <span style={{ fontWeight: 600 }}>+{bill.currencySymbol}{bill.penalty}</span>
                              </div>
                            )}

                            {bill.extraPageFee > 0 && (
                              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                                <span>Extra Pages ({pageCount - 6}):</span>
                                <span style={{ fontWeight: 600, color: '#0f172a' }}>+{bill.currencySymbol}{bill.extraPageFee}</span>
                              </div>
                            )}

                            {bill.workshopFee > 0 && (
                              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                                <span>Workshop:</span>
                                <span style={{ fontWeight: 600, color: '#0f172a' }}>+{bill.currencySymbol}{bill.workshopFee}</span>
                              </div>
                            )}

                            {bill.virtualFee > 0 && (
                              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                                <span>Virtual Mode:</span>
                                <span style={{ fontWeight: 600, color: '#0f172a' }}>+{bill.currencySymbol}{bill.virtualFee}</span>
                              </div>
                            )}

                            <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '2px solid #cbd5e1', paddingTop: '0.5rem', fontSize: '1.05rem', fontWeight: 800, color: '#0f52ba' }}>
                              <span>Total Due:</span>
                              <span>{bill.currencySymbol}{bill.total} ({bill.currency})</span>
                            </div>
                          </div>
                        );
                      })()}
                    </div>

                    {/* Submission Form */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      <h4 style={{ fontSize: '1rem', color: '#091d36', borderBottom: '1px solid rgba(0,0,0,0.05)', paddingBottom: '0.35rem', fontWeight: 700 }}>2. Submit Proof of Payment</h4>
                      
                      {regSuccess ? (
                        <div style={{ 
                          background: 'rgba(34, 197, 94, 0.08)', 
                          border: '1px solid rgba(34, 197, 94, 0.25)', 
                          borderRadius: '0.5rem', 
                          padding: '1rem',
                          textAlign: 'center',
                          color: '#22c55e',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '0.35rem',
                          alignItems: 'center'
                        }}>
                          <CheckCircle size={28} style={{ color: '#22c55e' }} />
                          <span style={{ fontSize: '0.95rem', fontWeight: 700 }}>Submitted Successfully!</span>
                          <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: 0 }}>
                            SREC finance coordinators will verify receipt reference AECTSD and send a confirmation email.
                          </p>
                          <button 
                            type="button" 
                            onClick={() => {
                              setRegSuccess(false);
                              setRegPaperId('');
                              setRegPaperTitle('');
                              setRegAuthorName('');
                              setRegEmail('');
                              setRegPhone('');
                              setRegScreenshot(null);
                              setRegRegisterForTour(false);
                              setRegPreferredTourPlace('');
                              setShowRegValidation(false);
                            }} 
                            className="btn btn-secondary"
                            style={{ marginTop: '0.5rem', padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}
                          >
                            Submit Another
                          </button>
                        </div>
                      ) : (
                        <form onSubmit={handleRegistrationSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                          <div className="grid-2-col" style={{ gap: '0.75rem' }}>
                            <div>
                              <label htmlFor="reg_paper_id" style={{ fontSize: '0.75rem', color: '#334155', fontWeight: 600, display: 'block', marginBottom: '0.25rem' }}>Paper ID*</label>
                              <input 
                                id="reg_paper_id"
                                type="text" 
                                required 
                                className={`form-input ${showRegValidation && !regPaperId ? 'is-invalid' : ''}`}
                                style={{ padding: '0.4rem 0.6rem', fontSize: '0.8rem' }}
                                placeholder="e.g. AECTSD-104"
                                value={regPaperId}
                                onChange={(e) => setRegPaperId(e.target.value)}
                                title="Paper ID"
                              />
                            </div>
                            <div>
                              <label htmlFor="reg_author_name" style={{ fontSize: '0.75rem', color: '#334155', fontWeight: 600, display: 'block', marginBottom: '0.25rem' }}>Author Name*</label>
                              <input 
                                id="reg_author_name"
                                type="text" 
                                required 
                                className={`form-input ${showRegValidation && !regAuthorName ? 'is-invalid' : ''}`}
                                style={{ padding: '0.4rem 0.6rem', fontSize: '0.8rem' }}
                                placeholder="Enter full name"
                                value={regAuthorName}
                                onChange={(e) => setRegAuthorName(e.target.value)}
                                title="Author Name"
                              />
                            </div>
                          </div>

                          <div>
                            <label htmlFor="reg_paper_title" style={{ fontSize: '0.75rem', color: '#334155', fontWeight: 600, display: 'block', marginBottom: '0.25rem' }}>Paper Title*</label>
                            <input 
                              id="reg_paper_title"
                              type="text" 
                              required 
                              className={`form-input ${showRegValidation && !regPaperTitle ? 'is-invalid' : ''}`}
                              style={{ padding: '0.4rem 0.6rem', fontSize: '0.8rem' }}
                              placeholder="e.g. A Secure VLSI Implementation for IoT Nodes"
                              value={regPaperTitle}
                              onChange={(e) => setRegPaperTitle(e.target.value)}
                              title="Paper Title"
                            />
                          </div>

                          <div className="grid-2-col" style={{ gap: '0.75rem' }}>
                            <div>
                              <label htmlFor="reg_email" style={{ fontSize: '0.75rem', color: '#334155', fontWeight: 600, display: 'block', marginBottom: '0.25rem' }}>Email Address*</label>
                              <input 
                                id="reg_email"
                                type="email" 
                                required 
                                className={`form-input ${showRegValidation && !regEmail ? 'is-invalid' : ''}`}
                                style={{ padding: '0.4rem 0.6rem', fontSize: '0.8rem' }}
                                placeholder="author@example.com"
                                value={regEmail}
                                onChange={(e) => setRegEmail(e.target.value)}
                                title="Email Address"
                              />
                            </div>
                            <div>
                              <label htmlFor="reg_phone" style={{ fontSize: '0.75rem', color: '#334155', fontWeight: 600, display: 'block', marginBottom: '0.25rem' }}>Phone Number*</label>
                              <input 
                                id="reg_phone"
                                type="tel" 
                                required 
                                className={`form-input ${showRegValidation && !regPhone ? 'is-invalid' : ''}`}
                                style={{ padding: '0.4rem 0.6rem', fontSize: '0.8rem' }}
                                placeholder="+91-9876543210"
                                value={regPhone}
                                onChange={(e) => setRegPhone(e.target.value)}
                                title="Phone Number"
                              />
                            </div>
                          </div>


                          {/* Screenshot */}
                          <div>
                            <label style={{ fontSize: '0.75rem', color: '#334155', fontWeight: 600, display: 'block', marginBottom: '0.25rem' }}>Upload Payment Screenshot (Max 10MB)*</label>
                            <div 
                              style={{
                                border: showRegValidation && !regScreenshot ? '2px dashed #dc2626' : '2px dashed #cbd5e1',
                                borderRadius: '0.375rem',
                                padding: '0.75rem',
                                textAlign: 'center',
                                cursor: 'pointer',
                                background: showRegValidation && !regScreenshot ? '#fef2f2' : '#f8fafc',
                                transition: 'all 0.2s ease',
                              }}
                              onDragOver={(e) => e.preventDefault()}
                              onDrop={(e) => {
                                e.preventDefault();
                                if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                                  setRegScreenshot(e.dataTransfer.files[0]);
                                }
                              }}
                              onClick={() => {
                                const input = document.createElement('input');
                                input.type = 'file';
                                input.accept = 'image/*,application/pdf';
                                input.onchange = (e) => {
                                  const files = (e.target as HTMLInputElement).files;
                                  if (files && files[0]) {
                                    setRegScreenshot(files[0]);
                                  }
                                };
                                input.click();
                              }}
                            >
                              <Download size={18} style={{ color: '#64748b', marginBottom: '0.25rem', marginInline: 'auto' }} />
                              {regScreenshot ? (
                                <div>
                                  <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#0f52ba', display: 'block' }}>{regScreenshot.name}</span>
                                </div>
                              ) : (
                                <div>
                                  <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block' }}>Click to upload payment screenshot receipt</span>
                                </div>
                              )}
                            </div>
                          </div>

                          {regError && (
                            <div style={{ color: '#dc2626', fontSize: '0.75rem', fontWeight: 600 }}>
                              {regError}
                            </div>
                          )}

                          <button 
                            type="submit" 
                            className="btn btn-primary" 
                            disabled={regSubmitting}
                            onClick={() => setShowRegValidation(true)}
                            style={{ marginTop: '0.35rem', width: '100%', padding: '0.6rem', background: '#0f52ba', fontSize: '0.85rem' }}
                          >
                            {regSubmitting ? 'Submitting...' : 'Submit Registration & Payment'}
                          </button>
                        </form>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Admin Portal Overlay */}
      <AnimatePresence>
        {showAdminPortal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="admin-overlay"
          >
            <motion.div
              initial={{ scale: 0.95, y: 30 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 30 }}
              className="admin-panel"
            >
              {/* If NOT logged in, show Login/Registration Form */}
              {adminUser === null ? (
                <div style={{ padding: '3rem 2rem', maxWidth: '450px', width: '100%', margin: 'auto', textAlign: 'center' }}>
                  <div style={{ display: 'inline-flex', background: 'rgba(59, 130, 246, 0.08)', padding: '1rem', borderRadius: '50%', marginBottom: '1.5rem', color: '#0f52ba' }}>
                    <Shield size={42} />
                  </div>
                  
                  <h3 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#091d36', marginBottom: '0.5rem' }}>
                    {adminRegMode ? 'Register Admin Account' : 'Admin Portal Login'}
                  </h3>
                  <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '2rem' }}>
                    {adminRegMode ? 'Create admin credentials using the secure master key.' : 'Access database dashboards to edit page contents.'}
                  </p>

                  <form onSubmit={handleAdminAuth} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', textAlign: 'left' }}>
                    <div>
                      <label htmlFor="admin_username" style={{ fontSize: '0.8rem', color: '#334155', fontWeight: 700, display: 'block', marginBottom: '0.35rem' }}>Username</label>
                      <input 
                        id="admin_username"
                        type="text" 
                        required 
                        className="form-input" 
                        value={adminUsername}
                        onChange={(e) => setAdminUsername(e.target.value)}
                        placeholder="Enter admin username"
                        title="Username"
                      />
                    </div>

                    <div>
                      <label htmlFor="admin_password" style={{ fontSize: '0.8rem', color: '#334155', fontWeight: 700, display: 'block', marginBottom: '0.35rem' }}>Password</label>
                      <input 
                        id="admin_password"
                        type="password" 
                        required 
                        className="form-input" 
                        value={adminPassword}
                        onChange={(e) => setAdminPassword(e.target.value)}
                        placeholder="Enter password"
                        title="Password"
                      />
                    </div>

                    {adminRegMode && (
                      <>
                        <div>
                          <label htmlFor="admin_confirm_password" style={{ fontSize: '0.8rem', color: '#334155', fontWeight: 700, display: 'block', marginBottom: '0.35rem' }}>Confirm Password</label>
                          <input 
                            id="admin_confirm_password"
                            type="password" 
                            required 
                            className="form-input" 
                            value={adminConfirmPassword}
                            onChange={(e) => setAdminConfirmPassword(e.target.value)}
                            placeholder="Re-enter password"
                            title="Confirm Password"
                          />
                        </div>
                        <div>
                          <label htmlFor="admin_master_key" style={{ fontSize: '0.8rem', color: '#334155', fontWeight: 700, display: 'block', marginBottom: '0.35rem' }}>Master Key</label>
                          <input 
                            id="admin_master_key"
                            type="password" 
                            required 
                            className="form-input" 
                            value={adminMasterKey}
                            onChange={(e) => setAdminMasterKey(e.target.value)}
                            placeholder="Enter master key to register"
                            title="Master Key"
                          />
                        </div>
                      </>
                    )}

                    {adminError && (
                      <div style={{ color: '#dc2626', fontSize: '0.8rem', fontWeight: 600, padding: '0.5rem', background: 'rgba(220, 38, 38, 0.05)', borderRadius: '0.375rem', border: '1px solid rgba(220, 38, 38, 0.15)' }}>
                        {adminError}
                      </div>
                    )}

                    <button type="submit" disabled={adminLoading} className="btn btn-primary" style={{ width: '100%', marginTop: '0.5rem' }}>
                      {adminLoading ? 'Processing...' : adminRegMode ? 'Register & Create Account' : 'Secure Login'}
                    </button>

                    <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                      {adminRegMode ? (
                        <button type="button" onClick={() => { setAdminRegMode(false); setAdminError(null); }} style={{ background: 'none', border: 'none', color: '#0f52ba', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}>
                          Already have an account? Log in
                        </button>
                      ) : (
                        <button type="button" onClick={() => { setAdminRegMode(true); setAdminError(null); }} style={{ background: 'none', border: 'none', color: '#0f52ba', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}>
                          Need an account? Register with Master Key
                        </button>
                      )}
                    </div>
                  </form>

                  <button 
                    type="button" 
                    onClick={() => setShowAdminPortal(false)}
                    className="btn btn-secondary" 
                    style={{ width: '100%', marginTop: '1.5rem' }}
                  >
                    Close Window & Return
                  </button>
                </div>
              ) : (
                /* Admin Dashboard View */
                <>
                  {/* Dashboard Header */}
                  <div className="admin-header">
                    <div className="admin-header-title">
                      <div style={{ background: 'rgba(59, 130, 246, 0.08)', padding: '0.5rem', borderRadius: '0.5rem', color: '#0f52ba' }}>
                        <Database size={24} />
                      </div>
                      <div>
                        <h3>AECTSD 2027 Admin Console</h3>
                        <span style={{ fontSize: '0.78rem', color: '#64748b' }}>Logged in as: <strong>{adminUser}</strong></span>
                      </div>
                    </div>
                    
                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                      <button 
                        onClick={() => fetchDbData().then(() => alert('Database content refreshed!'))}
                        className="btn btn-secondary"
                        style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', padding: '0.5rem 1rem', fontSize: '0.85rem' }}
                      >
                        <RefreshCw size={14} />
                        Refresh
                      </button>
                      
                      <button 
                        onClick={handleAdminLogout}
                        className="btn btn-secondary"
                        style={{ color: '#dc2626', border: '1px solid rgba(220, 38, 38, 0.2)', display: 'flex', alignItems: 'center', gap: '0.25rem', padding: '0.5rem 1rem', fontSize: '0.85rem' }}
                      >
                        <LogOut size={14} />
                        Logout
                      </button>

                      <button 
                        onClick={() => setShowAdminPortal(false)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                      >
                        <X size={28} />
                      </button>
                    </div>
                  </div>

                  {/* Tabs Menu */}
                  <div className="admin-tabs">
                    {[
                      { id: 'overview', label: 'Registrations Log' },
                      { id: 'info', label: 'General Settings' },
                      { id: 'speakers', label: 'Keynote Speakers' },
                      { id: 'departments', label: 'Academic Tracks' },
                      { id: 'committee', label: 'Committee List' },
                      { id: 'dates', label: 'Timeline Dates' },
                      { id: 'workshops', label: 'Tutorial Workshops' }
                    ].map(t => (
                      <button
                        key={t.id}
                        onClick={() => setAdminTab(t.id)}
                        className={`admin-tab-btn ${adminTab === t.id ? 'active' : ''}`}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>

                  {/* Dashboard Content */}
                  <div className="admin-body">
                    
                    {/* TAB: Registrations */}
                    {adminTab === 'overview' && (
                      <div>
                        <div className="admin-control-bar">
                          <div>
                            <h4 style={{ fontSize: '1.25rem', margin: 0, fontWeight: 700 }}>Submitted Registrations ({submittedRegistrations.length})</h4>
                            <p style={{ fontSize: '0.8rem', color: '#64748b', margin: 0 }}>View proof of payments and reference files sent by authors.</p>
                          </div>
                          {submittedRegistrations.length > 0 && (
                            <button 
                              onClick={handleClearAllRegistrations}
                              className="btn btn-secondary"
                              style={{ background: '#fef2f2', border: '1px solid #fca5a5', color: '#b91c1c' }}
                            >
                              <Trash2 size={16} />
                              Clear All Logs
                            </button>
                          )}
                        </div>

                        {submittedRegistrations.length === 0 ? (
                          <div style={{ textAlign: 'center', padding: '4rem', background: '#f8fafc', borderRadius: '1rem', border: '1px dashed #cbd5e1' }}>
                            <FileText size={48} style={{ color: '#94a3b8', margin: '0 auto 1rem' }} />
                            <p style={{ margin: 0, color: '#64748b', fontWeight: 600 }}>No registrations found in the log.</p>
                          </div>
                        ) : (
                          <div className="admin-table-container">
                            <div className="admin-table-wrapper">
                              <table className="admin-table">
                                <thead>
                                  <tr>
                                    <th>Paper ID</th>
                                    <th>Author Name</th>
                                    <th>Email</th>
                                    <th>Phone</th>
                                    <th>Paper Title</th>
                                    <th>Tour Choice</th>
                                    <th>Receipt file</th>
                                    <th>Date Submitted</th>
                                    <th>Action</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {submittedRegistrations.map((reg, idx) => (
                                    <tr key={reg.id || idx}>
                                      <td style={{ fontWeight: 700, color: '#0f52ba' }}>{reg.paper_id}</td>
                                      <td style={{ fontWeight: 600 }}>{reg.author_name}</td>
                                      <td><a href={`mailto:${reg.email}`} style={{ color: '#2563eb' }}>{reg.email}</a></td>
                                      <td>{reg.phone}</td>
                                      <td style={{ maxWidth: '250px' }}>{reg.paper_title}</td>
                                      <td>
                                        {reg.register_for_tour ? (
                                          <span style={{ color: '#16a34a', fontWeight: 600, display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                            <span>Yes</span>
                                            {reg.preferred_tour_place && (
                                              <span style={{ fontSize: '0.75rem', color: '#4b5563', fontWeight: 'normal' }} title={reg.preferred_tour_place}>
                                                ({reg.preferred_tour_place.length > 20 ? reg.preferred_tour_place.substring(0, 17) + '...' : reg.preferred_tour_place})
                                              </span>
                                            )}
                                          </span>
                                        ) : (
                                          <span style={{ color: '#dc2626' }}>No</span>
                                        )}
                                      </td>
                                      <td>
                                        <span className="screenshot-badge" title={`Size: ${Math.round(Number(reg.screenshot_size || 0) / 1024)} KB`}>
                                          <Eye size={12} />
                                          {reg.screenshot_name || 'receipt.png'}
                                        </span>
                                      </td>
                                      <td>{new Date(reg.created_at).toLocaleString()}</td>
                                      <td>
                                        <button 
                                          onClick={() => handleDeleteRegistration(reg.id)}
                                          style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '0.25rem' }}
                                        >
                                          <Trash2 size={16} />
                                        </button>
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* TAB: General Info settings */}
                    {adminTab === 'info' && (
                      <div>
                        <h4 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', fontWeight: 700 }}>General Webpage Configurations</h4>
                        
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                          <div className="admin-form-row">
                            <div className="admin-form-group">
                              <label htmlFor="info_hero_title">Hero Conference Title</label>
                              <input 
                                id="info_hero_title"
                                type="text" 
                                className="form-input" 
                                value={info.hero_title || ''} 
                                onChange={(e) => handleSaveInfoSetting('hero_title', e.target.value)} 
                                placeholder="Enter Hero Conference Title"
                                title="Hero Conference Title"
                              />
                            </div>
                            <div className="admin-form-group">
                              <label htmlFor="info_hero_subtitle">Hero Conference Subtitle</label>
                              <input 
                                id="info_hero_subtitle"
                                type="text" 
                                className="form-input" 
                                value={info.hero_subtitle || ''} 
                                onChange={(e) => handleSaveInfoSetting('hero_subtitle', e.target.value)} 
                                placeholder="Enter Hero Conference Subtitle"
                                title="Hero Conference Subtitle"
                              />
                            </div>
                          </div>

                          <div className="admin-form-row">
                            <div className="admin-form-group">
                              <label htmlFor="info_event_date">Event Date Display</label>
                              <input 
                                id="info_event_date"
                                type="text" 
                                className="form-input" 
                                value={info.event_date_display || ''} 
                                onChange={(e) => handleSaveInfoSetting('event_date_display', e.target.value)} 
                                placeholder="Enter Event Date"
                                title="Event Date Display"
                              />
                            </div>
                            <div className="admin-form-group">
                              <label htmlFor="info_event_location">Event Location Display</label>
                              <input 
                                id="info_event_location"
                                type="text" 
                                className="form-input" 
                                value={info.event_location_display || ''} 
                                onChange={(e) => handleSaveInfoSetting('event_location_display', e.target.value)} 
                                placeholder="Enter Event Location"
                                title="Event Location Display"
                              />
                            </div>
                          </div>

                          <div className="admin-form-row">
                            <div className="admin-form-group">
                              <label htmlFor="info_countdown_target">Countdown Target Time (ISO 8601 Format)</label>
                              <input 
                                id="info_countdown_target"
                                type="text" 
                                className="form-input" 
                                placeholder="YYYY-MM-DDTHH:MM:SS"
                                value={info.countdown_target || ''} 
                                onChange={(e) => handleSaveInfoSetting('countdown_target', e.target.value)} 
                                title="Countdown Target Time"
                              />
                              <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Currently: {new Date(info.countdown_target).toLocaleString()}</span>
                            </div>
                            <div className="admin-form-group">
                              <label htmlFor="info_cmt_link">CMT Portal Link</label>
                              <input 
                                id="info_cmt_link"
                                type="text" 
                                className="form-input" 
                                value={info.cmt_link || ''} 
                                onChange={(e) => handleSaveInfoSetting('cmt_link', e.target.value)} 
                                placeholder="Enter CMT Portal Link"
                                title="CMT Portal Link"
                              />
                            </div>
                          </div>

                          <div className="admin-form-row">
                            <div className="admin-form-group">
                              <label htmlFor="info_srec_url">SREC Website URL</label>
                              <input 
                                id="info_srec_url"
                                type="text" 
                                className="form-input" 
                                value={info.srec_url || ''} 
                                onChange={(e) => handleSaveInfoSetting('srec_url', e.target.value)} 
                                placeholder="Enter SREC Website URL"
                                title="SREC Website URL"
                              />
                            </div>
                            <div className="admin-form-group">
                              <label htmlFor="info_ieee_sb_url">IEEE SB Website URL</label>
                              <input 
                                id="info_ieee_sb_url"
                                type="text" 
                                className="form-input" 
                                value={info.ieee_sb_url || ''} 
                                onChange={(e) => handleSaveInfoSetting('ieee_sb_url', e.target.value)} 
                                placeholder="Enter IEEE SB Website URL"
                                title="IEEE SB Website URL"
                              />
                            </div>
                          </div>

                          <div className="admin-form-row">
                            <div className="admin-form-group">
                              <label htmlFor="info_snr_url">SNR Sons Website URL</label>
                              <input 
                                id="info_snr_url"
                                type="text" 
                                className="form-input" 
                                value={info.snr_url || ''} 
                                onChange={(e) => handleSaveInfoSetting('snr_url', e.target.value)} 
                                placeholder="Enter SNR Sons Website URL"
                                title="SNR Sons Website URL"
                              />
                            </div>
                            <div className="admin-form-group">
                              <label htmlFor="info_snr_trust_url">SNR Trust Website URL</label>
                              <input 
                                id="info_snr_trust_url"
                                type="text" 
                                className="form-input" 
                                value={info.snr_trust_url || ''} 
                                onChange={(e) => handleSaveInfoSetting('snr_trust_url', e.target.value)} 
                                placeholder="Enter SNR Trust Website URL"
                                title="SNR Trust Website URL"
                              />
                            </div>
                          </div>

                          <div className="admin-form-group">
                            <label htmlFor="info_hero_bg_url">Hero Background Image URL</label>
                            <input 
                              id="info_hero_bg_url"
                              type="text" 
                              className="form-input" 
                              value={info.hero_bg_url || ''} 
                              onChange={(e) => handleSaveInfoSetting('hero_bg_url', e.target.value)} 
                              placeholder="Enter Hero Background Image URL"
                              title="Hero Background Image URL"
                            />
                          </div>

                          <div className="admin-form-row">
                            <div className="admin-form-group">
                              <label htmlFor="info_bank_acc_name">Bank Account Name</label>
                              <input 
                                id="info_bank_acc_name"
                                type="text" 
                                className="form-input" 
                                value={info.bank_account_name || ''} 
                                onChange={(e) => handleSaveInfoSetting('bank_account_name', e.target.value)} 
                                placeholder="Enter Bank Account Name"
                                title="Bank Account Name"
                              />
                            </div>
                            <div className="admin-form-group">
                              <label htmlFor="info_bank_name">Bank Name</label>
                              <input 
                                id="info_bank_name"
                                type="text" 
                                className="form-input" 
                                value={info.bank_name || ''} 
                                onChange={(e) => handleSaveInfoSetting('bank_name', e.target.value)} 
                                placeholder="Enter Bank Name"
                                title="Bank Name"
                              />
                            </div>
                          </div>

                          <div className="admin-form-row">
                            <div className="admin-form-group">
                              <label htmlFor="info_bank_acc_number">Account Number</label>
                              <input 
                                id="info_bank_acc_number"
                                type="text" 
                                className="form-input" 
                                value={info.bank_account_number || ''} 
                                onChange={(e) => handleSaveInfoSetting('bank_account_number', e.target.value)} 
                                placeholder="Enter Account Number"
                                title="Account Number"
                              />
                            </div>
                            <div className="admin-form-group">
                              <label htmlFor="info_bank_ifsc">Bank IFSC Code</label>
                              <input 
                                id="info_bank_ifsc"
                                type="text" 
                                className="form-input" 
                                value={info.bank_ifsc_code || ''} 
                                onChange={(e) => handleSaveInfoSetting('bank_ifsc_code', e.target.value)} 
                                placeholder="Enter Bank IFSC Code"
                                title="Bank IFSC Code"
                              />
                            </div>
                          </div>

                          <div className="admin-form-group">
                            <label htmlFor="info_about_trust">SNR Sons Trust Description</label>
                            <textarea 
                              id="info_about_trust"
                              rows={3} 
                              className="form-input" 
                              value={info.about_trust || ''} 
                              onChange={(e) => handleSaveInfoSetting('about_trust', e.target.value)} 
                              placeholder="Enter SNR Sons Trust Description"
                              title="SNR Sons Trust Description"
                            />
                          </div>

                          <div className="admin-form-group">
                            <label htmlFor="info_about_inst">SREC Institution Description</label>
                            <textarea 
                              id="info_about_inst"
                              rows={3} 
                              className="form-input" 
                              value={info.about_institution || ''} 
                              onChange={(e) => handleSaveInfoSetting('about_institution', e.target.value)} 
                              placeholder="Enter SREC Institution Description"
                              title="SREC Institution Description"
                            />
                          </div>

                          <div className="admin-form-group">
                            <label htmlFor="info_sec_address">Secretariat Address</label>
                            <textarea 
                              id="info_sec_address"
                              rows={3} 
                              className="form-input" 
                              value={info.secretariat_address || ''} 
                              onChange={(e) => handleSaveInfoSetting('secretariat_address', e.target.value)} 
                              placeholder="Enter Secretariat Address"
                              title="Secretariat Address"
                            />
                          </div>

                          <div className="admin-form-group">
                            <label htmlFor="info_coimbatore_desc">About Coimbatore Description</label>
                            <textarea 
                              id="info_coimbatore_desc"
                              rows={4} 
                              className="form-input" 
                              value={info.about_coimbatore_desc || ''} 
                              onChange={(e) => handleSaveInfoSetting('about_coimbatore_desc', e.target.value)} 
                              placeholder="Enter Coimbatore Description"
                              title="About Coimbatore Description"
                            />
                          </div>

                          <div className="admin-form-group">
                            <label htmlFor="info_coimbatore_tour">Coimbatore Tour Info Alert</label>
                            <textarea 
                              id="info_coimbatore_tour"
                              rows={2} 
                              className="form-input" 
                              value={info.about_coimbatore_tour_info || ''} 
                              onChange={(e) => handleSaveInfoSetting('about_coimbatore_tour_info', e.target.value)} 
                              placeholder="Enter Tour Info Notice"
                              title="Coimbatore Tour Info Alert"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* TAB: Speakers */}
                    {adminTab === 'speakers' && (
                      <div>
                        <div className="admin-control-bar">
                          <h4 style={{ fontSize: '1.25rem', margin: 0, fontWeight: 700 }}>Keynote Speakers ({speakers.length})</h4>
                          {!editingSpeaker && (
                            <button onClick={() => setEditingSpeaker({ name: '', title: '', role: '', talk: '', color: '#0f52ba' })} className="btn btn-primary">
                              <Plus size={16} /> Add Speaker
                            </button>
                          )}
                        </div>

                        {/* Add/Edit Form */}
                        {editingSpeaker && (
                          <div className="glass-card" style={{ marginBottom: '2rem', background: '#f8fafc', borderColor: '#3b82f6' }}>
                            <h5 style={{ fontSize: '1.1rem', marginBottom: '1rem', fontWeight: 700 }}>{editingSpeaker.id ? 'Edit Speaker Details' : 'Add New Keynote Speaker'}</h5>
                            <form onSubmit={handleSaveSpeaker} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                              <div className="admin-form-row">
                                <div className="admin-form-group">
                                  <label htmlFor="speaker_name">Speaker Name</label>
                                  <input 
                                    id="speaker_name"
                                    type="text" 
                                    required 
                                    className="form-input"
                                    value={editingSpeaker.name}
                                    onChange={(e) => setEditingSpeaker({ ...editingSpeaker, name: e.target.value })}
                                    placeholder="Enter Speaker Name"
                                    title="Speaker Name"
                                  />
                                </div>
                                <div className="admin-form-group">
                                  <label htmlFor="speaker_title">Speaker Title / Institution</label>
                                  <input 
                                    id="speaker_title"
                                    type="text" 
                                    required 
                                    className="form-input"
                                    value={editingSpeaker.title}
                                    onChange={(e) => setEditingSpeaker({ ...editingSpeaker, title: e.target.value })}
                                    placeholder="Enter Speaker Title / Institution"
                                    title="Speaker Title / Institution"
                                  />
                                </div>
                              </div>

                              <div className="admin-form-row">
                                <div className="admin-form-group">
                                  <label htmlFor="speaker_role">Conference Role / Bio Tag</label>
                                  <input 
                                    id="speaker_role"
                                    type="text" 
                                    required 
                                    className="form-input"
                                    value={editingSpeaker.role}
                                    onChange={(e) => setEditingSpeaker({ ...editingSpeaker, role: e.target.value })}
                                    placeholder="Enter Conference Role / Bio Tag"
                                    title="Conference Role / Bio Tag"
                                  />
                                </div>
                                <div className="admin-form-group">
                                  <label htmlFor="speaker_color">Theme Card Color (Hex)</label>
                                  <input 
                                    id="speaker_color"
                                    type="text" 
                                    required 
                                    className="form-input"
                                    value={editingSpeaker.color}
                                    onChange={(e) => setEditingSpeaker({ ...editingSpeaker, color: e.target.value })}
                                    placeholder="Enter Theme Card Color (Hex)"
                                    title="Theme Card Color (Hex)"
                                  />
                                </div>
                              </div>

                              <div className="admin-form-group">
                                <label htmlFor="speaker_image">Speaker Image URL</label>
                                <input 
                                  id="speaker_image"
                                  type="text" 
                                  className="form-input"
                                  value={editingSpeaker.image_url || ''}
                                  onChange={(e) => setEditingSpeaker({ ...editingSpeaker, image_url: e.target.value })}
                                  placeholder="Enter Speaker Image URL (or leave blank)"
                                  title="Speaker Image URL"
                                />
                              </div>

                              <div className="admin-form-group">
                                <label htmlFor="speaker_talk">Talk Title & Synopsis</label>
                                <textarea 
                                  id="speaker_talk"
                                  rows={3} 
                                  required 
                                  className="form-input"
                                  value={editingSpeaker.talk}
                                  onChange={(e) => setEditingSpeaker({ ...editingSpeaker, talk: e.target.value })}
                                  placeholder="Enter Talk Title & Synopsis"
                                  title="Talk Title & Synopsis"
                                />
                              </div>

                              <div style={{ display: 'flex', gap: '0.75rem' }}>
                                <button type="submit" className="btn btn-primary">
                                  <Save size={16} /> Save Changes
                                </button>
                                <button type="button" onClick={() => setEditingSpeaker(null)} className="btn btn-secondary">
                                  Cancel
                                </button>
                              </div>
                            </form>
                          </div>
                        )}

                        {/* Card List */}
                        <div className="admin-card-grid">
                          {speakers.map((sp, idx) => (
                            <div key={sp.id || idx} className="admin-editor-card">
                              <h5 style={{ fontSize: '1.15rem', color: '#091d36', margin: '0 0 0.25rem', fontWeight: 800 }}>{sp.name}</h5>
                              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#f58220', textTransform: 'uppercase' }}>{sp.role}</span>
                              <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '0.5rem 0' }}>{sp.title}</p>
                              <div style={{ fontSize: '0.8rem', background: '#ffffff', padding: '0.5rem', borderRadius: '0.375rem', border: '1px solid #e2e8f0', marginTop: '0.5rem' }}>
                                <strong>Talk:</strong> "{sp.talk}"
                              </div>
                              
                              <div className="admin-action-row">
                                <button onClick={() => setEditingSpeaker(sp)} className="btn btn-secondary" style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem' }}>
                                  Edit
                                </button>
                                <button onClick={() => handleDeleteSpeaker(sp.id)} className="btn btn-secondary" style={{ color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '0.35rem 0.75rem', fontSize: '0.75rem' }}>
                                  Delete
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* TAB: Academic Tracks / Departments */}
                    {adminTab === 'departments' && (
                      <div>
                        <div className="admin-control-bar">
                          <h4 style={{ fontSize: '1.25rem', margin: 0, fontWeight: 700 }}>Academic Departments / Tracks ({departments.length})</h4>
                          {!editingDept && (
                            <button onClick={() => setEditingDept({ name: '', description: '', sort_order: departments.length + 1 })} className="btn btn-primary">
                              <Plus size={16} /> Add Track
                            </button>
                          )}
                        </div>

                        {editingDept && (
                          <div className="glass-card" style={{ marginBottom: '2rem', background: '#f8fafc', borderColor: '#3b82f6' }}>
                            <h5 style={{ fontSize: '1.1rem', marginBottom: '1rem', fontWeight: 700 }}>{editingDept.id ? 'Edit Department Track' : 'Add New Department Track'}</h5>
                            <form onSubmit={handleSaveDept} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                              <div className="admin-form-row">
                                <div className="admin-form-group" style={{ flex: 3 }}>
                                  <label htmlFor="dept_name">Department / Track Name</label>
                                  <input 
                                    id="dept_name"
                                    type="text" 
                                    required 
                                    className="form-input"
                                    value={editingDept.name}
                                    onChange={(e) => setEditingDept({ ...editingDept, name: e.target.value })}
                                    placeholder="Enter Department / Track Name"
                                    title="Department / Track Name"
                                  />
                                </div>
                                <div className="admin-form-group">
                                  <label htmlFor="dept_sort_order">Sort Order Index</label>
                                  <input 
                                    id="dept_sort_order"
                                    type="number" 
                                    required 
                                    className="form-input"
                                    value={editingDept.sort_order || 1}
                                    onChange={(e) => setEditingDept({ ...editingDept, sort_order: Number(e.target.value) })}
                                    placeholder="1"
                                    title="Sort Order Index"
                                  />
                                </div>
                              </div>

                              <div className="admin-form-group">
                                <label htmlFor="dept_desc">Department Scope / Call-For-Papers Track Description</label>
                                <textarea 
                                  id="dept_desc"
                                  rows={5} 
                                  required 
                                  className="form-input"
                                  value={editingDept.description}
                                  onChange={(e) => setEditingDept({ ...editingDept, description: e.target.value })}
                                  placeholder="Enter Department Scope / Call-For-Papers Track Description"
                                  title="Department Scope / Call-For-Papers Track Description"
                                />
                              </div>

                              <div style={{ display: 'flex', gap: '0.75rem' }}>
                                <button type="submit" className="btn btn-primary">
                                  <Save size={16} /> Save Changes
                                </button>
                                <button type="button" onClick={() => setEditingDept(null)} className="btn btn-secondary">
                                  Cancel
                                </button>
                              </div>
                            </form>
                          </div>
                        )}

                        <div className="admin-card-grid">
                          {departments.map((dept, idx) => (
                            <div key={dept.id || idx} className="admin-editor-card">
                              <h5 style={{ fontSize: '1.1rem', color: '#091d36', margin: '0 0 0.5rem', fontWeight: 800 }}>{dept.name}</h5>
                              <span style={{ fontSize: '0.7rem', background: '#e2e8f0', color: '#334155', padding: '0.15rem 0.4rem', borderRadius: '0.25rem', fontWeight: 700 }}>
                                Order: {dept.sort_order}
                              </span>
                              <p style={{ fontSize: '0.82rem', color: '#64748b', marginTop: '0.75rem', lineHeight: '1.5' }}>
                                {dept.description.length > 180 ? dept.description.substring(0, 180) + '...' : dept.description}
                              </p>
                              
                              <div className="admin-action-row">
                                <button onClick={() => setEditingDept(dept)} className="btn btn-secondary" style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem' }}>
                                  Edit
                                </button>
                                <button onClick={() => handleDeleteDept(dept.id)} className="btn btn-secondary" style={{ color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '0.35rem 0.75rem', fontSize: '0.75rem' }}>
                                  Delete
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* TAB: Committee members */}
                    {adminTab === 'committee' && (
                      <div>
                        <div className="admin-control-bar">
                          <h4 style={{ fontSize: '1.25rem', margin: 0, fontWeight: 700 }}>Committee Members List ({committeeMembers.length})</h4>
                          {!editingCommittee && (
                            <button onClick={() => setEditingCommittee({ name: '', role: '', desc: '', category: 'organizing' })} className="btn btn-primary">
                              <Plus size={16} /> Add Committee Member
                            </button>
                          )}
                        </div>

                        {editingCommittee && (
                          <div className="glass-card" style={{ marginBottom: '2rem', background: '#f8fafc', borderColor: '#3b82f6' }}>
                            <h5 style={{ fontSize: '1.1rem', marginBottom: '1rem', fontWeight: 700 }}>{editingCommittee.id ? 'Edit Committee Member' : 'Add New Member'}</h5>
                            <form onSubmit={handleSaveCommittee} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                              <div className="admin-form-row">
                                <div className="admin-form-group">
                                  <label htmlFor="committee_name">Full Name</label>
                                  <input 
                                    id="committee_name"
                                    type="text" 
                                    required 
                                    className="form-input"
                                    value={editingCommittee.name}
                                    onChange={(e) => setEditingCommittee({ ...editingCommittee, name: e.target.value })}
                                    placeholder="Enter Full Name"
                                    title="Full Name"
                                  />
                                </div>
                                <div className="admin-form-group">
                                  <label htmlFor="committee_category">Committee Category</label>
                                  <select 
                                    id="committee_category"
                                    value={editingCommittee.category}
                                    onChange={(e) => setEditingCommittee({ ...editingCommittee, category: e.target.value })}
                                    className="form-input"
                                    style={{ background: '#ffffff' }}
                                    title="Committee Category"
                                  >
                                    <option value="organizing">Organizing Committee</option>
                                    <option value="advisory">Advisory Committee</option>
                                    <option value="technical">Technical Program Committee</option>
                                  </select>
                                </div>
                              </div>

                              <div className="admin-form-row">
                                <div className="admin-form-group">
                                  <label htmlFor="committee_role">Role / Position Title (e.g. Patron, General Chair)</label>
                                  <input 
                                    id="committee_role"
                                    type="text" 
                                    className="form-input"
                                    value={editingCommittee.role || ''}
                                    onChange={(e) => setEditingCommittee({ ...editingCommittee, role: e.target.value })}
                                    placeholder="Leave blank if standard member"
                                    title="Role / Position Title"
                                  />
                                </div>
                                <div className="admin-form-group">
                                  <label htmlFor="committee_desc">Institution / Bio Description</label>
                                  <input 
                                    id="committee_desc"
                                    type="text" 
                                    required 
                                    className="form-input"
                                    value={editingCommittee.desc}
                                    onChange={(e) => setEditingCommittee({ ...editingCommittee, desc: e.target.value })}
                                    placeholder="Enter Institution / Bio Description"
                                    title="Institution / Bio Description"
                                  />
                                </div>
                              </div>

                              <div className="admin-form-group">
                                <label htmlFor="committee_image">Image URL / Path</label>
                                <input 
                                  id="committee_image"
                                  type="text" 
                                  className="form-input"
                                  value={editingCommittee.image_url || ''}
                                  onChange={(e) => setEditingCommittee({ ...editingCommittee, image_url: e.target.value })}
                                  placeholder="e.g. /images/name.jpg or full URL (optional)"
                                  title="Image URL / Path"
                                />
                              </div>

                              <div style={{ display: 'flex', gap: '0.75rem' }}>
                                <button type="submit" className="btn btn-primary">
                                  <Save size={16} /> Save Changes
                                </button>
                                <button type="button" onClick={() => setEditingCommittee(null)} className="btn btn-secondary">
                                  Cancel
                                </button>
                              </div>
                            </form>
                          </div>
                        )}

                        <div className="admin-card-grid">
                          {committeeMembers.map((c, idx) => (
                            <div key={c.id || idx} className="admin-editor-card">
                              <h5 style={{ fontSize: '1.1rem', color: '#091d36', margin: '0 0 0.25rem', fontWeight: 800 }}>{c.name}</h5>
                              <span style={{ fontSize: '0.7rem', background: '#0f52ba', color: 'white', padding: '0.15rem 0.4rem', borderRadius: '0.25rem', fontWeight: 700, textTransform: 'uppercase', marginRight: '0.5rem' }}>
                                {c.category}
                              </span>
                              {c.role && (
                                <span style={{ fontSize: '0.7rem', background: '#f58220', color: 'white', padding: '0.15rem 0.4rem', borderRadius: '0.25rem', fontWeight: 700 }}>
                                  {c.role}
                                </span>
                              )}
                              <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '0.5rem', marginInline: 0 }}>{c.desc}</p>
                              
                              <div className="admin-action-row">
                                <button onClick={() => setEditingCommittee(c)} className="btn btn-secondary" style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem' }}>
                                  Edit
                                </button>
                                <button onClick={() => handleDeleteCommittee(c.id)} className="btn btn-secondary" style={{ color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '0.35rem 0.75rem', fontSize: '0.75rem' }}>
                                  Delete
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* TAB: Timeline Dates */}
                    {adminTab === 'dates' && (
                      <div>
                        <div className="admin-control-bar">
                          <h4 style={{ fontSize: '1.25rem', margin: 0, fontWeight: 700 }}>Important Timeline Dates ({importantDates.length})</h4>
                          {!editingDate && (
                            <button onClick={() => setEditingDate({ title: '', event_date: '', desc: '', sort_order: importantDates.length + 1 })} className="btn btn-primary">
                              <Plus size={16} /> Add Date
                            </button>
                          )}
                        </div>

                        {editingDate && (
                          <div className="glass-card" style={{ marginBottom: '2rem', background: '#f8fafc', borderColor: '#3b82f6' }}>
                            <h5 style={{ fontSize: '1.1rem', marginBottom: '1rem', fontWeight: 700 }}>{editingDate.id ? 'Edit Timeline Date' : 'Add New Date'}</h5>
                            <form onSubmit={handleSaveDate} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                              <div className="admin-form-row">
                                <div className="admin-form-group">
                                  <label htmlFor="date_title">Event Name / Title</label>
                                  <input 
                                    id="date_title"
                                    type="text" 
                                    required 
                                    className="form-input"
                                    value={editingDate.title}
                                    onChange={(e) => setEditingDate({ ...editingDate, title: e.target.value })}
                                    placeholder="Enter Event Name / Title"
                                    title="Event Name / Title"
                                  />
                                </div>
                                <div className="admin-form-group">
                                  <label htmlFor="date_event_date">Date String (e.g. October 15, 2026)</label>
                                  <input 
                                    id="date_event_date"
                                    type="text" 
                                    required 
                                    className="form-input"
                                    value={editingDate.event_date}
                                    onChange={(e) => setEditingDate({ ...editingDate, event_date: e.target.value })}
                                    placeholder="Enter Date String"
                                    title="Date String"
                                  />
                                </div>
                              </div>

                              <div className="admin-form-row">
                                <div className="admin-form-group">
                                  <label htmlFor="date_desc">Short Description</label>
                                  <input 
                                    id="date_desc"
                                    type="text" 
                                    required 
                                    className="form-input"
                                    value={editingDate.desc}
                                    onChange={(e) => setEditingDate({ ...editingDate, desc: e.target.value })}
                                    placeholder="Enter Short Description"
                                    title="Short Description"
                                  />
                                </div>
                                <div className="admin-form-group">
                                  <label htmlFor="date_sort_order">Sort Order Index</label>
                                  <input 
                                    id="date_sort_order"
                                    type="number" 
                                    required 
                                    className="form-input"
                                    value={editingDate.sort_order || 1}
                                    onChange={(e) => setEditingDate({ ...editingDate, sort_order: Number(e.target.value) })}
                                    placeholder="1"
                                    title="Sort Order Index"
                                  />
                                </div>
                              </div>

                              <div style={{ display: 'flex', gap: '0.75rem' }}>
                                <button type="submit" className="btn btn-primary">
                                  <Save size={16} /> Save Changes
                                </button>
                                <button type="button" onClick={() => setEditingDate(null)} className="btn btn-secondary">
                                  Cancel
                                </button>
                              </div>
                            </form>
                          </div>
                        )}

                        <div className="admin-card-grid">
                          {importantDates.map((dt, idx) => (
                            <div key={dt.id || idx} className="admin-editor-card">
                              <h5 style={{ fontSize: '1.1rem', color: '#091d36', margin: '0 0 0.25rem', fontWeight: 800 }}>{dt.title}</h5>
                              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#0f52ba' }}>Date: {dt.event_date}</span>
                              <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '0.5rem', marginInline: 0 }}>{dt.desc}</p>
                              
                              <div className="admin-action-row">
                                <button onClick={() => setEditingDate(dt)} className="btn btn-secondary" style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem' }}>
                                  Edit
                                </button>
                                <button onClick={() => handleDeleteDate(dt.id)} className="btn btn-secondary" style={{ color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '0.35rem 0.75rem', fontSize: '0.75rem' }}>
                                  Delete
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* TAB: Workshops / Tutorials */}
                    {adminTab === 'workshops' && (
                      <div>
                        <div className="admin-control-bar">
                          <h4 style={{ fontSize: '1.25rem', margin: 0, fontWeight: 700 }}>Pre-Conference Workshops & Tutorials ({workshops.length})</h4>
                          {!editingWorkshop && (
                            <button onClick={() => setEditingWorkshop({ title: '', instructor: '', duration: '', price: '', details: '' })} className="btn btn-primary">
                              <Plus size={16} /> Add Tutorial
                            </button>
                          )}
                        </div>

                        {editingWorkshop && (
                          <div className="glass-card" style={{ marginBottom: '2rem', background: '#f8fafc', borderColor: '#3b82f6' }}>
                            <h5 style={{ fontSize: '1.1rem', marginBottom: '1rem', fontWeight: 700 }}>{editingWorkshop.id ? 'Edit Tutorial Details' : 'Add New Tutorial'}</h5>
                            <form onSubmit={handleSaveWorkshop} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                              <div className="admin-form-row">
                                <div className="admin-form-group">
                                  <label htmlFor="workshop_title">Tutorial Title</label>
                                  <input 
                                    id="workshop_title"
                                    type="text" 
                                    required 
                                    className="form-input"
                                    value={editingWorkshop.title}
                                    onChange={(e) => setEditingWorkshop({ ...editingWorkshop, title: e.target.value })}
                                    placeholder="Enter Tutorial Title"
                                    title="Tutorial Title"
                                  />
                                </div>
                                <div className="admin-form-group">
                                  <label htmlFor="workshop_instructor">Lead Instructor Name & Institution</label>
                                  <input 
                                    id="workshop_instructor"
                                    type="text" 
                                    required 
                                    className="form-input"
                                    value={editingWorkshop.instructor}
                                    onChange={(e) => setEditingWorkshop({ ...editingWorkshop, instructor: e.target.value })}
                                    placeholder="Enter Lead Instructor Name & Institution"
                                    title="Lead Instructor Name & Institution"
                                  />
                                </div>
                              </div>

                              <div className="admin-form-row">
                                <div className="admin-form-group">
                                  <label htmlFor="workshop_duration">Duration / Time Block</label>
                                  <input 
                                    id="workshop_duration"
                                    type="text" 
                                    required 
                                    className="form-input"
                                    value={editingWorkshop.duration}
                                    onChange={(e) => setEditingWorkshop({ ...editingWorkshop, duration: e.target.value })}
                                    placeholder="e.g. Full Day (9:00 AM - 4:00 PM)"
                                    title="Duration / Time Block"
                                  />
                                </div>
                                <div className="admin-form-group">
                                  <label htmlFor="workshop_price">Price Display String</label>
                                  <input 
                                    id="workshop_price"
                                    type="text" 
                                    required 
                                    className="form-input"
                                    value={editingWorkshop.price}
                                    onChange={(e) => setEditingWorkshop({ ...editingWorkshop, price: e.target.value })}
                                    placeholder="e.g. INR 1,000 / USD 40"
                                    title="Price Display String"
                                  />
                                </div>
                              </div>

                              <div className="admin-form-group">
                                <label htmlFor="workshop_details">Detailed Description & Syllabus</label>
                                <textarea 
                                  id="workshop_details"
                                  rows={4} 
                                  required 
                                  className="form-input"
                                  value={editingWorkshop.details}
                                  onChange={(e) => setEditingWorkshop({ ...editingWorkshop, details: e.target.value })}
                                  placeholder="Enter Detailed Description & Syllabus"
                                  title="Detailed Description & Syllabus"
                                />
                              </div>

                              <div style={{ display: 'flex', gap: '0.75rem' }}>
                                <button type="submit" className="btn btn-primary">
                                  <Save size={16} /> Save Changes
                                </button>
                                <button type="button" onClick={() => setEditingWorkshop(null)} className="btn btn-secondary">
                                  Cancel
                                </button>
                              </div>
                            </form>
                          </div>
                        )}

                        <div className="admin-card-grid">
                          {workshops.map((w, idx) => (
                            <div key={w.id || idx} className="admin-editor-card">
                              <h5 style={{ fontSize: '1.1rem', color: '#091d36', margin: '0 0 0.25rem', fontWeight: 800 }}>{w.title}</h5>
                              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#f58220' }}>Instructor: {w.instructor}</span>
                              <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '0.25rem 0' }}><strong>Duration:</strong> {w.duration} | <strong>Price:</strong> {w.price}</p>
                              <p style={{ fontSize: '0.82rem', color: '#475569', marginTop: '0.5rem', lineHeight: '1.5' }}>{w.details}</p>
                              
                              <div className="admin-action-row">
                                <button onClick={() => setEditingWorkshop(w)} className="btn btn-secondary" style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem' }}>
                                  Edit
                                </button>
                                <button onClick={() => handleDeleteWorkshop(w.id)} className="btn btn-secondary" style={{ color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '0.35rem 0.75rem', fontSize: '0.75rem' }}>
                                  Delete
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                  </div>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
