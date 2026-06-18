import React, { useState, useEffect } from 'react';
import Avatar2D from '../../Avatar2D';

const GLOSSARY = [
  'hello','hi','thank_you','help','emergency','food','water','yes','no',
  'stop','ok','fine','please','sorry','good_morning','good_night','love','friend','doctor','hospital'
];

const SPEED_OPTIONS = [0.5, 1.0, 1.5];

export default function TextToSignView({
  getTranslation,
  currentLanguage,
  ttsInput,
  setTtsInput,
  ttsDecomposition,
  ttsSpeedRate,
  setTtsSpeedRate,
  ttsActiveGesture,
  setTtsActiveGesture,
  ttsAvatarGender,
  setTtsAvatarGender,
  ttsCaption,
  isPlaying,
  isPaused,
  ttsQueue,
  handleTextTranslationSubmit,
  handlePauseToggle,
  handleStopAnimation,
  handleReplayAnimation,
  animatePredefinedSign
}) {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 820);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth <= 820);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const currentLabel = ttsCaption || (ttsActiveGesture !== 'default'
    ? ttsActiveGesture.replace(/_/g, ' ').toUpperCase()
    : 'IDLE');

  const isActive = ttsActiveGesture !== 'default';

  // ── Mobile ───────────────────────────────────────────────────────────────
  if (isMobile) {
    return (
      <div id="dash-text-to-sign" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <h1 className="workspace-title" style={{ fontSize: '20px', marginBottom: '0' }}>
          {getTranslation(currentLanguage, 'text_to_sign')}
        </h1>

        {/* Input card */}
        <div className="glass-card" style={{ padding: '16px' }}>
          <div style={{ display: 'flex', gap: '8px' }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <input
                type="text"
                className="form-input"
                style={{ paddingLeft: '36px', fontSize: '15px' }}
                placeholder="Type a sign word..."
                value={ttsInput}
                onChange={(e) => setTtsInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleTextTranslationSubmit()}
              />
              <i className="fa-solid fa-pen-nib" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontSize: '13px' }} />
            </div>
            <button
              className="btn-primary"
              style={{ padding: '0 18px', display: 'flex', alignItems: 'center', gap: '6px' }}
              onClick={handleTextTranslationSubmit}
              disabled={isPlaying && !isPaused}
            >
              <i className="fa-solid fa-play" /> Sign
            </button>
          </div>

          {ttsQueue.length > 0 && (
            <div style={{ display: 'flex', gap: '7px', marginTop: '10px' }}>
              <button className="btn-secondary" style={{ flex: 1, padding: '8px', fontSize: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }} onClick={handlePauseToggle}>
                <i className={`fa-solid ${isPaused ? 'fa-play' : 'fa-pause'}`} />
                {isPaused ? 'Resume' : 'Pause'}
              </button>
              <button className="btn-secondary" style={{ flex: 1, padding: '8px', color: 'var(--accent-red)', borderColor: 'rgba(255,42,95,0.2)', fontSize: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }} onClick={handleStopAnimation}>
                <i className="fa-solid fa-stop" /> Stop
              </button>
              <button className="btn-secondary" style={{ flex: 1, padding: '8px', color: 'var(--accent-cyan)', fontSize: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }} onClick={handleReplayAnimation}>
                <i className="fa-solid fa-rotate-right" /> Replay
              </button>
            </div>
          )}
        </div>

        {/* Avatar viewport */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', padding: 0, border: '1.5px solid rgba(0,240,255,0.12)', background: 'rgba(4,4,10,0.95)', height: '360px' }}>
          <div style={{ background: 'rgba(6,6,14,0.98)', borderBottom: '1px solid rgba(0,240,255,0.1)', padding: '10px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--accent-green)', boxShadow: '0 0 6px var(--accent-green)', display: 'inline-block' }} />
              <span style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--accent-cyan)', letterSpacing: '1px' }}>AI PRESENTER</span>
            </div>
            <div style={{ display: 'flex', gap: '6px' }}>
              <button className={`btn-secondary ${ttsAvatarGender === 'male' ? 'active' : ''}`} style={{ padding: '3px 8px', fontSize: '10px', background: ttsAvatarGender === 'male' ? 'rgba(0,240,255,0.1)' : 'rgba(6,6,12,0.8)', borderColor: ttsAvatarGender === 'male' ? 'var(--accent-cyan)' : 'rgba(255,255,255,0.08)' }} onClick={() => setTtsAvatarGender('male')}>M</button>
              <button className={`btn-secondary ${ttsAvatarGender === 'female' ? 'active' : ''}`} style={{ padding: '3px 8px', fontSize: '10px', background: ttsAvatarGender === 'female' ? 'rgba(112,0,255,0.12)' : 'rgba(6,6,12,0.8)', borderColor: ttsAvatarGender === 'female' ? 'var(--accent-purple)' : 'rgba(255,255,255,0.08)' }} onClick={() => setTtsAvatarGender('female')}>F</button>
            </div>
          </div>
          <div style={{ flex: 1, position: 'relative', background: 'radial-gradient(ellipse at 50% 30%, #0d0d2a 0%, #050508 100%)' }}>
            <Avatar2D gesture={ttsActiveGesture} speedRate={ttsSpeedRate} />
            <div style={{ position: 'absolute', top: '10px', left: '50%', transform: 'translateX(-50%)', background: 'rgba(4,4,14,0.88)', border: `1px solid ${isActive ? 'var(--accent-cyan)' : 'rgba(255,255,255,0.06)'}`, color: isActive ? 'var(--accent-cyan)' : 'var(--text-muted)', padding: '4px 14px', borderRadius: '18px', fontSize: '11px', fontWeight: 'bold', letterSpacing: '1.2px', fontFamily: 'monospace', pointerEvents: 'none', whiteSpace: 'nowrap' }}>
              {currentLabel}
            </div>
            <button className="btn-secondary" style={{ position: 'absolute', bottom: '10px', left: '10px', padding: '4px 9px', fontSize: '10px', background: 'rgba(4,4,10,0.8)', border: '1px solid rgba(255,255,255,0.08)' }} onClick={() => animatePredefinedSign('default')}>
              <i className="fa-solid fa-arrow-rotate-left" /> Rest
            </button>
          </div>
          {ttsDecomposition && (
            <div style={{ background: 'rgba(0,0,0,0.5)', borderTop: '1px solid rgba(0,240,255,0.1)', padding: '7px 12px', fontSize: '11px', fontFamily: 'monospace', color: 'var(--accent-cyan)', display: 'flex', alignItems: 'center', gap: '7px', flexShrink: 0 }}>
              <i className="fa-solid fa-code-fork" />
              <span style={{ wordBreak: 'break-word' }}>{ttsDecomposition}</span>
            </div>
          )}
        </div>

        {/* Signs glossary + speed */}
        <div className="glass-card" style={{ padding: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
              <i className="fa-solid fa-book-open" style={{ color: 'var(--accent-purple)', fontSize: '14px' }} />
              <span style={{ fontSize: '13px', fontWeight: 'bold' }}>Signs</span>
            </div>
            <div style={{ display: 'flex', gap: '5px' }}>
              {SPEED_OPTIONS.map(s => (
                <button key={s} className="btn-secondary" style={{ padding: '3px 7px', fontSize: '11px', background: ttsSpeedRate === s ? 'rgba(0,240,255,0.08)' : 'transparent', borderColor: ttsSpeedRate === s ? 'var(--accent-cyan)' : 'var(--border-color)', color: ttsSpeedRate === s ? 'var(--accent-cyan)' : 'var(--text-secondary)' }} onClick={() => setTtsSpeedRate(s)}>{s}x</button>
              ))}
            </div>
          </div>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {GLOSSARY.map(g => (
              <button key={g} className={`btn-secondary ${ttsActiveGesture === g ? 'active' : ''}`}
                style={{ padding: '6px 12px', fontSize: '12px', borderRadius: '8px', background: ttsActiveGesture === g ? 'rgba(112,0,255,0.12)' : 'rgba(255,255,255,0.02)', borderColor: ttsActiveGesture === g ? 'var(--accent-purple)' : 'var(--border-color)', color: ttsActiveGesture === g ? '#fff' : 'var(--text-secondary)', fontWeight: ttsActiveGesture === g ? 'bold' : 'normal' }}
                onClick={() => animatePredefinedSign(g)}
              >
                {getTranslation(currentLanguage, g)}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ── Desktop ──────────────────────────────────────────────────────────────
  return (
    <div id="dash-text-to-sign">
      <h1 className="workspace-title">{getTranslation(currentLanguage, 'text_to_sign')}</h1>
      <p className="workspace-subtitle" style={{ marginBottom: '22px' }}>
        Translate text into real-time 3D sign language — powered by an AI human presenter.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.55fr', gap: '24px', alignItems: 'stretch', minHeight: '620px' }}>

        {/* Left: controls */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

          {/* Text input */}
          <div className="glass-card" style={{ padding: '22px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
              <i className="fa-solid fa-keyboard" style={{ color: 'var(--accent-cyan)', fontSize: '20px' }} />
              <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 'bold' }}>{getTranslation(currentLanguage, 'text_input_translator')}</h3>
            </div>

            <p style={{ margin: '0 0 14px 0', fontSize: '12px', color: 'var(--text-secondary)' }}>
              {getTranslation(currentLanguage, 'type_english')}
            </p>

            <div style={{ display: 'flex', gap: '9px' }}>
              <div style={{ position: 'relative', flex: 1 }}>
                <input
                  type="text"
                  className="form-input"
                  style={{ paddingLeft: '38px', fontSize: '14px' }}
                  placeholder="hello, thank you, water, emergency..."
                  value={ttsInput}
                  onChange={(e) => setTtsInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleTextTranslationSubmit()}
                />
                <i className="fa-solid fa-pen-nib" style={{ position: 'absolute', left: '13px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontSize: '13px' }} />
              </div>
              <button className="btn-primary" style={{ padding: '0 20px', display: 'flex', alignItems: 'center', gap: '7px', whiteSpace: 'nowrap' }} onClick={handleTextTranslationSubmit} disabled={isPlaying && !isPaused}>
                <i className="fa-solid fa-play" />
                <span>{getTranslation(currentLanguage, 'translate_to_sign')}</span>
              </button>
            </div>

            {ttsQueue.length > 0 && (
              <div style={{ display: 'flex', gap: '8px', marginTop: '11px', flexWrap: 'wrap' }}>
                <button className="btn-secondary" style={{ padding: '7px 14px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '5px' }} onClick={handlePauseToggle}>
                  <i className={`fa-solid ${isPaused ? 'fa-play' : 'fa-pause'}`} />
                  {isPaused ? 'Resume' : 'Pause'}
                </button>
                <button className="btn-secondary" style={{ padding: '7px 14px', color: 'var(--accent-red)', borderColor: 'rgba(255,42,95,0.2)', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '5px' }} onClick={handleStopAnimation}>
                  <i className="fa-solid fa-stop" /> Stop
                </button>
                <button className="btn-secondary" style={{ padding: '7px 14px', color: 'var(--accent-cyan)', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '5px' }} onClick={handleReplayAnimation}>
                  <i className="fa-solid fa-rotate-right" /> Replay
                </button>
              </div>
            )}

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '14px' }}>
              <span style={{ fontSize: '11px', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>Playback Speed:</span>
              <div style={{ display: 'flex', gap: '6px' }}>
                {SPEED_OPTIONS.map(s => (
                  <button key={s} className="btn-secondary" style={{ padding: '4px 11px', fontSize: '11px', borderRadius: '8px', background: ttsSpeedRate === s ? 'rgba(0,240,255,0.08)' : 'rgba(255,255,255,0.02)', borderColor: ttsSpeedRate === s ? 'var(--accent-cyan)' : 'var(--border-color)', color: ttsSpeedRate === s ? 'var(--accent-cyan)' : 'var(--text-secondary)' }} onClick={() => setTtsSpeedRate(s)}>{s}x</button>
                ))}
              </div>
            </div>

            {ttsDecomposition && (
              <div style={{ marginTop: '14px', background: 'rgba(0,0,0,0.25)', padding: '10px 14px', borderRadius: '8px', border: '1px solid rgba(0,240,255,0.15)', fontSize: '12px', fontFamily: 'monospace', color: 'var(--accent-cyan)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <i className="fa-solid fa-code-fork" />
                <span>{ttsDecomposition}</span>
              </div>
            )}
          </div>

          {/* Glossary */}
          <div className="glass-card" style={{ padding: '22px', flex: 1, display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
                <i className="fa-solid fa-book-open" style={{ color: 'var(--accent-purple)', fontSize: '20px' }} />
                <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 'bold' }}>{getTranslation(currentLanguage, 'preloaded_glossary')}</h3>
              </div>
              <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{GLOSSARY.length} signs</span>
            </div>
            <p style={{ margin: '0 0 12px 0', fontSize: '12px', color: 'var(--text-secondary)' }}>
              {getTranslation(currentLanguage, 'select_expressions')}
            </p>
            <div style={{ display: 'flex', gap: '7px', flexWrap: 'wrap', overflowY: 'auto', flex: 1 }}>
              {GLOSSARY.map(g => (
                <button key={g} className={`btn-secondary ${ttsActiveGesture === g ? 'active' : ''}`}
                  style={{ padding: '7px 14px', fontSize: '12px', borderRadius: '10px', background: ttsActiveGesture === g ? 'rgba(112,0,255,0.12)' : 'rgba(255,255,255,0.02)', borderColor: ttsActiveGesture === g ? 'var(--accent-purple)' : 'var(--border-color)', color: ttsActiveGesture === g ? '#fff' : 'var(--text-secondary)', fontWeight: ttsActiveGesture === g ? 'bold' : 'normal', transition: 'all 0.2s' }}
                  onClick={() => animatePredefinedSign(g)}
                >
                  {getTranslation(currentLanguage, g)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right: avatar viewport */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', padding: 0, border: '1.5px solid rgba(0,240,255,0.12)', background: 'rgba(4,4,10,0.95)', position: 'relative' }}>

          {/* Header */}
          <div style={{ background: 'rgba(6,6,14,0.98)', borderBottom: '1px solid rgba(0,240,255,0.1)', padding: '14px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: 'var(--accent-green)', boxShadow: '0 0 8px var(--accent-green)', display: 'inline-block' }} />
              <span style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--accent-cyan)', letterSpacing: '1px' }}>AI HUMAN PRESENTER</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                {ttsAvatarGender.toUpperCase()} · ACTIVE RIG
              </span>
              <button className={`btn-secondary ${ttsAvatarGender === 'male' ? 'active' : ''}`} style={{ padding: '5px 11px', fontSize: '11px', background: ttsAvatarGender === 'male' ? 'rgba(0,240,255,0.1)' : 'rgba(6,6,12,0.8)', borderColor: ttsAvatarGender === 'male' ? 'var(--accent-cyan)' : 'rgba(255,255,255,0.08)' }} onClick={() => setTtsAvatarGender('male')}>
                <i className="fa-solid fa-user-tie" /> Male
              </button>
              <button className={`btn-secondary ${ttsAvatarGender === 'female' ? 'active' : ''}`} style={{ padding: '5px 11px', fontSize: '11px', background: ttsAvatarGender === 'female' ? 'rgba(112,0,255,0.12)' : 'rgba(6,6,12,0.8)', borderColor: ttsAvatarGender === 'female' ? 'var(--accent-purple)' : 'rgba(255,255,255,0.08)' }} onClick={() => setTtsAvatarGender('female')}>
                <i className="fa-solid fa-user-nurse" /> Female
              </button>
            </div>
          </div>

          {/* 3D canvas area */}
          <div style={{ flex: 1, position: 'relative', background: 'radial-gradient(ellipse at 50% 28%, #0d0d2a 0%, #050508 100%)', overflow: 'hidden', minHeight: '500px' }}>
            <Avatar2D gesture={ttsActiveGesture} speedRate={ttsSpeedRate} />

            {/* Sign label overlay */}
            <div style={{ position: 'absolute', top: '14px', left: '50%', transform: 'translateX(-50%)', background: 'rgba(4,4,14,0.88)', border: `1px solid ${isActive ? 'var(--accent-cyan)' : 'rgba(255,255,255,0.06)'}`, color: isActive ? 'var(--accent-cyan)' : 'var(--text-muted)', padding: '6px 18px', borderRadius: '22px', fontSize: '12px', fontWeight: 'bold', letterSpacing: '1.5px', fontFamily: 'monospace', pointerEvents: 'none', boxShadow: isActive ? '0 0 18px rgba(0,240,255,0.22)' : 'none', whiteSpace: 'nowrap' }}>
              {currentLabel}
            </div>

            {/* Rest pose button */}
            <button className="btn-secondary" style={{ position: 'absolute', bottom: '14px', left: '14px', padding: '6px 11px', fontSize: '11px', background: 'rgba(4,4,10,0.82)', border: '1px solid rgba(255,255,255,0.08)' }} onClick={() => animatePredefinedSign('default')} title="Return to rest pose">
              <i className="fa-solid fa-arrow-rotate-left" /> Rest Pose
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
