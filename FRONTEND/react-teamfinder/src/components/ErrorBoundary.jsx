import React from 'react';
import { Toaster } from 'sonner';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught error:', error, errorInfo);
  }

  handleReload = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="page-wrap flex items-center justify-center min-h-screen">
          <div className="max-w-md w-full text-center p-8">
            <div className="text-6xl mb-4">💥</div>
            <h1 className="text-2xl font-bold mb-4">Something went wrong</h1>
            <p className="text-text-secondary mb-8">{this.state.error?.message || 'Unknown error'}</p>
            <div className="space-y-3">
              <button className="btn btn-cta w-full" onClick={this.handleReload}>
                Reload App
              </button>
              <button className="btn btn-ghost w-full" onClick={() => window.location.href = '/'}>
                Go Home
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
export { Toaster };

