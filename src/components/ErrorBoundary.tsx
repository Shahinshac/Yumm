import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-surface flex flex-col items-center justify-center p-6 text-center">
          <div className="w-24 h-24 bg-red-100 text-red-600 rounded-[32px] flex items-center justify-center text-4xl mb-8">⚠️</div>
          <h1 className="font-lexend font-black text-3xl text-on-surface mb-4">Something went wrong</h1>
          <p className="text-on-surface-variant font-medium mb-8 max-w-md">
            A critical UI error occurred. Our engineers have been notified.
          </p>
          <div className="bg-red-50 text-red-700 p-4 rounded-2xl text-xs font-mono text-left w-full max-w-2xl overflow-auto mb-8 border border-red-100">
            {this.state.error?.stack}
          </div>
          <button 
            onClick={() => window.location.reload()}
            className="btn-primary rounded-2xl px-10 py-4 shadow-2xl shadow-primary/20"
          >
            Reload Interface
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
