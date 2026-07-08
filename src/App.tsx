import React, { useState, useEffect, useRef } from 'react';
import { 
  motion, 
  AnimatePresence, 
  useScroll, 
  useSpring,
  useTransform
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
  Database,
  Sparkles
} from 'lucide-react';
import { SrecLogo } from './components/SrecLogo';
import Footer from './components/Footer';
import acLogo from './assets/ac.png';
import srecLogo from './assets/srec-logo.png';
import chatbotIcon from './assets/chatbot.gif';
import { supabase, isSupabaseConfigured } from './supabaseClient';
import ExplorePage from './ExplorePage';
import AdminPage from './AdminPage';

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
    { id: 'explore', label: 'Explore Coimbatore' },
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
  category: 'steering' | 'organizing' | 'advisory' | 'technical';
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

/*
interface RegistrationFee {
  member_type: string;
  inr_reg: string;
  inr_early: string;
  usd_phys_reg: string;
  usd_phys_early: string;
  usd_virt_reg: string;
  usd_virt_early: string;
}
*/

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

// Dynamic dynamic count up component for conference statistics
function CounterUp({ target, duration = 1.2 }: { target: string; duration?: number }) {
  const [count, setCount] = useState(0);
  const elementRef = useRef<HTMLDivElement>(null);
  const [hasStarted, setHasStarted] = useState(false);

  // Extract the numeric part and any suffixes (e.g. "17" or "100+")
  const numericPart = parseInt(target.replace(/\D/g, ''), 10) || 0;
  const suffix = target.replace(/[0-9]/g, '');

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setHasStarted(true);
        }
      },
      { threshold: 0.1 }
    );

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!hasStarted) return;

    let start = 0;
    const end = numericPart;
    if (start === end) {
      setCount(end);
      return;
    }

    const totalSteps = 45;
    const stepTime = (duration * 1000) / totalSteps;
    const increment = end / totalSteps;
    let currentStep = 0;

    const timer = setInterval(() => {
      currentStep++;
      const nextVal = Math.round(increment * currentStep);
      if (currentStep >= totalSteps) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(nextVal);
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, [hasStarted, numericPart, duration]);

  return (
    <div ref={elementRef} style={{ display: 'inline-block' }}>
      {count}
      {suffix}
    </div>
  );
}

export default function App() {
  const [activeSection, setActiveSection] = useState('home');
  const [currentPage, setCurrentPage] = useState<'main' | 'explore' | 'admin'>('main');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [committeeTab, setCommitteeTab] = useState<'steering' | 'organizing' | 'advisory'>('organizing');
  const [activeSubcommittee, setActiveSubcommittee] = useState<string>('leadership');
  const [submissionTab, setSubmissionTab] = useState<'initial' | 'camera-ready'>('initial');
  
  // Database content states
  const [departments, setDepartments] = useState<Department[]>([]);
  const [committeeMembers, setCommitteeMembers] = useState<CommitteeMember[]>([]);
  const [speakers, setSpeakers] = useState<Speaker[]>([]);
  const [importantDates, setImportantDates] = useState<ImportantDate[]>([]);
  const [workshops, setWorkshops] = useState<Workshop[]>([]);
  // const [registrationFees, setRegistrationFees] = useState<RegistrationFee[]>([]);
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

  // Payment tab and country code/online checkout states
  const [paymentTab, setPaymentTab] = useState<'bank' | 'online'>('bank');
  const [regPhoneCode, setRegPhoneCode] = useState<string>('+91');
  const [cardHolder, setCardHolder] = useState<string>('');
  const [cardNumber, setCardNumber] = useState<string>('');
  const [cardExpiry, setCardExpiry] = useState<string>('');
  const [cardCvv, setCardCvv] = useState<string>('');
  const [selectedUpi, setSelectedUpi] = useState<'gpay' | 'phonepe' | 'paytm' | 'upi_id' | null>(null);
  const [upiId, setUpiId] = useState<string>('');
  const [onlineSuccess, setOnlineSuccess] = useState<boolean>(false);
  const [onlinePaying, setOnlinePaying] = useState<boolean>(false);

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

  // Nexus Agent Chatbot states
  const [showNexusChat, setShowNexusChat] = useState<boolean>(false);
  const [chatMessages, setChatMessages] = useState<{ sender: 'agent' | 'user'; text: string }[]>([
    { sender: 'agent', text: 'Hello! I am Nexus, your SREC Conference AI Assistant. Ask me anything about AECTSD 2027 registration, important dates, key tracks, speakers, or workshops!' }
  ]);
  const [chatInput, setChatInput] = useState<string>('');
  const [isAgentTyping, setIsAgentTyping] = useState<boolean>(false);

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
        let error;
        if (editingDept.id) {
          const res = await supabase.from('departments').update(dataToSave).eq('id', editingDept.id);
          error = res.error;
        } else {
          const res = await supabase.from('departments').insert(dataToSave);
          error = res.error;
        }
        if (error) throw error;
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
    } catch (err: any) {
      console.error('Save department failed:', err);
      alert('Save department failed: ' + (err.message || err));
    }
  };

  const handleDeleteDept = async (id: any) => {
    if (!window.confirm('Are you sure you want to delete this department track?')) return;
    try {
      if (isSupabaseConfigured && supabase) {
        const { error } = await supabase.from('departments').delete().eq('id', id);
        if (error) throw error;
      } else {
        const list = departments.filter(d => (d as any).id !== id);
        localStorage.setItem('srec_offline_departments', JSON.stringify(list));
      }
      await fetchDbData();
    } catch (err: any) {
      console.error('Delete department failed:', err);
      alert('Delete department failed: ' + (err.message || err));
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
        let error;
        if (editingSpeaker.id) {
          const res = await supabase.from('speakers').update(dataToSave).eq('id', editingSpeaker.id);
          error = res.error;
        } else {
          const res = await supabase.from('speakers').insert(dataToSave);
          error = res.error;
        }
        if (error) throw error;
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
    } catch (err: any) {
      console.error('Save speaker failed:', err);
      alert('Save speaker failed: ' + (err.message || err));
    }
  };

  const handleDeleteSpeaker = async (id: any) => {
    if (!window.confirm('Are you sure you want to delete this speaker?')) return;
    try {
      if (isSupabaseConfigured && supabase) {
        const { error } = await supabase.from('speakers').delete().eq('id', id);
        if (error) throw error;
      } else {
        const list = speakers.filter(s => (s as any).id !== id);
        localStorage.setItem('srec_offline_speakers', JSON.stringify(list));
      }
      await fetchDbData();
    } catch (err: any) {
      console.error('Delete speaker failed:', err);
      alert('Delete speaker failed: ' + (err.message || err));
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
        let error;
        if (editingDate.id) {
          const res = await supabase.from('important_dates').update(dataToSave).eq('id', editingDate.id);
          error = res.error;
        } else {
          const res = await supabase.from('important_dates').insert(dataToSave);
          error = res.error;
        }
        if (error) throw error;
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
    } catch (err: any) {
      console.error('Save date failed:', err);
      alert('Save date failed: ' + (err.message || err));
    }
  };

  const handleDeleteDate = async (id: any) => {
    if (!window.confirm('Are you sure you want to delete this date?')) return;
    try {
      if (isSupabaseConfigured && supabase) {
        const { error } = await supabase.from('important_dates').delete().eq('id', id);
        if (error) throw error;
      } else {
        const list = importantDates.filter(d => (d as any).id !== id);
        localStorage.setItem('srec_offline_important_dates', JSON.stringify(list));
      }
      await fetchDbData();
    } catch (err: any) {
      console.error('Delete date failed:', err);
      alert('Delete date failed: ' + (err.message || err));
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
        let error;
        if (editingWorkshop.id) {
          const res = await supabase.from('workshops').update(dataToSave).eq('id', editingWorkshop.id);
          error = res.error;
        } else {
          const res = await supabase.from('workshops').insert(dataToSave);
          error = res.error;
        }
        if (error) throw error;
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
    } catch (err: any) {
      console.error('Save workshop failed:', err);
      alert('Save workshop failed: ' + (err.message || err));
    }
  };

  const handleDeleteWorkshop = async (id: any) => {
    if (!window.confirm('Are you sure you want to delete this workshop?')) return;
    try {
      if (isSupabaseConfigured && supabase) {
        const { error } = await supabase.from('workshops').delete().eq('id', id);
        if (error) throw error;
      } else {
        const list = workshops.filter(w => (w as any).id !== id);
        localStorage.setItem('srec_offline_workshops', JSON.stringify(list));
      }
      await fetchDbData();
    } catch (err: any) {
      console.error('Delete workshop failed:', err);
      alert('Delete workshop failed: ' + (err.message || err));
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
        let error;
        if (editingCommittee.id) {
          const res = await supabase.from('committee').update(dataToSave).eq('id', editingCommittee.id);
          error = res.error;
        } else {
          const res = await supabase.from('committee').insert(dataToSave);
          error = res.error;
        }
        if (error) throw error;
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
    } catch (err: any) {
      console.error('Save committee member failed:', err);
      alert('Save committee member failed: ' + (err.message || err));
    }
  };

  const handleDeleteCommittee = async (id: any) => {
    if (!window.confirm('Are you sure you want to delete this committee member?')) return;
    try {
      if (isSupabaseConfigured && supabase) {
        const { error } = await supabase.from('committee').delete().eq('id', id);
        if (error) throw error;
      } else {
        const list = committeeMembers.filter(c => (c as any).id !== id);
        localStorage.setItem('srec_offline_committee', JSON.stringify(list));
      }
      await fetchDbData();
    } catch (err: any) {
      console.error('Delete committee member failed:', err);
      alert('Delete committee member failed: ' + (err.message || err));
    }
  };

  const handleSaveInfoSetting = async (key: string, val: string) => {
    try {
      if (isSupabaseConfigured && supabase) {
        const { error } = await supabase.from('conference_info').upsert({ key, value: val });
        if (error) throw error;
      }
      const updatedInfo = { ...info, [key]: val };
      setInfo(updatedInfo);
      localStorage.setItem('srec_offline_info', JSON.stringify(updatedInfo));
    } catch (err: any) {
      console.error('Save setting failed:', err);
      alert('Save setting failed: ' + (err.message || err));
    }
  };

  const handleDeleteRegistration = async (id: any) => {
    if (!window.confirm('Are you sure you want to delete this registration log?')) return;
    try {
      if (isSupabaseConfigured && supabase) {
        const { error } = await supabase.from('registrations').delete().eq('id', id);
        if (error) throw error;
      } else {
        const list = submittedRegistrations.filter(r => r.id !== id);
        localStorage.setItem('srec_offline_registrations', JSON.stringify(list));
      }
      await fetchDbData();
    } catch (err: any) {
      console.error('Delete registration failed:', err);
      alert('Delete registration failed: ' + (err.message || err));
    }
  };

  const handleClearAllRegistrations = async () => {
    if (!window.confirm('WARNING: Are you sure you want to delete ALL registrations? This cannot be undone.')) return;
    try {
      if (isSupabaseConfigured && supabase) {
        const { error } = await supabase.from('registrations').delete().neq('id', 0);
        if (error) throw error;
      } else {
        localStorage.setItem('srec_offline_registrations', JSON.stringify([]));
      }
      await fetchDbData();
    } catch (err: any) {
      console.error('Clear registrations failed:', err);
      alert('Clear registrations failed: ' + (err.message || err));
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

  const sendRegistrationEmail = async (fullPhone: string) => {
    const serviceId = info.emailjs_service_id;
    const templateId = info.emailjs_template_id;
    const publicKey = info.emailjs_public_key;
    const recipient = info.emailjs_recipient || info.secretariat_email || 'aectsd2027@srec.ac.in';
    
    if (serviceId && templateId && publicKey) {
      try {
        let receiptBase64 = '';
        if (regScreenshot) {
          receiptBase64 = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(regScreenshot);
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = error => reject(error);
          });
        }
        
        const bill = calculateTotalFees();
        const templateParams = {
          to_email: recipient,
          paper_id: regPaperId,
          paper_title: regPaperTitle,
          author_name: regAuthorName,
          email: regEmail,
          phone: fullPhone,
          total_due: `${bill.currencySymbol}${bill.total} ${bill.currency}`,
          register_for_tour: regRegisterForTour ? 'Yes' : 'No',
          preferred_tour_place: regPreferredTourPlace || 'None',
          receipt_image: receiptBase64
        };

        const res = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            service_id: serviceId,
            template_id: templateId,
            user_id: publicKey,
            template_params: templateParams
          })
        });
        if (!res.ok) {
          const errText = await res.text();
          throw new Error(`EmailJS responded with ${res.status}: ${errText}`);
        }
        console.log('Notification email sent successfully via EmailJS!');
      } catch (emailErr) {
        console.error('Failed to send notification email via EmailJS:', emailErr);
      }
    }
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
    
    const fullPhone = `${regPhoneCode} ${regPhone}`;
    
    try {
      if (!isSupabaseConfigured || !supabase) {
        // Mock success if Supabase is offline
        setTimeout(async () => {
          const newReg = {
            id: Date.now(),
            paper_id: regPaperId || 'N/A',
            paper_title: regPaperTitle || 'Listener Registration',
            author_name: regAuthorName,
            email: regEmail,
            phone: fullPhone,
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

          // Try to send notification email
          await sendRegistrationEmail(fullPhone);

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
        phone: fullPhone,
        screenshot_name: regScreenshot ? regScreenshot.name : 'no_file',
        screenshot_size: regScreenshot ? regScreenshot.size : 0,
        register_for_tour: regRegisterForTour,
        preferred_tour_place: regPreferredTourPlace || null
      });
      
      if (error) {
        throw error;
      }

      // Send notification email
      await sendRegistrationEmail(fullPhone);

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
  const { scrollY, scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  // Parallax transforms for Hero background scroll animation
  const heroBgY = useTransform(scrollY, [0, 600], ['0%', '25%']);
  const heroBgScale = useTransform(scrollY, [0, 600], [1, 1.08]);

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
      if (!errDept && deptData) {
        setDepartments(deptData);
        localStorage.setItem('srec_offline_departments', JSON.stringify(deptData));
      }

      // Fetch committee
      const { data: committeeData, error: errCommittee } = await supabase.from('committee').select('*').order('id');
      if (!errCommittee && committeeData) {
        setCommitteeMembers(committeeData);
        localStorage.setItem('srec_offline_committee', JSON.stringify(committeeData));
      }

      // Fetch speakers
      const { data: speakersData, error: errSpeakers } = await supabase.from('speakers').select('*').order('id');
      if (!errSpeakers && speakersData) {
        setSpeakers(speakersData);
        localStorage.setItem('srec_offline_speakers', JSON.stringify(speakersData));
      }

      // Fetch important dates
      const { data: datesData, error: errDates } = await supabase.from('important_dates').select('*').order('sort_order');
      if (!errDates && datesData) {
        setImportantDates(datesData);
        localStorage.setItem('srec_offline_important_dates', JSON.stringify(datesData));
      }

      // Fetch workshops
      const { data: workshopsData, error: errWorkshops } = await supabase.from('workshops').select('*').order('id');
      if (!errWorkshops && workshopsData) {
        setWorkshops(workshopsData);
        localStorage.setItem('srec_offline_workshops', JSON.stringify(workshopsData));
      }

      // Fetch registration fees
      // const { data: feesData, error: errFees } = await supabase.from('registration_fees').select('*').order('sort_order');
      // if (!errFees && feesData) setRegistrationFees(feesData);

      // Fetch stats
      const { data: statsData, error: errStats } = await supabase.from('stats').select('*').order('sort_order');
      if (!errStats && statsData) setStats(statsData);

      // Fetch coordinators
      const { data: coordinatorsData, error: errCoordinators } = await supabase.from('coordinators').select('*').order('sort_order');
      if (!errCoordinators && coordinatorsData) setCoordinators(coordinatorsData);

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
      if (!errInfo && infoData) {
        const infoMap: Record<string, string> = {};
        infoData.forEach((row: any) => {
          infoMap[row.key] = row.value;
        });
        setInfo(prev => ({ ...prev, ...infoMap }));
        localStorage.setItem('srec_offline_info', JSON.stringify(infoMap));
      }

      // Fetch registrations log
      const { data: registrationsLog, error: errReg } = await supabase.from('registrations').select('*').order('created_at', { ascending: false });
      if (!errReg && registrationsLog) {
        setSubmittedRegistrations(registrationsLog);
        localStorage.setItem('srec_offline_registrations', JSON.stringify(registrationsLog));
      }
    } catch (err) {
      console.warn('Failed to load online data. Falling back to offline fallback state.', err);
    }
  };

  useEffect(() => {
    fetchDbData();
  }, []);

  // Set dynamic banner height CSS variable
  useEffect(() => {
    const isBannerVisible = info.show_announcement !== 'false';
    document.documentElement.style.setProperty('--banner-height', isBannerVisible ? '40px' : '0px');
  }, [info.show_announcement]);

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

  // Auto-scroll chatbot messages
  useEffect(() => {
    const container = document.getElementById('nexus-chat-messages-container');
    if (container) {
      container.scrollTop = container.scrollHeight;
    }
  }, [chatMessages, isAgentTyping, showNexusChat]);

  const scrollToSection = (id: string) => {
    if (id === 'nexus-agent') {
      setShowNexusChat(true);
      setMobileMenuOpen(false);
      return;
    }

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
        const headerEl = document.querySelector('.main-header');
        const offset = headerEl ? headerEl.clientHeight : 95;
        window.scrollTo({
          top: el.offsetTop - offset,
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

  const handleSendChatMessage = (textToSend?: string) => {
    const messageText = textToSend || chatInput;
    if (!messageText.trim()) return;

    // Add user message
    const updatedMessages = [...chatMessages, { sender: 'user' as const, text: messageText }];
    setChatMessages(updatedMessages);
    if (!textToSend) setChatInput('');
    setIsAgentTyping(true);

    // Generate response after a short timeout (typing effect)
    setTimeout(() => {
      const lower = messageText.toLowerCase();
      let reply = "";

      // Helper function to extract info cleanly
      const dateList = importantDates.map(d => `- ${d.title}: ${d.event_date}`).join('\n');
      const speakerList = speakers.map(s => `- ${s.name} (${s.role}): "${s.talk}"`).join('\n');
      const trackList = departments.map(d => `- ${d.name}`).join('\n');
      const workshopList = workshops.map(w => `- ${w.title} by ${w.instructor} (${w.duration})`).join('\n');

      if (lower.includes('date') || lower.includes('deadline') || lower.includes('when') || lower.includes('timeline')) {
        reply = `Here are the important timeline dates for the conference:\n\n${dateList || "Important dates will be announced soon. Please stay tuned!"}`;
      } else if (lower.includes('fee') || lower.includes('price') || lower.includes('cost') || lower.includes('payment') || lower.includes('register') || lower.includes('registration')) {
        reply = `Registration Fee Information:\n\n- Indian Authors (Student): ₹6,000 / Non-Member: ₹7,000\n- Indian Authors (Professional): ₹7,000 / Non-Member: ₹8,000\n- International Authors: $150 to $300 USD\n\nYou can click on "Registration" in the menu or use the "Calculate Fee" button on the main banner to see the exact price breakdown for your criteria and find the bank wire transfer details.`;
      } else if (lower.includes('speaker') || lower.includes('keynote') || lower.includes('talk')) {
        reply = `We have a stellar lineup of keynote speakers at AECTSD 2027:\n\n${speakerList || "- To be updated soon."}`;
      } else if (lower.includes('track') || lower.includes('department') || lower.includes('topic') || lower.includes('scope')) {
        reply = `The conference covers key research tracks including:\n\n${trackList || "- Advanced Electronics\n- Communication\n- Trust, Security and Devices"}\n\nYou can view full details of each track by clicking on the tracks listed under the "Explore" or "Call for Papers" sections on our site.`;
      } else if (lower.includes('workshop') || lower.includes('tutorial')) {
        reply = `Pre-conference Workshops & Tutorials:\n\n${workshopList || "Pre-conference tutorial sessions will be announced soon."}`;
      } else if (lower.includes('location') || lower.includes('where') || lower.includes('venue') || lower.includes('address') || lower.includes('travel') || lower.includes('direction')) {
        reply = `AECTSD 2027 is hosted at:\n\n${info.event_location_display || "Sri Ramakrishna Engineering College, Coimbatore, Tamilnadu, India."}\n\nCoimbatore is well connected by air, rail, and road. You can check the "Directions" map and explore tourist spots nearby directly in the "Explore" page.`;
      } else if (lower.includes('submit') || lower.includes('paper') || lower.includes('cmt') || lower.includes('manuscript')) {
        reply = `You can submit your research paper through the Microsoft CMT Portal at the following URL:\n\n${info.cmt_link || "https://cmt3.research.microsoft.com/"}\n\nFormat guidelines: Fenced to 6 pages. Templates can be downloaded from IEEE guidelines.`;
      } else if (lower.includes('contact') || lower.includes('phone') || lower.includes('email') || lower.includes('help')) {
        reply = `For any questions, you can reach out to the conference secretariat at:\n\nEmail: aectsd@srec.ac.in\nSecretariat: ${info.secretariat_address || "Sri Ramakrishna Engineering College, Coimbatore, India."}`;
      } else if (lower.includes('hello') || lower.includes('hi') || lower.includes('hey') || lower.includes('nexus')) {
        reply = `Hello! How can I help you today? Ask me about paper submission, important dates, registration fees, or venue details.`;
      } else {
        reply = `Thank you for your question. AECTSD 2027 (International Conference on Advanced Electronics, Communication, Trust, Security and Devices) is organized by Sri Ramakrishna Engineering College. \n\nI can help you with:\n- Key dates & deadlines\n- Paper submission link (CMT)\n- Registration fees & bank details\n- Keynote speakers\n- Workshop details\n\nWhat would you like to know?`;
      }

      setChatMessages(prev => [...prev, { sender: 'agent' as const, text: reply }]);
      setIsAgentTyping(false);
    }, 1000);
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
    explore: info.nav_explore || "Explore Coimbatore",
    venue: info.nav_venue || "Venue",
    'contact-us': info.nav_contact_us,
    'ieee-sb': info.nav_ieee_sb || "IEEE SB",
    'nexus-agent': info.nav_nexus_agent || "Nexus Agent"
  };

  const renderBannerContent = (text: string) => {
    const target = "Call for Papers!";
    if (text.includes(target)) {
      const parts = text.split(target);
      return (
        <>
          {parts[0]}<strong>{target}</strong>{parts[1]}
        </>
      );
    }
    return text;
  };

  return (
    <div style={{ position: 'relative', width: '100%', minHeight: '100vh', background: 'var(--bg-deep)' }}>
      {/* Background Grids and Overlays */}
      <div className="bg-grid-overlay" />
      <div className="bg-radial-overlay" />
      <div className="bg-bubbles">
        <div className="bubble bubble-1" />
        <div className="bubble bubble-2" />
        <div className="bubble bubble-3" />
      </div>

      {/* Top Page Progress Indicator */}
      <motion.div 
        style={{
          scaleX,
          position: 'fixed',
          top: 'var(--banner-height, 0px)',
          left: 0,
          right: 0,
          height: '4px',
          background: 'linear-gradient(90deg, #3b82f6 0%, #06b6d4 100%)',
          transformOrigin: '0%',
          zIndex: 125
        }} 
      />

      {/* Announcement Banner */}
      {info.show_announcement !== 'false' && (
        <div className="announcement-banner">
          <div className="announcement-content">
            <div className="announcement-marquee-container">
              <span className="announcement-marquee-text">
                {renderBannerContent(
                  info.announcement_text || 
                  "📢 Call for Papers! Mark your calendars: The Call for Papers for AECTSD 2027 opens on 15th December 2026. Start preparing your submission"
                )}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Header / Navbar */}
      <header className="main-header">
        <a 
          href={info.srec_url || "https://srec.ac.in/"} 
          target="_blank" 
          rel="noopener noreferrer"
          title="Sri Ramakrishna Engineering College"
          style={{ display: 'inline-flex', cursor: 'pointer', textDecoration: 'none' }}
        >
          <SrecLogo lightText={false} className="srec-logo" />
        </a>

        {/* Desktop Navigation Links */}
        <nav className="desktop-nav" style={{ width: '100%', justifyContent: 'center' }}>
          <ul style={{ display: 'flex', gap: '0.5rem 1rem', listStyle: 'none', alignItems: 'center', margin: 0, padding: 0, flexWrap: 'wrap', justifyContent: 'center' }}>
            {NAV_ITEMS.map((item: any) => {
              return (
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
              );
            })}
          </ul>
        </nav>

        {/* AC Logo and Mobile Navigation Toggle Container */}
        <div className="header-right-container">
          <img 
            src={acLogo} 
            alt="AECTSD Logo" 
            onClick={() => {
              setShowAdminPortal(true);
              setAdminRegMode(false);
              setAdminError(null);
            }}
            className="ac-logo-img"
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
              cursor: 'pointer',
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '38px',
              height: '38px'
            }}
            className="mobile-nav-toggle"
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={mobileMenuOpen ? 'close' : 'menu'}
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                transition={{ duration: 0.15 }}
                style={{ display: 'inline-flex' }}
              >
                {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </motion.div>
            </AnimatePresence>
          </button>
        </div>
      </header>
 
      {/* Mobile Drawer Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="mobile-nav-drawer"
          >
            {NAV_ITEMS.map((item, idx) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ 
                  duration: 0.3, 
                  delay: idx * 0.035, 
                  ease: [0.16, 1, 0.3, 1] 
                }}
                style={{ width: '100%' }}
              >
                {item.external ? (
                  <a
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
                      display: 'block',
                      transition: 'all 0.2s ease'
                    }}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {navLabelMap[item.id] || item.label}
                  </a>
                ) : (
                  <button
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
                      width: '100%',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    {navLabelMap[item.id] || item.label}
                  </button>
                )}
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {currentPage === 'explore' ? (
          <motion.div
            key="explore"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.35, ease: 'easeInOut' }}
          >
            <ExplorePage adminUser={adminUser} />
          </motion.div>
        ) : currentPage === 'admin' ? (
          <motion.div
            key="admin"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.35, ease: 'easeInOut' }}
          >
            <AdminPage
              supabase={supabase}
              isSupabaseConfigured={isSupabaseConfigured}
              fetchDbData={fetchDbData}
              departments={departments}
              committeeMembers={committeeMembers}
              speakers={speakers}
              importantDates={importantDates}
              workshops={workshops}
              submittedRegistrations={submittedRegistrations}
              info={info}
              pricing={pricing}
              stats={stats}
              coordinators={coordinators}
              setInfo={setInfo}
              setPricing={setPricing}
              setStats={setStats}
              setCoordinators={setCoordinators}
              onClose={() => setCurrentPage('main')}
            />
          </motion.div>
        ) : (
          <motion.div
            key="home"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.35, ease: 'easeInOut' }}
          >
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
              padding: 'calc(8rem + var(--banner-height, 0px)) 1.5rem 6rem',
              textAlign: 'center',
              overflow: 'hidden'
            }}
          >
            {/* Parallax Hero Background Image */}
            <motion.div 
              style={{
                position: 'absolute',
                inset: 0,
                backgroundImage: `url(${info.hero_bg_url || 'https://images.shiksha.com/mediadata/images/1488263707phpWPR1Pb.jpeg'})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                y: heroBgY,
                scale: heroBgScale,
                zIndex: 0
              }}
            />

            {/* Light overlay for exact readability and style match */}
            <div style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(to bottom, rgba(255, 255, 255, 0.4) 0%, rgba(255, 255, 255, 0.75) 60%, rgba(255, 255, 255, 1) 100%)',
              zIndex: 1
            }} />

        <div style={{ position: 'relative', zIndex: 2, maxWidth: '960px', width: '100%' }}>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="glass-card"
            style={{
              padding: '3rem 2.5rem',
              borderRadius: '1.5rem',
              background: 'rgba(255, 255, 255, 0.85)',
              backdropFilter: 'blur(16px)',
              border: '1px solid rgba(255, 255, 255, 0.4)',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '1.5rem',
              color: '#0f172a'
            }}
          >
            {/* Title */}
            <h1 className="hero-title" style={{ margin: 0, fontSize: '3rem', fontWeight: 800, background: 'linear-gradient(135deg, #091d36 40%, #0f52ba 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', lineHeight: 1.2 }}>
              {info.hero_title || 'Welcome to ICAECTSD 2027'}
            </h1>

            {/* Subtitle */}
            <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#334155', maxWidth: '800px', margin: 0, lineHeight: 1.5 }}>
              {info.hero_subtitle || 'Second IEEE International Conference On Advances in Engineering and Computing Technologies for Sustainable Development (ICAECTSD) 2027'}
            </h2>

            {/* Date & Location */}
            <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center', margin: '0.5rem 0 1rem', fontSize: '1rem', fontWeight: 700, color: '#1e293b' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Calendar size={20} className="text-blue-600" />
                <span>{info.event_date_display || '17th and 18th December 2027'}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <MapPin size={20} className="text-blue-600" />
                <span>{info.event_location_display || 'Sri Ramakrishna Engineering College, Coimbatore, Tamilnadu, India'}</span>
              </div>
            </div>

            {/* Countdown Clock */}
            <div className="countdown-container" style={{ width: '100%', maxWidth: '600px', padding: '1rem', background: 'rgba(15, 82, 186, 0.05)', borderRadius: '1rem', border: '1px solid rgba(15, 82, 186, 0.1)', color: '#0f172a' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', color: '#1e3a8a', fontSize: '0.85rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.5rem' }}>
                <Clock size={16} />
                <span>{info.hero_countdown_title || 'Conference Countdown'}</span>
              </div>
              <div className="countdown-row" style={{ color: '#0f172a' }}>
                {[
                  { label: info.label_days || 'Days', value: timeLeft.days },
                  { label: info.label_hours || 'Hours', value: timeLeft.hours },
                  { label: info.label_mins || 'Minutes', value: timeLeft.minutes },
                  { label: info.label_secs || 'Seconds', value: timeLeft.seconds }
                ].map((t, idx) => (
                  <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <span className="countdown-val" style={{ display: 'inline-flex', overflow: 'hidden', height: '2.5rem', alignItems: 'center', justifyContent: 'center', color: '#091d36', fontSize: '1.8rem', fontWeight: 800 }}>
                      <AnimatePresence mode="popLayout" initial={false}>
                        <motion.span
                          key={t.value}
                          initial={{ y: 20, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          exit={{ y: -20, opacity: 0 }}
                          transition={{ duration: 0.2, ease: 'easeOut' }}
                          style={{ display: 'inline-block' }}
                        >
                          {String(t.value).padStart(2, '0')}
                        </motion.span>
                      </AnimatePresence>
                    </span>
                    <span className="countdown-lbl" style={{ color: '#475569', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 600 }}>
                      {t.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap', width: '100%', marginTop: '0.5rem' }}>
              <button onClick={() => scrollToSection('paper-submission')} className="btn btn-primary" style={{ fontSize: '0.95rem', padding: '0.8rem 1.75rem' }}>
                <FileText size={18} />
                {info.hero_btn_submit || 'Submit Paper'}
              </button>
              <button 
                onClick={() => {
                  alert('Brochure download starting...');
                  const link = document.createElement('a');
                  link.href = '#';
                  link.setAttribute('download', 'ICAECTSD_2027_Brochure.pdf');
                  document.body.appendChild(link);
                }} 
                className="btn btn-secondary" 
                style={{ fontSize: '0.95rem', padding: '0.8rem 1.75rem', background: '#0b2240', border: '1px solid rgba(0,0,0,0.1)', color: '#ffffff' }}
              >
                <Download size={18} />
                Download Brochure
              </button>
              <button onClick={() => setShowCalcModal(true)} className="btn btn-secondary" style={{ fontSize: '0.95rem', padding: '0.8rem 1.75rem' }}>
                {info.hero_btn_register || 'Calculate Fees'}
                <ChevronRight size={18} />
              </button>
            </div>
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

          {/* About Layout: About the Conference (Full Width) & Trust + College (Grid) */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', marginBottom: '2rem' }}>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="glass-card"
              style={{ width: '100%' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
                <Layers className="text-blue-400" size={26} />
                <h3 style={{ fontSize: '1.6rem', color: 'white', fontWeight: 700 }}>About the Conference</h3>
              </div>
              {info.about_conference?.split('\n\n').filter(Boolean).map((para: string, idx: number) => (
                <p key={idx} style={{ color: 'var(--text-secondary)', marginBottom: '1rem', textIndent: '2rem', textAlign: 'justify', lineHeight: '1.8', fontSize: '0.975rem' }}>
                  {para}
                </p>
              ))}
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
                  <BookOpen className="text-cyan-400" size={24} />
                  <h3 style={{ fontSize: '1.5rem', color: 'white', fontWeight: 700 }}>{info.about_card_conf_title || "About the Trust"}</h3>
                </div>
                {info.about_trust?.split('\n\n').filter(Boolean).map((para: string, idx: number) => (
                  <p key={idx} style={{ color: 'var(--text-secondary)', marginBottom: '1rem', textIndent: '2rem', textAlign: 'justify', lineHeight: '1.7', fontSize: '0.95rem' }}>
                    {para}
                  </p>
                ))}
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
                  <h3 style={{ fontSize: '1.5rem', color: 'white', fontWeight: 700 }}>{info.about_card_inst_title || "About the Institution"}</h3>
                </div>
                {info.about_institution?.split('\n\n').filter(Boolean).map((para: string, idx: number) => (
                  <p key={idx} style={{ color: 'var(--text-secondary)', marginBottom: '1rem', textIndent: '2rem', textAlign: 'justify', lineHeight: '1.7', fontSize: '0.95rem' }}>
                    {para}
                  </p>
                ))}
              </motion.div>
            </div>
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
                <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#3b82f6', fontFamily: 'var(--font-heading)' }}>
                  <CounterUp target={stat.number} />
                </div>
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
              { id: 'organizing', label: info.committee_tab_org || 'Organizing Committee' },
              { id: 'advisory', label: info.committee_tab_adv || 'Advisory Committee' },
              { id: 'steering', label: info.committee_tab_steering || 'Steering Committee' }
            ] as { id: 'steering' | 'organizing' | 'advisory', label: string }[]).map((tab) => (
              <button
                key={tab.id}
                onClick={() => setCommitteeTab(tab.id)}
                className={`committee-tab-btn ${committeeTab === tab.id ? 'active' : 'inactive'}`}
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
              {committeeTab === 'steering' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                  {info.steering_committee_desc && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="glass-card"
                      style={{ padding: '2rem', textAlign: 'center', maxWidth: '900px', margin: '0 auto 0.5rem', background: 'var(--glass-bg)', border: '1px solid var(--glass-border)' }}
                    >
                      <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'white', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem' }}>
                        Steering Committee
                      </h3>
                      <p style={{ color: 'var(--text-secondary)', lineHeight: '1.7', fontSize: '0.95rem', margin: 0 }}>
                        {info.steering_committee_desc}
                      </p>
                    </motion.div>
                  )}

                  <div className="grid-3-col">
                    {committeeMembers
                      .filter((member) => member.category === 'steering')
                      .map((member, mIdx) => (
                        <div 
                          key={mIdx} 
                          className="member-profile-card" 
                          style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '1.75rem 1.5rem', borderLeft: '4px solid #8b5cf6', justifyContent: 'center' }}
                        >
                          <span className="member-role-badge" style={{ marginBottom: '0.75rem', alignSelf: 'center' }}>
                            {member.role || 'Steering Committee Member'}
                          </span>
                          <h4 className="member-name" style={{ fontSize: '1.15rem', fontWeight: 700, color: 'white', marginBottom: '0.5rem', marginTop: 0 }}>
                            {member.name}
                          </h4>
                          <p className="member-desc" style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', margin: 0, lineHeight: '1.5' }}>
                            {member.desc}
                          </p>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {committeeTab === 'organizing' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                  {info.organizing_committee_desc && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="glass-card"
                      style={{ padding: '2rem', textAlign: 'center', maxWidth: '900px', margin: '0 auto 0.5rem', background: 'var(--glass-bg)', border: '1px solid var(--glass-border)' }}
                    >
                      <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'white', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem' }}>
                        Organizing Committee
                      </h3>
                      <p style={{ color: 'var(--text-secondary)', lineHeight: '1.7', fontSize: '0.95rem', margin: 0 }}>
                        {info.organizing_committee_desc}
                      </p>
                    </motion.div>
                  )}
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '100%' }}>
                    {/* Subcommittee Buttons in Two Rows */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', marginBottom: '2rem', width: '100%', alignItems: 'center' }}>
                      {/* Row 1 */}
                      <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', flexWrap: 'wrap', width: '100%' }}>
                        {[
                          { id: 'leadership', label: 'Leadership' },
                          { id: 'executive', label: 'Executive Committee' },
                          { id: 'finance', label: 'Finance' },
                          { id: 'publication', label: 'Publication' },
                          { id: 'arrangements', label: 'Arrangements' },
                          { id: 'registration', label: 'Registration' }
                        ].map((group) => (
                          <button
                            key={group.id}
                            type="button"
                            onClick={() => setActiveSubcommittee(group.id)}
                            className={`committee-tab-btn ${activeSubcommittee === group.id ? 'active' : 'inactive'}`}
                            style={{ fontSize: '0.85rem', padding: '0.5rem 1rem', textTransform: 'capitalize', minWidth: '120px' }}
                          >
                            {group.label}
                          </button>
                        ))}
                      </div>
                      
                      {/* Row 2 */}
                      <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', flexWrap: 'wrap', width: '100%' }}>
                        {[
                          { id: 'tutorials', label: 'Tutorials & Workshops' },
                          { id: 'review', label: 'Technical Review' },
                          { id: 'outreach', label: 'Outreach & Promotion' },
                          { id: 'website', label: 'Website & Media' },
                          { id: 'hospitality', label: 'Hospitality' },
                          { id: 'members', label: 'General Members' }
                        ].map((group) => (
                          <button
                            key={group.id}
                            type="button"
                            onClick={() => setActiveSubcommittee(group.id)}
                            className={`committee-tab-btn ${activeSubcommittee === group.id ? 'active' : 'inactive'}`}
                            style={{ fontSize: '0.85rem', padding: '0.5rem 1rem', textTransform: 'capitalize', minWidth: '120px' }}
                          >
                            {group.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Active Panel Members Grid */}
                    <div className="grid-3-col">
                    {committeeMembers
                      .filter((member) => {
                        if (member.category !== 'organizing') return false;
                        switch (activeSubcommittee) {
                          case 'leadership':
                            return member.role === 'Chief Patron' || member.role === 'Patron' || member.role === 'General Chair';
                          case 'executive':
                            return member.role === 'Conference Chair' || member.role === 'Conference Chair & Organizing Secretary' || member.role === 'Session Chair';
                          case 'finance':
                            return member.role === 'Program and Finance Chair' || member.role === 'Finance Committee Member' || member.role === 'Program and Finance Committee Member';
                          case 'publication':
                            return member.role === 'Publication Chair' || member.role === 'Publication Committee Member';
                          case 'arrangements':
                            return member.role === 'Local Arrangements Chair' || member.role === 'Local Arrangements Committee Member';
                          case 'registration':
                            return member.role === 'Registration Chair' || member.role === 'Registration Committee Member';
                          case 'tutorials':
                            return member.role === 'Conference Pre-Tutorial Sessions Chair' || member.role === 'Pre-Tutorial Sessions Committee Member';
                          case 'review':
                            return member.role === 'Technical Review Committee Convener' || member.role === 'Technical Review Committee Member';
                          case 'outreach':
                            return member.role === 'Outreach and Promotion Committee Convener' || member.role === 'Outreach and Promotion Committee Member';
                          case 'website':
                            return member.role === 'Website and Social Media Promotion Committee Chair' || member.role === 'Website and Social Media Promotion Committee Member';
                          case 'hospitality':
                            return member.role === 'Hospitality Committee Convener' || member.role === 'Hospitality Committee Member';
                          case 'members':
                            return member.role === 'Member' || !member.role;
                          default:
                            return false;
                        }
                      })
                      .map((member, mIdx) => {
                        const showAvatar = activeSubcommittee === 'leadership';
                        if (showAvatar) {
                          return (
                            <div key={mIdx} className="member-profile-card">
                              <div className="member-avatar-wrapper">
                                <img 
                                  src={member.image_url || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(member.name)}&backgroundColor=0f52ba,06b6d4,f58220`}
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(member.name)}&backgroundColor=0f52ba,06b6d4,f58220`;
                                  }}
                                  alt={member.name}
                                  className="member-avatar-img"
                                />
                              </div>
                              <span className="member-role-badge">
                                {member.role && member.role !== 'Member' ? member.role : 'Organizing Member'}
                              </span>
                              <h4 className="member-name">{member.name}</h4>
                              <p className="member-desc">{member.desc}</p>
                            </div>
                          );
                        } else {
                          return (
                            <div key={mIdx} className="member-profile-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '1.75rem 1.5rem', borderLeft: '4px solid #3b82f6', justifyContent: 'center' }}>
                              <span className="member-role-badge" style={{ marginBottom: '0.75rem', alignSelf: 'center' }}>
                                {member.role && member.role !== 'Member' ? member.role : 'Organizing Member'}
                              </span>
                              <h4 className="member-name" style={{ fontSize: '1.15rem', fontWeight: 700, color: 'white', marginBottom: '0.5rem', marginTop: 0 }}>{member.name}</h4>
                              <p className="member-desc" style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', margin: 0, lineHeight: '1.5' }}>{member.desc}</p>
                            </div>
                          );
                        }
                      })}
                  </div>
                </div>
              </div>
            )}

              {committeeTab === 'advisory' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                  {info.advisory_committee_desc && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="glass-card"
                      style={{ padding: '2rem', textAlign: 'center', maxWidth: '800px', margin: '0 auto 0.5rem', background: 'var(--glass-bg)', border: '1px solid var(--glass-border)' }}
                    >
                      <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'white', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem' }}>
                        Advisory Committee
                      </h3>
                      <p style={{ color: 'var(--text-secondary)', lineHeight: '1.7', fontSize: '0.95rem', margin: 0 }}>
                        {info.advisory_committee_desc}
                      </p>
                    </motion.div>
                  )}
                  
                  <div className="grid-3-col">
                    {committeeMembers.filter(m => m.category === 'advisory').map((adviser, index) => (
                      <div key={index} className="member-profile-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '1.75rem 1.5rem', borderLeft: '4px solid #3b82f6', justifyContent: 'center' }}>
                        <span className="member-role-badge" style={{ marginBottom: '0.75rem', alignSelf: 'center' }}>{adviser.role || 'Advisory Member'}</span>
                        <h4 className="member-name" style={{ fontSize: '1.15rem', fontWeight: 700, color: 'white', marginBottom: '0.5rem', marginTop: 0 }}>{adviser.name}</h4>
                        <p className="member-desc" style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', margin: 0, lineHeight: '1.5' }}>{adviser.desc}</p>
                      </div>
                    ))}
                  </div>
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
            {info.speakers_desc && (
              <p style={{ color: 'var(--text-secondary)', marginTop: '1.5rem', maxWidth: '800px', marginInline: 'auto', lineHeight: '1.7', fontSize: '0.95rem' }}>
                {info.speakers_desc}
              </p>
            )}
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
          <div style={{ marginTop: '3.5rem', display: 'flex', justifyContent: 'center', flexWrap: 'wrap' }}>
            <a 
              href="https://template-selector.ieee.org/" 
              className="btn btn-primary"
              target="_blank"
              rel="noopener noreferrer"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontSize: '1rem', padding: '0.8rem 2.2rem' }}
            >
              <Download size={18} />
              Download IEEE Paper Templates
            </a>
          </div>
        </div>
      </section>

      {/* Important Dates Section */}
      <section id="important-dates" className="section" style={{ background: '#ffffff', color: '#0f172a', padding: '6rem 0' }}>
        <div className="container">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            style={{ textAlign: 'center', marginBottom: '4rem' }}
          >
            <span style={{ color: '#3b82f6', fontWeight: 700, textTransform: 'uppercase', fontSize: '0.9rem', letterSpacing: '0.1em' }}>{info.dates_badge}</span>
            <h2 style={{ fontSize: '2.5rem', color: '#091d36', marginTop: '0.5rem' }}>{info.dates_title}</h2>
            <div style={{ height: '3px', width: '60px', background: '#3b82f6', margin: '1rem auto 0' }} />
          </motion.div>

          {/* Horizontal Winding Timeline Roadmap Infographic */}
          <div style={{ 
            position: 'relative', 
            width: '100%', 
            overflowX: 'hidden', 
            padding: '2rem 0', 
            margin: '1.5rem 0'
          }}>
            <div style={{ width: '100%', position: 'relative', height: '600px' }}>
              {(() => {
                const isPassedArray = importantDates.map(evt => {
                  try {
                    // Remove late additions or range indicator extensions to get a clean base date
                    const cleanDateStr = evt.event_date.replace(/-[0-9]+/g, '').trim(); 
                    const dateVal = new Date(cleanDateStr);
                    if (isNaN(dateVal.getTime())) return false;
                    return dateVal <= new Date();
                  } catch (e) {
                    return false;
                  }
                });
                const lastPassedIndex = isPassedArray.reduce((acc, passed, idx) => passed ? idx : acc, -1);

                return (
                  <>
                    {/* Background Winding SVG Road */}
                    <svg 
                      style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 1 }}
                      viewBox="0 0 1200 600"
                      preserveAspectRatio="none"
                    >
                      {/* Winding Asphalt Road (Dark Gray Base for Inactive) */}
                      <path
                        d={(() => {
                          const N = importantDates.length;
                          if (N <= 1) return "";
                          let p = "M 100 110"; 
                          for (let i = 0; i < N; i++) {
                            const x = (i / (N - 1)) * 1000 + 100;
                            const y = i % 2 === 0 ? 230 : 350; 
                            if (i === 0) {
                              p = `M ${x} ${y}`;
                            } else {
                              const prevX = ((i - 1) / (N - 1)) * 1000 + 100;
                              const prevY = (i - 1) % 2 === 0 ? 230 : 350;
                              const midX = (prevX + x) / 2;
                              p += ` C ${midX} ${prevY}, ${midX} ${y}, ${x} ${y}`;
                            }
                          }
                          return p;
                        })()}
                        stroke="#334155"
                        strokeWidth="32"
                        strokeLinecap="round"
                        fill="none"
                        style={{ filter: 'drop-shadow(0 6px 12px rgba(0,0,0,0.15))' }}
                      />

                      {/* Active Progress Highway Overlay (Emerald Green) */}
                      <path
                        d={(() => {
                          const N = importantDates.length;
                          if (N <= 1 || lastPassedIndex < 0) return "";
                          let p = "M 100 110"; 
                          for (let i = 0; i <= lastPassedIndex; i++) {
                            const x = (i / (N - 1)) * 1000 + 100;
                            const y = i % 2 === 0 ? 230 : 350; 
                            if (i === 0) {
                              p = `M ${x} ${y}`;
                            } else {
                              const prevX = ((i - 1) / (N - 1)) * 1000 + 100;
                              const prevY = (i - 1) % 2 === 0 ? 230 : 350;
                              const midX = (prevX + x) / 2;
                              p += ` C ${midX} ${prevY}, ${midX} ${y}, ${x} ${y}`;
                            }
                          }
                          return p;
                        })()}
                        stroke="#10b981"
                        strokeWidth="32"
                        strokeLinecap="round"
                        fill="none"
                        style={{ filter: 'drop-shadow(0 0 10px rgba(16, 185, 129, 0.85))' }}
                      />
                      
                      {/* Road center dash markings - Inactive (White with opacity) */}
                      <path
                        d={(() => {
                          const N = importantDates.length;
                          if (N <= 1) return "";
                          let p = "M 100 110";
                          for (let i = 0; i < N; i++) {
                            const x = (i / (N - 1)) * 1000 + 100;
                            const y = i % 2 === 0 ? 230 : 350;
                            if (i === 0) {
                              p = `M ${x} ${y}`;
                            } else {
                              const prevX = ((i - 1) / (N - 1)) * 1000 + 100;
                              const prevY = (i - 1) % 2 === 0 ? 230 : 350;
                              const midX = (prevX + x) / 2;
                              p += ` C ${midX} ${prevY}, ${midX} ${y}, ${x} ${y}`;
                            }
                          }
                          return p;
                        })()}
                        stroke="rgba(255, 255, 255, 0.4)"
                        strokeWidth="2.5"
                        strokeDasharray="8,8"
                        strokeLinecap="round"
                        fill="none"
                      />

                      {/* Road center dash markings - Active (Solid White) */}
                      <path
                        d={(() => {
                          const N = importantDates.length;
                          if (N <= 1 || lastPassedIndex < 0) return "";
                          let p = "M 100 110";
                          for (let i = 0; i <= lastPassedIndex; i++) {
                            const x = (i / (N - 1)) * 1000 + 100;
                            const y = i % 2 === 0 ? 230 : 350;
                            if (i === 0) {
                              p = `M ${x} ${y}`;
                            } else {
                              const prevX = ((i - 1) / (N - 1)) * 1000 + 100;
                              const prevY = (i - 1) % 2 === 0 ? 230 : 350;
                              const midX = (prevX + x) / 2;
                              p += ` C ${midX} ${prevY}, ${midX} ${y}, ${x} ${y}`;
                            }
                          }
                          return p;
                        })()}
                        stroke="#ffffff"
                        strokeWidth="2.5"
                        strokeDasharray="8,8"
                        strokeLinecap="round"
                        fill="none"
                        style={{ filter: 'drop-shadow(0 0 5px rgba(255, 255, 255, 0.95))' }}
                      />
                    </svg>

                    {/* Timeline Nodes & Alternating Cards */}
                    {importantDates.map((evt, idx) => {
                      const { month, day, year } = parseDateDisplay(evt.event_date);
                      const isEven = idx % 2 === 0;
                      const isPassed = isPassedArray[idx];
                      
                      const xPercent = (idx / (importantDates.length - 1)) * 83.33 + 8.33; 
                      const yPos = isEven ? 230 : 350; 

                      const nodeColors = [
                        '#0ea5e9', // Sky Blue
                        '#ec4899', // Pink/Rose
                        '#8b5cf6', // Purple
                        '#0d9488', // Teal
                        '#f59e0b', // Amber/Orange
                        '#3b82f6', // Royal Blue
                        '#ef4444'  // Red
                      ];
                      const activeColor = isPassed ? '#10b981' : nodeColors[idx % nodeColors.length];

                      return (
                        <div
                          key={idx}
                          style={{
                            position: 'absolute',
                            left: `${xPercent}%`,
                            top: `${yPos}px`,
                            transform: 'translate(-50%, -50%)',
                            zIndex: 10,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center'
                          }}
                        >
                          {/* Circle Pin Node on the Highway curve (vibrant colored circles) */}
                          <motion.div
                            whileHover={{ scale: 1.2 }}
                            style={{
                              width: '38px',
                              height: '38px',
                              borderRadius: '50%',
                              background: activeColor,
                              border: '3px solid #ffffff',
                              boxShadow: isPassed 
                                ? '0 0 15px rgba(16, 185, 129, 0.8), 0 4px 10px rgba(0,0,0,0.25)' 
                                : '0 4px 10px rgba(0,0,0,0.25)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: '#ffffff',
                              fontWeight: 800,
                              fontSize: '0.95rem',
                              cursor: 'pointer',
                              zIndex: 11
                            }}
                            title={`${evt.title} - ${evt.event_date}`}
                          >
                            {idx + 1}
                          </motion.div>

                          {/* Vertical Connector line to its detail card */}
                          <div style={{
                            position: 'absolute',
                            left: '50%',
                            top: isEven ? '20px' : '-62px',
                            width: '2.5px',
                            height: '62px',
                            background: `linear-gradient(${isEven ? 'to bottom' : 'to top'}, ${activeColor}, rgba(255, 255, 255, 0.05))`,
                            transform: 'translateX(-50%)',
                            zIndex: 2
                          }} />

                          {/* Milestone Card above or below the road */}
                          <div style={{
                            position: 'absolute',
                            left: '50%',
                            transform: 'translateX(-50%)',
                            [isEven ? 'bottom' : 'top']: '76px', 
                            width: '210px',
                            background: 'rgba(255, 255, 255, 0.98)',
                            backdropFilter: 'blur(12px)',
                            border: `2px solid ${activeColor}`,
                            borderRadius: '0.88rem',
                            padding: '0.9rem',
                            boxShadow: '0 10px 25px rgba(0,0,0,0.06)',
                            textAlign: 'center'
                          }}>
                            {/* Calendar mini badge */}
                            <span style={{
                              fontSize: '0.7rem',
                              fontWeight: 800,
                              color: '#ffffff',
                              background: activeColor,
                              padding: '0.25rem 0.65rem',
                              borderRadius: '1rem',
                              display: 'inline-block',
                              marginBottom: '0.45rem',
                              textTransform: 'uppercase',
                              letterSpacing: '0.05em'
                            }}>
                              {month} {day}, {year}
                            </span>
                            
                            <h4 style={{
                              fontSize: '0.92rem',
                              fontWeight: 800,
                              color: '#0f172a',
                              margin: '0 0 0.3rem',
                              lineHeight: 1.3
                            }}>
                              {evt.title}
                            </h4>
                            
                            <p style={{
                              fontSize: '0.75rem',
                              color: '#64748b',
                              lineHeight: 1.45,
                              margin: 0
                            }}>
                              {evt.desc}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </>
                );
              })()}

            </div>
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
      <section id="guidelines" className="section" style={{ paddingBottom: '2rem' }}>
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

          {/* 2. Instructions and CMT Procedures */}
          <div className="grid-2-col" style={{ gap: '2rem' }}>
            {/* Left Card: General Instructions */}
            <div className="glass-card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <h3 style={{ fontSize: '1.35rem', color: 'white', borderBottom: '1px solid var(--glass-border)', paddingBottom: '0.75rem', fontWeight: 700 }}>
                Instructions for Authors
              </h3>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.95rem', color: 'var(--text-secondary)', padding: 0, margin: 0 }}>
                {[
                  "The maximum length of the paper for review is 6 pages, including figures, tables, and references. The maximum file size allowed is 10 MB in PDF format without encryption and/or passwords.",
                  "Papers of poor quality and/or high similarity index will be rejected during the initial screening process without review.",
                  "Use only the IEEE standard two-column conference paper Microsoft Word template.",
                  "The paper will be peer-reviewed by domain experts of the respective tracks.",
                  "Authors should submit the papers through Microsoft Conference Management Toolkit (CMT).",
                  "Kindly do not submit the paper multiple times, as it may lead to the cancellation of your paper."
                ].map((inst, idx) => (
                  <li key={idx} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start', lineHeight: '1.6' }}>
                    <span style={{ color: '#3b82f6', fontWeight: 'bold', fontSize: '1.1rem', marginTop: '-2px' }}>•</span>
                    <span>{inst}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Right Card: CMT Procedure Toggler */}
            <div className="glass-card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div style={{ display: 'flex', borderBottom: '1px solid var(--glass-border)', paddingBottom: '0.5rem', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                <h3 style={{ fontSize: '1.35rem', color: 'white', fontWeight: 700, margin: 0 }}>
                  CMT Submission Portal
                </h3>
                <div style={{ display: 'inline-flex', background: 'rgba(255,255,255,0.06)', borderRadius: '1.5rem', padding: '0.25rem' }}>
                  <button 
                    onClick={() => setSubmissionTab('initial')}
                    className={`committee-tab-btn ${submissionTab === 'initial' ? 'active' : 'inactive'}`}
                    style={{ padding: '0.4rem 1.2rem', fontSize: '0.8rem', borderRadius: '1.5rem' }}
                  >
                    Initial Submission
                  </button>
                  <button 
                    onClick={() => setSubmissionTab('camera-ready')}
                    className={`committee-tab-btn ${submissionTab === 'camera-ready' ? 'active' : 'inactive'}`}
                    style={{ padding: '0.4rem 1.2rem', fontSize: '0.8rem', borderRadius: '1.5rem' }}
                  >
                    Camera-Ready
                  </button>
                </div>
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={submissionTab}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  {submissionTab === 'initial' ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      <span style={{ fontSize: '0.85rem', color: '#d97706', fontWeight: 700 }}>
                        Procedure for Uploading Papers:
                      </span>
                      <ol style={{ paddingLeft: '1.2rem', margin: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                        <li>
                          Go to paper submission website: <a href="https://cmt3.research.microsoft.com/aectsd2025" target="_blank" rel="noopener noreferrer" style={{ color: '#3b82f6', textDecoration: 'underline' }}>https://cmt3.research.microsoft.com/aectsd2025</a>.
                        </li>
                        <li>If you are new to the system, please choose "Register" at the bottom of the dialog box. Create a new account with a user ID and Password.</li>
                        <li>Log in to CMT with your user ID and Password.</li>
                        <li>Select "All Conferences" and choose the conference.</li>
                        <li>Click the Conference Name link.</li>
                        <li>On the Author Console page, click <strong>+ Create new submission</strong>.</li>
                        <li>Fill out the required fields, including the title, abstract, authors, subject areas, and email IDs of all the co-authors.</li>
                        <li>Upload your paper and other files (if needed).</li>
                        <li>Click “Submit” to submit your paper.</li>
                      </ol>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      <span style={{ fontSize: '0.85rem', color: '#d97706', fontWeight: 700 }}>
                        Submitting Camera-Ready Version:
                      </span>
                      <ol style={{ paddingLeft: '1.2rem', margin: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                        <li>Go to the Author Console in CMT.</li>
                        <li>Click the <strong>Create Camera Ready Submission</strong> link.</li>
                        <li>Edit the title, abstract, and author information.</li>
                        <li>Upload the camera-ready file.</li>
                        <li>Answer any additional questions.</li>
                        <li>Click “Submit” to submit your paper.</li>
                      </ol>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </section>

      {/* Paper Submission Section */}
      <section id="paper-submission" className="section" style={{ paddingTop: '2rem' }}>
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

          <div className="glass-card" style={{ maxWidth: '750px', margin: '0 auto', padding: '2.5rem 2rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.25rem' }}>
            <div style={{ display: 'inline-flex', background: 'rgba(59, 130, 246, 0.1)', padding: '0.85rem', borderRadius: '50%', color: '#3b82f6' }}>
              <Layers size={32} />
            </div>
            
            <h3 style={{ fontSize: '1.6rem', color: 'white', margin: 0, fontWeight: 700 }}>
              {info.submission_card_title || 'Submit Your Application through CMT'}
            </h3>
            <p style={{ color: 'var(--text-secondary)', margin: 0, maxWidth: '600px', fontSize: '0.95rem', lineHeight: '1.5' }}>
              {info.submission_card_desc || 'Submit your research papers directly via the Microsoft CMT portal. Make sure to adhere to all formatting guidelines before uploading your work.'}
            </p>
 
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', color: '#94a3b8' }}>
              <Terminal size={14} />
              <span>{info.label_conf_id || 'Conference CMT Portal ID:'} <strong>{info.cmt_id || 'AECTSD2027'}</strong></span>
            </div>
 
            <a 
              href={info.cmt_link || 'https://cmt3.research.microsoft.com/aectsd2025'} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="btn btn-primary"
              style={{ fontSize: '1rem', padding: '0.8rem 2.2rem', marginTop: '0.5rem' }}
            >
              {info.submission_btn_cmt || 'Go to CMT Submission Portal'}
              <ExternalLink size={16} />
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
            style={{ textAlign: 'center', marginBottom: '3.5rem' }}
          >
            <span style={{ color: '#3b82f6', fontWeight: 700, textTransform: 'uppercase', fontSize: '0.9rem', letterSpacing: '0.1em' }}>{info.reg_badge}</span>
            <h2 style={{ fontSize: '2.5rem', color: 'white', marginTop: '0.5rem' }}>{info.reg_title}</h2>
            <div style={{ height: '3px', width: '60px', background: '#3b82f6', margin: '1rem auto 0' }} />
          </motion.div>

          {/* General Guidelines Card */}
          <div className="glass-card" style={{ padding: '2rem', marginBottom: '3.5rem' }}>
            <h3 style={{ fontSize: '1.4rem', color: 'white', marginBottom: '1.25rem', fontWeight: 700 }}>Registration Guidelines</h3>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: '1.7', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <p style={{ margin: 0 }}>
                <strong>At least one of the authors</strong> of each accepted paper must register for the conference for the paper to be included in the conference proceedings and published through <strong>IEEE Xplore (Scopus Indexed)</strong>.
              </p>
              <p style={{ margin: 0 }}>
                All accepted and presented papers of AECTSD 2027 will be submitted for possible publication in the <strong>IEEE Xplore® Digital Library</strong>.
              </p>
              <p style={{ margin: 0 }}>
                Full registration includes the registration of one paper. Additional papers for a single registration come with an additional fee. The maximum length of the paper is <strong>6 pages</strong> including figures, tables, and references.
              </p>
              <p style={{ margin: 0 }}>
                Registration fee covers admission to all sessions, cost of publishing the article in IEEE Xplore digital library, conference proceedings, welcome reception, conference kit, refreshments, working lunch, banquet dinner and half-a-day tour to nearby places.
              </p>
              <p style={{ margin: 0, color: '#d97706', fontWeight: 600 }}>
                * A fee of Rs. 500 will be applied for each additional page (with a maximum of 2 pages).
              </p>
            </div>
          </div>

          {/* Registration Tables Side-by-Side */}
          <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', marginBottom: '3.5rem' }}>
            
            {/* Indian Authors Table */}
            <div style={{ flex: '1 1 500px', minWidth: '0' }}>
              <h3 style={{ fontSize: '1.35rem', color: 'white', marginBottom: '1.25rem', fontWeight: 700 }}>
                Indian Authors (Fees in INR, GST Inclusive)
              </h3>
              <div className="registration-table-container" style={{ width: '100%', overflowX: 'auto' }}>
                <table className="registration-table">
                  <thead>
                    <tr>
                      <th rowSpan={2} style={{ width: '30%', verticalAlign: 'middle', textAlign: 'left' }}>Categories</th>
                      <th colSpan={2}>Graduate Student / Research Scholar</th>
                      <th colSpan={2}>Professionals</th>
                    </tr>
                    <tr>
                      <th>IEEE Member</th>
                      <th>Non-IEEE Member</th>
                      <th>IEEE Member</th>
                      <th>Non-IEEE Member</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td style={{ fontWeight: 600, textAlign: 'left' }}>Conference only</td>
                      <td>₹6,000*</td>
                      <td>₹7,000*</td>
                      <td>₹7,000*</td>
                      <td>₹8,000*</td>
                    </tr>
                    <tr>
                      <td style={{ fontWeight: 600, textAlign: 'left' }}>Tutorial only</td>
                      <td>₹1,000</td>
                      <td>₹1,250</td>
                      <td>₹1,250</td>
                      <td>₹1,500</td>
                    </tr>
                    <tr>
                      <td style={{ fontWeight: 600, textAlign: 'left' }}>Conference plus Tutorial</td>
                      <td>₹6,500*</td>
                      <td>₹7,500*</td>
                      <td>₹7,500*</td>
                      <td>₹8,500*</td>
                    </tr>
                    <tr>
                      <td style={{ fontWeight: 600, textAlign: 'left' }}>Indian Non-Author Attendee</td>
                      <td>₹3,500</td>
                      <td>₹5,000</td>
                      <td>₹4,500</td>
                      <td>₹6,000</td>
                    </tr>
                    <tr>
                      <td style={{ fontWeight: 600, textAlign: 'left' }}>Rate per Additional Paper</td>
                      <td>₹3,000</td>
                      <td>₹3,000</td>
                      <td>₹3,000</td>
                      <td>₹3,000</td>
                    </tr>
                    <tr>
                      <td style={{ fontWeight: 600, textAlign: 'left' }}>Extra Page (after 6 pages)</td>
                      <td>₹500</td>
                      <td>₹500</td>
                      <td>₹500</td>
                      <td>₹500</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Foreign Authors Table */}
            <div style={{ flex: '1 1 500px', minWidth: '0' }}>
              <h3 style={{ fontSize: '1.35rem', color: 'white', marginBottom: '1.25rem', fontWeight: 700 }}>
                Foreign Authors (Fees in USD, GST Inclusive)
              </h3>
              <div className="registration-table-container" style={{ width: '100%', overflowX: 'auto' }}>
                <table className="registration-table">
                  <thead>
                    <tr>
                      <th rowSpan={2} style={{ width: '30%', verticalAlign: 'middle', textAlign: 'left' }}>Categories</th>
                      <th colSpan={2}>Graduate Student / Research Scholar</th>
                      <th colSpan={2}>Professionals</th>
                    </tr>
                    <tr>
                      <th>IEEE Member</th>
                      <th>Non-IEEE Member</th>
                      <th>IEEE Member</th>
                      <th>Non-IEEE Member</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td style={{ fontWeight: 600, textAlign: 'left' }}>Conference only</td>
                      <td>$150*</td>
                      <td>$200*</td>
                      <td>$200*</td>
                      <td>$250*</td>
                    </tr>
                    <tr>
                      <td style={{ fontWeight: 600, textAlign: 'left' }}>Tutorial only</td>
                      <td>$40</td>
                      <td>$50</td>
                      <td>$50</td>
                      <td>$75</td>
                    </tr>
                    <tr>
                      <td style={{ fontWeight: 600, textAlign: 'left' }}>Conference plus Tutorial</td>
                      <td>$175*</td>
                      <td>$225*</td>
                      <td>$225*</td>
                      <td>$300*</td>
                    </tr>
                    <tr>
                      <td style={{ fontWeight: 600, textAlign: 'left' }}>Rate per Additional Paper</td>
                      <td>$50</td>
                      <td>$50</td>
                      <td>$50</td>
                      <td>$50</td>
                    </tr>
                    <tr>
                      <td style={{ fontWeight: 600, textAlign: 'left' }}>Extra Page (after 6 pages)</td>
                      <td>$20</td>
                      <td>$20</td>
                      <td>$20</td>
                      <td>$20</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

          </div>

          {/* Bank Account Details */}
          <div className="glass-card" style={{ padding: '2rem', marginBottom: '3.5rem', background: '#f8fafc', border: '1px solid #e2e8f0', color: '#0f172a' }}>
            <h3 style={{ fontSize: '1.4rem', color: '#091d36', marginBottom: '0.5rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ color: '#0f52ba', fontSize: '1.5rem', fontWeight: 900 }}>$</span> Bank Account Details
            </h3>
            <p style={{ color: '#475569', fontSize: '0.95rem', marginBottom: '2rem', lineHeight: '1.5' }}>
              Please find the official banking channels to process registration fees. Bank transfer references must include your Paper ID.
            </p>

            <div className="grid-2-col" style={{ gap: '2.5rem', alignItems: 'stretch' }}>
              {/* Left Column: Bank Parameters Table */}
              <div style={{ display: 'flex', flexDirection: 'column', width: '100%', justifyContent: 'center' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {[
                    { label: 'Account Name', value: 'Sri Ramakrishna Engineering College - AECTSD' },
                    { label: 'Bank Name', value: 'ICICI Bank, Coimbatore' },
                    { label: 'Account Number', value: '058705008310' },
                    { label: 'IFSC Code', value: 'ICIC0000587' },
                    { label: 'Branch Location', value: 'SREC Campus Branch, Coimbatore' }
                  ].map((row, rIdx) => (
                    <div 
                      key={rIdx} 
                      style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center', 
                        paddingBottom: '0.75rem', 
                        borderBottom: rIdx < 4 ? '1px solid #e2e8f0' : 'none',
                        gap: '1rem'
                      }}
                    >
                      <span style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.95rem', flexShrink: 0 }}>{row.label}</span>
                      <span style={{ color: '#1e293b', fontSize: '0.95rem', fontWeight: 500, textAlign: 'right' }}>{row.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Column: Important Payment Note Card */}
              <div 
                style={{ 
                  background: '#fffbeb', 
                  border: '1px solid #fef3c7', 
                  borderRadius: '1rem', 
                  padding: '1.75rem', 
                  display: 'flex', 
                  flexDirection: 'column', 
                  gap: '0.75rem' 
                }}
              >
                <h4 style={{ fontSize: '0.95rem', color: '#b45309', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>
                  IMPORTANT PAYMENT NOTE
                </h4>
                <p style={{ color: '#78350f', fontSize: '0.92rem', lineHeight: '1.6', margin: 0, fontWeight: 500 }}>
                  Please include your Paper ID in the payment reference. Once the wire transfer transaction completes successfully, authors are requested to upload the scanned payment receipt copy in the registration form below.
                </p>
              </div>
            </div>
          </div>

          {/* Modifiers Box & Calculator Callout */}
          <div className="grid-2-col" style={{ gap: '2rem', alignItems: 'stretch', marginBottom: '3rem' }}>
            {/* Notes box */}
            <div className="glass-card" style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1rem', borderLeft: '4px solid #f58220' }}>
              <h4 style={{ fontSize: '1.1rem', color: 'white', fontWeight: 700, margin: 0 }}>Fee Modifiers & Addons</h4>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: '0.88rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <li>
                  <strong style={{ color: '#f58220' }}>* Early Bird Registration:</strong>
                  <ul style={{ paddingLeft: '1.2rem', marginTop: '0.25rem' }}>
                    <li>Discount of <strong>INR 1,000</strong> on Indian conference & conference plus tutorial registration fees.</li>
                    <li>Discount of <strong>INR 500</strong> on the Indian non-author attendee fee.</li>
                    <li>Discount of <strong>USD 25</strong> on Foreign conference & conference plus tutorial registration fees.</li>
                  </ul>
                </li>
                <li>
                  <strong style={{ color: 'white' }}>* Late Registration Fee:</strong> Additional surcharge fee of <strong>INR 1,000 / USD 25</strong> applies on conference and conference plus tutorial registration fees.
                </li>
                <li>
                  <strong style={{ color: 'white' }}>* Virtual Mode Presentation:</strong> Additional addon charge of <strong>INR 1,000 / USD 25</strong> applies on the conference registration fee.
                </li>
              </ul>
            </div>

            {/* Interactive portal callout */}
            <div className="glass-card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
              <div style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', padding: '1rem', borderRadius: '50%', marginBottom: '1.25rem' }}>
                <CheckCircle size={32} />
              </div>
              <h4 style={{ fontSize: '1.25rem', color: 'white', fontWeight: 700, marginBottom: '0.5rem' }}>Dynamic Fee Calculator</h4>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1.5rem', maxWidth: '350px' }}>
                Instantly calculate your total registration fees including extra pages and optional pre-conference tutorial addons.
              </p>
              <button 
                className="btn btn-primary" 
                style={{ padding: '0.75rem 2.5rem', fontSize: '1rem' }}
                onClick={() => setShowCalcModal(true)}
              >
                Launch Fee Calculator
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
            <span style={{ color: '#3b82f6', fontWeight: 700, textTransform: 'uppercase', fontSize: '0.9rem', letterSpacing: '0.1em' }}>{info.contact_badge || 'Connect'}</span>
            <h2 style={{ fontSize: '2.5rem', color: 'white', marginTop: '0.5rem' }}>{info.contact_title || 'Contact Us'}</h2>
            <div style={{ height: '3px', width: '60px', background: '#3b82f6', margin: '1rem auto 0' }} />
          </motion.div>

          <div className="grid-2-col" style={{ gap: '2rem' }}>
            {/* Contact Form */}
            <div className="glass-card">
              <h3 style={{ fontSize: '1.5rem', color: 'white', marginBottom: '1.5rem' }}>{info.contact_form_title || 'Send Us a Message'}</h3>
              
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
                  <h4 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>{info.contact_form_success_title || 'Message Sent!'}</h4>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{info.contact_form_success_desc || 'Thank you for reaching out. We will get back to you shortly.'}</p>
                </div>
              ) : (
                <form onSubmit={handleContactSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div>
                    <label style={{ fontSize: '0.85rem', color: '#cbd5e1', fontWeight: 600, display: 'block', marginBottom: '0.5rem' }}>{info.contact_form_label_name || 'Your Name'}</label>
                    <input 
                      type="text" 
                      required 
                      className="form-input" 
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder={info.contact_form_placeholder_name || 'Enter full name'} 
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.85rem', color: '#cbd5e1', fontWeight: 600, display: 'block', marginBottom: '0.5rem' }}>{info.contact_form_label_email || 'Email Address'}</label>
                    <input 
                      type="email" 
                      required 
                      className="form-input" 
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder={info.contact_form_placeholder_email || 'Enter email address'} 
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.85rem', color: '#cbd5e1', fontWeight: 600, display: 'block', marginBottom: '0.5rem' }}>{info.contact_form_label_subject || 'Subject'}</label>
                    <input 
                      type="text" 
                      required 
                      className="form-input" 
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      placeholder={info.contact_form_placeholder_subject || 'How can we help?'} 
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.85rem', color: '#cbd5e1', fontWeight: 600, display: 'block', marginBottom: '0.5rem' }}>{info.contact_form_label_message || 'Message'}</label>
                    <textarea 
                      rows={4} 
                      required 
                      className="form-input" 
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder={info.contact_form_placeholder_message || 'Type details here...'} 
                    />
                  </div>

                  <button type="submit" className="btn btn-primary" style={{ alignSelf: 'flex-start', marginTop: '0.5rem' }}>
                    {info.contact_form_btn_send || 'Send Message'}
                  </button>
                </form>
              )}
            </div>

            {/* Address & Coordinators */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div className="glass-card">
                <h3 style={{ fontSize: '1.35rem', color: 'white', marginBottom: '12.25px' }}>{info.contact_sec_title || 'Organizing Secretariat'}</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                  <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <MapPin size={20} className="text-blue-400" style={{ flexShrink: 0 }} />
                    <span style={{ whiteSpace: 'pre-line' }}>
                      {info.secretariat_address || 'Department of EEE / ECE,\nSri Ramakrishna Engineering College,\nVattamalaipalayam, N.G.G.O Colony Post,\nCoimbatore, Tamilnadu - 641022, India.'}
                    </span>
                  </div>
                  
                  <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                    <Mail size={18} className="text-blue-400" />
                    <a href={`mailto:${info.secretariat_email || 'aectsd2027@srec.ac.in'}`} style={{ color: '#60a5fa', textDecoration: 'none' }}>{info.secretariat_email || 'aectsd2027@srec.ac.in'}</a>
                  </div>

                  <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                    <Phone size={18} className="text-blue-400" />
                    <span>{info.secretariat_phone || '+91 (422) 2461588 / 2460088'}</span>
                  </div>
                </div>
              </div>

              {/* Coordinators */}
              <div className="glass-card">
                <h3 style={{ fontSize: '1.35rem', color: 'white', marginBottom: '1.25rem' }}>{info.contact_coord_title || 'Conference Coordinators'}</h3>
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
      <section id="location" className="section" style={{ background: '#ffffff' }}>
        <div className="container">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            style={{ textAlign: 'center', marginBottom: '3.5rem' }}
          >
            <span style={{ color: '#3b82f6', fontWeight: 700, textTransform: 'uppercase', fontSize: '0.9rem', letterSpacing: '0.1em' }}>Venue</span>
            <h2 style={{ fontSize: '2.5rem', color: '#091d36', marginTop: '0.5rem' }}>Conference Venue & Reach</h2>
            <div style={{ height: '3px', width: '60px', background: '#3b82f6', margin: '1rem auto 0' }} />
          </motion.div>

          {/* Venue Description Card */}
          <div className="glass-card" style={{ padding: '2rem', marginBottom: '3rem', background: '#f8fafc', border: '1px solid #e2e8f0' }}>
            <h3 style={{ fontSize: '1.4rem', color: '#091d36', marginBottom: '1rem', fontWeight: 700 }}>Sri Ramakrishna Engineering College (SREC)</h3>
            <p style={{ color: '#475569', fontSize: '0.95rem', lineHeight: '1.7', margin: '0 0 1.25rem' }}>
              Sri Ramakrishna Engineering College (SREC), located in Coimbatore, was established in 1994 and is managed by the SNR Sons Charitable Trust. The college offers undergraduate and postgraduate programs in engineering and technology. SREC is known for its strong academic curriculum, research initiatives, and modern facilities, fostering a practical learning environment. The college also emphasizes extracurricular activities and industry collaborations, aiming to produce skilled professionals.
            </p>
            <a 
              href="https://srec.ac.in" 
              target="_blank" 
              rel="noopener noreferrer" 
              style={{ color: '#0f52ba', fontWeight: 700, fontSize: '0.95rem', textDecoration: 'underline', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
            >
              Visit SREC Official Website <ExternalLink size={14} />
            </a>
          </div>

          <div className="grid-2-col" style={{ gap: '2rem', marginBottom: '3.5rem', alignItems: 'stretch' }}>
            {/* Left: How to Reach & Mini Map */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              {/* College Mini Map */}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="map-container"
                style={{ height: '320px', overflow: 'hidden', borderRadius: '1rem' }}
              >
                <iframe 
                  title="SREC Campus Map"
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3915.150328964016!2d76.9632117754871!3d11.102171853099849!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3ba8f7000afa766b%3A0x2b5757b8d520a3af!2sSri%20Ramakrishna%20Engineering%20College!5e0!3m2!1sen!2sin!4v1780992469751!5m2!1sen!2sin"
                  allowFullScreen={true}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  style={{ width: '100%', height: '100%', border: 0 }}
                />
              </motion.div>
            </div>

            {/* Right: How to Reach details */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="glass-card"
              style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', background: '#f8fafc', border: '1px solid #e2e8f0' }}
            >
              <h3 style={{ fontSize: '1.4rem', color: '#091d36', marginBottom: '1.25rem', fontWeight: 700 }}>How to Reach</h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', gap: '0.85rem', alignItems: 'flex-start' }}>
                  <div style={{ background: 'rgba(59, 130, 246, 0.08)', padding: '0.5rem', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3b82f6', flexShrink: 0 }}>
                    <MapPin size={20} />
                  </div>
                  <div>
                    <h4 style={{ fontSize: '0.95rem', fontWeight: 700, margin: '0 0 0.15rem', color: '#091d36' }}>Coimbatore International Airport</h4>
                    <span style={{ fontSize: '0.88rem', color: '#475569' }}>Distance: ~20 km | Approx. 40 minutes travel time</span>
                  </div>
                </div>
                
                <div style={{ display: 'flex', gap: '0.85rem', alignItems: 'flex-start' }}>
                  <div style={{ background: 'rgba(59, 130, 246, 0.08)', padding: '0.5rem', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3b82f6', flexShrink: 0 }}>
                    <MapPin size={20} />
                  </div>
                  <div>
                    <h4 style={{ fontSize: '0.95rem', fontWeight: 700, margin: '0 0 0.15rem', color: '#091d36' }}>Coimbatore Junction Railway Station</h4>
                    <span style={{ fontSize: '0.88rem', color: '#475569' }}>Distance: ~15 km | Approx. 30 minutes travel time</span>
                  </div>
                </div>
              </div>

              <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', padding: '1rem', borderRadius: '0.5rem', fontSize: '0.88rem', color: '#1e3a8a', lineHeight: '1.5' }}>
                <p style={{ margin: '0 0 0.5rem' }}>
                  💡 <strong>Cab Hire Note:</strong> Candidates can hire a car (Red Taxi, Go Taxi, or OLA) directly from Coimbatore Airport or Railway Station to reach SREC.
                </p>
                <p style={{ margin: 0 }}>
                  🚗 <strong>Auto-Rickshaw Note:</strong> Candidates can also hire an auto-rickshaw from <strong>Thudiyalur</strong> (nearest town, ~4 km away) to reach SREC.
                </p>
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
          </motion.div>
        )}
      </AnimatePresence>


      {/* Footer */}
      <Footer 
        srecUrl={info.srec_url} 
        copyright={info.footer_copyright} 
        sponsor={info.footer_sponsor} 
      />


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

              {/* Action Buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
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
              backgroundColor: 'rgba(15, 23, 42, 0.45)',
              backdropFilter: 'blur(12px)',
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
                background: '#ffffff',
                border: '1px solid #cbd5e1',
                borderRadius: '1.25rem',
                padding: '2.5rem 2rem',
                maxWidth: '950px',
                width: '100%',
                maxHeight: '90vh',
                overflowY: 'auto',
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                position: 'relative',
                backdropFilter: 'blur(20px)',
                color: 'var(--text-primary)'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                onClick={() => setShowCalcModal(false)}
                style={{
                  position: 'absolute',
                  top: '1.25rem',
                  right: '1.25rem',
                  background: '#f1f5f9',
                  border: '1px solid #cbd5e1',
                  borderRadius: '50%',
                  width: '36px',
                  height: '36px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: 'var(--text-primary)',
                  transition: 'all 0.2s ease'
                }}
              >
                <X size={20} />
              </button>

              {/* Title */}
              <div style={{ textAlign: 'center', borderBottom: '1px solid #cbd5e1', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--gold)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Registration Portal</span>
                <h3 style={{ fontSize: '1.85rem', color: 'var(--primary)', marginTop: '0.25rem', fontWeight: 800 }}>Payment Instructions & Fee Calculator</h3>
              </div>

              {/* Grid content inside modal */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                
                {/* 1. Calculator & Form Grid */}
                <div className="grid-2-col" style={{ gap: '2rem', alignItems: 'start' }}>
                  
                  {/* Left Column: Selections */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    <h4 style={{ fontSize: '1.15rem', color: 'var(--text-primary)', borderBottom: '1px solid #cbd5e1', paddingBottom: '0.5rem', fontWeight: 700 }}>1. Calculate Fee</h4>
                    
                    {/* Indian vs International */}
                    <div>
                      <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 700, display: 'block', marginBottom: '0.35rem' }}>Are you Indian or International?*</label>
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
                      <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 700, display: 'block', marginBottom: '0.35rem' }}>Are you a student or a professional?*</label>
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
                      <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 700, display: 'block', marginBottom: '0.35rem' }}>Are you an IEEE member?*</label>
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
                      <label htmlFor="modal-reg-option" style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 700, display: 'block', marginBottom: '0.35rem' }}>Select Registration Option*</label>
                      <select 
                        id="modal-reg-option"
                        value={regOption} 
                        onChange={(e) => setRegOption(e.target.value as 'conference' | 'tutorial' | 'both' | 'listener')}
                        className="form-input"
                        style={{ background: '#ffffff', color: 'var(--text-primary)', border: '1px solid #cbd5e1', padding: '0.5rem 0.75rem', fontSize: '0.85rem' }}
                      >
                        <option value="conference" style={{ background: '#ffffff', color: '#0f172a' }}>Conference Only</option>
                        <option value="tutorial" style={{ background: '#ffffff', color: '#0f172a' }}>Tutorial Only</option>
                        <option value="both" style={{ background: '#ffffff', color: '#0f172a' }}>Conference + Tutorial</option>
                        {isIndian && <option value="listener" style={{ background: '#ffffff', color: '#0f172a' }}>Indian Non-Author Attendee (Listener)</option>}
                      </select>
                    </div>

                    {/* Number of Pages */}
                    {regOption !== 'listener' && (
                      <div>
                        <label htmlFor="modal-page-count" style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 700, display: 'block', marginBottom: '0.35rem' }}>Number of Pages (Limit 1-12. Base covers 6 pages)*</label>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <input 
                            id="modal-page-count"
                            type="number" 
                            min="1" 
                            max="12" 
                            value={pageCount} 
                            onChange={(e) => setPageCount(Math.max(1, Math.min(12, Number(e.target.value))))}
                            className="form-input"
                            style={{ maxWidth: '80px', padding: '0.5rem', fontSize: '0.85rem', background: '#ffffff', color: 'var(--text-primary)', border: '1px solid #cbd5e1' }}
                          />
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                            {pageCount > 6 ? `+${pageCount - 6} Extra Page(s)` : 'Standard length'}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Modifiers */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.25rem' }}>
                      <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 700 }}>Additional Settings</label>
                      
                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                        <input 
                          type="checkbox" 
                          checked={isLate} 
                          onChange={(e) => setIsLate(e.target.checked)}
                          style={{ width: '14px', height: '14px' }}
                        />
                        <span>Late Penalty (From: Nov 1, 2026)</span>
                      </label>

                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                        <input 
                          type="checkbox" 
                          checked={workshopAddon} 
                          onChange={(e) => setWorkshopAddon(e.target.checked)}
                          style={{ width: '14px', height: '14px' }}
                        />
                        <span>Pre-conference workshop addon (+{isIndian ? '₹500' : '$10'})</span>
                      </label>

                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
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
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    {/* Billing Summary Box */}
                    <div style={{ background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '0.75rem', padding: '1.25rem' }}>
                      <h4 style={{ fontSize: '1rem', color: 'var(--text-primary)', marginBottom: '0.75rem', borderBottom: '1px solid #cbd5e1', paddingBottom: '0.35rem', fontWeight: 700 }}>Fee Breakdown</h4>
                      
                      {(() => {
                        const bill = calculateTotalFees();
                        return (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.8rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                              <span>Base Fee:</span>
                              <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{bill.currencySymbol}{bill.baseFee}</span>
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
                                <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>+{bill.currencySymbol}{bill.extraPageFee}</span>
                              </div>
                            )}

                            {bill.workshopFee > 0 && (
                              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                                <span>Workshop:</span>
                                <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>+{bill.currencySymbol}{bill.workshopFee}</span>
                              </div>
                            )}

                            {bill.virtualFee > 0 && (
                              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                                <span>Virtual Mode:</span>
                                <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>+{bill.currencySymbol}{bill.virtualFee}</span>
                              </div>
                            )}

                            <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '2px solid #cbd5e1', paddingTop: '0.5rem', fontSize: '1.1rem', fontWeight: 800, color: 'var(--accent)' }}>
                              <span>Total Due:</span>
                              <span>{bill.currencySymbol}{bill.total} ({bill.currency})</span>
                            </div>
                          </div>
                        );
                      })()}
                    </div>

                    {/* Sliding Gateway Selector */}
                    <div>
                      <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 700, display: 'block', marginBottom: '0.35rem', textTransform: 'uppercase', letterSpacing: '0.02em' }}>Select Payment Method</label>
                      <div style={{ display: 'flex', background: '#f1f5f9', padding: '0.25rem', borderRadius: '0.5rem', border: '1px solid #cbd5e1' }}>
                        <button
                          type="button"
                          onClick={() => setPaymentTab('bank')}
                          style={{
                            flex: 1,
                            background: paymentTab === 'bank' ? 'linear-gradient(135deg, var(--accent) 0%, var(--accent-cyan) 100%)' : 'transparent',
                            color: paymentTab === 'bank' ? '#ffffff' : 'var(--text-secondary)',
                            border: 'none',
                            padding: '0.55rem',
                            borderRadius: '0.375rem',
                            fontSize: '0.8rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            boxShadow: paymentTab === 'bank' ? '0 2px 8px rgba(15, 82, 186, 0.2)' : 'none'
                          }}
                        >
                          Bank Transfer
                        </button>
                        <button
                          type="button"
                          onClick={() => setPaymentTab('online')}
                          style={{
                            flex: 1,
                            background: paymentTab === 'online' ? 'linear-gradient(135deg, var(--accent) 0%, var(--accent-cyan) 100%)' : 'transparent',
                            color: paymentTab === 'online' ? '#ffffff' : 'var(--text-secondary)',
                            border: 'none',
                            padding: '0.55rem',
                            borderRadius: '0.375rem',
                            fontSize: '0.8rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            boxShadow: paymentTab === 'online' ? '0 2px 8px rgba(15, 82, 186, 0.2)' : 'none'
                          }}
                        >
                          Online Gateway
                        </button>
                      </div>
                    </div>

                    {/* Conditionally Render forms based on active tab */}
                    {paymentTab === 'bank' ? (
                      /* Submission Form (Bank Transfer) */
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        <h4 style={{ fontSize: '1rem', color: 'var(--text-primary)', borderBottom: '1px solid #cbd5e1', paddingBottom: '0.35rem', fontWeight: 700 }}>2. Submit Proof of Payment</h4>
                        
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
                                <label htmlFor="reg_paper_id" style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600, display: 'block', marginBottom: '0.25rem' }}>Paper ID*</label>
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
                                <label htmlFor="reg_author_name" style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600, display: 'block', marginBottom: '0.25rem' }}>Author Name*</label>
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
                              <label htmlFor="reg_paper_title" style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600, display: 'block', marginBottom: '0.25rem' }}>Paper Title*</label>
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
                                <label htmlFor="reg_email" style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600, display: 'block', marginBottom: '0.25rem' }}>Email Address*</label>
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
                                <label htmlFor="reg_phone" style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600, display: 'block', marginBottom: '0.25rem' }}>Phone Number*</label>
                                <div style={{ display: 'flex', gap: '0.4rem' }}>
                                  <select
                                    id="reg_phone_code"
                                    value={regPhoneCode}
                                    onChange={(e) => setRegPhoneCode(e.target.value)}
                                    className="form-input"
                                    style={{
                                      width: '90px',
                                      padding: '0.4rem 0.5rem',
                                      fontSize: '0.8rem',
                                      background: '#ffffff',
                                      border: '1px solid #cbd5e1',
                                      color: 'var(--text-primary)',
                                      borderRadius: '0.5rem'
                                    }}
                                    title="Country Code"
                                  >
                                    <option value="+91" style={{ background: '#ffffff', color: '#0f172a' }}>🇮🇳 +91</option>
                                    <option value="+1" style={{ background: '#ffffff', color: '#0f172a' }}>🇺🇸 +1</option>
                                    <option value="+44" style={{ background: '#ffffff', color: '#0f172a' }}>🇬🇧 +44</option>
                                    <option value="+61" style={{ background: '#ffffff', color: '#0f172a' }}>🇦🇺 +61</option>
                                    <option value="+65" style={{ background: '#ffffff', color: '#0f172a' }}>🇸🇬 +65</option>
                                    <option value="+86" style={{ background: '#ffffff', color: '#0f172a' }}>🇨🇳 +86</option>
                                    <option value="+81" style={{ background: '#ffffff', color: '#0f172a' }}>🇯🇵 +81</option>
                                    <option value="+49" style={{ background: '#ffffff', color: '#0f172a' }}>🇩🇪 +49</option>
                                    <option value="+33" style={{ background: '#ffffff', color: '#0f172a' }}>🇫🇷 +33</option>
                                    <option value="+971" style={{ background: '#ffffff', color: '#0f172a' }}>🇦🇪 +971</option>
                                  </select>
                                  <input 
                                    id="reg_phone"
                                    type="tel" 
                                    required 
                                    className={`form-input ${showRegValidation && !regPhone ? 'is-invalid' : ''}`}
                                    style={{ flex: 1, padding: '0.4rem 0.6rem', fontSize: '0.8rem' }}
                                    placeholder="9876543210"
                                    value={regPhone}
                                    onChange={(e) => setRegPhone(e.target.value)}
                                    title="Phone Number"
                                  />
                                </div>
                              </div>
                            </div>

                            {/* Explore Coimbatore / Tour Option */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.25rem' }}>
                              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                                <input 
                                  type="checkbox" 
                                  checked={regRegisterForTour} 
                                  onChange={(e) => {
                                    setRegRegisterForTour(e.target.checked);
                                    if (!e.target.checked) setRegPreferredTourPlace('');
                                  }}
                                  style={{ width: '14px', height: '14px' }}
                                />
                                <span style={{ fontWeight: 600 }}>Explore Coimbatore (Register for Free Local Tour)</span>
                              </label>

                              {regRegisterForTour && (
                                <div style={{ marginTop: '0.25rem' }}>
                                  <label htmlFor="reg_tour_place" style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600, display: 'block', marginBottom: '0.25rem' }}>Select Preferred Sightseeing Place*</label>
                                  <select
                                    id="reg_tour_place"
                                    value={regPreferredTourPlace}
                                    onChange={(e) => setRegPreferredTourPlace(e.target.value)}
                                    required={regRegisterForTour}
                                    className="form-input"
                                    style={{
                                      width: '100%',
                                      padding: '0.4rem 0.5rem',
                                      fontSize: '0.8rem',
                                      background: '#ffffff',
                                      border: '1px solid #cbd5e1',
                                      color: '#0f172a',
                                      borderRadius: '0.5rem'
                                    }}
                                  >
                                    <option value="" style={{ background: '#ffffff', color: '#0f172a' }}>-- Select a Place --</option>
                                    <option value="Isha Yoga Center - Dhyanalinga and Adiyogi Statue" style={{ background: '#ffffff', color: '#0f172a' }}>Isha Yoga Center - Dhyanalinga and Adiyogi Statue</option>
                                    <option value="Dhyanalinga Temple" style={{ background: '#ffffff', color: '#0f172a' }}>Dhyanalinga Temple</option>
                                    <option value="Marudamalai Temple" style={{ background: '#ffffff', color: '#0f172a' }}>Marudamalai Temple</option>
                                    <option value="Brookefields Mall" style={{ background: '#ffffff', color: '#0f172a' }}>Brookefields Mall</option>
                                    <option value="Eachanari Vinayagar Temple" style={{ background: '#ffffff', color: '#0f172a' }}>Eachanari Vinayagar Temple</option>
                                  </select>
                                </div>
                              )}
                            </div>

                            {/* Screenshot */}
                            <div>
                              <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600, display: 'block', marginBottom: '0.25rem' }}>Upload Payment Screenshot (Max 10MB)*</label>
                              <div 
                                style={{
                                  border: showRegValidation && !regScreenshot ? '2px dashed #ef4444' : '2px dashed #cbd5e1',
                                  borderRadius: '0.5rem',
                                  padding: '1rem',
                                  textAlign: 'center',
                                  cursor: 'pointer',
                                  background: showRegValidation && !regScreenshot ? 'rgba(239, 68, 68, 0.05)' : '#f8fafc',
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
                                <Download size={18} style={{ color: 'var(--text-muted)', marginBottom: '0.25rem', marginInline: 'auto' }} />
                                {regScreenshot ? (
                                  <div>
                                    <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--accent)', display: 'block' }}>{regScreenshot.name}</span>
                                  </div>
                                ) : (
                                  <div>
                                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Click to upload payment screenshot receipt</span>
                                  </div>
                                )}
                              </div>
                            </div>

                            {regError && (
                              <div style={{ color: '#ef4444', fontSize: '0.75rem', fontWeight: 600 }}>
                                {regError}
                              </div>
                            )}

                            <button 
                              type="submit" 
                              className="btn btn-primary" 
                              disabled={regSubmitting}
                              onClick={() => setShowRegValidation(true)}
                              style={{ marginTop: '0.35rem', width: '100%', padding: '0.65rem', background: 'linear-gradient(135deg, var(--accent) 0%, var(--accent-cyan) 100%)', fontSize: '0.85rem', border: 'none', color: '#ffffff', borderRadius: '0.5rem', fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 12px rgba(15, 82, 186, 0.25)' }}
                            >
                              {regSubmitting ? 'Submitting...' : 'Submit Registration & Payment'}
                            </button>
                          </form>
                        )}
                      </div>
                    ) : (
                      /* Online Checkout Gateway (Futuristic Mock) */
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        <h4 style={{ fontSize: '1rem', color: 'var(--text-primary)', borderBottom: '1px solid #cbd5e1', paddingBottom: '0.35rem', fontWeight: 700 }}>2. Online Payment Gateway</h4>
                        
                        {onlineSuccess ? (
                          <div style={{ 
                            background: 'rgba(34, 197, 94, 0.08)', 
                            border: '1px solid rgba(34, 197, 94, 0.25)', 
                            borderRadius: '0.5rem', 
                            padding: '1.25rem',
                            textAlign: 'center',
                            color: '#22c55e',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '0.5rem',
                            alignItems: 'center'
                          }}>
                            <CheckCircle size={32} style={{ color: '#22c55e' }} />
                            <span style={{ fontSize: '1rem', fontWeight: 800 }}>Demo Checkout Complete!</span>
                            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.4 }}>
                              This was a simulation of the checkout sequence. SREC instant payment APIs will secure this transaction.
                            </p>
                            <div style={{ fontSize: '0.75rem', fontFamily: 'monospace', padding: '0.4rem 0.8rem', background: '#f8fafc', borderRadius: '0.25rem', border: '1px solid #e2e8f0', marginTop: '0.25rem', color: 'var(--text-primary)' }}>
                              TxID: SREC-MOCK-{Math.floor(100000 + Math.random() * 900000)}
                            </div>
                            <button 
                              type="button" 
                              onClick={() => {
                                setOnlineSuccess(false);
                                setCardHolder('');
                                setCardNumber('');
                                setCardExpiry('');
                                setCardCvv('');
                                setSelectedUpi(null);
                                setUpiId('');
                              }} 
                              className="btn btn-secondary"
                              style={{ marginTop: '0.5rem', padding: '0.4rem 1rem', fontSize: '0.8rem' }}
                            >
                              Restart Simulator
                            </button>
                          </div>
                        ) : (
                          <form onSubmit={(e) => {
                            e.preventDefault();
                            setOnlinePaying(true);
                            setTimeout(() => {
                              setOnlinePaying(false);
                              setOnlineSuccess(true);
                            }, 1500);
                          }} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            
                            {/* Futuristic Credit Card Graphic */}
                            <div style={{
                              width: '100%',
                              height: '160px',
                              background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.25) 0%, rgba(6, 182, 212, 0.25) 100%)',
                              borderRadius: '0.75rem',
                              border: '1px solid rgba(255, 255, 255, 0.15)',
                              padding: '1.25rem',
                              boxShadow: '0 10px 20px rgba(0,0,0,0.15), inset 0 1px 1px rgba(255,255,255,0.2)',
                              position: 'relative',
                              overflow: 'hidden',
                              display: 'flex',
                              flexDirection: 'column',
                              justifyContent: 'space-between',
                              backdropFilter: 'blur(10px)',
                              marginBottom: '0.5rem'
                            }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                {/* Glowing Chip */}
                                <div style={{
                                  width: '32px',
                                  height: '24px',
                                  background: 'linear-gradient(135deg, #fbbf24 0%, #d97706 100%)',
                                  borderRadius: '0.25rem',
                                  position: 'relative',
                                  boxShadow: '0 0 8px rgba(251, 191, 36, 0.4)'
                                }} />
                                {/* Visa logo / text */}
                                <span style={{ fontStyle: 'italic', fontWeight: 900, color: '#ffffff', fontSize: '1.1rem', letterSpacing: '0.05em' }}>SREC Secure</span>
                              </div>

                              <div style={{
                                fontSize: '1.15rem',
                                letterSpacing: '0.12em',
                                fontFamily: 'monospace',
                                color: '#ffffff',
                                textShadow: '0 2px 4px rgba(0,0,0,0.3)',
                                textAlign: 'center',
                                margin: '0.75rem 0'
                              }}>
                                {cardNumber ? cardNumber.replace(/(\d{4})/g, '$1 ').trim() : '•••• •••• •••• ••••'}
                              </div>

                              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontFamily: 'monospace', color: 'rgba(255,255,255,0.8)' }}>
                                <div>
                                  <div style={{ fontSize: '0.55rem', textTransform: 'uppercase', color: 'rgba(255,255,255,0.5)' }}>Card Holder</div>
                                  <div>{cardHolder ? cardHolder.toUpperCase() : 'CARDHOLDER NAME'}</div>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                  <div style={{ fontSize: '0.55rem', textTransform: 'uppercase', color: 'rgba(255,255,255,0.5)' }}>Expires</div>
                                  <div>{cardExpiry ? cardExpiry : 'MM/YY'}</div>
                                </div>
                              </div>
                            </div>

                            {/* Payment Method Switcher (Card vs UPI) */}
                            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.25rem' }}>
                              <button
                                type="button"
                                onClick={() => { setSelectedUpi(null); setUpiId(''); }}
                                className={`btn ${selectedUpi === null ? 'btn-primary' : 'btn-secondary'}`}
                                style={{ flex: 1, padding: '0.35rem', fontSize: '0.75rem', borderRadius: '0.25rem' }}
                              >
                                Credit/Debit Card
                              </button>
                              <button
                                type="button"
                                onClick={() => { setSelectedUpi('gpay'); }}
                                className={`btn ${selectedUpi !== null ? 'btn-primary' : 'btn-secondary'}`}
                                style={{ flex: 1, padding: '0.35rem', fontSize: '0.75rem', borderRadius: '0.25rem' }}
                              >
                                UPI Payment
                              </button>
                            </div>

                            {selectedUpi === null ? (
                              /* Card Inputs */
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                <div>
                                  <label htmlFor="card_holder" style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Cardholder Name</label>
                                  <input
                                    id="card_holder"
                                    type="text"
                                    required
                                    className="form-input"
                                    style={{ padding: '0.35rem 0.5rem', fontSize: '0.8rem' }}
                                    placeholder="e.g. John Doe"
                                    value={cardHolder}
                                    onChange={(e) => setCardHolder(e.target.value)}
                                  />
                                </div>
                                <div>
                                  <label htmlFor="card_number" style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Card Number</label>
                                  <input
                                    id="card_number"
                                    type="text"
                                    maxLength={16}
                                    pattern="\d{16}"
                                    required
                                    className="form-input"
                                    style={{ padding: '0.35rem 0.5rem', fontSize: '0.8rem' }}
                                    placeholder="16-digit card number"
                                    value={cardNumber}
                                    onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, ''))}
                                  />
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem' }}>
                                  <div>
                                    <label htmlFor="card_expiry" style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Expiry Date</label>
                                    <input
                                      id="card_expiry"
                                      type="text"
                                      maxLength={5}
                                      required
                                      className="form-input"
                                      style={{ padding: '0.35rem 0.5rem', fontSize: '0.8rem' }}
                                      placeholder="MM/YY"
                                      value={cardExpiry}
                                      onChange={(e) => setCardExpiry(e.target.value)}
                                    />
                                  </div>
                                  <div>
                                    <label htmlFor="card_cvv" style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: 600 }}>CVV</label>
                                    <input
                                      id="card_cvv"
                                      type="password"
                                      maxLength={3}
                                      pattern="\d{3}"
                                      required
                                      className="form-input"
                                      style={{ padding: '0.35rem 0.5rem', fontSize: '0.8rem' }}
                                      placeholder="3 digits"
                                      value={cardCvv}
                                      onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, ''))}
                                    />
                                  </div>
                                </div>
                              </div>
                            ) : (
                              /* UPI Selector */
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', margin: '0.25rem 0' }}>
                                  {['gpay', 'phonepe', 'paytm'].map((upiType) => (
                                    <button
                                      key={upiType}
                                      type="button"
                                      onClick={() => setSelectedUpi(upiType as any)}
                                      style={{
                                        padding: '0.4rem 0.8rem',
                                        fontSize: '0.75rem',
                                        background: selectedUpi === upiType ? 'rgba(15, 82, 186, 0.08)' : '#ffffff',
                                        border: selectedUpi === upiType ? '1px solid var(--accent)' : '1px solid #cbd5e1',
                                        color: selectedUpi === upiType ? 'var(--accent)' : 'var(--text-secondary)',
                                        borderRadius: '0.375rem',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s ease',
                                        fontWeight: 700
                                      }}
                                    >
                                      {upiType === 'gpay' ? 'Google Pay' : upiType === 'phonepe' ? 'PhonePe' : 'Paytm'}
                                    </button>
                                  ))}
                                  <button
                                    type="button"
                                    onClick={() => setSelectedUpi('upi_id')}
                                    style={{
                                      padding: '0.4rem 0.8rem',
                                      fontSize: '0.75rem',
                                      background: selectedUpi === 'upi_id' ? 'rgba(15, 82, 186, 0.08)' : '#ffffff',
                                      border: selectedUpi === 'upi_id' ? '1px solid var(--accent)' : '1px solid #cbd5e1',
                                      color: selectedUpi === 'upi_id' ? 'var(--accent)' : 'var(--text-secondary)',
                                      borderRadius: '0.375rem',
                                      cursor: 'pointer',
                                      transition: 'all 0.2s ease',
                                      fontWeight: 700
                                    }}
                                  >
                                    UPI ID
                                  </button>
                                </div>
                                <div>
                                  <label htmlFor="upi_id" style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Enter UPI ID / Mobile Number</label>
                                  <input
                                    id="upi_id"
                                    type="text"
                                    required
                                    className="form-input"
                                    style={{ padding: '0.35rem 0.5rem', fontSize: '0.8rem' }}
                                    placeholder={selectedUpi === 'gpay' ? 'e.g. name@okhdfcbank' : 'e.g. mobile@ybl or username@paytm'}
                                    value={upiId}
                                    onChange={(e) => setUpiId(e.target.value)}
                                  />
                                </div>
                              </div>
                            )}

                            {/* Scheduled Notice */}
                            <div style={{
                              background: 'rgba(15, 82, 186, 0.03)',
                              border: '1px dashed rgba(15, 82, 186, 0.2)',
                              borderRadius: '0.5rem',
                              padding: '0.75rem',
                              marginTop: '0.25rem',
                              textAlign: 'left'
                            }}>
                              <span style={{ fontSize: '0.7rem', color: 'var(--accent)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '0.25rem', marginBottom: '0.15rem' }}>
                                <Sparkles size={12} /> Scheduled Pipeline (Future Integration)
                              </span>
                              <p style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.4 }}>
                                Live online transactions are in sandbox testing and scheduled for active deployment in Q3 2027. This simulator validates the checkout integration. To submit actual conference payment, please use the <strong>Bank Transfer</strong> tab.
                              </p>
                            </div>

                            <button 
                              type="submit" 
                              className="btn btn-primary" 
                              disabled={onlinePaying}
                              style={{ marginTop: '0.35rem', width: '100%', padding: '0.65rem', background: 'linear-gradient(135deg, var(--accent) 0%, var(--accent-cyan) 100%)', fontSize: '0.85rem', border: 'none', color: '#ffffff', borderRadius: '0.5rem', fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 12px rgba(15, 82, 186, 0.25)' }}
                            >
                              {onlinePaying ? 'Simulating Secure Connection...' : 'Simulate Gateway Payment (Demo)'}
                            </button>
                          </form>
                        )}
                      </div>
                    )}
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
                          <div className="admin-form-row" style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '1.5rem', marginBottom: '0.5rem' }}>
                            <div className="admin-form-group" style={{ flex: 1 }}>
                              <label htmlFor="info_show_announcement">Show Announcement Banner</label>
                              <select 
                                id="info_show_announcement"
                                className="form-input" 
                                value={info.show_announcement !== 'false' ? 'true' : 'false'} 
                                onChange={(e) => handleSaveInfoSetting('show_announcement', e.target.value)}
                                title="Show Announcement Banner"
                              >
                                <option value="true">Show Banner</option>
                                <option value="false">Hide Banner</option>
                              </select>
                            </div>
                            <div className="admin-form-group" style={{ flex: 3 }}>
                              <label htmlFor="info_announcement_text">Announcement Banner Text</label>
                              <input 
                                id="info_announcement_text"
                                type="text" 
                                className="form-input" 
                                value={info.announcement_text || '📢 Call for Papers! Mark your calendars: The Call for Papers for AECTSD 2027 opens on 15th December 2026. Start preparing your submission'} 
                                onChange={(e) => handleSaveInfoSetting('announcement_text', e.target.value)} 
                                placeholder="Enter Banner Text"
                                title="Announcement Banner Text"
                              />
                            </div>
                          </div>

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
                            <label htmlFor="info_about_conference">About the Conference Description</label>
                            <textarea 
                              id="info_about_conference"
                              rows={4} 
                              className="form-input" 
                              value={info.about_conference || ''} 
                              onChange={(e) => handleSaveInfoSetting('about_conference', e.target.value)} 
                              placeholder="Enter About the Conference Description"
                              title="About the Conference Description"
                            />
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
                            <label htmlFor="info_advisory_committee_desc">Advisory Committee Description</label>
                            <textarea 
                              id="info_advisory_committee_desc"
                              rows={3} 
                              className="form-input" 
                              value={info.advisory_committee_desc || ''} 
                              onChange={(e) => handleSaveInfoSetting('advisory_committee_desc', e.target.value)} 
                              placeholder="Enter Advisory Committee Description"
                              title="Advisory Committee Description"
                            />
                          </div>

                          <div className="admin-form-group">
                            <label htmlFor="info_technical_committee_desc">Technical Committee Description</label>
                            <textarea 
                              id="info_technical_committee_desc"
                              rows={3} 
                              className="form-input" 
                              value={info.technical_committee_desc || ''} 
                              onChange={(e) => handleSaveInfoSetting('technical_committee_desc', e.target.value)} 
                              placeholder="Enter Technical Committee Description"
                              title="Technical Committee Description"
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

                          <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                            <h4 style={{ fontSize: '1.1rem', color: 'var(--accent-cyan)', marginBottom: '1rem', fontWeight: 700 }}>EmailJS Auto-Notification Gateway</h4>
                            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '1.25rem', lineHeight: 1.4 }}>
                              Configure your client-side EmailJS integration keys to automatically receive email alerts with attached payment screenshot receipts upon new registrations.
                            </p>
                            
                            <div className="admin-form-row">
                              <div className="admin-form-group">
                                <label htmlFor="emailjs_service_id">EmailJS Service ID</label>
                                <input 
                                  id="emailjs_service_id"
                                  type="text" 
                                  className="form-input" 
                                  value={info.emailjs_service_id || ''} 
                                  onChange={(e) => handleSaveInfoSetting('emailjs_service_id', e.target.value)} 
                                  placeholder="e.g. service_xxxx"
                                  title="EmailJS Service ID"
                                />
                              </div>
                              <div className="admin-form-group">
                                <label htmlFor="emailjs_template_id">EmailJS Template ID</label>
                                <input 
                                  id="emailjs_template_id"
                                  type="text" 
                                  className="form-input" 
                                  value={info.emailjs_template_id || ''} 
                                  onChange={(e) => handleSaveInfoSetting('emailjs_template_id', e.target.value)} 
                                  placeholder="e.g. template_xxxx"
                                  title="EmailJS Template ID"
                                />
                              </div>
                            </div>

                            <div className="admin-form-row" style={{ marginTop: '1rem' }}>
                              <div className="admin-form-group">
                                <label htmlFor="emailjs_public_key">EmailJS Public Key (User ID)</label>
                                <input 
                                  id="emailjs_public_key"
                                  type="text" 
                                  className="form-input" 
                                  value={info.emailjs_public_key || ''} 
                                  onChange={(e) => handleSaveInfoSetting('emailjs_public_key', e.target.value)} 
                                  placeholder="e.g. user_xxxx or public_key"
                                  title="EmailJS Public Key"
                                />
                              </div>
                              <div className="admin-form-group">
                                <label htmlFor="emailjs_recipient">Notification Recipient Email</label>
                                <input 
                                  id="emailjs_recipient"
                                  type="email" 
                                  className="form-input" 
                                  value={info.emailjs_recipient || ''} 
                                  onChange={(e) => handleSaveInfoSetting('emailjs_recipient', e.target.value)} 
                                  placeholder="e.g. finance@srec.ac.in"
                                  title="Notification Recipient Email"
                                />
                              </div>
                            </div>
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

      {/* Nexus Agent Chatbot Floating Widget */}
      <div className="nexus-chat-container">
        {!showNexusChat && (
          <div className="nexus-chat-tooltip">
            <span className="nexus-chat-tooltip-dot">●</span>
            How can I help you?
          </div>
        )}
        
        <div 
          className="nexus-chat-trigger" 
          onClick={() => setShowNexusChat(!showNexusChat)}
          title="Chat with Nexus AI Agent"
        >
          {showNexusChat ? (
            <div className="nexus-chat-close-btn">
              <X size={24} />
            </div>
          ) : (
            <img 
              src={chatbotIcon} 
              alt="Nexus Agent" 
              className="nexus-chat-mascot-img"
            />
          )}
        </div>
      </div>

      <AnimatePresence>
        {showNexusChat && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.2 }}
            className="nexus-chat-window"
          >
            {/* Header */}
            <div className="nexus-chat-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <img 
                  src={chatbotIcon} 
                  alt="Nexus Agent Avatar" 
                  style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover', border: '1px solid rgba(255, 255, 255, 0.2)', display: 'block' }} 
                />
                <div>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 800, margin: 0 }}>Nexus AI Assistant</h4>
                  <span style={{ fontSize: '0.7rem', opacity: 0.8, display: 'block' }}>SREC Conference Agent</span>
                </div>
              </div>
              <button 
                onClick={() => setShowNexusChat(false)}
                style={{ background: 'none', border: 'none', color: '#ffffff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Message List */}
            <div className="nexus-chat-messages" id="nexus-chat-messages-container">
              {chatMessages.map((msg, index) => (
                <div key={index} className={`nexus-chat-message ${msg.sender}`}>
                  <p style={{ margin: 0, whiteSpace: 'pre-wrap', fontSize: '0.85rem' }}>{msg.text}</p>
                </div>
              ))}
              {isAgentTyping && (
                <div className="nexus-chat-message agent" style={{ display: 'inline-flex', alignItems: 'center' }}>
                  <div className="nexus-typing-dots">
                    <div className="nexus-typing-dot"></div>
                    <div className="nexus-typing-dot"></div>
                    <div className="nexus-typing-dot"></div>
                  </div>
                </div>
              )}
            </div>

            {/* Suggested Prompts */}
            <div className="nexus-chat-suggested">
              {[
                { label: 'Dates 📅', text: 'What are the important dates/deadlines?' },
                { label: 'Fees 💳', text: 'How much are the registration fees?' },
                { label: 'Submission 📝', text: 'How do I submit my paper?' },
                { label: 'Speakers 🎙️', text: 'Who are the keynote speakers?' }
              ].map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendChatMessage(p.text)}
                  className="nexus-chat-suggested-btn"
                >
                  {p.label}
                </button>
              ))}
            </div>

            {/* Input Area */}
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                handleSendChatMessage();
              }}
              className="nexus-chat-input-area"
            >
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Ask Nexus a question..."
                className="nexus-chat-input"
                title="Chat Input"
              />
              <button type="submit" className="nexus-chat-send">
                Send
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
