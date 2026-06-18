import React from 'react';

export default function HomeView({
  user,
  getTranslation,
  currentLanguage,
  streakCount,
  xpPoints,
  fps,
  latency,
  engineHealth,
  backendHistory,
  triggerEmergencySOS,
  setActiveSubview
}) {
  return (
    <div id="dash-home">
      <h1 className="workspace-title">{getTranslation(currentLanguage, 'home_dashboard')}</h1>
      <p className="workspace-subtitle">{getTranslation(currentLanguage, 'welcome')} <strong id="dash-welcome-name" style={{ color: 'var(--accent-cyan)' }}>{user?.name}</strong>. {getTranslation(currentLanguage, 'platform_loaded')}</p>

      <div className="dashboard-grid">

        <div className="glass-card stat-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h4 style={{ margin: '0 0 5px 0', color: 'var(--text-muted)' }}>{getTranslation(currentLanguage, 'learning_streaks')}</h4>
              <h2 style={{ margin: 0, fontSize: '32px' }} id="dash-streak-count">
                {streakCount} <i className="fa-solid fa-fire animate-pulse" style={{ color: '#ff5e00' }}></i>
              </h2>
            </div>
            <div style={{ fontSize: '28px', color: '#ff5e00' }}><i className="fa-solid fa-calendar-check"></i></div>
          </div>
          <p style={{ margin: '12px 0 0 0', fontSize: '11px', color: 'var(--text-secondary)' }}>
            {getTranslation(currentLanguage, 'practice_today')}
          </p>
        </div>

        <div className="glass-card stat-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h4 style={{ margin: '0 0 5px 0', color: 'var(--text-muted)' }}>{getTranslation(currentLanguage, 'total_xp')}</h4>
              <h2 style={{ margin: 0, fontSize: '32px' }} id="dash-xp-display">
                {xpPoints.toLocaleString()} XP
              </h2>
            </div>
            <div style={{ fontSize: '28px', color: 'var(--accent-yellow)' }}><i className="fa-solid fa-star"></i></div>
          </div>
          <p style={{ margin: '12px 0 0 0', fontSize: '11px', color: 'var(--text-secondary)' }}>
            {getTranslation(currentLanguage, 'rank_expert')}
          </p>
        </div>

        <div className="glass-card stat-card">
          <h4 style={{ margin: '0 0 10px 0', color: 'var(--text-muted)', fontSize: '12px' }}>{getTranslation(currentLanguage, 'ai_health')}</h4>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '11px' }}>
            <div>FPS: <span style={{ color: 'var(--accent-green)', fontWeight: 'bold' }}>{fps} FPS</span></div>
            <div>LATENCY: <span style={{ color: 'var(--accent-cyan)', fontWeight: 'bold' }}>{latency.toFixed(1)} ms</span></div>
            <div>ENGINE: <span style={{ color: 'var(--accent-green)', fontWeight: 'bold' }}>{engineHealth}</span></div>
            <div>PIPELINE: <span style={{ color: 'var(--accent-cyan)', fontWeight: 'bold' }}>TensorFlow JS</span></div>
          </div>
        </div>
      </div>

      <div className="glass-card" style={{ marginTop: '25px' }}>
        <h3 style={{ margin: '0 0 15px 0', fontSize: '16px', color: 'var(--accent-cyan)' }}>
          {getTranslation(currentLanguage, 'recent_trans')}
        </h3>
        <div className="table-responsive">
          <table className="history-table">
            <thead>
              <tr>
                <th>Time</th>
                <th>Type</th>
                <th>Source</th>
                <th>Translation Result</th>
                <th>Confidence</th>
              </tr>
            </thead>
            <tbody>
              {backendHistory.slice(0, 4).map((h, i) => (
                <tr key={h.id || i}>
                  <td style={{ fontFamily: 'monospace' }}>{h.timestamp}</td>
                  <td>{h.mode}</td>
                  <td style={{ color: 'var(--text-secondary)' }}>{h.source}</td>
                  <td><strong>{h.translation}</strong></td>
                  <td style={{ color: 'var(--accent-cyan)', fontWeight: 'bold' }}>{h.confidence}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="glass-card" style={{ marginTop: '25px', borderLeft: '4px solid var(--accent-red)' }}>
        <h3 style={{ margin: '0 0 8px 0', fontSize: '15px', color: 'var(--accent-red)' }}>
          <i className="fa-solid fa-triangle-exclamation"></i> {getTranslation(currentLanguage, 'quick_sos')}
        </h3>
        <p style={{ margin: '0 0 15px 0', fontSize: '12px', color: 'var(--text-secondary)' }}>
          Click emergency anchors to broadcast location signals to configured responders.
        </p>
        <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
          <button className="btn-primary" style={{ background: 'var(--accent-red)' }} onClick={() => triggerEmergencySOS('Emergency Call: Local Police Desk')}>
            <i className="fa-solid fa-shield-halved"></i> Dispatch Police
          </button>
          <button className="btn-primary" style={{ background: 'var(--accent-red)' }} onClick={() => triggerEmergencySOS('Emergency Call: City Hospital Dispatch')}>
            <i className="fa-solid fa-truck-medical"></i> Dispatch Ambulance
          </button>
          <button className="btn-secondary" style={{ borderColor: 'var(--accent-red)', color: 'var(--accent-red)' }} onClick={() => setActiveSubview('dash-sos')}>
            <i className="fa-solid fa-sliders"></i> SOS Console
          </button>
        </div>
      </div>
    </div>
  );
}
