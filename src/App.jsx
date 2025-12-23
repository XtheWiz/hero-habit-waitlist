import React, { useState, useEffect } from 'react';
import { BookOpen, Dumbbell, Shield, Sword, Zap, ChevronRight, Twitter, Globe, Trophy, Users, Heart, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged, signInWithCustomToken } from 'firebase/auth';
import { getFirestore, collection, addDoc, serverTimestamp, getDocs, query } from 'firebase/firestore';

// --- Safe Environment Variable Access ---
const getEnvVar = (key) => {
  try {
    // 1. Check for Preview environment globals
    if (key === 'FIREBASE_CONFIG' && typeof __firebase_config !== 'undefined') return JSON.parse(__firebase_config);
    if (key === 'APP_ID' && typeof __app_id !== 'undefined') return __app_id;
    
    // 2. Check for Vite environment variables (Production/Local)
    // We use a safe check for import.meta.env to prevent compiler crashes in certain environments
    const metaEnv = (typeof import.meta !== 'undefined' && import.meta.env) ? import.meta.env : {};
    const viteKey = `VITE_${key}`;
    const value = metaEnv[viteKey];
    
    if (key === 'FIREBASE_CONFIG' && value) {
      // Clean potential quotes from Vercel/Terminal inputs
      const cleanJson = value.trim().replace(/^'|'$/g, '');
      return JSON.parse(cleanJson);
    }
    if (value) return value;

    // 3. Absolute Fallback for Canvas Preview only
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
      // RULE 3: Auth Before Queries
      let currentUser = user;
      if (!currentUser) {
        const cred = await signInAnonymously(auth);
        currentUser = cred.user;
      }

      // RULE 1: Strict Paths (ALWAYS use the artifacts structure to avoid permission issues)
      // This path is mandatory for the persistence layer to function correctly
      const waitlistRef = collection(db, 'artifacts', appId, 'public', 'data', 'waitlist');
      
      // RULE 2: No complex queries. Fetch all and check in memory.
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
        userAgent: navigator.userAgent
      });
      
      setIsSubmitted(true);
      setEmail('');
    } catch (error) {
      // Log full error to console for debugging on Vercel
      console.error("Firestore submission failed. Details:", error);
      setStatusMsg({ 
        type: 'error', 
        text: `Guild registration failed: ${error.code || 'Unknown Error'}. Please check console.` 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const CatHeroIcon = () => (
    <svg viewBox="0 0 100 100" className="w-28 h-28 drop-shadow-[0_0_15px_rgba(99,102,241,0.5)]" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="55" r="35" fill="rgba(99,102,241,0.1)" />
      <path d="M35 70L40 55H60L65 70L50 80L35 7