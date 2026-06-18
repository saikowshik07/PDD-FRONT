import React, { useState, useEffect, useRef } from 'react';
import Avatar2D from './Avatar2D';
import { makeAPIRequest } from '../App';

export default function MobileView({
  user,
  getTranslation,
  currentLanguage,
  onChangeLanguage,
  notifications,
  addNotification,
  simulatedGesture,
  ultraDemoMode
}) {
  const [viewportType, setViewportType] = useState('iphone'); // iphone, pixel
  const [activeScreen, setActiveScreen] = useState('mobile-screen-home'); // home, cam, avatar, quiz, sos
  
  // Stats
  const [xpPoints, setXpPoints] = useState(user?.xp_points || 0);
  
  // Camera feed states
  const [isCamActive, setIsCamActive] = useState(false);
  const [detectedGesture, setDetectedGesture] = useState('HELLO');
  const [confidence, setConfidence] = useState('98.5');
  const [facingMode, setFacingMode] = useState('user'); // user or environment

  // Text to Sign
  const [ttsInput, setTtsInput] = useState('');
  const [ttsActiveGesture, setTtsActiveGesture] = useState('default');
  const [ttsCaption, setTtsCaption] = useState('');

  // SOS States
  const [latitude, setLatitude] = useState(17.3850);
  const [longitude, setLongitude] = useState(78.4867);
  const [gpsAccuracy, setGpsAccuracy] = useState(12.5);
  const [address, setAddress] = useState('Resolving satellite GPS...');
  const [sosActive, setSosActive] = useState(false);
  const [sosSentBadge, setSosSentBadge] = useState({});

  // Contacts
  const [contacts, setContacts] = useState([
    { id: 1, name: "Local Police Desk", phone: "911", category: "Police", priority: true },
    { id: 2, name: "City Hospital Dispatch", phone: "999", category: "Ambulance", priority: true },
    { id: 3, name: "Primary Family Guardian", phone: "+1 555-0199", category: "Family", priority: false }
  ]);

  // Quiz
  const [quizQuestions] = useState([
    { q: "Which gesture corresponds to the expression shown?", answer: "Thank You", options: ["Hello", "Thank You", "Help", "Emergency"], icon: "fa-hands" },
    { q: "What coordinate represents the 'Help' support pose?", answer: "Help", options: ["Yes", "No", "Food", "Help"], icon: "fa-life-ring" },
    { q: "Choose correct phrase mapping for a warning shake:", answer: "Emergency", options: ["Water", "Emergency", "Hello", "Thank You"], icon: "fa-triangle-exclamation" }
  ]);
  const [quizIndex, setQuizIndex] = useState(0);

  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const radarRef = useRef(null);
  const cameraStreamRef = useRef(null);
  const renderFrameIdRef = useRef(null);
  const radarFrameIdRef = useRef(null);
  const handsRef = useRef(null);
  const mobileHistoryBufferRef = useRef([]);
  const lastLoggedMobileGestureRef = useRef('');

  // Sync contacts and user stats
  useEffect(() => {
    if (user) {
      setXpPoints(user.xp_points || 0);
    }
    const savedContacts = localStorage.getItem('emergencyContacts');
    if (savedContacts) {
      setContacts(JSON.parse(savedContacts));
    }
  }, [user]);

  // Handle simulated gestures from demonstration control
  useEffect(() => {
    if (simulatedGesture && simulatedGesture.gesture) {
      const clean = simulatedGesture.gesture.toUpperCase().replace('_', ' ');
      setActiveScreen('mobile-screen-cam');
      setDetectedGesture(clean);
      setConfidence('99.2');
      speakVoiceOutput(clean);
    }
  }, [simulatedGesture]);

  // Handle mobile camera streams on tab change
  useEffect(() => {
    if (activeScreen === 'mobile-screen-cam') {
      startMobileCamera();
    } else {
      stopMobileCamera();
    }
  }, [activeScreen]);

  const toggleFacingMode = () => {
    const next = facingMode === 'user' ? 'environment' : 'user';
    setFacingMode(next);
    stopMobileCamera();
    setTimeout(() => {
      startMobileCamera(next);
    }, 100);
  };

  const startMobileCamera = async (mode = facingMode) => {
    stopMobileCamera();
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: mode,
          width: { ideal: 640 },
          height: { ideal: 480 }
        }
      });
      cameraStreamRef.current = stream;
      if (webcamRef.current) {
        webcamRef.current.srcObject = stream;
      }
      setIsCamActive(true);
      initializeMediaPipeMobile();
    } catch(err) {
      console.warn("Mobile webcam access failed, starting simulated tracking fallback.", err);
      setIsCamActive(true);
      initializeMediaPipeMobile();
    }
  };

  const stopMobileCamera = () => {
    if (cameraStreamRef.current) {
      cameraStreamRef.current.getTracks().forEach(tr => tr.stop());
      cameraStreamRef.current = null;
    }
    if (renderFrameIdRef.current) {
      cancelAnimationFrame(renderFrameIdRef.current);
      renderFrameIdRef.current = null;
    }
    if (handsRef.current) {
      try {
        handsRef.current.close();
      } catch (e) {}
      handsRef.current = null;
    }
    setIsCamActive(false);
  };

  const initializeMediaPipeMobile = () => {
    if (typeof window.Hands === 'undefined') {
      console.warn("MediaPipe Hands library not loaded globally.");
      return;
    }

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

      hands.onResults((res) => {
        processMobileClassifierResults(res);
      });

      handsRef.current = hands;

      let active = true;
      const captureFrame = async () => {
        if (!active) return;
        if (webcamRef.current && webcamRef.current.readyState >= 2 && cameraStreamRef.current) {
          try {
            await hands.send({ image: webcamRef.current });
          } catch (err) {
            console.error("Error sending frame to MediaPipe:", err);
          }
        }
        renderFrameIdRef.current = requestAnimationFrame(captureFrame);
      };

      renderFrameIdRef.current = requestAnimationFrame(captureFrame);

      return () => {
        active = false;
      };
    } catch (e) {
      console.error("MediaPipe initialization failed in MobileView:", e);
    }
  };

  const processMobileClassifierResults = (results) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = canvas.offsetWidth || 280;
    canvas.height = canvas.offsetHeight || 320;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // HUD crosshairs
    ctx.strokeStyle = "rgba(0, 255, 204, 0.15)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(canvas.width / 2, canvas.height / 2, 60, 0, Math.PI * 2);
    ctx.stroke();

    if (!results.multiHandLandmarks || results.multiHandLandmarks.length === 0) {
      setDetectedGesture('Awaiting Hand...');
      setConfidence('0.0');
      return;
    }

    const handsData = [];
    let landmarkCount = 0;

    results.multiHandLandmarks.forEach((rawHand, handIdx) => {
      landmarkCount += 21;
      const handedness = results.multiHandedness[handIdx].label;
      const alpha = 0.4;

      if (!canvasRef.current.smoothedHands) canvasRef.current.smoothedHands = {};
      if (!canvasRef.current.smoothedHands[handIdx] || canvasRef.current.smoothedHands[handIdx].length !== 21) {
        canvasRef.current.smoothedHands[handIdx] = rawHand.map(p => ({ x: p.x * canvas.width, y: p.y * canvas.height }));
      } else {
        for (let i = 0; i < 21; i++) {
          canvasRef.current.smoothedHands[handIdx][i].x = canvasRef.current.smoothedHands[handIdx][i].x * (1 - alpha) + (rawHand[i].x * canvas.width) * alpha;
          canvasRef.current.smoothedHands[handIdx][i].y = canvasRef.current.smoothedHands[handIdx][i].y * (1 - alpha) + (rawHand[i].y * canvas.height) * alpha;
        }
      }

      const smoothed = canvasRef.current.smoothedHands[handIdx];
      drawTrackedHandSkeletonOverlay(ctx, smoothed, handedness);
      handsData.push({ landmarks: smoothed, handedness });
    });

    runMultiHandClassifierMobile(handsData, landmarkCount);
  };

  const drawTrackedHandSkeletonOverlay = (ctx, landmarks, handedness) => {
    ctx.strokeStyle = handedness === 'Left' ? "rgba(112, 0, 255, 0.8)" : "rgba(0, 240, 255, 0.8)";
    ctx.lineWidth = 3.0;

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

    landmarks.forEach(pt => {
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, 4, 0, Math.PI * 2);
      ctx.fillStyle = handedness === 'Left' ? "var(--accent-purple)" : "var(--accent-cyan)";
      ctx.fill();
    });
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

    const isOpenHand = indexRatio > 0.92 && middleRatio > 0.92 && ringRatio > 0.88 && pinkyRatio > 0.88;
    const isFist = indexRatio < 0.78 && middleRatio < 0.78 && ringRatio < 0.75 && pinkyRatio < 0.75;
    const isPointing = indexRatio > 0.92 && middleRatio < 0.82 && ringRatio < 0.80 && pinkyRatio < 0.80;
    const isThumbUp = thumbRatio > 0.62 && indexRatio < 0.88 && middleRatio < 0.88 && ringRatio < 0.85 && pinkyRatio < 0.85;
    const isILY = thumbRatio > 0.62 && indexRatio > 0.88 && pinkyRatio > 0.84 && middleRatio < 0.78 && ringRatio < 0.78;
    const isW = indexRatio > 0.92 && middleRatio > 0.92 && ringRatio > 0.88 && pinkyRatio < 0.84 && thumbRatio < 0.82;

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
      yVelocity = last.y - first.y;
    }

    return {
      isOpenHand,
      isFist,
      isPointing,
      isThumbUp,
      isILY,
      isW,
      isEatingShape,
      isFriendShape,
      isFlatHand,
      speed,
      yVelocity,
      palmSize
    };
  };

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
      if (speed > 2.0) {
        return { gesture: 'Sorry', confidence: 88 };
      }
      return { gesture: 'Yes', confidence: 87 };
    }

    // Index only extended, others curled → No
    if (isPointing) return { gesture: 'No', confidence: 83 };

    // Index + middle extended side-by-side → Friend
    if (isFriendShape) return { gesture: 'Friend', confidence: 82 };

    // Open / flat hand
    if (isOpenHand || isFlatHand) {
      if (speed > 6.0) {
        if (isOpenHand && !isFlatHand) {
          return { gesture: 'Hi', confidence: 88 };
        }
        return { gesture: 'Hello', confidence: 86 };
      }
      if (yVelocity < -18) return { gesture: 'Good Morning', confidence: 78 };
      if (yVelocity > 18) return { gesture: 'Good Night', confidence: 76 };
      if (speed >= 2.5 && speed <= 6.0) {
        return { gesture: 'Please', confidence: 84 };
      }
      if (isFlatHand) return { gesture: 'Thank You', confidence: 79 };
      return { gesture: 'Hello', confidence: 74 };
    }

    return null;
  };

  const runMultiHandClassifierMobile = (handsData, landmarkCount = 0) => {
    if (handsData.length === 0) {
      setDetectedGesture('Awaiting Hand...');
      setConfidence('0.0');
      return;
    }

    const result = classifyGestureGeometric(handsData);
    if (result) {
      updateClassifierOutputMobile(result.gesture, result.confidence);
    } else {
      updateClassifierOutputMobile('Awaiting Hand...', 0.0);
    }
  };

  const updateClassifierOutputMobile = (detected, confidenceVal) => {
    if (detected === 'Awaiting Hand...') {
      setDetectedGesture('Awaiting Hand...');
      setConfidence('0.0');
      return;
    }

    const finalConf = Math.min(99.9, confidenceVal).toFixed(1);

    mobileHistoryBufferRef.current.push(detected);
    if (mobileHistoryBufferRef.current.length > 15) mobileHistoryBufferRef.current.shift();

    const counts = {};
    let consensus = '';
    let max = 0;
    mobileHistoryBufferRef.current.forEach(g => {
      counts[g] = (counts[g] || 0) + 1;
      if (counts[g] > max) {
        max = counts[g];
        consensus = g;
      }
    });

    if (consensus) {
      setDetectedGesture(consensus.toUpperCase());
      setConfidence(finalConf);
    }

    if (max > 6 && lastLoggedMobileGestureRef.current !== consensus && consensus && consensus !== 'Awaiting Hand...') {
      lastLoggedMobileGestureRef.current = consensus;
      speakVoiceOutput(getTranslation(currentLanguage, consensus.toLowerCase()));
      makeAPIRequest('/api/translations', 'POST', {
        source_type: 'sign_to_text_mobile',
        source_content: 'hand_gesture',
        translated_content: consensus,
        confidence: parseFloat(finalConf)
      }).catch(() => {});
    }
  };

  // SOS distress sweeps
  useEffect(() => {
    if (activeScreen === 'mobile-screen-sos' && radarRef.current) {
      const canvas = radarRef.current;
      const ctx = canvas.getContext('2d');
      canvas.width = canvas.offsetWidth || 280;
      canvas.height = canvas.offsetHeight || 160;

      const render = () => {
        const time = Date.now() * 0.001;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        const w = canvas.width;
        const h = canvas.height;

        ctx.strokeStyle = "rgba(255, 42, 95, 0.05)";
        for (let x = 0; x < w; x += 15) {
          ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
        }
        ctx.strokeStyle = "rgba(255, 42, 95, 0.15)";
        ctx.beginPath(); ctx.arc(w/2, h/2, 40, 0, Math.PI*2); ctx.arc(w/2, h/2, 70, 0, Math.PI*2); ctx.stroke();

        // sweep
        const sweepAngle = (time * 1.5) % (Math.PI * 2);
        ctx.save();
        ctx.translate(w / 2, h / 2);
        ctx.rotate(sweepAngle);
        ctx.beginPath();
        ctx.strokeStyle = "rgba(255, 42, 95, 0.25)";
        ctx.moveTo(0, 0); ctx.lineTo(80, 0);
        ctx.stroke();
        ctx.restore();

        // blinking distressed dot
        ctx.fillStyle = "rgba(255, 42, 95, 1)";
        ctx.beginPath(); ctx.arc(w/2, h/2, 3.5, 0, Math.PI*2); ctx.fill();

        radarFrameIdRef.current = requestAnimationFrame(render);
      };

      radarFrameIdRef.current = requestAnimationFrame(render);
      
      // GPS lock simulation
      setAddress("Acquiring location coordinates...");
      const geoTimeout = setTimeout(() => {
        setLatitude(17.3912);
        setLongitude(78.4721);
        setGpsAccuracy(8.2);
        setAddress("Narayanguda Main Road, Hyderabad, Telangana, India");
      }, 1500);

      return () => {
        clearTimeout(geoTimeout);
        if (radarFrameIdRef.current) cancelAnimationFrame(radarFrameIdRef.current);
      };
    }
  }, [activeScreen]);

  // Predefined triggers
  const playMobileAvatarSign = (gesture) => {
    setTtsCaption(gesture.toUpperCase().replace('_', ' '));
    setTtsActiveGesture(gesture);
    setTimeout(() => {
      setTtsActiveGesture('default');
      setTtsCaption('');
    }, 1600);
  };

  const triggerMobileSOS = (phrase) => {
    setSosActive(true);
    setSosSentBadge({});
    addNotification("Mobile SOS Broadcast", `Broadcast sent: "${phrase}"`, "success");
    speakVoiceOutput(`Emergency Alert sent: ${phrase}`);
  };

  const sendWhatsAppSOS = (contact) => {
    setSosSentBadge(prev => ({ ...prev, [contact.id]: true }));
    const phone = contact.phone.replace(/[^\d+]/g, '');
    const message = `🚨 MOBILE SOS 🚨\nUser needs help.\nLocation: Narayanguda, Hyderabad\nCoordinates: ${latitude}, ${longitude}\nMaps: https://www.google.com/maps?q=${latitude},${longitude}`;
    window.open(`https://api.whatsapp.com/send?phone=${phone}&text=${encodeURIComponent(message)}`, '_blank');
  };

  const speakVoiceOutput = (txt) => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(txt);
    window.speechSynthesis.speak(utterance);
  };

  const handleQuizAnswer = (opt, correct) => {
    if (opt === correct) {
      alert("Correct choice! +20 XP earned.");
      setXpPoints(prev => prev + 20);
      setQuizIndex(prev => (prev + 1) % quizQuestions.length);
    } else {
      alert("Incorrect answer. Please verify and try again.");
    }
  };

  return (
    <div id="mobile-view" className="view-section active">
      <div className="mobile-emulator-container">
        
        {/* Simulation controller toggle buttons */}
        <div className="simulator-controls" style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginBottom: '15px' }}>
          <button className={`btn-secondary ${viewportType === 'iphone' ? 'btn-demo-active' : ''}`} onClick={() => setViewportType('iphone')}>
            <i className="fa-brands fa-apple"></i> Apple iOS Shell
          </button>
          <button className={`btn-secondary ${viewportType === 'pixel' ? 'btn-demo-active' : ''}`} onClick={() => setViewportType('pixel')}>
            <i className="fa-brands fa-android"></i> Android Pixel Shell
          </button>
        </div>

        {/* Device Wrapper */}
        <div id="phone-shell-container" className={`phone-simulator-shell ${viewportType === 'iphone' ? 'iphone-shell' : 'pixel-shell'}`}>
          
          {/* iOS Notch or Camera Dot */}
          {viewportType === 'iphone' ? (
            <div id="phone-notch-bar" className="phone-notch">
              <span className="notch-speaker"></span>
              <span className="notch-camera"></span>
            </div>
          ) : (
            <div className="pixel-camera-dot"></div>
          )}

          {/* Screen inner area */}
          <div className="phone-screen-inner" style={{ position: 'relative', display: 'flex', flexDirection: 'column', background: '#07070f' }}>
            
            {/* Status bar */}
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 12px', fontSize: '9px', fontWeight: 'bold', color: '#fff', borderBottom: '1px solid rgba(255,255,255,0.03)', background: 'rgba(0,0,0,0.1)' }}>
              <span>9:41 AM</span>
              <div style={{ display: 'flex', gap: '5px' }}>
                <i className="fa-solid fa-signal"></i>
                <i className="fa-solid fa-wifi"></i>
                <i className="fa-solid fa-battery-three-quarters"></i>
              </div>
            </div>

            {/* SCREEN CONTENT AREA */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '12px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              
              {/* SCREEN 1: HOME */}
              {activeScreen === 'mobile-screen-home' && (
                <div id="mobile-screen-home" className="mobile-view-section active">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <h3 style={{ margin: 0, color: 'var(--accent-cyan)', fontSize: '14px' }}>SignVision Mobile</h3>
                    <span style={{ fontSize: '10px', background: 'rgba(255,230,0,0.1)', color: 'var(--accent-yellow)', padding: '2px 8px', borderRadius: '10px', fontWeight: 'bold' }}>
                      <i className="fa-solid fa-star"></i> {xpPoints} XP
                    </span>
                  </div>

                  {/* App greeting */}
                  <div className="glass-card" style={{ padding: '10px', fontSize: '11px' }}>
                    <strong>Hello, user!</strong>
                    <p style={{ margin: '4px 0 0 0', color: 'var(--text-secondary)' }}>
                      On-device neural vision filters active. Tap tools below to begin.
                    </p>
                  </div>

                  {/* Action Shortcuts */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '10px' }}>
                    <div className="glass-card" style={{ padding: '12px', textAlign: 'center', cursor: 'pointer' }} onClick={() => setActiveScreen('mobile-screen-cam')}>
                      <i className="fa-solid fa-video" style={{ fontSize: '20px', color: 'var(--accent-cyan)', marginBottom: '5px' }}></i>
                      <div style={{ fontSize: '10px', fontWeight: 'bold' }}>Cam Classify</div>
                    </div>
                    <div className="glass-card" style={{ padding: '12px', textAlign: 'center', cursor: 'pointer' }} onClick={() => setActiveScreen('mobile-screen-avatar')}>
                      <i className="fa-solid fa-keyboard" style={{ fontSize: '20px', color: 'var(--accent-cyan)', marginBottom: '5px' }}></i>
                      <div style={{ fontSize: '10px', fontWeight: 'bold' }}>Text to Sign</div>
                    </div>
                    <div className="glass-card" style={{ padding: '12px', textAlign: 'center', cursor: 'pointer' }} onClick={() => setActiveScreen('mobile-screen-quiz')}>
                      <i className="fa-solid fa-graduation-cap" style={{ fontSize: '20px', color: 'var(--accent-yellow)', marginBottom: '5px' }}></i>
                      <div style={{ fontSize: '10px', fontWeight: 'bold' }}>Solve Quiz</div>
                    </div>
                    <div className="glass-card" style={{ padding: '12px', textAlign: 'center', cursor: 'pointer', border: '1px solid rgba(255,42,95,0.2)' }} onClick={() => setActiveScreen('mobile-screen-sos')}>
                      <i className="fa-solid fa-triangle-exclamation" style={{ fontSize: '20px', color: 'var(--accent-red)', marginBottom: '5px' }}></i>
                      <div style={{ fontSize: '10px', fontWeight: 'bold', color: 'var(--accent-red)' }}>Emergency SOS</div>
                    </div>
                  </div>
                </div>
              )}

              {/* SCREEN 2: CAMERA DETECTOR */}
              {activeScreen === 'mobile-screen-cam' && (
                <div id="mobile-screen-cam" className="mobile-view-section active">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <h4 style={{ margin: 0, fontSize: '12px' }}>Camera Classification</h4>
                    <button
                      className="btn-secondary"
                      style={{ padding: '3px 8px', fontSize: '9px', display: 'flex', alignItems: 'center', gap: '4px' }}
                      onClick={toggleFacingMode}
                    >
                      <i className="fa-solid fa-camera-rotate"></i>
                      {facingMode === 'user' ? 'Front' : 'Rear'}
                    </button>
                  </div>
                  
                  <div className="glass-card" style={{ height: '220px', position: 'relative', overflow: 'hidden', padding: 0 }}>
                    <video
                      ref={webcamRef}
                      autoPlay
                      muted
                      playsInline
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                    <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0 }} />
                    {!isCamActive && (
                      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <i className="fa-solid fa-video-slash" style={{ fontSize: '24px', opacity: 0.2 }}></i>
                      </div>
                    )}
                  </div>

                  {/* Output lock */}
                  <div className="glass-card" style={{ padding: '10px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px' }}>
                      <span style={{ color: 'var(--accent-red)', fontWeight: 'bold' }}>TARGET LOCKED</span>
                      <strong>{confidence}%</strong>
                    </div>
                    <div style={{ fontSize: '18px', fontWeight: 'bold', color: 'var(--accent-cyan)', marginTop: '4px', textAlign: 'center' }}>
                      {getTranslation(currentLanguage, detectedGesture.toLowerCase())}
                    </div>
                  </div>
                </div>
              )}

              {/* SCREEN 3: AVATAR TRANSLATION */}
              {activeScreen === 'mobile-screen-avatar' && (
                <div id="mobile-screen-avatar" className="mobile-view-section active">
                  <h4 style={{ margin: '0 0 8px 0', fontSize: '12px' }}>Text to Sign</h4>

                  <div style={{ display: 'flex', gap: '5px', marginBottom: '8px' }}>
                    <input
                      type="text"
                      className="form-input"
                      style={{ fontSize: '11px', padding: '6px' }}
                      placeholder="hello, thank you, food..."
                      value={ttsInput}
                      onChange={(e) => setTtsInput(e.target.value)}
                    />
                    <button className="btn-primary" style={{ padding: '6px 10px', fontSize: '10px' }} onClick={() => playMobileAvatarSign(ttsInput.trim().toLowerCase())}>
                      Sign
                    </button>
                  </div>

                  <div className="glass-card" style={{ height: '200px', position: 'relative', overflow: 'hidden', padding: 0 }}>
                    <Avatar2D gesture={ttsActiveGesture} speedRate={1.0} />
                    {ttsCaption && (
                      <div style={{ position: 'absolute', top: '10px', left: '50%', transform: 'translateX(-50%)', background: 'rgba(6,6,12,0.9)', border: '1px solid var(--accent-cyan)', color: 'var(--accent-cyan)', padding: '3px 10px', borderRadius: '15px', fontSize: '9px', fontWeight: 'bold' }}>
                        {ttsCaption}
                      </div>
                    )}
                  </div>

                  <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginTop: '5px' }}>
                    {['hello', 'thank_you', 'water', 'yes', 'no'].map(g => (
                      <button key={g} className="btn-secondary" style={{ padding: '3px 8px', fontSize: '9px' }} onClick={() => playMobileAvatarSign(g)}>
                        {getTranslation(currentLanguage, g)}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* SCREEN 4: QUIZ SCREEN */}
              {activeScreen === 'mobile-screen-quiz' && (
                <div id="mobile-screen-quiz" className="mobile-view-section active">
                  <h4 style={{ margin: '0 0 8px 0', fontSize: '12px' }}>Practice Quiz</h4>

                  <div className="glass-card" style={{ padding: '12px' }}>
                    <div style={{ fontSize: '11px', fontWeight: 'bold', marginBottom: '8px' }}>
                      {quizQuestions[quizIndex].q}
                    </div>

                    <div style={{ fontSize: '36px', color: 'var(--accent-yellow)', textAlign: 'center', margin: '12px 0' }}>
                      <i className={`fa-solid ${quizQuestions[quizIndex].icon}`}></i>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                      {quizQuestions[quizIndex].options.map(opt => (
                        <button
                          key={opt}
                          className="form-input"
                          style={{ fontSize: '10px', cursor: 'pointer', textAlign: 'left', background: 'rgba(255,255,255,0.02)' }}
                          onClick={() => handleQuizAnswer(opt, quizQuestions[quizIndex].answer)}
                        >
                          {getTranslation(currentLanguage, opt)}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* SCREEN 5: SOS BROADCAST PANEL */}
              {activeScreen === 'mobile-screen-sos' && (
                <div id="mobile-screen-sos" className="mobile-view-section active">
                  <h4 style={{ margin: '0 0 5px 0', fontSize: '12px', color: 'var(--accent-red)' }}>Emergency SOS Mode</h4>
                  
                  {/* Radar sweep */}
                  <div className="glass-card" style={{ height: '140px', position: 'relative', overflow: 'hidden', padding: 0 }}>
                    <canvas ref={radarRef} style={{ width: '100%', height: '100%', display: 'block' }} />
                  </div>

                  {/* Lat Lng Ticker */}
                  <div className="glass-card" style={{ padding: '8px', fontSize: '9px', fontFamily: 'monospace' }}>
                    <div>GPS: {latitude.toFixed(4)}, {longitude.toFixed(4)} (Accuracy: {gpsAccuracy.toFixed(1)}m)</div>
                    <div style={{ color: 'var(--text-secondary)', marginTop: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {address}
                    </div>
                  </div>

                  {/* Dispatch triggers */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                    <button className="btn-primary" style={{ background: 'var(--accent-red)', fontSize: '11px', padding: '10px' }} onClick={() => triggerMobileSOS("Police Dispatch Request")}>
                      🚨 Call Police Dispatcher
                    </button>
                    <button className="btn-primary" style={{ background: 'var(--accent-red)', fontSize: '11px', padding: '10px' }} onClick={() => triggerMobileSOS("Ambulance Dispatch Request")}>
                      🚨 Call Hospital Dispatcher
                    </button>
                  </div>

                  {/* Contacts direct WhatsApp */}
                  {sosActive && (
                    <div style={{ marginTop: '5px' }}>
                      <span style={{ fontSize: '10px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Broadcast WhatsApp Alert:</span>
                      {contacts.map(c => (
                        <div key={c.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-color)', borderRadius: '4px', fontSize: '10px', marginBottom: '3px' }}>
                          <span>{c.name}</span>
                          <button
                            className="btn-primary"
                            style={{ padding: '2px 6px', fontSize: '9px', background: sosSentBadge[c.id] ? 'rgba(57,255,20,0.15)' : 'var(--accent-red)', color: sosSentBadge[c.id] ? 'var(--accent-green)' : '#fff' }}
                            onClick={() => sendWhatsAppSOS(c)}
                            disabled={sosSentBadge[c.id]}
                          >
                            {sosSentBadge[c.id] ? 'Sent' : 'Send'}
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

            </div>

            {/* iOS Home Indicator or Android Back Keys */}
            {viewportType === 'iphone' ? (
              <div id="phone-home-indicator-bar" className="phone-home-indicator"></div>
            ) : (
              <div id="phone-android-buttons-bar" className="phone-android-buttons">
                <i className="fa-solid fa-chevron-left" onClick={() => setActiveScreen('mobile-screen-home')}></i>
                <i className="fa-solid fa-circle" onClick={() => setActiveScreen('mobile-screen-home')}></i>
                <i className="fa-solid fa-square"></i>
              </div>
            )}

            {/* Bottom Navigator */}
            <div className="phone-bottom-nav">
              <a href="#" className={`mobile-nav-item ${activeScreen === 'mobile-screen-home' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); setActiveScreen('mobile-screen-home'); }}>
                <i className="fa-solid fa-house"></i>
              </a>
              <a href="#" className={`mobile-nav-item ${activeScreen === 'mobile-screen-cam' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); setActiveScreen('mobile-screen-cam'); }}>
                <i className="fa-solid fa-video"></i>
              </a>
              <a href="#" className={`mobile-nav-item ${activeScreen === 'mobile-screen-avatar' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); setActiveScreen('mobile-screen-avatar'); }}>
                <i className="fa-solid fa-keyboard"></i>
              </a>
              <a href="#" className={`mobile-nav-item ${activeScreen === 'mobile-screen-quiz' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); setActiveScreen('mobile-screen-quiz'); }}>
                <i className="fa-solid fa-graduation-cap"></i>
              </a>
              <a href="#" className={`mobile-nav-item ${activeScreen === 'mobile-screen-sos' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); setActiveScreen('mobile-screen-sos'); }}>
                <i className="fa-solid fa-triangle-exclamation" style={{ color: 'var(--accent-red)' }}></i>
              </a>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
