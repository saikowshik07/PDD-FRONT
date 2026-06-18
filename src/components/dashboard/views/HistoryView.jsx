import React from 'react';

export default function HistoryView({
  getTranslation,
  currentLanguage,
  historySearchQuery,
  setHistorySearchQuery,
  backendHistory,
  setBackendHistory,
  addNotification
}) {
  return (
    <div id="dash-history">
      <h1 className="workspace-title">{getTranslation(currentLanguage, 'history_log')}</h1>
      <p className="workspace-subtitle">View and audit historical transaction logs recorded during sign to text translations on the client database.</p>

      <div className="glass-card" style={{ marginTop: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', gap: '15px' }}>
          <input
            type="text"
            className="form-input"
            placeholder="Search history by word or timestamp..."
            value={historySearchQuery}
            onChange={(e) => setHistorySearchQuery(e.target.value)}
            style={{ maxWidth: '300px' }}
          />

          <div style={{ display: 'flex', gap: '10px' }}>
            <button className="btn-secondary" style={{ color: 'var(--accent-red)', borderColor: 'var(--accent-red)' }} onClick={() => {
              if (window.confirm("Clean all translation logs from local dashboard view?")) {
                setBackendHistory([]);
                addNotification("Logs Cleared", "Local logs table cleared successfully.", "info");
              }
            }}>
              <i className="fa-solid fa-trash-can"></i> {getTranslation(currentLanguage, 'clear_log')}
            </button>
            <button className="btn-primary" onClick={() => {
              if (backendHistory.length === 0) {
                alert("No logs to export.");
                return;
              }
              let csv = "Time,Mode,Source,Translation,Confidence\n";
              backendHistory.forEach(h => {
                csv += `"${h.timestamp}","${h.mode}","${h.source}","${h.translation}","${h.confidence}"\n`;
              });
              const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
              const link = document.createElement("a");
              link.href = URL.createObjectURL(blob);
              link.setAttribute("download", `signvision_translation_history_${Date.now()}.csv`);
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
            }}>
              <i className="fa-solid fa-file-csv"></i> {getTranslation(currentLanguage, 'export_csv')}
            </button>
          </div>
        </div>

        <div className="table-responsive" style={{ maxHeight: '350px', overflowY: 'auto' }}>
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
              {backendHistory.filter(h => {
                if (!historySearchQuery) return true;
                const query = historySearchQuery.toLowerCase();
                return h.translation?.toLowerCase().includes(query) || h.mode?.toLowerCase().includes(query) || h.timestamp?.includes(query);
              }).map((h, i) => (
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
    </div>
  );
}
