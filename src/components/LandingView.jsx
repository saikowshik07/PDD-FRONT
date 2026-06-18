import React from 'react';

export default function LandingView({ onNavigate }) {
  return (
    <div id="landing-view" className="view-section active">
      {/* Sticky Navigation Header */}
      <header className="nav-header">
        <div className="logo-container">
          <div className="logo-icon"><i className="fa-solid fa-eye-low-vision" style={{ color: '#fff' }}></i></div>
          <span>SignVision <span className="gradient-text">AI</span></span>
        </div>
        <nav>
          <ul className="nav-links">
            <li><a href="#landing-view">Home</a></li>
            <li><a href="#features-anchor">Features</a></li>
            <li><a href="#compare-anchor">Comparison</a></li>
            <li><a href="#testimonials-anchor">Users</a></li>
          </ul>
        </nav>
        <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
          <button onClick={() => onNavigate('auth')} className="btn-secondary" style={{ padding: '8px 18px', fontSize: '13px' }}>Login</button>
          <button onClick={() => onNavigate('dashboard')} className="btn-primary" style={{ padding: '8px 18px', fontSize: '13px' }}>Start Dashboard</button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="grid-overlay"></div>
        <div className="floating-orbs">
          <div className="orb orb-1"></div>
          <div className="orb orb-2"></div>
        </div>
        
        <div className="hero-content">
          <div className="hero-tag">Breaking Communication Barriers with AI</div>
          <h1 className="hero-title">Two-Way Sign Language Translation Using <span className="gradient-text">Computer Vision</span></h1>
          <p className="hero-subtitle">An accessibility-first deep learning platform bridging the gap between Deaf/Mute individuals and the hearing world with sub-second neural inference.</p>
          <div className="hero-buttons">
            <button onClick={() => onNavigate('dashboard', 'dash-sign-to-text')} className="btn-primary">
              <i className="fa-solid fa-video"></i> Start Translation
            </button>
            <button onClick={() => onNavigate('mobile')} className="btn-secondary">
              <i className="fa-solid fa-mobile-screen-button"></i> Interactive Mobile Demo
            </button>
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="stats-section">
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-number gradient-text" id="stat-accuracy">98.7%</div>
            <div className="stat-label">Model Accuracy</div>
          </div>
          <div className="stat-card">
            <div className="stat-number gradient-text" id="stat-latency">&lt;100ms</div>
            <div className="stat-label">Real-time Latency</div>
          </div>
          <div className="stat-card">
            <div className="stat-number gradient-text" id="stat-languages">3+</div>
            <div className="stat-label">Supported Languages</div>
          </div>
          <div className="stat-card">
            <div className="stat-number gradient-text" id="stat-users">124k+</div>
            <div className="stat-label">Active Users</div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features-anchor" className="features-section">
        <h2 className="section-title">Core AI Capabilities</h2>
        <p className="section-subtitle">SignVision AI combines state-of-the-art spatial joint tracking and temporal models to deliver instant multi-directional accessibility.</p>
        <div className="features-grid">
          <div className="glass-card feature-card">
            <div className="feature-icon"><i className="fa-solid fa-camera"></i></div>
            <h3>Real-time Sign Detection</h3>
            <p>Captures body gesture movements via standard camera feeds. MediaPipe extracts 3D joints and processes sequences using LSTM neural networks.</p>
          </div>
          <div className="glass-card feature-card">
            <div className="feature-icon"><i className="fa-solid fa-volume-high"></i></div>
            <h3>AI Voice Output</h3>
            <p>Instantly reads translated sign labels out loud using low-latency Text-to-Speech synthesis, enabling oral conversation.</p>
          </div>
          <div className="glass-card feature-card">
            <div className="feature-icon"><i className="fa-solid fa-hand-holding-hand"></i></div>
            <h3>Text to Sign Avatar</h3>
            <p>Translates typed input sentences into real-time SVG skeletal hand animations, mapping grammar structures cleanly.</p>
          </div>
          <div className="glass-card feature-card">
            <div className="feature-icon"><i className="fa-solid fa-wifi-slash"></i></div>
            <h3>Offline Translation</h3>
            <p>Designed with lightweight neural networks. Can perform full core feature predictions on-device without internet access.</p>
          </div>
          <div className="glass-card feature-card">
            <div className="feature-icon"><i className="fa-solid fa-circle-exclamation"></i></div>
            <h3>Emergency Accessibility</h3>
            <p>One-click SOS distress commands. Instantly emits loud audio alerts and sends location coordinate packets to local authorities.</p>
          </div>
          <div className="glass-card feature-card">
            <div className="feature-icon"><i className="fa-solid fa-globe"></i></div>
            <h3>Multi-language Support</h3>
            <p>Recognizes and synthesizes gestures across English, Hindi, and Telugu structures to bridge localized dialects.</p>
          </div>
        </div>
      </section>

      {/* Comparison Table Section */}
      <section id="compare-anchor" className="comparison-section">
        <div style={{ textAlign: 'center' }}>
          <h2 className="section-title">Setting a New Standard</h2>
          <p className="section-subtitle">How SignVision AI compares to existing state-of-the-art translation and transcription technologies.</p>
        </div>
        <div className="table-container glass-card" style={{ padding: 0 }}>
          <table className="comparison-table">
            <thead>
              <tr>
                <th>Capabilities</th>
                <th className="gradient-text" style={{ fontWeight: 700 }}>SignVision AI</th>
                <th>Google Live Transcribe</th>
                <th>Hand Talk</th>
                <th>SignAll</th>
                <th>Ava</th>
              </tr>
            </thead>
            <tbody>
              <tr className="highlight-row">
                <td className="highlight-cell">Two-way Translation</td>
                <td><i className="fa-solid fa-check check-icon"></i> Yes</td>
                <td><i className="fa-solid fa-xmark cross-icon"></i> No (Audio only)</td>
                <td><i className="fa-solid fa-xmark cross-icon"></i> No (Text only)</td>
                <td><i className="fa-solid fa-check check-icon"></i> Yes</td>
                <td><i className="fa-solid fa-xmark cross-icon"></i> No (Audio only)</td>
              </tr>
              <tr>
                <td>Offline AI Inference</td>
                <td><i className="fa-solid fa-check check-icon"></i> Yes (On-device TFLite)</td>
                <td><i className="fa-solid fa-check check-icon"></i> Yes (Limited)</td>
                <td><i className="fa-solid fa-xmark cross-icon"></i> No</td>
                <td><i className="fa-solid fa-xmark cross-icon"></i> No</td>
                <td><i className="fa-solid fa-xmark cross-icon"></i> No</td>
              </tr>
              <tr>
                <td>Interactive Avatar Output</td>
                <td><i className="fa-solid fa-check check-icon"></i> Yes (Skeletal joints)</td>
                <td><i className="fa-solid fa-xmark cross-icon"></i> No</td>
                <td><i className="fa-solid fa-check check-icon"></i> Yes</td>
                <td><i className="fa-solid fa-xmark cross-icon"></i> No</td>
                <td><i className="fa-solid fa-xmark cross-icon"></i> No</td>
              </tr>
              <tr>
                <td>Standard Camera Input</td>
                <td><i className="fa-solid fa-check check-icon"></i> Yes (Hardware-free)</td>
                <td><i className="fa-solid fa-xmark cross-icon"></i> N/A</td>
                <td><i className="fa-solid fa-xmark cross-icon"></i> No</td>
                <td><i className="fa-solid fa-xmark cross-icon"></i> No (Needs depth cameras)</td>
                <td><i className="fa-solid fa-xmark cross-icon"></i> N/A</td>
              </tr>
              <tr>
                <td>Emergency SOS Features</td>
                <td><i className="fa-solid fa-check check-icon"></i> Yes</td>
                <td><i className="fa-solid fa-xmark cross-icon"></i> No</td>
                <td><i className="fa-solid fa-xmark cross-icon"></i> No</td>
                <td><i className="fa-solid fa-xmark cross-icon"></i> No</td>
                <td><i className="fa-solid fa-xmark cross-icon"></i> No</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials-anchor" className="testimonials-section">
        <h2 className="section-title">What Experts Say</h2>
        <p className="section-subtitle">Validated by professionals across disability rehabilitation and technology communities.</p>
        <div className="testimonials-grid">
          <div className="glass-card testimonial-card">
            <p className="testimonial-text">"SignVision AI completely outperforms depth-sensor rigs. The fact that standard laptop webcams run the model offline is a massive breakthrough for rural Deaf communities."</p>
            <div className="testimonial-author">
              <div className="author-avatar" style={{ background: 'var(--accent-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                <i className="fa-solid fa-user-doctor"></i>
              </div>
              <div className="author-info">
                <h4>Dr. Ananya Rao</h4>
                <p>Disability Rehabilitation Consultant</p>
              </div>
            </div>
          </div>
          <div className="glass-card testimonial-card">
            <p className="testimonial-text">"The game-based learning mode has helped our hearing students grasp ISL fingerspelling 40% faster. Gamifying sign language makes it accessible for everyone."</p>
            <div className="testimonial-author">
              <div className="author-avatar" style={{ background: 'var(--accent-purple)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                <i className="fa-solid fa-school"></i>
              </div>
              <div className="author-info">
                <h4>Suresh Sharma</h4>
                <p>Special Education Instructor</p>
              </div>
            </div>
          </div>
          <div className="glass-card testimonial-card">
            <p className="testimonial-text">"The Emergency SOS phrase integration gives me peace of mind when traveling alone. A single tap flashes the panel and reads the distress message aloud."</p>
            <div className="testimonial-author">
              <div className="author-avatar" style={{ background: 'var(--accent-cyan)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                <i className="fa-solid fa-hands-hearing"></i>
              </div>
              <div className="author-info">
                <h4>K. Ravi Teja</h4>
                <p>Deaf Community Outreach Lead</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Download App Section */}
      <section className="download-section">
        <h2 className="section-title">Download SignVision AI</h2>
        <p className="section-subtitle">Take the translation engine on the go. Available for mobile and desktop environments.</p>
        <div className="download-buttons">
          <button className="btn-primary" onClick={() => alert('Demo APK downloaded successfully.')}><i className="fa-brands fa-android"></i> Get Android SDK</button>
          <button className="btn-secondary" onClick={() => alert('Desktop wrapper compilation in progress.')}><i className="fa-solid fa-laptop"></i> Download Windows WebClient</button>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-top">
          <div>
            <div className="logo-container">
              <div className="logo-icon"><i className="fa-solid fa-eye-low-vision" style={{ color: '#fff' }}></i></div>
              <span>SignVision AI</span>
            </div>
            <p className="footer-desc">Leveraging state-of-the-art Computer Vision & Deep Learning sequence models to ensure universal accessibility.</p>
          </div>
          <div className="footer-links-grid">
            <div className="footer-col">
              <h4>Developers</h4>
              <ul>
                <li><a href="#landing-view">Project PRD</a></li>
                <li><a href="#landing-view">Model Training</a></li>
                <li><a href="#landing-view">API Reference</a></li>
              </ul>
            </div>
            <div className="footer-col">
              <h4>Legal</h4>
              <ul>
                <li><a href="#landing-view">GDPR Policy</a></li>
                <li><a href="#landing-view">HIPAA Compliance</a></li>
                <li><a href="#landing-view">Accessibility Audit</a></li>
              </ul>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2026 SignVision AI. Final Year Engineering PDD Project Demo.</p>
          <p>Designed for Universal Inclusion</p>
        </div>
      </footer>
    </div>
  );
}
