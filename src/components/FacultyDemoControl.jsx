import React, { useState } from 'react';

export default function FacultyDemoControl({ onSimulateSign, onUnlockAchievements, ultraDemoMode, onToggleUltraMode }) {
  const [minimized, setMinimized] = useState(false);

  const gestures = [
    { key: 'hi', label: 'Hi' },
    { key: 'hello', label: 'Hello' },
    { key: 'yes', label: 'Yes' },
    { key: 'no', label: 'No' },
    { key: 'thank_you', label: 'Thank You' },
    { key: 'please', label: 'Please' },
    { key: 'sorry', label: 'Sorry' },
    { key: 'good_morning', label: 'Good Morning' },
    { key: 'good_night', label: 'Good Night' },
    { key: 'how_are_you', label: 'How Are You' },
    { key: 'my_name_is', label: 'My Name Is' },
    { key: 'friend', label: 'Friend' },
    { key: 'love', label: 'Love' },
    { key: 'water', label: 'Water' },
    { key: 'food', label: 'Food' },
    { key: 'doctor', label: 'Doctor' },
    { key: 'hospital', label: 'Hospital' },
    { key: 'emergency', label: 'Emergency' },
    { key: 'help', label: 'Help' },
    { key: 'stop', label: 'Stop' },
    { key: 'ok', label: 'OK' },
    { key: 'fine', label: 'Fine' }
  ];

  return (
    <div
      id="demo-overlay-widget"
      className={`glass-card demo-panel-overlay ${minimized ? 'minimized' : ''}`}
      style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        width: '320px',
        zIndex: 9999,
        padding: '15px',
        border: '1px solid rgba(0, 240, 255, 0.35)',
        boxShadow: '0px 0px 15px rgba(0, 240, 255, 0.15)',
        background: 'rgba(6, 6, 12, 0.95)',
        borderRadius: '12px',
        transition: 'all 0.3s ease'
      }}
    >
      <div
        className="demo-header"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          paddingBottom: '8px',
          marginBottom: '10px',
          cursor: 'pointer'
        }}
        onClick={() => setMinimized(!minimized)}
      >
        <h3 style={{ fontSize: '13px', margin: 0, color: 'var(--accent-cyan)', fontWeight: 'bold' }}>
          <i className="fa-solid fa-graduation-cap" style={{ marginRight: '6px' }}></i>
          FACULTY DEMO CONTROL
        </h3>
        <button
          id="demo-expand-icon"
          className="icon-btn"
          style={{ width: '20px', height: '20px', fontSize: '9px', background: 'none', border: 'none', color: '#fff' }}
        >
          <i className={`fa-solid ${minimized ? 'fa-chevron-up' : 'fa-chevron-down'}`}></i>
        </button>
      </div>

      {!minimized && (
        <div className="demo-body" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <p style={{ fontSize: '11px', color: 'var(--text-secondary)', margin: 0 }}>
            Click button presets to simulate real-time joint-coordinate MediaPipe frames and model predictions:
          </p>

          <div
            className="demo-actions-grid"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '6px',
              maxHeight: '120px',
              overflowY: 'auto',
              paddingRight: '4px'
            }}
          >
            {gestures.map((g) => (
              <button
                key={g.key}
                className="btn-demo-trigger"
                onClick={() => onSimulateSign(g.key)}
                style={{
                  padding: '4px 6px',
                  fontSize: '9.5px',
                  borderRadius: '4px',
                  border: '1px solid rgba(255,255,255,0.05)',
                  background: 'rgba(255,255,255,0.02)',
                  color: '#fff',
                  cursor: 'pointer',
                  textAlign: 'center',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}
              >
                {g.label}
              </button>
            ))}
          </div>

          <div
            style={{
              borderTop: '1px solid rgba(255,255,255,0.08)',
              paddingTop: '10px',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px' }}>
              <span>Presentation Stream:</span>
              <span id="demo-metric-preset" style={{ color: 'var(--accent-cyan)', fontWeight: 'bold' }}>
                {ultraDemoMode ? 'Ultra WebGL (60 FPS)' : 'Standard Damped (54 FPS)'}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px' }}>
              <span>Latency Output:</span>
              <span id="demo-metric-latency" style={{ color: 'var(--accent-cyan)', fontWeight: 'bold' }}>
                {ultraDemoMode ? '2.8 ms' : '4.5 ms'}
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '5px 0' }}>
              <label htmlFor="check-ultra-demo-mode" style={{ fontSize: '11px', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                Enable Ultra Demo Mode
              </label>
              <input
                type="checkbox"
                id="check-ultra-demo-mode"
                checked={ultraDemoMode}
                onChange={(e) => onToggleUltraMode(e.target.checked)}
                style={{ cursor: 'pointer', width: '15px', height: '15px' }}
              />
            </div>

            <button
              className="btn-secondary"
              onClick={onUnlockAchievements}
              style={{
                width: '100%',
                padding: '6px 10px',
                fontSize: '11px',
                border: '1px solid var(--accent-cyan)',
                color: 'var(--accent-cyan)',
                background: 'rgba(0, 240, 255, 0.05)',
                cursor: 'pointer',
                borderRadius: '6px',
                fontWeight: 'bold',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '5px'
              }}
            >
              <i className="fa-solid fa-trophy"></i> Unlock All Achievements
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
