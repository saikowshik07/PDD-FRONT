import React from 'react';

export default function SOSModal({
  sosModalOpen,
  setSosModalOpen,
  stopGPSWatching,
  sosPhraseUsed,
  sosSimLabel,
  sosSimProgress,
  contacts,
  sosContactsSent,
  sendWhatsAppMessage
}) {
  if (!sosModalOpen) return null;

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 120, background: 'rgba(12,4,7,0.95)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '15px' }}>
      <div className="glass-card" style={{ maxWidth: '500px', width: '100%', display: 'flex', flexDirection: 'column', gap: '15px', border: '2px solid var(--accent-red)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '10px' }}>
          <h3 style={{ margin: 0, fontSize: '16px', color: 'var(--accent-red)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <i className="fa-solid fa-triangle-exclamation animate-pulse"></i> SOS EMERGENCY ALERT BROADCAST
          </h3>
          <button className="btn-secondary" style={{ padding: '2px 8px', fontSize: '10px', color: 'var(--accent-red)', borderColor: 'rgba(255,42,95,0.2)' }} onClick={() => {
            setSosModalOpen(false);
            stopGPSWatching();
          }}>
            Close
          </button>
        </div>

        <div>
          <span style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '3px' }}>Trigger Phrase Used</span>
          <strong style={{ fontSize: '18px', color: '#fff' }}>"{sosPhraseUsed}"</strong>
        </div>

        {/* Broadcast simulation bar */}
        <div style={{ background: 'rgba(255,255,255,0.02)', padding: '15px', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '5px' }}>
            <span style={{ color: 'var(--accent-yellow)' }}>{sosSimLabel}</span>
            <strong>{sosSimProgress}%</strong>
          </div>
          <div className="loader-bar-container" style={{ height: '8px' }}>
            <div className="loader-bar-fill" style={{ width: `${sosSimProgress}%`, background: 'var(--accent-red)' }}></div>
          </div>
        </div>

        {/* Contacts list with manually WhatsApp alerts triggers */}
        <div>
          <span style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Responder Broadcasters:</span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '180px', overflowY: 'auto' }}>
            {contacts.map(c => (
              <div key={c.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-color)', borderRadius: '4px', fontSize: '11px' }}>
                <div>
                  <strong style={{ color: '#fff' }}>{c.name}</strong> <span style={{ color: 'var(--text-muted)' }}>({c.category})</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '9px', color: sosContactsSent[c.id] ? 'var(--accent-green)' : 'var(--accent-yellow)' }}>
                    {sosContactsSent[c.id] ? 'Sent' : 'Awaiting Send'}
                  </span>
                  <button
                    className="btn-primary"
                    style={{ padding: '3px 8px', fontSize: '10px', background: sosContactsSent[c.id] ? 'rgba(57,255,20,0.2)' : 'var(--accent-red)', color: sosContactsSent[c.id] ? 'var(--accent-green)' : '#fff' }}
                    onClick={() => sendWhatsAppMessage(c)}
                    disabled={sosContactsSent[c.id]}
                  >
                    {sosContactsSent[c.id] ? <i className="fa-solid fa-check"></i> : <i className="fa-solid fa-share"></i>} Send
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
