import React from 'react';

export default function LearningView({
  getTranslation,
  currentLanguage,
  quizQuestions,
  quizIndex,
  quizFeedback,
  quizFeedbackColor,
  quizAnsweredBtn,
  badgesUnlocked,
  handleQuizChoice
}) {
  return (
    <div id="dash-learning">
      <h1 className="workspace-title">{getTranslation(currentLanguage, 'ai_learning')}</h1>
      <p className="workspace-subtitle">Unlock achievements, claim badges, and solve geometric sign quizzes to improve your daily translation rank.</p>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '25px', marginTop: '20px' }}>

        <div className="glass-card">
          <h3 style={{ margin: '0 0 5px 0', fontSize: '16px', color: 'var(--accent-cyan)' }}>Gamified Sign Language Quiz</h3>
          <p style={{ margin: '0 0 15px 0', fontSize: '11px', color: 'var(--text-secondary)' }}>Practice dictionary classifications to double your XP streaks.</p>

          <div style={{ background: 'rgba(0,0,0,0.15)', padding: '20px', borderRadius: '8px', border: '1px solid var(--border-color)', marginBottom: '15px' }}>
            <div id="quiz-question-tag" style={{ fontSize: '13px', fontWeight: 'bold', marginBottom: '12px' }}>
              {quizQuestions[quizIndex].q}
            </div>

            <div id="quiz-sign-visual" style={{ fontSize: '48px', color: 'var(--accent-cyan)', textAlign: 'center', margin: '20px 0' }}>
              <i className={`fa-solid ${quizQuestions[quizIndex].icon}`}></i>
            </div>

            <div id="quiz-choices-box" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {quizQuestions[quizIndex].options.map(opt => (
                <button
                  key={opt}
                  className={`quiz-choice-btn ${quizAnsweredBtn ? (opt === quizQuestions[quizIndex].answer ? 'correct' : (quizAnsweredBtn === opt ? 'wrong' : '')) : ''}`}
                  onClick={() => handleQuizChoice(opt, quizQuestions[quizIndex].answer)}
                  disabled={quizAnsweredBtn !== null}
                >
                  {getTranslation(currentLanguage, opt)}
                </button>
              ))}
            </div>

            {quizFeedback && (
              <div id="quiz-feedback-banner" style={{ marginTop: '15px', color: quizFeedbackColor, fontSize: '11px', fontWeight: 'bold', textAlign: 'center' }}>
                {quizFeedback}
              </div>
            )}
          </div>
        </div>

        <div className="glass-card">
          <h3 style={{ margin: '0 0 15px 0', fontSize: '16px', color: 'var(--accent-cyan)' }}>Badges & Streaks Status</h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>

            <div className={`badge-card ${badgesUnlocked['badge-first-word'] ? 'unlocked' : ''}`} id="badge-first-word" style={{ display: 'flex', gap: '12px', alignItems: 'center', padding: '12px', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-color)', borderRadius: '6px' }}>
              <div style={{ fontSize: '24px', color: badgesUnlocked['badge-first-word'] ? 'var(--accent-cyan)' : 'var(--text-muted)' }}><i className="fa-solid fa-award"></i></div>
              <div>
                <strong style={{ display: 'block', fontSize: '12px', color: '#fff' }}>First Translation Milestone</strong>
                <span style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>Log your first sign to text translation event on device.</span>
              </div>
            </div>

            <div className={`badge-card ${badgesUnlocked['badge-streak-lock'] ? 'unlocked' : ''}`} id="badge-streak-lock" style={{ display: 'flex', gap: '12px', alignItems: 'center', padding: '12px', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-color)', borderRadius: '6px' }}>
              <div style={{ fontSize: '24px', color: badgesUnlocked['badge-streak-lock'] ? '#ff5e00' : 'var(--text-muted)' }}><i className="fa-solid fa-fire"></i></div>
              <div>
                <strong style={{ display: 'block', fontSize: '12px', color: '#fff' }}>Daily Streak Locked</strong>
                <span style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>Solve a deep learning quiz correct selection to trigger streaks.</span>
              </div>
            </div>

            <div className={`badge-card ${badgesUnlocked['badge-emergency-master'] ? 'unlocked' : ''}`} id="badge-emergency-master" style={{ display: 'flex', gap: '12px', alignItems: 'center', padding: '12px', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-color)', borderRadius: '6px' }}>
              <div style={{ fontSize: '24px', color: badgesUnlocked['badge-emergency-master'] ? 'var(--accent-red)' : 'var(--text-muted)' }}><i className="fa-solid fa-circle-exclamation"></i></div>
              <div>
                <strong style={{ display: 'block', fontSize: '12px', color: '#fff' }}>Emergency Master</strong>
                <span style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>Broadcast distress location coordinates to emergency dispatch channels.</span>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
