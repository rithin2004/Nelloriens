import { Component } from 'react';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F1F5F9', padding: '1rem' }}>
          <div style={{ textAlign: 'center', maxWidth: 400 }}>
            <p style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>⚠️</p>
            <h1 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0F172A', marginBottom: '0.5rem' }}>
              Something went wrong
            </h1>
            <p style={{ fontSize: '0.85rem', color: '#64748B', marginBottom: '1.5rem' }}>
              An unexpected error occurred. Please refresh the page.
            </p>
            <button
              onClick={() => window.location.reload()}
              style={{ padding: '0.5rem 1.25rem', background: '#2563EB', color: '#fff', fontSize: '0.85rem', fontWeight: 600, borderRadius: '0.5rem', border: 'none', cursor: 'pointer' }}
            >
              Refresh page
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
