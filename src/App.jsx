import React, { useState, useEffect } from 'react';
import LandingView from './components/LandingView';
import AuthView from './components/AuthView';
import DashboardView from './components/DashboardView';
import MobileView from './components/MobileView';
import FacultyDemoControl from './components/FacultyDemoControl';
import { translations } from './translations';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// API Request Helper
export async function makeAPIRequest(endpoint, method = "GET", body = null) {
  const token = localStorage.getItem('authToken');
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : ''
  };
  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : null
    });
    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error || 'Request failed');
    }
    return await response.json();
  } catch (e) {
    console.warn(`[SignVision API] Fetch failed for ${endpoint}. Falling back to local offline mode.`, e);
    throw e;
  }
}

// Translations helper exported for use
export function getTranslation(lang, key) {
  const dict = translations[lang] || translations['en'];
  return dict[key] || translations['en'][key] || key;
}

function App() {
  const [currentView, setCurrentView] = useState('landing'); // landing, auth, dashboard, mobile
  const [currentUser, setCurrentUser] = useState(null);
  const [currentLanguage, setCurrentLanguage] = useState('en');
  const [notifications, setNotifications] = useState([
    { id: 1, title: 'Session Check', message: 'Ready for neural classification.', type: 'info', time: 'Just now' }
  ]);
  const [simulatedGesture, setSimulatedGesture] = useState(null);
  const [ultraDemoMode, setUltraDemoMode] = useState(false);

  // Load language preference from local storage
  useEffect(() => {
    const savedLang = localStorage.getItem('userLanguage') || 'en';
    setCurrentLanguage(savedLang);
  }, []);

  const handleLanguageChange = (lang) => {
    setCurrentLanguage(lang);
    localStorage.setItem('userLanguage', lang);
  };

  // Check authentication session on mount and hash change
  const verifySession = async () => {
    const token = localStorage.getItem('authToken');
    const hash = window.location.hash.slice(1) || 'landing';

    if (!token) {
      setCurrentUser(null);
      if (hash !== 'landing' && hash !== 'auth') {
        window.location.hash = 'landing';
        setCurrentView('landing');
      } else {
        setCurrentView(hash);
      }
    } else {
      try {
        const profile = await makeAPIRequest('/api/users/profile', 'GET');
        setCurrentUser(profile);
        if (hash === 'landing' || hash === 'auth') {
          window.location.hash = 'dashboard';
          setCurrentView('dashboard');
        } else {
          setCurrentView(hash);
        }
      } catch (e) {
        console.error("Session verification failed, logging out:", e);
        localStorage.removeItem('authToken');
        setCurrentUser(null);
        window.location.hash = 'auth';
        setCurrentView('auth');
      }
    }
  };

  // Listen for hash changes for routing
  useEffect(() => {
    verifySession();

    const handleHashChange = () => {
      verifySession();
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const handleLoginSuccess = (user, welcomeMsg) => {
    setCurrentUser(user);
    addNotification("Session Authorized", welcomeMsg, "success");
    window.location.hash = 'dashboard';
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    setCurrentUser(null);
    window.location.hash = 'landing';
  };

  const addNotification = (title, message, type = 'info') => {
    const newAlert = {
      id: Date.now(),
      title,
      message,
      type,
      time: 'Just now'
    };
    setNotifications(prev => [newAlert, ...prev]);
  };

  const handleSimulateSign = (gesture) => {
    setSimulatedGesture({ gesture, timestamp: Date.now() });
    if (window.location.hash.includes('mobile')) {
      // MobileView will switch screen to cam internally when it gets simulatedGesture
    } else {
      window.location.hash = 'dashboard/dash-sign-to-text';
    }
  };

  const handleUnlockAchievements = async () => {
    if (!currentUser) return;
    try {
      const nextUser = {
        ...currentUser,
        xp_points: 2450,
        learning_streak: 15
      };
      setCurrentUser(nextUser);
      await makeAPIRequest('/api/users/settings', 'PUT', {
        xp_points: 2450,
        learning_streak: 15
      });
      addNotification("Achievements Unlocked", "Streaks and expert badges granted.", "success");
    } catch(e) {
      console.warn("Express server offline, saved locally.");
    }
    alert("Achievements loaded successfully. Streaks and badges granted.");
  };

  return (
    <>
      {/* Dynamic View Selector */}
      {currentView === 'landing' && (
        <LandingView 
          currentLanguage={currentLanguage}
          onChangeLanguage={handleLanguageChange}
          getTranslation={getTranslation}
          onNavigate={(view) => { window.location.hash = view; }}
        />
      )}

      {currentView === 'auth' && (
        <AuthView 
          currentLanguage={currentLanguage}
          onChangeLanguage={handleLanguageChange}
          getTranslation={getTranslation}
          onLoginSuccess={handleLoginSuccess}
          onNavigate={(view) => { window.location.hash = view; }}
        />
      )}

      {currentView === 'dashboard' && (
        <DashboardView 
          user={currentUser}
          onLogout={handleLogout}
          currentLanguage={currentLanguage}
          onChangeLanguage={handleLanguageChange}
          getTranslation={getTranslation}
          notifications={notifications}
          addNotification={addNotification}
          setNotifications={setNotifications}
          activeTab={window.location.hash.includes('dash-') ? window.location.hash.split('dashboard/')[1] : 'dash-home'}
          setActiveTab={(tab) => { window.location.hash = `dashboard/${tab}`; }}
          simulatedGesture={simulatedGesture}
          ultraDemoMode={ultraDemoMode}
        />
      )}

      {currentView === 'mobile' && (
        <MobileView 
          user={currentUser}
          getTranslation={getTranslation}
          currentLanguage={currentLanguage}
          onChangeLanguage={handleLanguageChange}
          notifications={notifications}
          addNotification={addNotification}
          simulatedGesture={simulatedGesture}
          ultraDemoMode={ultraDemoMode}
        />
      )}

      {/* Faculty Demo Overlay — only in demo environments, never in production */}
      {import.meta.env.VITE_DEMO_MODE === 'true' && (currentView === 'dashboard' || currentView === 'mobile') && (
        <FacultyDemoControl
          onSimulateSign={handleSimulateSign}
          onUnlockAchievements={handleUnlockAchievements}
          ultraDemoMode={ultraDemoMode}
          onToggleUltraMode={setUltraDemoMode}
        />
      )}
    </>
  );
}

export default App;
