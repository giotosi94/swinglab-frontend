import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('SwingLab Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          justifyContent: 'center', minHeight: '60vh', padding: 40, textAlign: 'center',
        }}>
          <div style={{ fontSize: 64, marginBottom: 16 }}>⚠️</div>
          <h2 style={{ color: '#f97316', marginBottom: 8 }}>Qualcosa è andato storto</h2>
          <p style={{ color: '#64748b', fontSize: 14, marginBottom: 20, maxWidth: 400 }}>
            Si è verificato un errore imprevisto. Ricarica la pagina per continuare.
          </p>
          <div style={{ display: 'flex', gap: 12 }}>
            <button
              onClick={() => window.location.reload()}
              style={{
                padding: '10px 24px', borderRadius: 8, border: 'none',
                background: '#3b82f6', color: 'white', fontWeight: 700,
                fontSize: 14, cursor: 'pointer',
              }}
            >
              🔄 Ricarica
            </button>
            <button
              onClick={() => this.setState({ hasError: false, error: null })}
              style={{
                padding: '10px 24px', borderRadius: 8, border: '1px solid #334155',
                background: '#1e293b', color: '#94a3b8', fontWeight: 600,
                fontSize: 14, cursor: 'pointer',
              }}
            >
              Riprova
            </button>
          </div>
          {this.state.error && (
            <pre style={{
              marginTop: 20, padding: 12, background: '#0f172a', borderRadius: 8,
              fontSize: 11, color: '#ef4444', maxWidth: 500, overflow: 'auto',
              border: '1px solid #1e293b',
            }}>
              {this.state.error.toString()}
            </pre>
          )}
        </div>
      );
    }
    return this.props.children;
  }
}
