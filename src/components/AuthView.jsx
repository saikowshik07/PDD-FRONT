import React, { useState } from 'react';
import { makeAPIRequest } from '../App';

export default function AuthView({ currentLanguage, onChangeLanguage, getTranslation, onLoginSuccess, onNavigate }) {
  const [panel, setPanel] = useState('login');

  // Login
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  // Register
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirm, setRegConfirm] = useState('');
  const [regUserType, setRegUserType] = useState('public_user');
  const [regLoading, setRegLoading] = useState(false);

  const [errorMsg, setErrorMsg] = useState('');
  const [showLoginPw, setShowLoginPw] = useState(false);
  const [showRegPw, setShowRegPw] = useState(false);
  const [showRegConfirm, setShowRegConfirm] = useState(false);

  function setError(msg) {
    setErrorMsg(msg);
    setTimeout(() => setErrorMsg(''), 5000);
  }

  function validatePassword(pwd) {
    if (pwd.length < 8) return 'Password must be at least 8 characters';
    if (!/[A-Z]/.test(pwd)) return 'Password must contain at least one uppercase letter';
    if (!/[a-z]/.test(pwd)) return 'Password must contain at least one lowercase letter';
    if (!/[0-9]/.test(pwd)) return 'Password must contain at least one number';
    return null;
  }

  async function handleLogin(e) {
    e.preventDefault();
    if (!loginEmail || !loginPassword) { setError('Email and password are required'); return; }
    setLoginLoading(true);
    setErrorMsg('');
    try {
      const data = await makeAPIRequest('/api/auth/login', 'POST', { email: loginEmail, password: loginPassword });
      localStorage.setItem('authToken', data.token);
      onLoginSuccess(data.user, `Welcome back, ${data.user.name}!`);
    } catch (e) {
      setError(e.message || 'Invalid email or password');
    } finally {
      setLoginLoading(false);
    }
  }

  async function handleRegister(e) {
    e.preventDefault();
    if (!regName || !regEmail || !regPassword || !regConfirm) { setError('All fields are required'); return; }
    if (!regEmail.includes('@')) { setError('Enter a valid email address'); return; }
    const pwErr = validatePassword(regPassword);
    if (pwErr) { setError(pwErr); return; }
    if (regPassword !== regConfirm) { setError('Passwords do not match'); return; }
    setRegLoading(true);
    setErrorMsg('');
    try {
      const data = await makeAPIRequest('/api/auth/register', 'POST', {
        name: regName,
        email: regEmail,
        password: regPassword,
        user_type: regUserType
      });
      localStorage.setItem('authToken', data.token);
      onLoginSuccess(data.user, `Welcome to SignVision AI, ${data.user.name}!`);
    } catch (e) {
      setError(e.message || 'Registration failed');
    } finally {
      setRegLoading(false);
    }
  }

  const inputStyle = {
    width: '100%',
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '8px',
    padding: '12px 14px',
    color: '#fff',
    fontSize: '14px',
    outline: 'none',
    boxSizing: 'border-box',
    transition: 'border-color 0.2s'
  };

  const pwWrapStyle = {
    position: 'relative',
    display: 'flex',
    alignItems: 'center'
  };

  const eyeBtn = {
    position: 'absolute',
    right: '12px',
    background: 'none',
    border: 'none',
    color: 'var(--text-muted)',
    cursor: 'pointer',
    fontSize: '14px',
    padding: 0
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--bg-deep)',
      padding: '20px',
      fontFamily: 'Inter, system-ui, sans-serif'
    }}>
      {/* Background glow */}
      <div style={{
        position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0,
        background: 'radial-gradient(ellipse at 20% 50%, rgba(99,102,241,0.12) 0%, transparent 60%), radial-gradient(ellipse at 80% 30%, rgba(0,212,255,0.08) 0%, transparent 50%)'
      }} />

      <div style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: '420px' }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{
            width: '56px', height: '56px', borderRadius: '14px',
            background: 'linear-gradient(135deg, #6366f1, #06b6d4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 14px', boxShadow: '0 0 30px rgba(99,102,241,0.4)'
          }}>
            <i className="fa-solid fa-hands-asl-interpreting" style={{ fontSize: '26px', color: '#fff' }}></i>
          </div>
          <h1 style={{ margin: 0, fontSize: '22px', fontWeight: 700, color: '#fff', letterSpacing: '-0.3px' }}>
            SignVision AI
          </h1>
          <p style={{ margin: '4px 0 0', fontSize: '12px', color: 'var(--text-muted)' }}>
            Accessibility Sign Language Platform
          </p>
        </div>

        {/* Card */}
        <div className="glass-card" style={{ padding: '32px' }}>

          {/* Tab switcher */}
          <div style={{
            display: 'flex', gap: '4px', marginBottom: '28px',
            background: 'rgba(255,255,255,0.04)', borderRadius: '10px', padding: '4px'
          }}>
            {['login', 'register'].map(p => (
              <button key={p} onClick={() => { setPanel(p); setErrorMsg(''); }} style={{
                flex: 1, padding: '9px', border: 'none', borderRadius: '7px', cursor: 'pointer',
                fontSize: '13px', fontWeight: 600, transition: 'all 0.2s',
                background: panel === p ? 'linear-gradient(135deg, #6366f1, #06b6d4)' : 'transparent',
                color: panel === p ? '#fff' : 'var(--text-muted)'
              }}>
                {p === 'login' ? 'Sign In' : 'Register'}
              </button>
            ))}
          </div>

          {/* Error */}
          {errorMsg && (
            <div style={{
              background: 'rgba(255,42,95,0.12)', border: '1px solid rgba(255,42,95,0.3)',
              borderRadius: '8px', padding: '10px 14px', marginBottom: '20px',
              fontSize: '13px', color: '#ff6b8a', display: 'flex', alignItems: 'center', gap: '8px'
            }}>
              <i className="fa-solid fa-circle-exclamation"></i> {errorMsg}
            </div>
          )}

          {/* ---- LOGIN ---- */}
          {panel === 'login' && (
            <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px', fontWeight: 500 }}>
                  Email Address
                </label>
                <input
                  type="email"
                  value={loginEmail}
                  onChange={e => setLoginEmail(e.target.value)}
                  placeholder="you@example.com"
                  autoComplete="email"
                  style={inputStyle}
                  onFocus={e => e.target.style.borderColor = 'rgba(99,102,241,0.6)'}
                  onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                />
              </div>

              <div>
                <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px', fontWeight: 500 }}>
                  Password
                </label>
                <div style={pwWrapStyle}>
                  <input
                    type={showLoginPw ? 'text' : 'password'}
                    value={loginPassword}
                    onChange={e => setLoginPassword(e.target.value)}
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    style={{ ...inputStyle, paddingRight: '40px' }}
                    onFocus={e => e.target.style.borderColor = 'rgba(99,102,241,0.6)'}
                    onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                  />
                  <button type="button" style={eyeBtn} onClick={() => setShowLoginPw(v => !v)} tabIndex={-1}>
                    <i className={`fa-solid ${showLoginPw ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                  </button>
                </div>
              </div>

              <button type="submit" disabled={loginLoading} style={{
                width: '100%', padding: '13px', marginTop: '4px',
                background: loginLoading ? 'rgba(99,102,241,0.4)' : 'linear-gradient(135deg, #6366f1, #06b6d4)',
                border: 'none', borderRadius: '9px', color: '#fff', fontSize: '14px', fontWeight: 600,
                cursor: loginLoading ? 'not-allowed' : 'pointer', transition: 'opacity 0.2s',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
              }}>
                {loginLoading
                  ? <><i className="fa-solid fa-circle-notch fa-spin"></i> Signing in...</>
                  : <><i className="fa-solid fa-right-to-bracket"></i> Sign In</>
                }
              </button>

              <p style={{ textAlign: 'center', fontSize: '12px', color: 'var(--text-muted)', margin: 0 }}>
                Don't have an account?{' '}
                <button type="button" onClick={() => { setPanel('register'); setErrorMsg(''); }}
                  style={{ background: 'none', border: 'none', color: 'var(--accent-cyan)', cursor: 'pointer', fontSize: '12px', padding: 0, fontWeight: 600 }}>
                  Create one
                </button>
              </p>
            </form>
          )}

          {/* ---- REGISTER ---- */}
          {panel === 'register' && (
            <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px', fontWeight: 500 }}>
                  Full Name
                </label>
                <input
                  type="text"
                  value={regName}
                  onChange={e => setRegName(e.target.value)}
                  placeholder="Your full name"
                  autoComplete="name"
                  style={inputStyle}
                  onFocus={e => e.target.style.borderColor = 'rgba(99,102,241,0.6)'}
                  onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                />
              </div>

              <div>
                <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px', fontWeight: 500 }}>
                  Email Address
                </label>
                <input
                  type="email"
                  value={regEmail}
                  onChange={e => setRegEmail(e.target.value)}
                  placeholder="you@example.com"
                  autoComplete="email"
                  style={inputStyle}
                  onFocus={e => e.target.style.borderColor = 'rgba(99,102,241,0.6)'}
                  onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                />
              </div>

              <div>
                <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px', fontWeight: 500 }}>
                  Account Type
                </label>
                <select
                  value={regUserType}
                  onChange={e => setRegUserType(e.target.value)}
                  style={{ ...inputStyle, cursor: 'pointer' }}
                >
                  <option value="public_user">Public User</option>
                  <option value="deaf_user">Deaf / Hard of Hearing</option>
                  <option value="mute_user">Mute / Non-verbal</option>
                  <option value="caregiver">Caregiver / Support Person</option>
                  <option value="educator">Educator / Therapist</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px', fontWeight: 500 }}>
                  Password
                </label>
                <div style={pwWrapStyle}>
                  <input
                    type={showRegPw ? 'text' : 'password'}
                    value={regPassword}
                    onChange={e => setRegPassword(e.target.value)}
                    placeholder="Min 8 chars, uppercase, number"
                    autoComplete="new-password"
                    style={{ ...inputStyle, paddingRight: '40px' }}
                    onFocus={e => e.target.style.borderColor = 'rgba(99,102,241,0.6)'}
                    onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                  />
                  <button type="button" style={eyeBtn} onClick={() => setShowRegPw(v => !v)} tabIndex={-1}>
                    <i className={`fa-solid ${showRegPw ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                  </button>
                </div>
                <div style={{ display: 'flex', gap: '8px', marginTop: '6px', flexWrap: 'wrap' }}>
                  {[
                    { label: '8+ chars', ok: regPassword.length >= 8 },
                    { label: 'Uppercase', ok: /[A-Z]/.test(regPassword) },
                    { label: 'Lowercase', ok: /[a-z]/.test(regPassword) },
                    { label: 'Number', ok: /[0-9]/.test(regPassword) }
                  ].map(r => (
                    <span key={r.label} style={{
                      fontSize: '10px', padding: '2px 7px', borderRadius: '4px',
                      background: r.ok ? 'rgba(57,255,20,0.1)' : 'rgba(255,255,255,0.04)',
                      color: r.ok ? 'var(--accent-green)' : 'var(--text-muted)',
                      border: `1px solid ${r.ok ? 'rgba(57,255,20,0.3)' : 'rgba(255,255,255,0.08)'}`
                    }}>
                      {r.ok ? '✓ ' : ''}{r.label}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px', fontWeight: 500 }}>
                  Confirm Password
                </label>
                <div style={pwWrapStyle}>
                  <input
                    type={showRegConfirm ? 'text' : 'password'}
                    value={regConfirm}
                    onChange={e => setRegConfirm(e.target.value)}
                    placeholder="Re-enter your password"
                    autoComplete="new-password"
                    style={{
                      ...inputStyle, paddingRight: '40px',
                      borderColor: regConfirm && regConfirm !== regPassword ? 'rgba(255,42,95,0.5)' : (regConfirm && regConfirm === regPassword ? 'rgba(57,255,20,0.4)' : 'rgba(255,255,255,0.1)')
                    }}
                    onFocus={e => e.target.style.borderColor = 'rgba(99,102,241,0.6)'}
                    onBlur={e => {
                      if (regConfirm && regConfirm !== regPassword) e.target.style.borderColor = 'rgba(255,42,95,0.5)';
                      else if (regConfirm && regConfirm === regPassword) e.target.style.borderColor = 'rgba(57,255,20,0.4)';
                      else e.target.style.borderColor = 'rgba(255,255,255,0.1)';
                    }}
                  />
                  <button type="button" style={eyeBtn} onClick={() => setShowRegConfirm(v => !v)} tabIndex={-1}>
                    <i className={`fa-solid ${showRegConfirm ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                  </button>
                </div>
              </div>

              <button type="submit" disabled={regLoading} style={{
                width: '100%', padding: '13px', marginTop: '6px',
                background: regLoading ? 'rgba(99,102,241,0.4)' : 'linear-gradient(135deg, #6366f1, #06b6d4)',
                border: 'none', borderRadius: '9px', color: '#fff', fontSize: '14px', fontWeight: 600,
                cursor: regLoading ? 'not-allowed' : 'pointer', transition: 'opacity 0.2s',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
              }}>
                {regLoading
                  ? <><i className="fa-solid fa-circle-notch fa-spin"></i> Creating account...</>
                  : <><i className="fa-solid fa-user-plus"></i> Create Account</>
                }
              </button>

              <p style={{ textAlign: 'center', fontSize: '12px', color: 'var(--text-muted)', margin: 0 }}>
                Already have an account?{' '}
                <button type="button" onClick={() => { setPanel('login'); setErrorMsg(''); }}
                  style={{ background: 'none', border: 'none', color: 'var(--accent-cyan)', cursor: 'pointer', fontSize: '12px', padding: 0, fontWeight: 600 }}>
                  Sign in
                </button>
              </p>
            </form>
          )}
        </div>

        {/* Footer */}
        <p style={{ textAlign: 'center', fontSize: '11px', color: 'var(--text-muted)', marginTop: '20px' }}>
          <i className="fa-solid fa-shield-halved" style={{ marginRight: '5px' }}></i>
          Secured with AES-256 encryption · Your data is private
        </p>
      </div>
    </div>
  );
}
