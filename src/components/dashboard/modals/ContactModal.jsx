import React from 'react';

export default function ContactModal({
  contactModalOpen,
  editingContact,
  saveContact,
  contactNameInput,
  setContactNameInput,
  contactPhoneInput,
  setContactPhoneInput,
  contactCategoryInput,
  setContactCategoryInput,
  contactPriorityInput,
  setContactPriorityInput,
  setContactModalOpen
}) {
  if (!contactModalOpen) return null;

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 120, background: 'rgba(4,4,7,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '15px' }}>
      <div className="glass-card" style={{ maxWidth: '400px', width: '100%', display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <h3 style={{ margin: 0, fontSize: '16px', color: 'var(--accent-cyan)' }}>
          <i className="fa-solid fa-address-card"></i> {editingContact ? 'Edit Contact' : 'Add Emergency Contact'}
        </h3>

        <form onSubmit={saveContact} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div className="form-group">
            <label>Contact Name</label>
            <input
              type="text"
              className="form-input"
              required
              placeholder="e.g. Family Guardian"
              value={contactNameInput}
              onChange={(e) => setContactNameInput(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Phone Number (WhatsApp routing)</label>
            <input
              type="tel"
              className="form-input"
              required
              placeholder="e.g. +91 9876543210"
              value={contactPhoneInput}
              onChange={(e) => setContactPhoneInput(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Category</label>
            <select
              className="form-input"
              style={{ background: '#0a0a14' }}
              value={contactCategoryInput}
              onChange={(e) => setContactCategoryInput(e.target.value)}
            >
              <option value="Police">Police</option>
              <option value="Ambulance">Ambulance</option>
              <option value="Doctor">Doctor</option>
              <option value="Family">Family Guardian</option>
            </select>
          </div>

          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginTop: '5px' }}>
            <input
              type="checkbox"
              checked={contactPriorityInput}
              onChange={(e) => setContactPriorityInput(e.target.checked)}
              style={{ width: '16px', height: '16px', cursor: 'pointer' }}
            />
            <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Priority Contact (VIP routing)</span>
          </div>

          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '10px' }}>
            <button type="button" className="btn-secondary" onClick={() => setContactModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn-primary">Save Contact</button>
          </div>
        </form>
      </div>
    </div>
  );
}
