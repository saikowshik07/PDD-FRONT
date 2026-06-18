import React from 'react';

export default function SOSView({
  getTranslation,
  currentLanguage,
  triggerEmergencySOS,
  stopGPSWatching,
  startGPSWatching,
  gpsStatus,
  latitude,
  longitude,
  gpsAccuracy,
  reverseAddress,
  radarCanvasRef,
  contacts,
  openEditContact,
  deleteContact,
  setContactModalOpen,
  setEditingContact,
  setContactNameInput,
  setContactPhoneInput,
  setContactCategoryInput,
  setContactPriorityInput,
  sosHistoryList,
  clearSOSHistory,
  exportSOSHistoryCSV
}) {
  return (
    <div id="dash-sos">
      <h1 className="workspace-title">{getTranslation(currentLanguage, 'accessibility_sos')}</h1>
      <p className="workspace-subtitle">Configure emergency responder phone numbers, preview geocoding logs, and broadcast distress notifications.</p>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '25px', marginTop: '20px' }}>

        {/* Emergency Console Radar and buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>

          <div className="glass-card" id="sos-panel-card">
            <h3 style={{ margin: '0 0 10px 0', fontSize: '16px', color: 'var(--accent-red)' }}>
              <i className="fa-solid fa-triangle-exclamation"></i> {getTranslation(currentLanguage, 'sos_console')}
            </h3>
            <p style={{ margin: '0 0 15px 0', fontSize: '11px', color: 'var(--text-secondary)' }}>
              {getTranslation(currentLanguage, 'sos_desc')}
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '15px' }}>
              <button className="btn-primary" style={{ background: 'var(--accent-red)', padding: '12px' }} onClick={() => triggerEmergencySOS('Emergency Call: Local Police Desk')}>
                <i className="fa-solid fa-shield-halved"></i> Dispatch Police Desk
              </button>
              <button className="btn-primary" style={{ background: 'var(--accent-red)', padding: '12px' }} onClick={() => triggerEmergencySOS('Emergency Call: City Hospital Dispatch')}>
                <i className="fa-solid fa-truck-medical"></i> Dispatch City Ambulance
              </button>
            </div>

            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {['I Need Doctor', 'I Need Police', 'Hospital Request', 'Fire Emergency', 'Family SOS Request'].map(txt => (
                <button key={txt} className="btn-secondary" style={{ color: 'var(--accent-red)', borderColor: 'rgba(255,42,95,0.3)', fontSize: '11px' }} onClick={() => triggerEmergencySOS(txt)}>
                  {txt}
                </button>
              ))}
            </div>
          </div>

          {/* Satellite mapping telemetry console */}
          <div className="glass-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
              <span style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--accent-red)' }}>LIVE DISTRESS GPS TRACKING RADAR</span>
              <button className="btn-secondary" style={{ padding: '4px 10px', fontSize: '10px' }} onClick={() => { stopGPSWatching(); startGPSWatching(); }}>
                <i className="fa-solid fa-arrows-rotate"></i> {getTranslation(currentLanguage, 'refresh_gps')}
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '15px' }}>

              {/* Radar sweep */}
              <div style={{ height: '180px', position: 'relative', background: 'rgba(0,0,0,0.2)', borderRadius: '6px', overflow: 'hidden' }}>
                <canvas ref={radarCanvasRef} style={{ width: '100%', height: '100%', display: 'block' }} />
              </div>

              {/* Coordinates details */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '11px' }}>
                <div>STATUS: <span style={{ color: gpsStatus === 'Accurate' ? 'var(--accent-green)' : 'var(--accent-yellow)', fontWeight: 'bold' }}>{gpsStatus.toUpperCase()}</span></div>
                <div>LATITUDE: <span style={{ fontFamily: 'monospace' }}>{latitude.toFixed(6)}</span></div>
                <div>LONGITUDE: <span style={{ fontFamily: 'monospace' }}>{longitude.toFixed(6)}</span></div>
                <div>PRECISION: <span style={{ fontFamily: 'monospace' }}>{gpsAccuracy.toFixed(1)}m</span></div>

                <div style={{ marginTop: '8px', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '6px' }}>
                  <span style={{ color: 'var(--text-muted)', fontWeight: 'bold' }}>GEODECIPHERED ADDRESS:</span>
                  <p style={{ margin: '4px 0 0 0', color: '#fff', fontSize: '10px', lineHeight: '1.3' }}>
                    {reverseAddress.address}
                  </p>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Contacts CRUD layout */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
          <div className="glass-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
              <h3 style={{ margin: 0, fontSize: '15px', color: 'var(--accent-cyan)' }}>
                <i className="fa-solid fa-address-book"></i> {getTranslation(currentLanguage, 'emergency_contacts')}
              </h3>
              <button className="btn-primary" style={{ padding: '6px 12px', fontSize: '11px' }} onClick={() => {
                setEditingContact(null);
                setContactNameInput('');
                setContactPhoneInput('');
                setContactCategoryInput('Police');
                setContactPriorityInput(false);
                setContactModalOpen(true);
              }}>
                <i className="fa-solid fa-plus"></i> {getTranslation(currentLanguage, 'add_contact')}
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '350px', overflowY: 'auto' }}>
              {contacts.map(contact => (
                <div key={contact.id} className="contact-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: '6px', fontSize: '12px' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <i className={`fa-solid ${contact.category === 'Police' ? 'fa-shield-halved' : (contact.category === 'Ambulance' ? 'fa-truck-medical' : (contact.category === 'Family' ? 'fa-heart' : 'fa-user-doctor'))}`} style={{ color: 'var(--accent-cyan)' }}></i>
                      <strong style={{ color: '#fff' }}>{contact.name}</strong>
                      {contact.priority && <span className="vip-badge" style={{ background: 'linear-gradient(45deg, #ffd700, #ffa500)', color: '#000', fontSize: '8px', fontWeight: 'bold', padding: '1px 5px', borderRadius: '8px' }}>VIP</span>}
                    </div>
                    <div style={{ fontSize: '10px', color: 'var(--text-secondary)', marginTop: '2px' }}>{contact.phone} ({contact.category})</div>
                  </div>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button className="btn-primary" style={{ padding: '3px 8px', fontSize: '10px', background: 'var(--accent-red)' }} onClick={() => triggerEmergencySOS(`SOS to ${contact.name}`)}>SOS</button>
                    <button className="btn-secondary" style={{ padding: '3px 8px', fontSize: '10px' }} onClick={() => openEditContact(contact)}><i className="fa-solid fa-pen"></i></button>
                    <button className="btn-secondary" style={{ padding: '3px 8px', fontSize: '10px', color: 'var(--accent-red)', borderColor: 'rgba(255,42,95,0.2)' }} onClick={() => deleteContact(contact.id)}><i className="fa-solid fa-trash"></i></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* SOS History list */}
      <div className="glass-card" style={{ marginTop: '25px', border: '1px solid rgba(255, 42, 95, 0.15)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
          <h3 style={{ margin: 0, fontSize: '15px', color: 'var(--accent-red)' }}>
            <i className="fa-solid fa-clock-rotate-left"></i> {getTranslation(currentLanguage, 'sos_history')}
          </h3>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button className="btn-secondary" style={{ padding: '4px 10px', fontSize: '11px', color: 'var(--accent-red)', borderColor: 'rgba(255,42,95,0.2)' }} onClick={clearSOSHistory}>
              Clear History
            </button>
            <button className="btn-primary" style={{ padding: '4px 10px', fontSize: '11px' }} onClick={exportSOSHistoryCSV}>
              Export CSV
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '250px', overflowY: 'auto' }}>
          {sosHistoryList.length === 0 ? (
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', textAlign: 'center', padding: '20px' }}>
              No emergency alerts logged yet.
            </div>
          ) : (
            sosHistoryList.map((log, i) => (
              <div key={i} className="glass-card" style={{ border: '1px solid rgba(255, 42, 95, 0.15)', padding: '12px', fontSize: '11px', background: 'rgba(255,255,255,0.01)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '6px', marginBottom: '8px' }}>
                  <span style={{ fontWeight: 'bold', color: 'var(--accent-red)' }}><i className="fa-solid fa-triangle-exclamation"></i> SOS SENT</span>
                  <span style={{ color: 'var(--text-muted)' }}>{log.timestamp}</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div>
                    <strong>Responder: </strong> {log.contact.name} ({log.contact.category}) - <span style={{ color: 'var(--accent-cyan)' }}>{log.contact.phone}</span>
                  </div>
                  <div>
                    <strong>Coordinates: </strong> {log.latitude?.toFixed(6)}, {log.longitude?.toFixed(6)}
                  </div>
                </div>
                <div style={{ marginTop: '5px', color: 'var(--text-secondary)' }}><strong>Address: </strong> {log.address}</div>
                <pre style={{ margin: '6px 0 0 0', background: 'rgba(0,0,0,0.3)', padding: '8px', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.03)', fontSize: '10px', fontFamily: 'monospace', whiteSpace: 'pre-wrap' }}>{log.message}</pre>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
