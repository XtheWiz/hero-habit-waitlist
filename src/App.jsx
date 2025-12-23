import React, { useState, useEffect } from 'react';
import { BookOpen, Dumbbell, Shield, Sword, Zap, ChevronRight, Twitter, Globe, Trophy, Users, Heart, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged, signInWithCustomToken } from 'firebase/auth';
import { getFirestore, collection, addDoc, serverTimestamp, getDocs } from 'firebase/firestore';

// --- Safe Environment Variable Access ---
const getEnvVar = (key) => {
  try {
    // 1. Check for Preview environment globals (Canvas/Preview mode)
    if (key === 'FIREBASE_CONFIG' && typeof __firebase_config !== 'undefined') return JSON.parse(__firebase_config);
    if (key === 'APP_ID' && typeof __app_id !== 'undefined') return __app_id;
    
    // 2. Check for Vite environment variables (Production/Local)
    // Safely check import.meta to avoid build-time errors in environments that don't support it
    const metaEnv = (typeof import.meta !== 'undefined' && import.meta.env) ? import.meta.env : {};
    const viteKey = `VITE_${key}`;
    const value = metaEnv[viteKey];
    
    if (key === 'FIREBASE_CONFIG' && value) {
      // Clean potential quotes from Vercel/Terminal inputs
      const cleanJson = value.trim().replace(/^'|'$/g, '');
      return JSON.parse(cleanJson);
    }
    if (value) return value;

    // 3. Absolute Fallback for the preview environment if everything else fails
    if (key === 'FIREBASE_CONFIG') {
      return {
        apiKey: "AIzaSyAyVaaL-cAv_l_-AY0I43t14SSF035lZz0",
        authDomain: "hero-habit-1ee2a.firebaseapp.com",
        projectId: "hero-habit-1ee2a",
        storageBucket: "hero-habit-1ee2a.firebasestorage.app",
        messagingSenderId: "948098174548",
        appId: "1:948098174548:web:acf3fe8d5a5264b2a7a7c1"
      };
    }
    if (key === 'APP_ID') return "hero-habit-v1";

    return null;
  } catch (e) {
    console.error(`Error parsing env var ${key}:`, e);
    return null;
  }
};

const firebaseConfig = getEnvVar('FIREBASE_CONFIG') || {};
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = getEnvVar('APP_ID') || 'hero-habit-v1';

const App = () => {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [statusMsg, setStatusMsg] = useState({ type: '', text: '' });

  // RULE 3: Auth Before Queries
  useEffect(() => {
    const initAuth = async () => {
      try {
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
          await signInWithCustomToken(auth, __initial_auth_token);
        } else {
          await signInAnonymously(auth);
        }
      } catch (error) {
        console.error("Firebase Auth initialization failed:", error);
      }
    };
    initAuth();
    const unsubscribe = onAuthStateChanged(auth, setUser);
    return () => unsubscribe();
  }, []);

  const validateEmail = (email) => {
    return String(email)
      .toLowerCase()
      .match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const normalizedEmail = email.trim().toLowerCase();

    if (!validateEmail(normalizedEmail)) {
      setStatusMsg({ type: 'error', text: 'Please enter a valid email address.' });
      return;
    }

    setIsLoading(true);
    setStatusMsg({ type: '', text: '' });

    try {
      let currentUser = user;
      if (!currentUser) {
        const cred = await signInAnonymously(auth);
        currentUser = cred.user;
      }

      // RULE 1: Strict Paths - Always use the standardized path structure
      const waitlistRef = collection(db, 'artifacts', appId, 'public', 'data', 'waitlist');
      
      // RULE 2: No complex queries. Fetch all and check in memory for small datasets.
      const querySnapshot = await getDocs(waitlistRef);
      const isDuplicate = querySnapshot.docs.some(doc => doc.data().email === normalizedEmail);

      if (isDuplicate) {
        setStatusMsg({ type: 'error', text: 'This hero is already registered in the guild!' });
        setIsLoading(false);
        return;
      }
      
      await addDoc(waitlistRef, {
        email: normalizedEmail,
        joinedAt: serverTimestamp(),
        userId: currentUser.uid,
        source: typeof __app_id !== 'undefined' ? 'preview' : 'production'
      });
      
      setIsSubmitted(true);
      setEmail('');
    } catch (error) {
      console.error("Firestore submission failed:", error);
      setStatusMsg({ 
        type: 'error', 
        text: `Submission failed: ${error.code || 'Check console'}` 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const CatHeroIcon = () => (
    <svg viewBox="0 0 100 100" className="w-28 h-28 drop-shadow-[0_0_15px_rgba(99,102,241,0.5)]" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="55" r="35" fill="rgba(99,102,241,0.1)" />
      {/* Body / Tunic */}
      <path d="M35 70L40 55H60L65 70L50 80L35 70Z" fill="#10b981" stroke="#065f46" strokeWidth="2" />
      {/* Cat Head */}
      <path d="M30 40C30 30 70 30 70 40C70 55 30 55 30 40Z" fill="#f8fafc" stroke="#334155" strokeWidth="2" />
      {/* Ears */}
      <path d="M32 32L22 15L42 28" fill="#f8fafc" stroke="#334155" strokeWidth="2" strokeLinejoin="round" />
      <path d="M68 32L78 15L58 28" fill="#f8fafc" stroke="#334155" strokeWidth="2" strokeLinejoin="round" />
      {/* Eyes */}
      <circle cx="42" cy="42" r="3" fill="#1e293b" />
      <circle cx="58" cy="42" r="3" fill="#1e293b" />
      {/* Nose */}
      <circle cx="50" cy="46" r="1.5" fill="#f43f5e" />
      {/* Scarf / Cape */}
      <path d="M40 55L30 58L25 75" stroke="#ef4444" strokeWidth="3" strokeLinecap="round" />
      <path d="M60 55L50 58" stroke="#ef4444" strokeWidth="4" strokeLinecap="round" />
      {/* Master Sword */}
      <path d="M72 70L88 45" stroke="#94a3b8" strokeWidth="4" strokeLinecap="round" />
      <path d="M82 62L76 56" stroke="#475569" strokeWidth="6" strokeLinecap="round" />
      <path d="M85 48L88 45" stroke="#f59e0b" strokeWidth="4" />
    </svg>
  );

  return (
    <div className="min-h-screen font-sans bg-slate-950 text-slate-100 selection:bg-indigo-500 selection:text-white">
      <nav className="flex items-center justify-center px-6 py-12 mx-auto max-w-7xl">
        <div className="flex items-center gap-2 cursor-default group">
          <div className="p-2 transition-transform duration-300 rounded-lg shadow-lg bg-gradient-to-br from-indigo-500 to-purple-600 shadow-indigo-500/20 group-hover:rotate-12">
            <Zap className="w-6 h-6 text-white" fill="currentColor" />
          </div>
          <span className="text-2xl italic font-black tracking-tighter uppercase">Hero Habit</span>
        </div>
      </nav>

      <section className="px-6 pt-8 pb-32 mx-auto text-center max-w-7xl">
        <div className="inline-flex items-center gap-2 px-4 py-2 mb-8 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-indigo-400 text-[10px] font-bold uppercase tracking-[0.3em]">
          <Globe className="w-3 h-3 animate-pulse" /> Worldwide Beta Coming Soon
        </div>
        <h1 className="text-6xl md:text-8xl font-black mb-8 leading-[0.9] tracking-tighter">
          GAMIFY YOUR <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-500">EXISTENCE.</span><br /> 
          BUILD YOUR <span className="italic text-slate-700">LEGEND.</span>
        </h1>
        <p className="max-w-2xl mx-auto mb-12 text-lg font-medium leading-relaxed text-slate-500 md:text-xl">
          The first hybrid RPG tracker that syncs your brain and body. 
          Turn deep work into <span className="font-bold text-blue-400">Mana</span> and workouts into <span className="font-bold text-red-400">Might.</span>
        </p>

        <div className="relative max-w-md mx-auto">
          {!isSubmitted ? (
            <>
              <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:flex-row">
                <input
                  type="email"
                  placeholder="Enter your email address"
                  required
                  disabled={isLoading}
                  className="flex-1 px-6 py-4 transition-all border bg-slate-900 border-slate-800 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder:text-slate-700 disabled:opacity-50"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <button 
                  type="submit"
                  disabled={isLoading}
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 px-8 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-xl shadow-indigo-600/20 transform transition-all active:scale-95 disabled:opacity-50 min-w-[140px]"
                >
                  {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Join Guild"} 
                  {!isLoading && <ChevronRight className="w-5 h-5" />}
                </button>
              </form>
              {statusMsg.text && (
                <div className={`mt-4 p-4 rounded-xl flex items-start gap-3 text-xs text-left animate-in fade-in slide-in-from-top-1 ${
                  statusMsg.type === 'error' ? 'bg-red-500/10 border border-red-500/20 text-red-400' : 'bg-indigo-500/10 border border-indigo-500/20 text-indigo-400'
                }`}>
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <p className="leading-relaxed">{statusMsg.text}</p>
                </div>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center p-8 text-indigo-400 duration-500 border bg-indigo-500/10 border-indigo-500/20 rounded-3xl animate-in fade-in zoom-in">
              <CheckCircle2 className="w-12 h-12 mb-4 text-indigo-400 animate-bounce" />
              <p className="mb-2 text-2xl italic font-black tracking-tight text-center uppercase">Welcome to the Guild!</p>
              <p className="text-sm font-medium leading-relaxed tracking-widest text-center uppercase opacity-80">Your spot is secured. Founder loot coordinates incoming.</p>
              <button onClick={() => setIsSubmitted(false)} className="mt-6 text-[10px] uppercase font-bold text-slate-500 hover:text-indigo-400 underline underline-offset-4">Register another hero</button>
            </div>
          )}
        </div>
      </section>

      {/* Stats Preview Card */}
      <section id="stats" className="max-w-5xl px-6 mx-auto mt-20 mb-32">
        <div className="bg-slate-900 border border-slate-800 p-10 rounded-[2.5rem] relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-indigo-600/10 blur-[120px] -z-10"></div>
          <div className="grid items-center gap-16 md:grid-cols-2">
            <div>
              <h2 className="mb-8 text-4xl italic font-black tracking-tighter uppercase">Live Preview</h2>
              <div className="space-y-8">
                <div className="space-y-3">
                  <div className="flex items-end justify-between">
                    <span className="flex items-center gap-2 text-xs font-black tracking-widest text-blue-400 uppercase">
                      <BookOpen className="w-4 h-4" /> Intelligence (INT)
                    </span>
                    <span className="text-[10px] text-slate-500 font-bold tracking-widest">LVL 42</span>
                  </div>
                  <div className="w-full h-4 p-1 border rounded-full bg-slate-800 border-slate-700">
                    <div className="h-full w-[75%] bg-gradient-to-r from-blue-600 to-blue-400 rounded-full shadow-[0_0_20px_rgba(59,130,246,0.4)]"></div>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-end justify-between">
                    <span className="flex items-center gap-2 text-xs font-black tracking-widest text-red-500 uppercase">
                      <Dumbbell className="w-4 h-4" /> Strength (STR)
                    </span>
                    <span className="text-[10px] text-slate-500 font-bold tracking-widest">LVL 28</span>
                  </div>
                  <div className="w-full h-4 p-1 border rounded-full bg-slate-800 border-slate-700">
                    <div className="h-full w-[40%] bg-gradient-to-r from-red-600 to-red-400 rounded-full shadow-[0_0_20px_rgba(239,68,68,0.4)]"></div>
                  </div>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4">
               <div className="p-6 transition-all border cursor-default group bg-slate-800/40 rounded-2xl border-slate-700 hover:border-indigo-500/50">
                  <div className="flex items-center gap-4 text-left">
                    <div className="p-3 transition-transform duration-300 bg-indigo-500/10 rounded-xl group-hover:scale-110">
                      <Sword className="w-6 h-6 text-indigo-400" />
                    </div>
                    <div>
                      <h3 className="text-sm font-black tracking-widest uppercase">Global Rank</h3>
                      <p className="text-slate-500 text-[10px] uppercase font-bold mt-1 tracking-wider">Top 5% this week</p>
                    </div>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </section>

      <section id="dev" className="max-w-4xl px-6 py-32 mx-auto text-center">
        <div className="inline-block p-2 mb-8 rounded-full shadow-2xl bg-gradient-to-r from-indigo-500 via-purple-500 to-blue-500 shadow-indigo-500/20">
          <div className="p-4 rounded-full bg-slate-950">
            <CatHeroIcon />
          </div>
        </div>
        <h2 className="mb-6 text-3xl italic font-black tracking-tighter uppercase">The Developer's Quest</h2>
        <p className="max-w-2xl mx-auto mb-10 text-lg italic font-medium leading-relaxed text-slate-400">
          "As a software developer, I spent years optimizing code while neglecting my own 'hardware.' 
          I created Hero Habit to bridge the gap — transforming knowledge into Mana and health into Might."
        </p>
        <div className="flex justify-center gap-6">
          <Twitter className="w-5 h-5 transition-all duration-300 cursor-pointer text-slate-600 hover:text-indigo-400 hover:scale-125" />
          <Heart className="w-5 h-5 transition-all duration-300 cursor-pointer text-slate-600 hover:text-red-500 hover:scale-125" />
        </div>
      </section>

      <footer className="py-24 text-center border-t border-slate-900">
        <p className="text-slate-700 text-[10px] tracking-[0.5em] uppercase font-bold">Project Hero Habit • Worldwide Alpha 2025</p>
      </footer>
    </div>
  );
};

export default App;