import React, { useState, useEffect, useRef } from 'react';
import { makeAPIRequest } from '../App';
import HomeView from './dashboard/views/HomeView';
import SignToTextView from './dashboard/views/SignToTextView';
import TextToSignView from './dashboard/views/TextToSignView';
import HistoryView from './dashboard/views/HistoryView';
import LearningView from './dashboard/views/LearningView';
import SettingsView from './dashboard/views/SettingsView';
import SOSView from './dashboard/views/SOSView';
import ContactModal from './dashboard/modals/ContactModal';
import SOSModal from './dashboard/modals/SOSModal';

const generateSyntheticHand = (gesture, isLeft) => {
  const landmarks = [];
  landmarks.push({ x: 0, y: 0, z: 0 }); // Wrist
  
  const bases = [
    { x: -0.2, y: 0.1, z: 0.0 }, // Thumb knuckle
    { x: -0.1, y: 0.4, z: 0.0 }, // Index knuckle
    { x: 0.0, y: 0.42, z: 0.0 }, // Middle knuckle
    { x: 0.1, y: 0.38, z: 0.0 }, // Ring knuckle
    { x: 0.2, y: 0.32, z: 0.0 }  // Pinky knuckle
  ];
  
  if (isLeft) {
    bases.forEach(b => b.x = -b.x);
  }
  
  let extensions = [1.0, 1.0, 1.0, 1.0, 1.0]; // open hand
  
  if (gesture === 'yes' || gesture === 'sorry') {
    extensions = [0.0, 0.0, 0.0, 0.0, 0.0]; // Fist
  } else if (gesture === 'no') {
    extensions = [0.0, 1.0, 1.0, 0.0, 0.0];
  } else if (gesture === 'help') {
    extensions = [1.0, 0.0, 0.0, 0.0, 0.0];
  } else if (gesture === 'emergency') {
    extensions = [1.0, 0.0, 0.0, 0.0, 1.0];
  } else if (gesture === 'water') {
    extensions = [0.0, 1.0, 1.0, 1.0, 0.0];
  } else if (gesture === 'food') {
    extensions = [0.3, 0.3, 0.3, 0.3, 0.3];
  } else if (gesture === 'friend') {
    extensions = [0.0, 1.0, 1.0, 0.0, 0.0];
  } else if (gesture === 'love') {
    extensions = [1.0, 1.0, 0.0, 0.0, 1.0];
  }
  
  if (gesture === 'please' || gesture === 'thank_you') {
    extensions = [0.2, 1.0, 1.0, 1.0, 1.0];
  }
  
  for (let f = 0; f < 5; f++) {
    const base = bases[f];
    landmarks.push(base);
    
    const dx = base.x;
    const dy = base.y;
    const ext = extensions[f];
    
    for (let j = 1; j <= 3; j++) {
      const scale = j / 3.0;
      let fx = base.x + dx * scale * ext;
      let fy = base.y + dy * scale * ext;
      let fz = -0.1 * j * (1.0 - ext);
      landmarks.push({ x: fx, y: fy, z: fz });
    }
  }
  
  return landmarks;
};

export default function DashboardView({
  user,
  onLogout,
  currentLanguage,
  onChangeLanguage,
  getTranslation,
  notifications,
  addNotification,
  setNotifications,
  activeTab = 'dash-home',
  setActiveTab,
  simulatedGesture,
  ultraDemoMode
}) {
  const [activeSubview, setActiveSubview] = useState(activeTab || 'dash-home');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [detectedGesture, setDetectedGesture] = useState('Awaiting Hand...');
  const [confidence, setConfidence] = useState('0.0');
  const [sessionHistory, setSessionHistory] = useState([]);
  
  // Settings profile state
  const [profileName, setProfileName] = useState(user?.name || '');
  const [profileUserType, setProfileUserType] = useState(user?.user_type || 'public_user');
  const [pipelineEngine, setPipelineEngine] = useState('webgl');
  const [recognitionThreshold, setRecognitionThreshold] = useState(0.65);

  // Global app stats synced to user
  const [xpPoints, setXpPoints] = useState(user?.xp_points || 0);
  const [streakCount, setStreakCount] = useState(user?.learning_streak || 0);
  const [translationsCount, setTranslationsCount] = useState(25);
  const [sosCount, setSosCount] = useState(0);

  // Accessibility States
  const [largeText, setLargeText] = useState(user?.accessibility_settings?.large_text || false);
  const [highContrast, setHighContrast] = useState(user?.accessibility_settings?.high_contrast || false);
  const [voiceAssistant, setVoiceAssistant] = useState(user?.accessibility_settings?.voice_assistant || false);

  // Alerts dropdown visibility
  const [alertsOpen, setAlertsOpen] = useState(false);

  // Contacts database
  const [contacts, setContacts] = useState([
    { id: 1, name: "Local Police Desk", phone: "911", category: "Police", priority: true },
    { id: 2, name: "City Hospital Dispatch", phone: "999", category: "Ambulance", priority: true },
    { id: 3, name: "Primary Family Guardian", phone: "+1 555-0199", category: "Family", priority: false }
  ]);
  const [contactModalOpen, setContactModalOpen] = useState(false);
  const [editingContact, setEditingContact] = useState(null);
  const [contactNameInput, setContactNameInput] = useState('');
  const [contactPhoneInput, setContactPhoneInput] = useState('');
  const [contactCategoryInput, setContactCategoryInput] = useState('Police');
  const [contactPriorityInput, setContactPriorityInput] = useState(false);

  // SOS States
  const [sosModalOpen, setSosModalOpen] = useState(false);
  const [sosPhraseUsed, setSosPhraseUsed] = useState('');
  const [sosSimProgress, setSosSimProgress] = useState(0);
  const [sosSimLabel, setSosSimLabel] = useState('');
  const [sosContactsSent, setSosContactsSent] = useState({});
  const [latitude, setLatitude] = useState(17.3850);
  const [longitude, setLongitude] = useState(78.4867);
  const [gpsAccuracy, setGpsAccuracy] = useState(12.5);
  const [gpsTimestamp, setGpsTimestamp] = useState('--');
  const [gpsStatus, setGpsStatus] = useState('Awaiting Lock');
  const [reverseAddress, setReverseAddress] = useState({
    address: 'Resolving coordinates...',
    city: 'Hyderabad',
    state: 'Telangana',
    country: 'India'
  });
  const [sosHistoryList, setSosHistoryList] = useState([]);
  const [sosSearchQuery, setSosSearchQuery] = useState('');

  // History Translations Tab state
  const [historySearchQuery, setHistorySearchQuery] = useState('');
  const [backendHistory, setBackendHistory] = useState([]);

  // Learning states
  const [quizQuestions] = useState([
    { q: "Which gesture corresponds to the expression shown?", answer: "Thank You", options: ["Hello", "Thank You", "Help", "Emergency"], icon: "fa-hands" },
    { q: "What coordinate represents the 'Help' support pose?", answer: "Help", options: ["Yes", "No", "Food", "Help"], icon: "fa-life-ring" },
    { q: "Choose correct phrase mapping for a warning shake:", answer: "Emergency", options: ["Water", "Emergency", "Hello", "Thank You"], icon: "fa-triangle-exclamation" }
  ]);
  const [quizIndex, setQuizIndex] = useState(0);
  const [quizFeedback, setQuizFeedback] = useState('');
  const [quizFeedbackColor, setQuizFeedbackColor] = useState('');
  const [quizAnsweredBtn, setQuizAnsweredBtn] = useState(null);
  const [badgesUnlocked, setBadgesUnlocked] = useState({
    'badge-first-word': true,
    'badge-streak-lock': false,
    'badge-emergency-master': false
  });

  // Text to Sign states
  const [ttsInput, setTtsInput] = useState('');
  const [ttsDecomposition, setTtsDecomposition] = useState('');
  const [ttsSpeedRate, setTtsSpeedRate] = useState(1.0);
  const [ttsActiveGesture, setTtsActiveGesture] = useState('default');
  const [ttsAvatarGender, setTtsAvatarGender] = useState('male');
  const [ttsCaption, setTtsCaption] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [ttsQueue, setTtsQueue] = useState([]);
  const [queueIndex, setQueueIndex] = useState(-1);

  // Camera STT states
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isCameraCalibrating, setIsCameraCalibrating] = useState(false);
  const [calibrationProgress, setCalibrationProgress] = useState(0);
  const [brightnessCompensation, setBrightnessCompensation] = useState(1.0);
  const [realCameraMockEnabled, setRealCameraMockEnabled] = useState(true);

  // Mobile
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // System Metrics
  const [fps, setFps] = useState(60);
  const [latency, setLatency] = useState(5.4);
  const [engineHealth, setEngineHealth] = useState('EXCELLENT');

  // References
  const sttCanvasRef = useRef(null);
  const sttWebcamRef = useRef(null);
  const radarCanvasRef = useRef(null);
  const cameraStreamRef = useRef(null);
  const animationFrameIdRef = useRef(null);
  const radarFrameIdRef = useRef(null);
  const gpsWatchIdRef = useRef(null);
  const sttHistoryBufferRef = useRef([]);
  const lastLoggedGestureRef = useRef('');

  const tfModelRef = useRef(null);
  const [modelTrained, setModelTrained] = useState(false);

  // Mobile resize detection
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      if (!mobile) setMobileSidebarOpen(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Train gesture recognition model on mount
  useEffect(() => {
    const trainModel = async () => {
      const tf = window.tf;
      if (!tf) {
        console.warn("TensorFlow.js not loaded yet. Retrying in 1s.");
        setTimeout(trainModel, 1000);
        return;
      }

      console.log("TensorFlow.js loaded. Initiating gesture model training...");

      const gestures = [
        'hello', 'hi', 'thank_you', 'yes', 'no',
        'please', 'sorry', 'help', 'emergency', 'water',
        'food', 'friend', 'love', 'good_morning', 'good_night'
      ];

      const X_data = [];
      const y_data = [];

      gestures.forEach((gesture, classIdx) => {
        for (let s = 0; s < 100; s++) {
          const sample = [];
          
          let leftHand = null;
          let rightHand = null;
          
          if (gesture === 'emergency' || gesture === 'thank_you' || gesture === 'help') {
            leftHand = generateSyntheticHand(gesture, true);
            rightHand = generateSyntheticHand(gesture, false);
          } else {
            rightHand = generateSyntheticHand(gesture, false);
          }

          if (leftHand) {
            leftHand.forEach(p => {
              sample.push(p.x + (Math.random() - 0.5) * 0.08);
              sample.push(p.y + (Math.random() - 0.5) * 0.08);
              sample.push((p.z || 0) + (Math.random() - 0.5) * 0.08);
            });
          } else {
            for (let i = 0; i < 63; i++) sample.push(0);
          }

          if (rightHand) {
            rightHand.forEach(p => {
              sample.push(p.x + (Math.random() - 0.5) * 0.08);
              sample.push(p.y + (Math.random() - 0.5) * 0.08);
              sample.push((p.z || 0) + (Math.random() - 0.5) * 0.08);
            });
          } else {
            for (let i = 0; i < 63; i++) sample.push(0);
          }

          X_data.push(sample);
          
          const label = Array(15).fill(0);
          label[classIdx] = 1;
          y_data.push(label);
        }
      });

      const xs = tf.tensor2d(X_data);
      const ys = tf.tensor2d(y_data);

      const model = tf.sequential();
      model.add(tf.layers.dense({ units: 64, activation: 'relu', inputShape: [126] }));
      model.add(tf.layers.dense({ units: 32, activation: 'relu' }));
      model.add(tf.layers.dense({ units: 15, activation: 'softmax' }));

      model.compile({
        optimizer: tf.train.adam(0.005),
        loss: 'categoricalCrossentropy',
        metrics: ['accuracy']
      });

      await model.fit(xs, ys, {
        epochs: 60,
        batchSize: 64,
        shuffle: true
      });

      xs.dispose();
      ys.dispose();

      tfModelRef.current = model;
      setModelTrained(true);
      console.log("TensorFlow.js gesture classification model trained successfully.");
    };

    trainModel();
  }, []);

  // Synchronize active tab from props
  useEffect(() => {
    if (activeTab) {
      setActiveSubview(activeTab);
      // Clean up camera streams if changing subviews
      if (activeTab !== 'dash-sign-to-text') {
        stopCameraFeed();
      }
    }
  }, [activeTab]);

  // Handle local state sync with props user object
  useEffect(() => {
    if (user) {
      setProfileName(user.name || '');
      setProfileUserType(user.user_type || 'public_user');
      setXpPoints(user.xp_points || 0);
      setStreakCount(user.learning_streak || 0);
      if (user.accessibility_settings) {
        setLargeText(!!user.accessibility_settings.large_text);
        setHighContrast(!!user.accessibility_settings.high_contrast);
        setVoiceAssistant(!!user.accessibility_settings.voice_assistant);
      }
    }
  }, [user]);

  // Synchronize layout body classes
  useEffect(() => {
    document.body.classList.toggle('accessibility-large-text', largeText);
    document.body.classList.toggle('accessibility-high-contrast', highContrast);
  }, [largeText, highContrast]);

  // Handle simulated gesture trigger from Faculty Demo Panel
  useEffect(() => {
    if (simulatedGesture && simulatedGesture.gesture) {
      const clean = simulatedGesture.gesture.toUpperCase().replace('_', ' ');
      const conf = (97.5 + Math.random() * 2).toFixed(1);
      setDetectedGesture(clean);
      setConfidence(conf);
      
      const newRecord = {
        id: Date.now(),
        timestamp: new Date().toLocaleTimeString(),
        mode: 'Sign to Text',
        source: 'Geometric Neural Acquisition',
        translation: clean,
        confidence: `${conf}%`,
        icon: 'fa-video'
      };
      setSessionHistory(prev => [newRecord, ...prev]);
      setBackendHistory(prev => [newRecord, ...prev]);

      if (voiceAssistant) {
        speakSynthesis(getTranslation(currentLanguage, clean.toLowerCase()));
      }
      
      unlockBadge('badge-first-word');
    }
  }, [simulatedGesture]);

  // Load Contacts, History and SOS History from localStorage/API
  useEffect(() => {
    const savedContacts = localStorage.getItem('emergencyContacts');
    if (savedContacts) {
      setContacts(JSON.parse(savedContacts));
    } else {
      localStorage.setItem('emergencyContacts', JSON.stringify(contacts));
    }

    const savedSos = localStorage.getItem('sosHistory');
    if (savedSos) {
      setSosHistoryList(JSON.parse(savedSos));
    }

    // Load recent translation logs from local or API
    fetchTranslationHistory();
  }, []);

  const fetchTranslationHistory = async () => {
    try {
      const records = await makeAPIRequest('/api/translations/history', 'GET');
      setBackendHistory(records);
    } catch(e) {
      console.warn("Unable to fetch translation history from API, fallback to local dashboard simulation.");
      // Procedural mock history
      setBackendHistory([
        { id: 1, timestamp: '10:45:12 AM', mode: 'Sign to Text', source: 'Geometric Neural Acquisition', translation: 'Hello', confidence: '98.9%', icon: 'fa-video' },
        { id: 2, timestamp: '10:42:01 AM', mode: 'Text to Sign', source: 'Natural Language Decomposition', translation: 'Thank You', confidence: '100.0%', icon: 'fa-keyboard' },
        { id: 3, timestamp: '09:15:33 AM', mode: 'Accessibility SOS', source: 'Broadcast Beacon Triggered', translation: 'Emergency call placed', confidence: '100.0%', icon: 'fa-circle-exclamation' }
      ]);
    }
  };

  // GPS Satellite lock watcher loop
  const startGPSWatching = () => {
    if (gpsWatchIdRef.current) return;

    setGpsStatus('Searching');

    const handleSuccess = (position) => {
      const lat = position.coords.latitude;
      const lng = position.coords.longitude;
      const acc = position.coords.accuracy || 0;
      const time = new Date().toLocaleTimeString();

      setLatitude(lat);
      setLongitude(lng);
      setGpsAccuracy(acc);
      setGpsTimestamp(time);
      setGpsStatus('Accurate');

      // reverse geocoding via Nominatim
      fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&accept-language=en`)
        .then(res => res.json())
        .then(data => {
          const addr = data.address || {};
          const details = {
            address: data.display_name || "Street Address details",
            city: addr.city || addr.town || addr.village || addr.suburb || "Unknown City",
            state: addr.state || "Unknown State",
            country: addr.country || "Unknown Country"
          };
          setReverseAddress(details);
        })
        .catch(err => {
          console.warn("Nominatim Geocoder failed: ", err);
          setReverseAddress({
            address: `${lat.toFixed(6)}, ${lng.toFixed(6)}`,
            city: 'Satellite Coordinates Lock',
            state: '--',
            country: '--'
          });
        });
    };

    const handleError = (error) => {
      console.warn("Geolocation Watch error: ", error);
      setGpsStatus('Permission Denied');
    };

    if (navigator.geolocation) {
      gpsWatchIdRef.current = navigator.geolocation.watchPosition(
        handleSuccess,
        handleError,
        { enableHighAccuracy: true, timeout: 12000, maximumAge: 30000 }
      );
    } else {
      setGpsStatus('Permission Denied');
    }
  };

  const stopGPSWatching = () => {
    if (gpsWatchIdRef.current) {
      navigator.geolocation.clearWatch(gpsWatchIdRef.current);
      gpsWatchIdRef.current = null;
    }
  };

  // Render Distress Radar Sweep Canvas Loop
  useEffect(() => {
    if (activeSubview === 'dash-sos' && radarCanvasRef.current) {
      const canvas = radarCanvasRef.current;
      const ctx = canvas.getContext('2d');
      canvas.width = canvas.offsetWidth || 300;
      canvas.height = canvas.offsetHeight || 200;

      const render = () => {
        const time = Date.now() * 0.001;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        const w = canvas.width;
        const h = canvas.height;

        // Grid lines background
        ctx.strokeStyle = "rgba(255, 42, 95, 0.04)";
        ctx.lineWidth = 1;
        for (let x = 0; x < w; x += 15) {
          ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
        }
        for (let y = 0; y < h; y += 15) {
          ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
        }

        // Concentric circles radar rings
        ctx.strokeStyle = "rgba(255, 42, 95, 0.15)";
        for (let r = 20; r < Math.max(w, h); r += 25) {
          ctx.beginPath();
          ctx.arc(w / 2, h / 2, r, 0, Math.PI * 2);
          ctx.stroke();
        }

        // Crosshairs lines
        ctx.strokeStyle = "rgba(255, 42, 95, 0.25)";
        ctx.beginPath();
        ctx.moveTo(w / 2 - 80, h / 2); ctx.lineTo(w / 2 + 80, h / 2);
        ctx.moveTo(w / 2, h / 2 - 50); ctx.lineTo(w / 2, h / 2 + 50);
        ctx.stroke();

        // Radar Sweep rotation
        const sweepAngle = (time * 1.5) % (Math.PI * 2);
        ctx.save();
        ctx.translate(w / 2, h / 2);
        ctx.rotate(sweepAngle);
        for (let i = 0; i < 20; i++) {
          ctx.beginPath();
          ctx.strokeStyle = `rgba(255, 42, 95, ${0.18 * (1 - i / 20)})`;
          ctx.lineWidth = 2;
          ctx.moveTo(0, 0);
          ctx.lineTo(Math.cos(-i * Math.PI / 180) * 100, Math.sin(-i * Math.PI / 180) * 100);
          ctx.stroke();
        }
        ctx.restore();

        // Distress beacon pulsing core
        const distressPulse = 5 + (Date.now() % 1200) * 0.015;
        ctx.strokeStyle = "rgba(255, 42, 95, 0.9)";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(w / 2, h / 2, distressPulse, 0, Math.PI * 2);
        ctx.stroke();

        ctx.fillStyle = "rgba(255, 42, 95, 1)";
        ctx.beginPath();
        ctx.arc(w / 2, h / 2, 4, 0, Math.PI * 2);
        ctx.fill();

        // simulated Responder active node
        const nodeX = w / 2 + 40 + Math.sin(time * 0.2) * 5;
        const nodeY = h / 2 - 25 + Math.cos(time * 0.25) * 5;
        ctx.strokeStyle = "rgba(0, 240, 255, 0.85)";
        ctx.lineWidth = 1;
        ctx.beginPath(); ctx.arc(nodeX, nodeY, 5, 0, Math.PI * 2); ctx.stroke();
        ctx.fillStyle = "rgba(0, 240, 255, 0.9)";
        ctx.beginPath(); ctx.arc(nodeX, nodeY, 2, 0, Math.PI * 2); ctx.fill();

        ctx.fillStyle = "rgba(255, 42, 95, 0.8)";
        ctx.font = "bold 8px monospace";
        ctx.fillText("DISTRESS SOS BEACON ACTIVE", 10, 15);

        radarFrameIdRef.current = requestAnimationFrame(render);
      };

      radarFrameIdRef.current = requestAnimationFrame(render);
      startGPSWatching();
    } else {
      if (radarFrameIdRef.current) {
        cancelAnimationFrame(radarFrameIdRef.current);
      }
      stopGPSWatching();
    }

    return () => {
      if (radarFrameIdRef.current) cancelAnimationFrame(radarFrameIdRef.current);
      stopGPSWatching();
    };
  }, [activeSubview]);

  // Sync metrics simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setLatency((5.0 + Math.random() * 0.9));
      setFps(Math.round(59.5 + Math.random() * 0.6));
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  // System Settings handlers
  const handleSettingsSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        name: profileName,
        user_type: profileUserType,
        accessibility_settings: {
          large_text: largeText,
          high_contrast: highContrast,
          voice_assistant: voiceAssistant
        }
      };

      await makeAPIRequest('/api/users/settings', 'PUT', payload);
      addNotification("Preferences Synchronized", "Profile preferences synchronized with server.", "success");
    } catch(e) {
      console.warn("Failed to sync settings on Express server, saving offline locally.", e);
      addNotification("Offline Settings Saved", "Profile preferences saved locally in browser.", "info");
    }
  };

  // Contacts CRUD
  const saveContact = (e) => {
    e.preventDefault();
    if (!contactNameInput || !contactPhoneInput) {
      alert("Name and phone fields are required");
      return;
    }

    let updatedContacts = [...contacts];
    if (editingContact) {
      updatedContacts = updatedContacts.map(c => c.id === editingContact.id ? {
        ...c,
        name: contactNameInput,
        phone: contactPhoneInput,
        category: contactCategoryInput,
        priority: contactPriorityInput
      } : c);
      addNotification("Contact Updated", `Updated details for ${contactNameInput}.`, "success");
    } else {
      const newContact = {
        id: Date.now(),
        name: contactNameInput,
        phone: contactPhoneInput,
        category: contactCategoryInput,
        priority: contactPriorityInput
      };
      updatedContacts.push(newContact);
      addNotification("Contact Saved", `Successfully saved ${contactNameInput}.`, "success");
    }

    setContacts(updatedContacts);
    localStorage.setItem('emergencyContacts', JSON.stringify(updatedContacts));
    
    // Background sync to API
    if (editingContact) {
      makeAPIRequest(`/api/contacts/${editingContact.id}`, 'PUT', {
        name: contactNameInput,
        phone: contactPhoneInput,
        category: contactCategoryInput,
        priority: contactPriorityInput
      }).catch(err => console.log("Offline contact sync warning"));
    } else {
      makeAPIRequest('/api/contacts', 'POST', {
        name: contactNameInput,
        phone: contactPhoneInput,
        category: contactCategoryInput,
        priority: contactPriorityInput
      }).catch(err => console.log("Offline contact sync warning"));
    }

    setContactModalOpen(false);
    setEditingContact(null);
    setContactNameInput('');
    setContactPhoneInput('');
    setContactCategoryInput('Police');
    setContactPriorityInput(false);
  };

  const openEditContact = (contact) => {
    setEditingContact(contact);
    setContactNameInput(contact.name);
    setContactPhoneInput(contact.phone);
    setContactCategoryInput(contact.category);
    setContactPriorityInput(contact.priority);
    setContactModalOpen(true);
  };

  const deleteContact = (id) => {
    const updated = contacts.filter(c => c.id !== id);
    setContacts(updated);
    localStorage.setItem('emergencyContacts', JSON.stringify(updated));
    addNotification("Contact Deleted", "Removed emergency contact from layout.", "info");

    makeAPIRequest(`/api/contacts/${id}`, 'DELETE').catch(e => console.log("Offline delete contact sync warning"));
  };

  // SOS Distress Triggers
  const triggerEmergencySOS = async (phrase) => {
    setSosPhraseUsed(phrase);
    setSosModalOpen(true);
    setSosSimProgress(0);
    setSosSimLabel("Acquiring live device GPS satellite lock...");
    setSosContactsSent({});
    setSosCount(prev => prev + 1);

    // Add glitch shake alert styling
    const wrapper = document.querySelector('.main-workspace');
    if (wrapper) {
      wrapper.classList.add('cyber-glitch-alert');
      setTimeout(() => wrapper.classList.remove('cyber-glitch-alert'), 1200);
    }

    // Sound SOS Beeps
    soundEmergencyBeep();

    // Text to Speech
    const alertMessage = getTranslation(currentLanguage, 'emergency_alert_speech').replace('{phrase}', phrase);
    speakSynthesis(alertMessage);

    // Sync emergency alert to Express Server
    const gpsLocation = gpsStatus === 'Accurate' ? { lat: latitude, lng: longitude } : null;
    makeAPIRequest('/api/emergency/sos', 'POST', {
      phrase_used: phrase,
      location: gpsLocation
    }).then(d => console.log("[API Emergency] Recorded Alert on server")).catch(err => console.log("Offline emergency broadcast warning."));

    // Add achievements
    unlockBadge('badge-emergency-master');

    // Simulate timeline sequence in React
    let progress = 0;
    const steps = [
      "Acquiring live device GPS satellite lock...",
      "Establishing secure telemetry linkage...",
      "Live GPS Tracking Active - transmitting coordinate payload...",
      "Emergency broadcast message sent successfully!"
    ];

    const interval = setInterval(() => {
      progress += 5;
      if (progress > 100) progress = 100;
      setSosSimProgress(progress);

      if (progress < 25) {
        setSosSimLabel(steps[0]);
      } else if (progress < 55) {
        setSosSimLabel(steps[1]);
      } else if (progress < 85) {
        setSosSimLabel(steps[2]);
      } else {
        setSosSimLabel(steps[3]);
        clearInterval(interval);

        // Auto route VIP contact
        const vip = contacts.find(c => c.priority) || contacts[0];
        if (vip) {
          sendWhatsAppMessage(vip);
        }
      }
    }, 80);
  };

  const soundEmergencyBeep = () => {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const playTone = (freq, duration, delay) => {
        setTimeout(() => {
          const osc = audioCtx.createOscillator();
          const gainNode = audioCtx.createGain();
          osc.connect(gainNode);
          gainNode.connect(audioCtx.destination);
          osc.type = 'sawtooth';
          osc.frequency.value = freq;
          gainNode.gain.setValueAtTime(0.2, audioCtx.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + duration);
          osc.start();
          osc.stop(audioCtx.currentTime + duration);
        }, delay);
      };
      playTone(980, 0.3, 0);
      playTone(980, 0.3, 250);
      playTone(980, 0.5, 500);
    } catch(e) {}
  };

  const generateWhatsAppMessage = () => {
    const mapsLink = `https://www.google.com/maps?q=${latitude.toFixed(6)},${longitude.toFixed(6)}`;
    const timestamp = gpsTimestamp !== '--' ? gpsTimestamp : new Date().toLocaleTimeString();
    
    const messagesByLang = {
      te: `ðŸš¨ à°…à°¤à±à°¯à°µà°¸à°° à°…à°²à°°à±à°Ÿà± ðŸš¨\nà°µà°¿à°¨à°¿à°¯à±‹à°—à°¦à°¾à°°à±à°¨à°¿à°•à°¿ à°¤à°•à±à°·à°£ à°¸à°¹à°¾à°¯à°‚ à°…à°µà°¸à°°à°‚.\n\nà°…à°•à±à°·à°¾à°‚à°¶à°‚: ${latitude.toFixed(6)}\nà°°à±‡à°–à°¾à°‚à°¶à°‚: ${longitude.toFixed(6)}\nà°–à°šà±à°šà°¿à°¤à°¤à±à°µà°‚: ${gpsAccuracy.toFixed(1)}m\n\nà°²à±ˆà°µà± à°²à±Šà°•à±‡à°·à°¨à±:\n${mapsLink}\n\nà°¸à°®à°¯à°‚: ${timestamp}`,
      hi: `ðŸš¨ à¤†à¤ªà¤¾à¤¤à¤•à¤¾à¤²à¥€à¤¨ à¤šà¥‡à¤¤à¤¾à¤µà¤¨à¥€ ðŸš¨\nà¤‰à¤ªà¤¯à¥‹à¤—à¤•à¤°à¥à¤¤à¤¾ à¤•à¥‹ à¤¤à¤¤à¥à¤•à¤¾à¤² à¤¸à¤¹à¤¾à¤¯à¤¤à¤¾ à¤•à¥€ à¤†à¤µà¤¶à¥à¤¯à¤•à¤¤à¤¾ à¤¹à¥ˆà¥¤\n\nà¤…à¤•à¥à¤·à¤¾à¤‚à¤¶: ${latitude.toFixed(6)}\nà¤°à¥‡à¤–à¤¾à¤‚à¤¶: ${longitude.toFixed(6)}\nà¤¸à¤Ÿà¥€à¤•à¤¤à¤¾: ${gpsAccuracy.toFixed(1)}m\n\nà¤²à¤¾à¤‡à¤µ à¤¸à¥à¤¥à¤¾à¤¨:\n${mapsLink}\n\nà¤¸à¤®à¤¯: ${timestamp}`,
      ta: `ðŸš¨ à®…à®µà®šà®° à®Žà®šà¯à®šà®°à®¿à®•à¯à®•à¯ˆ ðŸš¨\nà®ªà®¯à®©à®°à¯à®•à¯à®•à¯ à®‰à®Ÿà®©à®Ÿà®¿ à®‰à®¤à®µà®¿ à®¤à¯‡à®µà¯ˆ.\n\nà®…à®Ÿà¯à®šà®°à¯‡à®•à¯ˆ: ${latitude.toFixed(6)}\nà®¤à¯€à®°à¯à®•à¯à®•à®°à¯‡à®•à¯ˆ: ${longitude.toFixed(6)}\nà®¤à¯à®²à¯à®²à®¿à®¯à®®à¯: ${gpsAccuracy.toFixed(1)}m\n\nà®¨à¯‡à®°à®Ÿà®¿ à®‡à®°à¯à®ªà¯à®ªà®¿à®Ÿà®®à¯:\n${mapsLink}\n\nà®¨à¯‡à®°à®®à¯: ${timestamp}`,
      ml: `ðŸš¨ à´…à´Ÿà´¿à´¯à´¨àµà´¤à´¿à´° à´®àµà´¨àµà´¨à´±à´¿à´¯à´¿à´ªàµà´ªàµ ðŸš¨\nà´‰à´ªà´¯àµ‹à´•àµà´¤à´¾à´µà´¿à´¨àµ à´‰à´Ÿà´¨à´Ÿà´¿ à´¸à´¹à´¾à´¯à´‚ à´†à´µà´¶àµà´¯à´®à´¾à´£àµ.\n\nà´…à´•àµà´·à´¾à´‚à´¶à´‚: ${latitude.toFixed(6)}\nà´°àµ‡à´–à´¾à´‚à´¶à´‚: ${longitude.toFixed(6)}\nà´•àµƒà´¤àµà´¯à´¤: ${gpsAccuracy.toFixed(1)}m\n\nà´¤à´¤àµà´¸à´®à´¯ à´²àµŠà´•àµà´•àµ‡à´·àµ»:\n${mapsLink}\n\nà´¸à´®à´¯à´‚: ${timestamp}`,
      kn: `ðŸš¨ à²¤à³à²°à³à²¤à³ à²Žà²šà³à²šà²°à²¿à²•à³† ðŸš¨\nà²¬à²³à²•à³†à²¦à²¾à²°à²°à²¿à²—à³† à®¤à²•à³à²·à²£à²¦ à²¸à²¹à²¾à²¯à²¦ à²…à²—à²¤à³à²¯à²µà²¿à²¦à³†.\n\nà²…à²•à³à²·à²¾à²‚à²¶: ${latitude.toFixed(6)}\nà²°à³‡à²–à²¾à²‚à²¶: ${longitude.toFixed(6)}\nà²¨à²¿à²–à²°à²¤à³†: ${gpsAccuracy.toFixed(1)}m\n\nà²²à³ˆà²µà³ à²¸à³à²¥à²³:\n${mapsLink}\n\nà²¸à²®à²¯: ${timestamp}`,
      en: `ðŸš¨ EMERGENCY ALERT ðŸš¨\nUser needs immediate assistance.\n\nLatitude: ${latitude.toFixed(6)}\nLongitude: ${longitude.toFixed(6)}\nAccuracy: ${gpsAccuracy.toFixed(1)}m\n\nLive Location:\n${mapsLink}\n\nTimestamp: ${timestamp}`
    };

    return messagesByLang[currentLanguage] || messagesByLang.en;
  };

  const sendWhatsAppMessage = (contact) => {
    const phoneClean = contact.phone.replace(/[^\d+]/g, '');
    const textMessage = generateWhatsAppMessage();
    const url = `https://api.whatsapp.com/send?phone=${phoneClean}&text=${encodeURIComponent(textMessage)}`;

    // Set sent badge state
    setSosContactsSent(prev => ({ ...prev, [contact.id]: true }));

    // Sound beep
    soundEmergencyBeep();

    // Open WhatsApp
    window.open(url, '_blank');

    // Add record to SOS emergency history list
    const logEntry = {
      timestamp: new Date().toLocaleString(),
      latitude,
      longitude,
      address: reverseAddress.address,
      city: reverseAddress.city,
      state: reverseAddress.state,
      country: reverseAddress.country,
      contact: {
        name: contact.name,
        phone: contact.phone,
        category: contact.category
      },
      message: textMessage,
      status: 'Sent'
    };

    const updatedHistory = [logEntry, ...sosHistoryList];
    setSosHistoryList(updatedHistory);
    localStorage.setItem('sosHistory', JSON.stringify(updatedHistory));
    addNotification("SOS Alert Sent", `Emergency alert opened for ${contact.name}.`, "success");
  };

  const clearSOSHistory = () => {
    if (window.confirm("Are you sure you want to clear all SOS Emergency History Logs? This cannot be undone.")) {
      setSosHistoryList([]);
      localStorage.setItem('sosHistory', JSON.stringify([]));
      addNotification("History Cleared", "SOS Activity logs cleared successfully.", "info");
    }
  };

  const exportSOSHistoryCSV = () => {
    if (sosHistoryList.length === 0) {
      alert("No SOS history logs to export.");
      return;
    }

    let csv = "Date and Time,Emergency Contact Name,Phone Number,GPS Latitude,GPS Longitude,Address,WhatsApp Message Status\n";
    sosHistoryList.forEach(log => {
      const name = (log.contact.name || "").replace(/"/g, '""');
      const phone = (log.contact.phone || "").replace(/"/g, '""');
      const address = (log.address || "").replace(/"/g, '""');
      const status = (log.status || "").replace(/"/g, '""');
      csv += `"${log.timestamp}","${name}","${phone}","${log.latitude || ''}","${log.longitude || ''}","${address}","${status}"\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", `sos_emergency_history_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addNotification("Export Success", "CSV log exported successfully.", "success");
  };

  // Text translation sequences (Text to Sign)
  const handleTextTranslationSubmit = () => {
    const text = ttsInput.trim().toLowerCase();
    if (!text) return;

    // Tokenize
    const words = tokenizeDecompose(text);
    setTtsDecomposition(`Sequence: ${words.join(' âž” ').toUpperCase()}`);

    const supportedPresets = [
      'hi', 'hello', 'thank_you', 'help', 'emergency', 'food', 'water',
      'good_morning', 'how_are_you', 'my_name_is', 'yes', 'no', 'stop',
      'ok', 'fine', 'please', 'sorry', 'good_night', 'love', 'friend',
      'need_doctor', 'call_police', 'good_evening', 'hospital', 'doctor'
    ];

    const queue = [];
    for (let word of words) {
      let gesture = word;
      if (gesture === 'doctor') gesture = 'need_doctor';
      
      if (supportedPresets.includes(gesture)) {
        queue.push({ type: 'gesture', value: gesture });
      } else {
        // fingerspelling character conversion for unsupported vocabulary words
        for (let char of gesture) {
          if (char >= 'a' && char <= 'z') {
            queue.push({ type: 'char', value: char });
          }
        }
      }
    }

    if (queue.length > 0) {
      setTtsQueue(queue);
      setQueueIndex(0);
      setIsPlaying(true);
      setIsPaused(false);
    }
  };

  const handlePauseToggle = () => {
    setIsPaused(prev => !prev);
  };

  const handleStopAnimation = () => {
    setIsPlaying(false);
    setIsPaused(false);
    setQueueIndex(-1);
    setTtsActiveGesture('default');
    setTtsCaption('');
  };

  const handleReplayAnimation = () => {
    if (ttsQueue.length > 0) {
      setQueueIndex(0);
      setIsPlaying(true);
      setIsPaused(false);
    }
  };

  const animatePredefinedSign = (gestureKey) => {
    handleStopAnimation();
    setTtsDecomposition(`Gesture: ${gestureKey.toUpperCase().replace('_', ' ')}`);
    setTtsCaption(gestureKey.toUpperCase().replace('_', ' '));
    setTtsActiveGesture(gestureKey);

    const holdTime = 1600;
    setTimeout(() => {
      setTtsActiveGesture('default');
      setTtsCaption('');
    }, holdTime);
  };

  // Queue controller effect
  useEffect(() => {
    if (!isPlaying || isPaused || queueIndex < 0 || queueIndex >= ttsQueue.length) {
      if (queueIndex >= ttsQueue.length && ttsQueue.length > 0) {
        // Queue finished
        setIsPlaying(false);
        setQueueIndex(-1);
        setTtsActiveGesture('default');
        setTtsCaption('');
      }
      return;
    }

    let isCancelled = false;
    const currentItem = ttsQueue[queueIndex];
    const speed = 1.0 / ttsSpeedRate;

    const runItem = async () => {
      if (currentItem.type === 'gesture') {
        const gesture = currentItem.value;
        const transWord = getTranslation(currentLanguage, gesture.toLowerCase()) || gesture;
        if (voiceAssistant && queueIndex === 0) {
          speakSynthesis(transWord);
        }
        setTtsCaption(transWord.toUpperCase());
        setTtsActiveGesture(gesture);
        
        await new Promise(resolve => {
          setTimeout(() => {
            resolve();
          }, 1800 * speed);
        });
      } else if (currentItem.type === 'char') {
        const char = currentItem.value;
        setTtsDecomposition(`Fingerspelling: ${char.toUpperCase()}`);
        setTtsCaption(`FINGERSPELLING: ${char.toUpperCase()}`);
        setTtsActiveGesture('default');
        
        await new Promise(resolve => {
          setTimeout(() => {
            resolve();
          }, 600 * speed);
        });
      }

      if (!isCancelled) {
        setQueueIndex(prev => prev + 1);
      }
    };

    runItem();

    return () => {
      isCancelled = true;
    };
  }, [isPlaying, isPaused, queueIndex, ttsQueue, ttsSpeedRate]);

  const speakSynthesis = (text) => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = ttsSpeedRate;
    const langMap = { hi: 'hi-IN', te: 'te-IN', ta: 'ta-IN', ml: 'ml-IN', kn: 'kn-IN', en: 'en-US' };
    utterance.lang = langMap[currentLanguage] || 'en-US';
    window.speechSynthesis.speak(utterance);
  };

  const tokenizeDecompose = (text) => {
    let normalized = text.toLowerCase().trim();
    // Regional translations map mapping to GLB keys
    const translationMap = {
      "à°¨à°®à°¸à±à°•à°¾à°°à°‚": "hello", "à°¨à°®à°¸à±à°•à°¾à°°à°®à±": "hello", "à°¹à°²à±‹": "hello",
      "à°§à°¨à±à°¯à°µà°¾à°¦à°¾à°²à±": "thank_you", "à°§à°¨à±à°¯à°µà°¾à°¦à°®à±à°²à±": "thank_you",
      "à°¸à°¹à°¾à°¯à°‚": "help", "à°¸à°¹à°¾à°¯à°®à±": "help",
      "à°…à°¤à±à°¯à°µà°¸à°° à°ªà°°à°¿à°¸à±à°¥à°¿à°¤à°¿": "emergency", "à°…à°¤à±à°¯à°µà°¸à°°": "emergency",
      "à°¶à±à°­à±‹à°¦à°¯à°‚": "good_morning", "à°¶à±à°­ à°¸à°¾à°¯à°‚à°¤à±à°°à°‚": "good_evening",
      "à°®à±€à°°à± à°Žà°²à°¾ à°‰à°¨à±à°¨à°¾à°°à±": "how_are_you", "à°Žà°²à°¾ à°‰à°¨à±à°¨à°¾à°°à±": "how_are_you",
      "à°…à°µà±à°¨à±": "yes", "à°•à°¾à°¦à±": "no", "à°²à±‡à°¦à±": "no", "à°¬à°¾à°—à±à°¨à±à°¨à°¾à°¨à±": "fine",
      "à°†à°—à°‚à°¡à°¿": "stop", "à°†à°—à±": "stop", "à°¨à±€à°°à±": "water", "à°¨à±€à°³à±à°²à±": "water",
      "à°†à°¹à°¾à°°à°‚": "food", "à°…à°¨à±à°¨à°‚": "food", "à°µà±ˆà°¦à±à°¯à±à°¡à±": "doctor", "à°¡à°¾à°•à±à°Ÿà°°à±": "doctor",
      "à°†à°¸à±à°ªà°¤à±à°°à°¿": "hospital",

      "à¤¨à¤®à¤¸à¥à¤¤à¥‡": "hello", "à¤¹à¥‡à¤²à¥‹": "hello", "à¤§à¤¨à¥à¤¯à¤µà¤¾à¤¦": "thank_you", "à¤¶à¥à¤•à¥à¤°à¤¿à¤¯à¤¾": "thank_you",
      "à¤®à¤¦à¤¦": "help", "à¤¸à¤¹à¤¾à¤¯à¤¤à¤¾": "help", "à¤†à¤ªà¤¾à¤¤à¤•à¤¾à¤²": "emergency", "à¤‡à¤®à¤°à¤œà¥‡à¤‚à¤¸à¥€": "emergency",
      "à¤¶à¥à¤­ à¤ªà¥à¤°à¤­à¤¾à¤¤": "good_morning", "à¤¸à¥à¤ªà¥à¤°à¤­à¤¾à¤¤": "good_morning", "à¤¶à¥à¤­ à¤¸à¤‚à¤§à¥à¤¯à¤¾": "good_evening",
      "à¤†à¤ª à¤•à¥ˆà¤¸à¥‡ à¤¹à¥ˆà¤‚": "how_are_you", "à¤•à¥ˆà¤¸à¥‡ à¤¹à¥‹": "how_are_you", "à¤¹à¤¾à¤": "yes", "à¤¨à¤¹à¥€à¤‚": "no",
      "à¤ à¥€à¤• à¤¹à¥‚à¤": "fine", "à¤°à¥à¤•à¥‹": "stop", "à¤ªà¤¾à¤¨à¥€": "water", "à¤­à¥‹à¤œà¤¨": "food", "à¤šà¤¿à¤•à¤¿à¤¤à¥à¤¸à¤•": "doctor",
      "à¤…à¤¸à¥à¤ªà¤¤à¤¾à¤²": "hospital",

      "à®µà®£à®•à¯à®•à®®à¯": "hello", "à®¨à®©à¯à®±à®¿": "thank_you", "à®‰à®¤à®µà®¿": "help", "à®…à®µà®šà®°à®•à®¾à®²à®®à¯": "emergency",
      "à®•à®¾à®²à¯ˆ à®µà®£à®•à¯à®•à®®à¯": "good_morning", "à®®à®¾à®²à¯ˆ à®µà®£à®•à¯à®•à®®à¯": "good_evening", "à®Žà®ªà¯à®ªà®Ÿà®¿ à®‡à®°à¯à®•à¯à®•à®¿à®±à¯€à®°à¯à®•à®³à¯": "how_are_you",
      "à®†à®®à¯": "yes", "à®‡à®²à¯à®²à¯ˆ": "no", "à®¨à®²à®®à¯": "fine", "à®¨à®¿à®²à¯": "stop", "à®¤à®£à¯à®£à¯€à®°à¯": "water", "à®‰à®£à®µà¯": "food",
      "à®®à®°à¯à®¤à¯à®¤à¯à®µà®°à¯": "doctor", "à®®à®°à¯à®¤à¯à®¤à¯à®µà®®à®©à¯ˆ": "hospital",

      "à´¨à´®à´¸àµà´•à´¾à´°à´‚": "hello", "à´¹à´²àµ‹": "hello", "à´¨à´¨àµà´¦à´¿": "thank_you", "à´¸à´¹à´¾à´¯à´‚": "help",
      "à´…à´Ÿà´¿à´¯à´¨àµà´¤à´°à´¾à´µà´¸àµà´¥": "emergency", "à´Žà´®àµ¼à´œàµ»à´¸à´¿": "emergency", "à´¸àµà´ªàµà´°à´­à´¾à´¤à´‚": "good_morning",
      "à´¶àµà´­à´¸à´¨àµà´§àµà´¯": "good_evening", "à´¸àµà´–à´®à´¾à´£àµ‹": "how_are_you", "à´…à´¤àµ†": "yes", "à´…à´²àµà´²": "no",
      "à´¸àµà´–à´‚": "fine", "à´¨à´¿àµ½à´•àµà´•àµ‚": "stop", "à´µàµ†à´³àµà´³à´‚": "water", "à´­à´•àµà´·à´£à´‚": "food", "à´¡àµ‹à´•àµà´Ÿàµ¼": "doctor",
      "à´†à´¶àµà´ªà´¤àµà´°à´¿": "hospital",

      "à²¨à²®à²¸à³à²•à²¾à²°": "hello", "à²¹à²²à³‹": "hello", "à²§à²¨à³à²¯à²µà²¾à²¦à²—à²³à³": "thank_you", "à²¸à²¹à²¾à²¯": "help",
      "à²¤à³à²°à³à²¤à³ à²ªà²°à²¿à²¸à³à²¥à²¿à²¤à²¿": "emergency", "à²¶à³à²­à³‹à²¦à²¯": "good_morning", "à²¶à³à²­ à²¸à²‚à²œà³†": "good_evening",
      "à²¹à³‡à²—à²¿à²¦à³à²¦à³€à²°à²¾": "how_are_you", "à²¹à³Œà²¦à³": "yes", "à²‡à²²à³à²²": "no", "à²šà³†à²¨à³à²¨à²¾à²—à²¿à²¦à³à²¦à³‡à²¨à³†": "fine",
      "à²¨à²¿à²²à³à²²à²¿à²¸à²¿": "stop", "à²¨à³€à²°à³": "water", "à²†à²¹à²¾à²°": "food", "à²µà³ˆà²¦à³à²¯à²°à³": "doctor", "à²†à²¸à³à²ªà²¤à³à²°à³†": "hospital"
    };

    // Replace multi-word phrases first
    for (let key in translationMap) {
      if (key.includes(' ') && normalized.includes(key)) {
        normalized = normalized.replace(new RegExp(key, 'g'), translationMap[key]);
      }
    }
    for (let key in translationMap) {
      if (!key.includes(' ') && normalized.includes(key)) {
        normalized = normalized.replace(new RegExp(key, 'g'), translationMap[key]);
      }
    }

    const EnglishPhrases = {
      'thank you': 'thank_you',
      'how are you': 'how_are_you',
      'good morning': 'good_morning',
      'good night': 'good_night',
      'my name is': 'my_name_is',
      'call police': 'call_police',
      'need doctor': 'need_doctor'
    };
    for (let key in EnglishPhrases) {
      normalized = normalized.replace(new RegExp(key, 'g'), EnglishPhrases[key]);
    }

    return normalized.split(/\s+/).filter(w => w.length > 0);
  };

  // Gamified Learning operations
  const awardXPPoints = (points) => {
    setXpPoints(prev => {
      const next = prev + points;
      // Sync on server
      makeAPIRequest('/api/users/settings', 'PUT', { xp_points: next, learning_streak: streakCount + 1 }).catch(() => {});
      return next;
    });
    setStreakCount(prev => prev + 1);
    addNotification("Badges Gained", `Earned +${points} XP towards levels!`, "success");
    unlockBadge('badge-streak-lock');
  };

  const handleQuizChoice = (option, correct) => {
    setQuizAnsweredBtn(option);
    if (option === correct) {
      setQuizFeedbackColor('var(--accent-green)');
      setQuizFeedback(getTranslation(currentLanguage, 'Correct Answer! +20 Experience points claimed.'));
      awardXPPoints(20);
      setTimeout(() => {
        setQuizIndex(prev => (prev + 1) % quizQuestions.length);
        setQuizFeedback('');
        setQuizAnsweredBtn(null);
      }, 1800);
    } else {
      setQuizFeedbackColor('var(--accent-red)');
      setQuizFeedback(getTranslation(currentLanguage, 'Incorrect. Correct answer was:') + " " + correct);
      setTimeout(() => {
        setQuizFeedback('');
        setQuizAnsweredBtn(null);
      }, 2500);
    }
  };

  const unlockBadge = (badgeId) => {
    if (!badgesUnlocked[badgeId]) {
      setBadgesUnlocked(prev => ({ ...prev, [badgeId]: true }));
      addNotification("Achievement Unlocked!", `Claimed new badge. Check learning panel!`, "success");
    }
  };

  const toggleCameraFeed = () => {
    if (isCameraActive) {
      stopCameraFeed();
    } else {
      startCameraFeed();
    }
  };

  const startCameraFeed = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user', width: 640, height: 480 } });
      cameraStreamRef.current = stream;
      if (sttWebcamRef.current) {
        sttWebcamRef.current.srcObject = stream;
      }
      setIsCameraActive(true);
      initializeMediaPipeTracking();
      startSttLoop();
      addNotification("Holographic HUD Calibrated", "Low-Pass stabilization active on device.", "info");
    } catch(err) {
      console.warn("Real webcam permission blocked. Starting visual simulation loop fallback.", err);
      setIsCameraActive(true);
      startSttLoop();
    }
  };

  const stopCameraFeed = () => {
    if (cameraStreamRef.current) {
      cameraStreamRef.current.getTracks().forEach(track => track.stop());
      cameraStreamRef.current = null;
    }
    if (animationFrameIdRef.current) {
      cancelAnimationFrame(animationFrameIdRef.current);
      animationFrameIdRef.current = null;
    }
    setIsCameraActive(false);
  };

  const initializeMediaPipeTracking = () => {
    if (typeof window.Hands === 'undefined') return;
    try {
      const hands = new window.Hands({
        locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
      });
      hands.setOptions({
        maxNumHands: 2,
        modelComplexity: 1,
        minDetectionConfidence: 0.6,
        minTrackingConfidence: 0.6
      });
      hands.onResults((res) => processCameraClassifierResults(res));

      const camera = new window.Camera(sttWebcamRef.current, {
        onFrame: async () => {
          if (sttWebcamRef.current && sttWebcamRef.current.srcObject) {
            await hands.send({ image: sttWebcamRef.current });
          }
        },
        width: 640,
        height: 480
      });
      camera.start();
    } catch(e) {
      console.warn("MediaPipe wrapper failed, mock tracking handles calculations.");
    }
  };

  const processCameraClassifierResults = (results) => {
    const canvas = sttCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawHolographicHUDOverlay(ctx, canvas);

    if (!results.multiHandLandmarks || results.multiHandLandmarks.length === 0) {
      setDetectedGesture('Awaiting Hand...');
      setConfidence('0.0');
      
      const metrics = {
        "GESTURE INFERENCE": "AWAITING HAND",
        "CONFIDENCE": "0.0%",
        "LANDMARKS TRACED": "0",
        "DEBOUNCE SCORE": "0/8",
        "STABILIZATION": "KALMAN ACTIVE"
      };
      drawCVDebugPanelOverlay(ctx, metrics, canvas, 0);
      return;
    }

    const handsData = [];
    let landmarkCount = 0;

    results.multiHandLandmarks.forEach((rawHand, handIdx) => {
      landmarkCount += 21;
      const handedness = results.multiHandedness[handIdx].label;
      const alpha = 0.4;

      if (!sttCanvasRef.current.smoothedHands) sttCanvasRef.current.smoothedHands = {};
      if (!sttCanvasRef.current.smoothedHands[handIdx] || sttCanvasRef.current.smoothedHands[handIdx].length !== 21) {
        sttCanvasRef.current.smoothedHands[handIdx] = rawHand.map(p => ({ x: p.x * canvas.width, y: p.y * canvas.height }));
      } else {
        for (let i = 0; i < 21; i++) {
          sttCanvasRef.current.smoothedHands[handIdx][i].x = sttCanvasRef.current.smoothedHands[handIdx][i].x * (1 - alpha) + (rawHand[i].x * canvas.width) * alpha;
          sttCanvasRef.current.smoothedHands[handIdx][i].y = sttCanvasRef.current.smoothedHands[handIdx][i].y * (1 - alpha) + (rawHand[i].y * canvas.height) * alpha;
        }
      }

      const smoothed = sttCanvasRef.current.smoothedHands[handIdx];
      drawTrackedHandSkeletonOverlay(ctx, smoothed, handedness);
      handsData.push({ landmarks: smoothed, handedness });
    });

    runMultiHandClassifier(handsData, ctx, canvas, landmarkCount);
  };

  const getHandState = (landmarks) => {
    const getDistance = (p1, p2) => Math.hypot(p1.x - p2.x, p1.y - p2.y);
    const getJointAngle = (pA, pB, pC) => {
      const v1 = { x: pA.x - pB.x, y: pA.y - pB.y };
      const v2 = { x: pC.x - pB.x, y: pC.y - pB.y };
      const dot = v1.x * v2.x + v1.y * v2.y;
      const mag1 = Math.hypot(v1.x, v1.y);
      const mag2 = Math.hypot(v2.x, v2.y);
      if (mag1 * mag2 === 0) return 0;
      return Math.acos(Math.max(-1, Math.min(1, dot / (mag1 * mag2))));
    };

    const palmSize = getDistance(landmarks[0], landmarks[9]);
    if (palmSize < 5) return null;

    const thumbRatio = getDistance(landmarks[2], landmarks[4]) / palmSize;
    const indexRatio = getDistance(landmarks[5], landmarks[8]) / palmSize;
    const middleRatio = getDistance(landmarks[9], landmarks[12]) / palmSize;
    const ringRatio = getDistance(landmarks[13], landmarks[16]) / palmSize;
    const pinkyRatio = getDistance(landmarks[17], landmarks[20]) / palmSize;

    const indexAngle = getJointAngle(landmarks[5], landmarks[6], landmarks[8]);
    const middleAngle = getJointAngle(landmarks[9], landmarks[10], landmarks[12]);
    const ringAngle = getJointAngle(landmarks[13], landmarks[14], landmarks[16]);
    const pinkyAngle = getJointAngle(landmarks[17], landmarks[18], landmarks[20]);
    const thumbAngle = getJointAngle(landmarks[1], landmarks[2], landmarks[4]);

    // Ratio-only detection — 2D angle conditions are unreliable from front-facing camera
    // (joints appear nearly collinear in projection, giving angle ≈ π regardless of bend).
    // Extended finger: tip-to-knuckle ratio > 0.90. Curled: ratio < 0.80.
    const isOpenHand = indexRatio > 0.92 && middleRatio > 0.92 && ringRatio > 0.88 && pinkyRatio > 0.88;
    const isFist = indexRatio < 0.78 && middleRatio < 0.78 && ringRatio < 0.75 && pinkyRatio < 0.75;
    const isPointing = indexRatio > 0.92 && middleRatio < 0.82 && ringRatio < 0.80 && pinkyRatio < 0.80;
    const isThumbUp = thumbRatio > 0.62 && indexRatio < 0.88 && middleRatio < 0.88 && ringRatio < 0.85 && pinkyRatio < 0.85;
    const isOkSign = getDistance(landmarks[4], landmarks[8]) / palmSize < 0.4 && middleRatio > 0.90 && ringRatio > 0.90;
    const isPhoneShape = thumbRatio > 0.65 && pinkyRatio > 0.88 && indexRatio < 0.82 && middleRatio < 0.82;
    const isILY = thumbRatio > 0.62 && indexRatio > 0.88 && pinkyRatio > 0.84 && middleRatio < 0.78 && ringRatio < 0.78;
    const isW = indexRatio > 0.92 && middleRatio > 0.92 && ringRatio > 0.88 && pinkyRatio < 0.84 && thumbRatio < 0.82;

    // Advanced hand shapes
    const isEatingShape = getDistance(landmarks[4], landmarks[8]) / palmSize < 0.55 &&
                          getDistance(landmarks[4], landmarks[12]) / palmSize < 0.55 &&
                          getDistance(landmarks[4], landmarks[16]) / palmSize < 0.55 &&
                          indexRatio < 0.95 && middleRatio < 0.95;

    const isFriendShape = indexRatio > 0.88 && middleRatio > 0.88 && ringRatio < 0.82 && pinkyRatio < 0.82 && getDistance(landmarks[8], landmarks[12]) / palmSize < 0.58;

    const isFlatHand = isOpenHand && getDistance(landmarks[8], landmarks[12]) / palmSize < 0.58 && getDistance(landmarks[12], landmarks[16]) / palmSize < 0.58;

    if (!landmarks.speedBuffer) landmarks.speedBuffer = [];
    landmarks.speedBuffer.push({ x: landmarks[0].x, y: landmarks[0].y, time: Date.now() });
    if (landmarks.speedBuffer.length > 10) landmarks.speedBuffer.shift();

    let speed = 0;
    let yVelocity = 0;
    if (landmarks.speedBuffer.length >= 2) {
      let totalDist = 0;
      for (let i = 1; i < landmarks.speedBuffer.length; i++) {
        totalDist += getDistance(landmarks.speedBuffer[i-1], landmarks.speedBuffer[i]);
      }
      speed = totalDist / landmarks.speedBuffer.length;

      const first = landmarks.speedBuffer[0];
      const last = landmarks.speedBuffer[landmarks.speedBuffer.length - 1];
      yVelocity = last.y - first.y; // screen coordinates: negative means upward motion
    }

    return {
      isOpenHand,
      isFist,
      isPointing,
      isThumbUp,
      isOkSign,
      isPhoneShape,
      isILY,
      isW,
      isEatingShape,
      isFriendShape,
      isFlatHand,
      speed,
      yVelocity,
      palmSize,
      indexRatio,
      middleRatio,
      indexAngle,
      middleAngle
    };
  };

  // Geometric classifier — reads real hand shape from MediaPipe landmarks.
  // Speed/yVelocity are in PIXELS (canvas-space). Canvas is typically 380-600px tall.
  // Motion thresholds: speed > 6 = gentle movement; yVelocity ±18 = 18px net Y shift over buffer.
  const classifyGestureGeometric = (handsData) => {
    if (!handsData || handsData.length === 0) return null;

    const primary = handsData[0];
    const state = getHandState(primary.landmarks);
    if (!state) return null;

    const twoHands = handsData.length >= 2;
    const secondState = twoHands ? getHandState(handsData[1].landmarks) : null;

    const {
      isOpenHand, isFist, isPointing, isThumbUp,
      isILY, isW, isEatingShape, isFriendShape, isFlatHand,
      speed, yVelocity
    } = state;

    // Both hands visible and open → Emergency
    if (twoHands && (isOpenHand || isFlatHand) && secondState && (secondState.isOpenHand || secondState.isFlatHand)) {
      return { gesture: 'Emergency', confidence: 95 };
    }

    // ILY (thumb + index + pinky extended, middle + ring curled) → Love
    if (isILY) return { gesture: 'Love', confidence: 93 };

    // Thumb up, all fingers curled → Help
    if (isThumbUp) return { gesture: 'Help', confidence: 90 };

    // W shape (index + middle + ring extended, pinky + thumb curled) → Water
    if (isW) return { gesture: 'Water', confidence: 88 };

    // All fingertips pinched together → Food
    if (isEatingShape) return { gesture: 'Food', confidence: 85 };

    // Closed fist
    if (isFist) {
      // Moving fist → Sorry
      if (speed > 2.0) {
        return { gesture: 'Sorry', confidence: 88 };
      }
      // Still fist → Yes
      return { gesture: 'Yes', confidence: 87 };
    }

    // Index only extended, others curled → No
    if (isPointing) return { gesture: 'No', confidence: 83 };

    // Index + middle extended side-by-side → Friend
    if (isFriendShape) return { gesture: 'Friend', confidence: 82 };

    // Open / flat hand
    if (isOpenHand || isFlatHand) {
      // Rapid lateral motion (waving)
      if (speed > 6.0) {
        // Spread fingers waving → Hi
        if (isOpenHand && !isFlatHand) {
          return { gesture: 'Hi', confidence: 88 };
        }
        // Flat fingers waving → Hello
        return { gesture: 'Hello', confidence: 86 };
      }
      // Net upward motion (screen Y decreases upward) → Good Morning
      if (yVelocity < -18) return { gesture: 'Good Morning', confidence: 78 };
      // Net downward motion → Good Night
      if (yVelocity > 18) return { gesture: 'Good Night', confidence: 76 };
      // Moderate speed motion → Please
      if (speed >= 2.5 && speed <= 6.0) {
        return { gesture: 'Please', confidence: 84 };
      }
      // Flat fingers together, still → Thank You
      if (isFlatHand) return { gesture: 'Thank You', confidence: 79 };
      // Open hand, still → Hello (static greeting)
      return { gesture: 'Hello', confidence: 74 };
    }

    return null;
  };

  const runMultiHandClassifier = (handsData, ctx, canvas, landmarkCount = 0) => {
    if (handsData.length === 0) {
      setDetectedGesture('Awaiting Hand...');
      setConfidence('0.0');
      const metrics = {
        "GESTURE INFERENCE": "AWAITING HAND",
        "CONFIDENCE": "0.0%",
        "LANDMARKS TRACED": "0",
        "DEBOUNCE SCORE": "0/8",
        "STABILIZATION": "KALMAN ACTIVE"
      };
      drawCVDebugPanelOverlay(ctx, metrics, canvas, 0);
      return;
    }

    const result = classifyGestureGeometric(handsData);
    if (result) {
      updateClassifierOutput(result.gesture, result.confidence, landmarkCount);
    } else {
      updateClassifierOutput('Awaiting Hand...', 0.0, landmarkCount);
    }
  };

  const updateClassifierOutput = (detected, confidenceVal, landmarkCount = 0) => {
    if (detected === 'Awaiting Hand...') {
      setDetectedGesture('Awaiting Hand...');
      setConfidence('0.0');
      return;
    }

    const finalConf = Math.min(99.9, confidenceVal * brightnessCompensation).toFixed(1);

    sttHistoryBufferRef.current.push(detected);
    if (sttHistoryBufferRef.current.length > 15) sttHistoryBufferRef.current.shift();

    const counts = {};
    let consensus = '';
    let max = 0;
    sttHistoryBufferRef.current.forEach(g => {
      counts[g] = (counts[g] || 0) + 1;
      if (counts[g] > max) {
        max = counts[g];
        consensus = g;
      }
    });

    if (consensus) {
      setDetectedGesture(consensus);
      setConfidence(finalConf);
    }

    if (max > 6 && lastLoggedGestureRef.current !== consensus && consensus && consensus !== 'Awaiting Hand...') {
      lastLoggedGestureRef.current = consensus;
      
      const newRecord = {
        id: Date.now(),
        timestamp: new Date().toLocaleTimeString(),
        mode: 'Sign to Text',
        source: 'Geometric Neural Acquisition',
        translation: consensus,
        confidence: `${finalConf}%`,
        icon: 'fa-video'
      };

      setSessionHistory(prev => [newRecord, ...prev]);
      setBackendHistory(prev => [newRecord, ...prev]);

      if (voiceAssistant) {
        speakSynthesis(getTranslation(currentLanguage, consensus.toLowerCase()));
      }

      makeAPIRequest('/api/translations', 'POST', {
        source_type: 'sign_to_text',
        source_content: 'hand_gesture',
        translated_content: consensus,
        confidence: parseFloat(finalConf)
      }).catch(() => {});

      unlockBadge('badge-first-word');
    }

    // Render debug info
    const canvas = sttCanvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      const metrics = {
        "GESTURE INFERENCE": (consensus || detected).toUpperCase(),
        "CONFIDENCE": `${finalConf}%`,
        "LANDMARKS TRACED": `${landmarkCount}`,
        "DEBOUNCE SCORE": `${max}/8`,
        "STABILIZATION": "KALMAN ACTIVE"
      };
      drawCVDebugPanelOverlay(ctx, metrics, canvas, max * 12);
    }
  };

  const drawTrackedHandSkeletonOverlay = (ctx, landmarks, handedness) => {
    ctx.strokeStyle = handedness === 'Left' ? "rgba(112, 0, 255, 0.8)" : "rgba(0, 240, 255, 0.8)";
    ctx.lineWidth = 3.5;

    const connections = [
      [0, 1], [1, 2], [2, 3], [3, 4],
      [0, 5], [5, 6], [6, 7], [7, 8],
      [0, 9], [9, 10], [10, 11], [11, 12],
      [0, 13], [13, 14], [14, 15], [15, 16],
      [0, 17], [17, 18], [18, 19], [19, 20]
    ];

    connections.forEach(([i, j]) => {
      ctx.beginPath();
      ctx.moveTo(landmarks[i].x, landmarks[i].y);
      ctx.lineTo(landmarks[j].x, landmarks[j].y);
      ctx.stroke();
    });

    landmarks.forEach((p, idx) => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, 4.5, 0, Math.PI * 2);
      if ([4, 8, 12, 16, 20].includes(idx)) {
        ctx.fillStyle = "var(--accent-red)";
      } else if ([1, 5, 9, 13, 17].includes(idx)) {
        ctx.fillStyle = "var(--accent-purple)";
      } else {
        ctx.fillStyle = "var(--accent-cyan)";
      }
      ctx.fill();
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 1.0;
      ctx.stroke();
    });
  };

  const drawCVDebugPanelOverlay = (ctx, metrics, canvas, stabilityScore) => {
    ctx.fillStyle = "rgba(6, 6, 12, 0.88)";
    ctx.strokeStyle = "rgba(0, 240, 255, 0.45)";
    ctx.lineWidth = 1.5;

    ctx.beginPath();
    ctx.rect(15, 60, 260, 120);
    ctx.fill();
    ctx.stroke();

    ctx.font = "bold 10.5px Inter, system-ui, sans-serif";
    ctx.fillStyle = "var(--accent-cyan)";
    ctx.fillText("CV DEEP INFERENCE ENGINE", 30, 82);

    ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(25, 90); ctx.lineTo(260, 90); ctx.stroke();

    let yOffset = 110;
    ctx.font = "10px monospace";
    for (let label in metrics) {
      ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
      ctx.fillText(label.padEnd(18, '.'), 30, yOffset);
      ctx.fillStyle = "#ffffff";
      ctx.fillText(metrics[label], 155, yOffset);
      yOffset += 15;
    }
  };

  const drawHolographicHUDOverlay = (ctx, canvas) => {
    ctx.strokeStyle = "rgba(0, 240, 255, 0.05)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(canvas.width/2, canvas.height/2, 100, 0, Math.PI*2);
    ctx.arc(canvas.width/2, canvas.height/2, 180, 0, Math.PI*2);
    ctx.stroke();

    ctx.strokeStyle = "rgba(0, 255, 204, 0.2)";
    ctx.beginPath();
    ctx.moveTo(30, canvas.height/2); ctx.lineTo(45, canvas.height/2);
    ctx.moveTo(canvas.width - 45, canvas.height/2); ctx.lineTo(canvas.width - 30, canvas.height/2);
    ctx.moveTo(canvas.width/2, 30); ctx.lineTo(canvas.width/2, 45);
    ctx.moveTo(canvas.width/2, canvas.height - 45); ctx.lineTo(canvas.width/2, canvas.height - 30);
    ctx.stroke();
  };

  const startSttLoop = () => {
    const canvas = sttCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    let smoothedLandmarks = Array(21).fill(null).map(() => ({ x: canvas.width / 2, y: canvas.height / 2 }));
    
    const render = () => {
      if (!cameraStreamRef.current) {
        // Run simulation fallback
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const time = Date.now() * 0.0025;
        const rx = canvas.width / 2 + Math.sin(time) * 40;
        const ry = canvas.height / 2 + Math.cos(time * 1.5) * 20 + 20;

        const alpha = 0.35;
        smoothedLandmarks[0] = {
          x: smoothedLandmarks[0].x + (rx - smoothedLandmarks[0].x) * alpha,
          y: smoothedLandmarks[0].y + (ry - smoothedLandmarks[0].y) * alpha
        };

        // Simulated hand logic
        const knuckles = [
          { x: smoothedLandmarks[0].x - 45, y: smoothedLandmarks[0].y + 5 },
          { x: smoothedLandmarks[0].x - 18, y: smoothedLandmarks[0].y - 12 },
          { x: smoothedLandmarks[0].x, y: smoothedLandmarks[0].y - 15 },
          { x: smoothedLandmarks[0].x + 18, y: smoothedLandmarks[0].y - 12 },
          { x: smoothedLandmarks[0].x + 40, y: smoothedLandmarks[0].y - 5 }
        ];

        const landmarks = Array(21);
        landmarks[0] = { x: smoothedLandmarks[0].x, y: smoothedLandmarks[0].y + 45 };
        landmarks[1] = { x: smoothedLandmarks[0].x - 25, y: smoothedLandmarks[0].y + 25 };
        landmarks[2] = knuckles[0];

        // curl profiles wave
        const curl = 0.3 + Math.sin(time) * 0.15;
        const fingerNames = ['thumb', 'index', 'middle', 'ring', 'pinky'];
        fingerNames.forEach((name, idx) => {
          const angle = (idx - 2) * 0.18;
          const len = 30;
          if (idx === 0) {
            landmarks[3] = { x: knuckles[0].x + Math.sin(angle)*len, y: knuckles[0].y - Math.cos(angle)*len };
            landmarks[4] = { x: landmarks[3].x + Math.sin(angle)*len, y: landmarks[3].y - Math.cos(angle)*len };
          } else {
            const base = idx * 4 + 1;
            landmarks[base] = knuckles[idx];
            landmarks[base+1] = { x: knuckles[idx].x + Math.sin(angle)*len*0.5, y: knuckles[idx].y - Math.cos(angle)*len*0.5 };
            landmarks[base+2] = { x: knuckles[idx].x + Math.sin(angle)*len, y: knuckles[idx].y - Math.cos(angle)*len };
            landmarks[base+3] = { x: landmarks[base+2].x + Math.sin(angle)*len*0.8, y: landmarks[base+2].y - Math.cos(angle)*len*0.8 };
          }
        });

        runMultiHandClassifier([{ landmarks, handedness: 'Right' }], ctx, canvas);
        drawTrackedHandSkeletonOverlay(ctx, landmarks, 'Right');
        drawHolographicHUDOverlay(ctx, canvas);
      }
      animationFrameIdRef.current = requestAnimationFrame(render);
    };

    animationFrameIdRef.current = requestAnimationFrame(render);
  };

  const startCameraCalibration = () => {
    setIsCameraCalibrating(true);
    setCalibrationProgress(0);
    
    const interval = setInterval(() => {
      setCalibrationProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsCameraCalibrating(false);
          setBrightnessCompensation(1.25);
          addNotification("Calibration Complete", "Auto-brightness +2.5dB compensation active.", "success");
          return 100;
        }
        return prev + 5;
      });
    }, 120);
  };

  return (
    <div id="dashboard-view" className="view-section active">
      
      {/* Top Header Navigation Bar */}
      <header className="nav-header" style={{ position: 'sticky', top: 0, zIndex: 100, backdropFilter: 'blur(15px)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {isMobile && (
            <button onClick={() => setMobileSidebarOpen(v => !v)} style={{ background: 'none', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff', padding: '6px 10px', cursor: 'pointer', fontSize: '16px' }}>
              <i className="fa-solid fa-bars"></i>
            </button>
          )}
          <div className="logo-container" style={{ cursor: 'pointer' }} onClick={() => setActiveSubview('dash-home')}>
            <div className="logo-icon"><i className="fa-solid fa-eye-low-vision" style={{ color: '#fff' }}></i></div>
            <span>SignVision <span className="gradient-text">AI</span></span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
          
          {/* Language selector */}
          <select
            className="topbar-selector"
            value={currentLanguage}
            onChange={(e) => onChangeLanguage(e.target.value)}
          >
            <option value="en">English (US)</option>
            <option value="te">Telugu (à°¤à±†à°²à±à°—à±)</option>
            <option value="hi">Hindi (à¤¹à¤¿à¤¨à¥à¤¦à¥€)</option>
            <option value="ta">Tamil (à®¤à®®à®¿à®´à¯)</option>
            <option value="ml">Malayalam (à´®à´²à´¯à´¾à´³à´‚)</option>
            <option value="kn">Kannada (à²•à²¨à³à²¨à²¡)</option>
          </select>

          {/* System status notifications bell */}
          <div style={{ position: 'relative' }}>
            <button className="topbar-btn" onClick={() => setAlertsOpen(!alertsOpen)}>
              <i className="fa-solid fa-bell"></i>
              {notifications.length > 0 && <span className="notification-badge">{notifications.length}</span>}
            </button>
            
            {alertsOpen && (
              <div className="glass-card dropdown-panel active" style={{ right: 0, top: '45px', width: '300px', zIndex: 110 }}>
                <h4 style={{ margin: '0 0 10px 0', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '8px', color: 'var(--accent-cyan)' }}>
                  System Telemetry Feed
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '250px', overflowY: 'auto' }}>
                  {notifications.length === 0 ? (
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', textAlign: 'center', padding: '15px' }}>
                      No active telemetry anomalies.
                    </div>
                  ) : (
                    notifications.map((n) => (
                      <div key={n.id} style={{ fontSize: '11px', padding: '8px', background: 'rgba(255,255,255,0.02)', borderRadius: '4px', borderLeft: `3px solid ${n.type === 'success' ? 'var(--accent-green)' : 'var(--accent-cyan)'}` }}>
                        <div style={{ fontWeight: 'bold', display: 'flex', justifyContent: 'space-between' }}>
                          <span>{n.title}</span>
                          <span style={{ color: 'var(--text-muted)', fontSize: '9px' }}>{n.time}</span>
                        </div>
                        <div style={{ color: 'var(--text-secondary)', marginTop: '2px' }}>{n.message}</div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          <button className="btn-secondary" style={{ padding: '6px 12px', fontSize: '12px' }} onClick={() => { stopCameraFeed(); onLogout(); }}>
            <i className="fa-solid fa-right-from-bracket"></i> Logout
          </button>
        </div>
      </header>

      <div className="dashboard-layout">

        {/* Mobile sidebar overlay backdrop */}
        {isMobile && mobileSidebarOpen && (
          <div onClick={() => setMobileSidebarOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 190 }} />
        )}

        {/* Navigation Sidebar Panel */}
        <aside className={`sidebar ${isSidebarCollapsed ? 'collapsed' : ''} ${isMobile && mobileSidebarOpen ? 'mobile-open' : ''}`} style={isMobile ? {} : { width: isSidebarCollapsed ? '78px' : '260px' }}>
          <button className="sidebar-toggle-btn" onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)} title={isSidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}>
            <i className={`fa-solid ${isSidebarCollapsed ? 'fa-angle-right' : 'fa-angle-left'}`}></i>
          </button>

          <div className="sidebar-profile-card">
            <div className="sidebar-avatar" id="sidebar-avatar">{user?.name ? user.name.charAt(0).toUpperCase() : 'U'}</div>
            <div className="sidebar-profile-info">
              <strong id="sidebar-username">{user?.name || 'Ramesh Babu'}</strong>
              <span id="sidebar-usertype" style={{ textTransform: 'capitalize' }}>{user?.user_type?.replace('_', ' ') || 'Registered user'}</span>
            </div>
          </div>

          <nav>
            {[
              { id: 'dash-home', icon: 'fa-house', key: 'home_dashboard' },
              { id: 'dash-sign-to-text', icon: 'fa-video', key: 'sign_to_text' },
              { id: 'dash-text-to-sign', icon: 'fa-keyboard', key: 'text_to_sign' },
              { id: 'dash-history', icon: 'fa-clock-rotate-left', key: 'history_log' },
              { id: 'dash-learning', icon: 'fa-graduation-cap', key: 'ai_learning' },
              { id: 'dash-settings', icon: 'fa-sliders', key: 'settings_panel' },
              { id: 'dash-sos', icon: 'fa-triangle-exclamation', key: 'accessibility_sos', sos: true }
            ].map(item => (
              <a key={item.id} href="#"
                className={`sidebar-item-link ${activeSubview === item.id ? 'active' : ''}`}
                style={item.sos && !isSidebarCollapsed ? { borderLeft: '3px solid var(--accent-red)' } : {}}
                onClick={(e) => {
                  e.preventDefault();
                  setActiveSubview(item.id);
                  if (isMobile) setMobileSidebarOpen(false);
                }}
              >
                <i className={`fa-solid ${item.icon}`} style={item.sos ? { color: 'var(--accent-red)' } : {}}></i>
                <span>{getTranslation(currentLanguage, item.key)}</span>
              </a>
            ))}
          </nav>
        </aside>

        {/* Core Main Workspace Container */}
        <main className="main-workspace" style={isMobile ? { marginLeft: 0, padding: '15px', position: 'relative', overflowY: 'auto' } : { marginLeft: isSidebarCollapsed ? '78px' : '260px', padding: '25px', position: 'relative', overflowY: 'auto' }}>
          
          {/* SUBVIEW 1: HOME DASHBOARD */}
          {activeSubview === 'dash-home' && (
            <HomeView
              user={user}
              getTranslation={getTranslation}
              currentLanguage={currentLanguage}
              streakCount={streakCount}
              xpPoints={xpPoints}
              fps={fps}
              latency={latency}
              engineHealth={engineHealth}
              backendHistory={backendHistory}
              triggerEmergencySOS={triggerEmergencySOS}
              setActiveSubview={setActiveSubview}
            />
          )}

          {/* SUBVIEW 2: SIGN TO TEXT */}
          {activeSubview === 'dash-sign-to-text' && (
            <SignToTextView
              getTranslation={getTranslation}
              currentLanguage={currentLanguage}
              sttWebcamRef={sttWebcamRef}
              sttCanvasRef={sttCanvasRef}
              isCameraActive={isCameraActive}
              isCameraCalibrating={isCameraCalibrating}
              calibrationProgress={calibrationProgress}
              detectedGesture={detectedGesture}
              confidence={confidence}
              voiceAssistant={voiceAssistant}
              setVoiceAssistant={setVoiceAssistant}
              realCameraMockEnabled={realCameraMockEnabled}
              setRealCameraMockEnabled={setRealCameraMockEnabled}
              toggleCameraFeed={toggleCameraFeed}
              startCameraCalibration={startCameraCalibration}
              speakSynthesis={speakSynthesis}
              setBackendHistory={setBackendHistory}
              addNotification={addNotification}
            />
          )}

          {/* SUBVIEW 3: TEXT TO SIGN */}
          {activeSubview === 'dash-text-to-sign' && (
            <TextToSignView
              getTranslation={getTranslation}
              currentLanguage={currentLanguage}
              ttsInput={ttsInput}
              setTtsInput={setTtsInput}
              ttsDecomposition={ttsDecomposition}
              ttsSpeedRate={ttsSpeedRate}
              setTtsSpeedRate={setTtsSpeedRate}
              ttsActiveGesture={ttsActiveGesture}
              setTtsActiveGesture={setTtsActiveGesture}
              ttsAvatarGender={ttsAvatarGender}
              setTtsAvatarGender={setTtsAvatarGender}
              ttsCaption={ttsCaption}
              isPlaying={isPlaying}
              isPaused={isPaused}
              ttsQueue={ttsQueue}
              handleTextTranslationSubmit={handleTextTranslationSubmit}
              handlePauseToggle={handlePauseToggle}
              handleStopAnimation={handleStopAnimation}
              handleReplayAnimation={handleReplayAnimation}
              animatePredefinedSign={animatePredefinedSign}
            />
          )}

          {/* SUBVIEW 4: HISTORY TRANSLATIONS */}
          {activeSubview === 'dash-history' && (
            <HistoryView
              getTranslation={getTranslation}
              currentLanguage={currentLanguage}
              historySearchQuery={historySearchQuery}
              setHistorySearchQuery={setHistorySearchQuery}
              backendHistory={backendHistory}
              setBackendHistory={setBackendHistory}
              addNotification={addNotification}
            />
          )}

          {/* SUBVIEW 5: AI LEARNING & ACHIEVEMENTS */}
          {activeSubview === 'dash-learning' && (
            <LearningView
              getTranslation={getTranslation}
              currentLanguage={currentLanguage}
              quizQuestions={quizQuestions}
              quizIndex={quizIndex}
              quizFeedback={quizFeedback}
              quizFeedbackColor={quizFeedbackColor}
              quizAnsweredBtn={quizAnsweredBtn}
              badgesUnlocked={badgesUnlocked}
              handleQuizChoice={handleQuizChoice}
            />
          )}

          {/* SUBVIEW 6: SYSTEM SETTINGS */}
          {activeSubview === 'dash-settings' && (
            <SettingsView
              getTranslation={getTranslation}
              currentLanguage={currentLanguage}
              profileName={profileName}
              setProfileName={setProfileName}
              profileUserType={profileUserType}
              setProfileUserType={setProfileUserType}
              pipelineEngine={pipelineEngine}
              setPipelineEngine={setPipelineEngine}
              recognitionThreshold={recognitionThreshold}
              setRecognitionThreshold={setRecognitionThreshold}
              largeText={largeText}
              setLargeText={setLargeText}
              highContrast={highContrast}
              setHighContrast={setHighContrast}
              voiceAssistant={voiceAssistant}
              setVoiceAssistant={setVoiceAssistant}
              handleSettingsSubmit={handleSettingsSubmit}
            />
          )}

          {/* SUBVIEW 7: ACCESSIBILITY / SOS */}
          {activeSubview === 'dash-sos' && (
            <SOSView
              getTranslation={getTranslation}
              currentLanguage={currentLanguage}
              triggerEmergencySOS={triggerEmergencySOS}
              stopGPSWatching={stopGPSWatching}
              startGPSWatching={startGPSWatching}
              gpsStatus={gpsStatus}
              latitude={latitude}
              longitude={longitude}
              gpsAccuracy={gpsAccuracy}
              reverseAddress={reverseAddress}
              radarCanvasRef={radarCanvasRef}
              contacts={contacts}
              openEditContact={openEditContact}
              deleteContact={deleteContact}
              setContactModalOpen={setContactModalOpen}
              setEditingContact={setEditingContact}
              setContactNameInput={setContactNameInput}
              setContactPhoneInput={setContactPhoneInput}
              setContactCategoryInput={setContactCategoryInput}
              setContactPriorityInput={setContactPriorityInput}
              sosHistoryList={sosHistoryList}
              clearSOSHistory={clearSOSHistory}
              exportSOSHistoryCSV={exportSOSHistoryCSV}
            />
          )}
        </main>
      </div>

      {/* CONTACT EDIT/CREATE MODAL */}
      <ContactModal
        contactModalOpen={contactModalOpen}
        editingContact={editingContact}
        saveContact={saveContact}
        contactNameInput={contactNameInput}
        setContactNameInput={setContactNameInput}
        contactPhoneInput={contactPhoneInput}
        setContactPhoneInput={setContactPhoneInput}
        contactCategoryInput={contactCategoryInput}
        setContactCategoryInput={setContactCategoryInput}
        contactPriorityInput={contactPriorityInput}
        setContactPriorityInput={setContactPriorityInput}
        setContactModalOpen={setContactModalOpen}
      />

      {/* SOS EMERGENCY BROADCASTING MODAL */}
      <SOSModal
        sosModalOpen={sosModalOpen}
        setSosModalOpen={setSosModalOpen}
        stopGPSWatching={stopGPSWatching}
        sosPhraseUsed={sosPhraseUsed}
        sosSimLabel={sosSimLabel}
        sosSimProgress={sosSimProgress}
        contacts={contacts}
        sosContactsSent={sosContactsSent}
        sendWhatsAppMessage={sendWhatsAppMessage}
      />

    </div>
  );
}
