import React from 'react';

export default function SettingsView({
  getTranslation,
  currentLanguage,
  profileName,
  setProfileName,
  profileUserType,
  setProfileUserType,
  pipelineEngine,
  setPipelineEngine,
  recognitionThreshold,
  setRecognitionThreshold,
  largeText,
  setLargeText,
  highContrast,
  setHighContrast,
  voiceAssistant,
  setVoiceAssistant,
  handleSettingsSubmit
}) {
  return (
    <div id="dash-settings">
      <h1 className="workspace-title">{getTranslation(currentLanguage, 'settings_panel')}</h1>
      <p className="workspace-subtitle">Adjust recognition camera filters, select hardware engine configurations, and toggle accessibility UI features.</p>

      <form onSubmit={handleSettingsSubmit} style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '25px', marginTop: '20px' }}>

        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <h3 style={{ margin: '0 0 10px 0', fontSize: '16px', color: 'var(--accent-cyan)', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '6px' }}>
            User Profile Preferences
          </h3>

          <div className="form-group">
            <label>{getTranslation(currentLanguage, 'settings_profile_name')}</label>
            <input
              type="text"
              className="form-input"
              value={profileName}
              onChange={(e) => setProfileName(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>{getTranslation(currentLanguage, 'settings_user_category')}</label>
            <select
              className="form-input"
              style={{ background: '#0a0a14' }}
              value={profileUserType}
              onChange={(e) => setProfileUserType(e.target.value)}
            >
              <option value="public_user">{getTranslation(currentLanguage, 'user_public')}</option>
              <option value="deaf_user">{getTranslation(currentLanguage, 'user_deaf')}</option>
              <option value="student">{getTranslation(currentLanguage, 'user_student')}</option>
              <option value="teacher">{getTranslation(currentLanguage, 'user_teacher')}</option>
            </select>
          </div>

          <h3 style={{ margin: '15px 0 10px 0', fontSize: '16px', color: 'var(--accent-cyan)', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '6px' }}>
            {getTranslation(currentLanguage, 'settings_ai_pipeline')}
          </h3>

          <div className="form-group">
            <label style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>{getTranslation(currentLanguage, 'settings_cam_threshold')}</span>
              <strong>{recognitionThreshold}</strong>
            </label>
            <input
              type="range"
              min="0.4"
              max="0.95"
              step="0.05"
              style={{ width: '100%', cursor: 'pointer' }}
              value={recognitionThreshold}
              onChange={(e) => setRecognitionThreshold(parseFloat(e.target.value))}
            />
            <span style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>
              {getTranslation(currentLanguage, 'settings_threshold_desc')}
            </span>
          </div>

          <div className="form-group">
            <label>{getTranslation(currentLanguage, 'settings_hw_engine')}</label>
            <select
              className="form-input"
              style={{ background: '#0a0a14' }}
              value={pipelineEngine}
              onChange={(e) => setPipelineEngine(e.target.value)}
            >
              <option value="webgl">{getTranslation(currentLanguage, 'settings_webgl')}</option>
              <option value="wasm">{getTranslation(currentLanguage, 'settings_wasm')}</option>
              <option value="cpu">{getTranslation(currentLanguage, 'settings_cpu')}</option>
            </select>
            <span style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>
              {getTranslation(currentLanguage, 'settings_gpu_desc')}
            </span>
          </div>

          <button className="btn-primary" type="submit" style={{ alignSelf: 'flex-start', marginTop: '10px' }}>
            <i className="fa-solid fa-floppy-disk"></i> {getTranslation(currentLanguage, 'apply_changes')}
          </button>
        </div>

        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <h3 style={{ margin: '0 0 10px 0', fontSize: '16px', color: 'var(--accent-cyan)', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '6px' }}>
            {getTranslation(currentLanguage, 'accessibility_settings')}
          </h3>

          <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
            <input
              type="checkbox"
              id="check-large-text"
              checked={largeText}
              onChange={(e) => setLargeText(e.target.checked)}
              style={{ width: '16px', height: '16px', cursor: 'pointer', marginTop: '4px' }}
            />
            <div>
              <strong style={{ fontSize: '13px', color: '#fff', display: 'block' }}>
                {getTranslation(currentLanguage, 'lbl_acc_large_text')}
              </strong>
              <span style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>
                {getTranslation(currentLanguage, 'lbl_acc_large_text_desc')}
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
            <input
              type="checkbox"
              id="check-high-contrast"
              checked={highContrast}
              onChange={(e) => setHighContrast(e.target.checked)}
              style={{ width: '16px', height: '16px', cursor: 'pointer', marginTop: '4px' }}
            />
            <div>
              <strong style={{ fontSize: '13px', color: '#fff', display: 'block' }}>
                {getTranslation(currentLanguage, 'lbl_acc_high_contrast')}
              </strong>
              <span style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>
                {getTranslation(currentLanguage, 'lbl_acc_high_contrast_desc')}
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
            <input
              type="checkbox"
              id="check-voice-assistant"
              checked={voiceAssistant}
              onChange={(e) => setVoiceAssistant(e.target.checked)}
              style={{ width: '16px', height: '16px', cursor: 'pointer', marginTop: '4px' }}
            />
            <div>
              <strong style={{ fontSize: '13px', color: '#fff', display: 'block' }}>
                {getTranslation(currentLanguage, 'lbl_acc_voice_assistant')}
              </strong>
              <span style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>
                {getTranslation(currentLanguage, 'lbl_acc_voice_assistant_desc')}
              </span>
            </div>
          </div>
        </div>

      </form>
    </div>
  );
}
