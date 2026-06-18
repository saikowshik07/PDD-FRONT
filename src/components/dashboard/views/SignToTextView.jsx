import React from 'react';

export default function SignToTextView({
  getTranslation,
  currentLanguage,
  sttWebcamRef,
  sttCanvasRef,
  isCameraActive,
  isCameraCalibrating,
  calibrationProgress,
  detectedGesture,
  confidence,
  voiceAssistant,
  setVoiceAssistant,
  realCameraMockEnabled,
  setRealCameraMockEnabled,
  toggleCameraFeed,
  startCameraCalibration,
  speakSynthesis,
  setBackendHistory,
  addNotification
}) {
  return (
    <div id="dash-sign-to-text">
      <h1 className="workspace-title">{getTranslation(currentLanguage, 'sign_to_text')}</h1>
      <p className="workspace-subtitle">Translate sign language hand gestures into spoken/written regional translations using on-device classifier models.</p>

      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '25px', marginTop: '20px' }}>

        {/* Camera Panel */}
        <div className="glass-card camera-panel" style={{ position: 'relative', height: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <video
            ref={sttWebcamRef}
            autoPlay
            muted
            playsInline
            style={{
              position: 'absolute',
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              display: isCameraActive ? 'block' : 'none',
              borderRadius: '8px'
            }}
          />

          <canvas
            ref={sttCanvasRef}
            style={{
              position: 'absolute',
              width: '100%',
              height: '100%',
              zIndex: 10,
              pointerEvents: 'none'
            }}
          />

          {isCameraCalibrating && (
            <div style={{ position: 'absolute', zIndex: 12, background: 'rgba(4,4,7,0.8)', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '15px' }}>
              <strong style={{ color: '#fff', fontSize: '15px' }}>ALIGN HAND WITH TARGET BOUNDS</strong>
              <div className="loader-bar-container" style={{ width: '220px' }}>
                <div className="loader-bar-fill" style={{ width: `${calibrationProgress}%` }}></div>
              </div>
              <span style={{ fontSize: '11px', color: 'var(--accent-yellow)', fontFamily: 'monospace' }}>
                Auto-Calibrating Optical Feed: {calibrationProgress}%
              </span>
            </div>
          )}

          {!isCameraActive && (
            <div id="stt-cam-placeholder" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px', zIndex: 20 }}>
              <div style={{ fontSize: '50px', color: 'rgba(255,255,255,0.06)' }}><i className="fa-solid fa-video-slash"></i></div>
              <button className="btn-primary" onClick={toggleCameraFeed}>
                <i className="fa-solid fa-video"></i> Start Optical Feed
              </button>
            </div>
          )}

          {isCameraActive && (
            <div style={{ position: 'absolute', top: '15px', right: '15px', background: 'rgba(6,6,12,0.8)', padding: '5px 10px', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.05)', fontSize: '10px', zIndex: 15 }}>
              <span className={`status-dot ${isCameraCalibrating ? 'pulse-dot' : 'locked'}`} style={{ marginRight: '6px', background: isCameraCalibrating ? 'var(--accent-yellow)' : 'var(--accent-green)' }}></span>
              {isCameraCalibrating ? 'CALIBRATING CHANNELS' : 'AI ENGINE ACTIVE'}
            </div>
          )}
        </div>

        {/* Output controls panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="glass-card">
            <h4 style={{ margin: '0 0 15px 0', color: 'var(--text-muted)' }}>{getTranslation(currentLanguage, 'translation_output')}</h4>
            <div style={{ background: 'rgba(0,0,0,0.2)', padding: '20px', borderRadius: '8px', border: '1px solid var(--border-color)', textAlign: 'center', minHeight: '120px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <span style={{ fontSize: '10px', color: 'var(--accent-red)', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>
                Signal Stable — Target Locked
              </span>
              <strong style={{ fontSize: '32px', color: 'var(--accent-cyan)', textShadow: '0 0 10px rgba(0,240,255,0.3)' }}>
                {getTranslation(currentLanguage, detectedGesture.toLowerCase())}
              </strong>
            </div>

            <div style={{ marginTop: '15px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-muted)', marginBottom: '5px' }}>
                <span>{getTranslation(currentLanguage, 'model_confidence')}</span>
                <strong>{confidence}%</strong>
              </div>
              <div className="loader-bar-container">
                <div className="loader-bar-fill" style={{ width: `${confidence}%` }}></div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
              <button className="btn-secondary" style={{ flex: 1 }} onClick={() => speakSynthesis(getTranslation(currentLanguage, detectedGesture.toLowerCase()))}>
                <i className="fa-solid fa-volume-high"></i> {getTranslation(currentLanguage, 'speak')}
              </button>
              <button className="btn-primary" style={{ flex: 1 }} onClick={() => {
                const newRecord = {
                  id: Date.now(),
                  timestamp: new Date().toLocaleTimeString(),
                  mode: 'Sign to Text',
                  source: 'Manual Translation Log',
                  translation: detectedGesture,
                  confidence: `${confidence}%`,
                  icon: 'fa-video'
                };
                setBackendHistory(prev => [newRecord, ...prev]);
                addNotification("History Logged", `Saved translation log for ${detectedGesture}.`, "success");
              }}>
                <i className="fa-solid fa-floppy-disk"></i> {getTranslation(currentLanguage, 'log_history')}
              </button>
            </div>
          </div>

          <div className="glass-card">
            <h4 style={{ margin: '0 0 15px 0', color: 'var(--text-muted)' }}>HUD Classifier Adjustments</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <button className="btn-secondary" onClick={startCameraCalibration} disabled={isCameraCalibrating}>
                <i className="fa-solid fa-wand-magic-sparkles"></i> Calibrate Camera Lighting
              </button>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Voice Synthesizer Auto-Output</span>
                <input
                  type="checkbox"
                  checked={voiceAssistant}
                  onChange={(e) => setVoiceAssistant(e.target.checked)}
                  style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Camera Simulation Fallback</span>
                <input
                  type="checkbox"
                  checked={realCameraMockEnabled}
                  onChange={(e) => setRealCameraMockEnabled(e.target.checked)}
                  style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
