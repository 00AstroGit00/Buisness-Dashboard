import React from 'react';
import { RotateCcw, Home, LifeBuoy } from 'lucide-react';

type State = { hasError: boolean; error?: Error | null };

export default class ErrorBoundary extends React.Component<React.PropsWithChildren<{}>, State> {
  constructor(props: React.PropsWithChildren<{}>) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: any) {
    // eslint-disable-next-line no-console
    console.error('Uncaught error:', error, info);
  }

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
          <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-red-500 to-red-600 p-6 text-white">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-white/20 rounded-full">
                  <LifeBuoy className="text-white" size={32} />
                </div>
                <div>
                  <h1 className="text-2xl font-bold">Something went wrong</h1>
                  <p className="text-red-100">Our team has been notified of this issue</p>
                </div>
              </div>
            </div>

            <div className="p-8">
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-2">Error Details</h2>
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 max-h-40 overflow-y-auto">
                  <pre className="whitespace-pre-wrap text-sm text-gray-600 font-mono">
                    {String(this.state.error)}
                  </pre>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={this.handleReload}
                  className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-forest-green to-forest-green-light hover:from-forest-green-light hover:to-forest-green text-brushed-gold font-medium py-3 px-4 rounded-lg shadow-md hover:shadow-lg transition-all"
                >
                  <RotateCcw size={18} />
                  Reload Page
                </button>

                <button
                  onClick={this.handleGoHome}
                  className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-gray-700 to-gray-800 hover:from-gray-800 hover:to-gray-900 text-white font-medium py-3 px-4 rounded-lg shadow-md hover:shadow-lg transition-all"
                >
                  <Home size={18} />
                  Go Home
                </button>
              </div>

              <div className="mt-6 text-center text-sm text-gray-500">
                <p>If the problem persists, please contact support.</p>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children as React.ReactElement | null;
  }
}
